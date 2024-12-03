import { AntDesign, Octicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { baseURL } from "../../BaseUrl";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const windowHeight = Dimensions.get("screen").height;
const windowWidth = Dimensions.get("screen").width;

const SearchPage = ({ navigation, route }) => {
  const [searchParam, setSearchParam] = useState(route.params.searchParam?route.params.searchParam:"");
  const [refreshing, setRefreshing] = useState();
  const [data, setData] = useState([]);
  const [data_, setData_] = useState([]);

  const search = (value) => {
    const filteredData = data_.filter((el) => {
      let elementToLowercase = route.params.title == "Pharmacy"?el.branch_name.toLowerCase(): el.name.toLowerCase();
      let searchToTermLowercase = value.toLowerCase();
      return elementToLowercase.indexOf(searchToTermLowercase) > -1;
    });

    setData(filteredData);
    console.log(filteredData);
  };

  const onClick = (item) => {
    switch (route.params.title) {
      case "Medicine":
        navigation.navigate("MedicinePharmacies",{medication_id:item.id,medication_name:item.name,dosage:item.dosage,form:item.form})
        break;
      case "Clinic":
        //navigate to clinic web
        break;
      case "Pharmacy":
        navigation.navigate("PharmacyDetails",{name:item.branch_name,id:item.id})
        break;
      case "Physician":
        break;
      default:
        break;
    }
  }

  const getUrlPath = async () => {
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user)
    switch (route.params.title) {
      case "Medicine":
        return "medications";
      case "Clinic":
        return "health-facilities";
      case "Pharmacy":
        return "pharmacy-branches";
      case "Physician":
        return "access-requests/approved/"+userObj.id;
      default:
        break;
    }
  };

  const getData = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const path = await getUrlPath()
    axios
      .get(`${baseURL}/api/` + path, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setData(res.data.data);
        setData_(res.data.data);
        setRefreshing(false);
        if(route.params.searchParam){
            const filteredData = res.data.data.filter((el) => {
              let elementToLowercase =  el.name.toLowerCase();
              let searchToTermLowercase = searchParam.toLowerCase();
              return elementToLowercase.indexOf(searchToTermLowercase) > -1;
            });
            setData(filteredData);
        }
      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  };

  useEffect(() => {
      getData();
  }, []);

  return (
    <View styles={styles.container}>
      <StatusBar barStyle="dark-content" translucent={false} />
      <View
        style={{
          height: 100,
          borderBottomWidth: 0.3,
          borderBottomColor: "black",
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
              width: "27%",
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
            <Text style={{ fontSize: 12 }}>{route.params.title}</Text>
          </View>
          <View
            style={{
              width: "60%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextInput
              placeholder="Search..."
              keyboardType="default"
              value={searchParam}
              placeholderTextColor="#666666"
              onChangeText={(value) => {
                setSearchParam(value);
                search(value);
              }}
              style={[
                styles.textInput,
                {
                  width: "100%",
                  color: "black",
                },
              ]}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            onPress={() => {setSearchParam("");setData(data_)}}
            style={{
              width: "10%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AntDesign name="close" size={18} />
          </TouchableOpacity>
         
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ height: windowHeight - 100, backgroundColor: "#fff" }}
      >
        {data?.map((el) => {
          return (
            <TouchableOpacity
              activeOpacity={1}
              onPress={()=>onClick(el)}
              style={{
                backgroundColor: "#F1F5F9",
                paddingTop: route.params.title == "Medicine"?5:15,
                paddingBottom: route.params.title == "Medicine"?5:0,
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
                    width: route.params.title == "Physician"?"80%":"68%",
                    justifyContent: "center",
                    marginBottom: route.params.title == "Medicine"?0:15,
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
                    {route.params.title == "Pharmacy"?el.branch_name:el.name}
                  </Text>

                  {route.params.title === "Medicine"&&(
                    <Text
                    style={{
                      fontSize: 14,
                      color: "black",
                      marginBottom: 5,
                      fontWeight: "500",
                    }}
                  >
                    Pharmacy: {el.pharmacy?.name}
                  </Text>
                  )}
                  {route.params.title !== "Medicine" && (
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
                      {route.params.title === "Medicine"
                        ? "2000-2500 Rwf"
                        : "Kigali Heights"}
                    </Text>
                  </View>
                  )}

                  {route.params.title === "Physician" && (
                    <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setAction("Revoke");
                        setDoctor(item);
                        setShowAccessModal(true);
                      }}
                      style={{
                        flexDirection: "row",
                        height: 25,
                        borderWidth: 1,
                        borderColor: "#178838",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 15,
                        marginTop: 5,
                        width: "50%",
                      }}
                    >
                      <AntDesign name="close" size={14} />
                      <Text
                        style={{
                          marginHorizontal: 5,
                          fontSize: 11,
                          fontWeight: "700",
                          color: "#000",
                        }}
                      >
                        Revoke access
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setAction("Revoke");
                        setDoctor(item);
                        setShowAccessModal(true);
                      }}
                      style={{
                        flexDirection: "row",
                        backgroundColor: "#178838",
                        height: 25,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 15,
                        marginTop: 5,
                        width: "40%",
                      }}
                    >
                      <Ionicons
                        color={"white"}
                        name="chatbubbles-outline"
                        size={14}
                      />
                      <Text
                        style={{
                          marginHorizontal: 5,
                          fontSize: 11,
                          fontWeight: "700",
                          color: "#fff",
                        }}
                      >
                        Chat
                      </Text>
                    </TouchableOpacity>
                  </View>
                  )}
                </View>
                {route.params.title !== "Physician" && (
                  <View
                    style={{
                      width: "12%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {route.params.title=="Clinic"? <Octicons name="link-external" size={20}/> :<AntDesign name="arrowright" size={20} />}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default SearchPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
