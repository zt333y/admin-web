<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6" v-for="(item, index) in cards" :key="index">
        <el-card shadow="hover" :body-style="{ padding: '20px' }" class="stat-card">
          <div class="card-content">
            <div class="card-label">{{ item.title }}</div>
            <div class="card-value">{{ item.value }}</div>
          </div>
          <i :class="item.icon" class="card-icon" :style="{ color: item.color }"></i>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="14">
        <el-card shadow="never" header="近七天销售趋势">
          <div id="lineChart" style="height: 400px;"></div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="never" header="农产品分类占比">
          <div id="pieChart" style="height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import request from '@/utils/request'

export default {
  data() {
    return {
      cards: [
        { title: '累计销售额', value: '￥0.00', icon: 'el-icon-money', color: '#409EFF' },
        { title: '累计订单量', value: '0', icon: 'el-icon-s-order', color: '#67C23A' },
        { title: '在售商品数', value: '0', icon: 'el-icon-goods', color: '#E6A23C' },
        { title: '平台用户数', value: '0', icon: 'el-icon-user', color: '#F56C6C' }
      ]
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      request.get('/admin/stats').then(res => {
        if (res.code === 200) {
          const data = res.data
          // 更新卡片数字
          this.cards[0].value = '￥' + data.totalSales
          this.cards[1].value = data.totalOrders
          this.cards[2].value = data.totalProducts
          this.cards[3].value = data.totalUsers
          
          // 渲染图表
          this.renderLineChart(data.weekDate, data.weekSales)
          this.renderPieChart(data.categoryData)
        }
      })
    },
    renderLineChart(xData, yData) {
      const chart = echarts.init(document.getElementById('lineChart'))
      chart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: xData, boundaryGap: false },
        yAxis: { type: 'value' },
        series: [{
          data: yData,
          type: 'line',
          smooth: true,
          areaStyle: { color: 'rgba(64, 158, 255, 0.2)' },
          itemStyle: { color: '#409EFF' }
        }]
      })
    },
    renderPieChart(pieData) {
      const chart = echarts.init(document.getElementById('pieChart'))
      chart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: '5%', left: 'center' },
        series: [{
          name: '分类占比',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          data: pieData
        }]
      })
    }
  }
}
</script>

<style scoped>
.dashboard-container { padding: 10px; }
.stat-card { position: relative; }
.card-content { display: flex; flex-direction: column; }
.card-label { font-size: 14px; color: #909399; margin-bottom: 10px; }
.card-value { font-size: 24px; font-weight: bold; color: #303133; }
.card-icon { position: absolute; right: 20px; top: 25px; font-size: 40px; opacity: 0.2; }
</style>