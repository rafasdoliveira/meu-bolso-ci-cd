import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'payment_types' })
export class PaymentTypes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;
}
