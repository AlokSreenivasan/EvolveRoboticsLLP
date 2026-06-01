import React from 'react';
import { View } from 'react-native';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react-native';

import AdminIconButton from './AdminIconButton';
import { adminStyles } from './adminStyles';

type AdminListRowActionsProps = {
  index: number;
  itemCount: number;
  reordering: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function AdminListRowActions({
  index,
  itemCount,
  reordering,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: AdminListRowActionsProps) {
  return (
    <View style={adminStyles.listRowActions}>
      <AdminIconButton
        icon={ArrowUp}
        disabled={index === 0 || reordering}
        onPress={onMoveUp}
      />
      <AdminIconButton
        icon={ArrowDown}
        disabled={index === itemCount - 1 || reordering}
        onPress={onMoveDown}
      />
      <AdminIconButton icon={Pencil} onPress={onEdit} />
      <AdminIconButton icon={Trash2} onPress={onDelete} danger />
    </View>
  );
}

export default AdminListRowActions;
