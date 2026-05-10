import dayjs from 'dayjs'

export const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

export const getCurrentMonth = () => {
  return dayjs().format('YYYY-MM')
}

export const expenseCategories = ['餐饮', '交通', '购物', '娱乐', '医疗', '教育', '住房', '其他']
export const incomeCategories = ['工资', '奖金', '投资', '兼职', '其他']
