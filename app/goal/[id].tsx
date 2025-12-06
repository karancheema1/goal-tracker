import { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  Button,
  FAB,
  Portal,
  Modal,
  TextInput,
  Snackbar,
  IconButton,
  useTheme,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useGoalStore } from '../../store';
import { ProgressRing, EventList } from '../../components';
import { formatDuration, formatDate, parseDurationInput } from '../../utils';

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const {
    currentGoal,
    currentGoalEvents,
    isLoading,
    error,
    loadGoal,
    addEvent,
    deleteEvent,
    deleteGoal,
    clearError,
  } = useGoalStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [eventValue, setEventValue] = useState('');
  const [eventNote, setEventNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      loadGoal(id);
    }
  }, [id, loadGoal]);

  const handleAddEvent = async () => {
    if (!currentGoal || !eventValue.trim()) return;

    let value: number;
    if (currentGoal.type === 'count') {
      value = parseInt(eventValue);
      if (isNaN(value) || value <= 0) return;
    } else {
      const parsed = parseDurationInput(eventValue);
      if (parsed === null || parsed <= 0) return;
      value = parsed;
    }

    setIsSubmitting(true);
    try {
      await addEvent({
        goalId: currentGoal.id,
        value,
        note: eventNote.trim() || undefined,
      });
      setShowAddModal(false);
      setEventValue('');
      setEventNote('');
    } catch {
      // Error handled by store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = useCallback(
    async (eventId: string) => {
      if (!currentGoal) return;
      await deleteEvent(eventId, currentGoal.id);
    },
    [currentGoal, deleteEvent]
  );

  const handleDeleteGoal = async () => {
    if (!currentGoal) return;
    await deleteGoal(currentGoal.id);
    router.back();
  };

  if (isLoading && !currentGoal) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!currentGoal) {
    return (
      <View style={styles.notFound}>
        <Text variant="titleMedium">Goal not found</Text>
        <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 16 }}>
          Go Back
        </Button>
      </View>
    );
  }

  const progressLabel =
    currentGoal.type === 'count'
      ? `${currentGoal.currentValue}`
      : formatDuration(currentGoal.currentValue);

  const targetLabel =
    currentGoal.type === 'count'
      ? `of ${currentGoal.targetValue}`
      : `of ${formatDuration(currentGoal.targetValue)}`;

  const remainingValue = Math.max(0, currentGoal.targetValue - currentGoal.currentValue);
  const remainingText =
    currentGoal.type === 'count'
      ? `${remainingValue} remaining`
      : `${formatDuration(remainingValue)} remaining`;

  const pacePerDay =
    currentGoal.daysRemaining > 0
      ? remainingValue / currentGoal.daysRemaining
      : remainingValue;

  const paceText =
    currentGoal.type === 'count'
      ? `${Math.ceil(pacePerDay)}/day to reach goal`
      : `${formatDuration(Math.ceil(pacePerDay))}/day to reach goal`;

  return (
    <>
      <Stack.Screen
        options={{
          title: currentGoal.name,
          headerRight: () => (
            <IconButton
              icon="delete"
              onPress={() => setShowDeleteConfirm(true)}
            />
          ),
        }}
      />

      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Progress Section */}
          <View style={styles.progressSection}>
            <ProgressRing
              progress={currentGoal.progressPercentage}
              color={currentGoal.color}
              label={`${Math.round(currentGoal.progressPercentage)}%`}
              sublabel={currentGoal.isCompleted ? 'Complete!' : remainingText}
            />

            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={{ color: currentGoal.color }}>
                  {progressLabel}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  {targetLabel}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text variant="headlineSmall">
                  {currentGoal.daysRemaining > 0
                    ? currentGoal.daysRemaining
                    : currentGoal.daysRemaining === 0
                    ? 'Today'
                    : 'Overdue'}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  {currentGoal.daysRemaining > 0
                    ? 'days left'
                    : currentGoal.daysRemaining === 0
                    ? 'is deadline'
                    : `by ${Math.abs(currentGoal.daysRemaining)} days`}
                </Text>
              </View>
            </View>

            {!currentGoal.isCompleted && currentGoal.daysRemaining > 0 && (
              <Text variant="bodySmall" style={styles.paceText}>
                {paceText}
              </Text>
            )}

            <Text variant="bodySmall" style={styles.dateText}>
              Target date: {formatDate(currentGoal.endDate)}
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Events Section */}
          <View style={styles.eventsSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Activity Log
            </Text>
            <EventList
              events={currentGoalEvents}
              goalType={currentGoal.type}
              onDeleteEvent={handleDeleteEvent}
            />
          </View>
        </ScrollView>

        {/* FAB for adding events */}
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: currentGoal.color }]}
          onPress={() => setShowAddModal(true)}
          color="#FFFFFF"
        />

        {/* Add Event Modal */}
        <Portal>
          <Modal
            visible={showAddModal}
            onDismiss={() => setShowAddModal(false)}
            contentContainerStyle={[
              styles.modal,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text variant="titleLarge" style={styles.modalTitle}>
              Log Progress
            </Text>

            <TextInput
              label={currentGoal.type === 'count' ? 'Count' : 'Duration'}
              value={eventValue}
              onChangeText={setEventValue}
              mode="outlined"
              placeholder={
                currentGoal.type === 'count' ? 'e.g., 50' : 'e.g., 5m or 0:05:00'
              }
              keyboardType={currentGoal.type === 'count' ? 'numeric' : 'default'}
              style={styles.modalInput}
            />

            <TextInput
              label="Note (optional)"
              value={eventNote}
              onChangeText={setEventNote}
              mode="outlined"
              placeholder="e.g., Morning session"
              style={styles.modalInput}
            />

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowAddModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddEvent}
                loading={isSubmitting}
                disabled={isSubmitting || !eventValue.trim()}
                style={styles.modalButton}
              >
                Add
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Delete Confirmation Modal */}
        <Portal>
          <Modal
            visible={showDeleteConfirm}
            onDismiss={() => setShowDeleteConfirm(false)}
            contentContainerStyle={[
              styles.modal,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text variant="titleLarge" style={styles.modalTitle}>
              Delete Goal?
            </Text>
            <Text variant="bodyMedium" style={styles.modalText}>
              This will permanently delete "{currentGoal.name}" and all its
              logged entries. This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowDeleteConfirm(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleDeleteGoal}
                buttonColor={theme.colors.error}
                style={styles.modalButton}
              >
                Delete
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Error Snackbar */}
        <Snackbar visible={!!error} onDismiss={clearError} duration={3000}>
          {error}
        </Snackbar>
      </KeyboardAvoidingView>
    </>
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
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    flex: 1,
  },
  progressSection: {
    alignItems: 'center',
    padding: 24,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#6B7280',
    marginTop: 4,
  },
  paceText: {
    marginTop: 16,
    color: '#6B7280',
  },
  dateText: {
    marginTop: 8,
    color: '#9CA3AF',
  },
  divider: {
    marginHorizontal: 16,
  },
  eventsSection: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    margin: 20,
    padding: 24,
    borderRadius: 12,
  },
  modalTitle: {
    marginBottom: 16,
  },
  modalText: {
    marginBottom: 24,
    color: '#6B7280',
  },
  modalInput: {
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 12,
  },
});
