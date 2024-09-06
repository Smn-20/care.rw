import React, { useState, useEffect } from "react";
import Modal from "react-native-modal";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  ImageBackground,
  TextInput,
  LogBox,
  Alert,
  Animated,
  ActivityIndicator,
} from "react-native";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import {
  Octicons,
  AntDesign,
  EvilIcons,
  FontAwesome,
  Ionicons,
  Feather,
  Entypo,
  MaterialCommunityIcons,
  FontAwesome6,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { connect } from "react-redux";
import { removeFromCart, clearCart } from "../../redux/cart/cart-actions";
import { baseURL } from "../../BaseUrl";
import BottomNavigator from "../../components/BottomNavigator";

const windowHeight = Dimensions.get("screen").height;

const BACKGROUND_FETCH_TASK = "checkout";

let date;
let referenceId;

const handleSubmit = () => {
  axios
    .get(`${baseURL}/api/payment-details/${referenceId}`, {
      headers: { "Content-Type": "application/json" },
    })
    .then(async (res) => {
      if (res.data.data?.payment_status == "successful") {
        //clear cart
        clearCart();
        await unregisterBackgroundFetchAsync();
      }
      if(res.data?.data?.response_code==="600"){
        alert("Insufficient balance!");
        await unregisterBackgroundFetchAsync();
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const newDate = new Date();
  const differenceMs = Math.abs(newDate - date);

  // Convert milliseconds to minutes
  const differenceMinutes = Math.floor(differenceMs / (1000 * 60));
  console.log(differenceMinutes);
  if (differenceMinutes > 3) {
    await unregisterBackgroundFetchAsync();
  } else {
    handleSubmit();
  }

  // Be sure to return the successful result type!
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 3, // 15 minutes
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });
}

async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}

const Cart = ({ navigation, cart, removeFromCart, clearCart }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [cname, setNames] = useState("");
  const [loading, setLoading] = useState(false);
  const [pickUpFee, setPickUpFee] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState();
  const [cartCount, setCartCount] = useState(0);
  const [answer, setAnswer] = useState();
  const [totalAmount, setTotalAmount] = useState(0);

  const [isRegistered, setIsRegistered] = useState(false);
  const [status, setStatus] = useState(null);

  const modalHandler = () => {
    setIsVisible(!isVisible);
  };

  const getUser = async () => {
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);
    setUser(userObj);
  };

  const handlePhone = (val) => {
    setPhone(val);
  };

  const createOrder = async () => {
    setLoading(true);
    const my_token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);

    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${my_token}`,
    };

    const postObj = JSON.stringify({
      user_id: userObj.id,
      medications: cart.map((item) => {
        return {
          branch_id: item.branch_id,
          medication_id: item.id,
          quantity: item.qty,
        };
      }),
    });
    console.log(postObj);

    if (
      (phone.length === 10 || phone.length === 12) &&
      (phone.slice(0, 2) == "07" || phone.slice(0, 2) == "25")
    ) {
      axios
        .post(`${baseURL}/api/buy-medications`, postObj)
        .then((res) => {
          if (res.data.status) {
            pay(res.data.data?.order?.id);
          } else {
            setLoading(false);
            alert("something went wrong!");
            setIsVisible(false);
          }
          // alert("Order completed!!!");
          // clearInterval(setint)
          // navigation.push("PatientHome");
        })
        .catch((err) => {
          setLoading(false);
          alert("something went wrong!");
          setIsVisible(false);
          console.log(err);
        });
    } else {
      alert("Enter a valid phone number");
    }
  };

  const pay = async (orderId) => {
    const my_token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);

    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${my_token}`,
    };

    const postObj = JSON.stringify({
      order_id: orderId,
      user_id: userObj.id,
      amount: totalAmount,
      service_fee:
        answer === "pickup"
          ? Math.ceil((totalAmount * pickUpFee) / 100)
          : deliveryFee,
      service: answer === "pickup" ? "pick_up" : "delivery",
      phone_number: phone,
    });

    console.log(postObj);

    axios
      .post(`${baseURL}/api/order/payment`, postObj)
      .then((res) => {
        referenceId = res.data.reference_id;
        if (res.data.status) {
          console.log(res.data)
          setLoading(false);
          alert("Check your phone to confirm payment or Dial *182*7*1#");
          setIsVisible(false);
          toggleFetchTask();
          const int = setInterval(() => {
            console.log("ok,front");
            axios
              .get(`${baseURL}/api/payment-details/${referenceId}`, {
                headers: { "Content-Type": "application/json" },
              })
              .then(async (res) => {
                if (res.data.data?.payment_status == "successful") {
                  //clear cart
                  clearCart();
                  clearInterval(int);
                  await unregisterBackgroundFetchAsync();
                }
                if(res.data?.data?.response_code==="600"){
                  alert("Insufficient balance!");
                  await unregisterBackgroundFetchAsync();
                  clearInterval(int);
                }
              })
              .catch((err) => {
                console.log(err);
              });
          }, 10000);
          setTimeout(() => {
            clearInterval(int);
            console.log("time interval cleared using timeout");
          }, 180 * 1000);
        } else {
          setLoading(false);
          alert("something went wrong!");
          setIsVisible(false);
        }
      })
      .catch((err) => {
        setIsVisible(false);
        alert("something went wrong!");
        setLoading(false);
        console.log(err);
      });
  };

  const toggleFetchTask = async () => {
    date = new Date();
    await registerBackgroundFetchAsync();

    checkStatusAsync();
  };

  const checkStatusAsync = async () => {
    const status = await BackgroundFetch.getStatusAsync();
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_FETCH_TASK
    );
    setStatus(status);
    setIsRegistered(isRegistered);
  };

  const format = (amount) => {
    return Number(amount)
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const initializeCart = async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_FETCH_TASK
    );
    if (isRegistered) {
      await unregisterBackgroundFetchAsync();
    }
    checkStatusAsync();
    console.log(cart);
    let count = 0;
    let amount = 0;
    cart.forEach((item) => {
      count += item.qty;
      amount += item.qty * item.price;
    });
    setCartCount(count);
    setTotalAmount(amount);
  };

  useEffect(() => {
    initializeCart();
  }, [cart, cartCount, totalAmount, setCartCount, setTotalAmount]);

  useEffect(() => {
    getUser();
    getServiceFees();
  }, []);

  const getTotal = (amount) => {
    if (answer === "pickup") {
      return amount + Math.ceil((amount * pickUpFee) / 100);
    } else if (answer === "delivery") {
      return amount + deliveryFee;
    } else {
      return amount;
    }
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

  const deleteAlert = (itemId, branchId) =>
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this medication from your cart",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => removeFromCart(itemId, branchId) },
      ]
    );

  const renderHeader = () => {
    return (
      <View
        style={{
          height: 100,
          backgroundColor: "#F8FAFC",
          paddingTop: 60,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            paddingLeft: "5%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <AntDesign
                style={{ marginRight: 20 }}
                name="arrowleft"
                size={18}
              />
            </TouchableOpacity>
            <Text style={{ fontSize: 20 }}>Cart</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View>
      <View>
        {renderHeader()}
        <ScrollView
          style={{ height: windowHeight - 180, backgroundColor: "white" }}
        >
          {cart.length === 0 ? (
            <View
              style={{
                width: "100%",
                height: 400,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text>Empty Cart</Text>
            </View>
          ) : (
            <View>
              {cart.map((product) => (
                <View
                  style={{
                    backgroundColor: "white",
                    paddingHorizontal: 7,
                    paddingVertical: 15,
                    alignSelf: "center",
                    borderRadius: 10,
                    marginTop: 10,
                    width: "95%",
                    marginBottom: 10,
                    ...styles.shadow,
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <View style={{ width: "11%", alignItems: "center" }}>
                      <MaterialCommunityIcons
                        name="pill"
                        size={24}
                        color="black"
                      />
                    </View>
                    <View
                      style={{
                        width: "77%",
                        justifyContent: "center",
                        marginBottom: 5,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <View
                          style={{
                            width: "100%",
                            justifyContent: "center",
                            alignItems: "flex-start",
                          }}
                        >
                          <Text style={{ fontSize: 14, color: "black" }}>
                            {product.name}
                          </Text>
                          <View style={{ flexDirection: "row" }}>
                            <View style={{ width: "48%" }}>
                              <Text style={{ marginTop: 5, fontSize: 12 }}>
                                Quantity: {product.qty}
                              </Text>
                            </View>
                            <View
                              style={{
                                width: "48%",
                                alignItems: "flex-end",
                              }}
                            >
                              <Text
                                style={{
                                  marginTop: 5,
                                  fontSize: 12,
                                  color: "green",
                                }}
                              >
                                {product.price} Rwf
                              </Text>
                            </View>
                          </View>
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
                            width: "53%",
                            justifyContent: "center",
                            alignItems: "flex-start",
                          }}
                        >
                          <Text style={{ fontSize: 12, color: "black" }}>
                            {product.branch}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: "44%",
                            alignItems: "flex-end",
                          }}
                        >
                          <Text style={{ fontSize: 12, color: "black" }}>
                            Total: {product.price} Rwf
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        deleteAlert(product.id, product.branch_id);
                      }}
                      style={{
                        width: "12%",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <FontAwesome6
                        name="trash-can"
                        size={18}
                        color="#f08080"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  borderTopColor:'#707070',
                  borderTopWidth: 0.5,
                  marginHorizontal: 10,
                  marginTop: 20,
                }}
              >
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
                      borderColor: answer === "pickup" ? "#178838" : "black",
                      borderWidth: 2,
                      backgroundColor: "white",
                    }}
                  >
                    {answer === "pickup" && (
                      <FontAwesome name="circle" size={14} color="#178838" />
                    )}
                  </TouchableOpacity>
                  <Text style={{ flex: 1, marginLeft: 10 }}>Pick-up</Text>
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
                      borderColor: answer === "delivery" ? "#178838" : "black",
                      borderWidth: 2,
                      backgroundColor: "white",
                    }}
                  >
                    {answer === "delivery" && (
                      <FontAwesome name="circle" size={14} color="#178838" />
                    )}
                  </TouchableOpacity>
                  <Text style={{ flex: 1, marginLeft: 10 }}>Delivery</Text>
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
                      fontWeight: "500",
                      color: "#000",
                    }}
                  >
                    Service Fees:{" "}
                    {answer === "delivery"
                      ? deliveryFee
                      : Math.ceil((totalAmount * pickUpFee) / 100)}{" "}
                    Rwf
                  </Text>
                </View>
              )}

              <View
                style={{
                  width: "100%",
                  alignItems: "flex-start",
                  marginLeft: "5%",
                  marginTop:8
                }}
              >
                <Text
                  style={{ fontSize: 15, fontWeight: "500", color: "black" }}
                >
                  Subtotal:{" "}
                  {JSON.stringify(format(totalAmount)).substring(
                    1,
                    JSON.stringify(format(totalAmount)).length - 4
                  )}{" "}
                  Rwf
                </Text>
              </View>

              <View
                style={{
                  width: "90%",
                  height: 60,
                  flexDirection: "row",
                  paddingVertical: 10,
                  marginTop: 15,
                  alignSelf: "center",
                }}
              >
                <View style={{ width: "30%", alignItems: "flex-start" }}>
                  <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                    Total to pay:
                  </Text>
                </View>

                <View style={{ width: "33%", alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "bold",
                      color: "#178838",
                    }}
                  >
                    {JSON.stringify(format(getTotal(totalAmount))).substring(
                      1,
                      JSON.stringify(format(getTotal(totalAmount))).length - 4
                    )}{" "}
                    Rwf
                  </Text>
                </View>
              </View>

              {/* <Text>{this.props.shoppingCartStore.totalAmount}</Text> */}
            </View>
          )}

          {cartCount > 0 && answer && (
            <TouchableOpacity
              style={styles.signIn}
              onPress={() => modalHandler()}
            >
              <View
                style={{
                  backgroundColor: "#2FAB4F",
                  width: "70%",
                  height: 40,
                  alignItems: "center",
                  borderRadius: 20,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
                >
                  Proceed to checkout
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <Modal
        animationType="slide"
        visible={isVisible}
        style={{ backgroundColor: "#000000AA", margin: 0 }}
      >
        <TouchableOpacity
          onPress={modalHandler}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                height: 270,
                width: "90%",
                backgroundColor: "#fff",
                borderRadius: 40,
              }}
            >
              <Text
                style={{
                  marginTop: 30,
                  marginLeft: "5%",
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "black",
                }}
              >
                Checkout
              </Text>
              <Text
                style={{
                  marginTop: 30,
                  marginLeft: "5%",
                  fontSize: 14,
                  color: "gray",
                }}
              >
                Add your phone number to checkout
              </Text>
              <View style={{ justifyContent: "center", alignItems: "center" }}>
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
                  onChangeText={(text) => handlePhone(text)}
                />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    width: "100%",
                    marginTop: 20,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      width: "45%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={modalHandler}
                  >
                    <Text
                      style={{
                        color: "#2FAB4F",
                        fontSize: 15,
                        fontWeight: "500",
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      createOrder();
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
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      <BottomNavigator navigation={navigation} userRole={user?.user_type} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
  },
  sliderContainer: {
    height: 200,
    width: "90%",
    marginTop: 10,
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 8,
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 8,
  },
  sliderImage: {
    height: "100%",
    width: "100%",
    alignSelf: "center",
    borderRadius: 8,
  },
  categoryContainer: {
    flexDirection: "row",
    width: "100%",
    alignSelf: "center",
    marginTop: 25,
    marginBottom: 10,
  },
  categoryBtn: {
    flex: 1,
    width: "30%",
    marginHorizontal: 0,
    alignSelf: "center",
  },
  categoryIcon: {
    borderWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: 70,
    height: 70,
    backgroundColor: "#fdeae7",
    borderRadius: 50,
  },
  categoryBtnTxt: {
    alignSelf: "center",
    marginTop: 5,
    color: "#de4f35",
  },
  cardsWrapper: {
    marginTop: 20,
    marginLeft: 20,
    flexDirection: "row",
    width: "100%",
  },
  card: {
    height: 150,
    width: 300,
    marginHorizontal: 10,
    marginBottom: 20,
    flexDirection: "row",
    shadowColor: "#999",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  cardImgWrapper: {
    width: 130,
  },
  cardImg: {
    width: "100%",
    height: "100%",
    alignSelf: "center",
    borderRadius: 8,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
  },
  cardInfo: {
    flex: 2,
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderBottomRightRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: "#e5e4eb",
  },
  cardTitle: {
    fontWeight: "bold",
  },
  cardDetails: {
    fontSize: 12,
    color: "#444",
  },
  signIn: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
});

const mapDispatchToProps = (dispatch) => {
  return {
    removeFromCart: (id, branchId) => dispatch(removeFromCart(id, branchId)),
    clearCart: () => dispatch(clearCart()),
  };
};

const mapStateToProps = (state) => {
  return {
    cart: state.cart.cart,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Cart);
