import 'react-native-gesture-handler';
import React,{useEffect,useState,useRef} from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import HomeStackNavigator from './src/Navigation/Navigator';
import store from './src/redux/store';
import { CalendarProvider } from 'react-native-calendars';
// import messaging from "@react-native-firebase/messaging";
import {Platform} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

// async function schedulePushNotification() {
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title: "You've got mail! 📬",
//       body: 'Here is the notification body',
//       data: { data: 'goes here' },
//     },
//     trigger: { seconds: 2 },
//   });
// }

// async function registerForPushNotificationsAsync() {
//   let token;

//   if (Platform.OS === 'android') {
//     await Notifications.setNotificationChannelAsync('default', {
//       name: 'default',
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: '#FF231F7C',
//     });
//   }

//   if (Device.isDevice) {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== 'granted') {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== 'granted') {
//       alert('Failed to get push token for push notification!');
//       return;
//     }
//     // Learn more about projectId:
//     // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
//     token = (await Notifications.getExpoPushTokenAsync()).data;
//     console.log(token);
//   } else {
//     alert('Must use physical device for Push Notifications');
//   }

//   return token;
// }

const App = () => {
  // const [expoPushToken, setExpoPushToken] = useState('');
  // const [notification, setNotification] = useState(false);
  // const notificationListener = useRef();
  // const responseListener = useRef();
  // const requestUserPermission = async () => {
  //   const authStatus = await messaging().requestPermission();
  //   const enabled =
  //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //   if (enabled) {
  //     console.log("Authorization status:", authStatus);
  //   }
  // };
  // useEffect(() => {
  //   if (requestUserPermission()) {
  //     messaging()
  //       .getToken()
  // .then(async(token) => { await AsyncStorage.setItem('deviceToken',token)});
  //   } else {
  //     console.log("Failed to get token", authStatus);
  //   }

  //   // Assume a message-notification contains a "type" property in the data payload of the screen to open

  //   messaging().onNotificationOpenedApp(async(remoteMessage) => {
  //     console.log(
  //       "Notification caused app to open from background state:",
  //       remoteMessage.notification
  //     );
  //   //   navigation.navigate(remoteMessage.data.type);
  //   });

  //   // Check whether an initial notification is available

  //   messaging()
  //     .getInitialNotification()
  //     .then(async(remoteMessage) => {
  //       if (remoteMessage) {
  //         console.log(
  //           "Notification caused app to open from quit state:",
  //           remoteMessage.notification
  //         );
  //         //   setInitialRoute(remoteMessage.data.type); // e.g. "Settings"
  //       }
  //       // setLoading(false);
  //     });

  //     messaging().setBackgroundMessageHandler(async remoteMessage => {
  //       console.log('Message handled in the background!', remoteMessage);
  //     });
  //   const unsubscribe = messaging().onMessage(async remoteMessage => {
  //       console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
  //     });
  
  //     return unsubscribe;
  // }, []);

  // useEffect(()=>{
  //   registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

  //   notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
  //     setNotification(notification);
  //   });

  //   responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
  //     console.log(response);
  //   });

    

  //   return () => {
  //     Notifications.removeNotificationSubscription(notificationListener.current);
  //     Notifications.removeNotificationSubscription(responseListener.current);
  //   };
  // },[])
  return (
    <Provider store={store}>
      <NavigationContainer>
        <HomeStackNavigator/>
      </NavigationContainer>
    </Provider>
  );
}

export default App;