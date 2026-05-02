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

            <div v-if="props.row.status >= 5" style="margin-top: 15px; border-top: 1px dashed #ddd; padding-top: 10px;">
              <p style="margin: 0 0 5px 0; font-weight: bold; color: #f56c6c;">⚠️ 售后申请详情：</p>
              <span style="color: #666;">申请原因：{{ props.row.refundReason || '未填写原因' }}</span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="orderNo" label="订单流水号" width="200" align="center"></el-table-column>
      
      <el-table-column prop="createTime" label="下单时间" width="170" align="center">
        <template slot-scope="scope">
          <i class="el-icon-time"></i> {{ (scope.row.createTime || scope.row.create_time || '').replace('T', ' ') }}
        </template>
      </el-table-column>
      
      <el-table-column label="实付总额(元)" width="110" align="center">
        <template slot-scope="scope">
          <span style="color: #F56C6C; font-weight: bold;">
            ￥{{ scope.row.totalAmount || scope.row.total_amount }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="收货地址" min-width="200" show-overflow-tooltip>
        <template slot-scope="scope">
          <span v-if="scope.row.address">{{ scope.row.address }}</span>
          <el-tag v-else type="danger" size="mini">未填写</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="当前状态" width="130" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 0" type="warning" effect="dark">⏳ 待发货</el-tag>
          <el-tag v-else-if="scope.row.status === 1" type="primary" effect="dark">🚚 运输中</el-tag>
          <el-tag v-else-if="scope.row.status === 4" color="#9C27B0" style="color: white; border: none;" effect="dark">📦 团长待领</el-tag>
          <el-tag v-else-if="scope.row.status === 2" type="success" effect="dark">✅ 已提货</el-tag>
          <el-tag v-else-if="scope.row.status === 3" type="info" effect="dark">🎉 订单结束</el-tag>
          
          <el-tag v-else-if="scope.row.status === 5" type="danger" effect="plain">🔄 售后待审</el-tag>
          <el-tag v-else-if="scope.row.status === 6" type="danger" effect="dark">🔙 待退给团长</el-tag>
          <el-tag v-else-if="scope.row.status === 7" type="info" effect="plain">✔️ 售后完成</el-tag>
          <el-tag v-else-if="scope.row.status === 8" type="info" effect="dark">❌ 售后驳回</el-tag>
          
          <el-tag v-else type="info">{{scope.row.status}}</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="调度操作" align="center" width="180">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status === 0"
            type="primary"
            size="mini"
            icon="el-icon-truck"
            @click="handleShip(scope.row.id)">
            一键发货
          </el-button>

          <div v-else-if="scope.row.status === 5">
            <el-button type="success" size="mini" icon="el-icon-check" circle @click="handleApprove(scope.row.id, true)"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-close" circle @click="handleApprove(scope.row.id, false)"></el-button>
            <span style="display:block; font-size: 11px; color: #F56C6C; margin-top: 5px;">售后审核</span>
          </div>

          <span v-else style="color: #909399; font-size: 12px;">暂无操作</span>
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
        .catch(() => { // 🌟 修复1：去掉 err 变量
          this.$message.error('网络异常，请检查后端');
        })
        .finally(() => {
          this.loading = false;
        });
    },
    
    handleShip(orderId) {
      this.$confirm('确认将该订单标记为已发货吗？', '操作提示', {
        type: 'warning'
      }).then(() => {
        request.post(`/api/admin/order/ship?orderId=${orderId}`).then(res => {
          if (res.code === 200) {
            this.$message.success('发货成功！');
            this.loadOrders(); 
          }
        });
      });
    },

    // 🌟 新增：处理售后申请审批
    handleApprove(orderId, isAgree) {
      const actionText = isAgree ? '同意退货申请' : '拒绝售后申请';
      const type = isAgree ? 'success' : 'warning';

      this.$confirm(`确定要【${actionText}】吗？`, '售后审核确认', {
        confirmButtonText: '确定操作',
        cancelButtonText: '取消',
        type: type
      }).then(() => {
        // 调用后端暴露的审批接口
        request.post(`/api/admin/order/approveAfterSales?orderId=${orderId}&isAgree=${isAgree}`)
          .then(res => {
            if (res && res.code === 200) {
              this.$message.success('审核操作已完成');
              this.loadOrders(); // 刷新列表
            } else {
              this.$message.error(res.msg || '操作失败');
            }
          })
          .catch(() => { // 🌟 修复2：去掉 err 变量
            this.$message.error('请求失败，请检查网络');
          });
      }).catch(() => {});
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