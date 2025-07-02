import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsDate, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";


class CreatePaymentDto {

  @IsString()
  @ApiProperty({
    example: 'debt123',
    description: 'Identificador único de la deuda',
  })
  debtId: string;

  @IsNumber()
  @ApiProperty({
    example: 100.0,
    description: 'Monto de pago',
  })
  amount: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @ApiProperty({
    example: '2000-01-01',
    description: 'Fecha de compromiso de la deuda',
  })
  dueDate: Date;
}


export class CreateCartDto {

  @IsString()
  @ApiProperty({
    example: '123456',
    description: 'Número de razon social',
  })
  buyerNit: string;

  @IsString()
  @ApiProperty({
    example: 'Juan Perez',
    description: 'Nombre de razón social',
  })
  buyerName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentDto)
  @ApiProperty({
    type: [CreatePaymentDto],
    description: 'Lista de pagos',
  })
  payments: CreatePaymentDto[];
}
