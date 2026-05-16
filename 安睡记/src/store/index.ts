import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { AuthState, SleepStore, SleepRecord, UserInfo } from '@/types';
import { formatDate, calculateDuration, generateId, getSleepQuality } from '@/utils';

const STORAGE_VERSION = 1;

const createMockRecords = (): SleepRecord[] => {
  const records: SleepRecord[] = [];
  const today = new Date();
  
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = formatDate(d);
    
    if (i === 0) continue;
    
    const bedHour = 22 + Math.floor(Math.random() * 3);
    const bedMin = Math.floor(Math.random() * 60);
    const wakeHour = 6 + Math.floor(Math.random() * 3);
    const wakeMin = Math.floor(Math.random() * 60);
    
    const bedTime = `${String(bedHour).padStart(2, '0')}:${String(bedMin).padStart(2, '0')}`;
    const wakeTime = `${String(wakeHour).padStart(2, '0')}:${String(wakeMin).padStart(2, '0')}`;
    const duration = calculateDuration(bedTime, wakeTime);
    
    records.push({
      id: generateId(),
      date: dateStr,
      bedTime,
      wakeTime,
      duration,
      quality: getSleepQuality(duration),
    });
  }
  
  return records;
};

interface PersistedState {
  version: number;
  state: {
    isLoggedIn: boolean;
    user: UserInfo | null;
    records: SleepRecord[];
  };
}

const migrateStorage = (persistedState: unknown): PersistedState['state'] => {
  const state = persistedState as PersistedState;
  
  if (!state || !state.version) {
    return {
      isLoggedIn: false,
      user: null,
      records: createMockRecords(),
    };
  }
  
  if (state.version < STORAGE_VERSION) {
    console.log(`[Storage] Migrating from version ${state.version} to ${STORAGE_VERSION}`);
  }
  
  return {
    isLoggedIn: state.state.isLoggedIn ?? false,
    user: state.state.user ?? null,
    records: Array.isArray(state.state.records) ? state.state.records : createMockRecords(),
  };
};

interface AppState extends AuthState, SleepStore {}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      records: createMockRecords(),
      
      login: async (phone: string, code: string): Promise<boolean> => {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          if (code === '123456') {
            set({
              isLoggedIn: true,
              user: {
                phone,
                nickname: '睡眠达人',
                targetSleepHours: 8,
              },
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
      
      logout: () => {
        set({ isLoggedIn: false, user: null });
      },
      
      updateUser: (info: Partial<UserInfo>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...info } : null,
        }));
      },
      
      addRecord: (record: SleepRecord) => {
        set((state) => {
          const existingIndex = state.records.findIndex(r => r.date === record.date);
          if (existingIndex >= 0) {
            const newRecords = [...state.records];
            newRecords[existingIndex] = { ...newRecords[existingIndex], ...record };
            return { records: newRecords };
          }
          return { records: [...state.records, record] };
        });
      },
      
      updateRecord: (id: string, record: Partial<SleepRecord>) => {
        set((state) => ({
          records: state.records.map(r => r.id === id ? { ...r, ...record } : r),
        }));
      },
      
      deleteRecord: (id: string) => {
        set((state) => ({
          records: state.records.filter(r => r.id !== id),
        }));
      },
      
      getRecordByDate: (date: string) => {
        return get().records.find(r => r.date === date);
      },
      
      getWeekRecords: (date?: string) => {
        const baseDate = date ? new Date(date) : new Date();
        const weekDates = getWeekDatesMemo(baseDate);
        return get().records.filter(r => weekDates.includes(r.date));
      },
    }),
    {
      name: 'anshuiji-storage',
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        return migrateStorage(persistedState);
      },
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        records: state.records,
      }),
    }
  )
);

const weekDateCache = new Map<string, string[]>();

const getWeekDatesMemo = (baseDate: Date): string[] => {
  const key = formatDate(baseDate);
  if (weekDateCache.has(key)) {
    return weekDateCache.get(key)!;
  }
  
  const dates: string[] = [];
  const day = baseDate.getDay();
  const monday = new Date(baseDate);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(baseDate.getDate() - (day === 0 ? 6 : day - 1));
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(formatDate(d));
  }
  
  if (weekDateCache.size > 100) {
    weekDateCache.clear();
  }
  weekDateCache.set(key, dates);
  
  return dates;
};

export const useAuth = () => useStore((state) => ({
  isLoggedIn: state.isLoggedIn,
  user: state.user,
  login: state.login,
  logout: state.logout,
  updateUser: state.updateUser,
}), shallow);

export const useRecords = () => useStore((state) => ({
  records: state.records,
  addRecord: state.addRecord,
  updateRecord: state.updateRecord,
  deleteRecord: state.deleteRecord,
  getRecordByDate: state.getRecordByDate,
  getWeekRecords: state.getWeekRecords,
}), shallow);

export const useCurrentUser = () => useStore((state) => state.user, shallow);
