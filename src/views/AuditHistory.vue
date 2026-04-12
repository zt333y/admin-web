<template>
  <el-card shadow="never">
    <div slot="header"><span><i class="el-icon-time"></i> 审核操作日志</span></div>
    
    <el-table :data="historyList" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="create_time" label="操作时间" width="200"></el-table-column>
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
      <el-table-column prop="target_id" label="目标商品ID" width="120"></el-table-column>
      <el-table-column label="操作备注">
        <template slot-scope="scope">
          针对商品 ID 为 {{ scope.row.target_id }} 的发布申请进行了 {{ scope.row.action_type === 'AUDIT_PASS' ? '通过' : '驳回' }} 处理。
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
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
      this.loading = true;
      // 🌟 使用更严谨的请求链
      this.$request.get('/api/admin/audit/history')
        .then(res => {
          if (res && res.code === 200) {
            this.historyList = res.data;
          } else {
            this.$message.error(res ? res.msg : "获取历史记录失败");
          }
        })
        .catch(err => {
          console.error("请求记录异常:", err);
          this.$message.error("网络异常，请检查后端服务");
        })
        .finally(() => {
          // 🌟 无论成功还是失败，最后都必须关掉转圈
          this.loading = false; 
        });
    }
  }
}
</script>