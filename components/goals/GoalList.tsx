import React from 'react';
import { FlatList, StyleSheet, RefreshControl } from 'react-native';
import { GoalWithProgress } from '../../types';
import { GoalCard } from './GoalCard';
import { EmptyState } from '../ui';

interface GoalListProps {
  goals: GoalWithProgress[];
  onGoalPress: (goal: GoalWithProgress) => void;
  onAddGoal: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function GoalList({
  goals,
  onGoalPress,
  onAddGoal,
  refreshing = false,
  onRefresh,
}: GoalListProps) {
  if (goals.length === 0) {
    return (
      <EmptyState
        icon="target"
        title="No goals yet"
        description="Create your first goal and start tracking your progress!"
        actionLabel="Create Goal"
        onAction={onAddGoal}
      />
    );
  }

  return (
    <FlatList
      data={goals}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <GoalCard goal={item} onPress={() => onGoalPress(item)} />
      )}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
});
