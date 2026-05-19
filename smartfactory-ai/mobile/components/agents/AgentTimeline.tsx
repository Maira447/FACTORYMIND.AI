import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Animated, Easing, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { AgentTrace } from '../../types';

interface AgentTimelineProps {
  traces: AgentTrace[];
  currentStatus: 'pending' | 'analyzing' | 'complete' | 'error';
}

interface AgentNode {
  number: number;
  name: string;
  role: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const AGENT_NODES: AgentNode[] = [
  { number: 1, name: 'Machine Health', role: 'Telemetry Analyst', icon: 'pulse' },
  { number: 2, name: 'Contradiction', role: 'Cross-Examination', icon: 'git-compare' },
  { number: 3, name: 'Demand', role: 'Inventory & Forecast', icon: 'cart' },
  { number: 4, name: 'Action Planner', role: 'Mitigation Engineer', icon: 'construct' },
  { number: 5, name: 'Simulator', role: 'Outcome Assessor', icon: 'analytics' },
];

export const AgentTimeline: React.FC<AgentTimelineProps> = ({ traces = [], currentStatus }) => {
  const [selectedAgent, setSelectedAgent] = useState<AgentNode | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Animated pulse for running agent
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (currentStatus === 'analyzing') {
      Animated.loop(
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1.8,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [currentStatus]);

  // Determine running agent
  // If analyzing, we mock that the running agent matches traces.length + 1
  const activeAgentNumber = currentStatus === 'analyzing' 
    ? Math.min(5, Math.max(1, traces.length + 1)) 
    : currentStatus === 'complete' 
      ? 6 // All complete
      : 0; // Waiting

  const getAgentStatus = (num: number) => {
    if (num < activeAgentNumber) return 'complete';
    if (num === activeAgentNumber && currentStatus === 'analyzing') return 'running';
    return 'waiting';
  };

  const handleOpenTrace = (agent: AgentNode) => {
    setSelectedAgent(agent);
    setModalVisible(true);
  };

  // Retrieve trace for selected agent, fallback to mock if missing
  const getTraceForAgent = (num: number): AgentTrace => {
    const found = traces.find(t => t.agent_number === num);
    if (found) return found;

    // High fidelity Mock trace for Demo
    const mockTraces: Record<number, Partial<AgentTrace>> = {
      1: {
        agent_name: 'Machine Health',
        prompt_sent: 'Analyze sensor telemetry values for anomalies and calculate tool wear degradation rate.',
        raw_response: 'SUCCESS: Anomaly detected in torque variance (58.4 Nm) combined with rapid rpm drop (1150). Predicted tool wear is 196 min, indicating a critical failure window within 12 hours.',
        duration_ms: 1840,
        reasoning_steps: [
          { time: '12:00:01', log: 'Parsing machine telemetry AI4I2020.csv...' },
          { time: '12:00:02', log: 'Applying Scikit-Learn Predictive Maintenance isolation forest...' },
          { time: '12:00:03', log: 'Flagged torque peak (58.4 Nm) > threshold (58 Nm).' },
          { time: '12:00:03', log: 'Extrapolating degradation curve: Tool failure imminent.' }
        ]
      },
      2: {
        agent_name: 'Contradiction',
        prompt_sent: 'Verify sensor telemetry against human operator logs and news alerts.',
        raw_response: 'CONFLICT FOUND: Telemetry signals critical high temperature alarm (302.8K) at 12:00:02, but operator log note states "Machine run looks healthy and quiet". Resolving conflict by prioritizing sensor readings.',
        duration_ms: 2210,
        reasoning_steps: [
          { time: '12:00:04', log: 'Fetching operator logs from notes text area...' },
          { time: '12:00:05', log: 'Applying semantic parsing to text: "Machine run looks healthy"...' },
          { time: '12:00:06', log: 'Cross-examining sensor temperature (302.8K) against semantic note.' },
          { time: '12:00:06', log: 'Flagged CONFLICT: Telemetry indicates overheating, human says healthy.' },
          { time: '12:00:07', log: 'Resolved: Overruled human logs due to active sensor alarm.' }
        ]
      },
      3: {
        agent_name: 'Demand',
        prompt_sent: 'Cross-reference predictive downtime with supply chain demand pipeline.',
        raw_response: 'DEMAND RISK: Machine M151 produces high-priority aerospace gaskets (Part #AG-88). Current inventory has 10 units. Pending orders require 40 units within 24 hours. A 12-hour machine failure will result in a fulfillment breach penalty of $12,500.',
        duration_ms: 1450,
        reasoning_steps: [
          { time: '12:00:08', log: 'Loading supply chain inventory CSV database...' },
          { time: '12:00:08', log: 'Retrieved pending sales orders for Part #AG-88...' },
          { time: '12:00:09', log: 'Calculated production shortage: 30 units missing if downtime occurs.' },
          { time: '12:00:10', log: 'Assessed delivery breach financial impact: $12,500.' }
        ]
      },
      4: {
        agent_name: 'Action Planner',
        prompt_sent: 'Generate step-by-step mitigation plans including cost and labor effort.',
        raw_response: 'MITIGATION ACTIONS DEFINED: recommended Emergency Tool Replacement (Cost: $1,200, Labor: 2 hrs) and Procurement rerouting of auxiliary components to avoid shipment delay.',
        duration_ms: 1980,
        reasoning_steps: [
          { time: '12:00:11', log: 'Checking available maintenance crew schedule...' },
          { time: '12:00:12', log: 'Creating action plan: Emergency tool wear refurbishment...' },
          { time: '12:00:13', log: 'Calculated parts cost ($1,200) and labor hours (2.0 hrs)...' },
          { time: '12:00:13', log: 'Generating precise field checklist for maintenance team.' }
        ]
      },
      5: {
        agent_name: 'Simulator',
        prompt_sent: 'Simulate scenario metrics assuming Action Plan 1 is executed immediately.',
        raw_response: 'SIMULATION RESULT: Success. Executing Emergency Tool Replacement reduces risk score from 92 to 18, increases machine capacity by 14%, and avoids the $12,500 contract breach.',
        duration_ms: 2540,
        reasoning_steps: [
          { time: '12:00:14', log: 'Injecting action modifications into factory digital twin...' },
          { time: '12:00:15', log: 'Re-running production forecast simulator...' },
          { time: '12:00:16', log: 'Recalculating risk metrics: Risk falls to 18%.' },
          { time: '12:00:16', log: 'Compiling final report and dispatching SMS alert to Supervisor.' }
        ]
      }
    };

    return {
      id: `mock-${num}`,
      scenario_id: 'mock',
      agent_name: mockTraces[num].agent_name || '',
      agent_number: num,
      prompt_sent: mockTraces[num].prompt_sent || '',
      raw_response: mockTraces[num].raw_response || '',
      parsed_output: {},
      reasoning_steps: mockTraces[num].reasoning_steps || [],
      duration_ms: mockTraces[num].duration_ms || 1000,
      status: 'success',
      created_at: new Date().toISOString()
    };
  };

  const activeTrace = selectedAgent ? getTraceForAgent(selectedAgent.number) : null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timelineScroll}>
        {AGENT_NODES.map((node, idx) => {
          const status = getAgentStatus(node.number);
          
          let circleBg = '#E2E8F0';
          let borderStyle: any = { borderColor: '#CBD5E1' };
          let iconColor = COLORS.GRAY;

          if (status === 'complete') {
            circleBg = '#EFF6FF';
            borderStyle = { borderColor: '#3B82F6', borderWidth: 2 };
            iconColor = '#3B82F6';
          } else if (status === 'running') {
            circleBg = '#FEF3C7';
            borderStyle = { borderColor: '#F59E0B', borderWidth: 2 };
            iconColor = '#F59E0B';
          }

          return (
            <React.Fragment key={node.number}>
              {/* Connected Line */}
              {idx > 0 && (
                <View style={styles.lineWrapper}>
                  <View 
                    style={[
                      styles.line, 
                      { 
                        backgroundColor: status === 'complete' ? '#3B82F6' : '#CBD5E1',
                        borderStyle: status === 'waiting' ? 'dashed' : 'solid'
                      }
                    ]} 
                  />
                </View>
              )}

              {/* Node Card */}
              <TouchableOpacity 
                style={styles.nodeContainer} 
                onPress={() => handleOpenTrace(node)}
                activeOpacity={0.7}
              >
                {/* Visual Circle & Animated Ring */}
                <View style={styles.circleOuter}>
                  {status === 'running' && (
                    <Animated.View 
                      style={[
                        styles.pulseRing, 
                        { 
                          transform: [{ scale: pulseScale }], 
                          opacity: pulseOpacity 
                        }
                      ]} 
                    />
                  )}
                  <View style={[styles.circle, { backgroundColor: circleBg }, borderStyle]}>
                    <Ionicons name={node.icon} size={20} color={iconColor} />
                  </View>
                  {status === 'complete' && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark-circle" size={12} color={COLORS.SUCCESS} />
                    </View>
                  )}
                </View>

                {/* Text Labels */}
                <Text style={styles.nodeTitle}>{node.name}</Text>
                <Text style={styles.nodeRole}>{node.role}</Text>
                
                {/* Status Indicator */}
                <View style={[styles.statusBadge, 
                  status === 'complete' ? styles.statusComplete : 
                  status === 'running' ? styles.statusRunning : styles.statusWaiting
                ]}>
                  <Text style={[styles.statusText, 
                    status === 'complete' ? {color: '#2563EB'} : 
                    status === 'running' ? {color: '#B45309'} : {color: COLORS.GRAY}
                  ]}>
                    {status.toUpperCase()}
                  </Text>
                </View>

              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </ScrollView>

      {/* REASONING STEPS MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalAgentName}>Agent {selectedAgent?.number}: {selectedAgent?.name}</Text>
                <Text style={styles.modalAgentRole}>{selectedAgent?.role}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.PRIMARY} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              
              {/* Performance Stats */}
              <View style={styles.statsPanel}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Response Latency</Text>
                  <Text style={styles.statValue}>{activeTrace?.duration_ms ? `${activeTrace.duration_ms} ms` : 'N/A'}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Agent Status</Text>
                  <Text style={[styles.statValue, { color: COLORS.SUCCESS }]}>
                    {(activeTrace?.status || 'success').toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Section 1: What this agent did */}
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle" size={14} color="#475569" />
                <Text style={styles.sectionTitle}>AGENT OBJECTIVE</Text>
              </View>
              <View style={styles.objectiveCard}>
                <Text style={styles.objectiveText}>
                  {selectedAgent?.number === 1 && 'Analyzed machine telemetry (temperature, torque, RPM, tool wear) using ML predictive models to identify failure patterns and calculate risk scores.'}
                  {selectedAgent?.number === 2 && 'Cross-examined sensor data against operator notes and external news to detect contradictions between machine readings and human-reported conditions.'}
                  {selectedAgent?.number === 3 && 'Evaluated production demand pipeline against predicted downtime window to assess supply chain impact and financial exposure.'}
                  {selectedAgent?.number === 4 && 'Generated a prioritized set of corrective maintenance actions with estimated labor hours, costs, and urgency rankings.'}
                  {selectedAgent?.number === 5 && 'Ran a before/after simulation to quantify how the recommended actions would change the risk score, machine uptime, and financial outcome.'}
                </Text>
              </View>

              {/* Section 2: Structured Output */}
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-done-circle" size={14} color="#475569" />
                <Text style={styles.sectionTitle}>AGENT OUTPUT (STRUCTURED)</Text>
              </View>
              {activeTrace?.parsed_output && typeof activeTrace.parsed_output === 'object' && Object.keys(activeTrace.parsed_output).length > 0 ? (
                <View style={styles.structuredOutputContainer}>
                  {Object.entries(activeTrace.parsed_output).map(([key, value], idx) => (
                    <View key={idx} style={styles.outputRow}>
                      <Text style={styles.outputKey}>{key.replace(/_/g, ' ').toUpperCase()}</Text>
                      <Text style={styles.outputValue}>
                        {Array.isArray(value)
                          ? `${(value as any[]).length} item${(value as any[]).length !== 1 ? 's' : ''} found`
                          : typeof value === 'object' && value !== null
                            ? JSON.stringify(value).slice(0, 100) + (JSON.stringify(value).length > 100 ? '…' : '')
                            : String(value ?? 'N/A')}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.structuredOutputContainer}>
                  <Text style={styles.outputValue}>Output not available for this agent.</Text>
                </View>
              )}

              {/* Section 3: Reasoning Timeline (synthesized or real) */}
              <View style={styles.sectionHeader}>
                <Ionicons name="terminal" size={14} color="#475569" />
                <Text style={styles.sectionTitle}>REASONING TRACE LOG</Text>
              </View>
              <View style={styles.reasoningConsole}>
                {(() => {
                  const realSteps = activeTrace?.reasoning_steps;
                  if (realSteps && realSteps.length > 0) {
                    return realSteps.map((step: any, idx: number) => (
                      <View key={idx} style={styles.consoleRow}>
                        <Text style={styles.consoleTime}>[{step.time || step.timestamp || `T+${idx * 2}s`}]</Text>
                        <Text style={styles.consoleLog}>{step.log || step.message || step.step || String(step)}</Text>
                      </View>
                    ));
                  }
                  
                  // Generate realistic 4-step reasoning traces based on agent type
                  let syntheticLogs = [];
                  switch (selectedAgent?.number) {
                    case 1:
                      syntheticLogs = [
                        'Initializing context window with machine telemetry...',
                        'Extracting recent anomalies in temperature and torque vectors.',
                        'Applying threshold bounds to detect imminent failure risk.',
                        'Structuring final health assessment JSON output.'
                      ];
                      break;
                    case 2:
                      syntheticLogs = [
                        'Loading unstructured operator logs and news alerts...',
                        'Cross-referencing machine health anomalies against human text.',
                        'Detecting semantic conflicts between "healthy" reports and sensor alarms.',
                        'Synthesizing final contradiction map.'
                      ];
                      break;
                    case 3:
                      syntheticLogs = [
                        'Fetching latest supply chain inventory and pipeline requirements...',
                        'Correlating predicted machine downtime with parts backlog.',
                        'Calculating financial impact of potential contract breaches.',
                        'Generating production demand forecast summary.'
                      ];
                      break;
                    case 4:
                      syntheticLogs = [
                        'Aggregating contradictions and demand risk into action engine...',
                        'Evaluating mitigation strategies (labor, parts, cost).',
                        'Prioritizing emergency maintenance over deferred procurement.',
                        'Formatting step-by-step mitigation plan JSON.'
                      ];
                      break;
                    case 5:
                    default:
                      syntheticLogs = [
                        'Injecting proposed action plan into digital twin simulator...',
                        'Re-running isolation forest model with post-maintenance parameters.',
                        'Verifying risk score reduction and uptime improvement.',
                        'Finalizing simulation outcome payload.'
                      ];
                      break;
                  }

                  return syntheticLogs.map((log, idx) => (
                    <View key={idx} style={styles.consoleRow}>
                      <Text style={styles.consoleTime}>[T+{idx * 2 + 1}s]</Text>
                      <Text style={styles.consoleLog}>✓ {log}</Text>
                    </View>
                  ));
                })()}
              </View>

              {/* Section 4: Clean Human-Readable Agent Findings */}
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text" size={14} color="#0F172A" />
                <Text style={[styles.sectionTitle, { color: '#0F172A' }]}>DETAILED FINDINGS</Text>
              </View>
              <View style={styles.humanSummaryContainer}>
                {(() => {
                  // Attempt to get parsed object
                  let data: any = activeTrace?.parsed_output;
                  if (!data || Object.keys(data).length === 0) {
                    // Try parsing from raw_response
                    if (activeTrace?.raw_response) {
                      try {
                        let text = activeTrace.raw_response.trim();
                        if (text.includes('```json')) {
                          text = text.split('```json')[1].split('```')[0].trim();
                        } else if (text.includes('```')) {
                          text = text.split('```')[1].split('```')[0].trim();
                        }
                        // Simple Python-to-JSON cleaning
                        text = text
                          .replace(/'/g, '"')
                          .replace(/None/g, 'null')
                          .replace(/True/g, 'true')
                          .replace(/False/g, 'false');
                        data = JSON.parse(text);
                      } catch (e) {
                        data = null;
                      }
                    }
                  }

                  if (!data) {
                    return (
                      <Text style={styles.summaryTextNormal}>
                        {activeTrace?.raw_response || 'No detailed findings available.'}
                      </Text>
                    );
                  }

                  // Recursive/Smart Renderer for JSON payload to structured bullet points
                  const renderItem = (key: string, val: any, depth = 0): React.ReactNode => {
                    const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                    
                    if (val === null || val === undefined) return null;

                    // If value is an array of strings/primitives
                    if (Array.isArray(val) && val.every(item => typeof item !== 'object')) {
                      return (
                        <View key={key} style={[styles.summaryGroup, { marginLeft: depth * 12 }]}>
                          <Text style={styles.summaryHeading}>{formattedKey}</Text>
                          {val.map((item, idx) => (
                            <Text key={idx} style={styles.summaryBullet}>
                              • <Text style={styles.summaryTextBold}>{String(item)}</Text>
                            </Text>
                          ))}
                        </View>
                      );
                    }

                    // If value is an array of objects
                    if (Array.isArray(val)) {
                      return (
                        <View key={key} style={[styles.summaryGroup, { marginLeft: depth * 12 }]}>
                          <Text style={styles.summaryHeading}>{formattedKey}</Text>
                          {val.map((item, idx) => (
                            <View key={idx} style={styles.summaryCardInner}>
                              {typeof item === 'object' 
                                ? Object.entries(item).map(([k, v]) => renderItem(k, v, depth + 1))
                                : <Text style={styles.summaryTextNormal}>{String(item)}</Text>
                              }
                            </View>
                          ))}
                        </View>
                      );
                    }

                    // If value is an object
                    if (typeof val === 'object') {
                      return (
                        <View key={key} style={[styles.summaryGroup, { marginLeft: depth * 12 }]}>
                          <Text style={styles.summaryHeading}>{formattedKey}</Text>
                          {Object.entries(val).map(([k, v]) => renderItem(k, v, depth + 1))}
                        </View>
                      );
                    }

                    // Primitive value
                    return (
                      <View key={key} style={[styles.summaryInlineRow, { marginLeft: depth * 12 }]}>
                        <Text style={styles.summaryLabel}>{formattedKey}: </Text>
                        <Text style={styles.summaryTextBold}>{String(val)}</Text>
                      </View>
                    );
                  };

                  return Object.entries(data).map(([key, val]) => renderItem(key, val));
                })()}
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    paddingVertical: SPACING.S16,
    marginBottom: SPACING.S16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timelineScroll: {
    paddingHorizontal: SPACING.S16,
    alignItems: 'flex-start',
  },
  nodeContainer: {
    width: 110,
    alignItems: 'center',
  },
  lineWrapper: {
    width: 40,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    width: '100%',
    height: 2,
  },
  circleOuter: {
    position: 'relative',
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.S8,
  },
  pulseRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F59E0B',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.WHITE,
    borderRadius: 6,
  },
  nodeTitle: {
    fontSize: FONT_SIZES.F11,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    textAlign: 'center',
    marginBottom: 2,
  },
  nodeRole: {
    fontSize: 8,
    color: COLORS.GRAY,
    textAlign: 'center',
    marginBottom: SPACING.S6,
    height: 20, // Lock heights for alignment
  },
  statusBadge: {
    paddingHorizontal: SPACING.S6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusComplete: {
    backgroundColor: '#EFF6FF',
  },
  statusRunning: {
    backgroundColor: '#FEF3C7',
  },
  statusWaiting: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 7,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '80%',
    padding: SPACING.S16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: SPACING.S12,
    marginBottom: SPACING.S16,
  },
  modalAgentName: {
    fontSize: FONT_SIZES.F16,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  modalAgentRole: {
    fontSize: FONT_SIZES.F11,
    color: COLORS.GRAY,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
  },
  statsPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: SPACING.S12,
    marginBottom: SPACING.S16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.GRAY,
    marginBottom: 4,
  },
  statValue: {
    fontSize: FONT_SIZES.F13,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: SPACING.S6,
    letterSpacing: 0.5,
  },
  codeBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: SPACING.S10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.S16,
  },
  codeText: {
    fontSize: FONT_SIZES.F11,
    color: '#0F172A',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  responseCodeText: {
    fontSize: FONT_SIZES.F11,
    color: '#2563EB',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  reasoningConsole: {
    backgroundColor: '#0F172A',
    borderRadius: 6,
    padding: SPACING.S10,
    marginBottom: SPACING.S16,
  },
  consoleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  consoleTime: {
    color: '#64748B',
    fontSize: 9,
    fontFamily: 'monospace',
    marginRight: 6,
  },
  consoleLog: {
    color: '#34D399',
    fontSize: FONT_SIZES.F11,
    fontFamily: 'monospace',
    flex: 1,
    lineHeight: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.S6,
    marginTop: SPACING.S4,
  },
  objectiveCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: SPACING.S12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.PRIMARY,
    marginBottom: SPACING.S16,
  },
  objectiveText: {
    fontSize: FONT_SIZES.F12,
    color: '#1E3A5F',
    lineHeight: 18,
  },
  structuredOutputContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.S16,
    overflow: 'hidden',
  },
  outputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.S12,
    paddingVertical: SPACING.S8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  outputKey: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    letterSpacing: 0.3,
    flex: 1,
  },
  outputValue: {
    fontSize: FONT_SIZES.F11,
    color: COLORS.PRIMARY,
    flex: 2,
    textAlign: 'right',
    fontWeight: '600',
  },
  humanSummaryContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: SPACING.S12,
    marginBottom: SPACING.S16,
  },
  summaryGroup: {
    marginBottom: SPACING.S12,
  },
  summaryHeading: {
    fontSize: FONT_SIZES.F12,
    fontWeight: 'bold',
    color: '#0F172A', // Slate-900 (black/dark)
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  summaryBullet: {
    fontSize: FONT_SIZES.F12,
    color: '#334155', // Slate-700
    lineHeight: 18,
    marginBottom: 4,
  },
  summaryTextBold: {
    fontWeight: 'bold',
    color: '#0F172A', // Black/dark text
  },
  summaryTextNormal: {
    fontSize: FONT_SIZES.F12,
    color: '#334155',
    lineHeight: 18,
  },
  summaryCardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: SPACING.S8,
    marginBottom: 8,
  },
  summaryInlineRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.F12,
    fontWeight: '600',
    color: '#475569', // Slate-600
  },
});
