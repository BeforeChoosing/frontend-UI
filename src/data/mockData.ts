import { SimulationTask, SkillCard, WorkplaceDoc, CompletedTrialTask, UserExperienceRecord } from '../types';

export const HERO_FLOATING_CARDS: SkillCard[] = [
  {
    id: 'card-insight',
    title: '用户洞察',
    category: '洞察分析',
    description: '穿透表层诉求，挖掘用户真实动机与隐性痛点',
    detail: '擅长通过用户深访、语义聚类和体验地图，从散乱的反馈中提炼核心高价值痛点。',
    icon: 'Search',
    colorTone: 'purple',
    workplaceApplication: '在产品立项与需求定义阶段，精准锁定MVP的核心价值主张。'
  },
  {
    id: 'card-problem',
    title: '问题拆解',
    category: '产品策略',
    description: '将复杂模糊的业务命题拆解为可落地的逻辑树',
    detail: '善用MECE原则与因果链路图，将模糊的“产品不好用”精确定位到模块与参数。',
    icon: 'GitFork',
    colorTone: 'blue',
    workplaceApplication: '面对跨部门协同的复杂阻力，能迅速理清依赖关系和主次矛盾。'
  },
  {
    id: 'card-ai-craft',
    title: 'AI能力抽象',
    category: '技术落地',
    description: '连接大模型技术边界与用户真实交互心智',
    detail: '精通Prompt工程、RAG机制与Agent编排逻辑，设计优雅的人机协作闭环。',
    icon: 'Sparkles',
    colorTone: 'emerald',
    workplaceApplication: '为业务场景定义AI能力的输入输出规范与兜底机制。'
  },
  {
    id: 'card-data-driven',
    title: '数据驱动',
    category: '数据驱动',
    description: '用量化指标指导产品迭代与收益归因',
    detail: '建立北极星指标体系，敏锐洞察漏斗流失拐点，用A/B测试验证设计假设。',
    icon: 'LineChart',
    colorTone: 'amber',
    workplaceApplication: '评估功能上线前后的转化提升与ROI投入产出比。'
  },
  {
    id: 'card-prd',
    title: '产品落地交付',
    category: '协作沟通',
    description: '清晰撰写PRD与设计交互规范，推进敏捷研发',
    detail: '输出高质量高可读性的产品原型与边界分支逻辑，确保研发准确理解。',
    icon: 'Layers',
    colorTone: 'rose',
    workplaceApplication: '确保需求在敏捷双周迭代中高品质交付上线。'
  }
];

export const WORKPLACE_DOCUMENTS: WorkplaceDoc[] = [
  {
    id: 'doc-user-feedback',
    title: '用户反馈工单抽样_Q3.doc',
    fileType: 'doc',
    fileSize: '420 KB',
    tag: '定性声音',
    summary: '汇集了200条一星差评与高频投诉工单的语义聚类',
    content: [
      {
        type: 'heading',
        text: '用户高频痛点语义聚类报告'
      },
      {
        type: 'paragraph',
        text: '对近期App Store与内嵌工单系统的214条负向反馈进行聚类分析，核心问题集中在以下三类：'
      },
      {
        type: 'bullet',
        items: [
          '痛点 1 (占比 46%)：问短句时回答又长又空，套话连篇，没有直接给出结论。',
          '痛点 2 (占比 32%)：输入包含专业背景的问题时，AI没有追问细节就盲目瞎猜。',
          '痛点 3 (占比 22%)：生成的表格和代码格式混乱，缺少一键复制和导出支持。'
        ]
      },
      {
        type: 'callout',
        text: '典型用户原声：“我只是想问一个简短的公式，它给我写了三段背景介绍，我还要往下拉半天才能找到答案！”'
      }
    ]
  },
  {
    id: 'doc-log-trace',
    title: 'Badcase调用日志样本.json',
    fileType: 'json',
    fileSize: '1.2 MB',
    tag: '技术Trace',
    summary: '100组高重新生成率会话的Prompt与LLM返回记录',
    content: [
      {
        type: 'heading',
        text: '大模型调用链与耗时分析 (Trace Sample)'
      },
      {
        type: 'paragraph',
        text: '通过链路追踪抓取高频重新生成（Regenerate）的典型失败Case：'
      },
      {
        type: 'code',
        text: `{\n  "trace_id": "req_88921_ai_pm",\n  "user_input": "帮我看看这个方案怎么改",\n  "intent_detected": "GENERAL_CHAT", // 错误：未识别出PRD优化意图\n  "system_prompt_version": "v1.4_verbose",\n  "first_token_latency": 1420,\n  "total_tokens": 1280,\n  "user_action": "THUMB_DOWN_AND_RETRY",\n  "issue_diagnosis": "缺少主动追问方案上下文的澄清机制"\n}`
      },
      {
        type: 'callout',
        text: '技术发现：当前System Prompt中“详尽回答”的权重过高，导致所有查询均输出超长篇幅。'
      }
    ]
  },
  {
    id: 'doc-metrics-funnel',
    title: '留存与会话流失漏斗_Aug.csv',
    fileType: 'csv',
    fileSize: '84 KB',
    tag: '数据监控',
    summary: '用户会话各轮次跳出率与满意度折线图',
    content: [
      {
        type: 'heading',
        text: '多轮对话留存与满意度漏斗'
      },
      {
        type: 'table',
        tableData: {
          headers: ['对话轮次', '进入UV', '满意点赞率', '重新生成率', '直接跳出率'],
          rows: [
            ['第 1 轮', '100,000', '68.2%', '14.5%', '21.0%'],
            ['第 2 轮', '79,000', '52.1%', '28.4%', '34.8%'],
            ['第 3 轮', '42,000', '39.4%', '42.1%', '58.2%'],
            ['第 4 轮及以上', '18,500', '31.0%', '49.8%', '71.5%']
          ]
        }
      },
      {
        type: 'callout',
        text: '核心结论：用户在第2-3轮由于AI回答偏离，重新生成率飙升至42%，形成断崖式流失。'
      }
    ]
  },
  {
    id: 'doc-benchmark-pdf',
    title: '行业Top产品交互Benchmark.pdf',
    fileType: 'pdf',
    fileSize: '3.4 MB',
    tag: '竞品拆解',
    summary: '头部产品（ChatGPT, Claude, Notion AI）的交互方案拆解',
    content: [
      {
        type: 'heading',
        text: '优秀人机协作交互实践提炼'
      },
      {
        type: 'bullet',
        items: [
          '渐进式展开：默认输出精简核心结论，提供“展开详细依据”折叠块。',
          '主动澄清卡片：当检测到Query歧义时，展示2-3个快捷选项（Pill Tags）让用户一键点击。',
          '微反馈闭环：提供行内高亮批注与“更简洁 / 更深入”快速微调按钮。'
        ]
      },
      {
        type: 'callout',
        text: '设计启发：将传统单一的“打字机纯文本”升级为“结构化卡片 + 意图澄清芯片”。'
      }
    ]
  },
  {
    id: 'doc-system-prompt',
    title: '线上System_Prompt配置_v1.4.md',
    fileType: 'doc',
    fileSize: '156 KB',
    tag: 'Prompt工程',
    summary: '当前线上运行的大模型系统指令与参数设置',
    content: [
      {
        type: 'heading',
        text: 'Production System Prompt (v1.4_verbose)'
      },
      {
        type: 'paragraph',
        text: '当前线上部署在网关层的系统级指令（System Directive）如下：'
      },
      {
        type: 'code',
        text: `### System Instruction:\nYou are an expert assistant. Always provide comprehensive, thorough, and exhaustive explanations for every user query. Do not leave out any background details or introductory context.\n\n### Parameters:\n- Temperature: 0.7\n- Top_P: 0.95\n- Max_Output_Tokens: 4096\n\n### Defect Analysis:\n缺少对短Query意图的字数约束限制，缺少主动追问判断规则，导致所有对话均进入详尽发散模式。`
      },
      {
        type: 'callout',
        text: '优化建议：增加 Few-shot 分流示例，针对事实速答类问题强制启用「结论先行」格式约束。'
      }
    ]
  },
  {
    id: 'doc-roi-calc',
    title: '业务Q3目标与算力ROI测算.sheet',
    fileType: 'csv',
    fileSize: '95 KB',
    tag: '商业ROI',
    summary: '模型Token调用成本与留存转化收益量化模型',
    content: [
      {
        type: 'heading',
        text: 'Token调用成本与留存收益测算'
      },
      {
        type: 'table',
        tableData: {
          headers: ['指标项', '现状 (v1.4)', '优化预期 (v2.0)', '预期变动'],
          rows: [
            ['单次请求平均Token数', '1,280 Tokens', '520 Tokens', '↓ 59.3%'],
            ['首字响应延迟 (TTFT)', '1,420 ms', '650 ms', '↓ 54.2%'],
            ['月度算力成本 (GPU Cloud)', '¥ 186,000', '¥ 82,000', '↓ ¥ 104,000 /月'],
            ['第2轮会话留存率', '52.1%', '74.5%', '↑ 22.4%'],
            ['付费转化ROI', '1.42x', '2.85x', '↑ 100.7%']
          ]
        }
      },
      {
        type: 'callout',
        text: '商业归因：通过精简Prompt与意图速答分流，每月可节省超10万元算力，同时大幅提升留存。'
      }
    ]
  }
];

export const STAGE_TWO_SIMULATION: SimulationTask = {
  id: 'stage2-task-pm',
  roleTitle: 'AI产品经理探索',
  stageName: '阶段2：真实模拟',
  currentTaskTitle: '优化AI助手用户体验',
  projectBackground: '目前AI助手存在回答不准确、缺乏澄清机制的问题，用户第2轮会话跳出率高达34.8%，满意度持续下滑。',
  mission: '分析问题原因，提出一次完整的产品优化方案（PRD/设计建议）。',
  requirements: [
    '找出核心问题（根据工单与日志定位Top痛点）',
    '提出优化方向（包含意图理解、Prompt与交互形式）',
    '说明设计理由（阐述用户价值与可落地的ROI收益）'
  ],
  docs: WORKPLACE_DOCUMENTS,
  suggestedPrompts: [
    '【提纲一键填入】生成标准AI产品优化PRD模版',
    '【痛点提炼】结合工单与日志快速总结核心原因',
    '【交互方案】设计“主动追问澄清”与“结论先行”交互卡片'
  ],
  mentorTip: '你可以先查看左侧资料区，如果需要，我可以帮助你理解任务和推导方案。'
};

export const CAREER_WIKI_ENTRIES = [
  {
    role: 'AI产品经理 (AI PM)',
    match: '96% 匹配度',
    description: '负责将前沿大语言模型与多模态能力转化为用户可感知的杀手级应用，平衡模型幻觉、Token成本与用户心智。',
    cityDistribution: '北京 (38%)、上海 (26%)、深圳 (20%)、杭州 (12%)',
    salaryRange: '25k~45k · 15~18薪 (年薪 35w~80w)',
    companyTypes: {
      bigTech: '互联网大厂：重点考核 Badcase 归因体系、灰度实验平台与单位用户算力成本把控。',
      unicorn: 'AI独角兽：要求全链路 Prompt/RAG/Agent 编排与行业痛点极其敏锐的原型交付。',
      startup: '初创企业：强调极速验证 MVP、兼顾市场获客与商业化定价闭环。'
    },
    coreSkills: ['意图建模与场景定义', 'Prompt/RAG/Agent链路架构', 'Badcase量化评测体系', '人机交互心智设计'],
    careerPath: '初级AI产品助理 → 场景AI PM → 垂类大模型业务Owner → 创新业务合伙人',
    citation: {
      source: '2026年中国AI前沿人才市场洞察报告 & 全网真实在招JD样本库 (N=4,820)',
      updatedAt: '2026年3月'
    }
  },
  {
    role: 'AI交互体验设计师 (UX/Agent Designer)',
    match: '88% 匹配度',
    description: '重新定义AI时代的人机交互模式，从传统GUI向LUI与智能体协同演进，设计流式加载、主动澄清与拟人反馈。',
    cityDistribution: '上海 (34%)、北京 (30%)、深圳 (22%)、广州/杭州 (14%)',
    salaryRange: '20k~38k · 14~16薪 (年薪 28w~60w)',
    companyTypes: {
      bigTech: '互联网大厂：负责设计全公司统一的 Agent 交互设计系统规范与多模态微交互。',
      unicorn: 'AI独角兽：打磨下一代生产力工具的画布与卡片流，追求极致丝滑。',
      startup: '初创企业：一人包揽从品牌视觉、原型动效到用户可用性走查。'
    },
    coreSkills: ['意图澄清界面设计', '实时流式动画与等待反馈', '多模态输入融合', '容错与信任机制构建'],
    careerPath: 'UI/UX设计师 → AI体验架构师 → 交互创新专家',
    citation: {
      source: '2026全球生成式交互体验趋势报告 (IXDC)',
      updatedAt: '2026年2月'
    }
  },
  {
    role: '数据与增长策略专家 (AI Growth)',
    match: '82% 匹配度',
    description: '通过数据挖掘用户对话与流失漏斗，通过精细化策略驱动模型对话深度、留存与付费转化。',
    cityDistribution: '北京 (35%)、深圳 (30%)、杭州 (22%)、上海 (13%)',
    salaryRange: '22k~40k · 15~17薪 (年薪 32w~68w)',
    companyTypes: {
      bigTech: '互联网大厂：主导十亿级请求的用户会话流失归因、A/B分流与Token消耗ROI模型。',
      unicorn: 'AI独角兽：通过自驱的增长黑客手段引爆海内外社媒传播与PLG产品驱动增长。',
      startup: '初创企业：通过精细化社群运营与KOL矩阵实现低成本获客。'
    },
    coreSkills: ['会话漏斗归因', 'A/B实验平台设计', '用户生命周期分层', 'ROI投入产出量化'],
    careerPath: '增长分析师 → 策略产品经理 → 商业化总监',
    citation: {
      source: '2026科技公司商业化与增长策略人才调研',
      updatedAt: '2026年3月'
    }
  }
];

export const COMPLETED_TRIAL_TASKS: CompletedTrialTask[] = [
  {
    id: 'trial-task-1',
    taskTitle: '优化AI助手用户体验 (PRD与交互重构)',
    targetRole: 'AI产品经理 (AI PM)',
    category: '产品策略 & 交互交付',
    completedAt: '2026-03-15 16:40',
    timeSpent: '28 分钟',
    score: 96,
    grade: 'S',
    summary: '深入分析46%长回答差评与第2轮流失漏斗，提出结论先行原则、意图澄清Pill芯片与Prompt分流架构，ROI测算极具说服力。',
    mission: '基于线上200条工单与日志Trace，重构AI助手在模糊query下的交互体验与System Prompt架构。',
    scenario: '某头部智能知识库AI助手，用户第2轮会话跳出率高达34.8%，大量反馈“套话连篇、不知所云”。',
    userSubmission: {
      coreProblem: '工单分析显示46%用户抱怨短句回答冗长且不直奔主题；日志分析显示GENERAL_CHAT未进行意图识别；多轮漏斗中第2轮流失率高达34.8%。',
      proposedSolution: '1. 引入意图识别分流网关：精准区分速答问询与深度推演；\n2. 交互重构：设计结论先行+折叠依据卡片，提供快捷澄清Pill Tags；\n3. System Prompt重构：建立Few-shot规则，设置温度参数0.3并限制速答最大Token。',
      roiAnalysis: '单次请求平均Token数下降59.3%（从1280降至520），首字延迟从1.42s降至0.65s，月度算力成本节省¥10.4万，次轮留存提升22.4%。',
      keyDeliverables: [
        '《AI助手v2.0交互重构PRD及分支状态说明》',
        '《System Prompt v2.0工程规范与Few-shot样例》',
        '《业务Q3算力成本与留存ROI测算模型》'
      ]
    },
    radarScores: [
      { dimension: '用户同理与痛点洞察', score: 98, description: '精准命中46%冗长回答抱怨，提出结论先行原则' },
      { dimension: 'AI架构与技术理解', score: 94, description: '提出意图识别分流与Prompt降耗，技术可行性高' },
      { dimension: '交互体验与微创新', score: 96, description: '引入主动追问澄清Pill芯片，显著提升人机交互流畅度' },
      { dimension: '商业价值与ROI度量', score: 95, description: '清晰量化Token降本25%与留存提升目标，具备商业闭环' }
    ],
    earnedCards: [
      {
        id: 'card-user-insight',
        title: '用户洞察与深度访谈',
        category: '洞察分析',
        description: '从分散负反馈中提炼核心真实痛点与动机',
        detail: '经由AI产品任务模拟实战验证，获得实战证据支持。',
        icon: 'UserCheck',
        colorTone: 'purple'
      },
      {
        id: 'card-problem-decompose',
        title: '问题拆解与归因分析',
        category: '产品策略',
        description: '将模糊业务命题拆解为可量化定位的逻辑树',
        detail: '经由AI产品任务模拟实战验证，获得实战证据支持。',
        icon: 'GitBranch',
        colorTone: 'blue'
      },
      {
        id: 'card-prd-pro',
        title: 'AI产品落地与PRD交付',
        category: '协作沟通',
        description: '将大模型能力转化为清晰的高质量PRD与人机交互规格说明',
        detail: '具备完整的架构分流定义、主动澄清卡片交互与ROI度量能力。',
        icon: 'Award',
        colorTone: 'emerald'
      }
    ],
    mentorComment: '结构极其清晰！兼备业务敏锐度与技术落地严谨性。不仅发现了定性抱怨，更通过定量漏斗证实了问题规模，给出的PRD方案研发团队可以直接拉会评审。',
    reflectionNotes: '在处理多轮对话交互时，不应单纯追求模型的“详尽解释”，而应以用户当前认知负荷为第一准则。'
  },
  {
    id: 'trial-task-2',
    taskTitle: '智能客服冷启动与意图澄清机制设计',
    targetRole: 'AI交互体验设计师 (UX/Agent Designer)',
    category: '人机交互 & 澄清策略',
    completedAt: '2026-03-12 11:15',
    timeSpent: '22 分钟',
    score: 91,
    grade: 'A+',
    summary: '针对用户输入模糊、歧义时的交互断层，设计渐进式澄清卡片与流式状态机，有效降低受挫流失。',
    mission: '设计一套在用户输入歧义时主动追问与提供选项的交互规范与UI组件。',
    scenario: '电商大促期间智能客服日均百万级咨询，大量用户输入“怎么退”、“优惠券没生效”等模糊短语导致Bot答非所问。',
    userSubmission: {
      coreProblem: '传统Bot在歧义时直接返回长文本菜单，阅读成本极高；用户无法直观辨识哪一条符合自己情况，导致跳出。',
      proposedSolution: '1. 渐进式追问：提供不超过3个高频场景气泡按键；\n2. 流式加载动画：展示“正在为您核对订单状态...”增强确定感；\n3. 快速转人工兜底入口与一键撤销机制。',
      roiAnalysis: '用户歧义解决时间缩短40%，转人工排队压力降低28%，客户好评率由72%上升至86%。',
      keyDeliverables: [
        '《智能客服意图澄清交互组件库规范》',
        '《异常与超时兜底状态机流程图》'
      ]
    },
    radarScores: [
      { dimension: '用户同理与痛点洞察', score: 92, description: '深刻理解用户急躁情绪下的交互偏好' },
      { dimension: 'AI架构与技术理解', score: 88, description: '对置信度阈值与分支逻辑有清晰定义' },
      { dimension: '交互体验与微创新', score: 95, description: '气泡交互与微反馈细节处理非常细腻' },
      { dimension: '商业价值与ROI度量', score: 89, description: '有效量化了客服人力成本节省与满意度提升' }
    ],
    earnedCards: [
      {
        id: 'card-ux-flow',
        title: '渐进式交互与流式反馈',
        category: '交互体验',
        description: '设计低认知负荷的LUI与GUI融合交互',
        detail: '经由智能客服任务演练验证。',
        icon: 'Sparkles',
        colorTone: 'purple'
      },
      {
        id: 'card-data-driven',
        title: '数据驱动',
        category: '数据驱动',
        description: '用量化指标指导产品迭代与收益归因',
        detail: '建立转化漏斗与满意度评估。',
        icon: 'LineChart',
        colorTone: 'amber'
      }
    ],
    mentorComment: '对用户情绪和交互细节的把控非常出色，澄清卡片的设计有效化解了AI模型的不确定性。',
    reflectionNotes: 'GUI的确定性与LUI的灵活性结合，是未来AI应用的最佳形态。'
  }
];

export const USER_PAST_EXPERIENCES: UserExperienceRecord[] = [
  {
    id: 'exp-1',
    title: '在线教育SaaS中台交互与增长项目',
    role: '产品实习生 / 助理PM',
    period: '2025.06 - 2025.12',
    description: '负责B端教师工作台体验优化与课后AI助教功能调研，主导了30+位一线教师的深度访谈，推动作业批改流转耗时缩短35%。',
    extractedCardsCount: 3,
    tags: ['B端产品', '用户访谈', '流程优化', '数据漏斗']
  },
  {
    id: 'exp-2',
    title: '高校AI创新工坊 - 校园日程助手原型',
    role: '项目发起人 & 交互设计',
    period: '2024.09 - 2025.03',
    description: '使用大模型API和Prompt工程开发校园社团活动聚合助手，设计了对话式日程提取与一键日历同步，服务了全校超1,200名学生。',
    extractedCardsCount: 2,
    tags: ['LLM应用', 'Prompt工程', '0到1原型', '校园项目']
  }
];
