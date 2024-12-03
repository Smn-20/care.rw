import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { baseURL } from "../../BaseUrl";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const windowHeight = Dimensions.get("screen").height;
const windowWidth = Dimensions.get("screen").width;

const Doctors = ({ navigation, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [doctorCode, setDoctorCode] = useState();
  const [refreshing, setRefreshing] = useState();
  const [doctors, setDoctors] = useState([]);
  const [plans, setPlans] = useState([]);
  const [plan, setPlan] = useState("");
  const [phone, setPhone] = useState("");
  const [requestId, setRequestId] = useState("");
  const [doctor, setDoctor] = useState();

  const addDoctor = async () => {
    if (doctorCode) {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      axios
        .get(`${baseURL}/api/doctors/${doctorCode}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          if (res.data.status) {
            setDoctor(res.data.data);
            setLoading(false);
          } else {
            setLoading(false);
            setShowModal(false);
            alert("Invalid Doctor code");
          }
        })
        .catch((error) => {
          alert("Invalid Doctor code");
          setShowModal(false);
          setLoading(false);
          console.log(error);
        });
    } else {
      alert("Please enter a valid doctor code");
    }
  };

  const requestPhysician = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);
    const postObj = JSON.stringify({
      user_id: userObj.id,
      doctor_id: doctor.id,
    });
    axios
      .post(`${baseURL}/api/access/request`, postObj, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((resp) => {
        setLoading(false);
        setDoctor("");
        if (resp.data.status) {
          alert("Physician request sent!");
          setShowModal(false);
          getDoctors();
        } else {
          alert("Something went wrong");
          setShowModal(false);
        }
      })
      .catch((error) => {
        setDoctor("");
        setLoading(false);
        console.log(error);
      });
  };

  const pay = async () => {
    setLoading3(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);
    const postObj = JSON.stringify({
      request_id: requestId,
      subscription_id: plan,
      phone_number: phone,
    });
    console.log(postObj)
    axios
      .post(`${baseURL}/api/subscription/payment`, postObj, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((resp) => {
        setLoading3(false);
        if (resp.data.status) {
          alert("Physician successfully added!");
          setShowModal(false);
          getDoctors();
        } else {
          alert("Something went wrong");
          setShowModal(false);
        }
      })
      .catch((error) => {
        setLoading3(false);
        console.log(error);
      });
  };

  const getDoctors = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);
    axios
      .get(`${baseURL}/api/access-requests/all/${userObj.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setDoctors(res.data.data);
        setRefreshing(false);
      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  };

  const getSubPlans = async () => {
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    axios
      .get(`${baseURL}/api/subscription-plans`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const myPlans = res.data.data.map((el) => {
          return { label: el.type, value: el.id };
        });
        setPlans(myPlans);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const checkSubscriptionPayment = async (doctorId, names, userType, request_id) => {
    setLoading2(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);
    axios
      .get(
        `${baseURL}/api/access-requests/subscription/${userObj.id}/${doctorId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setLoading2(false);
        if(res.data.data.length>0){
          if (res.data.data[0].status === "granted") {
            navigation.navigate("ChatRoom", {
              names: names,
              id: doctorId,
              userType,
            });
          } else {
            setIsVisible(true);
            setRequestId(request_id)
          }
        }else {
          setIsVisible(true);
          setRequestId(request_id)
        }
      })
      .catch((error) => {
        setLoading2(false);
        console.log(error);
      });
  };

  const revoke = async (id) => {
    const token = await AsyncStorage.getItem("token");
    const postObj = JSON.stringify({
      access_id: id,
    });
    axios
      .put(`${baseURL}/api/access-control/revoke`, postObj, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLoading(false);
        if (res.data.status) {
          alert("Access revoked successfully!");
          getDoctors();
        } else {
          alert("Something went wrong!");
        }
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  const revokeAlert = (id) =>
    Alert.alert(
      "Revoke Access",
      "Are you sure you want to revoke access to this physician",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => revoke(id) },
      ]
    );

  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          backgroundColor: "#F1F5F9",
          paddingTop: 15,
          paddingBottom: 5,
          paddingRight: 10,
          alignSelf: "center",
          borderRadius: 10,
          marginTop: 10,
          width: "90%",
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: "30%", alignItems: "center" }}>
            <Image
              source={require("../../images/doctor1.png")}
              resizeMode="stretch"
              style={{
                backgroundColor: "white",
                marginTop: 5,
                width: 65, // Adjust the width as per your design
                height: 65, // Adjust the height as per your design
                borderRadius: 32.5, // Set the borderRadius to half of width/height to create a circle
                overflow: "hidden", // Clip the image to the rounded shape
              }}
            />
          </View>
          <View
            style={{
              width: "70%",
              justifyContent: "center",
              marginBottom: 15,
            }}
          >
            <View style={{ flexDirection: "row", marginBottom: 5 }}>
              <View style={{ width: "70%" }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: "black",
                    marginBottom: 5,
                    fontWeight: "bold",
                  }}
                >
                  Dr. {item.doctor?.names}
                </Text>
              </View>
              <View style={{ width: "30%" }}>
                <Text
                  style={{
                    fontSize: 13,
                    color:
                      item.request === "pending"
                        ? "orange"
                        : item.request === "approved"
                        ? "green"
                        : "red",
                    marginBottom: 5,
                    fontWeight: "bold",
                  }}
                >
                  {item.request}
                </Text>
              </View>
            </View>
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
                  {item.doctor?.department?.department_name}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: "black",
                  marginBottom: 5,
                  fontWeight: "500",
                  marginLeft: 8,
                }}
              >
                Reg.No: {item.doctor?.registration_number}
              </Text>
            </View>

            {item.request==='approved'&&(
              <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                onPress={() => {
                  revokeAlert(item.id);
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
                  checkSubscriptionPayment(
                    item.doctor_id,
                    item.doctor?.names,
                    "patient",
                    item.id
                  );
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
                {loading2 ? (
                  <ActivityIndicator color={"white"} size={"small"} />
                ) : (
                  <>
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
                  </>
                )}
              </TouchableOpacity>
            </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    if (index == 3 && doctors.length == 0) {
      getDoctors();
      getSubPlans();
    }
  }, []);

  return (
    <View styles={styles.container}>
      {doctors.length > 0 ? (
        <FlatList
          contentContainerStyle={{
            paddingBottom: 100,
            height:windowHeight-(windowHeight*13/40+200),
          }}
          data={doctors}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => getDoctors()}
            />
          }
        />
      ) : (
        <View
          style={{
            width: "100%",
            height:windowHeight-(windowHeight*13/40+200),
            
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            Haven't added your physician yet!
          </Text>
          <Text style={{ fontSize: 14, marginTop: 20 }}>
            Click below to add one
          </Text>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={{
              justifyContent: "center",
              alignItems: "center",
              height: 40,
              width: "40%",
              flexDirection: "row",
              marginTop: 10,
              backgroundColor: "#178838",
              borderRadius: 20,
            }}
          >
            <AntDesign name="plus" size={20} color="white" />
            <Text style={{ fontWeight: "500", color: "white", marginLeft: 10 }}>
              Add Physician
            </Text>
          </TouchableOpacity>
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
            {doctor ? (
              <View>
                <TouchableOpacity
                  onPress={() => {
                    setShowModal(false);
                    setDoctor("");
                  }}
                  style={{
                    width: 30,
                    height: 30,
                    justifyContent: "center",
                    alignItems: "center",
                    alignSelf: "flex-end",
                    marginRight: 10,
                  }}
                >
                  <Ionicons name="close" size={20} />
                </TouchableOpacity>
                <View
                  style={{
                    alignItems: "center",
                    marginTop: windowWidth / 30,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#F5F4EC",
                      width: "95%",
                      paddingHorizontal: 10,
                      height: windowHeight / 12,
                      borderRadius: 20,
                    }}
                  >
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
                    <View style={{ width: "58%" }}>
                      <Text
                        style={{
                          color: "#000",
                          fontWeight: 500,
                          marginLeft: 10,
                        }}
                      >
                        {doctor.names}
                      </Text>
                      <Text
                        style={{
                          color: "gray",
                          fontWeight: 500,
                          fontSize:13,
                          marginLeft: 10,
                        }}
                      >
                        {doctor.department.department_name}
                      </Text>
                      <Text
                        style={{
                          color: "gray",
                          fontWeight: 500,
                          fontSize:13,
                          marginLeft: 10,
                        }}
                      >
                        Reg.number: {doctor.registration_number}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        requestPhysician();
                      }}
                      style={{
                        width: "22%",
                        height: "60%",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#178838",
                        borderRadius: 20,
                      }}
                    >
                      <Text style={{ color: "white", marginRight: 5 }}>
                        {loading ? (
                          <ActivityIndicator size={"small"} color="white" />
                        ) : (
                          "Request"
                        )}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <View style={{ margin: 15 }}>
                <Text style={styles.modalTitle}>Type Doctor's Code</Text>
                <TextInput
                  onChangeText={(text) => setDoctorCode(text)}
                  keyboardType="phone-pad"
                  placeholderTextColor={"#626262"}
                  placeholder={"Doctor code..."}
                  style={[
                    {
                      fontSize: 14,
                      padding: 8,
                      backgroundColor: "#DEDBCE",
                      borderRadius: 22.5,
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
                    <Text style={{ fontWeight: "bold", color: "red" }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={() => {
                      addDoctor();
                    }}
                  >
                    <Text style={styles.modalButtonText}>
                      {loading ? (
                        <ActivityIndicator size={"small"} color="white" />
                      ) : (
                        "Add"
                      )}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={{padding:15,...styles.modalContent}}>
            <Text style={styles.modalTitle}>Enter your momo phone number</Text>
            <TextInput
              onChangeText={(text) => setPhone(text)}
              keyboardType="phone-pad"
              placeholderTextColor={"#626262"}
              placeholder={"Phone number (07********)"}
              style={[
                {
                  fontSize: 14,
                  padding: 8,
                  backgroundColor: "white",
                  borderRadius: 22.5,
                  marginTop: 15,
                  borderWidth:0.3,
                  borderColor:'black',
                  marginBottom: 7,
                  width: "100%",
                  height: 45,
                },
              ]}
            />
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={plans}
              search
              maxHeight={300}
              value={plan}
              onChange={(text) => {
                setPlan(text.value);
              }}
              labelField="label"
              valueField="value"
              placeholder="Select Subscription Plan"
              searchPlaceholder="Search..."
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {setIsVisible(false);setPlan("")}}
              >
                <Text style={[styles.modalButtonText, { color: "red" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  pay();
                }}
              >
                <Text style={styles.modalButtonText}>
                  {loading3 ? (
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

      <TouchableOpacity
        onPress={() => {
          setShowModal(true);
        }}
        style={{
          flexDirection: "row",
          backgroundColor: "#CDEF84",
          height: 40,
          bottom: 8,
          right: 10,
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          marginTop: 5,
          width: 40,
          ...styles.shadow
        }}
      >
        <Entypo color={"black"} name="plus" size={20} />
      </TouchableOpacity>
    </View>
  );
};

export default Doctors;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: 20,
    height: 40,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#FBF9F1",
    paddingVertical: 20,
    borderRadius: 20,
    elevation: 5,
    width: "95%",
  },
  modalTitle: {
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
    borderColor: "red",
    borderWidth: 1,
  },
  confirmButton: {
    backgroundColor: "#178838",
  },
  dropdown: {
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 8,
    marginBottom: 15,
    borderWidth: 0.3,
    alignSelf:'center',
    borderColor: "black",
    marginTop: 5,
    width: "100%",
  },
  dropdown2: {
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: 5,
    borderWidth: 0.3,
    borderColor: "black",
    marginTop: 5,
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
    marginLeft: 10,
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
});
