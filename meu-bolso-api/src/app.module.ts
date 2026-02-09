import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IncomeStatus } from './incomes/entities/income-status.entity';
import { Income } from './incomes/entities/income.entity';
import { IncomesModule } from './incomes/incomes.module';
import { PaginationModule } from './pagination/pagination.module';
import { PaymentTypesModule } from './payment-types/payment-types.module';
import { PaymentTypes } from './payment-types/payment_types.entity';
import { IncomeSources } from './sources/entities/sources.entity';
import { SourcesModule } from './sources/sources.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Income, PaymentTypes, IncomeStatus, IncomeSources],
        synchronize: false,
      }),
    }),
    IncomesModule,
    SourcesModule,
    PaginationModule,
    PaymentTypesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
