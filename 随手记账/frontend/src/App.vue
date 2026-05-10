<template>
  <div class="app">
    <header class="header">
      <h1>💰 随手记账</h1>
    </header>
    <nav class="nav">
      <router-link to="/" exact-active-class="active">收支记录</router-link>
      <router-link to="/budget" exact-active-class="active">预算管控</router-link>
      <router-link to="/stats" exact-active-class="active">数据统计</router-link>
    </nav>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav {
  display: flex;
  background: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.nav a {
  flex: 1;
  text-align: center;
  padding: 15px;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: all 0.3s;
}

.nav a:hover {
  background: #f0f0f0;
}

.nav a.active {
  color: #667eea;
  border-bottom: 3px solid #667eea;
}

.main {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
</style>
