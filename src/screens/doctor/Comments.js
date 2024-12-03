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
const Comments = ({ navigation, route }) => {
  const context = useContext(AuthContext);
  const [focused, setFocused] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userToken, setUserToken] = useState("");

  const fetchUserData = async () => {
    try {
      const user = await AsyncStorage.getItem("user");
      const token = AsyncStorage.getItem("token");
      const parsedUser = JSON.parse(user);
      setUserId(parsedUser.id);
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
            {item.user && (
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
                {item.user?.fullname}
              </Text>
              {item.user?.type === "Doctor" && (
                <MaterialIcons name="verified" size={20} color="#00CCF5" />
              )}
            </View>
            )}
            

            <Text
              style={{
                fontSize: 14,
                color: "black",
                marginBottom: 5,
                fontWeight: "500",
              }}
            >
              {item.comment}
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

  const getComments = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const postObj = {
      article_id: route.params.article.id,
    };
    axios
      .post(`${baseURL}/api/get_comments`, postObj, {
        headers: { "Authorization": `Bearer ${token}` },
      })
      .then((response) => {
        setRefreshing(false);
        setComments(response.data.data?.data);
        setLoading(false);
      })
      .catch((error) => {
        setRefreshing(false);
        alert(error.message);
        setLoading(false);
      });
  };

  const getCategories = async () => {
    const token = await AsyncStorage.getItem("token");
    axios
      .post(`${baseURL}/api/get_categories`, {
        headers: { "Authorization": `Bearer ${token}` },
      })
      .then((response) => {
        var categories_ = response.data.data.map((item) => {
          return { label: item.category_name, value: item.id };
        });
        setCategories(categories_);
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  const clearInput = () => {
    setCategory("");
    setSubCategory("");
    setDescription("");
  };

  useEffect(() => {
    getComments();
    getCategories();
    fetchUserData();
  }, []);

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem("token");
    setLoading(true);
    const postObj = JSON.stringify({
      comment: comment,
      article_id: route.params.article.id,
    });
    axios
      .post(`${baseURL}/api/comments`, postObj, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLoading(false);
        setShowModal(false);
        if (res.data.status) {
          alert("Comment sent");
          clearInput();
          getComments();
        } else {
          alert("Something went wrong!");
        }
      })
      .catch((error) => {
        setLoading(false);
        setShowModal(false);
        alert(error.message);
      });
  };

  const subCategory_ = [
    { label: "Type 1", value: "Type 1" },
    { label: "Type 2", value: "Type 2" },
    { label: "Prevention", value: "Prevention" },
    { label: "Weight & Fitness", value: "Weight & Fitness" },
    { label: "Women health", value: "Women health" },
  ];

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
            {route.params.article.user && route.params.article.user.fullname + "'s"}{" "}
            Article
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
        <View
          style={{
            backgroundColor: "#626262",
            paddingBottom: 10,
            borderBottomColor: "black",
            borderBottomWidth: 0.5,
          }}
        >
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
            <View style={{ flexDirection: "row",maxHeight:windowHeight/3 }}>
              <ScrollView
                contentContainerStyle={{
                  width: "100%",
                  justifyContent: "center",
                  marginBottom: 15,
                }}
              >
                {route.params.article.user && (
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
                    {route.params.article.user.fullname}
                  </Text>
                  {route.params.article.user?.type === "Doctor" && (
                    <MaterialIcons name="verified" size={20} color="#00CCF5" />
                  )}
                </View>
                )}
                

                <Text
                  style={{
                    fontSize: 14,
                    color: "#178838",
                    marginBottom: 5,
                    fontWeight: "500",
                  }}
                >
                  {route.params.article.subcategory?.subcategory_name}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "black",
                    marginBottom: 5,
                    fontWeight: "500",
                  }}
                >
                  {route.params.article.content}
                </Text>
              </ScrollView>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={{ width: "100%", alignItems: "flex-end" }}
          >
            <Text style={{ color: "white", marginTop: 10, marginRight: "5%" }}>
              Add comment
            </Text>
          </TouchableOpacity>
        </View>
        {comments ? (
          comments.length > 0 ? (
            <FlatList
              contentContainerStyle={{
                paddingBottom: 15,
              }}
              data={comments}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => getComments()}
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
              <Text>No comments...</Text>
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add comment</Text>
            <TextInput
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChangeText={(text) => setComment(text)}
              keyboardType="default"
              // placeholderTextColor={"#626262"}
              placeholder={"Enter text"}
              style={[
                {
                  fontSize: 14,
                  padding: 8,
                  backgroundColor: "#f1f4ff",
                  borderRadius: 10,
                  marginTop: 15,
                  marginBottom: 35,
                  width: "100%",
                  height: 80,
                },
                focused && {
                  borderWidth: 2,
                  borderColor: "#626262",
                  shadowOffset: { width: 4, height: 10 },
                  shadowColor: "#626262",
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                },
              ]}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  handleSubmit();
                }}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? (
                    <ActivityIndicator size={"small"} color="white" />
                  ) : (
                    "Submit"
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
export default Comments;
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
