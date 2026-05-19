import React from 'react';
import { View, Text } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

interface SectionHeaderProps {
  title: string;
  rightElement?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, rightElement }) => {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.S12,
      marginTop: SPACING.S24,
    }}>
      <Text style={{ fontSize: FONT_SIZES.F22, fontWeight: 'bold', color: COLORS.PRIMARY }}>
        {title}
      </Text>
      {rightElement && <View>{rightElement}</View>}
    </View>
  );
};
