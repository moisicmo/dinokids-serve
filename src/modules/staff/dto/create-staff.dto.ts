import { CreateUserDto } from "@/common/dto/create-user.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsUUID } from "class-validator";

export class CreateStaffDto extends CreateUserDto {
  @IsUUID()
  @ApiProperty({
    example: 'rol-123',
    description: 'ID del rol del cliente',
  })
  roleId: string;

  @IsArray()
  @ApiProperty({
      example: ['suc123','suc321'],
      description: 'Lista de Identificadores de sucursales',
  })
  brancheIds: string[];
}
