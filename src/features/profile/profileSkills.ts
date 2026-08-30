export type ProfileSkillId = 'extract' | 'experience' | 'target';

export type ProfileSkillDefinition = {
  id: ProfileSkillId;
  command: `/${ProfileSkillId}`;
  name: string;
  description: string;
  requiresEvidence: boolean;
  outcome: 'candidate-cards' | 'material-evidence' | 'target-context';
};

/**
 * ProfileAgent 的可调用能力清单。
 *
 * Skill 只负责声明触发方式、输入前置条件与输出边界；具体执行仍复用
 * 现有材料解析、目标岗位和候选卡链路，避免建立第二套业务逻辑。
 */
export const PROFILE_SKILLS: readonly ProfileSkillDefinition[] = [
  {
    id: 'extract',
    command: '/extract',
    name: '提炼能力卡',
    description: '基于当前已提供的证据生成候选能力卡',
    requiresEvidence: true,
    outcome: 'candidate-cards',
  },
  {
    id: 'experience',
    command: '/experience',
    name: '引用项目经历',
    description: '从附件补充简历或项目材料',
    requiresEvidence: false,
    outcome: 'material-evidence',
  },
  {
    id: 'target',
    command: '/target',
    name: '对齐目标岗位',
    description: '设置或修改能力分析的目标岗位',
    requiresEvidence: false,
    outcome: 'target-context',
  },
] as const;

export function findProfileSkill(command: string): ProfileSkillDefinition | undefined {
  return PROFILE_SKILLS.find(skill => skill.command === command.trim().toLowerCase());
}
