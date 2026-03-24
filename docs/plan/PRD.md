# Product Requirements Document
## AI Sales Roleplay Simulator — MVP Prototype

**Version:** 0.1 (Prototype)
**Date:** 2026-03-24
**Status:** Draft

---

## 1. Problem Statement

First-year financial planners at Hong Kong insurance agencies (AIA, Prudential, Manulife, FWD) have a critical skills gap: they freeze when prospects raise questions or objections, resulting in burned leads and lost revenue. Current training (classroom roleplay with managers) is expensive, unscalable, and lacks objective measurement.

**The cost of inaction:**
- Each burned lead costs the agency HK$500–2,000 in marketing spend
- Average first-year planner attrition rate is ~60%, partly driven by early failure experiences
- Managers spend 10+ hours/week on 1-on-1 coaching that doesn't scale

---

## 2. Target Users

### 2.1 Primary User: Novice Financial Planner
- **Who:** First-year financial planners (IIQE-qualified, 0–12 months experience)
- **Context:** Preparing for client meetings, practicing after failed appointments
- **Pain:** Freezes on questions or objections, uncertain about compliance boundaries
- **Goal:** Build muscle memory for common challenge patterns in a safe environment

---

## 3. Competitive Moat

We are **not** building a generic English-language sales bot. Our defensibility comes from:

| Dimension | Generic Competitor (e.g., Gemini, ChatGPT voice) | Our Product |
|---|---|---|
| **Language** | Basic Mandarin, no domain awareness | Fluent Mandarin with HK financial jargon |
| **Personas** | Generic "difficult customer" | HK-specific: Shenzhen cross-border buyer, 10Life-comparing local, conservative auntie |
| **Compliance** | None | Post-session HK IA compliance checks, violation tracking |
| **Transcription** | General-purpose STT | Custom HK insurance vocabulary dictionary for grading accuracy |
| **Gamification** | None | Win/lose mechanic — persuade the AI buyer or lose when time runs out |

---

## 4. MVP Scope — Prototype

### 4.1 In Scope

**Core Experience: One Practice Session with Review**

The prototype implements exactly one flow — a simulated sales meeting followed by a performance review.

**Prototype Flow:**
1. Website opens → "Join Meeting" page (Zoom-like lobby UI)
2. Planner enters the meeting → sees the AI buyer already present (audio only, no camera)
3. AI buyer speaks first to initiate the conversation
4. Voice conversation proceeds naturally — no transcript, no alerts, no interruptions during the session
5. Session ends when:
   - **Win:** The AI buyer is persuaded and decides to buy the product, OR
   - **Lose:** Time limit expires without the AI buyer being convinced
6. After session ends → Review page showing full transcript, compliance flags, and scorecard

**During session:** The UI is a Zoom-like fake meeting interface. Everything is processed and recorded in the background (transcription, compliance checking), but nothing is displayed to the user. The experience should feel like a real online meeting.

**After session:** The review page shows the full transcript, compliance violations, and a detailed scorecard with rubric-based grading.

**Language:** For this prototype, both the AI and the user speak **Mandarin**. The tech stack must support Mandarin STT and TTS.

**Buyer Personas (4 for prototype, each with a distinct AI voice):**

| Persona | Difficulty | Key Objections |
|---|---|---|
| **Mr. Chen Wei** — Skeptical Shenzhen Tech Exec | Advanced | "Why not buy in Shenzhen?", "Your fees are too high", "I can invest via QDII" |
| **Mrs. Lam** — 10Life-Comparing Local Buyer | Intermediate | "10Life rates this 7/10", "Competitor has higher guaranteed return" |
| **Auntie Wong** — Conservative Risk-Averse Buyer | Beginner | "Will I lose money?", "I just want to save in the bank" |
| **Kevin Leung** — Young Professional | Intermediate | "Why not just buy VOO?", "I can use Endowus/StashAway" |

**Compliance Engine (5 rules, checked post-session during review):**
1. Guaranteeing non-guaranteed returns (保證非保證回報)
2. Misrepresentation of product features
3. Pressure selling ("limited time", "price going up")
4. Missing risk disclosure for investment-linked products
5. Unlicensed investment advice

**Grading Rubric (6 dimensions):**

| Dimension | Weight | What It Measures |
|---|---|---|
| Rapport Building | 15% | Empathy, appropriate language, connection |
| Needs Discovery | 20% | Open-ended questions, uncovering true needs |
| Product Knowledge | 15% | Accuracy of explanations, ability to compare |
| Objection Handling | 25% | Quality of reframing, persistence without pressure |
| Compliance | 15% | No violations, proper disclosures |
| Closing Technique | 10% | Appropriate next steps, no pressure |

### 4.2 Out of Scope (Future Versions)

- User authentication / login
- Persistent database (prototype uses in-memory storage)
- Manager dashboard / team analytics
- Custom persona creation
- Agency-specific rubric uploads
- Multi-user real-time dashboard
- Mobile app
- SSO / SAML integration
- Billing / subscription management
- Video (face/body language analysis)
- Integration with agency CRM systems
- Cantonese / English language support (Mandarin only for prototype)

---

## 5. User Stories

| ID | Story | Acceptance Criteria |
|---|---|---|
| P1 | As a planner, I want to join a meeting lobby and select a buyer persona so I can start practicing | Zoom-like join page; 4 personas with difficulty level; click to start |
| P2 | As a planner, I want to have a voice conversation with an AI buyer in a realistic meeting UI | Zoom-like meeting interface; < 500ms response latency; AI speaks Mandarin; natural turn-taking; AI speaks first |
| P3 | As a planner, I want the session to end with a clear win/lose outcome | Win: AI buyer decides to purchase; Lose: time limit expires without purchase |
| P4 | As a planner, I want to review the full transcript after the session so I can see what happened | Review page shows full transcript with timestamps and speaker labels |
| P5 | As a planner, I want to see compliance violations flagged in the review so I learn the boundaries | Compliance flags shown in review with explanation of what was wrong |
| P6 | As a planner, I want a scorecard after each session so I know what to improve | Score per rubric dimension; specific strengths and improvements; overall grade; win/lose outcome |

---

## 6. Success Metrics (Prototype)

| Metric | Target | How to Measure |
|---|---|---|
| Voice conversation works in Mandarin | Yes/No | Manual test: 2-min conversation in Mandarin |
| Response latency | < 500ms (prototype) | Measure time from user speech end to AI speech start |
| Zoom-like meeting UI feels realistic | Yes/No | Manual review: no transcript/alerts shown during session |
| Transcript accuracy (domain terms) | > 80% for boosted keywords | Manual review of 10 transcribed insurance terms in review page |
| Compliance detection | Catches "guaranteed return" in Mandarin | Manual test with known violation phrases |
| Win/lose mechanic works | Yes/No | AI ends session on successful persuasion; time limit triggers loss |
| Grading relevance | Scorecard references specific conversation moments | Manual review of 5 scorecards |
| End-to-end flow | Complete flow works | Join meeting → converse → session ends → review page displayed |

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Mandarin STT accuracy insufficient | Medium | High — bad transcript = bad grading | Deepgram Nova-3 keyword boosting + fall back to OpenAI built-in transcription |
| OpenAI Realtime API latency > 300ms | Low | Medium — less realistic feel | Acceptable for prototype; monitor and optimize |
| Compliance regex too simplistic | High | Medium — misses nuanced violations | Prototype limitation; v2 uses LLM-based compliance checking |
| API costs during testing | Medium | Low — budget concern | 5-minute session cap; monitor usage |
| Safari WebRTC compatibility | Medium | Medium — some users on Safari | Detect browser; use fallback audio format; document Chrome as primary |
| Win/lose detection unreliable | Medium | Medium — unclear session outcome | AI persona prompt includes explicit "buy" decision signal; fallback to time-based loss |

---

## 8. Resolved Decisions

1. **Voice selection:** Each persona has a **distinct** AI voice (OpenAI offers multiple).
2. **Session duration limit:** 5 minutes — enough to demonstrate the concept, keeps API costs manageable.
3. **Grading LLM:** Claude Sonnet via Vercel AI SDK — better structured output, compliance-focused grading.
4. **Deepgram model:** **Nova-3** (latest).
5. **Conversation LLM:** **GPT-5.4** (latest, supports `json_schema` in `response_format`).
6. **Language:** **Mandarin only** for prototype.
7. **Session UI:** **Zoom-like meeting interface** — no transcript/alerts during session, all shown in post-session review.
8. **Win/lose mechanic:** AI buyer can decide to purchase (win) or time runs out (lose).
