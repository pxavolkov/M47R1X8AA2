import { Sex } from './enums';

export interface User {
  id: number;
  playerName: string;
  playerAge: string;
  info: string;
  allergy: string | null;
  registrationDate: string | Date;
  email: string;
  profile: {
    firstName: string,
    lastName: string,
    sex: Sex,
    age: number,
    quentaPath: string | null,
    isCitizen: boolean,
    balance: number,
    donated: boolean
  };
}

export interface News {
  id: number;
  title: string;
  text: string;
  createDate: string | Date;
}

export interface SetCitizen {
  userId: number;
  isCitizen: boolean;
}

export interface SetDonated {
  userId: number;
  donated: boolean;
}

export interface SetBalance {
  userId: number;
  balance: number;
}

export interface UploadQuenta {
  userId: number;
  quentaPath: string;
}

export interface Item {
  id: number;
  title: string;
  shortDesc: string;
  longDesc: string;
}

export interface InventoryItemData {
  userId: number;
  itemId: number;
  amount: number;
}

export interface SendMultiMessage {
  userIds: number[];
  text: string;
}

export interface Property {
  id?: number;
  name: string;
  viewRoles: number;
  editRoles: number;
}
