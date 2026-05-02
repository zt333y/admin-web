<template>
  <el-card shadow="never">
    <div slot="header">
      <span style="font-weight: bold; font-size: 16px;">
        <i class="el-icon-s-custom"></i> 资质入驻审批
      </span>
    </div>
    
    <el-table :data="tableData" border stripe v-loading="loading" style="width: 100%" :header-cell-style="{background:'#f5f7fa', color:'#333'}">
      <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
      <el-table-column prop="username" label="申请人账号" width="120" align="center"></el-table-column>
      
      <el-table-column label="申请角色" width="120" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.applyRole === 1 ? 'warning' : 'primary'" size="medium" effect="dark">
            {{ scope.row.applyRole === 1 ? '农户' : '团长' }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="realName" label="真实姓名" width="120" align="center"></el-table-column>
      
      <el-table-column prop="address" label="经营/提货点地址" min-width="200" show-overflow-tooltip></el-table-column>
      
      <el-table-column prop="createTime" label="申请时间" width="160" align="center">
        <template slot-scope="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      
      <el-table-column label="审批操作" width="180" align="center" fixed="right">
        <template slot-scope="scope">
          <div v-if="scope.row.status === 0">
            <el-button size="mini" type="success" icon="el-icon-check" @click="doAudit(scope.row, 1)">通过</el-button>
            <el-button size="mini" type="danger" icon="el-icon-close" @click="doAudit(scope.row, 2)">驳回</el-button>
          </div>
          <div v-else>
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small">
              <i :class="scope.row.status === 1 ? 'el-icon-success' : 'el-icon-error'"></i>
              {{ scope.row.status === 1 ? ' 已通过入驻' : ' 已驳回申请' }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'ApplyAudit',
  data() {
    return {
      tableData: [],
      loading: false
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    // 获取申请列表
    loadData() {
      this.loading = true
      request.get('/api/apply/list').then(res => {
        if (res && res.code === 200) {
          this.tableData = res.data || []
        }
      }).finally(() => {
        this.loading = false
      })
    },
    
    // 执行审批逻辑
    doAudit(row, status) {
      const actionText = status === 1 ? '通过' : '驳回'
      this.$confirm(`确定要 ${actionText} 该用户的入驻申请吗？`, '审批确认', {
        type: status === 1 ? 'success' : 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        // 🌟 优化：使用 params 对象传参，避免 URL 拼接出错，与后端的 @RequestParam 完美对应
        request.post('/api/apply/audit', null, {
          params: {
            id: row.id,
            status: status,
            userId: row.userId,
            role: row.applyRole
          }
        }).then(res => {
          if (res && res.code === 200) {
            this.$message.success(`已${actionText}该申请！`)
            this.loadData() // 刷新列表
          } else {
            this.$message.error(res.msg || '操作失败')
          }
        })
      }).catch(() => {})
    },

    // 格式化时间工具方法
    formatDate(timeStr) {
      if (!timeStr) return '';
      const date = new Date(timeStr);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${d} ${h}:${min}`;
    }
  }
}
</script>

<style scoped>
/* 稍微美化一下表格的边距 */
.el-card {
  margin: 10px;
}
</style>