import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfigService } from '../../../../../services/config.service';
import { ValidationService } from '../../../../../services/validation-service.service';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { StatutoryBodiesBody } from '../statutory-bodies.component';

@Component({
  selector: 'app-statutory-bodies-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule],
  templateUrl: './statutory-bodies-modal.component.html',
  styleUrl: './statutory-bodies-modal.component.scss'
})
export class StatutoryBodiesModalComponent implements OnChanges {

  editorConfig: any;
  constructor(private config: ConfigService) {
    this.editorConfig = this.config.get('editorConfig') || {};
  }

  public Editor: any = ClassicEditor;

  private fb = inject(FormBuilder);

  private validationService = inject(ValidationService);


  // ---------------------------------------
  // Input / Output
  // ---------------------------------------

  @Input()
  statutorybody: StatutoryBodiesBody | null = null;


  @Output()
  save = new EventEmitter<FormData>();


  @Output()
  close = new EventEmitter<void>();


  // ---------------------------------------
  // File Variables
  // ---------------------------------------

  imagePreview: string | ArrayBuffer | null = null;

  selectedFile: File | null = null;

  dragging = false;


  // ---------------------------------------
  // Form
  // ---------------------------------------

  pageForm = this.fb.group({

    id: this.fb.control<string>('', {

      nonNullable: true

    }),

    title: this.fb.control<string>('', {

      validators: [

        Validators.required,

        this.validationService.noWhitespaceValidator()

      ],

      nonNullable: true

    }),

    content: this.fb.control<string>('', {

      validators: [

        Validators.required,

        this.validationService.noWhitespaceValidator()

      ],

      nonNullable: true

    }),

    photo: this.fb.control<string>('', {

      nonNullable: true

    })

  });


  // ---------------------------------------
  // Edit Mode
  // ---------------------------------------

  get isEditMode(): boolean {

    return !!this.statutorybody;

  }


  // ---------------------------------------
  // Input Changes
  // ---------------------------------------

  ngOnChanges(changes: SimpleChanges): void {

    if (this.statutorybody) {

      this.pageForm.patchValue({

        id: this.statutorybody.id ?? '',

        title: this.statutorybody.title ?? '',

        content: this.statutorybody.content ?? '',

        photo: this.statutorybody.photo ?? ''

      });


      const photoPath =
        this.statutorybody.photo;


      if (photoPath) {

        this.imagePreview =
          this.config.get('IMAGE_API_URL') +
          photoPath;

      }

      else {

        this.imagePreview = null;

      }


      this.selectedFile = null;


      // Existing photo is valid during edit

      this.pageForm
        .get('photo')
        ?.setErrors(null);

    }

    else {

      this.pageForm.reset({

        id: '',

        title: '',

        content: '',

        photo: ''

      });


      this.imagePreview = null;

      this.selectedFile = null;


      this.pageForm
        .get('photo')
        ?.setErrors(null);

    }

  }


  // ---------------------------------------
  // File Selection
  // ---------------------------------------

  onFileChange(event: Event): void {

    const input =
      event.target as HTMLInputElement;


    if (!input.files?.length) {

      return;

    }


    const file =
      input.files[0];


    this.loadFile(file);

  }


  // ---------------------------------------
  // Load Image
  // ---------------------------------------

  loadFile(file: File): void {

    this.selectedFile = file;


    // Clear validation error

    this.pageForm
      .get('photo')
      ?.setErrors(null);


    const reader =
      new FileReader();


    reader.onload = () => {

      this.imagePreview =
        reader.result as string;

    };


    reader.readAsDataURL(file);

  }


  // ---------------------------------------
  // Drag & Drop
  // ---------------------------------------

  onDragOver(event: DragEvent): void {

    event.preventDefault();

    this.dragging = true;

  }


  onDragLeave(event: DragEvent): void {

    event.preventDefault();

    this.dragging = false;

  }


  onDrop(event: DragEvent): void {

    event.preventDefault();

    this.dragging = false;


    const file =
      event.dataTransfer?.files[0];


    if (file) {

      this.loadFile(file);

    }

  }


  // ---------------------------------------
  // Remove Image
  // ---------------------------------------

  removeImage(): void {

    this.selectedFile = null;

    this.imagePreview = null;


    this.pageForm
      .get('photo')
      ?.setValue('');


    const id =
      this.pageForm.get('id')?.value;


    // Photo is required only for CREATE

    if (!id) {

      this.pageForm
        .get('photo')
        ?.setErrors({

          required: true

        });

    }

  }


  // ---------------------------------------
  // Submit
  // ---------------------------------------

  submit(): void {
    console.log("test", this.pageForm.value);

    // CREATE validation

    const id =
      this.pageForm.get('id')?.value;


    if (!id && !this.selectedFile) {

      this.pageForm
        .get('photo')
        ?.setErrors({

          required: true

        });

    }


    // EDIT mode allows existing image

    if (id && (this.selectedFile || this.imagePreview)) {

      this.pageForm
        .get('photo')
        ?.setErrors(null);

    }


    if (this.pageForm.invalid) {

      this.pageForm.markAllAsTouched();

      return;

    }


    const formData =
      new FormData();


    // Id

    if (id) {

      formData.append(

        'Id',

        id

      );

    }


    // Title

    formData.append(

      'Title',

      this.pageForm
        .get('title')
        ?.value ?? ''

    );

    // content

    formData.append(

      'Content',

      this.pageForm
        .get('content')
        ?.value ?? ''

    );


    // Photo

    if (this.selectedFile) {

      formData.append(

        'Photo',

        this.selectedFile,

        this.selectedFile.name

      );

    }

    this.save.emit(formData);

  }


  // ---------------------------------------
  // Cancel
  // ---------------------------------------

  cancel(): void {

    this.pageForm.reset();

    this.selectedFile = null;

    this.imagePreview = null;

    this.close.emit();

  }

}
