<template>
  <div>
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span style="font-weight: bold; font-size: 16px;">📦 全平台订单管理</span>
      </div>
      
      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="id" label="订单编号" width="100" align="center"></el-table-column>
        <el-table-column prop="userId" label="买家ID" width="100" align="center"></el-table-column>
        
        <el-table-column prop="totalAmount" label="订单总金额" width="150" align="center">
          <template slot-scope="scope">
            <span style="color: #F56C6C; font-weight: bold; font-size: 15px;">
              ¥ {{ scope.row.totalAmount }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="下单时间" width="180" align="center"></el-table-column>
        
        <el-table-column prop="status" label="订单状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 0" type="warning" effect="dark">待发货</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success" effect="dark">已发货</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="info" effect="dark">已完成</el-tag>
            <el-tag v-else type="danger">异常单</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button 
              v-if="scope.row.status === 0" 
              size="mini" 
              type="primary" 
              icon="el-icon-truck" 
              @click="doShip(scope.row.id)">
              一键发货
            </el-button>
            <span v-else style="color: #909399; font-size: 13px;">暂无可用操作</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  data() {
    return {
      tableData: []
    }
  },
  created() {
    this.loadData();
  },
  methods: {
    // 1. 拉取所有订单列表
    loadData() {
      request.get('/api/admin/order/list').then(res => {
        if (res.code === 200) {
          this.tableData = res.data || [];
        } else {
          this.$message.error(res.msg || '获取订单列表失败');
        }
      }).catch(err => {
        console.error("具体的网络报错是：", err); // 🌟 加这一行
        this.$message.error('网络异常，请检查后端服务是否启动');
      });
    },
    
    // 2. 模拟点击发货
    doShip(orderId) {
      this.$confirm(`确认将订单 ${orderId} 的状态修改为 [已发货] 吗？`, '发货确认', {
        confirmButtonText: '确认发货',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        // 请求后端的发货接口
        request.post(`/api/admin/order/ship?orderId=${orderId}`).then(res => {
          if (res.code === 200) {
            this.$message.success('🚀 发货成功！');
            this.loadData(); // 成功后刷新表格，状态会自动变成绿色的“已发货”
          } else {
            this.$message.error(res.msg);
          }
        })
      }).catch(() => {});
    }
  }
}
</script>