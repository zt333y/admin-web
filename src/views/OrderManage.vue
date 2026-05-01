<template>
  <el-card shadow="never" class="order-container">
    <div slot="header" class="card-header">
      <span><i class="el-icon-s-order"></i> 全平台订单调度中心</span>
      <el-button type="text" icon="el-icon-refresh" @click="loadOrders">刷新实时数据</el-button>
    </div>
    
    <el-table :data="orderList" stripe style="width: 100%" v-loading="loading" border>
      
      <el-table-column type="expand">
        <template slot-scope="props">
          <div style="padding: 15px 30px; background-color: #fafafa; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #606266;">📦 包含商品明细：</p>
            <div v-if="props.row.items && props.row.items.length > 0">
              <div v-for="item in props.row.items" :key="item.id" style="margin-bottom: 8px;">
                <el-tag size="small" type="info">{{ item.productName }}</el-tag>
                <span style="margin-left: 15px; color: #606266;">单价: ￥{{ item.productPrice }}</span>
                <span style="margin-left: 15px; color: #606266;">数量: x{{ item.quantity }}</span>
                <span style="margin-left: 15px; color: #f56c6c; font-weight: bold;">小计: ￥{{ item.totalPrice }}</span>
              </div>
            </div>
            <div v-else style="color: #999;">该订单无商品明细数据</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="orderNo" label="订单流水号" width="230" align="center"></el-table-column>
      
      <el-table-column prop="createTime" label="下单时间" width="180" align="center">
        <template slot-scope="scope">
          <i class="el-icon-time"></i> {{ (scope.row.createTime || scope.row.create_time || '').replace('T', ' ') }}
        </template>
      </el-table-column>
      
      <el-table-column label="实付总额(元)" width="120" align="center">
        <template slot-scope="scope">
          <span style="color: #F56C6C; font-weight: bold; font-size: 16px;">
            ￥{{ scope.row.totalAmount || scope.row.total_amount }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="配送/收货地址" min-width="250">
        <template slot-scope="scope">
          <div v-if="scope.row.address" style="line-height: 1.5;">
             <i class="el-icon-location-outline" style="color: #409EFF;"></i> 
             <span style="margin-left: 5px;">{{ scope.row.address }}</span>
          </div>
          <el-tag v-else type="danger" size="small" effect="plain">未填写地址</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="当前状态" width="130" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 0" type="warning" effect="dark" size="medium">⏳ 待发货</el-tag>
          <el-tag v-else-if="scope.row.status === 1" type="primary" effect="dark" size="medium">🚚 已发货</el-tag>
          <el-tag v-else-if="scope.row.status === 2" type="success" effect="dark" size="medium">📦 已到货/待评</el-tag>
          <el-tag v-else-if="scope.row.status === 3" type="info" effect="dark" size="medium">✅ 已完成</el-tag>
          <el-tag v-else type="info" size="medium">未知状态 ({{scope.row.status}})</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="调度操作" align="center" width="150">
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
    
    handleShip(orderId) {
      this.$confirm('确认将该订单打包并标记为已发货吗？', '发货提示', {
        confirmButtonText: '确认发货',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request.post(`/api/admin/order/ship?orderId=${orderId}`).then(res => {
          if (res && res.code === 200) {
            this.$message.success('🎉 发货成功！物流信息已更新');
            this.loadOrders(); 
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
/* 展开行的内部样式调整，让明细更好看 */
.el-table__expanded-cell {
  padding: 20px 50px !important;
}
</style>