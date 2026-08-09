// The pointer as a genuine second light source: writes --pointer-x/y (for
// background-position use) and --pointer-x-frac/y-frac (0-1, for calc()-
// based effects) plus --pointer-active, which CSS reads to catch a
// specular edge on cards and headlines. Touch devices get device
// orientation instead, at reduced amplitude, per the build spec.
//
// The smoothing loop only runs while values are still settling — it starts
// on the next input event and stops itself once close enough to target,
// rather than ticking forever at 60fps for a value that isn't moving.

const TOUCH_AMPLITUDE = 0.35;
const SMOOTHING = 0.15;
const SETTLE_EPSILON = 0.0006;

export function initPointerLight() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const root = document.documentElement;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  let targetX = 0.5;
  let targetY = 0.5;
  let target_active = 0;
  let currentX = 0.5;
  let currentY = 0.5;
  let currentActive = 0;
  let animating = false;

  function applyFrame() {
    currentX += (targetX - currentX) * SMOOTHING;
    currentY += (targetY - currentY) * SMOOTHING;
    currentActive += (target_active - currentActive) * SMOOTHING;

    root.style.setProperty('--pointer-x', `${(currentX * 100).toFixed(2)}vw`);
    root.style.setProperty('--pointer-y', `${(currentY * 100).toFixed(2)}vh`);
    root.style.setProperty('--pointer-x-frac', currentX.toFixed(4));
    root.style.setProperty('--pointer-y-frac', currentY.toFixed(4));
    root.style.setProperty('--pointer-active', currentActive.toFixed(3));

    const settled =
      Math.abs(targetX - currentX) < SETTLE_EPSILON &&
      Math.abs(targetY - currentY) < SETTLE_EPSILON &&
      Math.abs(target_active - currentActive) < SETTLE_EPSILON;

    if (settled) {
      animating = false;
      return;
    }
    requestAnimationFrame(applyFrame);
  }

  function kick() {
    if (!animating) {
      animating = true;
      requestAnimationFrame(applyFrame);
    }
  }

  if (!isCoarsePointer) {
    window.addEventListener(
      'pointermove',
      (event) => {
        targetX = event.clientX / window.innerWidth;
        targetY = event.clientY / window.innerHeight;
        target_active = 1;
        kick();
      },
      { passive: true }
    );

    document.addEventListener('pointerleave', () => {
      target_active = 0;
      kick();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        target_active = 0;
        kick();
      }
    });
  } else {
    initDeviceOrientation(
      (x, y) => {
        targetX = x;
        targetY = y;
        target_active = 0.7;
        kick();
      }
    );
  }
}

function initDeviceOrientation(onOrientation) {
  const enable = () => {
    window.addEventListener('deviceorientation', (event) => {
      if (event.beta === null || event.gamma === null) return;
      const gamma = Math.max(-45, Math.min(45, event.gamma));
      const beta = Math.max(0, Math.min(90, event.beta));
      const x = 0.5 + (gamma / 45) * 0.5 * TOUCH_AMPLITUDE;
      const y = 0.5 + ((beta - 45) / 45) * 0.5 * TOUCH_AMPLITUDE;
      onOrientation(x, y);
    });
  };

  const DeviceOrientationEventCtor = window.DeviceOrientationEvent;
  if (DeviceOrientationEventCtor && typeof DeviceOrientationEventCtor.requestPermission === 'function') {
    const onFirstTouch = () => {
      DeviceOrientationEventCtor.requestPermission()
        .then((state) => {
          if (state === 'granted') enable();
        })
        .catch(() => {});
      window.removeEventListener('touchend', onFirstTouch);
    };
    window.addEventListener('touchend', onFirstTouch, { once: true, passive: true });
  } else if ('DeviceOrientationEvent' in window) {
    enable();
  }
}
