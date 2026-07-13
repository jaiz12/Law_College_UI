import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  layout = inject(LayoutService);
}
