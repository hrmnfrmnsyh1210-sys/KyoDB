import type {
  Project,
  ProjectDetail,
  ProjectDatabase,
  AvailableDatabase,
  CreateProjectPayload,
  UpdateProjectPayload,
  AttachDatabasePayload
} from '~/types'

export const useProjects = () => {
  const projects = useState<Project[]>('projects_list', () => [])
  const currentProject = useState<ProjectDetail | null>('current_project', () => null)
  const availableDatabases = useState<AvailableDatabase[]>('available_databases', () => [])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetchProjects = async (params?: { search?: string; status?: string }) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; data: Project[] }>('/api/projects', {
        query: params
      })
      projects.value = res.data || []
      return res.data
    } catch (err: any) {
      error.value = err.data?.statusMessage || err.message || 'Failed to fetch projects'
      return []
    } finally {
      isLoading.value = false
    }
  }

  const fetchProject = async (idOrSlug: string) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; data: ProjectDetail }>(`/api/projects/${idOrSlug}`)
      currentProject.value = res.data
      return res.data
    } catch (err: any) {
      error.value = err.data?.statusMessage || err.message || 'Failed to load project details'
      currentProject.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  const createProject = async (payload: CreateProjectPayload) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; data: Project }>('/api/projects', {
        method: 'POST',
        body: payload
      })
      // Prepend to current projects list
      projects.value = [res.data, ...projects.value]
      return { success: true, project: res.data }
    } catch (err: any) {
      const msg = err.data?.statusMessage || err.message || 'Failed to create project'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      isLoading.value = false
    }
  }

  const updateProject = async (id: string, payload: UpdateProjectPayload) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; data: Project }>(`/api/projects/${id}`, {
        method: 'PUT',
        body: payload
      })
      // Update in projects list
      const idx = projects.value.findIndex((p) => p.id === id)
      if (idx !== -1) {
        projects.value[idx] = { ...projects.value[idx], ...res.data }
      }
      if (currentProject.value && currentProject.value.id === id) {
        currentProject.value = { ...currentProject.value, ...res.data }
      }
      return { success: true, project: res.data }
    } catch (err: any) {
      const msg = err.data?.statusMessage || err.message || 'Failed to update project'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      isLoading.value = false
    }
  }

  const deleteProject = async (id: string, options?: { dropDatabases?: boolean }) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; message: string; droppedDatabases: string[] }>(
        `/api/projects/${id}`,
        {
          method: 'DELETE',
          query: { dropDatabases: options?.dropDatabases ? 'true' : 'false' }
        }
      )
      projects.value = projects.value.filter((p) => p.id !== id)
      if (currentProject.value && currentProject.value.id === id) {
        currentProject.value = null
      }
      return { success: true, message: res.message, droppedDatabases: res.droppedDatabases }
    } catch (err: any) {
      const msg = err.data?.statusMessage || err.message || 'Failed to delete project'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      isLoading.value = false
    }
  }

  const fetchAvailableDatabases = async () => {
    try {
      const res = await $fetch<{ success: boolean; data: AvailableDatabase[] }>(
        '/api/projects/available-databases'
      )
      availableDatabases.value = res.data || []
      return res.data
    } catch (err: any) {
      console.warn('Failed to fetch available databases:', err.message)
      return []
    }
  }

  const attachDatabase = async (projectId: string, payload: AttachDatabasePayload) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; data: ProjectDatabase }>(
        `/api/projects/${projectId}/databases`,
        {
          method: 'POST',
          body: payload
        }
      )
      if (currentProject.value && currentProject.value.id === projectId) {
        currentProject.value.databases = [...(currentProject.value.databases || []), res.data]
        currentProject.value.databasesCount = currentProject.value.databases.length
      }
      return { success: true, database: res.data }
    } catch (err: any) {
      const msg = err.data?.statusMessage || err.message || 'Failed to attach database'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      isLoading.value = false
    }
  }

  const detachDatabase = async (projectId: string, databaseName: string) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; message: string }>(
        `/api/projects/${projectId}/databases/${encodeURIComponent(databaseName)}`,
        {
          method: 'DELETE'
        }
      )
      if (currentProject.value && currentProject.value.id === projectId) {
        currentProject.value.databases = currentProject.value.databases.filter(
          (d) => d.databaseName !== databaseName
        )
        currentProject.value.databasesCount = currentProject.value.databases.length
      }
      return { success: true, message: res.message }
    } catch (err: any) {
      const msg = err.data?.statusMessage || err.message || 'Failed to detach database'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      isLoading.value = false
    }
  }

  return {
    projects,
    currentProject,
    availableDatabases,
    isLoading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    fetchAvailableDatabases,
    attachDatabase,
    detachDatabase
  }
}
