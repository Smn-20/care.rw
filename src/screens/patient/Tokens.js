import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Dimensions,
} from "react-native";
import {
  MaterialIcons,
  AntDesign,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseURL } from "../../BaseUrl";
import BottomNavigator from "../../components/BottomNavigator";

const windowHeight = Dimensions.get("window").height;

const Tokens = ({ navigation, route }) => {
  const [tokens, setTokens] = useState([]);
  const [tokens_, setTokens_] = useState([]);
  const [refreshing, setRefreshing] = useState();
  const [user, setUser] = useState();


  const search = (value) => {
    const filteredTokens = tokens_.filter((token) => {
      let tokenToLowercase = (
        token.token
      ).toLowerCase();
      let searchToTermLowercase = value.toLowerCase();
      return tokenToLowercase.indexOf(searchToTermLowercase) > -1;
    });
    setTokens(filteredTokens);
  }


  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={()=>navigation.navigate('TokenDetails',{token:item.token,doctor:item?.doctor.names,dates:item.created_at?.slice(0,10)})}
        style={{
          backgroundColor: "#F3F5F7",
          padding: 15,
          alignSelf: "center",
          borderRadius: 10,
          marginTop: 10,
          width: "100%",
          marginBottom: 10,
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
              width: "20%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <View style={{width:50,height:50,justifyContent:'center',alignItems:'center'}}>
              <MaterialIcons name="token" size={30}/>
            </View>
          </View>

          <View
            style={{
              width: "65%",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black", fontWeight:'bold' }}>{item.doctor?.names}</Text>
            <Text style={{ fontSize: 12, color: "black", marginTop:5 }}> {item.created_at.slice(0,10)} | Token: {item.token}</Text>
          </View>

          <View
            style={{
              width: "15%",
              justifyContent: "center",
              alignItems: "flex-end",
            }}
          >
            <AntDesign name="arrowright" size={20}/>
          </View>
        </View>

      </TouchableOpacity>
    );
  };

  const getTokens = async () => {
    setRefreshing(true);
    const token = await  AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user);
    setUser(userObj)
    axios
      .get(
        `${baseURL}/api/prescriptions/tokens/${userObj.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setTokens(res.data.data)
        setTokens_(res.data.data)
        setRefreshing(false);

      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  };

  useEffect(() => {
    getTokens();
  }, [])
  

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          backgroundColor: "#E8F3EB",
          justifyContent: "center",
          alignItems: "center",
          height: windowHeight * 0.12,
          width: "100%",
          paddingHorizontal: 15,
        }}
      >
        <View style={{ flexDirection: "row", marginTop: 30 }}>
          <Text style={{ textAlign: "center" }}>
            Token is a away to receive a one time digital prescriptions
          </Text>
        </View>
      </View>

      <View style={{ height: windowHeight * 0.88, backgroundColor: "white" }}>
        <View style={{ width: "90%", alignSelf: "center", marginTop: 10 }}>
          <Text
            style={{
              alignSelf: "flex-start",
              marginTop: 15,
              fontWeight: "500",
            }}
          >
            Search Token
          </Text>
          <TextInput
            placeholderTextColor={"#626262"}
            placeholder="search token..."
            onChangeText={(text) => search(text)}
            style={[
              {
                fontSize: 14,
                paddingLeft: 20,
                backgroundColor: "#fff",
                borderRadius: 10,
                borderWidth: 0.3,
                borderColor: "black",
                marginVertical: 5,
                width: "100%",
                height: 40,
              },
            ]}
          />

          <Text
            style={{
              alignSelf: "flex-start",
              fontWeight: "500",
              color: "gray",
            }}
          >
            Use the code sent in your sms
          </Text>

          <View style={{width:'100%',paddingVertical:20,borderBottomColor:'gray',borderBottomWidth:0.3}}>
            <Text style={{fontSize:18,fontWeight:'500',color:'#495057'}}>My Tokens</Text>
          </View>

          {tokens ? (
        <View style={{ paddingBottom: windowHeight / 6 }}>
          {tokens.length > 0 ? (
            <FlatList
              contentContainerStyle={{
                paddingBottom: 15,
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
                justifyContent: "center",
                alignItems: "center",
                marginTop: 100,
              }}
            >
              <Text style={{fontSize:18,fontWeight:'500'}}>No Token Added yet</Text>
              <Text style={{fontSize:14,color:'gray',marginTop:15}}>Search to view your token</Text>
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

        </View>
      </View>

      <BottomNavigator navigation={navigation} userRole={user?.user_type}/>
    </View>
  );
};

export default Tokens;
