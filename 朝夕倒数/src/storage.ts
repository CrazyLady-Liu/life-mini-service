import { Countdown, User } from './types';

const USER_KEY = 'zhaoxi_user';
const COUNTDOWN_KEY = 'zhaoxi_countdowns';

export const storage = {
  getUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  setUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  getCountdowns: (): Countdown[] => {
    const data = localStorage.getItem(COUNTDOWN_KEY);
    return data ? JSON.parse(data) : [];
  },

  setCountdowns: (countdowns: Countdown[]) => {
    localStorage.setItem(COUNTDOWN_KEY, JSON.stringify(countdowns));
  },

  addCountdown: (countdown: Countdown) => {
    const countdowns = storage.getCountdowns();
    countdowns.push(countdown);
    storage.setCountdowns(countdowns);
  },

  updateCountdown: (id: string, updates: Partial<Countdown>) => {
    const countdowns = storage.getCountdowns();
    const index = countdowns.findIndex(c => c.id === id);
    if (index !== -1) {
      countdowns[index] = { ...countdowns[index], ...updates };
      storage.setCountdowns(countdowns);
    }
  },

  deleteCountdown: (id: string) => {
    const countdowns = storage.getCountdowns();
    const index = countdowns.findIndex(c => c.id === id);
    if (index !== -1) {
      countdowns[index].deletedAt = new Date().toISOString();
      storage.setCountdowns(countdowns);
    }
  },

  getActiveCountdowns: (): Countdown[] => {
    return storage.getCountdowns().filter(c => !c.deletedAt);
  },

  getDeletedCountdowns: (): Countdown[] => {
    return storage.getCountdowns().filter(c => !!c.deletedAt);
  },

  clearAllData: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(COUNTDOWN_KEY);
  }
};
