export class IncomeResponseDto {
  id: number;
  date: string;
  amount: string;
  notes?: string;
  source: string;
  paymentType: string;
  status: string;
}
