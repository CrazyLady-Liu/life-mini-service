<template>
  <div class="profile-page">
    <div class="header">
      <div class="user-avatar">
        {{ babyStore.avatar || '👶' }}
      </div>
      <div class="user-info">
        <h2>{{ babyStore.name || '请设置宝宝信息' }}</h2>
        <p v-if="babyStore.age">{{ babyStore.gender === 'boy' ? '男宝' : '女宝' }} · {{ babyStore.age }}</p>
      </div>
    </div>

    <div class="content">
      <van-cell-group inset>
        <van-cell title="编辑宝宝信息" is-link @click="showEditDialog = true" />
      </van-cell-group>

      <van-cell-group inset style="margin-top: 15px;">
        <van-cell title="关于小芽成长录" is-link />
      </van-cell-group>

      <div class="logout-section">
        <van-button type="danger" plain block @click="handleLogout">
          退出登录
        </van-button>
      </div>
    </div>

    <van-dialog
      v-model:show="showEditDialog"
      title="编辑宝宝信息"
      show-cancel-button
      @confirm="saveBabyInfo"
    >
      <div class="dialog-form">
        <van-field
          v-model="babyForm.name"
          placeholder="请输入宝宝姓名"
        />
        <van-field
          v-model="babyForm.gender"
          name="gender"
          type="radio"
        >
          <template #input>
            <van-radio-group v-model="babyForm.gender" direction="horizontal">
              <van-radio name="boy">男宝</van-radio>
              <van-radio name="girl">女宝</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field
          v-model="babyForm.birthday"
          type="date"
          placeholder="选择出生日期"
        />
        <van-field
          v-model="babyForm.avatar"
          placeholder="选择头像（可选）"
          readonly
        >
          <template #button>
            <van-picker
              v-model:show="showAvatarPicker"
              :columns="avatarOptions"
              @confirm="onAvatarConfirm"
            />
            <van-button size="small" @click="showAvatarPicker = true">选择</van-button>
          </template>
        </van-field>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useBabyStore } from '@/stores/baby'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const userStore = useUserStore()
const babyStore = useBabyStore()

const showEditDialog = ref(false)
const showAvatarPicker = ref(false)

const avatarOptions = [
  { text: '👶', value: '👶' },
  { text: '👦', value: '👦' },
  { text: '👧', value: '👧' },
  { text: '🍼', value: '🍼' },
  { text: '🎈', value: '🎈' },
  { text: '🌟', value: '🌟' },
  { text: '🌸', value: '🌸' },
  { text: '🦋', value: '🦋' }
]

const babyForm = ref({
  name: '',
  gender: 'boy',
  birthday: '',
  avatar: ''
})

onMounted(() => {
  babyForm.value = {
    name: babyStore.name,
    gender: babyStore.gender || 'boy',
    birthday: babyStore.birthday,
    avatar: babyStore.avatar
  }
})

const onAvatarConfirm = ({ selectedOptions }) => {
  babyForm.value.avatar = selectedOptions[0].value
  showAvatarPicker.value = false
}

const saveBabyInfo = () => {
  if (!babyForm.value.name.trim()) {
    showToast('请输入宝宝姓名')
    return
  }
  if (!babyForm.value.birthday) {
    showToast('请选择出生日期')
    return
  }
  babyStore.updateBabyInfo(babyForm.value)
  showToast('保存成功')
  showEditDialog.value = false
}

const handleLogout = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定要退出登录吗？退出后所有数据将被清除。'
  }).then(() => {
    userStore.logout()
    showToast('已退出登录')
    router.push('/login')
  }).catch(() => {})
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-avatar {
  width: 70px;
  height: 70px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
}

.user-info {
  color: white;
}

.user-info h2 {
  font-size: 20px;
  margin-bottom: 5px;
}

.user-info p {
  font-size: 14px;
  opacity: 0.9;
}

.content {
  padding: 15px 0;
}

.logout-section {
  padding: 30px 15px;
}

.dialog-form {
  padding: 10px 0;
}

:deep(.van-dialog__content) {
  width: 90% !important;
  max-width: 400px !important;
}

:deep(.van-radio-group) {
  padding: 10px 0;
}

:deep(.van-radio) {
  margin-right: 20px;
}
</style>
