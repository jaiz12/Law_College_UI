
import { Injectable } from '@angular/core';
import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class DublicateValidationService {

  // ===================================================
  // NORMALIZE VALUE
  // ===================================================

  private normalizeValue(
    value: unknown,
    field?: string
  ): string {

    if (
      value === null ||
      value === undefined
    ) {
      return '';
    }

    let normalized =
      String(value).trim().toLowerCase();

    // =================================================
    // DATE NORMALIZATION
    // Handles:
    // 2026-09-03
    // 2026-09-03 00:00:00
    // 2026-09-03T00:00:00
    // =================================================

    if (
      field === 'startDate' ||
      field === 'endDate' ||
      field?.toLowerCase().includes('date')
    ) {

      if (
        /^\d{4}-\d{2}-\d{2}/.test(normalized)
      ) {

        normalized =
          normalized.substring(0, 10);

      }

    }

    return normalized;
  }


  // ===================================================
  // SINGLE FIELD DUPLICATE VALIDATION
  // ===================================================

  duplicateValidator<T>(
    getItems: () => T[],
    fields: (keyof T)[]
  ): ValidatorFn {

    return (
      control: AbstractControl
    ): ValidationErrors | null => {

      const value = control.value;

      if (
        value === null ||
        value === undefined ||
        String(value).trim() === ''
      ) {
        return null;
      }

      const items = getItems();

      if (
        !items ||
        !items.length
      ) {
        return null;
      }

      const currentId =
        Number(
          control.parent?.get('id')?.value || 0
        );

      const duplicate =
        items.some(item => {

          const itemId =
            Number(
              (item as any)['id'] || 0
            );

          // Ignore current record while editing
          if (
            currentId > 0 &&
            itemId === currentId
          ) {
            return false;
          }

          return fields.every(field => {

            const itemValue =
              this.normalizeValue(
                (item as any)[field],
                String(field)
              );

            const controlValue =
              this.normalizeValue(
                value,
                String(field)
              );

            return (
              itemValue === controlValue
            );

          });

        });

      return duplicate
        ? { duplicate: true }
        : null;
    };
  }


  // ===================================================
  // COMBINATION DUPLICATE VALIDATION
  // ===================================================

  duplicateCombinationValidator<T>(
    getItems: () => T[],
    fields: (keyof T)[]
  ): ValidatorFn {

    return (
      control: AbstractControl
    ): ValidationErrors | null => {

      if (!control) {
        return null;
      }

      const items = getItems();

      if (
        !items ||
        !items.length
      ) {
        return null;
      }


      // ===============================================
      // CURRENT RECORD ID
      // ===============================================

      const currentId =
        Number(
          control.get('id')?.value || 0
        );


      // ===============================================
      // GET FORM VALUES
      // ===============================================

      const formValues: Record<string, string> = {};

      for (const field of fields) {

        const fieldName =
          String(field);

        const fieldControl =
          control.get(fieldName);

        if (!fieldControl) {
          return null;
        }

        const value =
          this.normalizeValue(
            fieldControl.value,
            fieldName
          );


        // Don't validate until
        // every duplicate field has a value
        if (!value) {
          return null;
        }

        formValues[fieldName] = value;

      }


      // ===============================================
      // CHECK DUPLICATE
      // ===============================================

      const duplicate =
        items.some(item => {

          const itemId =
            Number(
              (item as any)['id'] || 0
            );


          // ===========================================
          // IGNORE CURRENT RECORD WHILE EDITING
          // ===========================================

          if (
            currentId > 0 &&
            itemId === currentId
          ) {
            return false;
          }


          // ===========================================
          // COMPARE ALL FIELDS
          // ===========================================

          return fields.every(field => {

            const fieldName =
              String(field);

            const itemValue =
              this.normalizeValue(
                (item as any)[field],
                fieldName
              );

            return (
              itemValue ===
              formValues[fieldName]
            );

          });

        });


      // ===============================================
      // RETURN ERROR
      // ===============================================

      return duplicate
        ? {
            duplicateCombination: true
          }
        : null;

    };
  }
}

