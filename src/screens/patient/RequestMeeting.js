import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Platform,
  Modal,
  Image,
  FlatList,
  RefreshControl,
} from "react-native";
import { AuthContext } from "../../context/context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseURL } from "../../BaseUrl";
import { Feather, Ionicons } from "@expo/vector-icons";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;
const RequestMeeting = ({ navigation,route }) => {
  const context = useContext(AuthContext);
  const [focused, setFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [doctors_, setDoctors_] = useState();
  const [doctors, setDoctors] = useState();
  const [activePanel, setActivePanel] = useState("all");
  const [requests_, setRequests_] = useState();
  const [requests, setRequests] = useState();
  const [phone, setPhone] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [doctor, setDoctor] = useState();
  const [doctorQualification, setDoctorQualification] = useState();
  const [requestId, setRequestId] = useState();
  const [showModal, setShowModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const pay = async () => {
    setLoading2(true);
    const user = await AsyncStorage.getItem("user");
    const token = await AsyncStorage.getItem("token");
    const postObj = JSON.stringify({
      amount:
        doctorQualification?.toLowerCase().includes("general") &&
        doctorQualification?.toLowerCase().includes("practitioner")
          ? "50"
          : "100",
      request_id: requestId,
      phone_number: phone,
    });
    console.log(postObj)
    axios
      .post(`${baseURL}/api/video-consultation-payment`, postObj, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLoading2(false);
        if (res.data.status) {
          setShowModal(false);
          setPhone("");
          alert("Payment request sent successfully! Dial *182*7*1#");
        } else {
          setShowModal(false);
          setPhone("");
          alert("Something went wrong!");
        }
      })
      .catch((error) => {
        setLoading2(false);
        alert(error.message);
      });
  };

  const markAsRead = async () => {

    const token = await AsyncStorage.getItem("token");
    const ids = route.params.newVideos.map(el => el.id)
    const postObj = JSON.stringify({
      "notification_id": ids
    })
    axios.post(`${baseURL}/api/updateNotificationStatus`,postObj, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`} }).then((res) => {
        if(res.data.status){
        }
    }).catch((error) => {
        console.log(error)
    })
}

  const search = (value) => {
    const filteredData = (activePanel === "all" ? doctors_ : requests_).filter(
      (doctor) => {
        let doctorToLowercase = (
          doctor.fullname + doctor.qualification
        ).toLowerCase();
        let searchToTermLowercase = value.toLowerCase();
        return doctorToLowercase.indexOf(searchToTermLowercase) > -1;
      }
    );
    if (activePanel === "all") {
      if (filteredData) {
        setDoctors(filteredData);
      }
    }
    if (activePanel === "mine") {
      if (filteredData) {
        setRequests(filteredData);
      }
    }
  };

  const getMyRequests = async () => {
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const patientObj = JSON.parse(user);
    axios
      .get(`${baseURL}/api/video-call-requests/patient/${patientObj.id}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.status) {
          setRequests(res.data.message);
          setRequests_(res.data.message);
        } else {
          setRequests([]);
          setRequests_([]);
        }
      })
      .catch((error) => {
        setRequests([]);
        setRequests_([]);
        console.log(error);
      });
  };

  const renderItem2 = ({ item }) => {
    return (
      <View
        style={{
          alignItems: "center",
          marginTop: 20,
          backgroundColor: "white",
          width: windowWidth / 2.3,
          height: 230,
          borderRadius: 20,
          padding: 10,
          ...styles.shadow,
        }}
      >
        <View style={{ width: "50%", alignItems: "center" }}>
          {item.is_online === "1" && (
            <View
              style={{
                backgroundColor: "green",
                paddingVertical: 2,
                paddingHorizontal: 8,
                borderRadius: 5,
              }}
            >
              <Text style={{ color: "white", fontSize: 12 }}>Online</Text>
            </View>
          )}
          <Image
            source={
              item.profile_image_url
                ? { uri: `${baseURL}/${item.profile_image_url}` }
                : require("../../images/user1.png")
            }
            resizeMode="contain"
            style={{
              backgroundColor: "white",
              marginTop: 5,
              width: "100%", // Adjust the width as per your design
              height: 50, // Adjust the height as per your design
              borderRadius: 50, // Set the borderRadius to half of width/height to create a circle
              overflow: "hidden", // Clip the image to the rounded shape
            }}
          />
        </View>
        <Text style={{ textAlign: "center", marginTop: 10, height: 35 }}>
          {item.fullname}
        </Text>
        <Text style={{ textAlign: "center", fontWeight: "bold" }}>
          {item.qualification}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setDoctor(item);
            setShowConfirmationModal(true);
          }}
          style={{
            backgroundColor: "#178838",
            height: 30,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 6,
            marginTop: 20,
            width: "70%",
          }}
        >
          <Text
            style={{
              marginHorizontal: 10,
              fontSize: 12,
              fontWeight: "800",
              color: "#FFF",
            }}
          >
            Request
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          alignItems: "center",
          marginTop: 20,
          backgroundColor: "white",
          width: windowWidth / 2.3,
          height: 200,
          borderRadius: 20,
          padding: 10,
          ...styles.shadow,
        }}
      >
        <View style={{ width: "50%", alignItems: "center" }}>
          <Image
            source={
              item.profile_image_url
                ? { uri: `${baseURL}/${item.profile_image_url}` }
                : require("../../images/user1.png")
            }
            resizeMode="contain"
            style={{
              backgroundColor: "white",
              marginTop: 5,
              width: "100%", // Adjust the width as per your design
              height: 50, // Adjust the height as per your design
              borderRadius: 50, // Set the borderRadius to half of width/height to create a circle
              overflow: "hidden", // Clip the image to the rounded shape
            }}
          />
        </View>
        <Text style={{ textAlign: "center", marginTop: 10, height: 35 }}>
          {item.fullname}
        </Text>
        <Text style={{ textAlign: "center", fontWeight: "bold" }}>
          {item.qualification}
        </Text>
        {item.status === "accepted"  ? (

          item.payment_status === "Successfull" ? (
            <View
            style={{
              height: 30,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              marginTop: 20,
              width: "70%",
            }}
          >
            <Text
              style={{
                marginHorizontal: 10,
                fontSize: 12,
                fontWeight: "800",
                textAlign: "center",
                color: "green",
              }}
            >
              Paid
            </Text>
          </View>
          ):(
            <TouchableOpacity
            onPress={() => {
              setDoctorQualification(item.qualification);
              setRequestId(item.request_id);
              setShowModal(!showModal);
            }}
            style={{
              backgroundColor: item.status === "accepted"?"#38a169":"orange",
              height: 30,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              marginTop: 20,
              width: "70%",
            }}
          >
            <Text
              style={{
                marginHorizontal: 10,
                fontSize: 12,
                fontWeight: "800",
                color: "#FFF",
              }}
            >
              {item.payment_status === "Failed"?"Retry":"Pay"}
            </Text>
          </TouchableOpacity>
          )
          
        ) : (
          <View
            style={{
              height: 30,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              marginTop: 20,
              width: "70%",
            }}
          >
            <Text
              style={{
                marginHorizontal: 10,
                fontSize: 12,
                fontWeight: "800",
                textAlign: "center",
                color: item.status === "pending" ? "orange" :"red",
              }}
            >
              {item.status === "declined"
                ? "Sorry,I'm not available"
                : (item.status)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const getRequests = async () => {
    const token = await AsyncStorage.getItem("token");
    axios
      .get(`${baseURL}/api/getDoctors`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.status) {
          setDoctors(res.data.doctors);
          setDoctors_(res.data.doctors);
          getMyRequests();
        } else {
          setDoctors([]);
          setDoctors_([]);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getRequests();
    markAsRead();
  }, []);

  const requestMeeting = async () => {
    setLoading(true);
    const user = await AsyncStorage.getItem("user");
    const patientId = JSON.parse(user).id;
    const token = await AsyncStorage.getItem("token");
    const postObj = JSON.stringify({
      patient_id: patientId,
      status: "pending",
      doctor_id: doctor.id,
    });

    axios
      .post(`${baseURL}/api/video-call-requests`, postObj, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLoading(false);
        if (res.data.status) {
          setShowConfirmationModal(false);
          alert("Meeting requested successfully!");
          getRequests();
        } else {
          alert("Something went wrong!");
        }
      })
      .catch((error) => {
        setLoading(false);
        alert(error.message);
      });
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
            width: "60%",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Text style={{ fontWeight: "bold", color: "white" }}>
            Request Meeting
          </Text>
        </View>
        <View
          style={{
            width: "20%",
            justifyContent: "center",
            alignItems: "center",
          }}
        ></View>
      </View>

      {doctors && requests ? (
        <>
          <View
            style={{
              flexDirection: "row",
              alignSelf: "center",
              marginBottom: 20,
              ...styles.shadow,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                search(searchValue), setActivePanel("all");
              }}
              style={{
                width: 200,
                height: 30,
                backgroundColor: activePanel === "all" ? "#626262" : "#fff",
                alignItems: "center",
                justifyContent: "center",
                zIndex: activePanel === "all" ? 1 : 0,
              }}
            >
              <Text
                style={{
                  color: activePanel === "all" ? "#fff" : "gray",
                  fontSize: 14,
                  fontWeight: activePanel === "all" ? "bold" : "normal",
                }}
              >
                Make new request
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                search(searchValue), setActivePanel("mine");
              }}
              style={{
                width: 200,
                height: 30,
                backgroundColor: activePanel === "mine" ? "#626262" : "#fff",
                alignItems: "center",
                justifyContent: "center",
                zIndex: activePanel === "mine" ? 1 : 0,
              }}
            >
              <Text
                style={{
                  color: activePanel === "mine" ? "#fff" : "gray",
                  fontSize: 14,
                }}
              >
                My requests
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchBox}>
            <View style={{ justifyContent: "center", marginHorizontal: 10 }}>
              <Ionicons name="search" size={24} color="#101319" />
            </View>
            <TextInput
              placeholder="Search doctors"
              keyboardType="default"
              placeholderTextColor="#666666"
              onChangeText={(value) => {
                search(value);
                setSearchValue(value);
              }}
              style={[
                styles.textInput,
                {
                  color: "black",
                  justifyContent: "center",
                },
              ]}
              autoCapitalize="none"
            />
          </View>

          {/* scrollview info */}
          <View>
            <View style={{height:windowHeight-(windowHeight*0.12+90),}}>
              {doctors.length > 0
                ? activePanel === "all" && (
                    <FlatList
                      contentContainerStyle={{
                        paddingBottom: 15,
                      }}
                      data={doctors}
                      showsVerticalScrollIndicator={false}
                      renderItem={renderItem2}
                      keyExtractor={(item, index) => index.toString()}
                      refreshControl={
                        <RefreshControl
                          refreshing={refreshing}
                          onRefresh={() => getRequests()}
                        />
                      }
                      numColumns={2} // Specify 2 columns
                      columnWrapperStyle={{
                        justifyContent: "space-between", // Add space between columns
                        marginHorizontal: 10, // Add horizontal margin to the items
                      }}
                    />
                  )
                : activePanel === "all" && (
                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 100,
                      }}
                    >
                      <Text>No Doctor...</Text>
                    </View>
                  )}

              {requests.length > 0
                ? activePanel === "mine" && (
                    <FlatList
                      contentContainerStyle={{
                        paddingBottom: 15,
                      }}
                      data={requests}
                      showsVerticalScrollIndicator={false}
                      renderItem={renderItem}
                      keyExtractor={(item, index) => index.toString()}
                      refreshControl={
                        <RefreshControl
                          refreshing={refreshing}
                          onRefresh={() => getRequests()}
                        />
                      }
                      numColumns={2} // Specify 2 columns
                      columnWrapperStyle={{
                        justifyContent: "space-between", // Add space between columns
                        marginHorizontal: 10, // Add horizontal margin to the items
                      }}
                    />
                  )
                : activePanel === "mine" && (
                    <View
                      style={{
                        heigth: windowHeight,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 100,
                      }}
                    >
                      <Text>No Request...</Text>
                    </View>
                  )}
            </View>
            <View style={{ marginBottom: 100 }}></View>
          </View>
        </>
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
        visible={showConfirmationModal}
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Meeting</Text>
            <Text style={styles.modalText}>
              Do you want to request a video meeting with Dr. {doctor?.fullname}
              ?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmationModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  requestMeeting();
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
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter momo number</Text>
            <TextInput
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={12}
              onChangeText={(text) => setPhone(text)}
              keyboardType="phone-pad"
              // placeholderTextColor={"#626262"}
              placeholder={"Phone number"}
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
                  pay();
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
    </View>
  );
};
export default RequestMeeting;
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
    marginTop: Platform.OS === "ios" ? 0 : -12,
    paddingLeft: 10,
    color: "#05375a",
  },
  searchBox: {
    flexDirection: "row",
    height: 40,
    width: "89%",
    borderWidth: 1,
    borderColor: "#101319",
    paddingBottom: 5,
    borderRadius: 8,
    alignSelf: "center",
    justifyContent: "center",
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
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: "80%",
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
});
