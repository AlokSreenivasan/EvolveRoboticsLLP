import React from 'react';
import { Text, View } from 'react-native';
import { Plus, Settings } from 'lucide-react-native';

import { buttonVariants } from '../../constants/theme';
import TactileButton from '../ui/TactileButton';
import AdminIconButton from './AdminIconButton';
import { adminStyles } from './adminStyles';

type AdminListSectionHeaderProps = {
  /** Omit when the screen header already shows the same title. */
  title?: string;
  addLabel?: string;
  onAdd: () => void;
  /** Opens section heading / settings editor when provided. */
  onSettingsPress?: () => void;
  settingsAccessibilityLabel?: string;
};

function AdminListSectionHeader({
  title,
  addLabel = 'Add',
  onAdd,
  onSettingsPress,
  settingsAccessibilityLabel = 'Edit section headings',
}: AdminListSectionHeaderProps) {
  return (
    <View
      style={[
        adminStyles.listSectionHeader,
        !title && adminStyles.listSectionHeaderAddOnly,
      ]}>
      {title ? (
        <Text style={adminStyles.listSectionHeaderTitle}>{title}</Text>
      ) : null}
      <View style={adminStyles.listSectionHeaderActions}>
        {onSettingsPress ? (
          <AdminIconButton
            icon={Settings}
            onPress={onSettingsPress}
            accessibilityLabel={settingsAccessibilityLabel}
          />
        ) : null}
        <TactileButton
          style={adminStyles.addButton}
          onPress={onAdd}
          accessibilityLabel={addLabel}>
          <Plus
            size={18}
            color={buttonVariants.primary.text}
            strokeWidth={2.5}
          />
          <Text style={adminStyles.addButtonText}>{addLabel}</Text>
        </TactileButton>
      </View>
    </View>
  );
}

export default AdminListSectionHeader;
