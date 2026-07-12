import { useCallback, useState } from "react";

const KEY = "axiom-onboarded";

export function useOnboarding() {
  const [open, setOpen] = useState(() => !localStorage.getItem(KEY));

  const dismiss = useCallback(() => {
    localStorage.setItem(KEY, "1");
    setOpen(false);
  }, []);

  const reopen = useCallback(() => setOpen(true), []);

  return { open, dismiss, reopen };
}
