export interface NotFoundPageProps {
  errorCode?: number;
  title?: string;
  message?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  onBackClick?: () => void;
  onHomeClick?: () => void;
} 