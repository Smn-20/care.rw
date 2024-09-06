import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StatusBar,
  TextInput,
  Alert,
} from "react-native";
import { connect } from "react-redux";
import { addToCart, decreaseQty } from "../../redux/cart/cart-actions";
import { AntDesign, Feather, Entypo } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RadioButton } from "react-native-paper";
import { baseURL } from "../../BaseUrl";
import axios from "axios";
import BottomNavigator from "../../components/BottomNavigator";

const windowHeight = Dimensions.get("screen").height;
const windowWidth = Dimensions.get("screen").width;

const MedicineDetails = ({
  navigation,
  route,
  currentItem,
  addToCart,
  cart,
  decreaseQty,
}) => {
  const [type, setType] = useState("solid");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState();

  const getUser = async () => {
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);
    setUser(userObj);
  };

  useEffect(() => {
    getUser();
    console.log(cart);
  }, []);

  const add = () => {
    setQuantity(quantity + 1);
  };

  const remove = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const modalHandler = () => {
    setIsVisible(!isVisible);
    setLoading(false);
  };

  const modalHandler2 = () => {
    setIsVisible2(!isVisible2);
  };

  const showAlert = () => {
    Alert.alert("", "Proceed to Checkout or Add Medication", [
      {
        text: "Proceed to Purchase",
        onPress: () => navigation.navigate("Cart"),
        style: "cancel",
      },
      {
        text: "Add Medication",
        onPress: () => navigation.navigate("SearchPage", { title: "Medicine" }),
        style: "cancel",
      },
    ]);
  };



  const checkInsufficientBalance = (referenceId) => {
    console.log(referenceId);
    axios
      .get(`${baseURL}/api/booking/payment-details/${referenceId}`, {
        headers: { "Content-Type": "application/json" },
      })
      .then(async (res) => {
        if(res.data?.data?.response_code==="600"){
          alert("Insufficient balance!")
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const book = async () => {
    setLoading(true);
    const my_token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);

    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${my_token}`,
    };

    const postObj = JSON.stringify({
      branch_id: route.params.id,
      user_id: userObj.id,
      quantity: quantity,
      medication_id: route.params.medication_id,
      phone_number: phone,
    });
    console.log(postObj);

    axios
      .post(`${baseURL}/api/book-medication`, postObj)
      .then((res) => {
        if (res.data.status) {
          console.log(res.data)
          setTimeout(()=>{
            checkInsufficientBalance(res.data.reference_id)
          },7000)
          setLoading(false);
          alert("Check your phone to confirm payment or Dial *182*7*1#");
          setIsVisible(false);
        } else {
          setLoading(false);
          alert("something went wrong!");
          console.log(res.data);
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

  return (
    <View styles={styles.container}>
      <StatusBar barStyle="dark-content" translucent={false} />
      <View
        style={{
          height: 100,
          borderBottomWidth: 0.2,
          borderBottomColor: "gray",
          backgroundColor: "#F1F5F9",
          paddingTop: 60,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "20%",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <AntDesign
                style={{ marginRight: 10 }}
                name="arrowleft"
                size={18}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              width: "60%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "black", fontSize: 14 }}>
              {route.params.branch}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => console.log("")}
            style={{
              width: "20%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AntDesign name="phone" size={18} />
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={()=>console.log("")} style={{width:'8%',borderRadius:4,height:25,justifyContent:"center",alignItems:'center',backgroundColor:"#9C936D"}}>
         <AntDesign name="search1" size={18}/>
        </TouchableOpacity> */}
        </View>
      </View>
      <View
        showsVerticalScrollIndicator={false}
        style={{
          height: windowHeight - 100,
          backgroundColor: "#fff",
          padding: 10,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            padding: 10,
            borderRadius: 20,
          }}
        >
          <View style={{ width: "100%", flexDirection: "row" }}>
            <View style={{ width: "100%" }}>
              <Text
                style={{
                  fontSize: 14,
                  color: "black",
                  marginBottom: 5,
                  fontWeight: "bold",
                }}
              >
                {route.params.medication_name}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 10, justifyContent: "space-around" }}>
            <View style={{ width: "50%" }}>
              <Text>Quantity</Text>
              <View
                style={{
                  height: 40,
                  flexDirection: "row",
                  width: "90%",
                  marginTop: 10,
                  paddingHorizontal:1,
                  borderRadius: 5,
                  borderWidth: 0.2,
                  borderColor: "black",
                }}
              >
                <TouchableOpacity
                  onPress={() => remove()}
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    width: "25%",
                    backgroundColor: "#fff",
                    borderRightColor: "black",
                    borderRightWidth: 0.5,
                    borderTopLeftRadius: 5,
                    borderBottomLeftRadius: 5,
                  }}
                >
                  <Feather name="minus" size={20} />
                </TouchableOpacity>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    width: "50%",
                  }}
                >
                  <Text>{quantity}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => add()}
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    width: "25%",
                    backgroundColor: "#fff",
                    borderLeftColor: "black",
                    borderLeftWidth: 0.5,
                    borderTopRightRadius: 5,
                    borderBottomRightRadius: 5,
                  }}
                >
                  <Feather name="plus" size={20} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={{ width: "100%", marginTop: 20 }}>
            <Text style={{ fontWeight: "normal", fontSize: 14 }}>
              Price:{" "}
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                {parseInt(route.params.unitPrice) * quantity} Rwf
              </Text>
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                addToCart({
                  id: route.params.medication_id,
                  name: route.params.medication_name,
                  branch_id: route.params.id,
                  branch: route.params.branch,
                  price: route.params.unitPrice,
                  qty: quantity,
                });
                setIsVisible2(true);
              }}
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 40,
                width: "45%",
                borderWidth: 0.5,
                borderColor: "#1E293B",
                backgroundColor: "#fff",
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "#1E293B", fontWeight: "500" }}>
                Add to Cart
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsVisible(true)}
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 40,
                width: "45%",
                backgroundColor: "#1E293B",
                borderRadius: 20,
              }}
            >
              <Text style={{ fontWeight: "500", color: "white" }}>Book</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        style={{ backgroundColor: "#000000AA", margin: 0 }}
      >
        <TouchableOpacity
          onPress={modalHandler}
          style={{
            flex: 1,
            backgroundColor: "#000000AA",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                minHeight: 250,
                width: "90%",
                backgroundColor: "#fff",
                borderRadius: 40,
                paddingBottom: 20,
              }}
            >
              <View style={{flexDirection:'row',marginTop:30,marginLeft:'5%'}}>
                <Entypo name="cog" size={24} color="black" />
                <Text
                style={{
                  fontSize: 18,
                  marginLeft:10,
                  fontWeight: "bold",
                  color: "black",
                }}
                >
                  Confirm booking
                </Text>
              </View>
              
              <Text
                style={{
                  alignSelf: "flex-start",
                  marginLeft: "5%",
                  marginTop: 20,
                }}
              >
                Fee (1%): {(route.params.unitPrice * quantity) / 100} Rwf
              </Text>
              <Text
                style={{
                  marginTop: 15,
                  marginLeft: "5%",
                  fontSize: 14,
                  color: "gray",
                }}
              >
                Add your phone number to book
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
                    marginTop: 20,
                    paddingHorizontal: 15,
                    marginBottom: 20,
                  }}
                  name="Names"
                  placeholder="Phone Number (07********)"
                  keyboardType="numeric"
                  onChangeText={(text) => setPhone(text)}
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
                      Maybe later
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      book();
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
                        Pay booking
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible2}
        style={{ backgroundColor: "#000000AA", margin: 0 }}
      >
        <TouchableOpacity
          onPress={modalHandler2}
          style={{
            flex: 1,
            backgroundColor: "#000000AA",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                height: 270,
                width: "95%",
                padding: 5,
                backgroundColor: "#fff",
                borderRadius: 40,
              }}
            >
              <AntDesign
                name="shoppingcart"
                style={{ textAlign: "center", marginTop: 30 }}
                color="#2FAB4F"
                size={40}
              />
              <Text
                style={{
                  marginTop: 30,
                  marginLeft: "5%",
                  fontSize: 17,
                  textAlign: "center",
                  color: "black",
                }}
              >
                {route.params.medication_name} added to cart
              </Text>
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
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
                    onPress={() => {
                      modalHandler2();
                      navigation.navigate("Cart");
                    }}
                  >
                    <Text
                      style={{
                        color: "#2FAB4F",
                        fontSize: 15,
                        fontWeight: "600",
                      }}
                    >
                      View cart
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      modalHandler2();
                      navigation.navigate("SearchPage", { title: "Medicine" });
                    }}
                    style={{
                      backgroundColor: "#1E293B",
                      paddingHorizontal: 20,
                      height: 40,
                      width: "49%",
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
                          fontSize: 15,
                          fontWeight: "500",
                        }}
                      >
                        Continue shopping
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

const mapDispatchToProps = (dispatch) => {
  return {
    addToCart: (item) => dispatch(addToCart(item)),
    decreaseQty: (id) => dispatch(decreaseQty(id)),
  };
};

const mapStateToProps = (state) => {
  return {
    currentItem: state.cart.currentItem,
    cart: state.cart.cart,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MedicineDetails);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
