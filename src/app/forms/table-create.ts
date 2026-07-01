import { FormFieldInterface } from '../interfaces/form-field';

export const TABLE_CREATE_FORM: FormFieldInterface[] = [
  { name: 'tableNumber', label: 'Número de mesa', type: 'number', required: true, min: 1 },
  {
    name: 'tableCapacity',
    label: 'Capacidad',
    type: 'number',
    required: true,
    min: 1,
  },
];
