import React from 'react';
import { View } from 'react-native';

/**
 * PlatformContainer for Native (iOS/Android)
 * Uses React Native View for native rendering
 */
const PlatformContainer = ({ children, style }) => {
  return (
    <View style={[{ flex: 1 }, style]}>
      {children}
    </View>
  );
};

export default PlatformContainer;
