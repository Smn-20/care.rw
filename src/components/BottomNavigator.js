import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import {  Entypo, MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;


const BottomNavigator = ({ navigation, userRole }) => {
  


  return (
    <View
      style={{
        overflow: "visible",
        position: "absolute",
        backgroundColor: "#F8FAFC",
        height: 80,
        top: Dimensions.get("window").height - 80,
        flexDirection: "row",
        width: "100%",
        padding: 10,
        alignSelf: "center",
        ...styles.shadow,
      }}
    >
      
      {userRole==="patient" || userRole==="ivas"?
      <>
      <TouchableOpacity
        style={{ justifyContent: "center", alignItems: "center", width: "25%" }}
        onPress={() =>
          navigation.navigate("PatientHome")
        }
      >
        <Feather name="home" size={30} color="#243856" />
        <Text style={{ color: "black", fontSize: 12 }}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ justifyContent: "center", alignItems: "center", width: "25%" }}
        onPress={() =>
          navigation.navigate("Documents")
        }
      >
        <Image source={require('../images/docs.png')} style={{width:30,height:30}} resizeMode="contain"/>
        <Text style={{ color: "black", fontSize: 12 }}>Documents</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ justifyContent: "center", alignItems: "center", width: "25%" }}
        onPress={() =>
          navigation.navigate("FollowUps")
        }
      >
        <Image source={require('../images/meds.png')} style={{width:30,height:30}} resizeMode="contain"/>
        <Text style={{ color: "black", fontSize: 12 }}>My Medication</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ justifyContent: "center", alignItems: "center", width: "25%" }}
        onPress={() => navigation.navigate("Tokens")}
      >
        <Image source={require('../images/tokens.png')} style={{width:30,height:30}} resizeMode="contain"/>
        <Text style={{ color: "black", fontSize: 12 }}>Tokens</Text>
      </TouchableOpacity>
      </>
      :
      <>
      <TouchableOpacity
        style={{ justifyContent: "center", alignItems: "center", width: "33%" }}
        onPress={() =>
          navigation.navigate("DoctorHome")
        }
      >
        <Feather name="home" size={30} color="#243856" />
        <Text style={{ color: "black", fontSize: 12 }}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ justifyContent: "center", alignItems: "center", width: "34%" }}
        onPress={() =>
          navigation.navigate("Chats")
        }
      >
        <Ionicons name="chatbubble-ellipses-outline" size={30} color="#243856"/>
        <Text style={{ color: "black", fontSize: 12 }}>Chats</Text>
      </TouchableOpacity>


      <TouchableOpacity
        style={{ justifyContent: "center", alignItems: "center", width: "33%" }}
        onPress={() => navigation.navigate("cashboard")}
      >
        <Ionicons name="wallet-outline" size={30} color="#243856"/>
        <Text style={{ color: "black", fontSize: 12 }}>Cashboard</Text>
      </TouchableOpacity>
      </>
      }

      
    </View>
  );
};
export default BottomNavigator;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
  },

  top: {
    flexDirection: "row",
    width: "15%",
    borderRadius: 100,
    overflow: "hidden",
    marginTop: 10,
  },
  av: {
    width: 40,
    height: 40,
    borderRadius: 100,
    marginLeft: "10%",
  },
  ci: {
    backgroundColor: "#9ef01a",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: -5,
    marginTop: 5,
  },
  textInput: {
    flex: 1,
    borderBottomWidth: 0.3,
    marginTop: Platform.OS === "ios" ? 0 : -12,
    paddingLeft: 10,
    color: "#05375a",
  },
  dropdown: {
    height: 50,
    backgroundColor: "#212529",
    borderRadius: 8,
    alignSelf:'center',
    paddingHorizontal:8,
    marginBottom: 10,
    marginTop: 10,
    width: "90%",
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    color: "#A5AAB6",
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#A5AAB6",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
