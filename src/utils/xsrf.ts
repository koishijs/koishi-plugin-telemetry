import { createHash } from 'node:crypto'

export const getXsrfToken = () =>
  createHash('sha256')
    .update('' + ((new Date().getTime() / (54 << 16)) >> 1))
    .digest('hex')
    .slice(0, 32)
