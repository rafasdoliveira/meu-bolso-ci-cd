import { Controller, Get } from '@nestjs/common';
import { IncomeStatusService } from './income-status.service';

@Controller('income-status')
export class IncomeStatusController {
  constructor(private readonly incomeStatusService: IncomeStatusService) {}

  @Get()
  async findAll() {
    return this.incomeStatusService.findAll();
  }
}
