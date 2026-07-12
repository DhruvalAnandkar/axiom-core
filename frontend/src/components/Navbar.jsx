import { NavLink, Link } from "react-router-dom";
import { BookOpen, GraduationCap, Zap } from "lucide-react";
import AccountMenu from "./AccountMenu.jsx";

const link = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-xs font-medium transition ${
    isActive ? "bg-axiom-green/10 text-axiom-green" : "text-axiom-muted hover:text-axiom-text"
  }`;

export default function Navbar({ right }) {
  return (
    <header className="axiom-glass z-20 shrink-0 border-b border-axiom-border px-4 py-3 sm:px-6 axiom-nav-bar">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-axiom-green to-axiom-green-dim">
            <Zap className="h-4 w-4 text-axiom-bg" />
          </div>
          <span className="font-bold text-axiom-text">Axiom</span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/workspace" className={link}>Workspace</NavLink>
          <NavLink to="/camera" className={link}>Camera Setup</NavLink>
          <NavLink to="/watch" className={link}>
            <span className="flex items-center gap-1.5">
              Watch
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
            </span>
          </NavLink>
          <NavLink to="/learn" className={link}>
            <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> Train</span>
          </NavLink>
          <NavLink to="/docs" className={link}>
            <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> Docs</span>
          </NavLink>
        </nav>
        <div className="flex items-center gap-3">
          {right}
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}

export function ConnectionBadge({ connected, count }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className={`flex items-center gap-1.5 ${connected ? "text-axiom-success" : "text-axiom-muted"}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-axiom-success animate-pulse" : "bg-axiom-muted/40"}`} />
        {connected ? "Live" : "Offline"}
      </span>
      <span className="hidden text-axiom-muted sm:inline">{count} events</span>
    </div>
  );
}
