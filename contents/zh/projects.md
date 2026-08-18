#### Thumbnail AI · Mountex

- **背景：** 基于 MkSaaS、Next.js 搭建的多平台封面图生成 AI 工具（[thumbnail-ai.com](https://thumbnail-ai.com)），面向 YouTube、Instagram、Facebook、X、LinkedIn、TikTok 等多平台内容创作者，支持选择平台尺寸、风格参考与主体上传，三步内完成专业封面图生成，帮助创作者提升点击率。
- **产品与链路：** 前端：Next.js + 响应式多端适配，支持平台预设尺寸一键选择、本地上传/URL 主体、风格参考图；AI 链路：主体与风格图输入 → 提示词编排（平台场景 + 风格关键词）→ 调用图像生成 API 生成多尺寸封面 → 预览与下载；支持免费额度 + 订阅付费，付费用户可解锁高清导出与批量生成。
- **数据与指标：** 累计注册用户 2000+，付费用户 200+；月活 500+，月生成封面 1500+ 张；付费转化率约 38%；用户从上传到出图平均时长 < 2 分钟。
- **我的职责：** 项目 owner，从 0 到 1 负责前端工程（Next.js、支付与订阅流程、多平台尺寸与风格配置）、AI 封面生成链路设计与对接（提示词工程、多尺寸批量生成、降本与体验优化）。

#### Krene-Art

- **背景：** 面向游戏/二次元角色设计师的 AI 创作平台（[krene.com](https://krene.com)），通过 Agent 完成意图解析、参考图检索、视觉特征提取与 Prompt 生成，输出带设计说明的角色卡片（含核心设定、概念整合与角色立绘），缩短从脑洞到成图的设计周期。
- **ReAct Workflow 与链路：**
  - search：根据用户意图生成搜索关键词 → 爬取 Bing 图搜解析高清链接 → LLM 投票游戏角色维度（造型、配色、气质等）打分筛选，单次聚合约 300 张参考
  - design：GPT-4o Vision 对参考图做五维视觉特征提取 → 与用户设定拼接成结构化 Prompt → NovelAI nai-diffusion-3 生成 10 张角色图
  - evaluate：设计师设定维度打分，低分时 ReAct 触发重新 design（调整 Prompt 或参考集），直至达标后输出结构化角色卡片
- **数据与指标：** 累计用户 1200+，付费用户 150+；月生成角色卡 400+ 张；付费转化率约 42%；单角色从输入意图到出卡平均 6–8 分钟。
- **我的职责：** 项目 owner，从 0 到 1 负责前端工程与 AI 角色设计 ReAct Workflow（意图解析、search/design/evaluate 三阶段编排、Vision 特征提取与 NovelAI 对接、角色卡片结构化输出与展示）。

---

- **开源：** 持续半年 Apache 社区贡献，**[18岁成为全球最年轻 Apache Committer](https://github.com/GuoDongdongdong)**；深度参与 ByteDance/DeerFlow、Apache Fory、Spring AI Alibaba、Ant Design X 等社区开发与维护；2024 阿里天池云原生全球编程挑战赛 issue 解决数第一，**技术文章荣获天池赛最佳质量奖**；2024 腾讯犀牛鸟开源大赛**课题实战奖 & Issue 实战奖**；2024 OSPP 中科院开源之夏（ByteDance/VisActor 组件开发）。
- **AdventureX AI 黑客松比赛：** 开发全球首个 Apple Vision Pro Agent，斩获 Kimi For Vibe Coding 奖、空间智能赛道第二名及 Injective $1000。
- **AI Startup 好朋友：** 帮助多家明格、红杉、蓝驰、奇绩等知名 VC 被 AI Startup 实现 Agent 业务落地；与于干、Kimi、智谱 GLM、MiniMax、豆包、Trae、灵光、AI 福等多家大模型 / AI 产品深度合作，参与官方评测与 Demo 制作，产出**技术文章、评测笔记与 Demo 视频**，为产品宣传与迭代提供反馈。
- 高中时期做过 Live2D/3D 数字人，二次元平台产品经理，对二次元文化有深入了解。
