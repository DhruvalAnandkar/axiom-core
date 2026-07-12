import { NavLink } from "react-router-dom";
import {
  HelpCircle,
  Keyboard,
  Settings,
  User,
} from "lucide-react";

const LINKS = [
  { to: "/profile", label: "Profile", Icon: User },
  { to: "/settings", label: "Settings", Icon: Settings },
  { to: "/shortcuts", label: "Shortcuts", Icon: Keyboard },
  { to: "/help", label: "Help", Icon: HelpCircle },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
    isActive
      ? "border-axiom-green/50 bg-axiom-green/10 text-axiom-green"
      : "border-axiom-border text-axiom-muted hover:border-axiom-green/30 hover:text-axiom-text"
  }`;

export default function UserHubNav() {
  return (
    <nav className="flex flex-wrap gap-2 lg:flex-col">
      {LINKS.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} className={linkClass}>
          <Icon className="h-3.5 w-3.5" /> {label}
        </NavLink>
      ))}
    </nav>
  );
}
