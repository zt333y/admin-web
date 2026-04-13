<template>
  <div class="notice-container">
    <div class="header-actions">
      <el-button type="primary" @click="openAddDialog">发布新公告</el-button>
    </div>

    <el-table :data="noticeList" border style="width: 100%; margin-top: 20px" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
      <el-table-column prop="title" label="公告标题" header-align="center"></el-table-column>
      <el-table-column prop="content" label="公告内容" show-overflow-tooltip header-align="center"></el-table-column>
      <el-table-column prop="createTime" label="发布时间" width="160" align="center">
        <template slot-scope="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template slot-scope="scope">
          <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="发布新公告" :visible.sync="dialogVisible" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="请输入公告标题"></el-input>
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="5"
            placeholder="请输入公告详细内容">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request' // 引入项目已有的axios请求封装

export default {
  name: 'NoticeManage',
  data() {
    return {
      noticeList: [],
      loading: false,
      dialogVisible: false,
      form: {
        title: '',
        content: '',
        adminId: localStorage.getItem('userId') || 1
      }
    }
  },
  created() {
    // 页面加载时获取公告列表
    this.fetchNotices()
  },
  methods: {
    async fetchNotices() {
      this.loading = true
      try {
        const res = await request.get('/api/notice/list')
        if (res.code === 200) {
          this.noticeList = res.data
        }
      } catch (error) {
        this.$message.error('获取公告列表失败')
      } finally {
        this.loading = false
      }
    },
    
    openAddDialog() {
      this.form.title = ''
      this.form.content = ''
      this.dialogVisible = true
    },
    
    async submitForm() {
      if (!this.form.title || !this.form.content) {
        this.$message.warning('请填写完整的标题和内容')
        return
      }
      try {
        const res = await request.post('/api/notice/add', this.form)
        if (res.code === 200) {
          this.$message.success('发布成功')
          this.dialogVisible = false
          this.fetchNotices() // 重新拉取列表
        } else {
          this.$message.error(res.msg || '发布失败')
        }
      } catch (error) {
        this.$message.error('网络请求失败')
      }
    },
    
    handleDelete(id) {
      this.$confirm('确定要删除这条公告吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          // 注意：此处如果后端要求FormData格式，可能需要调整传参方式。当前匹配的是 /delete?id=xxx
          const res = await request.post(`/api/notice/delete?id=${id}`)
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.fetchNotices()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        } catch (error) {
          this.$message.error('网络请求失败')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const y = date.getFullYear()
      const m = (date.getMonth() + 1).toString().padStart(2, '0')
      const d = date.getDate().toString().padStart(2, '0')
      const h = date.getHours().toString().padStart(2, '0')
      const min = date.getMinutes().toString().padStart(2, '0')
      return `${y}-${m}-${d} ${h}:${min}`
    }
  }
}
</script>

<style scoped>
.notice-container {
  padding: 20px;
  background-color: #fff;
  min-height: calc(100vh - 100px);
}
.header-actions {
  display: flex;
  justify-content: flex-end;
}
</style>