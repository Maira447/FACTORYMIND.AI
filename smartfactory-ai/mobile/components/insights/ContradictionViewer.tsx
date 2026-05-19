import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { Contradiction } from '../../types';

interface ContradictionViewerProps {
  contradiction: Contradiction;
}

export const ContradictionViewer: React.FC<ContradictionViewerProps> = ({ contradiction }) => {
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

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.card}>
        
        {/* Top Header Row */}
        <View style={styles.header}>
          <View style={styles.fieldBadge}>
            <Ionicons name="git-compare-outline" size={14} color={COLORS.PRIMARY} />
            <Text style={styles.fieldBadgeText}>{(contradiction.field_name || 'parameter').toUpperCase()}</Text>
          </View>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>
              {Math.round((contradiction.confidence || 0) * 100)}% Match Confidence
            </Text>
          </View>
        </View>

        {/* Dynamic 2-Column Comparison Layout */}
        <View style={styles.comparisonGrid}>
          
          {/* Source A Column */}
          <View style={styles.column}>
            <Text style={styles.sourceLabel}>SOURCE A</Text>
            <Text style={styles.sourceName}>{contradiction.source_a_name || 'Telemetry Stream'}</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.sourceValue}>{String(contradiction.source_a_value ?? 'N/A')}</Text>
            </View>
            <Text style={styles.sourceTime}>
              <Ionicons name="time-outline" size={10} color={COLORS.GRAY} /> {formatDate(contradiction.source_a_timestamp)}
            </Text>
          </View>

          {/* Central Conflict Visualizer */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <View style={styles.conflictCircle}>
              <Text style={styles.conflictTextCenter}>VS</Text>
            </View>
            <View style={styles.dividerLine} />
          </View>

          {/* Source B Column */}
          <View style={styles.column}>
            <Text style={styles.sourceLabel}>SOURCE B</Text>
            <Text style={styles.sourceName}>{contradiction.source_b_name || 'Human Log'}</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.sourceValue}>{String(contradiction.source_b_value ?? 'N/A')}</Text>
            </View>
            <Text style={styles.sourceTime}>
              <Ionicons name="time-outline" size={10} color={COLORS.GRAY} /> {formatDate(contradiction.source_b_timestamp)}
            </Text>
          </View>

        </View>

        {/* Central Conflict Red Label */}
        <View style={styles.alertLabelContainer}>
          <Ionicons name="warning" size={16} color={COLORS.CRITICAL} />
          <Text style={styles.alertLabel}>DETECTED ANOMALOUS DISCREPANCY</Text>
        </View>

        {/* Resolution Banner */}
        <View style={styles.resolutionContainer}>
          <View style={styles.resolutionHeader}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.SUCCESS} />
            <Text style={styles.resolutionTitle}>AI AGENT ORCHESTRATED RESOLUTION</Text>
          </View>
          <Text style={styles.resolutionBody}>{contradiction.resolution || 'Discrepancy analyzed.'}</Text>
        </View>

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
    marginBottom: SPACING.S16,
  },
  fieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: SPACING.S8,
    paddingVertical: SPACING.S4,
    borderRadius: 4,
  },
  fieldBadgeText: {
    fontSize: FONT_SIZES.F10,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginLeft: SPACING.S4,
  },
  confidenceBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: SPACING.S8,
    paddingVertical: SPACING.S4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: FONT_SIZES.F10,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  comparisonGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: SPACING.S16,
  },
  column: {
    flex: 1,
    padding: SPACING.S12,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },
  sourceLabel: {
    fontSize: FONT_SIZES.F10,
    color: COLORS.GRAY,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: SPACING.S4,
  },
  sourceName: {
    fontSize: FONT_SIZES.F12,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    textAlign: 'center',
    marginBottom: SPACING.S8,
    height: 32, // Consistent height for wrap
  },
  valueContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 4,
    paddingHorizontal: SPACING.S12,
    paddingVertical: SPACING.S8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.S8,
  },
  sourceValue: {
    fontSize: FONT_SIZES.F14,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  sourceTime: {
    fontSize: FONT_SIZES.F10,
    color: COLORS.GRAY,
    textAlign: 'center',
  },
  dividerContainer: {
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dividerLine: {
    width: 1,
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  conflictCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.CRITICAL,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.S8,
  },
  conflictTextCenter: {
    fontSize: FONT_SIZES.F10,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  alertLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderWidth: 1,
    borderRadius: 6,
    padding: SPACING.S8,
    marginBottom: SPACING.S16,
  },
  alertLabel: {
    fontSize: FONT_SIZES.F11,
    fontWeight: 'bold',
    color: COLORS.CRITICAL,
    marginLeft: SPACING.S6,
  },
  resolutionContainer: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
    borderWidth: 1,
    borderRadius: 6,
    padding: SPACING.S12,
  },
  resolutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.S6,
  },
  resolutionTitle: {
    fontSize: FONT_SIZES.F11,
    fontWeight: 'bold',
    color: COLORS.SUCCESS,
    marginLeft: SPACING.S6,
  },
  resolutionBody: {
    fontSize: FONT_SIZES.F13,
    color: '#166534',
    lineHeight: 18,
  },
});
