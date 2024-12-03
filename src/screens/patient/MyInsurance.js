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


const MyInsurance = ({ navigation, route }) => {
  const [user, setUser] = useState();
  const [insurances, setInsurances] = useState();
  const [refreshing, setRefreshing] = useState();
  const [insurance, setInsurance] = useState("");
  const [insuranceName, setInsuranceName] = useState("");
  const [insuranceOptions, setInsuranceOptions] = useState([]);
  const [insuranceId, setInsuranceId] = useState("");
  const [otp, setOtp] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const sentOtp = async (identifier) => {

    const token = await AsyncStorage.getItem('token')
    
    const postObj = JSON.stringify({
      user_id:identifier
    })

    axios
        .post(`${baseURL}/api/send-otp`, postObj,{headers:{"Content-Type": "application/json","Authorization": `Bearer ${token}`}})
        .then((res) => {
          setLoading(false)
          const dataArray = JSON.stringify(res.data).split('}{');
          const results = JSON.parse(JSON.parse(dataArray))
          // console.log(results)
          if (results.status == true) {
            setShowModal(false)
            setShowModal2(true)
          } else {
            alert("Something went wrong!");
          }
        })
        .catch((err) => {
          setLoading(false)
          console.log(err);
        });
  }

  const checkPhone = async () => {
    if(insurance && insuranceId){
      setLoading(true)
      const user = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");
      const patientObj = JSON.parse(user);
      axios
        .get(`${baseURL}/api/member/${insuranceId}`,{headers:{"Content-Type": "application/json","Authorization": `Bearer ${token}`}})
        .then((res) => {
          if (res.data.success==true) {
            if(res.data.data[0].phoneNumber===patientObj.phone.slice(2)){
              sentOtp(patientObj.id)
            }else{
              setLoading(false)
              alert("Your Ubuzima App phone number must match your insurance company's records. Please contact your insurance company for verification. Thank you.")
            }
          } else {
            setLoading(false)
            alert("There is a problem with the insurance code provided. Please contact your insurance company for verification. Thank you.");
          }
        })
        .catch((err) => {
          console.log(err);
      });
    }
    else{
      alert('Fill the form')
    }
  }

  const verifyOtp = async () => {
    setLoading2(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const patientObj = JSON.parse(user);
    const postObj = JSON.stringify({
      otp:otp,
      insurance_name: insuranceName,
      insurance_code: insuranceId,
      insurance_id: insurance,
      user_id: patientObj.id,
    });
    console.log(postObj);
    axios
      .post(`${baseURL}/api/confirm-insurance`, postObj, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLoading2(false);
        setShowModal2(false);
        setInsuranceId("");
        setInsuranceName("");
        setInsurance("");
        setOtp("");
        if (res.data.status) {
          getInsurances();
          alert("Insurance added successfully!");
        } else {
          alert("Something went wrong!");
        }
      })
      .catch((error) => {
        setLoading2(false);
        setShowModal2(false);
        setInsuranceId("");
        setInsuranceName("");
        setInsurance("");
        setOtp("");
        alert(error.message);
      });
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
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
        onPress={() =>
          navigation.navigate("InsuranceDetails", {insurance_id:item.insurance_id,insurance_code: item.insurance_code})
        }
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: "90%", justifyContent: "center" }}>
            <Text style={{ fontSize: 18, color: "black" }}>
              {item.insurance_name}
            </Text>
            <Text style={{ fontSize: 14, color: "black" }}>
              Insurance Code: {item.insurance_code}
            </Text>
          </View>
          <View style={{ width: "10%", alignItems: "flex-end" }}>
            <MaterialIcons name="arrow-forward-ios" size={20} color="#000" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getInsurances = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const patientObj = JSON.parse(user);
    setUser(patientObj);
    axios
      .get(`${baseURL}/api/insurances/${patientObj.id}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      .then((res) => {
        setRefreshing(false);
        if (res.status == 200 || res.status == 201) {
          setInsurances(res.data.message);
        } else {
          setInsurances([]);
        }
      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  };

  const getInsuranceOptions = async () => {
    const token = await AsyncStorage.getItem("token");
    axios
      .get(`${baseURL}/api/institutions/all`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.status == 200 || res.status == 201) {
          const options = res.data.data.map(el => {return({label:el.name,value:el.id})})
          setInsuranceOptions(options);
        } else {
          setInsuranceOptions([]);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };


    useEffect(() => {
      getInsuranceOptions();
      getInsurances();
      const focusHandler = navigation.addListener("focus", () => {
        getInsurances();
      });
      return focusHandler;
    }, [navigation]);

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
          height: "12%",
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
            width: "75%",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Text style={{ fontWeight: "bold", color: "white" }}>Insurances</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          style={{
            flexDirection: "row",
            backgroundColor: "#626262",
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 6,
            marginTop: 5,
            paddingHorizontal: 5,
          }}
        >
          <Feather name="plus" size={24} color="#fff" />
          <Text
            style={{
              marginHorizontal: 10,
              fontSize: 13,
              fontWeight: "800",
              color: "#FFF",
            }}
          >
            Add Insurance
          </Text>
        </TouchableOpacity>
      </View>

    
      {/* scrollview info */}
      {insurances ? (
        <View style={{ paddingBottom: 50 }}>
          {insurances.length > 0 ? (
            <FlatList
              contentContainerStyle={{
                paddingBottom: 15,
              }}
              data={insurances}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => getInsurances()}
                />
              }
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
              <Text>No insurance yet...</Text>
            </View>
          )}
        </View>
      ) : (
        <View
          style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
        >
          <ActivityIndicator size="large" color="black" />
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
            <Text style={styles.modalTitle}>New Insurance</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={insuranceOptions}
              search
              maxHeight={300}
              onChange={(text) => {
                setInsurance(text.value);
                setInsuranceName(text.label)
              }}
              value={insurance}
              labelField="label"
              valueField="value"
              placeholder="Select insurance"
              searchPlaceholder="Search..."
            />
            <TextInput
              maxLength={12}
              onChangeText={(text) => setInsuranceId(text)}
              keyboardType="alphabet"
              placeholderTextColor={"#000"}
              placeholder={"Enter Insurance ID"}
              style={[
                {
                  fontSize: 14,
                  padding: 8,
                  backgroundColor: "#f1f4ff",
                  borderRadius: 10,
                  marginTop: 15,
                  marginBottom: 35,
                  width: "100%",
                  height: 45,
                },
              ]}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  checkPhone();
                }}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? (
                    <ActivityIndicator size={"small"} color="white" />
                  ) : (
                    "Submit"
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
        visible={showModal2}
        onRequestClose={() => setShowModal2(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Verify OTP</Text>
            
            <TextInput
              maxLength={6}
              onChangeText={(text) => setOtp(text)}
              keyboardType="numeric"
              placeholderTextColor={"#000"}
              placeholder={"Enter OTP"}
              style={[
                {
                  fontSize: 14,
                  padding: 8,
                  backgroundColor: "#f1f4ff",
                  borderRadius: 10,
                  marginTop: 15,
                  marginBottom: 35,
                  width: "100%",
                  height: 45,
                },
              ]}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal2(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  verifyOtp();
                }}
              >
                <Text style={styles.modalButtonText}>
                  {loading2 ? (
                    <ActivityIndicator size={"small"} color="white" />
                  ) : (
                    "Submit"
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
export default MyInsurance;
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    width: "95%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 5,
  },
  tableCell: {
    flex: 1,
    alignItems: "center",
  },
  button: {
    marginTop: 10,
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
  cancelButton: {
    backgroundColor: "#178838",
  },
  confirmButton: {
    backgroundColor: "#38a169",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  dropdown: {
    height: 50,
    backgroundColor: "#f1f4ff",
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
    marginTop: 10,
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
