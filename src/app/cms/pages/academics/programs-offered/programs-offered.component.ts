import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit,
  computed,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { NgxPaginationModule } from 'ngx-pagination';

import { ToastrService } from 'ngx-toastr';

import Swal from 'sweetalert2';

import { CmsApiService } from '../../../../services/cms-api-service.service';

import { ConfigService } from '../../../../services/config.service';

import {
  ProgramsOfferedModalComponent
} from './programs-offered-modal/programs-offered-modal.component';


// =================================================
// Interface
// =================================================

export interface ProgramOffered {

  Id: number;

  Name: string;

  ShortDescription: string;

  Description: string;

  Duration: string;

  Eligibility: string;

  DegreeType: string;

  Image: string | null;

  ImageFile: File | null;

  ExternalUrl: string;

  DisplayOrder: number;

  IsFeatured: boolean;

  IsActive: boolean;

}


// =================================================
// Component
// =================================================

@Component({

  selector: 'app-programs-offered',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    NgxPaginationModule,

    ProgramsOfferedModalComponent

  ],

  templateUrl:

    './programs-offered.component.html',

  styleUrl:

    './programs-offered.component.scss'

})


export class ProgramsOfferedComponent

  implements OnInit {


  constructor(

    private apiService: CmsApiService,

    private toastr: ToastrService,

    private config: ConfigService

  ) { }


  // =================================================
  // Signals
  // =================================================

  search = signal('');

  showModal = signal(false);

  page = signal(1);

  itemsPerPage = signal(5);

  pageSizeOptions = [

    5,

    10,

    20,

    50

  ];


  programs =

    signal<ProgramOffered[]>([]);


  selectedProgram =

    signal<ProgramOffered | null>(null);


  imageURL = signal('');

  loggedInId = signal('');


  // =================================================
  // Init
  // =================================================

  ngOnInit(): void {


    this.imageURL.set(

      this.config.get(

        'IMAGE_API_URL'

      )

    );


    this.getPrograms();


    const userString =

      localStorage.getItem(

        'user'

      );


    if (userString) {


      const user =

        JSON.parse(

          userString

        );


      this.loggedInId.set(

        user.id

      );

    }

  }


  // =================================================
  // Filter
  // =================================================

  filteredPrograms = computed(() => {


    const keyword =

      this.search()

        .trim()

        .toLowerCase();


    if (!keyword) {

      return this.programs();

    }


    return this.programs()

      .filter(program =>


        program.Name

          .toLowerCase()

          .includes(keyword)


        ||


        program.ShortDescription

          .toLowerCase()

          .includes(keyword)


        ||


        program.DegreeType

          .toLowerCase()

          .includes(keyword)


        ||


        program.Duration

          .toLowerCase()

          .includes(keyword)


      );

  });


  // =================================================
  // Get Programs
  // =================================================

  getPrograms(): void {


    this.apiService

      .GetRequest(

        'ProgramsOffered'

      )

      .subscribe({


        next: (res: any) => {


          const data =

            Array.isArray(res)

              ? res

              : res.data || [];


          const list:

            ProgramOffered[] =


            data.map(

              (item: any) => ({


                Id:

                  item.Id ??

                  item.id ??

                  0,


                Name:

                  item.Name ??

                  item.name ??

                  '',


                ShortDescription:

                  item.ShortDescription ??

                  item.shortDescription ??

                  '',


                Description:

                  item.Description ??

                  item.description ??

                  '',


                Duration:

                  item.Duration ??

                  item.duration ??

                  '',


                Eligibility:

                  item.Eligibility ??

                  item.eligibility ??

                  '',


                DegreeType:

                  item.DegreeType ??

                  item.degreeType ??

                  '',


                Image:

                  item.Image ??

                  item.image ??

                  null,


                ImageFile:

                  null,


                ExternalUrl:

                  item.ExternalUrl ??

                  item.externalUrl ??

                  '',


                DisplayOrder:

                  item.DisplayOrder ??

                  item.displayOrder ??

                  0,


                IsFeatured:

                  item.IsFeatured ??

                  item.isFeatured ??

                  false,


                IsActive:

                  item.IsActive ??

                  item.isActive ??

                  true


              })

            );


          this.programs.set(

            list

          );


        },


        error: (err) => {


          this.toastr.error(

            err?.error?.message ||

            'Unable to load programs.'

          );

        }

      });

  }


  // =================================================
  // Add
  // =================================================

  addProgram(): void {


    this.selectedProgram.set(

      null

    );


    this.showModal.set(

      true

    );

  }


  // =================================================
  // Edit
  // =================================================

  editProgram(

    program: ProgramOffered

  ): void {


    this.selectedProgram.set({

      ...program

    });


    this.showModal.set(

      true

    );

  }


  // =================================================
  // Close
  // =================================================

  closeModal(): void {


    this.showModal.set(

      false

    );


    this.selectedProgram.set(

      null

    );

  }


  // =================================================
  // Save
  // =================================================

  saveProgram(

    program: ProgramOffered

  ): void {


    const isEdit =

      program.Id > 0;


    const formData =

      new FormData();


    // ---------------------------------------------
    // Audit
    // ---------------------------------------------

    if (isEdit) {


      formData.append(

        'Id',

        program.Id.toString()

      );


      formData.append(

        'UpdatedBy',

        this.loggedInId()

      );

    }

    else {


      formData.append(

        'CreatedBy',

        this.loggedInId()

      );

    }


    // ---------------------------------------------
    // Fields
    // ---------------------------------------------

    formData.append(

      'Name',

      program.Name

    );


    formData.append(

      'ShortDescription',

      program.ShortDescription

    );


    formData.append(

      'Description',

      program.Description

    );


    formData.append(

      'Duration',

      program.Duration

    );


    formData.append(

      'Eligibility',

      program.Eligibility

    );


    formData.append(

      'DegreeType',

      program.DegreeType

    );


    formData.append(

      'ExternalUrl',

      program.ExternalUrl || ''

    );


    formData.append(

      'DisplayOrder',

      program.DisplayOrder.toString()

    );


    formData.append(

      'IsFeatured',

      program.IsFeatured

        ? 'true'

        : 'false'

    );


    formData.append(

      'IsActive',

      program.IsActive

        ? 'true'

        : 'false'

    );


    // ---------------------------------------------
    // Image
    // ---------------------------------------------

    if (

      program.ImageFile

    ) {


      formData.append(

        'Image',

        program.ImageFile,

        program.ImageFile.name

      );

    }


    // ---------------------------------------------
    // API
    // ---------------------------------------------

    const request =

      isEdit


        ? this.apiService.PutRequest(

          'ProgramsOffered',

          formData,

          true

        )


        : this.apiService.PostRequest(

          'ProgramsOffered',

          formData,

          true

        );


    request.subscribe({


      next: (res: any) => {


        if (

          res.isSucceeded

        ) {


          this.toastr.success(

            res.message ||

            `Program ${isEdit

              ? 'updated'

              : 'created'

            } successfully.`

          );


          this.getPrograms();


          this.closeModal();

        }

        else {


          this.toastr.warning(

            res.message ||

            'Unable to save program.'

          );

        }

      },


      error: (err) => {


        this.toastr.error(

          err?.error?.message ||

          err?.message ||

          'Something went wrong.'

        );

      }

    });

  }


  // =================================================
  // Delete
  // =================================================

  deleteProgram(

    program: ProgramOffered

  ): void {


    Swal.fire({


      title:

        'Delete Program?',


      text:

        `Are you sure you want to delete "${program.Name

        }"?`,


      icon:

        'warning',


      showCancelButton:

        true,


      confirmButtonText:

        'Yes, Delete',


      cancelButtonText:

        'Cancel',


      confirmButtonColor:

        '#dc2626',


      reverseButtons:

        true


    })

      .then(result => {


        if (

          !result.isConfirmed

        ) {

          return;

        }


        const formData =

          new FormData();


        formData.append(

          'Id',

          program.Id.toString()

        );


        formData.append(

          'Image',

          program.Image ?? ''

        );


        this.apiService

          .DeleteFromFormRequest(

            'ProgramsOffered',

            formData,

            true

          )

          .subscribe({


            next: (res: any) => {


              if (

                res.isSucceeded

              ) {


                this.toastr.success(

                  res.message ||

                  'Program deleted successfully.'

                );


                this.getPrograms();

              }

              else {


                this.toastr.warning(

                  res.message ||

                  'Unable to delete program.'

                );

              }

            },


            error: (err) => {


              this.toastr.error(

                err?.error?.message ||

                'Unable to delete program.'

              );

            }

          });

      });

  }


}
