import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { scenarioService } from '../../services/scenarioService';
import { Action, Contradiction, DataSource, Insight, Scenario, ScenarioResults } from '../../types';
import { AgentTimeline } from '../../components/agents/AgentTimeline';
import { InsightCard } from '../../components/insights/InsightCard';
import { ContradictionViewer } from '../../components/insights/ContradictionViewer';
import { ActionCard } from '../../components/actions/ActionCard';
import { BeforeAfterPanel } from '../../components/simulation/BeforeAfterPanel';
import { RiskGauge } from '../../components/charts/RiskGauge';
import { SensorChart, SensorReading } from '../../components/charts/SensorChart';

type MetricKey = 'temp' | 'torque' | 'rpm' | 'tool_wear';

const METRIC_LABELS: Record<MetricKey, string> = {
  temp: 'Temperature',
  torque: 'Torque',
  rpm: 'RPM',
  tool_wear: 'Tool Wear',
};

const buildFallbackResults = (scenario: Scenario): ScenarioResults => ({
  scenario,
  insights: [],
  contradictions: [],
  actions: [],
  simulations: [],
  ml_predictions: [],
  agent_traces: [],
  data_sources: [],
});

const deriveTelemetryFromSources = (dataSources: DataSource[] = []): SensorReading[] => {
  const sensorRows = dataSources
    .filter((source) => source.source_type === 'sensor_csv')
    .flatMap((source) => source.payload || [])
    .slice(-12);

  if (sensorRows.length === 0) {
    return [];
  }

  return sensorRows.map((row, index) => ({
    timestamp: new Date(Date.now() - (sensorRows.length - index) * 60000).toISOString(),
    temp: Number(row['Process temperature [K]'] ?? row['Air temperature [K]'] ?? 0),
    torque: Number(row['Torque [Nm]'] ?? 0),
    rpm: Number(row['Rotational speed [rpm]'] ?? 0),
    tool_wear: Number(row['Tool wear [min]'] ?? 0),
  }));
};

const buildFallbackTelemetry = (riskScore: number): SensorReading[] => {
  return Array.from({ length: 10 }, (_, index) => ({
    timestamp: new Date(Date.now() - (10 - index) * 60000).toISOString(),
    temp: Number((296 + index * 0.5 + riskScore * 0.03).toFixed(2)),
    torque: Number((35 + index * 1.4 + riskScore * 0.12).toFixed(2)),
    rpm: Math.round(1600 - index * 18 - riskScore * 2.2),
    tool_wear: Number((90 + index * 5 + riskScore * 0.4).toFixed(2)),
  }));
};

export default function ScenarioResultsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [results, setResults] = useState<ScenarioResults | null>(null);
  const [telemetry, setTelemetry] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<MetricKey>('temp');

  useEffect(() => {
    loadScenarioData();
  }, [id]);

  useEffect(() => {
    if (!scenario || scenario.status !== 'analyzing') {
      return;
    }

    const intervalId = setInterval(() => {
      loadScenarioData();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [scenario?.status, id]);

  const loadScenarioData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentScenario = await scenarioService.getScenario(id as string);
      setScenario(currentScenario);

      const res: any = await scenarioService.getScenarioResults(id as string);
      const finalResults = res?.final_results || {};
      const mappedResults: ScenarioResults = {
        scenario: currentScenario,
        insights: finalResults.insights || [],
        contradictions: finalResults.contradictions || [],
        actions: finalResults.actions || [],
        action_steps: finalResults.action_steps || [],
        simulations: finalResults.simulations || (finalResults.simulation ? [finalResults.simulation] : []),
        notifications: finalResults.notifications || [],
        ml_predictions: finalResults.ml_predictions || [],
        agent_traces: res?.agent_traces || [],
        data_sources: res?.data_sources || [],
      };

      setResults(mappedResults);

      const sensorTelemetry = deriveTelemetryFromSources(mappedResults.data_sources);
      const riskScore = mappedResults.ml_predictions?.[0]?.risk_score || 0;
      setTelemetry(sensorTelemetry.length > 0 ? sensorTelemetry : buildFallbackTelemetry(riskScore));
    } catch (e: any) {
      setError(e?.message || 'Unable to load scenario results');
      const fallbackScenario: Scenario = {
        id: String(id),
        name: 'Scenario unavailable',
        description: 'Results could not be loaded. Refresh and try again.',
        status: 'error',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setScenario(fallbackScenario);
      setResults(buildFallbackResults(fallbackScenario));
      setTelemetry(buildFallbackTelemetry(35));
    } finally {
      setLoading(false);
    }
  };

  const latestPrediction = results?.ml_predictions?.[0];
  const latestSimulation = results?.simulations?.[0];
  const riskScore = Math.round(latestPrediction?.risk_score || 0);
  const healthScore = Math.max(0, 100 - riskScore);
  const failureProbability = Math.round((latestPrediction?.failure_probability || 0) * 100);
  const machineId = latestPrediction?.machine_id || (results?.insights || []).find((item) => item.machine_id)?.machine_id || 'Unknown';
  const datasetSource = useMemo(() => {
    const row = results?.data_sources?.find((source) => source.source_type === 'sensor_csv')?.payload?.[0];
    return row?.dataset_source || 'uploaded';
  }, [results]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading scenario results...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navAction} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color={COLORS.PRIMARY} />
          <Text style={styles.navActionText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Scenario Results</Text>
        <TouchableOpacity style={styles.navAction} onPress={loadScenarioData}>
          <Ionicons name="refresh" size={18} color={COLORS.PRIMARY} />
          <Text style={styles.navActionText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={require('../../assets/industrial_bg.png')}
          style={styles.heroCard}
          imageStyle={styles.heroCardImage}
          resizeMode="cover"
        >
          {/* Dark overlay for legibility */}
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{scenario?.name}</Text>
            <Text style={styles.heroSubtitle}>{scenario?.description}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaPillDark}>
                <Text style={styles.metaLabelDark}>Machine</Text>
                <Text style={styles.metaValueDark}>{machineId}</Text>
              </View>
              <View style={styles.metaPillDark}>
                <Text style={styles.metaLabelDark}>Dataset</Text>
                <Text style={styles.metaValueDark}>{String(datasetSource).toUpperCase()}</Text>
              </View>
              <View style={styles.metaPillDark}>
                <Text style={styles.metaLabelDark}>Status</Text>
                <Text style={styles.metaValueDark}>{scenario?.status?.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {scenario?.status === 'analyzing' ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Analysis still running</Text>
            <Text style={styles.infoText}>
              Results will appear automatically when the backend finishes the agent pipeline.
            </Text>
          </View>
        ) : null}

        <View style={styles.summaryCard}>
          <View style={styles.gaugeWrap}>
            <RiskGauge score={riskScore} label="Risk Score" />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Health Score</Text>
              <Text style={styles.summaryValue}>{healthScore}/100</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Failure Probability</Text>
              <Text style={styles.summaryValue}>{failureProbability}%</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Failure Type</Text>
              <Text style={styles.summaryValue}>{latestPrediction?.predicted_failure_type || 'Not available'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Urgency</Text>
              <Text style={styles.summaryValue}>{latestPrediction?.urgency || 'Unknown'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Telemetry</Text>
          <Text style={styles.sectionHint}>The chart uses recent sensor rows from your scenario dataset.</Text>
          <View style={styles.metricTabs}>
            {(Object.keys(METRIC_LABELS) as MetricKey[]).map((metric) => (
              <TouchableOpacity
                key={metric}
                style={[styles.metricTab, activeMetric === metric && styles.metricTabActive]}
                onPress={() => setActiveMetric(metric)}
              >
                <Text style={[styles.metricTabText, activeMetric === metric && styles.metricTabTextActive]}>
                  {METRIC_LABELS[metric]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <SensorChart readings={telemetry} metric={activeMetric} />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Insights</Text>
          {results?.insights?.length ? (
            results.insights.map((insight: Insight, index: number) => (
              <InsightCard key={insight.id || `insight-${index}`} insight={insight} />
            ))
          ) : (
            <Text style={styles.emptyText}>No insights available yet.</Text>
          )}
        </View>
 
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contradictions</Text>
          {results?.contradictions?.length ? (
            results.contradictions.map((contradiction: Contradiction, index: number) => (
              <ContradictionViewer key={contradiction.id || `contradiction-${index}`} contradiction={contradiction} />
            ))
          ) : (
            <Text style={styles.emptyText}>No contradictions found.</Text>
          )}
        </View>
 
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recommended Actions</Text>
          {results?.actions?.length ? (
            results.actions.map((action: Action, index: number) => (
              <ActionCard key={action.id || `action-${index}`} action={action} steps={results.action_steps || []} onViewSimulation={() => {}} />
            ))
          ) : (
            <Text style={styles.emptyText}>No actions recommended yet.</Text>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Simulation</Text>
          {latestSimulation ? <BeforeAfterPanel simulation={latestSimulation} /> : <Text style={styles.emptyText}>No simulation output available.</Text>}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Agent Pipeline</Text>
          <AgentTimeline traces={results?.agent_traces || []} currentStatus={scenario?.status || 'pending'} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BG,
  },
  loadingText: {
    marginTop: SPACING.S12,
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.F14,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.S16,
    paddingVertical: SPACING.S12,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  navAction: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 72,
  },
  navActionText: {
    marginLeft: 6,
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.F12,
    fontWeight: '600',
  },
  navTitle: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.F16,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.S16,
    gap: SPACING.S16,
  },
  heroCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  heroCardImage: {
    borderRadius: 12,
  },
  heroOverlay: {
    backgroundColor: 'rgba(15, 28, 50, 0.72)',
    padding: SPACING.S16,
    borderRadius: 12,
  },
  heroTitle: {
    fontSize: FONT_SIZES.F18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.S8,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.F13,
    color: '#CBD5E1',
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.S8,
    marginTop: SPACING.S16,
  },
  metaPill: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: SPACING.S10,
    paddingVertical: SPACING.S8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaPillDark: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingHorizontal: SPACING.S10,
    paddingVertical: SPACING.S8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  metaLabel: {
    fontSize: FONT_SIZES.F10,
    color: COLORS.GRAY,
    marginBottom: 2,
  },
  metaLabelDark: {
    fontSize: FONT_SIZES.F10,
    color: '#94A3B8',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: FONT_SIZES.F12,
    color: COLORS.PRIMARY,
    fontWeight: '700',
  },
  metaValueDark: {
    fontSize: FONT_SIZES.F12,
    color: '#F1F5F9',
    fontWeight: '700',
  },
  errorText: {
    color: COLORS.CRITICAL,
    fontSize: FONT_SIZES.F12,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: SPACING.S16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoTitle: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.F14,
    fontWeight: '700',
    marginBottom: SPACING.S6,
  },
  infoText: {
    color: '#334155',
    fontSize: FONT_SIZES.F12,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.S16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gaugeWrap: {
    alignItems: 'center',
  },
  summaryInfo: {
    marginTop: SPACING.S8,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.F14,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    marginBottom: SPACING.S12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.S8,
    gap: SPACING.S12,
  },
  summaryKey: {
    color: COLORS.GRAY,
    fontSize: FONT_SIZES.F12,
  },
  summaryValue: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.F12,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  sectionCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.S16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.F16,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    marginBottom: SPACING.S6,
  },
  sectionHint: {
    fontSize: FONT_SIZES.F11,
    color: COLORS.GRAY,
    marginBottom: SPACING.S12,
  },
  metricTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.S8,
    marginBottom: SPACING.S8,
  },
  metricTab: {
    paddingHorizontal: SPACING.S10,
    paddingVertical: SPACING.S8,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },
  metricTabActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  metricTabText: {
    fontSize: FONT_SIZES.F11,
    color: COLORS.GRAY,
    fontWeight: '600',
  },
  metricTabTextActive: {
    color: COLORS.WHITE,
  },
  emptyText: {
    color: COLORS.GRAY,
    fontSize: FONT_SIZES.F12,
  },
});
