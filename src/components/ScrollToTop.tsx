import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ScrollToTop runs on every navigation and ensures the window is at the top.
// Using useLayoutEffect prevents a visible scroll flash on navigation.
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // run before paint to avoid flashes
      const id = window.requestAnimationFrame(() => {
        if (hash) {
          const el = document.querySelector(hash);
          if (el) {
            el.scrollIntoView({ block: 'start', inline: 'nearest' });
            return;
          }
        }
        window.scrollTo(0, 0);
      });

      return () => window.cancelAnimationFrame(id);
    } catch (e) {
      // final fallback
      if (typeof document !== 'undefined') {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
