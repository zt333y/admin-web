<template>
  <el-container class="home-container">
    <el-aside width="220px" class="aside">
      <div class="logo-box">
        <i class="el-icon-shopping-cart-full"></i> 农产品运营后台
      </div>
      <el-menu background-color="#304156" text-color="#bfcbd9" active-text-color="#409EFF" :default-active="$route.path" router>
        
        <el-menu-item index="/home/dashboard">
          <i class="el-icon-s-data"></i><span slot="title">数据可视化大屏</span>
        </el-menu-item>

        <el-menu-item index="/home/apply">
          <i class="el-icon-user-solid"></i><span slot="title">入驻资质审批</span>
        </el-menu-item>

        <el-menu-item index="/home/audit">
          <i class="el-icon-s-check"></i><span slot="title">商品上架审核</span>
        </el-menu-item>
        
        <el-menu-item index="/home/order">
          <i class="el-icon-s-order"></i><span slot="title">全平台订单管理</span>
        </el-menu-item>

        <el-menu-item index="/home/review">
          <i class="el-icon-chat-dot-round"></i>
          <span slot="title">评价管理</span>
        </el-menu-item>

        <el-menu-item index="/home/notice"> <i class="el-icon-message-solid"></i>
          <span slot="title">公告管理</span>
        </el-menu-item>

        <el-menu-item index="/home/history">
          <i class="el-icon-notebook-2"></i><span slot="title">审核历史日志</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="breadcrumb">当前位置：后台管理系统</div>
        <el-dropdown>
          <span class="user-dropdown">
            <el-avatar size="small" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"></el-avatar>
            <span style="margin-left: 10px; font-weight: bold;">{{ adminName }}</span>
            <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="logout">安全退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return { adminName: '管理员' }
  },
  created() {
    // 从缓存读取管理员信息
    let userStr = localStorage.getItem("admin_user");
    if (userStr) {
      let userObj = JSON.parse(userStr);
      this.adminName = userObj.realName || userObj.username || '管理员';
    }
  },
  methods: {
    logout() {
      this.$confirm('确定要退出系统吗?', '提示', { type: 'warning' }).then(() => {
        localStorage.clear();
        this.$router.push('/login');
        this.$message.success("已安全退出");
      }).catch(() => {});
    }
  }
}
</script>

<style scoped>
.home-container { height: 100vh; }
.aside { background-color: #304156; box-shadow: 2px 0 6px rgba(0,21,41,.35); z-index: 10; }
.logo-box { height: 60px; line-height: 60px; text-align: center; color: #fff; font-size: 18px; font-weight: bold; background-color: #2b3643; }
.el-menu { border-right: none; }
.header { background-color: #fff; line-height: 60px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 4px rgba(0, 21, 41, .08); padding: 0 20px; }
.user-dropdown { cursor: pointer; display: flex; align-items: center; }
.main-content { padding: 20px; background-color: #f0f2f5; }
</style>