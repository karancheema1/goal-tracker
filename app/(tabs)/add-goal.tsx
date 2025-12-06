import { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { Snackbar, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useGoalStore } from '../../store';
import { GoalForm } from '../../components';
import { CreateGoalInput } from '../../types';

export default function AddGoalScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { createGoal, error, clearError } = useGoalStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (input: CreateGoalInput) => {
    setIsSubmitting(true);
    try {
      await createGoal(input);
      setShowSuccess(true);
      // Navigate to home after a brief delay to show success message
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
    } catch {
      // Error is handled by the store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <GoalForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={clearError}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: clearError,
        }}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={showSuccess}
        onDismiss={() => setShowSuccess(false)}
        duration={1500}
      >
        Goal created successfully!
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
