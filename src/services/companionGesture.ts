/** Keep drag suppression until the next press, not merely until drag-end. */
export function createCompanionGesture() {
  let origin: { clientX: number; clientY: number; pointerId: number } | null = null;
  let dragged = false;
  return {
    begin(point: { clientX: number; clientY: number; pointerId: number }) {
      origin = { clientX: point.clientX, clientY: point.clientY, pointerId: point.pointerId };
      dragged = false;
    },
    move(point: { clientX: number; clientY: number; pointerId: number }) {
      if (!origin || origin.pointerId !== point.pointerId) return;
      if (Math.hypot(point.clientX - origin.clientX, point.clientY - origin.clientY) >= 3) dragged = true;
    },
    markDragged() { dragged = true; },
    shouldOpen(clickDetail: number) {
      // Keyboard and assistive-technology activation have no pointer click count.
      return clickDetail === 0 || !dragged;
    },
  };
}
