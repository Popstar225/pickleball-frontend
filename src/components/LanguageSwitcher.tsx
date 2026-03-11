import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const current = i18n.language === 'en' ? 'en' : 'es';

  const toggle = () => {
    const next = current === 'es' ? 'en' : 'es';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
      aria-label="Switch language"
    >
      <Globe className="w-3 h-3" />
      <span className="hidden xs:inline font-medium uppercase text-[10px] sm:text-xs">
        {current === 'es' ? 'ES' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
