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
import { ScrollView } from "react-native-gesture-handler";

const windowHeight = Dimensions.get("screen").height;
const windowWidth = Dimensions.get("screen").width;

const TokenMedications = ({
  navigation,
  route,
  currentItem,
  addToCart,
  cart,
  decreaseQty,
}) => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState();
  const [medicationId, setMedicationId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const getUser = async () => {
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);
    setUser(userObj)
  }

  useEffect(() => {
    const medications_ = route.params.medications.map(med =>{return({...med,quantity:1})})
    setMedications(medications_)
    getUser();
  }, []);

  const add = (medId) => {
    const updatedMedications = medications.map((m) => {
        if (m.id === medId) {
          return { ...m, quantity: m.quantity+1 };
        }
        return m;
      });
      setMedications(updatedMedications);
  }

  const remove = (medId) => {
    const updatedMedications = medications.map((m) => {
        if (m.id === medId) {
          return { ...m, quantity:m.quantity>1 ? m.quantity-1:m.quantity };
        }
        return m;
      });
      setMedications(updatedMedications);
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
      medication_id:medicationId,
      phone_number:phone
  });

      axios
      .post(`${baseURL}/api/book-medication`, postObj)
      .then((res) => {
        if(res.data.status){
            setLoading(false)
            alert('Check your phone to confirm payment or Dial *182*7*1#')
            setIsVisible(false)
        }
        else{
          setLoading(false)
          alert('something went wrong!')
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
      <ScrollView
        style={{
          height: windowHeight - 100,
          backgroundColor: "#EAE8E0",
          padding: 10,
        }}
      >
        {medications.map(med=>{return(
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
                {med.name}
              </Text>
            </View>
            <View style={{width:'50%',}}>
            <Text style={{ fontWeight: "bold",textAlign:'right',fontSize:13 }}>
              Price: {parseInt(med.unit_price)*med.quantity} Rwf
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
                    onPress={()=>remove(med.id)}
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
                    <Text>{med.quantity}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={()=>add(med.id)}
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
                    id: med.id,
                    name: med.name,
                    branch_id: route.params.id,
                    branch: route.params.branch,
                    price: med.unit_price,
                    qty: med.quantity,
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
                onPress={()=>{setIsVisible(true);setMedicationId(med.id)}}
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
        )})}
      </ScrollView>
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
                height: 250,
                width: "90%",
                backgroundColor: "#EAE8E0",
                borderRadius: 40,
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

export default connect(mapStateToProps, mapDispatchToProps)(TokenMedications);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
