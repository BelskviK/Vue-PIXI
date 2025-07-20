// src/components/games/mines/api/minesApi.ts
import axios, { AxiosResponse } from "axios";

/** Mock API layer – swap baseURL when real backend is ready */
const api = axios.create({ baseURL: "/api/mock" });

export interface SaveRoundPayload {
  mines: number;
  bet: number;
  win: number;
  revealed: number;
}

export function saveRound(
  data: SaveRoundPayload
): Promise<AxiosResponse<void>> {
  // mock latency
  return new Promise((res) =>
    setTimeout(() => res(api.post("/mines", data)), 400)
  );
}

export function fetchHistory() {
  return new Promise((res) =>
    setTimeout(() => res(api.get("/mines/history")), 400)
  );
}
