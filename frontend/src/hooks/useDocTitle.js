import { useEffect } from 'react';

/**
 * Custom hook to update document title dynamically for a11y & SEO
 * @param {string} title
 */
export function useDocTitle(title) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | CuraHealth` : 'CuraHealth - Doctor Patient Management';
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}

export default useDocTitle;
