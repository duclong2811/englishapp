# Controlled curriculum expansion

## Language hierarchy

- Vietnamese is the application and primary explanation language.
- English is always visible as the learning target.
- Korean is a parallel explanation language and remains visible by default.
- Learners can choose Việt + Hàn, chỉ Việt, or chỉ Hàn. This preference is stored in SQLite as `explanation_mode`; legacy Vietnamese Assist values are ignored safely.

The old interface-assistance architecture is retained only where it helps Korean learning terms. Ordinary Vietnamese interface labels do not display redundant Vietnamese tooltips.

## Curriculum scope

`src/content/curriculum-map.ts` contains the reviewed planning structure for:

- A2: 8 units × 5 mapped lessons. Unit 1–6 are published content; Unit 7–8 are planning only.
- B1: 10 units × 5 mapped lessons.
- B2: 10 units × 5 mapped lessons.

The map includes communicative, grammar, vocabulary, pronunciation, listening, speaking, reading and writing goals; prerequisites; spiral review; assessments; can-do statements; accent exposure; and future video slots. A2 units also carry a per-lesson `lessonGrammar` scope-and-sequence, so the published lessons in `src/content/a2-unit-*.ts` can be checked against the plan automatically.

Published A2 content:

- Unit 1 `a2-unit-1.ts`: everyday connections, five lessons with the original IDs kept unchanged.
- Unit 2 `a2-unit-2.ts`: getting things done (requests, directions, returns, appointments).
- Unit 3 `a2-unit-3.ts`: stories and past events.
- Unit 4 `a2-unit-4.ts`: travel and unexpected problems.
- Unit 5 `a2-unit-5.ts`: health, habits and advice.
- Unit 6 `a2-unit-6.ts`: work, study and responsibilities.

`src/content/a2-lesson-factory.ts` builds every A2 lesson through one function, so IDs, FSRS tags, error categories and structural minimums stay consistent. The ten A1 IDs remain unchanged and are adapted to the bilingual display in `src/content/a1-bilingual.ts` so existing progress remains compatible.

## Content quality rules

- Every lesson has 8–15 vocabulary items with real IPA and collocations, at least 15 example sentences, a dialogue with at least six turns, grammar blocks in Vietnamese and Korean, listening plus dictation, shadowing notes, guided practice in several formats, one writing task and one speaking task, and at least four mastery activities covering every objective.
- Vietnamese and Korean lines are written per sentence; generic template glosses such as “Câu dùng trong tình huống này” are rejected by the builder.
- Controls, buttons, aria-labels, placeholders, errors and statuses are Vietnamese. Korean only appears inside bilingual learning content.
- Unit numbers, breadcrumbs and back links are derived from `unitId` (`src/lib/curriculum/unit-label.ts`), never hard-coded to Unit 1.

## Encoding

Content files must stay UTF-8. `tools/fix-mojibake.mjs` repairs text that was decoded as windows-1252 and re-saved, and `src/content/text-encoding.test.ts` fails the suite if such mojibake returns.

## Validation

Automated validation checks unique IDs, prerequisite order, repeated-new grammar, bilingual fields, 15-example minimum, objective/mastery coverage, objective FSRS tags and deterministic exercise answers. A2, B1 and B2 outcomes are intentionally different: everyday participation, independent familiar-situation communication, and nuanced autonomous communication.

## Video extension point

`VideoSourceProvider` and `VideoMetadata` define a disabled VOA Learning English extension point. No VOA content is fetched, embedded, downloaded or authored in this phase. Future integrations must show attribution, verification date, license/commercial-use state and third-party warnings.
