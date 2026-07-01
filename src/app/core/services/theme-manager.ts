import { computed, effect, Injectable, signal } from '@angular/core';
import { ThemeInterface } from '../../interfaces/theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeManagerService {
  private appTheme = signal<'light' | 'dark' | 'system'>('system');

  private themes: ThemeInterface[] = [
    { name: 'light', icon: 'light_mode' },
    { name: 'dark', icon: 'dark_mode' },
    { name: 'system', icon: 'desktop_windows' },
  ];

  selectedTheme = computed(() => this.themes.find((t) => t.name === this.appTheme()));

  getThemes() {
    return this.themes;
  }

  setTheme(theme: 'light' | 'dark' | 'system') {
    this.appTheme.set(theme);
  }

  constructor() {
    effect(() => {
      const appTheme = this.appTheme();

      const colorScheme = appTheme === 'system' ? 'light dark' : appTheme;
      document.body.style.setProperty('color-scheme', colorScheme);

      const resolvedTheme =
        appTheme === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : appTheme;

      document.body.setAttribute('data-theme', resolvedTheme);
    });
  }
}
