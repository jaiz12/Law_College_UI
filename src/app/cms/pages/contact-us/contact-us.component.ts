import { Component, signal } from '@angular/core';
import { ContactUsDetailsComponent } from './contact-us-details/contact-us-details.component';
import { ImportantLinksComponent } from './important-links/important-links.component';
import { GoogleMapComponent } from './google-map/google-map.component';
import { CommonModule } from '@angular/common';
import { SocialMediaComponent } from './social-media/social-media.component';




@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, ContactUsDetailsComponent, ImportantLinksComponent, GoogleMapComponent, SocialMediaComponent],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss'
})
export class ContactUsComponent {
  activeTab = signal('contact');

}
