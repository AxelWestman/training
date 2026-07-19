import { IsString, IsEmail, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

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

  @IsString()
  phone?: string;

}
