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
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ValidationService } from '../../../../../services/validation-service.service';

import {
  WhyChooseUs
} from '../why-choose-us.component';


@Component({
  selector: 'app-why-choose-us-modal',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl:
    './why-choose-us-modal.component.html',

  styleUrl:
    './why-choose-us-modal.component.scss'
})
export class WhyChooseUsModalComponent
  implements OnChanges {


  // ===================================================
  // SERVICES
  // ===================================================

  private fb =
    inject(FormBuilder);

  private validationService =
    inject(ValidationService);


  // ===================================================
  // INPUT
  // ===================================================

  @Input()
  item:
    WhyChooseUs | null = null;


  // ===================================================
  // OUTPUT
  // ===================================================

  @Output()
  save =
    new EventEmitter<WhyChooseUs>();

  @Output()
  close =
    new EventEmitter<void>();


  // ===================================================
  // ICON DROPDOWN
  // ===================================================

  showIcons = false;

  searchControl =
    new FormControl('', {
      nonNullable: true
    });

  selectedIcon:
    { name: string; value: string } | null = null;


  // ===================================================
  // ICON LIST
  // ===================================================

  icons = [

    {
      name: 'Quality',
      value: 'fa-solid fa-award'
    },

    {
      name: 'Trust',
      value: 'fa-solid fa-shield-halved'
    },

    {
      name: 'Expertise',
      value: 'fa-solid fa-graduation-cap'
    },

    {
      name: 'Professional Team',
      value: 'fa-solid fa-users'
    },

    {
      name: 'Innovation',
      value: 'fa-solid fa-lightbulb'
    },

    {
      name: 'Technology',
      value: 'fa-solid fa-microchip'
    },

    {
      name: 'Fast Service',
      value: 'fa-solid fa-bolt'
    },

    {
      name: 'Time Saving',
      value: 'fa-solid fa-clock'
    },

    {
      name: 'Support',
      value: 'fa-solid fa-headset'
    },

    {
      name: 'Customer Service',
      value: 'fa-solid fa-comments'
    },

    {
      name: 'Security',
      value: 'fa-solid fa-lock'
    },

    {
      name: 'Affordable',
      value: 'fa-solid fa-indian-rupee-sign'
    },

    {
      name: 'Value for Money',
      value: 'fa-solid fa-money-bill-wave'
    },

    {
      name: 'Success',
      value: 'fa-solid fa-trophy'
    },

    {
      name: 'Growth',
      value: 'fa-solid fa-chart-line'
    },

    {
      name: 'Results',
      value: 'fa-solid fa-bullseye'
    },

    {
      name: 'Quality Service',
      value: 'fa-solid fa-star'
    },

    {
      name: 'Transparency',
      value: 'fa-solid fa-eye'
    },

    {
      name: 'Integrity',
      value: 'fa-solid fa-handshake'
    },

    {
      name: 'Communication',
      value: 'fa-solid fa-message'
    },

    {
      name: 'Accessibility',
      value: 'fa-solid fa-universal-access'
    },

    {
      name: 'Global',
      value: 'fa-solid fa-globe'
    },

    {
      name: 'Location',
      value: 'fa-solid fa-location-dot'
    },

    {
      name: 'Education',
      value: 'fa-solid fa-book-open'
    },

    {
      name: 'Research',
      value: 'fa-solid fa-flask'
    },

    {
      name: 'Infrastructure',
      value: 'fa-solid fa-building'
    },

    {
      name: 'Facilities',
      value: 'fa-solid fa-school'
    },

    {
      name: 'Community',
      value: 'fa-solid fa-people-group'
    },

    {
      name: 'Care',
      value: 'fa-solid fa-heart'
    },

    {
      name: 'Student Support',
      value: 'fa-solid fa-user-graduate'
    },

    {
      name: 'Career',
      value: 'fa-solid fa-briefcase'
    },

    {
      name: 'Experience / Leadership',
      value: 'fa-solid fa-user-tie'
    },

    {
      name: 'Flexible',
      value: 'fa-solid fa-sliders'
    },

    {
      name: 'Personalized',
      value: 'fa-solid fa-user-check'
    },

    {
      name: 'Continuous Improvement',
      value: 'fa-solid fa-arrows-rotate'
    },

    // Additional useful icons

    {
      name: 'Reliability / Verified',
      value: 'fa-solid fa-circle-check'
    },

    {
      name: 'Premium',
      value: 'fa-solid fa-gem'
    },

    {
      name: 'Award',
      value: 'fa-solid fa-medal'
    },

    {
      name: 'Security Shield',
      value: 'fa-solid fa-shield'
    },

    {
      name: 'Privacy',
      value: 'fa-solid fa-user-shield'
    },

    {
      name: 'Performance',
      value: 'fa-solid fa-gauge-high'
    },

    {
      name: 'Quality Control',
      value: 'fa-solid fa-list-check'
    },

    {
      name: 'Fast',
      value: 'fa-solid fa-rocket'
    },

    {
      name: '24/7 Support',
      value: 'fa-solid fa-phone-volume'
    },

    {
      name: 'Global Reach',
      value: 'fa-solid fa-earth-americas'
    },

    {
      name: 'Network',
      value: 'fa-solid fa-network-wired'
    },

    {
      name: 'Partnership',
      value: 'fa-solid fa-handshake-angle'
    },

    {
      name: 'Target',
      value: 'fa-solid fa-crosshairs'
    },

    {
      name: 'Check List',
      value: 'fa-solid fa-clipboard-check'
    },

    {
      name: 'Calendar',
      value: 'fa-solid fa-calendar-check'
    },

    {
      name: 'Flexible Learning',
      value: 'fa-solid fa-person-chalkboard'
    },

    {
      name: 'Knowledge',
      value: 'fa-solid fa-brain'
    },

    {
      name: 'Library',
      value: 'fa-solid fa-book'
    },

    {
      name: 'Certificate',
      value: 'fa-solid fa-certificate'
    },

    {
      name: 'Innovation Technology',
      value: 'fa-solid fa-gears'
    }

  ];


  // ===================================================
  // FORM
  // ===================================================

  pageForm = this.fb.group({

    id:
      this.fb.control<number | null>(null),

    icon:
      this.fb.control('', {

        validators: [
          Validators.required
        ],

        nonNullable: true

      }),

    title:
      this.fb.control('', {

        validators: [

          Validators.required,

          this.validationService
            .noWhitespaceValidator()

        ],

        nonNullable: true

      }),

    description:
      this.fb.control('', {

        validators: [

          Validators.required,

          this.validationService
            .noWhitespaceValidator()

        ],

        nonNullable: true

      }),

    externalLink:
      this.fb.control(
        '',
        {

          validators: [
            this.validationService
              .noWhitespaceValidator()

          ],

          nonNullable: true

        }
      )

  });


  // ===================================================
  // EDIT MODE
  // ===================================================

  get isEditMode(): boolean {

    return !!this.item;

  }


  // ===================================================
  // INPUT CHANGES
  // ===================================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (this.item) {

      this.pageForm.patchValue({

        id:
          this.item.id,

        icon:
          this.item.icon ?? '',

        title:
          this.item.title ?? '',

        description:
          this.item.description ?? '',

        externalLink:
          this.item.externalLink ?? ''

      });


      this.selectedIcon =
        this.icons.find(
          x =>
            x.value === this.item?.icon
        ) ?? null;

    }

    else {

      this.pageForm.reset({

        id:
          0,

        icon:
          '',

        title:
          '',

        description:
          '',

        externalLink:
          ''

      });


      this.selectedIcon =
        null;

    }

  }


  // ===================================================
  // FILTER ICONS
  // ===================================================

  filteredIcons() {

    const search =
      this.searchControl.value
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


  // ===================================================
  // SELECT ICON
  // ===================================================

  selectIcon(icon: any): void {

    console.log('Selected Icon:', icon);

    this.selectedIcon = icon;

    this.pageForm.patchValue({
      icon: icon.value
    });

    this.searchControl.reset('');

    this.showIcons = false;

    this.pageForm.controls.icon.markAsTouched();

  }


  // ===================================================
  // SUBMIT
  // ===================================================

  submit(): void {

    if (this.pageForm.invalid) {
      this.pageForm.markAllAsTouched();
      return;
    }

    const value = this.pageForm.getRawValue();

    const item: WhyChooseUs = {
      id: value.id ?? 0,
      icon: value.icon,
      title: value.title.trim(),
      description: value.description.trim(),
      externalLink: value.externalLink.trim() || null
    };

    console.log('EMITTING SAVE:', item);
    this.save.emit(item);
  }


  // ===================================================
  // CANCEL
  // ===================================================

  cancel(): void {

    this.showIcons =
      false;

    this.searchControl.reset('');

    this.close.emit();

  }

}
