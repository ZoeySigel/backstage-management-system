import request from '@/utils/request'
import type { DashboardResponseData } from './type'

export const reqDashboardOverview = () =>
  request.get<DashboardResponseData, DashboardResponseData>('/dashboard/overview')
