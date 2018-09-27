import { Sex, HackMinigame, HackType } from './enums';
import { Property } from './master';

export class LoginResponse {
  public constructor(
    readonly expiresIn: number,
    readonly accessToken: string,
  ) {}
}

export class ProfileResponse {
  public id: number = 0;
  public firstName: string = '';
  public lastName: string = '';
  public sex: Sex = Sex.MALE;
  public age: number = 0;
  public photoUploaded: boolean = false;
  public isCitizen: boolean = false;
  public donated: boolean = false;
  public balance: number = 0;
  public miningEndTime: number | null = null;
  public miningAmount: number = 0;
  public unreadNews: number = 0;
  public quentaExists: boolean = false;
  public unreadMessages: number = 0;
}

export class News {
  public title: string = '';
  public text: string = '';
  public date: number = 0;
}

export class NewsResponse {
  public news: News[] = [];
}

export class PublicProfile {
  public id: number = 0;
  public firstName: string = '';
  public lastName: string = '';
  public photoUploaded: boolean = false;
  public unreadMessages?: number = 0;
}

export class StartMiningResponse {
  public miningEndTime: number = 0;
  public miningAmount: number = 0;
}

export interface Dialog {
  messages: Message[];
  users: PublicProfile[];
}

export interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  text: string;
  date: Date | string;
}

export interface InventoryItem {
  userId: number;
  itemId: number;
  amount: number;
  item: Item;
}

export interface Item {
  id: number;
  title: string;
  shortDesc: string;
  longDesc: string;
}

export interface InventoryItemAmount {
  itemId: number;
  amount: number;
}

export interface PropertyValueEditable {
  id: number;
  name: string;
  value: string;
  canEdit: boolean;
}

export interface PropertiesResponse {
  profile: PublicProfile;
  list: PropertyValueEditable[];
}

export interface ActivateResponse {
  creditsBonus: number;
  item: Item;
  itemId: number;
  itemAmount: number;
  property: Property;
  propertyId: number;
  propertyValue: string;
}

export interface KbServer {
  id: number;
  name: string;
  description: string;
  hasAccess?: boolean;
  needPassword?: boolean;
  correctPassword?: boolean;
}

export interface KbEntry {
  id: number;
  key: string;
  needPassword: boolean;
  hasAccess: boolean;
  text?: string;
  link?: string;
  correctPassword?: boolean;
  encrypted?: boolean;
  decrypted?: boolean;
}

export interface KbEntriesResponse {
  server: KbServer;
  entries: KbEntry[];
}

export interface HackStart {
  id: number;
  minigame: HackMinigame;
  minScore: number;
}

export interface HackToken {
  id: number;
  expire: Date;
  type: HackType;
  targetUserId: number | null;
  targetServerId: number | null;
  targetEntryId: number | null;
}

export interface HackKbData {
  serverName: string;
  description?: string;
  key?: string;
  password?: string;
  encryptionKey?: string;
}

export interface HackKbResponse {
  type: HackType;
  data: HackKbData;
}