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
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CommonModule } from '@angular/common';

import { ValidationService } from '../../../../../services/validation-service.service';

import {
  SocialMedia
} from '../social-media.component';


@Component({

  selector: 'app-social-media-modal',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],

  templateUrl:
    './social-media-modal.component.html',

  styleUrl:
    './social-media-modal.component.scss'

})
export class SocialMediaModalComponent
  implements OnChanges {


  // ---------------------------------------
  // Services
  // ---------------------------------------

  private fb =
    inject(FormBuilder);

  private validationService =
    inject(ValidationService);


  // ---------------------------------------
  // Input
  // ---------------------------------------

  @Input()
  socialMedia:
    SocialMedia | null = null;


  @Input()
  socialMediaList:
    SocialMedia[] = [];


  // ---------------------------------------
  // Output
  // ---------------------------------------

  @Output()
  save =
    new EventEmitter<SocialMedia>();


  @Output()
  close =
    new EventEmitter<void>();


  // ---------------------------------------
  // Icon Dropdown
  // ---------------------------------------

  showIcons = false;

  searchControl =
    new FormControl('', {
      nonNullable: true
    });

  selectedIcon: any = null;


  // ---------------------------------------
  // Section
  // ---------------------------------------

  section =
    'Social Media';


  // ---------------------------------------
  // Social Media Icons
  // ---------------------------------------

  icons = [

    {
      name: 'Facebook',
      value: 'fa-brands fa-facebook'
    },

    {
      name: 'Instagram',
      value: 'fa-brands fa-instagram'
    },

    {
      name: 'X / Twitter',
      value: 'fa-brands fa-x-twitter'
    },

    {
      name: 'YouTube',
      value: 'fa-brands fa-youtube'
    },

    {
      name: 'LinkedIn',
      value: 'fa-brands fa-linkedin'
    },

    {
      name: 'WhatsApp',
      value: 'fa-brands fa-whatsapp'
    },

    {
      name: 'Telegram',
      value: 'fa-brands fa-telegram'
    },

    {
      name: 'Pinterest',
      value: 'fa-brands fa-pinterest'
    },

    {
      name: 'Snapchat',
      value: 'fa-brands fa-snapchat'
    },

    {
      name: 'TikTok',
      value: 'fa-brands fa-tiktok'
    },

    {
      name: 'Reddit',
      value: 'fa-brands fa-reddit'
    },

    {
      name: 'GitHub',
      value: 'fa-brands fa-github'
    },

    {
      name: 'GitLab',
      value: 'fa-brands fa-gitlab'
    },

    {
      name: 'Discord',
      value: 'fa-brands fa-discord'
    },

    {
      name: 'Threads',
      value: 'fa-brands fa-threads'
    },

    {
      name: 'Twitch',
      value: 'fa-brands fa-twitch'
    },

    {
      name: 'Medium',
      value: 'fa-brands fa-medium'
    },

    {
      name: 'Dribbble',
      value: 'fa-brands fa-dribbble'
    },

    {
      name: 'Behance',
      value: 'fa-brands fa-behance'
    },

    {
      name: 'Flickr',
      value: 'fa-brands fa-flickr'
    }

  ];


  // ---------------------------------------
  // Form
  // ---------------------------------------

  pageForm =
    this.fb.group({

      id:
        this.fb.control<number | null>(
          null
        ),


      icon:
        this.fb.control('', {

          validators: [
            Validators.required
          ],

          nonNullable: true

        }),


      link:
        this.fb.control('', {

          validators: [

            Validators.required,

            this.validationService
              .noWhitespaceValidator(),

            Validators.pattern(
              /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/.*)?$/i
            )

          ],

          nonNullable: true

        })

    });


  // ---------------------------------------
  // Edit Mode
  // ---------------------------------------

  get isEditMode(): boolean {

    return !!this.socialMedia;

  }


  // ---------------------------------------
  // Input Changes
  // ---------------------------------------

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (this.socialMedia) {

      this.pageForm.patchValue({

        id:
          this.socialMedia.id,

        icon:
          this.socialMedia.icon,

        link:
          this.socialMedia.link

      });


      this.selectedIcon =
        this.icons.find(

          x =>
            x.value ===
            this.socialMedia?.icon

        ) ?? null;


      this.searchControl.reset('');

      this.showIcons = false;

    }

    else {

      this.pageForm.reset({

        id:
          null,

        icon:
          '',

        link:
          ''

      });


      this.selectedIcon =
        null;

      this.searchControl.reset('');

      this.showIcons =
        false;

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


    const value =
      this.pageForm.getRawValue();


    // ---------------------------------------
    // Duplicate Icon Check
    // ---------------------------------------

    const duplicate =
      this.socialMediaList.some(

        item =>

          item.icon === value.icon &&

          item.id !==
          (value.id ?? 0)

      );


    if (duplicate) {

      this.pageForm.controls
        .icon
        .setErrors({

          duplicate: true

        });


      this.pageForm.controls
        .icon
        .markAsTouched();


      return;

    }


    // ---------------------------------------
    // Social Media Object
    // ---------------------------------------

    const socialMedia:
      SocialMedia = {

      id:
        value.id ?? 0,

      icon:
        value.icon,

      link:
        value.link.trim(),

    };


    console.log(
      'Social Media:',
      socialMedia
    );


    this.save.emit(
      socialMedia
    );

  }


  // ---------------------------------------
  // Cancel
  // ---------------------------------------

  cancel(): void {

    this.pageForm.reset({

      id:
        null,

      icon:
        '',

      link:
        ''

    });


    this.selectedIcon =
      null;

    this.searchControl.reset('');

    this.showIcons =
      false;


    this.close.emit();

  }


  // ---------------------------------------
  // Filter Icons
  // ---------------------------------------

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


  // ---------------------------------------
  // Select Icon
  // ---------------------------------------

  selectIcon(
    icon: any
  ): void {

    this.selectedIcon =
      icon;


    this.pageForm.patchValue({

      icon:
        icon.value

    });


    this.searchControl.reset('');

    this.showIcons =
      false;


    this.pageForm.controls
      .icon
      .markAsTouched();

  }

}
