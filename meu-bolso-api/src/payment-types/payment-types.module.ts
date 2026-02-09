import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationModule } from 'src/pagination/pagination.module';
import { PaymentTypes } from '../payment-types/payment_types.entity';
import { PaymentTypesService } from './payment-types.service';
import { PaymentTypesController } from './payment-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentTypes]), PaginationModule],
  providers: [PaymentTypesService],
  controllers: [PaymentTypesController],
})
export class PaymentTypesModule {}
