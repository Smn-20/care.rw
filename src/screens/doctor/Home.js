import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import {
  Feather,
  Fontisto,
} from "@expo/vector-icons";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import Patients from "./Patients";
import Requests from "./Requests";
import Tokens from "./Tokens";
import BottomNavigator from "../../components/BottomNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;
const Home = ({ navigation }) => {
  const [user, setUser] = useState();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "first", title: "Patients" },
    { key: "second", title: "Requests" },
    { key: "third", title: "Tokens" },
  ]);

  const PatientRoute = () => <Patients navigation={navigation} index={index} />;

  const PendingRoute = () => <Requests navigation={navigation} index={index} />;

  const TokenRoute = () => <Tokens navigation={navigation} index={index} />;

  const renderScene = SceneMap({
    first: PatientRoute,
    second: PendingRoute,
    third: TokenRoute,
  });

  //   const [initialRoute, setInitialRoute] = useState('PatientHome');

  const getUser = async () => {
    const user_ = await AsyncStorage.getItem("user");
    const deviceToken = await AsyncStorage.getItem("deviceToken");
    const userObj = JSON.parse(user_);
    setUser(userObj);
    if (userObj.device_token !== deviceToken || !userObj.device_token) {
      // saveDeviceToken(userObj, deviceToken);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  // const saveDeviceToken = async (profile, deviceToken) => {
  //   const token = await AsyncStorage.getItem("token");
  //   const postObj = JSON.stringify({
  //     fullname: profile.fullname,
  //     email: profile.email,
  //     phone: profile.phone,
  //     date_of_birth: profile.date_of_birth,
  //     other_info: profile.other_info,
  //     is_online: "1",
  //     device_token: deviceToken,
  //     registration_number: profile.registration_number,
  //     type: profile.type,
  //     qualification: profile.qualification,
  //   });

  //   axios
  //     .post(`${baseURL}/api/update-user/${profile?.id}`, postObj, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .then((res) => {
  //       if (res.data.success == true) {
  //         console.log("You will receive notifications on this device.");
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };

  return (
    <View styles={styles.container}>
      <StatusBar
        backgroundColor="#fff"
        barStyle="dark-content"
        translucent={false}
      />
      <View
        style={{
          width: windowWidth,
          backgroundColor: "#fff",
          height: windowHeight / 8,
          flexDirection: "row",
        }}
      >
        <View
          underlayColor="transparent"
          style={{
            width: "75%",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingLeft: 25,
            marginTop: "8%",
          }}
        >
          <Image
            source={require("../../images/logo.png")}
            style={{ width: 100 }}
            resizeMode="contain"
          />
        </View>
        <View
          style={{
            width: 40,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            marginTop: "8%",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Notifications");
            }}
          >
            <Fontisto name="bell" size={24} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            width: 40,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            marginTop: "8%",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Profile");
            }}
          >
            <Feather name="settings" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{ height: (windowHeight * 7) / 8, backgroundColor: "#FBF9F1" }}
      >
        <View
          style={{ width: "100%", backgroundColor: "white", height: "100%" }}
        >
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            renderTabBar={(props) => {
              return (
                <TabBar
                  {...props}
                  renderLabel={({ focused, route }) => {
                    return (
                      <View
                        style={{
                          borderWidth: 0.3,
                          borderColor: "gray",
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 15,
                          backgroundColor: focused ? "#2FAB4F" : "transparent",
                        }}
                      >
                        <Text
                          style={{
                            color: focused ? "white" : "black",
                            fontSize: 14,
                            fontWeight: "500",
                          }}
                        >
                          {route.title}
                        </Text>
                      </View>
                    );
                  }}
                  indicatorStyle={styles.indicatorStyle}
                  style={styles.tabBar}
                />
              );
            }}
            initialLayout={{ width: windowWidth }}
          />
        </View>
      </View>
      <BottomNavigator navigation={navigation} userRole={user?.user_type}/>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shadow: {
    shadowColor: "#707070",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.65,
    elevation: 8,
  },
  searchBox: {
    flexDirection: "row",
    backgroundColor: "#DEDBCE",
    height: 40,
    marginTop: 10,
    width: "90%",
    borderRadius: 20,
    alignSelf: "center",
    alignItems: "center",
  },
  popupContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popupText: {
    fontSize: 20,
    color: "white",
    marginBottom: 20,
  },
  popupLink: {
    fontSize: 16,
    color: "#178838",
    marginBottom: 10,
  },
  popupCloseButton: {
    fontSize: 16,
    color: "white",
  },
  modalContent: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
    elevation: 5,
    width: "90%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  tabBar: {
    backgroundColor: "#E7FAE6",
  },
  indicatorStyle: {
    backgroundColor: "#E7FAE6",
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});
