import {
  Dimensions,
  StatusBar,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  Platform,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { AntDesign } from "@expo/vector-icons";
import { Calendar, Agenda } from "react-native-calendars";
import { Card } from "react-native-paper";
import axios from "axios";
import { baseURL } from "../../BaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dropdown } from "react-native-element-dropdown";

const { height } = Dimensions.get("window");
const { width } = Dimensions.get("window");

const BookAppointment = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [doctorsByDepartment, setDoctorsByDepartment] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [department, setDepartment] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [bookBy, setBookBy] = useState("");

  const [selectedTime, setSelectedTime] = useState("");
  const [enabledDates, setEnabledDates] = useState([]);
  const [markedDates, setMarkedDates] = useState([]);
  const [doctors, setDoctors] = useState({
    [new Date().toISOString().slice(0, 10)]: [],
  });
  const [doctors_, setDoctors_] = useState([]);

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

  const [slots, setSlots] = useState([]);

  const generateMarkedDates = (day = null) => {
    const marked = {};

    // Dynamically calculate the start date (one year before today)
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1); // Subtract one year

    const currentDate = new Date();

    // Disable all dates before the start date
    for (
      let date = new Date(startDate);
      date < currentDate;
      date.setDate(date.getDate() + 1) // Increment by 1 day
    ) {
      const formattedDate = date.toISOString().split("T")[0];
      marked[formattedDate] = {
        disabled: true,
        disableTouchEvent: true,
      };
    }

    // Disable future dates not in enabledDates
    for (let i = 0; i < 365; i++) {
      // Example: Loop for 1 year into the future
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      const formattedDate = date.toISOString().split("T")[0];

      if (!marked[formattedDate]) {
        marked[formattedDate] = {
          disabled: true,
          disableTouchEvent: true,
        };
      }
    }

    marked[new Date().toISOString().split("T")[0]] = {
      // marked: true,
      disabled: true,
      disableTouchEvent: true,
      customStyles: {
        container: {
          backgroundColor: "#fff",
        },
        text: {
          color: "#00b4d8",
        },
      },
    };

    // Enable only the dates in the enabledDates list
    enabledDates.forEach((date) => {
      marked[date] = {
        selected: true,
        selectedColor: "#d8f3dc",
        disabled: false,
        disableTouchEvent: false,
      };
    });
    if (day) {
      marked[day] = {
        // marked: true,
        selectedColor: "#178838",
        customStyles: {
          container: {
            backgroundColor: "#178838",
          },
          text: {
            color: "white",
          },
        },
      };
    }

    setMarkedDates(marked);
  };

  const renderItem = (item) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setDoctors({});
          const updatedDoctors = doctors_.map((d) =>
            d.schedule_id === item.schedule_id
              ? { ...d, selected: true }
              : { ...d, selected: false }
          );
          setScheduleId(item.schedule_id);
          setTimeout(() => {
            setDoctors({ [item.date]: updatedDoctors });
          }, 1000);
          getSlots(item.schedule_id);
        }}
        style={[styles.card, item.selected && styles.selectedCard]}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: "https://via.placeholder.com/100" }}
          style={styles.image}
        />
        <View style={styles.details}>
          <Text style={styles.name}>{item.doctor_name}</Text>
          <Text style={styles.slots}>
            {item.clinic_assigned_slots - item.self_booked_slots} available
            spaces
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyDate = () => {
    return (
      <View
        style={{
          flex: 1,
          paddingLeft: 30,
          justifyContent: "center",
          backgroundColor: "white",
          borderRadius: 20,
          marginTop: 20,
          marginRight: 20,
        }}
      >
        <Text>No doctor on the selected date</Text>
      </View>
    );
  };

  const getDepartments = async () => {
    const token = await AsyncStorage.getItem("token");
    console.log(token);
    axios
      .get(`${baseURL}/api/health-facility/departments/${route.params.hId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.status) {
          setDepartments(
            res.data.data.map((d) => ({
              label: d.department_name,
              value: d.id,
            }))
          );
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getDoctorsByDepartment = async (departmentId) => {
    const token = await AsyncStorage.getItem("token");
    console.log(token);
    axios
      .get(`${baseURL}/api/department/doctors?branch_id=${route.params.id}&department_id=${departmentId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.status) {
          setDoctorsByDepartment(
            res.data.data.map((d) => ({
              label: d.first_name + " " +d.last_name,
              value: d.id,
            }))
          );
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getSlots = async (scheduleId) => {
    const token = await AsyncStorage.getItem("token");
    setSlots();
    axios
      .get(`${baseURL}/api/schedules/${scheduleId}/time-slots`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log(res.data.data)
        if (res.data.status) {
          setSlots(res.data.data || []);
        }
      })
      .catch((error) => {
        setSlots([]);
        console.log(error);
      });
  };

  const getDoctorsByDate = async (date, departmentId) => {
    const token = await AsyncStorage.getItem("token");
    console.log(
      `${baseURL}/api/schedules/by-date?branch_id=${route.params.id}&department_id=${departmentId}&date=${date}`
    );
    axios
      .get(
        `${baseURL}/api/schedules/by-date?branch_id=${route.params.id}&department_id=${departmentId}&date=${date}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.data.status) {
          setDoctors_(res.data.data);
          var doctor = {};
          doctor[date] = res.data.data;
          setDoctors(doctor);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);
    setLoading(true);
    const postObj = JSON.stringify({
      health_facility_id: route.params.hId,
      branch_id: route.params.id,
      schedule_id: scheduleId,
      type: "self_booked",
      user_id: userObj.id,
      time: selectedTime,
    });
    console.log(postObj);
    axios
      .post(`${baseURL}/api/book-appointment`, postObj, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLoading(false);
        if (res.data.status) {
          alert("Appointment request sent");
          navigation.navigate("Appointments");
        } else {
          alert("Something went wrong!");
        }
      })
      .catch((error) => {
        setLoading(false);
        alert(error.message);
      });
  };

  const getDepartmentSchedules = async (departmentId) => {
    const token = await AsyncStorage.getItem("token");
    console.log(token);
    axios
      .get(
        `${baseURL}/api/health-facility/doctor-schedule?branch_id=${route.params.id}&department_id=${departmentId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        if (res.data.status) {
          setEnabledDates(res.data.data.map((s) => s.date));
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getDoctorSchedules = async (doctorId) => {
    const token = await AsyncStorage.getItem("token");
    console.log(token);
    axios
      .get(
        `${baseURL}/api/health-facility/doctor-schedule?branch_id=${route.params.id}&department_id=${department}&doctor=${doctorId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        console.log(res.data.data.map((s) => ({
          label: formatDate(s.date),
          id: s.id
        })));
        if (res.data.status) {
          setDoctorSchedules(res.data.data.map((s) => ({
            label: formatDate(s.date),
            value: s.id
          })));
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getDepartments();
    generateMarkedDates();
  }, []);

  useEffect(() => {
    generateMarkedDates();
  }, [enabledDates]);

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View
        style={{
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
          height: "12%",
          width: "100%",
        }}
      >
        <View style={{ flexDirection: "row", marginTop: 20 }}>
          <TouchableOpacity
            style={{
              width: "15%",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} />
          </TouchableOpacity>
          <View
            style={{
              width: "85%",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                fontSize: 21,
                color: "black",
                marginLeft: 20,
              }}
            >
              Rwanda Eye Clinic
            </Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Top Section */}
        <View style={bookBy == "date" && styles.topSection}>
          <Text style={styles.title}>Choose department</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.placeholderStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={departments}
            search
            // value={"1 month"}
            onChange={(item) => {
              getDepartmentSchedules(item.value);
              setDepartment(item.value);
              getDoctorsByDepartment(item.value);
            }}
            labelField="label"
            valueField="value"
            placeholder="Select department"
            searchPlaceholder="Search..."
          />
          <Text style={styles.title}>Book by</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.placeholderStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={[
              { label: "By date", value: "date" },
              { label: "By doctor", value: "doctor" },
            ]}
            search
            value={bookBy}
            onChange={(item) => {
              setBookBy(item.value);
            }}
            labelField="label"
            valueField="value"
            placeholder="Select"
            searchPlaceholder="Search..."
          />
        </View>

        {/* Agenda Section */}
        {department && bookBy == "date" && enabledDates.length > 0 && (
          <>
            <View style={styles.agendaSection}>
              <Agenda
                markingType="custom"
                items={doctors}
                theme={{
                  selectedDayBackgroundColor: "#178838",
                  selectedDayTextColor: "#000",
                  calendarBackground: "#fff",
                }}
                onDayPress={(day) => {
                  setDoctors({});
                  setTimeout(() => {
                    generateMarkedDates(day.dateString);
                    if (department) {
                      getDoctorsByDate(day.dateString, department);
                    }
                  }, 1000);
                }}
                renderItem={renderItem}
                renderEmptyDate={renderEmptyDate}
                markedDates={markedDates}
              />
            </View>

            
          </>
        )}

        {department && bookBy == "doctor" && (
          <View style={{ width: "100%", alignSelf: "center" }}>
          <Text style={styles.title}>Choose doctor</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.placeholderStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={doctorsByDepartment}
            search
            // value={"1 month"}
            onChange={(item) => {
              setDoctorSchedules([])
              getDoctorSchedules(item.value);
            }}
            labelField="label"
            valueField="value"
            placeholder="Select department"
            searchPlaceholder="Search..."
          />
           <Text style={styles.title}>Choose date</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.placeholderStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={doctorSchedules}
            search
            value={scheduleId}
            onChange={(item) => {
              setScheduleId(item.value)
              getSlots(item.value);
            }}
            labelField="label"
            valueField="value"
            placeholder="Select department"
            searchPlaceholder="Search..."
          />
        </View>
        )}

        {department && bookBy && scheduleId && (
          <>
            <View style={{ width: "90%", alignSelf: "center" }}>
              <Text style={[styles.title, { marginTop: 15 }]}>Choose Time</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
              >
                {slots ? (
                  slots.length > 0 ? (
                    slots.map((time, index) => (
                      <TouchableOpacity
                        key={index}
                        activeOpacity={1}
                        style={[
                          styles.timeSlot,
                          selectedTime === time ? styles.selectedTimeSlot : null,
                        ]}
                        onPress={() => setSelectedTime(time)}
                      >
                        <Text
                          style={[
                            styles.timeText,
                            selectedTime === time
                              ? styles.selectedTimeText
                              : null,
                          ]}
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style>No available space</Text>
                  )
                ) : (
                  <View
                    style={{
                      width: width * 0.9,
                      paddingTop: 20,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ActivityIndicator />
                  </View>
                )}
              </ScrollView>
            </View>
            {selectedTime&&(
              <TouchableOpacity
              onPress={() => {
                handleSubmit();
              }}
              style={{
                backgroundColor: "#2FAB4F",
                height: 45,
                borderRadius: 22.5,
                width: "90%",
                marginTop: 20,
                alignSelf: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 15, fontWeight: "600" }}>
                Book Appointment
              </Text>
            </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default BookAppointment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 60,
    backgroundColor: "#178838",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 10,
  },
  topSection: {
    flex: 1,
    marginBottom: 10,
  },
  title: {
    alignSelf: "flex-start",
    marginTop: 7,
    fontWeight: "500",
  },
  eventList: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  agendaSection: {
    flex: 2, // Agenda takes half of the screen
    borderRadius: 8,
    overflow: "hidden",
  },
  item: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  emptyDate: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
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
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
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
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#444",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    width: "95%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    marginVertical: 5,
  },
  selectedCard: {
    backgroundColor: "#e8f5e9", // Light green background
    borderColor: "#4caf50", // Green border
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  scrollContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeSlot: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d3d3d3",
    marginRight: 5,
    backgroundColor: "#ffffff",
  },
  selectedTimeSlot: {
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
  },
  timeText: {
    fontSize: 12,
    color: "#7d7d7d",
  },
  selectedTimeText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});
