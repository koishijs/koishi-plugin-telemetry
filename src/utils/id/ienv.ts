import type { Context } from 'koishi'
import { createHash } from 'node:crypto'
import { cwd } from 'node:process'

// eslint-disable-next-line @typescript-eslint/require-await
export const getInstanceEnv = async (_ctx: Context) => {
  const ienv = createHash('sha256').update(`${cwd()}\n`).digest('hex')

  return ienv
}
