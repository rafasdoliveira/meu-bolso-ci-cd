import { Injectable } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { PaginationResponse } from './dto/pagination-response.dto';

@Injectable()
export class PaginationService {
  async paginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    page = 1,
    size = 10,
    where?: object,
  ): Promise<PaginationResponse<T>> {
    const [data, total] = await repository.findAndCount({
      where,
      skip: (page - 1) * size,
      take: size,
    });

    return new PaginationResponse<T>(data, page, size, total);
  }
}
