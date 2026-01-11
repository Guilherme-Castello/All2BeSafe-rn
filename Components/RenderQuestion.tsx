import React from "react";
import QuestionContainer from "./QuestionContainer";
import PrimaryInput from "./PrimaryInput";
import Select from "./Select";
import DateInput from "./DateInput";
import { FlatList, View } from "react-native";
import CheckBox from "./CheckBox";
import { FormItem } from "../Types/FormStructure";
import MapView from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../Utils/colors";
import PrimaryButton from "./PrimaryButton";
import MapQuestionContent from "./MapQuestionContent";
import WeatherQuestionContent from "./WeatherQuestionContent";

const RenderQuestion = React.memo(
  ({ question, index, onChangeText, handleChangeCheckbox, canDelete = false, onDelete, hasConfig }: { onDelete?: () => void; canDelete?: boolean; hasConfig?: boolean; question: FormItem; index: number; onChangeText: (index: number, value: string) => void; handleChangeCheckbox: (id: number, check: boolean, boxid: number) => void }) => {
    switch (question.kind) {
      case "text":
        return (
          <QuestionContainer hasConfig={hasConfig} canDelete={canDelete} onDelete={onDelete} title={question.title} id={(index + 1).toString()}>
            <PrimaryInput
              onChange={(text) => onChangeText(index, text)}
              value={question.value}
            />
          </QuestionContainer>
        );
      case "select":
        return (
          <QuestionContainer hasConfig={hasConfig} canDelete={canDelete} onDelete={onDelete} title={question.title} id={(index + 1).toString()}>
            <Select options={question.options || []} selectedOption={question.value} setSelectedOption={(text) => onChangeText(index, text)} />
          </QuestionContainer>
        )

      case "input_date":
        return (
          <QuestionContainer hasConfig={hasConfig} canDelete={canDelete} onDelete={onDelete} title={question.title} id={(index + 1).toString()}>
            <DateInput value={question.value != '' ? new Date(question.value) : new Date()} onChange={(date) => onChangeText(index, date.toString())} mode="date" />
          </QuestionContainer>
        )
      case "input_time":
        return (
          <QuestionContainer hasConfig={hasConfig} canDelete={canDelete} onDelete={onDelete} title={question.title} id={(index + 1).toString()}>
            <DateInput value={question.value != '' ? new Date(question.value) : new Date()} onChange={(date) => onChangeText(index, date.toString())} mode="time" />
          </QuestionContainer>
        )

      case "check_boxes":
        return (
          <QuestionContainer hasConfig={hasConfig} title={question.title} id={(index + 1).toString()} canDelete={canDelete} onDelete={onDelete}>
            <FlatList
              data={question.check_boxes}
              renderItem={({ item, index: idx }) => (
                <CheckBox
                  isCheck={typeof item.value == 'string' ? false : item.value}
                  label={item.label}
                  setIsCheck={(newValue) => {
                    handleChangeCheckbox(index, newValue, idx)
                  }}
                />
              )}
            />
          </QuestionContainer>
        )

      case "weather":
        return (
          <QuestionContainer hasConfig={hasConfig} canDelete={canDelete} onDelete={onDelete} title={question.title} id={(index + 1).toString()}>
            <WeatherQuestionContent index={index} onChangeText={onChangeText} question={question}/>
          </QuestionContainer>
        );

      case "location":
        return (
          <QuestionContainer hasConfig={hasConfig} canDelete={canDelete} onDelete={onDelete} title={question.title} id={(index + 1).toString()}>
            <MapQuestionContent/>
          </QuestionContainer>
        );
      default:
        return null;
    }
  }
);

export default RenderQuestion;