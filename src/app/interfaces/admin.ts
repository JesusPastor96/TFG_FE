//Tipos de rol que va a tener el admin. Por ahora solo ADMIN
export type AdminRoles = 'ADMIN';

//estructura que seguiran todos los admins con los campos necesarios
export interface AdminInterface {
  id: number;
  username: string;
  email: string;
  password: string;
  role: AdminRoles;
}

export interface AdminResponseInterface {
  idAdmin: number;
  username: string;
  email: string;
}

export interface AdminCreateInterface {
  username: string;
  email: string;
  password: string;
}
