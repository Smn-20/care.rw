import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Image,
  Alert,
  TextInput,
  ActivityIndicator
} from "react-native";
import { baseURL } from "../../BaseUrl";
import { AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const windowHeight = Dimensions.get("screen").height;
const windowWidth = Dimensions.get("screen").width;

const History = ({ navigation, index }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState();
  const [transactions, setTransactions] = useState([]);



  const getTransactions = async () => {
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user)
    axios
      .get(`${baseURL}/api/cashboard/doctor-transactions/${userObj.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setTransactions(res.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const extractTime = (dateString) => {
    // Create a Date object from the date string
    const date = new Date(dateString);
  
    // Get the hours and minutes from the Date object
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  
    // Format the time as hh:mm
    return `${hours}:${minutes}`;
  }

  useEffect(() => {
    if(index==1){
    getTransactions();
    }
  }, []);

  return (
    <View style={styles.container}>


            <ScrollView showsVerticalScrollIndicator={false}>
              
              {transactions ? (
                transactions.length > 0 ? (
                  transactions.map((transaction) => {
                    return (
                        <View
                        style={{
                          backgroundColor: "#fff",
                          paddingRight: 10,
                          paddingVertical:15,
                          alignSelf: "center",
                          borderRadius: 10,
                          marginTop: 10,
                          width: "90%",
                        }}
                      >
                        <View style={{ flexDirection: "row",alignItems:'center' }}>
                          <View style={{ width: "20%", alignItems: "center" }}>
                            <MaterialCommunityIcons name={transaction.type==='cash_out'?"arrow-bottom-right":"arrow-top-right"} size={30}/>
                          </View>
                          <View
                            style={{
                              width: "55%",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 13,
                                color: "black",
                                marginBottom: 5,
                                fontWeight: "bold",
                              }}
                            >
                              {transaction.amount} Rwf
                            </Text>
                            <View style={{ flexDirection: "row" }}>
                                <Text
                                  style={{
                                    fontSize: 12,
                                    color: "black",
                                    marginBottom: 5,
                                    fontWeight: "500",
                                  }}
                                >
                                  {transaction.created_at?.slice(0,10)} {extractTime(transaction.created_at)}
                                </Text>
                
                            </View>
                          </View>
                          <View style={{widtjustifyContent:'center',alignItems:'center'}}>
                             {transaction.type==='cash_out'&&(
                                 <Text style={{color:'red'}}>Cash Out</Text>
                             )}
                             {transaction.type==='cash_in'&&(
                                 <Text style={{color:'green'}}>Cash In</Text>
                             )}
                          </View>
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
  );
};

export default History;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'white'
  }
});
