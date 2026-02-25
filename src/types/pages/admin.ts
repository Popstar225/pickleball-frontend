export interface AdminDashboardProps {
  admin: Admin;
  systemStats: SystemStats;
  recentActivity: AdminActivity[];
  alerts: AdminAlert[];
  notifications: AdminNotification[];
}

export interface Admin {
  id: string;
  profile: AdminProfile;
  permissions: AdminPermissions;
  access: AdminAccess;
  activity: AdminActivityLog;
}

export interface AdminProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  role: 'super-admin' | 'system-admin' | 'support-admin';
  department: string;
  hireDate: string;
}

export interface AdminPermissions {
  users: boolean;
  system: boolean;
  analytics: boolean;
  banners: boolean;
  support: boolean;
  billing: boolean;
  security: boolean;
}

export interface AdminAccess {
  lastLogin: string;
  ipAddress: string;
  userAgent: string;
  activeSessions: number;
  twoFactorEnabled: boolean;
}

export interface AdminActivityLog {
  totalActions: number;
  lastAction: string;
  actionHistory: AdminAction[];
}

export interface AdminAction {
  id: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

export interface SystemStats {
  overview: SystemOverview;
  performance: SystemPerformance;
  security: SystemSecurity;
  usage: SystemUsage;
}

export interface SystemOverview {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  systemUptime: number;
  activeSessions: number;
}

export interface SystemPerformance {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  responseTime: number;
  errorRate: number;
}

export interface SystemSecurity {
  failedLogins: number;
  suspiciousActivity: number;
  securityIncidents: number;
  lastSecurityScan: string;
  vulnerabilities: number;
  patchesApplied: number;
}

export interface SystemUsage {
  apiCalls: number;
  databaseQueries: number;
  fileUploads: number;
  bandwidthUsage: number;
  storageUsage: number;
}

export interface AdminActivity {
  id: string;
  type: 'user' | 'system' | 'security' | 'financial' | 'maintenance';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'escalated';
}

export interface AdminAlert {
  id: string;
  type: 'security' | 'performance' | 'system' | 'user' | 'financial';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  acknowledged: boolean;
  actionRequired: boolean;
}

export interface AdminNotification {
  id: string;
  type: 'system' | 'user' | 'security' | 'maintenance';
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface AdminPageProps {
  admin: Admin;
  onProfileUpdate: (profile: Partial<AdminProfile>) => void;
  onPermissionsUpdate: (permissions: Partial<AdminPermissions>) => void;
  isLoading?: boolean;
}

export interface AdminProfilePageProps {
  admin: Admin;
  onProfileUpdate: (profile: Partial<AdminProfile>) => void;
  onPermissionsUpdate: (permissions: Partial<AdminPermissions>) => void;
  isLoading?: boolean;
}

export interface AnalyticsPageProps {
  systemStats: SystemStats;
  dateRange: {
    start: string;
    end: string;
  };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  isLoading?: boolean;
}

export interface UserManagementProps {
  users: SystemUser[];
  filters: UserFilters;
  onUserUpdate: (id: string, user: Partial<SystemUser>) => void;
  onUserDelete: (id: string) => void;
  onUserSuspend: (id: string) => void;
  isLoading?: boolean;
}

export interface SystemUser {
  id: string;
  profile: SystemUserProfile;
  account: SystemUserAccount;
  activity: SystemUserActivity;
  permissions: SystemUserPermissions;
}

export interface SystemUserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  userType: 'player' | 'coach' | 'club' | 'partner' | 'state' | 'admin';
  status: 'active' | 'inactive' | 'suspended' | 'banned';
}

export interface SystemUserAccount {
  createdAt: string;
  lastLogin: string;
  loginCount: number;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface SystemUserActivity {
  lastActivity: string;
  totalLogins: number;
  failedLogins: number;
  lastIpAddress: string;
  suspiciousActivity: boolean;
}

export interface SystemUserPermissions {
  canLogin: boolean;
  canAccessAdmin: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canManageSystem: boolean;
}

export interface UserFilters {
  userType?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface SystemManagementProps {
  systemConfig: SystemConfig;
  maintenance: MaintenanceSchedule[];
  backups: BackupInfo[];
  onConfigUpdate: (config: Partial<SystemConfig>) => void;
  onMaintenanceSchedule: (maintenance: Omit<MaintenanceSchedule, 'id'>) => void;
  onBackupCreate: () => void;
  isLoading?: boolean;
}

export interface SystemConfig {
  general: GeneralConfig;
  security: SecurityConfig;
  performance: PerformanceConfig;
  notifications: NotificationConfig;
}

export interface GeneralConfig {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
}

export interface SecurityConfig {
  passwordMinLength: number;
  passwordComplexity: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  twoFactorRequired: boolean;
}

export interface PerformanceConfig {
  cacheEnabled: boolean;
  cacheTimeout: number;
  maxFileSize: number;
  compressionEnabled: boolean;
  cdnEnabled: boolean;
}

export interface NotificationConfig {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  notificationFrequency: 'immediate' | 'hourly' | 'daily';
}

export interface MaintenanceSchedule {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  type: 'scheduled' | 'emergency';
  status: 'pending' | 'in-progress' | 'completed';
  affectedServices: string[];
}

export interface BackupInfo {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'database';
  size: number;
  createdAt: string;
  status: 'completed' | 'failed' | 'in-progress';
  location: string;
}

export interface BannersPageProps {
  banners: SystemBanner[];
  onBannerAdd: (banner: Omit<SystemBanner, 'id'>) => void;
  onBannerUpdate: (id: string, banner: Partial<SystemBanner>) => void;
  onBannerDelete: (id: string) => void;
  onBannerToggle: (id: string, active: boolean) => void;
  isLoading?: boolean;
}

export interface SystemBanner {
  id: string;
  title: string;
  content: string;
  image?: string;
  link?: string;
  startDate: string;
  endDate?: string;
  active: boolean;
  priority: number;
  targetAudience: string[];
  locations: string[];
} 