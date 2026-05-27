import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import UnauthorizedScreen from '../components/Admin/UnauthorizedScreen';
import type { RootStackParamList } from '../types/navigation';

function UnauthorizedRoute() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <UnauthorizedScreen onGoHome={() => navigation.navigate('Home')} />
  );
}

export default UnauthorizedRoute;
