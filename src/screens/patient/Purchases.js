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
} from "react-native";
import { baseURL } from "../../BaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const windowHeight = Dimensions.get("screen").height;
const windowWidth = Dimensions.get("screen").width;

const Purchases = ({ navigation, index }) => {
  const [refreshing, setRefreshing] = useState();
  const [purchases, setPurchases] = useState([]);
  const [medications, setMedications] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const getPurchases = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);
    axios
      .get(`${baseURL}/api/patient/orders/${userObj.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setPurchases(res.data.data);
        console.log(res.data.data[0]);
        setRefreshing(false);
      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  };

  const getOrderDetails = async (orderId) => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);
    axios
      .get(`${baseURL}/api/patient/order-details/${orderId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setMedications(res.data.data);
        console.log(res.data.data[0]);
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
          paddingRight: 10,
          borderColor: "gray",
          borderWidth: 0.2,
          alignSelf: "center",
          borderRadius: 10,
          marginTop: 10,
          width: "90%",
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: "15%", alignItems: "center" }}>
            <MaterialCommunityIcons name="cart" color={"black"} size={25} />
          </View>
          <View
            style={{
              width: "85%",
              justifyContent: "center",
              marginBottom: 15,
            }}
          >
            <View style={{ flexDirection: "row", marginBottom: 5 }}>
              <View style={{ width: "70%" }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: "black",
                    marginBottom: 5,
                    fontWeight: "500",
                  }}
                >
                  Date: {item.created_at.slice(0, 10)}
                </Text>
              </View>
              <View style={{ width: "30%" }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: item.packed === "Yes" ? "green" : "red",
                    marginBottom: 5,
                    fontWeight: "500",
                  }}
                >
                  {item.packed === "Yes" ? "Packed" : "Not packed"}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  width: "70%",
                  paddingRight: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "green",
                    marginBottom: 5,
                    fontWeight: "bold",
                  }}
                >
                  Rwf {item.total_amount}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setMedications([])
                  getOrderDetails(item.id);
                  setShowModal(true);
                }}
                style={{
                  width: "30%",
                  height: 25,
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#E7FAE6",
                  paddingHorizontal: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  Details
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderItem2 = ({ item }) => {
    return (
      <View
        style={{
          backgroundColor: "#fff",
          paddingTop: 15,
          paddingBottom: 5,
          paddingRight: 10,
          borderColor: "gray",
          borderWidth: 0.2,
          alignSelf: "center",
          borderRadius: 10,
          marginTop: 10,
          width: "90%",
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: "15%", alignItems: "center" }}>
            <MaterialCommunityIcons name="pill" color={"black"} size={25} />
          </View>
          <View
            style={{
              width: "85%",
              justifyContent: "center",
              marginBottom: 15,
            }}
          >
            <View style={{ flexDirection: "row", marginBottom: 5 }}>
              <View style={{ width: "100%" }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: "black",
                    marginBottom: 5,
                    fontWeight: "500",
                  }}
                >
                  {item.medication_name}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  width: "70%",
                  paddingRight: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "green",
                    marginBottom: 5,
                    fontWeight: "bold",
                  }}
                >
                  Rwf {item.unit_price}
                </Text>
              </View>
              <View
                style={{
                  width: "30%",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  Qty: {item.quantity}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    if (index == 0) {
      getPurchases();
    }
  }, []);

  return (
    <View styles={styles.container}>
      {purchases.length > 0 ? (
        <FlatList
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          data={purchases}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => getPurchases()}
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
            No purchase yet!
          </Text>
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
                <Text style={styles.modalTitle}>Order details</Text>
              </View>
            </View>

            <View
              style={{
                maxHeight: windowHeight*0.75,
                minHeight: windowHeight*0.3,
              }}
            >
              {medications.length > 0 ? (
                <FlatList
                  style={{
                    maxHeight:(windowHeight*0.75)-40,

                  }}
                  data={medications}
                  showsVerticalScrollIndicator={false}
                  renderItem={renderItem2}
                  keyExtractor={(item, index) => index.toString()}
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: "30%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    No meds...
                  </Text>
                </View>
              )}
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                width: "100%",
                marginVertical: 20,
                height:35
              }}
            >
              <TouchableOpacity
                style={{
                  width: "45%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => setShowModal(false)}
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
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Purchases;

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
    backgroundColor: "#fff",
    paddingVertical: 20,
    borderRadius: 20,
    elevation: 5,
    width: "95%",
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 16,
    marginLeft: "5%",
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
    alignSelf: "center",
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
