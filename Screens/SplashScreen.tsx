import React, { useEffect, useState } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../Server/api';
import { useAuth } from '../contexts/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {

  const { setUser } = useAuth()

  const screenOpacity = useSharedValue(1);

  // Flag que verifica se o tempo minimo de exibição da Splash já passou
  const [didTimerFinished, setDidTimerFinished] = useState<boolean>(false)

  // Flag que verifica se a request de login já retornou
  const [didLoginFinished, setLoginFinished] = useState<boolean>(false)

  async function autoLogin() {
    // Logica de login aqui
    // Puxar do async storage etc etc etc
    try {
      const loginDataRaw = await AsyncStorage.getItem("credentials");

      if(!loginDataRaw) throw new Error("Login data not found")

      const loginDataJson = JSON.parse(loginDataRaw)
      const response = await api.login({email: loginDataJson.email, password: loginDataJson.password})

      if(!response.success) {
        throw new Error("Login data wrong")
      }

      setUser(response.content.user);
    } catch(e) {
      console.error(e)
    
    } finally {
      setLoginFinished(true)
    }
  }

  useEffect(() => {

    autoLogin()

    const timer = setTimeout(() => {
      screenOpacity.value = withTiming(0, { duration: 500 }, (finished) => {
        // if (finished) runOnJS(onFinish)();
      });
      setDidTimerFinished(true)
    }, 5000);

    return () => {
      setDidTimerFinished(false)
      clearTimeout(timer)
    };
  }, []);

  useEffect(() => {
    console.log("Use Effect Flags")
    if(didLoginFinished && didTimerFinished) {
      console.log("Inside if")
      console.log(didLoginFinished)
      console.log(didTimerFinished)
      runOnJS(onFinish)();
    }
  }, [didTimerFinished, didLoginFinished])

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenAnimatedStyle]}>
      <View style={styles.logoArea}>
        <LogoAnimado />
      </View>
      <Image
        source={require('../assets/Fundo.png')}
        style={styles.fundo}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

function LogoAnimado() {
  // 1. ARCO - girar + fade in (equivalente ao spinTransition do framer-motion)
  const arcoRotation = useSharedValue(-180);
  const arcoOpacity = useSharedValue(0);
  const arcoScale = useSharedValue(0.8);

  // 2. BONECO - fade in (equivalente ao fadeTransition do framer-motion)
  const bonecoOpacity = useSharedValue(0);
  const bonecoScale = useSharedValue(0.9);

  useEffect(() => {
    const easeOut = Easing.out(Easing.cubic);

    // Arco: delay 200ms, duration 1500ms, easeOut
    arcoRotation.value = withDelay(200, withTiming(0, { duration: 1500, easing: easeOut }));
    arcoOpacity.value = withDelay(200, withTiming(1, { duration: 1500, easing: easeOut }));
    arcoScale.value = withDelay(200, withTiming(1, { duration: 1500, easing: easeOut }));

    // Boneco: delay 1000ms, duration 1000ms
    bonecoOpacity.value = withDelay(1000, withTiming(1, { duration: 1000 }));
    bonecoScale.value = withDelay(1000, withTiming(1, { duration: 1000 }));
  }, []);

  const arcoStyle = useAnimatedStyle(() => ({
    opacity: arcoOpacity.value,
    transform: [
      { rotate: `${arcoRotation.value}deg` },
      { scale: arcoScale.value },
    ],
  }));

  const bonecoStyle = useAnimatedStyle(() => ({
    opacity: bonecoOpacity.value,
    transform: [{ scale: bonecoScale.value }],
  }));

  return (
    <View style={styles.logoContainer}>
      {/* ARCO COLORIDO (GIRA) */}
      <Animated.Image
        source={require('../assets/Arco.png')}
        style={[styles.arco, arcoStyle]}
        resizeMode="contain"
      />

      {/* BONECO CENTRAL (FADE IN) */}
      <Animated.Image
        source={require('../assets/boneco.png')}
        style={[styles.boneco, bonecoStyle]}
        resizeMode="contain"
      />
    </View>
  );
}

const LOGO_SIZE = 300;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  logoArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fundo: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.35,
    opacity: 0.85,
  },
  logoContainer: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  arco: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  boneco: {
    position: 'absolute',
    width: '42%',
    height: '42%',
    top: '27%',
    left: '28%',
  },
});
