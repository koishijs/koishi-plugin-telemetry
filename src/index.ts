import type { Context } from 'koishi'
import { TelemetryBasis } from './plugins'

export * from './types'

export const name = 'telemetry'

export const filter = false

export const inject = {
  optional: ['notifier'],
}

export function apply(ctx: Context) {
  ctx.plugin(TelemetryBasis)
}
