import {
  Component,
  HostListener,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../services/layout.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  layout = inject(LayoutService);

  profileMenu = signal(false);
  notificationMenu = signal(false);

  isFullscreen = signal(false);

  search = '';

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

}
