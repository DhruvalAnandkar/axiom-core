export default function DocsPage() {
  return (
    <div className="axiom-gradient-bg min-h-screen px-6 py-12">
      <article className="prose-axiom mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-axiom-text">How Axiom works</h1>
        <ol className="mt-6 space-y-4 text-sm text-axiom-muted">
          <li><strong className="text-axiom-text">1. Aim</strong> — Click cue ball, object ball, and pocket — or load a preset shot.</li>
          <li><strong className="text-axiom-text">2. Physics</strong> — Engine computes ghost ball, cut angle, and vectors deterministically.</li>
          <li><strong className="text-axiom-text">3. Render</strong> — Socket.io broadcasts vector_data immediately via agent_state_update.</li>
          <li><strong className="text-axiom-text">4. Coach</strong> — Optional LangGraph pipeline narrates the shot and assesses risk.</li>
          <li><strong className="text-axiom-text">5. Review</strong> — The AI Coach panel summarizes the verdict, difficulty, and narrated analysis.</li>
        </ol>
        <p className="mt-8 text-xs text-axiom-muted">Stack: React + Vite · Node/Socket.io · FastAPI/LangGraph · Python physics core</p>
      </article>
    </div>
  );
}
