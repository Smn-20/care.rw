import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  FlatList,
  Dimensions,
  ScrollView,
  RefreshControl,
  Modal,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseURL } from "../../BaseUrl";
import { AuthContext } from "../../context/context";
import {
  FontAwesome5,
  FontAwesome,
  MaterialIcons,
  MaterialCommunityIcons,
  Feather,
  Ionicons,
  EvilIcons,
  AntDesign,
} from "@expo/vector-icons";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;
const Appointments = ({ navigation, route }) => {
  const [refreshing, setRefreshing] = useState();
  const [appointments_, setAppointments_] = useState();
  const [appointments, setAppointments] = useState();

  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          backgroundColor: "#fff",
          padding: 15,
          alignSelf: "center",
          borderRadius: 10,
          marginTop: 10,
          width: "90%",
          ...styles.shadow,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: "90%", justifyContent: "center" }}>
            <Text
              style={{
                fontSize: 16,
                color: "black",
                marginBottom: 5,
                fontWeight: "bold",
              }}
            >
              Names: {item.patient_name}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "black",
                marginBottom: 5,
                fontWeight: "500",
              }}
            >
              Patient ID: {item.patient_id}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "black",
                marginBottom: 5,
                fontWeight: "500",
              }}
            >
              Patient Phone: {item.phone}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "black",
                marginBottom: 5,
                fontWeight: "500",
              }}
            >
              Appointment type: {item.type}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "black",
                marginBottom: 5,
                fontWeight: "500",
              }}
            >
              Date: {item.date}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "black",
                marginBottom: 5,
                fontWeight: "500",
              }}
            >
              Time: {item.start_time} - {item.end_time}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const search = (value) => {
    const filteredAppointments = appointments_.filter((appointment) => {
      let appointmentToLowercase = (
        appointment.patient_name +
        " " +
        appointment.phone
      ).toLowerCase();
      let searchToTermLowercase = value.toLowerCase();
      return appointmentToLowercase.indexOf(searchToTermLowercase) > -1;
    });

    setAppointments(filteredAppointments);
  };

  const getAppointments = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const doctorObj = JSON.parse(user);
    axios
      .get(
        `${baseURL}/api/approved-appointments/doctor/${route.params.hospital_id}/${doctorObj.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setRefreshing(false);
        if (res.data.status) {
          setAppointments(res.data.message);
          setAppointments_(res.data.message);
        } else {
          setAppointments([]);
          setAppointments_([]);
        }
      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  };

  useEffect(() => {
    getAppointments();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#178838"
        barStyle="dark-content"
        translucent={false}
      />
      <View
        style={{
          flexDirection: "row",
          marginBottom: 20,
          backgroundColor: "#178838",
          height: "12%",
          width: "100%",
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
            width: "60%",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Text style={{ fontWeight: "bold", color: "white" }}>
            {route.params.hospital_name}'s Appointments
          </Text>
        </View>
        <View
          style={{
            width: "20%",
            justifyContent: "center",
            alignItems: "center",
          }}
        ></View>
      </View>

      {appointments ? (
        <>
          <View style={styles.searchBox}>
            <View style={{ justifyContent: "center", marginHorizontal: 10 }}>
              <Ionicons name="search" size={24} color="#101319" />
            </View>
            <TextInput
              placeholder="Search doctors"
              keyboardType="default"
              placeholderTextColor="#666666"
              onChangeText={(value) => {
                search(value);
              }}
              style={[
                styles.textInput,
                {
                  color: "black",
                  justifyContent: "center",
                },
              ]}
              autoCapitalize="none"
            />
          </View>
          {/* scrollview info */}
          <View style={{ paddingBottom: 50 }}>
            {appointments.length > 0 ? (
              <FlatList
                contentContainerStyle={{
                  paddingBottom: 100,
                }}
                data={appointments}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => getAppointments()}
                  />
                }
              />
            ) : (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 100,
                }}
              >
                <Text>No appointment...</Text>
              </View>
            )}
          </View>
        </>
      ) : (
        <View
          style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
        >
          <ActivityIndicator size="large" color="black" />
        </View>
      )}
    </View>
  );
};
export default Appointments;
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
    shadowRadius: 4,

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
    paddingLeft: 10,
    color: "#05375a",
  },
  searchBox: {
    flexDirection: "row",
    height: 40,
    width: "89%",
    borderWidth: 1,
    borderColor: "#101319",
    paddingBottom: 5,
    borderRadius: 8,
    alignSelf: "center",
    justifyContent: "center",
  },
  counter: {
    position: "absolute",
    bottom: 5,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 100,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  openButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 5,
  },
  tableCell: {
    flex: 1,
    alignItems: "center",
  },
  button: {
    marginTop: 10,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#178838",
  },
  confirmButton: {
    backgroundColor: "#38a169",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
});
