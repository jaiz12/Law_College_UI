import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

  constructor(
    private sanitizer: DomSanitizer

  ) { }

  getSafeHtml(content: string | null | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content ?? '');
  }


  closeModal(): void {
    this.close.emit();
  }

}
