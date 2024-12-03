import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
  Button,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Entypo, FontAwesome, Feather, Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseURL } from "../../BaseUrl";
import { Dropdown } from "react-native-element-dropdown";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

const AddSchedule = ({ navigation }) => {
  const getWeedDay = (date_) => {
    var weekDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    var day = weekDays[date_.getDay()];
    return day;
  };

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`
  }

  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(false);
  const [selected2, setSelected2] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState();
  const [show, setShow] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  const [mode, setMode] = useState("date");
  const [schedules, setSchedules] = useState([]);

  const modifyArray = (objectsArray) => {
    // Iterate through each object in the array
    const modifiedArray = objectsArray.map((obj) => {
      // Rename keys and remove 'day' and 'id' properties
      const { id, reminder, ...rest } = obj;

      // Create a new object with modified keys and added 'doctor_id' property
      return {
        reminder: reminder,
        ...rest,
      };
    });

    return modifiedArray;
  };

  const initializeSchedules = (n) => {
    var newSchedules =[]
    for(var i=0;i<n;i++){
      const newSchedule = {
        id: i+1,
        reminder: ""
      };
      newSchedules.push(newSchedule)
    }
    setSchedules(newSchedules)
    
  };

  const removeSchedule = (idToRemove) => {
    const updatedSchedules = schedules.filter(
      (schedule) => schedule.id !== idToRemove
    );
    setSchedules(updatedSchedules);
  };

  const validateTime = (time) => {
    // Validate if the time is between 08:00 and 17:00
    const [hours, minutes] = time.split(":").map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  };

  const handleSubmit = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const doctorObj = JSON.parse(user);

    const schedules_ = modifyArray(schedules);

    if (areTimesValid(schedules_)) {
      const postObj = JSON.stringify({
        doctor_id: doctorObj.id,
        schedules: schedules_,
      });

      axios
        .post(`${baseURL}/api/doctor-schedule`, postObj, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
        .then((res) => {
          setLoading(false);
          if (res.data.status) {
            alert("Schedule added successfully!");
            navigation.navigate("Schedules");
          } else {
            console.log("Something went wrong!");
          }
        })
        .catch((error) => {
          setLoading(false);
          alert(error.message);
        });
    } else {
      setLoading(false);
      alert(
        "Make sure the start time and end time of each schedule are in this format HH:MM (08:45)"
      );
    }
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === "ios");
    setDate(currentDate);
    // setSelected(true);
    const updatedSchedules = [...schedules];
    const scheduleIndex = updatedSchedules.findIndex(
      (s) => s.id === selectedSchedule.id
    );

    var day = getWeedDay(currentDate);

    updatedSchedules[scheduleIndex].date = currentDate;
    updatedSchedules[scheduleIndex].day = day;
    setSchedules(updatedSchedules);
  };

  const onChangeStartTime = (event, selectedDate) => {
    const currentDate = formatTime(selectedDate) || formatTime(startTime);
    setShowStartTime(false);
    setStartTime(selectedDate);
    setSelected(true);
    const updatedSchedules = [...schedules];
    const scheduleIndex = updatedSchedules.findIndex(
      (s) => s.id === selectedSchedule.id
    );
    updatedSchedules[scheduleIndex].startTime = currentDate;
    setSchedules(updatedSchedules);
  };

  const onChangeEndTime = (event, selectedDate) => {
  const currentDate = formatTime(selectedDate) || formatTime(endTime);
  setShowEndTime(false);
  setEndTime(selectedDate);
  setSelected2(true);
  const updatedSchedules = [...schedules];
  const scheduleIndex = updatedSchedules.findIndex(
    (s) => s.id === selectedSchedule.id
  );
  updatedSchedules[scheduleIndex].endTime = currentDate;
  setSchedules(updatedSchedules);
};

  const areTimesValid = (data) => {
    // Loop through the array of objects and check if all endTime and startTime are valid
    for (const item of data) {
      if (!validateTime(item.start_time) || !validateTime(item.end_time)) {
        return false; // Return false if any time is not valid
      }
    }
    return true; // All times are valid
  };


  const handleConfirm = () => {
    setShow(false);
    setSelected(true);
    console.log("Selected date:", dateFormatted(date));
  };

  const dateFormatted = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(()=>{
    initializeSchedules(3)
  },[])

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="height" enabled>
      
   

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ height: (windowHeight * 7) / 8 ,backgroundColor:'white'}}
      >
     

        {Platform.OS === "ios" && (
          <Modal
            visible={showStartTime}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowStartTime(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={startTime}
                  mode={"time"}
                  is24Hour={true}
                  display="spinner"
                  onChange={onChangeStartTime}
                />
                <TouchableOpacity
                  onPress={handleConfirm}
                  style={{ alignItems: "center", marginTop: 10 }}
                >
                  <Text style={styles.buttonText}>Pick time</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {Platform.OS === "android" && showStartTime && (
          <DateTimePicker
            testID="dateTimePicker"
            value={startTime}
            mode={"time"}
            is24Hour={true}
            display="spinner"
            onChange={onChangeStartTime}
          />
        )}


        {schedules.map((schedule, index) => (
          <View key={schedule.id} style={styles.scheduleContainer}>
  

            <View style={{ flexDirection: "row",width:"90%",alignSelf:'center' }}>
                <Text style={{marginLeft:10}}>Reminder {index+1}</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
            <View style={[styles.dateContainer, styles.input2,{marginRight:5}]}>
              <TouchableOpacity
              onPress={()=>{
                setSelectedSchedule(schedule), setShowStartTime(true);
              }}
                style={[
                  styles.action,
                  {
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                    flexDirection: "row",
                  },
                ]}
              >
                <>
                  {startTime && selected ? (
                    <Text style={styles.selectedDateText}>
                      {schedule.startTime}
                    </Text>
                  ) : (
                    <Text style={styles.datePickerButtonText}></Text>
                  )}
                  <View>
                    <Ionicons name="timer-outline" size={24} color="black" />
                  </View>
                </>
              </TouchableOpacity>
            </View>
            </View>
          </View>
        ))}

       
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddSchedule;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shadow: {
    shadowColor: "#707070",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.65,
    elevation: 8,
  },
  header: {
    width: windowWidth,
    backgroundColor: "#178838",
    height: windowHeight / 8,
    flexDirection: "row",
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
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
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
