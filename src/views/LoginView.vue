<template>
  <div class="login-wrapper">
    <el-card class="login-box" shadow="always">
      <div class="title">农产品直供后台管理系统</div>
      <el-form ref="loginForm" :model="form" :rules="rules">
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user" v-model="form.username" placeholder="请输入管理员账号"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-lock" v-model="form.password" show-password placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%; margin-top: 10px;" @click="handleLogin">安 全 登 录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  data() {
    return {
      form: { username: '', password: '' },
      rules: {
        username: [{ required: true, message: '账号不能为空', trigger: 'blur' }],
        password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          // 调用你封装好的登录 API
          request.post('/user/login', this.loginForm).then(res => {
            if (res.code === 200) {
              const { token, user } = res.data;
          
            // 🌟 权限哨兵：严格限制只有管理员能登录后台
            if (user.role !== 3) {
              this.$message.error('对不起，您不是管理员，无权访问后台系统！');
              return;
            }

            // 存储 Token 和 用户信息
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_user', JSON.stringify(user));

            this.$message.success('欢迎回来，超级管理员！');
            this.$router.push('/dashboard'); // 跳转到后台首页
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    });
  }
  }
}
</script>

<style scoped>
.login-wrapper { height: 100vh; display: flex; justify-content: center; align-items: center; background-color: #2d3a4b; }
.login-box { width: 400px; padding: 30px; border-radius: 10px; }
.title { text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 30px; color: #333; letter-spacing: 1px; }
</style>