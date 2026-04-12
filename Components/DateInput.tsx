import React, { useState } from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../Utils/colors';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
}

// Detecta se o locale do dispositivo usa formato de 24 horas.
// Locales como en-US, en-CA, pt-BR usam 12h; de-DE, pt-PT usam 24h.
function deviceUses24HourClock(): boolean {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  const testDate = new Date(2000, 0, 1, 13, 0, 0); // 13:00 = 1 PM
  const formatted = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).format(testDate);
  // Se o resultado contiver "PM", "AM", ou qualquer palavra não-numérica, é 12h
  return !/[APap]/.test(formatted);
}

const is24Hour = deviceUses24HourClock();

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
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (mode === 'date') {
      return value.toLocaleDateString(locale, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } else {
      return value.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: !is24Hour,
      });
    }
  }

  return (
    <View style={{ marginVertical: 10 }}>
      <TouchableOpacity onPress={() => setShow(true)} style={{ backgroundColor: colors.primary, height: 50, borderRadius: 10, justifyContent: 'center' }}>
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
          {...(Platform.OS !== 'ios' && { is24Hour })}
        />
      )}
    </View>
  );
}
