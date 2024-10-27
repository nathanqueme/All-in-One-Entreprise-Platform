//
//  App.js
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22
//

// @ts-check
import React from 'react'
import { Platform, UIManager } from 'react-native'
import type { Node } from 'react'



// Needed to make all aws sdks work 
import 'react-native-url-polyfill/auto'
import 'react-native-get-random-values'



// Daysjs initialization
import './src/utils/daysjsInitialization'



// Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'


// __________________________Main Views_______________________________
import ProfilePage from './src/views/main/profile/ProfilePage'
import AccountInfoTab from './src/views/main/profile/tabs/AccountInfoTab'
import RelatedItemsPage from './src/views/main/RelatedItemsPage'
import PostsPage from './src/views/main/PostsPage'
import QrCodePage from './src/views/home/accountManagement/QrCodePage'
import AnalyticsPage from './src/views/home/accountManagement/AnalyticsPage'
import AccountManager from './src/views/home/accountManagement/AccountManager'
import Settings from './src/views/home/accountManagement/settings/Settings'
import About from './src/views/home/About'
import Language from './src/views/home/accountManagement/settings/Language'


// __________________________Home in Views_____________________________
import HomeScreen from './src/views/home/HomeScreen'
import LoginScreen from './src/views/home/LoginScreen'
import AccountDeletionPage from './src/views/home/accountManagement/settings/accountDeletion/AccountDeletionPage'
import AccountDeleted from './src/views/home/accountManagement/settings/accountDeletion/AccountDeleted'
// ____________Account creation Views 
import AccountTypeSelector from './src/views/accountCreation/AccountTypeSelector'
import EmailInput from './src/views/accountCreation/EmailInput'
import ConfirmationCodeInput from './src/views/accountCreation/ConfirmationCodeInput'
import NameInput from './src/views/accountCreation/NameInput'
import UsernameInput from './src/views/accountCreation/UsernameInput';
import AddressInput from './src/views/accountCreation/AddressInput'
import PhoneNumberInput from './src/views/accountCreation/PhoneNumberInput'
import ProfilePhotoInput from './src/views/accountCreation/ProfilePhotoInput'
import PasswordInput from './src/views/accountCreation/PasswordInput'
// 
import ForgottenPassword from './src/views/home/ForgottenPassword'
import NewPasswordInput from './src/views/home/NewPasswordInput'
import PasswordChanged from './src/views/home/PasswordChanged'

// __________________________Modals (Full screen)_________________________
import PdfPage from './src/views/main/accountPdf/PdfPage'
import PdfInfo from './src/views/main/accountPdf/PdfInfo'
// Content editors
import PostCategoriesOrderEditor from './src/views/contentEditors/PostCategoriesOrderEditor'
import DailyTimetableEditor from './src/views/contentEditors/DailyTimetableEditor'
import ProfilePhotoEditor from './src/views/contentEditors/ProfilePhotoEditor'
import RelatedItemEditor from './src/views/contentEditors/RelatedItemEditor'
import CategoryEditor from './src/views/contentEditors/CategoryEditor'
import PostEditor from './src/views/contentEditors/PostEditor'
import InfoEditor from './src/views/contentEditors/InfoEditor'
import ProfileButtonsEditor from './src/views/contentEditors/ProfileButtonsEditor'


// Global data
import AsyncStorage from '@react-native-async-storage/async-storage'
import store from './src/state/store'
import { Provider } from 'react-redux'
import { Analytics } from './src/analytics'
import { useEffect } from 'react'


const Stack = createNativeStackNavigator()

// Used to animate the deletion of posts  
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}


const App: () => Node = () => {
  const enable_analytics = (process.env.NODE_ENV === "production")
  function resetAnalyticsCache() {
    AsyncStorage.setItem("@_adid", "")
    AsyncStorage.setItem("@u_s", "")
    AsyncStorage.setItem("@i_i", "")
  }
  useEffect(() => {
    if (!enable_analytics) {
      // resetAnalyticsCache()
    }
  }, [])

  return (
    <NavigationContainer>
      <Provider store={store}>
        {enable_analytics && <Analytics />}
        <AppNavigation />
      </Provider>
    </NavigationContainer>
  )
}
export default App


function AppNavigation() {
  return (
    <Stack.Navigator
      screenOptions={{
        gestureEnabled: true,
        headerShown: false,
      }}>


      {/* Signed in navigation */}
      <Stack.Group>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AccountManager" component={AccountManager} />
        <Stack.Screen name="ProfilePage" component={ProfilePage} />
        <Stack.Screen name="AccountInfoTab" component={AccountInfoTab} />
        <Stack.Screen name="RelatedItemsPage" component={RelatedItemsPage} />
        <Stack.Screen name="PostsPage" component={PostsPage} />
        <Stack.Screen name="QrCodePage" component={QrCodePage} />
        <Stack.Screen name="Analytics" component={AnalyticsPage} />
        <Stack.Screen name="About" component={About} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Language" component={Language} />
        <Stack.Screen name="InfoEditor" component={InfoEditor} />
        <Stack.Screen name="AccountDeletionPage" component={AccountDeletionPage} />
        <Stack.Screen name="AccountDeleted" component={AccountDeleted} />
      </Stack.Group>


      {/* Signed in navigation */}
      <Stack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
        <Stack.Screen name="PdfPage" component={PdfPage} />
        <Stack.Screen name="PdfInfo" component={PdfInfo} />
        {/* Content editors */}
        <Stack.Screen name="ProfilePhotoEditor" component={ProfilePhotoEditor} />
        <Stack.Screen name="RelatedItemEditor" component={RelatedItemEditor} />
        <Stack.Screen name="CategoryEditor" component={CategoryEditor} />
        <Stack.Screen name="DailyTimetableEditor" component={DailyTimetableEditor} />
        <Stack.Screen name="PostEditor" component={PostEditor} />
        <Stack.Screen name="ProfileButtonsEditor" component={ProfileButtonsEditor} />
        <Stack.Screen name="PostCategoriesOrderEditor" component={PostCategoriesOrderEditor} />
      </Stack.Group>



      {/* UnSigned in navigation */}
      <Stack.Group>
        {/* Home screen ... */}
        <Stack.Screen name="ForgottenPassword" component={ForgottenPassword} />
        <Stack.Screen name="NewPasswordInput" component={NewPasswordInput} />
        <Stack.Screen name="PasswordChanged" component={PasswordChanged} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AccountTypeSelector" component={AccountTypeSelector} />
        <Stack.Screen name="EmailInput" component={EmailInput} />
        <Stack.Screen name="ConfirmationCodeInput" component={ConfirmationCodeInput} />
      </Stack.Group>
      {/* With swipe back gesture disabled on iPhone */}
      <Stack.Group
        screenOptions={{
          gestureEnabled: false,
          headerShown: false,
        }}
      >
        <Stack.Screen name="PasswordInput" component={PasswordInput} />
        <Stack.Screen name="AddressInput" component={AddressInput} />
        <Stack.Screen name="NameInput" component={NameInput} />
        <Stack.Screen name="UsernameInput" component={UsernameInput} />
        <Stack.Screen name="PhoneNumberInput" component={PhoneNumberInput} />
        <Stack.Screen name="ProfilePhotoInput" component={ProfilePhotoInput} />
      </Stack.Group>


      {/* No animation */}


    </Stack.Navigator>
  )
}


