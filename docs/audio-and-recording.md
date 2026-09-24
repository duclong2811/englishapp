# Audio, recording, and shadowing

## Free-first source order

1. Reviewed local human recordings with explicit license metadata.
2. Individually approved Wikimedia Commons files with source, creator, and license attribution.
3. Browser Web Speech synthesis, labelled as synthesized audio.
4. An explicit unavailable state when the requested locale is missing.

No dictionary scraping, copyrighted audio download, external speech API, analytics, or upload is used. `src/content/audio-sources.ts` is the source registry. A voice is called US or UK only when its browser locale is `en-US` or `en-GB`.

## Privacy and honest assessment

`MediaRecorder` captures microphone data inside the browser. Object URLs are revoked when deleted or abandoned and tracks are stopped. Metadata can be stored in local SQLite; no recording is uploaded. Waveforms help seek and compare A/B audio and must never be presented as a pronunciation score. Pronunciation practice uses curated IPA/stress/linking notes, replay, recording, and learner self-rating.

## Manual browser verification

- Chrome/Edge desktop: allow and deny microphone permission; verify both states and ensure the recording remains local.
- Start, pause, resume, stop, replay, delete, duration limit, and abandoned-recording cleanup.
- Play/pause/replay, 0.65–1.15× speed, repeat count, transcript toggle, and keyboard navigation.
- Confirm installed `en-US`, `en-GB`, and `ko-KR` voice discovery; test the clear unavailable state for a missing locale.
- Verify labels say synthesized versus local/human audio accurately.
- Complete all eight shadowing stages; alternate reference/learner playback and save Again/Hard as difficult.
- Check waveform and A/B controls on narrow mobile and desktop layouts; confirm no numeric pronunciation score appears.
- Complete listen-and-choose, dictation, missing word, sentence ordering, US/UK comparison, listen-and-repeat, and dialogue comprehension.
- Verify punctuation/case tolerance and that meaningful dictation changes are recorded as errors.
- Complete all five branching scenarios, including a weak branch and retry.
- Test Korean–Vietnamese assistance for every new control in off, on-demand, and always modes.
- Safari/iOS: verify supported MIME type, microphone lifecycle, background interruption, and replay after recording.

Actual microphone and device audio quality require a human with a physical browser and cannot be fully validated in jsdom or a production build.

## Durable local recordings

Audio blobs are stored in IndexedDB database `damdam-voice-recordings`; SQLite stores metadata only. Both use the same stable recording ID. Retrying a save replaces the same ID rather than creating duplicates. Temporary attempts expire after seven days and may be removed when unreferenced. An attempt marked as preferred is changed to `saved` and is never removed by automatic cleanup. Explicit deletion removes both the IndexedDB blob and SQLite metadata after confirmation.

Settings shows recording count, temporary/saved counts, blob bytes, and the browser storage estimate. “모든 녹음 삭제” requires a separate confirmation and includes preferred recordings. JSON export contains metadata, never binary audio. Clearing site data, using private browsing, browser eviction, or uninstalling the browser may erase recordings; local browser storage is not a permanent backup.

## Development diagnostics

While running `npm run dev`, open `http://localhost:3000/dev/media`. It reports MediaRecorder availability, MIME support, IndexedDB, microphone permission state when exposed, storage estimates, and currently detected `en-US`, `en-GB`, and `ko-KR` voices. The route returns Not Found in production and never displays recording contents.

## Responsive device matrix

For each `360×800`, `390×844`, `768×1024`, `820×1180`, `1180×820`, and `1440×900` viewport:

1. Visit dashboard, lesson, Settings, and `/practice`.
2. Confirm the document has no horizontal scrollbar; waveform itself stays within its container.
3. Test portrait and landscape on tablets without losing the lesson step or draft answer.
4. Open Vietnamese assistance by tap, keyboard, and pointer. Confirm the popover remains inside safe-area edges and does not activate its surrounding link.
5. Focus the lowest writing field with the on-screen keyboard open; scroll it and its primary action into view.
6. Exercise audio, recorder, shadowing, and branching controls. Confirm touch targets remain at least 44px on coarse-pointer devices.

## Previous Next.js development badge

ESLint, TypeScript, automated tests, route requests, and a production build were checked after removing the nested `<button>` from navigation assistance triggers. The trigger now uses a keyboard-operable non-button help target, preventing a button-inside-link hydration warning. The earlier red “1 Issue” badge was not reproduced through server output. Fast Refresh should be checked once more in a physical browser console after editing a component; no warning has been suppressed.
