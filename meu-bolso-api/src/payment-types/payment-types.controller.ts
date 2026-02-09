import { Controller, Get } from '@nestjs/common';
import { PaymentTypesService } from './payment-types.service';

@Controller('payment-types')
export class PaymentTypesController {
  constructor(private readonly paymentService: PaymentTypesService) {}

  @Get()
  findAll() {
    return this.paymentService.findAll();
  }
}
