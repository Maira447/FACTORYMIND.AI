import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <View style={{
      backgroundColor: COLORS.CRITICAL,
      padding: SPACING.S12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.S16,
    }}>
      <Ionicons name="alert-circle" size={24} color={COLORS.WHITE} style={{ marginRight: SPACING.S8 }} />
      <Text style={{ color: COLORS.WHITE, flex: 1, fontSize: FONT_SIZES.F14 }}>{message}</Text>
      <TouchableOpacity onPress={() => { setVisible(false); if(onDismiss) onDismiss(); }}>
        <Ionicons name="close" size={24} color={COLORS.WHITE} />
      </TouchableOpacity>
    </View>
  );
};
