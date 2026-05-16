<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useUserStore } from './store/user';

const userStore = useUserStore();

onLaunch(() => {
  console.log('App Launch');
  userStore.checkLogin();
});

onShow(() => {
  console.log('App Show');
});

onHide(() => {
  console.log('App Hide');
});
</script>

<style lang="scss">
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.container {
  padding: 20rpx;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  border: none;
}

.btn-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #fff;
  border-radius: 50rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  border: none;
}

.btn-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  border-radius: 50rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  border: none;
}

.text-primary {
  color: #667eea;
}

.text-success {
  color: #11998e;
}

.text-warning {
  color: #f5576c;
}

.text-muted {
  color: #999;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.mt-10 { margin-top: 10rpx; }
.mt-20 { margin-top: 20rpx; }
.mt-30 { margin-top: 30rpx; }
.mb-10 { margin-bottom: 10rpx; }
.mb-20 { margin-bottom: 20rpx; }
.mb-30 { margin-bottom: 30rpx; }
.p-20 { padding: 20rpx; }
</style>
