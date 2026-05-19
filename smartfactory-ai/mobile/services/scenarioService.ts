import api from './api';
import { Scenario, ScenarioResults } from '../types';

export interface AnalysisStatusResponse {
  status: string;
  progress_pct: number;
  current_agent: string;
  error_code?: string;
  error_message?: string;
  retry_after_seconds?: number | null;
}

export const scenarioService = {
  createScenario: async (name: string, description: string): Promise<Scenario> => {
    return api.post('/scenarios', { name, description });
  },

  listScenarios: async (): Promise<Scenario[]> => {
    return api.get('/scenarios');
  },

  getScenario: async (id: string): Promise<Scenario> => {
    return api.get(`/scenarios/${id}`);
  },

  deleteScenario: async (id: string): Promise<void> => {
    return api.delete(`/scenarios/${id}`);
  },

  getScenarioResults: async (id: string): Promise<ScenarioResults> => {
    return api.get(`/scenarios/${id}/results`);
  },

  pollAnalysisStatus: async (id: string): Promise<AnalysisStatusResponse> => {
    return api.get(`/scenarios/${id}/status`);
  },
};
