import React, { useReducer, useMemo, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { AuthContext } from "../context/context";
import DoctorHome from "../screens/doctor/Home";
import PatientHome from "../screens/patient/Home";
import Doctors from "../screens/patient/Doctors";
import ChatRoom from "../screens/shared/ChatRoom";
import Chats from "../screens/shared/Chats";
import RequestMeeting from "../screens/patient/RequestMeeting";
import Requests from "../screens/doctor/Requests";
import Login from "../screens/shared/auth/Login";
import Signup from "../screens/shared/auth/Signup";
import Profile from "../screens/shared/Profile";
import Results from "../screens/shared/Results";
import GiveAccess from "../screens/patient/GiveAccess";
import Patients from "../screens/doctor/Patients";
import { baseURL } from "../BaseUrl";
import AddSchedule from "../screens/doctor/AddSchedule";
import CashBoard from "../screens/doctor/CashBoard";
import Otp from "../screens/shared/auth/Otp";
import Testimonials from "../screens/shared/Testimonials";
import Comments from "../screens/doctor/Comments";
import Hospitals from "../screens/patient/Hospitals";
import Appointments from "../screens/doctor/Appointments";
import Appointments2 from "../screens/patient/Appointments";
import Documents from "../screens/patient/Documents";
import SubPatients from "../screens/patient/SubPatients";
import MyInsurance from "../screens/patient/MyInsurance";
import InsuranceDetails from "../screens/patient/InsuranceDetails";
import DocHospitals from "../screens/doctor/DocHospitals";
import InsuranceInfo from "../screens/patient/InsuranceInfo";
import Journeys from "../screens/patient/Journeys";
import MyBills from "../screens/patient/MyBills";
import Notifications from "../screens/shared/Notifications";
import Calendar from "../screens/patient/Calendar";
import Map from "../screens/patient/Map";
import SearchPage from "../screens/patient/SearchPage";
import MedicineDetails from "../screens/patient/MedicineDetails";
import PharmacyDetails from "../screens/patient/PharmacyDetails";
import MedicinePharmacies from "../screens/patient/MedicinePharmacies";
import FollowUps from "../screens/patient/FollowUps";
import AddMedicine from "../screens/patient/AddMedicine";
import Tokens from "../screens/patient/Tokens";
import Cart from "../screens/patient/Cart";
import Direction from "../screens/patient/Direction";
import TokenDetails from "../screens/patient/TokenDetails";
import Prescriptions from "../screens/patient/Prescriptions";
import TokenMedications from "../screens/patient/TokenMedications";
import Report from "../screens/patient/Report";
import ImageEditorScreen from "../screens/patient/ImageEditorScreen";
import BookAppointment from "../screens/patient/BookAppointment";

const Stack = createStackNavigator();
const screenOptionStyle = {
  headerShown: false,
};

const HomeStackNavigator = (props) => {
  const initialState = {
    isLoading: true,
    token: null,
    user: null,
    role: null,
  };

  const loginReducer = (prevState, action) => {
    switch (action.type) {
      case "RETRIEVE_TOKEN":
        return {
          ...prevState,
          token: action.token,
          isLoading: false,
          user: action.user,
          role: action.role,
        };
      case "LOGIN":
        return {
          ...prevState,
          token: action.token,
          isLoading: false,
          user: action.user,
          role: action.role,
        };
      case "LOGOUT":
        return {
          ...prevState,
          isLoading: false,
          token: null,
          user: null,
          role: null,
        };
    }
  };

  const [loginState, dispatch] = useReducer(loginReducer, initialState);

  const authContext = useMemo(() => ({
    otpSignIn: async (user_id,otp) => {
      const postObj = JSON.stringify({
        doctor_id:user_id,
        otp:otp
      })
      axios
            .post(`${baseURL}/api/verify-doctor`, postObj,{headers:{"Content-Type": "application/json"}})
            .then((res) => {
              if (res.data.status === true) {
                const items = [
                  ["token", "my token"],
                  ["user", JSON.stringify(res.data.data)],
                  ["role", "doctor"],
                ];
                AsyncStorage.multiSet(items, () => {
                  console.log("asyncstorage set successfully");
                });
                dispatch({
                  type: "LOGIN",
                  token: res.data.token,
                  user: JSON.stringify(res.data.data),
                  role: "doctor",
                });
              } else {
                alert(res.data.message);
              }
            })
            .catch((err) => {
              alert(err.message);
            });
    },
    signIn: async ( phone, password) => {
      const postObj = JSON.stringify({
        phone: phone,
        password: password,
        user_type:"patient"
      });


      axios.defaults.headers = {
        "Content-Type": "application/json",
      };
      axios
        .post(`${baseURL}/api/login`, postObj)
        .then((res) => {
          if (res.data.status === true) {
            const items = [
              ["token", res.data.token],
              ["user", JSON.stringify(res.data.user)],
              ["role", "patient"],
            ];
            AsyncStorage.multiSet(items, () => {
              console.log("asyncstorage set successfully");
            });
            dispatch({
              type: "LOGIN",
              token: res.data.token,
              user: JSON.stringify(res.data.user),
              role: "patient",
            });
          } else {
            alert(res.data.message);
          }
        })
        .catch((error) => {
          console.log(error);
          alert("Something went wrong");
        });
    },

    signOut: async () => {
      try {
        await AsyncStorage.multiRemove(["token", "user"]);
      } catch (error) {
        console.log(error);
      }
      dispatch({ type: "LOGOUT" });
    },
  }));

  const retrieveData = async () => {
    let token;
    let user;
    let role;
    try {
      const data = await AsyncStorage.multiGet(["token", "user", "role"]);
      const new_data = data.map((entry) => entry[1]);
      token = new_data[0];
      user = new_data[1];
      role = new_data[2];

      dispatch({
        type: "RETRIEVE_TOKEN",
        token: token,
        user: user,
        role: role,
      });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect( () => {
    retrieveData();
  }, []);

  if (loginState.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  } else {
    if (loginState.token !== null) {
      if (loginState.role === "doctor") {
        return (
          <AuthContext.Provider value={authContext}>
            <Stack.Navigator screenOptions={screenOptionStyle}>
              <Stack.Screen name="DoctorHome" component={DoctorHome} />
              <Stack.Screen name="DocHospitals" component={DocHospitals} />
              <Stack.Screen name="Chats" component={Chats} />
              <Stack.Screen name="Patients" component={Patients} />
              <Stack.Screen name="Requests" component={Requests} />
              <Stack.Screen name="ChatRoom" component={ChatRoom} />
              <Stack.Screen name="Profile" component={Profile} />
              <Stack.Screen name="Results" component={Results} />
              <Stack.Screen name="AddMedicine" component={AddMedicine} />
              <Stack.Screen name="AddSchedule" component={AddSchedule} />
              <Stack.Screen name="cashboard" component={CashBoard} />
              <Stack.Screen name="Comments" component={Comments} />
              <Stack.Screen name="Appointments" component={Appointments} />
              <Stack.Screen name="Testimonials" component={Testimonials} />
              <Stack.Screen name="TokenDetails" component={TokenDetails} />
              <Stack.Screen name="Notifications" component={Notifications} />
            </Stack.Navigator>
          </AuthContext.Provider>
        );
      } else {
        return (
          <AuthContext.Provider value={authContext}>
            <Stack.Navigator screenOptions={screenOptionStyle}>
              <Stack.Screen name="PatientHome" component={PatientHome} />
              <Stack.Screen name="Chats" component={Chats} />
              <Stack.Screen name="Doctors" component={Doctors} />
              <Stack.Screen name="RequestMeeting" component={RequestMeeting} />
              <Stack.Screen name="GiveAcess" component={GiveAccess} />
              <Stack.Screen name="ChatRoom" component={ChatRoom} />
              <Stack.Screen name="Profile" component={Profile} />
              <Stack.Screen name="Results" component={Results} />
              <Stack.Screen name="Hospitals" component={Hospitals} />
              <Stack.Screen name="Comments" component={Comments} />
              <Stack.Screen name="Testimonials" component={Testimonials} />
              <Stack.Screen name="Documents" component={Documents} />
              <Stack.Screen name="SubPatients" component={SubPatients} />
              <Stack.Screen name="MyInsurance" component={MyInsurance} />
              <Stack.Screen name="InsuranceDetails" component={InsuranceDetails} />
              <Stack.Screen name="InsuranceInfo" component={InsuranceInfo} />
              <Stack.Screen name="Journeys" component={Journeys} />
              <Stack.Screen name="MyBills" component={MyBills} />
              <Stack.Screen name="Notifications" component={Notifications} />
              <Stack.Screen name="Calendar" component={Calendar} />
              <Stack.Screen name="Map" component={Map} />
              <Stack.Screen name="SearchPage" component={SearchPage} />
              <Stack.Screen name="MedicineDetails" component={MedicineDetails} />
              <Stack.Screen name="MedicinePharmacies" component={MedicinePharmacies} />
              <Stack.Screen name="PharmacyDetails" component={PharmacyDetails} />
              <Stack.Screen name="FollowUps" component={FollowUps} />
              <Stack.Screen name="AddMedicine" component={AddMedicine} />
              <Stack.Screen name="AddSchedule" component={AddSchedule} />
              <Stack.Screen name="Tokens" component={Tokens} />
              <Stack.Screen name="Cart" component={Cart} />
              <Stack.Screen name="Direction" component={Direction} />
              <Stack.Screen name="TokenDetails" component={TokenDetails} />
              <Stack.Screen name="Prescriptions" component={Prescriptions} />
              <Stack.Screen name="TokenMedications" component={TokenMedications} />
              <Stack.Screen name="Report" component={Report} />
              <Stack.Screen name="BookAppointment" component={BookAppointment} />
              <Stack.Screen name="Appointments" component={Appointments2} />
              <Stack.Screen name="ImageEditor" component={ImageEditorScreen} />
            </Stack.Navigator>
          </AuthContext.Provider>
        );
      }
      
    } else {
      return (
        <AuthContext.Provider value={authContext}>
          <Stack.Navigator screenOptions={screenOptionStyle}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Otp" component={Otp} />
            <Stack.Screen name="Signup" component={Signup} />
          </Stack.Navigator>
        </AuthContext.Provider>
      );
    }
  }
};

export default HomeStackNavigator;
