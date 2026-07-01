import { FormFieldInterface } from '../interfaces/form-field';

export const OWNER_REGISTER_FORM: FormFieldInterface[] = [

  // PROFILE
  { name: 'firstName', label: 'Nombre', type: 'text', required: true, maxLength: 100 },
  { name: 'lastName', label: 'Apellidos', type: 'text', required: true, maxLength: 150 },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Teléfono', type: 'text', maxLength: 30 },
  { name: 'dni', label: 'DNI', type: 'text', required: true, minLength: 9, maxLength: 9 },
  { name: 'message', label: 'Mensaje (Opcional)', type: 'text' }
];
