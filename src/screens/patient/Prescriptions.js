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
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  ActivityIndicator,
} from "react-native";
import { baseURL } from "../../BaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AntDesign,
  Entypo,
  Ionicons,
  Octicons,
  FontAwesome,
} from "@expo/vector-icons";
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
  const [pickUpFee, setPickUpFee] = useState(0);
  const [fee, setFee] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [answer, setAnswer] = useState();
  const [paymentStatus, setPaymentStatus] = useState();

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
        console.log(res.data.data[0]);
        setMedications(res.data.data[0].prescription_details);
        setPrescriptionImage(res.data.data[0].prescription_file);
        setInsuranceCard(res.data.data[0].insurance_card);
        setInsuranceCoverage(
          res.data.data[0].prescription_payment.insurance_coverage
        );
        setFee(res.data.data[0].prescription_payment.service_fee);
        setLoading2(false);
      })
      .catch((error) => {
        setLoading2(false);
        console.log(error);
      });
  };

  const getTotal = (amount) => {
    if (paymentStatus === "successful") {
      return amount + fee;
    }
    if (answer === "pickup") {
      return (
        amount + Math.ceil((calculateTotalPrice(medications) * pickUpFee) / 100)
      );
    } else if (answer === "delivery") {
      return amount + deliveryFee;
    } else {
      return amount;
    }
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
            <View
              style={{ flexDirection: "row", width: "100%", marginTop: 10 }}
            >
              <Text style={{ fontSize: 14, color: "gray", marginTop: 5 }}>
                {item.created_at?.slice(0, 10)}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  marginLeft: 10,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                <View
                  style={{
                    backgroundColor:
                      (item.status === "failed" || item.status === "pending") &&
                      item.payment_status !== "successful"
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
                      {item.payment_status === "successful"
                        ? "Paid"
                        : item.status}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
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
          <View style={{ width: "45%" }}>
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
                  color: "#2FAB4F",
                }}
              >
                View Prescriptions
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              width: "45%",
              justifyContent: "flex-start",
              alignItems: "flex-end",
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
                  setAnswer("");
                  setPaymentStatus(item.payment_status);
                }}
                style={{
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: "#2FAB4F",
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
                  View Bill
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
            backgroundColor: "#F3F5F7",
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

  const format = (amount) => {
    return Number(amount)
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const getServiceFees = async () => {
    const token = await AsyncStorage.getItem("token");
    axios
      .get(`${baseURL}/api/service-fees`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.status) {
          setDeliveryFee(parseInt(res.data.data[0].delivery));
          setPickUpFee(parseInt(res.data.data[0].pick_up));
        } else {
          alert("Service fees not found");
        }
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
      service_fee:
        answer === "pickup"
          ? Math.ceil((calculateTotalPrice(medications) * pickUpFee) / 100)
          : deliveryFee,
      service: answer === "pickup" ? "pick_up" : "delivery",
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
          setShowModal2(false);
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
    getServiceFees();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#1183ed"
        barStyle="dark-content"
        translucent={false}
      />
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#F8FAFC",
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
            // alignItems: "center",
            marginTop: 25,
          }}
        >
          <Text
            style={{
              fontWeight: "400",
              fontSize: 20,
              marginLeft: 15,
              color: "black",
            }}
          >
            Prescriptions
          </Text>
        </View>
      </View>

      {/* scrollview info */}
      {tableData ? (
        <View style={{ height: windowHeight * 0.88 - 80 }}>
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
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  marginTop: 15,
                  borderWidth: 0.2,
                  borderColor: "gray",
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
          <KeyboardAvoidingView
            style={styles.modalContent}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false} // Prevent bouncing effect on iOS
      >
              <View>
                {action === "pay" && (
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ fontSize: 20, fontWeight: "500" }}>
                        Bill Info
                      </Text>
                    </View>

                    <View
                      style={{
                        maxHeight: windowHeight * 0.35,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {loading ? (
                        <ActivityIndicator color={"black"} size={"large"} />
                      ) : medications.length > 0 ? (
                        <FlatList
                          contentContainerStyle={{
                            paddingBottom: 40,
                          }}
                          data={medications}
                          nestedScrollEnabled={true}
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

                    <View
                      style={{
                        width: "100%",
                        alignItems: "flex-start",
                        marginLeft: "5%",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#5C5C5C",
                        }}
                      >
                        Insurance coverage: {insuranceCoverage} %
                      </Text>
                    </View>

                    {paymentStatus !== "successful" && (
                      <View
                        style={{
                          justifyContent: "space-between",
                          borderColor: "gray",
                          borderWidth: 0.3,
                          marginHorizontal: 10,
                          borderRadius: 15,
                          minHeight: 70,
                          padding: 10,
                          marginTop: 8,
                        }}
                      >
                        <View style={{ flexDirection: "row" }}>
                          <View
                            style={{
                              flexDirection: "row",
                              paddingVertical: 10,
                              paddingHorizontal: 10,
                              width: "45%",
                              marginBottom: 20,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => setAnswer("pickup")}
                              style={{
                                height: 25,
                                justifyContent: "center",
                                alignItems: "center",
                                width: 25,
                                borderRadius: 12.5,
                                borderColor:
                                  answer === "pickup" ? "#178838" : "black",
                                borderWidth: 2,
                                backgroundColor: "white",
                              }}
                            >
                              {answer === "pickup" && (
                                <FontAwesome
                                  name="circle"
                                  size={14}
                                  color="#178838"
                                />
                              )}
                            </TouchableOpacity>
                            <Text style={{ flex: 1, marginLeft: 10 }}>
                              Pick-up
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              paddingVertical: 10,
                              paddingHorizontal: 10,
                              width: "45%",
                              alignSelf: "center",
                              marginBottom: 20,
                              alignItems: "center",
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => setAnswer("delivery")}
                              style={{
                                height: 25,
                                justifyContent: "center",
                                alignItems: "center",
                                width: 25,
                                borderRadius: 12.5,
                                borderColor:
                                  answer === "delivery" ? "#178838" : "black",
                                borderWidth: 2,
                                backgroundColor: "white",
                              }}
                            >
                              {answer === "delivery" && (
                                <FontAwesome
                                  name="circle"
                                  size={14}
                                  color="#178838"
                                />
                              )}
                            </TouchableOpacity>
                            <Text style={{ flex: 1, marginLeft: 10 }}>
                              Delivery
                            </Text>
                          </View>
                        </View>

                        {answer && (
                          <View
                            style={{
                              width: "100%",
                              alignItems: "flex-start",
                              marginLeft: "5%",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 15,
                                color: "#5C5C5C",
                              }}
                            >
                              Service Fees:{" "}
                              {answer === "delivery"
                                ? deliveryFee
                                : Math.ceil(
                                    (calculateTotalPrice(medications) *
                                      pickUpFee) /
                                      100
                                  )}{" "}
                              Rwf
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    <View
                      style={{
                        width: "100%",
                        alignItems: "flex-start",
                        marginLeft: "5%",
                        marginTop: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#5C5C5C",
                        }}
                      >
                        Subtotal:{" "}
                        {JSON.stringify(
                          format(
                            (calculateTotalPrice(medications) *
                              (100 - insuranceCoverage)) /
                              100
                          )
                        ).substring(
                          1,
                          JSON.stringify(
                            format(calculateTotalPrice(medications))
                          ).length - 4
                        )}{" "}
                        Rwf
                      </Text>
                      {paymentStatus === "successful" && (
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#5C5C5C",
                          }}
                        >
                          Service fee: {fee} Rwf
                        </Text>
                      )}
                    </View>

                    <View
                      style={{
                        width: "90%",
                        height: 60,
                        borderTopColor: "#707070",
                        borderTopWidth: 0.5,
                        flexDirection: "row",
                        paddingVertical: 10,
                        marginTop: 15,
                        alignSelf: "center",
                        alignItems:'center'
                      }}
                    >
                      <View style={{ alignItems: "flex-start" }}>
                        <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                          Total to pay:
                        </Text>
                      </View>

                      <View style={{ marginLeft: 5 }}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "bold",
                            color: "#178838",
                          }}
                        >
                          {JSON.stringify(
                            format(
                              getTotal(
                                (calculateTotalPrice(medications) *
                                  (100 - insuranceCoverage)) /
                                  100
                              )
                            )
                          ).substring(
                            1,
                            JSON.stringify(
                              format(
                                getTotal(
                                  (calculateTotalPrice(medications) *
                                    (100 - insuranceCoverage)) /
                                    100
                                )
                              )
                            ).length - 4
                          )}{" "}
                          Rwf
                        </Text>
                      </View>
                      {paymentStatus==='successful'&&(
                      <View style={{flexDirection:'row', height:28, marginLeft:8,justifyContent:'center',alignItems:'center',paddingHorizontal:8,borderRadius:10,backgroundColor:'#ECFDF3'}}>
                        <AntDesign name="check" color={'#027A48'}/>
                        <Text style={{marginLeft:3,color:'#027A48',fontWeight:'bold'}}>Paid</Text>
                      </View>
                      )}
                    </View>

                    {paymentStatus !== "successful" && (
                      <Text
                        style={{
                          marginLeft: "5%",
                          fontSize: 14,
                          color: "gray",
                        }}
                      >
                        Add your phone number to checkout
                      </Text>
                    )}

                    <View
                      style={{ justifyContent: "center", alignItems: "center" }}
                    >
                      {paymentStatus !== "successful" && (
                        <TextInput
                          style={{
                            borderBottomColor: "gray",
                            borderBottomWidth: 0.5,
                            height: 35,
                            width: "90%",
                            backgroundColor: "#fff",
                            color: "black",
                            marginTop: 40,
                            paddingHorizontal: 15,
                            marginBottom: 20,
                          }}
                          name="Names"
                          placeholder="Phone Number (07********)"
                          keyboardType="numeric"
                          onChangeText={(text) => setPhone(text)}
                        />
                      )}

                      {/* Pay and Close buttons */}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-evenly",
                          width: "100%",
                          marginVertical: 20,
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            width: "45%",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          onPress={() => setShowModal2(false)}
                        >
                          <Text
                            style={{
                              color: "#2FAB4F",
                              fontSize: 15,
                              fontWeight: "500",
                            }}
                          >
                            Close
                          </Text>
                        </TouchableOpacity>

                        {answer && paymentStatus !== "successful" && (
                          <TouchableOpacity
                            onPress={() => {
                              pay();
                            }}
                            style={{
                              backgroundColor: "#178838",
                              paddingHorizontal: 20,
                              height: 40,
                              width: "45%",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 20,
                            }}
                          >
                            {loading ? (
                              <ActivityIndicator
                                size="large"
                                color="white"
                                style={{ margin: 15 }}
                              />
                            ) : (
                              <Text
                                style={{
                                  color: "white",
                                  fontSize: 16,
                                  fontWeight: "500",
                                }}
                              >
                                Pay
                              </Text>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                )}

                {action === "view" && (
                  <View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
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
                      <Text style={{ marginLeft: 20 }}>
                        Prescription Details
                      </Text>
                    </View>

                    {/* Rest of your content for 'view' action */}
                  </View>
                )}
              </View>
              </ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      <BottomNavigator navigation={navigation} userRole={user?.user_type} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    width: "90%",
    maxHeight: "90%",
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
    backgroundColor: "green",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  shadow: {
    shadowColor: "gray",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,

    elevation: 3,
  },
});

export default Prescriptions;
