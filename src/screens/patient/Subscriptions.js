import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { baseURL } from "../../BaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";


const windowHeight = Dimensions.get("screen").height;
const windowWidth = Dimensions.get("screen").width;

const Subscriptions = ({ navigation, index }) => {
  const [refreshing, setRefreshing] = useState();
  const [subscriptions, setSubscriptions] = useState([]);


  const getSubscriptions = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);
    axios
      .get(`${baseURL}/api/patient/subscriptions/${userObj.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setSubscriptions(res.data.data);
        setRefreshing(false);
      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  };


  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          backgroundColor: "#F5F4EC",
          paddingTop: 15,
          paddingBottom: 5,
          alignSelf: "center",
          borderRadius: 10,
          marginTop: 10,
          width: "90%",
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: "20%", alignItems: "center" }}>
            <Image
              source={require("../../images/doctor1.png")}
              resizeMode="stretch"
              style={{
                backgroundColor: "white",
                marginTop: 5,
                width: 40, // Adjust the width as per your design
                height: 40, // Adjust the height as per your design
                borderRadius: 32.5, // Set the borderRadius to half of width/height to create a circle
                overflow: "hidden", // Clip the image to the rounded shape
              }}
            />
          </View>
          <View
            style={{
              width: "80%",
              justifyContent: "center",
              marginBottom: 15,
            }}
          >
            <View style={{ flexDirection: "row", marginBottom: 5 }}>
              <View style={{ width: "70%" }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: "black",
                    marginBottom: 5,
                    fontWeight: "bold",
                  }}
                >
                  Dr. {item.doctor_name}
                </Text>
              </View>
              <View style={{ width: "30%" }}>
                <Text
                  style={{
                    fontSize: 13,
                    color:
                      item.remaining_days > 0
                        ?"green"
                        : "red",
                    marginBottom: 5,
                    fontWeight: "bold",
                  }}
                >
                  {item.remaining_days} days
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  paddingRight: 8,
                  borderRightColor: "gray",
                  borderRightWidth: 0.3,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "black",
                    marginBottom: 5,
                    fontWeight: "500",
                  }}
                >
                  {item.department_name}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: "black",
                  marginBottom: 5,
                  fontWeight: "500",
                  marginLeft: 8,
                }}
              >
                Reg.No: {item.registration_number}
              </Text>
            </View>
          </View>
        </View>
        {item.remaining_days>0&&(
                <TouchableOpacity
                onPress={() => {
                    navigation.navigate("ChatRoom", {
                        names: item.doctor_name,
                        id: item.doctor_id,
                        userType:"patient",
                      });
                }}
                style={{
                  flexDirection: "row",
                  backgroundColor: "white",
                  height: 35,
                  alignSelf: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 17.5,
                  marginTop: 5,
                  marginBottom:5,
                  width: "90%",
                }}
              >
                    <MaterialCommunityIcons
                      color={"#178838"}
                      name="chat-processing"
                      size={14}
                    />
                    <Text
                      style={{
                        marginHorizontal: 5,
                        fontSize: 11,
                        fontWeight: "700",
                        color: "#178838",
                      }}
                    >
                      Chat
                    </Text>
              </TouchableOpacity>
            )}
      </View>
    );
  };

  useEffect(() => {
    if (index == 1) {
      getSubscriptions();
    }
  }, []);

  return (
    <View styles={styles.container}>
      {subscriptions.length > 0 ? (
        <FlatList
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          data={subscriptions}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => getSubscriptions()}
            />
          }
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            No subscription yet!
          </Text>
        </View>
      )}

    </View>
  );
};

export default Subscriptions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    borderRadius: 20,
    height: 40,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#FBF9F1",
    paddingVertical: 20,
    borderRadius: 20,
    elevation: 5,
    width: "95%",
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
  cancelButton: {
    borderColor: "red",
    borderWidth: 1,
  },
  confirmButton: {
    backgroundColor: "#178838",
  },
  dropdown: {
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: 15,
    borderWidth: 0.3,
    alignSelf:'center',
    borderColor: "black",
    marginTop: 5,
    width: "90%",
  },
  dropdown2: {
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: 5,
    borderWidth: 0.3,
    borderColor: "black",
    marginTop: 5,
    width: "100%",
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
    color: "#626262",
    fontSize: 14,
    marginLeft: 10,
  },
  selectedTextStyle: {
    fontSize: 16,
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
