import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  Modal,
  Image,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  FlatList
} from "react-native";
import { FontAwesome5, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Utils from "../shared/Utils"
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

const windowWidth = Dimensions.get('window').width

const Map = ({ navigation }) => {

  const [showModal, setShowModal] = useState(true);
  const [showSearchList, setShowSearchList] = useState(true);
  const [places, setPlaces] = useState([]);
  const [places_, setPlaces_] = useState([]);
  const [location, setLocation] = useState(null);
  const [type, setType] = useState("pharmacy");
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchParam,setSearchParam]=useState('')

  const mapRef  = useRef();

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location.coords);
    console.log(location.coords);

    const nearestLocations= await findNearestLocations(location.coords.latitude,location.coords.longitude)

    setTimeout(()=>{
      focusStation(nearestLocations[0].latitude,nearestLocations[0].longitude)
    },2000)

  }

  

  useEffect(() => {
    if(!showModal){
      getLocation();
    }
  }, [showModal]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;  // deg2rad below
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        0.5 - Math.cos(dLat) / 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        (1 - Math.cos(dLon)) / 2;

    return R * 2 * Math.asin(Math.sqrt(a)); // Distance in km
  }

  const showStationInfo = (station)=>{
    Alert.alert(
      station.name,
      `Phone: ${station.phone}`,
      [
        {text: 'OK', onPress: () => console.log('OK Pressed')}
      ],
      { cancelable: false }
    );
  }

  const search = (value) => {
    const myPlaces = places_.filter((place) => {
      let placeToLowercase = (
        place.displayName.text
      ).toLowerCase();
      let searchToTermLowercase = value.toLowerCase();
      return placeToLowercase.indexOf(searchToTermLowercase) > -1;
    });

    setPlaces(myPlaces);
  };

  const getDirection = (location,placeName) => {
      Linking.openURL(`https://www.google.com/maps?q=${location.latitude},${location.longitude}(${encodeURIComponent(placeName)})`);
  };

  const findNearestLocations = async(lat,long) => {
    const data = {
      "includedTypes": [type],
  "maxResultCount": 10,
  "locationRestriction": {
    "circle": {
      "center": {
        "latitude": lat,
        "longitude": long},
      "radius": 5000
    }
  }
    }
    console.log(data)
    const nearPlaces = await Utils.getPlaces(data)
    setPlaces(nearPlaces.data.places)
    setPlaces_(nearPlaces.data.places)
    const locationsWithDistance = nearPlaces.data.places.length>0? nearPlaces.data.places.map(place => {
        const distance = calculateDistance(
            lat,
            long,
            place.location.latitude,
            place.location.longitude
        );
        return { ...place.location, distance };
    }):[];

    // Sort locations by distance in ascending order
    return locationsWithDistance.sort((a, b) => a.distance - b.distance);
  };

  const focusStation = (lat,long) => {
      const station = {
        latitude: lat,
        longitude: long,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }
      mapRef.current?.animateCamera({center:station,zoom:18},{duration:6000});
  }


  return (
    <TouchableOpacity activeOpacity={1} onPress={()=>setShowSearchList(false)} styles={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent={false}
      />
      <View style={{width:'100%',height:'100%',backgroundColor:'#212529',flexDirection:'row'}}>
        <View style={{width:'30%'}}>
        {places.length>0&&(
          <FlatList
          data={places}
          renderItem={({item, index}) => {
            return (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => {setShowSearchList(false);focusStation(item.location.latitude,item.location.longitude)}}>
                <Text>{item.displayName.text}</Text>
              </TouchableOpacity>
            );
          }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          style={styles.searchResultsContainer}
          contentContainerStyle={{paddingBottom:100}}  
      />
        )}
        </View>
        <View style={{width:'70%',justifyContent:'center',alignItems:'center'}}>
          {location?
             <>
            <MapView
            initialRegion={{
               latitude: location.latitude,
               longitude: location.longitude,
               latitudeDelta: 0.1,
               longitudeDelta: 0.1,
             }} 
             maxZoomLevel={18}
             provider={PROVIDER_GOOGLE} 
             style={styles.map}
             ref={mapRef}
             showsUserLocation
             showsMyLocationButton
             >
                 {places_?.map((place,index)=>(
                     <Marker key={index} coordinate={place.location}>
                       <View style={{justifyContent:'center',alignItems:'center',width:100}}>
                          <Text style={{color:'red'}}>{place.displayName.text}</Text>
                          <Image source={require('../../images/location.png')} style={{width:50,height:50}}/>
                        </View>
                        <Callout  onPress={()=>getDirection(place.location,place.displayName.text)}>
                          <View>
                            <Text>Get Direction</Text>
                            {/* Add more information or actions related to the station */}
                          </View>
                        </Callout>
                     </Marker>
                 ))}
             </MapView>
             </>
            
             :
             <View>
                 <ActivityIndicator color='white' size={'large'}/>
             </View>
        }
        </View>
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
 
        

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={{width:'100%',alignItems:'center',justifyContent:'center',marginBottom:10}}>
            <FontAwesome6 name="map-location-dot" size={30} color="#157A32" />
            </View>
            <Text style={styles.modalTitle}>Choose what to search on the Map</Text>
           
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {setType("hospital");setShowModal(false)}}
              >
                <Text style={{ fontWeight: "500", color: "black" }}>Health Facilities</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton2, styles.confirmButton]}
                onPress={() => {setType("pharmacy");setShowModal(false)}}
              >
                <Text style={styles.modalButtonText}>
                  Pharmacies
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
    </TouchableOpacity>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: {
    flex:1
  },
  map: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 999, // Make sure the back button is above the map
  },
  modalButtonText: {
    color: "black",
    fontWeight: "500",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButton: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    height: 40,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButton2: {
    marginTop:5,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    height: 40,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#FBF9F1",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: "600",
    textAlign:'center',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  confirmButton: {
    backgroundColor: "#95d5b2",
  },
  searchBox: {
    height: 40,
    fontSize: 16,
    borderRadius: 8,
    borderColor: '#aaa',
    color: '#000',
    backgroundColor: '#fff',
    borderWidth: 0.5,
    paddingLeft: 15,
  },
  searchResultsContainer: {
    paddingTop:80,
    paddingRight:10,
    height: '100%',
    backgroundColor: '#fff',
    borderColor: '#aaa',
    borderWidth: 0.5,
},
resultItem: {
  width: '100%',
  justifyContent: 'center',
  paddingVertical:10,
  borderBottomColor: '#ccc',
  borderBottomWidth: 1,
  paddingLeft: 15,
},
});
