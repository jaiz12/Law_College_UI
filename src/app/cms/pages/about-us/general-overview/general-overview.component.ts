import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-general-overview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule
  ],
  templateUrl: './general-overview.component.html',
  styleUrl: './general-overview.component.scss'
})
export class GeneralOverviewComponent {

  // Use the editor type expected by the CKEditor Angular component
  public Editor: any = ClassicEditor;

  selectedFile: File | null = null;

  imagePreview: string | null = null;

  pageForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.pageForm = this.fb.group({
      banner: [''],
      description: ['', Validators.required],
      metaTitle: [''],
      metaDescription: ['']
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.selectedFile = input.files[0];

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };

    reader.readAsDataURL(this.selectedFile);
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  save(): void {
    console.log(this.pageForm.value);
  }
}
