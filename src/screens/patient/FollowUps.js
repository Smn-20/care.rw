import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { baseURL } from "../../BaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Feather,
  EvilIcons,
  AntDesign,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import axios from "axios";
import BottomNavigator from "../../components/BottomNavigator";

const windowHeight = Dimensions.get("window").height;
const FollowUps = ({ navigation }) => {
  const [medicines, setMedicines] = useState();
  const [user, setUser] = useState();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState();

  const markAsPurchasedAlert = (id) =>
    Alert.alert(
      "Mark as purchased",
      "Are you sure you want to mark this medication ",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => markAsPurchased(id) },
      ]
    );

    const markAsPurchased = async (id) => {
      setLoading(true)
      const token = await AsyncStorage.getItem("token");
      const postObj = JSON.stringify({
        access_id: id,
      });
      axios
          .put(`${baseURL}/api/prescription/purchase/${id}`, postObj, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            setLoading(false);
            if (res.data.status) {
              alert("Marked as purchased!");
              getMedicines();
            } else {
              alert("Something went wrong!");
            }
          })
          .catch((error) => {
            setLoading(false)
            alert(error.message);
          });
    }

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          item.purchased === "1"?
          navigation.navigate("Calendar", {
            id:item.id,
            medicineName: item.medication.name,
            times: item.frequency,
            start: item.start_date,
            end:item.end_date,
            instructions: item.instructions,
            hours: item.hours
          }):console.log("")
        }
        style={{
          backgroundColor: "#F3F5F7",
          padding: 8,
          alignSelf: "center",
          borderRadius: 10,
          marginTop: 10,
          width: "90%",
          marginBottom: 10,
          ...styles.shadow,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              width: "22%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                borderRadius: 10,
                width: 42,
                height: 42,
                backgroundColor: "#b7e7e7",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons name="pill" size={30} />
            </View>
          </View>

          <View
            style={{
              width: "63%",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black", fontWeight: "bold" }}>
              {item.medication.name} |{" "}
              <Text style={{ fontWeight: "normal" }}>
                {item.frequency} times per day
              </Text>{" "}
            </Text>
            <Text style={{ fontSize: 12, color: "black", marginTop: 5 }}>
              {item.start_date} | {item.end_date}
            </Text>
          </View>

            <View
            style={{
              width: "15%",
              justifyContent: "center",
              alignItems: "flex-end",
            }}
            >
            {item.purchased === "1" && (
            <AntDesign name="arrowright" size={20} />
            )}
          </View>
        </View>
        <View>
        {item.purchased === "0" && (
          <TouchableOpacity 
          onPress={()=>{
            markAsPurchasedAlert(item.id);
          }}
          style={{
            width:150,
            height:30,
            marginTop:10,
            marginLeft:'20%',
            paddingHorizontal:5,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 5,
            backgroundColor:'orange'
          }}>
            {loading?<ActivityIndicator size={'small'} color="white"/>:<Text style={{fontSize:12,color:'white'}}>Mark as Purchased</Text>}
            
          </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getMedicines = async () => {
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);
    setUser(userObj)
    const token = await AsyncStorage.getItem("token");
    axios
      .get(`${baseURL}/api/all/prescriptions/${userObj.id}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      .then((res) => {
        setMedicines(res.data.data);
        console.log(res.data.data[0]);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getMedicines();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#fff"
        barStyle="dark-content"
        translucent={false}
      />
      <View
        style={{
          backgroundColor: "#F8FAFC",
          justifyContent: "center",
          alignItems: "center",
          height: "12%",
          width: "100%",
        }}
      >
        <View style={{ flexDirection: "row", marginTop: 20 }}>
          <View
            style={{
              width: "20%",
              justifyContent: "center",
              alignItems: "center",
            }}
          ></View>
          <View
            style={{
              width: "60%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "bold", color: "black" }}>
              Follow Ups
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

      <TouchableOpacity
        onPress={()=>navigation.navigate("AddMedicine")}
        style={{
          justifyContent: "center",
          alignItems: "center",
          height: 40,
          width: "40%",
          marginTop: 20,
          marginLeft: "5%",
          backgroundColor: "#178838",
          borderRadius: 20,
        }}
      >
        <Text style={{ fontWeight: "500", color: "white" }}>Add Medicine</Text>
      </TouchableOpacity>

      {/* scrollview info */}
      {medicines ? (
        <View style={{ paddingBottom: windowHeight / 6 }}>
          {medicines.length > 0 ? (
            <FlatList
              contentContainerStyle={{
                paddingBottom: 15,
              }}
              data={medicines}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => getMedicines()}
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
              <Text>No Report...</Text>
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

      <BottomNavigator navigation={navigation} userRole={user?.user_type}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ddd" },
  tableCell: {
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#ddd",
    borderWidth: 1,
    paddingVertical: 12,
  },
  headerRow: {
    backgroundColor: "#f1f8ff",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerCell: { backgroundColor: "#f1f8ff" },
  headerText: { fontWeight: "bold" },
  cellText: {},
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

export default FollowUps;
