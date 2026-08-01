import React from 'react';
import { Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';

import { buttonVariants } from '../../constants/theme';
import TactileButton from '../ui/TactileButton';
import { adminStyles } from './adminStyles';

type AdminListSectionHeaderProps = {
  /** Omit when the screen header already shows the same title. */
  title?: string;
  addLabel?: string;
  onAdd: () => void;
};

function AdminListSectionHeader({
  title,
  addLabel = 'Add',
  onAdd,
}: AdminListSectionHeaderProps) {
  return (
    <View
      style={[
        adminStyles.listSectionHeader,
        !title && adminStyles.listSectionHeaderAddOnly,
      ]}>
      {title ? <Text style={adminStyles.blockTitle}>{title}</Text> : null}
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
  );
}

export default AdminListSectionHeader;
