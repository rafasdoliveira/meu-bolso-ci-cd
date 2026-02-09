/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { IncomeController } from './incomes.controller';
import { IncomeService } from './incomes.service';

describe('IncomeController', () => {
  let controller: IncomeController;
  let service: {
    findAllPaginated: jest.Mock;
    createIncome: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      findAllPaginated: jest.fn(),
      createIncome: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncomeController],
      providers: [
        {
          provide: IncomeService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<IncomeController>(IncomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAllPaginated with query params', async () => {
    service.findAllPaginated.mockResolvedValue([]);

    const query = {
      page: 1,
      size: 10,
      year: 2025,
      month: 1,
    };

    const result = await controller.findAll(query as any);

    expect(service.findAllPaginated).toHaveBeenCalledWith(1, 10, 2025, 1);
    expect(result).toEqual([]);
  });

  it('should call createIncome with dto', async () => {
    const dto = {
      user_id: 'user-1',
      date: '2025-01-10',
      amount: 1000,
      notes: 'Salário',
      source_id: 1,
      payment_type_id: 1,
      status_id: 1,
    };

    service.createIncome.mockResolvedValue(dto);

    const result = await controller.create(dto as any);

    expect(service.createIncome).toHaveBeenCalledWith(dto);
    expect(result).toEqual(dto);
  });
});
