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


import { ValidationService } from '../../../../../services/validation-service.service';
import { SeminarWebinar } from '../seminars-and-webinars.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';



@Component({

  selector:

    'app-seminars-and-webinars-modal',

  standalone:

    true,

  imports: [

    CommonModule,

    ReactiveFormsModule,

    CKEditorModule

  ],

  templateUrl:

    './seminars-and-webinars-modal.component.html',

  styleUrl:

    './seminars-and-webinars-modal.component.scss'

})


export class SeminarsAndWebinarsModalComponent

  implements OnChanges {

  // Use the editor type expected by the CKEditor Angular component
  public Editor: any = ClassicEditor;

  private fb =

    inject(FormBuilder);


  private validationService =

    inject(ValidationService);


  @Input()

  seminarWebinar:

    SeminarWebinar | null = null;


  @Input()

  seminarsWebinars:

    SeminarWebinar[] = [];


  @Output()

  save =

    new EventEmitter<SeminarWebinar>();


  @Output()

  close =

    new EventEmitter<void>();


  imagePreview:

    string | ArrayBuffer | null = null;


  selectedFile:

    File | null = null;


  pageForm =

    this.fb.group({


      Id:

        this.fb.control<number | null>(null),


      Title:

        this.fb.control('', {

          validators: [

            Validators.required,

            this.validationService

              .noWhitespaceValidator()

          ],

          nonNullable: true

        }),


      ShortDescription:

        this.fb.control('', {

          validators: [

            Validators.required,

            this.validationService

              .noWhitespaceValidator()

          ],

          nonNullable: true

        }),


      Content:

        this.fb.control('', {

          validators: [

            Validators.required,

            this.validationService

              .noWhitespaceValidator()

          ],

          nonNullable: true

        }),


      Image:

        this.fb.control<string | null>(null),


      AttachmentUrl:

        this.fb.control(''),


      EventDate:

        this.fb.control('', {

          validators: [

            Validators.required

          ],

          nonNullable: true

        }),


      StartTime:

        this.fb.control(''),


      EndTime:

        this.fb.control(''),


      Venue:

        this.fb.control(''),


      Speaker:

        this.fb.control(''),


      IsFeatured:

        this.fb.control(false, {

          nonNullable: true

        }),


      IsImportant:

        this.fb.control(false, {

          nonNullable: true

        })

    });


  get isEditMode(): boolean {

    return !!this.seminarWebinar;

  }


  ngOnChanges(

    changes: SimpleChanges

  ): void {


    if (this.seminarWebinar) {


      this.pageForm.patchValue({

        Id:

          this.seminarWebinar.Id,


        Title:

          this.seminarWebinar.Title,


        ShortDescription:

          this.seminarWebinar.ShortDescription,


        Content:

          this.seminarWebinar.Content,


        Image:

          this.seminarWebinar.Image,


        AttachmentUrl:

          this.seminarWebinar.AttachmentUrl,


        EventDate:

          this.seminarWebinar.EventDate,


        StartTime:

          this.seminarWebinar.StartTime,


        EndTime:

          this.seminarWebinar.EndTime,


        Venue:

          this.seminarWebinar.Venue,


        Speaker:

          this.seminarWebinar.Speaker,


        IsFeatured:

          this.seminarWebinar.IsFeatured,


        IsImportant:

          this.seminarWebinar.IsImportant

      });


      this.imagePreview =

        this.seminarWebinar.Image;

    }

    else {


      this.pageForm.reset({

        Id:

          null,


        Title:

          '',


        ShortDescription:

          '',


        Content:

          '',


        Image:

          null,


        AttachmentUrl:

          '',


        EventDate:

          '',


        StartTime:

          '',


        EndTime:

          '',


        Venue:

          '',


        Speaker:

          '',


        IsFeatured:

          false,


        IsImportant:

          false

      });


      this.imagePreview =

        null;

    }


    this.selectedFile =

      null;

  }


  // ---------------------------------------
  // File
  // ---------------------------------------

  onFileChange(

    event: Event

  ): void {


    const input =

      event.target as HTMLInputElement;


    if (!input.files?.length) {

      return;

    }


    this.selectedFile =

      input.files[0];


    const reader =

      new FileReader();


    reader.onload = () => {


      this.imagePreview =

        reader.result;

    };


    reader.readAsDataURL(

      this.selectedFile

    );

  }


  removeImage(): void {


    this.selectedFile =

      null;


    this.imagePreview =

      null;


    this.pageForm.patchValue({

      Image:

        null

    });

  }


  // ---------------------------------------
  // Submit
  // ---------------------------------------

  submit(): void {


    if (this.pageForm.invalid) {


      this.pageForm.markAllAsTouched();

      return;

    }


    const value =

      this.pageForm.getRawValue();


    this.save.emit({

      Id:

        value.Id ?? 0,


      Title:

        value.Title,


      ShortDescription:

        value.ShortDescription,


      Content:

        value.Content,


      Image:

        this.imagePreview as string | null,


      ImageFile:

        this.selectedFile,


      AttachmentUrl:

        value.AttachmentUrl ||


        undefined,


      EventDate:

        value.EventDate,


      StartTime:

        value.StartTime ||


        undefined,


      EndTime:

        value.EndTime ||


        undefined,


      Venue:

        value.Venue ||


        undefined,


      Speaker:

        value.Speaker ||


        undefined,


      IsFeatured:

        value.IsFeatured,


      IsImportant:

        value.IsImportant

    });

  }


  cancel(): void {

    this.close.emit();

  }

}
