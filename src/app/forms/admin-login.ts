import { FormFieldInterface } from '../interfaces/form-field';

export const ADMIN_LOGIN_FORM:FormFieldInterface[]=[
    {name:'username',label:'Username',type:'text',required:true},
    {name:'password',label:'Password',type:'password',required:true}
];