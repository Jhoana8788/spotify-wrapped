export interface User {
  id: string;
  display_name: string;
  email?: string | null;
  country?: string | null;
  product?: string | null; // free, premium, ...
  followers?: number | null;
  image_url?: string | null;
}