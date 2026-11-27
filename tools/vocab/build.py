"""Build the vocabulary core from open sources.

Inputs (run tools/vocab/fetch.sh first): data/raw/
  - CEFR-J Vocabulary Profile 1.5 + Octanove C1/C2  -> headword, part of speech, CEFR level
  - ECDICT (MIT)                                      -> frequency rank, Oxford 3000 flag, word forms
  - CMUdict (BSD)                                     -> US pronunciation, converted to IPA
  - Tatoeba en-vi pairs (CC BY 2.0 FR)                -> real example sentences with Vietnamese

Output: src/content/vocab/words.json (+ a small report on stdout).
Vietnamese meanings are NOT produced here; they live in src/content/vocab/vi/*.json.

Requires: python3 with pyarrow (pip install pyarrow). Run: python3 -I tools/vocab/build.py
"""

from __future__ import annotations

import csv
import gzip
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

import pyarrow.parquet as pq

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "raw"
OUT = ROOT / "src" / "content" / "vocab" / "words.json"

LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]
LEVEL_RANK = {lvl: i for i, lvl in enumerate(LEVELS)}

csv.field_size_limit(sys.maxsize)


# ---------------------------------------------------------------- CEFR-J


def load_cefr() -> dict[str, dict]:
    """headword -> {variants, pos: {pos: level}, level}"""
    words: dict[str, dict] = {}
    files = [
        RAW / "olp-en-cefrj" / "cefrj-vocabulary-profile-1.5.csv",
        RAW / "olp-en-cefrj" / "octanove-vocabulary-profile-c1c2-1.0.csv",
    ]
    for path in files:
        with path.open(encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                raw = row["headword"].strip()
                level = row["CEFR"].strip().upper()
                pos = row["pos"].strip()
                if level not in LEVEL_RANK or not raw:
                    continue
                variants = [v.strip() for v in raw.split("/") if v.strip()]
                head = variants[0]
                key = head.lower()
                entry = words.setdefault(
                    key, {"headword": head, "variants": [], "pos": {}, "level": level}
                )
                for v in variants[1:]:
                    if v not in entry["variants"] and v.lower() != key:
                        entry["variants"].append(v)
                # keep the easiest level per part of speech
                if pos not in entry["pos"] or LEVEL_RANK[level] < LEVEL_RANK[entry["pos"][pos]]:
                    entry["pos"][pos] = level
                if LEVEL_RANK[level] < LEVEL_RANK[entry["level"]]:
                    entry["level"] = level
    return words


# ---------------------------------------------------------------- ECDICT

FORM_KEYS = {"p": "past", "d": "pastParticiple", "i": "ing", "3": "thirdPerson",
             "s": "plural", "r": "comparative", "t": "superlative"}


def load_ecdict(wanted: set[str]) -> dict[str, dict]:
    out: dict[str, dict] = {}
    with (RAW / "ECDICT" / "ecdict.csv").open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            w = row["word"].strip().lower()
            if w not in wanted or w in out:
                continue
            forms = {}
            for part in (row.get("exchange") or "").split("/"):
                if ":" in part:
                    k, v = part.split(":", 1)
                    if k in FORM_KEYS and v:
                        forms[FORM_KEYS[k]] = v
            def num(x: str) -> int | None:
                try:
                    n = int(x)
                    return n if n > 0 else None
                except (TypeError, ValueError):
                    return None
            out[w] = {
                "frequencyRank": num(row.get("frq")),  # COCA rank, smaller = more common
                "oxford3000": row.get("oxford") == "1",
                "forms": forms,
            }
    return out


# ---------------------------------------------------------------- CMUdict -> IPA

ARPA = {
    "AA": "ɑ", "AE": "æ", "AO": "ɔ", "AW": "aʊ", "AY": "aɪ", "EH": "ɛ", "EY": "eɪ",
    "IH": "ɪ", "IY": "i", "OW": "oʊ", "OY": "ɔɪ", "UH": "ʊ", "UW": "u",
    "B": "b", "CH": "tʃ", "D": "d", "DH": "ð", "F": "f", "G": "ɡ", "HH": "h", "JH": "dʒ",
    "K": "k", "L": "l", "M": "m", "N": "n", "NG": "ŋ", "P": "p", "R": "r", "S": "s",
    "SH": "ʃ", "T": "t", "TH": "θ", "V": "v", "W": "w", "Y": "j", "Z": "z", "ZH": "ʒ",
}
VOWELS = {"AA", "AE", "AH", "AO", "AW", "AY", "EH", "ER", "EY", "IH", "IY", "OW", "OY", "UH", "UW"}
# Legal English onsets (as ARPAbet tuples) for placing the stress mark.
ONSETS = {
    (), *[(c,) for c in ARPA if c not in VOWELS and c != "NG"],
    ("P", "R"), ("P", "L"), ("B", "R"), ("B", "L"), ("T", "R"), ("D", "R"), ("K", "R"),
    ("K", "L"), ("G", "R"), ("G", "L"), ("F", "R"), ("F", "L"), ("TH", "R"), ("SH", "R"),
    ("S", "P"), ("S", "T"), ("S", "K"), ("S", "M"), ("S", "N"), ("S", "L"), ("S", "W"),
    ("T", "W"), ("D", "W"), ("K", "W"), ("G", "W"), ("P", "Y"), ("B", "Y"), ("K", "Y"),
    ("F", "Y"), ("M", "Y"), ("V", "Y"), ("HH", "Y"),
    ("S", "P", "R"), ("S", "P", "L"), ("S", "T", "R"), ("S", "K", "R"), ("S", "K", "W"),
}


def arpa_to_ipa(phones: list[str]) -> str:
    base = [re.sub(r"\d", "", p) for p in phones]
    stress = [p[-1] if p[-1].isdigit() else None for p in phones]
    vowel_idx = [i for i, b in enumerate(base) if b in VOWELS]
    marks: dict[int, str] = {}
    if len(vowel_idx) > 1:
        prev_end = -1
        for vi in vowel_idx:
            mark = {"1": "ˈ", "2": "ˌ"}.get(stress[vi] or "")
            if mark:
                # largest legal onset directly before the vowel
                start = vi
                while start - 1 > prev_end and tuple(base[start - 1:vi]) in ONSETS:
                    start -= 1
                marks[start] = mark
            prev_end = vi
    out = []
    for i, (b, s) in enumerate(zip(base, stress)):
        if i in marks:
            out.append(marks[i])
        if b == "AH":
            out.append("ə" if s == "0" else "ʌ")
        elif b == "ER":
            out.append("ɚ" if s == "0" else "ɝ")
        else:
            out.append(ARPA[b])
    return "".join(out)


def load_cmudict(wanted: set[str]) -> dict[str, str]:
    out: dict[str, str] = {}
    with (RAW / "cmudict" / "cmudict.dict").open(encoding="utf-8") as f:
        for line in f:
            line = line.split("#", 1)[0].strip()
            if not line:
                continue
            word, *phones = line.split()
            if "(" in word:  # alternative pronunciations: keep the first
                continue
            if word in wanted:
                out[word] = arpa_to_ipa(phones)
    return out


# ---------------------------------------------------------------- Tatoeba examples

VI_MARKS = re.compile(r"[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]", re.I)
TOKEN = re.compile(r"[a-z]+(?:'[a-z]+)?")


def load_pairs() -> list[tuple[str, str]]:
    pairs: dict[str, str] = {}
    table = pq.read_table(RAW / "tatoeba-opus-en-vi.parquet").to_pylist()
    for r in table:
        pairs.setdefault(r["sentence1"].strip(), r["sentence2"].strip())
    with gzip.open(RAW / "tatoeba-mteb-vie-eng.jsonl.gz", "rt", encoding="utf-8") as f:
        for line in f:
            r = json.loads(line)
            pairs.setdefault(r["sentence2"].strip(), r["sentence1"].strip())
    return list(pairs.items())


def vi_looks_ok(vi: str) -> bool:
    """Reject Vietnamese typed without diacritics (common in crowd data)."""
    tokens = vi.split()
    if not tokens:
        return False
    with_marks = sum(1 for t in tokens if VI_MARKS.search(t))
    return with_marks / len(tokens) >= 0.4


def build_examples(entries: dict[str, dict], pairs: list[tuple[str, str]]) -> None:
    level_of = {k: LEVEL_RANK[e["level"]] for k, e in entries.items()}
    form_index: dict[str, set[str]] = defaultdict(set)
    for key, e in entries.items():
        if " " in key:
            continue
        for f in {key, *e.get("forms", {}).values()}:
            form_index[f.lower()].add(key)

    candidates: dict[str, list[tuple[float, str, str]]] = defaultdict(list)
    for en, vi in pairs:
        toks = TOKEN.findall(en.lower())
        if not (3 <= len(toks) <= 12) or not vi_looks_ok(vi) or len(en) > 90:
            continue
        known = [level_of.get(t) for t in toks]
        for key in {k for t in toks for k in form_index.get(t, ())}:
            target = level_of[key]
            # share of words at or below the target word's level (comprehensible input)
            easy = sum(1 for lv in known if lv is not None and lv <= target) / len(toks)
            score = easy * 2 - abs(len(toks) - 7) * 0.08
            candidates[key].append((score, en, vi))

    for key, cands in candidates.items():
        cands.sort(key=lambda c: -c[0])
        seen, picked = set(), []
        for _, en, vi in cands:
            if en.lower() in seen:
                continue
            seen.add(en.lower())
            picked.append({"en": en, "vi": vi, "source": "tatoeba"})
            if len(picked) == 3:
                break
        entries[key]["examples"] = picked


# ---------------------------------------------------------------- main


VERB_FORMS = {"past", "pastParticiple", "ing", "thirdPerson"}


def relevant_forms(forms: dict[str, str], pos: set[str]) -> dict[str, str]:
    """ECDICT lists forms for every sense; keep only those matching the CEFR parts of speech
    (e.g. drop "peopled" for the noun people, "olds" for the adjective old)."""
    is_verb = any("verb" in p and p != "adverb" for p in pos)
    out = {}
    for k, v in forms.items():
        if k in VERB_FORMS and not is_verb:
            continue
        if k == "plural" and "noun" not in pos:
            continue
        if k in {"comparative", "superlative"} and not ({"adjective", "adverb"} & pos):
            continue
        out[k] = v
    return out


def slug(word: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", word.lower()).strip("-")


def main() -> None:
    cefr = load_cefr()
    keys = set(cefr)
    eco = load_ecdict(keys)
    ipa = load_cmudict(keys)
    pairs = load_pairs()

    entries: dict[str, dict] = {}
    for key, c in cefr.items():
        e = eco.get(key, {})
        e = {**e, "forms": relevant_forms(e.get("forms", {}), set(c["pos"]))}
        entries[key] = {
            "id": slug(c["headword"]),
            "headword": c["headword"],
            "variants": c["variants"],
            "level": c["level"],
            "pos": [{"pos": p, "level": lv} for p, lv in sorted(c["pos"].items(), key=lambda x: LEVEL_RANK[x[1]])],
            "ipa": ipa.get(key),
            "frequencyRank": e.get("frequencyRank"),
            "oxford3000": e.get("oxford3000", False),
            "forms": e.get("forms", {}),
            "examples": [],
        }
    build_examples(entries, pairs)

    # stable order: level, then frequency (unknown frequency last), then alphabet
    ordered = sorted(
        entries.values(),
        key=lambda e: (LEVEL_RANK[e["level"]], e["frequencyRank"] or 10**9, e["headword"].lower()),
    )
    ids = [e["id"] for e in ordered]
    dupes = {i for i in ids if ids.count(i) > 1} if len(set(ids)) != len(ids) else set()
    for e in ordered:
        if e["id"] in dupes:
            e["id"] = f'{e["id"]}-{e["pos"][0]["pos"].split()[0]}'

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(ordered, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")

    print(f"pairs loaded: {len(pairs)}")
    for lvl in LEVELS:
        group = [e for e in ordered if e["level"] == lvl]
        if not group:
            continue
        n = len(group)
        pct = lambda f: f"{100 * sum(1 for e in group if f(e)) / n:.0f}%"
        print(f"{lvl}: {n:5d} words | ipa {pct(lambda e: e['ipa'])} | freq {pct(lambda e: e['frequencyRank'])}"
              f" | >=1 example {pct(lambda e: e['examples'])}")
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
