import {
  KeyboardTypeOptions,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle
} from 'react-native';
import { forwardRef, JSX, useRef, useEffect, useCallback } from 'react';
import { colors } from '../Utils/colors';

interface PrimaryInput {
  value: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  caseStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  label?: string;
  placeHolder?: string;
  isPassword?: boolean;
  isPhone?: boolean;
  type?: 'card' | 'monthYear';
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
  onBlur?: () => void;
  Icon?: JSX.Element;
  disabled?: boolean;
  labelStyle?: StyleProp<TextStyle>
  formatKind?: 'phone' | 'cpf'
  autoCapitalize?: "none" | "sentences" | "words" | "characters" | undefined
  multiline?: boolean;
  numberOfLines?: number;
}

const PrimaryInput = forwardRef<TextInput, PrimaryInput>(
  (
    {
      Icon,
      value,
      onChange,
      caseStyle,
      inputStyle,
      label,
      placeHolder,
      isPassword = false,
      isPhone = false,
      type,
      maxLength,
      keyboardType,
      onBlur,
      disabled = false,
      labelStyle,
      formatKind = '',
      autoCapitalize,
      multiline = false,
      numberOfLines = 1,
    },
    ref
  ) => {

    // Ref interno para chamar setNativeProps sem depender do prop value
    const internalRef = useRef<TextInput>(null);

    // Rastreia o último valor formatado que veio do TECLADO.
    // Quando bate com o valor externo, sabemos que a mudança veio do usuário
    // e NÃO chamamos setNativeProps — preservando a posição do cursor.
    const lastTypedRef = useRef<string>('');

    // Combina o ref externo (forwarded) com o interno
    const mergedRef = useCallback(
      (node: TextInput | null) => {
        (internalRef as React.MutableRefObject<TextInput | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<TextInput | null>).current = node;
      },
      [ref]
    );

    function formatCPF(v: string): string {
      const digits = v.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
      if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    }

    function formatPhone(v: string): string {
      const digits = v.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 2) return `(${digits}`;
      if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }

    function defineFormatData(data: string) {
      if (formatKind == 'phone') return formatPhone(data);
      if (formatKind == 'cpf') return formatCPF(data);
      return data;
    }

    // Sincroniza mudanças vindas de FORA (ex: limpar formulário, preencher via código).
    // Se a mudança veio do teclado, lastTypedRef já tem o mesmo valor → setNativeProps NÃO dispara.
    useEffect(() => {
      const formatted = defineFormatData(value);
      if (formatted !== lastTypedRef.current) {
        lastTypedRef.current = formatted;
        internalRef.current?.setNativeProps({ text: formatted });
      }
    }, [value]);

    function handleFormatCard(text: string) {
      let formattedText = text.replace(/\D/g, '');
      if (formattedText.length > 4) {
        formattedText = formattedText.replace(/(\d{4})(?=\d)/g, '$1 ');
      }
      onChange(formattedText);
    }

    function handleFormatMonthYear(text: string) {
      const cleanedText = text.replace(/\D/g, '');
      let formattedText = cleanedText;
      if (cleanedText.length > 2) {
        formattedText = `${cleanedText.slice(0, 2)}/${cleanedText.slice(2, 4)}`;
      }
      onChange(formattedText);
    }

    function handleChangeText(text: string) {
      // Registra o que o usuário acabou de digitar para que o useEffect
      // não sobrescreva o TextInput e não resete a posição do cursor.
      lastTypedRef.current = text;

      switch (type) {
        case 'card':
          handleFormatCard(text);
          break;
        case 'monthYear':
          handleFormatMonthYear(text);
          break;
        default:
          onChange(text);
          break;
      }
    }

    function defineMaxLength() {
      if (isPhone && formatKind == 'phone') return 15;
      if (isPhone) return 11;
      if (formatKind == 'cpf') return 14;
      return maxLength;
    }

    return (
      <View style={[styles.inputCase, caseStyle]}>
        {label && <Text>{label}</Text>}
        <View
          style={[
            {
              borderWidth: 1.5,
              borderRadius: 10,
              borderTopColor: 'lightgray',
              borderLeftColor: 'lightgray',
              borderRightColor: 'lightgray',
              borderBottomColor: 'lightgray',
              flexDirection: 'row',
              position: 'relative',
              backgroundColor: 'white'
            },
            inputStyle
          ]}>
          {disabled ? (
            <Text style={[{ backgroundColor: 'lightgray' }, styles.input]}>
              {value}
            </Text>
          ) : (
            <TextInput
              autoCapitalize={autoCapitalize}
              allowFontScaling={false}
              ref={mergedRef}
              maxLength={defineMaxLength()}
              keyboardType={isPhone ? 'phone-pad' : keyboardType}
              secureTextEntry={isPassword}
              style={[
                styles.input,
                multiline && { height: undefined, minHeight: 40, textAlignVertical: 'top' }
              ]}
              placeholder={placeHolder}
              placeholderTextColor="#9ca3af"
              defaultValue={defineFormatData(value)}
              onChangeText={handleChangeText}
              onBlur={onBlur}
              multiline={multiline}
              numberOfLines={numberOfLines}
            />
          )}
          {Icon && <View style={{ position: 'absolute', right: 25, top: 8 }}>{Icon}</View>}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  input: {
    padding: 10,
    color: 'gray',
    width: '100%',
    fontFamily: 'PoppinsRegular',
    lineHeight: 20,
    fontSize: 14,
  },
  inputCase: {
    width: '100%',
    gap: 4
  }
});

export default PrimaryInput;
