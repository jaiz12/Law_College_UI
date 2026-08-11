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
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CommonModule } from '@angular/common';

import { ContactDetail } from '../contact-us-details.component';

import { ValidationService } from '../../../../../services/validation-service.service';


@Component({

  selector: 'app-contact-us-modal',

  standalone: true,

  imports: [

    CommonModule,

    ReactiveFormsModule

  ],

  templateUrl: './contact-us-modal.component.html',

  styleUrl: './contact-us-modal.component.scss'

})


export class ContactUsModalComponent implements OnChanges {


  // ---------------------------------------
  // Services
  // ---------------------------------------

  private fb = inject(FormBuilder);

  private validationService = inject(
    ValidationService
  );


  // ---------------------------------------
  // Input / Output
  // ---------------------------------------

  @Input()
  contact: ContactDetail | null = null;


  @Output()
  save = new EventEmitter<ContactDetail>();


  @Output()
  close = new EventEmitter<void>();


  // ---------------------------------------
  // Icon Variables
  // ---------------------------------------

  showIcons = false;

  searchControl =
    new FormControl('');


  selectedIcon: any = null;


  // ---------------------------------------
  // Contact Section
  // ---------------------------------------

  section = 'Contact Details';


  // ---------------------------------------
  // Icons
  // ---------------------------------------

  icons = [

    // Phone
    {
      name: 'Phone',
      value: 'fa-solid fa-phone'
    },

    {
      name: 'Phone Volume',
      value: 'fa-solid fa-phone-volume'
    },

    {
      name: 'Mobile',
      value: 'fa-solid fa-mobile-screen-button'
    },

    // Address
    {
      name: 'Location',
      value: 'fa-solid fa-location-dot'
    },

    {
      name: 'Map Marker',
      value: 'fa-solid fa-map-marker-alt'
    },

    {
      name: 'Map',
      value: 'fa-solid fa-map'
    },

    // Email
    {
      name: 'Email',
      value: 'fa-solid fa-envelope'
    },

    {
      name: 'Envelope Open',
      value: 'fa-solid fa-envelope-open'
    },

    {
      name: 'At',
      value: 'fa-solid fa-at'
    },

    // Website
    {
      name: 'Globe',
      value: 'fa-solid fa-globe'
    },

    {
      name: 'Link',
      value: 'fa-solid fa-link'
    },

    // Social
    {
      name: 'Facebook',
      value: 'fa-brands fa-facebook'
    },

    {
      name: 'Instagram',
      value: 'fa-brands fa-instagram'
    },

    {
      name: 'Twitter',
      value: 'fa-brands fa-twitter'
    },

    {
      name: 'LinkedIn',
      value: 'fa-brands fa-linkedin'
    },

    {
      name: 'YouTube',
      value: 'fa-brands fa-youtube'
    },

    // General
    {
      name: 'Clock',
      value: 'fa-solid fa-clock'
    },

    {
      name: 'Building',
      value: 'fa-solid fa-building'
    },

    {
      name: 'Info',
      value: 'fa-solid fa-circle-info'
    }

  ];


  // ---------------------------------------
  // Form
  // ---------------------------------------

  pageForm = this.fb.group({

    id: this.fb.control<number>(0, {

      nonNullable: true

    }),



    icon: this.fb.control<string>('', {

      validators: [

        Validators.required

      ],

      nonNullable: true

    }),


    detail: this.fb.control<string>('', {

      validators: [

        Validators.required,

        this.validationService
          .noWhitespaceValidator()

      ],

      nonNullable: true

    })

  });


  // ---------------------------------------
  // Edit Mode
  // ---------------------------------------

  get isEditMode(): boolean {

    return !!this.contact;

  }


  // ---------------------------------------
  // Input Changes
  // ---------------------------------------

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (this.contact) {


      this.pageForm.patchValue({

        id:
          this.contact.id ?? 0,

        icon:
          this.contact.icon ?? '',

        detail:
          this.contact.detail ?? ''

      });


      // Select existing icon

      this.selectedIcon =

        this.icons.find(

          x =>
            x.value ===
            this.contact?.icon

        ) ?? null;


      this.searchControl.reset('');

      this.showIcons = false;

    }

    else {


      this.pageForm.reset({

        id: 0,

        icon: '',

        detail: ''

      });


      this.selectedIcon = null;

      this.searchControl.reset('');

      this.showIcons = false;

    }

  }


  // ---------------------------------------
  // Submit
  // ---------------------------------------

  submit(): void {

    if (this.pageForm.invalid) {

      this.pageForm.markAllAsTouched();

      return;

    }

    const value = this.pageForm.getRawValue();

    const contact: ContactDetail = {

      id: value.id ?? 0,

      icon: value.icon,

      detail: value.detail.trim()

    };

    this.save.emit(contact);

  }


  // ---------------------------------------
  // Cancel
  // ---------------------------------------

  cancel(): void {

    this.pageForm.reset({

      id: 0,

      icon: '',

      detail: ''

    });


    this.selectedIcon = null;

    this.searchControl.reset('');

    this.showIcons = false;


    this.close.emit();

  }


  // ---------------------------------------
  // Filter Icons
  // ---------------------------------------

  filteredIcons() {

    const search =

      (
        this.searchControl.value ??
        ''
      )
        .toLowerCase()
        .trim();


    if (!search) {

      return this.icons;

    }


    return this.icons.filter(

      icon =>

        icon.name
          .toLowerCase()
          .includes(search)

        ||

        icon.value
          .toLowerCase()
          .includes(search)

    );

  }


  // ---------------------------------------
  // Select Icon
  // ---------------------------------------

  selectIcon(icon: any): void {


    this.selectedIcon =
      icon;


    this.pageForm.patchValue({

      icon:
        icon.value

    });


    this.searchControl.reset('');

    this.showIcons = false;


    // Mark icon as touched

    this.pageForm
      .get('icon')
      ?.markAsTouched();

  }

}
