<template>
  <el-card shadow="never">
    <div slot="header">
      <span style="font-weight: bold; font-size: 16px;"><i class="el-icon-chat-dot-round"></i> 居民评价管理</span>
    </div>

    <el-table :data="reviewList" stripe style="width: 100%" v-loading="loading" border>
      <el-table-column prop="username" label="评价用户" width="120" align="center">
        <template slot-scope="scope">
          <el-tag size="small" type="info">{{ scope.row.username }}</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="productName" label="评价商品" width="180"></el-table-column>
      
      <el-table-column label="评分" width="160" align="center">
        <template slot-scope="scope">
          <el-rate v-model="scope.row.score" disabled show-score text-color="#ff9900" score-template="{value}星"></el-rate>
        </template>
      </el-table-column>
      
      <el-table-column prop="content" label="评价内容"></el-table-column>
      
      <el-table-column prop="createTime" label="评价日期" width="180" align="center">
        <template slot-scope="scope">
          <i class="el-icon-time"></i> {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
import request from '@/utils/request'

export default {
  data() {
    return {
      reviewList: [],
      loading: false
    }
  },
  created() {
    this.loadReviews();
  },
  methods: {
    loadReviews() {
      this.loading = true;
      request.get('/api/review/list')
        .then(res => {
          if (res && res.code === 200) {
            this.reviewList = res.data;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 简单的日期格式化函数
    formatDate(time) {
        if (!time) return '';
        let date = new Date(time);
        let year = date.getFullYear();
        let month = (date.getMonth() + 1).toString().padStart(2, '0'); // 补零
        let day = date.getDate().toString().padStart(2, '0');           // 补零
        let hours = date.getHours().toString().padStart(2, '0');       // 补零
        let minutes = date.getMinutes().toString().padStart(2, '0');   // 补零
    
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
  }
}
</script>