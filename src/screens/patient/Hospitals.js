import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Linking
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
        `${baseURL}/api/health-facilities`,
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
               paddingHorizontal:10,
               height: windowHeight / 15,
               borderRadius: 20
             }}
           >
             <View style={{width:"80%"}}>
             <Text
               style={{
                 color: "#000",
                 fontWeight: 500,
                 marginLeft: 20,
               }}
             >
               {item.name}
             </Text>
             </View>
             <TouchableOpacity
               onPress={()=>Linking.openURL(item.domain?item.domain:'https://care360.com')}
               style={{
                 width: "20%",
                 flexDirection:"row",
                 height: "60%",
                 justifyContent: "center",
                 alignItems: "center",
                 borderRadius: 20,
               }}
             >
               <AntDesign color={'#178838'} style={{marginRight:5}} name="arrowright" size={14}/>
               <Text style={{color:'#178838',fontWeight:'bold'}}>View</Text>
             </TouchableOpacity>
           </View>
         </View>
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
