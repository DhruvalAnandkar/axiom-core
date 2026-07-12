export default function Toggle({ id, checked, onChange, disabled }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full border transition disabled:opacity-50 ${
        checked
          ? "border-axiom-green/50 bg-axiom-green/25"
          : "border-axiom-border bg-axiom-surface"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-axiom-text shadow transition ${
          checked ? "left-[1.35rem]" : "left-0.5"
        }`}
      />
    </button>
  );
}
