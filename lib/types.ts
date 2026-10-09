export type Category = {
  id: string;
  slug: string;
  name_bn: string;
  name_en: string;
  icon: string;
  sort: number;
};

export type Plan = {
  id: string;
  product_id: string;
  label_bn: string;
  duration_days: number | null;
  price_bdt: number;
  old_price_bdt: number | null;
  is_popular: boolean;
  is_active: boolean;
  sort: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline_bn: string;
  description_bn: string;
  features_bn: string[];
  delivery_note_bn: string;
  badge: string;
  badge_bg: string;
  category_id: string | null;
  is_featured: boolean;
  sort: number;
  image_url: string | null;
  sold_out_manual: boolean;
  track_stock: boolean;
  category?: Category | null;
  plans?: Plan[];
  /** unused-key count (populated by catalog helpers) */
  stock?: number;
};

/** True when the product cannot be bought right now. */
export function isSoldOut(p: {
  sold_out_manual: boolean;
  track_stock: boolean;
  stock?: number;
}): boolean {
  if (p.sold_out_manual) return true;
  if (p.track_stock && p.stock !== undefined && p.stock <= 0) return true;
  return false;
}

export type ProductFile = {
  id: string;
  product_id: string;
  plan_id: string | null;
  file_name: string;
  version_label: string;
  storage_path: string;
  file_size: number;
  mime_type: string;
  sort: number;
  is_active: boolean;
};

export type DownloadToken = {
  id: string;
  order_id: string;
  order_item_id: string;
  product_file_id: string;
  token: string;
  max_downloads: number;
  downloads_used: number;
  expires_at: string;
  created_at: string;
  product_file?: { file_name: string; version_label: string; file_size: number } | null;
};

export type Slide = {
  id: string;
  title_bn: string;
  subtitle_bn: string;
  cta_text: string;
  cta_link: string;
  image_url: string | null;
  bg_from: string;
  bg_to: string;
  sort: number;
  is_active: boolean;
};

export type CartItem = {
  product: Product;
  plan: Plan;
  qty: number;
};

export type OrderStatus =
  | "pending"
  | "payment_pending"
  | "paid"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "keys_pending";

export type PaymentMethod = "sslcommerz" | "bkash" | "nagad" | "rocket";

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod | null;
  total_bdt: number;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  plan_id: string | null;
  product_name: string;
  plan_label_bn: string;
  price_bdt: number;
  qty: number;
};

export type Payment = {
  id: string;
  order_id: string;
  method: PaymentMethod;
  amount_bdt: number;
  sender_number: string | null;
  trx_id: string | null;
  ssl_tran_id: string | null;
  ssl_val_id: string | null;
  status: "pending" | "success" | "failed" | "cancelled";
  created_at: string;
};

export type DeliveredKey = {
  id: string;
  order_id: string;
  order_item_id: string;
  key_text: string;
  key_note: string | null;
  delivered_at: string;
};
