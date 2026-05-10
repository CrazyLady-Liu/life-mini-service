<template>
  <div class="data-statistics">
    <div class="filters">
      <input type="month" v-model="currentMonth" @change="loadStats" class="input" />
    </div>

    <div class="summary">
      <div class="summary-item income">
        <span class="label">总收入</span>
        <span class="value">¥{{ totalIncome.toFixed(2) }}</span>
      </div>
      <div class="summary-item expense">
        <span class="label">总支出</span>
        <span class="value">¥{{ totalExpense.toFixed(2) }}</span>
      </div>
      <div class="summary-item balance">
        <span class="label">结余</span>
        <span class="value">¥{{ (totalIncome - totalExpense).toFixed(2) }}</span>
      </div>
    </div>

    <div class="charts">
      <div class="chart-card">
        <h3>收支构成</h3>
        <div ref="pieChartRef" class="chart"></div>
      </div>
      <div class="chart-card">
        <h3>支出分类</h3>
        <div ref="expenseChartRef" class="chart"></div>
      </div>
      <div class="chart-card">
        <h3>收入分类</h3>
        <div ref="incomeChartRef" class="chart"></div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { transactions } from '../api'
import { getCurrentMonth } from '../utils'

export default {
  name: 'DataStatistics',
  data() {
    return {
      currentMonth: getCurrentMonth(),
      monthlyStats: [],
      expenseStats: [],
      incomeStats: []
    }
  },
  computed: {
    totalIncome() {
      const item = this.monthlyStats.find(s => s.type === 'income')
      return item ? item.total : 0
    },
    totalExpense() {
      const item = this.monthlyStats.find(s => s.type === 'expense')
      return item ? item.total : 0
    }
  },
  mounted() {
    this.loadStats()
  },
  beforeUnmount() {
    if (this.pieChart) this.pieChart.dispose()
    if (this.expenseChart) this.expenseChart.dispose()
    if (this.incomeChart) this.incomeChart.dispose()
  },
  methods: {
    async loadStats() {
      try {
        const [monthlyRes, expenseRes, incomeRes] = await Promise.all([
          transactions.getMonthlyStats(this.currentMonth),
          transactions.getCategoryStats(this.currentMonth, 'expense'),
          transactions.getCategoryStats(this.currentMonth, 'income')
        ])
        
        if (monthlyRes.data.success) this.monthlyStats = monthlyRes.data.data
        if (expenseRes.data.success) this.expenseStats = expenseRes.data.data
        if (incomeRes.data.success) this.incomeStats = incomeRes.data.data
        
        this.$nextTick(() => {
          this.renderCharts()
        })
      } catch (error) {
        alert('加载失败: ' + error.message)
      }
    },
    renderCharts() {
      this.renderPieChart()
      this.renderExpenseChart()
      this.renderIncomeChart()
    },
    renderPieChart() {
      if (!this.$refs.pieChartRef) return
      if (this.pieChart) this.pieChart.dispose()
      
      this.pieChart = echarts.init(this.$refs.pieChartRef)
      
      const data = this.monthlyStats.map(s => ({
        name: s.type === 'income' ? '收入' : '支出',
        value: s.total
      }))
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: ¥{c} ({d}%)'
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            data: data,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            color: ['#28a745', '#dc3545']
          }
        ]
      }
      
      this.pieChart.setOption(option)
    },
    renderExpenseChart() {
      if (!this.$refs.expenseChartRef) return
      if (this.expenseChart) this.expenseChart.dispose()
      
      this.expenseChart = echarts.init(this.$refs.expenseChartRef)
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        xAxis: {
          type: 'category',
          data: this.expenseStats.map(s => s.category)
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: this.expenseStats.map(s => s.total),
            type: 'bar',
            itemStyle: {
              color: '#dc3545',
              borderRadius: [5, 5, 0, 0]
            }
          }
        ]
      }
      
      this.expenseChart.setOption(option)
    },
    renderIncomeChart() {
      if (!this.$refs.incomeChartRef) return
      if (this.incomeChart) this.incomeChart.dispose()
      
      this.incomeChart = echarts.init(this.$refs.incomeChartRef)
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        xAxis: {
          type: 'category',
          data: this.incomeStats.map(s => s.category)
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: this.incomeStats.map(s => s.total),
            type: 'bar',
            itemStyle: {
              color: '#28a745',
              borderRadius: [5, 5, 0, 0]
            }
          }
        ]
      }
      
      this.incomeChart.setOption(option)
    }
  }
}
</script>

<style scoped>
.filters {
  margin-bottom: 20px;
}

.input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
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

.charts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.chart-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.chart-card h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
}

.chart {
  width: 100%;
  height: 300px;
}

@media (min-width: 768px) {
  .charts {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
