<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    prefix?: string
    size?: number | string
    color?: string
    ariaLabel?: string
  }>(),
  {
    prefix: 'icon',
    size: '1em',
    color: 'currentColor',
    ariaLabel: '',
  },
)

const symbolId = computed(() => `#${props.prefix}-${props.name}`)
const iconSize = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <svg
    class="svg-icon"
    :style="{ width: iconSize, height: iconSize, color }"
    :aria-hidden="ariaLabel ? undefined : true"
    :aria-label="ariaLabel || undefined"
  >
    <use :href="symbolId" />
  </svg>
</template>

<style scoped>
.svg-icon {
  display: inline-block;
  flex-shrink: 0;
  overflow: hidden;
  vertical-align: -0.15em;
  fill: currentcolor;
}
</style>
