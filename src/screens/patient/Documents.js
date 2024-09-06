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
import { Feather, EvilIcons, AntDesign } from "@expo/vector-icons";
import axios from "axios";
import * as FileSystem from 'expo-file-system';
import BottomNavigator from "../../components/BottomNavigator";
import { shareAsync } from "expo-sharing";

const windowHeight = Dimensions.get("window").height;
const Documents = ({ navigation }) => {
  const [docs, setDocs] = useState([]);
  const [user, setUser] = useState();

  const [refreshing, setRefreshing] = useState();

  const downloadFromUrl = async(fileName) =>{
    console.log(`http://188.166.16.179/api/documents/download/${fileName}`)
    const result = await FileSystem.downloadAsync(
      `http://188.166.16.179/api/documents/download/${fileName}`,
      FileSystem.documentDirectory + fileName
    )
    console.log(result)
    save(result.uri)
  }

  const save = (uri) => {
    shareAsync(uri)
  }

  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          backgroundColor: "#fff",
          padding: 15,
          alignSelf: "center",
          borderRadius: 10,
          borderColor:'black',
          borderWidth:0.3,
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
            <View style={{borderWidth:0.5,borderRadius:10,width:50,height:50,backgroundColor:'#ECFFF1',justifyContent:'center',alignItems:'center'}}>
              <AntDesign name="filetext1" size={30}/>
            </View>
          </View>

          <View
            style={{
              width: "63%",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black", fontWeight:'bold' }}>{item.branch?.branch_name}</Text>
            <Text style={{ fontSize: 12, color: "black", marginTop:5 }}> {item.created_at.slice(0,10)} </Text>
          </View>

          <TouchableOpacity
            onPress={()=>downloadFromUrl(item.document.split('/')[1])}
            style={{
              width: "15%",
              justifyContent: "center",
              alignItems: "flex-end",
            }}
          >
            <Feather name="download" size={20}/>
          </TouchableOpacity>
        </View>

      </View>
    );
  };

  const getDocuments = async () => {
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);
    const token = await AsyncStorage.getItem("token");
    setUser(userObj)
    axios
      .get(`${baseURL}/api/documents/user/${userObj.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setDocs(res.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };



  useEffect(() => {
    getDocuments();
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
            onPress={() => navigation.goBack()}
          ></View>
          <View
            style={{
              width: "60%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "bold", color: "black" }}>My Documents</Text>
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

      {/* scrollview info */}
      {docs ? (
        <View style={{ paddingBottom: windowHeight / 6 }}>
          {docs.length > 0 ? (
            <FlatList
              contentContainerStyle={{
                paddingBottom: 15,
              }}
              data={docs}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => getDocuments()}
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
    backgroundColor:'white'
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

export default Documents;
