<template>
  <el-card shadow="never">
    <div slot="header"><span><i class="el-icon-s-check"></i> 入驻资质审批</span></div>
    <el-table :data="tableData" border stripe v-loading="loading">
      <el-table-column prop="username" label="申请人账号" width="120"></el-table-column>
      <el-table-column label="申请角色" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.applyRole === 1 ? 'warning' : 'primary'">
            {{ scope.row.applyRole === 1 ? '农户' : '团长' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="realName" label="真实姓名" width="100"></el-table-column>
      <el-table-column prop="idCard" label="身份证号" width="180"></el-table-column>
      <el-table-column prop="address" label="经营/提货点地址"></el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template slot-scope="scope" v-if="scope.row.status === 0">
          <el-button size="mini" type="success" @click="doAudit(scope.row, 1)">通过</el-button>
          <el-button size="mini" type="danger" @click="doAudit(scope.row, 2)">拒绝</el-button>
        </template>
        <template slot-scope="scope" v-else>
          <span :style="{color: scope.row.status === 1 ? '#67C23A' : '#F56C6C'}">
            {{ scope.row.status === 1 ? '已入驻' : '已驳回' }}
          </span>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
import request from '@/utils/request'
export default {
  data() { return { tableData: [], loading: false } },
  created() { this.loadData() },
  methods: {
    loadData() {
      this.loading = true;
      request.get('/api/apply/list').then(res => { this.tableData = res.data; this.loading = false; })
    },
    doAudit(row, status) {
      this.$confirm('确定执行此审批操作吗？', '提示').then(() => {
        request.post(`/api/apply/audit?id=${row.id}&status=${status}&userId=${row.userId}&role=${row.applyRole}`).then(res => {
          this.$message.success("处理完毕");
          this.loadData();
        })
      })
    }
  }
}
</script>