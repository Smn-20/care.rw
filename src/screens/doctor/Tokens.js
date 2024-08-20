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
  Alert,
} from "react-native";
import { baseURL } from "../../BaseUrl";
import { AntDesign, FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const windowHeight = Dimensions.get("screen").height;
const windowWidth = Dimensions.get("screen").width;

const Tokens = ({ navigation, index }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState();
  const [user, setUser] = useState();
  const [tokens, setTokens] = useState([]);



  const getTokens = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user)
    setUser(userObj)
    axios
      .get(`${baseURL}/api/doctor/tokens/${userObj.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setTokens(res.data.data);
        setRefreshing(false);
      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  };

  const approve = async (id) => {
    const token = await AsyncStorage.getItem("token");

    axios
        .put(`${baseURL}/api/access-requests/approve/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setLoading(false);
          if (res.data.status) {
            alert("Request approved successfully!");
            getTokens();
          } else {
            alert("Something went wrong!");
          }
        })
        .catch((error) => {
          alert(error.message);
        });
  }


  const reject = async (id) => {
    const token = await AsyncStorage.getItem("token");

    axios
        .put(`${baseURL}/api/access-requests/decline/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setLoading(false);
          if (res.data.status) {
            alert("Request rejected!");
            getTokens();
          } else {
            alert("Something went wrong!");
          }
        })
        .catch((error) => {
          alert(error.message);
        });
  }

  const approveAlert = (id) =>
    Alert.alert(
      "Approve Request",
      "Are you sure you want to approve this request",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => approve(id) },
      ]
    );

    const rejectAlert = (id) =>
    Alert.alert(
      "Reject Request",
      "Are you sure you want to reject this request",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => reject(id) },
      ]
    );

  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          backgroundColor: "#F8FAFC",
          paddingTop: 15,
          paddingRight: 10,
          alignSelf: "center",
          borderRadius: 10,
          marginTop: 10,
          width: "90%",
        }}
      >
        <View>
          <View
            style={{
              justifyContent: "center",
              marginBottom: 15,
              paddingLeft:20,
              paddingRight:20,
            }}
          >
            <View style={{ flexDirection: "row" }}>
            <View style={{ margin:5, alignItems: "center" }}>
            <Image
              source={require("../../images/doctor1.png")}
              resizeMode="stretch"
              style={{
                backgroundColor: "white",
                marginTop: 5,
                width: 40, // Adjust the width as per your design
                height: 40, // Adjust the height as per your design
                borderRadius: 32.5, // Set the borderRadius to half of width/height to create a circle
                overflow: "hidden", // Clip the image to the rounded shape
              }}
            />
          </View>
            <View style={{justifyContent:'center',marginLeft:20}}>
            <Text
              style={{
                fontSize: 13,
                color: "black",
                marginBottom: 5,
                fontWeight: "bold",
              }}
            >
              {item.user.first_name} {item.user.last_name}
            </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "black",
                  marginBottom: 5,
                  fontWeight: "500",
                }}
              >
                {item.created_at.slice(0,10)}
              </Text>
            </View>
              
            </View>

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                 onPress={()=>navigation.navigate('TokenDetails',{token:item.token,doctor:user.names,dates:item.created_at?.slice(0,10)})}
                style={{
                  flexDirection: "row",
                  width:'100%',
                  height: 25,
                  borderWidth: 1,
                  borderColor: "#000",
                  paddingHorizontal:10,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 15,
                  marginTop: 5,
                }}
              >
                <AntDesign name="arrowright" color={'#178838'} size={14} />
                <Text
                  style={{
                    marginHorizontal: 5,
                    fontSize: 11,
                    fontWeight: "700",
                    color: "#178838",
                  }}
                >
                  {item.token}
                </Text>
              </TouchableOpacity>

       

            </View>
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    if(index==2){
    getTokens();
    }
  }, []);

  return (
    <View styles={styles.container}>
      {tokens.length > 0 ? (
        <FlatList
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          data={tokens}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => getTokens()}
            />
          }
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            No request yet!
          </Text>
        </View>
      )}

    </View>
  );
};

export default Tokens;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    borderRadius: 20,
    height: 40,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#FBF9F1",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  cancelButton: {
    borderColor: "red",
    borderWidth: 1,
  },
  confirmButton: {
    backgroundColor: "#178838",
  },
});
