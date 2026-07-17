import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

export interface GoverningBody {

  id: string | null;

  name: string;

  description: string;

  image: string;

}

@Component({
  selector: 'app-governing-body-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './governing-body-modal.component.html',
  styleUrl: './governing-body-modal.component.scss'
})
export class GoverningBodyModalComponent implements OnChanges {

  private fb = inject(FormBuilder);

  @Input() member: GoverningBody | null = null;

  @Output() save = new EventEmitter<FormData>();

  @Output() close = new EventEmitter<void>();

  imagePreview: string | ArrayBuffer | null = null;

  selectedFile: File | null = null;

  dragging = false;

  form = this.fb.group({

    Id: [''],

    Name: ['', Validators.required],

    Description: ['', Validators.required]

  });

  get isEditMode() {

    return !!this.member;

  }

  ngOnChanges(changes: SimpleChanges): void {

    if (this.member) {

      this.form.patchValue({

        Id: this.member.id,

        Name: this.member.name,

        Description: this.member.description

      });

      this.imagePreview = this.member.image;

      this.selectedFile = null;

    }

    else {

      this.form.reset();

      this.imagePreview = null;

      this.selectedFile = null;

    }

  }

  onDragOver(event: DragEvent) {

    event.preventDefault();

    this.dragging = true;

  }

  onDragLeave(event: DragEvent) {

    event.preventDefault();

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

  onFileChange(event: any) {

    const file = event.target.files[0];

    if (file) {

      this.loadFile(file);

    }

  }

  loadFile(file: File) {

    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = () => {

      this.imagePreview = reader.result;

    };

    reader.readAsDataURL(file);

  }

  removeImage() {

    this.selectedFile = null;

    this.imagePreview = null;

  }

  submit() {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }

    const formData = new FormData();

    formData.append('Id', this.form.value.Id ?? '');

    formData.append('Name', this.form.value.Name!);

    formData.append('Description', this.form.value.Description!);

    if (this.selectedFile) {

      formData.append('Image', this.selectedFile);

    }

    this.save.emit(formData);

  }

  cancel() {

    this.form.reset();

    this.selectedFile = null;

    this.imagePreview = null;

    this.close.emit();

  }

}
