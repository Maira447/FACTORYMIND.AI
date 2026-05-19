import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

interface LoadingSpinnerProps {
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ label }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      {label && (
        <Text style={{ marginTop: SPACING.S12, color: COLORS.GRAY, fontSize: FONT_SIZES.F14 }}>
          {label}
        </Text>
      )}
    </View>
  );
};
