import { toast } from "sonner";
import { truncate } from "./format.js";

export function notifyPacket(p) {
  const d = truncate(p.message, 100);
  const id = `agent-${p.node_id}`;

  switch (p.status) {
    case "running":
      toast.loading(`${p.agent_name} running…`, { id });
      break;
    case "completed":
    case "drafted":
      toast.success(`${p.agent_name} done`, { id, description: d });
      break;
    case "rejected":
      toast.warning(`${p.agent_name} — revision needed`, { id, description: d });
      break;
    case "approved":
      toast.success("Pipeline complete", { id, description: d, duration: 6000 });
      break;
    case "error":
      toast.error(`${p.agent_name} failed`, { id, description: d });
      break;
    default:
      break;
  }
}
