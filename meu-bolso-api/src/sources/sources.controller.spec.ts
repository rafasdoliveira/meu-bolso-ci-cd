import { Test, TestingModule } from '@nestjs/testing';
import { SourcesController } from './sources.controller';
import { SourcesService } from './sources.service';

describe('SourcesController', () => {
  let controller: SourcesController;
  let service: {
    findAll: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SourcesController],
      providers: [
        {
          provide: SourcesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<SourcesController>(SourcesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return sources from service', async () => {
    const sourcesMock = [
      { id: 1, name: 'Salário' },
      { id: 2, name: 'Freelance' },
    ];

    service.findAll.mockResolvedValue(sourcesMock);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(sourcesMock);
  });
});
