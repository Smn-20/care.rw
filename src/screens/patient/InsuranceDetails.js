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
  TouchableHighlight,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import {
  Feather,
  FontAwesome,
  Entypo,
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";
import { baseURL } from "../../BaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Dropdown from "../shared/Dropdown";

import * as Location from 'expo-location';

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;
const InsuranceDetails = ({ navigation,route }) => {
//   const [user, setUser] = useState();



  useEffect(() => {
      //function here
    const focusHandler = navigation.addListener("focus", () => {
      //function here
    });
    return focusHandler;
  }, [navigation]);


  return (
    <View styles={styles.container}>
      <StatusBar
        backgroundColor="#178838"
        barStyle="dark-content"
        translucent={false}
      />
      <View
        style={{
          width: windowWidth,
          backgroundColor: "#178838",
          height: windowHeight / 8,
          flexDirection: "row",
        }}
      >
        <TouchableOpacity
          style={{
            width: "20%",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
          onPress={() => navigation.goBack()}
        >
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: "#F6B6BC",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather name="chevron-left" size={24} color="#178838" />
          </View>
        </TouchableOpacity>
        <View
          style={{
            width: "65%",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "8%",
          }}
        >
          <Text style={{ color: "white", fontSize: 14, textAlign: "center" }}>
            Insurance Details
          </Text>
        </View>
        <View
          style={{
            width: "10%",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            marginTop: "8%",
          }}
        ></View>
      </View>
     
     
      <ScrollView style={{ height: (windowHeight * 7) / 8 }}>
       
        

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginBottom: windowWidth / 10,
            marginTop: windowWidth / 5
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("InsuranceInfo",{insurance_id:route.params.insurance_id,insurance_code:route.params.insurance_code});
            }}
            style={{
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
              width: windowWidth / 2.3,
              height: windowHeight / 5,
              borderRadius: 20,
              ...styles.shadow,
            }}
          >
           
            <Image
              source={require("../../images/resume.png")}
              style={{ width: windowWidth / 6, height: windowWidth / 6 }}
              resizeMode="contain"
            />
            <Text
              style={{ color: "#178838", marginTop: 25, textAlign: "center" }}
            >
              My Info
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Journeys",{insurance_code:route.params.insurance_code});
            }}
            style={{
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
              width: windowWidth / 2.3,
              height: windowHeight / 5,
              borderRadius: 20,
              ...styles.shadow,
            }}
          >
            <Image
              source={require("../../images/customer-behavior.png")}
              style={{ width: windowWidth / 6, height: windowWidth / 6 }}
              resizeMode="contain"
            />
            <Text
              style={{ color: "#178838", marginTop: 25, textAlign: "center" }}
            >
              My Visits
            </Text>
          </TouchableOpacity>

        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginVertical: windowWidth / 10,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("MyBills",{insurance_code:route.params.insurance_code});
            }}
            style={{
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
              width: windowWidth / 2.3,
              height: windowHeight / 5,
              borderRadius: 20,
              ...styles.shadow,
            }}
          >
            <Image
              source={require("../../images/bill.png")}
              style={{ width: windowWidth / 6, height: windowWidth / 6 }}
              resizeMode="contain"
            />
            <Text
              style={{ color: "#178838", marginTop: 25, textAlign: "center" }}
            >
              My Bills
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Approvals",{insurance_code:route.params.insurance_code,insurance_id:route.params.insurance_id});
            }}
            style={{
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
              width: windowWidth / 2.3,
              height: windowHeight / 5,
              borderRadius: 20,
              ...styles.shadow,
            }}
          >
            <Image
              source={require("../../images/approval.png")}
              style={{ width: windowWidth / 6, height: windowWidth / 6 }}
              resizeMode="contain"
            />
            <Text
              style={{ color: "#178838", marginTop: 25, textAlign: "center" }}
            >
              My approvals
            </Text>
          </TouchableOpacity>
        </View>


      </ScrollView>

    </View>
  );
};

export default InsuranceDetails;

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
});
