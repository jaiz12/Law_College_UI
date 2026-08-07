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

import {

  ValidationService

} from '../../../../../services/validation-service.service';

import {

  Announcement

} from '../announcements.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';


@Component({

  selector:
    'app-announcements-modal',

  standalone:
    true,

  imports: [

    CommonModule,

    ReactiveFormsModule,

    CKEditorModule

  ],

  templateUrl:

    './announcements-modal.component.html',

  styleUrl:

    './announcements-modal.component.scss'

})


export class AnnouncementsModalComponent

  implements OnChanges {

  // Use the editor type expected by the CKEditor Angular component
  public Editor: any = ClassicEditor;

  private fb =
    inject(FormBuilder);


  private validationService =
    inject(ValidationService);


  // =================================================
  // Inputs
  // =================================================

  @Input()

  announcement:
    Announcement | null = null;


  @Input()

  announcements:
    Announcement[] = [];


  // =================================================
  // Outputs
  // =================================================

  @Output()

  save =
    new EventEmitter<Announcement>();


  @Output()

  close =
    new EventEmitter<void>();


  // =================================================
  // Image
  // =================================================

  imagePreview:
    string | ArrayBuffer | null = null;


  selectedFile:
    File | null = null;


  // =================================================
  // Form
  // =================================================

  pageForm = this.fb.group({


    Id:

      this.fb.control<number | null>(

        null

      ),


    Title:

      this.fb.control(

        '',

        {

          validators: [

            Validators.required,

            this.validationService

              .noWhitespaceValidator()

          ],

          nonNullable: true

        }

      ),


    ShortDescription:

      this.fb.control(

        '',

        {

          validators: [

            Validators.required,

            this.validationService

              .noWhitespaceValidator()

          ],

          nonNullable: true

        }

      ),


    Content:

      this.fb.control(

        '',

        {

          validators: [

            Validators.required,

            this.validationService

              .noWhitespaceValidator()

          ],

          nonNullable: true

        }

      ),


    AttachmentUrl:

      this.fb.control(

        '',

        {

          validators: [

            Validators.pattern(

              /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/

            )

          ],

          nonNullable: true

        }

      ),


    PublishDate:

      this.fb.control(

        '',

        {

          validators: [

            Validators.required

          ],

          nonNullable: true

        }

      ),


    ExpiryDate:

      this.fb.control(

        '',

        {

          nonNullable: true

        }

      ),


    IsFeatured:

      this.fb.control(

        false,

        {

          nonNullable: true

        }

      ),


    IsImportant:

      this.fb.control(

        false,

        {

          nonNullable: true

        }

      ),


    image:

      this.fb.control<string | null>(

        null

      )


  });


  // =================================================
  // Edit Mode
  // =================================================

  get isEditMode(): boolean {


    return !!this.announcement;


  }


  // =================================================
  // Changes
  // =================================================

  ngOnChanges(

    changes:
      SimpleChanges

  ): void {


    if (

      this.announcement

    ) {


      this.pageForm.patchValue({


        Id:

          this.announcement.Id,


        Title:

          this.announcement.Title,


        ShortDescription:

          this.announcement.ShortDescription,


        Content:

          this.announcement.Content,


        AttachmentUrl:

          this.announcement.AttachmentUrl || '',


        PublishDate:

          this.formatDateForInput(

            this.announcement.PublishDate

          ),


        ExpiryDate:

          this.announcement.ExpiryDate

            ? this.formatDateForInput(

              this.announcement.ExpiryDate

            )

            : '',


        IsFeatured:

          this.announcement.IsFeatured,


        IsImportant:

          this.announcement.IsImportant,


        image:

          this.announcement.image


      });


      this.imagePreview =

        this.announcement.image;


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


        AttachmentUrl:
          '',


        PublishDate:
          '',


        ExpiryDate:
          '',


        IsFeatured:
          false,


        IsImportant:
          false,


        image:
          null


      });


      this.imagePreview =
        null;

    }


    this.selectedFile =
      null;


  }


  // =================================================
  // Date Formatting
  // =================================================

  private formatDateForInput(

    date:
      string

  ): string {


    if (!date) {


      return '';

    }


    return new Date(date)

      .toISOString()

      .split('T')[0];

  }


  // =================================================
  // Image Change
  // =================================================

  onFileChange(

    event:
      Event

  ): void {


    const input =

      event.target as HTMLInputElement;


    if (

      !input.files ||

      input.files.length === 0

    ) {


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


  // =================================================
  // Remove Image
  // =================================================

  removeImage(): void {


    this.selectedFile =
      null;


    this.imagePreview =
      null;


    this.pageForm.patchValue({


      image:
        null


    });


  }


  // =================================================
  // Submit
  // =================================================

  submit(): void {


    if (

      this.pageForm.invalid

    ) {


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


      image:

        this.imagePreview as

        string | null,


      imageFile:

        this.selectedFile,


      AttachmentUrl:

        value.AttachmentUrl ||


        undefined,


      PublishDate:

        value.PublishDate,


      ExpiryDate:

        value.ExpiryDate ||


        undefined,


      IsFeatured:

        value.IsFeatured,


      IsImportant:

        value.IsImportant


    });


  }


  // =================================================
  // Cancel
  // =================================================

  cancel(): void {


    this.close.emit();


  }


}
