import {
  Dimensions,
  StatusBar,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Modal,
  TextInput,
  ActivityIndicator
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { AntDesign, Entypo, Feather } from "@expo/vector-icons";
import { AuthContext } from "../../context/context";
import axios from 'axios';
import { baseURL } from "../../BaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const context = useContext(AuthContext);

  const getProfile = async () => {
    const user = await AsyncStorage.getItem("user");
    console.log(user)
    setProfile(JSON.parse(user));
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
    if(!currentPassword || !newPassword || !confirmPassword){
      alert("Fill the form!")
    }else{
      if(newPassword!==confirmPassword){
        alert("New password doesn't match the confirmation password!")
      }else{
        setLoading(true)
        const token = await AsyncStorage.getItem('token')
        const user = await AsyncStorage.getItem('user')
        const user_id = JSON.parse(user).id
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
          "Authorization": `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLoading(false);
        setShowModal(false);
        alert("Password changed successfully!");
        context.signOut()
       
      })
      .catch((error) => {
        setLoading(false);
        setShowModal(false)
        alert(error.message);
      });

      }
    }
  }

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem('token')
    setLoading(true);
      const postObj = new FormData();

      postObj.append("fullname", profile.fullname);
      postObj.append("email", profile.email);
      postObj.append("phone", profile.phone);
      postObj.append("date_of_birth", profile.date_of_birth);
      postObj.append("other_info", profile.other_info);
      postObj.append("registration_number", profile.registration_number);
      postObj.append("type", profile.type);
      postObj.append("qualification", profile.qualification);
      if(imageUrl){
        postObj.append("profile_image", {
          type: "image/jpg",
          uri: imageUrl,
          name: "my_image.jpg",
        });
      }

      
      axios
        .post(`${baseURL}/api/update-user/${profile?.id}`, postObj,{headers:{"Content-Type": "multipart/form-data","Authorization": `Bearer ${token}`}})
        .then(async(res) => {
          setLoading(false)
          if (res.data.success == true) {
            setProfile(res.data.data)
            await AsyncStorage.setItem('user',JSON.stringify(res.data.data))
            alert("Successfully Updated");
            setShowProfileModal(false)
          } else {
            alert("Something went wrong!");
          }
        })
        .catch((err) => {
          setLoading(false)
          console.log(err.message);
        });
  }


  const handleLogout = async () => {
    context.signOut()
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
  }


  useEffect(() => {
    getProfile();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#178838" barStyle="light-content" />
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#EAE8E0",
          height: height / 10,
          width: "100%",
          paddingTop:10
        }}
      >
        <TouchableOpacity
          onPress={()=>navigation.goBack()}
          style={{
            width: "25%",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <AntDesign name="arrowleft" size={18}/>
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
          <View style={{ alignItems: "center", justifyContent: "center",marginTop:10 }}>
            <Image
              source={profile?.profile_image_url?{uri:`${baseURL}/${profile?.profile_image_url}?${new Date()}`}:require("../../images/user1.png")}
              resizeMode="contain"
              style={{
                backgroundColor: "white",
                width: 100, // Adjust the width as per your design
                height: 100, // Adjust the height as per your design
                borderRadius: 50, // Set the borderRadius to half of width/height to create a circle
                overflow: "hidden", // Clip the image to the rounded shape
              }}
            />
            {profile?.type==="Doctor" && (
            <TouchableOpacity onPress={()=>setShowProfileModal(true)}>
             <Text style={{color:'blue'}}>Edit profile</Text>
            </TouchableOpacity>
            )}
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
              { profile?.first_name? profile?.first_name+" "+profile?.last_name:profile?.names}
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
              <Entypo
                name="key"
                size={18}
                color="#000"
              />
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
                marginBottom:30,
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
                <Text style={styles.modalTitle}>
                  Change your password
                </Text>
                <TextInput
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onChangeText={(text) => setCurrentPassword(text)}
                  placeholderTextColor={"#626262"}
                  placeholder={"Current password"}
                  style={[
                    {
                      fontSize: 14,
                      padding: 8,
                      backgroundColor: "#f1f4ff",
                      borderRadius: 10,
                      marginTop: 15,
                      width: "100%",
                      height: 45,
                    }
                  ]}
                />

                <TextInput
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onChangeText={(text) => setNewPassword(text)}
                  placeholderTextColor={"#626262"}
                  placeholder={"New password"}
                  style={[
                    {
                      fontSize: 14,
                      padding: 8,
                      backgroundColor: "#f1f4ff",
                      borderRadius: 10,
                      marginTop: 15,
                      width: "100%",
                      height: 45,
                    }
                  ]}
                />

                <TextInput
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onChangeText={(text) => setConfirmPassword(text)}
                  placeholderTextColor={"#626262"}
                  placeholder={"Confirm password"}
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
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowModal(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={() => {
                      changePassword()
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
            visible={showProfileModal}
            onRequestClose={() => setShowProfileModal(false)}
          >
            <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Image
              source={imageUrl?{uri:imageUrl}:profile?.profile_image_url?{uri:`${baseURL}/${profile?.profile_image_url}?${new Date()}`}:require("../../images/user1.png")}
              resizeMode="contain"
              style={{
                backgroundColor: "white",
                width: 100, // Adjust the width as per your design
                height: 100, // Adjust the height as per your design
                borderRadius: 50, // Set the borderRadius to half of width/height to create a circle
                overflow: "hidden", // Clip the image to the rounded shape
              }}
            />
            <TouchableOpacity style={{width:"50%",alignItems:"center",padding:10,borderRadius:10,backgroundColor:'#626262',marginBottom:20}} onPress={()=>pickProfileImage()}>
             <Text style={{color:'white'}}>Select Picture</Text>
            </TouchableOpacity>
          </View>
            <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowProfileModal(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={() => {
                      handleSubmit()
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
    width: "80%",
  },
  modalTitle: {
    textAlign:'center',
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
    backgroundColor: "#178838",
  },
  confirmButton: {
    backgroundColor: "#38a169",
  },
});
