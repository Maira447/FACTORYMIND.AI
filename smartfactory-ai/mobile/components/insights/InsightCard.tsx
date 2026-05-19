import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { Insight } from '../../types';

interface InsightCardProps {
  insight: Insight;
}

const SEVERITY_COLORS = {
  critical: '#C62828',
  high: '#F57C00',
  medium: '#F9A825',
  low: '#2E7D32',
};

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
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

  const severity = (insight?.severity || 'medium').toLowerCase();
  const category = insight?.category || 'general';
  const title = insight?.title || 'Telemetry Pattern Identified';
  const description = insight?.description || '';
  const confidence = typeof insight?.confidence === 'number' ? insight.confidence : 0.85;

  const severityColor = SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || COLORS.GRAY;

  const renderJson = (obj: any, depth = 0): React.ReactNode => {
    if (!obj || typeof obj !== 'object') {
      return <Text style={styles.jsonValue}>{String(obj)}</Text>;
    }

    return Object.entries(obj).map(([key, val]) => (
      <View key={key} style={[styles.jsonRow, { paddingLeft: depth * 12 }]}>
        <Text style={styles.jsonKey}>{key}: </Text>
        {typeof val === 'object' ? (
          <View style={{ flex: 1 }}>
            <Text style={styles.jsonValue}>{Array.isArray(val) ? '[...]' : '{...}'}</Text>
            {renderJson(val, depth + 1)}
          </View>
        ) : (
          <Text style={styles.jsonValue}>{String(val)}</Text>
        )}
      </View>
    ));
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.card, { borderLeftColor: severityColor }]}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <View style={[styles.badge, { backgroundColor: severityColor + '15' }]}>
              <Text style={[styles.badgeText, { color: severityColor }]}>
                {severity.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.category}>{category.replace('_', ' ').toUpperCase()}</Text>
        </View>

        {/* Description */}
        <Text style={styles.description}>{description}</Text>

        {/* Confidence Gauge */}
        <View style={styles.confidenceSection}>
          <View style={styles.confidenceHeader}>
            <Text style={styles.confidenceLabel}>Confidence</Text>
            <Text style={[styles.confidenceValue, { color: severityColor }]}>
              {Math.round(confidence * 100)}%
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${confidence * 100}%`, backgroundColor: severityColor }
              ]} 
            />
          </View>
        </View>

        {/* Machine ID Tag */}
        {insight.machine_id && (
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Ionicons name="hardware-chip-outline" size={12} color={COLORS.GRAY} />
              <Text style={styles.tagText}>{insight.machine_id}</Text>
            </View>
          </View>
        )}

        {/* Collapsible Evidence JSON */}
        {insight.evidence && Object.keys(insight.evidence).length > 0 && (
          <View style={styles.collapsibleContainer}>
            <TouchableOpacity 
              style={styles.expandButton} 
              onPress={() => setExpanded(!expanded)}
              activeOpacity={0.7}
            >
              <Text style={styles.expandButtonText}>
                {expanded ? 'Hide Diagnostic Evidence' : 'Show Diagnostic Evidence'}
              </Text>
              <Ionicons 
                name={expanded ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color={COLORS.PRIMARY} 
              />
            </TouchableOpacity>

            {expanded && (
              <View style={styles.evidencePanel}>
                <Text style={styles.evidenceHeaderTitle}>Raw Diagnostic Payload (JSONB):</Text>
                <View style={styles.jsonConsole}>
                  {renderJson(insight.evidence)}
                </View>
              </View>
            )}
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
    borderLeftWidth: 5,
    padding: SPACING.S16,
    marginBottom: SPACING.S16,
    // Native shadow
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    marginBottom: SPACING.S8,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: FONT_SIZES.F16,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    flex: 1,
    marginRight: SPACING.S8,
  },
  badge: {
    paddingHorizontal: SPACING.S8,
    paddingVertical: SPACING.S4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: FONT_SIZES.F10,
    fontWeight: 'bold',
  },
  category: {
    fontSize: FONT_SIZES.F10,
    fontWeight: 'bold',
    color: COLORS.GRAY,
    marginTop: SPACING.S4,
  },
  description: {
    fontSize: FONT_SIZES.F14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: SPACING.S12,
  },
  confidenceSection: {
    marginBottom: SPACING.S12,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.S4,
  },
  confidenceLabel: {
    fontSize: FONT_SIZES.F12,
    color: COLORS.GRAY,
    fontWeight: '500',
  },
  confidenceValue: {
    fontSize: FONT_SIZES.F12,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.S12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: SPACING.S8,
    paddingVertical: SPACING.S4,
    borderRadius: 4,
    marginRight: SPACING.S8,
  },
  tagText: {
    fontSize: FONT_SIZES.F11,
    color: '#475569',
    marginLeft: SPACING.S4,
    fontWeight: '500',
  },
  collapsibleContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: SPACING.S12,
  },
  expandButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: FONT_SIZES.F12,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  evidencePanel: {
    marginTop: SPACING.S12,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    padding: SPACING.S12,
  },
  evidenceHeaderTitle: {
    fontSize: FONT_SIZES.F10,
    color: '#94A3B8',
    fontWeight: 'bold',
    marginBottom: SPACING.S8,
  },
  jsonConsole: {
    // Monospace style is already applied to individual Text lines
  },
  jsonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  jsonKey: {
    fontSize: FONT_SIZES.F11,
    color: '#38BDF8',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  jsonValue: {
    fontSize: FONT_SIZES.F11,
    color: '#34D399',
    fontFamily: 'monospace',
    flex: 1,
  },
});
