import { Component } from '@angular/core';
import { UnderConstructionComponent } from '../../shared/under-construction/under-construction.component';
import { AlbumComponent } from './album/album.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-media-gallery',
  standalone: true,
  imports: [UnderConstructionComponent, CommonModule,
    AlbumComponent],
  templateUrl: './media-gallery.component.html',
  styleUrl: './media-gallery.component.scss'
})
export class MediaGalleryComponent {

}
