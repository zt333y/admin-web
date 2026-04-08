<template>
  <div>
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span style="font-weight: bold; font-size: 16px;">待审核农产品列表</span>
      </div>
      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="id" label="商品ID" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="农产品名称" width="180"></el-table-column>
        <el-table-column prop="category" label="分类" width="100" align="center"></el-table-column>
        <el-table-column prop="price" label="申请定价 (元)" width="120" align="center">
          <template slot-scope="scope">
            <span style="color: red; font-weight: bold;">¥ {{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存量" width="100" align="center">
          <template slot-scope="scope">
            {{ scope.row.stock }} {{ scope.row.unit }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="详情描述"></el-table-column>
        
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="success" icon="el-icon-check" @click="doAudit(scope.row.id, 1)">通过</el-button>
            <el-button size="mini" type="danger" icon="el-icon-close" @click="doAudit(scope.row.id, 2)">驳回</el-button>
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
      tableData: [],
      adminId: ''
    }
  },
  created() {
    let userStr = localStorage.getItem("adminUser");
    if (userStr) {
      this.adminId = JSON.parse(userStr).id;
    }
    this.loadData();
  },
  methods: {
    // 拉取待审核商品列表
    loadData() {
      request.get('/api/admin/product/pending').then(res => {
        if (res.code === 200) {
          this.tableData = res.data || [];
        }
      })
    },
    // 提交审核结果
    doAudit(productId, status) {
      let actionName = status === 1 ? '通过并上架' : '驳回';
      this.$confirm(`确认要 ${actionName} 该商品吗？`, '系统提示', {
        type: status === 1 ? 'success' : 'warning'
      }).then(() => {
        request.post(`/api/admin/product/audit?productId=${productId}&status=${status}&adminId=${this.adminId}`).then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg);
            this.loadData(); // 成功后刷新表格
          } else {
            this.$message.error(res.msg);
          }
        })
      }).catch(() => {});
    }
  }
}
</script>