import { CreateUserDto } from "@/common/dto/create-user.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateTutorDto extends CreateUserDto {

  @IsString()
  @ApiProperty({
    example: 'Ciudad del docente',
    description: 'Ciudad del docente',
  })
  city: string;

  @IsString()
  @ApiProperty({
    example: 'Zona Norte',
    description: 'Zona del docente',
  })
  zone: string;

  @IsString()
  @ApiProperty({
    example: 'Calle Falsa 123',
    description: 'Dirección del docente',
  })
  address: string;

}
