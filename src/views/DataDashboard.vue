<template>
  <div class="dashboard-container" v-loading="loading">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card bg-blue">
          <div class="card-icon"><i class="el-icon-money"></i></div>
          <div class="card-info">
            <div class="card-title">平台总销售额</div>
            <div class="card-value">¥ {{ stats.totalSales || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card bg-green">
          <div class="card-icon"><i class="el-icon-shopping-cart-full"></i></div>
          <div class="card-info">
            <div class="card-title">累计订单量</div>
            <div class="card-value">{{ stats.totalOrders || 0 }} 笔</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card bg-orange">
          <div class="card-icon"><i class="el-icon-goods"></i></div>
          <div class="card-info">
            <div class="card-title">在售商品数</div>
            <div class="card-value">{{ stats.totalProducts || 0 }} 件</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card bg-purple">
          <div class="card-icon"><i class="el-icon-user"></i></div>
          <div class="card-info">
            <div class="card-title">注册用户数</div>
            <div class="card-value">{{ stats.totalUsers || 0 }} 人</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="15">
        <el-card shadow="hover">
          <div slot="header"><span><i class="el-icon-s-data"></i> 近七天交易额趋势</span></div>
          <div id="lineChart" style="height: 350px;"></div>
        </el-card>
      </el-col>
      <el-col :span="9">
        <el-card shadow="hover">
          <div slot="header"><span><i class="el-icon-pie-chart"></i> 农产品分类占比</span></div>
          <div id="pieChart" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <div slot="header"><span><i class="el-icon-chat-dot-round"></i> 平台实时评价动态</span></div>
          <div class="review-board">
            <div v-if="latestReviews.length === 0" style="text-align: center; color: #999; padding: 20px;">
              暂无评价数据
            </div>
            <div class="review-item" v-for="item in latestReviews" :key="item.id">
              <div class="review-header">
                <el-tag size="mini" type="success">{{ item.username }}</el-tag>
                <span class="review-product">评价了 <b>{{ item.productName }}</b></span>
                <span class="review-time">{{ formatDate(item.createTime) }}</span>
              </div>
              <div class="review-body">
                <el-rate v-model="item.score" disabled show-score text-color="#ff9900" style="display:inline-block; margin-right:15px;"></el-rate>
                <span class="review-content">"{{ item.content }}"</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import request from '@/utils/request'
import * as echarts from 'echarts' // 引入 ECharts

export default {
  data() {
    return {
      loading: false,
      stats: {}, // 核心统计数据
      latestReviews: [], // 最新评价列表
      lineChartInstance: null,
      pieChartInstance: null
    }
  },
  mounted() {
    // 页面加载完毕后，拉取数据并初始化图表
    this.loadDashboardData();
    // 监听窗口大小变化，让图表自适应缩放
    window.addEventListener('resize', this.resizeCharts);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts);
    if (this.lineChartInstance) this.lineChartInstance.dispose();
    if (this.pieChartInstance) this.pieChartInstance.dispose();
  },
  methods: {
    loadDashboardData() {
      this.loading = true;
      
      // 1. 获取统计数据 (我们在 AdminService 里写好的真实数据接口)
      request.get('/api/admin/stats').then(res => {
        if (res.code === 200) {
          this.stats = res.data;
          this.initLineChart(); // 数据拿到了，画折线图
          this.initPieChart();  // 画饼图
        }
      });

      // 2. 获取最新评价数据 (截取前5条展示在大屏上)
      request.get('/api/review/list').then(res => {
        if (res.code === 200 && res.data) {
          this.latestReviews = res.data.slice(0, 5); // 只取前5条最新评价
        }
      }).finally(() => {
        this.loading = false;
      });
    },

    // 绘制折线图
    initLineChart() {
      const chartDom = document.getElementById('lineChart');
      if (!chartDom) return;
      this.lineChartInstance = echarts.init(chartDom);
      
      const option = {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: this.stats.weekDate || [] },
        yAxis: { type: 'value', name: '销售额 (元)' },
        series: [{
          data: this.stats.weekSales || [],
          type: 'line',
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64,158,255,0.5)' },
              { offset: 1, color: 'rgba(64,158,255,0.1)' }
            ])
          },
          itemStyle: { color: '#409EFF' }
        }]
      };
      this.lineChartInstance.setOption(option);
    },

    // 绘制饼图
    initPieChart() {
      const chartDom = document.getElementById('pieChart');
      if (!chartDom) return;
      this.pieChartInstance = echarts.init(chartDom);

      const option = {
        tooltip: { trigger: 'item', formatter: '{b} : {c}件 ({d}%)' },
        legend: { bottom: '0', left: 'center' },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          data: this.stats.categoryData || []
        }]
      };
      this.pieChartInstance.setOption(option);
    },

    // 图表自适应
    resizeCharts() {
      if (this.lineChartInstance) this.lineChartInstance.resize();
      if (this.pieChartInstance) this.pieChartInstance.resize();
    },

    // 时间格式化补零
    formatDate(time) {
      if (!time) return '';
      let date = new Date(time);
      let month = (date.getMonth() + 1).toString().padStart(2, '0');
      let day = date.getDate().toString().padStart(2, '0');
      let hours = date.getHours().toString().padStart(2, '0');
      let minutes = date.getMinutes().toString().padStart(2, '0');
      return `${date.getFullYear()}-${month}-${day} ${hours}:${minutes}`;
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 10px;
}
/* 顶部 KPI 卡片样式 */
.data-card {
  color: #fff;
  border: none;
  border-radius: 8px;
}
.data-card ::v-deep .el-card__body {
  display: flex;
  align-items: center;
  padding: 25px;
}
.card-icon {
  font-size: 48px;
  margin-right: 20px;
  opacity: 0.8;
}
.card-title {
  font-size: 14px;
  margin-bottom: 10px;
  opacity: 0.9;
}
.card-value {
  font-size: 26px;
  font-weight: bold;
}

/* 颜色定义 */
.bg-blue { background: linear-gradient(135deg, #409EFF, #73b3f3); }
.bg-green { background: linear-gradient(135deg, #67C23A, #85ce61); }
.bg-orange { background: linear-gradient(135deg, #E6A23C, #f3d19e); }
.bg-purple { background: linear-gradient(135deg, #9C27B0, #d05ce3); }

/* 评价列表样式 */
.review-board {
  max-height: 300px;
  overflow-y: auto;
}
.review-item {
  padding: 15px 0;
  border-bottom: 1px dashed #ebeef5;
}
.review-item:last-child {
  border-bottom: none;
}
.review-header {
  margin-bottom: 8px;
}
.review-product {
  margin-left: 10px;
  color: #606266;
  font-size: 14px;
}
.review-time {
  float: right;
  color: #999;
  font-size: 12px;
}
.review-content {
  color: #303133;
  font-size: 14px;
  font-style: italic;
}
</style>