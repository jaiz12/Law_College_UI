import { Injectable } from '@angular/core';
import {
  ClassicEditor,
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
  ImageUpload,
  ShiftEnter
} from 'ckeditor5';

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
    ImageUpload,
    ShiftEnter
  ];

  getConfig(): any {
    return {
      licenseKey: 'GPL',
      plugins: this.plugins,
      toolbar: this.config.get('toolbar'),
      fontFamily: this.config.get('fontFamily'),
      fontSize: this.config.get('fontSize'),
      image: this.config.get('image'),
      link: {
        decorators: {
          openInNewTab: {
            mode: 'manual',
            label: 'Open in new tab',
            attributes: {
              target: '_blank',
              rel: 'noopener noreferrer'
            }
          }
        }
      }
    };
  }

  loadEditor() {
    return ClassicEditor;
  }
}
