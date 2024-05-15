import type { Context } from 'koishi'
import { createHash } from 'node:crypto'
import { getCoreMachineId } from './cmid'
import { getMachineEnv } from './menv'

export const getMachineId = async (ctx: Context) => {
  const l = ctx.logger('telemetry/utils/id/mid')

  const cmid = await getCoreMachineId(ctx)
  const menv = await getMachineEnv(ctx)

  const rawMId = `${cmid}\n${menv}`

  l.debug(`raw mid: ${rawMId}`)

  const mid = createHash('sha256').update(rawMId).digest('hex')
  l.debug(`mid: ${mid}`)

  return mid
}
