<template>
  <el-card shadow="never">
    <div slot="header"><span><i class="el-icon-time"></i> 审核操作日志</span></div>
    
    <el-table :data="historyList" stripe style="width: 100%" v-loading="loading">
      
      <el-table-column prop="create_time" label="操作时间" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time" style="color: #909399; margin-right: 5px;"></i>
          <span>{{ scope.row.create_time ? scope.row.create_time.replace('T', ' ') : '' }}</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="admin_name" label="操作人" width="150">
        <template slot-scope="scope">
          <el-tag size="small">{{ scope.row.admin_name || '系统管理员' }}</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="action_type" label="动作" width="150">
        <template slot-scope="scope">
          <el-tag :type="scope.row.action_type === 'AUDIT_PASS' ? 'success' : 'danger'" effect="dark">
            {{ scope.row.action_type === 'AUDIT_PASS' ? '审核通过' : '审核拒绝' }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="target_id" label="目标商品ID" width="120" align="center"></el-table-column>
      
      <el-table-column label="操作备注">
        <template slot-scope="scope">
          针对商品 ID 为 <span style="font-weight: bold; color: #409EFF;">{{ scope.row.target_id }}</span> 的发布申请进行了 
          <span :style="{color: scope.row.action_type === 'AUDIT_PASS' ? '#67C23A' : '#F56C6C', fontWeight: 'bold'}">
            {{ scope.row.action_type === 'AUDIT_PASS' ? '通过' : '驳回' }}
          </span> 处理。
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