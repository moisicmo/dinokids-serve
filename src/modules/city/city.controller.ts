import { Controller, Get, Body, Query } from '@nestjs/common';
import { CityService } from './city.service';
import { PaginationDto } from '@/common';

@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.cityService.findAll(paginationDto);
  }

}
