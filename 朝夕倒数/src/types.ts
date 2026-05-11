export type CountdownType = 'birthday' | 'exam' | 'anniversary' | 'festival';

export interface Countdown {
  id: string;
  name: string;
  type: CountdownType;
  date: string;
  remindDays: number;
  isPinned: boolean;
  createdAt: string;
  deletedAt?: string;
}

export interface User {
  phone: string;
  loginTime: string;
}
