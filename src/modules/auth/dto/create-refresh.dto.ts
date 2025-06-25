import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateRefreshDto {

  @IsString()
  @ApiProperty({
    example: 'token_de_refresco',
    description: 'Token de refresco',
  })
  refreshToken: string;
}
