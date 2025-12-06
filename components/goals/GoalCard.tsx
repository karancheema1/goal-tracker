import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Surface, Icon } from 'react-native-paper';
import { GoalWithProgress } from '../../types';
import { ProgressBar } from '../progress';
import { formatDuration } from '../../utils';

interface GoalCardProps {
  goal: GoalWithProgress;
  onPress: () => void;
}

export function GoalCard({ goal, onPress }: GoalCardProps) {
  const progressText =
    goal.type === 'count'
      ? `${goal.currentValue} / ${goal.targetValue}`
      : `${formatDuration(goal.currentValue)} / ${formatDuration(goal.targetValue)}`;

  const statusColor = goal.isCompleted
    ? '#22C55E'
    : goal.isOverdue
    ? '#EF4444'
    : goal.color;

  const statusIcon = goal.isCompleted
    ? 'check-circle'
    : goal.isOverdue
    ? 'alert-circle'
    : 'clock-outline';

  const daysText =
    goal.daysRemaining > 0
      ? `${goal.daysRemaining} days left`
      : goal.daysRemaining === 0
      ? 'Due today'
      : `${Math.abs(goal.daysRemaining)} days overdue`;

  return (
    <Pressable onPress={onPress}>
      <Surface style={styles.card} elevation={1}>
        <View style={styles.header}>
          <View style={[styles.colorDot, { backgroundColor: goal.color }]} />
          <Text variant="titleMedium" style={styles.name} numberOfLines={1}>
            {goal.name}
          </Text>
          <Icon source={statusIcon} size={20} color={statusColor} />
        </View>

        <View style={styles.progressContainer}>
          <ProgressBar progress={goal.progressPercentage} color={goal.color} />
          <View style={styles.progressDetails}>
            <Text variant="bodySmall" style={styles.progressText}>
              {progressText}
            </Text>
            <Text variant="bodySmall" style={styles.percentText}>
              {Math.round(goal.progressPercentage)}%
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text
            variant="labelSmall"
            style={[
              styles.daysText,
              goal.isOverdue && styles.overdueText,
              goal.isCompleted && styles.completedText,
            ]}
          >
            {goal.isCompleted ? 'Completed!' : daysText}
          </Text>
        </View>
      </Surface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  name: {
    flex: 1,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressText: {
    color: '#6B7280',
  },
  percentText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  daysText: {
    color: '#6B7280',
  },
  overdueText: {
    color: '#EF4444',
  },
  completedText: {
    color: '#22C55E',
  },
});
