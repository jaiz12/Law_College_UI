import { Injectable } from '@angular/core';
import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  noWhitespaceValidator(): ValidatorFn {

    return (
      control: AbstractControl
    ): ValidationErrors | null => {

      const value = control.value;

      // Empty value is handled by Validators.required
      if (value === null || value === undefined || value === '') {
        return null;
      }

      const stringValue = String(value);

      const trimmedValue = stringValue.trim();

      // Reject leading/trailing whitespace
      if (stringValue !== trimmedValue) {
        return {
          whitespace: true
        };
      }

      // Reject only whitespace
      if (trimmedValue.length === 0) {
        return {
          whitespace: true
        };
      }

      return null;
    };

  }

}
