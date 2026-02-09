import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentTypes } from './payment_types.entity';

@Injectable()
export class PaymentTypesService {
  constructor(
    @InjectRepository(PaymentTypes)
    private readonly paymentTypesRepository: Repository<PaymentTypes>,
  ) {}

  async findAll(): Promise<PaymentTypes[]> {
    return await this.paymentTypesRepository.find({
      order: { id: 'ASC' },
    });
  }
}
