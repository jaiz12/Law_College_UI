import {
  Component,
  HostListener,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../services/layout.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface UserInfo {
  userName: string;
  email: string;
  roles: [];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  constructor(private router: Router) {

  }

  layout = inject(LayoutService);

  profileMenu = signal(false);
  notificationMenu = signal(false);

  isFullscreen = signal(false);

  search = '';

  user = signal<UserInfo>({
    userName: '',
    email: '',
    roles: []
  });

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {

    const user = localStorage.getItem('user');

    if (user) {
      this.user.set(JSON.parse(user));
    }

  }


  toggleSidebar() {

    if (window.innerWidth < 1024) {
      this.layout.toggleMobileSidebar();
    } else {
      this.layout.toggleSidebar();
    }

  }

  toggleDarkMode() {
    this.layout.toggleTheme();
  }


  toggleProfile() {

    this.profileMenu.update(v => !v);
    this.notificationMenu.set(false);

  }

  toggleNotification() {

    this.notificationMenu.update(v => !v);
    this.profileMenu.set(false);

  }

  toggleFullscreen() {

    if (!document.fullscreenElement) {

      document.documentElement.requestFullscreen();

      this.isFullscreen.set(true);

    } else {

      document.exitFullscreen();

      this.isFullscreen.set(false);

    }

  }

  @HostListener('document:click')
  closeMenus() {

    this.profileMenu.set(false);
    this.notificationMenu.set(false);

  }

  logout() {

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.router.navigate(['/']);

  }

}
