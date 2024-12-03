import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Image
} from "react-native";
import { baseURL } from "../../BaseUrl";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const windowHeight = Dimensions.get('screen').height;
const windowWidth = Dimensions.get('screen').width;

const Hospitals = ({ navigation, index }) => {
  const [refreshing, setRefreshing] = useState();
  const [hospitals, setHospitals] = useState([]);

  const getHospitals = async () => {
    setRefreshing(true);
    const token = await  AsyncStorage.getItem("token");

    axios
      .get(
        `${baseURL}/api/health-facility-branches`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setHospitals(res.data.data)
        setRefreshing(false);

      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  };

  const renderItem = ({item}) => {return(
    <TouchableOpacity
        onPress={()=>navigation.navigate('BookAppointment',{id:item.id,hId:item.health_facility_id})}
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
            width: "90%",
            borderWidth: 1,
            borderColor: '#CEDBED',
            paddingHorizontal: 10,
            height: 68,
            borderRadius: 16,
          }}
        >
          <View  style={{justifyContent:'center',alignItems:'center',width:'15%'}}>
            <View style={{width:windowWidth/9,height:windowWidth/9,borderRadius:windowWidth/18,backgroundColor:'#CBD5E1',justifyContent:'center',alignItems:'center'}}>
            <Image source={require('../../images/health-facility.png')} style={{width:windowWidth/14,height:windowWidth/14}} resizeMode="contain"/>
            </View>
            </View>
          <View style={{ width: "75%" }}>
            <Text
              style={{
                color: "#000",
                fontWeight: 500,
                marginLeft: 20,
              }}
            >
              {item.health_facility_name}
            </Text>
            
            <Text style={{color:'gray',marginLeft:20}}>{item.branch_name || 'N/A'}</Text>
          </View>
          <TouchableOpacity
            onPress={() =>{}}
            style={{
              width: "10%",
              flexDirection: "row",
              height: "60%",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 20,
            }}
          >
            <AntDesign color={"#178838"} style={{marginRight: 5 }} name="arrowright" size={22} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
  )}

  useEffect(() => {
    if(index==2 && hospitals.length==0){
    getHospitals();
    }
  }, [index]);

  

  return (
    <View styles={styles.container}>
      <FlatList
                contentContainerStyle={{
                  paddingBottom: 100,
                }}
                data={hospitals}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => getHospitals()}
                  />
                }
              />
    </View>
  );
};

export default Hospitals;

const styles = StyleSheet.create({
  container: {
    flex:1
  },

});
