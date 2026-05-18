/**
 * Fila de fact_listening_history.
 * `played_at` viene como ISO-8601 desde el backend.
 */
export interface HistoryItem {
  played_at: string;
  track_id: string;
  track_name: string;
  artist_id: string;
  artist_name: string;
  duration_ms?: number | null;
}