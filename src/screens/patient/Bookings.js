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
import { MaterialCommunityIcons } from "@expo/vector-icons";

const windowHeight = Dimensions.get("screen").height;
const windowWidth = Dimensions.get("screen").width;

const Bookings = ({ navigation, index }) => {
  const [refreshing, setRefreshing] = useState();
  const [bookings, setBookings] = useState([]);


  const getBookings = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);
    axios
      .get(`${baseURL}/api/patient/booking/${userObj.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setBookings(res.data.data);
        console.log(res.data.data);
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
          backgroundColor: "#fff",
          paddingTop: 15,
          paddingBottom: 5,
          borderColor:'gray',
          borderWidth:0.2,
          paddingRight: 10,
          alignSelf: "center",
          borderRadius: 10,
          marginTop: 10,
          width: "90%",
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: "15%", alignItems: "center" }}>
            <MaterialCommunityIcons name="pill" color={'black'} size={25}/>
          </View>
          <View
            style={{
              width: "85%",
              justifyContent: "center",
              marginBottom: 15,
            }}
          >
            <View style={{ flexDirection: "row",justifyContent:'space-between', marginBottom: 5 }}>
              <View style={{ width: "70%" }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: "black",
                    marginBottom: 5,
                    fontWeight: "bold",
                  }}
                >
                  {item.medication_name}
                </Text>
              </View>
              <View style={{ width: "30%" }}>
                <Text
                  style={{
                    fontSize: 12,
                    color:"green",
                    marginBottom: 5,
                  }}
                >
                  Rwf {item.amount}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  width:'53%',
                  paddingRight: 8,
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
                  {item.branch_name}
                </Text>
              </View>
              <View
                style={{
                  width: "45%",
                  paddingRight: 8,
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
                  Date: {item.created_at?.slice(0,10)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    if (index == 2) {
      getBookings();
    }
  }, []);

  return (
    <View styles={styles.container}>
      {bookings.length > 0 ? (
        <FlatList
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          data={bookings}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => getBookings()}
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
            No booking yet!
          </Text>
        </View>
      )}

    </View>
  );
};

export default Bookings;

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
