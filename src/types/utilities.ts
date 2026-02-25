// ============================================================================
// UTILITY INTERFACES FOR PICKLEBALL PLATFORM
// ============================================================================

import { User, Club, Tournament, Court, Payment, Ranking, Notification, Banner } from './api';

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  numeric?: boolean;
  integer?: boolean;
  positive?: boolean;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [field: string]: ValidationRule | ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

export interface FieldValidation {
  value: any;
  rules: ValidationRule[];
  touched: boolean;
  error: string | null;
}

// ============================================================================
// FORMATTING INTERFACES
// ============================================================================

export interface DateFormatOptions {
  format?: 'short' | 'long' | 'relative' | 'custom';
  customFormat?: string;
  timezone?: string;
  locale?: string;
}

export interface NumberFormatOptions {
  style?: 'decimal' | 'currency' | 'percent';
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  locale?: string;
}

export interface PhoneFormatOptions {
  format?: 'national' | 'international' | 'e164';
  country?: string;
}

export interface AddressFormatOptions {
  format?: 'short' | 'long' | 'components';
  country?: string;
  locale?: string;
}

// ============================================================================
// STORAGE INTERFACES
// ============================================================================

export interface StorageOptions {
  prefix?: string;
  serializer?: (value: any) => string;
  deserializer?: (value: string) => any;
  encryption?: boolean;
  encryptionKey?: string;
  ttl?: number; // Time to live in milliseconds
}

export interface StorageItem<T> {
  key: string;
  value: T;
  timestamp: number;
  expiresAt?: number;
}

export interface StorageManager {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, options?: StorageOptions): void;
  remove(key: string): void;
  clear(): void;
  has(key: string): boolean;
  keys(): string[];
  size(): number;
}

// ============================================================================
// CACHE INTERFACES
// ============================================================================

export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
  strategy?: 'lru' | 'fifo' | 'lfu';
  namespace?: string;
}

export interface CacheItem<T> {
  key: string;
  value: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheManager<T> {
  get(key: string): T | null;
  set(key: string, value: T, options?: CacheOptions): void;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
  keys(): string[];
  size(): number;
  stats(): CacheStats;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  maxSize: number;
  evictions: number;
}

// ============================================================================
// ENCRYPTION INTERFACES
// ============================================================================

export interface EncryptionOptions {
  algorithm?: 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';
  keySize?: 128 | 192 | 256;
  iv?: Uint8Array;
  salt?: Uint8Array;
  iterations?: number;
}

export interface EncryptionResult {
  encrypted: string;
  iv: string;
  salt: string;
  tag?: string;
}

export interface CryptoService {
  encrypt(data: string, key: string, options?: EncryptionOptions): Promise<EncryptionResult>;
  decrypt(encryptedData: EncryptionResult, key: string): Promise<string>;
  hash(data: string, salt?: string): Promise<string>;
  verify(data: string, hash: string): Promise<boolean>;
  generateKey(length?: number): string;
  generateIV(): Uint8Array;
  generateSalt(): Uint8Array;
}

// ============================================================================
// HTTP INTERFACES
// ============================================================================

export interface HttpRequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  withCredentials?: boolean;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
  onDownloadProgress?: (progressEvent: ProgressEvent) => void;
  validateStatus?: (status: number) => boolean;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: HttpRequestConfig;
  request?: any;
}

export interface HttpError {
  message: string;
  code?: string;
  status?: number;
  statusText?: string;
  config?: HttpRequestConfig;
  request?: any;
  response?: HttpResponse;
}

export interface HttpClient {
  request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>>;
  get<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  post<T>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  put<T>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  patch<T>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  delete<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  head<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  options<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
}

export interface HttpInterceptor {
  request?: (config: HttpRequestConfig) => HttpRequestConfig | Promise<HttpRequestConfig>;
  response?: (response: HttpResponse) => HttpResponse | Promise<HttpResponse>;
  error?: (error: HttpError) => any;
}

// ============================================================================
// WEBSOCKET INTERFACES
// ============================================================================

export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  heartbeatMessage?: string;
}

export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: number;
  id?: string;
}

export interface WebSocketEvent {
  type: 'open' | 'message' | 'close' | 'error';
  data?: any;
  timestamp: number;
}

export interface WebSocketService {
  connect(): void;
  disconnect(): void;
  send<T>(message: WebSocketMessage<T>): void;
  subscribe<T>(type: string, callback: (message: WebSocketMessage<T>) => void): () => void;
  on(event: string, callback: (event: WebSocketEvent) => void): () => void;
  isConnected(): boolean;
  getConnectionState(): 'connecting' | 'open' | 'closing' | 'closed';
}

// ============================================================================
// EVENT EMITTER INTERFACES
// ============================================================================

export interface EventEmitter {
  on<T>(event: string, callback: (data: T) => void): () => void;
  once<T>(event: string, callback: (data: T) => void): () => void;
  emit<T>(event: string, data: T): void;
  off(event: string, callback: Function): void;
  removeAllListeners(event?: string): void;
  listenerCount(event: string): number;
  eventNames(): string[];
}

export interface EventSubscription {
  event: string;
  callback: Function;
  once: boolean;
  id: string;
}

// ============================================================================
// ROUTER INTERFACES
// ============================================================================

export interface Route {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  children?: Route[];
  meta?: RouteMeta;
}

export interface RouteMeta {
  title?: string;
  requiresAuth?: boolean;
  roles?: string[];
  permissions?: string[];
  breadcrumb?: string;
  icon?: string;
  hidden?: boolean;
}

export interface RouterContext {
  location: Location;
  navigate: (to: string, options?: NavigateOptions) => void;
  goBack: () => void;
  goForward: () => void;
  go: (n: number) => void;
  push: (to: string) => void;
  replace: (to: string) => void;
}

export interface NavigateOptions {
  replace?: boolean;
  state?: any;
}

export interface Location {
  pathname: string;
  search: string;
  hash: string;
  state?: any;
}

// ============================================================================
// STATE MANAGEMENT INTERFACES
// ============================================================================

export interface Store<T> {
  getState(): T;
  dispatch(action: Action): void;
  subscribe(listener: (state: T) => void): () => void;
  replaceReducer(reducer: Reducer<T>): void;
}

export interface Action {
  type: string;
  payload?: any;
  meta?: any;
  error?: boolean;
}

export interface Reducer<T> {
  (state: T, action: Action): T;
}

export interface Middleware {
  (store: Store<any>): (next: (action: Action) => void) => (action: Action) => void;
}

export interface Selector<T, R> {
  (state: T): R;
}

export interface Dispatch {
  (action: Action): void;
  <R>(action: Action): R;
}

// ============================================================================
// ANIMATION INTERFACES
// ============================================================================

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  iterationCount?: number | 'infinite';
  playState?: 'running' | 'paused';
}

export interface AnimationKeyframe {
  offset: number;
  properties: Record<string, string | number>;
}

export interface AnimationOptions {
  config: AnimationConfig;
  keyframes: AnimationKeyframe[];
  onStart?: () => void;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
  onCancel?: () => void;
}

export interface AnimationController {
  play(): void;
  pause(): void;
  resume(): void;
  stop(): void;
  reverse(): void;
  seek(time: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  isPlaying(): boolean;
  isPaused(): boolean;
}

// ============================================================================
// DRAG AND DROP INTERFACES
// ============================================================================

export interface DragItem {
  id: string;
  type: string;
  data: any;
  index?: number;
}

export interface DropZone {
  id: string;
  type: string;
  accepts: string[];
  data: any;
}

export interface DragState {
  isDragging: boolean;
  draggedItem: DragItem | null;
  dropZone: DropZone | null;
  position: { x: number; y: number };
}

export interface DragAndDropOptions {
  onDragStart?: (item: DragItem) => void;
  onDragOver?: (item: DragItem, dropZone: DropZone) => void;
  onDragEnd?: (item: DragItem, dropZone: DropZone | null) => void;
  onDrop?: (item: DragItem, dropZone: DropZone) => void;
}

// ============================================================================
// FILE HANDLING INTERFACES
// ============================================================================

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  path?: string;
  url?: string;
}

export interface FileUploadOptions {
  url: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  data?: Record<string, any>;
  withCredentials?: boolean;
  timeout?: number;
  onProgress?: (progress: number) => void;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export interface FileUploadResult {
  success: boolean;
  file: FileInfo;
  response?: any;
  error?: string;
}

export interface FileService {
  upload(file: File, options: FileUploadOptions): Promise<FileUploadResult>;
  download(url: string, filename?: string): Promise<void>;
  delete(url: string): Promise<boolean>;
  getInfo(file: File): FileInfo;
  validateFile(file: File, options: FileValidationOptions): FileValidationResult;
}

export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  maxFiles?: number;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

// ============================================================================
// NOTIFICATION INTERFACES
// ============================================================================

export interface NotificationOptions {
  id?: string;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  dismissible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

export interface NotificationService {
  show(options: NotificationOptions): string;
  success(message: string, options?: Partial<NotificationOptions>): string;
  error(message: string, options?: Partial<NotificationOptions>): string;
  warning(message: string, options?: Partial<NotificationOptions>): string;
  info(message: string, options?: Partial<NotificationOptions>): string;
  dismiss(id: string): void;
  dismissAll(): void;
  clear(): void;
}

// ============================================================================
// PERMISSION INTERFACES
// ============================================================================

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem?: boolean;
}

export interface PermissionService {
  hasPermission(user: User, permission: Permission): boolean;
  hasRole(user: User, roleName: string): boolean;
  getUserPermissions(user: User): Permission[];
  getUserRoles(user: User): Role[];
  checkAccess(user: User, resource: string, action: string): boolean;
}

// ============================================================================
// AUDIT INTERFACES
// ============================================================================

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface AuditService {
  log(action: string, resource: string, resourceId?: string, details?: Record<string, any>): void;
  getLogs(filters: AuditLogFilters): Promise<AuditLog[]>;
  exportLogs(filters: AuditLogFilters, format: 'csv' | 'json'): Promise<string>;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

// ============================================================================
// EXPORT ALL UTILITY INTERFACES
// ============================================================================
