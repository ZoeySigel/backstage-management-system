<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { use, init } from 'echarts/core'
import type { EChartsType } from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { User, Goods, Box, Warning } from '@element-plus/icons-vue'
import { reqDashboardOverview } from '@/api/dashboard'
import type { DashboardData, DashboardStat } from '@/api/dashboard/type'
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()
const loading = ref(false)
const dashboardData = ref<DashboardData>()
const currentDate = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}).format(new Date())
const salesChartRef = ref<Parameters<typeof init>[0]>()
const categoryChartRef = ref<Parameters<typeof init>[0]>()
let salesChart: EChartsType | undefined
let categoryChart: EChartsType | undefined

use([
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  CanvasRenderer,
])

const iconMap = {
  users: User,
  spu: Goods,
  sku: Box,
  stock: Warning,
}

const renderCharts = () => {
  const data = dashboardData.value

  if (!data || !salesChartRef.value || !categoryChartRef.value) {
    return
  }

  salesChart = init(salesChartRef.value)
  salesChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['销售额', '订单数'], right: 0 },
    grid: { left: 12, right: 12, bottom: 8, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.salesTrend.dates,
      axisLine: { lineStyle: { color: '#d8dee8' } },
    },
    yAxis: [
      { type: 'value', name: '销售额（元）', splitLine: { lineStyle: { color: '#edf0f5' } } },
      { type: 'value', name: '订单数', splitLine: { show: false } },
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        symbolSize: 7,
        data: data.salesTrend.sales,
        lineStyle: { width: 3, color: '#2563eb' },
        itemStyle: { color: '#2563eb' },
        areaStyle: { color: 'rgba(37, 99, 235, 0.12)' },
      },
      {
        name: '订单数',
        type: 'bar',
        yAxisIndex: 1,
        barMaxWidth: 24,
        data: data.salesTrend.orders,
        itemStyle: { color: '#14b8a6', borderRadius: [3, 3, 0, 0] },
      },
    ],
  })

  categoryChart = init(categoryChartRef.value)
  categoryChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
    legend: { bottom: 0, left: 'center' },
    series: [
      {
        type: 'pie',
        radius: ['48%', '70%'],
        center: ['50%', '42%'],
        label: { formatter: '{d}%' },
        itemStyle: { borderColor: '#fff', borderWidth: 3 },
        data: data.categorySales,
      },
    ],
  })
}

const handleResize = () => {
  salesChart?.resize()
  categoryChart?.resize()
}

const getDashboardData = async () => {
  loading.value = true

  try {
    const result = await reqDashboardOverview()

    if (result.code === 200) {
      dashboardData.value = result.data
      await nextTick()
      renderCharts()
    }
  } finally {
    loading.value = false
  }
}

const formatValue = (stat: DashboardStat) =>
  stat.key === 'stock' ? stat.value.toLocaleString() : stat.value

onMounted(() => {
  getDashboardData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  salesChart?.dispose()
  categoryChart?.dispose()
})
</script>

<template>
  <main v-loading="loading" class="home-page">
    <header class="welcome">
      <div>
        <p class="eyebrow">数据总览</p>
        <h1>你好，{{ userStore.username || '管理员' }}</h1>
        <p class="welcome-text">这里汇总了当前系统的商品、库存与销售情况。</p>
      </div>
      <div class="date">{{ currentDate }}</div>
    </header>

    <section class="stats-grid">
      <article v-for="stat in dashboardData?.stats" :key="stat.key" class="stat-card">
        <div class="stat-icon" :class="`stat-icon--${stat.key}`">
          <el-icon :size="22">
            <component :is="iconMap[stat.key]" />
          </el-icon>
        </div>
        <div class="stat-content">
          <span>{{ stat.title }}</span>
          <strong>{{ formatValue(stat) }}</strong>
          <small :class="{ decrease: stat.change < 0 }">
            {{ stat.change >= 0 ? '+' : '' }}{{ stat.change }}% 较上周
          </small>
        </div>
      </article>
    </section>

    <section class="dashboard-grid">
      <article class="panel sales-panel">
        <div class="panel-header">
          <div>
            <h2>近 7 日销售趋势</h2>
            <p>销售额与订单量变化</p>
          </div>
        </div>
        <div ref="salesChartRef" class="chart"></div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <h2>品类销售占比</h2>
            <p>各商品分类销售贡献</p>
          </div>
        </div>
        <div ref="categoryChartRef" class="chart"></div>
      </article>

      <article class="panel low-stock-panel">
        <div class="panel-header">
          <div>
            <h2>低库存提醒</h2>
            <p>建议及时补充以下商品库存</p>
          </div>
          <el-tag type="warning">{{ dashboardData?.lowStock.length || 0 }} 项</el-tag>
        </div>
        <el-table :data="dashboardData?.lowStock" size="small">
          <el-table-column prop="skuName" label="SKU 名称" min-width="240" />
          <el-table-column label="剩余库存" width="110" align="right">
            <template #default="{ row }">
              <strong class="stock-value">{{ row.stock }}</strong>
            </template>
          </el-table-column>
        </el-table>
      </article>
    </section>
  </main>
</template>

<style scoped lang="scss">
.home-page {
  min-height: 100%;
  padding: 20px;
}

.welcome {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 4px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 600;
}

h1 {
  margin: 0;
  color: #172033;
  font-size: 26px;
}

.welcome-text {
  margin: 7px 0 0;
  color: #667085;
}

.date {
  color: #667085;
  font-size: 13px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  gap: 14px;
  align-items: center;
  min-width: 0;
  padding: 18px;
  background: #fff;
  border: 1px solid #e5eaf2;
  border-radius: 6px;
}

.stat-icon {
  display: grid;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  color: #2563eb;
  background: #eaf1ff;
  border-radius: 6px;
  place-items: center;

  &--spu {
    color: #0f9f89;
    background: #e4f7f3;
  }

  &--sku {
    color: #9333ea;
    background: #f4eaff;
  }

  &--stock {
    color: #d97706;
    background: #fff4db;
  }
}

.stat-content {
  display: grid;
  min-width: 0;

  span {
    color: #667085;
    font-size: 13px;
  }

  strong {
    margin: 4px 0;
    color: #172033;
    font-size: 25px;
  }

  small {
    color: #0f9f89;
  }

  .decrease {
    color: #d97706;
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(300px, 0.8fr);
  gap: 16px;
  margin-top: 16px;
}

.panel {
  min-width: 0;
  padding: 18px;
  background: #fff;
  border: 1px solid #e5eaf2;
  border-radius: 6px;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;

  h2 {
    margin: 0;
    color: #172033;
    font-size: 16px;
  }

  p {
    margin: 5px 0 0;
    color: #98a2b3;
    font-size: 12px;
  }
}

.chart {
  width: 100%;
  height: 310px;
}

.low-stock-panel {
  grid-column: 1 / -1;
}

.stock-value {
  color: #dc2626;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .low-stock-panel {
    grid-column: auto;
  }
}

@media (max-width: 640px) {
  .welcome {
    align-items: flex-start;
  }

  .date {
    display: none;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
