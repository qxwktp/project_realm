// Domain types shared across the app. These mirror the SQL schema.
export type UserRole = "buyer" | "creator" | "admin";
export type ProductStatus = "draft" | "published" | "hidden";
export type OrderStatus = "requested" | "accepted" | "closed" | "cancelled";

export interface Profile {
  id: string;
  email: string;
  username: string;
  display_name: string;
  role: UserRole;
  bio: string;
  avatar_url: string | null;
  socials: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Category { id: string; name: string; slug: string; sort: number; }

export interface Product {
  id: string;
  creator_id: string;
  category_id: string | null;
  title: string;
  description: string;
  price: number;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface ProductImage { id: string; product_id: string; path: string; sort: number; }
export interface PortfolioItem { id: string; creator_id: string; title: string; path: string; sort: number; }

export interface Conversation {
  id: string;
  buyer_id: string;
  creator_id: string;
  product_id: string | null;
  created_at: string;
  updated_at: string;
}
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}
export interface Order {
  id: string;
  buyer_id: string;
  creator_id: string;
  product_id: string | null;
  status: OrderStatus;
  note: string;
  created_at: string;
  updated_at: string;
}
export interface Rating {
  id: string;
  order_id: string;
  creator_id: string;
  buyer_id: string;
  score: number;
  text: string;
  created_at: string;
}
export interface CreatorStats {
  creator_id: string;
  avg_rating: number;
  rating_count: number;
  completed_orders: number;
}
