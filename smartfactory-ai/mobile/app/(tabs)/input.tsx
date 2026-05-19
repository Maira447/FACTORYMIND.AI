import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { useSensorData } from '../../hooks/useSensorData';
import { useScenarioStore } from '../../store/useScenarioStore';
import { ingestService } from '../../services/ingestService';
import { scenarioService } from '../../services/scenarioService';

const SCENARIO_PRESETS = [
  {
    id: 'overstrain_failure',
    label: 'Scenario 1: Overstrain',
    machine: 'Machine 1',
    name: 'Machine 1 Overstrain Escalation',
    description: 'Torque is climbing while spindle speed drops on Machine 1 during heavy production load.',
    operatorNotes: 'Machine 1 is vibrating under load and operators report harder cutting resistance on the current shift.',
    supplierEmail: 'Spare spindle coupling delivery is delayed by 48 hours, so immediate replacement stock is limited.',
    newsUpdates: 'Power demand on the industrial estate is elevated this week, increasing stress during peak production windows.',
  },
  {
    id: 'heat_dissipation_failure',
    label: 'Scenario 2: Heat Dissipation',
    machine: 'Machine 2',
    name: 'Machine 2 Cooling Failure Warning',
    description: 'Machine 2 shows rising process temperature relative to ambient conditions, indicating cooling inefficiency.',
    operatorNotes: 'Maintenance crew observed slower coolant circulation near Machine 2 and intermittent hot surface alarms.',
    supplierEmail: 'Coolant pump vendor confirmed service engineer availability only from the next morning shift.',
    newsUpdates: 'Regional heat conditions are above seasonal baseline, which can amplify thermal failures on older machines.',
  },
  {
    id: 'tool_wear_failure',
    label: 'Scenario 3: Tool Wear',
    machine: 'Machine 3',
    name: 'Machine 3 Tool Wear Breakdown Risk',
    description: 'Machine 3 is approaching end-of-life tool wear, with worsening torque stability and quality drift.',
    operatorNotes: 'Finished parts from Machine 3 show rough edges and operators hear a repeating chatter near the cutting head.',
    supplierEmail: 'Replacement tool inserts are available, but the preferred grade is constrained until the next dispatch cycle.',
    newsUpdates: 'Commodity price movement is raising replacement tooling cost, so downtime decisions need tighter prioritization.',
  },
] as const;

type ScenarioPresetId = typeof SCENARIO_PRESETS[number]['id'];
type DatasetMode = 'ai4i' | 'synthetic' | 'failure_demo' | 'upload';

export default function InputWizard() {
  const router = useRouter();
  const { createScenario, setCurrentScenario } = useScenarioStore();
  const { parseCsvFile, validateAI4IColumns, getPreviewRows, isParsing } = useSensorData();

  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [machineId, setMachineId] = useState('Machine 1');
  const [scenarioType, setScenarioType] = useState<ScenarioPresetId>('overstrain_failure');
  const [datasetMode, setDatasetMode] = useState<DatasetMode>('ai4i');

  const [sensorFile, setSensorFile] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const [operatorNotes, setOperatorNotes] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [newsUpdates, setNewsUpdates] = useState('');

  // Interactive focus state for inputs
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const waitForAnalysisCompletion = async (scenarioId: string) => {
    const maxAttempts = 180;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const status = await scenarioService.pollAnalysisStatus(scenarioId);

      if (status.status === 'complete') {
        return;
      }

      if (status.status === 'error') {
        const retrySuffix = status.retry_after_seconds
          ? ` Retry after about ${status.retry_after_seconds} seconds.`
          : '';
        throw new Error(
          status.error_message ||
          (status.error_code === 'gemini_quota_exceeded'
            ? `Gemini API quota exceeded.${retrySuffix}`
            : 'Analysis failed on the backend')
        );
      }

      setAnalysisStatus(`Analysis in progress... (${attempt + 1}/${maxAttempts})`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error('Analysis timed out before completion');
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setSensorFile(file);
      setDatasetMode('upload');

      const parsedRows = await parseCsvFile(file.uri);
      const valResult = validateAI4IColumns(parsedRows);
      setValidationResult(valResult);

      if (valResult.valid) {
        setPreviewData(getPreviewRows(parsedRows, 1));
      } else {
        setPreviewData([]);
      }
    } catch (err: any) {
      alert(`Error picking file: ${err.message}`);
    }
  };

  const handleUseDefaultDataset = () => {
    try {
      const filePayload = {
        name: 'ai4i2020_sample.csv',
        uri: 'internal://ai4i2020_sample.csv',
        mimeType: 'text/csv',
        size: 1024,
      };

      setSensorFile(filePayload);
      setDatasetMode('ai4i');
      setValidationResult({ valid: true, missing: [] });

      setPreviewData([{
        'UDI': '1',
        'Product ID': 'M14860',
        'Type': 'M',
        'Air temperature [K]': '298.1',
        'Process temperature [K]': '308.6',
        'Rotational speed [rpm]': '1551',
        'Torque [Nm]': '42.8',
        'Tool wear [min]': '0',
        'Machine failure': '0',
      }]);
    } catch (err: any) {
      alert(`Error using sample dataset: ${err.message}`);
    }
  };

  const handleUseSyntheticDataset = () => {
    const filePayload = {
      name: 'synthetic_sensor_stream.csv',
      uri: 'internal://synthetic_sensor_stream.csv',
      mimeType: 'text/csv',
      size: 2048,
    };

    setSensorFile(filePayload);
    setDatasetMode('synthetic');
    setValidationResult({ valid: true, missing: [] });

    setPreviewData([{
      'UDI': '2',
      'Product ID': 'L47180',
      'Type': 'L',
      'Air temperature [K]': '299.3',
      'Process temperature [K]': '309.1',
      'Rotational speed [rpm]': '1428',
      'Torque [Nm]': '48.2',
      'Tool wear [min]': '12',
      'Machine failure': '0',
    }]);
  };

  const handleUseFailureDemoDataset = () => {
    const filePayload = {
      name: 'forced_failure_demo.csv',
      uri: 'internal://forced_failure_demo.csv',
      mimeType: 'text/csv',
      size: 4096,
    };

    setSensorFile(filePayload);
    setDatasetMode('failure_demo');
    setValidationResult({ valid: true, missing: [] });

    setPreviewData([{
      'UDI': '3',
      'Product ID': 'H52320',
      'Type': 'H',
      'Air temperature [K]': '304.5',
      'Process temperature [K]': '313.8',
      'Rotational speed [rpm]': '1120',
      'Torque [Nm]': '68.5',
      'Tool wear [min]': '195',
      'Machine failure': '1',
    }]);
  };

  const applyScenarioPreset = (presetId: ScenarioPresetId) => {
    const preset = SCENARIO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setName(preset.name);
    setDescription(preset.description);
    setMachineId(preset.machine);
    setOperatorNotes(preset.operatorNotes);
    setSupplierEmail(preset.supplierEmail);
    setNewsUpdates(preset.newsUpdates);

    if (presetId === 'overstrain_failure') {
      handleUseFailureDemoDataset();
    } else if (presetId === 'heat_dissipation_failure') {
      handleUseSyntheticDataset();
    } else {
      handleUseDefaultDataset();
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisStatus('Initializing analysis pipeline...');

    try {
      // 1. Create the scenario
      const scenario = await scenarioService.createScenario(name, description);
      setCurrentScenario(scenario);

      // 2. Ingest unstructured context texts
      setAnalysisStatus('Ingesting unstructured operational telemetry...');
      if (operatorNotes) {
        await ingestService.submitText(scenario.id, 'operator_note', operatorNotes);
      }
      if (supplierEmail) {
        await ingestService.submitText(scenario.id, 'email', supplierEmail);
      }
      if (newsUpdates) {
        await ingestService.submitText(scenario.id, 'news', newsUpdates);
      }

      // 3. Ingest sensor data stream
      setAnalysisStatus('Sending factory sensor data stream...');
      if (datasetMode === 'upload') {
        if (sensorFile && sensorFile.uri) {
          await ingestService.uploadSensorCSV(scenario.id, sensorFile.uri, sensorFile.name);
        } else {
          throw new Error('Custom sensor CSV file not selected');
        }
      } else {
        await ingestService.loadDefaultSensorDataset(
          scenario.id,
          machineId,
          scenarioType,
          datasetMode
        );
      }

      // 4. Trigger the multi-agent AI orchestration pipeline
      setAnalysisStatus('Orchestrating AI multi-agent diagnostic task...');
      await ingestService.triggerAnalysis(scenario.id);

      // 5. Poll for background task completion
      setAnalysisStatus('Executing predictive calculations...');
      await waitForAnalysisCompletion(scenario.id);

      setIsAnalyzing(false);
      router.push(`/scenario/${scenario.id}`);
    } catch (err: any) {
      alert(`Orchestration failure: ${err.message}`);
      setIsAnalyzing(false);
    }
  };

  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.stepWrapper}>
          <View
            style={[
              styles.stepCircle,
              step >= i ? styles.stepCircleActive : styles.stepCircleInactive,
            ]}
          >
            {step > i ? (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            ) : (
              <Text style={styles.stepText}>{i}</Text>
            )}
          </View>
          {i < 4 && (
            <View 
              style={[
                styles.stepLine, 
                { backgroundColor: step > i ? '#38BDF8' : 'rgba(255, 255, 255, 0.15)' }
              ]} 
            />
          )}
        </View>
      ))}
    </View>
  );

  if (isAnalyzing) {
    return (
      <ImageBackground
        source={require('../../assets/industrial_bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={[styles.blurOverlay, { backgroundColor: 'rgba(15, 23, 42, 0.85)' }]} />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#38BDF8" style={{ marginBottom: SPACING.S24 }} />
          <Text style={styles.loaderTitle}>Analyzing Factory Data...</Text>
          <Text style={styles.loaderSubtitle}>{analysisStatus}</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/industrial_bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.blurOverlay} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <Text style={styles.subHeaderTitle}>Scenario Builder</Text>
          <Text style={styles.headerTitle}>Ingestion Wizard</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderProgressIndicator()}

          {/* Step 1: Scenario Details */}
          {step === 1 && (
            <View style={styles.glassCard}>
              <Text style={styles.cardHeader}>Step 1: Scenario Details</Text>
              
              <Text style={styles.fieldLabel}>Scenario Name</Text>
              <TextInput
                style={[
                  styles.inputField,
                  focusedField === 'name' && styles.inputFieldFocused
                ]}
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g. Afternoon Production Drop"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
              />

              <Text style={styles.fieldLabel}>Machine Number</Text>
              <TextInput
                style={[
                  styles.inputField,
                  focusedField === 'machine' && styles.inputFieldFocused
                ]}
                value={machineId}
                onChangeText={setMachineId}
                onFocus={() => setFocusedField('machine')}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g. Machine 1"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
              />

              <Text style={styles.fieldLabel}>Choose Scenario Preset Template</Text>
              <View style={styles.presetsList}>
                {SCENARIO_PRESETS.map((preset) => {
                  const active = scenarioType === preset.id;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      onPress={() => {
                        setScenarioType(preset.id);
                        applyScenarioPreset(preset.id);
                      }}
                      style={[
                        styles.presetItem,
                        active && styles.presetItemActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.presetLabel, active && styles.presetLabelActive]}>
                        {preset.label}
                      </Text>
                      <Text style={styles.presetMachine}>{preset.machine}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[
                  styles.inputField,
                  styles.multilineInput,
                  focusedField === 'description' && styles.inputFieldFocused
                ]}
                multiline
                value={description}
                onChangeText={setDescription}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
                placeholder="Briefly describe the context or issue..."
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
              />

              <TouchableOpacity
                onPress={() => setStep(2)}
                disabled={!name}
                activeOpacity={0.8}
                style={[styles.primaryButton, !name && styles.buttonDisabled]}
              >
                <Text style={styles.buttonText}>Next Step</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Sensor Data */}
          {step === 2 && (
            <View style={styles.glassCard}>
              <Text style={styles.cardHeader}>Step 2: Sensor Data Stream</Text>
              
              <View style={styles.infoBox}>
                <Ionicons name="server" size={32} color="#38BDF8" style={{ marginBottom: 8 }} />
                <Text style={styles.infoBoxTitle}>Telemetry Connection Established</Text>
                <Text style={styles.infoBoxText}>
                  Load preset sensor rows or select a custom operational CSV log.
                </Text>
              </View>

              <View style={styles.datasetButtonsContainer}>
                <TouchableOpacity 
                  onPress={handleUseDefaultDataset}
                  style={styles.secondaryButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryButtonText}>Use AI4I Sample Dataset</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleUseSyntheticDataset}
                  style={styles.secondaryButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryButtonText}>Use Synthetic Dataset</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleUseFailureDemoDataset}
                  style={styles.secondaryButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryButtonText}>Use Failure Demo Dataset</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                onPress={handleFilePick} 
                style={styles.uploadLink}
                activeOpacity={0.7}
              >
                <Ionicons name="cloud-upload" size={18} color="#FFAB40" style={{ marginRight: 6 }} />
                <Text style={styles.uploadLinkText}>Or upload custom sensor CSV</Text>
              </TouchableOpacity>

              {isParsing && <ActivityIndicator size="small" color="#38BDF8" style={{ marginVertical: 12 }} />}

              {sensorFile && validationResult && (
                <View style={styles.fileStatusContainer}>
                  <View style={styles.fileNameRow}>
                    <Ionicons name="checkmark-circle" size={20} color="#4ADE80" style={{ marginRight: 8 }} />
                    <Text style={styles.fileNameText}>{sensorFile.name}</Text>
                  </View>
                  <Text style={styles.fileSourceText}>
                    Source: {datasetMode === 'upload' ? 'Uploaded CSV' : datasetMode === 'failure_demo' ? 'Failure demo data' : datasetMode === 'synthetic' ? 'Synthetic data' : 'AI4I sample dataset'}
                  </Text>

                  {!validationResult.valid && (
                    <Text style={styles.validationErrorText}>
                      Missing columns: {validationResult.missing.join(', ')}
                    </Text>
                  )}

                  {previewData.length > 0 && (
                    <View style={styles.previewContainer}>
                      <Text style={styles.previewTitle}>Telemetry Row Preview:</Text>
                      <Text style={styles.previewCode}>
                        {JSON.stringify(previewData[0], null, 2)}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={() => setStep(1)}
                  style={styles.ghostButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.ghostButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setStep(3)}
                  disabled={!sensorFile}
                  style={[styles.primaryButton, { flex: 1 }, !sensorFile && styles.buttonDisabled]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Next Step</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 3: Additional Context */}
          {step === 3 && (
            <View style={styles.glassCard}>
              <Text style={styles.cardHeader}>Step 3: Unstructured Context</Text>
              
              <Text style={styles.fieldLabel}>Operator Notes</Text>
              <TextInput
                style={[
                  styles.inputField,
                  styles.multilineInput,
                  focusedField === 'notes' && styles.inputFieldFocused
                ]}
                multiline
                value={operatorNotes}
                onChangeText={setOperatorNotes}
                onFocus={() => setFocusedField('notes')}
                onBlur={() => setFocusedField(null)}
                placeholder="Observed speed drops, mechanical chatter, surface heat alarms..."
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
              />

              <Text style={styles.fieldLabel}>Logistics & Supplier Emails</Text>
              <TextInput
                style={[
                  styles.inputField,
                  styles.multilineInput,
                  focusedField === 'emails' && styles.inputFieldFocused
                ]}
                multiline
                value={supplierEmail}
                onChangeText={setSupplierEmail}
                onFocus={() => setFocusedField('emails')}
                onBlur={() => setFocusedField(null)}
                placeholder="Supply line notifications, spare pump delivery delay alerts..."
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
              />

              <Text style={styles.fieldLabel}>External News & Policy Updates</Text>
              <TextInput
                style={[
                  styles.inputField,
                  styles.multilineInput,
                  focusedField === 'news' && styles.inputFieldFocused
                ]}
                multiline
                value={newsUpdates}
                onChangeText={setNewsUpdates}
                onFocus={() => setFocusedField('news')}
                onBlur={() => setFocusedField(null)}
                placeholder="Utility tariffs spikes, ambient summer peak temperatures..."
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={() => setStep(2)}
                  style={styles.ghostButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.ghostButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setStep(4)}
                  style={[styles.primaryButton, { flex: 1 }]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Next Step</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 4: Review & Analyze */}
          {step === 4 && (
            <View style={styles.glassCard}>
              <Text style={styles.cardHeader}>Step 4: Review & Deploy</Text>
              
              <View style={styles.reviewSummaryBox}>
                <Text style={styles.summaryTitle}>{name || 'Unnamed Scenario'}</Text>
                <Text style={styles.summaryDesc}>{description || 'No description provided.'}</Text>
                
                <View style={styles.summaryDivider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Machine ID</Text>
                  <Text style={styles.summaryValue}>{machineId}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Template Preset</Text>
                  <Text style={styles.summaryValue}>
                    {SCENARIO_PRESETS.find((p) => p.id === scenarioType)?.label || 'None'}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Dataset Ingest</Text>
                  <Text style={[styles.summaryValue, { textTransform: 'capitalize', color: '#FFFFFF', fontWeight: '700' }]}>
                    {datasetMode}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Sensor Stream</Text>
                  <Text style={styles.summaryValue}>{sensorFile ? sensorFile.name : 'Missing'}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Floor Logs</Text>
                  <Text style={styles.summaryValue}>{operatorNotes ? 'Included' : 'None'}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Supply Emails</Text>
                  <Text style={styles.summaryValue}>{supplierEmail ? 'Included' : 'None'}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>External Factors</Text>
                  <Text style={styles.summaryValue}>{newsUpdates ? 'Included' : 'None'}</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleAnalyze}
                activeOpacity={0.8}
                style={styles.analyzeButton}
              >
                <Ionicons name="rocket" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>ANALYZE NOW</Text>
              </TouchableOpacity>

              <View style={[styles.buttonRow, { marginTop: 12 }]}>
                <TouchableOpacity
                  onPress={() => setStep(3)}
                  style={styles.ghostButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.ghostButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => applyScenarioPreset(scenarioType)}
                  style={styles.demoButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.demoButtonText}>Reset Preset Demo Data</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: SPACING.S20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : SPACING.S12,
    paddingBottom: SPACING.S12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  subHeaderTitle: {
    color: '#94A3B8',
    fontSize: FONT_SIZES.F12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    color: '#38BDF8',
    fontSize: FONT_SIZES.F22,
    fontWeight: '800',
  },
  scrollContent: {
    paddingVertical: SPACING.S20,
    paddingHorizontal: SPACING.S20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.S24,
    width: '100%',
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  stepCircleActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  stepCircleInactive: {
    backgroundColor: '#1E293B',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  stepText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 4,
  },
  glassCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: SPACING.S20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.F18,
    fontWeight: '800',
    marginBottom: SPACING.S16,
  },
  fieldLabel: {
    color: '#94A3B8',
    fontSize: FONT_SIZES.F14,
    fontWeight: '600',
    marginBottom: SPACING.S8,
  },
  inputField: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: SPACING.S16,
    paddingVertical: 12,
    fontSize: FONT_SIZES.F16,
    marginBottom: SPACING.S16,
    width: '100%',
  },
  inputFieldFocused: {
    borderColor: '#38BDF8',
    borderWidth: 1.2,
    backgroundColor: '#0F172A',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  presetsList: {
    gap: 8,
    marginBottom: SPACING.S16,
  },
  presetItem: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: SPACING.S12,
  },
  presetItemActive: {
    borderColor: '#38BDF8',
    backgroundColor: '#0F172A',
  },
  presetLabel: {
    fontWeight: '700',
    color: '#38BDF8',
    fontSize: 14,
  },
  presetLabelActive: {
    color: '#FFFFFF',
  },
  presetMachine: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  infoBox: {
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 14,
    padding: SPACING.S16,
    alignItems: 'center',
    marginBottom: SPACING.S20,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  infoBoxTitle: {
    fontSize: 14,
    color: '#38BDF8',
    fontWeight: '700',
    textAlign: 'center',
  },
  infoBoxText: {
    color: '#94A3B8',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  datasetButtonsContainer: {
    gap: 8,
    marginBottom: SPACING.S16,
  },
  primaryButton: {
    backgroundColor: '#1A73E8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonDisabled: {
    backgroundColor: '#64748B',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.F16,
    fontWeight: '700',
  },
  uploadLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.S20,
    paddingVertical: 4,
  },
  uploadLinkText: {
    color: '#FFAB40',
    fontWeight: '700',
    fontSize: 14,
  },
  fileStatusContainer: {
    marginBottom: SPACING.S16,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    padding: SPACING.S12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  fileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fileNameText: {
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  fileSourceText: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 8,
  },
  validationErrorText: {
    color: '#EF4444',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  previewContainer: {
    backgroundColor: '#0F172A',
    padding: SPACING.S8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  previewTitle: {
    fontWeight: '700',
    color: '#38BDF8',
    fontSize: 11,
    marginBottom: 4,
  },
  previewCode: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: SPACING.S12,
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghostButtonText: {
    color: '#94A3B8',
    fontSize: FONT_SIZES.F16,
    fontWeight: '700',
  },
  reviewSummaryBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: SPACING.S16,
    borderRadius: 14,
    marginBottom: SPACING.S24,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.F18,
    fontWeight: '800',
    color: '#38BDF8',
    marginBottom: 4,
  },
  summaryDesc: {
    color: '#94A3B8',
    fontSize: FONT_SIZES.F14,
    marginBottom: SPACING.S12,
    lineHeight: 18,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: SPACING.S12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  summaryLabel: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 13,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  analyzeButton: {
    flexDirection: 'row',
    backgroundColor: '#22C55E', // Green button matching analytical triggers
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  demoButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FFAB40',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  demoButtonText: {
    color: '#FFAB40',
    fontWeight: '700',
    fontSize: 14,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.S24,
  },
  loaderTitle: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.F22,
    fontWeight: '800',
    marginBottom: SPACING.S8,
  },
  loaderSubtitle: {
    color: '#94A3B8',
    fontSize: FONT_SIZES.F16,
    textAlign: 'center',
  },
});
