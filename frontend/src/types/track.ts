export interface Track {
  id: string;
  name: string;
  duration_ms: number;
  artist_id: string;
  artist_name?: string | null;
  album?: string | null;
  popularity?: number | null;
  image_url?: string | null;
}