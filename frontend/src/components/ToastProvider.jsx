import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      theme="dark"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: "rgba(13, 26, 20, 0.95)",
          border: "1px solid #1a3d2a",
          color: "#e8fff0",
          backdropFilter: "blur(12px)",
        },
        classNames: {
          error: "!border-amber-500/40 !text-amber-100",
          success: "!border-axiom-success/40 !text-axiom-success",
        },
      }}
    />
  );
}
