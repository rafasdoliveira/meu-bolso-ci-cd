import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'income_status' })
export class IncomeStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;
}
