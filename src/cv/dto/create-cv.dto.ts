import {
  IsString,
  IsNumber,
  IsArray,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateCvDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  age: number;

  @IsString()
  @IsNotEmpty()
  cin: string;

  @IsString()
  @IsNotEmpty()
  job: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  path?: string;

  @IsArray()
  @IsOptional()
  skillIds?: number[];
}
