
export interface Photo {
  id: number;
  image: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  photographer?: string;
  photographer_email?: string;
  uploaded_at?: string;
  created_at?: string;
  updated_at?: string;
  album?: number | null;
  event?: number | null;
  is_processed?: boolean;
  is_liked?: boolean;
  likes_count?: number;
  manual_tags?: string[];
  auto_tags?: string[];
  tagged_users?: number[];
  tagged_users_details?: TaggedUser[];
  exif_data?: ExifData;
}

export interface ExifData {
  Model?: string;
  FNumber?: number;
  ISOSpeedRatings?: number;
  ExposureTime?: string;
  [key: string]: string | number | undefined;
}

export interface TaggedUser {
  id: number;
  email: string;
  full_name?: string;
  profile_picture_url?: string;
}

export interface Album {
  id: number;
  name: string;
  description?: string;
  cover_image?: string;
  event?: number | null;
  owner?: string;
  created_at: string;
  updated_at?: string;
  photos?: Photo[];
  photo_count?: number;
}

export interface Event {
  id: number;
  name?: string;
  title?: string;
  description?: string;
  date: string;
  location?: string;
  cover_photo?: string;
  cover_image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  email: string;
  full_name?: string;
  bio?: string;
  profile_picture?: string;
  profile_picture_url?: string;
  role?: string;
  is_verified?: boolean;
}

export interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  notification_type?: string;
  photo?: number;
  actor?: User;
}

export interface FileUpload {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

export interface Comment {
  id: number;
  photo: number;
  user: number;
  user_email?: string;
  user_full_name?: string;
  content: string;
  created_at: string;
}

// API Response types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Form event types
export type FormEvent = React.FormEvent<HTMLFormElement>;
export type ChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
export type MouseEvent = React.MouseEvent<HTMLButtonElement | HTMLDivElement>;
