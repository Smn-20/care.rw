import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { baseURL } from "../../BaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, Entypo, Ionicons, Octicons } from "@expo/vector-icons";
import axios from "axios";
import BottomNavigator from "../../components/BottomNavigator";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;
const Prescriptions = ({ navigation }) => {
  const [tableData, setTableData] = useState([]);
  const [medications, setMedications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [refreshing, setRefreshing] = useState();
  const [prescriptionId, setPrescriptionId] = useState("");
  const [action, setAction] = useState("");
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState("");
  const [prescriptionImage, setPrescriptionImage] = useState("");
  const [insuranceCoverage, setInsuranceCoverage] = useState("");
  const [insuranceCard, setInsuranceCard] = useState("");

  const calculateTotalPrice = (data) => {
    return data.reduce((total, item) => {
      const quantity = parseFloat(item.quantity);
      const unitPrice = parseFloat(item.medication.unit_price);
      return total + quantity * unitPrice;
    }, 0);
  };

  const getPrescriptionDetails = async (pId) => {
    setLoading2(true);
    const token = await AsyncStorage.getItem("token");

    axios
      .get(`${baseURL}/api/patient/prescription-details/${pId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setMedications(res.data.data[0].prescription_details);
        setPrescriptionImage(res.data.data[0].prescription_file);
        setInsuranceCard(res.data.data[0].insurance_card);
        setInsuranceCoverage(res.data.data[0].prescription_payment.insurance_coverage);
        setLoading2(false);
      })
      .catch((error) => {
        setLoading2(false);
        console.log(error);
      });
  };

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
          marginBottom: 10,
          ...styles.shadow,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              width: "25%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Image
              source={require("../../images/pharmacy.jpeg")}
              resizeMode="cover"
              style={{
                backgroundColor: "white",
                width: 60, // Adjust the width as per your design
                height: 60, // Adjust the height as per your design
                borderRadius: 50, // Set the borderRadius to half of width/height to create a circle
                overflow: "hidden", // Clip the image to the rounded shape
              }}
            />
          </View>
          <View
            style={{
              width: "75%",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "black" }}>
              {item.branch.branch_name}
            </Text>
            <Text style={{ fontSize: 14, color: "gray", marginTop: 5 }}>
              {item.created_at?.slice(0, 10)}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            borderTopColor: "gray",
            borderTopWidth: 0.2,
            marginTop: 10,
            paddingTop: 10,
          }}
        >
          <View
            style={{
              width: "35%",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                backgroundColor:
                  item.status === "failed" || item.status === "pending"
                    ? "#fbc4ab"
                    : "#B9FF99",
                height: 25,
                paddingHorizontal: 10,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 15,
                flexDirection: "row",
              }}
            >
              <Octicons
                name="dot-fill"
                size={10}
                color={
                  item.status === "failed" || item.status === "pending"
                    ? "red"
                    : "green"
                }
                style={{ marginTop: 3 }}
              />
              <View>
                <Text
                  style={{
                    marginHorizontal: 5,
                    fontSize: 12,
                    fontWeight: "400",
                    color:
                      item.status === "failed" || item.status === "pending"
                        ? "red"
                        : "green",
                  }}
                >
                  {item.status}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ width: "40%" }}>
            <TouchableOpacity
              onPress={() => {
                setShowModal2(!showModal2);
                getPrescriptionDetails(item.id);
                setMedications([]);
                setPrescriptionId(item.id);
                setAction("view");
              }}
              style={{
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
              }}
            >
              <Entypo
                name="add-to-list"
                size={16}
                color="green"
                style={{ marginRight: 5, marginTop: 7 }}
              />
              <Text
                style={{
                  fontSize: 12,
                  marginTop: 7,
                  fontWeight: "500",
                  color: "green",
                }}
              >
                View Prescriptions
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              width: "25%",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            {item?.status.toLowerCase() == "confirmed" && (
              <TouchableOpacity
                onPress={() => {
                  setShowModal2(!showModal2);
                  getPrescriptionDetails(item.id);
                  setMedications([]);
                  setPrescriptionId(item.id);
                  setAction("pay");
                }}
                style={{
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: "green",
                  justifyContent: "center",
                  paddingHorizontal: 20,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color: "white",
                  }}
                >
                  Pay
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderMedication = ({ item }) => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginTop: windowWidth / 30,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F5F4EC",
            width: "100%",
            paddingVertical: 8,
            paddingHorizontal: 10,
            borderRadius: 20,
          }}
        >
          <View style={{ width: "100%" }}>
            <Text
              style={{
                color: "#000",
                fontWeight: 500,
                marginLeft: 20,
              }}
            >
              {item.medication.name}
            </Text>
            <Text
              style={{
                color: "gray",
                marginLeft: 20,
                marginTop: 4,
              }}
            >
              quantity:{item.quantity} | unit price: Rwf {item.price}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const getPrescriptions = async () => {
    const user_ = await AsyncStorage.getItem("user");
    const patient = JSON.parse(user_);
    const token = await AsyncStorage.getItem("token");
    setUser(patient);
    axios
      .get(`${baseURL}/api/patient/uploaded-prescriptions/${patient.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setTableData(res.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const pay = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    const postObj = JSON.stringify({
      prescription_id: prescriptionId,
      phone_number: phone,
    });
    console.log(postObj);
    axios
      .post(`${baseURL}/api/payment/uploaded-prescription`, postObj, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLoading(false);
        if (res.data.status) {
          setShowModal(false);
          setPhone("");
          alert("Payment request sent successfully! Dial *182*7*1#");
          navigation.navigate("PatientHome");
        } else {
          setShowModal(false);
          setPhone("");
          alert("Something went wrong!");
        }
      })
      .catch((error) => {
        setLoading(false);
        alert(error.message);
      });
  };

  useEffect(() => {
    getPrescriptions();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#1183ed"
        barStyle="light-content"
        translucent={false}
      />
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#EAE8E0",
          marginBottom: 20,
          height: windowHeight * 0.12,
          width: "100%",
        }}
      >
        <TouchableOpacity
          style={{
            width: "15%",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
          onPress={() => navigation.goBack()}
        >
          <View>
            <AntDesign name="arrowleft" size={24} color="#000" />
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
          <Text style={{ fontWeight: "bold", color: "black" }}>
            Uploaded Prescriptions
          </Text>
        </View>
      </View>

      {/* scrollview info */}
      {tableData ? (
        <View style={{ height: (windowHeight*0.88)-80 }}>
          {tableData.length > 0 ? (
            <FlatList
              contentContainerStyle={{
                paddingBottom: 15,
              }}
              data={tableData}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => getPrescriptions()}
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
              <Text>No prescription yet...</Text>
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
            <View style={{ flexDirection: "row" }}>
              <View style={{ width: "100%" }}>
                <Text style={styles.modalTitle}>
                  Enter your momo phone number
                </Text>
              </View>
            </View>
            <TextInput
              maxLength={12}
              onChangeText={(text) => setPhone(text)}
              keyboardType="phone-pad"
              // placeholderTextColor={"#626262"}
              placeholder={"Enter your phone number"}
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
                  pay();
                }}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? (
                    <ActivityIndicator size={"small"} color="white" />
                  ) : (
                    "confirm"
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal2}
        onRequestClose={() => {
          setShowModal2(false);
          setMedications([]);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {action === "pay" && (
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  {medications.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setShowModal2(false);
                        setShowModal(true);
                      }}
                      style={{
                        height: 30,
                        borderRadius: 15,
                        backgroundColor: "green",
                        justifyContent: "center",
                        paddingHorizontal: 20,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "white" }}>Pay</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => setShowModal2(false)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: "white",
                      justifyContent: "center",
                      alignItems: "center",
                      ...styles.shadow,
                    }}
                  >
                    <Ionicons name="close" size={20} />
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    minHeight: windowHeight * 0.5,
                    maxHeight: windowHeight * 0.75,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color={"black"} size={"large"} />
                  ) : medications.length > 0 ? (
                    <FlatList
                      contentContainerStyle={{
                        paddingBottom: 100,
                      }}
                      data={medications}
                      showsVerticalScrollIndicator={false}
                      renderItem={renderMedication}
                      keyExtractor={(item, index) => index.toString()}
                    />
                  ) : (
                    <Text style={{ marginTop: 20 }}>
                      Prescription not yet processed...
                    </Text>
                  )}
                </View>
                <Text style={{ marginLeft: "5%" }}>
                  Total to pay: {calculateTotalPrice(medications)} Rwf
                </Text>
              </View>
            )}
            {action === "view" && (
              <View>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                <TouchableOpacity
                    onPress={() => setShowModal2(false)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: "white",
                      justifyContent: "center",
                      alignItems: "center",
                      ...styles.shadow,
                    }}
                  >
                    <Ionicons name="close" size={20} />
                  </TouchableOpacity>
                <Text style={{marginLeft:20}}>Prescription Details</Text>
                </View>
                <View
                  style={{
                    width: "80%",
                    marginTop: 30,
                    justifyContent: "center",
                    alignItems: "center",
                    alignSelf: "center",
                  }}
                >
                  <Image
                    source={{ uri: prescriptionImage }}
                    resizeMode="contain"
                    style={{
                      backgroundColor: "white",
                      width: windowWidth/1.5, // Adjust the width as per your design
                      height: windowHeight/2, // Adjust the height as per your design
                    }}
                  />
                </View>
                <Text style={{marginTop:15}}>Insurance card: {insuranceCard}</Text>
                <Text style={{marginTop:15}}>Insurance coverage: {insuranceCoverage} %</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
      <BottomNavigator navigation={navigation} userRole={user?.user_type} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ddd" },
  tableCell: {
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#ddd",
    borderWidth: 1,
    paddingVertical: 12,
  },
  headerRow: {
    backgroundColor: "#f1f8ff",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerCell: { backgroundColor: "#f1f8ff" },
  headerText: { fontWeight: "bold" },
  cellText: {},
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
    backgroundColor: "#FBF9F1",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
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
    borderRadius: 17.5,
    padding: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#C42217",
  },
  confirmButton: {
    backgroundColor: "#3489EA",
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

export default Prescriptions;
