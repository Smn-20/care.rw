import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { baseURL } from "../../BaseUrl";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const windowHeight = Dimensions.get("screen").height;
const windowWidth = Dimensions.get("screen").width;

const History = ({ navigation, index }) => {
  const [refreshing, setRefreshing] = useState();
  const [appointments, setAppointments] = useState([]);

  const getAppointments = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const user_ = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user_)

    axios
      .get(`${baseURL}/api/appointments/history/all?user_id=${userObj.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAppointments(res.data.data);
        console.log(res.data.data);
        setRefreshing(false);
      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  };

  const formatDate = (inputDate) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

    const date = new Date(inputDate);
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName} ${day} ${month} ${year}`;
}

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          {/* Profile Image */}
          <View
            style={{
              width: "20%",
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
            <Text style={[styles.date,{fontSize:12}]}>Dr. {item?.doctor_name}</Text>
            <Text style={styles.date}>{item?.branch_name}</Text>
            <View style={{flexDirection:'row', alignItems:'center'}}>
            <Ionicons name="calendar" size={16} color="#bbbbbb" />
            <Text style={styles.doctorName}>{formatDate(item?.date)}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    if (index == 1 && appointments.length == 0) {
      getAppointments();
    }
  }, [index]);

  return (
    <View styles={styles.container}>
      {appointments.length>0?(
        <FlatList
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        data={appointments}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => getAppointments()}
          />
        }
      />
      ):(
        <View style={{width:windowWidth}}>
          <Text style={{marginTop:40,textAlign:'center'}}>No history...</Text>
        </View>
      )}
    </View>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    height: 80,
    marginTop: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
  },
  row: {
    width:'100%',
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileImage: {
    width: windowWidth / 6,
    height: windowWidth / 6,
    borderRadius: windowWidth / 20,
  },
  textContainer: {
    flexDirection: "column",
    width: "75%",
    borderBottomColor: '#EAF1FB',
    borderBottomWidth: 1
  },
  date: {
    color: "#56667C",
    fontSize: 16,
    fontWeight: "600",
  },
  doctorName: {
    color: "#bbbbbb",
    marginBottom: 5,
    fontSize: 14,
    marginTop: 4,
    marginLeft: 6,
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
});
