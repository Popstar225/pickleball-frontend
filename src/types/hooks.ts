// ============================================================================
// HOOK INTERFACES FOR PICKLEBALL PLATFORM
// ============================================================================

import { User, Club, Tournament, Court, Payment, Ranking, Notification, Banner } from './api';

// ============================================================================
// AUTHENTICATION HOOKS
// ============================================================================

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  userType: 'player' | 'coach' | 'club' | 'partner' | 'state' | 'federation';
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  state?: string;
  city?: string;
  phone?: string;
  skillLevel?: '2.5' | '3.0' | '3.5' | '4.0' | '4.5' | '5.0' | '5.5';
  businessName?: string;
  contactPerson?: string;
  rfc?: string;
  website?: string;
}

// ============================================================================
// API HOOKS
// ============================================================================

export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
  refetch: () => Promise<void>;
}

export interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  onFinally?: () => void;
  transform?: (data: any) => T;
  cacheKey?: string;
  cacheTime?: number;
}

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

// ============================================================================
// PAGINATION HOOKS
// ============================================================================

export interface UsePaginationReturn {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  reset: () => void;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  total?: number;
  onChange?: (page: number, limit: number) => void;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ============================================================================
// SEARCH AND FILTER HOOKS
// ============================================================================

export interface UseSearchReturn {
  search: string;
  filters: Record<string, any>;
  setSearch: (search: string) => void;
  setFilter: (key: string, value: any) => void;
  setFilters: (filters: Record<string, any>) => void;
  clearFilter: (key: string) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export interface UseSearchOptions {
  initialSearch?: string;
  initialFilters?: Record<string, any>;
  debounceMs?: number;
  onSearch?: (search: string, filters: Record<string, any>) => void;
  onFiltersChange?: (filters: Record<string, any>) => void;
}

export interface SearchState {
  search: string;
  filters: Record<string, any>;
  debouncedSearch: string;
}

// ============================================================================
// FORM HOOKS
// ============================================================================

export interface UseFormReturn<T> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  setValue: (key: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (key: keyof T, error: string) => void;
  setErrors: (errors: Record<string, string>) => void;
  setTouched: (key: keyof T, touched: boolean) => void;
  setTouchedAll: (touched: boolean) => void;
  validate: () => boolean;
  validateField: (key: keyof T) => boolean;
  reset: () => void;
  resetErrors: () => void;
  handleSubmit: (onSubmit: (data: T) => void | Promise<void>) => (e: React.FormEvent) => void;
}

export interface UseFormOptions<T> {
  initialData: T;
  validationSchema?: any;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  onSubmit?: (data: T) => void | Promise<void>;
  onError?: (errors: Record<string, string>) => void;
}

export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

// ============================================================================
// TABLE HOOKS
// ============================================================================

export interface UseTableReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedIds: string[];
  setData: (data: T[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  setFilters: (filters: Record<string, any>) => void;
  setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  refresh: () => Promise<void>;
  reset: () => void;
}

export interface UseTableOptions<T> {
  initialData?: T[];
  initialPagination?: Partial<PaginationState>;
  initialFilters?: Record<string, any>;
  initialSort?: { sortBy: string; sortOrder: 'asc' | 'desc' };
  fetchData?: (params: TableParams) => Promise<{ data: T[]; pagination: PaginationState }>;
  onDataChange?: (data: T[]) => void;
  onPaginationChange?: (pagination: PaginationState) => void;
  onFiltersChange?: (filters: Record<string, any>) => void;
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export interface TableParams {
  page: number;
  limit: number;
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface TableState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedIds: string[];
}

// ============================================================================
// MODAL HOOKS
// ============================================================================

export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  data: any;
  setData: (data: any) => void;
  clearData: () => void;
}

export interface UseModalOptions {
  initialData?: any;
  onOpen?: () => void;
  onClose?: () => void;
  onDataChange?: (data: any) => void;
}

export interface ModalState {
  isOpen: boolean;
  data: any;
}

// ============================================================================
// TOAST HOOKS
// ============================================================================

export interface UseToastReturn {
  toast: (options: ToastOptions) => string;
  success: (message: string, options?: Partial<ToastOptions>) => string;
  error: (message: string, options?: Partial<ToastOptions>) => string;
  warning: (message: string, options?: Partial<ToastOptions>) => string;
  info: (message: string, options?: Partial<ToastOptions>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export interface ToastOptions {
  id?: string;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

export interface ToastState {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  dismissible: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  createdAt: number;
}

// ============================================================================
// LOCAL STORAGE HOOKS
// ============================================================================

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T) => void;
  removeValue: () => void;
  clearStorage: () => void;
}

export interface UseLocalStorageOptions<T> {
  defaultValue: T;
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  onValueChange?: (value: T) => void;
}

// ============================================================================
// SESSION STORAGE HOOKS
// ============================================================================

export interface UseSessionStorageReturn<T> {
  value: T;
  setValue: (value: T) => void;
  removeValue: () => void;
  clearStorage: () => void;
}

export interface UseSessionStorageOptions<T> {
  defaultValue: T;
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  onValueChange?: (value: T) => void;
}

// ============================================================================
// WINDOW HOOKS
// ============================================================================

export interface UseWindowSizeReturn {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface UseWindowScrollReturn {
  x: number;
  y: number;
  direction: 'up' | 'down' | null;
  isScrolling: boolean;
}

export interface UseWindowFocusReturn {
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

// ============================================================================
// MEDIA QUERY HOOKS
// ============================================================================

export interface UseMediaQueryReturn {
  matches: boolean;
  mediaQuery: string;
}

export interface UseMediaQueryOptions {
  defaultValue?: boolean;
  onChange?: (matches: boolean) => void;
}

// ============================================================================
// ANIMATION HOOKS
// ============================================================================

export interface UseAnimationReturn {
  isAnimating: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export interface UseAnimationOptions {
  duration?: number;
  easing?: string;
  delay?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onUpdate?: (progress: number) => void;
}

// ============================================================================
// TIMER HOOKS
// ============================================================================

export interface UseTimerReturn {
  time: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  setTime: (time: number) => void;
}

export interface UseTimerOptions {
  initialTime?: number;
  interval?: number;
  autoStart?: boolean;
  onTick?: (time: number) => void;
  onComplete?: () => void;
}

export interface UseCountdownReturn {
  time: number;
  isRunning: boolean;
  isComplete: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  setTime: (time: number) => void;
}

export interface UseCountdownOptions {
  initialTime: number;
  interval?: number;
  autoStart?: boolean;
  onTick?: (time: number) => void;
  onComplete?: () => void;
}

// ============================================================================
// DEBOUNCE HOOKS
// ============================================================================

export interface UseDebounceReturn<T> {
  value: T;
  debouncedValue: T;
  setValue: (value: T) => void;
}

export interface UseDebounceOptions {
  delay: number;
  onDebounce?: (value: any) => void;
}

// ============================================================================
// THROTTLE HOOKS
// ============================================================================

export interface UseThrottleReturn<T> {
  value: T;
  throttledValue: T;
  setValue: (value: T) => void;
}

export interface UseThrottleOptions {
  delay: number;
  onThrottle?: (value: any) => void;
}

// ============================================================================
// INTERSECTION OBSERVER HOOKS
// ============================================================================

export interface UseIntersectionObserverReturn {
  ref: React.RefObject<Element>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

export interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  onIntersect?: (entry: IntersectionObserverEntry) => void;
}

// ============================================================================
// RESIZE OBSERVER HOOKS
// ============================================================================

export interface UseResizeObserverReturn {
  ref: React.RefObject<Element>;
  size: { width: number; height: number };
  entry: ResizeObserverEntry | null;
}

export interface UseResizeObserverOptions {
  onResize?: (entry: ResizeObserverEntry) => void;
}

// ============================================================================
// MUTATION OBSERVER HOOKS
// ============================================================================

export interface UseMutationObserverReturn {
  ref: React.RefObject<Element>;
  mutations: MutationRecord[];
  disconnect: () => void;
}

export interface UseMutationObserverOptions {
  attributes?: boolean;
  childList?: boolean;
  subtree?: boolean;
  onMutation?: (mutations: MutationRecord[]) => void;
}

// ============================================================================
// GEOLOCATION HOOKS
// ============================================================================

export interface UseGeolocationReturn {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
  getCurrentPosition: () => void;
  watchPosition: () => void;
  clearWatch: () => void;
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  onSuccess?: (position: GeolocationPosition) => void;
  onError?: (error: GeolocationPositionError) => void;
}

// ============================================================================
// NETWORK HOOKS
// ============================================================================

export interface UseNetworkReturn {
  online: boolean;
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | null;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean | null;
}

export interface UseNetworkOptions {
  onOnline?: () => void;
  onOffline?: () => void;
  onChange?: (network: UseNetworkReturn) => void;
}

// ============================================================================
// DEVICE HOOKS
// ============================================================================

export interface UseDeviceReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  userAgent: string;
  platform: string;
  vendor: string;
}

// ============================================================================
// THEME HOOKS
// ============================================================================

export interface UseThemeReturn {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
}

export interface UseThemeOptions {
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
}

// ============================================================================
// LANGUAGE HOOKS
// ============================================================================

export interface UseLanguageReturn {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
  availableLanguages: string[];
}

export interface UseLanguageOptions {
  defaultLanguage: string;
  availableLanguages: string[];
  translations: Record<string, Record<string, string>>;
  onLanguageChange?: (language: string) => void;
}

// ============================================================================
// EXPORT ALL HOOK INTERFACES
// ============================================================================
