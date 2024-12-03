import {
  Dimensions,
  StatusBar,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useContext, useRef } from "react";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/context";
import axios from "axios";
import { baseURL } from "../../BaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import BottomNavigator from "../../components/BottomNavigator";
// import ModalComponent from "./Modal";

const { height } = Dimensions.get("window");
const { width } = Dimensions.get("window");

const Profile = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [profile, setProfile] = useState();
  const [imageUrl, setImageUrl] = useState();
  const [currentPassword, setCurrentPassword] = useState();
  const [newPassword, setNewPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [showModal, setShowModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const context = useContext(AuthContext);

  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [email, setEmail] = useState();
  const [phone, setPhone] = useState();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);

  const getProfile = async () => {
    const user = await AsyncStorage.getItem("user");
    const user_ = JSON.parse(user);
    setFirstName(user_.first_name);
    setLastName(user_.last_name);
    setEmail(user_.email);
    setPhone(user_.phone);
    setProfile(user_);
  };

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

  const verify = () => {
    if (otp.join("").length > 5) {
      setLoading(true);
      confirmPhone(otp.join(""));
    } else {
      alert("enter a valid otp");
    }
  };

  const confirmPhone = (otp_) => {
    const postObj = JSON.stringify({
      user_id: profile?.id,
      otp: otp_,
      new_phone: phone,
    });
    axios
      .post(`${baseURL}/api/confirm-phone`, postObj, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        if (res.data.status === true) {
          alert("Phone successfully updated!");
          setShowOtpModal(false);
          handleLogout();
        } else {
          alert("Something went wrong");
        }
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const pickProfileImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Fill the form!");
    } else {
      if (newPassword !== confirmPassword) {
        alert("New password doesn't match the confirmation password!");
      } else {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");
        const user = await AsyncStorage.getItem("user");
        const user_id = JSON.parse(user).id;
        const postObj = JSON.stringify({
          user_id: user_id,
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        });
        axios
          .post(`${baseURL}/api/change-password`, postObj, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            setLoading(false);
            setShowModal(false);
            alert("Password changed successfully!");
            context.signOut();
          })
          .catch((error) => {
            setLoading(false);
            setShowModal(false);
            alert(error.message);
          });
      }
    }
  };

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem("token");
    setLoading(true);
    const postObj = new FormData();
    if (profile.user_type === "patient") {
      postObj.append("first_name", firstName || profile.first_name);
      postObj.append("last_name", lastName || profile.last_name);
      postObj.append("phone", phone || profile.phone);
    }

    postObj.append("email", email || profile.email);
    postObj.append("gender", profile.gender);
    if (imageUrl) {
      postObj.append("profile_image", {
        type: "image/jpg",
        uri: imageUrl,
        name: "my_image.jpg",
      });
    }
    axios
      .post(profile.user_type==='patient'?`${baseURL}/api/user/${profile?.id}`:`${baseURL}/api/doctor/${profile?.id}`, postObj, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      .then(async (res) => {
        setLoading(false);
        if (res.data.status) {
          console.log(res.data.data)
          setProfile(res.data.data);
          await AsyncStorage.setItem("user", JSON.stringify(res.data.data));
          setShowProfileModal(false);
          if (phone !== profile.phone) {
            setShowOtpModal(true);
          } else {
            alert("Successfully Updated");
          }
        } else {
          console.log(res.data);
          alert("Something went wrong!");
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log('yuyuyu')
        console.log(err.message);
      });
  };



  const handleLogout = async () => {
    context.signOut();
    // const token = await AsyncStorage.getItem('token')
    // setLoading(true);
    // const postObj = JSON.stringify({
    //   fullname: profile.fullname,
    //   email: profile.email,
    //   phone: profile.phone,
    //   date_of_birth: profile.date_of_birth,
    //   other_info: profile.other_info,
    //   is_online: "0",
    //   registration_number: profile.registration_number,
    //   type: profile.type,
    //   qualification: profile.qualification
    // });

    // axios
    //   .post(`${baseURL}/api/update-user/${profile?.id}`, postObj,{headers:{"Content-Type": "application/json","Authorization": `Bearer ${token}`}})
    //   .then((res) => {
    //     setLoading(false)
    //     console.log(res.data);
    //     if (res.data.success == true) {
    //       context.signOut()
    //     }
    //   })
    //   .catch((err) => {
    //     setLoading(false)
    //     console.log(err);
    //   });
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#178838" barStyle="dark-content" />
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#F8FAFC",
          height: height / 10,
          width: "100%",
          paddingTop: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: "25%",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <AntDesign name="arrowleft" size={18} />
        </TouchableOpacity>
        <View
          style={{
            width: "50%",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Text style={{ fontWeight: "bold", color: "black" }}>Settings</Text>
        </View>
        <View
          style={{
            width: "25%",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
        ></View>
      </View>
      <ScrollView
        contentContainerStyle={{ width: width }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: "80%", alignSelf: "center" }}>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginTop: 10,
            }}
          >
            <Image
              source={
                profile?.profile_image
                  ? {
                      uri: `${
                        profile?.profile_image
                      }?${new Date()}`,
                    }
                  : require("../../images/user1.png")
              }
              resizeMode="contain"
              style={{
                backgroundColor: "white",
                width: 100, // Adjust the width as per your design
                height: 100, // Adjust the height as per your design
                borderRadius: 50, // Set the borderRadius to half of width/height to create a circle
                overflow: "hidden", // Clip the image to the rounded shape
              }}
            />
            <TouchableOpacity onPress={() => setShowProfileModal(true)}>
              <Text style={{ color: "#669bbc" }}>Edit profile</Text>
            </TouchableOpacity>
          </View>

          {/* <ModalComponent /> */}

          <View
            style={{
              paddingHorizontal: 10 * 4,
              paddingTop: 10 * 1,
            }}
          ></View>

          <View
            style={{
              paddingTop: 10 * 1,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: "#000",
                textAlign: "left",
              }}
            >
              Names:
            </Text>
          </View>

          <View
            style={{
              alignSelf: "center",
              padding: 10 * 1.5,
              backgroundColor: "#fff",
              borderRadius: 10,
              marginVertical: 10,
              width: "100%",
              ...styles.shadow,
            }}
          >
            <Text
              style={{
                color: "#000",
                fontSize: 14,
              }}
            >
              {profile?.first_name
                ? profile?.first_name + " " + profile?.last_name
                : profile?.names}
            </Text>
          </View>

          <View
            style={{
              paddingTop: 10 * 1,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: "#000",
                textAlign: "left",
              }}
            >
              Email:
            </Text>
          </View>

          <View
            style={{
              alignSelf: "center",
              padding: 10 * 1.5,
              backgroundColor: "#fff",
              borderRadius: 10,
              marginVertical: 10,
              width: "100%",
              ...styles.shadow,
            }}
          >
            <Text
              style={{
                color: "#000",
                fontSize: 14,
              }}
            >
              {profile?.email}
            </Text>
          </View>

          <View
            style={{
              paddingTop: 10 * 1,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: "#000",
                textAlign: "left",
              }}
            >
              Phone number:
            </Text>
          </View>

          <View
            style={{
              alignSelf: "center",
              padding: 10 * 1.5,
              backgroundColor: "#fff",
              borderRadius: 10,
              marginVertical: 10,
              width: "100%",
              ...styles.shadow,
            }}
          >
            <Text
              style={{
                color: "#000",
                fontSize: 14,
              }}
            >
              {profile?.phone}
            </Text>
          </View>

          {profile?.type?.toLowerCase() === "doctor" && (
            <>
              <View
                style={{
                  paddingTop: 10 * 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: "#000",
                    textAlign: "left",
                  }}
                >
                  Qualification:
                </Text>
              </View>
              <View
                style={{
                  alignSelf: "center",
                  padding: 10 * 1.5,
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  marginVertical: 10,
                  width: "100%",
                  ...styles.shadow,
                }}
              >
                <Text
                  style={{
                    color: "#000",
                    fontSize: 14,
                  }}
                >
                  {profile?.qualification}
                </Text>
              </View>
            </>
          )}

          <TouchableOpacity
            onPress={() => {
              setShowModal(true);
            }}
            style={{
              flexDirection: "row",
              backgroundColor: "#fff",
              padding: 10,
              alignSelf: "center",
              borderRadius: 10,
              marginTop: 20,
              width: "100%",
              ...styles.shadow,
            }}
          >
            <View
              style={{
                width: "90%",
                justifyContent: "center",
                padding: 5,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "black",
                  fontWeight: "bold",
                }}
              >
                Change Password
              </Text>
            </View>
            <View
              style={{
                width: "10%",
                justifyContent: "center",
                padding: 5,
              }}
            >
              <Entypo name="key" size={18} color="#000" />
            </View>
          </TouchableOpacity>

          <View
            style={{
              paddingHorizontal: 10 * 2,
              paddingTop: 10 * 6,
              flexDirection: "row",
              justifyContent: "space-evenly",
            }}
          >
            <TouchableOpacity
              onPress={() => handleLogout()}
              style={{
                marginBottom: 30,
                backgroundColor: "#178838",
                paddingVertical: 10,
                paddingHorizontal: 10,
                width: "60%",
                borderRadius: 10,
                ...styles.shadow,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                {loading ? (
                  <ActivityIndicator size={"small"} color="white" />
                ) : (
                  "Logout"
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Change your password</Text>
              <TextInput
                onChangeText={(text) => setCurrentPassword(text)}
                placeholderTextColor={"#626262"}
                placeholder={"Current password"}
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

              <TextInput
                onChangeText={(text) => setNewPassword(text)}
                placeholderTextColor={"#626262"}
                placeholder={"New password"}
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

              <TextInput
                onChangeText={(text) => setConfirmPassword(text)}
                placeholderTextColor={"#626262"}
                placeholder={"Confirm password"}
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
                  focused && {
                    borderWidth: 2,
                    borderColor: "#626262",
                    shadowOffset: { width: 4, height: 10 },
                    shadowColor: "#626262",
                    shadowOpacity: 0.2,
                    shadowRadius: 10,
                  },
                ]}
              />
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton,{backgroundColor:'white',color:'#2FAB4F'}]}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={[styles.modalButtonText,{color:'#2FAB4F'}]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={() => {
                    changePassword();
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

        <Modal
          animationType="slide"
          transparent={true}
          visible={showOtpModal}
          onRequestClose={() => setShowOtpModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { width: "90%" }]}>
              <View
                style={{
                  backgroundColor: "white",
                  width: "100%",
                  alignSelf: "center",
                }}
              >
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 25,
                        color: "#000",
                        marginLeft: "5%",
                      }}
                    >
                      User Verification
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowOtpModal(false)}
                      style={{
                        width: 30,
                        height: 30,
                        marginBottom: 10,
                        borderRadius: 15,
                        alignSelf: "flex-end",
                        backgroundColor: "white",
                        justifyContent: "center",
                        alignItems: "center",
                        ...styles.shadow,
                      }}
                    >
                      <Ionicons name="close" size={20} />
                    </TouchableOpacity>
                  </View>

                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: "5%",
                      marginTop: 15,
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
                      style={styles.input2}
                      maxLength={1}
                      keyboardType="numeric"
                      ref={(ref) => (inputs.current[index] = ref)}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => verify()}
                  style={{
                    backgroundColor: "#2FAB4F",
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
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={showProfileModal}
          onRequestClose={() => setShowProfileModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <KeyboardAvoidingView
                style={{}}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 150 : 0} // Adjust offset as needed
              >
                <ScrollView
                  style={{ height: "85%" }}
                  showsVerticalScrollIndicator={false}
                >
                  <View
                    style={{ alignItems: "center", justifyContent: "center" }}
                  >
                    <Image
                      source={
                        imageUrl
                          ? { uri: imageUrl }
                          : profile?.profile_image
                          ? {
                              uri: `${
                                profile?.profile_image
                              }?${new Date()}`,
                            }
                          : require("../../images/user1.png")
                      }
                      resizeMode="contain"
                      style={{
                        backgroundColor: "white",
                        width: 100,
                        height: 100,
                        borderRadius: 50,
                        overflow: "hidden",
                      }}
                    />
                    <TouchableOpacity onPress={() => pickProfileImage()}>
                      <Text style={{ color: "#669bbc" }}>Select Picture</Text>
                    </TouchableOpacity>
                  </View>
                  {profile?.user_type === "patient" && (
                    <>
                      <Text style={{ marginTop: 15, alignSelf: "flex-start" }}>
                        First Name
                      </Text>
                      <TextInput
                        placeholderTextColor={"#626262"}
                        placeholder="First name"
                        value={firstName}
                        onChangeText={(text) => setFirstName(text)}
                        style={styles.input}
                      />
                      <Text style={{ marginTop: 15, alignSelf: "flex-start" }}>
                        Last Name
                      </Text>
                      <TextInput
                        placeholderTextColor={"#626262"}
                        placeholder="Last name"
                        value={lastName}
                        onChangeText={(text) => setLastName(text)}
                        style={styles.input}
                      />
                    </>
                  )}

                  <Text style={{ marginTop: 15, alignSelf: "flex-start" }}>
                    Email
                  </Text>
                  <TextInput
                    placeholderTextColor={"#626262"}
                    onChangeText={(text) => setEmail(text)}
                    placeholder="Email"
                    value={email}
                    style={styles.input}
                  />
                  <Text style={{ marginTop: 15, alignSelf: "flex-start" }}>
                    Phone Number
                  </Text>
                  <TextInput
                    keyboardType="phone-pad"
                    placeholderTextColor={"#626262"}
                    onChangeText={(text) => setPhone(text)}
                    value={phone}
                    placeholder="Phone number"
                    style={styles.input}
                  />
                </ScrollView>
              </KeyboardAvoidingView>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton,{backgroundColor:'white'}]}
                  onPress={() => setShowProfileModal(false)}
                >
                  <Text style={[styles.modalButtonText,{color:'#2FAB4F'}]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={() => {
                    handleSubmit();
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
      </ScrollView>
      <BottomNavigator navigation={navigation} userRole={profile?.user_type} />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    fontSize: 14,
    paddingLeft: 20,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginVertical: 5,
    width: "99%",
    height: 45,
    borderWidth: 0.2,
    borderColor: "gray",
  },
  input2: {
    width: width / 8,
    height: width / 8,
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
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
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
    marginTop: 20,
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
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    maxHeight: "75%",
    width: "80%",
  },
  modalTitle: {
    textAlign: "center",
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
    backgroundColor: "#a4161a",
  },
  confirmButton: {
    backgroundColor: "#2FAB4F",
  },
});
