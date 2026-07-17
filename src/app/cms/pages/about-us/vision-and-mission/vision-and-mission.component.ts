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
  selector: 'app-vision-and-mission',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    CKEditorModule],
  templateUrl: './vision-and-mission.component.html',
  styleUrl: './vision-and-mission.component.scss'
})
export class VisionAndMissionComponent {
  public Editor = ClassicEditor;

  pageForm: FormGroup;

  bannerPreview: string | ArrayBuffer | null = null;

  dragging = false;

  constructor(private fb: FormBuilder) {

    this.pageForm = this.fb.group({

      banner: [null],

      vision: [
        '',
        Validators.required
      ],

      mission: [
        '',
        Validators.required
      ],

      metaTitle: [''],

      metaDescription: [''],

      status: [true]

    });

  }

  onDragOver(event: DragEvent) {

    event.preventDefault();

    this.dragging = true;

  }

  onDragLeave() {

    this.dragging = false;

  }

  onDrop(event: DragEvent) {

    event.preventDefault();

    this.dragging = false;

    const file = event.dataTransfer?.files[0];

    if (file) {
      this.loadFile(file);
    }

  }

  onFileSelected(event: any) {

    const file = event.target.files[0];

    if (file) {
      this.loadFile(file);
    }

  }

  loadFile(file: File) {

    this.pageForm.patchValue({
      banner: file
    });

    const reader = new FileReader();

    reader.onload = () => {

      this.bannerPreview = reader.result;

    };

    reader.readAsDataURL(file);

  }

  save() {

    if (this.pageForm.invalid) {

      this.pageForm.markAllAsTouched();

      return;

    }

    console.log(this.pageForm.value);

  }
}
