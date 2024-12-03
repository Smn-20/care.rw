import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
  ActivityIndicator,
  View,
  ImageBackground,
  Button,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState } from "react";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";
import { baseURL } from "../../../BaseUrl";
const windowHeight = Dimensions.get("screen").height;



const Signup = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activePanel, setActivePanel] = useState("Patient");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkVWObMMKbE8PAO7zijgyhztzKM82lmucEIA&usqp=CAU"
  );
  const [password, setPassword] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [gender, setGender] = useState("");
  const [date, setDate] = useState(new Date());
  const [selected, setSelected] = useState(false);
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState("date");
  const dateFormatted = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === "ios");
    setDate(currentDate);
    setSelected(true);
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
      setImage(result.assets[0].uri);
    }
  };

  const showDatepicker = () => {
    if (Platform.OS === "android") {
      setShow(true);
    } else {
      setMode("date");
      setShow(true);
    }
    setSelected(false);
  };

  const handleConfirm = () => {
    setShow(false);
    setSelected(true);
    // console.log('Selected date:', dateFormatted(date));
  };

  const handleSubmit = () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password.length > 5 ||
      (!selected && activePanel === "Patient")
    ) {
      alert(
        "Fill the form and make sure that the password is atleast 6 characters!"
      );
    } else {
      setLoading(true);
      const postObj = new FormData();

      postObj.append("first_name", firstName);
      postObj.append("last_name", lastName);
      postObj.append("email", email);
      postObj.append("phone", phone);
      postObj.append("password", password);
      postObj.append("gender", gender);
      postObj.append("user_type", "patient");
      if (
        image &&
        image !==
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkVWObMMKbE8PAO7zijgyhztzKM82lmucEIA&usqp=CAU"
      ) {
        postObj.append("profile_image", {
          type: "image/jpg",
          uri: image,
          name: "my_image.jpg",
        });
      }

      axios
        .post(`${baseURL}/api/signup`, postObj, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => {
          if (res.data.status == true) {
            alert("Successfully registered... Verify your phone number");
            navigation.navigate("Otp",{user_id:res.data.data.id});
          } else {
            alert("Something went wrong!");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  return (
    <KeyboardAvoidingView behavior="height" enabled>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          backgroundColor: "white",
          height:windowHeight,
          paddingTop:75,
        }}
       
      >

        <View
          style={{
            backgroundColor: "white",
            width: "100%",
            alignSelf: "center",
            marginBottom:75
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 22,
                color: "#000",
                marginLeft:"5%",
                marginVertical: 10 * 1.5,
              }}
            >
            Create Account
            </Text>
          </View>

          <View
            style={{
              marginVertical: 10,
              alignItems: "center",
            }}
          >
            <Text style={{marginLeft:'8%',alignSelf:'flex-start'}}>First Name</Text>
            <TextInput
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholderTextColor={"#626262"}
              placeholder="First name"
              onChangeText={(text) => setFirstName(text)}
              style={[
                {
                  fontSize: 14,
                  paddingLeft: 20,
                  backgroundColor: "#fff",
                  borderRadius: 5,
                  marginVertical: 5,
                  width: "90%",
                  height: 45,
                  ...styles.shadow,
                },
              ]}
            />
            <Text style={{marginLeft:'8%', marginTop:15,alignSelf:'flex-start'}}>Last Name</Text>
            <TextInput
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholderTextColor={"#626262"}
              placeholder="Last name"
              onChangeText={(text) => setLastName(text)}
              style={[
                {
                  fontSize: 14,
                  paddingLeft: 20,
                  backgroundColor: "#fff",
                  borderRadius: 5,
                  marginVertical: 5,
                  width: "90%",
                  height: 45,
                  ...styles.shadow,
                },
              ]}
            />
            <Text style={{marginLeft:'8%', marginTop:15,alignSelf:'flex-start'}}>Email</Text>
            <TextInput
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholderTextColor={"#626262"}
              onChangeText={(text) => setEmail(text)}
              placeholder="Email"
              style={[
                {
                  fontSize: 14,
                  paddingLeft: 20,
                  backgroundColor: "#fff",
                  borderRadius: 5,
                  marginVertical: 5,
                  width: "90%",
                  height: 45,
                  ...styles.shadow,
                },
              ]}
            />
            <Text style={{marginLeft:'8%', marginTop:15,alignSelf:'flex-start'}}>Phone Number</Text>
            <TextInput
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              keyboardType="phone-pad"
              placeholderTextColor={"#626262"}
              onChangeText={(text) => setPhone(text)}
              placeholder="Phone number"
              style={[
                {
                  fontSize: 14,
                  paddingLeft: 20,
                  backgroundColor: "#fff",
                  borderRadius: 5,
                  marginVertical: 5,
                  width: "90%",
                  height: 45,
                  ...styles.shadow,
                },
              ]}
            />
            <Text style={{marginLeft:'8%', marginTop:15,alignSelf:'flex-start'}}>Password</Text>
            <TextInput
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Password"
              placeholderTextColor={"#626262"}
              onChangeText={(text) => setPassword(text)}
              style={[
                {
                  fontSize: 14,
                  paddingLeft: 20,
                  backgroundColor: "#fff",
                  borderRadius: 5,
                  marginVertical: 5,
                  width: "90%",
                  height: 45,
                  ...styles.shadow,
                },
              ]}
              secureTextEntry
            />
            <Text style={{marginLeft:'8%', marginTop:15,alignSelf:'flex-start'}}>Gender</Text>
            <Dropdown
              style={[styles.dropdown, styles.shadow]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
                { label: "Others", value: "Others" },
              ]}
              search
              maxHeight={300}
              onChange={(text) => {
                setGender(text.value);
              }}
              value={gender}
              labelField="label"
              valueField="value"
              placeholder="Select Gender"
              searchPlaceholder="Search..."
            />
            <Text style={{marginLeft:'8%', marginTop:15,alignSelf:'flex-start'}}>Date of Birth</Text>
            <View style={[styles.dateContainer, styles.input, styles.shadow]}>
              <TouchableOpacity
                style={[
                  styles.action,
                  {
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexDirection: "row",
                  },
                ]}
              >
                <>
                  {selected ? (
                    <Text style={styles.selectedDateText}>
                      {dateFormatted(date)}
                    </Text>
                  ) : (
                    <Text style={styles.datePickerButtonText}>
                      Select Date Of Birth
                    </Text>
                  )}
                  <TouchableOpacity onPress={() => showDatepicker()}>
                    <FontAwesome name="calendar" size={24} color="#178838" />
                  </TouchableOpacity>
                </>
              </TouchableOpacity>
            </View>

            {activePanel === "Doctor" && (
              <>
                <Button
                  title="Select Profile Image"
                  onPress={pickProfileImage}
                />
                <TouchableOpacity activeOpacity={1}>
                  <View
                    style={{
                      height: 170,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ImageBackground
                      source={{
                        uri: image,
                      }}
                      style={{ height: 150, width: 150 }}
                      imageStyle={{ borderRadius: 15 }}
                    >
                      <View
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      ></View>
                    </ImageBackground>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
          {/* <TouchableOpacity>
              <Text
                style={{
                  color: '#178838',
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                Forgort Posword ?
              </Text>
            </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => handleSubmit()}
            style={{
              backgroundColor: "#178838",
              marginTop: 15,
              marginBottom: 10 * 3,
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
                textAlign: "center",
              }}
            >
              {loading ? (
                <ActivityIndicator size={"small"} color="white" />
              ) : (
                "Sign Up"
              )}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={{
              marginBottom: 20,
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: "gray",
                fontSize: 14,
                margin: 1,
                textAlign: "center",
              }}
            >
              Already have an account? <Text style={{color:"#178838"}}>Login</Text> 
            </Text>
          </TouchableOpacity>
        </View>

        {Platform.OS === "ios" && (
          <Modal
            visible={show}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShow(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode={mode}
                  is24Hour={true}
                  display="spinner"
                  onChange={onChange}
                />
                <TouchableOpacity
                  onPress={handleConfirm}
                  style={{ alignItems: "center", marginTop: 10 }}
                >
                  <Text style={styles.buttonText}>pickdate</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {Platform.OS === "android" && show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode={mode}
            is24Hour={true}
            display="spinner"
            onChange={onChange}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#626262",
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    width: "100%",
    marginBottom: 10,
  },
  datePickerButtonText: {
    color: "#626262",
  },
  selectedDatePickerButton: {
    borderColor: "#6941C6",
  },
  selectedDateText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#626262",
  },
  input: {
    fontSize: 14,
    paddingLeft: 20,
    paddingRight: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginVertical: 9,
    width: "90%",
    height: 45,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeInput: {
    fontSize: 14,
    padding: 8,
    backgroundColor: "#f1f4ff",
    borderRadius: 10,
    marginVertical: 10,
    width: "45%",
    height: 45,
  },
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
  buttonText: {
    color: "white",
  },
  dropdown: {
    height: 45,
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 8,
    marginBottom: 5,
    marginTop: 5,
    width: "90%",
    marginHorizontal: 20,
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
});
