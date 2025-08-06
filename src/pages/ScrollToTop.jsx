import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Don’t scroll if we’re intentionally jumping to #features
    if (hash === '#features') return;

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;           // nothing to render
}
export default ScrollToTop;
