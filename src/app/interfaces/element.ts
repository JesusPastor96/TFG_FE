export interface ElementResponseInterface {
  idElement: number;
  type: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
  rotation: number;
  idFloor?: number;
}

export interface ElementCreateInterface {
  type: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
  rotation: number;
  idFloor?: number;
}
