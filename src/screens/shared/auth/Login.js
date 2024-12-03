import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  View,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  ImageBackground,
} from "react-native";
import React, { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { AuthContext } from "../../../context/context";
import axios from "axios";
import { baseURL } from "../../../BaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";

const windowHeight = Dimensions.get("screen").height;

const Login = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activePanel, setActivePanel] = useState("Patient");
  const [focused, setFocused] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = React.useContext(AuthContext);

  const login = () => {
    setLoading(true);
    if (!identifier || !password) {
      alert("Enter identifier and password!");
    } else {
      setLoading(true);
      signIn(identifier, password);
      setTimeout(() => {
        setLoading(false);
      }, 10000);
    }
  };

  const otpLogin = () => {
    const postObj = JSON.stringify({
      registration_number: identifier,
    });
    axios
      .post(`${baseURL}/api/doctor-login`, postObj, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        if (res.data.status) {
          alert("Enter the otp sent on your phone!");
          navigation.navigate("Otp", { doctor_id: res.data.data.doctor_id });
        } else {
          alert("Bad credentials");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const forgotPassword = async () => {
    setLoading(true);
    if (phone.length === 10) {
      const token = await AsyncStorage.getItem("token");
      const postObj = JSON.stringify({
        phone: phone,
      });
      axios
        .post(`${baseURL}/api/forgot-password`, postObj, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          console.log(res.data);
          setLoading(false);
          if (res.data.status) {
            setShowModal(false);
            navigation.navigate("Otp", { user_id: res.data.data.user_id });
          } else {
            alert("Password not reset. Something went wrong");
          }
        })
        .catch((error) => {
          setLoading(false);
          alert("Password not reset. Something went wrong");
        });
    } else {
      alert("Enter a valid phone number");
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="height" enabled>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: "white",
            height: windowHeight,
            paddingTop: 75,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              alignSelf: "center",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 25,
                  color: "#178838",
                  marginLeft: "5%",
                  marginVertical: 10 * 1.5,
                }}
              >
                Login
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  marginLeft: "5%",
                }}
              >
                WELCOME BACK
              </Text>
            </View>

            {/* <View
              style={{
                flexDirection: "row",
                marginTop: 20,
                marginLeft:"5%"
              }}
            >
              <TouchableOpacity
                onPress={() => setActivePanel("Patient")}
                style={{
                  height: 30,
                  paddingHorizontal:10,
                  flexDirection: "row",
                  backgroundColor:
                  activePanel === "Patient" ? "#B7DAC1" : "#EAE8E0",
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: activePanel === "Patient" ? 1 : 0,
                }}
              >
                {activePanel==="Patient"&&(
                  <FontAwesome
                  name="check"
                  size={20}
                  style={{ marginRight: 10 }}
                />
                )}
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: activePanel === "Patient" ? "500" : "normal",
                  }}
                >
                  Patient
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActivePanel("Doctor")}
                style={{
                  height: 30,
                  paddingHorizontal:10,
                  marginLeft: 15,
                  flexDirection: "row",
                  backgroundColor:
                    activePanel === "Doctor" ? "#B7DAC1" : "#EAE8E0",
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {activePanel==="Doctor"&&(
                  <FontAwesome
                  name="check"
                  size={20}
                  style={{ marginRight: 10 }}
                />
                )}
                
                <Text
                  style={{
                    fontSize: 14,
                  }}
                >
                  Doctor
                </Text>
              </TouchableOpacity>
            </View> */}

            <View
              style={{
                marginVertical: 10 * 2,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  marginLeft: "8%",
                  marginTop: 15,
                  alignSelf: "flex-start",
                }}
              >
                {activePanel == "Patient" ? "Phone number" : "Reg.number"}
              </Text>
              <TextInput
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChangeText={(text) => setIdentifier(text)}
                keyboardType="phone-pad"
                placeholderTextColor={"#626262"}
                placeholder={
                  activePanel == "Patient" ? "Phone number" : "Reg.number"
                }
                style={[
                  {
                    fontSize: 14,
                    paddingLeft: 20,
                    backgroundColor: "#fff",
                    borderRadius: 5,
                    marginVertical: 10,
                    width: "90%",
                    height: 45,
                    ...styles.shadow,
                  },
                ]}
              />

              {activePanel === "Patient" && (
                <>
                  <Text
                    style={{
                      marginLeft: "8%",
                      marginTop: 15,
                      alignSelf: "flex-start",
                    }}
                  >
                    Password
                  </Text>
                  <TextInput
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onChangeText={(text) => setPassword(text)}
                    placeholder="Password"
                    placeholderTextColor={"#626262"}
                    style={[
                      {
                        fontSize: 14,
                        paddingLeft: 20,
                        backgroundColor: "#fff",
                        borderRadius: 5,
                        marginTop: 10,
                        width: "90%",
                        height: 45,
                        ...styles.shadow,
                      },
                    ]}
                    secureTextEntry
                  />
                </>
              )}
            </View>
            {activePanel === "Patient" && (
              <TouchableOpacity
                onPress={() => setShowModal(true)}
                style={{
                  alignSelf: "flex-end",
                  marginRight: "5%",
                }}
              >
                <Text
                  style={{
                    color: "#178838",
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  Forgot password?
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => (activePanel === "Patient" ? login() : otpLogin())}
              style={{
                backgroundColor: "#178838",
                marginVertical: 10 * 4,
                borderRadius: 20,
                height: 40,
                alignSelf: "center",
                alignItems: "center",
                justifyContent: "center",
                width: "50%",
                ...styles.shadow,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                }}
              >
                {loading ? (
                  <ActivityIndicator size={"small"} color="white" />
                ) : (
                  "Sign in"
                )}
              </Text>
            </TouchableOpacity>

            {activePanel === "Patient" && (
              <TouchableOpacity
                onPress={() => navigation.navigate("Signup")}
                style={{
                  alignSelf: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    textAlign: "center",
                    color: "gray",
                  }}
                >
                  Don't have an account?{" "}
                  <Text style={{ color: "#178838" }}>Signup.</Text>
                </Text>
              </TouchableOpacity>
            )}

            {/* <TouchableOpacity
              onPress={() =>
                setActivePanel(activePanel === "Patient" ? "Doctor" : "Patient")
              }
              style={{
                height: 30,
                paddingHorizontal: 10,
                marginTop: 30,
                width: "75%",
                alignSelf: "center",
                backgroundColor:
                  activePanel === "Patient" ? "#B7DAC1" : "#EAE8E0",
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                zIndex: activePanel === "Patient" ? 1 : 0,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: activePanel === "Patient" ? "500" : "normal",
                }}
              >
                {activePanel === "Patient"
                  ? "Enter as physician"
                  : "Enter as patient"}
              </Text>
            </TouchableOpacity> */}
          </View>

          <Modal
            animationType="slide"
            transparent={true}
            visible={showModal}
            onRequestClose={() => setShowModal(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  Enter your phone number to reset your password
                </Text>
                <TextInput
                  onChangeText={(text) => setPhone(text)}
                  keyboardType="phone-pad"
                  // placeholderTextColor={"#626262"}
                  placeholder={"Phone number (07********)"}
                  style={[
                    {
                      borderBottomColor: "gray",
                      borderBottomWidth: 0.5,
                      height: 35,
                      width: "100%",
                      backgroundColor: "#fff",
                      color: "black",
                      marginTop: 40,
                      paddingHorizontal: 15,
                      marginBottom: 20,
                    },
                  ]}
                />
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: "white" }]}
                    onPress={() => setShowModal(false)}
                  >
                    <Text
                      style={[styles.modalButtonText, { color: "#2FAB4F" }]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={() => {
                      forgotPassword();
                    }}
                  >
                    <Text style={styles.modalButtonText}>
                      {loading ? (
                        <ActivityIndicator size={"small"} color="white" />
                      ) : (
                        "Confirm"
                      )}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "gray",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4.65,

    elevation: 5,
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
    padding: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: "80%",
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
    backgroundColor: "white",
    color: "red",
    borderColor: "red",
    borderWidth: 0.5,
  },
  confirmButton: {
    backgroundColor: "#2FAB4F",
  },
});
