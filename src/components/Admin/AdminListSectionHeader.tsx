import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Plus } from 'lucide-react-native';

import { adminStyles } from './adminStyles';

type AdminListSectionHeaderProps = {
  title: string;
  addLabel?: string;
  onAdd: () => void;
};

function AdminListSectionHeader({
  title,
  addLabel = 'Add',
  onAdd,
}: AdminListSectionHeaderProps) {
  return (
    <View style={adminStyles.listSectionHeader}>
      <Text style={adminStyles.blockTitle}>{title}</Text>
      <TouchableOpacity
        style={adminStyles.addButton}
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel={addLabel}>
        <Plus size={18} color="#fff" strokeWidth={2.5} />
        <Text style={adminStyles.addButtonText}>{addLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default AdminListSectionHeader;
