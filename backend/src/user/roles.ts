import { ValueTransformer } from 'typeorm/decorator/options/ValueTransformer';
import { Role } from '@shared/enums';
export { Role } from '@shared/enums';

/* tslint:disable:no-bitwise */
const roleValues: number[] = Object.keys(Role)
  .filter(k => typeof Role[k as any] === 'number')
  .map(k => Role[k as any]) as any;

export class Roles extends Number {
  has(role: Role): boolean {
    return ((this as any) & role) === role;
  }

  hasAll(roles: Role[]): boolean {
    return this.has(roles.reduce((acc, v) => acc & v, 0));
  }

  toNumber(): number {
    return Number(this);
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