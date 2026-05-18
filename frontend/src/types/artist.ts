export interface Artist {
  id: string;
  name: string;
  popularity: number; // 0-100
  genres: string[];
  followers?: number | null;
  image_url?: string | null;
}