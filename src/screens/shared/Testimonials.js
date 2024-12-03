import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  FlatList,
  RefreshControl,
  ImageBackground,
  Dimensions,
  ScrollView,
  LogBox,
  Modal,
  Button,
} from "react-native";
import { AuthContext } from "../../context/context";
import axios from "axios";
import { baseURL } from "../../BaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dropdown } from "react-native-element-dropdown";
import {
  FontAwesome5,
  FontAwesome,
  MaterialIcons,
  MaterialCommunityIcons,
  Feather,
  Ionicons,
  EvilIcons,
  AntDesign,
} from "@expo/vector-icons";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;
const Testimonials = ({ navigation }) => {
  const context = useContext(AuthContext);
  const [articles, setArticles] = useState();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [title, setTitle] = useState("");
  const [user, setUser] = useState();
  const [refreshing, setRefreshing] = useState(false);
  const [userToken, setUserToken] = useState("");

  const fetchUserData = async () => {
    try {
      const user_ = await AsyncStorage.getItem("user");
      const token = AsyncStorage.getItem("token");
      const parsedUser = JSON.parse(user_);
      setUser(parsedUser);
      setUserToken(token);
    } catch (error) {
      console.error("Error retrieving user ID:", error);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          backgroundColor: "#fff",
          padding: 15,
          alignSelf: "center",
          borderRadius: 10,
          marginTop: 10,
          width: "90%",
          ...styles.shadow,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              width: "100%",
              justifyContent: "center",
              marginBottom: 15,
            }}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
             
                <Text
                  style={{
                    fontSize: 16,
                    color: "black",
                    marginBottom: 5,
                    marginRight: 7,
                    fontWeight: "bold",
                  }}
                >
                  {item.patient_name}
                </Text>

             
            </View>
           

            <Text
              style={{
                fontSize: 14,
                color: "black",
                marginBottom: 5,
              }}
            >
              {item.testimonial}
            </Text>
            {/* <View style={{ flexDirection: 'row', marginTop: 30}}>
                <View style={{width:'33%'}}>
                    <Text style={{marginHorizontal:10,fontWeight:"bold"}}>10:50 AM</Text>
                </View>
                <View style={{width:'33%'}}>
                    <Text style={{marginHorizontal:10,fontWeight:"bold"}}>0 answers</Text>
                </View>
                <View style={{width:'33%'}}>
                    <Text style={{marginHorizontal:10,fontWeight:"bold"}}>34 Likes</Text>
                </View>
            </View> */}
          </View>
        </View>
      </View>
    );
  };

  const getTestimonials = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    axios
    .get(`${baseURL}/api/feedbacks`, {
        headers: { "Authorization": `Bearer ${token}` },
    })
    .then((response) => {
        setRefreshing(false);
        setArticles(response.data.feedbacks);
        setLoading(false);
      })
      .catch((error) => {
        setRefreshing(false);
        alert(error.message);
        setLoading(false);
      });
  };



  const clearInput = () => {
    setCategory("");
    setSubCategory("");
    setTitle("");
    setTestimonial("");
  };

  useEffect(() => {
    getTestimonials();
    fetchUserData();
  }, []);

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem("token");
    setLoading(true);
    const postObj = JSON.stringify({
      patient_id: user?.id,
      testimonial: testimonial,
    });
    axios
      .post(`${baseURL}/api/feedbacks`, postObj, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLoading(false);
        if (res.data.status) {
          alert("Feedback sent");
          clearInput();
          getTestimonials();
        } else {
          alert("Something went wrong!");
        }
      })
      .catch((error) => {
        setLoading(false);
        alert(error.message);
      });
  };

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
          backgroundColor: "#178838",
          height: "12%",
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
          <Text style={{ fontWeight: "bold", color: "white" }}>
            Testimonials
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

      {/* scrollview info */}
      <>
        {user?.type === "Patient" && (
          <View style={{ backgroundColor: "white", marginTop: 20 }}>
            <View style={styles.searchBox}>
              <TextInput
                placeholder="Add your feedback..."
                value={testimonial}
                keyboardType="default"
                placeholderTextColor="#666666"
                style={[
                  styles.textInput,
                  {
                    color: "black",
                    justifyContent: "center",
                  },
                ]}
                autoCapitalize="none"
                onChangeText={(text) => setTestimonial(text)}
              />
            </View>

            <View
              style={{
                borderBottomColor: "#000",
                borderBottomWidth: 1,
                padding: 10,
              }}
            >
              <TouchableOpacity
                onPress={handleSubmit}
                style={{
                  backgroundColor: "#178838",
                  height: 30,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 6,
                  marginTop: 10,
                  width: "20%",
                  marginLeft: 20,
                }}
              >
                <Text
                  style={{
                    marginHorizontal: 10,
                    fontSize: 12,
                    fontWeight: "800",
                    color: "#FFF",
                  }}
                >
                  {loading ? (
                    <ActivityIndicator size={"small"} color="white" />
                  ) : (
                    "Submit"
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {articles ? (
          articles.length > 0 ? (
            <FlatList
              contentContainerStyle={{
                paddingBottom: 15,
              }}
              data={articles}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => getTestimonials()}
                />
              }
            />
          ) : (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
              }}
            >
              <Text>No Article...</Text>
            </View>
          )
        ) : (
          <View
            style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
          >
            <ActivityIndicator size="large" color="black" />
          </View>
        )}
      </>
    </View>
  );
};
export default Testimonials;
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
    marginTop: Platform.OS === "ios" ? 0 : -12,
    paddingLeft: 10,
    color: "#05375a",
  },
  searchBox: {
    flexDirection: "row",
    height: 80,
    width: "89%",
    borderWidth: 1,
    borderColor: "#101319",
    paddingBottom: 5,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
  },
  searchBox2: {
    flexDirection: "row",
    height: 40,
    width: "89%",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#101319",
    paddingBottom: 5,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
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
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 5,
  },
  tableCell: {
    flex: 1,
    alignItems: "center",
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
  dropdown: {
    height: 50,
    borderColor: "black",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
    marginTop: 10,
    width: "90%",
    marginHorizontal: 20,
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
    fontSize: 16,
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
});
