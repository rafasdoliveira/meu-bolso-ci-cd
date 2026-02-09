import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PaymentTypes } from '../../payment-types/payment_types.entity';
import { IncomeStatus } from './income-status.entity';
import { IncomeSources } from '../../sources/entities/sources.entity';

@Entity({ name: 'incomes' })
export class Income {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column('decimal')
  amount: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => PaymentTypes, { nullable: false })
  @JoinColumn({ name: 'payment_types_id' })
  paymentType: PaymentTypes;

  @ManyToOne(() => IncomeStatus, { nullable: false })
  @JoinColumn({ name: 'income_status_id' })
  incomeStatus: IncomeStatus;

  @ManyToOne(() => IncomeSources, { nullable: false })
  @JoinColumn({ name: 'source_id' })
  incomeSources: IncomeSources;
}
