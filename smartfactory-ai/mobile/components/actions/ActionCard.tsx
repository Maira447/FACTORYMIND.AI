import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { Action, ActionStep } from '../../types';

interface ActionCardProps {
  action: Action;
  steps?: ActionStep[];
  onViewSimulation?: (actionId: string) => void;
}

const PRIORITY_THEMES = {
  1: { label: 'CRITICAL', color: '#C62828' },
  2: { label: 'HIGH', color: '#F57C00' },
  3: { label: 'MEDIUM', color: '#F9A825' },
  4: { label: 'LOW', color: '#2E7D32' },
};

export const ActionCard: React.FC<ActionCardProps> = ({ action, steps = [], onViewSimulation }) => {
  const [expanded, setExpanded] = useState(false);
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

  // Format currency
  const formatCost = (val: number, curr = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const priorityTheme = PRIORITY_THEMES[action.priority as keyof typeof PRIORITY_THEMES] || PRIORITY_THEMES[4];

  // Sorting steps by order
  let sortedSteps = [...steps]
    .filter(s => s.action_id === action.id || s.action_id === action.action_code)
    .sort((a, b) => a.step_order - b.step_order);

  // Fallback to local action steps if empty (often generated directly by action planner agent)
  if (sortedSteps.length === 0 && action.steps && Array.isArray(action.steps)) {
    sortedSteps = action.steps.map((desc: string, idx: number) => ({
      id: `${action.id}-step-${idx}`,
      action_id: action.id,
      step_order: idx + 1,
      description: desc,
      target_actor: action.category?.toLowerCase() === 'maintenance' ? 'Maintenance Tech' : 'Operator',
      estimated_duration_min: 15 + idx * 10
    }));
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.card}>
        
        {/* Header Metadata */}
        <View style={styles.header}>
          <View style={[styles.priorityBadge, { backgroundColor: priorityTheme.color }]}>
            <Text style={styles.priorityText}>P{action.priority} - {priorityTheme.label}</Text>
          </View>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{action.category.toUpperCase()}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{action.title}</Text>
        <Text style={styles.description}>{action.description}</Text>

        {/* Quick Metrics (Effort & Cost) */}
        <View style={styles.metricsRow}>
          
          <View style={styles.metricBlock}>
            <Ionicons name="time-outline" size={16} color={COLORS.GRAY} />
            <View style={styles.metricInfo}>
              <Text style={styles.metricLabel}>Effort Required</Text>
              <Text style={styles.metricValue}>{action.effort_hours} Hours</Text>
            </View>
          </View>

          <View style={styles.metricBlock}>
            <Ionicons name="cash-outline" size={16} color={COLORS.GRAY} />
            <View style={styles.metricInfo}>
              <Text style={styles.metricLabel}>Estimated Cost</Text>
              <Text style={styles.metricValue}>{formatCost(action.cost_estimate, action.currency)}</Text>
            </View>
          </View>

        </View>

        {/* System Reference Tag */}
        {action.target_system && (
          <View style={styles.systemTag}>
            <Ionicons name="server-outline" size={12} color={COLORS.GRAY} style={{ marginRight: 4 }} />
            <Text style={styles.systemTagText}>Target System: {action.target_system}</Text>
          </View>
        )}

        {/* Action Steps Checklist Section */}
        {sortedSteps.length > 0 && (
          <View style={styles.stepsSection}>
            <TouchableOpacity 
              style={styles.expandHeader} 
              onPress={() => setExpanded(!expanded)}
              activeOpacity={0.7}
            >
              <Text style={styles.stepsTitle}>Checklist ({sortedSteps.length} Steps)</Text>
              <Ionicons 
                name={expanded ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color={COLORS.PRIMARY} 
              />
            </TouchableOpacity>

            {expanded && (
              <View style={styles.stepsList}>
                {sortedSteps.map((step, idx) => (
                  <View key={step.id || idx} style={styles.stepRow}>
                    <View style={styles.stepNumberCircle}>
                      <Text style={styles.stepNumberText}>{step.step_order}</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepDesc}>{step.description}</Text>
                      <View style={styles.stepMetaRow}>
                        <Text style={styles.stepActor}>Actor: {step.target_actor}</Text>
                        <Text style={styles.stepDuration}>Est: {step.estimated_duration_min}m</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Action Buttons Footer */}
        {onViewSimulation && (
          <TouchableOpacity 
            style={styles.simulateButton} 
            onPress={() => onViewSimulation(action.id)}
            activeOpacity={0.8}
          >
            <Ionicons name="analytics" size={16} color={COLORS.WHITE} style={{ marginRight: 6 }} />
            <Text style={styles.simulateButtonText}>View Impact Simulation</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.S12,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.S8,
    paddingVertical: SPACING.S4,
    borderRadius: 4,
  },
  priorityText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.F10,
    fontWeight: 'bold',
  },
  categoryChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: SPACING.S8,
    paddingVertical: SPACING.S4,
    borderRadius: 12,
  },
  categoryText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.F10,
    fontWeight: 'bold',
  },
  title: {
    fontSize: FONT_SIZES.F16,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: SPACING.S6,
  },
  description: {
    fontSize: FONT_SIZES.F14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: SPACING.S16,
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.S12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: SPACING.S12,
  },
  metricBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricInfo: {
    marginLeft: SPACING.S8,
  },
  metricLabel: {
    fontSize: FONT_SIZES.F10,
    color: COLORS.GRAY,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: FONT_SIZES.F13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  systemTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.S16,
  },
  systemTagText: {
    fontSize: FONT_SIZES.F11,
    color: COLORS.GRAY,
    fontWeight: '500',
  },
  stepsSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: SPACING.S12,
  },
  expandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepsTitle: {
    fontSize: FONT_SIZES.F13,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  stepsList: {
    marginTop: SPACING.S12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.S12,
  },
  stepNumberCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.S10,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: FONT_SIZES.F11,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  stepContent: {
    flex: 1,
  },
  stepDesc: {
    fontSize: FONT_SIZES.F13,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 4,
  },
  stepMetaRow: {
    flexDirection: 'row',
  },
  stepActor: {
    fontSize: FONT_SIZES.F10,
    color: COLORS.GRAY,
    marginRight: SPACING.S12,
    fontWeight: '500',
  },
  stepDuration: {
    fontSize: FONT_SIZES.F10,
    color: COLORS.GRAY,
    fontWeight: '500',
  },
  simulateButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.ACCENT,
    paddingVertical: SPACING.S10,
    borderRadius: 6,
    marginTop: SPACING.S16,
  },
  simulateButtonText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.F13,
    fontWeight: 'bold',
  },
});
