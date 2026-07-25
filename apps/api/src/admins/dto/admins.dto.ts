import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsIn(['admin', 'superadmin'])
  role: 'admin' | 'superadmin';

  @IsString()
  @IsNotEmpty()
  dni: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateAdminDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  dni?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(['admin', 'superadmin'])
  role?: 'admin' | 'superadmin';
}
