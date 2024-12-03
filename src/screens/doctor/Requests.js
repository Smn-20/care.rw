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
import { AntDesign, FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const windowHeight = Dimensions.get("screen").height;
const windowWidth = Dimensions.get("screen").width;

const Requests = ({ navigation, index }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState();
  const [patients, setPatients] = useState([]);



  const getPatients = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user)
    axios
      .get(`${baseURL}/api/access-requests/pending/${userObj.id}`, {
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

  const approve = async (id) => {
    const token = await AsyncStorage.getItem("token");

    axios
        .put(`${baseURL}/api/access-requests/approve/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setLoading(false);
          if (res.data.status) {
            alert("Request approved successfully!");
            getPatients();
          } else {
            alert("Something went wrong!");
          }
        })
        .catch((error) => {
          alert(error.message);
        });
  }


  const reject = async (id) => {
    const token = await AsyncStorage.getItem("token");

    axios
        .put(`${baseURL}/api/access-requests/decline/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setLoading(false);
          if (res.data.status) {
            alert("Request rejected!");
            getPatients();
          } else {
            alert("Something went wrong!");
          }
        })
        .catch((error) => {
          alert(error.message);
        });
  }

  const approveAlert = (id) =>
    Alert.alert(
      "Approve Request",
      "Are you sure you want to approve this request",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => approve(id) },
      ]
    );

    const rejectAlert = (id) =>
    Alert.alert(
      "Reject Request",
      "Are you sure you want to reject this request",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => reject(id) },
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
        <View>
          <View
            style={{
              justifyContent: "center",
              marginBottom: 15,
              paddingLeft:20,
              paddingRight:20,
            }}
          >
            <View style={{ flexDirection: "row" }}>
            <View style={{ margin:5, alignItems: "center" }}>
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
            <View style={{justifyContent:'center',marginLeft:20}}>
            <Text
              style={{
                fontSize: 13,
                color: "black",
                marginBottom: 5,
                fontWeight: "bold",
              }}
            >
              {item.user.first_name} {item.user.last_name}
            </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "black",
                  marginBottom: 5,
                  fontWeight: "500",
                }}
              >
                {item.user.phone}
              </Text>
            </View>
              
            </View>

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                onPress={() => {
                  approveAlert(item.id);
                }}
                style={{
                  flexDirection: "row",
                  height: 25,
                  borderWidth: 1,
                  borderColor: "#178838",
                  paddingHorizontal:10,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 15,
                  marginTop: 5,
                }}
              >
                <AntDesign name="check" size={14} />
                <Text
                  style={{
                    marginHorizontal: 5,
                    fontSize: 11,
                    fontWeight: "700",
                    color: "#000",
                  }}
                >
                  Approve request
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  rejectAlert(item.id);
                }}
                style={{
                  flexDirection: "row",
                  height: 25,
                  borderWidth: 1,
                  borderColor: "red",
                  paddingHorizontal:10,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 15,
                  marginTop: 5,
                }}
              >
                <FontAwesome5 name="times" size={14} />
                <Text
                  style={{
                    marginHorizontal: 5,
                    fontSize: 11,
                    fontWeight: "700",
                    color: "black",
                  }}
                >
                  Reject request
                </Text>
              </TouchableOpacity>


            </View>
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    if(index==1 && patients.length==0){
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
            No request yet!
          </Text>
        </View>
      )}

    </View>
  );
};

export default Requests;

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
