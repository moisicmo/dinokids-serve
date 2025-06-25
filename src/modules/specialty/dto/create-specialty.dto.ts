import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsUUID } from "class-validator";

export class CreateSpecialtyDto {

  @IsUUID()
  @ApiProperty({
    example: 'branch123',
    description: 'Identificador único de la sucursal',
  })
  branchId: string;
  
  @IsString()
  @ApiProperty({
    example: 'Product 1',
    description: 'Nombre de la especialidad',
  })
  name: string;

  @IsNumber()
  @ApiProperty({
    example: 5,
    description: 'Número de sesiones',
  })
  numberSessions: number;

  @IsNumber()
  @ApiProperty({
    example: 0.0,
    description: 'Costo estimado de la sesión',
  })
  estimatedSessionCost: number;

}
