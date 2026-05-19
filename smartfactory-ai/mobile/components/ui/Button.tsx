import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary', isLoading, disabled }) => {
  let bgColor = COLORS.PRIMARY;
  let textColor = COLORS.WHITE;

  if (variant === 'secondary') {
    bgColor = COLORS.ACCENT;
  } else if (variant === 'danger') {
    bgColor = COLORS.CRITICAL;
  } else if (variant === 'ghost') {
    bgColor = 'transparent';
    textColor = COLORS.PRIMARY;
  }

  if (disabled) {
    bgColor = COLORS.GRAY;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={{
        backgroundColor: bgColor,
        paddingVertical: SPACING.S12,
        paddingHorizontal: SPACING.S24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      }}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} style={{ marginRight: SPACING.S8 }} />
      ) : null}
      <Text style={{ color: textColor, fontSize: FONT_SIZES.F16, fontWeight: 'bold' }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
