import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Bookings from "./Bookings";
import Purchases from "./Purchases";
import Subscriptions from "./Subscriptions";
import { AntDesign } from "@expo/vector-icons";



const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;
const Report = ({ navigation }) => {
  const [user, setUser] = useState();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'first', title: 'Purchases' },
    { key: 'second', title: 'Subscriptions' },
    { key: 'third', title: 'Bookings' },
  ]);

  const PurchasesRoute = () => (
    <Purchases navigation={navigation} index={index}/>
  );
  
  const BookingsRoute = () => (
    <Bookings navigation={navigation} index={index}/>
  );

  const SubscriptionsRoute = () => (
    <Subscriptions navigation={navigation} index={index}/>
  );
  
  
  const renderScene = SceneMap({
    first: PurchasesRoute,
    second: SubscriptionsRoute,
    third: BookingsRoute,
  });



  return (
    <View styles={styles.container}>
      <StatusBar
        backgroundColor="#fff"
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
            <Text style={{ fontSize: 20 }}>Reports</Text>
          </View>
      </View>

      <View style={{ height: (windowHeight * 7) / 8,backgroundColor:'#FBF9F1' }}>

        

        

        <View style={{width:"100%",backgroundColor:"white",height:"100%"}}>
        <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      renderTabBar={props => {
        return (
          <TabBar
            {...props}
            renderLabel={({ focused, route }) => {
              return (
                <View style={{width:windowWidth/3.5, borderWidth:0.3,borderColor:'gray',paddingVertical:6,borderRadius:15,backgroundColor:focused?'#2FAB4F':'transparent',alignItems:'center'}}>
                <Text style={{color:focused?'white':'black',fontSize:12,fontWeight:'500'}}>{route.title}</Text>
                </View>
              );
            }}
            indicatorStyle={styles.indicatorStyle}
            style={styles.tabBar}
          />
        );
      }}
      initialLayout={{ width: windowWidth }}
    />
        </View>

      </View>

    </View>
  );
};

export default Report;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shadow: {
    shadowColor: "#707070",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.65,
    elevation: 8,
  },
  searchBox: {
    flexDirection: "row",
    backgroundColor: "#DEDBCE",
    height: 40,
    marginTop: 10,
    width: "90%",
    borderRadius: 20,
    alignSelf: "center",
    alignItems: "center",
  },
  popupContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popupText: {
    fontSize: 20,
    color: "white",
    marginBottom: 20,
  },
  popupLink: {
    fontSize: 16,
    color: "#178838",
    marginBottom: 10,
  },
  popupCloseButton: {
    fontSize: 16,
    color: "white",
  },
  modalContent: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
    elevation: 5,
    width: "90%"
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  tabBar:{
    backgroundColor:"#E7FAE6"
  },
  indicatorStyle:{
    backgroundColor:'#E7FAE6',
    height:3,
    borderTopLeftRadius:2,
    borderTopRightRadius:2,
  }
});
