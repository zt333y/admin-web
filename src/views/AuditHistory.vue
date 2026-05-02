<template>
  <el-card shadow="never">
    <div slot="header"><span><i class="el-icon-time"></i> 全平台审核与调度日志</span></div>
    
    <el-table :data="historyList" stripe style="width: 100%" v-loading="loading">
      
      <el-table-column prop="create_time" label="操作时间" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time" style="color: #909399; margin-right: 5px;"></i>
          <span>{{ scope.row.create_time ? scope.row.create_time.replace('T', ' ') : '' }}</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="admin_name" label="操作人" width="130">
        <template slot-scope="scope">
          <el-tag size="small" type="info"><i class="el-icon-user-solid"></i> {{ scope.row.admin_name || '系统管理员' }}</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="action_type" label="动作类别" width="160">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.action_type === 'AUDIT_PASS'" type="success" effect="dark">商品入驻通过</el-tag>
          <el-tag v-else-if="scope.row.action_type === 'AUDIT_REJECT'" type="danger" effect="dark">商品入驻驳回</el-tag>
          <el-tag v-else-if="scope.row.action_type === 'AFTER_SALES_PASS'" type="warning" effect="dark">同意售后退货</el-tag>
          <el-tag v-else-if="scope.row.action_type === 'AFTER_SALES_REJECT'" type="info" effect="dark">拒绝售后申请</el-tag>
          <el-tag v-else type="primary" effect="plain">{{ scope.row.action_type }}</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="target_id" label="目标单号/商品号" width="130" align="center"></el-table-column>
      
      <el-table-column label="操作追踪详情">
        <template slot-scope="scope">
          
          <div v-if="scope.row.action_type === 'AUDIT_PASS' || scope.row.action_type === 'AUDIT_REJECT'">
            针对农户发布的商品 (ID: <span style="font-weight: bold; color: #409EFF;">{{ scope.row.target_id }}</span>) 进行了 
            <span :style="{color: scope.row.action_type === 'AUDIT_PASS' ? '#67C23A' : '#F56C6C', fontWeight: 'bold'}">
              {{ scope.row.action_type === 'AUDIT_PASS' ? '通过' : '驳回' }}
            </span> 处理。
          </div>
          
          <div v-else-if="scope.row.action_type === 'AFTER_SALES_PASS' || scope.row.action_type === 'AFTER_SALES_REJECT'">
             针对用户的售后申请单 (订单ID: <span style="font-weight: bold; color: #E6A23C;">{{ scope.row.target_id }}</span>) 进行了
             <span :style="{color: scope.row.action_type === 'AFTER_SALES_PASS' ? '#E6A23C' : '#909399', fontWeight: 'bold'}">
              {{ scope.row.action_type === 'AFTER_SALES_PASS' ? '同意退回团长' : '拒绝并打回' }}
            </span> 处理。
          </div>

          <div v-else>
             执行了底层业务操作，关联目标 ID：{{ scope.row.target_id }}
          </div>
          
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
// 必须手动引入封装好的 request.js
import request from '@/utils/request'

export default {
  data() {
    return { 
      historyList: [], 
      loading: false 
    }
  },
  created() { 
    this.loadHistory() 
  },
  methods: {
    loadHistory() {
      // 开启加载动画
      this.loading = true;
      
      request.get('/api/admin/audit/history')
        .then(res => {
          if (res && res.code === 200) {
            // 做一下数据字段兼容，防止 MyBatis 下划线转驼峰导致数据无法显示
            this.historyList = res.data.map(item => ({
              ...item,
              create_time: item.create_time || item.createTime,
              admin_name: item.admin_name || item.adminName,
              action_type: item.action_type || item.actionType,
              target_id: item.target_id || item.targetId
            }));
          } else {
            this.$message.error(res ? res.msg : "获取历史记录失败");
          }
        })
        .catch(err => {
          console.error("请求记录异常:", err);
          this.$message.error("网络异常，请检查后端服务");
        })
        .finally(() => {
          // 关闭加载动画
          this.loading = false; 
        });
    }
  }
}
</script>