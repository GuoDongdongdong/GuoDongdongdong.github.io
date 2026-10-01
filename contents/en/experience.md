### Beijing Dajia Internet Information Technology Co., Ltd. (Kuaishou Technology) --- Jun 30, 2025 - Present | Java Engineer

#### 1. Cili Qingsong Agent — Workflow to Agent Harness Architecture Migration

- **Background:** Cili Qingsong is Kuaishou's AI assistant for the Magnetic Engine advertising platform, providing advertisers with delivery consulting, performance diagnostics, and ad operation capabilities. **Goal:** Migrate the platform AI from a fixed Workflow to an **Agent Harness** architecture with dynamic tool dispatch and unified context management, while exposing capabilities via a standard RPC interface.
- **Challenges:**
  - The original system used a **fixed Workflow pipeline** — node order was hardcoded (intent recognition → retrieval → LLM → response), so every new capability required modifying the main flow; high extension cost and a brittle chain
  - Intent routing was hardcoded in the main flow, with no way to select tool chains dynamically based on user intent
  - Cross-cutting concerns (context management, tool invocation, memory injection) were scattered across individual nodes and hard to reuse
- **Key Work: Workflow → Agent Harness**
  - **Lead Agent (LLM) drives all decisions:** system prompt dynamically injects the available tool list (knowledge Q&A / performance diagnostics / traffic prediction / bid suggestions / audit tracking, etc.); the Agent autonomously selects the tool chain based on user intent and dispatches via `ExecuteAction` to the corresponding sub-agent, with results fed back to the Lead Agent for synthesis
  - **Middleware Chain decoupling:** extracted cross-cutting logic (context loading, memory injection, intent guard, result convergence) from individual nodes into an ordered Middleware pipeline; adding new capabilities only touches the corresponding Middleware layer, with zero changes to the core Agent reasoning code
  - **External RPC entry:** wrapped an `AdJarvisSkillService` (gRPC) on top of the Harness, supporting both synchronous `ExecuteSkill` and streaming `ExecuteSkillStream`; each request uses standalone mode with an independent session; available skill whitelist configured via Kconf for zero-deployment gray rollout
  - **Led the Harness architecture design** and implemented the standalone execution layer, eliminating duplicate logic between the skill and batchEvaluation pipelines
  - **Built the intent guard + Kconf gray rollout configuration**, supporting per-tenant whitelist expansion without redeployment
- **Impact:** Time to add new business capabilities reduced by ~50% (eliminated main Workflow modification + integration cycle); external skill RPC success rate ≥ 99.5%, P99 ≤ 8s after gray rollout

---

#### 2. Smart Product Selection Agent — Short Drama LLM Recommendation System

- **Background:** In Kuaishou's short drama advertising business, delivery teams needed to select the most suitable short dramas from a massive content library for advertisers to promote. **Goal:** Build a smart product selection Agent using LLM to automate "input advertiser intent → analyze audience characteristics → multi-dimensional retrieval + ranking + recommendation" end-to-end.
- **Challenges:**
  - The original process relied on manual selection and rule-based filtering — low efficiency and limited personalization
  - Needed multi-dimensional recall and ranking for "audience profile → content match" across a massive content library, which rules alone could not cover
- **Key Work:** Refactored the existing Workflow into Agent mode on Kuaishou's KFlow engine
  - **Intent parsing:** LLM parses advertiser input (target industry, audience profile, budget, delivery objective) and structurally extracts selection constraints
  - **Drama profile construction:** multi-dimensional vectorized features built from content, audience data and historical delivery performance (genre / cast / tone / audience demographics), integrated with the internal vector retrieval service
  - **Retrieval and ranking:** vector similarity recall of candidate dramas → multi-feature fusion (content match + historical CTR + audience overlap) → LLM rerank with recommendation rationale
  - **ReAct loop:** registered tools ("drama search", "audience analysis", "historical performance query"); the Agent calls them over multiple turns until constraints are satisfied
  - **Result output:** structured recommendation list (drama info + recommendation rationale + expected performance estimates)
- **Impact:** Selection efficiency improved 60%+ vs. manual process; average audience overlap between recommended dramas and advertiser target audience improved ~25%
