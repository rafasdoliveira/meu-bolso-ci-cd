import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AxiosInstance } from 'axios'
import { GetIncomesStatusService } from './getIncomesStatus.service'
import type { ApiResponse } from '@shared/types/apiResponse'
import type { GetIncomesStatusOutputDto } from './getIncomesStatus.dto'

describe('GetIncomesStatusService', () => {
  let apiMock: AxiosInstance
  let service: GetIncomesStatusService

  beforeEach(() => {
    apiMock = {
      get: vi.fn()
    } as unknown as AxiosInstance

    service = new GetIncomesStatusService(apiMock)
  })

  it('deve buscar o status de incomes e retornar corretamente o payload', async () => {
    const incomesStatus: GetIncomesStatusOutputDto = {
      status: 'success'
    }

    const apiResponse: ApiResponse<GetIncomesStatusOutputDto> = {
      data: incomesStatus,
      message: 'success',
      status: 'success'
    }

    vi.mocked(apiMock.get).mockResolvedValueOnce({
      data: apiResponse
    } as unknown)

    const result = await service.execute()

    expect(apiMock.get).toHaveBeenCalledOnce()
    expect(apiMock.get).toHaveBeenCalledWith('/income-status')
    expect(result).toEqual(incomesStatus)
  })

  it('deve propagar erro quando a API falhar', async () => {
    const error = new Error('API error')

    vi.mocked(apiMock.get).mockRejectedValueOnce(error)

    await expect(service.execute()).rejects.toThrow('API error')
  })
})
