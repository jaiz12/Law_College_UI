import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  OnChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
export interface ProgramCurriculum {

  id: string | null;

  programName: string;

  programType: string;

  duration: string;

  description: string;

  image: string;

  pdf: string;

  displayOrder: number;


}

@Component({
  selector: 'app-program-and-curriculum-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule
  ],
  templateUrl: './program-and-curriculum-modal.component.html',
  styleUrl: './program-and-curriculum-modal.component.scss'
})

export class ProgramAndCurriculumModalComponent implements OnChanges {

  @Input() program: ProgramCurriculum | null = null;

  @Output() close = new EventEmitter<void>();

  @Output() save = new EventEmitter<FormData>();


  public Editor = ClassicEditor;

  submitted = false;

  imagePreview: string | ArrayBuffer | null = null;

  pdfName = '';

  imageFile!: File | null;

  pdfFile!: File | null;

  isDraggingImage = false;

  isDraggingPdf = false;

  form: FormGroup;

  constructor(private fb: FormBuilder) {

    this.form = this.fb.group({

      programName: [
        '',
        Validators.required
      ],

      programType: [
        '',
        Validators.required
      ],

      duration: [
        '',
        Validators.required
      ],

      description: [
        '',
        Validators.required
      ],

      displayOrder: [
        1,
        Validators.required
      ]

    });

  }

  get f() {

    return this.form.controls;

  }

  get isEditMode() {

    return !!this.program;

  }

  ngOnChanges(changes: SimpleChanges): void {

    if (!this.program) {

      this.form.reset({

        displayOrder: 1,

        status: true

      });

      this.imagePreview = null;

      this.pdfName = '';

      this.imageFile = null;

      this.pdfFile = null;

      this.submitted = false;

      return;

    }

    this.form.patchValue({

      programName: this.program.programName,

      programType: this.program.programType,

      duration: this.program.duration,

      description: this.program.description,

      displayOrder: this.program.displayOrder

    });

    this.imagePreview = this.program.image;

    this.pdfName = this.program.pdf;

    this.imageFile = null;

    this.pdfFile = null;

    this.submitted = false;

  }

  onImageSelected(event: any) {

    const file = event.target.files[0];

    if (!file) return;

    this.imageFile = file;

    const reader = new FileReader();

    reader.onload = () => {

      this.imagePreview = reader.result;

    };

    reader.readAsDataURL(file);

  }

  onPdfSelected(event: any) {

    const file = event.target.files[0];

    if (!file) return;

    this.pdfFile = file;

    this.pdfName = file.name;

  }

  onImageDrop(event: DragEvent) {

    event.preventDefault();

    this.isDraggingImage = false;

    if (!event.dataTransfer?.files.length) return;

    this.imageFile = event.dataTransfer.files[0];

    const reader = new FileReader();

    reader.onload = () => {

      this.imagePreview = reader.result;

    };

    reader.readAsDataURL(this.imageFile);

  }

  onPdfDrop(event: DragEvent) {

    event.preventDefault();

    this.isDraggingPdf = false;

    if (!event.dataTransfer?.files.length) return;

    this.pdfFile = event.dataTransfer.files[0];

    this.pdfName = this.pdfFile.name;

  }

  allowDrop(event: DragEvent) {

    event.preventDefault();

  }

  imageDragEnter() {

    this.isDraggingImage = true;

  }

  imageDragLeave() {

    this.isDraggingImage = false;

  }

  pdfDragEnter() {

    this.isDraggingPdf = true;

  }

  pdfDragLeave() {

    this.isDraggingPdf = false;

  }

  //-----------------------------------
  // Submit
  //-----------------------------------

  submit(): void {

    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = new FormData();

    if (this.program?.id) {
      formData.append('Id', this.program.id);
    }

    formData.append('ProgramName', this.form.value.programName);
    formData.append('ProgramType', this.form.value.programType);
    formData.append('Duration', this.form.value.duration);
    formData.append('Description', this.form.value.description);
    formData.append('DisplayOrder', this.form.value.displayOrder.toString());
    formData.append('Status', this.form.value.status.toString());

    if (this.imageFile) {
      formData.append('Image', this.imageFile);
    }

    if (this.pdfFile) {
      formData.append('Pdf', this.pdfFile);
    }

    this.save.emit(formData);

  }

  //-----------------------------------
  // Cancel
  //-----------------------------------

  cancel(): void {

    this.close.emit();

  }

}
