### Beijing Dajia Internet Information Technology Co., Ltd. (Kuaishou Technology) --- Jun 30, 2025 - Present | Java Engineer

#### 1. Ad Creation Agent — Natural-language Ad Creation

- **Background:** Advertisers in content-consumption verticals (novels, short dramas) had to manually complete "product selection + targeting + bidding" and build ad campaigns before launch — high barrier and error-prone. **Goal:** Build an Ad Creation Agent that lets advertisers create ads through natural-language, multi-turn interaction — Qingsong understands intent and clarifies parameters, while the Ad Creation Agent decides product/targeting/bid and creates assets (campaign - ad group - creative); also co-designed the Qingsong AgentTask long-running-task runtime to carry this kind of multi-turn + async-write long task.
- **Challenges:**
  - Strongly-constrained creation decisions: Kuaishou account > product (book/drama) > conversion goal > ROI have hard dependencies and priority, requiring safe resolution between "customer-specified priority" and "auto-fill/replace"
  - Natural-language creation is a "multi-turn interaction + async write" long task: intent → parameter completion → recommendation → confirmation → creation spans multiple requests, with async results requiring state persistence and recovery
  - Write-operation safety: only "confirm" mutates the account, requiring idempotency to prevent duplicate creation; must not blindly re-create on unknown timeout
- **Key Work: Ad Creation Agent Decisions + Co-designed Qingsong AgentTask (self-built in Java, no framework)**
  - **Self-built in Java, no framework**: Ad Creation Agent, slot state machine and rule engine implemented from scratch with no third-party Agent framework
  - **Ad Creation Agent decisions**: intent recognition, slot extraction, and product/targeting/bid decisions; field-priority resolution, deliverability validation and parameter replacement pushed down to a deterministic rule engine — model output is never directly trusted
  - **Slot extraction & clarification**: extract slots from the initial intent (may be empty) and from subsequent edits; clarify when the user wants to specify but didn't give the value, or a required parameter is missing, with options and a round limit
  - **Co-designed the Qingsong AgentTask long-running-task runtime**: event-driven + persistent state machine (aligned with A2A TaskState), Checkpoint / Artifact separation; ordinary single turns bypass AgentTask, only long tasks use it
  - **Idempotency & concurrency**: trigger_key + task_version + row_version (optimistic lock) + lease (execution lease) + executionId (A2A idempotency)
  - **Two A2A calls with result fallback**: the first recommends delivery targets (no DSP write), the second creates the ad after confirmation (DSP write); confirmedTarget is restored from the Artifact, not trusted from the frontend; on unknown-timeout, reconcile via getTask/executionId and escalate to manual verification
- **Impact:** The natural-language creation flow can pause, resume, and handle async callbacks end-to-end; write idempotency eliminates duplicate creation (metrics as examples, to be backfilled)

---

#### 2. Smart Delivery Agent — In-flight Assisted Optimization

- **Background:** During delivery, "how many campaigns/ad groups/creatives an account needs (infrastructure volume), whether to adjust bids, and whether to pause non-scaling creatives" had long relied on fixed rules and static thresholds, unable to adapt to account lifecycles (cold-start / stable / declining) and scenarios like non-scaling or over-cost. **Goal:** Upgrade in-flight infrastructure decisions to an LLM-driven Smart Delivery Agent for account-level dynamic infrastructure-volume decisions and assisted optimization.
- **Challenges:**
  - Long attribution chain from decision to outcome: infrastructure-volume/quota decisions are confounded by ranking, bidding, and marketplace traffic; using spend directly as the feedback signal biases learning
  - Boundary between hard constraints and LLM freedom: cross-package/cross-product filtering rules are hard constraints that must never be handed to the LLM, yet the LLM's output must not produce non-compliant creatives
  - Large online volume (7.43M material-optimization calls/day) makes all-in on LLM uncontrollable in cost and latency
- **Key Work: Perceive-Analyze-Decide-Execute-Reflect Five-role Closed Loop**
  - **Self-built in Java, no framework**: the five-role loop, signal-triggered scheduling, shared memory, and reflection loop (Generator-Reflector-Curator) all implemented from scratch with no third-party Agent framework
  - Built the five-role loop (data perceiver / strategy coordinator / auto executor / risk controller / decision reflector), triggered by multiple signals (first spend / review failure / infrastructure build / daily timer), ingesting account-level (budget, balance) + material-level (campaign/ad-group/creative spend) data, and outputting campaign/ad-group/creative counts + bid adjustments + pausing decisions
  - Chose Reflexion (Generator-Reflector-Curator, powered by Qwen): Generator produces the strategy, Reflector reviews against actual outcomes, Curator stores lessons back into the knowledge base; the reflection reward uses proxy metrics (scaling / cold-start pass / cost-on-target) aggregated by "account lifecycle × strategy" to avoid attribution confusion
  - "LLM for strategy + rule/solver for numbers": applies upper/lower guardrails (clamp / normalization / total validation) to the LLM's infrastructure-volume and quota outputs; hard-constraint filtering stays as deterministic fallback
  - Infrastructure Agent × Material-optimization Agent coordinate in serial-async at account granularity, sharing environment / infrastructure / reflection memory
  - Cost-trigger layering: the LLM is invoked only at the low-frequency account-level infrastructure decision (not per material fill), plus semantic caching and small-model distillation
- **Impact:** Material cold-start pass rate, scaling speed, non-duplicate material spend share, and material arpu improved (example, pending AB backfill); per-account daily token cost down ~60% vs. an all-in LLM approach
