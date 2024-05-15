import type {} from '@koishijs/plugin-notifier'
import type { Context, h } from 'koishi'
import type { TelemetryId } from '../plugins'

export const name = 'telemetry-id-client'

export const inject = ['notifier']

interface State {
  status: 'pending' | 'finished' | 'failed'
  display: boolean
  cmid: string
  mid: string
}

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

  let info: h

  switch (state.status) {
    case 'pending':
      info = (
        <>
          <p>核心设备 ID：正在获取……</p>
          <p>设备 ID：正在获取……</p>
        </>
      )
      break

    case 'finished':
      info = (
        <>
          <p>核心设备 ID：{state.display ? state.cmid : '*'.repeat(64)}</p>
          <p>设备 ID：{state.display ? state.mid : '*'.repeat(64)}</p>
        </>
      )
      break
  }

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
    status: 'pending',
    display: false,
    cmid: '',
    mid: '正在获取……',
  }

  const handleDisplay = () => {
    state.display = !state.display
    update()
  }

  const update = () => {
    notifier.update(render(state, handleDisplay))
  }

  update()
  void telemetryId
    .whenReady()
    .then(() => {
      state.status = 'finished'
      state.cmid = telemetryId.cmid
      state.mid = telemetryId.mid
      update()
    })
    .catch(() => {
      state.status = 'failed'
      update()
    })
}
