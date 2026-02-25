// ============================================================================
// COMPONENT INTERFACES FOR PICKLEBALL PLATFORM
// ============================================================================

import React from 'react';
import { User, Club, Tournament, Court, Payment, Ranking, Notification, Banner } from './api';

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  fluid?: boolean;
}

export interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 2 | 4 | 6 | 8 | 10 | 12;
  className?: string;
}

export interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  wrap?: 'wrap' | 'wrap-reverse' | 'nowrap';
  className?: string;
}

// ============================================================================
// NAVIGATION COMPONENTS
// ============================================================================

export interface NavigationProps {
  items: NavigationItem[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'tabs' | 'pills';
}

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
  badge?: string | number;
  disabled?: boolean;
  external?: boolean;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisible?: number;
  className?: string;
}

export interface TabProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  badge?: string | number;
}

// ============================================================================
// FORM COMPONENTS
// ============================================================================

export interface FormProps {
  children: React.ReactNode;
  onSubmit: (data: any) => void;
  className?: string;
  disabled?: boolean;
}

export interface FormFieldProps {
  label: string;
  name: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'search';
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'filled';
  error?: string;
  helpText?: string;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export interface TextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  rows?: number;
  cols?: number;
  maxLength?: number;
  minLength?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'filled';
  error?: string;
  helpText?: string;
  className?: string;
}

export interface SelectProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'filled';
  error?: string;
  helpText?: string;
  leftIcon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface CheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  error?: string;
  helpText?: string;
  className?: string;
}

export interface RadioGroupProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: RadioOption[];
  required?: boolean;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  error?: string;
  helpText?: string;
  className?: string;
}

export interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface SwitchProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  error?: string;
  helpText?: string;
  className?: string;
}

export interface FileUploadProps {
  label: string;
  name: string;
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'filled';
  error?: string;
  helpText?: string;
  preview?: boolean;
  className?: string;
}

export interface DatePickerProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'filled';
  error?: string;
  helpText?: string;
  format?: string;
  className?: string;
}

export interface TimePickerProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  step?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'filled';
  error?: string;
  helpText?: string;
  format?: '12h' | '24h';
  className?: string;
}

// ============================================================================
// BUTTON COMPONENTS
// ============================================================================

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  className?: string;
  href?: string;
  external?: boolean;
}

export interface IconButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  title?: string;
}

export interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// ============================================================================
// DISPLAY COMPONENTS
// ============================================================================

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  selected?: boolean;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  className?: string;
}

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

export interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

// ============================================================================
// FEEDBACK COMPONENTS
// ============================================================================

export interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export interface ToastProps {
  id: string;
  title: string;
  message?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'default' | 'light' | 'dark';
  delay?: number;
  className?: string;
}

export interface PopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  trigger?: 'click' | 'hover' | 'focus';
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

// ============================================================================
// DATA DISPLAY COMPONENTS
// ============================================================================

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  sortable?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  pagination?: boolean;
  pageSize?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataGridProps<T> {
  data: T[];
  columns: DataGridColumn<T>[];
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  loading?: boolean;
  className?: string;
}

export interface DataGridColumn<T> {
  key: string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface ListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}

export interface TreeProps<T> {
  data: TreeNode<T>[];
  renderNode: (node: TreeNode<T>) => React.ReactNode;
  expandedKeys?: string[];
  onExpand?: (key: string, expanded: boolean) => void;
  selectable?: boolean;
  selectedKeys?: string[];
  onSelect?: (keys: string[]) => void;
  className?: string;
}

export interface TreeNode<T> {
  key: string;
  data: T;
  children?: TreeNode<T>[];
  expanded?: boolean;
  selected?: boolean;
}

export interface TimelineProps {
  items: TimelineItem[];
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'outline' | 'filled';
  className?: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

// ============================================================================
// CHART COMPONENTS
// ============================================================================

export interface ChartProps {
  data: any;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'radar' | 'polarArea';
  options?: ChartOptions;
  height?: number;
  width?: number;
  className?: string;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: any;
  scales?: any;
  elements?: any;
  animation?: any;
  interaction?: any;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    type: 'up' | 'down';
    period: string;
  };
  className?: string;
}

// ============================================================================
// LAYOUT SPECIFIC COMPONENTS
// ============================================================================

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  overlay?: boolean;
  className?: string;
}

export interface HeaderProps {
  user?: User | null;
  notifications?: Notification[];
  onLogout?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

export interface FooterProps {
  className?: string;
}

export interface SidebarNavProps {
  items: SidebarNavItem[];
  activeItem?: string;
  onItemClick?: (item: SidebarNavItem) => void;
  className?: string;
}

export interface SidebarNavItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: SidebarNavItem[];
  badge?: string | number;
  disabled?: boolean;
  external?: boolean;
}

export interface TopBarProps {
  user?: User | null;
  notifications?: Notification[];
  onLogout?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

// ============================================================================
// ENTITY SPECIFIC COMPONENTS
// ============================================================================

export interface UserCardProps {
  user: User;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onViewProfile?: (user: User) => void;
  className?: string;
}

export interface TournamentCardProps {
  tournament: Tournament;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onRegister?: (tournament: Tournament) => void;
  onViewDetails?: (tournament: Tournament) => void;
  onEdit?: (tournament: Tournament) => void;
  className?: string;
}

export interface ClubCardProps {
  club: Club;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onJoin?: (club: Club) => void;
  onViewDetails?: (club: Club) => void;
  onEdit?: (club: Club) => void;
  className?: string;
}

export interface CourtCardProps {
  court: Court;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onBook?: (court: Court) => void;
  onViewDetails?: (court: Court) => void;
  onEdit?: (court: Court) => void;
  className?: string;
}

export interface PaymentCardProps {
  payment: Payment;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onView?: (payment: Payment) => void;
  onRefund?: (payment: Payment) => void;
  className?: string;
}

export interface RankingCardProps {
  ranking: Ranking;
  variant?: 'default' | 'compact' | 'detailed';
  showTrend?: boolean;
  className?: string;
}

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export interface BannerCardProps {
  banner: Banner;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onEdit?: (banner: Banner) => void;
  onDelete?: (banner: Banner) => void;
  onToggle?: (banner: Banner) => void;
  className?: string;
}

// ============================================================================
// FORM LAYOUT COMPONENTS
// ============================================================================

export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

export interface FormGroupProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
}

export interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface PortalProps {
  children: React.ReactNode;
  container?: Element;
}

// ============================================================================
// EXPORT ALL COMPONENT INTERFACES
// ============================================================================
