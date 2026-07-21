import { useState, useEffect, useRef } from 'react';

/**
 * Returns `true` when the navbar should be visible (at top, or scrolling up),
 * `false` when the user is scrolling down past the threshold.
 */
export function useScrollDirection(threshold = 12) {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        if (currentScrollY < 50) {
          // Always show near the top
          setVisible(true);
        } else if (currentScrollY - lastScrollY.current > threshold) {
          // Scrolling down past threshold → hide
          setVisible(false);
        } else if (lastScrollY.current - currentScrollY > threshold) {
          // Scrolling up past threshold → show
          setVisible(true);
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return visible;
}
