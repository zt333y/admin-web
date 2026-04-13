<template>
  <el-card shadow="never">
    <div slot="header">
      <span style="font-weight: bold; font-size: 16px;">
        <i class="el-icon-user-solid"></i> 入驻资质审批
      </span>
    </div>
    
    <el-table :data="tableData" border stripe v-loading="loading" style="width: 100%">
      <el-table-column prop="username" label="申请人账号" width="120" align="center"></el-table-column>
      <el-table-column label="申请角色" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.applyRole === 1 ? 'warning' : 'primary'" size="small">
            {{ scope.row.applyRole === 1 ? '农户' : '团长' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="realName" label="真实姓名" width="120" align="center"></el-table-column>
      <el-table-column prop="idCard" label="身份证号" width="180" align="center"></el-table-column>
      <el-table-column prop="address" label="经营/提货点地址" min-width="200"></el-table-column>
      
      <el-table-column label="审批操作" width="180" align="center" fixed="right">
        <template slot-scope="scope">
          <div v-if="scope.row.status === 0">
            <el-button size="mini" type="success" icon="el-icon-check" @click="doAudit(scope.row, 1)">通过</el-button>
            <el-button size="mini" type="danger" icon="el-icon-close" @click="doAudit(scope.row, 2)">拒绝</el-button>
          </div>
          <div v-else>
            <span :style="{color: scope.row.status === 1 ? '#67C23A' : '#F56C6C', fontWeight: 'bold'}">
              {{ scope.row.status === 1 ? '已入驻' : '已驳回' }}
            </span>
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
      const actionText = status === 1 ? '通过' : '拒绝'
      this.$confirm(`确定要 ${actionText} 该用户的入驻申请吗？`, '审批确认', {
        type: status === 1 ? 'success' : 'warning'
      }).then(() => {
        // 调用后端接口：传入申请ID、结果状态、用户ID和目标角色
        request.post(`/api/apply/audit?id=${row.id}&status=${status}&userId=${row.userId}&role=${row.applyRole}`)
          .then(res => {
            if (res && res.code === 200) {
              this.$message.success(`${actionText}操作成功`)
              this.loadData() // 刷新列表
            } else {
              this.$message.error(res.msg || '操作失败')
            }
          })
      }).catch(() => {})
    }
  }
}
</script>