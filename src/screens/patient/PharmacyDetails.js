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
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ImageBackground,
  Keyboard,
  Alert,
  TouchableWithoutFeedback,
  Modal,
  Linking,
  TextInput,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import * as ImagePicker from "expo-image-picker";
import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome,
  Ionicons,
} from "@expo/vector-icons";
import { baseURL } from "../../BaseUrl";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera } from "expo-camera";
import { RadioButton } from "react-native-paper";

const windowHeight = Dimensions.get("screen").height;
const windowWidth = Dimensions.get("screen").width;

const PharmacyDetails = ({ navigation, route }) => {
  const [insuranceCompanies, setInsuranceCompanies] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [medicines_, setMedicines_] = useState([]);
  const [insuranceCode, setInsuranceCode] = useState("");
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [image, setImage] = useState();

  const imageSource = !route.params.image 
    ? require("../../images/pharmacy.jpeg") // localImage should be a string representing the path, e.g., "../../images/pharmacy.jpeg"
    : { uri: route.params.image };

  const dialCall = () => {
  let phoneNumberFormatted = `tel:${route.params.phone}`;
  Linking.openURL(phoneNumberFormatted).catch(err => {
    console.error('Error:', err);
    Alert.alert('Error', 'Unable to dial the phone number.');
  });
  };

  const openWhatsApp = () => {
    const url = `whatsapp://send?phone=+${route.params.phone}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert("WhatsApp is not installed on your device.");
        }
      })
      .catch((err) => console.error("Error occurred while trying to open WhatsApp:", err));
  };

  const openMaps = () => {
    Linking.canOpenURL(route.params.link)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(route.params.link);
        } else {
          Alert.alert('Error', 'Unable to open the link.');
        }
      })
      .catch((err) => console.error('Error:', err));
  };

  const getMedicines = async () => {
    const token = await AsyncStorage.getItem("token");
    axios
      .get(`${baseURL}/api/pharmacy-branches/medications/${route.params.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setMedicines(res.data.data);
        setMedicines_(res.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getInsurances = async () => {
    const token = await AsyncStorage.getItem("token");
    axios
      .get(`${baseURL}/api/insurances`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const insurances = res.data.data.map((el) => {
          return {
            label: el.insurance_name,
            value: el.id,
          };
        });
        setInsuranceCompanies(insurances);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const uploadPrescription = async () => {
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);
    setLoading(true);
    const postObj = new FormData();

    postObj.append("branch_id", route.params.id);
    postObj.append("user_id", userObj.id);
    postObj.append("insurance_id", insuranceCompany);
    postObj.append("insurance_card", insuranceCode);

    if (image) {
      postObj.append("prescription_file", {
        type: "image/jpg",
        uri: image,
        name: "my_image.jpg",
      });
    }
    console.log(route.params.id)
    console.log(userObj.id)
    console.log(insuranceCompany)
    console.log(insuranceCode)
    axios
      .post(`${baseURL}/api/prescription/upload`, postObj, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      .then(async (res) => {
        setLoading(false);
        setIsVisible(false);
        if (res.data.status == true) {
          alert("Successfully uploaded");
        } else {
          alert("Something went wrong!");
        }
      })
      .catch((err) => {
        setLoading(false);
        alert("Something went wrong!");
        setIsVisible(false);
        console.log(err.message);
      });
  };

  const takePaymentPicture = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status == "granted") {
      const res = await ImagePicker.launchCameraAsync({
        quality: 0.2,
        // allowsEditing: true,
      });
      setImage(res.assets[0].uri);
    } else {
      Alert.alert("Access Denied!");
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      // allowsEditing: true,
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const search = (value) => {
    const filteredData = medicines_.filter((el) => {
      let elementToLowercase = el.name.toLowerCase();
      let searchToTermLowercase = value.toLowerCase();
      return elementToLowercase.indexOf(searchToTermLowercase) > -1;
    });

    setMedicines(filteredData);
  };

  useEffect(() => {
    getMedicines();
    getInsurances();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent={false} />
      <View
        style={{
          height: Platform.OS === "ios" ? 100 : 50,
          borderBottomWidth: 0.2,
          borderBottomColor: "gray",
          backgroundColor: "#F1F5F9",
          paddingTop: Platform.OS === "ios" ? 60 : 15,
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
          />
          <TouchableOpacity
            onPress={() => console.log("")}
            style={{
              width: "20%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Entypo name="dots-three-vertical" size={18} />
          </TouchableOpacity>
        </View>
      </View>

      
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 5,
              backgroundColor:'white'
            }}
          >
            <Image
              source={imageSource}
              resizeMode="cover"
              style={{
                backgroundColor: "white",
                width: 100,
                height: 100,
                borderRadius: 50,
                overflow: "hidden",
              }}
            />
            <View>
              <Text
                style={{
                  marginTop: 10,
                  marginBottom: 8,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {route.params.name}
              </Text>
            </View>
          </View>
          <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={10}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20,backgroundColor: 'white' }}>
          <Text style={{ marginTop: 10, textAlign: "center" }}>
            {route.params.phone}
          </Text>
          <Text style={{ marginTop: 10, textAlign: "center" }}>
            8am - 9pm{" "}
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              marginTop: 20,
            }}
          >
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => openMaps()}
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: windowWidth / 7,
                  width: windowWidth / 7,
                  backgroundColor: "#F3FDEC",
                  borderRadius: windowWidth / 14,
                }}
              >
                <View style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: windowWidth / 8,
                  width: windowWidth / 8,
                  backgroundColor: "#E2FAD1",
                  borderRadius: windowWidth / 16,
                }}>
                  <Ionicons name="location-outline" size={24} />
                </View>
              </TouchableOpacity>
              <Text style={{ marginTop: 10 }}>Direction</Text>
            </View>

            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => setIsVisible(true)}
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: windowWidth / 7,
                  width: windowWidth / 7,
                  backgroundColor: "#F3FDEC",
                  borderRadius: windowWidth / 14,
                }}
              >
                <View style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: windowWidth / 8,
                  width: windowWidth / 8,
                  backgroundColor: "#E2FAD1",
                  borderRadius: windowWidth / 16,
                }}>
                  <Feather name="upload-cloud" size={24} />
                </View>
              </TouchableOpacity>
              <Text style={{ marginTop: 10 }}>Upload Prescription</Text>
            </View>

            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => openWhatsApp()}
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: windowWidth / 7,
                  width: windowWidth / 7,
                  backgroundColor: "#F3FDEC",
                  borderRadius: windowWidth / 14
                }}
              >
                <View style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: windowWidth / 8,
                  width: windowWidth / 8,
                  backgroundColor: "#E2FAD1",
                  borderRadius: windowWidth / 16,
                }}>
                  <FontAwesome name="whatsapp" size={24} />
                </View>
              </TouchableOpacity>
              <Text style={{ marginTop: 10 }}>WhatsApp</Text>
            </View>
          </View>

          <View style={styles.searchBox}>
            <View style={{ justifyContent: "center", marginHorizontal: 10 }}>
              <Ionicons name="search" size={24} color="gray" />
            </View>
            <TextInput
              placeholder="Search Medicines"
              keyboardType="default"
              placeholderTextColor="#666666"
              onChangeText={(value) => {
                search(value);
              }}
              style={[
                styles.textInput,
                {
                  color: "black",
                },
              ]}
              autoCapitalize="none"
            />
          </View>

          <View
            style={{
              backgroundColor: "#F5F6F5",
              borderRadius: 20,
              width:'95%',
              alignSelf:'center',
              marginVertical: 10,
              paddingBottom: 20,
            }}
          >
            {route.params.status !== "closed" &&
              medicines.map((el) => {
                return (
                  <View
                    key={el.id}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-around",
                      marginTop: windowWidth / 30,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate("MedicineDetails", {
                          id: route.params.id,
                          branch: route.params.name,
                          dosage: el.dosage,
                          form: el.form,
                          medication_id: el.id,
                          medication_name: el.name,
                          unitPrice: el.unit_price,
                        });
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#fff",
                        width: "90%",
                        paddingHorizontal: 10,
                        height: windowHeight / 15,
                        borderRadius: 20,
                      }}
                    >
                      <View style={{ width: "100%" }}>
                        <Text
                          style={{
                            color: "#000",
                            fontWeight: "500",
                            marginLeft: 20,
                          }}
                        >
                          {el.name}
                        </Text>
                        <Text
                          style={{
                            color: "gray",
                            marginLeft: 20,
                          }}
                        >
                          {el.unit_price} Rwf
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            {route.params.status === "closed" && (
              <Text style={{ textAlign: "center", marginTop: 50 }}>
                Pharmacy closed
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
            visible={isVisible}
            transparent={true}
            animationType={"slide"}
            hasBackdrop={true}
            backdropColor={"#000"}
            backdropOpacity={0.9}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <View>
                  <View>
                    <View
                      style={{
                        width: windowWidth-20,
                        backgroundColor: "#fff",
                        alignSelf: "center",
                        borderRadius: 20,
                      }}
                    >
                      <KeyboardAvoidingView behavior="position">
                      <TouchableOpacity
                        onPress={()=>setIsVisible(false)}
                        style={{
                          backgroundColor: "white",
                          width: "100%",
                          borderTopRightRadius: 20,
                          borderTopLeftRadius: 20,
                          marginLeft: 0,
                          height: 60,
                          justifyContent: "flex-start",
                          alignItems: "center",
                        }}
                      >
                        <View  style={{width:60,height:5,borderRadius:2.5,backgroundColor:'black',marginTop:10}}></View>
                      </TouchableOpacity>
                      <Text
                        style={{
                          color: "#000",
                          fontSize: 16,
                          fontWeight: "500",
                          marginTop: 10,
                          marginLeft:'5%'
                        }}
                      >
                        Select Insurance Company
                      </Text>
                      <View>
                        <Dropdown
                          style={styles.dropdown}
                          placeholderStyle={styles.placeholderStyle}
                          selectedTextStyle={styles.selectedTextStyle}
                          inputSearchStyle={styles.inputSearchStyle}
                          itemTextStyle={{ color: "#A5AAB6" }}
                          iconStyle={styles.iconStyle}
                          data={insuranceCompanies}
                          search
                          maxHeight={300}
                          onChange={(text) => {
                            setInsuranceCompany(text.value);
                          }}
                          value={insuranceCompanies}
                          labelField="label"
                          valueField="value"
                          placeholder="Select your insurance company"
                          searchPlaceholder="Search..."
                        />
                      </View>

                      <Text
                        style={{
                          color: "#000",
                          fontSize: 16,
                          fontWeight: "500",
                          marginTop: 10,
                          marginLeft:'5%'
                        }}
                      >
                        Enter Insurance Code
                      </Text>
                      <View>
                        <TextInput
                          style={styles.dropdown}
                          placeholderTextColor={"#000"}
                          keyboardType="numeric"
                          onChangeText={(text) => {
                            setInsuranceCode(text);
                          }}
                          value={insuranceCode}
                          placeholder="Enter insurance code"
                        />
                      </View>
                      </KeyboardAvoidingView>

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-evenly",
                          marginTop: 20,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            pickImage();
                          }}
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            height: 40,
                            width: "40%",
                            backgroundColor: "#EBF0DC",
                            borderRadius: 20,
                          }}
                        >
                          <Text style={{ color: "#4C6707", fontWeight: "500" }}>
                            From Galery
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => takePaymentPicture()}
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            height: 40,
                            width: "40%",
                            backgroundColor: "#2FAB4F",
                            borderRadius: 20,
                          }}
                        >
                          <Text style={{ fontWeight: "500", color:'white' }}>
                            Take Picture
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity activeOpacity={1}>
                        <View
                          style={{
                            height: windowHeight / 2.5,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {image ? (
                            <ImageBackground
                              source={{
                                uri: image,
                              }}
                              resizeMode='stretch'
                              style={{
                                height: windowWidth / 1.5,
                                width: windowWidth / 1.5,
                                borderColor: "grey",
                                borderWidth: 0.3,
                                borderRadius: 15,
                              }}
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
                          ) : (
                            <View
                              style={{
                                justifyContent: "center",
                                alignItems: "center",
                                height: windowWidth / 1.5,
                                width: windowWidth / 1.5,
                                borderColor: "grey",
                                borderWidth: 0.3,
                                borderRadius: 15,
                              }}
                            >
                              <TouchableOpacity
                                onPress={() => setIsVisible(true)}
                                style={{
                                  justifyContent: "center",
                                  alignItems: "center",
                                  height: windowWidth / 7,
                                  width: windowWidth / 7,
                                  backgroundColor: "#F3FDEC",
                                  borderRadius: windowWidth / 14,
                                }}
                              >
                                <View style={{
                                  justifyContent: "center",
                                  alignItems: "center",
                                  height: windowWidth / 8,
                                  width: windowWidth / 8,
                                  backgroundColor: "#E2FAD1",
                                  borderRadius: windowWidth / 16,
                                }}>
                                  <Feather color="#419803" name="camera" size={24} />
                                </View>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>

                      <View
                        style={{
                          flexDirection: "row",
                          marginTop: 20,
                          width: "100%",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "#fff",
                          borderBottomRightRadius: 20,
                          borderBottomLeftRadius: 20,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => uploadPrescription()}
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            alignSelf: "center",
                            height: 40,
                            width: "90%",
                            marginBottom:20,
                            backgroundColor: "#2FAB4F",
                            borderRadius: 20,
                          }}
                        >
                          <Text style={{ fontWeight: "500",color: 'white' }}>
                            Send prescription
                          </Text>
                        </TouchableOpacity>
                       
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
    </View>

  );
};

export default PharmacyDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'white'
  },
  searchBox: {
    flexDirection: "row",
    backgroundColor: "#E2FAD1",
    height: 40,
    marginTop: 10,
    width: "90%",
    borderRadius: 20,
    alignSelf: "center",
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
    marginTop: Platform.OS === "ios" ? 0 : -12,
    paddingLeft: 10,
    color: "#05375a",
  },
  dropdown: {
    height: 50,
    borderRadius: 8,
    borderColor: "gray",
    borderWidth: 0.3,
    alignSelf: "center",
    paddingHorizontal: 8,
    marginBottom: 10,
    marginTop: 10,
    width: "90%",
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
    color: "#000",
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#A5AAB6",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    color: "black",
    fontSize: 16,
  },
});
