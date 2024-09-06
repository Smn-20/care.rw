import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Dimensions,
  Modal,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  StatusBar,
  RefreshControl,
} from "react-native";
import { AntDesign, Feather, FontAwesome6, Ionicons } from "@expo/vector-icons";
import Pusher from "pusher-js/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseURL } from "../../BaseUrl";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

const ChatRoom = ({ navigation, route }) => {
  const [refreshing, setRefreshing] = useState();
  const [user, setUser] = useState();
  const [userId, setUserId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [messages, setMessages] = useState([]);

  const flatListRef = useRef(null);

  const takePaymentPicture = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status == "granted") {
      const res = await ImagePicker.launchCameraAsync({
        quality: 0.2,
        allowsEditing: true,
      });
      setImage(res.assets[0].uri);
      sendMessage(res.assets[0].uri);
      setShowModal(false);
    } else {
      setShowModal(false);
      Alert.alert("Access Denied!");
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      sendMessage(result.assets[0].uri);
      setShowModal(false);
    } else {
      setShowModal(false);
    }
  };

  const markAsRead = async () => {
    const token = await AsyncStorage.getItem("token");
    const ids = route.params.newChats;
    const postObj = JSON.stringify({
      message_ids: ids,
    });
    axios
      .post(`${baseURL}/api/chat/mark-as-read`, postObj, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.status) {
          console.log(res.data.message);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const submitMessage = async (img = null) => {
    const token = await AsyncStorage.getItem("token");

    const postObj = new FormData();

    postObj.append(
      "user_id",
      route.params.userType === "patient" ? userId : route.params.id
    );
    postObj.append(
      "doctor_id",
      route.params.userType === "patient" ? route.params.id : userId
    );
    postObj.append("message", message || " ");
    postObj.append("sender", route.params.userType);

    if (img || image) {
      postObj.append("image", {
        type: "image/jpg",
        uri: img ? img : image,
        name: "my_image.jpg",
      });
    }

    console.log(postObj);

    axios
      .post(`${baseURL}/api/chat`, postObj, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.status === true) {
          console.log("message sent");
        }
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const sendMessage = (img = null) => {
    if (message.trim() === "" && !img) return;
    const newMessage = {
      message: message,
      image: img ? img : image,
      id: messages.length + 1,
      sender: route.params.userType,
      created_at: new Date(),
    };
    console.log(newMessage);
    setMessages([...messages, newMessage]);
    setMessage("");
    submitMessage(img);
    // Scroll to the bottom of the FlatList
    // flatListRef.current.scrollToEnd({ animated: true });
  };

  // const getCurrentTime = () => {
  //     const now = new Date();
  //     const hours = now.getHours().toString().padStart(2, '0');
  //     const minutes = now.getMinutes().toString().padStart(2, '0');
  //     return `${hours}:${minutes}`;
  // };

  const handleScrollToIndexFailed = (info) => {
    const wait = new Promise((resolve) => setTimeout(resolve, 0));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: false,
      });
    });
  };

  const getMessages = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const user_ = await AsyncStorage.getItem("user");
    setUser(JSON.parse(user_));
    const user_id = JSON.parse(user_).id;
    setUserId(user_id);
    const url =
      route.params.userType === "patient"
        ? `${baseURL}/api/chats/${route.params.id}/${user_id}`
        : `${baseURL}/api/chats/${user_id}/${route.params.id}`;
    axios
      .get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setRefreshing(false);
        if (res.data.status) {
          console.log(res.data.data.map(i=>i.image));
          setMessages(res.data.data);
          flatListRef.current?.scrollToIndex({
            animated: false,
            index: res.data.data.length - 1, // Scroll to the last item
          });
        }
      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  };

  useEffect(() => {
    if (messages.length > 0) {
      const keyboardDidShowListener = Keyboard.addListener(
        "keyboardDidShow",
        () => {
          flatListRef.current?.scrollToIndex({
            animated: false,
            index: messages.length - 1, // Scroll to the last item
          });
        }
      );
    }
  }, [messages]);

  useEffect( () => {
   initializer();
  }, []);

  const initializer = async () => {
    getMessages();
    markAsRead();
    const pusher = new Pusher("57bf264e486af8bb9313", {
      cluster: "mt1",
      encrypted: true,
    });

    const user_ = await AsyncStorage.getItem("user");
    const user_id = JSON.parse(user_).id;

    const channel = pusher.subscribe(
      route.params.userType === "patient"
        ? `chat.${user_id}.${route.params.id}`
        : `chat.${route.params.id}.${user_id}`
    );
    channel.bind("App\\Events\\MessageSent", function (data) {
      getMessages();
    });

    return () => {
      pusher.unsubscribe("ChatRoom");
    };
  }

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
        <View style={styles.container}>
          <StatusBar
            backgroundColor="#d8f3dc"
            barStyle="dark-content"
            translucent={false}
          />
          <View
            style={{
              width: windowWidth,
              backgroundColor: "#fff",
              height: windowHeight / 8,
              flexDirection: "row",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                paddingTop: 30,
                alignItems: "center",
                paddingLeft: "5%",
              }}
            >
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <AntDesign
                  style={{ marginRight: 20 }}
                  name="arrowleft"
                  size={18}
                />
              </TouchableOpacity>
              <Text style={{ fontSize: 20 }}>{route.params?.names}</Text>
            </View>
          </View>
          {messages ? (
            messages.length > 0 ? (
              <FlatList
                contentContainerStyle={{
                  paddingBottom: 15,
                  paddingTop: 20,
                }}
                onScrollToIndexFailed={handleScrollToIndexFailed}
                ref={flatListRef}
                data={messages}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => getMessages()}
                  />
                }
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.messageContainer,
                      item.sender.toLowerCase() === route.params.userType
                        ? styles.outgoing
                        : styles.incoming,
                    ]}
                  >
                    {!item.image && (
                      <Text
                        style={{
                          color:
                            item.sender.toLowerCase() === route.params.userType
                              ? "black"
                              : "#000",
                          fontSize: 16,
                        }}
                      >
                        {item.message}
                      </Text>
                    )}
                    {item.image && (
                      <TouchableOpacity onPress={()=>{
                        setSelectedImage(item.image);
                        setShowModal2(true);
                      }}>
                        <Image
                          source={{ uri: item.image }}
                          resizeMode="contain"
                          style={{
                            backgroundColor: "white",
                            marginTop: 5,
                            aspectRatio: 1,
                            width: windowWidth * 0.5, // Adjust the width as per your design
                          }}
                        />
                      </TouchableOpacity>
                    )}
                    <Text
                      style={{
                        color:
                          item.sender.toLowerCase() === route.params.userType
                            ? "black"
                            : "#000",
                        fontSize: 12,
                        marginTop: 4,
                        alignSelf:
                          item.sender.toLowerCase() === route.params.userType
                            ? "flex-end"
                            : "flex-start",
                      }}
                    >
                      {new Date(item.created_at)
                        .toISOString()
                        .slice(0, 19)
                        .replace("T", " ")}
                    </Text>
                  </View>
                )}
              />
            ) : (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <Text>No Messages yet...</Text>
              </View>
            )
          ) : (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
              }}
            >
              <ActivityIndicator size="large" color="black" />
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              multiline={true}
              placeholder={"Type your message..."}
              value={message}
              onChangeText={(text) => {setMessage(text);setImage()}}
            />
            <TouchableOpacity
              onPress={() => {
                setShowModal(true);
              }}
            >
              <View style={styles.sendButton}>
                <FontAwesome6 name="plus" size={14} color="white" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>sendMessage(null)}>
              <View style={styles.sendButton}>
                <Ionicons name="send" size={14} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-evenly" }}
            >
              <TouchableOpacity
                onPress={() => {
                  takePaymentPicture();
                }}
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: windowWidth / 7,
                  width: windowWidth / 7,
                  backgroundColor: "#F3FDEC",
                  borderRadius: windowWidth / 14,
                }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    height: windowWidth / 8,
                    width: windowWidth / 8,
                    backgroundColor: "#E2FAD1",
                    borderRadius: windowWidth / 16,
                  }}
                >
                  <Feather color="#419803" name="camera" size={24} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  pickImage();
                }}
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: windowWidth / 7,
                  width: windowWidth / 7,
                  backgroundColor: "#F3FDEC",
                  borderRadius: windowWidth / 14,
                }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    height: windowWidth / 8,
                    width: windowWidth / 8,
                    backgroundColor: "#E2FAD1",
                    borderRadius: windowWidth / 16,
                  }}
                >
                  <Feather color="#419803" name="image" size={24} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal2}
        onRequestClose={() => setShowModal2(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent,{width:'100%',height:'100%',maxHeight:'100%',backgroundColor:'black',borderRadius:0,justifyContent:'center',alignItems:'center'}]}>
              <View style={{alignItems:'center',justifyContent:'center'}}>
                <Image
                          source={{ uri: selectedImage }}
                          resizeMode="contain"
                          style={{
                            backgroundColor: "white",
                            marginTop: 5,
                            aspectRatio: 1,
                            width: windowWidth, // Adjust the width as per your design
                          }}
                        />
              </View>
              <TouchableOpacity style={{justifyContent:'center',alignItems:'flex-end',marginTop:30}} onPress={()=>setShowModal2(false)}>
                <Text style={{color:'white'}}>Close</Text>
              </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  messageContainer: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 8,
    maxWidth: windowWidth * 0.7,
    marginBottom: 10,
    alignSelf: "flex-start",
    marginHorizontal: 5,
  },
  outgoing: {
    borderTopLeftRadius: 10,
    backgroundColor: "#ECFFF1",
    alignSelf: "flex-end",
  },
  incoming: {
    backgroundColor: "#DDDFE3",
    borderTopRightRadius: 10,
  },
  messageText: {
    color: "white",
    fontSize: 16,
  },
  timestamp1: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  timestamp2: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 40,
    maxHeight: 70,
    paddingHorizontal: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  sendButton: {
    backgroundColor: "#178838",
    borderRadius: 15,
    width: 30,
    height: 30,
    padding: 5,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    width: "90%",
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
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
    borderRadius: 17.5,
    padding: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#C42217",
  },
  confirmButton: {
    backgroundColor: "green",
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

export default ChatRoom;
