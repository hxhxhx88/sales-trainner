# Technical Design Document
## AI Sales Roleplay Simulator — Prototype

**Version:** 0.1
**Date:** 2026-03-24

---

## 1. Architecture Overview

The system uses a **Dual-Pipeline Hybrid Architecture** that separates conversational AI from transcription accuracy:

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                           │
│                                                                 │
│  ┌─── DURING SESSION: Zoom-like meeting UI ───────────────────┐ │
│  │                                                             │ │
│  │  Microphone ──► getUserMedia()                              │ │
│  │                     │                                       │ │
│  │                     ├── Stream A ──► WebRTC ─────────────────┼─┼──► OpenAI Realtime API
│  │                     │               PeerConnection          │ │    (GPT-5.4 Conversation)
│  │                     │                   │                   │ │
│  │                     │                   ├─► AI Audio ──► Speaker (user hears AI)
│  │                     │                   │                   │ │
│  │                     │                   └─► DataChannel ──► Buyer transcript
│  │                     │                                       │ │    (stored in memory,
│  │                     │                                       │ │     NOT displayed)
│  │                     └── Stream B ──► MediaRecorder ──────────┼─┼──► Deepgram Nova-3 WS
│  │                                      (webm/opus)            │ │    (Background STT)
│  │                                                             │ │         │
│  │  UI shows ONLY: avatar, timer, mute btn, end btn           │ │         ▼
│  │  NO transcript, NO alerts during session                    │ │    Planner transcript
│  │                                                             │ │    (stored in memory,
│  └─────────────────────────────────────────────────────────────┘ │     NOT displayed)
│                                                                   │
│  ┌─── BACKGROUND (during session) ────────────────────────────┐ │
│  │  Transcript Merger (planner ◄─ Deepgram, buyer ◄─ DataCh)  │ │
│  │  Compliance Checker (LLM-based, post-session)               │ │
│  │  Win/Lose Detection (AI signals purchase decision)          │ │
│  │  All stored silently — revealed only in review              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

                    ── POST-SESSION REVIEW ──

    Merged Transcript + Compliance Flags
                    │
                    ▼
          POST /api/grade
                    │
                    ▼
         GPT-5.4 (via openai SDK)
                    │
                    ▼
         Structured Scorecard JSON
                    │
                    ▼
           Review Page UI
           ├── Full Transcript (with timestamps)
           ├── Compliance Violations (highlighted)
           ├── Scorecard + Rubric Grades
           └── Win/Lose Outcome
```

### Why Two Pipelines?

| Concern | Pipeline A (OpenAI WebRTC, GPT-5.4) | Pipeline B (Deepgram Nova-3) |
|---|---|---|
| **Purpose** | Conversational AI — the buyer persona | Accurate transcription for post-session review & grading |
| **Latency** | Sub-300ms (critical for natural conversation) | 1–2 seconds (acceptable — not displayed during session) |
| **Accuracy** | General-purpose transcription via data channel | Domain-specific with keyword boosting (Mandarin insurance terms) |
| **Failure mode** | If Deepgram fails, conversation continues | If WebRTC fails, session cannot proceed |

The pipelines are independent. Deepgram failure does not interrupt the voice conversation.

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js | 16.2.x | App Router, API routes, SSR |
| Language | TypeScript | 6.0.x | Type safety |
| UI Library | shadcn/ui | latest | Pre-built accessible components |
| Styling | Tailwind CSS | 4.2.x | Utility-first CSS |
| Voice AI | OpenAI Realtime API (via `openai` SDK) | 6.32.x (WebRTC mode) | Conversational buyer persona (GPT-5.4), audio-native (no separate TTS) |
| STT | Deepgram Nova-3 | Streaming WebSocket (`@deepgram/sdk` 5.x) | Keyword-boosted Mandarin transcription |
| Grading + Compliance LLM | GPT-5.4 | via `openai` SDK | Post-session compliance checking and structured grading (`json_schema` response_format) |
| Validation | Zod | 4.3.x | Request/response schema validation |
| State | React Context + Hooks | React 19.2.x | Client-side state (no external store) |
| Browser | Chrome only | — | Prototype targets Chrome; no Safari/Firefox fallbacks |

---

## 3. Data Models

### 3.1 Persona (Static, defined in code)

```typescript
interface Persona {
  id: string
  name: { en: string; zh: string }
  avatar: string                          // path to avatar image
  description: { en: string; zh: string }
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  language: 'mandarin'                    // Mandarin only for prototype
  tags: string[]
  systemPrompt: string                    // full prompt for OpenAI Realtime (GPT-5.4)
  voiceId: string                         // OpenAI voice: "ash", "coral", "sage", etc. — distinct per persona
  objectionPatterns: string[]
  productFocus: 'life' | 'medical' | 'savings' | 'investment' | 'general'
  buySignalThreshold: string              // prompt guidance for when this persona would decide to buy
}
```

### 3.2 Roleplay Session

```typescript
interface RoleplaySession {
  id: string
  personaId: string
  startedAt: string                       // ISO 8601
  endedAt?: string
  status: 'lobby' | 'connecting' | 'active' | 'grading' | 'review'
  outcome?: 'win' | 'lose' | 'timeout'   // win = AI bought, lose = time expired
  transcript: TranscriptEntry[]
  complianceFlags: ComplianceFlag[]
  scorecard?: Scorecard
  durationSeconds?: number
  timeLimitSeconds: number                // default 300 (5 min)
}
```

### 3.3 Transcript Entry

```typescript
interface TranscriptEntry {
  id: string
  speaker: 'planner' | 'buyer'
  text: string
  timestamp: number                       // seconds from session start
  language?: string                       // detected language code
  confidence?: number                     // STT confidence (0–1)
  isFinal: boolean                        // final vs interim
}
```

### 3.4 Compliance Flag

```typescript
interface ComplianceFlag {
  id: string
  ruleId: string
  severity: 'warning' | 'violation'
  message: { en: string; zh: string }
  matchedText: string
  timestamp: number
  transcriptEntryId: string
}

// Compliance rules are defined as natural-language descriptions for LLM-based checking.
// GPT-5.4 analyzes the full transcript post-session against these rules.
interface ComplianceRule {
  id: string
  name: string
  description: string                     // natural language description for LLM prompt
  severity: 'warning' | 'violation'
  message: { en: string; zh: string }
}
```

### 3.5 Scorecard

```typescript
interface Scorecard {
  sessionId: string
  overallScore: number                    // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  rubrics: RubricScore[]
  strengths: string[]
  improvements: string[]
  compliancePassed: boolean
  summary: string
}

interface RubricScore {
  dimension: string
  score: number                           // 0–100
  weight: number                          // percentage weight (sums to 100)
  feedback: string
}
```

---

## 4. API Specifications

### 4.1 `POST /api/token` — OpenAI Ephemeral Token

Generates a short-lived client secret for the OpenAI Realtime API WebRTC session.

**Request:**
```json
{
  "personaId": "skeptical-shenzhen-exec"
}
```

**Response:**
```json
{
  "client_secret": {
    "value": "ek_abc123...",
    "expires_at": 1711324800
  }
}
```

**Implementation:**
1. Look up persona by `personaId` → get `systemPrompt` and `voiceId`
2. POST to `https://api.openai.com/v1/realtime/sessions` with:
   ```json
   {
     "model": "gpt-5.4",
     "voice": "<persona.voiceId>",
     "instructions": "<persona.systemPrompt + win/lose instructions>",
     "modalities": ["audio", "text"],
     "input_audio_transcription": {
       "model": "gpt-5.4"
     },
     "turn_detection": {
       "type": "server_vad",
       "threshold": 0.5,
       "prefix_padding_ms": 300,
       "silence_duration_ms": 500
     }
   }
   ```
   The system prompt includes instructions for the AI to output `__SUCCESS__` in a text data channel message when it decides to buy the product, enabling win detection on the client side.
3. Return the `client_secret` from OpenAI's response

### 4.2 `GET /api/deepgram-token` — Deepgram Token

**Response:**
```json
{
  "token": "dg_abc123..."
}
```

For prototype: returns the Deepgram API key directly. Production: would use Deepgram's key management API to create scoped, short-lived tokens.

### 4.3 `POST /api/grade` — Session Grading

**Request:**
```json
{
  "transcript": [
    { "id": "...", "speaker": "planner", "text": "你好，我係...", "timestamp": 0, "isFinal": true },
    { "id": "...", "speaker": "buyer", "text": "你好，我想了解...", "timestamp": 3.2, "isFinal": true }
  ],
  "personaId": "skeptical-shenzhen-exec",
  "durationSeconds": 180,
  "outcome": "win"
}
```

**Response:**
```json
{
  "sessionId": "...",
  "overallScore": 72,
  "grade": "B",
  "rubrics": [
    { "dimension": "Rapport Building", "score": 85, "weight": 15, "feedback": "Good opening..." },
    { "dimension": "Objection Handling", "score": 60, "weight": 25, "feedback": "Struggled with..." }
  ],
  "strengths": ["Strong rapport in Mandarin", "Good product knowledge on VHIS"],
  "improvements": ["Address fee concerns directly", "Avoid guaranteeing non-guaranteed returns"],
  "compliancePassed": false,
  "summary": "Solid conversation skills but compliance violation on non-guaranteed returns is a critical issue..."
}
```

**Implementation:**
- Validate with Zod
- Build prompt from `grading-prompts.ts` template, inserting transcript, persona context
- Call GPT-5.4 via `openai` SDK with `json_schema` in `response_format` for structured output
- GPT-5.4 performs both compliance checking (analyzing transcript against rules) and rubric-based grading in a single call
- Return structured result

(Manager dashboard APIs removed — prototype focuses on single session + review only.)

---

## 5. WebRTC + Deepgram Dual Pipeline — Detailed Flow

### 5.1 Connection Sequence

```
1. User clicks "Join Meeting"
2. getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
3. Clone MediaStream → Stream A (WebRTC) + Stream B (Deepgram)

── Pipeline A: OpenAI WebRTC ──
4. POST /api/token { personaId } → ephemeralKey
5. new RTCPeerConnection()
6. pc.addTrack(streamA.getAudioTracks()[0])
7. dc = pc.createDataChannel("oai-events")
8. offer = pc.createOffer() → pc.setLocalDescription(offer)
9. POST https://api.openai.com/v1/realtime?model=gpt-5.4
   Headers: Authorization: Bearer {ephemeralKey}, Content-Type: application/sdp
   Body: offer.sdp
   Response: answer SDP
10. pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })
11. pc.ontrack → audioElement.srcObject = event.streams[0] (AI voice plays)
12. dc.onmessage → parse JSON events (transcripts, turn detection)

── Pipeline B: Deepgram STT ──
13. GET /api/deepgram-token → token
14. new WebSocket("wss://api.deepgram.com/v1/listen?model=nova-3&language=zh&punctuate=true&interim_results=true&smart_format=true&keywords=保證回報:3&keywords=非保證:3&...")
   Headers: Authorization: Token {dgToken}
15. new MediaRecorder(streamB, { mimeType: 'audio/webm;codecs=opus' })
16. mediaRecorder.start(250)  // 250ms chunks
17. mediaRecorder.ondataavailable → ws.send(event.data)
18. ws.onmessage → parse transcript JSON, accumulate entries

── Both pipelines now running in parallel ──
```

### 5.2 During Session

```
Planner speaks:
  → Audio → WebRTC → OpenAI GPT-5.4 (processes, generates response)
  → Audio → Deepgram Nova-3 → Planner transcript (stored in memory, NOT displayed)

AI responds:
  → Audio → WebRTC ontrack → Speaker (user hears AI)
  → Text → DataChannel events → Buyer transcript (stored in memory, NOT displayed)
  → DataChannel may include "buy_decision" event → triggers win outcome

UI shows ONLY:
  → Zoom-like meeting interface (AI avatar, session timer, mute/end buttons)
  → No transcript, no compliance alerts, no interruptions

Background processing:
  → Transcript entries accumulated silently (for post-session LLM compliance check + grading)
  → Win/lose detector monitors AI data channel for __SUCCESS__ signal (purchase decision)
```

### 5.3 Session End

Session ends when: (a) AI signals "buy" decision (win), (b) time limit expires (lose), or (c) user manually ends.

```
1. Session end triggered (win/lose/manual)
2. Close MediaRecorder → send final chunk to Deepgram
3. Close Deepgram WebSocket (send close frame)
4. Close WebRTC DataChannel
5. Close RTCPeerConnection
6. Stop all MediaStream tracks
7. Merge transcripts (Deepgram planner + DataChannel buyer, sorted by timestamp)
8. POST /api/grade { transcript, personaId, durationSeconds, outcome }
   → GPT-5.4 performs compliance checking + grading in one call
9. Navigate to Review page → display full transcript, compliance flags, scorecard, win/lose outcome
```

### 5.4 Audio Format

Prototype targets **Chrome only**. Uses `audio/webm;codecs=opus` for MediaRecorder → Deepgram.

---

## 6. Component Architecture

```
app/layout.tsx
└── SessionProvider (React Context)
    └── app/page.tsx
        │
        ├── [phase: lobby]
        │   └── MeetingLobby (Zoom-like "Join Meeting" page)
        │       ├── PersonaSelector (4 persona cards with difficulty)
        │       └── JoinButton
        │
        ├── [phase: connecting]
        │   └── ConnectionOverlay (spinner + "Connecting to meeting...")
        │
        ├── [phase: active]
        │   └── MeetingRoom (Zoom-like meeting UI)
        │       ├── ParticipantGrid
        │       │   ├── AIParticipant (avatar + name, no camera, audio indicator)
        │       │   └── UserParticipant (self-view placeholder or initials)
        │       ├── SessionTimer (MM:SS countdown)
        │       └── MeetingControls (bottom bar)
        │           ├── MuteToggle
        │           └── EndSessionButton
        │       (NO transcript, NO compliance alerts, NO sidebar)
        │
        ├── [phase: grading]
        │   └── GradingOverlay (spinner + "Analyzing your performance...")
        │
        └── [phase: review]
            └── ReviewPage
                ├── OutcomeBanner (Win: "Client decided to buy!" / Lose: "Time's up!")
                ├── FullTranscript (scrollable, with timestamps and speaker labels)
                ├── ComplianceFlags (highlighted violations with explanations)
                ├── Scorecard
                │   ├── ScoreHeader (score + grade + compliance badge)
                │   ├── ScorecardRubric × 6
                │   ├── Strengths list
                │   └── Improvements list
                └── Actions ("Try Again" | "New Scenario")
```

---

## 7. Custom Hooks

| Hook | Responsibility | Key Exports |
|---|---|---|
| `use-audio-pipeline` | Mic access, stream forking | `micStream`, `deepgramStream`, `isReady`, `cleanup` |
| `use-webrtc-session` | OpenAI Realtime WebRTC lifecycle (GPT-5.4) | `connect()`, `disconnect()`, `connectionState`, `isAISpeaking`, `dataChannelEvents`, `buyDecision` |
| `use-deepgram-transcription` | Deepgram Nova-3 WebSocket streaming | `connect()`, `disconnect()`, `transcript[]`, `interimText` |
| `use-session-store` | Session lifecycle orchestration | `session`, `startSession()`, `endSession()`, `mergedTranscript`, `scorecard`, `sessionPhase`, `outcome` |
| `use-session-timer` | Countdown timer with auto-end | `timeRemaining`, `isExpired` |

---

## 8. Deepgram Nova-3 Keyword Boosting — HK Insurance Vocabulary (Mandarin)

The keyword boosting list is critical for Mandarin transcription accuracy. Deepgram Nova-3 allows `keyword:boost` pairs where boost is 0–10 (higher = more likely to be recognized).

**Categories and examples:**

```
Product Types (boost: 3–5):
  儲蓄保險 (savings insurance), 危疾保險 (critical illness), 人壽保險 (life insurance),
  醫療保險 (medical insurance), 投連險 (ILAS), 萬用壽險 (universal life),
  自願醫保/VHIS, 年金 (annuity), 定期壽險 (term life)

Company Names (boost: 5):
  友邦/AIA, 保誠/Prudential, 宏利/Manulife, 富衛/FWD, 安盛/AXA,
  中銀人壽/BOC Life, 恒生保險/Hang Seng Insurance

Regulatory Terms (boost: 4):
  保監局/IA, IIQE, 持續專業發展/CPD, 合規/compliance, 適合性/suitability,
  冷靜期/cooling-off period, 重要事實聲明/important facts statement

Financial Terms (boost: 3):
  保費/premium, 保額/sum assured, 退保價值/surrender value, 供款期/premium payment term,
  紅利/dividend/bonus, 保證回報/guaranteed return, 非保證/non-guaranteed,
  回報率/rate of return, 索償/claim, 核保/underwriting

Comparison Platforms (boost: 5):
  10Life, GoBear, CompareAsia, 消委會/Consumer Council
```

Full list: ~200 terms defined in `src/lib/hk-insurance-vocab.ts`.

---

## 9. Compliance Rules — LLM-Based

Compliance checking is performed **post-session** by GPT-5.4, which analyzes the full transcript against these rules:

| Rule ID | Name | Severity | Description |
|---|---|---|---|
| `guaranteed-returns` | Guaranteeing non-guaranteed returns | violation | Planner promises or implies guaranteed returns on non-guaranteed products (e.g., 保證回報, 一定會有) |
| `misrepresentation` | Product misrepresentation | violation | Planner makes false or misleading claims about product coverage or features |
| `pressure-selling` | Pressure selling tactics | warning | Planner uses urgency, scarcity, or time pressure to push a sale |
| `missing-risk` | Missing risk disclosure | warning | Planner discusses investment-linked products without adequate risk disclosure |
| `unlicensed-advice` | Specific investment advice | warning | Planner gives specific investment recommendations beyond their license scope |

The LLM identifies violations with specific quotes from the transcript, providing better accuracy than regex patterns.

---

## 10. Grading + Compliance Prompt Structure

GPT-5.4 performs both compliance checking and grading in a single call, using `json_schema` in `response_format` for structured output.

```
SYSTEM: You are an expert Hong Kong insurance sales trainer and compliance officer.
You are reviewing a roleplay session between a novice financial planner and a simulated buyer.

Your task:
1. Analyze the transcript for compliance violations (see COMPLIANCE RULES below)
2. Grade the planner's performance on the rubric dimensions

CONTEXT:
- Buyer Persona: {persona.name} — {persona.description}
- Session Duration: {durationSeconds} seconds
- Session Outcome: {outcome} (win/lose/manual end)

COMPLIANCE RULES:
{list of compliance rules with descriptions}

RUBRIC:
Grade on these dimensions (score 0–100 each):
1. Rapport Building (15%): ...
2. Needs Discovery (20%): ...
3. Product Knowledge (15%): ...
4. Objection Handling (25%): ...
5. Compliance (15%): ...
6. Closing Technique (10%): ...

TRANSCRIPT:
{formatted transcript with timestamps and speaker labels}

OUTPUT: Return a JSON object matching the schema. Include:
- complianceFlags: any violations found, with exact quotes from the transcript
- rubric scores with specific feedback referencing conversation moments
- overall assessment
Grade firmly but fairly. A session with any compliance violation cannot score above B overall.
```

The `response_format: { type: "json_schema", json_schema: ... }` ensures GPT-5.4 returns valid structured JSON matching the Scorecard + ComplianceFlag schemas.

---

## 11. Directory Structure

```
sales-trainner/
├── docs/plan/
│   ├── PRD.md
│   └── technical-design.md
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── components.json                      # shadcn/ui
├── public/
│   └── avatars/                         # persona images
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       ├── token/route.ts
│   │       ├── deepgram-token/route.ts
│   │       └── grade/route.ts
│   ├── components/
│   │   ├── ui/                          # shadcn/ui primitives
│   │   ├── meeting-lobby.tsx            # Zoom-like join page with persona selection
│   │   ├── meeting-room.tsx             # Zoom-like session UI (audio only)
│   │   ├── participant-grid.tsx         # AI + user participant tiles
│   │   ├── meeting-controls.tsx         # Mute, end session buttons
│   │   ├── session-timer.tsx            # Countdown timer
│   │   ├── review-page.tsx             # Post-session review with transcript + scorecard
│   │   ├── full-transcript.tsx         # Transcript display (review only)
│   │   ├── compliance-flags.tsx        # Compliance violation list (review only)
│   │   ├── scorecard.tsx
│   │   ├── scorecard-rubric.tsx
│   │   └── outcome-banner.tsx          # Win/Lose display
│   ├── hooks/
│   │   ├── use-audio-pipeline.ts
│   │   ├── use-webrtc-session.ts
│   │   ├── use-deepgram-transcription.ts
│   │   ├── use-session-store.ts
│   │   └── use-session-timer.ts
│   ├── lib/
│   │   ├── types.ts
│   │   ├── personas.ts
│   │   ├── compliance-rules.ts          # natural-language rule descriptions for LLM prompt
│   │   ├── hk-insurance-vocab.ts
│   │   ├── grading-prompts.ts
│   │   └── constants.ts
│   └── contexts/
│       └── session-context.tsx
```

---

## 12. Implementation Phases

| Phase | Scope | Key Deliverable |
|---|---|---|
| **1. Scaffold** | Next.js 16 + shadcn + deps (all latest) | Empty app that runs |
| **2. Data Layer** | Types, personas, compliance rules, vocab | All static data defined |
| **3. API Routes** | Token (GPT-5.4), Deepgram token (Nova-3), grading | All endpoints working |
| **4. Audio Pipeline** | Mic → dual stream → WebRTC + Deepgram | Voice conversation working |
| **5. Meeting UI** | Zoom-like lobby + meeting room + review page | Full user-facing experience |
| **6. Win/Lose** | AI buy signal detection, timer countdown | Game mechanic working |
| **7. Polish** | Error handling, edge cases | Demo-ready prototype |

---

## 13. Known Limitations (Prototype)

- **No persistence:** In-memory store resets on server restart
- **No auth:** Single-user prototype
- **Mandarin only:** No Cantonese or English support
- **Chrome only:** No Safari/Firefox support
- **No manager features:** No dashboard, team tracking, or multi-user views
- **No custom rubrics:** Grading rubric is hardcoded
- **Single browser tab:** No multi-device/multi-user support
- **API key exposure risk:** Deepgram token endpoint returns raw key; production needs scoped tokens
- **No rate limiting:** API routes have no throttling
