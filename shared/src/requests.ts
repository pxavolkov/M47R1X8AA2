import {Sex} from './enums';
import { IsInt, IsEmail, MaxLength, Min, Max, validate, ValidatorOptions, ValidationError,
  IsNotEmpty } from 'class-validator';
import { IsEqualTo } from './IsEqualTo';

export class LoginRequest {
  public email: string = '';
  public password: string = '';
  public rememberMe: boolean = false;
}

export class RegisterRequest {
  @IsNotEmpty({message: 'Пожалуйста введите email'})
  @IsEmail(undefined, {message: 'Введите корректный email'})
  public email: string = '';

  @IsNotEmpty({message: 'Пожалуйста введите пароль'})
  @MaxLength(50, {message: 'Пароль не должен быть длинее 50 символов'})
  public password: string = '';

  @IsEqualTo('password', {message: 'Пароль и подтверждение не совпадают'})
  public confirmPassword: string = '';

  @IsNotEmpty({message: 'Пожалуйста введите имя игрока'})
  @MaxLength(100, {message: 'Максимальная длина - 100 символов'})
  public playerName: string = '';

  @IsNotEmpty({message: 'Пожалуйста введите возраст игрока'})
  @IsInt({message: 'Пожалуйста введите возраст игрока'})
  @Min(1, {message: 'Введите корректный возраст'})
  @Max(100, {message: 'Введите корректный возраст'})
  public playerAge: number = 0;

  @IsNotEmpty({message: 'Пожалуйста введите контактные данные'})
  @MaxLength(100, {message: 'Максимальная длина - 100 символов'})
  public info: string = '';

  @MaxLength(1000, {message: 'Максимальная длина - 1000 символов'})
  public allergy: string = '';

  @IsNotEmpty({message: 'Пожалуйста введите имя персонажа'})
  @MaxLength(100, {message: 'Максимальная длина - 100 символов'})
  public firstName: string = '';

  @IsNotEmpty({message: 'Пожалуйста введите фамилию персонажа'})
  @MaxLength(100, {message: 'Максимальная длина - 100 символов'})
  public lastName: string = '';

  public sex: Sex = Sex.MALE;

  @IsInt({message: 'Введите корректный возраст'})
  @Min(1, {message: 'Введите корректный возраст'})
  @Max(1000, {message: 'Введите корректный возраст'})
  public age: number = 0;

  public validate(validatorOptions?: ValidatorOptions): Promise<ValidationError[]> {
    return validate(this, validatorOptions);
  }
}

export interface SendMessage {
  userId: number;
  text: string;
}

export interface LoadDialog {
  userId: number;
}
