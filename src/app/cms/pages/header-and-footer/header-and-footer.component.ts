import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ContactUsDetailsComponent } from './contact-us-details/contact-us-details.component';
import { GoogleMapComponent } from './google-map/google-map.component';
import { ImportantLinksComponent } from './important-links/important-links.component';
import { SocialMediaComponent } from './social-media/social-media.component';
import { LogoAndTitleComponent } from './logo-and-title/logo-and-title.component';

@Component({
  selector: 'app-header-and-footer',
  standalone: true,
  imports: [CommonModule, LogoAndTitleComponent, ContactUsDetailsComponent, ImportantLinksComponent, GoogleMapComponent, SocialMediaComponent],
  templateUrl: './header-and-footer.component.html',
  styleUrl: './header-and-footer.component.scss'
})
export class HeaderAndFooterComponent {
  activeTab = signal('logo-and-title');
}
