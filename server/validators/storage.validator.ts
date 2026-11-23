import { z } from 'zod'
import type { FileCategory } from '~/types'

/**
 * Validates that an object key or path does not contain directory traversal attempts (e.g. `../` or `..`)
 */
export function validateSafeKeyPath(key: string): string {
  const trimmed = key.trim()
  if (!trimmed) {
    return ''
  }

  // Prevent path traversal
  if (trimmed.includes('..') || trimmed.includes('\\') || trimmed.includes('\0')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Path traversal sequences (e.g., "..", "\\", null bytes) are strictly forbidden in storage keys.'
    })
  }

  // Prevent multiple consecutive slashes
  if (trimmed.includes('//')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Storage keys cannot contain consecutive forward slashes ("//").'
    })
  }

  return trimmed
}

/**
 * Validates a virtual folder name (no slashes, no traversal, reasonable characters)
 */
export function validateFolderName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Folder name cannot be empty.'
    })
  }

  if (trimmed.length > 128) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Folder name cannot exceed 128 characters.'
    })
  }

  if (
    trimmed === '.' ||
    trimmed === '..' ||
    trimmed.includes('/') ||
    trimmed.includes('\\') ||
    trimmed.includes('..') ||
    trimmed.includes('\0')
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Folder name cannot contain slashes, backslashes, or directory traversal tokens.'
    })
  }

  const validNameRegex = /^[a-zA-Z0-9_\-\.\s]+$/
  if (!validNameRegex.test(trimmed)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Folder name contains invalid characters. Use letters, numbers, spaces, underscores, hyphens, and periods.'
    })
  }

  return trimmed
}

/**
 * Sanitizes and normalizes a virtual folder path ensuring clean leading/trailing slashes
 */
export function sanitizeFolderPath(path: string): string {
  validateSafeKeyPath(path)
  const cleaned = path
    .trim()
    .replace(/^\/+/, '') // remove leading slashes
    .replace(/\/+$/, '') // remove trailing slashes

  return cleaned ? `${cleaned}/` : ''
}

/**
 * Combines folder prefix and filename safely
 */
export function sanitizeObjectKey(folder: string, filename: string): string {
  validateSafeKeyPath(folder)
  validateSafeKeyPath(filename)

  const cleanFolder = folder.trim().replace(/^\/+/, '').replace(/\/+$/, '')
  // sanitize filename: remove slashes and null bytes
  const safeFilename = filename.trim().replace(/[/\\]/g, '_').replace(/\0/g, '')

  if (!safeFilename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Filename cannot be empty.'
    })
  }

  return cleanFolder ? `${cleanFolder}/${safeFilename}` : safeFilename
}

/**
 * Categorizes a file by MIME type or extension
 */
export function categorizeMimeType(mimeType?: string | null, filename?: string): FileCategory {
  const mime = (mimeType || '').toLowerCase()
  const ext = (filename || '').split('.').pop()?.toLowerCase() || ''

  // Image
  if (
    mime.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp', 'tiff', 'avif'].includes(ext)
  ) {
    return 'image'
  }

  // Video
  if (
    mime.startsWith('video/') ||
    ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv'].includes(ext)
  ) {
    return 'video'
  }

  // Audio
  if (
    mime.startsWith('audio/') ||
    ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma'].includes(ext)
  ) {
    return 'audio'
  }

  // Document
  if (
    mime.includes('pdf') ||
    mime.includes('word') ||
    mime.includes('officedocument') ||
    mime.includes('opendocument') ||
    mime.includes('rtf') ||
    mime.includes('text/plain') ||
    mime.includes('text/csv') ||
    ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'txt', 'rtf', 'odt', 'ods', 'odp'].includes(ext)
  ) {
    return 'document'
  }

  // Code & Data
  if (
    mime.includes('json') ||
    mime.includes('javascript') ||
    mime.includes('typescript') ||
    mime.includes('html') ||
    mime.includes('css') ||
    mime.includes('xml') ||
    ['json', 'js', 'ts', 'jsx', 'tsx', 'vue', 'html', 'css', 'sql', 'py', 'sh', 'yaml', 'yml', 'md', 'xml'].includes(ext)
  ) {
    return 'code'
  }

  // Archive
  if (
    mime.includes('zip') ||
    mime.includes('tar') ||
    mime.includes('gzip') ||
    mime.includes('compressed') ||
    ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)
  ) {
    return 'archive'
  }

  return 'other'
}

/**
 * Formats byte counts into human-readable representation
 */
export function formatBytes(bytes?: number | null, decimals = 2): string {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return '0 B'
  if (bytes === 0) return '0 B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const idx = Math.min(i, sizes.length - 1)

  return `${parseFloat((bytes / Math.pow(k, idx)).toFixed(dm))} ${sizes[idx]}`
}

/**
 * Zod validation schema for presigned upload URL requests
 */
export const presignedUploadSchema = z.object({
  filename: z
    .string()
    .min(1, 'Filename is required')
    .max(255, 'Filename cannot exceed 255 characters')
    .refine((fn) => !fn.includes('/') && !fn.includes('\\') && !fn.includes('..'), {
      message: 'Filename cannot contain slashes or path traversal characters'
    }),
  contentType: z.string().default('application/octet-stream'),
  folder: z.string().optional().default(''),
  projectId: z.string().uuid('Project ID must be a valid UUID').nullable().optional(),
  sizeBytes: z.number().int().nonnegative().optional()
})

/**
 * Zod validation schema for confirming completed upload and saving to DB
 */
export const confirmUploadSchema = z.object({
  objectKey: z
    .string()
    .min(1, 'Object key is required')
    .max(512, 'Object key cannot exceed 512 characters')
    .refine((k) => !k.includes('..') && !k.includes('\\'), {
      message: 'Object key cannot contain path traversal tokens'
    }),
  filename: z.string().min(1).max(255),
  mimeType: z.string().default('application/octet-stream'),
  sizeBytes: z.number().int().nonnegative().default(0),
  projectId: z.string().uuid().nullable().optional(),
  checksum: z.string().max(64).nullable().optional()
})

/**
 * Zod validation schema for creating a virtual folder
 */
export const createFolderSchema = z.object({
  folderName: z
    .string()
    .min(1, 'Folder name is required')
    .max(128, 'Folder name cannot exceed 128 characters')
    .regex(/^[a-zA-Z0-9_\-\.\s]+$/, 'Folder name can only contain letters, numbers, spaces, dots, hyphens, and underscores'),
  currentPath: z.string().optional().default(''),
  projectId: z.string().uuid().nullable().optional()
})

/**
 * Zod validation schema for deleting one or multiple objects
 */
export const deleteStorageSchema = z.object({
  keys: z
    .array(z.string().min(1).max(512))
    .min(1, 'At least one object key must be provided for deletion'),
  projectId: z.string().uuid().nullable().optional()
})

/**
 * Zod validation schema for listing storage objects
 */
export const listStorageSchema = z.object({
  prefix: z.string().optional().default(''),
  projectId: z.string().uuid().nullable().optional(),
  search: z.string().optional(),
  category: z.enum(['all', 'image', 'video', 'audio', 'document', 'code', 'archive', 'other']).optional().default('all')
})
