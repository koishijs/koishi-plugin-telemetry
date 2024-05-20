import { Schema } from 'koishi'

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
}
