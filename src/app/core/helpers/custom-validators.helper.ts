import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";

export const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('newPassword')?.value;
  const rePassword = group.get('confirmPassword')?.value;
  return password === rePassword ? null : { passwordMismatch: true };
};