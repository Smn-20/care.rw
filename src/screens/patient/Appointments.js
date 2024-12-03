import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Keyboard,
  Dimensions,
  TouchableWithoutFeedback,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome,
  FontAwesome5,
  Fontisto,
  Ionicons,
} from "@expo/vector-icons";
import { baseURL } from "../../BaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Dropdown from "../shared/Dropdown";
import BottomNavigator from "../../components/BottomNavigator";
import { connect } from "react-redux";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import * as Location from "expo-location";
import Medicines from "./Medicines";
import Pharmacies from "./Pharmacies";
import MyAppointments from "./MyAppointments";
import History from "./History";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;
const Appointments = ({ navigation, cart }) => {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [upcomingAppointment, setUpcomingAppointment] = useState();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [index, setIndex] = React.useState(0);
  const [sheetIndex, setSheetIndex] = React.useState(-1);
  const [appointmentId, setAppointmentId] = useState("");
  const [reason, setReason] = useState("");
  const [item, setItem] = useState();
  const [routes] = React.useState([
    { key: "myAppointments", title: "My Appointments" },
    { key: "history", title: "History" },
  ]);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1} // Backdrop disappears when the BottomSheet is closed
        opacity={0.5} // Customize the opacity
      />
    ),
    []
  );

  const MyAppointmentsRoute = () => (
    <MyAppointments
      index={index}
      navigation={navigation}
      onEvent={handleEvent}
    />
  );

  const HistoryRoute = () => <History index={index} navigation={navigation} />;

  const renderScene = SceneMap({
    myAppointments: MyAppointmentsRoute,
    history: HistoryRoute,
  });

  const bottomSheetRef = useRef(null);

  const handleEvent = (event) => {
    setSheetIndex(1);
    setItem(event);
    handleOpenBottomSheet();
  };

  const handleOpenBottomSheet = () => bottomSheetRef.current.expand();

  const handleSheetChanges = useCallback((index) => {
    setSheetIndex(index);
  }, []);

  const snapPoints = useMemo(() => ["99%"], []);

  const formatDate = (inputDate) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "Jan.",
      "Feb.",
      "Mar.",
      "Apr.",
      "May",
      "Jun.",
      "Jul.",
      "Aug.",
      "Sep.",
      "Oct.",
      "Nov.",
      "Dec.",
    ];

    const date = new Date(inputDate);
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName} ${day} ${month} ${year}`;
  };

  //   const [initialRoute, setInitialRoute] = useState('PatientHome');

  const getUser = async () => {
    const user_ = await AsyncStorage.getItem("user");
    const deviceToken = await AsyncStorage.getItem("deviceToken");
    const userObj = JSON.parse(user_);
    setUser(userObj);
    if (userObj.device_token !== deviceToken || !userObj.device_token) {
      // saveDeviceToken(userObj, deviceToken);
    }
  };

  const getUpcomingEvent = async (date, departmentId) => {
    const token = await AsyncStorage.getItem("token");
    const user_ = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user_);
    axios
      .get(`${baseURL}/api/appointments/upcoming?user_id=${userObj.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.status) {
          setUpcomingAppointment(res.data.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const closeDropdown = () => {
    setIsDropdownVisible(false);
  };

  const cancelAppointment = async () => {
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);
    setLoading(true);
    const postObj = JSON.stringify({
      appointment_id: appointmentId,
      reason: reason,
    });
    console.log(postObj);
    axios
      .post(`${baseURL}/api/appointments/cancel`, postObj, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLoading(false);
        setShowModal(false);
        if (res.data.status) {
          alert("Appointment cancelled");
          getUpcomingEvent();
          navigation.navigate("Appointments");
        } else {
          alert("Something went wrong!");
        }
      })
      .catch((error) => {
        setLoading(false);
        setShowModal(false);
        alert(error.message);
      });
  };

  useEffect(() => {
    getUser();
    getUpcomingEvent();
    const focusHandler = navigation.addListener("focus", () => {
      getUser();
      getUpcomingEvent();
    });
    return focusHandler;
  }, [navigation]);

  return (
    <View styles={styles.container}>
      <StatusBar
        backgroundColor="#fff"
        barStyle="dark-content"
        translucent={false}
      />
      <View
        style={{
          width: windowWidth,
          backgroundColor: "#fff",
          height: windowHeight / 8,
          flexDirection: "row",
        }}
      >
        <View
          underlayColor="transparent"
          style={{
            width: windowWidth - 45,
            // width: windowWidth - 135,
            alignItems: "flex-start",
            justifyContent: "center",
            marginTop: "8%",
            paddingLeft: 25,
          }}
        >
          <Image
            source={require("../../images/logo.png")}
            style={{ width: 100 }}
            resizeMode="contain"
          />
        </View>
        <View
          style={{
            width: 40,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            marginTop: "8%",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Notifications");
            }}
          >
            <Fontisto name="bell" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          height: (windowHeight * 7) / 8,
          backgroundColor: "#fff",
        }}
      >
        <View style={styles.card}>
          {upcomingAppointment ? (
            <View style={styles.row}>
              {/* Profile Image */}
              <View
                style={{
                  width: "30%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={{
                    uri: "https://via.placeholder.com/100", // Replace with the image URL or local asset
                  }}
                  style={styles.profileImage}
                />
              </View>
              <View style={styles.textContainer}>
                {/* Appointment Date */}
                <Text style={styles.date}>
                  {formatDate(upcomingAppointment?.date)}
                </Text>
                {/* Doctor Name */}
                <Text style={styles.doctorName}>
                  Dr. {upcomingAppointment?.doctor_name}
                </Text>
                <View style={styles.actions}>
                  {/* Confirm Button */}
                  <View style={styles.confirmButton}>
                    <Text style={styles.buttonText}>
                      {upcomingAppointment?.time?.slice(0, 5)}
                    </Text>
                  </View>
                  {/* Cancel Button */}
                  <TouchableOpacity
                    onPress={() => {
                      setAppointmentId(upcomingAppointment.appointment_id);
                      setShowModal(true);
                    }}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View>
              <Text style={{ color: "white" }}>No upcoming appointment!</Text>
            </View>
          )}
        </View>

        <View
          style={{
            backgroundColor: "white",
            height: windowHeight - (windowHeight * 13) / 40,
          }}
        >
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            renderTabBar={(props) => {
              return (
                <TabBar
                  {...props}
                  renderLabel={({ focused, route }) => {
                    return (
                      <Text
                        style={{
                          color: "black",
                          fontSize: 14,
                          fontWeight: "600",
                        }}
                      >
                        {route.title}
                      </Text>
                    );
                  }}
                  indicatorStyle={styles.indicatorStyle}
                  style={styles.tabBar}
                />
              );
            }}
          />
        </View>
      </View>
      <View
        style={{
          top: (windowHeight * 2) / 3,
          height: windowHeight / 3,
          width: windowWidth,
          position: "absolute",
        }}
      >
        <BottomSheet
          ref={bottomSheetRef}
          key="uniqueKey"
          snapPoints={snapPoints}
          index={-1}
          enablePanDownToClose={true}
          onChange={handleSheetChanges}
          style={styles.shadow}
          // backdropComponent={renderBackdrop}
        >
          <BottomSheetView>
            <View>
              <View style={styles.row2}>
                {/* Profile Image */}
                <View
                  style={{
                    width: "25%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={{
                      uri: "https://via.placeholder.com/100", // Replace with the image URL or local asset
                    }}
                    style={styles.profileImage2}
                  />
                </View>
                <View style={styles.textContainer2}>
                  <Text style={[styles.doctorName2, { fontSize: 12 }]}>
                    Dr. {item?.doctor_name}
                  </Text>
                  <Text style={styles.doctorName2}>{item?.branch_name}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="calendar" size={16} color="#2FAB4F" />
                    <Text style={styles.date2}>{formatDate(item?.date)}</Text>
                  </View>
                </View>
              </View>
              <View style={{width:"100%"}}>
                <TouchableOpacity onPress={()=>{
                  bottomSheetRef.current.close();
                  setAppointmentId(item?.appointment_id);
                  setShowModal(true);
                }} style={{ marginTop:20, alignSelf:'center',padding:10}}>
                  <Text style={{fontSize:18}}>Cancel Appointment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </View>
      {sheetIndex===-1 &&(
      <BottomNavigator navigation={navigation} userRole={user?.user_type} />
      )}
      <Dropdown
        navigation={navigation}
        isVisible={isDropdownVisible}
        onClose={closeDropdown}
        names={
          user?.first_name
            ? user?.first_name + " " + user?.last_name
            : user?.names
        }
        phone={user?.phone}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay}>
            <KeyboardAvoidingView
              style={styles.keyboardAvoidingContainer}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <View style={styles.modalContainer}>
                {/* Header with Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>

                {/* Title */}
                <Text style={styles.title}>
                  Why are you cancelling this appointment?
                </Text>

                {/* Text Input */}
                <TextInput
                  style={styles.input}
                  placeholder="Type your reason here..."
                  placeholderTextColor="#ccc"
                  value={reason}
                  onChangeText={(text) => setReason(text)}
                  multiline={true}
                />

                {/* Cancel Button */}
                <TouchableOpacity
                  style={styles.cancelButton2}
                  onPress={() => {
                    cancelAppointment();
                  }}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancel Appointment
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const mapStateToProps = (state) => {
  return {
    cart: state.cart.cart,
  };
};

export default connect(mapStateToProps, null)(Appointments);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'white'
  },
  tabBar: {
    width: windowWidth * 0.9,
    alignSelf: "center",
    backgroundColor: "#fff",
  },
  indicatorStyle: {
    backgroundColor: "#178838",
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  card: {
    backgroundColor: "#1C2237",
    height: 120,
    paddingHorizontal: 10,
    borderRadius: 16,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: windowWidth / 4.5,
    height: windowWidth / 4.5,
    borderRadius: windowWidth / 20,
  },
  textContainer: {
    flexDirection: "column",
    width: "70%",
  },
  date: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  doctorName: {
    color: "#A5ADC6",
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  confirmButton: {
    backgroundColor: "#3AB54A",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderColor: "#A5ADC6",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelText: {
    color: "#A5ADC6",
    fontSize: 14,
    fontWeight: "600",
  },

  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: windowWidth * 0.9,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  closeButtonText: {
    fontSize: 24,
    color: "#000",
    fontWeight: "bold",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    textAlignVertical: "top",
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
  },
  cancelButton2: {
    width: "100%",
    padding: 15,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
  row2: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderBottomColor: "#EAF1FB",
    paddingBottom: 30,
    borderBottomWidth: 1,
  },
  profileImage2: {
    width: windowWidth / 6,
    height: windowWidth / 6,
    borderRadius: windowWidth / 20,
  },
  textContainer2: {
    flexDirection: "column",
    width: "65%",
  },
  doctorName2: {
    color: "#56667C",
    fontSize: 16,
    fontWeight: "600",
  },
  date2: {
    color: "#2FAB4F",
    marginBottom: 5,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
    marginLeft: 6,
  },
});
