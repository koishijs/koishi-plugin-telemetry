import type {} from '@koishijs/plugin-notifier'
import type { Context } from 'koishi'
import type { TelemetryId } from '../plugins'

export const name = 'telemetry-id-client'

export const inject = ['notifier']

interface State {
  status: 'normal' | 'failed'
  display: boolean
  cmid: string
  mid: string
  bundleId: string
  instanceId: string
  sessionId: string
}

const loading = '正在获取……'

const render = (state: State, handleDisplay: () => void) => {
  const header = (
    <>
      <br />
      <b>实例信息管理</b>
      <br />
    </>
  )

  if (state.status === 'failed')
    return (
      <>
        {header}
        <p>设备信息获取失败。请查阅日志以了解详情。</p>
      </>
    )

  const footer = (
    <>
      <button
        onClick={handleDisplay}
        children={state.display ? '隐藏' : '显示'}
      />
    </>
  )

  let info = (
    <>
      <p>
        核心设备 ID：{state.display ? state.cmid : '*'.repeat(64)}
        <br />
        设备 ID：{state.display ? state.mid : '*'.repeat(64)}
        <br />包 ID：{state.display ? state.bundleId : '*'.repeat(64)}
        <br />
        实例 ID：{state.display ? state.instanceId : '*'.repeat(64)}
        <br />
        会话 ID：{state.display ? state.sessionId : '*'.repeat(64)}
      </p>
    </>
  )

  return (
    <>
      {header}
      {info}
      {footer}
    </>
  )
}

export function apply(ctx: Context, telemetryId: TelemetryId) {
  const notifier = ctx.notifier.create()

  const state: State = {
    status: 'normal',
    display: false,
    cmid: loading,
    mid: loading,
    bundleId: loading,
    instanceId: loading,
    sessionId: loading,
  }

  const handleDisplay = () => {
    state.display = !state.display
    update()
  }

  const update = () => {
    notifier.update(render(state, handleDisplay))
  }

  update()

  ctx.effect(() => {
    const listener = () => {
      state.cmid = telemetryId.cmid || loading
      state.mid = telemetryId.mid || loading
      state.bundleId = telemetryId.bundleId || loading
      state.instanceId = telemetryId.instanceId || loading
      state.sessionId = telemetryId.sessionId || loading
      update()
    }

    telemetryId.on('update', listener)
    return () => telemetryId.off('update', listener)
  })

  ctx.effect(() => {
    const listener = () => {
      state.status = 'failed'
      update()
    }

    telemetryId.on('failed', listener)
    return () => telemetryId.off('failed', listener)
  })
}
