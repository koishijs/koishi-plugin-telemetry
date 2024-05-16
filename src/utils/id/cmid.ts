import type { Context } from 'koishi'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { env, platform } from 'node:process'
import { exists } from '../fs'
import { readFile } from 'node:fs/promises'

const regexWin32 = /MachineGuid.*?REG_SZ.*?([\d\-a-f]+)/

const getCoreMachineIdForWin32 = async (ctx: Context) => {
  const l = ctx.logger('telemetry/utils/id/cmid')

  let reg = 'REG'
  const regPath = join(env['windir'], 'System32/reg.exe')
  if (await exists(regPath)) reg = regPath

  const child = spawn(
    reg,
    ['query', 'HKLM\\SOFTWARE\\Microsoft\\Cryptography', '/v', 'MachineGuid'],
    {
      shell: false,
    },
  )

  let stdout = ''
  child.stdout.on('data', (x) => (stdout += x))
  await new Promise<void>((resolve, reject) => {
    child.on('close', (x) => {
      if (x) reject(new Error(`reg query failed with code ${x}`))
      else resolve()
    })
  })

  const rawCMId = regexWin32.exec(stdout)?.[1]
  if (!rawCMId) {
    l.debug(`full stdout:\n${stdout}\n`)
    throw new Error('cannot get raw cmid')
  }

  return rawCMId
}

const regexMacos = /IOPlatformUUID.*?([\d\-A-F]+)/

const getCoreMachineIdForMacos = async (ctx: Context) => {
  const l = ctx.logger('telemetry/utils/id/cmid')

  const child = spawn('ioreg', ['-rd1', '-c', 'IOPlatformExpertDevice'], {
    shell: false,
  })

  let stdout = ''
  child.stdout.on('data', (x) => (stdout += x))
  await new Promise<void>((resolve, reject) => {
    child.on('close', (x) => {
      if (x) reject(new Error(`ioreg query failed with code ${x}`))
      else resolve()
    })
  })

  let rawCMId = regexMacos.exec(stdout)?.[1]
  if (!rawCMId) {
    l.debug(`full stdout:\n${stdout}\n`)
    throw new Error('cannot get raw cmid')
  }

  rawCMId = rawCMId.toLowerCase()

  return rawCMId
}

const linuxPathList = ['/etc/machine-id', '/var/lib/dbus/machine-id']

const getCoreMachineIdForLinux = async (ctx: Context) => {
  const l = ctx.logger('telemetry/utils/id/cmid')

  let path: string | undefined = undefined

  for (const p of linuxPathList)
    if (await exists(p)) {
      path = p
      break
    }

  if (!path) throw new Error('cannot query cmid. maybe distrib too old?')

  try {
    return (await readFile(path)).toString().trim()
  } catch (e) {
    l.debug('cause:')
    l.debug(e)
    throw new Error('read cmid failed.')
  }
}

export const getCoreMachineId = async (ctx: Context) => {
  const l = ctx.logger('telemetry/utils/id/cmid')

  let rawCMId: string

  switch (platform) {
    case 'win32': {
      rawCMId = await getCoreMachineIdForWin32(ctx)
      break
    }

    case 'darwin': {
      rawCMId = await getCoreMachineIdForMacos(ctx)
      break
    }

    case 'linux': {
      rawCMId = await getCoreMachineIdForLinux(ctx)
      break
    }

    default:
      throw new Error(`unsupported platform ${platform}`)
  }

  l.debug(`raw cmid: ${rawCMId}`)

  const cmid = createHash('sha256').update(rawCMId).digest('hex')
  l.debug(`cmid: ${cmid}`)

  return cmid
}
