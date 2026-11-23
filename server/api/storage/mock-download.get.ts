// Simulated direct R2 download handler for offline/local development without S3 credentials
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const key = (query.key as string) || 'file.txt'
  const filename = key.split('/').pop() || 'file.txt'

  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
  setHeader(event, 'Content-Type', 'application/octet-stream')

  return `Sample simulated file contents for: ${key}`
})
