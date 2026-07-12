import { useCallback, useRef } from "react";

/** Button follows the cursor a few px within its bounds, springs back on leave. */
export function useMagnetic(strength = 0.25, scale = 1.04) {
  const ref = useRef(null);

  const onMouseMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transition = "transform 0.1s ease-out";
      el.style.transform = `translate(${(dx * strength).toFixed(1)}px, ${(dy * strength).toFixed(1)}px) scale(${scale})`;
    },
    [strength, scale],
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform = "translate(0, 0) scale(1)";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
