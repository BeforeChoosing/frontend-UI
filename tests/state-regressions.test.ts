import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  createCareerSelectionSignature,
  isCareerRecommendationCurrent,
} from '../src/services/careerRecommendationState';
import type { SkillCard } from '../src/types';

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');

const cards: SkillCard[] = [
  {
    id: 'card-1',
    title: '用户洞察',
    category: '洞察分析',
    description: '识别用户问题',
    detail: '通过访谈与数据交叉验证',
    icon: 'Search',
    colorTone: 'emerald',
    workplaceApplication: '需求分析',
  },
  {
    id: 'card-2',
    title: '指标设计',
    category: '数据驱动',
    description: '定义可验证指标',
    detail: '将目标拆成可观测信号',
    icon: 'Chart',
    colorTone: 'blue',
    workplaceApplication: '实验评估',
  },
];

test('职业建议仅在能力卡 ID 与内容均未变化时有效', () => {
  const signature = createCareerSelectionSignature(cards);

  assert.equal(isCareerRecommendationCurrent(signature, cards), true);
  assert.equal(isCareerRecommendationCurrent(signature, cards.slice(0, 1)), false);
  assert.equal(
    isCareerRecommendationCurrent(signature, [
      { ...cards[0], title: '已更新的用户洞察' },
      cards[1],
    ]),
    false,
  );
});

test('能力卡顺序变化会使旧请求结果失效', () => {
  const requestSignature = createCareerSelectionSignature(cards);
  const currentSignature = createCareerSelectionSignature([...cards].reverse());

  assert.notEqual(requestSignature, currentSignature);
  assert.equal(requestSignature === currentSignature, false);
});

test('演示确认卡池不读取或修改正式模式能力卡状态', () => {
  assert.match(
    appSource,
    /allAccumulatedCards=\{appMode === 'demo' \? demoUnlockedCards : unlockedCards\}/,
  );
  assert.match(
    appSource,
    /if \(appMode === 'demo'\) \{\s*setDemoUnlockedCards\(prev => mergeCardsById\(prev, newCards\)\)/,
  );
  assert.match(appSource, /key=\{`verify-cards-\$\{appMode\}-\$\{demoReplayId\}`\}/);
  assert.doesNotMatch(
    appSource,
    /if \(appMode === 'demo'\) \{\s*setUnlockedCards\(prev => mergeCardsById\(prev, newCards\)\)/,
  );
});
