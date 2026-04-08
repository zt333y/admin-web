<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<style>
/* 清除浏览器默认边距，让页面撑满全屏 */
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #f0f2f5;
}
</style>