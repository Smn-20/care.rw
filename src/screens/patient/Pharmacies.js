import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { baseURL } from "../../BaseUrl";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const windowHeight = Dimensions.get("screen").height;
const windowWidth = Dimensions.get("screen").width;

const Pharmacies = ({ navigation, index }) => {
  const [refreshing, setRefreshing] = useState();
  const [pharmacies, setPharmacies] = useState([]);

  const getPharmacies = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");

    axios
      .get(`${baseURL}/api/pharmacy-branches`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setPharmacies(res.data.data);
        setRefreshing(false);
      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  };

  const renderItem = ({ item }) => {
    return (
      <View
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
            backgroundColor: "#F1F5F9",
            width: "90%",
            paddingHorizontal: 10,
            height: windowHeight / 15,
            borderRadius: 20,
          }}
        >
          <View  style={{justifyContent:'center',alignItems:'center',width:'15%'}}>
            <View style={{width:windowWidth/9,height:windowWidth/9,borderRadius:windowWidth/18,backgroundColor:'#CBD5E1',justifyContent:'center',alignItems:'center'}}>
            <Image source={require('../../images/pharmacy2.png')} style={{width:windowWidth/14,height:windowWidth/14}} resizeMode="contain"/>
            </View>
            </View>
          <View style={{ width: "65%" }}>
            <Text
              style={{
                color: "#000",
                fontWeight: 500,
                marginLeft: 20,
              }}
            >
              {item.branch_name}
            </Text>
            
            <Text style={{color:item.status==="open"?'green':'red',marginLeft:20}}>{item.status}</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("PharmacyDetails", {
                name: item.branch_name,
                id: item.id,
                link: item.link,
                phone: item.phone,
                image: item.image,
                status: item.status
              })
            }
            style={{
              width: "20%",
              flexDirection: "row",
              height: "60%",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 20,
            }}
          >
            <AntDesign color={"#178838"} style={{marginRight: 5 }} name="arrowright" size={14} />
            <Text style={{ color: "#178838",fontWeight:'bold' }}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  useEffect(() => {
    if (index == 1 && pharmacies.length == 0) {
      getPharmacies();
    }
  }, [index]);

  return (
    <View styles={styles.container}>
      <FlatList
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        data={pharmacies}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => getPharmacies()}
          />
        }
      />
    </View>
  );
};

export default Pharmacies;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
