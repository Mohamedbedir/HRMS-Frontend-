import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { TokenService } from '../../core/services/token.service';
import { ThemeService } from '../../core/services/theme.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet,RouterLink,RouterLinkActive],
  selector: 'app-recruiter-layout',
  styleUrl: './recruiter-layout.css',
  templateUrl: './recruiter-layout.html',
})
export class RecruiterLayout {
  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);

  private readonly themeService = inject(ThemeService);
  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  sidebarCollapsed = true;

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
