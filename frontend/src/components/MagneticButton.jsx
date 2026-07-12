import { useMagnetic } from "../hooks/useMagnetic.js";

export default function MagneticButton({ className = "", children, ...props }) {
  const magnetic = useMagnetic();

  return (
    <button type="button" {...props} {...magnetic} className={`axiom-magnetic ${className}`}>
      {children}
    </button>
  );
}
