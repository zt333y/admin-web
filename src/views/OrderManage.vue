<template>
  <el-card shadow="never" class="order-container">
    <div slot="header" class="card-header">
      <span><i class="el-icon-s-order"></i> 全平台订单调度中心</span>
      <el-button type="text" icon="el-icon-refresh" @click="loadOrders">刷新实时数据</el-button>
    </div>
    
    <el-table :data="orderList" stripe style="width: 100%" v-loading="loading" border>
      <el-table-column prop="orderNo" label="订单流水号" width="280"></el-table-column>
      
      <el-table-column prop="createTime" label="下单时间" width="180">
        <template slot-scope="scope">
          <i class="el-icon-time"></i> {{ scope.row.createTime || scope.row.create_time }}
        </template>
      </el-table-column>
      
      <el-table-column label="实付总额(元)" width="120" align="center">
        <template slot-scope="scope">
          <span style="color: #F56C6C; font-weight: bold; font-size: 16px;">
            ￥{{ scope.row.totalAmount || scope.row.total_amount }}
          </span>
        </template>
      </el-table-column>
      
      <el-table-column label="当前状态" width="120" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 0" type="warning" effect="dark" size="medium">⏳ 待发货</el-tag>
          <el-tag v-else-if="scope.row.status === 1" type="primary" effect="dark" size="medium">🚚 已发货</el-tag>
          <el-tag v-else-if="scope.row.status === 2" type="success" effect="dark" size="medium">✅ 已完成</el-tag>
          <el-tag v-else type="info" size="medium">未知状态</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="调度操作" align="center">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status === 0"
            type="primary"
            size="small"
            icon="el-icon-truck"
            @click="handleShip(scope.row.id)">
            一键发货
          </el-button>
          <span v-else style="color: #909399; font-size: 13px;">无可用操作</span>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
import request from '@/utils/request'

export default {
  data() {
    return {
      orderList: [],
      loading: false
    }
  },
  created() {
    this.loadOrders()
  },
  methods: {
    // 1. 获取所有订单
    loadOrders() {
      this.loading = true;
      request.get('/api/admin/order/list')
        .then(res => {
          if (res && res.code === 200) {
            this.orderList = res.data || [];
          } else {
            this.$message.error(res ? res.msg : '获取订单数据失败');
          }
        })
        .catch(err => {
          console.error('获取订单异常:', err);
          this.$message.error('网络异常，请检查后端');
        })
        .finally(() => {
          this.loading = false;
        });
    },
    
    // 2. 触发发货动作
    handleShip(orderId) {
      this.$confirm('确认将该订单打包并标记为已发货吗？', '发货提示', {
        confirmButtonText: '确认发货',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用你在 AdminController 里写的发货接口
        request.post(`/api/admin/order/ship?orderId=${orderId}`).then(res => {
          if (res && res.code === 200) {
            this.$message.success('🎉 发货成功！物流信息已更新');
            this.loadOrders(); // 重新拉取数据，刷新页面状态
          } else {
            this.$message.error(res ? res.msg : '发货失败');
          }
        });
      }).catch(() => {
        this.$message.info('已取消发货操作');
      });
    }
  }
}
</script>

<style scoped>
.order-container {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  color: #304156;
}
</style>