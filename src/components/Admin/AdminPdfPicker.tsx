import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { FileUp } from 'lucide-react-native';

import { colors } from '../../constants/theme';
import { adminStyles } from './adminStyles';

type AdminPdfPickerProps = {
  statusLabel: string;
  picking: boolean;
  onPick: () => void;
};

function AdminPdfPicker({ statusLabel, picking, onPick }: AdminPdfPickerProps) {
  return (
    <>
      <Text style={adminStyles.fieldLabel}>PDF file</Text>
      <TouchableOpacity
        style={adminStyles.pdfPicker}
        onPress={onPick}
        disabled={picking}
        activeOpacity={0.85}>
        <FileUp size={20} color={colors.primary} strokeWidth={2} />
        <Text style={adminStyles.pdfPickerText}>
          {picking ? 'Opening files…' : 'Choose PDF'}
        </Text>
      </TouchableOpacity>
      <Text style={adminStyles.pdfHint}>{statusLabel}</Text>
    </>
  );
}

export default AdminPdfPicker;
