---
name: englishapp-ux
description: UX/UI system for this English-learning app (Vietnamese learners, used on iPhone and PC). Use before building or changing any screen, component, layout, color, font, or interaction in this repo, and before committing UI changes.
---

# englishapp UX/UI

The app teaches English to Vietnamese adults. Most sessions happen on an iPhone in short bursts (commute, breaks); longer study happens on a PC with a keyboard. Every screen must work well on both.

This skill is the project's own design system. It sits on top of two general skills in this folder:

- `frontend-design` (Anthropic, Apache-2.0): aesthetic direction. Use it when designing a *new kind* of screen, but stay inside the tokens and concept below instead of inventing a new look.
- `web-design-guidelines` (Vercel, MIT): technical checklist. Run it on the changed UI files before every commit that touches UI, and fix what it finds.

## Design concept: “vở ô li”

The visual idea comes from the Vietnamese school notebook (vở ô li): cool white paper, a fine blue grid, purple ink (mực tím), a highlighter for new words, and the teacher's red pen for mistakes. It should feel like a calm, well-kept study notebook, not a game and not a SaaS dashboard.

- The grid is the one bold element. Use it in a single place per screen (the hero / the current task), never as a page-wide background.
- Purple ink is the only accent. Use it for the primary action and the current navigation item.
- Highlighter yellow marks the target vocabulary word inside a sentence. It is functional, not decoration.
- Green = correct, red = mistake. Use them only for feedback.

## Tokens (defined in `src/app/globals.css`)

| Token | Light | Dark | Use |
|---|---|---|---|
| `paper` | `#FBFCFE` | `#11152A` | page background |
| `sheet` | `#FFFFFF` | `#181D36` | raised surfaces |
| `ink` | `#1B2540` | `#E6E9F5` | main text |
| `ink-soft` | `#56607A` | `#A3AAC2` | secondary text |
| `line` | `#D9E2F1` | `#2A3358` | borders, grid |
| `accent` (mực tím) | `#5B3CC4` | `#A995FF` | primary action, active nav |
| `highlight` | `#FFE97A` | `#FFE25C47` | target word |
| `correct` | `#1F8A5B` | `#4CC58E` | right answer |
| `mistake` | `#C8372D` | `#FF7A70` | wrong answer, corrections |

Never hard-code colors in components; use the Tailwind classes generated from these tokens (`bg-paper`, `text-ink-soft`, `border-line`, `bg-accent`…).

## Typography

- **Be Vietnam Pro** (sans): all Vietnamese UI text, labels, buttons, explanations. `font-sans`.
- **Literata** (serif): English learning material only (example sentences, dialogues, reading). `font-serif` / the `.en` class.

This split is information: the learner can tell at a glance what is English to study and what is Vietnamese instruction. Do not use Literata for UI chrome, and do not set English study text in the sans face.

- Body 16px minimum on mobile (iOS zooms inputs below 16px). English study sentences 20–28px.
- Line length under 70 characters; reading column max `42rem`.
- Sentence case everywhere. No ALL-CAPS labels, no eyebrow labels above headings.
- IPA in the sans face with `translate="no"`.

## Layout

- **Mobile (< 1024px):** compact top bar, single column, bottom tab bar with 4 items (Hôm nay, Bài học, Từ vựng, Luyện nói). Tab bar respects `env(safe-area-inset-bottom)`; page content gets matching bottom padding.
- **Desktop (≥ 1024px):** left sidebar (240px) with the same 4 items, content column centered, max `42rem` for reading screens. On ≥ 1280px a right rail may show progress, never essential actions.
- Primary actions sit in the thumb zone on mobile (bottom of the screen or end of content), at the end of the content on desktop.

## Interaction rules for a learning app

- **One task per screen in practice mode.** Flashcards, exercises and speaking turns show one item at a time with a clear next step.
- **Touch targets ≥ 44×44px.** Answer options are full-width buttons on mobile.
- **Keyboard on PC:** practice screens support keys (Space = reveal/play, 1–4 = rate or choose, Enter = check/next). Show the key hint only on `pointer: fine` devices.
- **Audio everywhere English appears:** a play button next to every sentence and word. Never autoplay with sound.
- **Feedback is immediate and specific:** show what was wrong, the correct form, and one short reason in Vietnamese. Errors never scold.
- **Progress is visible but quiet:** counts and short bars, no confetti, no streak guilt.
- **Empty states invite action:** say what will appear here and how to get it.
- Respect `prefers-reduced-motion`; motion only answers a user action (reveal, check, next).

## Copy

- Vietnamese, plain and direct, second person (“bạn”). Buttons say exactly what happens: “Kiểm tra”, “Câu tiếp theo”, “Nghe lại”.
- The same action keeps the same name through a flow.

## Process for every UI change

1. Read this file. For a new kind of screen, also read `frontend-design` and write a short plan (layout sketch, which tokens) before coding.
2. Build mobile-first, then the `lg:` layout.
3. Screenshot at 390×844 (iPhone) and 1440×900 (PC), light and dark, and look at them.
4. Run `web-design-guidelines` on the changed files and fix the findings.
5. `npm run lint && npm run build` must pass.
