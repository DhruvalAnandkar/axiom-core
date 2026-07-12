// 127.0.0.1 avoids Windows IPv6 localhost stalls in some browsers.
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ?? "http://127.0.0.1:3001";

export const API_URL = import.meta.env.VITE_API_URL ?? SOCKET_URL;
