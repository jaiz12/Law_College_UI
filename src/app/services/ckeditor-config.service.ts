import { Injectable } from '@angular/core';

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import {
  Bold,
  Italic,
  Underline,
  Strikethrough
} from '@ckeditor/ckeditor5-basic-styles';

import {
  Font,
  FontFamily,
  FontSize,
  FontColor,
  FontBackgroundColor
} from '@ckeditor/ckeditor5-font';

import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { Link } from '@ckeditor/ckeditor5-link';

import {
  List,
  ListProperties
} from '@ckeditor/ckeditor5-list';

import {
  Indent,
  IndentBlock
} from '@ckeditor/ckeditor5-indent';

import {
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  TableColumnResize
} from '@ckeditor/ckeditor5-table';

import { Heading } from '@ckeditor/ckeditor5-heading';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';

import {
  Image,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,
  ImageUpload
} from '@ckeditor/ckeditor5-image';

import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class CKEditorConfigService {
  constructor(private config: ConfigService) { }
  public Editor = ClassicEditor;

  public plugins = [
    Essentials,
    Paragraph,

    Heading,

    Bold,
    Italic,
    Underline,
    Strikethrough,

    Font,
    FontFamily,
    FontSize,
    FontColor,
    FontBackgroundColor,

    Alignment,

    Link,

    List,
    ListProperties,

    Indent,
    IndentBlock,

    Table,
    TableToolbar,
    TableProperties,
    TableCellProperties,
    TableColumnResize,

    BlockQuote,

    Image,
    ImageToolbar,
    ImageCaption,
    ImageStyle,
    ImageResize,
    ImageUpload
  ];

  getConfig(): any {

    return {
      licenseKey: 'GPL',

      plugins: this.plugins,

      toolbar: this.config.get("toolbar"),

      fontFamily: this.config.get("fontFamily"),

      fontSize: this.config.get("fontSize"),

      image: this.config.get("image")
    };
  }
}
