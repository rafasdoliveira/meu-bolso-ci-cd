import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncomeSources } from './entities/sources.entity';
import { SourceResponseDto } from './dto/source-response.dto';

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(IncomeSources)
    private readonly sourceRepository: Repository<IncomeSources>,
  ) {}

  async findAll(): Promise<SourceResponseDto[]> {
    const sources = await this.sourceRepository.find({
      order: { name: 'ASC' },
    });

    return sources.map((source) => ({
      id: source.id,
      name: source.name,
    }));
  }
}
