import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sources' })
export class IncomeSources {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;
}
