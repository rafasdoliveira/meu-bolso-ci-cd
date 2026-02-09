import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeSources } from './entities/sources.entity';
import { SourcesController } from './sources.controller';
import { SourcesService } from './sources.service';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeSources])],
  providers: [SourcesService],
  controllers: [SourcesController],
})
export class SourcesModule {}
