import { FormFieldInterface } from '../interfaces/form-field';

export const RESTAURANT_CREATE_FORM: FormFieldInterface[] = [
    { name: 'cif', label: 'CIF', type: 'text', required: true, maxLength: 9, minLength: 9 },
    { name: 'restaurantName', label: 'Nombre del restaurante', type: 'text', required: true, maxLength: 255 },
    { name: 'address', label: 'Dirección', type: 'text', required: true, maxLength: 255 },
    { name: 'country', label: 'País', type: 'text', required: true, maxLength: 100 },
    { name: 'phone', label: 'Teléfono', type: 'number', required: true, maxLength: 9, minLength: 9 },
    { name: 'capacity', label: 'Capacidad Total', type: 'number', required: true, min: 1 },
    { name: 'totalTables', label: 'Número de mesas', type: 'number', required: true, min: 1 }
];
