import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseURL } from "../../BaseUrl";
import axios from 'axios';
const windowHeight = Dimensions.get("screen").height;
const windowWidth = Dimensions.get("screen").width;

const MedicinePharmacies = ({ navigation, route }) => {
  const [data, setData] = useState([]);
  const getData = async () => {
    const token = await AsyncStorage.getItem("token");
    axios
      .get(`${baseURL}/api/available-medication/${route.params.medication_id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setData(res.data.data);
        console.log(res.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
      getData();
  }, [route.params.medication_id]);

  return (
    <View styles={styles.container}>
      <StatusBar barStyle="dark-content" translucent={false} />
      <View
        style={{
          height: 100,
          borderBottomWidth: 0.2,
          borderBottomColor: "gray",
          backgroundColor: "#fff",
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
              {route.params.medication_name}
            </Text>
          </View>
          <View
            style={{
              width: "20%",
              justifyContent: "center",
              alignItems: "center",
            }}
          ></View>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ height: windowHeight - 100, backgroundColor: "#fff" }}
      >
        {data.length>0?(
            data.map((el) => {
                return (
                  <TouchableOpacity
                    onPress={()=>navigation.navigate("MedicineDetails",{id:el.id,branch:el.branch_name,dosage:route.params.dosage,form:route.params.form,medication_id:route.params.medication_id,medication_name:route.params.medication_name,unitPrice:el.unit_price})}
                    style={{
                      backgroundColor: "#F1F5F9",
                      paddingTop: 15,
                      paddingRight: 10,
                      alignSelf: "center",
                      borderRadius: 10,
                      marginTop: 10,
                      width: "90%",
                    }}
                  >
                    <View style={{ flexDirection: "row" }}>
                      <View style={{ width: "20%", alignItems: "center" }}>
                        <Image
                          source={require("../../images/doctor1.png")}
                          resizeMode="stretch"
                          style={{
                            backgroundColor: "white",
                            marginTop: 5,
                            width: 40, // Adjust the width as per your design
                            height: 40, // Adjust the height as per your design
                            borderRadius: 20, // Set the borderRadius to half of width/height to create a circle
                            overflow: "hidden", // Clip the image to the rounded shape
                          }}
                        />
                      </View>
                      <View
                        style={{
                          width: "68%",
                          justifyContent: "center",
                          marginBottom: 15,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            color: "black",
                            marginBottom: 5,
                            fontWeight: "bold",
                          }}
                        >
                          {el.branch_name}
                        </Text>
                          <View style={{ flexDirection: "row" }}>
                          <View
                            style={{
                              paddingRight: 8,
                              borderRightColor: "gray",
                              borderRightWidth: 0.3,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                                color: "black",
                                marginBottom: 5,
                                fontWeight: "500",
                              }}
                            >
                              8a.m-9p.m
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#178838",
                              marginBottom: 5,
                              fontWeight: "500",
                              marginLeft: 8,
                            }}
                          >
                            {el.unit_price} Rwf
                          </Text>
                        </View>
      
                        
                      </View>
                        <View
                          style={{
                            width: "12%",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <AntDesign name="arrowright" size={20} />
                        </View>
                    </View>
                  </TouchableOpacity>
                );
              })
        ):(
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                <Text style={{marginTop:40}}>No {route.params.medication_name} in our pharmacies</Text>
            </View>
        )}
      </ScrollView>
    </View>
  );
};

export default MedicinePharmacies;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
