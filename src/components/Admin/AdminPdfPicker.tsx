import React from 'react';
import { Text } from 'react-native';
import { FileUp } from 'lucide-react-native';

import { colors } from '../../constants/theme';
import TactileButton from '../ui/TactileButton';
import { adminStyles } from './adminStyles';

type AdminPdfPickerProps = {
  label?: string;
  statusLabel: string;
  picking: boolean;
  onPick: () => void;
};

function AdminPdfPicker({
  label = 'PDF file',
  statusLabel,
  picking,
  onPick,
}: AdminPdfPickerProps) {
  return (
    <>
      <Text style={adminStyles.fieldLabel}>{label}</Text>
      <TactileButton
        variant="ghost"
        style={adminStyles.pdfPicker}
        onPress={onPick}
        disabled={picking}
        accessibilityLabel="Choose PDF">
        <FileUp size={20} color={colors.primary} strokeWidth={2} />
        <Text style={adminStyles.pdfPickerText}>
          {picking ? 'Opening files…' : 'Choose PDF'}
        </Text>
      </TactileButton>
      <Text style={adminStyles.pdfHint}>{statusLabel}</Text>
    </>
  );
}

export default AdminPdfPicker;
