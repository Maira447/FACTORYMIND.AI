import api from './api';

export const ingestService = {
  uploadSensorCSV: async (scenarioId: string, fileUri: string, fileName: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: 'text/csv',
    } as any);

    return api.post(`/scenarios/${scenarioId}/ingest/sensor`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  submitText: async (scenarioId: string, type: string, content: string): Promise<any> => {
    return api.post(`/scenarios/${scenarioId}/ingest/text`, {
      type: type,
      content: content,
    });
  },

  loadDefaultSensorDataset: async (
    scenarioId: string,
    machineId: string,
    scenarioType: 'overstrain_failure' | 'heat_dissipation_failure' | 'tool_wear_failure',
    datasetSource: 'ai4i' | 'synthetic' | 'failure_demo' = 'ai4i',
    sampleSize: number = 12
  ): Promise<any> => {
    return api.post(`/scenarios/${scenarioId}/ingest/sensor/default`, {
      machine_id: machineId,
      scenario_type: scenarioType,
      dataset_source: datasetSource,
      sample_size: sampleSize,
    });
  },

  uploadCSV: async (scenarioId: string, type: string, fileUri: string, fileName: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: 'text/csv',
    } as any);
    return api.post(`/scenarios/${scenarioId}/ingest/csv?type=${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  triggerAnalysis: async (scenarioId: string): Promise<any> => {
    return api.post(`/scenarios/${scenarioId}/analyze`);
  },
};
