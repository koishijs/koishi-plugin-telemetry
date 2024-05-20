import type { Context } from 'koishi'
import { TelemetryBasis } from './plugins'
import type { Config } from './types'

export * from './types'

export const name = 'telemetry'

export const filter = false

export const inject = {
  optional: ['notifier'],
}

export function apply(ctx: Context, config: Config) {
  if (config.mode === 'off') return

  ctx.plugin(TelemetryBasis, {
    config,
  })
}
