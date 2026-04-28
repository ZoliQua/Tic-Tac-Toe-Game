import { useCallback, useState } from 'react';

export type IconStyle = 'tooth' | 'classic';

const STORAGE_KEY = 'tictactoe.iconStyle';

const read = (): IconStyle => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === 'classic' ? 'classic' : 'tooth';
  } catch {
    return 'tooth';
  }
};

const write = (value: IconStyle): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore quota / privacy mode errors
  }
};

export const useIconStyle = (): {
  style: IconStyle;
  setStyle: (next: IconStyle) => void;
  toggle: () => void;
} => {
  const [style, setStyleState] = useState<IconStyle>(() => read());

  const setStyle = useCallback((next: IconStyle) => {
    setStyleState((prev) => {
      if (prev === next) return prev;
      write(next);
      return next;
    });
  }, []);

  const toggle = useCallback(() => {
    setStyleState((prev) => {
      const next: IconStyle = prev === 'tooth' ? 'classic' : 'tooth';
      write(next);
      return next;
    });
  }, []);

  return { style, setStyle, toggle };
};
