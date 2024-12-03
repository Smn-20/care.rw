import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  FlatList,
  RefreshControl,
  Dimensions,
  Platform,
  LogBox,
  Modal,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseURL } from "../../BaseUrl";
import axios from "axios";
import { AuthContext } from "../../context/context";
import { MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";
import BottomNavigator from "../../components/BottomNavigator";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;
const Chats = ({ navigation,route }) => {
  const [activePanel, setActivePanel] = useState('all');
  const [chats, setChats] = useState();
  const [newChats, setNewChats] = useState([]);
  const [chats_, setChats_] = useState([]);
  const [searchValue, setSearchValue] = useState("");
 
  const [user, setUser] = useState();
  const [refreshing, setRefreshing] = useState();

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    return `${hours}:${minutes} ${day}/${month}`;
}


  const getNotifications = async () => {
    const token = await AsyncStorage.getItem("token");
    const user_ = await AsyncStorage.getItem("user");

    axios
      .get(
        `${baseURL}/api/notifications/${JSON.parse(user_).id}/${JSON.parse(
          user_
        ).type.toLowerCase()}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.data.length > 0) {
          const chatNotifications = res.data.filter((el) => el.type === "chat");

          setNewChats(chatNotifications);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  

  const search = (value) => {
        const filteredChats = chats_.filter((chat) => {
      let chatToLowercase = (chat.first_name+" "+chat.last_name)?.toLowerCase()
      let searchToTermLowercase = value.toLowerCase()
      return chatToLowercase.indexOf(searchToTermLowercase) > -1;
    });
    setChats(filteredChats);
    
    
  };

  const getChats = async () => {
    const token = await AsyncStorage.getItem("token");
    const user_ = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user_)
    setUser(userObj)
        axios
      .get(`${baseURL}/api/chat/patient-profile/${userObj.id}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      .then((res) => {
        setRefreshing(false);
        if (res.data.status) {
          console.log(res.data.data);
          setChats(res.data.data);
          setChats_(res.data.data);
        } else {
          setChats([]);
          setChats_([]);
        }
      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  }

  const renderItem = ({item}) => {
    return(
      <TouchableOpacity
      onPress={() => {
        navigation.navigate("ChatRoom",{names:`${item.first_name} ${item.last_name}`,id:item.id, userType:'doctor', newChats:item.unread_messages})
      }}
      style={{
        flexDirection: "row",
        paddingVertical: 8,
        paddingHorizontal:5,
        alignSelf: "center",
        width: "100%",
      }}
    >
      <View style={{width:"13%",alignItems:"center"}}>
      <Image
              source={item.profile_image?{uri:`${item.profile_image}`}:require("../../images/user1.png")}
              resizeMode="stretch"
              style={{
                  marginTop:5,
                  width: 40, // Adjust the width as per your design
                  height: 40, // Adjust the height as per your design
                  borderRadius: 50, // Set the borderRadius to half of width/height to create a circle
                  overflow: "hidden", // Clip the image to the rounded shape
              }}
              />
      </View>
      <View
        style={{
          width: "87%",
          justifyContent: "center",
          padding: 5,
        }}
      >
        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
        <View style={{width:'70%'}}>
          <Text
            style={{
              fontSize: 14,
              color: "black",
              fontWeight: "bold",
            }}
          >
            {item?.first_name} {item?.last_name}
          </Text>
        </View>
        <View style={{width:'27%',justifyContent:'center',alignItems:'center'}}>
          <Text style={{color:'gray',fontSize:10}}>{formatTime(new Date(item.latest_message_time))}</Text>
        </View>
        </View>
        <View style={{flexDirection:'row',marginTop:3}}>
          <View style={{width:'90%'}}>
            <Text style={{fontSize:14,color:'gray'}}>{item.latest_message.slice(0,30)}  {item.latest_message.length>30&&'...'}</Text>
          </View>
          {item.unread_messages.length>0&&(
            <View>
            <View style={{height:20,width:20,borderRadius:10,backgroundColor:'#2FAB4F',justifyContent:'center',alignItems:'center'}}>
              <Text style={{color:'white',fontSize:10,fontWeight:'500'}}>{item.unread_messages.length||0}</Text>
            </View>
          </View>
          )}
        </View>
         
      </View>
      {/* <View style={{width:'7%',justifyContent:'center'}}>
        {getChatNotifications(item).length>0&&(
           <View
           style={{
             width: 18,
             height: 18,
             borderRadius: 10,
             alignItems: "center",
             alignSelf: "center",
             backgroundColor: "red",
           }}
         >
           <Text style={{ color: "white",fontSize:12 }}>{getChatNotifications(item).length}</Text>
         </View>
        )}
     
      </View> */}
      {/* <View
        style={{
          width: "20%",
          justifyContent: "center",
          padding: 5,
        }}
      >
       {item.is_online==="1"&&(
                  <View style={{backgroundColor:"green",paddingVertical:2,paddingHorizontal:8,borderRadius:5}}>
                  <Text style={{color:'white',fontSize:12}}>Online</Text>
              </View>
              )}
      </View> */}
    </TouchableOpacity>
    )
  }

  
  useEffect(() => {
    getChats();
    getNotifications();
    const focusHandler = navigation.addListener("focus", () => {
      getChats();
      getNotifications();
    });
    return focusHandler;
  }, [navigation]);

  useEffect(() => {
    search(searchValue);
  }, [activePanel]);

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#178838"
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
          underlayColor="transparent"
          style={{
            width: "90%",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingLeft: 25,
            marginTop: "8%",
          }}
        >
          <Image
            source={require("../../images/logo.png")}
            style={{ width: 100 }}
            resizeMode="contain"
          />
        </View>

        <View
          style={{
            width: 40,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            marginTop: "8%",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Profile");
            }}
          >
            <Feather name="settings" size={20} />
          </TouchableOpacity>
        </View>
      </View>
      {chats ? (
        <>
           
          <View style={styles.searchBox}>
            <View style={{ justifyContent: "center", marginHorizontal: 10 }}>
              <Ionicons name="search" size={24} color="#101319" />
            </View>
            <TextInput
              placeholder="Search"
              keyboardType="default"
              placeholderTextColor="#666666"
              onChangeText={(value) => {
                search(value);
                setSearchValue(value);
              }}
              style={[
                styles.textInput,
                {
                  color: "black",
                  justifyContent: "center",
                },
              ]}
              autoCapitalize="none"
            />
          </View>
          {/* scrollview info */}
            {chats.length > 0 ? (
              <FlatList
              contentContainerStyle={{
                paddingBottom:15,
                marginTop:10
              }}
              data={chats}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={() => {
                    if(activePanel==="all"){
                      getChats()
                    }else{ getMyChats()}
                  }} />
              }
             
              
          />
            ) : (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                  marginTop: 100,
                }}
              >
                <Text>No Chat yet...</Text>
              </View>
            )}

    
         
        </>
      ) : (
        <View
          style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
        >
          <ActivityIndicator size="large" color="black" />
        </View>
      )}
      <BottomNavigator navigation={navigation} userRole={user?.user_type} />
    </View>
  );
};
export default Chats;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'white'
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
    marginTop:20,
    flexDirection: "row",
    backgroundColor:'white',
    height: 40,
    width: "90%",
    borderRadius: 8,
    alignSelf: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 1,

    elevation: 1,
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
});
