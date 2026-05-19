import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G, Line } from 'react-native-svg';
import { COLORS, FONT_SIZES } from '../../constants';

interface RiskGaugeProps {
  score: number;
  label?: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, label = 'Risk Score' }) => {
  const animatedScore = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedScore, {
      toValue: score,
      duration: 1200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false, // SVG strokeDashoffset and transforms don't support native driver in standard RN
    }).start();
  }, [score]);

  // SVG Dimension Constants
  const size = 200;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2;

  // Semicircle calculations (radius = 93)
  // Circumference = 2 * PI * R ≈ 584.3
  // Semicircle length = PI * R ≈ 292.17
  const semicircleLength = Math.PI * radius;

  // Gauge colors based on static zones
  const getScoreColor = (s: number) => {
    if (s <= 40) return '#2E7D32'; // Green
    if (s <= 70) return '#F57C00'; // Amber
    return '#C62828'; // Red
  };

  // Interpolate gauge fill and needle rotation
  const strokeDashoffset = animatedScore.interpolate({
    inputRange: [0, 100],
    outputRange: [semicircleLength, 0],
  });

  const needleRotation = animatedScore.interpolate({
    inputRange: [0, 100],
    outputRange: [-180, 0],
  });

  const needleColor = getScoreColor(score);

  return (
    <View style={styles.container}>
      {/* Arc SVG */}
      <Svg width={size} height={size / 2 + 16} viewBox={`0 0 ${size} ${size / 2 + 16}`}>
        <Defs>
          <LinearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#2E7D32" />
            <Stop offset="40%" stopColor="#F9A825" />
            <Stop offset="70%" stopColor="#F57C00" />
            <Stop offset="100%" stopColor="#C62828" />
          </LinearGradient>
        </Defs>

        {/* Background Grey Track */}
        <Path
          d={`M ${strokeWidth / 2} ${centerY} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${centerY}`}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Animated Active Track */}
        <AnimatedPath
          d={`M ${strokeWidth / 2} ${centerY} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${centerY}`}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${semicircleLength} ${semicircleLength}`}
          strokeDashoffset={strokeDashoffset}
        />

        {/* Gauge Center Cap / Pin */}
        <Circle cx={centerX} cy={centerY} r="8" fill="#1E3A5F" />
        <Circle cx={centerX} cy={centerY} r="4" fill="#FFFFFF" />

        {/* Animated Needle */}
        <AnimatedG rotation={needleRotation} originX={centerX} originY={centerY}>
          <Line
            x1={centerX}
            y1={centerY}
            x2={centerX - radius + 15}
            y2={centerY}
            stroke="#1E3A5F"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Needle arrow cap */}
          <Path
            d={`M ${centerX - radius + 16} ${centerY} L ${centerX - radius + 24} ${centerY - 4} L ${centerX - radius + 24} ${centerY + 4} Z`}
            fill="#1E3A5F"
          />
        </AnimatedG>
      </Svg>

      {/* Score number and label rendered BELOW the arc, no overlap */}
      <View style={styles.scoreBlock}>
        <Text style={[styles.scoreText, { color: needleColor }]}>{score}</Text>
        <Text style={styles.labelText}>{label.toUpperCase()}</Text>
      </View>
    </View>
  );
};

// Create Animated wrappers for SVG paths
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  scoreBlock: {
    alignItems: 'center',
    marginTop: 4,
  },
  scoreText: {
    fontSize: FONT_SIZES.F36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  labelText: {
    fontSize: FONT_SIZES.F10,
    fontWeight: 'bold',
    color: '#64748B',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
