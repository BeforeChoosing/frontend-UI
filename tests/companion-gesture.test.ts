import assert from 'node:assert/strict';
import test from 'node:test';
import { createCompanionGesture } from '../src/services/companionGesture';

const point = (clientX: number, clientY: number, pointerId = 1) => ({ clientX, clientY, pointerId });

test('陪伴单击和轻微抖动仍可打开', () => {
  const gesture = createCompanionGesture();
  gesture.begin(point(100, 100));
  gesture.move(point(101, 101));
  assert.equal(gesture.shouldOpen(1), true);
});

test('陪伴拖动后松手产生的 click 不打开面板', () => {
  const gesture = createCompanionGesture();
  gesture.begin(point(100, 100));
  gesture.move(point(130, 120));
  assert.equal(gesture.shouldOpen(1), false);
  assert.equal(gesture.shouldOpen(2), false);
});

test('拖出再回到起点仍视为拖动，不当成单击', () => {
  const gesture = createCompanionGesture();
  gesture.begin(point(100, 100));
  gesture.move(point(104, 100));
  gesture.move(point(100, 100));
  assert.equal(gesture.shouldOpen(1), false);
});

test('拖动完成后下一次独立点击可以打开', () => {
  const gesture = createCompanionGesture();
  gesture.begin(point(100, 100));
  gesture.markDragged();
  assert.equal(gesture.shouldOpen(1), false);
  gesture.begin(point(140, 120));
  assert.equal(gesture.shouldOpen(1), true);
});

test('拖动拦截不影响键盘与辅助技术激活', () => {
  const gesture = createCompanionGesture();
  gesture.markDragged();
  assert.equal(gesture.shouldOpen(0), true);
});

test('忽略其他指针的移动，保留当前手势判断', () => {
  const gesture = createCompanionGesture();
  gesture.begin(point(100, 100));
  gesture.move(point(200, 200, 2));
  assert.equal(gesture.shouldOpen(1), true);
});
