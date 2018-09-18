export enum Sex {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
}

export enum TransactionType {
  TRANSFER = 'TRANSFER',
  MINING = 'MINING',
}

// tslint:disable max-line-length
export enum EventType {
  LOGIN = 'LOGIN', // {rememberMe:boolean}
  PHOTO_UPLOAD = 'PHOTO_UPLOAD', // {old:{size:number,hash:string},new:{size:number,hash:string}}
  MINING_START = 'MINING_START', // {time:number,amount:number}
  MINING_FINISH = 'MINING_FINISH', // {time:number,amount:number}
  MONEY_TRANSFER = 'MONEY_TRANSFER', // {toUserId:number,balanceBefore:number,amount:number}
  ITEM_TRANSFER = 'ITEM_TRANSFER', // {toUserId:number,itemId:number,amount:number,amountRemaining:number}

  // Master:
  BALANCE_CHANGE = 'BALANCE_CHANGE', // {userId:number,old:{balance:number},new:{balance:number}}
  QUENTA_UPLOAD = 'QUENTA_UPLOAD', // {userId:number,old:{name:string,size:number,hash:string},new:{name:string,size:number,hash:string}}
  SET_CITIZEN = 'SET_CITIZEN', // {userId:number,isCitizen:boolean}
  INVENTORY_VIEW = 'INVENTORY_VIEW', // {userId:number}
  ITEM_GIVE = 'ITEM_GIVE', // {userId:number,itemId:number,amount:number,new:{amount:number}}
  ITEM_TAKE = 'ITEM_TAKE', // {userId:number,itemId:number,amount:number,new:{amount:number}}
  NEWS_ADD = 'NEWS_ADD', // {id:number,title:string,text:string,createDate:Date}
  NEWS_EDIT = 'NEWS_EDIT', // {id:number,old:{title:string,text:string,createDate:Date},new:{title:string,text:string,createDate:Date}}
  ITEM_ADD = 'ITEM_ADD', // {id:number,title:string,shortDesc:string,longDesc:string,icon:{size:number,hash:string}}
  ITEM_EDIT = 'ITEM_EDIT', // {id:number,old:{title:string,shortDesc:string,longDesc:string,icon:{size:number,hash:string}},new:{title:string,shortDesc:string,longDesc:string,icon:{size:number,hash:string}}}
  PROPERTY_ADD = 'PROP_ADD', // {id:number,name:string,viewRoles:number,editRoles:number}
  PROPERTY_EDIT = 'PROP_EDIT', // {id:number,old:{name:string,viewRoles:number,editRoles:number},new:{name:string,viewRoles:number,editRoles:number}}

  VALUE_EDIT = 'VALUE_EDIT', // {propertyId:number,userId:number,old:{value:string},new:{value:string}}
}
// tslint:enable max-line-length

// tslint:disable no-bitwise
export enum Role {
  Master = 1 << 0,
  Self = 1 << 1,
  Medic = 1 << 2,
  Marshal = 1 << 3
}
