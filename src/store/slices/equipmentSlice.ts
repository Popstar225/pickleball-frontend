import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import EquipmentService, {
  Product,
  Order,
  CartItem,
  Pagination,
  ProductCategory,
  SortOption,
} from '@/services/equipmentService';

// ─── Cart persistence helpers ─────────────────────────────────────────────────

const CART_KEY = 'equipment_cart';

const loadCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (cart: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

// ─── State ────────────────────────────────────────────────────────────────────

interface EquipmentState {
  // Product catalog
  products: Product[];
  productsPagination: Pagination | null;
  currentProduct: Product | null;
  productsLoading: boolean;
  productLoading: boolean;
  productsError: string | null;

  // Filters / sort
  filters: {
    category: ProductCategory | '';
    search: string;
    sort: SortOption;
  };

  // Cart (persisted to localStorage)
  cart: CartItem[];

  // User orders
  orders: Order[];
  ordersPagination: Pagination | null;
  currentOrder: Order | null;
  ordersLoading: boolean;
  orderLoading: boolean;
  ordersError: string | null;

  // Admin
  adminProducts: Product[];
  adminProductsPagination: Pagination | null;
  adminProductsLoading: boolean;
  adminOrders: Order[];
  adminOrdersPagination: Pagination | null;
  adminOrdersLoading: boolean;
  adminOrderStats: {
    total_orders: number;
    by_status: Record<string, number>;
    total_revenue: number;
  } | null;
}

const initialState: EquipmentState = {
  products: [],
  productsPagination: null,
  currentProduct: null,
  productsLoading: false,
  productLoading: false,
  productsError: null,
  filters: { category: '', search: '', sort: 'newest' },
  cart: loadCart(),
  orders: [],
  ordersPagination: null,
  currentOrder: null,
  ordersLoading: false,
  orderLoading: false,
  ordersError: null,
  adminProducts: [],
  adminProductsPagination: null,
  adminProductsLoading: false,
  adminOrders: [],
  adminOrdersPagination: null,
  adminOrdersLoading: false,
  adminOrderStats: null,
};

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const fetchProducts = createAsyncThunk(
  'equipment/fetchProducts',
  async (params: Parameters<typeof EquipmentService.getProducts>[0], { rejectWithValue }) => {
    try {
      const res = await EquipmentService.getProducts(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load products');
    }
  }
);

export const fetchProduct = createAsyncThunk(
  'equipment/fetchProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await EquipmentService.getProduct(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Product not found');
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'equipment/fetchMyOrders',
  async (params: { page?: number; limit?: number } | undefined, { rejectWithValue }) => {
    try {
      const res = await EquipmentService.getMyOrders(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load orders');
    }
  }
);

export const fetchMyOrder = createAsyncThunk(
  'equipment/fetchMyOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await EquipmentService.getMyOrder(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Order not found');
    }
  }
);

// Admin thunks
export const fetchAdminProducts = createAsyncThunk(
  'equipment/fetchAdminProducts',
  async (params: Parameters<typeof EquipmentService.adminGetProducts>[0], { rejectWithValue }) => {
    try {
      const res = await EquipmentService.adminGetProducts(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load products');
    }
  }
);

export const fetchAdminOrders = createAsyncThunk(
  'equipment/fetchAdminOrders',
  async (params: Parameters<typeof EquipmentService.adminGetOrders>[0], { rejectWithValue }) => {
    try {
      const res = await EquipmentService.adminGetOrders(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load orders');
    }
  }
);

export const fetchAdminOrderStats = createAsyncThunk(
  'equipment/fetchAdminOrderStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await EquipmentService.adminGetOrderStats();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load stats');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState,
  reducers: {
    // Cart actions
    addToCart(state, action: PayloadAction<{ product: Product; quantity: number }>) {
      const { product, quantity } = action.payload;
      const existing = state.cart.find(i => i.product.id === product.id);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, product.stock_quantity);
      } else {
        state.cart.push({ product, quantity });
      }
      saveCart(state.cart);
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.cart = state.cart.filter(i => i.product.id !== action.payload);
      saveCart(state.cart);
    },
    updateCartQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const item = state.cart.find(i => i.product.id === action.payload.productId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.cart = state.cart.filter(i => i.product.id !== action.payload.productId);
        } else {
          item.quantity = Math.min(action.payload.quantity, item.product.stock_quantity);
        }
        saveCart(state.cart);
      }
    },
    clearCart(state) {
      state.cart = [];
      saveCart([]);
    },
    // Filter actions
    setFilter(state, action: PayloadAction<Partial<EquipmentState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = { category: '', search: '', sort: 'newest' };
    },
    clearCurrentProduct(state) {
      state.currentProduct = null;
    },
    clearCurrentOrder(state) {
      state.currentOrder = null;
    },
    // Admin inline updates
    updateAdminProduct(state, action: PayloadAction<Product>) {
      const idx = state.adminProducts.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) state.adminProducts[idx] = action.payload;
    },
    removeAdminProduct(state, action: PayloadAction<string>) {
      state.adminProducts = state.adminProducts.filter(p => p.id !== action.payload);
    },
    updateAdminOrder(state, action: PayloadAction<Order>) {
      const idx = state.adminOrders.findIndex(o => o.id === action.payload.id);
      if (idx !== -1) state.adminOrders[idx] = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchProducts
    builder
      .addCase(fetchProducts.pending, (s) => { s.productsLoading = true; s.productsError = null; })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.productsLoading = false;
        s.products = a.payload.products;
        s.productsPagination = a.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (s, a) => { s.productsLoading = false; s.productsError = a.payload as string; });

    // fetchProduct
    builder
      .addCase(fetchProduct.pending, (s) => { s.productLoading = true; })
      .addCase(fetchProduct.fulfilled, (s, a) => { s.productLoading = false; s.currentProduct = a.payload; })
      .addCase(fetchProduct.rejected, (s) => { s.productLoading = false; });

    // fetchMyOrders
    builder
      .addCase(fetchMyOrders.pending, (s) => { s.ordersLoading = true; s.ordersError = null; })
      .addCase(fetchMyOrders.fulfilled, (s, a) => {
        s.ordersLoading = false;
        s.orders = a.payload.orders;
        s.ordersPagination = a.payload.pagination;
      })
      .addCase(fetchMyOrders.rejected, (s, a) => { s.ordersLoading = false; s.ordersError = a.payload as string; });

    // fetchMyOrder
    builder
      .addCase(fetchMyOrder.pending, (s) => { s.orderLoading = true; })
      .addCase(fetchMyOrder.fulfilled, (s, a) => { s.orderLoading = false; s.currentOrder = a.payload; })
      .addCase(fetchMyOrder.rejected, (s) => { s.orderLoading = false; });

    // Admin products
    builder
      .addCase(fetchAdminProducts.pending, (s) => { s.adminProductsLoading = true; })
      .addCase(fetchAdminProducts.fulfilled, (s, a) => {
        s.adminProductsLoading = false;
        s.adminProducts = a.payload.products;
        s.adminProductsPagination = a.payload.pagination;
      })
      .addCase(fetchAdminProducts.rejected, (s) => { s.adminProductsLoading = false; });

    // Admin orders
    builder
      .addCase(fetchAdminOrders.pending, (s) => { s.adminOrdersLoading = true; })
      .addCase(fetchAdminOrders.fulfilled, (s, a) => {
        s.adminOrdersLoading = false;
        s.adminOrders = a.payload.orders;
        s.adminOrdersPagination = a.payload.pagination;
      })
      .addCase(fetchAdminOrders.rejected, (s) => { s.adminOrdersLoading = false; });

    // Admin order stats
    builder
      .addCase(fetchAdminOrderStats.fulfilled, (s, a) => { s.adminOrderStats = a.payload; });
  },
});

export const {
  addToCart, removeFromCart, updateCartQuantity, clearCart,
  setFilter, clearFilters,
  clearCurrentProduct, clearCurrentOrder,
  updateAdminProduct, removeAdminProduct, updateAdminOrder,
} = equipmentSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectProducts = (s: any) => s.equipment.products as Product[];
export const selectProductsPagination = (s: any) => s.equipment.productsPagination as Pagination | null;
export const selectCurrentProduct = (s: any) => s.equipment.currentProduct as Product | null;
export const selectProductsLoading = (s: any) => s.equipment.productsLoading as boolean;
export const selectProductFilters = (s: any) => s.equipment.filters;

export const selectCart = (s: any) => s.equipment.cart as CartItem[];
export const selectCartCount = (s: any) =>
  (s.equipment.cart as CartItem[]).reduce((acc: number, i: CartItem) => acc + i.quantity, 0);
export const selectCartTotal = (s: any) =>
  (s.equipment.cart as CartItem[]).reduce((acc: number, i: CartItem) => acc + Number(i.product?.price ?? 0) * i.quantity, 0);

export const selectMyOrders = (s: any) => s.equipment.orders as Order[];
export const selectCurrentOrder = (s: any) => s.equipment.currentOrder as Order | null;
export const selectOrdersLoading = (s: any) => s.equipment.ordersLoading as boolean;

export const selectAdminProducts = (s: any) => s.equipment.adminProducts as Product[];
export const selectAdminProductsPagination = (s: any) => s.equipment.adminProductsPagination as Pagination | null;
export const selectAdminProductsLoading = (s: any) => s.equipment.adminProductsLoading as boolean;

export const selectAdminOrders = (s: any) => s.equipment.adminOrders as Order[];
export const selectAdminOrdersPagination = (s: any) => s.equipment.adminOrdersPagination as Pagination | null;
export const selectAdminOrdersLoading = (s: any) => s.equipment.adminOrdersLoading as boolean;
export const selectAdminOrderStats = (s: any) => s.equipment.adminOrderStats;

export default equipmentSlice.reducer;
