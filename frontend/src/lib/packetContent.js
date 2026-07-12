export function getReadableContent(packet) {
  const p = packet.payload ?? {};

  if (typeof p.draft === "string" && p.draft.trim()) {
    return { title: `${packet.agent_name} — Draft`, body: p.draft, kind: "draft" };
  }
  if (typeof p.critique === "string" && p.critique.trim()) {
    return { title: `${packet.agent_name} — Critique`, body: p.critique, kind: "critique" };
  }
  if (typeof p.facts === "string" && p.facts.trim()) {
    return { title: `${packet.agent_name} — Research`, body: p.facts, kind: "facts" };
  }
  if (packet.message?.trim() && ["completed", "drafted", "rejected", "approved"].includes(packet.status)) {
    return { title: packet.agent_name, body: packet.message, kind: packet.status };
  }
  return null;
}

export function hasReadableContent(packet) {
  return getReadableContent(packet) !== null;
}
