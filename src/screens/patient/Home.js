import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  Linking,
  TextInput,
  Modal,
  Alert,
} from "react-native";
// import Banner from '../../images/homeBanner.svg';
import axios from "axios";
import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome,
  FontAwesome5,
  Fontisto,
  Ionicons,
} from "@expo/vector-icons";
import { baseURL } from "../../BaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Dropdown from "../shared/Dropdown";
import BottomNavigator from "../../components/BottomNavigator";
import { connect } from "react-redux";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

import * as Location from "expo-location";
import Medicines from "./Medicines";
import Pharmacies from "./Pharmacies";
import Hospitals from "./Hospitals";
import Doctors from "./Doctors";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;
const Home = ({ navigation,cart }) => {
  const [user, setUser] = useState();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "first", title: "Medicine" },
    { key: "second", title: "Pharmacy" },
    { key: "third", title: "Clinic" },
    { key: "fourth", title: "Physician" },
  ]);

  const options = ["Option 1", "Option 2", "Option 3"];

  const MedicineRoute = () => (
    <Medicines index={index} navigation={navigation} />
  );

  const PharmacyRoute = () => (
    <Pharmacies index={index} navigation={navigation} />
  );

  const ClinicRoute = () => <Hospitals index={index} navigation={navigation} />;

  const PhysicianRoute = () => (
    <Doctors index={index} navigation={navigation} />
  );

  const renderScene = SceneMap({
    first: MedicineRoute,
    second: PharmacyRoute,
    third: ClinicRoute,
    fourth: PhysicianRoute,
  });

  const getTab = (index) => {
    switch (index) {
      case 0:
        return "Medicine";

      case 1:
        return "Pharmacy";

      case 2:
        return "Clinic";

      case 3:
        return "Physician";

      default:
        break;
    }
  };

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

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const closeDropdown = () => {
    setIsDropdownVisible(false);
  };

  useEffect(() => {
    getUser();
    const focusHandler = navigation.addListener("focus", () => {
      getUser();
    });
    return focusHandler;
  }, [navigation]);

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
            width: windowWidth - 45,
            // width: windowWidth - 135,
            alignItems: "flex-start",
            justifyContent: "center",
            marginTop: "8%",
            paddingLeft: 25,
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
        {/* <View
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
              navigation.navigate("Cart");
            }}
          >
            {cart.length>0&&(
            <View style={{width:15,height:15,borderRadius:7.5,backgroundColor:'red',marginLeft:17,marginBottom:-12,justifyContent:'center',alignItems:'center',zIndex:1}}>
              {cart.length<100&&(
                <Text style={{color:'white',fontSize:10}}>{cart.length}</Text>
              )}
            </View>
            )}
            <AntDesign name="shoppingcart" size={24} />
          </TouchableOpacity>
        </View>
        <View
          style={{
            width: 55,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            marginTop: "8%",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              toggleDropdown();
            }}
          >
            <Feather name="menu" size={20} />
          </TouchableOpacity>
        </View> */}
      </View>

      <View
        style={{
          height: (windowHeight * 7) / 8 - 80,
          backgroundColor: "#fff",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Map");
          }}
          style={{
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
            width: "90%",
            height: windowHeight / 5,
            borderRadius: 20,
          }}
        >
          <Image
            source={require("../../images/map.png")}
            style={{
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              overflow: "hidden",
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("SearchPage", { title: getTab(index) })
          }
          style={styles.searchBox}
        >
          <View style={{ justifyContent: "center", marginHorizontal: 10 }}>
            <Ionicons name="search" size={24} color="#56667C" />
          </View>
          <View style={{flexDirection:'row',flexGrow:1,justifyContent:'space-between',paddingRight:20}}>
            <Text style={{ color: "#56667C", fontSize:18}}>Search</Text>
            <Text style={{ color: "#CBD5E1", fontSize:18 }}>{getTab(index)}</Text>
          </View>
        </TouchableOpacity>

        <View
          style={{
            width: "100%",
            backgroundColor: "white",
            height: windowHeight - ((windowHeight * 13) / 40 + 130),
          }}
        >
          <View>
            <Text style={{marginLeft:'5%',fontSize:15, fontWeight:'bold', color:"#8D8D8D", marginTop:10}}>Book appointments anytime, anywhere!</Text>
          </View>
          <Hospitals index={2} navigation={navigation} />
          {/* <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            renderTabBar={(props) => {
              return (
                <TabBar
                  {...props}
                  renderLabel={({ focused, route }) => {
                    return (
                      <Text
                        style={{
                          color: focused ? "#178838" : "black",
                          fontSize: 14,
                          fontWeight: "500",
                        }}
                      >
                        {route.title}
                      </Text>
                    );
                  }}
                  indicatorStyle={styles.indicatorStyle}
                  style={styles.tabBar}
                />
              );
            }}
            initialLayout={{ width: windowWidth }}
          /> */}
        </View>
      </View>
      <BottomNavigator navigation={navigation} userRole={user?.user_type} />
      <Dropdown
        navigation={navigation}
        isVisible={isDropdownVisible}
        onClose={closeDropdown}
        names={
          user?.first_name
            ? user?.first_name + " " + user?.last_name
            : user?.names
        }
        phone={user?.phone}
      />
    </View>
  );
};

const mapStateToProps = (state) => {
  return {
    cart: state.cart.cart,
  };
};

export default connect(mapStateToProps, null)(Home);

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
    backgroundColor: "#EAF1FB",
    height: 56,
    paddingHorizontal:10,
    marginTop: 10,
    width: "90%",
    borderWidth: 1,
    borderColor: "#CEDBED",
    borderRadius: 30,
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
    backgroundColor: "#fff",
  },
  indicatorStyle: {
    backgroundColor: "#178838",
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});
