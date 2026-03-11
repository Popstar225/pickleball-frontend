import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const next = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="text-white/60 hover:text-white transition-colors text-xs font-medium px-1"
    >
      {i18n.language === 'es' ? 'EN' : 'ES'}
    </button>
  );
};

export default LanguageSwitcher;
