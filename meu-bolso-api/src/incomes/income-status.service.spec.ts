import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IncomeStatusService } from './income-status.service';
import { IncomeStatus } from './entities/income-status.entity';

describe('IncomeStatusService', () => {
  let service: IncomeStatusService;
  let repository: {
    find: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncomeStatusService,
        {
          provide: getRepositoryToken(IncomeStatus),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IncomeStatusService>(IncomeStatusService);
    repository = module.get(getRepositoryToken(IncomeStatus));
  });

  it('should return income statuses ordered by id', async () => {
    const incomeStatusMock = [
      { id: 1, name: 'Recebido' },
      { id: 2, name: 'Pendente' },
    ];

    repository.find.mockResolvedValue(incomeStatusMock);

    const result = await service.findAll();

    expect(repository.find).toHaveBeenCalledWith({
      order: { id: 'ASC' },
    });

    expect(result).toEqual(incomeStatusMock);
  });
});
