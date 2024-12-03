import React, { useState, useEffect } from "react";
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
  RefreshControl,
  Dimensions,
  Platform,
  LogBox,
  Modal,
  Button,
} from "react-native";
import { baseURL } from "../../BaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Feather, Ionicons } from "@expo/vector-icons";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;
const GiveAccess = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showHospitals, setShowHospitals] = useState(false);
  const [doctor, setDoctor] = useState();
  const [action, setAction] = useState();
  const [doctors, setDoctors] = useState();
  const [myDoctors, setMyDoctors] = useState();
  const [doctors_, setDoctors_] = useState();

  const search = (value) => {
    if (value) {
      setShowHospitals(true);
    } else {
      setShowHospitals(false);
    }
    // const filteredDoctors = doctors_.filter((doctor) => {
    //   let doctorToLowercase = (
    //     doctor.fullname + doctor.qualification
    //   ).toLowerCase();
    //   let searchToTermLowercase = value.toLowerCase();
    //   return doctorToLowercase.indexOf(searchToTermLowercase) > -1;
    // });

    // setDoctors(filteredDoctors);
  };

  const checkAccess = (doctor_id) => {
    return myDoctors?.some((doctor) => doctor.doctor_id === doctor_id);
  };

  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          backgroundColor: "#fff",
          paddingTop: 15,
          alignSelf: "center",
          borderRadius: 10,
          borderWidth:0.3,
          borderColor:'gray',
          marginTop: 10,
          width: "90%",
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: "30%", alignItems: "center" }}>
            <Image
              source={
                item.profile_image_url
                  ? { uri: `${baseURL}/${item.profile_image_url}` }
                  : require("../../images/doctor1.png")
              }
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
                fontSize: 14,
                color: "black",
                marginBottom: 5,
                fontWeight: "bold",
              }}
            >
              {item.fullname}
            </Text>
            <View style={{flexDirection:"row"}}>
              <View style={{paddingRight:8,borderRightColor:'gray',borderRightWidth:0.3}}>
            <Text
              style={{
                fontSize: 12,
                color: "black",
                marginBottom: 5,
                fontWeight: "500",
              }}
            >
              {item.qualification}
            </Text>
            </View>
            <Text
              style={{
                fontSize: 12,
                color: "black",
                marginBottom: 5,
                fontWeight: "500",
                marginLeft:8
              }}
            >
              Reg.No: {item.registration_number}
            </Text>
            </View>
            {true ? (
              <TouchableOpacity
                onPress={() => {
                  setAction("Revoke");
                  setDoctor(item);
                  setShowAccessModal(true);
                }}
                style={{
                  backgroundColor: "#D8D6FF",
                  height: 25,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 15,
                  marginTop: 5,
                  width:"50%",
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
                  Revoke access
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setAction("Give");
                  setDoctor(item);
                  setShowAccessModal(true);
                }}
                style={{
                  backgroundColor: "#178838",
                  height: 30,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 6,
                  marginTop: 5,
                  width: "60%",
                }}
              >
                <Text
                  style={{
                    marginHorizontal: 10,
                    fontSize: 12,
                    fontWeight: "800",
                    color: "#FFF",
                  }}
                >
                  Give access
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const fetchDoctors = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const patientObj = JSON.parse(user);
    axios
      .get(`${baseURL}/api/getDoctors`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setRefreshing(false);
        setDoctors(res.data.doctors);
        setDoctors_(res.data.doctors);
        axios
          .get(`${baseURL}/api/dp_access/${patientObj.id}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            if (res.data.status) {
              setMyDoctors(res.data.message);
            } else {
              setMyDoctors([]);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const giveAccess = async () => {
    setLoading(true);
    const user = await AsyncStorage.getItem("user");
    const patientId = JSON.parse(user).id;
    const token = await AsyncStorage.getItem("token");
    const postObj = JSON.stringify({
      patient_id: patientId,
      doctor_id: doctor.id,
    });

    if (action?.toLowerCase() === "give") {
      axios
        .post(`${baseURL}/api/dp_access`, postObj, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setLoading(false);
          if (res.data.status) {
            setShowAccessModal(false);
            alert("Access granted successfully!");
            fetchDoctors();
          } else {
            alert("Something went wrong!");
          }
        })
        .catch((error) => {
          setLoading(false);
          alert(error.message);
        });
    }

    if (action?.toLowerCase() === "revoke") {
      axios
        .post(`${baseURL}/api/dp_access/revoke`, postObj, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setLoading(false);
          if (res.data.status) {
            setShowAccessModal(false);
            alert("Access revoked successfully!");
            fetchDoctors();
          } else {
            setLoading(false);
            alert("Something went wrong!");
          }
        })
        .catch((error) => {
          alert(error.message);
        });
    }
  };

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
          marginBottom: 5,
          backgroundColor: "white",
          height: windowHeight * 0.12,
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
              backgroundColor: "white",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather name="chevron-left" size={24} color="#000" />
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
          <Text style={{ fontWeight: "bold", color: "black" }}>
            Give Access
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

      <View style={[styles.searchBox, styles.shadow]}>
        <View style={{ justifyContent: "center", marginHorizontal: 10 }}>
          <Ionicons name="search" size={24} color="gray" />
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

      {myDoctors ? (
        <FlatList
          contentContainerStyle={{
            paddingBottom: 15,
          }}
          data={myDoctors}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchDoctors()}
            />
          }
        />
      ) : (
        <View
          style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
        >
          <ActivityIndicator size="large" color="black" />
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showAccessModal}
        onRequestClose={() => setShowAccessModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{action} Access</Text>
            <Text style={styles.modalText}>
              Do you want to {action?.toLowerCase()} Dr. {doctor?.fullname}{" "}
              access to your files?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAccessModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  giveAccess();
                }}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? (
                    <ActivityIndicator size={"small"} color="white" />
                  ) : (
                    "Confirm"
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showHospitals && (
        <View style={styles.modalContainer2}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>List of Health facilities</Text>

          <View style={{ borderRadius:20,backgroundColor:'#f5f5f5',padding:10,marginBottom:10 }}>
            <Text>CHUK</Text>
          </View>

          <View style={{ borderRadius:20,backgroundColor:'#f5f5f5',padding:10,marginBottom:10 }}>
            <Text>Faisal</Text>
          </View>

          <View style={{ borderRadius:20,backgroundColor:'#f5f5f5',padding:10,marginBottom:10 }}>
            <Text>Rwanda Military Hospital</Text>
          </View>

        </View>
      </View>
      )}

    </View>
  );
};
export default GiveAccess;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,

    elevation: 5,
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
    marginTop: Platform.OS === "ios" ? 0 : -12,
    paddingLeft: 10,
    color: "#05375a",
  },
  searchBox: {
    flexDirection: "row",
    backgroundColor: "white",
    height: 40,
    marginVertical: 10,
    width: "90%",
    borderRadius: 8,
    alignSelf: "center",
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
  modalContainer2: {
    position: "absolute",
    height: windowHeight * 0.88 - 60,
    marginTop: windowHeight * 0.12 + 60,
    alignItems: "center",
    width: "100%",
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
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
    width: "90%",
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
