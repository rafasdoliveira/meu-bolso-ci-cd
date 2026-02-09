import {
  IsInt,
  IsNumber,
  IsOptional,
  IsDateString,
  IsString,
} from 'class-validator';

export class CreateIncomeDto {
  @IsInt({ message: 'O campo Usuário é obrigatório e deve ser um número' })
  user_id: number;

  @IsDateString(
    {},
    {
      message:
        'O campo Data é obrigatório e deve ser uma data válida (YYYY-MM-DD)',
    },
  )
  date: string;

  @IsInt({
    message: 'O campo Fonte de Renda é obrigatório e deve ser um número',
  })
  source_id: number;

  @IsNumber({}, { message: 'O campo Valor é obrigatório e deve ser um número' })
  amount: number;

  @IsOptional()
  @IsString({ message: 'O campo Observações deve ser texto' })
  notes?: string;

  @IsInt({ message: 'O campo Tipo de Pagamento é obrigatório' })
  payment_type_id: number;

  @IsInt({ message: 'O campo Status é obrigatório' })
  status_id: number;
}
