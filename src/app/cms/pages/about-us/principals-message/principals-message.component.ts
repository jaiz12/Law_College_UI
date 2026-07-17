import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-principals-message',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule
  ],
  templateUrl: './principals-message.component.html'
})
export class PrincipalsMessageComponent {

  public Editor = ClassicEditor;

  pageForm: FormGroup;

  imagePreview: string | ArrayBuffer | null = null;

  selectedFile!: File;

  isDragging = false;

  constructor(private fb: FormBuilder) {

    this.pageForm = this.fb.group({

      metaTitle: ['', Validators.required],

      metaDescription: ['', Validators.required],

      description: ['', Validators.required],

      status: [true]

    });

  }

  //---------------------------------
  // Browse
  //---------------------------------

  onFileSelected(event: any) {

    const file = event.target.files[0];

    if (file) {

      this.selectedFile = file;

      this.preview(file);

    }

  }

  //---------------------------------
  // Drag Drop
  //---------------------------------

  onDragOver(event: DragEvent) {

    event.preventDefault();

    this.isDragging = true;

  }

  onDragLeave(event: DragEvent) {

    event.preventDefault();

    this.isDragging = false;

  }

  onDrop(event: DragEvent) {

    event.preventDefault();

    this.isDragging = false;

    if (event.dataTransfer?.files.length) {

      this.selectedFile = event.dataTransfer.files[0];

      this.preview(this.selectedFile);

    }

  }

  //---------------------------------

  preview(file: File) {

    const reader = new FileReader();

    reader.onload = () => {

      this.imagePreview = reader.result;

    };

    reader.readAsDataURL(file);

  }

  //---------------------------------

  save() {

    if (this.pageForm.invalid)
      return;

    const formData = new FormData();

    formData.append(
      'image',
      this.selectedFile
    );

    formData.append(
      'description',
      this.pageForm.value.description
    );

    formData.append(
      'metaTitle',
      this.pageForm.value.metaTitle
    );

    formData.append(
      'metaDescription',
      this.pageForm.value.metaDescription
    );

    formData.append(
      'status',
      this.pageForm.value.status
    );

    console.log(formData);

    // API Call

  }

}
