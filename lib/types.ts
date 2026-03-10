export interface Post {
  id: number;
  body: string;
  theme: string;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
    photo_url: string;
  };
}

export interface Reply {
  id: number;
  body: string;
  created_at: string;
}
