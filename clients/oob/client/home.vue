<template>
  <div class="k-card t8-oob">
    <div ref="splash" class="t8-oob-container t8-oob-splash" />
    <div class="t8-oob-container t8-oob-body-container">
      <div v-if="showDismiss" class="t8-oob-body t8-oob-dismiss-body">
        <p class="t8-oob-dismiss-title">
          可否告诉我们是什么原因让你做出此决定？
        </p>
        <el-radio-group
          v-model="dismissReason"
          class="t8-oob-dismiss-radio-group"
        >
          <el-radio :label="1" class="t8-oob-dismiss-radio">我不需要</el-radio>
          <el-radio :label="2" class="t8-oob-dismiss-radio"
            >担心个人隐私泄漏</el-radio
          >
          <el-radio :label="3" class="t8-oob-dismiss-radio"
            >担心 telemetry 服务影响性能或内存占用</el-radio
          >
          <el-radio :label="4" class="t8-oob-dismiss-radio">其他</el-radio>
        </el-radio-group>
        <k-button
          class="t8-oob-action-confirm-dismiss"
          @click="handleConfirmDismiss"
          :disabled="!dismissReason"
          >确定</k-button
        >
      </div>
      <div v-else class="t8-oob-body">
        <h1 class="t8-oob-body-text t8-oob-body-title">
          与我们一起塑造 Koishi 的未来
        </h1>
        <p class="t8-oob-body-text t8-oob-body-description">
          telemetry 服务是一组可选的 Koishi 服务，旨在通过分析您的 Koishi
          使用情况来改善 Koishi
          的使用体验、提供精确的插件使用量数据，并仅在您需要时为您提供支持。
          <br />
          拒绝同意将影响我们提供的相关数据和功能，但不会影响 Koishi
          的基础功能。要了解更多信息，请参阅我们的
          <a href="https://legal.ilharper.com/cordis/privacy" target="_blank"
            >隐私政策</a
          >
          。
        </p>
        <div class="t8-oob-action-container">
          <a class="t8-oob-action-dismiss" @click="handleDismiss">不必了</a>
          <k-button class="t8-oob-action-accept" @click="handleAccept"
            >同意</k-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { send } from '@koishijs/client'
import lottie from 'lottie-web/build/player/esm/lottie_svg.min.js'
import { onMounted, ref } from 'vue'
import splashData from './splash.json'

const anim = ref(null)
const splash = ref(null)

onMounted(() => {
  anim.value = lottie.loadAnimation({
    animationData: splashData,
    container: splash.value,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  })
})

const showDismiss = ref(false)
const dismissReason = ref(0)

const handleDismiss = () => (showDismiss.value = true)

const handleAccept = () => send('accept')

const handleConfirmDismiss = async () => {
  await send('dismiss', dismissReason.value)
  dismissReason.value = 0
}
</script>

<style lang="scss">
.t8-oob {
  height: max(
    100vh - var(--header-height) - var(--footer-height) - var(--card-margin) - var(
        --card-margin
      ),
    400px
  );

  margin: var(--card-margin);

  @media screen and (max-width: 768px) {
    height: max(
      100vh - var(--header-height) - var(--card-margin) - var(--card-margin),
      400px
    );
  }
}

.t8-oob-container {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.t8-oob-body-container {
  display: flex;
  flex-direction: column-reverse;
}

.t8-oob-body {
  display: flex;
  flex-direction: column;

  padding: 1.6rem;

  &-text {
    align-self: center;
    text-align: center;
    max-width: 75%;
  }

  &-title {
    font-size: 1.8rem;

    @media screen and (max-width: 768px) {
      font-size: 1.6rem;
    }
  }

  &-description {
    font-size: 0.8rem;

    @media screen and (max-width: 768px) {
      font-size: 0.7rem;
    }

    & a {
      text-decoration: underline;
    }
  }
}

.t8-oob-action-container {
  margin: 1.4rem 0 0 0;
  display: grid;
  grid: auto-flow / 1fr 1fr 1fr;
  align-items: center;
}

.t8-oob-action-dismiss {
  font-size: 0.8rem;
  margin: 0 1rem;
  justify-self: start;
  color: var(--k-text-light);
}

.t8-oob-action-accept {
  justify-self: center;
}

.t8-oob-splash-data {
  &-a {
    stroke: var(--bg3);
  }

  &-b {
    stroke: var(--bg3);
  }
}

.t8-oob-dismiss-radio-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 0 0 1rem 1rem;
  gap: 0.5rem;
}

.t8-oob-action-confirm-dismiss {
  align-self: start;
}
</style>
