import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Dimensions,
  TextInput,
  LogBox,
  Modal,
  Button,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseURL } from "../../BaseUrl";
import { Feather, MaterialIcons, AntDesign } from "@expo/vector-icons";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;
const SubPatients = ({ navigation, route }) => {
  const [user, setUser] = useState();
  const [subPatients, setSubPatients] = useState();
  const [refreshing, setRefreshing] = useState();
  const [patientId, setPatientId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const addPatient = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const patientObj = JSON.parse(user);
    const postObj = JSON.stringify({
      hospital_id: route.params.hospital_id,
      patient_id: patientId,
      created_by: patientObj.id,
    });
    axios
      .post(`${baseURL}/api/add-sub-patientId`, postObj, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLoading(false);
        if (res.data.status) {
          setShowModal(false);
          setPatientId("");
          getSubPatients();
          alert("Patient added successfully!");
        } else {
          setShowModal(false);
          setPatientId("");
          alert("Something went wrong!");
        }
      })
      .catch((error) => {
        setLoading(false);
        alert(error.message);
      });
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: "#fff",
          padding: 15,
          alignSelf: "center",
          borderRadius: 10,
          marginTop: 10,
          width: "90%",
          marginBottom: 10,
          ...styles.shadow,
        }}
        onPress={() =>
          navigation.navigate("Results", {
            patient_id: item.patient_id,
            hospital_id: route.params.hospital_id,
            hospital_name: route.params.hospital_name,
          })
        }
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: "90%", justifyContent: "center" }}>
            <Text style={{ fontSize: 18, color: "black" }}>
              Patient's names
            </Text>
            <Text style={{ fontSize: 14, color: "black" }}>
              {item.patient_id}
            </Text>
          </View>
          <View style={{ width: "10%", alignItems: "flex-end" }}>
            <MaterialIcons name="arrow-forward-ios" size={20} color="#000" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getSubPatients = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const patientObj = JSON.parse(user);
    setUser(patientObj);
    const hospitalId = route.params.hospital_id;
    axios
      .get(`${baseURL}/api/patient-records/${hospitalId}/${patientObj.id}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      .then((res) => {
        setRefreshing(false);
        if (res.status == 200 || res.status == 201) {
          setSubPatients(res.data.message);
        } else {
          setSubPatients([]);
        }
      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  };
  useEffect(() => {
    getSubPatients();
    const focusHandler = navigation.addListener("focus", () => {
      getSubPatients();
    });
    return focusHandler;
  }, [navigation]);

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
            width: "75%",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Text style={{ fontWeight: "bold", color: "white" }}>
            {route.params.hospital_name}'s Patients
          </Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          style={{
            flexDirection: "row",
            backgroundColor: "#626262",
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 6,
            marginTop: 5,
            paddingHorizontal: 5,
          }}
        >
          <Feather name="plus" size={24} color="#fff" />
          <Text
            style={{
              marginHorizontal: 10,
              fontSize: 13,
              fontWeight: "800",
              color: "#FFF",
            }}
          >
            Add Patient
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: "#fff",
          padding: 15,
          alignSelf: "center",
          borderRadius: 10,
          marginTop: 10,
          width: "90%",
          marginBottom: 10,
          ...styles.shadow,
        }}
        onPress={() =>
          navigation.navigate("Results", {
            patient_id: user?.id,
            hospital_id: route.params.hospital_id,
            hospital_name: route.params.hospital_name,
          })
        }
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: "90%", justifyContent: "center" }}>
            <Text style={{ fontSize: 18, color: "black" }}>
              {user?.fullname}
            </Text>
            <Text style={{ fontSize: 14, color: "black" }}>{user?.id}</Text>
          </View>
          <View style={{ width: "10%", alignItems: "flex-end" }}>
            <MaterialIcons name="arrow-forward-ios" size={20} color="#000" />
          </View>
        </View>
      </TouchableOpacity>
      {/* scrollview info */}
      {subPatients ? (
        <View style={{ paddingBottom: 50 }}>
          {subPatients.length > 0 ? (
            <FlatList
              contentContainerStyle={{
                paddingBottom: 15,
              }}
              data={subPatients}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => getSubPatients()}
                />
              }
            />
          ) : (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                marginTop: 100,
              }}
            >
              <Text>No Patient...</Text>
            </View>
          )}
        </View>
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
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter patient ID</Text>
            <TextInput
              maxLength={12}
              onChangeText={(text) => setPatientId(text)}
              keyboardType="phone-pad"
              // placeholderTextColor={"#626262"}
              placeholder={"Patient ID"}
              style={[
                {
                  fontSize: 14,
                  padding: 8,
                  backgroundColor: "#f1f4ff",
                  borderRadius: 10,
                  marginTop: 15,
                  marginBottom: 35,
                  width: "100%",
                  height: 45,
                },
              ]}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  addPatient();
                }}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? (
                    <ActivityIndicator size={"small"} color="white" />
                  ) : (
                    "Submit"
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
export default SubPatients;
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
    paddingBottom: 5,
    borderRadius: 8,
    marginLeft: 30,
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
    padding: 10,
    borderRadius: 10,
    width: "95%",
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
