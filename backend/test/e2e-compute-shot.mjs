import { io } from "socket.io-client";

const BROKER = process.env.BROKER_URL ?? "http://localhost:3001";
const SHOT = {
  cue_ball: { x: 4, y: 9 },
  object_ball: { x: 18, y: 9 },
  pocket: { x: 34, y: 9 },
  with_coach: false,
};

const socket = io(BROKER, { transports: ["websocket"], timeout: 5000 });

const fail = (msg) => {
  console.error("FAIL:", msg);
  socket.close();
  process.exit(1);
};

socket.on("connect", () => {
  socket.emit("compute_shot", SHOT);
});

socket.on("agent_state_update", (pkt) => {
  const vd = pkt?.payload?.vector_data;
  if (!Array.isArray(vd) || vd.length === 0) fail("agent_state_update missing vector_data");
  console.log("PASS: agent_state_update vector_data length =", vd.length);
  socket.close();
  process.exit(0);
});

socket.on("compute_shot_error", (err) => fail(err?.message ?? err?.error ?? "compute_shot_error"));

setTimeout(() => fail("timeout waiting for agent_state_update"), 10000);
