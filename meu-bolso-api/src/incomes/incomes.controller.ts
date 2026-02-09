import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateIncomeDto } from './dto/create-income.dto';
import { IncomeQueryDto } from './dto/income-query.dto';
import { Income } from './entities/income.entity';
import { IncomeService } from './incomes.service';

@Controller('incomes')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Get()
  findAll(@Query() query: IncomeQueryDto) {
    const { page, size, year, month } = query;

    return this.incomeService.findAllPaginated(page, size, year, month);
  }

  @Post()
  async create(@Body() dto: CreateIncomeDto): Promise<Income> {
    return this.incomeService.createIncome(dto);
  }
}
