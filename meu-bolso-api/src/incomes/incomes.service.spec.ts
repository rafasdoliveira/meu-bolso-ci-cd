import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IncomeService } from './incomes.service';
import { Income } from './entities/income.entity';
import { IncomeSources } from 'src/sources/entities/sources.entity';

describe('IncomeService', () => {
  let service: IncomeService;
  let repository: {
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    findOneOrFail: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncomeService,
        {
          provide: getRepositoryToken(Income),
          useValue: {
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneOrFail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IncomeService>(IncomeService);
    repository = module.get(getRepositoryToken(Income));
  });

  describe('findAllPaginated', () => {
    it('should return paginated and mapped incomes', async () => {
      const incomeMock: Partial<Income> = {
        id: 1,
        date: new Date(2025, 0, 10),
        amount: 1000,
        notes: 'Salário',
        incomeSources: { name: 'Empresa' } as IncomeSources,
        paymentType: { name: 'PIX' } as IncomeSources,
        incomeStatus: { name: 'Recebido' } as IncomeSources,
      };

      repository.findAndCount.mockResolvedValue([[incomeMock as Income], 1]);

      const result = await service.findAllPaginated(1, 10, 2025, 1);

      expect(repository.findAndCount).toHaveBeenCalled();
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.size).toBe(10);
      expect(result.totalPages).toBe(1);

      expect(result.data[0]).toEqual({
        id: 1,
        date: '10/01/2025',
        amount: '1000',
        notes: 'Salário',
        source: 'Empresa',
        paymentType: 'PIX',
        status: 'Recebido',
      });
    });
  });

  describe('createIncome', () => {
    it('should create and return a new income with relations', async () => {
      const dto = {
        user_id: 'user-123',
        date: '2025-01-10',
        amount: 500,
        notes: 'Freelance',
        source_id: 1,
        payment_type_id: 2,
        status_id: 3,
      };

      const createdIncome = { id: 99 };
      const savedIncome = { id: 99 };
      const returnedIncome = {
        id: 99,
        incomeSources: { id: 1 },
        paymentType: { id: 2 },
        incomeStatus: { id: 3 },
      };

      repository.create.mockReturnValue(createdIncome as Income);
      repository.save.mockResolvedValue(savedIncome as Income);
      repository.findOneOrFail.mockResolvedValue(returnedIncome as Income);

      const result = await service.createIncome(dto as any);

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(createdIncome);
      expect(repository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 99 },
        relations: {
          incomeSources: true,
          paymentType: true,
          incomeStatus: true,
        },
      });

      expect(result).toEqual(returnedIncome);
    });
  });
});
