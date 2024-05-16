import type {} from '@koishijs/plugin-console'
import type { Context } from 'koishi'
import { resolve } from 'node:path'
import type { TelemetryStorage } from '../plugins'

export const name = 'telemetry-oob-client'

export const inject = ['console']

export function apply(ctx: Context, telemetryStorage: TelemetryStorage) {
  ctx.console.addEntry({
    dev: resolve(__dirname, '../../clients/oob/client/index.ts'),
    prod: resolve(__dirname, '../../clients/oob/dist'),
  })
}
