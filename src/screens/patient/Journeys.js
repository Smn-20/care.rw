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
import { Feather, FontAwesome, AntDesign } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

const options = [
  { label: "OLD MUTUAL", value: "OLD MUTUAL" },
  { label: "BRITAM", value: "BRITAM" },
  { label: "RAMA", value: "RAMA" },
  { label: "PMI", value: "PMI" },
];
const Journeys = ({ navigation, route }) => {
  const [date, setDate] = useState(new Date());
  const [selected, setSelected] = useState(false);
  const [show, setShow] = useState(false);
  const [cases, setCases] = useState();
  const [cases_, setCases_] = useState([]);
  const [refreshing, setRefreshing] = useState();

  const handleConfirm = () => {
    setShow(false);
    setSelected(true);
    filterCasesByDate(date);
  };

  const reset = () => {
    setCases(cases_);
    setSelected(false)
  }

  const filterCasesByDate = (date_) => {
    const filteredCases = cases_.filter( case_ => case_.createdOn.includes(dateFormatted(date_)))
    setCases(filteredCases)
  }

  const dateFormatted = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const showDatepicker = () => {
    if (Platform.OS === "android") {
      setShow(true);
    } else {
      setShow(true);
      console.log("Selected date:", dateFormatted(date));
    }
    setSelected(false);
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={()=>navigation.navigate("Visits",{id:item.id,code:item.code})}
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
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View
            style={{
              width: "60%",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Facility: {item?.currentDataLocation?.name}
            </Text>
          </View>
          <View
            style={{
              width: "40%",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Case: {item.code}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 15,
          }}
        >
          <View
            style={{
              width: "60%",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              Date: {item.createdOn.slice(0, -3)}
            </Text>
          </View>
          <View
            style={{
              width: "40%",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 14, color: "black", paddingRight: 8 }}>
                Status:
              </Text>
              {item.currentStatus == "INITIATED" ? (
                <View
                  style={{
                    width: "50%",
                    height: 15,
                    borderRadius: 8,
                    backgroundColor: "#FCCA88",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#f48c06",
                      fontWeight: "bold",
                      fontSize: 10,
                    }}
                  >
                    Initiated
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    width: "40%",
                    height: 15,
                    borderRadius: 8,
                    backgroundColor: "#D9ECD9",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#2B962B",
                      fontWeight: "bold",
                      fontSize: 10,
                    }}
                  >
                    Closed
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getCases = async () => {
    setRefreshing(true);
    const token = await  AsyncStorage.getItem("token");

    axios
      .get(
        `${baseURL}/api/patient_case/membership_code/${route.params.insurance_code}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setRefreshing(false);
        if (res.data.success) {
          setCases(res.data.data);
          setCases_(res.data.data);
        } else {
          setCases([]);
        }
      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  };
  useEffect(() => {
    getCases();
    const focusHandler = navigation.addListener("focus", () => {
      getCases();
    });
    return focusHandler;
  }, [navigation]);

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
          marginBottom: 20,
          backgroundColor: "#178838",
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
          <Text style={{ fontWeight: "bold", color: "white" }}>My Cases</Text>
        </View>
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
                mode={"date"}
                is24Hour={true}
                display="spinner"
                onChange={(e,selectedDate) => setDate(selectedDate)}
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
          mode={"date"}
          is24Hour={true}
          display="spinner"
          onChange={(e,selectedDate) => {setShow(false);setDate(selectedDate);setSelected(true);filterCasesByDate(selectedDate)}}
        />
      )}

      <View style={{flexDirection:'row'}}>
        <View style={{justifyContent:'center',borderWidth:1,borderColor:'black',padding:10,borderRadius:10,marginLeft:20}}>
      {date&&selected ? (
        <Text>
          {date && dateFormatted(date)}
        </Text>
      ) : (
        <Text>YYYY-MM-DD</Text>
      )}
      </View>
      <TouchableOpacity
        style={{ marginHorizontal: 20,backgroundColor:'#219ebc',padding:10,justifyContent:'center',borderRadius:10 }}
        onPress={() => {
          showDatepicker();
        }}
      >
        <Text style={{color:'white'}}>Sort by Date</Text>
        
      </TouchableOpacity>

      <TouchableOpacity
        style={{backgroundColor:'#778da9',padding:10,justifyContent:'center',borderRadius:10 }}
        onPress={() => {
          reset();
        }}
      >
        <Text style={{color:'white'}}>Reset</Text>
        
      </TouchableOpacity>
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
        Cases
      </Text>
      {/* scrollview info */}
      {cases ? (
        <View style={{ paddingBottom: windowHeight/5 }}>
          {cases.length > 0 ? (
            <FlatList
              contentContainerStyle={{
                paddingBottom: 15,
              }}
              data={cases}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => getCases()}
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
              <Text>No case...</Text>
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
export default Journeys;
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
