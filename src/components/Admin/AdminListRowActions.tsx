import React from 'react';
import { View } from 'react-native';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react-native';

import AdminIconButton from './AdminIconButton';
import { adminStyles } from './adminStyles';

type AdminListRowActionsProps = {
  index?: number;
  itemCount?: number;
  reordering?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function AdminListRowActions({
  index = 0,
  itemCount = 0,
  reordering = false,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: AdminListRowActionsProps) {
  const showReorder = onMoveUp != null && onMoveDown != null;

  return (
    <View style={adminStyles.listRowActions}>
      {showReorder ? (
        <>
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
        </>
      ) : null}
      <AdminIconButton icon={Pencil} onPress={onEdit} />
      <AdminIconButton icon={Trash2} onPress={onDelete} danger />
    </View>
  );
}

export default AdminListRowActions;
