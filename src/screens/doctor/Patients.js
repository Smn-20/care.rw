import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Image,
  Alert,
  TextInput,
  ActivityIndicator
} from "react-native";
import { baseURL } from "../../BaseUrl";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const windowHeight = Dimensions.get("screen").height;
const windowWidth = Dimensions.get("screen").width;

const Patients = ({ navigation, index }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState();
  const [patients, setPatients] = useState([]);



  const getPatients = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user)
    axios
      .get(`${baseURL}/api/chat/patient-profile/${userObj.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setPatients(res.data.data);
        setRefreshing(false);
      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  };

  const revoke = async (id) => {
    const token = await AsyncStorage.getItem("token");
    const postObj = JSON.stringify({
      access_id: id,
    });
    axios
        .put(`${baseURL}/api/access-control/revoke`, postObj, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setLoading(false);
          if (res.data.status) {
            alert("Access revoked successfully!");
            getPatients();
          } else {
            alert("Something went wrong!");
          }
        })
        .catch((error) => {
          alert(error.message);
        });
  }

  const revokeAlert = (id) =>
    Alert.alert(
      "Revoke Access",
      "Are you sure you want to revoke access to this physician",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => revoke(id) },
      ]
    );

  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          backgroundColor: "#F5F4EC",
          paddingTop: 15,
          paddingRight: 10,
          alignSelf: "center",
          borderRadius: 10,
          marginTop: 10,
          width: "90%",
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: "30%", alignItems: "center" }}>
            <Image
              source={require("../../images/doctor1.png")}
              resizeMode="stretch"
              style={{
                backgroundColor: "white",
                marginTop: 5,
                width: 65, // Adjust the width as per your design
                height: 65, // Adjust the height as per your design
                borderRadius: 32.5, // Set the borderRadius to half of width/height to create a circle
                overflow: "hidden", // Clip the image to the rounded shape
              }}
            />
          </View>
          <View
            style={{
              width: "70%",
              justifyContent: "center",
              marginBottom: 15,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: "black",
                marginBottom: 5,
                fontWeight: "bold",
              }}
            >
              {item.first_name} {item.last_name}
            </Text>
            <View style={{ flexDirection: "row" }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: "black",
                    marginBottom: 5,
                    fontWeight: "500",
                  }}
                >
                  phone: {item.phone}
                </Text>

            </View>

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('AddMedicine',{userId:item.id,userType:'doctor'});
                }}
                style={{
                  flexDirection: "row",
                  height: 25,
                  borderWidth: 1,
                  borderColor: "#178838",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 15,
                  marginTop: 5,
                  width: "50%",
                }}
              >
                <AntDesign name="plus" size={14} />
                <Text
                  style={{
                    marginHorizontal: 5,
                    fontSize: 11,
                    fontWeight: "700",
                    color: "#000",
                  }}
                >
                  Add Medicine
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("ChatRoom",{names:`${item.first_name} ${item.last_name}`,id:item.id, userType:'doctor'})
                }}
                style={{
                  flexDirection: "row",
                  backgroundColor: "#178838",
                  height: 25,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 15,
                  marginTop: 5,
                  width: "40%",
                }}
              >
                <Ionicons
                  color={"white"}
                  name="chatbubbles-outline"
                  size={14}
                />
                <Text
                  style={{
                    marginHorizontal: 5,
                    fontSize: 11,
                    fontWeight: "700",
                    color: "#fff",
                  }}
                >
                  Chat
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    if(index==0 && patients.length==0){
    getPatients();
    }
  }, []);

  return (
    <View styles={styles.container}>
      {patients.length > 0 ? (
        <FlatList
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          data={patients}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => getPatients()}
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
            No patient yet!
          </Text>
        </View>
      )}

    </View>
  );
};

export default Patients;

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
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    width: "80%",
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
});
