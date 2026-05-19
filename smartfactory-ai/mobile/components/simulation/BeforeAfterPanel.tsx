import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { Simulation } from '../../types';

interface BeforeAfterPanelProps {
  simulation: Simulation;
}

export const BeforeAfterPanel: React.FC<BeforeAfterPanelProps> = ({ simulation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const before = simulation.before_state || {};
  const after = simulation.after_state || {};

  // Formatter for cost
  const formatCost = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Metric color helper
  const getRiskColor = (score: number) => {
    if (score <= 40) return '#2E7D32'; // Green
    if (score <= 70) return '#F57C00'; // Amber
    return '#C62828'; // Red
  };

  // Calculate Deltas
  const riskBefore = before.risk_score || 0;
  const riskAfter = after.risk_score || 0;
  const riskDelta = riskAfter - riskBefore;

  const prodBefore = before.production_rate || before.production_efficiency || 0;
  const prodAfter = after.production_rate || after.production_efficiency || 0;
  const prodDelta = prodAfter - prodBefore;

  const costBefore = before.cost_per_day || before.daily_cost || 0;
  const costAfter = after.cost_per_day || after.daily_cost || 0;
  const costDelta = costAfter - costBefore;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.card}>
        
        <View style={styles.panelTitleRow}>
          <Ionicons name="git-branch-outline" size={16} color={COLORS.PRIMARY} />
          <Text style={styles.panelTitle}>MITIGATION IMPACT SIMULATOR</Text>
        </View>

        {/* METRICS SIDE-BY-SIDE GRID */}
        <View style={styles.metricsGrid}>
          
          {/* Risk Score Metric */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Risk Score</Text>
            <View style={styles.comparisonRow}>
              <View style={styles.stateCol}>
                <Text style={styles.stateLabel}>BEFORE</Text>
                <Text style={[styles.stateValue, { color: getRiskColor(riskBefore) }]}>
                  {riskBefore}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={COLORS.GRAY} style={styles.arrowIcon} />
              <View style={styles.stateCol}>
                <Text style={styles.stateLabel}>AFTER</Text>
                <Text style={[styles.stateValue, { color: getRiskColor(riskAfter) }]}>
                  {riskAfter}
                </Text>
              </View>
            </View>
            <View style={[styles.deltaBadge, { backgroundColor: riskDelta <= 0 ? '#EFF6FF' : '#FEF2F2' }]}>
              <Ionicons 
                name={riskDelta <= 0 ? 'trending-down' : 'trending-up'} 
                size={12} 
                color={riskDelta <= 0 ? '#2563EB' : COLORS.CRITICAL} 
              />
              <Text style={[styles.deltaText, { color: riskDelta <= 0 ? '#2563EB' : COLORS.CRITICAL }]}>
                {riskDelta <= 0 ? `${riskDelta}` : `+${riskDelta}`} Risk
              </Text>
            </View>
          </View>

          {/* Production Rate Metric */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Production Rate</Text>
            <View style={styles.comparisonRow}>
              <View style={styles.stateCol}>
                <Text style={styles.stateLabel}>BEFORE</Text>
                <Text style={[styles.stateValue, { color: '#64748B' }]}>
                  {prodBefore}%
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={COLORS.GRAY} style={styles.arrowIcon} />
              <View style={styles.stateCol}>
                <Text style={styles.stateLabel}>AFTER</Text>
                <Text style={[styles.stateValue, { color: COLORS.SUCCESS }]}>
                  {prodAfter}%
                </Text>
              </View>
            </View>
            <View style={[styles.deltaBadge, { backgroundColor: prodDelta >= 0 ? '#F0FDF4' : '#FEF2F2' }]}>
              <Ionicons 
                name={prodDelta >= 0 ? 'arrow-up' : 'arrow-down'} 
                size={12} 
                color={prodDelta >= 0 ? COLORS.SUCCESS : COLORS.CRITICAL} 
              />
              <Text style={[styles.deltaText, { color: prodDelta >= 0 ? COLORS.SUCCESS : COLORS.CRITICAL }]}>
                {prodDelta >= 0 ? `+${prodDelta.toFixed(1)}%` : `${prodDelta.toFixed(1)}%`}
              </Text>
            </View>
          </View>

          {/* Daily Operating Cost Metric */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Operating Cost</Text>
            <View style={styles.comparisonRow}>
              <View style={styles.stateCol}>
                <Text style={styles.stateLabel}>BEFORE</Text>
                <Text style={[styles.stateValue, { color: '#64748B', fontSize: 13 }]}>
                  {formatCost(costBefore)}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={12} color={COLORS.GRAY} style={styles.arrowIcon} />
              <View style={styles.stateCol}>
                <Text style={styles.stateLabel}>AFTER</Text>
                <Text style={[styles.stateValue, { color: '#2563EB', fontSize: 13 }]}>
                  {formatCost(costAfter)}
                </Text>
              </View>
            </View>
            <View style={[styles.deltaBadge, { backgroundColor: costDelta <= 0 ? '#F0FDF4' : '#FEF2F2' }]}>
              <Ionicons 
                name={costDelta <= 0 ? 'arrow-down' : 'arrow-up'} 
                size={12} 
                color={costDelta <= 0 ? COLORS.SUCCESS : COLORS.CRITICAL} 
              />
              <Text style={[styles.deltaText, { color: costDelta <= 0 ? COLORS.SUCCESS : COLORS.CRITICAL }]}>
                {costDelta <= 0 ? `${formatCost(Math.abs(costDelta))}` : `+${formatCost(costDelta)}`}
              </Text>
            </View>
          </View>

        </View>

        {/* VISUAL IMPACT COMPARISON CHART */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>IMPACT PROJECTION CHART</Text>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#94A3B8' }]} />
              <Text style={styles.legendText}>Before</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.legendText}>After Mitigation</Text>
            </View>
          </View>
          
          <View style={styles.chartWrapper}>
            <Svg width="100%" height={150} viewBox="0 0 320 150">
              {/* Grid Lines */}
              <Line x1="10" y1="120" x2="310" y2="120" stroke="#E2E8F0" strokeWidth="1" />
              <Line x1="10" y1="70" x2="310" y2="70" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="2 4" />
              <Line x1="10" y1="20" x2="310" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="2 4" />

              {/* Grid Labels */}
              <SvgText x="5" y="125" fill="#94A3B8" fontSize="8" fontWeight="bold">0%</SvgText>
              <SvgText x="5" y="75" fill="#94A3B8" fontSize="8" fontWeight="bold">50%</SvgText>
              <SvgText x="5" y="25" fill="#94A3B8" fontSize="8" fontWeight="bold">100%</SvgText>

              {/* Pair 1: Risk Score (Scale: 100) */}
              {/* Before Bar */}
              <Rect 
                x="55" 
                y={120 - (Math.min(riskBefore, 100) * 1)} 
                width="20" 
                height={Math.min(riskBefore, 100) * 1} 
                rx="3" 
                fill="#FDA4AF" 
              />
              <Rect 
                x="55" 
                y={120 - (Math.min(riskBefore, 100) * 1)} 
                width="20" 
                height="6" 
                rx="1" 
                fill="#EF4444" 
              />
              <SvgText 
                x="65" 
                y={120 - (Math.min(riskBefore, 100) * 1) - 5} 
                fill="#EF4444" 
                fontSize="9" 
                fontWeight="900" 
                textAnchor="middle"
              >
                {riskBefore}
              </SvgText>

              {/* After Bar */}
              <Rect 
                x="80" 
                y={120 - (Math.min(riskAfter, 100) * 1)} 
                width="20" 
                height={Math.min(riskAfter, 100) * 1} 
                rx="3" 
                fill="#A7F3D0" 
              />
              <Rect 
                x="80" 
                y={120 - (Math.min(riskAfter, 100) * 1)} 
                width="20" 
                height="6" 
                rx="1" 
                fill="#10B981" 
              />
              <SvgText 
                x="90" 
                y={120 - (Math.min(riskAfter, 100) * 1) - 5} 
                fill="#10B981" 
                fontSize="9" 
                fontWeight="900" 
                textAnchor="middle"
              >
                {riskAfter}
              </SvgText>
              
              {/* Category Label */}
              <SvgText x="77" y="137" fill="#64748B" fontSize="9" fontWeight="bold" textAnchor="middle">Risk Score</SvgText>


              {/* Pair 2: Production Rate (Scale: 100) */}
              {/* Before Bar */}
              <Rect 
                x="145" 
                y={120 - (Math.min(prodBefore, 100) * 1)} 
                width="20" 
                height={Math.min(prodBefore, 100) * 1} 
                rx="3" 
                fill="#CBD5E1" 
              />
              <Rect 
                x="145" 
                y={120 - (Math.min(prodBefore, 100) * 1)} 
                width="20" 
                height="6" 
                rx="1" 
                fill="#64748B" 
              />
              <SvgText 
                x="155" 
                y={120 - (Math.min(prodBefore, 100) * 1) - 5} 
                fill="#64748B" 
                fontSize="9" 
                fontWeight="900" 
                textAnchor="middle"
              >
                {Math.round(prodBefore)}%
              </SvgText>

              {/* After Bar */}
              <Rect 
                x="170" 
                y={120 - (Math.min(prodAfter, 100) * 1)} 
                width="20" 
                height={Math.min(prodAfter, 100) * 1} 
                rx="3" 
                fill="#93C5FD" 
              />
              <Rect 
                x="170" 
                y={120 - (Math.min(prodAfter, 100) * 1)} 
                width="20" 
                height="6" 
                rx="1" 
                fill="#3B82F6" 
              />
              <SvgText 
                x="180" 
                y={120 - (Math.min(prodAfter, 100) * 1) - 5} 
                fill="#3B82F6" 
                fontSize="9" 
                fontWeight="900" 
                textAnchor="middle"
              >
                {Math.round(prodAfter)}%
              </SvgText>
              
              {/* Category Label */}
              <SvgText x="167" y="137" fill="#64748B" fontSize="9" fontWeight="bold" textAnchor="middle">Production</SvgText>


              {/* Pair 3: Operating Cost (Scale: relative percentage to maxCost) */}
              {/* Before Bar */}
              {(() => {
                const maxCost = Math.max(costBefore, costAfter, 1000);
                const pctBefore = (costBefore / maxCost) * 100;
                const pctAfter = (costAfter / maxCost) * 100;
                return (
                  <React.Fragment>
                    <Rect 
                      x="235" 
                      y={120 - (pctBefore * 1)} 
                      width="20" 
                      height={pctBefore * 1} 
                      rx="3" 
                      fill="#CBD5E1" 
                    />
                    <Rect 
                      x="235" 
                      y={120 - (pctBefore * 1)} 
                      width="20" 
                      height="6" 
                      rx="1" 
                      fill="#64748B" 
                    />
                    <SvgText 
                      x="245" 
                      y={120 - (pctBefore * 1) - 5} 
                      fill="#64748B" 
                      fontSize="8" 
                      fontWeight="900" 
                      textAnchor="middle"
                    >
                      {costBefore > 1000 ? `$${(costBefore / 1000).toFixed(1)}k` : `$${costBefore}`}
                    </SvgText>

                    {/* After Bar */}
                    <Rect 
                      x="260" 
                      y={120 - (pctAfter * 1)} 
                      width="20" 
                      height={pctAfter * 1} 
                      rx="3" 
                      fill="#93C5FD" 
                    />
                    <Rect 
                      x="260" 
                      y={120 - (pctAfter * 1)} 
                      width="20" 
                      height="6" 
                      rx="1" 
                      fill="#3B82F6" 
                    />
                    <SvgText 
                      x="270" 
                      y={120 - (pctAfter * 1) - 5} 
                      fill="#3B82F6" 
                      fontSize="8" 
                      fontWeight="900" 
                      textAnchor="middle"
                    >
                      {costAfter > 1000 ? `$${(costAfter / 1000).toFixed(1)}k` : `$${costAfter}`}
                    </SvgText>
                  </React.Fragment>
                );
              })()}
              
              {/* Category Label */}
              <SvgText x="257" y="137" fill="#64748B" fontSize="9" fontWeight="bold" textAnchor="middle">Daily Cost</SvgText>

            </Svg>
          </View>
        </View>

        {/* SIMULATOR EXECUTION FEED */}
        {simulation.execution_log && simulation.execution_log.length > 0 && (
          <View style={styles.logSection}>
            <View style={styles.logHeader}>
              <Ionicons name="terminal" size={14} color="#34D399" />
              <Text style={styles.logTitle}>SIMULATOR EVENT LOGGER</Text>
            </View>
            
            <View style={styles.consoleBox}>
              <ScrollView nestedScrollEnabled style={styles.logScroll}>
                {simulation.execution_log.map((log: any, idx) => (
                  <View key={idx} style={styles.logRow}>
                    <Text style={styles.logTime}>[{log.timestamp || '00:00:00'}]</Text>
                    <Text style={styles.logMsg}>{log.message || log.event || ''}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: SPACING.S16,
    marginBottom: SPACING.S16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.S16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: SPACING.S8,
  },
  panelTitle: {
    fontSize: FONT_SIZES.F12,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginLeft: SPACING.S6,
    letterSpacing: 0.5,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.S20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 6,
    padding: SPACING.S10,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.GRAY,
    marginBottom: SPACING.S8,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.S8,
  },
  stateCol: {
    alignItems: 'center',
  },
  stateLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: COLORS.GRAY,
    marginBottom: 2,
  },
  stateValue: {
    fontSize: FONT_SIZES.F16,
    fontWeight: '900',
  },
  arrowIcon: {
    marginHorizontal: 4,
    marginTop: 8,
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.S6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deltaText: {
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  logSection: {
    marginTop: SPACING.S8,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.S8,
  },
  logTitle: {
    fontSize: FONT_SIZES.F10,
    fontWeight: 'bold',
    color: '#0F172A',
    marginLeft: SPACING.S6,
    letterSpacing: 0.5,
  },
  consoleBox: {
    backgroundColor: '#0F172A',
    borderRadius: 6,
    padding: SPACING.S10,
    height: 120,
  },
  logScroll: {
    flex: 1,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  logTime: {
    color: '#64748B',
    fontSize: 9,
    fontFamily: 'monospace',
    marginRight: 6,
    lineHeight: 14,
  },
  logMsg: {
    color: '#34D399',
    fontSize: FONT_SIZES.F11,
    fontFamily: 'monospace',
    flex: 1,
    lineHeight: 14,
  },
  chartContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: SPACING.S12,
    marginBottom: SPACING.S16,
  },
  chartTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    letterSpacing: 0.5,
    marginBottom: SPACING.S8,
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.S12,
    gap: SPACING.S12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 9,
    fontWeight: '500',
    color: COLORS.GRAY,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
