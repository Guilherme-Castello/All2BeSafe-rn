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
import { forwardRef, JSX } from 'react';
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
      autoCapitalize
    },
    ref
  ) => {

    function formatCPF(value: string): string {
      const digits = value.replace(/\D/g, '');

      if (digits.length === 0) return '';

      if (digits.length <= 3) {
        return digits;
      }

      if (digits.length <= 6) {
        return `${digits.slice(0, 3)}.${digits.slice(3)}`;
      }

      if (digits.length <= 9) {
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
      }

      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    }

    function formatPhone(value: string): string {
      const digits = value.replace(/\D/g, '');

      if (digits.length === 0) return '';

      if (digits.length <= 2) {
        return `(${digits}`;
      }

      if (digits.length <= 7) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      }

      if (digits.length <= 11) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
      }

      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
    
    function handleFormatCard(text: string) {
      let formattedText = text.replace(/\D/g, '');

      // Format the text into the "0000 0000 0000 0000" format
      if (formattedText.length > 4) {
        formattedText = formattedText.replace(/(\d{4})(?=\d)/g, '$1 ');
      }

      onChange(formattedText);
    }

    const handleFormatMonthYear = (text: string) => {
      // Remove all non-numeric characters
      const cleanedText = text.replace(/\D/g, '');

      // Format as "MM/YYYY"
      let formattedText = cleanedText;
      if (cleanedText.length > 2) {
        formattedText = `${cleanedText.slice(0, 2)}/${cleanedText.slice(2, 4)}`;
      }
      onChange(formattedText);
    };

    function handleChangeText(text: string) {
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

    function defineMaxLength(){
      if(isPhone && formatKind == 'phone'){
        return 15
      } else if (isPhone){
        return 11
      } else if (formatKind == 'cpf') {
        return 14
      } else {
        return maxLength
      }
    }

    function defineFormatData(data: string){
      if(formatKind == 'phone'){
        return formatPhone(data)
      } else if(formatKind == 'cpf') {
        return formatCPF(data)
      } else{
        return data
      }
    }

    return (
      <View style={[styles.inputCase, caseStyle]}>

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
              position: 'relative'
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
              ref={ref}
              maxLength={defineMaxLength()}
              keyboardType={isPhone ? 'phone-pad' : keyboardType}
              secureTextEntry={isPassword}
              style={[styles.input]}
              placeholder={placeHolder}
              value={defineFormatData(value)}
              onChangeText={handleChangeText}
              onBlur={onBlur}
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
    height: 40,
    padding: 10,
    color: 'gray',
    width: '100%',
    fontFamily: 'PoppinsRegular',
    lineHeight: 20,
    fontSize: 14
  },
  inputCase: {
    width: '100%',
    gap: 4
  }
});

export default PrimaryInput;
