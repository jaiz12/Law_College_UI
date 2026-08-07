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

import {

  ProgramOffered

} from '../programs-offered.component';


@Component({

  selector:

    'app-programs-offered-modal',

  standalone:

    true,

  imports: [

    CommonModule,

    ReactiveFormsModule

  ],

  templateUrl:

    './programs-offered-modal.component.html',

  styleUrl:

    './programs-offered-modal.component.scss'

})


export class ProgramsOfferedModalComponent

  implements OnChanges {


  private fb =

    inject(FormBuilder);


  private validationService =

    inject(ValidationService);


  @Input()

  program:

    ProgramOffered | null = null;


  @Input()

  programs:

    ProgramOffered[] = [];


  @Output()

  save =

    new EventEmitter<ProgramOffered>();


  @Output()

  close =

    new EventEmitter<void>();


  imagePreview:

    string |

    ArrayBuffer |

    null = null;


  selectedFile:

    File | null = null;


  // =================================================
  // Form
  // =================================================

  pageForm =

    this.fb.group({


      Id:

        this.fb.control<number | null>(

          null

        ),


      Name:

        this.fb.control(

          '',

          {

            validators: [

              Validators.required,

              this.validationService

                .noWhitespaceValidator()

            ],

            nonNullable:

              true

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

            nonNullable:

              true

          }

        ),


      Description:

        this.fb.control(

          '',

          {

            validators: [

              Validators.required,

              this.validationService

                .noWhitespaceValidator()

            ],

            nonNullable:

              true

          }

        ),


      Duration:

        this.fb.control(

          '',

          {

            validators: [

              Validators.required,

              this.validationService

                .noWhitespaceValidator()

            ],

            nonNullable:

              true

          }

        ),


      Eligibility:

        this.fb.control(

          '',

          {

            validators: [

              Validators.required,

              this.validationService

                .noWhitespaceValidator()

            ],

            nonNullable:

              true

          }

        ),


      DegreeType:

        this.fb.control(

          '',

          {

            validators: [

              Validators.required,

              this.validationService

                .noWhitespaceValidator()

            ],

            nonNullable:

              true

          }

        ),


      ExternalUrl:

        this.fb.control(

          '',

          {

            validators: [

              Validators.pattern(

                /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/

              )

            ],

            nonNullable:

              true

          }

        ),


      DisplayOrder:

        this.fb.control(

          1,

          {

            validators: [

              Validators.required,

              Validators.min(1)

            ],

            nonNullable:

              true

          }

        ),


      IsFeatured:

        this.fb.control(

          false,

          {

            nonNullable:

              true

          }

        ),


      IsActive:

        this.fb.control(

          true,

          {

            nonNullable:

              true

          }

        )

    });


  // =================================================
  // Edit Mode
  // =================================================

  get isEditMode(): boolean {


    return !!this.program;

  }


  // =================================================
  // Changes
  // =================================================

  ngOnChanges(

    changes: SimpleChanges

  ): void {


    if (

      this.program

    ) {


      this.pageForm.patchValue({


        Id:

          this.program.Id,


        Name:

          this.program.Name,


        ShortDescription:

          this.program.ShortDescription,


        Description:

          this.program.Description,


        Duration:

          this.program.Duration,


        Eligibility:

          this.program.Eligibility,


        DegreeType:

          this.program.DegreeType,


        ExternalUrl:

          this.program.ExternalUrl,


        DisplayOrder:

          this.program.DisplayOrder,


        IsFeatured:

          this.program.IsFeatured,


        IsActive:

          this.program.IsActive

      });


      this.imagePreview =

        this.program.Image;

    }


    else {


      this.pageForm.reset({


        Id:

          null,


        Name:

          '',


        ShortDescription:

          '',


        Description:

          '',


        Duration:

          '',


        Eligibility:

          '',


        DegreeType:

          '',


        ExternalUrl:

          '',


        DisplayOrder:

          this.programs.length + 1,


        IsFeatured:

          false,


        IsActive:

          true

      });


      this.imagePreview =

        null;

    }


    this.selectedFile =

      null;

  }


  // =================================================
  // Image
  // =================================================

  onFileChange(

    event: Event

  ): void {


    const input =

      event.target as HTMLInputElement;


    if (

      !input.files ||

      !input.files.length

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


      Name:

        value.Name,


      ShortDescription:

        value.ShortDescription,


      Description:

        value.Description,


      Duration:

        value.Duration,


      Eligibility:

        value.Eligibility,


      DegreeType:

        value.DegreeType,


      Image:

        this.imagePreview as

        string | null,


      ImageFile:

        this.selectedFile,


      ExternalUrl:

        value.ExternalUrl,


      DisplayOrder:

        value.DisplayOrder,


      IsFeatured:

        value.IsFeatured,


      IsActive:

        value.IsActive

    });

  }


  // =================================================
  // Cancel
  // =================================================

  cancel(): void {


    this.close.emit();

  }


}
