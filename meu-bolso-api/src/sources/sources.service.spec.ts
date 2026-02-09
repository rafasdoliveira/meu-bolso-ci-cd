import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SourcesService } from './sources.service';
import { IncomeSources } from './entities/sources.entity';

describe('SourcesService', () => {
  let service: SourcesService;
  let repository: {
    find: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SourcesService,
        {
          provide: getRepositoryToken(IncomeSources),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SourcesService>(SourcesService);
    repository = module.get(getRepositoryToken(IncomeSources));
  });

  it('should return mapped sources ordered by name', async () => {
    const sourcesMock = [
      { id: 2, name: 'Salário' },
      { id: 1, name: 'Freelance' },
    ];

    repository.find.mockResolvedValue(sourcesMock);

    const result = await service.findAll();

    expect(repository.find).toHaveBeenCalledWith({
      order: { name: 'ASC' },
    });

    expect(result).toEqual([
      { id: 2, name: 'Salário' },
      { id: 1, name: 'Freelance' },
    ]);
  });
});
