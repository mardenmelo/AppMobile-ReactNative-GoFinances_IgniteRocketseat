import React from 'react';
import AppLoading from 'expo-app-loading';
import { ThemeProvider } from 'styled-components';
import { 
  useFonts, 
  Poppins_400Regular, 
  Poppins_500Medium, 
  Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Routes } from './src/routes';
import 'intl';
import 'intl/locale-data/jsonp/pt-BR';

import theme from './src/global/styles/theme';
import { StatusBar } from 'react-native';
import { AuthProvider, useAuth } from './src/hooks/auth';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular, Poppins_500Medium, Poppins_700Bold
  })

  const { userStorageLoading } = useAuth()

  if(!fontsLoaded || userStorageLoading){
    return <AppLoading/>
  }
  return(
    <ThemeProvider theme={theme}>
        <StatusBar barStyle={'light-content'} />
        <AuthProvider>
          <Routes/>
        </AuthProvider>
    </ThemeProvider>
    ) 

}
