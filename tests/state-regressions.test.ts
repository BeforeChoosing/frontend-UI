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

test('演示业务不复用正式账号身份或能力库', () => {
  assert.match(appSource, /useProfileCards\(appMode === 'use' && auth\.isLoggedIn, auth\.user\?\.id\)/);
  assert.match(appSource, /isLoggedIn=\{appMode === 'use' && auth\.isLoggedIn\}/);
  assert.match(appSource, /userId=\{appMode === 'use' \? auth\.user\?\.id : undefined\}/);
  assert.match(appSource, /const visibleAuth: UserAuth = appMode === 'use' \? auth : \{ isLoggedIn: false \}/);
});

test('退出时先清理前端账号态，再等待服务端撤销', () => {
  const logoutStart = appSource.indexOf('const handleLogout = async () =>');
  const logoutEnd = appSource.indexOf('\n  };', logoutStart);
  const logoutSource = appSource.slice(logoutStart, logoutEnd);

  assert.ok(logoutStart >= 0);
  assert.ok(logoutSource.indexOf('setAuth({ isLoggedIn: false })') < logoutSource.indexOf('await logoutRequest'));
  assert.match(logoutSource, /setUnlockedCards\(\[\]\)/);
  assert.match(logoutSource, /setPendingScreen\(null\)/);
});

test('演示探索方向初始为空，由一键装配填充能力卡', () => {
  assert.doesNotMatch(appSource, /careerSelectedCardIds: demoSelectedCards\.map\(card => card\.id\)/);
  assert.match(appSource, /setCareerSelectedCardIds\(\[\]\)/);
  const exploreSource = readFileSync(new URL('../src/components/CareerExploreScreen.tsx', import.meta.url), 'utf8');
  assert.match(exploreSource, /const \[deckSlots, setDeckSlots\] = useState[\s\S]*?null,\s*null,\s*null,\s*null/);
  assert.match(exploreSource, /const handleFastEquip = \(\) => \{/);
});

test('03 末步使用单一作答框，提交评价使用同步弹簧过渡', () => {
  const workbenchSource = readFileSync(new URL('../src/components/TrialWorkbenchScreen.tsx', import.meta.url), 'utf8');
  const trialSource = readFileSync(new URL('../src/components/DynamicTrialTaskScreen.tsx', import.meta.url), 'utf8');

  assert.doesNotMatch(workbenchSource, /处理决定|调整依据|onEventDecisionChange|onEventResponseChange/);
  assert.doesNotMatch(trialSource, /onEventDecisionChange|onEventResponseChange/);
  assert.match(workbenchSource, /提交任务并评价/);
  assert.match(trialSource, /<AnimatePresence initial=\{false\} mode="sync">/);
  assert.match(trialSource, /key="evaluation"[\s\S]*?type: 'spring'/);
});

test('示例体验入口使用弹窗约定的启动回调', () => {
  assert.match(appSource, /<ExampleShowcaseModal[\s\S]*?onStartExample=\{\(\) =>/);
  assert.doesNotMatch(appSource, /<ExampleShowcaseModal[\s\S]*?onTryExperience=/);
});
