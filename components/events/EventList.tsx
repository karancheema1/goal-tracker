import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { GoalEvent, GoalType } from '../../types';
import { EventItem } from './EventItem';

interface EventListProps {
  events: GoalEvent[];
  goalType: GoalType;
  onDeleteEvent?: (id: string) => void;
}

export function EventList({ events, goalType, onDeleteEvent }: EventListProps) {
  if (events.length === 0) {
    return (
      <View style={styles.empty}>
        <Text variant="bodyMedium" style={styles.emptyText}>
          No entries yet. Add your first one!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {events.map((event) => (
        <EventItem
          key={event.id}
          event={event}
          goalType={goalType}
          onDelete={onDeleteEvent}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
  },
});
