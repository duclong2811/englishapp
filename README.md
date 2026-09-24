# 담담 English

Ứng dụng local-first dành cho một người học tiếng Anh với giao diện tiếng Việt và phần giải thích song ngữ Việt–Hàn. Nội dung hoàn chỉnh hiện gồm 10 bài A1, 5 bài A2 Unit 1, và 25 bài của A2 Unit 2–6 — tổng cộng 30 bài A2. Bản đồ A2–B2 cùng scope-and-sequence ngữ pháp từng bài được lưu riêng để mở rộng có kiểm soát.

## 로컬 실행

Node.js 24에서 확인했습니다.

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. 첫 요청 때 `data/learn.db`가 생성됩니다. 프로덕션 확인은 `npm run build && npm start`입니다.

## 구조와 선택

- Next.js App Router, React, TypeScript, Tailwind CSS
- Drizzle ORM + `better-sqlite3`: Prisma보다 런타임과 설정이 작고, 단일 사용자 로컬 SQLite 모델에 잘 맞아 선택했습니다. `src/lib/db/schema.ts`에 전체 도메인 테이블이 있습니다.
- 커리큘럼은 `src/content/course.ts`에 버전 관리되는 타입 안전 데이터로 저장하며, 로드 시 Zod로 검증합니다. 런타임 생성이나 AI 생성은 없습니다.
- 사용자 설정과 진행 상태는 서버의 SQLite에 저장합니다. 작성 중 답은 브라우저 세션에도 즉시 보존해 새로고침 손실을 줄입니다.
- `ts-fsrs`가 Again/Hard/Good/Easy 평가와 약한 영역의 복습 일정을 담당합니다.
- Web Speech API와 MediaRecorder가 무료 음성 합성·녹음을 담당하고, MIT 라이선스의 `wavesurfer.js`가 로컬 waveform을 표시합니다. 자세한 원칙과 수동 검증은 [오디오 문서](docs/audio-and-recording.md)에 있습니다.
- `src/lib/providers.ts`에 `TutorProvider`, `DictionaryProvider`, `SpeechProvider`, `PronunciationAssessmentProvider` 경계를 정의했습니다. 기본 구현은 모두 비활성·무료·로컬이며 비밀값을 브라우저로 보내지 않습니다.
- `src/lib/video-provider.ts` định nghĩa extension point VOA Learning English đang tắt; giai đoạn này không tải hoặc nhúng nội dung VOA.
- [Kế hoạch mở rộng curriculum](docs/curriculum-expansion.md) mô tả bản đồ A2–B2 và quy tắc ngôn ngữ Việt–Hàn.

## 콘텐츠 스키마

`Course → Level → Unit → Lesson` 계층 아래에 목표, 대화, 어휘, 문법, 문맥별 예문, 안내 연습, 활용 과제, 숙달 확인이 있습니다. 어휘는 품사, 한국어/베트남어 뜻, 미·영 IPA/오디오 자리, 활용형, 연어, 말투, 주제, CEFR, 오류와 혼동어를 지원합니다. 문법은 선행 요소, 기본/더 쉬운 한국어, 베트남어, 형태, 용법, 제한, 대조, 오류, 목적별 예문을 지원합니다.

### 레슨 추가하기

1. `src/content/course.ts`의 기존 레슨 형태를 복제합니다.
2. 고유 `id`, 순서, 선행 레슨 ID를 지정합니다.
3. 목표, 8–15개 어휘, 1–2개 문법, 15개 이상 문맥 예문, 대화, 연습, 활용 과제, 숙달 확인을 작성합니다.
4. 객관 문항에는 결정 가능한 `answer`를 지정합니다. 쓰기/말하기에는 `modelAnswer`와 `checklist`를 지정합니다.
5. `npm test`를 실행해 Zod 스키마와 최소 콘텐츠 요건을 확인합니다.

자세한 편집 원칙은 [콘텐츠 가이드](docs/content-guidelines.md)를 참고하세요.

## 숙달과 복습

객관 문항만 결정적으로 채점합니다. 쓰기와 말하기는 응답을 저장하고 모범 답안·자기 점검표·자기 평가를 제공할 뿐 자동 언어 평가를 주장하지 않습니다. 레슨 결과는 어휘, 문법, 듣기, 쓰기, 말하기, 읽기로 분리합니다. 75점 미만 영역은 FSRS 복습 카드 대상이 되며 레슨 자체는 통과할 수 있습니다. 이후 리뷰에서 선택한 Again/Hard/Good/Easy가 다음 복습일을 정합니다.

## 데이터와 무료 원칙

인증, 유료 서비스, API 키, 외부 인증, AI API가 없습니다. 학습 데이터는 로컬 SQLite에 남고 설정 화면에서 JSON으로 내보낼 수 있습니다. 데이터베이스 파일과 WAL 파일은 Git에서 제외됩니다.

## 검사

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

### 수동 UI 확인 체크리스트

- 데스크톱: 도움 모드 `off`, `필요할 때`, `always`에서 한국어가 항상 기본인지 확인합니다.
- 데스크톱: 도움 아이콘의 마우스 오버와 키보드 초점으로 베트남어가 열리고 Escape로 닫히는지 확인합니다.
- 모바일: 작은 도움 버튼을 눌러도 주변 링크, 폼 제출, 레슨 동작이 실행되지 않는지 확인합니다.
- 모바일: 팝오버가 화면 밖으로 잘리지 않고 다시 누르거나 다른 곳으로 이동해 닫을 수 있는지 확인합니다.
- 레슨: 인터페이스가 `always`여도 베트남어 문법 설명과 대화 번역은 자동으로 펼쳐지지 않는지 확인합니다.
- 접근성: 도움 버튼의 이름, 초점 표시, 툴팁 연결, 보조 베트남어의 중복 낭독 여부를 확인합니다.

## 알려진 제한

- 범위는 A1 한 단원, 10개 레슨이며 이후 단원은 아직 없습니다.
- 브라우저별 설치 음성이 달라 US/UK/KR 음성이 없는 기기에서는 해당 합성 음성을 사용할 수 없습니다.
- 자동 발음 점수는 의도적으로 제공하지 않으며 녹음 비교와 자기 평가를 사용합니다.
- 가져오기 UI는 다음 단계로 남아 있고, 내보내기만 동작합니다.
- 단일 프로세스·단일 사용자 설계입니다. 여러 기기 동기화와 인증은 없습니다.
- 쓰기/말하기는 사람의 자기 평가가 필요합니다.

다음 권장 단계는 실제 학습자 검토를 거쳐 A1 콘텐츠 품질을 보정하고, 복습 카드/오답 저장 API를 모든 상호작용에 연결한 뒤 데이터 가져오기를 추가하는 것입니다.
