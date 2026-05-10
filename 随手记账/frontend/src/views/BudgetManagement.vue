<template>
  <div class="budget-management">
    <div class="filters">
      <input type="month" v-model="currentMonth" @change="loadBudgets" class="input" />
      <button @click="showForm = !showForm" class="btn btn-primary">
        {{ showForm ? '取消' : '+ 添加预算' }}
      </button>
    </div>

    <div v-if="showForm" class="form-card">
      <h3>{{ editingId ? '编辑预算' : '添加预算' }}</h3>
      <form @submit.prevent="saveBudget">
        <div class="form-group">
          <label>分类</label>
          <select v-model="form.category" class="select">
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>预算金额</label>
          <input type="number" v-model="form.amount" step="0.01" class="input" required />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">{{ editingId ? '更新' : '添加' }}</button>
          <button type="button" @click="resetForm" class="btn">取消</button>
        </div>
      </form>
    </div>

    <div v-if="budgets.length === 0" class="empty">暂无预算设置</div>
    <div v-else class="budget-list">
      <div v-for="b in budgets" :key="b.id" class="card">
        <div class="card-header">
          <div class="category">{{ b.category }}</div>
          <div class="actions">
            <button @click="editBudget(b)" class="btn btn-small">编辑</button>
            <button @click="deleteBudget(b.id)" class="btn btn-small btn-danger">删除</button>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent(b) + '%', background: getColor(b) }"></div>
          </div>
        </div>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-label">已消费</span>
            <span class="stat-value">¥{{ b.spent.toFixed(2) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">预算</span>
            <span class="stat-value">¥{{ b.amount.toFixed(2) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">剩余</span>
            <span class="stat-value" :style="{ color: b.remaining >= 0 ? '#28a745' : '#dc3545' }">
              ¥{{ b.remaining.toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { budgets } from '../api'
import { getCurrentMonth, expenseCategories } from '../utils'

export default {
  name: 'BudgetManagement',
  data() {
    return {
      currentMonth: getCurrentMonth(),
      budgets: [],
      showForm: false,
      editingId: null,
      form: {
        category: '餐饮',
        amount: ''
      }
    }
  },
  computed: {
    categories() {
      return expenseCategories
    }
  },
  mounted() {
    this.loadBudgets()
  },
  methods: {
    async loadBudgets() {
      try {
        const res = await budgets.getStatus(this.currentMonth)
        if (res.data.success) {
          this.budgets = res.data.data
        }
      } catch (error) {
        alert('加载失败: ' + error.message)
      }
    },
    async saveBudget() {
      try {
        const data = { ...this.form, month: this.currentMonth }
        if (this.editingId) {
          await budgets.update(this.editingId, data)
        } else {
          await budgets.create(data)
        }
        this.resetForm()
        this.loadBudgets()
      } catch (error) {
        alert('保存失败: ' + error.message)
      }
    },
    editBudget(b) {
      this.editingId = b.id
      this.form = { category: b.category, amount: b.amount }
      this.showForm = true
    },
    async deleteBudget(id) {
      if (confirm('确定要删除这条预算吗？')) {
        try {
          await budgets.delete(id)
          this.loadBudgets()
        } catch (error) {
          alert('删除失败: ' + error.message)
        }
      }
    },
    resetForm() {
      this.showForm = false
      this.editingId = null
      this.form = {
        category: '餐饮',
        amount: ''
      }
    },
    progressPercent(b) {
      const percent = (b.spent / b.amount) * 100
      return Math.min(percent, 100)
    },
    getColor(b) {
      const percent = this.progressPercent(b)
      if (percent >= 100) return '#dc3545'
      if (percent >= 80) return '#ffc107'
      return '#28a745'
    }
  }
}
</script>

<style scoped>
.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.input, .select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  background: #e0e0e0;
  transition: all 0.3s;
}

.btn:hover {
  background: #d0d0d0;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd6;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-small {
  padding: 5px 10px;
  font-size: 12px;
}

.form-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.form-card h3 {
  margin-bottom: 15px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #666;
  font-size: 14px;
}

.form-group .input,
.form-group .select {
  width: 100%;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.category {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.actions {
  display: flex;
  gap: 10px;
}

.progress-container {
  margin-bottom: 15px;
}

.progress-bar {
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  text-align: center;
}

.stat-item {
  padding: 10px;
}

.stat-label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.empty {
  text-align: center;
  color: #999;
  padding: 40px;
}
</style>
