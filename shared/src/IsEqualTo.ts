import {registerDecorator} from 'class-validator/index';
import {ValidationOptions} from 'class-validator/decorator/ValidationOptions';
import {ValidatorConstraintInterface} from 'class-validator/validation/ValidatorConstraintInterface';
import {ValidatorConstraint} from 'class-validator/decorator/decorators';
import {ValidationArguments} from 'class-validator/validation/ValidationArguments';

export function IsEqualTo(property: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsEqualToConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isEqualTo' })
export class IsEqualToConstraint implements ValidatorConstraintInterface {
  public validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return  typeof relatedValue === typeof value && relatedValue === value;
  }
}
