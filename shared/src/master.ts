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
