import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function TelemetryModal({ open, title, narrative, packet, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-lg"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="axiom-glass axiom-glow max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-axiom-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-axiom-border px-5 py-3">
          <div>
            <h2 className="text-sm font-bold text-axiom-green">{title ?? "AI Coach Analysis"}</h2>
            {packet && (
              <p className="text-[10px] text-axiom-muted">
                {packet.agent_name} · {packet.status}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-axiom-muted transition hover:bg-axiom-green/10 hover:text-axiom-green"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="axiom-scroll max-h-[calc(80vh-4rem)] overflow-y-auto px-5 py-4">
          {narrative ? (
            <article className="prose prose-invert prose-sm max-w-none prose-headings:text-axiom-green prose-p:text-axiom-text prose-strong:text-axiom-green prose-a:text-axiom-green prose-code:text-axiom-green prose-pre:bg-axiom-bg prose-pre:border prose-pre:border-axiom-border">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{narrative}</ReactMarkdown>
            </article>
          ) : (
            <p className="text-sm text-axiom-muted">Coach narrative pending…</p>
          )}
        </div>
      </div>
    </div>
  );
}
