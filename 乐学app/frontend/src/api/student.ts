import { http } from '@/utils/request';
import { StudentProfile, StudentRecord, RecordType } from '@/types';

export const studentApi = {
  createProfile: (data: any) => {
    return http.post<StudentProfile>('/students/profiles', data);
  },
  getProfiles: (grade?: number, className?: string) => {
    return http.get<StudentProfile[]>('/students/profiles', { grade, className });
  },
  getProfile: (studentId: string) => {
    return http.get<StudentProfile>(`/students/profiles/${studentId}`);
  },
  updateProfile: (studentId: string, data: any) => {
    return http.put<StudentProfile>(`/students/profiles/${studentId}`, data);
  },
  addRecord: (data: any) => {
    return http.post<StudentRecord>('/students/records', data);
  },
  getStudentRecords: (studentId: string, type?: RecordType) => {
    return http.get<StudentRecord[]>(`/students/records/${studentId}`, { type });
  },
  getRecord: (id: string) => {
    return http.get<StudentRecord>(`/students/records/detail/${id}`);
  },
  deleteRecord: (id: string) => {
    return http.delete(`/students/records/${id}`);
  },
};
