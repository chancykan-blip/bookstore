import { v4 as uuidv4 } from 'uuid'

// 生成格式：BOOK-XXXX-XXXX-XXXX
export function generateLicenseKey(): string {
  const raw = uuidv4().replace(/-/g, '').toUpperCase()
  const parts = [
    raw.slice(0, 4),
    raw.slice(4, 8),
    raw.slice(8, 12),
    raw.slice(12, 16),
  ]
  return `BOOK-${parts.join('-')}`
}
