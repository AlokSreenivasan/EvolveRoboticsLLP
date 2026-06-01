import React from 'react';
import { Text, View } from 'react-native';

import AdminListRowActions from './AdminListRowActions';
import { adminStyles } from './adminStyles';

type AdminListRowProps = {
  title: string;
  subtitle?: string;
  tag?: string;
  statusLine?: string;
  isPublished: boolean;
  index: number;
  itemCount: number;
  reordering: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function AdminListRow({
  title,
  subtitle,
  tag,
  statusLine,
  isPublished,
  index,
  itemCount,
  reordering,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: AdminListRowProps) {
  return (
    <View style={adminStyles.listRowCard}>
      <View style={adminStyles.listRowTop}>
        <View style={adminStyles.listRowMeta}>
          {tag ? <Text style={adminStyles.listRowTag}>{tag}</Text> : null}
          <Text style={adminStyles.listRowTitle}>{title}</Text>
          {subtitle ? (
            <Text style={adminStyles.listRowSubtitle}>{subtitle}</Text>
          ) : null}
          {statusLine ? (
            <Text style={adminStyles.listRowStatus}>{statusLine}</Text>
          ) : null}
          {!isPublished ? (
            <Text style={adminStyles.draftBadge}>Draft</Text>
          ) : null}
        </View>
        <AdminListRowActions
          index={index}
          itemCount={itemCount}
          reordering={reordering}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </View>
    </View>
  );
}

export default AdminListRow;
