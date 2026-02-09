import { Controller, Get } from '@nestjs/common';
import { SourcesService } from './sources.service';
import { SourceResponseDto } from './dto/source-response.dto';

@Controller('sources')
export class SourcesController {
  constructor(private readonly sourceService: SourcesService) {}

  @Get()
  findAll(): Promise<SourceResponseDto[]> {
    return this.sourceService.findAll();
  }
}
