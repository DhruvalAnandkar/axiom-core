import { useCallback } from "react";

/* Card with a cursor-tracking radial highlight (see .axiom-spotlight). */
export default function SpotlightCard({ children, className = "" }) {
  const onMove = useCallback((e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);
  return (
    <div onMouseMove={onMove} className={`axiom-spotlight ${className}`}>
      {children}
    </div>
  );
}
