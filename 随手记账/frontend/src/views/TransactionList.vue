<template>
  <div class="transaction-list">
    <div class="filters">
      <input type="month" v-model="currentMonth" @change="loadTransactions" class="input" />
      <select v-model="filterType" class="select" @change="loadTransactions">
        <option value="">全部类型</option>
        <option value="expense">支出</option>
        <option value="income">收入</option>
      </select>
      <select v-model="filterCategory" class="select" @change="loadTransactions">
        <option value="">全部分类</option>
        <option v-for="cat in allCategories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <button @click="showForm = !showForm" class="btn btn-primary">
        {{ showForm ? '取消' : '+ 添加记录' }}
      </button>
      <button @click="exportData" class="btn btn-success">导出CSV</button>
    </div>

    <div v-if="selectedIds.length > 0" class="batch-actions">
      <span class="selected-count">已选择 {{ selectedIds.length }} 条记录</span>
      <button @click="batchDelete" class="btn btn-danger btn-small">批量删除</button>
      <button @click="cancelSelection" class="btn btn-small">取消选择</button>
    </div>

    <div v-if="showForm" class="form-card">
      <h3>{{ editingId ? '编辑记录' : '添加记录' }}</h3>
      <form @submit.prevent="saveTransaction">
        <div class="form-group">
          <label>类型</label>
          <div class="type-tabs">
            <span 
              v-for="t in ['expense', 'income']" 
              :key="t"
              :class="['type-tab', { active: form.type === t }]"
              @click="form.type = t"
            >
              {{ t === 'expense' ? '支出' : '收入' }}
            </span>
          </div>
        </div>
        
        <div class="form-group">
          <label>快捷分类</label>
          <div class="quick-categories">
            <span 
              v-for="cat in categories" 
              :key="cat"
              :class="['category-tag', { active: form.category === cat }]"
              @click="form.category = cat"
            >
              {{ cat }}
            </span>
          </div>
        </div>
        
        <div class="form-group">
          <label>金额</label>
          <input 
            type="number" 
            v-model="form.amount" 
            step="0.01" 
            :class="['input', { error: !validateAmount() }]"
            placeholder="请输入金额"
            required 
          />
          <span v-if="!validateAmount()" class="error-message">请输入有效的金额（大于0）</span>
        </div>
        
        <div class="form-group">
          <label>日期</label>
          <input type="date" v-model="form.date" class="input" required />
        </div>
        
        <div class="form-group">
          <label>常用备注</label>
          <div class="quick-notes">
            <span 
              v-for="note in commonNotes" 
              :key="note"
              class="note-tag"
              @click="form.description = note"
            >
              {{ note }}
            </span>
          </div>
        </div>
        
        <div class="form-group">
          <label>备注</label>
          <input type="text" v-model="form.description" class="input" placeholder="可选择常用备注或自定义" />
        </div>
        
        <div class="form-actions">
          <button type="submit" :disabled="!isFormValid()" class="btn btn-primary">
            {{ editingId ? '更新' : '添加' }}
          </button>
          <button type="button" @click="resetForm" class="btn">取消</button>
        </div>
      </form>
    </div>

    <div class="summary">
      <div class="summary-item income">
        <span class="label">本月收入</span>
        <span class="value">¥{{ totalIncome.toFixed(2) }}</span>
      </div>
      <div class="summary-item expense">
        <span class="label">本月支出</span>
        <span class="value">¥{{ totalExpense.toFixed(2) }}</span>
      </div>
      <div class="summary-item balance">
        <span class="label">结余</span>
        <span class="value">¥{{ (totalIncome - totalExpense).toFixed(2) }}</span>
      </div>
    </div>

    <div class="list">
      <div v-if="filteredTransactions.length === 0" class="empty">暂无记录</div>
      <div v-for="t in filteredTransactions" :key="t.id" :class="['card', { selected: selectedIds.includes(t.id) }]">
        <div class="card-header">
          <div class="select-checkbox">
            <input 
              type="checkbox" 
              :id="'check-' + t.id" 
              :checked="selectedIds.includes(t.id)"
              @change="toggleSelect(t.id)"
            />
            <label :for="'check-' + t.id"></label>
          </div>
          <div class="category-badge" :class="t.type">{{ t.category }}</div>
          <div class="date">{{ t.date }}</div>
        </div>
        <div class="card-body">
          <div class="description">{{ t.description || '无备注' }}</div>
          <div class="amount" :class="t.type">
            {{ t.type === 'income' ? '+' : '-' }}¥{{ t.amount.toFixed(2) }}
          </div>
        </div>
        <div class="card-actions">
          <button @click="editTransaction(t)" class="btn btn-small">编辑</button>
          <button @click="deleteTransaction(t.id)" class="btn btn-small btn-danger">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { transactions, exportCSV } from '../api'
import { getCurrentMonth, formatDate, expenseCategories, incomeCategories } from '../utils'

export default {
  name: 'TransactionList',
  data() {
    return {
      currentMonth: getCurrentMonth(),
      transactions: [],
      showForm: false,
      editingId: null,
      filterType: '',
      filterCategory: '',
      selectedIds: [],
      commonNotes: ['早餐', '午餐', '晚餐', '零食', '购物', '交通', '工资', '奖金', '地铁', '公交', '加油', '打车'],
      form: {
        type: 'expense',
        category: '餐饮',
        amount: '',
        date: formatDate(new Date()),
        description: ''
      }
    }
  },
  computed: {
    categories() {
      return this.form.type === 'expense' ? expenseCategories : incomeCategories
    },
    allCategories() {
      return [...new Set([...expenseCategories, ...incomeCategories])]
    },
    filteredTransactions() {
      let result = this.transactions
      
      if (this.filterType) {
        result = result.filter(t => t.type === this.filterType)
      }
      
      if (this.filterCategory) {
        result = result.filter(t => t.category === this.filterCategory)
      }
      
      return result
    },
    totalIncome() {
      return this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    },
    totalExpense() {
      return this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    }
  },
  mounted() {
    this.loadTransactions()
  },
  methods: {
    async loadTransactions() {
      try {
        const res = await transactions.getAll({ month: this.currentMonth })
        if (res.data.success) {
          this.transactions = res.data.data
        }
      } catch (error) {
        alert('加载失败: ' + error.message)
      }
    },
    validateAmount() {
      const amount = parseFloat(this.form.amount)
      return !isNaN(amount) && amount > 0
    },
    isFormValid() {
      return this.validateAmount() && this.form.date
    },
    async saveTransaction() {
      try {
        if (this.editingId) {
          await transactions.update(this.editingId, this.form)
        } else {
          await transactions.create(this.form)
        }
        this.resetForm()
        this.loadTransactions()
      } catch (error) {
        alert('保存失败: ' + error.message)
      }
    },
    editTransaction(t) {
      this.editingId = t.id
      this.form = { ...t }
      this.showForm = true
    },
    async deleteTransaction(id) {
      if (confirm('确定要删除这条记录吗？')) {
        try {
          await transactions.delete(id)
          this.loadTransactions()
        } catch (error) {
          alert('删除失败: ' + error.message)
        }
      }
    },
    toggleSelect(id) {
      const index = this.selectedIds.indexOf(id)
      if (index > -1) {
        this.selectedIds.splice(index, 1)
      } else {
        this.selectedIds.push(id)
      }
    },
    async batchDelete() {
      if (confirm(`确定要删除选中的 ${this.selectedIds.length} 条记录吗？`)) {
        try {
          for (const id of this.selectedIds) {
            await transactions.delete(id)
          }
          this.selectedIds = []
          this.loadTransactions()
        } catch (error) {
          alert('删除失败: ' + error.message)
        }
      }
    },
    cancelSelection() {
      this.selectedIds = []
    },
    resetForm() {
      this.showForm = false
      this.editingId = null
      this.form = {
        type: 'expense',
        category: '餐饮',
        amount: '',
        date: formatDate(new Date()),
        description: ''
      }
    },
    exportData() {
      exportCSV(this.currentMonth)
    }
  },
  watch: {
    'form.type': {
      handler() {
        this.form.category = this.categories[0]
      }
    }
  }
}
</script>

<style scoped>
.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
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

.btn:hover:not(:disabled) {
  background: #d0d0d0;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd6;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #218838;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn-small {
  padding: 5px 10px;
  font-size: 12px;
}

.batch-actions {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-count {
  font-size: 14px;
  color: #856404;
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

.form-group .input.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.type-tabs {
  display: flex;
  gap: 10px;
}

.type-tab {
  flex: 1;
  padding: 10px;
  text-align: center;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.type-tab:hover {
  border-color: #667eea;
}

.type-tab.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.quick-categories,
.quick-notes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-tag,
.note-tag {
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-tag:hover,
.note-tag:hover {
  background: #e0e0e0;
}

.category-tag.active {
  background: #667eea;
  color: white;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.summary-item {
  background: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.summary-item.income .value {
  color: #28a745;
}

.summary-item.expense .value {
  color: #dc3545;
}

.summary-item.balance .value {
  color: #667eea;
}

.summary-item .label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.summary-item .value {
  display: block;
  font-size: 24px;
  font-weight: bold;
}

.card {
  background: white;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.card.selected {
  border: 2px solid #667eea;
  background: #f0f4ff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.select-checkbox {
  position: relative;
  width: 20px;
  height: 20px;
}

.select-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.select-checkbox label {
  display: block;
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  transition: all 0.3s;
}

.select-checkbox input:checked + label {
  background: #667eea;
  border-color: #667eea;
}

.select-checkbox input:checked + label::after {
  content: '';
  position: absolute;
  left: 7px;
  top: 3px;
  width: 4px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.category-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.category-badge.expense {
  background: #ffebee;
  color: #c62828;
}

.category-badge.income {
  background: #e8f5e9;
  color: #2e7d32;
}

.date {
  color: #999;
  font-size: 13px;
}

.card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.description {
  color: #666;
  font-size: 14px;
}

.amount {
  font-size: 18px;
  font-weight: bold;
}

.amount.income {
  color: #28a745;
}

.amount.expense {
  color: #dc3545;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.empty {
  text-align: center;
  color: #999;
  padding: 40px;
}
</style>
