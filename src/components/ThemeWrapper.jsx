import { useEffect } from 'react';
import { useUserStore } from '../store/useUserStore';

export function ThemeWrapper({ children }) {
  const { theme, font, animationsEnabled } = useUserStore((state) => state.preferences);

  useEffect(() => {
    const root = document.documentElement;

    // Aplica Dark/Light mode
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Aplica a Fonte (Sans ou Serif)
    if (font === 'serif') {
      root.style.fontFamily = 'var(--font-serif)';
    } else {
      root.style.fontFamily = 'var(--font-sans)';
    }

    // Gerencia as Animações Globais
    if (!animationsEnabled) {
      root.style.setProperty('--tw-transition-duration', '0ms');
    } else {
      root.style.removeProperty('--tw-transition-duration');
    }
  }, [theme, font, animationsEnabled]);

  return <>{children}</>;
}