export default function SettingRow({ label, description, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-3 border-b border-axiom-border/60 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <label htmlFor={htmlFor} className="text-sm font-medium text-axiom-text">
          {label}
        </label>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-axiom-muted">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
