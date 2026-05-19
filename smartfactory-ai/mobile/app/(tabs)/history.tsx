import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

const MOCK_HISTORY = [
  {
    id: '1',
    name: 'Turbine Vibration Analysis',
    date: '2026-05-18 14:22',
    status: 'completed',
    result: 'Anomaly detected: Bearing wear expected in 48 hours.',
  },
  {
    id: '2',
    name: 'Hydraulic Pressure Audit',
    date: '2026-05-18 10:05',
    status: 'analyzing',
    result: 'Multi-agent diagnostic executing...',
  },
  {
    id: '3',
    name: 'Conveyor Speed Optimization',
    date: '2026-05-17 18:30',
    status: 'completed',
    result: 'Healthy: System operating within safe parameters.',
  },
  {
    id: '4',
    name: 'Pneumatic Valve Integrity Check',
    date: '2026-05-17 11:12',
    status: 'failed',
    result: 'Data ingest error: Missing speed parameters.',
  },
];

export default function HistoryScreen() {
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
          <Text style={styles.subHeaderTitle}>Execution Logs</Text>
          <Text style={styles.headerTitle}>Analysis History</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.historyList}>
            {MOCK_HISTORY.map((item) => {
              let statusIcon = 'checkmark-circle';
              let statusColor = '#4ADE80';
              let statusText = 'Completed';

              if (item.status === 'analyzing') {
                statusIcon = 'sync';
                statusColor = '#38BDF8';
                statusText = 'Analyzing';
              } else if (item.status === 'failed') {
                statusIcon = 'close-circle';
                statusColor = '#FCA5A5';
                statusText = 'Failed';
              }

              return (
                <View key={item.id} style={styles.historyCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleWrapper}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <Text style={styles.cardDate}>{item.date}</Text>
                    </View>
                    
                    <View style={[styles.statusBadge, { borderColor: statusColor }]}>
                      {item.status === 'analyzing' ? (
                        <Ionicons name="sync" size={12} color={statusColor} style={styles.spinIcon} />
                      ) : (
                        <Ionicons name={statusIcon as any} size={12} color={statusColor} style={{ marginRight: 4 }} />
                      )}
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {statusText}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>{item.result}</Text>
                  </View>
                </View>
              );
            })}
          </View>
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
    paddingVertical: SPACING.S16,
    paddingHorizontal: SPACING.S20,
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: SPACING.S16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: SPACING.S12,
  },
  titleWrapper: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.F16,
    fontWeight: '700',
  },
  cardDate: {
    color: '#64748B',
    fontSize: FONT_SIZES.F12,
    marginTop: 2,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  spinIcon: {
    marginRight: 4,
  },
  resultContainer: {
    marginTop: SPACING.S12,
  },
  resultText: {
    color: '#94A3B8',
    fontSize: FONT_SIZES.F14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
