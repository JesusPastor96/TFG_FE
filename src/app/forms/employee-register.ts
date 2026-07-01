import { FormFieldInterface } from '../interfaces/form-field';

export const EMPLOYEE_REGISTER_FORM: FormFieldInterface[] = [

  // USERS
  { name: 'firstName', label: 'Nombre', type: 'text', required: true },
  { name: 'lastName', label: 'Apellidos', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },

  // EMPLOYEES
  { name: 'id-employee', label: 'Id del trabajador', type: 'text', required: true },
  {
    name: 'id-role', label: 'Rol', type: 'select', required: true, options: [
      { value: 1, label: 'Empleado' },
      { value: 2, label: 'Manager' },
      { value: 3, label: 'Team Leader' },
      { value: 4, label: 'Assistant Manager' },
      { value: 5, label: 'Owner' }
    ]
  },
  { name: 'shift', label: 'Horario', type: 'text', required: true },
  { name: 'hourly-wage', label: 'Salario por hora', type: 'number' },
  { name: 'hire-date', label: 'Fecha de contratación', type: 'text' }
];
