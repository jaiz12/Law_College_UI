import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ContactUsModalComponent } from './contact-us-modal/contact-us-modal.component';

export interface ContactDetail {

  id: number ;

  icon: string;

  detail: string;

}

@Component({

  selector: 'app-contact-us-details',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    NgxPaginationModule,

    ContactUsModalComponent

  ],

  templateUrl: './contact-us-details.component.html',

  styleUrl: './contact-us-details.component.scss'

})

export class ContactUsDetailsComponent implements OnInit {

  constructor(

    private apiService: CmsApiService,

    private toastr: ToastrService

  ) { }


  // ---------------------------------------
  // Signals
  // ---------------------------------------

  search = signal('');

  page = signal(1);

  itemsPerPage = signal(5);

  pageSizeOptions = [5, 10, 20, 50];

  showModal = signal(false);

  selectedContact =
    signal<ContactDetail | null>(null);

  contacts =
    signal<ContactDetail[]>([]);

  SectionName = 'Contact Details';

  loggedInId = signal('');


  // ---------------------------------------
  // On Init
  // ---------------------------------------

  ngOnInit(): void {

    this.getContacts();

    const userString =
      localStorage.getItem('user');

    if (userString) {

      const currentUser =
        JSON.parse(userString);

      this.loggedInId.set(
        currentUser.id
      );

    }

  }


  // ---------------------------------------
  // Filter
  // ---------------------------------------

  filteredContacts = computed(() => {

    const keyword =
      this.search()
        .trim()
        .toLowerCase();

    if (!keyword) {

      return this.contacts();

    }

    return this.contacts().filter(contact =>

      contact.icon
        ?.toLowerCase()
        .includes(keyword)

      ||

      contact.detail
        ?.toLowerCase()
        .includes(keyword)


    );

  });


  // ---------------------------------------
  // Get Contacts
  // ---------------------------------------

  getContacts(): void {

    this.apiService

      .GetRequest(
        'HeaderAndFooter/0/' + this.SectionName
      )

      .subscribe({

        next: (res: any) => {


          const data = Array.isArray(res)
            ? res
            : [res];

          const contacts:
            ContactDetail[] =

            data.map((item: any) => ({

              id:
                item.id ??
                item.Id ??
                0,

              sectionName:
                item.sectionName ??
                item.SectionName ??
                '',

              icon:
                item.icon ??
                item.Icon ??
                '',

              detail:
                item.detail ??
                item.Detail ??
                ''

            }));

          this.contacts.set(
            contacts
          );


        },

        error: (err) => {

          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load contact details.'

          );

        }

      });

  }


  // ---------------------------------------
  // Add Contact
  // ---------------------------------------

  openAddModal(): void {

    this.selectedContact.set(null);

    this.showModal.set(true);

  }


  // ---------------------------------------
  // Edit Contact
  // ---------------------------------------

  editContact(
    contact: ContactDetail
  ): void {

    this.selectedContact.set({

      ...contact

    });

    this.showModal.set(true);

  }


  // ---------------------------------------
  // Close Modal
  // ---------------------------------------

  closeModal(): void {

    this.showModal.set(false);

    this.selectedContact.set(null);

  }


  // ---------------------------------------
  // Save Contact
  // ---------------------------------------

  saveContact(contact: ContactDetail): void {

    const isEdit = contact.id > 0;

    const formData = new FormData();

    if (isEdit) {

      formData.append(
        'Id',
        contact.id.toString()
      );

      formData.append(
        'UpdatedBy',
        this.loggedInId()
      );

    } else {

      formData.append(
        'CreatedBy',
        this.loggedInId()
      );

    }

    formData.append(
      'SectionName',
      this.SectionName
    );

    formData.append(
      'Icon',
      contact.icon
    );

    formData.append(
      'Detail',
      contact.detail
    );


    const request = isEdit

      ? this.apiService.PutRequest(
        'HeaderAndFooter',
        formData,
        true
      )

      : this.apiService.PostRequest(
        'HeaderAndFooter',
        formData,
        true
      );

    request.subscribe({

      next: (res: any) => {

        if (res.isSucceeded) {

          this.toastr.success(
            res.message ||
            `Contact detail ${isEdit ? 'updated' : 'created'
            } successfully.`
          );

          this.getContacts();

          this.closeModal();

        } else {

          this.toastr.warning(
            res.message ||
            'Unable to save contact detail.'
          );

        }

      },

      error: (err) => {

        this.toastr.error(
          err?.error?.message ||
          err?.message ||
          'Something went wrong while saving contact detail.'
        );

      }

    });

  }


  // ---------------------------------------
  // Delete Contact
  // ---------------------------------------

  deleteContact(
    contact: ContactDetail
  ): void {

    Swal.fire({

      title:
        'Delete Contact Detail?',

      text:
        `Are you sure you want to delete "${contact.detail}"?`,

      icon: 'warning',

      showCancelButton: true,

      confirmButtonColor: '#dc2626',

      cancelButtonColor: '#6b7280',

      confirmButtonText:
        'Yes, Delete',

      cancelButtonText:
        'Cancel',

      reverseButtons: true,

      focusCancel: true

    }).then(result => {

      if (!result.isConfirmed) {

        return;

      }
      console.log(contact)
      const formData =
        new FormData();


      formData.append(

        'Id',

        contact.id.toString()

      );

      formData.append(

        'SectionName',

        this.SectionName

      );




      // ---------------------------------------
      // Delete API
      // ---------------------------------------

      this.apiService

        .DeleteFromFormRequest(
          'HeaderAndFooter',
          formData,
          true
        )

        .subscribe({

          next: (res: any) => {

            if (res.isSucceeded) {

              this.toastr.success(

                res.message ||

                'Contact detail deleted successfully.'

              );

              this.getContacts();

            }

            else {

              this.toastr.warning(

                res.message ||

                'Unable to delete contact detail.'

              );

            }

          },

          error: (err) => {

            this.toastr.error(

              err?.error?.message ||

              err?.message ||

              'Unable to delete contact detail.'

            );

          }

        });

    });

  }

}
