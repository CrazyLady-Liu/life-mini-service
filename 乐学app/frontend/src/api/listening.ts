import { http } from '@/utils/request';
import { ListeningMaterial, ListeningPractice, MaterialCategory, ListeningLevel, PracticeStatus } from '@/types';

export const listeningApi = {
  createMaterial: (data: any) => {
    return http.post<ListeningMaterial>('/listening/materials', data);
  },
  getMaterials: (category?: MaterialCategory, level?: ListeningLevel, isPublic?: boolean) => {
    return http.get<ListeningMaterial[]>('/listening/materials', { category, level, isPublic });
  },
  getMaterial: (id: string) => {
    return http.get<ListeningMaterial>(`/listening/materials/${id}`);
  },
  deleteMaterial: (id: string) => {
    return http.delete(`/listening/materials/${id}`);
  },
  startPractice: (materialId: string) => {
    return http.post<ListeningPractice>(`/listening/materials/${materialId}/practice`);
  },
  submitPractice: (practiceId: string, data: any) => {
    return http.post<ListeningPractice>(`/listening/practices/${practiceId}/submit`, data);
  },
  getMyPractices: (status?: PracticeStatus) => {
    return http.get<ListeningPractice[]>('/listening/practices/my', { status });
  },
  getPractice: (id: string) => {
    return http.get<ListeningPractice>(`/listening/practices/${id}`);
  },
  getMaterialPractices: (materialId: string) => {
    return http.get<ListeningPractice[]>(`/listening/materials/${materialId}/practices`);
  },
};
