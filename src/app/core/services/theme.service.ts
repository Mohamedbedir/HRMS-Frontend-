import { Injectable } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly themeKey = 'hrms-theme';

  constructor() {
    this.applyTheme(this.getTheme());
  }

  getTheme(): Theme {
    const savedTheme = localStorage.getItem(this.themeKey);

    return savedTheme === 'dark' ? 'dark' : 'light';
  }

  setTheme(theme: Theme): void {
    localStorage.setItem(this.themeKey, theme);

    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const currentTheme = this.getTheme();

    const newTheme: Theme =
      currentTheme === 'light'
        ? 'dark'
        : 'light';

    this.setTheme(newTheme);
  }

  isDarkMode(): boolean {
    return this.getTheme() === 'dark';
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute(
      'data-bs-theme',
      theme
    );
  }
}