import { Component } from '@angular/core';
import { UnderConstructionComponent } from '../../../shared/under-construction/under-construction.component';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [UnderConstructionComponent],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss'
})
export class LibraryComponent {

}
