import * as React from 'react';
import { NavigationContainer, useNavigation, useNavigationState } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FormCreate from './Screens/FormCreate';
import FormList from './Screens/FormList';
import FormViewer from './Screens/FormViewer';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { PortalProvider } from '@gorhom/portal';
import Login from './Screens/Login';
import { screens } from './Utils/screens';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors } from './Utils/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function Header() {
  const { newForm } = useAuth()

  const navigation = useNavigation();
  // @ts-ignore
  const openDrawer = () => navigation.toggleDrawer()

  const state = useNavigationState(state => state);
  console.log("Navigation state:", state);

  // Última rota ativa
  const currentRoute = state.routes[state.index];
  console.log("Tela atual:", currentRoute.name);

  function renderHeaderButton(routeName: string) {
    switch (routeName) {
      case "Login":
        return <></>
      case "Templates":
        return <TouchableOpacity onPress={openDrawer}>
          <MaterialCommunityIcons name='menu' size={26} color={'white'} />
        </TouchableOpacity>
      default:
        return <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name='arrow-left' size={26} color={'white'} />
        </TouchableOpacity>
    }
  }

  const routeName = (currentRoute.name == 'FormCreate' && newForm && newForm.config && newForm.config.name) ? newForm.config.name : currentRoute.name

  return (
    <View style={{ backgroundColor: colors.primary, height: 100, width: '100%', justifyContent: 'flex-end' }}>
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 20, bottom: 10 }}>
        {renderHeaderButton(currentRoute.name)}
        <Text style={{ color: 'white', fontSize: 20 }}>{routeName}</Text>
      </View>
    </View>
  )
}

function CustomDrawerContent(props: any) {
  const navigation = useNavigation();

  const state = useNavigationState(state => state);
  const currentRoute = state.routes[state.index];
  const { user, setUser } = useAuth()

  function logOut() {
    setUser(undefined)
    AsyncStorage.removeItem('credentials')
  }

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ alignContent: 'space-between', flex: 1, justifyContent: 'space-between'}}>
      <View style={{ gap: 20}}>
        <Text style={{ fontSize: 30, textAlign: 'center' }}>All 2B Safe</Text>
        {screens.map(screen => {
          if (!screen.showInDrawer || Number(user?.access_level) < screen.requiredPermission) return
          return (
            <DrawerItem
              label={screen.label}
              onPress={() => props.navigation.navigate(screen.name)}
              style={[currentRoute.name == screen.name ? { backgroundColor: colors.primary + '50' } : {}]}
              icon={() => <MaterialCommunityIcons name={(screen.icon ?? 'pen') as "key"} size={20} color={colors.primary} />}
            />
          )
        })}
      </View>
      <View style={{ gap: 20, marginBottom: 40 }}>
        <TouchableOpacity
          onPress={() => logOut()}
          style={{ backgroundColor: colors.danger, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', gap: 10 }}
        >
          <MaterialCommunityIcons name={'exit-run'} size={20} color={'white'} />
          <Text style={{ color: 'white', fontWeight: 700 }}>Logout</Text>
        </TouchableOpacity>
        <Text style={{textAlign: 'center'}}>v1.0.0</Text>
      </View>

    </DrawerContentScrollView >
  );
}

function PrivateRouter() {
  return (
    <Drawer.Navigator screenOptions={{ header: () => <Header /> }} drawerContent={props => <CustomDrawerContent {...props} />}>
      {screens.map((screen, idx) => {
        return (
          <Drawer.Screen
            name={screen.name}
            component={screen.component}
            key={idx + 'route'}
            options={{
              swipeEnabled: screen.name != 'Login'
            }} />
        )
      })}
    </Drawer.Navigator>

  )
}

function PublicRouter(){
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
}

function Routes(){
  const { user } = useAuth();
  React.useEffect(() => {
    console.log(user)
  }, [user])
  if(user){
    return <PrivateRouter/>
  } else {
    return <PublicRouter/>
  }
}

export default function App() {
  return (
    <PortalProvider>
      <AuthProvider>
        <NavigationContainer>
          <Routes/>
        </NavigationContainer>
      </AuthProvider>
    </PortalProvider>
  );
}
