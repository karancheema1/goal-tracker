import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton, Surface } from 'react-native-paper';
import { GoalEvent, GoalType } from '../../types';
import { formatDuration, formatRelativeDate } from '../../utils';

interface EventItemProps {
  event: GoalEvent;
  goalType: GoalType;
  onDelete?: (id: string) => void;
}

export function EventItem({ event, goalType, onDelete }: EventItemProps) {
  const valueText =
    goalType === 'count'
      ? `+${event.value}`
      : `+${formatDuration(event.value)}`;

  return (
    <Surface style={styles.container} elevation={0}>
      <View style={styles.content}>
        <Text variant="titleMedium" style={styles.value}>
          {valueText}
        </Text>
        <View style={styles.details}>
          <Text variant="bodySmall" style={styles.date}>
            {formatRelativeDate(event.createdAt)}
          </Text>
          {event.note && (
            <Text variant="bodySmall" style={styles.note} numberOfLines={1}>
              {event.note}
            </Text>
          )}
        </View>
      </View>
      {onDelete && (
        <IconButton
          icon="delete-outline"
          size={20}
          onPress={() => onDelete(event.id)}
        />
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  value: {
    fontWeight: '600',
    color: '#22C55E',
  },
  details: {
    flexDirection: 'row',
    marginTop: 4,
  },
  date: {
    color: '#6B7280',
  },
  note: {
    color: '#9CA3AF',
    marginLeft: 8,
    flex: 1,
  },
});
