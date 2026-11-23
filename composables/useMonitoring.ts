import type {
  SystemResourceStats,
  AuditLogEntry,
  QueryHistoryRecord,
  AuditLogListResponse,
  QueryHistoryListResponse
} from '~/types'

export function useMonitoring() {
  const stats = ref<SystemResourceStats | null>(null)
  const isLoadingStats = ref(false)

  // Audit Logs
  const auditLogs = ref<AuditLogEntry[]>([])
  const totalAuditLogs = ref(0)
  const auditPage = ref(1)
  const auditPageSize = ref(15)
  const auditTotalPages = ref(1)
  const auditActionFilter = ref('')
  const auditSearch = ref('')
  const isLoadingAudit = ref(false)

  // Query History
  const queryHistory = ref<QueryHistoryRecord[]>([])
  const totalQueries = ref(0)
  const queryPage = ref(1)
  const queryPageSize = ref(15)
  const queryTotalPages = ref(1)
  const queryDbFilter = ref('')
  const queryStatusFilter = ref('')
  const isLoadingQuery = ref(false)

  const fetchStats = async () => {
    isLoadingStats.value = true
    try {
      const res = await $fetch<{ success: boolean; data: SystemResourceStats }>('/api/monitoring/stats')
      if (res?.success && res.data) {
        stats.value = res.data
      }
    } catch (err) {
      console.error('Failed to fetch system stats:', err)
    } finally {
      isLoadingStats.value = false
    }
  }

  const fetchAuditLogs = async (page = 1) => {
    isLoadingAudit.value = true
    auditPage.value = page
    try {
      const query: Record<string, any> = {
        page,
        pageSize: auditPageSize.value
      }
      if (auditActionFilter.value) query.action = auditActionFilter.value
      if (auditSearch.value.trim()) query.search = auditSearch.value.trim()

      const res = await $fetch<{ success: boolean; data: AuditLogListResponse }>('/api/monitoring/audit-logs', {
        query
      })
      if (res?.success && res.data) {
        auditLogs.value = res.data.items
        totalAuditLogs.value = res.data.total
        auditTotalPages.value = res.data.totalPages
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err)
    } finally {
      isLoadingAudit.value = false
    }
  }

  const fetchQueryHistory = async (page = 1) => {
    isLoadingQuery.value = true
    queryPage.value = page
    try {
      const query: Record<string, any> = {
        page,
        pageSize: queryPageSize.value
      }
      if (queryDbFilter.value) query.databaseName = queryDbFilter.value
      if (queryStatusFilter.value) query.status = queryStatusFilter.value

      const res = await $fetch<{ success: boolean; data: QueryHistoryListResponse }>('/api/monitoring/query-history', {
        query
      })
      if (res?.success && res.data) {
        queryHistory.value = res.data.items
        totalQueries.value = res.data.total
        queryTotalPages.value = res.data.totalPages
      }
    } catch (err) {
      console.error('Failed to fetch query history:', err)
    } finally {
      isLoadingQuery.value = false
    }
  }

  return {
    stats,
    isLoadingStats,
    fetchStats,

    auditLogs,
    totalAuditLogs,
    auditPage,
    auditPageSize,
    auditTotalPages,
    auditActionFilter,
    auditSearch,
    isLoadingAudit,
    fetchAuditLogs,

    queryHistory,
    totalQueries,
    queryPage,
    queryPageSize,
    queryTotalPages,
    queryDbFilter,
    queryStatusFilter,
    isLoadingQuery,
    fetchQueryHistory
  }
}
