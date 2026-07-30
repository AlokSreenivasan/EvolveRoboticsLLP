import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

import SurfaceCard from '../ui/SurfaceCard';

type SettingsCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Settings section surface — uses SurfaceCard so elevation follows rounded
 * corners and padding never creates a rectangular shadow frame.
 */
function SettingsCard({ children, style }: SettingsCardProps) {
  return (
    <SurfaceCard elevation="default" style={style}>
      {children}
    </SurfaceCard>
  );
}

export default SettingsCard;
