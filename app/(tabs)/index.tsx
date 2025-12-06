import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useGoalStore } from '../../store';
import { GoalList } from '../../components';
import { GoalWithProgress } from '../../types';

export default function GoalsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { goals, isLoading, isInitialized, loadGoals } = useGoalStore();

  useFocusEffect(
    useCallback(() => {
      if (isInitialized) {
        loadGoals();
      }
    }, [isInitialized, loadGoals])
  );

  const handleGoalPress = (goal: GoalWithProgress) => {
    router.push(`/goal/${goal.id}`);
  };

  const handleAddGoal = () => {
    router.push('/(tabs)/add-goal');
  };

  if (isLoading && goals.length === 0) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GoalList
        goals={goals}
        onGoalPress={handleGoalPress}
        onAddGoal={handleAddGoal}
        refreshing={isLoading}
        onRefresh={loadGoals}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
