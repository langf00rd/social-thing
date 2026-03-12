export interface Post {
  id: number;
  body: string;
  theme: string;
  slug: string;
  created_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    photo_url: string;
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
  } | null;
}

export interface Reply {
  id: number;
  body: string;
  created_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    photo_url: string;
  } | null;
}

export interface User {
  id: number;
  auth_id: string;
  email: string;
  first_name: string;
  last_name: string;
  photo_url: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
};