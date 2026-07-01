export interface TableResponseInterface {
  idTable: number;
  tableNumber: number;
  tableCapacity: number;
  status: string;
  idRestaurant: number;
  restaurantName: string;

  idFloor?: number;

  posX?: number;
  posY?: number;

  idEmployee?: number;
  employeeName?: string;
  idAssignment?: number;
}

export interface TableCreateInterface {
  tableNumber: number;
  tableCapacity: number;
  idFloor?: number;
}
