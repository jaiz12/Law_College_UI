import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-description-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './description-modal.component.html',
  styleUrl: './description-modal.component.scss'
})
export class DescriptionModalComponent {

  @Input()
  title: string = 'Description';

  @Input()
  content: string = '';

  @Output()
  close = new EventEmitter<void>();


  closeModal(): void {
    this.close.emit();
  }

}
