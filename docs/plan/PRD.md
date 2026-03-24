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
- **Pain:** Freezes on questions or objections, struggles with code-switching (Cantonese/Mandarin/English), uncertain about compliance boundaries
- **Goal:** Build muscle memory for common challenge patterns in a safe environment

### 2.2 Primary Buyer: Agency Manager
- **Who:** Unit Managers, District Managers, Agency Owners
- **Context:** Managing teams of 10–50 planners, accountable for team conversion rates
- **Pain:** No visibility into who is practicing, who is compliance-ready, who needs intervention
- **Goal:** Data-driven view of team readiness; reduce time spent on repetitive coaching

---

## 3. Competitive Moat

We are **not** building a generic English-language sales bot. Our defensibility comes from:

| Dimension | Generic Competitor (e.g., Gemini, ChatGPT voice) | Our Product |
|---|---|---|
| **Language** | Basic Mandarin/Cantonese, no code-switching | Flawless Mandarin, Gangpu, natural Mandarin/Cantonese–English mixing, HK financial jargon |
| **Personas** | Generic "difficult customer" | HK-specific: Shenzhen cross-border buyer, 10Life-comparing local, conservative auntie |
| **Compliance** | None | Real-time HK IA compliance checks, violation tracking |
| **Management** | Individual tool | Manager dashboard, team analytics, certification tracking |
| **Transcription** | General-purpose STT | Custom HK insurance vocabulary dictionary for grading accuracy |

---

## 4. MVP Scope — Prototype

### 4.1 In Scope

**Core Roleplay Loop:**
1. Planner selects a buyer persona from a pre-built library
2. Real-time voice conversation with AI buyer (sub-300ms latency)
3. AI buyer speaks in persona-appropriate language (Mandarin, Cantonese, or English)
4. Live transcript displayed during conversation (parallel high-accuracy STT)
5. Real-time compliance violation alerts
6. Post-session scorecard with rubric-based grading

**Buyer Personas (4 for prototype):**

| Persona | Language | Difficulty | Key Objections |
|---|---|---|---|
| **Mr. Chen Wei** — Skeptical Shenzhen Tech Exec | Mandarin | Advanced | "Why not buy in Shenzhen?", "Your fees are too high", "I can invest via QDII" |
| **Mrs. Lam** — 10Life-Comparing Local Buyer | Cantonese | Intermediate | "10Life rates this 7/10", "Competitor has higher guaranteed return" |
| **Auntie Wong** — Conservative Risk-Averse Buyer | Cantonese (colloquial) | Beginner | "Will I lose money?", "I just want to save in the bank" |
| **Kevin Leung** — Young Professional | Mixed Cantonese/English | Intermediate | "Why not just buy VOO?", "I can use Endowus/StashAway" |

**Compliance Engine (5 rules for prototype):**
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

**Manager Dashboard (basic, mock data for prototype):**
- Team member list with practice frequency, average scores, compliance flags
- Certification status tracking (not started / in progress / certified)
- Session history

### 4.2 Out of Scope (Future Versions)

- User authentication / login
- Persistent database (prototype uses in-memory storage)
- Custom persona creation by managers
- Agency-specific rubric uploads
- Multi-user real-time dashboard
- Mobile app
- SSO / SAML integration
- Billing / subscription management
- Video (face/body language analysis)
- Integration with agency CRM systems

---

## 5. User Stories

### Planner Stories

| ID | Story | Acceptance Criteria |
|---|---|---|
| P1 | As a planner, I want to select a practice scenario so I can train for specific buyer types | 4 personas displayed with difficulty level; click to select |
| P2 | As a planner, I want to have a voice conversation with an AI buyer so the practice feels realistic | < 300ms response latency; AI speaks in persona language; natural turn-taking |
| P3 | As a planner, I want to see a live transcript so I can follow along | Transcript updates within 2 seconds; both speakers shown; language detected |
| P4 | As a planner, I want to be warned if I say something non-compliant so I learn the boundaries | Alert appears within 3 seconds of violation; explains what was wrong |
| P5 | As a planner, I want a scorecard after each session so I know what to improve | Score per rubric dimension; specific strengths and improvements; overall grade |
| P6 | As a planner, I want to practice in Cantonese, Mandarin, or mixed so it matches my real client conversations | AI responds in selected persona's language; transcript handles all three |

### Manager Stories

| ID | Story | Acceptance Criteria |
|---|---|---|
| M1 | As a manager, I want to see who has been practicing so I can identify disengaged planners | Dashboard shows practice frequency per team member |
| M2 | As a manager, I want to see compliance violation history so I know who is safe to deploy | Violation count per planner; details available |
| M3 | As a manager, I want to see average scores so I can identify who needs coaching | Average score per planner; sortable table |

---

## 6. Success Metrics (Prototype)

| Metric | Target | How to Measure |
|---|---|---|
| Voice conversation works in Mandarin | Yes/No | Manual test: 2-min conversation in Mandarin |
| Voice conversation works in Cantonese | Yes/No | Manual test: 2-min conversation in Cantonese |
| Code-switching handled | Yes/No | Manual test: mix languages mid-sentence |
| Response latency | < 500ms (prototype) | Measure time from user speech end to AI speech start |
| Transcript accuracy (domain terms) | > 80% for boosted keywords | Manual review of 10 transcribed insurance terms |
| Compliance detection | Catches "guaranteed return" in 3 languages | Manual test with known violation phrases |
| Grading relevance | Scorecard references specific conversation moments | Manual review of 5 scorecards |
| End-to-end session | Complete flow works | Start → converse → end → scorecard displayed |

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Cantonese STT accuracy insufficient | Medium | High — bad transcript = bad grading | Deepgram keyword boosting + fall back to OpenAI built-in transcription |
| OpenAI Realtime API latency > 300ms | Low | Medium — less realistic feel | Acceptable for prototype; monitor and optimize |
| Compliance regex too simplistic | High | Medium — misses nuanced violations | Prototype limitation; v2 uses LLM-based compliance checking |
| API costs during testing | Medium | Low — budget concern | 5-minute session cap; monitor usage |
| Safari WebRTC compatibility | Medium | Medium — some users on Safari | Detect browser; use fallback audio format; document Chrome as primary |

---

## 8. Open Questions

1. **Voice selection:** Should each persona have a distinct AI voice, or is one voice sufficient for prototype?
   - *Recommendation:* Distinct voices (OpenAI offers multiple) — worth the minimal extra effort for realism.

2. **Session duration limit:** What's the right cap for the prototype?
   - *Recommendation:* 5 minutes — enough to demonstrate the concept, keeps API costs manageable.

3. **Grading LLM:** Claude Sonnet vs GPT-4o for the grading engine?
   - *Recommendation:* Claude Sonnet via Vercel AI SDK — better structured output, Anthropic alignment with compliance-focused grading.

4. **Deepgram model:** Nova-2 (broader language support) vs Nova-3 (newer, self-serve customization)?
   - *Recommendation:* Start with Nova-2 `language=multi` for proven multilingual support; evaluate Nova-3 if accuracy is insufficient.
