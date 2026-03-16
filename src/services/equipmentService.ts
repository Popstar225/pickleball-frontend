import axios from 'axios';
import { baseURL } from '@/lib/const';

const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductCategory = 'paddles' | 'balls' | 'bags' | 'apparel' | 'accessories';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'name_asc' | 'popularity';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  stock_quantity: number;
  category: ProductCategory;
  images: string[];
  sku: string | null;
  is_active: boolean;
  is_featured: boolean;
  weight: number | null;
  sort_order: number;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_snapshot: Partial<Product>;
}

export interface Order {
  id: string;
  user_id: string;
  payment_id: string | null;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  currency: string;
  shipping_address: ShippingAddress;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  admin_notes: string | null;
  items: OrderItem[];
  user?: { id: string; first_name: string; last_name: string; email: string };
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ─── Product API ──────────────────────────────────────────────────────────────

const getProducts = async (params?: {
  category?: ProductCategory;
  search?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
  featured?: boolean;
}) => {
  const response = await apiClient.get('/equipment', { params });
  return response.data as { success: boolean; data: { products: Product[]; pagination: Pagination } };
};

const getProduct = async (id: string) => {
  const response = await apiClient.get(`/equipment/${id}`);
  return response.data as { success: boolean; data: Product };
};

// ─── Admin Product API ────────────────────────────────────────────────────────

const adminGetProducts = async (params?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive';
}) => {
  const response = await apiClient.get('/equipment/admin/all', { params });
  return response.data as { success: boolean; data: { products: Product[]; pagination: Pagination } };
};

const adminCreateProduct = async (formData: FormData) => {
  const response = await apiClient.post('/equipment/admin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data as { success: boolean; data: Product };
};

const adminUpdateProduct = async (id: string, formData: FormData) => {
  const response = await apiClient.put(`/equipment/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data as { success: boolean; data: Product };
};

const adminDeleteProduct = async (id: string) => {
  const response = await apiClient.delete(`/equipment/admin/${id}`);
  return response.data as { success: boolean; message: string };
};

const adminUpdateStock = async (id: string, stock_quantity: number) => {
  const response = await apiClient.patch(`/equipment/admin/${id}/stock`, { stock_quantity });
  return response.data as { success: boolean; data: { stock_quantity: number } };
};

const adminDeleteProductImage = async (id: string, image_url: string) => {
  const response = await apiClient.delete(`/equipment/admin/${id}/images`, {
    data: { image_url },
  });
  return response.data as { success: boolean; data: { images: string[] } };
};

// ─── Order API ────────────────────────────────────────────────────────────────

const createOrder = async (payload: {
  items: { product_id: string; quantity: number }[];
  shipping_address: ShippingAddress;
  notes?: string;
}) => {
  const response = await apiClient.post('/orders', payload);
  return response.data as { success: boolean; data: Order };
};

const getMyOrders = async (params?: { page?: number; limit?: number }) => {
  const response = await apiClient.get('/orders/my', { params });
  return response.data as { success: boolean; data: { orders: Order[]; pagination: Pagination } };
};

const getMyOrder = async (id: string) => {
  const response = await apiClient.get(`/orders/my/${id}`);
  return response.data as { success: boolean; data: Order };
};

const cancelOrder = async (id: string) => {
  const response = await apiClient.post(`/orders/${id}/cancel`);
  return response.data as { success: boolean; data: Order };
};

// ─── Checkout (payment) API ───────────────────────────────────────────────────

const createEquipmentCheckout = async (order_id: string) => {
  const response = await apiClient.post('/payments/equipment-checkout', { order_id });
  return response.data as {
    success: boolean;
    data: {
      payment_id: string;
      client_secret: string;
      order_id: string;
      order_number: string;
      amount: number;
    };
  };
};

const confirmEquipmentCheckout = async (paymentId: string, payment_intent_id: string, order_id: string) => {
  const response = await apiClient.post(`/payments/equipment-checkout/${paymentId}/confirm`, {
    payment_intent_id,
    order_id,
  });
  return response.data as { success: boolean; data: { payment: any; order: Order } };
};

// ─── Admin Order API ──────────────────────────────────────────────────────────

const adminGetOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  user_id?: string;
  search?: string;
}) => {
  const response = await apiClient.get('/orders/admin', { params });
  return response.data as { success: boolean; data: { orders: Order[]; pagination: Pagination } };
};

const adminGetOrder = async (id: string) => {
  const response = await apiClient.get(`/orders/admin/${id}`);
  return response.data as { success: boolean; data: Order };
};

const adminUpdateOrderStatus = async (id: string, payload: {
  status: OrderStatus;
  tracking_number?: string;
  admin_notes?: string;
}) => {
  const response = await apiClient.patch(`/orders/admin/${id}/status`, payload);
  return response.data as { success: boolean; data: Order };
};

const adminGetOrderStats = async () => {
  const response = await apiClient.get('/orders/admin/stats');
  return response.data as {
    success: boolean;
    data: {
      total_orders: number;
      by_status: Record<string, number>;
      total_revenue: number;
    };
  };
};

const EquipmentService = {
  getProducts,
  getProduct,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUpdateStock,
  adminDeleteProductImage,
  createOrder,
  getMyOrders,
  getMyOrder,
  cancelOrder,
  createEquipmentCheckout,
  confirmEquipmentCheckout,
  adminGetOrders,
  adminGetOrder,
  adminUpdateOrderStatus,
  adminGetOrderStats,
};

export default EquipmentService;
