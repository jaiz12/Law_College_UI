import {
  Injectable,
  PLATFORM_ID,
  inject
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { ConfigService } from './config.service';


@Injectable({
  providedIn: 'root'
})
export class CKEditorConfigService {

  private platformId = inject(PLATFORM_ID);

  private config = inject(ConfigService);


  // --------------------------------------------------
  // CKEditor
  // --------------------------------------------------

  public Editor: any = null;

  public plugins: any[] = [];

  private initialized = false;


  // --------------------------------------------------
  // Initialize CKEditor
  // --------------------------------------------------

  async initialize(): Promise<void> {

    // Never load CKEditor during SSR
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Prevent loading multiple times
    if (this.initialized) {
      return;
    }


    // --------------------------------------------------
    // Dynamically import CKEditor packages
    // --------------------------------------------------

    const [
      classicEditorModule,
      essentialsModule,
      paragraphModule,
      basicStylesModule,
      fontModule,
      alignmentModule,
      linkModule,
      listModule,
      indentModule,
      tableModule,
      headingModule,
      blockQuoteModule,
      imageModule
    ] = await Promise.all([

      import(
        '@ckeditor/ckeditor5-editor-classic'
      ),

      import(
        '@ckeditor/ckeditor5-essentials'
      ),

      import(
        '@ckeditor/ckeditor5-paragraph'
      ),

      import(
        '@ckeditor/ckeditor5-basic-styles'
      ),

      import(
        '@ckeditor/ckeditor5-font'
      ),

      import(
        '@ckeditor/ckeditor5-alignment'
      ),

      import(
        '@ckeditor/ckeditor5-link'
      ),

      import(
        '@ckeditor/ckeditor5-list'
      ),

      import(
        '@ckeditor/ckeditor5-indent'
      ),

      import(
        '@ckeditor/ckeditor5-table'
      ),

      import(
        '@ckeditor/ckeditor5-heading'
      ),

      import(
        '@ckeditor/ckeditor5-block-quote'
      ),

      import(
        '@ckeditor/ckeditor5-image'
      )

    ]);


    // --------------------------------------------------
    // Editor
    // --------------------------------------------------

    this.Editor =
      classicEditorModule.ClassicEditor;


    // --------------------------------------------------
    // Plugins
    // --------------------------------------------------

    this.plugins = [

      essentialsModule.Essentials,

      paragraphModule.Paragraph,

      headingModule.Heading,


      // Basic styles

      basicStylesModule.Bold,

      basicStylesModule.Italic,

      basicStylesModule.Underline,

      basicStylesModule.Strikethrough,


      // Font

      fontModule.Font,

      fontModule.FontFamily,

      fontModule.FontSize,

      fontModule.FontColor,

      fontModule.FontBackgroundColor,


      // Alignment

      alignmentModule.Alignment,


      // Link

      linkModule.Link,


      // List

      listModule.List,

      listModule.ListProperties,


      // Indent

      indentModule.Indent,

      indentModule.IndentBlock,


      // Table

      tableModule.Table,

      tableModule.TableToolbar,

      tableModule.TableProperties,

      tableModule.TableCellProperties,

      tableModule.TableColumnResize,


      // Block quote

      blockQuoteModule.BlockQuote,


      // Image

      imageModule.Image,

      imageModule.ImageToolbar,

      imageModule.ImageCaption,

      imageModule.ImageStyle,

      imageModule.ImageResize,

      imageModule.ImageUpload

    ];


    this.initialized = true;

  }


  // --------------------------------------------------
  // Get Configuration
  // --------------------------------------------------

  getConfig(): any {

    return {

      licenseKey: 'GPL',

      plugins: this.plugins,

      toolbar: this.config.get('toolbar'),

      fontFamily: this.config.get('fontFamily'),

      fontSize: this.config.get('fontSize'),

      image: this.config.get('image')

    };

  }

}
