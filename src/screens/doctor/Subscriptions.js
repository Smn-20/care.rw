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
  ActivityIndicator,
} from "react-native";
import { baseURL } from "../../BaseUrl";
import { AntDesign, FontAwesome6, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const windowHeight = Dimensions.get("screen").height;
const windowWidth = Dimensions.get("screen").width;

const Subscriptions = ({ navigation, index }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState();
  const [subscriptions, setSubscriptions] = useState([]);

  const getSubscriptions = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);
    axios
      .get(`${baseURL}/api/subscriptions/${userObj.id}`, {
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
          getSubscriptions();
        } else {
          alert("Something went wrong!");
        }
      })
      .catch((error) => {
        alert(error.message);
      });
  };

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
          backgroundColor: "#F8FAFC",
          paddingTop: 15,
          paddingRight: 10,
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
              width: "65%",
              justifyContent: "center",
              marginBottom: 5,
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
              {item.user.first_name} {item.user.last_name}
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
                phone: {item.user.phone}
              </Text>
            </View>
          </View>
          <View>
            <Text>{item.subscription.type}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between",marginBottom:15 }}>
          <View style={{width:'20%'}}></View>
          <View style={{ width: "30%", justifyContent: "center" }}>
            <Text>{item?.subscription?.created_at.slice(0, 10)}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              height: 25,
              alignItems: "center",
              justifyContent: "flex-end",
              borderRadius: 15,
              marginTop: 5,
              width: "50%",
            }}
          >
            <Text
              style={{
                marginHorizontal: 5,
                fontSize: 11,
                fontWeight: "700",
                color: "#000",
              }}
            >
              status:
            </Text>
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#d9ed92",
                height: 25,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 15,
                paddingHorizontal: 15,
                marginTop: 5,
              }}
            >
              <Text
                style={{
                  marginHorizontal: 5,
                  fontSize: 11,
                  fontWeight: "700",
                  color: "#000",
                }}
              >
                Pending
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    if (index == 0) {
      getSubscriptions();
    }
  }, [index]);

  return (
    <View styles={styles.container}>
      {subscriptions.length > 0 ? (
        <FlatList
          contentContainerStyle={{
            paddingBottom: 100,
            minHeight:'100%',
            backgroundColor:'white'
          }}
          style={{height:'100%',}}
          data={subscriptions}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
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
    flex: 1
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
