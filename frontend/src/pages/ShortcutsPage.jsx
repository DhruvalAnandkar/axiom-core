import { motion } from "framer-motion";
import { Keyboard } from "lucide-react";
import UserHubNav from "../components/user/UserHubNav.jsx";

const SHORTCUTS = [
  {
    area: "Workspace table",
    items: [
      { keys: ["Click × 3"], action: "Set cue ball, object ball, then pocket" },
      { keys: ["Esc"], action: "Undo last aim click" },
      { keys: ["Enter"], action: "Compute the current shot" },
      { keys: ["N"], action: "Start a new shot (clear aim)" },
    ],
  },
  {
    area: "Navigation",
    items: [
      { keys: ["—"], action: "Use the top nav: Workspace, Camera, Watch, Train, Docs" },
      { keys: ["Avatar"], action: "Open account menu → Profile or Settings" },
    ],
  },
  {
    area: "Share & drill links",
    items: [
      { keys: ["URL"], action: "Workspace URLs carry cue/obj/pocket coords — bookmark or share shots" },
      { keys: ["Train"], action: "Drill cards deep-link into the workspace with preset positions" },
    ],
  },
];

function Key({ children }) {
  return (
    <kbd className="rounded-md border border-axiom-border bg-axiom-surface px-2 py-0.5 font-mono text-[11px] text-axiom-text">
      {children}
    </kbd>
  );
}

export default function ShortcutsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside>
            <UserHubNav />
          </aside>
          <div>
            <header className="mb-8">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-axiom-green">
                <Keyboard className="h-3.5 w-3.5" /> Reference
              </p>
              <h1 className="mt-2 text-2xl font-bold text-axiom-text">Keyboard shortcuts</h1>
              <p className="mt-2 text-sm text-axiom-muted">
                Quick actions on the table and around the app.
              </p>
            </header>

            <div className="space-y-5">
              {SHORTCUTS.map((group, gi) => (
                <motion.div
                  key={group.area}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.06 }}
                  className="axiom-glass rounded-2xl border border-axiom-border p-5"
                >
                  <h2 className="mb-3 text-sm font-semibold text-axiom-text">{group.area}</h2>
                  <ul className="space-y-3">
                    {group.items.map((item) => (
                      <li
                        key={item.action}
                        className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="text-xs text-axiom-muted">{item.action}</span>
                        <span className="flex flex-wrap gap-1.5">
                          {item.keys.map((k) => (
                            <Key key={k}>{k}</Key>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
    </div>
  );
}
