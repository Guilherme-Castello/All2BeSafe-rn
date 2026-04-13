import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { BackHandler, Dimensions, Keyboard, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Portal } from '@gorhom/portal';

interface AnimatedModalProps {
  title?: string;
  position?: number;
  onClose: () => void;
  children:
  | React.ReactNode
  | ((props: { closeModal: (callBack: () => void) => void }) => React.ReactNode);
}

export default function AnimatedModal({ title, position = 460, children, onClose }: AnimatedModalProps) {
  // useWindowDimensions é reativo: atualiza automaticamente quando o teclado
  // abre/fecha com adjustResize, refletindo o espaço real disponível.
  const { height: windowHeight } = useWindowDimensions();

  const height = useSharedValue(0);
  const bgOpacity = useSharedValue(0);

  useEffect(() => {
    const backAction = () => {
      closeModal(onClose)
      return true
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', backAction)
    return () => subscription.remove()
  }, [])

  const mainContainer = useAnimatedStyle(() => ({
    height: height.value
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      bgOpacity.value,
      [0, 1],
      ['#00000000', '#00000050']
    )
  }));

  const closeModal = (callBack: () => void) => {
    bgOpacity.value = withTiming(0, { duration: 250 });
    height.value = withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) });
    setTimeout(() => { callBack && callBack(); }, 550);
  };

  const openModal = () => {
    bgOpacity.value = withTiming(1, { duration: 250 });
    height.value = withTiming(position, { duration: 500, easing: Easing.inOut(Easing.ease) });
  };

  useEffect(() => {
    openModal();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      // Com adjustResize, Dimensions.get('window').height já reflete o espaço
      // acima do teclado. Expandimos o modal para preencher TODO esse espaço.
      const available = Dimensions.get('window').height;
      height.value = withTiming(available, { duration: 250, easing: Easing.inOut(Easing.ease) });
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      height.value = withTiming(position, { duration: 300, easing: Easing.inOut(Easing.ease) });
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [position]);

  return (
    <Portal>
      {/* Usa windowHeight (reativo) para que o container acompanhe o resize do teclado */}
      <Animated.View style={[styles.modalBackgroundContainer, animatedStyle, { height: windowHeight }]}>
        <Animated.View style={[styles.modalMainContainer, mainContainer, { backgroundColor: 'white' }]}>
          <View style={styles.content}>
            <Text style={{ textAlign: 'center', fontWeight: 700, fontSize: 20 }}>
              {title}
            </Text>
            {typeof children === 'function' ? children({ closeModal }) : children}
          </View>
        </Animated.View>
      </Animated.View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    // height é sobrescrita dinamicamente por windowHeight no JSX
    justifyContent: 'flex-end',
    zIndex: 9999
  },
  modalMainContainer: {
    // Sem position:absolute — é filho flex do container,
    // que já usa justifyContent:'flex-end' para ancorá-lo no rodapé.
    width: '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  content: {
    margin: 20,
    gap: 14,
    flex: 1
  }
});
