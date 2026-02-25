export interface LoginPageProps {
  onLogin: (credentials: LoginCredentials) => void;
  isLoading?: boolean;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SelectUserTypePageProps {
  onUserTypeSelect: (userType: UserType) => void;
  availableTypes: UserType[];
}

export interface UserType {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface RequiredFieldsPageProps {
  userType: UserType;
  onFieldsSubmit: (fields: RequiredFields) => void;
  isLoading?: boolean;
}

export interface RequiredFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

export interface OptionalFieldsPageProps {
  userType: UserType;
  requiredFields: RequiredFields;
  onFieldsSubmit: (fields: OptionalFields) => void;
  isLoading?: boolean;
}

export interface OptionalFields {
  bio?: string;
  profilePicture?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  notifications: boolean;
  marketing: boolean;
  privacy: boolean;
}

export interface ProfilePageProps {
  user: UserProfile;
  onProfileUpdate: (profile: Partial<UserProfile>) => void;
  isLoading?: boolean;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bio?: string;
  profilePicture?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
} 