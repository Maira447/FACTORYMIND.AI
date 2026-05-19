import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line as SvgLine, Path, Text as SvgText, Circle } from 'react-native-svg';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { useAuthStore } from '../../store/useAuthStore';

const { width: screenWidth } = Dimensions.get('window');

// Data presets matching your references exactly
const STAT_CARDS = [
  {
    title: 'OEE Status',
    value: '84.2%',
    trend: '↑ +1.2%',
    type: 'positive',
  },
  {
    title: 'Active Lines',
    value: '26/32',
    trend: '↑ Stable',
    type: 'positive',
  },
  {
    title: 'Quality Rate',
    value: '99.1%',
    trend: '↑ +0.05%',
    type: 'positive',
  },
  {
    title: 'Energy Use',
    value: '1.2MW',
    trend: '↓ -10%',
    type: 'negative',
  },
  {
    title: 'Cycle Time',
    value: '42s',
    trend: '↓ -2s',
    type: 'negative',
  },
];

const ALERTS = [
  {
    id: 1,
    text: 'Line 4: Tool wear exceeding 85%',
    type: 'warning', // yellow
  },
  {
    id: 2,
    text: 'Line 12: Motor temperature critical',
    type: 'critical', // red
  },
  {
    id: 3,
    text: 'Line 1: Batch completed successfully',
    type: 'success', // green
  },
];

export default function DashboardScreen() {
  const { logout } = useAuthStore();

  // Mock points scaled for SVG viewbox (0 to 300 width, 0 to 120 height)
  // Scaling coordinates to simulate fluctuating factory line volume
  const lineAPath = "M 10 110 L 35 70 L 60 10 L 85 45 L 110 50 L 135 90 L 160 85 L 185 20 L 210 75 L 235 80 L 260 50 L 285 75";
  const lineBPath = "M 10 90 L 35 55 L 60 70 L 85 25 L 110 30 L 135 60 L 160 100 L 185 80 L 210 95 L 235 30 L 260 110 L 285 45";

  return (
    <ImageBackground
      source={require('../../assets/industrial_bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.blurOverlay} />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Section */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.subHeaderTitle}>Factory</Text>
            <Text style={styles.headerTitle}>Command Center</Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Cards Row (Horizontal Scroll) */}
          <View style={styles.sectionContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsScrollContainer}
            >
              {STAT_CARDS.map((stat, idx) => (
                <View key={idx} style={styles.statCard}>
                  <Text style={styles.statLabel}>{stat.title}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <View style={[
                    styles.trendBadge,
                    stat.type === 'positive' ? styles.trendBadgePositive : styles.trendBadgeNegative
                  ]}>
                    <Text style={[
                      styles.trendText,
                      stat.type === 'positive' ? styles.trendTextPositive : styles.trendTextNegative
                    ]}>
                      {stat.trend}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Real-time Production Volume Chart Card */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Ionicons name="stats-chart" size={20} color="#38BDF8" style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Real-time Production Volume</Text>
            </View>
            
            {/* SVG Native Line Chart */}
            <View style={styles.chartWrapper}>
              <Svg height="150" width="100%" viewBox="0 0 300 130">
                {/* Horizontal Gridlines */}
                <SvgLine x1="10" y1="20" x2="290" y2="20" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
                <SvgLine x1="10" y1="45" x2="290" y2="45" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
                <SvgLine x1="10" y1="70" x2="290" y2="70" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
                <SvgLine x1="10" y1="95" x2="290" y2="95" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
                <SvgLine x1="10" y1="120" x2="290" y2="120" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

                {/* Y Axis Labels */}
                <SvgText x="3" y="24" fill="rgba(255,255,255,0.4)" fontSize="8">2.5</SvgText>
                <SvgText x="3" y="49" fill="rgba(255,255,255,0.4)" fontSize="8">1.0</SvgText>
                <SvgText x="3" y="74" fill="rgba(255,255,255,0.4)" fontSize="8">0.0</SvgText>
                <SvgText x="3" y="99" fill="rgba(255,255,255,0.4)" fontSize="8">-1.0</SvgText>
                <SvgText x="3" y="124" fill="rgba(255,255,255,0.4)" fontSize="8">-2.0</SvgText>

                {/* Scaled Lines */}
                {/* Line A (Light blue) */}
                <Path d={lineAPath} fill="none" stroke="#38BDF8" strokeWidth="2.5" />
                {/* Line B (Dark/Royal blue) */}
                <Path d={lineBPath} fill="none" stroke="#2563EB" strokeWidth="2" strokeDasharray="2,2" />
                
                {/* Visual Circle Markers on spikes */}
                <Circle cx="60" cy="10" r="4" fill="#38BDF8" />
                <Circle cx="185" cy="20" r="4" fill="#38BDF8" />
                <Circle cx="260" cy="110" r="4" fill="#2563EB" />
              </Svg>
            </View>

            {/* Legends */}
            <View style={styles.chartLegendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { backgroundColor: '#38BDF8' }]} />
                <Text style={styles.legendText}>Line A</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { backgroundColor: '#2563EB', borderRadius: 0 }]} />
                <Text style={styles.legendText}>Line B</Text>
              </View>
            </View>
          </View>

          {/* System Alerts Card */}
          <View style={styles.alertsCard}>
            <View style={styles.alertsHeader}>
              <Ionicons name="notifications" size={20} color="#FFAB40" style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>System Alerts</Text>
            </View>

            <View style={styles.alertsList}>
              {ALERTS.map((alert) => {
                let bg = 'rgba(234, 179, 8, 0.12)';
                let border = 'rgba(234, 179, 8, 0.25)';
                let textColor = '#FEF08A';

                if (alert.type === 'critical') {
                  bg = 'rgba(239, 68, 68, 0.12)';
                  border = 'rgba(239, 68, 68, 0.25)';
                  textColor = '#FCA5A5';
                } else if (alert.type === 'success') {
                  bg = 'rgba(34, 197, 94, 0.12)';
                  border = 'rgba(34, 197, 94, 0.25)';
                  textColor = '#86EFAC';
                }

                return (
                  <View 
                    key={alert.id} 
                    style={[
                      styles.alertBadge, 
                      { backgroundColor: bg, borderColor: border }
                    ]}
                  >
                    <Text style={[styles.alertText, { color: textColor }]}>
                      {alert.text}
                    </Text>
                  </View>
                );
              })}
            </View>
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
    backgroundColor: 'rgba(15, 23, 42, 0.72)', // Balanced dark tint for readability
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: '#38BDF8', // Elegant cyan-blue matching dashboard
    fontSize: FONT_SIZES.F22,
    fontWeight: '800',
  },
  navButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navButton: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  logoutButton: {
    backgroundColor: '#EF4444', // Dark Red-Orange
    borderColor: '#EF4444',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    paddingVertical: SPACING.S16,
    gap: SPACING.S16,
  },
  sectionContainer: {
    width: '100%',
  },
  statsScrollContainer: {
    paddingHorizontal: SPACING.S20,
    gap: 12,
  },
  statCard: {
    width: 125,
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: SPACING.S12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: FONT_SIZES.F11,
    fontWeight: '600',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.F22,
    fontWeight: '800',
    marginVertical: 4,
  },
  trendBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  trendBadgePositive: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  trendBadgeNegative: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  trendText: {
    fontSize: FONT_SIZES.F11,
    fontWeight: '700',
  },
  trendTextPositive: {
    color: '#4ADE80',
  },
  trendTextNegative: {
    color: '#FCA5A5',
  },
  chartCard: {
    marginHorizontal: SPACING.S20,
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: SPACING.S16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.S16,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.F16,
    fontWeight: '700',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  chartLegendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIndicator: {
    width: 12,
    height: 4,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    color: '#94A3B8',
    fontSize: FONT_SIZES.F11,
    fontWeight: '600',
  },
  alertsCard: {
    marginHorizontal: SPACING.S20,
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: SPACING.S16,
    marginBottom: SPACING.S12,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.S16,
  },
  alertsList: {
    gap: 10,
  },
  alertBadge: {
    borderWidth: 1,
    borderRadius: 10,
    padding: SPACING.S12,
  },
  alertText: {
    fontSize: FONT_SIZES.F13,
    fontWeight: '600',
  },
});
