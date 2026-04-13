import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../Utils/colors";
import RenderQuestion from "./RenderQuestion";
import { FormItem } from "../Types/FormStructure";
import { useMemo, useState } from "react";
import PrimaryButton from "./PrimaryButton";

interface RenderQuestionContainer {
  formQuestions: FormItem[]
  removeQuestion?: (itemIndex: number) => void
  onDelete?: () => void;
  canDelete?: boolean;
  hasConfig?: boolean;
  onLongPress?: (a: string) => void
  onChangeText: (index: number, value: string) => void;
  handleChangeCheckbox: (id: number, check: boolean, boxid: number) => void;
  hasFooterButton?: boolean
  isFooterButtonLoading?: boolean;
  autoSaveFn?: () => Promise<void>
  uploadImage?: (uri: string, id: string) => void
  handleChangeCoords?: (receivedIndex: number, newCoord: {
    latitude: string;
    longitude: string;
  }) => void
  onSubmit?: () => void
  aId?: string
  handleChangeSignature?: (receivedIndex: number, uri: string) => void,
  sectionPercentage?: {
    section_name: string;
    percentage: number;
  }[] | undefined
}

export default function RenderQuestionContainer({
  formQuestions,
  handleChangeSignature,
  removeQuestion,
  hasConfig, 
  canDelete, 
  handleChangeCheckbox, 
  onChangeText, 
  hasFooterButton = false,
  isFooterButtonLoading,
  autoSaveFn,
  handleChangeCoords,
  onSubmit,
  uploadImage,
  sectionPercentage,
  onLongPress,
  aId
}: RenderQuestionContainer) {

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});


  const toggleSection = (sectionName: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const groupedData: any[] = useMemo(() => {
    if (!formQuestions || formQuestions.length === 0) return [];

    const sectionsMap = new Map<string, FormItem[]>();

    formQuestions.forEach((q) => {
      if (!sectionsMap.has(q.section)) {
        sectionsMap.set(q.section, []);
      }
      sectionsMap.get(q.section)!.push(q);
    });

    const result: any[] = [];

    sectionsMap.forEach((questions, sectionName) => {
      result.push({ type: 'section', title: sectionName });

      const isCollapsed = collapsedSections[sectionName];

      if (!isCollapsed) {
        questions.forEach((q) => {
          result.push({ type: 'question', question: q });
        });
      }
    });

    return result;
  }, [formQuestions, collapsedSections]);

  return (
    <FlatList
      contentContainerStyle={{ gap: 12, backgroundColor: 'white' }}
      data={groupedData}
      keyExtractor={(item, index) =>
        item.type === 'section'
          ? `section-${item.title}`
          : `question-${item.question.id}`
      }
      ListFooterComponent={() => {
        if(!hasFooterButton){
          return
        }
        return <View style={{marginBottom: 50}}>
          <PrimaryButton isLoading={isFooterButtonLoading} label="Submit" onPress={() => [onSubmit && onSubmit()]} style={{ backgroundColor: colors.primary }} textStyle={{ color: 'white' }} />
        </View>
      }}
      renderItem={({ item, index }) => {
        if (item.type === 'section') {
          const isCollapsed = collapsedSections[item.title];

          return (
            <TouchableOpacity
              onPress={() => toggleSection(item.title)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                backgroundColor: colors.primary,
                flexDirection: 'row',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                {item.title}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                {sectionPercentage && sectionPercentage.find(section => section.section_name == item.title)?.percentage.toFixed(0)+"%"}
              </Text>

              <MaterialCommunityIcons
                name={isCollapsed ? 'chevron-down' : 'chevron-up'}
                size={22}
                color={'white'}
              />
            </TouchableOpacity>
          );
        }

        return (
          <View style={{ paddingHorizontal: 10 }}>
            <RenderQuestion
              onLongPress={onLongPress}
              aId={aId}
              handleChangeSignature={handleChangeSignature as any}
              uploadImage={uploadImage}
              handleChangeCoords={handleChangeCoords as any}
              hasConfig={hasConfig}
              canDelete={canDelete}
              onDelete={() => [removeQuestion && removeQuestion(item.question.id)]}
              question={item.question}
              index={item.question.id}
              onChangeText={onChangeText}
              autoSaveFn={autoSaveFn}
              handleChangeCheckbox={handleChangeCheckbox}
            />
          </View>
        );
      }}
    />
  )
}