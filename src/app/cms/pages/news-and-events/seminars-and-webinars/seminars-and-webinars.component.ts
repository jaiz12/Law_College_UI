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
import { SeminarsAndWebinarsModalComponent } from './seminars-and-webinars-modal/seminars-and-webinars-modal.component';


export interface SeminarWebinar {

  Id: number;

  Title: string;

  ShortDescription: string;

  Content: string;

  Image: string | null;

  ImageFile: File | null;

  AttachmentUrl?: string;

  EventDate: string;

  StartTime?: string;

  EndTime?: string;

  Venue?: string;

  Speaker?: string;

  IsFeatured: boolean;

  IsImportant: boolean;

}


@Component({

  selector: 'app-seminars-and-webinars',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    NgxPaginationModule,

    SeminarsAndWebinarsModalComponent

  ],

  templateUrl:
    './seminars-and-webinars.component.html',

  styleUrl:
    './seminars-and-webinars.component.scss'

})


export class SeminarsWebinarsComponent
  implements OnInit {


  constructor(

    private apiService: CmsApiService,

    private toastr: ToastrService,

    private config: ConfigService

  ) { }


  // ---------------------------------------
  // Signals
  // ---------------------------------------

  search = signal('');

  showModal = signal(false);

  page = signal(1);

  itemsPerPage = signal(5);

  pageSizeOptions = [5, 10, 20, 50];

  imageURL = signal('');

  loggedInId = signal('');

  seminarsWebinars =
    signal<SeminarWebinar[]>([]);

  selectedSeminarWebinar =
    signal<SeminarWebinar | null>(null);


  // ---------------------------------------
  // Init
  // ---------------------------------------

  ngOnInit(): void {

    this.imageURL.set(

      this.config.get('IMAGE_API_URL')

    );

    this.getSeminarsWebinars();


    const user =
      localStorage.getItem('user');


    if (user) {

      this.loggedInId.set(

        JSON.parse(user).id

      );

    }

  }


  // ---------------------------------------
  // Filter
  // ---------------------------------------

  filteredSeminarsWebinars = computed(() => {

    const keyword =

      this.search()

        .trim()

        .toLowerCase();


    if (!keyword) {

      return this.seminarsWebinars();

    }


    return this.seminarsWebinars()

      .filter(item =>

        item.Title

          .toLowerCase()

          .includes(keyword)


        ||


        item.ShortDescription

          .toLowerCase()

          .includes(keyword)


        ||


        item.Venue

          ?.toLowerCase()

          .includes(keyword)


        ||


        item.Speaker

          ?.toLowerCase()

          .includes(keyword)

      );

  });


  // ---------------------------------------
  // Get
  // ---------------------------------------

  getSeminarsWebinars(): void {


    this.apiService

      .GetRequest(

        'SeminarsWebinars'

      )

      .subscribe({

        next: (res: any) => {


          const data =

            Array.isArray(res)

              ? res

              : res.data || [];


          const list:

            SeminarWebinar[] =


            data.map((item: any) => ({

              Id:

                item.Id ??

                item.id ??

                0,


              Title:

                item.Title ??

                item.title ??

                '',


              ShortDescription:

                item.ShortDescription ??

                item.shortDescription ??

                '',


              Content:

                item.Content ??

                item.content ??

                '',


              Image:

                item.Image ??

                item.image ??

                null,


              ImageFile:

                null,


              AttachmentUrl:

                item.AttachmentUrl ??

                item.attachmentUrl ??

                '',


              EventDate:

                item.EventDate ??

                item.eventDate ??

                '',


              StartTime:

                item.StartTime ??

                item.startTime ??

                '',


              EndTime:

                item.EndTime ??

                item.endTime ??

                '',


              Venue:

                item.Venue ??

                item.venue ??

                '',


              Speaker:

                item.Speaker ??

                item.speaker ??

                '',


              IsFeatured:

                item.IsFeatured ??

                item.isFeatured ??

                false,


              IsImportant:

                item.IsImportant ??

                item.isImportant ??

                false

            }));


          this.seminarsWebinars.set(list);

        },


        error: (err) => {

          this.toastr.error(

            err?.error?.message ||

            'Unable to load seminars and webinars.'

          );

        }

      });

  }


  // ---------------------------------------
  // Add
  // ---------------------------------------

  addSeminarWebinar(): void {

    this.selectedSeminarWebinar.set(null);

    this.showModal.set(true);

  }


  // ---------------------------------------
  // Edit
  // ---------------------------------------

  editSeminarWebinar(

    item: SeminarWebinar

  ): void {


    this.selectedSeminarWebinar.set({

      ...item

    });


    this.showModal.set(true);

  }


  // ---------------------------------------
  // Close
  // ---------------------------------------

  closeModal(): void {

    this.showModal.set(false);

    this.selectedSeminarWebinar.set(null);

  }


  // ---------------------------------------
  // Save
  // ---------------------------------------

  saveSeminarWebinar(

    item: SeminarWebinar

  ): void {


    const isEdit =

      item.Id > 0;


    const formData =

      new FormData();


    if (isEdit) {


      formData.append(

        'Id',

        item.Id.toString()

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


    formData.append(

      'Title',

      item.Title

    );


    formData.append(

      'ShortDescription',

      item.ShortDescription

    );


    formData.append(

      'Content',

      item.Content

    );


    formData.append(

      'EventDate',

      item.EventDate

    );


    if (item.StartTime) {

      formData.append(

        'StartTime',

        item.StartTime

      );

    }


    if (item.EndTime) {

      formData.append(

        'EndTime',

        item.EndTime

      );

    }


    if (item.Venue) {

      formData.append(

        'Venue',

        item.Venue

      );

    }


    if (item.Speaker) {

      formData.append(

        'Speaker',

        item.Speaker

      );

    }


    if (item.AttachmentUrl) {

      formData.append(

        'AttachmentUrl',

        item.AttachmentUrl

      );

    }


    formData.append(

      'IsFeatured',

      item.IsFeatured.toString()

    );


    formData.append(

      'IsImportant',

      item.IsImportant.toString()

    );


    if (item.ImageFile) {

      formData.append(

        'Image',

        item.ImageFile,

        item.ImageFile.name

      );

    }


    const request =

      isEdit

        ? this.apiService.PutRequest(

          'SeminarsWebinars',

          formData,

          true

        )

        : this.apiService.PostRequest(

          'SeminarsWebinars',

          formData,

          true

        );


    request.subscribe({

      next: (res: any) => {


        if (res.isSucceeded) {


          this.toastr.success(

            res.message ||

            `Seminar/Webinar ${isEdit

              ? 'updated'

              : 'created'

            } successfully.`

          );


          this.getSeminarsWebinars();

          this.closeModal();

        }

        else {


          this.toastr.warning(

            res.message ||

            'Unable to save seminar/webinar.'

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


  // ---------------------------------------
  // Delete
  // ---------------------------------------

  deleteSeminarWebinar(

    item: SeminarWebinar

  ): void {


    Swal.fire({

      title:

        'Delete Seminar/Webinar?',


      text:

        `Are you sure you want to delete "${item.Title

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


        if (!result.isConfirmed) {

          return;

        }


        const formData =

          new FormData();


        formData.append(

          'Id',

          item.Id.toString()

        );


        formData.append(

          'Image',

          item.Image ?? ''

        );


        this.apiService

          .DeleteFromFormRequest(

            'SeminarsWebinars',

            formData,

            true

          )

          .subscribe({

            next: (res: any) => {


              if (res.isSucceeded) {


                this.toastr.success(

                  res.message ||

                  'Seminar/Webinar deleted successfully.'

                );


                this.getSeminarsWebinars();

              }

              else {


                this.toastr.warning(

                  res.message ||

                  'Unable to delete record.'

                );

              }

            },


            error: (err) => {


              this.toastr.error(

                err?.error?.message ||

                'Unable to delete seminar/webinar.'

              );

            }

          });

      });

  }

}
