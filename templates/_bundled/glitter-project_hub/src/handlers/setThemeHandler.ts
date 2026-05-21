


const logger = ((window as any).G7Core?.createLogger?.('Handler:SetTheme')) ?? {
    log: (...args: unknown[]) => console.log('[Handler:SetTheme]', ...args),
    warn: (...args: unknown[]) => console.warn('[Handler:SetTheme]', ...args),
    error: (...args: unknown[]) => console.error('[Handler:SetTheme]', ...args),
};


export type ThemeMode = 'auto' | 'light' | 'dark';


const VALID_THEMES: ThemeMode[] = ['auto', 'light', 'dark'];


const STORAGE_KEY = 'g7_color_scheme';


const getEffectiveTheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return mode;
};


const applyTheme = (mode: ThemeMode): void => {
  const effectiveTheme = getEffectiveTheme(mode);
  document.documentElement.setAttribute('data-theme', effectiveTheme);

  
  if (effectiveTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};


export function initTheme(): void {
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const theme = savedTheme && VALID_THEMES.includes(savedTheme) ? savedTheme : 'auto';
    applyTheme(theme);
    logger.log('Initial theme applied:', theme);
  } catch (error) {
    logger.warn('Failed to load initial theme:', error);
    applyTheme('auto');
  }
}


export async function initThemeHandler(
  action: any,
  _context?: any
): Promise<void> {
  
  const targetTheme = action?.target;

  
  if (targetTheme && typeof targetTheme === 'string' && VALID_THEMES.includes(targetTheme as ThemeMode)) {
    applyTheme(targetTheme as ThemeMode);
    return;
  }

  
  initTheme();
}


export async function setThemeHandler(
  action: any,
  _context?: any
): Promise<void> {
  
  let theme: string | undefined;

  
  if (action?.target && typeof action.target === 'string' && !action.target.includes('{{')) {
    theme = action.target;
  }

  
  if (!theme || typeof theme !== 'string') {
    logger.warn('Invalid theme:', theme);
    return;
  }

  if (!VALID_THEMES.includes(theme as ThemeMode)) {
    logger.warn('Unsupported theme:', theme);
    return;
  }

  const validTheme = theme as ThemeMode;

  
  try {
    localStorage.setItem(STORAGE_KEY, validTheme);
  } catch (error) {
    logger.error('Failed to save theme to localStorage:', error);
    return;
  }

  
  applyTheme(validTheme);

  logger.log('Theme changed to:', validTheme);
}
