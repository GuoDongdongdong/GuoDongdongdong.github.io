#### Thumbnail AI · Mountex

- **Background:** AI cover image generation tool for multiple platforms built with MkSaaS & Next.js ([thumbnail-ai.com](https://thumbnail-ai.com)), targeting creators on YouTube, Instagram, Facebook, X, LinkedIn and TikTok; supports platform-specific sizes, style references and subject upload, generating professional covers in 3 steps to boost click-through rates.
- **Product & pipeline:** Frontend: Next.js + responsive multi-platform adaptation, platform-preset sizes, local/URL subject upload, style reference images; AI pipeline: subject + style image → prompt assembly (platform context + style keywords) → image generation API → multi-size preview & download; free quota + paid subscription, HD export & batch generation for paid users.
- **Metrics:** 2000+ registered users, 200+ paid users; 500+ MAU, 1500+ covers generated monthly; paid conversion ~38%; avg upload-to-output < 2 min.
- **My role:** Project owner, 0-to-1 frontend engineering (Next.js, payment & subscription flow, multi-platform size/style config) + AI cover generation pipeline (prompt engineering, multi-size batch generation, cost optimization & UX).

#### Krene-Art

- **Background:** AI creation platform for game/anime character designers ([krene.com](https://krene.com)); Agent completes intent parsing, reference image retrieval, visual feature extraction and Prompt generation, outputting character cards with design notes (core setting, concept integration, character illustration), shortening the design cycle from concept to finished art.
- **ReAct Workflow:**
  - search: generate search keywords from intent → scrape Bing image search for HD links → LLM voting/scoring on game character dimensions (styling, color, temperament), aggregating ~300 references per run
  - design: GPT-4o Vision extracts 5-dimensional visual features from references → assembled into structured Prompt with user settings → NovelAI nai-diffusion-3 generates 10 character images
  - evaluate: designer scores on preset dimensions; low score triggers ReAct to redo design (adjust Prompt or reference set) until passing → output structured character card
- **Metrics:** 1200+ users, 150+ paid; 400+ character cards generated monthly; paid conversion ~42%; avg concept-to-card < 6–8 min.
- **My role:** Project owner, 0-to-1 frontend + AI character design ReAct Workflow (intent parsing, search/design/evaluate orchestration, Vision feature extraction & NovelAI integration, structured card output & display).

---

- **Open Source:** 6 months continuous Apache contribution — **[youngest Apache Committer globally at age 18](https://github.com/GuoDongdongdong)**; core contributor to ByteDance/DeerFlow, Apache Fory, Spring AI Alibaba, Ant Design X; **#1 issue resolver at Alibaba Cloud-Native Global Coding Challenge 2024, technical article won Best Quality Award**; Tencent Rhino-Bird Open Source Competition **Topic Practice Award & Issue Practice Award 2024**; OSPP 2024 (ByteDance/VisActor component development).
- **AdventureX AI Hackathon:** Built world's first Apple Vision Pro Agent — won **Kimi For Vibe Coding Award, 2nd place in Spatial Intelligence track & Injective $1000**.
- **AI Startup partner:** Helped multiple AI startups backed by Mingge, Sequoia, Blue Run, Qijing and other top VCs land Agentic business; deep collaboration with Kimi, Zhipu GLM, MiniMax, Doubao, Trae and other leading LLM/AI products — participated in official evaluations and Demo production, producing **technical articles, evaluation notes and Demo videos**.
- Built Live2D/3D digital avatars in high school; former product manager on an anime platform; deep understanding of ACG culture.
