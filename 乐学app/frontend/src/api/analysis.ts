import { http } from '@/utils/request';
import { StudentAnalysis, ClassAnalysis } from '@/types';

export const analysisApi = {
  getStudentAnalysis: (studentId: string) => {
    return http.get<StudentAnalysis>(`/analysis/student/${studentId}`);
  },
  getMyAnalysis: () => {
    return http.get<StudentAnalysis>('/analysis/my');
  },
  getClassAnalysis: () => {
    return http.get<ClassAnalysis>('/analysis/class');
  },
};
