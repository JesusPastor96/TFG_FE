export type FieldType = 'text' | 'email' | 'password' | 'number' | 'select' | 'date' | 'checkbox';

export interface FormFieldInterface {
  name: string;
  label: string;
  type: FieldType;

  required?: boolean;

  // Validaciones estándar
  minLength?: number;
  maxLength?: number;
  pattern?: string | RegExp;
  min?: number;
  max?: number;

  // Si lo usabas para lógica de roles en selects (puede quedarse)
  roles?: string[];

  options?: {
    value: any;
    label: string;
  }[];
}
