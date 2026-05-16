export interface SleepRecord {
  id: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  duration: number;
  quality?: 'good' | 'normal' | 'poor';
  note?: string;
}

export interface UserInfo {
  phone: string;
  nickname?: string;
  targetSleepHours: number;
  avatar?: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: UserInfo | null;
  login: (phone: string, code: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (info: Partial<UserInfo>) => void;
}

export interface SleepStore {
  records: SleepRecord[];
  addRecord: (record: SleepRecord) => void;
  updateRecord: (id: string, record: Partial<SleepRecord>) => void;
  deleteRecord: (id: string) => void;
  getRecordByDate: (date: string) => SleepRecord | undefined;
  getWeekRecords: (date?: string) => SleepRecord[];
}
