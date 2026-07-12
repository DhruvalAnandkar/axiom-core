import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthProvider.jsx";
import Navbar from "./Navbar.jsx";
import AuthForm from "./AuthForm.jsx";

/** Playing requires an account — analysis, coach, and stats follow the player. */
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (user) return children;

  return (
    <div className="axiom-gradient-bg flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center p-6">
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-axiom-muted">
            <Sparkles className="h-4 w-4 animate-pulse text-axiom-green" /> Restoring your session…
          </p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="axiom-glass axiom-glow w-full max-w-sm rounded-2xl border border-axiom-border p-7"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-axiom-green/20 to-axiom-green-dim/20">
                <Lock className="h-4 w-4 text-axiom-green" />
              </span>
              <h1 className="text-lg font-bold tracking-tight text-axiom-text">Players only</h1>
            </div>
            <p className="mb-5 text-xs leading-relaxed text-axiom-muted">
              Sign in to open the table. Your shots, pots, scratches, and pot rate
              are tracked on your account so you can watch your game improve.
            </p>
            <AuthForm />
          </motion.div>
        )}
      </div>
    </div>
  );
}
