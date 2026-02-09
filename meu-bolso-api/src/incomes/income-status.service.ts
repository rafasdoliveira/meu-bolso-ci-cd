import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncomeStatus } from './entities/income-status.entity';

@Injectable()
export class IncomeStatusService {
  constructor(
    @InjectRepository(IncomeStatus)
    private readonly incomeStatusRepository: Repository<IncomeStatus>,
  ) {}

  async findAll(): Promise<IncomeStatus[]> {
    return this.incomeStatusRepository.find({
      order: { id: 'ASC' },
    });
  }
}
