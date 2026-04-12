<template>
  <div>
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span style="font-weight: bold; font-size: 16px;"><i class="el-icon-s-check"></i> 待审核农产品列表</span>
        <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-refresh" @click="loadData">刷新列表</el-button>
      </div>
      
      <el-table :data="tableData" border stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="商品ID" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="农产品名称" width="180"></el-table-column>
        <el-table-column prop="category" label="分类" width="100" align="center">
          <template slot-scope="scope">
            <el-tag size="medium">{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="申请定价 (元)" width="120" align="center">
          <template slot-scope="scope">
            <span style="color: #F56C6C; font-weight: bold; font-size: 15px;">¥ {{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存量" width="100" align="center">
          <template slot-scope="scope">
            {{ scope.row.stock }} {{ scope.row.unit }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="详情描述"></el-table-column>
        
        <el-table-column label="审核操作" width="200" align="center" fixed="right">
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
      adminId: 1, // 默认给个1，防止没拿到缓存时报错
      loading: false // 🌟 控制加载动画的开关
    }
  },
  created() {
    // 🌟 兼容性修复：同时兼容 admin_user 和 adminUser
    let userStr = localStorage.getItem("admin_user") || localStorage.getItem("adminUser");
    if (userStr) {
      try {
        this.adminId = JSON.parse(userStr).id;
      } catch (e) {
        console.error("解析管理员信息失败", e);
      }
    }
    this.loadData();
  },
  methods: {
    // 拉取待审核商品列表
    loadData() {
      this.loading = true; // 开始转圈
      request.get('/api/admin/product/pending').then(res => {
        if (res && res.code === 200) {
          this.tableData = res.data || [];
        } else {
          this.$message.error(res ? res.msg : "获取待审核列表失败");
        }
      }).catch(err => {
        console.error("加载数据异常", err);
        this.$message.error("网络异常，请检查后端服务");
      }).finally(() => {
        this.loading = false; // 无论成功失败，都停止转圈
      });
    },
    
    // 提交审核结果
    doAudit(productId, status) {
      let actionName = status === 1 ? '通过并上架' : '驳回';
      this.$confirm(`确认要 ${actionName} 该商品吗？`, '操作确认', {
        type: status === 1 ? 'success' : 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        
        // 开启全屏遮罩防连点
        const loading = this.$loading({
          lock: true,
          text: '正在处理中...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });

        request.post(`/api/admin/product/audit?productId=${productId}&status=${status}&adminId=${this.adminId}`).then(res => {
          if (res && res.code === 200) {
            this.$message.success(`🎉 操作成功：商品已${actionName}`);
            this.loadData(); // 成功后刷新表格
          } else {
            this.$message.error(res ? res.msg : "处理失败");
          }
        }).catch(err => {
          console.error("审核异常", err);
          this.$message.error("网络异常，请重新操作");
        }).finally(() => {
          loading.close(); // 关掉全屏遮罩
        });
        
      }).catch(() => {
        this.$message.info('已取消操作');
      });
    }
  }
}
</script>

<style scoped>
/* 让卡片头部更好看 */
.clearfix {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>