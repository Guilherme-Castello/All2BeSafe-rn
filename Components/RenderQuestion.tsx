import React from "react";
import QuestionContainer from "./QuestionContainer";
import PrimaryInput from "./PrimaryInput";
import Select from "./Select";
import DateInput from "./DateInput";
import { FlatList } from "react-native";
import CheckBox from "./CheckBox";
import { FormItem } from "../Types/FormStructure";

const RenderQuestion = React.memo(
  ({ question, index, onChangeText, handleChangeCheckbox, canDelete = false, onDelete }: { onDelete?: () => void; canDelete?: boolean; question: FormItem; index: number; onChangeText: (index: number, value: string) => void; handleChangeCheckbox: (id: number, check: boolean, boxid: number) => void }) => {
    switch (question.kind) {
      case "text":
        return (
          <QuestionContainer canDelete={canDelete} onDelete={onDelete} title={question.title} id={(index + 1).toString()}>
            <PrimaryInput
              onChange={(text) => onChangeText(index, text)}
              value={question.value}
            />
          </QuestionContainer>
        );
      case "select":
        return (
          <QuestionContainer canDelete={canDelete} onDelete={onDelete} title={question.title} id={(index + 1).toString()}>
            <Select options={question.options || []} selectedOption={question.value} setSelectedOption={(text) => onChangeText(index, text)} />
          </QuestionContainer>
        )

      case "input_date":
        return (
          <QuestionContainer canDelete={canDelete} onDelete={onDelete} title={question.title} id={(index + 1).toString()}>
            <DateInput value={question.value != '' ? new Date(question.value) : new Date()} onChange={(date) => onChangeText(index, date.toString())} mode="date" />
          </QuestionContainer>
        )
      case "input_time":
        return (
          <QuestionContainer canDelete={canDelete} onDelete={onDelete} title={question.title} id={(index + 1).toString()}>
            <DateInput value={question.value != '' ? new Date(question.value) : new Date()} onChange={(date) => onChangeText(index, date.toString())} mode="time" />
          </QuestionContainer>
        )

      case "check_boxes":
        return (
          <QuestionContainer title={question.title} id={(index + 1).toString()} canDelete={canDelete} onDelete={onDelete}>
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
      default:
        return null;
    }
  }
);

export default RenderQuestion;