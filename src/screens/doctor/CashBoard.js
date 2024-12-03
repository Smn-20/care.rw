import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Dimensions,
  Modal,
  ActivityIndicator,
} from "react-native";
import {
  Entypo,
  Ionicons,
  FontAwesome,
  Feather,
  EvilIcons,
  AntDesign,
} from "@expo/vector-icons";
import { BarChart } from "react-native-chart-kit";
import axios from "axios";
import { baseURL } from "../../BaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import History from "./History";
import Subscriptions from "./Subscriptions";
import BottomNavigator from "../../components/BottomNavigator";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

const CashBoard = ({ navigation }) => {
  const [user, setUser] = useState();
  const [data_, setData] = useState();
  const [withdraws, setWithdraws] = useState();
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);
  const [amount, setAmount] = useState();
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "first", title: "Subscriptions" },
    { key: "second", title: "History" },
  ]);

  const SubscriptionsRoute = () => (
    <Subscriptions navigation={navigation} index={index} />
  );

  const HistoryRoute = () => <History navigation={navigation} index={index} />;

  const renderScene = SceneMap({
    first: SubscriptionsRoute,
    second: HistoryRoute,
  });

  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const data = {
    labels: labels,
    datasets: [
      {
        data: values,
      },
    ],
  };

  const withdraw = async () => {
    if (amount) {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("user");
      const doctorObj = JSON.parse(user);
      const postObj = JSON.stringify({
        amount: parseInt(amount),
        doctor_id: doctorObj.id,
      });
      axios
        .post(`${baseURL}/api/withdraw`, postObj, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setLoading(false);
          if (res.data.status == true) {
            alert("Your withdrawal request has been processed successfully");
            setShowProfileModal(false);
          } else {
            alert(res.data?.message);
          }
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
    } else {
      alert("Enter amount");
    }
  };

  const getCashBoard = async () => {
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const doctorObj = JSON.parse(user);
    setUser(doctorObj);
    axios
      .get(`${baseURL}/api/cashboard/${doctorObj.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.status) {
          setData(res.data.data);
        } else {
          setData({});
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getCashBoard();
  }, []);
  return (
    <View styles={styles.container}>
      <StatusBar
        backgroundColor="#178838"
        barStyle="dark-content"
        translucent={false}
      />
      <View
        style={{
          width: windowWidth,
          backgroundColor: "#fff",
          height: windowHeight / 8,
          flexDirection: "row",
        }}
      >
        <View
          underlayColor="transparent"
          style={{
            width: "90%",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingLeft: 25,
            marginTop: "8%",
          }}
        >
          <Image
            source={require("../../images/logo.png")}
            style={{ width: 100 }}
            resizeMode="contain"
          />
        </View>

        <View
          style={{
            width: 40,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            marginTop: "8%",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Profile");
            }}
          >
            <Feather name="settings" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          alignSelf: "center",
          width: "90%",
          marginTop: 10,
          backgroundColor: "white",
          padding: 12,
          height: windowHeight / 5,
          borderRadius: 20,
          ...styles.shadow,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: "50%" }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Balance</Text>
            <Text style={{ fontSize: 20, fontWeight: "400", marginTop: 8 }}>
              {data_ ? data_.balance : "0"} Rwf
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              width: "50%",
              justifyContent: "flex-end",
            }}
          >
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 30,
                paddingHorizontal: 20,
                backgroundColor: "#2FAB4F",
                borderRadius: 20,
              }}
            >
              <Text style={{ fontWeight: "500", color: "white" }}>
                Withdraw
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: "row", marginTop: 20 }}>
          <View
            style={{
              width: "50%",
              flexDirection: "row",
              justifyContent: "space-evenly",
            }}
          >
            <View
              style={{
                height: 35,
                width: 35,
                marginRight: 4,
                borderRadius: 7,
                backgroundColor: "#D5FFC2",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Feather name="trending-up" size={24} color="green" />
            </View>
            <View>
              <Text style={{ fontSize: 13, fontWeight: "bold" }}>
                Total Income
              </Text>
              <Text style={{ fontSize: 13, color: "gray", marginTop: 5 }}>
                {data_ ? data_.total_amount_received : "0"} Rwf
              </Text>
            </View>
          </View>
          <View
            style={{
              width: "50%",
              flexDirection: "row",
              justifyContent: "space-evenly",
            }}
          >
            <View
              style={{
                height: 35,
                width: 35,
                marginRight: 4,
                borderRadius: 7,
                backgroundColor: "#FADBDF",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Feather name="trending-down" size={24} color="red" />
            </View>
            <View>
              <Text style={{ fontSize: 13, fontWeight: "bold" }}>
                Total Withdraw
              </Text>
              <Text style={{ fontSize: 13, color: "gray", marginTop: 5 }}>
                {data_ ? data_.total_withdrawn_amount : "0"} Rwf
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ height: (windowHeight * 27) / 40 - 65, marginTop: 5 }}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          renderTabBar={(props) => {
            return (
              <TabBar
                {...props}
                renderLabel={({ focused, route }) => {
                  return (
                    <Text
                      style={{
                        color: focused ? "#178838" : "black",
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                    >
                      {route.title}
                    </Text>
                  );
                }}
                indicatorStyle={styles.indicatorStyle}
                style={styles.tabBar}
              />
            );
          }}
          initialLayout={{ width: windowWidth }}
        />
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter amount to withdraw</Text>
            <TextInput
              onChangeText={(text) => setAmount(text)}
              placeholderTextColor={"#626262"}
              keyboardType="numeric"
              placeholder={"Amount"}
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
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton,{backgroundColor:'white'}]}
                onPress={() => setShowModal(false)}
              >
                <Text style={[styles.modalButtonText,{color:'green'}]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  withdraw();
                }}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? (
                    <ActivityIndicator size={"small"} color="white" />
                  ) : (
                    "Withdraw"
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
        visible={showReport}
        onRequestClose={() => setShowReport(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowReport(false)}
          >
            <EvilIcons name="close" size={24} color="black" />
          </TouchableOpacity>
          <View style={styles.modalContent2}>
            <View style={{ flexDirection: "row" }}>
              <View style={{ width: "90%" }}>
                <Text style={styles.modalTitle}>Withdraw Report</Text>
              </View>
              <TouchableOpacity onPress={() => setShowReport(false)}>
                <AntDesign name="close" size={30} color="#178838" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={{
                  flexDirection: "row",
                  padding: 8,
                  borderBottomColor: "black",
                  borderBottomWidth: 0.5,
                }}
              >
                <View style={{ width: "33%" }}>
                  <Text style={{ fontSize: 12 }}>Amount</Text>
                </View>
                <View style={{ width: "33%" }}>
                  <Text style={{ fontSize: 12 }}>Date</Text>
                </View>
                <View style={{ width: "33%" }}>
                  <Text style={{ fontSize: 12 }}>Status</Text>
                </View>
              </View>
              {withdraws ? (
                withdraws.length > 0 ? (
                  withdraws.map((withdraw) => {
                    return (
                      <View
                        style={{
                          flexDirection: "row",
                          padding: 15,
                          borderBottomColor: "black",
                          borderBottomWidth: 0.5,
                        }}
                      >
                        <View style={{ width: "33%" }}>
                          <Text style={{ fontSize: 12 }}>
                            {withdraw?.amount}
                          </Text>
                        </View>
                        <View style={{ width: "33%" }}>
                          <Text style={{ fontSize: 12 }}>
                            {withdraw?.created_at?.slice(0, 10)}
                          </Text>
                        </View>
                        <View style={{ width: "33%" }}>
                          <Text style={{ fontSize: 12 }}>
                            {withdraw?.status}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      flex: 1,
                      marginTop: 20,
                    }}
                  >
                    <Text>No Withdraw...</Text>
                  </View>
                )
              ) : (
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <ActivityIndicator size="large" color="black" />
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <BottomNavigator navigation={navigation} userRole={user?.user_type} />
    </View>
  );
};

export default CashBoard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  shadow: {
    shadowColor: "#707070",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.65,
    elevation: 8,
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
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: "80%",
  },
  modalContent2: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: "95%",
  },
  modalTitle: {
    textAlign: "center",
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
    backgroundColor: "#178838",
  },
  confirmButton: {
    backgroundColor: "#178838",
  },
  tabBar: {
    backgroundColor: "#fff",
  },
  indicatorStyle: {
    backgroundColor: "#178838",
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});
