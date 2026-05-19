import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

interface CardProps {
  children: React.ReactNode;
  header?: string;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, header, onPress }) => {
  const content = (
    <>
      {header && (
        <Text style={{ fontSize: FONT_SIZES.F18, fontWeight: 'bold', color: COLORS.PRIMARY, marginBottom: SPACING.S12 }}>
          {header}
        </Text>
      )}
      {children}
    </>
  );

  const style = {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.S16,
    marginBottom: SPACING.S16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={style}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={style}>{content}</View>;
};
