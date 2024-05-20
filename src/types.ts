import { Schema } from 'koishi'
import EventEmitter from 'node:events'

export interface Config {
  mode: 'off' | 'readonly' | 'on'
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    mode: Schema.union([
      Schema.const('off').description('关闭：telemetry 服务完全关闭。'),
      Schema.const('readonly').description(
        '只读：仅获取安全警报和重大事项提醒等信息，而不从本机上传任何信息。',
      ),
      Schema.const('on').description('开启：telemetry 服务开启。'),
    ])
      .default('on')
      .description('telemetry 服务的工作模式。')
      .role('radio'),
  }),
])

export interface Root {
  config: Config
  update: (configModifier: (config: Config) => Config) => void
}

type EmittedEvents = Record<string | symbol, (...args: unknown[]) => unknown>

export interface TypedEventEmitter<ES extends EmittedEvents> {
  on<E extends keyof ES>(event: E, listener: ES[E]): this
  off<E extends keyof ES>(event: E, listener: ES[E]): this
  once<E extends keyof ES>(event: E, listener: ES[E]): this
  emit<E extends keyof ES>(event: E, ...args: Parameters<ES[E]>): boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-declaration-merging
export class TypedEventEmitter<ES extends EmittedEvents> extends EventEmitter {}
