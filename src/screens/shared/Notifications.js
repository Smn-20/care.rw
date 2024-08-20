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
  Platform,
  Dimensions,
  LogBox,
  Modal,
  Button,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseURL } from "../../BaseUrl";
import { Feather, MaterialIcons, AntDesign } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;


const Notifications = ({ navigation, route }) => {
  const [notifications, setNotifications] = useState();
  const [refreshing, setRefreshing] = useState();

 
 

  const dateFormatted = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const redirectPage = (item) => {
    switch (item.type) {
        case 'chat':
          navigation.navigate("ChatRoom",{"hospital_id":item.hospital_id,"hospital_name":item.hospital_name})
            break;
        case 'medical_record':
            navigation.navigate("Hospitals", { page: "records" });
            break;
        case 'appointment':
        case 'approved_appointment':
        case 'declined_appointment':
        case 'canceled_appointment':
          navigation.navigate("Report");
          break;
        default:
            console.log('');
    }
  }



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
            redirectPage(item)
        }
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: "90%", justifyContent: "center" }}>
            <Text style={{ fontSize: 18, color: "black" }}>
              {item.type.replace('_',' ')} notification
            </Text>
            <Text style={{ fontSize: 14, color: "black" }}>
              Message: {item.message}
            </Text>
          </View>
          <View style={{ width: "10%", alignItems: "flex-end" }}>
            <MaterialIcons name="arrow-forward-ios" size={20} color="#178838" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getNofications = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const user = await  AsyncStorage.getItem("user");
    const userObj = JSON.parse(user)

    axios
      .get(
        `${baseURL}/api/notifications/${userObj.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setRefreshing(false);
        if (res.data.status) {
          setNotifications(res.data.data.slice(0,10));
        } else {
          setNotifications([]);
        }
      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  };
  useEffect(() => {
    getNofications();
    const focusHandler = navigation.addListener("focus", () => {
      getNofications();
    });
    return focusHandler;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#fff"
        barStyle="dark-content"
        translucent={false}
      />
      <View
        style={{
          flexDirection: "row",
          marginTop: 10,
          backgroundColor: "#fff",
          height: "10%",
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
              backgroundColor: "#fff",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather name="chevron-left" size={24} color="#000" />
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
          <Text style={{ fontWeight: "bold", color: "black" }}>My notifications</Text>
        </View>
      </View>

      
      

      <Text
        style={{
          fontSize: 18,
          color: "black",
          marginLeft: "5%",
          marginTop: 15,
          fontWeight: "bold",
        }}
      >
        Notifications
      </Text>
      {/* scrollview info */}
      {notifications ? (
        <View style={{ paddingBottom: windowHeight/5 }}>
          {notifications.length > 0 ? (
            <FlatList
              contentContainerStyle={{
                paddingBottom: 15,
              }}
              data={notifications}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => getNotifications()}
                />
              }
            />
          ) : (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: 100,
              }}
            >
              <Text>No notification...</Text>
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
    </View>
  );
};
export default Notifications;
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
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  button: {
    marginTop: 10,
  },
  menuIcon: {
    width: "25%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "8%",
  },
  titleContainer: {
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "8%",
  },
  title: {
    color: "white",
    fontSize: 18,
  },
  profileIcon: {
    width: "25%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: "8%",
  },
  scrollView: {
    height: (windowHeight * 7) / 8,
  },
  scheduleContainer: {
    backgroundColor: "white",
    width: "90%",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    color: "gray",
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
    paddingHorizontal: 8,
    backgroundColor: "#f1f4ff",
    borderRadius: 10,
    marginVertical: 10,
    width: "90%",
    height: 45,
  },
  input2: {
    fontSize: 14,
    paddingHorizontal: 8,
    backgroundColor: "#f1f4ff",
    borderRadius: 10,
    marginVertical: 10,
    width: "45%",
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
  removeButton: {
    backgroundColor: "#FF5252",
    padding: 10,
    borderRadius: 5,
  },
  addScheduleButton: {
    backgroundColor: "#6941C6",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  addScheduleButtonText: {
    color: "white",
  },
  submitButton: {
    backgroundColor: "#1e90ff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
  },
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
  confirmButton: {
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
  },
});
