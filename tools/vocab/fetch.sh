#!/usr/bin/env bash
# Downloads the open vocabulary sources into data/raw (not committed).
# Licenses: see src/content/vocab/SOURCES.md
set -euo pipefail
RAW="$(dirname "$0")/../../data/raw"
mkdir -p "$RAW" && cd "$RAW"
clone() { [ -d "$2" ] || git clone -q --depth 1 "$1" "$2"; }
clone https://github.com/openlanguageprofiles/olp-en-cefrj.git olp-en-cefrj
clone https://github.com/skywind3000/ECDICT.git ECDICT
clone https://github.com/cmusphinx/cmudict.git cmudict
HF=https://huggingface.co/datasets
[ -f tatoeba-opus-en-vi.parquet ] || curl -fsSL -o tatoeba-opus-en-vi.parquet "$HF/wecover/OPUS_Tatoeba/resolve/main/Tatoeba/en-vi/train.parquet"
[ -f tatoeba-mteb-vie-eng.jsonl.gz ] || curl -fsSL -o tatoeba-mteb-vie-eng.jsonl.gz "$HF/mteb/tatoeba-bitext-mining/resolve/main/test/vie-eng.jsonl.gz"
echo "Sources ready in $RAW"
