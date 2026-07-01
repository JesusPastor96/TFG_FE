

export interface UserInterface{
    id: number;
    firstName:string;
    lastName:string;
    email:string;
    password:string;
    isActive?: boolean;
    createdAt?:string;
    updatedAt?:string;
}