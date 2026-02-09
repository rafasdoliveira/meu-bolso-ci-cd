import { PaginationService } from './pagination.service';
import { Repository } from 'typeorm';
import { PaginationResponse } from './dto/pagination-response.dto';

describe('PaginationService', () => {
  let service: PaginationService;

  beforeEach(() => {
    service = new PaginationService();
  });

  it('should paginate data correctly', async () => {
    const repositoryMock = {
      findAndCount: jest.fn(),
    } as unknown as Repository<any>;

    const dataMock = [{ id: 1 }, { id: 2 }];
    const totalMock = 10;

    repositoryMock.findAndCount = jest
      .fn()
      .mockResolvedValue([dataMock, totalMock]);

    const page = 2;
    const size = 5;
    const where = { active: true };

    const result = await service.paginate(repositoryMock, page, size, where);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repositoryMock.findAndCount).toHaveBeenCalledWith({
      where,
      skip: (page - 1) * size,
      take: size,
    });

    expect(result).toBeInstanceOf(PaginationResponse);
    expect(result.data).toEqual(dataMock);
    expect(result.page).toBe(page);
    expect(result.size).toBe(size);
    expect(result.total).toBe(totalMock);
  });
});
