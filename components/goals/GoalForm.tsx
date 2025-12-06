import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import {
  TextInput,
  Button,
  SegmentedButtons,
  Text,
  HelperText,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CreateGoalInput, GoalType } from '../../types';
import { formatDuration } from '../../utils';

interface GoalFormProps {
  onSubmit: (input: CreateGoalInput) => void;
  isLoading?: boolean;
}

export function GoalForm({ onSubmit, isLoading }: GoalFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<GoalType>('count');
  const [targetValue, setTargetValue] = useState('');
  // Separate state for time-based goals
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days from now
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (type === 'count') {
      if (!targetValue.trim()) {
        newErrors.targetValue = 'Target value is required';
      } else {
        const num = parseInt(targetValue);
        if (isNaN(num) || num <= 0) {
          newErrors.targetValue = 'Must be a positive number';
        }
      }
    } else {
      const h = parseInt(hours) || 0;
      const m = parseInt(minutes) || 0;
      if (h <= 0 && m <= 0) {
        newErrors.targetValue = 'Enter at least 1 hour or 1 minute';
      }
    }

    if (endDate <= new Date()) {
      newErrors.endDate = 'End date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    let parsedTarget: number;
    if (type === 'count') {
      parsedTarget = parseInt(targetValue);
    } else {
      const h = parseInt(hours) || 0;
      const m = parseInt(minutes) || 0;
      parsedTarget = h * 3600 + m * 60;
    }

    onSubmit({
      name: name.trim(),
      type,
      targetValue: parsedTarget,
      endDate: endDate.toISOString(),
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TextInput
        label="Goal Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        placeholder="e.g., 1000 Push-ups Challenge"
        error={!!errors.name}
        style={styles.input}
      />
      {errors.name && <HelperText type="error">{errors.name}</HelperText>}

      <Text variant="labelLarge" style={styles.label}>
        Goal Type
      </Text>
      <SegmentedButtons
        value={type}
        onValueChange={(value) => {
          setType(value as GoalType);
          setTargetValue('');
          setHours('');
          setMinutes('');
          setErrors({});
        }}
        buttons={[
          { value: 'count', label: 'Count', icon: 'counter' },
          { value: 'time', label: 'Duration', icon: 'clock-outline' },
        ]}
        style={styles.segmented}
      />

      {type === 'count' ? (
        <>
          <TextInput
            label="Target Count"
            value={targetValue}
            onChangeText={setTargetValue}
            mode="outlined"
            placeholder="e.g., 1000"
            keyboardType="numeric"
            error={!!errors.targetValue}
            style={styles.input}
          />
          {errors.targetValue && (
            <HelperText type="error">{errors.targetValue}</HelperText>
          )}
        </>
      ) : (
        <>
          <Text variant="labelLarge" style={styles.label}>
            Target Duration
          </Text>
          <View style={styles.durationRow}>
            <View style={styles.durationInput}>
              <TextInput
                label="Hours"
                value={hours}
                onChangeText={setHours}
                mode="outlined"
                keyboardType="numeric"
                error={!!errors.targetValue}
              />
            </View>
            <View style={styles.durationInput}>
              <TextInput
                label="Minutes"
                value={minutes}
                onChangeText={setMinutes}
                mode="outlined"
                keyboardType="numeric"
                error={!!errors.targetValue}
              />
            </View>
          </View>
          {errors.targetValue && (
            <HelperText type="error">{errors.targetValue}</HelperText>
          )}
          {(parseInt(hours) > 0 || parseInt(minutes) > 0) && !errors.targetValue && (
            <HelperText type="info">
              {formatDuration((parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60)}
            </HelperText>
          )}
        </>
      )}

      <Text variant="labelLarge" style={styles.label}>
        Target Date
      </Text>
      <Button
        mode="outlined"
        onPress={() => setShowDatePicker(true)}
        icon="calendar"
        style={styles.dateButton}
      >
        {endDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      </Button>
      {errors.endDate && <HelperText type="error">{errors.endDate}</HelperText>}

      {showDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.submitButton}
      >
        Create Goal
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 4,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
  },
  segmented: {
    marginBottom: 16,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  durationInput: {
    flex: 1,
  },
  dateButton: {
    marginBottom: 4,
  },
  submitButton: {
    marginTop: 32,
    marginBottom: 32,
  },
});
