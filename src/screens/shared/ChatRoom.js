import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  StatusBar,
  RefreshControl,
} from "react-native";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import Pusher from "pusher-js/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseURL } from "../../BaseUrl";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

const ChatRoom = ({ navigation, route }) => {
  const [refreshing, setRefreshing] = useState();
  const [user, setUser] = useState();
  const [userId, setUserId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [message, setMessage] = useState("");
  const [isScrollDone, setIsScrollDone] = useState(false);
  const [messages, setMessages] = useState([
    // { text: 'Hello Doctor, how are you doing?', id: 1, isOutgoing: true, timestamp: '10:00 AM' },
    // { text: 'Hi there!', id: 2, isOutgoing: false, timestamp: '10:05 AM' },
    // { text: 'How are you?', id: 3, isOutgoing: true, timestamp: '10:10 AM' },
    // { text: 'I am good, thanks!', id: 4, isOutgoing: false, timestamp: '10:15 AM' },
  ]);

  const flatListRef = useRef(null);

  // const markAsRead = async () => {

  //     const token = await AsyncStorage.getItem("token");
  //     const ids = route.params.newChats?.map(el => el.id)
  //     const postObj = JSON.stringify({
  //       "notification_id": ids
  //     })
  //     axios.post(`${baseURL}/api/updateNotificationStatus`,postObj, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`} }).then((res) => {
  //         if(res.data.status){
  //             console.log(res.data.message)
  //         }
  //     }).catch((error) => {
  //         console.log(error)
  //     })
  // }

  const submitMessage = async () => {
    const token = await AsyncStorage.getItem("token");
    const postObj = JSON.stringify({
      user_id: route.params.userType === "patient" ? userId : route.params.id,
      doctor_id: route.params.userType === "patient" ? route.params.id : userId,
      message: message,
      sender: route.params.userType,
    });
    axios
      .post(`${baseURL}/api/chat`, postObj, {
        headers: {
          "Content-Type": "application/json",
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

  const sendMessage = () => {
    if (message.trim() === "") return;
    const newMessage = {
      message: message,
      id: messages.length + 1,
      sender: route.params.userType,
      created_at: new Date(),
    };
    setMessages([...messages, newMessage]);
    setMessage("");
    submitMessage();
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
    const wait = new Promise(resolve => setTimeout(resolve, 0))
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
          setMessages(res.data.data);
          flatListRef.current?.scrollToIndex({
            animated: false,
            index: res.data.data.length - 1, // Scroll to the last item
          })
        }
      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  };

  useEffect(()=>{
    if(messages.length>0){
      const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
        flatListRef.current?.scrollToIndex({
          animated: false,
          index: messages.length - 1, // Scroll to the last item
        })
      });
    }
  },[messages])

  useEffect(async() => {
    getMessages();
    // markAsRead();
    const pusher = new Pusher("57bf264e486af8bb9313", {
      cluster: "mt1",
      encrypted: true,
    });

    const user_ = await AsyncStorage.getItem("user");
    const user_id = JSON.parse(user_).id;

    const channel = pusher.subscribe(route.params.userType === "patient"?`chat.${user_id}.${route.params.id}`:`chat.${route.params.id}.${user_id}`);
    channel.bind("App\\Events\\MessageSent", function (data) {
      getMessages();
    });

    return () => {
      pusher.unsubscribe("ChatRoom");
    };

    
  }, []);

  return (
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
              paddingTop:30,
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
        {messages  ? ( 
          messages.length > 0  ? (
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
            style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
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
            onChangeText={(text) => setMessage(text)}
          />
          <TouchableOpacity onPress={sendMessage}>
            <View style={styles.sendButton}>
              <Ionicons name="send" size={16} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    maxWidth: "70%",
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
    paddingHorizontal: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  sendButton: {
    backgroundColor: "#178838",
    borderRadius: 50,
    width: 40,
    height: 40,
    padding: 10,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatRoom;
