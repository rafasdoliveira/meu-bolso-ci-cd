import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { formatDateToBR } from '../utils/formatDateToBR';
import { Between, Repository } from 'typeorm';
import { CreateIncomeDto } from './dto/create-income.dto';
import { IncomeResponseDto } from './dto/income-response.dto';
import { Income } from './entities/income.entity';

@Injectable()
export class IncomeService {
  findAll() {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
  ) {}

  async findAllPaginated(page = 1, size = 10, year?: number, month?: number) {
    const now = new Date();
    const y = year ?? now.getFullYear();
    const m = month ?? now.getMonth() + 1;

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0);

    const validPage = Math.max(page, 1);
    const validSize = Math.max(size, 1);

    const [data, total] = await this.incomeRepository.findAndCount({
      relations: {
        paymentType: true,
        incomeStatus: true,
        incomeSources: true,
      },
      where: {
        date: Between(startDate, endDate),
      },
      skip: (validPage - 1) * validSize,
      take: validSize,
    });

    const mappedData: IncomeResponseDto[] = data.map((income) => ({
      id: income.id,
      date: formatDateToBR(income.date),
      amount: income.amount.toString(),
      notes: income.notes,
      source: income.incomeSources.name,
      paymentType: income.paymentType.name,
      status: income.incomeStatus.name,
    }));

    return {
      page: validPage,
      size: validSize,
      total,
      totalPages: Math.ceil(total / validSize),
      data: mappedData,
    };
  }

  async createIncome(dto: CreateIncomeDto): Promise<Income> {
    const [year, month, day] = dto.date.split('-').map(Number);

    const income = this.incomeRepository.create({
      user_id: dto.user_id,
      date: new Date(year, month - 1, day),
      amount: dto.amount,
      notes: dto.notes,
      incomeSources: { id: dto.source_id },
      paymentType: { id: dto.payment_type_id },
      incomeStatus: { id: dto.status_id },
    });

    const savedIncome = await this.incomeRepository.save(income);

    return this.incomeRepository.findOneOrFail({
      where: { id: savedIncome.id },
      relations: {
        incomeSources: true,
        paymentType: true,
        incomeStatus: true,
      },
    });
  }
}
