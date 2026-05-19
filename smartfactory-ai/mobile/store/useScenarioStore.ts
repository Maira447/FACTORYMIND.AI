import { create } from 'zustand';
import { Scenario } from '../types';
import { scenarioService } from '../services/scenarioService';

interface ScenarioState {
  scenarios: Scenario[];
  currentScenario: Scenario | null;
  isLoading: boolean;
  error: string | null;

  fetchScenarios: () => Promise<void>;
  createScenario: (name: string, description: string) => Promise<Scenario>;
  setCurrentScenario: (scenario: Scenario | null) => void;
  deleteScenario: (id: string) => Promise<void>;
}

export const useScenarioStore = create<ScenarioState>((set) => ({
  scenarios: [],
  currentScenario: null,
  isLoading: false,
  error: null,

  fetchScenarios: async () => {
    set({ isLoading: true, error: null });
    try {
      const scenarios = await scenarioService.listScenarios();
      set({ scenarios, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createScenario: async (name, description) => {
    set({ isLoading: true, error: null });
    try {
      const scenario = await scenarioService.createScenario(name, description);
      set((state) => ({ scenarios: [scenario, ...state.scenarios], isLoading: false }));
      return scenario;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setCurrentScenario: (scenario) => set({ currentScenario: scenario }),

  deleteScenario: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await scenarioService.deleteScenario(id);
      set((state) => ({
        scenarios: state.scenarios.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));
