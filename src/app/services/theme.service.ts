import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'book-reader-theme';
  private darkModeSubject = new BehaviorSubject<boolean>(false);

  public darkMode$ = this.darkModeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Check for saved theme preference or default to light mode
    const savedTheme = this.getCookie(this.THEME_KEY);
    const isDark = savedTheme === 'dark';

    this.setTheme(isDark, false); // false = don't save again
  }

  toggleTheme(): void {
    const newTheme = !this.darkModeSubject.value;
    this.setTheme(newTheme, true);
  }

  private setTheme(isDark: boolean, saveToCookie: boolean = true): void {
    this.darkModeSubject.next(isDark);

    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }

    // Save to cookie
    if (saveToCookie) {
      this.setCookie(this.THEME_KEY, isDark ? 'dark' : 'light', 365);
    }
  }

  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }

  private setCookie(name: string, value: string, days: number): void {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  }
}
