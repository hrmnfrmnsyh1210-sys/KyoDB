// Simulated direct R2 upload handler for offline/local development without S3 credentials
export default defineEventHandler(async (event) => {
  return {
    success: true,
    message: 'Mock file uploaded successfully'
  }
})
