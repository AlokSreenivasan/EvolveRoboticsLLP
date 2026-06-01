import React from 'react';
import { Text, TextInput, View } from 'react-native';

import { colors } from '../../constants/theme';
import { adminStyles } from './adminStyles';

type AdminFormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'number-pad';
};

function AdminFormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  autoCapitalize,
  keyboardType,
}: AdminFormFieldProps) {
  return (
    <View style={adminStyles.field}>
      <Text style={adminStyles.fieldLabel}>{label}</Text>
      <TextInput
        style={[adminStyles.input, multiline && adminStyles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
    </View>
  );
}

export default AdminFormField;
