export interface RestaurantInterface {
  id: number;
  cif: string;
  name: string;
  address: string;
  country: string;
  phone: string;
  capacity: number;
  totalTables: number;
  owner: number;
}

export interface RestaurantsResponseInterface {
  idRestaurant: number;
  cif: string;
  restaurantName: string;
  address: string;
  country: string;
  phone: number;
  ownerName: string;
  idOwner: number;
}
