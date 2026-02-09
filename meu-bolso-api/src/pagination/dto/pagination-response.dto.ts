export class PaginationResponse<T> {
  data: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;

  constructor(data: T[], page: number, size: number, total: number) {
    this.page = page;
    this.size = size;
    this.total = total;
    this.totalPages = Math.ceil(total / size);
    this.data = data;
  }
}
