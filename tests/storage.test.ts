import { describe, it, expect } from 'vitest'
import {
  validateSafeKeyPath,
  validateFolderName,
  sanitizeFolderPath,
  sanitizeObjectKey,
  categorizeMimeType,
  formatBytes,
  presignedUploadSchema,
  createFolderSchema,
  confirmUploadSchema,
  deleteStorageSchema,
  listStorageSchema
} from '../server/validators/storage.validator'

describe('Storage Validators & Security Guardrails', () => {
  describe('validateSafeKeyPath()', () => {
    it('accepts clean storage object keys and paths', () => {
      expect(validateSafeKeyPath('documents/report.pdf')).toBe('documents/report.pdf')
      expect(validateSafeKeyPath('projects/uuid-123/avatar.png')).toBe('projects/uuid-123/avatar.png')
      expect(validateSafeKeyPath('data.csv')).toBe('data.csv')
    })

    it('rejects directory traversal attempts with double dots', () => {
      expect(() => validateSafeKeyPath('../secret.env')).toThrow()
      expect(() => validateSafeKeyPath('folder/../../etc/passwd')).toThrow()
      expect(() => validateSafeKeyPath('..')).toThrow()
    })

    it('rejects Windows-style backslashes', () => {
      expect(() => validateSafeKeyPath('folder\\subfolder\\file.txt')).toThrow()
      expect(() => validateSafeKeyPath('..\\root')).toThrow()
    })

    it('rejects null byte injection', () => {
      expect(() => validateSafeKeyPath('file.png\0.php')).toThrow()
    })

    it('rejects consecutive slashes', () => {
      expect(() => validateSafeKeyPath('folder//subfolder/file.png')).toThrow()
    })
  })

  describe('validateFolderName()', () => {
    it('accepts valid virtual folder names', () => {
      expect(validateFolderName('documents')).toBe('documents')
      expect(validateFolderName('my-files_2026')).toBe('my-files_2026')
      expect(validateFolderName('Monthly Reports')).toBe('Monthly Reports')
      expect(validateFolderName('v1.0')).toBe('v1.0')
    })

    it('rejects folders containing slashes or backslashes', () => {
      expect(() => validateFolderName('nested/folder')).toThrow()
      expect(() => validateFolderName('folder\\sub')).toThrow()
    })

    it('rejects folder traversal tokens', () => {
      expect(() => validateFolderName('..')).toThrow()
      expect(() => validateFolderName('.')).toThrow()
    })

    it('rejects empty or whitespace-only names', () => {
      expect(() => validateFolderName('')).toThrow()
      expect(() => validateFolderName('   ')).toThrow()
    })

    it('rejects names exceeding 128 characters', () => {
      const longName = 'a'.repeat(129)
      expect(() => validateFolderName(longName)).toThrow()
    })
  })

  describe('sanitizeFolderPath()', () => {
    it('normalizes slashes properly', () => {
      expect(sanitizeFolderPath('documents')).toBe('documents/')
      expect(sanitizeFolderPath('/documents/')).toBe('documents/')
      expect(sanitizeFolderPath('projects/123/')).toBe('projects/123/')
      expect(sanitizeFolderPath('')).toBe('')
      expect(sanitizeFolderPath('   ')).toBe('')
    })
  })

  describe('sanitizeObjectKey()', () => {
    it('combines folder and filename cleanly', () => {
      expect(sanitizeObjectKey('documents/', 'invoice.pdf')).toBe('documents/invoice.pdf')
      expect(sanitizeObjectKey('/uploads', 'photo.jpg')).toBe('uploads/photo.jpg')
      expect(sanitizeObjectKey('', 'file.txt')).toBe('file.txt')
    })

    it('replaces dangerous slashes within filename', () => {
      expect(sanitizeObjectKey('docs', 'sub/bad.txt')).toBe('docs/sub_bad.txt')
    })

    it('rejects empty filename', () => {
      expect(() => sanitizeObjectKey('docs', '')).toThrow()
    })
  })

  describe('categorizeMimeType()', () => {
    it('categorizes images correctly', () => {
      expect(categorizeMimeType('image/png', 'pic.png')).toBe('image')
      expect(categorizeMimeType('image/jpeg', 'photo.jpg')).toBe('image')
      expect(categorizeMimeType(undefined, 'icon.svg')).toBe('image')
      expect(categorizeMimeType(undefined, 'hero.webp')).toBe('image')
    })

    it('categorizes videos correctly', () => {
      expect(categorizeMimeType('video/mp4', 'movie.mp4')).toBe('video')
      expect(categorizeMimeType(undefined, 'clip.mov')).toBe('video')
      expect(categorizeMimeType(undefined, 'screen.webm')).toBe('video')
    })

    it('categorizes audio correctly', () => {
      expect(categorizeMimeType('audio/mpeg', 'song.mp3')).toBe('audio')
      expect(categorizeMimeType(undefined, 'voice.wav')).toBe('audio')
    })

    it('categorizes documents correctly', () => {
      expect(categorizeMimeType('application/pdf', 'doc.pdf')).toBe('document')
      expect(categorizeMimeType(undefined, 'sheet.xlsx')).toBe('document')
      expect(categorizeMimeType(undefined, 'data.csv')).toBe('document')
      expect(categorizeMimeType('text/plain', 'notes.txt')).toBe('document')
    })

    it('categorizes code and data files correctly', () => {
      expect(categorizeMimeType('application/json', 'package.json')).toBe('code')
      expect(categorizeMimeType(undefined, 'app.vue')).toBe('code')
      expect(categorizeMimeType(undefined, 'schema.sql')).toBe('code')
      expect(categorizeMimeType(undefined, 'script.ts')).toBe('code')
    })

    it('categorizes archives correctly', () => {
      expect(categorizeMimeType('application/zip', 'backup.zip')).toBe('archive')
      expect(categorizeMimeType(undefined, 'archive.tar.gz')).toBe('archive')
      expect(categorizeMimeType(undefined, 'bundle.7z')).toBe('archive')
    })

    it('falls back to other for unknown binaries', () => {
      expect(categorizeMimeType('application/octet-stream', 'firmware.bin')).toBe('other')
    })
  })

  describe('formatBytes()', () => {
    it('formats byte boundaries accurately', () => {
      expect(formatBytes(0)).toBe('0 B')
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1048576)).toBe('1 MB')
      expect(formatBytes(1073741824)).toBe('1 GB')
      expect(formatBytes(1536)).toBe('1.5 KB')
    })

    it('handles null and undefined safely', () => {
      expect(formatBytes(null)).toBe('0 B')
      expect(formatBytes(undefined)).toBe('0 B')
    })
  })

  describe('Zod Schemas', () => {
    it('validates presignedUploadSchema correctly', () => {
      const valid = presignedUploadSchema.safeParse({
        filename: 'avatar.png',
        contentType: 'image/png',
        folder: 'users'
      })
      expect(valid.success).toBe(true)

      const invalidTraverse = presignedUploadSchema.safeParse({
        filename: '../bad.exe'
      })
      expect(invalidTraverse.success).toBe(false)
    })

    it('validates createFolderSchema correctly', () => {
      const valid = createFolderSchema.safeParse({
        folderName: 'invoices_2026',
        currentPath: 'accounting'
      })
      expect(valid.success).toBe(true)

      const invalidSlashes = createFolderSchema.safeParse({
        folderName: 'accounting/2026'
      })
      expect(invalidSlashes.success).toBe(false)
    })

    it('validates confirmUploadSchema correctly', () => {
      const valid = confirmUploadSchema.safeParse({
        objectKey: 'uploads/photo.jpg',
        filename: 'photo.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 204800
      })
      expect(valid.success).toBe(true)

      const invalidKey = confirmUploadSchema.safeParse({
        objectKey: '../photo.jpg',
        filename: 'photo.jpg'
      })
      expect(invalidKey.success).toBe(false)
    })

    it('validates deleteStorageSchema correctly', () => {
      const valid = deleteStorageSchema.safeParse({
        keys: ['file1.png', 'folder/file2.jpg']
      })
      expect(valid.success).toBe(true)

      const empty = deleteStorageSchema.safeParse({
        keys: []
      })
      expect(empty.success).toBe(false)
    })

    it('validates listStorageSchema correctly', () => {
      const valid = listStorageSchema.safeParse({
        category: 'image',
        prefix: 'photos/'
      })
      expect(valid.success).toBe(true)

      const invalidCat = listStorageSchema.safeParse({
        category: 'not-a-category'
      })
      expect(invalidCat.success).toBe(false)
    })
  })
})
