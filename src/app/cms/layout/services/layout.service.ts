import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  /**
   * Desktop Sidebar
   */
  sidebarCollapsed = signal(false);

  /**
   * Mobile Sidebar
   */
  mobileSidebarOpen = signal(false);

  /**
   * Dark Mode
   */
  darkMode = signal(false);

  constructor() {

    // Restore saved theme
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
      this.darkMode.set(savedTheme === 'dark');
    } else {
      // Optional: use system preference
      this.darkMode.set(
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    }

    // Apply theme whenever it changes
    effect(() => {

      const isDark = this.darkMode();

      document.documentElement.classList.toggle('dark', isDark);

      localStorage.setItem(
        'theme',
        isDark ? 'dark' : 'light'
      );

    });

  }

  /**
   * Toggle Desktop Sidebar
   */
  toggleSidebar(): void {
    this.sidebarCollapsed.update(value => !value);
  }

  /**
   * Expand Desktop Sidebar
   */
  openSidebar(): void {
    this.sidebarCollapsed.set(false);
  }

  /**
   * Collapse Desktop Sidebar
   */
  closeSidebar(): void {
    this.sidebarCollapsed.set(true);
  }

  /**
   * Toggle Mobile Sidebar
   */
  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update(value => !value);
  }

  /**
   * Open Mobile Sidebar
   */
  openMobileSidebar(): void {
    this.mobileSidebarOpen.set(true);
  }

  /**
   * Close Mobile Sidebar
   */
  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  /**
   * Toggle Dark Mode
   */
  toggleTheme(): void {
    this.darkMode.update(value => !value);
  }

  /**
   * Enable Dark Mode
   */
  enableDarkMode(): void {
    this.darkMode.set(true);
  }

  /**
   * Disable Dark Mode
   */
  disableDarkMode(): void {
    this.darkMode.set(false);
  }

}
