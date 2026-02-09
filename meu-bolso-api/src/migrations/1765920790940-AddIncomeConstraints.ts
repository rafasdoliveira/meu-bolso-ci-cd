import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIncomeConstraints1699999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE incomes
      ADD CONSTRAINT fk_income_source
      FOREIGN KEY (source_id)
      REFERENCES sources(id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE incomes
      DROP CONSTRAINT fk_income_source
    `);
  }
}
