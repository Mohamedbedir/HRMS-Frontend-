import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TokenService } from '../../core/services/token.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-admin-layout',
  styleUrl: './admin-layout.css',
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);

  private readonly themeService = inject(ThemeService);
  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  sidebarCollapsed = false;

  get userEmail(): string {
    return this.tokenService.getEmail() || 'Admin';
  }

  get userName(): string {
    return this.userEmail.split('@')[0];
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }
}
