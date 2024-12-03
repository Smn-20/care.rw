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
} from "react-native";
import React, { useState, useRef } from "react";
import { AntDesign } from "@expo/vector-icons";
import { AuthContext } from "../../../context/context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseURL } from "../../../BaseUrl";
const windowHeight = Dimensions.get("screen").height;

const Otp = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState(false);
  const [confirmationPassword, setConfirmationPassword] = useState(false);
  const { otpSignIn } = React.useContext(AuthContext);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    if (isNaN(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;

    setOtp(newOtp);

    // Move to the next input if there's a next input
    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "") {
      // Move to the previous input if there's a previous input
      if (index > 0) {
        inputs.current[index - 1].focus();
      }
    }
  };

  const resetPassword = async () => {
    setLoading2(true);
    if (password === confirmationPassword) {
      const token = await AsyncStorage.getItem("token");
      const postObj = JSON.stringify({
        user_id: JSON.stringify(route.params.user_id),
        password: password,
        password_confirmation: confirmationPassword,
      });
      console.log(postObj);
      axios
        .post(`${baseURL}/api/reset-password`, postObj, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          console.log(res.data);
          setLoading2(false);
          if (res.data.status) {
            setShowModal(false);
            alert("Password successfully updated!");
            navigation.navigate("Login");
          } else {
            alert("Password not reset. Something went wrong");
          }
        })
        .catch((error) => {
          setLoading2(false);
          console.log(error);
          alert("Password not reset. Something went wrong");
        });
    } else {
      alert("Passwords not matching!");
    }
  };

  const verify = () => {
    if (otp.join("").length > 5) {
      setLoading(true);
      if (route.params.user_id) {
        userVerification(route.params.user_id, otp.join(""));
      } else {
        otpSignIn(route.params.doctor_id, otp.join(""));
      }
    } else {
      alert("enter a valid otp");
    }
  };

  const userVerification = (userId, otp_) => {
    const postObj = JSON.stringify({
      user_id: userId,
      otp: otp_,
    });
    axios
      .post(`${baseURL}/api/verify-user`, postObj, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        if (res.data.status === true) {
          if (route.params.user_id) {
            alert("User verified successfully!");
            setShowModal(true);
          } else {
            alert("User verified successfully!");
            navigation.navigate("Login");
          }
        } else {
          alert("Something went wrong");
        }
      })
      .catch((err) => {
        alert(err.message);
      });
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
                  color: "#000",
                  marginLeft: "5%",
                  marginVertical: 10 * 1.5,
                }}
              >
                User Verification
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  marginLeft: "5%",
                }}
              >
                Enter the OTP sent on your phone
              </Text>
            </View>

            <View
              style={{
                marginVertical: 10 * 2,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "space-evenly",
              }}
            >
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  style={styles.input}
                  maxLength={1}
                  keyboardType="numeric"
                  ref={(ref) => (inputs.current[index] = ref)}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={() => verify()}
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
                  "verify"
                )}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                marginBottom: 20,
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AntDesign name="arrowleft" size={16} color="gray" />
              <Text
                style={{
                  color: "gray",
                  fontSize: 14,
                  margin: 1,
                  textAlign: "center",
                }}
              >
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter your new password</Text>
            <TextInput
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={true}
              // placeholderTextColor={"#626262"}
              placeholder={"Password"}
              style={{
                borderBottomColor: "gray",
                borderBottomWidth: 0.5,
                height: 35,
                width: "100%",
                backgroundColor: "#fff",
                color: "black",
                marginTop: 40,
                paddingHorizontal: 15,
                marginBottom: 20,
              }}
            />
            <TextInput
              onChangeText={(text) => setConfirmationPassword(text)}
              secureTextEntry={true}
              // placeholderTextColor={"#626262"}
              placeholder={"Confirmation Password"}
              style={{
                borderBottomColor: "gray",
                borderBottomWidth: 0.5,
                height: 35,
                width: "100%",
                backgroundColor: "#fff",
                color: "black",
                marginTop: 40,
                paddingHorizontal: 15,
                marginBottom: 20,
              }}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "white" }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: "#2FAB4F" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  resetPassword();
                }}
              >
                <Text style={styles.modalButtonText}>
                  {loading2 ? (
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
    </KeyboardAvoidingView>
  );
};

export default Otp;

const styles = StyleSheet.create({
  input: {
    width: 50,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "gray",
    textAlign: "center",
    fontSize: 20,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4.65,

    elevation: 10,
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
