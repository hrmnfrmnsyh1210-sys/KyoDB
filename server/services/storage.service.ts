import {
  S3Client,
  HeadBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { ConnectionHealth } from '~/types'

let r2Client: S3Client | null = null

export function getR2Client(): S3Client | null {
  const config = useRuntimeConfig()

  if (!config.r2AccessKeyId || !config.r2SecretAccessKey) {
    return null
  }

  if (!r2Client) {
    const endpoint = config.r2Endpoint || (config.r2AccountId
      ? `https://${config.r2AccountId}.r2.cloudflarestorage.com`
      : '')

    if (!endpoint) {
      return null
    }

    r2Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: config.r2AccessKeyId,
        secretAccessKey: config.r2SecretAccessKey
      }
    })
  }

  return r2Client
}

export async function testR2Connection(): Promise<ConnectionHealth> {
  const config = useRuntimeConfig()
  const lastChecked = new Date().toISOString()

  if (!config.r2AccessKeyId || !config.r2SecretAccessKey || (!config.r2Endpoint && !config.r2AccountId)) {
    return {
      connected: false,
      service: 'r2',
      statusText: 'Not Configured',
      error: 'R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, or R2_ACCOUNT_ID is missing',
      lastChecked
    }
  }

  const client = getR2Client()
  if (!client) {
    return {
      connected: false,
      service: 'r2',
      statusText: 'Client Init Failed',
      error: 'Unable to initialize Cloudflare R2 S3 client',
      lastChecked
    }
  }

  const startTime = Date.now()
  try {
    const bucketName = config.r2BucketName
    if (!bucketName) {
      return {
        connected: false,
        service: 'r2',
        statusText: 'Bucket Not Specified',
        error: 'R2_BUCKET_NAME is not configured',
        lastChecked
      }
    }

    await client.send(new HeadBucketCommand({ Bucket: bucketName }))
    const latencyMs = Date.now() - startTime

    return {
      connected: true,
      service: 'r2',
      statusText: 'Connected (Cloudflare R2)',
      latencyMs,
      details: {
        bucket: bucketName,
        endpoint: config.r2Endpoint || `https://${config.r2AccountId}.r2.cloudflarestorage.com`
      },
      lastChecked
    }
  } catch (err: any) {
    return {
      connected: false,
      service: 'r2',
      statusText: 'Connection Failed',
      error: err.message || 'Failed to connect to Cloudflare R2',
      latencyMs: Date.now() - startTime,
      lastChecked
    }
  }
}

/**
 * Generate a short-lived presigned URL for direct client-to-R2 upload
 */
export async function createPresignedUploadUrl(
  objectKey: string,
  contentType: string,
  expiresInSeconds = 300
): Promise<{ url: string; objectKey: string }> {
  const config = useRuntimeConfig()
  const client = getR2Client()
  if (!client || !config.r2BucketName) {
    throw new Error('Cloudflare R2 client is not configured')
  }

  const command = new PutObjectCommand({
    Bucket: config.r2BucketName,
    Key: objectKey,
    ContentType: contentType
  })

  const url = await getSignedUrl(client, command, { expiresIn: expiresInSeconds })
  return { url, objectKey }
}

/**
 * Generate a short-lived presigned URL for file download
 */
export async function createPresignedDownloadUrl(
  objectKey: string,
  expiresInSeconds = 300
): Promise<string> {
  const config = useRuntimeConfig()
  const client = getR2Client()
  if (!client || !config.r2BucketName) {
    throw new Error('Cloudflare R2 client is not configured')
  }

  const command = new GetObjectCommand({
    Bucket: config.r2BucketName,
    Key: objectKey
  })

  return await getSignedUrl(client, command, { expiresIn: expiresInSeconds })
}
