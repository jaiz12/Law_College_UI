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
  imports: [CommonModule,
    ReactiveFormsModule,
    CKEditorModule],
  templateUrl: './general-overview.component.html',
  styleUrl: './general-overview.component.scss'
})
export class GeneralOverviewComponent {

  public Editor = ClassicEditor;

  selectedFile!: File;

  pageForm: FormGroup;

  imagePreview: string | null = null;

  constructor(private fb: FormBuilder) {

    this.pageForm = this.fb.group({

      banner: [''],

      description: [
        '',
        Validators.required
      ],

      metaTitle: [''],

      metaDescription: [''],

    });

  }
  

  removeImage() {

    this.selectedFile = null!;

    this.imagePreview = null;

  }

  onFileChange(event: any) {

    const file = event.target.files[0];

    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = () => {

      this.imagePreview = reader.result as string;

    };

    reader.readAsDataURL(file);

  }

  save() {

    console.log(this.pageForm.value);

    // Upload image
    // Save page
  }
}
