import { http } from '@/utils/request';
import { Homework, HomeworkSubmission, HomeworkStatus, SubmissionStatus } from '@/types';

export const homeworkApi = {
  create: (data: any) => {
    return http.post<Homework>('/homeworks', data);
  },
  publish: (id: string) => {
    return http.post<Homework>(`/homeworks/${id}/publish`);
  },
  getList: (status?: HomeworkStatus) => {
    return http.get<Homework[]>('/homeworks', { status });
  },
  getDetail: (id: string) => {
    return http.get<Homework>(`/homeworks/${id}`);
  },
  delete: (id: string) => {
    return http.delete(`/homeworks/${id}`);
  },
  getMyHomeworks: (status?: SubmissionStatus) => {
    return http.get<HomeworkSubmission[]>('/homeworks/student/my', { status });
  },
  startHomework: (submissionId: string) => {
    return http.post<HomeworkSubmission>(`/homeworks/submissions/${submissionId}/start`);
  },
  submitHomework: (submissionId: string, data: any) => {
    return http.post<HomeworkSubmission>(`/homeworks/submissions/${submissionId}/submit`, data);
  },
  gradeSubmission: (submissionId: string, data: any) => {
    return http.post<HomeworkSubmission>(`/homeworks/submissions/${submissionId}/grade`, data);
  },
  getSubmission: (submissionId: string) => {
    return http.get<HomeworkSubmission>(`/homeworks/submissions/${submissionId}`);
  },
  getHomeworkSubmissions: (homeworkId: string) => {
    return http.get<HomeworkSubmission[]>(`/homeworks/${homeworkId}/submissions`);
  },
};
