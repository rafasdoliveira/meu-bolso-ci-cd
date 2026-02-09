import { IsString } from 'class-validator';

export class CreateSourceDto {
  @IsString({ message: 'Informe o nome da fonte.' })
  name: string;
}
