import React from "react";
import QuestionContainer from "./QuestionContainer";
import PrimaryInput from "./PrimaryInput";
import Select from "./Select";
import DateInput from "./DateInput";
import { FlatList } from "react-native";
import CheckBox from "./CheckBox";
import { FormItem } from "../Types/FormStructure";
import MapQuestionContent from "./MapQuestionContent";
import WeatherQuestionContent from "./WeatherQuestionContent";
import SignatureQuestionContainer from "./SignatureQuestionContainer";
import SelectDown from "./SelectDown";

  const RenderQuestion = React.memo(
  ({ onLongPress, aId, question, index, handleChangeSignature, onChangeText, handleChangeCheckbox, canDelete = false, onDelete, hasConfig, autoSaveFn, handleChangeCoords, uploadImage, deleteImage }: {
    handleChangeCoords: (receivedIndex: number, newCoord: {latitude: string; longitude: string;}) => void,
    onLongPress?: (a: string) => void,
    handleChangeSignature: (receivedId: number, uri: string) => void,
    autoSaveFn?: () => void,
    onDelete?: () => void;
    canDelete?: boolean;
    uploadImage?: (uri: string, id: string) => void
    deleteImage?: (filename: string, questionIndex: number) => void
    aId?: string
    hasConfig?: boolean;
    question: FormItem;
    index: number;
    onChangeText: (questionId: number, value: string) => void; handleChangeCheckbox: (id: number, check: boolean, boxid: number) => void
  },) => {
    switch (question.kind) {
      case "text":
        return (
          <QuestionContainer qId={question.id as string} onLongPress={onLongPress} answareNote={question.answare_note} aId={aId} images={question.answare_images} hasPhoto={question.answare_images && question.answare_images.length > 0} uploadImage={uploadImage} deleteImage={deleteImage} hasConfig={hasConfig} canDelete={canDelete} onDelete={onDelete} title={question.title} id={(Number(index) + 1).toString()}>
            <PrimaryInput
              // @ts-ignore
              onChange={(text) => onChangeText((Number(question.id)), text)}
              onBlur={() => autoSaveFn && autoSaveFn()}
              value={question.value}
            />
          </QuestionContainer>
        );
      case "select":
        return (
          <QuestionContainer qId={question.id as string} onLongPress={onLongPress} answareNote={question.answare_note} aId={aId} images={question.answare_images} hasPhoto={question.answare_images && question.answare_images.length > 0} uploadImage={uploadImage} deleteImage={deleteImage} hasConfig={hasConfig} canDelete={canDelete} onDelete={onDelete} title={question.title} id={(Number(index) + 1).toString()}>
            <SelectDown autoSave={autoSaveFn} options={question.options || []} selectedOption={question.value} setSelectedOption={(text) => onChangeText(Number(question.id), text)} />
          </QuestionContainer>
        )

      case "input_date":
        return (
          <QuestionContainer qId={question.id as string} onLongPress={onLongPress} answareNote={question.answare_note} aId={aId} images={question.answare_images} hasPhoto={question.answare_images && question.answare_images.length > 0} uploadImage={uploadImage} deleteImage={deleteImage} hasConfig={hasConfig} canDelete={canDelete} onDelete={onDelete} title={question.title} id={(Number(index) + 1).toString()}>
            <DateInput value={question.value != '' ? new Date(question.value) : new Date()} onChange={(date) => [onChangeText(Number(question.id), date.toString()), autoSaveFn && autoSaveFn()]} mode="date" />
          </QuestionContainer>
        )
      case "input_time":
        return (
          <QuestionContainer qId={question.id as string} onLongPress={onLongPress} answareNote={question.answare_note} aId={aId} images={question.answare_images} hasPhoto={question.answare_images && question.answare_images.length > 0} uploadImage={uploadImage} deleteImage={deleteImage} hasConfig={hasConfig} canDelete={canDelete} onDelete={onDelete} title={question.title} id={(Number(index) + 1).toString()}>
            <DateInput value={question.value != '' ? new Date(question.value) : new Date()} onChange={(date) => [onChangeText(Number(question.id), date.toString()), autoSaveFn && autoSaveFn()]} mode="time" />
          </QuestionContainer>
        )

      case "check_boxes":
        return (
          <QuestionContainer qId={question.id as string} onLongPress={onLongPress} answareNote={question.answare_note} aId={aId} images={question.answare_images} hasPhoto={question.answare_images && question.answare_images.length > 0} uploadImage={uploadImage} deleteImage={deleteImage} hasConfig={hasConfig} title={question.title} id={(Number(index) + 1).toString()} canDelete={canDelete} onDelete={onDelete}>
            <FlatList
              data={question.check_boxes}
              renderItem={({ item, index: idx }) => (
                <CheckBox
                  isCheck={typeof item.value == 'string' ? false : item.value}
                  autoSave={autoSaveFn}
                  label={item.label}
                  setIsCheck={(newValue) => {
                    handleChangeCheckbox(Number(index), newValue, idx)
                  }}
                />
              )}
            />
          </QuestionContainer>
        )

      case "weather":
        return (
          <QuestionContainer qId={question.id as string} onLongPress={onLongPress} answareNote={question.answare_note} aId={aId} images={question.answare_images} hasPhoto={question.answare_images && question.answare_images.length > 0} uploadImage={uploadImage} deleteImage={deleteImage} hasConfig={hasConfig} canDelete={canDelete} onDelete={onDelete} title={question.title} id={(Number(index) + 1).toString()}>
            <WeatherQuestionContent questionId={Number(question.id)} onChangeText={onChangeText} question={question} />
          </QuestionContainer>
        );

      case "location":
        return (
          <QuestionContainer qId={question.id as string} onLongPress={onLongPress} answareNote={question.answare_note} aId={aId} images={question.answare_images} hasPhoto={question.answare_images && question.answare_images.length > 0} uploadImage={uploadImage} deleteImage={deleteImage} hasConfig={hasConfig} canDelete={canDelete} onDelete={onDelete} title={question.title} id={(Number(index) + 1).toString()}>
            <MapQuestionContent onChangeText={onChangeText} questionId={Number(question.id)} question={question} handleChangeCoords={handleChangeCoords} autoSaveFn={autoSaveFn} />
          </QuestionContainer>
        );

      case "signature":
        return (
          <QuestionContainer qId={question.id as string} onLongPress={onLongPress} answareNote={question.answare_note} aId={aId} images={question.answare_images} hasPhoto={question.answare_images && question.answare_images.length > 0} uploadImage={uploadImage} deleteImage={deleteImage} hasConfig={hasConfig} canDelete={canDelete} onDelete={onDelete} title={question.title} id={(Number(index) + 1).toString()}>
            <SignatureQuestionContainer hasConfig={hasConfig} questionId={Number(question.id)} question={question} handleChangeSignature={handleChangeSignature} />
          </QuestionContainer>
        )
      default:
        return null;
    }
  }
);

export default RenderQuestion;