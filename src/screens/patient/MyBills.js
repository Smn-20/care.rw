import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  TextInput,
  Platform,
  Dimensions,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseURL } from "../../BaseUrl";
import * as Print from "expo-print";
import { Feather, AntDesign } from "@expo/vector-icons";
import { shareAsync } from "expo-sharing";
import DateTimePicker from "@react-native-community/datetimepicker";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

const MyBills = ({ navigation, route }) => {
  const [date, setDate] = useState(new Date());
  const [selected, setSelected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [bills, setBills] = useState();
  const [bills_, setBills_] = useState([]);
  const [refreshing, setRefreshing] = useState();
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");

  const handleConfirm = () => {
    setShow(false);
    setSelected(true);
    filterBillsByDate(date);
  };

  const generatePdf = async (item,billData) => {
    const medicalActs = billData?.providedMedicalActs?.length>0 ? 
    billData?.providedMedicalActs?.map((act, index) => `
        <div class="item-row">
            <div style="width:25%">${act?.medicalActTariff?.medicalAct?.name}</div>
            <div style="width:25%">${act?.quantity}</div>
            <div style="width:25%">${act?.medicalActTariff?.unitPrice} Rwf</div>
            <div style="width:25%">${(act?.quantity * act?.medicalActTariff?.unitPrice) || '-'} Rwf</div>
        </div>
    `).join('<br>')
    :'<p>No Medical Acts...</p>';
    const htmlContent = `
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 20px;
            background-color: #f5f5f5;
        }

        #receipt-container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 0 auto;
        }

        #bill-code {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        #customer-details, #company-details {
            margin-bottom: 20px;
            margin-left:30px
        }

        #items {
            font-size: 16px;
            text-align: center;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
            background-color: #f0f0f0;
            padding: 8px;
            border-radius: 4px;
        }

        .item-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
        }

        .item-row:last-child {
            border-bottom: none;
        }
    </style>
</head>
<body>
    <div id="receipt-container">
        <div id="bill-code">
            Bill Code: ${item.billCode}
        </div>

        <div id="customer-details">
            <p>Name: ${item.visit?.patientCase?.patient?.member?.firstName} ${
      item.visit?.patientCase?.patient?.member?.lastName
    }</p>
            <p>Insurance Policy No: ${
              item.visit?.patientCase?.patient?.member?.code
            }</p>
            <p>Address: ${
              item.visit?.patientCase?.patient?.member?.location?.name
            }</p>
        </div>



        <div id="items">
            MEDICAL ACTS
        </div>

        <div class="item-row">
            <div style="width:25%">Name</div>
            <div style="width:25%">Quantity</div>
            <div style="width:25%">Unit Price</div>
            <div style="width:25%">Total Price</div>
        </div>

        ${medicalActs}


        <div id="items">
            CONSUMABLES
        </div>

        <div class="item-row">
            <div>Name</div>
            <div>Quantity</div>
            <div>Unit Price</div>
            <div>Total Price</div>
        </div>

        <div class="item-row">
            <div>Gloves</div>
            <div>2</div>
            <div>2,000 Rwf</div>
            <div>4,000 Rwf</div>
        </div>


        <div id="items">
            DRUGS
        </div>

        <div class="item-row">
            <div>Name</div>
            <div>Quantity</div>
            <div>Unit Price</div>
            <div>Total Price</div>
        </div>

        <div class="item-row">
            <div>Paracetamol</div>
            <div>1</div>
            <div>1,000 Rwf</div>
            <div>1,000 Rwf</div>
        </div>

        <div style="margin-top:70px;text-align: end;">
            Total Amount: ${format(item.totalAmount).slice(0, -2)} Rwf
        </div>
        <div style="margin-top:25px;text-align: end;">
            Covered Amount by insurance: ${format(item.coveredAmount).slice(
              0,
              -2
            )} Rwf
        </div>
        <div style="margin-top:25px;text-align: end;">
            Amount Paid By Patient: ${format(
              item.totalAmount - item.coveredAmount
            ).slice(0, -2)} Rwf
        </div>



    </div>
</body>
</html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
  };

  const pay = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    const postObj = JSON.stringify({
      amount: amount,
      phone_number: phone,
    });
    console.log(postObj);
    axios
      .post(`${baseURL}/api/pay-bill`, postObj, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLoading(false);
        if (res.data.status) {
          setShowModal(false);
          setPhone("");
          alert("Payment request sent successfully! Dial *182*7*1#");
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

  const getBill = async (item) => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    axios
      .get(`${baseURL}/api/bill/generate-bill/by-code/${item.billCode}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLoading(false);
        if (res.data.success) {
          generatePdf(item,res.data.data)
        } else {
          alert("Something went wrong!");
        }
      })
      .catch((error) => {
        setLoading(false);
        alert(error.message);
      });
  };

  const format = (amount) => {
    return Number(amount)
      .toFixed(1)
      .replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const reset = () => {
    setBills(bills_);
    setSelected(false);
  };

  const filterBillsByDate = (date_) => {
    const filteredBills = bills_.filter((bill_) =>
      bill_.createdOn.includes(dateFormatted(date_))
    );
    setBills(filteredBills);
  };

  const dateFormatted = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const showDatepicker = () => {
    if (Platform.OS === "android") {
      setShow(true);
    } else {
      setShow(true);
      console.log("Selected date:", dateFormatted(date));
    }
    setSelected(false);
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
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View
            style={{
              width: "60%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Patient: {item.visit?.patientCase?.patient?.member?.firstName}{" "}
              {item.visit?.patientCase?.patient?.member?.lastName}
            </Text>
          </View>
          <View
            style={{
              width: "40%",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Bill Code: {item.billCode}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 15,
          }}
        >
          <View
            style={{
              width: "60%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Facility: {item.visit?.patientCase?.currentDataLocation?.name}
            </Text>
          </View>
          <View
            style={{
              width: "40%",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Balance: Rwf{" "}
              {format(item.totalAmount - item.coveredAmount).slice(0, -2)}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 15,
          }}
        >
          <View
            style={{
              width: "60%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Total Amount: Rwf {format(item.totalAmount).slice(0, -2)}
            </Text>
          </View>
          <View
            style={{
              width: "40%",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Covered Amount: Rwf {format(item.coveredAmount).slice(0, -2)}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 15,
          }}
        >
          <View
            style={{
              width: "60%",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 14, color: "black", paddingRight: 8 }}>
                Status:
              </Text>
              {item.visit?.patientCase?.currentStatus == "INITIATED" ? (
                <View
                  style={{
                    width: "35%",
                    height: 15,
                    borderRadius: 8,
                    backgroundColor: "#FCCA88",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#f48c06",
                      fontWeight: "bold",
                      fontSize: 10,
                    }}
                  >
                    Initiated
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    width: "40%",
                    height: 15,
                    borderRadius: 8,
                    backgroundColor: "#D9ECD9",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#2B962B",
                      fontWeight: "bold",
                      fontSize: 10,
                    }}
                  >
                    Closed
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View
            style={{
              width: "40%",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() => {
                  getBill(item);
                }}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: "50%",
                }}
              >
                <AntDesign name="download" size={24} color="black" />
              </TouchableOpacity>
              {item?.currentPaymentStatus?.toUpperCase() !== "FULLY_PAID" ? (
                <TouchableOpacity
                  onPress={() => {
                    setShowModal(true);
                    setAmount(
                      JSON.stringify(item.totalAmount - item.coveredAmount)
                    );
                  }}
                  style={{
                    width: "50%",
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: "green",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: 13,
                    }}
                  >
                    Pay
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={{ color: "#38a169", fontWeight: "bold" }}>
                  PAID
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const getBills = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");

    axios
      .get(`${baseURL}/api/bill/all/membership_code/${route.params.insurance_code}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      .then((res) => {
        setRefreshing(false);
        if (res.data.success) {
          setBills(res.data.data);
          setBills_(res.data.data);
        } else {
          setBills([]);
        }
      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  };
  useEffect(() => {
    getBills();
    const focusHandler = navigation.addListener("focus", () => {
      getBills();
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
          height: "10%",
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
          <Text style={{ fontWeight: "bold", color: "white" }}>My Bills</Text>
        </View>
      </View>

      {Platform.OS === "ios" && (
        <Modal
          visible={show}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShow(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={"date"}
                is24Hour={true}
                display="spinner"
                onChange={(e, selectedDate) => setDate(selectedDate)}
              />
              <TouchableOpacity
                onPress={handleConfirm}
                style={{ alignItems: "center", marginTop: 10 }}
              >
                <Text style={styles.buttonText}>pickdate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === "android" && show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={"date"}
          is24Hour={true}
          display="spinner"
          onChange={(e, selectedDate) => {
            setShow(false);
            setDate(selectedDate);
            setSelected(true);
            filterBillsByDate(selectedDate);
          }}
        />
      )}

      <View style={{ flexDirection: "row" }}>
        <View
          style={{
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "black",
            padding: 10,
            borderRadius: 10,
            marginLeft: 20,
          }}
        >
          {date && selected ? (
            <Text>{date && dateFormatted(date)}</Text>
          ) : (
            <Text>YYYY-MM-DD</Text>
          )}
        </View>
        <TouchableOpacity
          style={{
            marginHorizontal: 20,
            backgroundColor: "#219ebc",
            padding: 10,
            justifyContent: "center",
            borderRadius: 10,
          }}
          onPress={() => {
            showDatepicker();
          }}
        >
          <Text style={{ color: "white" }}>Sort by Date</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "#778da9",
            padding: 10,
            justifyContent: "center",
            borderRadius: 10,
          }}
          onPress={() => {
            reset();
          }}
        >
          <Text style={{ color: "white" }}>Reset</Text>
        </TouchableOpacity>
      </View>

      <Text
        style={{
          fontSize: 18,
          color: "black",
          marginLeft: "5%",
          marginTop: 15,
          fontWeight: "bold",
        }}
      >
        Bills
      </Text>
      {/* scrollview info */}
      {bills ? (
        <View style={{ paddingBottom: windowHeight / 5 }}>
          {bills.length > 0 ? (
            <FlatList
              contentContainerStyle={{
                paddingBottom: 15,
              }}
              data={bills}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => getBills()}
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
              <Text>No Bill...</Text>
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
            <Text style={styles.modalTitle}>Enter momo number</Text>
            <TextInput
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={12}
              onChangeText={(text) => setPhone(text)}
              keyboardType="phone-pad"
              // placeholderTextColor={"#626262"}
              placeholder={"Phone number"}
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
                focused && {
                  borderWidth: 2,
                  borderColor: "#626262",
                  shadowOffset: { width: 4, height: 10 },
                  shadowColor: "#626262",
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
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
                    "Confirm"
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
export default MyBills;
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
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  button: {
    marginTop: 10,
  },
  menuIcon: {
    width: "25%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "8%",
  },
  titleContainer: {
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "8%",
  },
  title: {
    color: "white",
    fontSize: 18,
  },
  profileIcon: {
    width: "25%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: "8%",
  },
  scrollView: {
    height: (windowHeight * 7) / 8,
  },
  scheduleContainer: {
    backgroundColor: "white",
    width: "90%",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    width: "100%",
    marginBottom: 10,
  },
  datePickerButtonText: {
    color: "gray",
  },
  selectedDatePickerButton: {
    borderColor: "#6941C6",
  },
  selectedDateText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#626262",
  },
  input: {
    fontSize: 14,
    paddingHorizontal: 8,
    backgroundColor: "#f1f4ff",
    borderRadius: 10,
    marginVertical: 10,
    width: "90%",
    height: 45,
  },
  input2: {
    fontSize: 14,
    paddingHorizontal: 8,
    backgroundColor: "#f1f4ff",
    borderRadius: 10,
    marginVertical: 10,
    width: "45%",
    height: 45,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeInput: {
    fontSize: 14,
    padding: 8,
    backgroundColor: "#f1f4ff",
    borderRadius: 10,
    marginVertical: 10,
    width: "45%",
    height: 45,
  },
  removeButton: {
    backgroundColor: "#FF5252",
    padding: 10,
    borderRadius: 5,
  },
  addScheduleButton: {
    backgroundColor: "#6941C6",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  addScheduleButtonText: {
    color: "white",
  },
  submitButton: {
    backgroundColor: "#1e90ff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
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
  buttonText: {
    color: "white",
  },
});
