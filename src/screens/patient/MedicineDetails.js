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
  Alert
} from "react-native";
import { connect } from "react-redux";
import { addToCart, decreaseQty } from "../../redux/cart/cart-actions";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RadioButton } from "react-native-paper";
import { baseURL } from "../../BaseUrl";
import axios from 'axios';
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
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState();

  const getUser = async () => {
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);
    setUser(userObj)
  }

  useEffect(() => {
    getUser()
    console.log(cart);
  }, []);

  const add = () => {
    setQuantity(quantity+1)
  }

  const remove = () => {
    if(quantity>1){
      setQuantity(quantity-1)
    }
  }

  const modalHandler = () => {
    setIsVisible(!isVisible);
  };

  const showAlert = () => {
    Alert.alert(
      "",
      "Proceed to Checkout or Add Medication",
      [
        { text: "Proceed to Purchase", onPress: () => navigation.navigate("Cart"),style:"cancel" },
        {
          text: "Add Medication",
          onPress: () => navigation.navigate("SearchPage",{title:'Medicine'}),
          style: "cancel",
        },
       
      ]
    );
  }

  const checkInsufficientBalance = async (referenceId) => {
      const token = await AsyncStorage.getItem("token");
      axios
        .get(`${baseURL}/api/payment-status?type=booking&reference_id=${referenceId}`,{headers:{"Content-Type": "application/json","Authorization": `Bearer ${token}`}})
        .then((res) => {
          console.log(res.data)
          // if (res.data.success==true) {
            
          // } else {

          // }
        })
        .catch((err) => {
          console.log(err);
      });
  }

  const book = async () => {
    setLoading(true)
    const my_token = await AsyncStorage.getItem('token')
    const user = await AsyncStorage.getItem('user')
    const userObj = JSON.parse(user)

    axios.defaults.headers = {
        "Content-Type": "application/json",
        Authorization: `Token ${my_token}`,
    };

    const postObj = JSON.stringify({
      branch_id:route.params.id,
      user_id:userObj.id,
      quantity:quantity,
      medication_id:route.params.medication_id,
      phone_number:phone
  });
    console.log(postObj);

      axios
      .post(`${baseURL}/api/book-medication`, postObj)
      .then((res) => {
        if(res.data.status){
            // setTimeout(()=>{
            //   checkInsufficientBalance(res.data.data.referenceId)
            // },3000)
            setLoading(false)
            alert('Check your phone to confirm payment or Dial *182*7*1#')
            setIsVisible(false)
        }
        else{
          setLoading(false)
          alert('something went wrong!')
          console.log(res.data)
          setIsVisible(false)
        }
      })
      .catch((err) => {
        setIsVisible(false)
        alert('something went wrong!')
        setLoading(false)
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
          backgroundColor: "#EAE8E0",
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
          backgroundColor: "#EAE8E0",
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

          <View style={{width:'100%',flexDirection:'row'}}>
          <View style={{width:'50%'}}>
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
          <View style={{width:'50%',}}>
          <Text style={{ fontWeight: "bold",textAlign:'right',fontSize:13 }}>
            Price: {parseInt(route.params.unitPrice)*quantity} Rwf
          </Text>
          </View>
          </View>
          

          

          <View
            style={{ marginTop:10, justifyContent: "space-around" }}
          >

            <View style={{ width: "50%" }}>
              <Text>Quantity</Text>
              <View
                style={{
                  height: 30,
                  flexDirection: "row",
                  width: "90%",
                  marginTop: 10,
                  borderRadius: 10,
                  borderWidth: 0.2,
                  borderColor: "black",
                }}
              >
                <TouchableOpacity
                  onPress={()=>remove()}
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    width: "25%",
                    backgroundColor: "#EBF0DC",
                    borderTopLeftRadius: 10,
                    borderBottomLeftRadius: 10,
                  }}
                >
                  <Feather name="chevron-left" size={20} />
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
                  onPress={()=>add()}
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    width: "25%",
                    backgroundColor: "#EBF0DC",
                    borderTopRightRadius: 10,
                    borderBottomRightRadius: 10,
                  }}
                >
                  <Feather name="chevron-right" size={20} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 20,
            }}
          >
            <TouchableOpacity
              onPress={() =>{
                addToCart({
                  id: route.params.medication_id,
                  name: route.params.medication_name,
                  branch_id: route.params.id,
                  branch: route.params.branch,
                  price: route.params.unitPrice,
                  qty: quantity,
                })
                showAlert()
              }}
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 40,
                width: "40%",
                backgroundColor: "#EBF0DC",
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "#4C6707", fontWeight: "500" }}>
                Add to Cart
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={()=>setIsVisible(true)}
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 40,
                width: "40%",
                backgroundColor: "#D4E660",
                borderRadius: 20,
              }}
            >
              <Text style={{ fontWeight: "500" }}>Book</Text>
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
                backgroundColor: "#EAE8E0",
                borderRadius: 40,
                paddingBottom:20
              }}
            >
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Text
                  style={{
                    marginTop: 30,
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "black",
                  }}
                >
                  Enter momo number to book
                </Text>
                <Text style={{alignSelf:'flex-start',marginLeft:'5%',marginTop:10}}>Amount to pay (1% of the total amount): {(route.params.unitPrice)*quantity/100} Rwf</Text>
                <TextInput
                  style={{
                    borderColor: "gray",
                    borderWidth: 1,
                    borderRadius: 10,
                    height: 35,
                    width: "90%",
                    backgroundColor:"#DEDBCE",
                    color: "black",
                    marginTop: 40,
                    paddingHorizontal:15,
                    marginBottom: 20,
                  }}
                  name="Names"
                  placeholder="Phone Number (07********)"
                  keyboardType="numeric"
                  onChangeText={(text) => setPhone(text)}
                />

                <TouchableOpacity
                  style={{ marginTop: 20 }}
                  onPress={() => {
                    book();
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#178838",
                      paddingHorizontal:20,
                      height: 40,
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
                        Submit
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
      <BottomNavigator navigation={navigation} userRole={user?.user_type}/>
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
