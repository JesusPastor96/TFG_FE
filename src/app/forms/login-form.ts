import { FormFieldInterface } from '../interfaces/form-field';

export const LOGIN_FORM: FormFieldInterface[] = [
    { name: 'dni', label: 'DNI', type: 'text', required: true, pattern: '^[0-9]{8}[A-Z]$', maxLength: 9, minLength: 9 },
    { name: 'password', label: 'Password', type: 'password', required: true }
];