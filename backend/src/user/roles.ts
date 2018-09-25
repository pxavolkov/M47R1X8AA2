import { ValueTransformer } from 'typeorm/decorator/options/ValueTransformer';
import { Role } from '@shared/enums';
export { Role } from '@shared/enums';

/* tslint:disable:no-bitwise */
const roleValues: number[] = Object.keys(Role)
  .filter(k => typeof Role[k as any] === 'number')
  .map(k => Role[k as any]) as any;

export class Roles extends Number {
  has(role: Role | Roles | number): boolean {
    return ((this as any) & (role as number)) === role;
  }

  intersects(role: Role | Roles | number): boolean {
    return ((this as any) & (role as number)) > 0;
  }

  // this has all roles from array
  hasAll(roles: Role[]): boolean {
    return this.has(roles.reduce((acc, v) => acc | v, 0));
  }

  // this has any role from array
  hasAny(roles: Role[]): boolean {
    return this.intersects(roles.reduce((acc, v) => acc | v, 0));
  }

  toNumber(): number {
    return Number(this);
  }

  addSelf(): Roles {
    return new Roles((this as any) | Role.Self);
  }

  addAll(): Roles {
    return new Roles((this as any) | Role.All);
  }

  addMaster(): Roles {
    return new Roles((this as any) | Role.Master);
  }
}

export class RolesTransformer implements ValueTransformer {
  to(value: Roles): number {
    return value ? Number(value) : 0;
  }

  from(value: number): Roles {
    return new Roles(value);
  }
}