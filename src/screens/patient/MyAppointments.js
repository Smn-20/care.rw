import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Button,
  RefreshControl,
  Image,
} from "react-native";
import { baseURL } from "../../BaseUrl";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";


const windowHeight = Dimensions.get("screen").height;
const windowWidth = Dimensions.get("screen").width;

const MyAppointments = ({ navigation, index, onEvent }) => {
  const [refreshing, setRefreshing] = useState();
  const [appointments, setAppointments] = useState([]);


  const getAppointments = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const user_ = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user_);

    axios
      .get(`${baseURL}/api/appointments/all/upcoming?user_id=${userObj.id}`, {
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

    return `${dayName} ${day} ${month}`;
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={()=>onEvent(item)}
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginTop: windowWidth / 30,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: "90%",
            borderWidth: 1,
            borderColor: "#CEDBED",
            paddingHorizontal: 10,
            height: 68,
            borderRadius: 16,
          }}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: "15%",
            }}
          >
            <View
              style={{
                width: windowWidth / 9,
                height: windowWidth / 9,
                borderRadius: windowWidth / 18,
                backgroundColor: "#CBD5E1",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={require("../../images/calendar.png")}
                style={{ width: windowWidth / 14, height: windowWidth / 14 }}
                resizeMode="contain"
              />
            </View>
          </View>
          <View style={{ width: "75%" }}>
            <Text
              style={{
                color: "#000",
                fontWeight: 500,
                marginLeft: 20,
              }}
            >
              {item.branch_name}
            </Text>

            <Text style={{ color: "gray", marginLeft: 20 }}>
              {formatDate(item.date)}{" "}
              <Text style={{ color: "#0A8133" }}>{item.time.slice(0, 5)}</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {}}
            style={{
              width: "10%",
              flexDirection: "row",
              height: "60%",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 20,
            }}
          >
            <AntDesign
              color={"#178838"}
              style={{ marginRight: 5 }}
              name="arrowright"
              size={22}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    if (index == 0 && appointments.length === 0) {
      getAppointments();
    }
  }, []);

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
          <Text style={{marginTop:40,textAlign:'center'}}>No appointments...</Text>
        </View>
      )}
    </View>
  );
};

export default MyAppointments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sheetContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: 'black',
  },
});
