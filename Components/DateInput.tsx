import React, { useState } from 'react';
import { Platform, View, Button, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../Utils/colors';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
}

export default function DateInput({
  value = new Date(),
  onChange,
  mode = 'date',
}: DatePickerProps) {
  const [show, setShow] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(value);

  function onChangeInternal(_event: any, date?: Date) {
    setShow(false);
    if (date) {
      setSelectedDate(date);
      onChange(date);
    }
  };

  function formatedValue() {
    if (mode == 'date') {
      return value.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    } else {
      return value.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }
  }

  return (
    <View style={{ marginVertical: 10 }}>
      <TouchableOpacity onPress={() => setShow(true)} style={[{ backgroundColor: colors.primary, height: 50, borderRadius: 10, justifyContent: 'center' }]}>
        <Text style={{ textAlign: 'center', color: 'white' }}>
          {formatedValue()}
        </Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={selectedDate}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeInternal}
        />
      )}
    </View>
  );
}
