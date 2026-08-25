import { Component } from '@angular/core';
import { UnderConstructionComponent } from '../../shared/under-construction/under-construction.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [UnderConstructionComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
