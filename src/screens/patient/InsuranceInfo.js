import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Dimensions,
  TextInput,
  LogBox,
  Modal,
  Button,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseURL } from "../../BaseUrl";
import { Feather, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";


const InsuranceInfo = ({ navigation, route }) => {
  const [insurance, setInsurance] = useState();
  const [services, setServices] = useState([
    {
      id: 123,
      name: "Service 1",
    },
    {
      id: 768,
      name: "Service 2",
    },
    {
      id: 324,
      name: "Service 3",
    },
  ]);


  const getInsuranceInfo = async () => {
    const token = await AsyncStorage.getItem('token')
      axios
        .get(`${baseURL}/api/insurance_members/${route.params.insurance_id}/${route.params.insurance_code}`,{headers:{"Content-Type": "application/json","Authorization":`Bearer ${token}`}})
        .then((res) => {
          if (res.data.success==true) {
            setInsurance(res.data.data[0])
          } else {
            setInsurance({})
            console.log('Something went wrong!')
          }
        })
        .catch((err) => {
          setInsurance({})
          console.log(err);
      });

  }

  useEffect(()=>{
    getInsuranceInfo();
  },[])

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
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 16, color: "black", fontWeight: "bold" }}>
              {item.name}
            </Text>
          </View>
        </View>
      </View>
    );
  };

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
          <Text style={{ fontWeight: "bold", color: "white" }}>
            Insurance Info
          </Text>
        </View>
      </View>

      {insurance?(
        <>
        <View
        style={{
          backgroundColor: "#FED7DE",
          padding: 15,
          alignSelf: "center",
          borderRadius: 10,
          width: "90%",
          marginBottom: 10,
          ...styles.shadow,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              width: "45%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Insurance institutions: {insurance?.policies?.map(policy => policy?.insuranceInstitution?.name).join(', ') || 'N/A'}
            </Text>
          </View>
          <View
            style={{
              width: "45%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              National ID: {insurance?.nationalId || 'N/A'}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            marginTop: 15,
          }}
        >
          <View
            style={{
              width: "45%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Created On: {insurance?.createdOn || "N/A"}
            </Text>
          </View>
          <View
            style={{
              width: "45%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Member Code: {insurance?.code || 'N/A'}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            marginTop: 15,
          }}
        >
          <View
            style={{
              width: "45%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Names: {insurance?.firstName} {insurance?.lastName}
            </Text>
          </View>
          <View
            style={{
              width: "45%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Member Type: {insurance?.currentMemberType || 'N/A'}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            marginTop: 15,
          }}
        >
          <View
            style={{
              width: "45%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Affiliate ID: {insurance?.affiliateId || 'N/A'}
            </Text>
          </View>
          <View
            style={{
              width: "45%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Policy Status: {insurance?.status || 'N/A'}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            marginTop: 15,
          }}
        >
          <View
            style={{
              width: "45%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Phone number: {insurance?.phoneNumber || 'N/A'}
            </Text>
          </View>
          <View
            style={{
              width: "45%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Email: {insurance?.email || 'N/A'}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            marginTop: 15,
          }}
        >
          <View
            style={{
              width: "45%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              DOB: {insurance?.dob? (new Date(insurance?.dob)).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }): 'N/A'}
            </Text>
          </View>
          <View
            style={{
              width: "45%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Gender: {insurance?.gender || 'N/A'}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            marginTop: 15,
          }}
        >
          <View
            style={{
              width: "45%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Insurance coverage: {`${insurance?.policies && (insurance?.policies[0]?.policyPercentage)}%` || 'N/A'}
            </Text>
          </View>
          <View
            style={{
              width: "45%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Insurance Eligibility Period: { (`${new Date(insurance?.membership?.membershipFromDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}-${new Date(insurance?.membership?.membershipToDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}` || 'N/A')}
            </Text>
          </View>
        </View>
      </View>

      {/* <Text
        style={{
          fontSize: 18,
          color: "black",
          marginLeft: "5%",
          marginTop: 15,
          fontWeight: "bold",
        }}
      >
        Allowed Services
      </Text>
      {services ? (
        <View style={{ paddingBottom: 50 }}>
          {services.length > 0 ? (
            <FlatList
              contentContainerStyle={{
                paddingBottom: 15,
              }}
              data={services}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
            />
          ) : (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                marginTop: 100,
              }}
            >
              <Text>No Service allowed...</Text>
            </View>
          )}
        </View>
      ) : (
        <View
          style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
        >
          <ActivityIndicator size="large" color="black" />
        </View>
      )} */}
        </>
      ):(
        <View
          style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
        >
          <ActivityIndicator size="large" color="black" />
        </View>
      )}

      
    </View>
  );
};
export default InsuranceInfo;
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

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 5,
  },

  button: {
    marginTop: 10,
  },
});
