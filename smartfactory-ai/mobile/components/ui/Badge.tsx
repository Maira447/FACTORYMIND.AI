import React from 'react';
import { View, Text } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

interface BadgeProps {
  label: string;
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'ok';
}

export const Badge: React.FC<BadgeProps> = ({ label, severity = 'ok' }) => {
  let bgColor = COLORS.SUCCESS;
  if (severity === 'critical') bgColor = COLORS.CRITICAL;
  else if (severity === 'high') bgColor = COLORS.WARNING;
  else if (severity === 'medium') bgColor = COLORS.ACCENT;
  else if (severity === 'low') bgColor = COLORS.GRAY;

  return (
    <View style={{
      backgroundColor: bgColor,
      paddingHorizontal: SPACING.S8,
      paddingVertical: SPACING.S4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    }}>
      <Text style={{ color: COLORS.WHITE, fontSize: FONT_SIZES.F12, fontWeight: 'bold' }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
};
