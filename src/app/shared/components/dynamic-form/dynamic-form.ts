import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { FormFieldInterface } from '../../../interfaces/form-field';
import { MaterialModule } from '../../ui/material-modules';

@Component({
  selector: 'app-dynamic-form',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dynamic-form.html',
  styleUrl: './dynamic-form.scss',
})
export class DynamicFormComponent implements OnInit {
  @Input() fields: FormFieldInterface[] = [];
  @Input() initialValues?: Record<string, any>;
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() submitLabel: string = 'Enviar';
  @Output() formSubmit = new EventEmitter<any>();

  form!: FormGroup;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValues'] && this.form && this.initialValues) {
      this.form.patchValue(this.initialValues);
    }
  }

  ngOnInit(): void {
    this.form = new FormGroup({});

    this.fields.forEach((field) => {
      const validators: ValidatorFn[] = [];

      // Required
      if (field.required) {
        validators.push(Validators.required);
      }

      // Email (si el tipo es email)
      if (field.type === 'email') {
        validators.push(Validators.email);
      }

      // Longitudes
      if (field.minLength != null) {
        validators.push(Validators.minLength(field.minLength));
      }
      if (field.maxLength != null) {
        validators.push(Validators.maxLength(field.maxLength));
      }

      // Min/Max (números)
      if (field.min != null) {
        validators.push(Validators.min(field.min));
      }
      if (field.max != null) {
        validators.push(Validators.max(field.max));
      }

      // Pattern (regex)
      if (field.pattern) {
        validators.push(Validators.pattern(field.pattern));
      }

      const initialValue = this.initialValues?.[field.name] ?? '';
      this.form.addControl(field.name, new FormControl(initialValue, validators));
    });
  }

  isInvalid(fieldName: string): boolean {
    const ctrl = this.form.get(fieldName);
    return !!ctrl && ctrl.touched && ctrl.invalid;
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
      this.form.reset(); // Clear the form completely (values and untouched state)
    } else {
      this.form.markAllAsTouched();
    }
  }
}
