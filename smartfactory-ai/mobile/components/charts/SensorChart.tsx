import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line, Text as SvgText, Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';


export interface SensorReading {
  timestamp: string;
  torque: number;
  rpm: number;
  temp: number;
  tool_wear: number;
}

interface SensorChartProps {
  readings: SensorReading[];
  metric: 'torque' | 'rpm' | 'temp' | 'tool_wear';
}

const METRIC_DETAILS = {
  torque: { label: 'Torque', unit: 'Nm', color: '#1E3A5F', threshold: 58 },
  rpm: { label: 'Rotational Speed', unit: 'RPM', color: '#1E3A5F', threshold: 2400 },
  temp: { label: 'Air Temperature', unit: 'K', color: '#1E3A5F', threshold: 302.2 },
  tool_wear: { label: 'Tool Wear', unit: 'min', color: '#1E3A5F', threshold: 195 },
};

export const SensorChart: React.FC<SensorChartProps> = ({ readings = [], metric }) => {
  // If no readings, show simple placeholder
  if (!readings || readings.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>No telemetry data available</Text>
      </View>
    );
  }

  const detail = METRIC_DETAILS[metric];

  // Graph dimensions
  const width = 330;
  const height = 160;
  const paddingLeft = 40;
  const paddingBottom = 25;
  const paddingTop = 15;
  const paddingRight = 10;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Retrieve values
  const values = readings.map(r => r[metric] || 0);
  const maxVal = Math.max(...values, detail.threshold);
  const minVal = Math.min(...values);

  // Pad min and max values to keep graph centered beautifully
  const valRange = maxVal - minVal;
  const yMax = maxVal + valRange * 0.15;
  const yMin = Math.max(0, minVal - valRange * 0.15);
  const yRange = yMax - yMin;

  // Check if any reading exceeds the threshold (anomaly detection)
  const isAnomaly = values.some(v => v >= detail.threshold);

  // Generate SVG Coordinate Points
  const points = readings.map((reading, idx) => {
    const val = reading[metric] || 0;
    const x = paddingLeft + (idx / (readings.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((val - yMin) / yRange) * chartHeight;
    return { x, y };
  });

  // Build Line Path
  let linePath = '';
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      linePath += ` L ${points[i].x} ${points[i].y}`;
    }
  }

  // Build Gradient Area Path
  let areaPath = '';
  if (points.length > 0) {
    const bottomY = paddingTop + chartHeight;
    areaPath = `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
  }

  // Threshold Y position
  const thresholdY = paddingTop + chartHeight - ((detail.threshold - yMin) / yRange) * chartHeight;

  // Y-axis grid ticks
  const ticksCount = 4;
  const yTicks = Array.from({ length: ticksCount }, (_, idx) => {
    const val = yMin + (idx / (ticksCount - 1)) * yRange;
    const y = paddingTop + chartHeight - (idx / (ticksCount - 1)) * chartHeight;
    return { label: val.toFixed(1), y };
  });

  // X-axis ticks (select up to 3 timestamps to show)
  const xTicksIndices = [0, Math.floor(readings.length / 2), readings.length - 1];
  const xTicks = xTicksIndices.map(idx => {
    if (idx < 0 || idx >= readings.length) return null;
    const item = readings[idx];
    const x = paddingLeft + (idx / (readings.length - 1)) * chartWidth;
    
    // Formatting time
    let timeLabel = '';
    try {
      const d = new Date(item.timestamp);
      timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      timeLabel = `T${idx}`;
    }
    return { label: timeLabel, x };
  }).filter(Boolean);

  return (
    <View style={styles.container}>
      <View style={styles.chartTitleRow}>
        <Text style={styles.chartTitle}>{detail.label} ({detail.unit})</Text>
        {isAnomaly && (
          <View style={styles.anomalyBadge}>
            <Text style={styles.anomalyBadgeText}>THRESHOLD CRITICAL</Text>
          </View>
        )}
      </View>

      <View style={styles.svgWrapper}>
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#1E3A5F" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#1E3A5F" stopOpacity="0.00" />
            </LinearGradient>
          </Defs>

          {/* Grid lines & Y-axis labels */}
          {yTicks.map((tick, idx) => (
            <React.Fragment key={idx}>
              <Line
                x1={paddingLeft}
                y1={tick.y}
                x2={width - paddingRight}
                y2={tick.y}
                stroke="#E2E8F0"
                strokeWidth="1"
                strokeDasharray="2 4"
              />
              <SvgText
                x={paddingLeft - 8}
                y={tick.y + 4}
                fill="#64748B"
                fontSize={FONT_SIZES.F10}
                fontWeight="bold"
                textAnchor="end"
              >
                {tick.label}
              </SvgText>
            </React.Fragment>
          ))}

          {/* Semicolumn Anomaly Threshold Dash Line */}
          {thresholdY >= paddingTop && thresholdY <= paddingTop + chartHeight && (
            <React.Fragment>
              <Line
                x1={paddingLeft}
                y1={thresholdY}
                x2={width - paddingRight}
                y2={thresholdY}
                stroke="#F57C00"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <SvgText
                x={width - paddingRight - 4}
                y={thresholdY - 4}
                fill="#F57C00"
                fontSize="8"
                fontWeight="bold"
                textAnchor="end"
              >
                WARN LIMIT: {detail.threshold}
              </SvgText>
            </React.Fragment>
          )}

          {/* Filled Area beneath line */}
          {areaPath !== '' && (
            <Path d={areaPath} fill="url(#chartGradient)" />
          )}

          {/* Primary Navy Stroke Line */}
          {linePath !== '' && (
            <Path
              d={linePath}
              fill="none"
              stroke="#1E3A5F"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Highlight Circles for readings */}
          {points.map((point, idx) => {
            const val = readings[idx][metric];
            const isPointAnomaly = val >= detail.threshold;
            
            // Only draw circles for anomaly points and endpoints for clean look
            if (isPointAnomaly || idx === 0 || idx === readings.length - 1) {
              return (
                <Circle
                  key={idx}
                  cx={point.x}
                  cy={point.y}
                  r={isPointAnomaly ? 4.5 : 3.5}
                  fill={isPointAnomaly ? '#C62828' : '#1E3A5F'}
                  stroke="#FFFFFF"
                  strokeWidth="1"
                />
              );
            }
            return null;
          })}

          {/* X-axis baseline */}
          <Line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={width - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="#94A3B8"
            strokeWidth="1"
          />

          {/* X-axis labels */}
          {xTicks.map((tick: any, idx) => (
            <React.Fragment key={idx}>
              <Line
                x1={tick.x}
                y1={paddingTop + chartHeight}
                x2={tick.x}
                y2={paddingTop + chartHeight + 4}
                stroke="#94A3B8"
                strokeWidth="1"
              />
              <SvgText
                x={tick.x}
                y={paddingTop + chartHeight + 14}
                fill="#64748B"
                fontSize={FONT_SIZES.F8}
                fontWeight="bold"
                textAnchor="middle"
              >
                {tick.label}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: SPACING.S12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    marginVertical: SPACING.S8,
  },
  emptyContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.GRAY,
    fontSize: FONT_SIZES.F13,
  },
  chartTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.S8,
  },
  chartTitle: {
    fontSize: FONT_SIZES.F12,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  anomalyBadge: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderWidth: 0.5,
    paddingHorizontal: SPACING.S6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  anomalyBadgeText: {
    color: '#C62828',
    fontSize: 8,
    fontWeight: 'bold',
  },
  svgWrapper: {
    width: '100%',
    alignItems: 'center',
  },
});
