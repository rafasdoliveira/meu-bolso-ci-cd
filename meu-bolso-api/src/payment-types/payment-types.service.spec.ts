import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentTypesService } from './payment-types.service';
import { PaymentTypes } from './payment_types.entity';

describe('PaymentTypesService', () => {
  let service: PaymentTypesService;
  let repository: {
    find: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentTypesService,
        {
          provide: getRepositoryToken(PaymentTypes),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentTypesService>(PaymentTypesService);
    repository = module.get(getRepositoryToken(PaymentTypes));
  });

  it('should return payment types ordered by id', async () => {
    const paymentTypesMock = [
      { id: 1, name: 'Crédito' },
      { id: 2, name: 'Débito' },
    ];

    repository.find.mockResolvedValue(paymentTypesMock);

    const result = await service.findAll();

    expect(repository.find).toHaveBeenCalledWith({
      order: { id: 'ASC' },
    });

    expect(result).toEqual(paymentTypesMock);
  });
});
