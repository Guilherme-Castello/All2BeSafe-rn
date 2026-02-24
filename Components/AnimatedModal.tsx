import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { BackHandler, Dimensions, Keyboard, StyleSheet, Text, View } from 'react-native';
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
  const height = useSharedValue(0);
  const bgOpacity = useSharedValue(0);

  useEffect(() => {
    const backAction = () => {
      closeModal(onClose)
      return true // bloqueia navegação
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    )

    return () => subscription.remove()
  }, [])

  const mainContainer = useAnimatedStyle(() => {
    return {
      height: height.value
    };
  });

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColorInterpolate = interpolateColor(
      bgOpacity.value,
      [0, 1],
      ['#00000000', '#00000050']
    );

    return {
      backgroundColor: backgroundColorInterpolate
    };
  });

  const closeModal = (callBack: () => void) => {
    bgOpacity.value = withTiming(0, { duration: 250 });
    height.value = withTiming(0, {
      duration: 500,
      easing: Easing.inOut(Easing.ease)
    });
    setTimeout(() => {
      callBack && callBack();
    }, 550);
  };

  const openModal = () => {
    bgOpacity.value = withTiming(1, { duration: 250 });
    height.value = withTiming(position, {
      duration: 500,
      easing: Easing.inOut(Easing.ease)
    });
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        height.value = withTiming(position + 300, {
          duration: 500,
          easing: Easing.inOut(Easing.ease)
        });
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        height.value = withTiming(position, {
          duration: 500,
          easing: Easing.inOut(Easing.ease)
        });
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    openModal();
  }, []);

  return (
    <Portal>
      <Animated.View style={[styles.modalBackgroundContainer, animatedStyle]}>
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
    height: Dimensions.get('screen').height,
    justifyContent: 'flex-end',
    zIndex: 9999
  },
  modalMainContainer: {
    position: 'absolute',
    width: '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  content: {
    margin: 30,
    gap: 14
  }
});
