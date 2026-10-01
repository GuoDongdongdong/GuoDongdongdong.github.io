### Beijing Dajia Internet Information Technology Co., Ltd. (Kuaishou Technology) --- Jun 30, 2025 - Present | Commercialization Technology Dept. / External Loop Backend Team

#### Cili Qingsong Agent — Workflow to Agent Harness Architecture Migration

- **Background:** Cili Qingsong is Kuaishou's AI assistant for the Magnetic Engine advertising platform, providing advertisers with delivery consulting, performance diagnostics, and ad operation capabilities. The original system used a **fixed Workflow pipeline** — node order was hardcoded (intent recognition → retrieval → LLM → response), requiring modifications to the main flow for each new capability; cross-cutting concerns like context management, tool invocation, and memory injection were scattered across individual nodes. **Goal:** Migrate the platform AI from a fixed Workflow to an **Agent Harness** architecture with dynamic tool dispatch and unified context management, while exposing capabilities via a standard RPC interface.
- **Core migration: Workflow → Agent Harness**
  - **Original Workflow mode:** Coordinator → Planner → specialized nodes (knowledge retrieval / performance diagnostics / bid adjustment / audit…) → response; fixed node order, intent routing hardcoded in the main flow, adding new capabilities required changing the DAG
  - **Agent Harness mode:** A **Lead Agent (LLM) drives all decisions** — system prompt dynamically injects the available tool list (knowledge Q&A / performance diagnostics / traffic prediction / bid suggestions / audit tracking, etc.); the Agent autonomously selects the tool chain based on user intent and dispatches via `ExecuteAction` to the corresponding sub-agent, with results fed back to the Lead Agent for synthesis
  - **Middleware Chain decoupling:** Extracted cross-cutting logic (context loading, memory injection, intent guard, result convergence) from individual nodes into an ordered Middleware pipeline; adding new capabilities only touches the corresponding Middleware layer, with zero changes to the core Agent reasoning code
  - **External RPC entry:** Wrapped a `AdJarvisSkillService` (gRPC) on top of the Harness, supporting both synchronous `ExecuteSkill` and streaming `ExecuteSkillStream`; each request uses standalone mode with an independent session; available skill whitelist configured via Kconf for zero-deployment gray rollout
- **My role:**
  - Led the Harness architecture design, drove the migration from fixed Workflow to Lead Agent + dynamic tool dispatch
  - Implemented the Middleware Chain, decoupling cross-cutting concerns (context management, memory R/W, intent guard) from business nodes
  - Designed and implemented the external RPC entry (`AdJarvisSkillService`) and standalone execution layer, eliminating duplicate logic between skill and batchEvaluation pipelines
  - Designed intent guard + Kconf gray rollout configuration, supporting per-tenant whitelist expansion without redeployment
  - **Result:** Time to add new business capabilities reduced by ~50% (eliminated main Workflow modification + integration cycle); external skill RPC success rate ≥ 99.5%, P99 ≤ 8s after gray rollout

---

#### Smart Product Selection Agent — Short Drama LLM Recommendation System

- **Background:** In Kuaishou's short drama advertising business, delivery teams needed to select the most suitable short dramas from a massive content library for advertisers to promote. The original process relied on manual selection and rule-based filtering, resulting in low efficiency and limited personalization. **Goal:** Build a smart product selection Agent using LLM to automate "input advertiser intent → analyze audience characteristics → multi-dimensional retrieval + ranking + recommendation" end-to-end.
- **Architecture:** Refactored existing rule-based Workflow into Agent mode on KFlow:
  - Intent parsing: LLM parses advertiser input (target industry, audience profile, budget, delivery objective), structurally extracts selection constraints
  - Drama profile construction: Multi-dimensional vectorized features based on content, audience data, and historical delivery performance (genre / cast / tone / audience demographics)
  - Retrieval and ranking: Vector similarity recall of candidate dramas → multi-feature fusion (content match score + historical CTR + audience overlap) → LLM rerank with recommendation rationale
  - ReAct loop: Agent calls tools on demand ("drama search", "audience analysis", "historical performance query") until satisfying constraints
  - Result output: Structured recommendation list (drama info + recommendation rationale + expected performance estimates)
- **My role:**
  - Refactored rule-based Workflow into Agent architecture, designed the complete pipeline: intent parsing → tool orchestration → ReAct loop
  - Designed drama profile feature engineering, integrated internal vector retrieval service, completed "intent constraints → feature vectors → candidate recall" pipeline
  - Implemented LLM rerank node for personalized re-ranking with structured recommendation rationale
  - Registered Agent tools (drama search / audience analysis / performance data query), supporting multi-turn ReAct tool calls
  - **Result:** Selection efficiency improved 60%+ vs. manual process; average audience overlap between recommended dramas and advertiser target audience improved ~25%
