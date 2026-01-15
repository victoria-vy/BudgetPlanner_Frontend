<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'

type Props = {
  symbol: string
  height?: number
  interval?: string
  theme?: 'light' | 'dark'
  locale?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: 260,
  interval: 'D',
  theme: 'light',
  locale: 'de'
})

const containerId = `tv_${Math.random().toString(36).slice(2)}`
let destroyed = false

function render() {
  const el = document.getElementById(containerId)
  if (!el) return
  el.innerHTML = ''

  const script = document.createElement('script')
  script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
  script.async = true
  script.innerHTML = JSON.stringify({
    width: '100%',
    height: props.height,
    symbol: props.symbol,
    interval: props.interval,
    timezone: 'Europe/Berlin',
    theme: props.theme,
    style: '1',
    locale: props.locale,
    enable_publishing: false,
    allow_symbol_change: false,
    calendar: false,
    hide_side_toolbar: false,
    support_host: 'https://www.tradingview.com'
  })

  if (!destroyed) el.appendChild(script)
}

onMounted(() => render())

watch(
  () => [props.symbol, props.height, props.interval, props.theme, props.locale],
  () => render()
)

onBeforeUnmount(() => {
  destroyed = true
  const el = document.getElementById(containerId)
  if (el) el.innerHTML = ''
})
</script>

<template>
  <div :id="containerId" style="width: 100%;" />
</template>
