import React, { useState,useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseURL } from "../../BaseUrl";

const windowHeight = Dimensions.get("screen").height;

const AddMedicine = ({ navigation,route }) => {
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [forms, setForms] = useState([
    {
      id: Math.random().toString(36).substr(2, 9),
      medicine: "",
      duration: "",
      nOfTimes: 0,
      quantity: "",
      instructions: "",
      selected: false,
      startTime: new Date(),
      schedules: [],
    },
  ]);

  const getMedicines = async () => {
    const token = await  AsyncStorage.getItem("token");

    axios
      .get(
        `${baseURL}/api/medications`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        const myMedicines = res.data.data.map(el=>{return(
          {label:el.name,value:el.id}
        )})
        setMedicines(myMedicines)

      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getTime = (dateStr) => {
    const dateObj = new Date(dateStr);

    // Get hours and minutes
    const hours = dateObj.getUTCHours().toString().padStart(2, '0');
    const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');

    // Format hh:mm
    const timeStr = `${hours}:${minutes}`;

    return timeStr
  }

  const getCurrentDate = () => {
    // Create a new Date object representing the current date and time
    const currentDate = new Date();
  
    // Get the year, month, and day from the Date object
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
    const day = String(currentDate.getDate()).padStart(2, '0');
  
    // Format the date as yyyy-mm-dd
    const formattedDate = `${year}-${month}-${day}`;
  
    // Return the formatted date
    return formattedDate;
  }

  const getEndDate = (duration) => {
    // Create a new Date object representing the current date and time
    const currentDate = new Date();
    let days = currentDate.getDate();
    let endDate;
    // Add X days to the day of the month
    switch (duration) {
      case '3 days':
        endDate = days + 3;
        break;
      case '5 days':
        endDate = days + 5;
        break;
      case '1 week':
        endDate = days + 7;
        break;
      case '2 weeks':
        endDate = days + 14;
        break;
      case '3 weeks':
        endDate = days + 21;
        break;
      case '1 month':
        endDate = days + 30;
        break;
    
      default:
        break;
    }

    // Set the new day of the month
    currentDate.setDate(endDate);
  
    // Get the year, month, and day from the Date object
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
    const day = String(currentDate.getDate()).padStart(2, '0');
  
    // Format the date as yyyy-mm-dd
    const formattedDate = `${year}-${month}-${day}`;
  
    // Return the formatted date
    return formattedDate;
  }

  const addPrescriptionForm = () => {
    const newForm = {
      id: Math.random().toString(36).substr(2, 9),
      medicine: "",
      duration: "",
      nOfTimes: 0,
      quantity: "",
      instructions: "",
      selected: false,
      startTime: new Date(),
      schedules: [],
    };
    setForms([...forms, newForm]);
  };

  const areAllFieldsFilled = () => {
    // Iterate over each form in the forms array
    for (const form of forms) {
      // Check if any required field is empty in the current form
      if (
        form.medicine === "" ||
        form.duration === "" ||
        form.quantity === "" ||
        form.instructions === "" ||
        form.nOfTimes === 0 ||
        form.schedules.some((schedule) => schedule.startTime === "")
      ) {
        // Return false if any required field is empty
        return false;
      }
    }
    // Return true if all fields are filled in all forms
    return true;
  };

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState();

  const replaceItemAtIndex = (array, index, newValue) => {
    // Create a copy of the original array
    const newArray = [...array];
    // Replace the item at the specified index with the new value
    newArray[index] = newValue;
    // Return the new array
    return newArray;
  };

  const onChangeStartTime = (event, selectedDate) => {
    const currentDate = formatTime(selectedDate) || formatTime(new Date());
    setShowTimePicker(false);
    const updatedForms = forms.map((form) => {
      if (form.id === selectedSchedule.id) {
        return {
          ...form,
          startTime: selectedDate,
          selected: true,
          schedules: replaceItemAtIndex(
            form.schedules,
            selectedSchedule.index,
            { startTime: selectedDate }
          ),
        };
      }
      return form;
    });
    setForms(updatedForms);
  };

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleConfirm = () => {
    setShowTimePicker(false);
  };

  const submitPrescriptions = async (prescriptions) => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);

    let postObj;
    let url;

    if(route.params?.userType==='doctor'){
      postObj = JSON.stringify({
      prescriptions,
      doctor_id: userObj.id,
      user_id: route.params.userId,
      });
      url = `${baseURL}/api/doctor/add-prescriptions`
    }else{
      postObj = JSON.stringify({
        prescriptions,
        user_id: userObj.id,
      });
      url = `${baseURL}/api/patient/add-prescriptions`
    }

    axios
      .post(url, postObj, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLoading(false);
        if (res.data.status) {
          alert("Prescription added successfully!");
          navigation.navigate(route.params?.userType==='doctor'?"DoctorHome":"PatientHome");
        } else {
          console.log("Something went wrong!");
        }
      })
      .catch((error) => {
        setLoading(false);
        alert(error.message);
      });
  };

  useEffect(()=>{
    getMedicines();
  },[])

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          backgroundColor: "#d8f3dc",
          justifyContent: "center",
          alignItems: "center",
          height: windowHeight * 0.12,
          width: "100%",
        }}
      >
        <View style={{ flexDirection: "row", marginTop: 20 }}>
          <TouchableOpacity
            style={{
              width: "20%",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => navigation.goBack()}
          >
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AntDesign name="arrowleft" size={24} color="#000" />
            </View>
          </TouchableOpacity>
          <View
            style={{
              width: "60%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "bold", color: "black" }}>
              Add new medicine
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
      </View>

      <ScrollView
        style={{
          width: "100%",
          height: windowHeight * 0.88,
          backgroundColor: "white",
        }}
      >
        {forms.map((form, index) => (
          <View
            key={form.id}
            style={{
              flex: 1,
              paddingBottom: 10,
              borderBottomColor: "gray",
              borderBottomWidth: 0.2,
            }}
          >
            {/* Main form section... */}
            <View
              style={{
                width: "100%",
                backgroundColor: "white",
              }}
            >
              {/* Form fields... */}
              {/* Medicine Name */}
              <View
                style={{
                  marginVertical: 10,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    alignSelf: "flex-start",
                    marginLeft: "5%",
                    marginTop: 15,
                    fontWeight: "500",
                  }}
                >
                  Med Name
                </Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  data={medicines}
                  search
                  maxHeight={300}
                  value={form.medicine}
                  onChange={(text) => {
                    const updatedForms = forms.map((f) => {
                      if (f.id === form.id) {
                        return { ...f, medicine: text.value };
                      }
                      return f;
                    });
                    setForms(updatedForms);
                  }}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Period"
                  searchPlaceholder="Search..."
                />

                <Text
                  style={{
                    alignSelf: "flex-start",
                    marginLeft: "5%",
                    marginTop: 15,
                    fontWeight: "500",
                  }}
                >
                  For How Long?
                </Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  data={[
                    { label: "3 days", value: "3 days" },
                    { label: "5 days", value: "5 days" },
                    { label: "1 week", value: "1 week" },
                    { label: "2 weeks", value: "2 weeks" },
                    { label: "3 weeks", value: "3 weeks" },
                    { label: "1 month", value: "1 month" },
                  ]}
                  search
                  maxHeight={300}
                  value={form.duration}
                  onChange={(text) => {
                    const updatedForms = forms.map((f) => {
                      if (f.id === form.id) {
                        return { ...f, duration: text.value };
                      }
                      return f;
                    });
                    setForms(updatedForms);
                  }}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Period"
                  searchPlaceholder="Search..."
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignSelf: "center",
                  width: "90%",
                }}
              >
                
                <View style={{ width: "48%" }}>
                  <Text
                    style={{
                      alignSelf: "flex-start",
                      marginTop: 15,
                      fontWeight: "500",
                    }}
                  >
                    How often?
                  </Text>
                  <Dropdown
                    style={styles.dropdown2}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={[
                      { value: 1, label: "1 time a day" },
                      { value: 2, label: "2 times a day" },
                      { value: 3, label: "3 times a day" },
                      { value: 4, label: "4 times a day" },
                    ]}
                    search
                    maxHeight={300}
                    value={form.nOfTimes}
                    onChange={(text) => {
                      const updatedForms = forms.map((f) => {
                        if (f.id === form.id) {
                          // Initialize schedules array based on selected value
                          const newSchedules = Array.from(
                            { length: text.value },
                            (_, index) => ({
                              startTime: "", // Initialize startTime for each schedule
                            })
                          );
                          return {
                            ...f,
                            nOfTimes: text.value,
                            schedules: newSchedules,
                          };
                        }
                        return f;
                      });
                      setForms(updatedForms);
                    }}
                    labelField="label"
                    valueField="value"
                    placeholder="Select option"
                    searchPlaceholder="Search..."
                  />
                </View>

                <View style={{ width: "48%" }}>
                  <Text
                    style={{
                      alignSelf: "flex-start",
                      marginTop: 15,
                      fontWeight: "500",
                    }}
                  >
                    Quantity Per Intake
                  </Text>
                  <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  data={[
                    { label: "1", value: "1" },
                    { label: "2", value: "2" },
                    { label: "3", value: "3" },
                    { label: "4", value: "4" },
                    { label: "5", value: "5" }
                  ]}
                  search
                  maxHeight={300}
                  value={form.quantity}
                  onChange={(text) => {
                    const updatedForms = forms.map((f) => {
                      if (f.id === form.id) {
                        return { ...f, quantity: text.value };
                      }
                      return f;
                    });
                    setForms(updatedForms);
                  }}
                  labelField="label"
                  valueField="value"
                  placeholder="Select quantity"
                  searchPlaceholder="Search..."
                />
                </View>
              </View>


              <Text
                style={{
                  alignSelf: "flex-start",
                  marginLeft: "5%",
                  marginTop: 15,
                  fontWeight: "500",
                }}
              >
                Instructions
              </Text>
              <TextInput
                placeholderTextColor={"#626262"}
                placeholder="Add instructions"
                value={form.instructions}
                onChangeText={(text) => {
                  const updatedForms = forms.map((f) => {
                    if (f.id === form.id) {
                      return { ...f, instructions: text };
                    }
                    return f;
                  });
                  setForms(updatedForms);
                }}
                style={[
                  {
                    fontSize: 14,
                    paddingLeft: 20,
                    backgroundColor: "#fff",
                    borderRadius: 10,
                    alignSelf: "center",
                    borderWidth: 0.3,
                    borderColor: "black",
                    marginVertical: 5,
                    width: "90%",
                    height: 40,
                  },
                ]}
              />
            </View>

            {/* Reminder section... */}
            <View style={{ marginTop: 20 }}>
              {form.schedules.map((schedule, index) => (
                <View key={index} style={styles.scheduleContainer}>
                  <View
                    style={{
                      flexDirection: "row",
                      width: "90%",
                      alignSelf: "center",
                    }}
                  >
                    <Text>Reminder {index + 1}</Text>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <View
                      style={[
                        styles.dateContainer,
                        styles.input2,
                        { marginRight: 5 },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedSchedule({ id: form.id, index });
                          setShowTimePicker(true);
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
                          {form.startTime && form.selected ? (
                            <Text style={styles.selectedDateText}>
                              {schedule.startTime &&
                                formatTime(new Date(schedule.startTime))}
                            </Text>
                          ) : (
                            <Text style={styles.datePickerButtonText}></Text>
                          )}
                          <View>
                            <Ionicons
                              name="timer-outline"
                              size={24}
                              color="black"
                            />
                          </View>
                        </>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {index !== 0 && (
              <TouchableOpacity
                onPress={() => {
                  const updatedForms = forms.filter((_, i) => i !== index);
                  setForms(updatedForms);
                }}
                style={{
                  alignSelf: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#dad7cd",
                  paddingVertical: 10,
                  width: "30%",
                  borderRadius: 5,
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: "black" }}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity
          onPress={() => {
            if (areAllFieldsFilled()) {
              addPrescriptionForm();
            } else {
              alert("Fill the current form(s) first!");
            }
          }}
          style={{
            backgroundColor: "#B7DAC1",
            borderRadius: 10,
            width: "30%",
            padding: 10,
            margin: 10,
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          <Text style={{ color: "black", fontSize: 14 }}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (areAllFieldsFilled()) {
              const prescriptions = forms.map((el) => {
                return {
                  medication_id: el.medicine,
                  frequency: el.nOfTimes,
                  quantity: parseInt(el.quantity),
                  duration: el.duration,
                  start_date: getCurrentDate(),
                  end_date: getEndDate(el.duration),
                  instructions: el.instructions,
                  hours: el.schedules.map(s=>getTime(s.startTime)).join(',')
                };
              });
              submitPrescriptions(prescriptions);
            } else {
              alert("Fill the forms first");
            }
          }}
          style={{
            backgroundColor: "#2FAB4F",
            borderRadius: 10,
            width: "60%",
            padding: 10,
            margin: 10,
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 14 }}>
            {loading ? (
              <ActivityIndicator size={"small"} color="white" />
            ) : (
              "Submit"
            )}
          </Text>
        </TouchableOpacity>

        {/* Time picker modal */}
        {Platform.OS === "ios" && (
          <Modal
            visible={showTimePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowTimePicker(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={forms[selectedSchedule?.id]?.startTime || new Date()}
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

        {Platform.OS === "android" && showTimePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={forms[selectedSchedule?.id]?.startTime || new Date()}
            mode={"time"}
            is24Hour={true}
            display="spinner"
            onChange={onChangeStartTime}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default AddMedicine;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#EAE8E0",
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "#DCEDE1",
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
    borderRadius: 22.5,
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
    color: "black",
  },
  dropdown: {
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 4,
    marginBottom: 5,
    borderWidth: 0.3,
    borderColor: "black",
    marginTop: 5,
    width: "90%",
  },
  dropdown2: {
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: 5,
    borderWidth: 0.3,
    borderColor: "black",
    marginTop: 5,
    width: "100%",
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
  scheduleContainer: {
    backgroundColor: "white",
    width: "100%",
    borderRadius: 10,
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
  },
});
