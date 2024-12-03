import React, { useState, useContext, useEffect } from 'react'
import {
    View,
    Text,
    Image,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    RefreshControl,
    Dimensions,
    FlatList
} from "react-native";
import { AuthContext } from '../../context/context';
import axios from 'axios';
import { baseURL } from '../../BaseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {  Ionicons, Feather, Entypo } from '@expo/vector-icons';
import Dropdown from '../shared/Dropdown';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const DocHospitals = ({ navigation,route }) => {
    const context = useContext(AuthContext)
    const [hospitals_, setHospitals_] = useState();
    const [hospitals, setHospitals] = useState();
    const [schedules, setSchedules] = useState();
    const [user, setUser] = useState();
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const toggleDropdown = () => {
        setIsDropdownVisible(!isDropdownVisible);
      };

      const closeDropdown = () => {
        setIsDropdownVisible(false);
      };

      const options = ['Option 1', 'Option 2', 'Option 3'];

    const getHospImg = (hosp) => {
        if(hosp.toLowerCase().includes('military')){
          return require("../../images/rwanda-military.jpg")
        }
        if(hosp.toLowerCase().includes('kibagabaga')){
          return require("../../images/kibagabaga.jpg")
        }
        if(hosp.toLowerCase().includes('faisal')){
          return require("../../images/king-faisal.jpg")
        }
        if(hosp.toLowerCase().includes('chuk')){
          return require("../../images/chuk.jpg")
        }
        else{
            return ""
        }
      }


      const saveDeviceToken = async (profile, deviceToken) => {
        const token = await AsyncStorage.getItem('token')
        const postObj = JSON.stringify({
          fullname: profile.fullname,
          email: profile.email,
          phone: profile.phone,
          date_of_birth: profile.date_of_birth,
          other_info: profile.other_info,
          is_online: "1",
          device_token: deviceToken,
          registration_number: profile.registration_number,
          type: profile.type,
          qualification: profile.qualification,
        });
    
        axios
          .post(`${baseURL}/api/update-user/${profile?.id}`, postObj, {
            headers: { "Content-Type": "application/json", "Authorization":`Bearer ${token}` },
          })
          .then((res) => {
            if (res.data.success == true) {
              console.log("You will receive notifications on this device.");
            }
          })
          .catch((err) => {
            console.log(err);
          });
      };


    const renderItem = ({item}) => {
        return(
            <View style={{ backgroundColor: '#fff', padding: 15, alignSelf: 'center', borderRadius: 10, marginVertical: 5, width: '90%', ...styles.shadow }}>
        <View style={{ flexDirection: 'row' }}>
            <View style={{ width: '75%', justifyContent: "center", marginBottom: 15 }}>
                <Text style={{ fontSize: 16, color: 'black', marginBottom: 5, fontWeight: "bold" }}>{item.hospital_name}</Text>
            </View>
            <View style={{width:'25%', alignItems: "center"}}>
            <Image
              source={
                item.profile_image_url
                  ? { uri: `${baseURL}/${item.profile_image_url}` }
                  : getHospImg(item.hospital_name)
              }
              resizeMode="contain"
              style={{
                backgroundColor: "white",
                marginTop: 5,
                width: "100%", // Adjust the width as per your design
                height: 65, // Adjust the height as per your design
                borderRadius: 50, // Set the borderRadius to half of width/height to create a circle
                overflow: "hidden", // Clip the image to the rounded shape
              }}
            />
            </View>
        </View>
        <View style={{ flexDirection: 'row', }}>
                    <TouchableOpacity onPress={()=> route.params.page=='appointments'? navigation.navigate('Appointments',{hospital_id:item.hospital_id,hospital_name:item.hospital_name}):navigation.navigate('Schedules',{hospital_id:item.hospital_id,hospital_name:item.hospital_name})} style={{ backgroundColor: '#178838', height: 30, alignItems: 'center', justifyContent: "center", borderRadius: 6, marginTop: 5, width: '50%', }}>
                        <Text style={{ marginHorizontal: 10, fontSize: 12, fontWeight: '800', color: '#FFF' }}>My {route.params.page=='appointments'?'appointments':'schedules'}</Text>
                    </TouchableOpacity>
                </View>
    </View>
        )
    }




    const search = (value) => {
        const filteredHospitals = hospitals_.filter(
            hospital => {
                let hospitalToLowercase = hospital.hospital_name.toLowerCase()
                let searchToTermLowercase = value.toLowerCase()
                return hospitalToLowercase.indexOf(searchToTermLowercase) > -1
            }
        )

        setHospitals(filteredHospitals);
    }


    const getUser = async () => {
        const user_ = await AsyncStorage.getItem("user");
        const deviceToken = await AsyncStorage.getItem("deviceToken");
        const userObj = JSON.parse(user_);
        setUser(userObj);
        if (userObj.device_token !== deviceToken || !userObj.device_token) {
          saveDeviceToken(userObj, deviceToken);
        }
      };
 
    const getHospitals = async () => {
        setRefreshing(true)
        const token = await AsyncStorage.getItem('token')
        const user = await AsyncStorage.getItem('user')
        const doctorObj = JSON.parse(user)
        axios.get(`${baseURL}/api/hospital-doctors/${doctorObj.id}`, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }).then((res) => {
            setRefreshing(false)
            if(res.status == 200 || res.status == 201){
                setHospitals(res.data)
            setHospitals_(res.data)
            }else{
                setHospitals([])
            setHospitals_([])
            }
            
            
        }).catch((error) => {
            setRefreshing(false)
            console.log(error)
        })
    }

    useEffect(()=>{
       getHospitals();
       getUser();
    },[])

    return (
        <View style={styles.container}>
            <StatusBar
                backgroundColor="#178838"
                barStyle='dark-content'
                translucent={false}
            />
            <View
        style={{
          width: windowWidth,
          backgroundColor: "#178838",
          height: windowHeight / 8,
          flexDirection: "row",
          marginBottom:5
        }}
      >
        <TouchableOpacity
          style={{
            width: "20%",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
          onPress={() => navigation.goBack()}
        >
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: "#F6B6BC",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather name="chevron-left" size={24} color="#178838" />
          </View>
        </TouchableOpacity>
        <View
          style={{
            width: "70%",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "8%",
          }}
        >
          <Text style={{ color: "white", fontSize: 14, textAlign: "center" }}>
          {route.params.page=='appointments'?'Appointments':'Schedules'}
          </Text>
        </View>
        
      </View>

            
            {/* scrollview info */}
            {hospitals?(
                hospitals.length>0?(
                    <>
                <View style={styles.searchBox}>
                <View style={{ justifyContent: "center", marginHorizontal: 10 }}>
                    <Ionicons name="search" size={24} color="#101319" />
                </View>
                <TextInput
                    placeholder="Search hospital"
                    keyboardType="default"
                    placeholderTextColor="#666666"
                    onChangeText={(value) => { search(value) }}
                    style={[styles.textInput, {
                        color: "black", 
                    }]}
                    autoCapitalize="none"
                />
            </View>
               
            <FlatList
            contentContainerStyle={{
                paddingBottom:15
              }}
                        data={hospitals}
                        showsVerticalScrollIndicator={false}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={() => getHospitals()} />
                        }
                       
                        
                    />
            </>
                ):(
                <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
                    <Text>You are not registered under any Hospital</Text>
                </View>  
                )
                
            ):(
            <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
                <ActivityIndicator size="large" color="black" />
            </View>
            )}
            
            <Dropdown
        navigation={navigation}
        isVisible={isDropdownVisible}
        onClose={closeDropdown}
        options={options}
        onSelect={(option) => setSelectedOption(option)}

      />
        </View >
    )
}
export default DocHospitals;
const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        overflow: 'hidden',
        marginTop: 10
    },
    av: {
        width: 40,
        height: 40,
        borderRadius: 100,
        marginLeft: '10%'
    },
    ci: {
        backgroundColor: '#9ef01a',
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: -5,
        marginTop: 5
    },

    textInput: {
        flex: 1,
        paddingLeft: 10,
        color: '#05375a',
    },
    searchBox: {
        flexDirection: 'row',
        height: 40,
        width: "89%",
        borderWidth: 1,
        borderColor: '#101319',
        paddingBottom: 5,
        borderRadius: 8,
        alignSelf: "center",
        justifyContent: "center"
    },
    counter: {
        position: 'absolute',
        bottom: 5,
        right: 8,
        backgroundColor: "#fff",
        borderRadius: 100,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center'

    },
    openButton: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
        width: '80%',
        maxHeight:'75%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ddd',
        paddingVertical: 5,
    },
    tableCell: {
        flex: 1,
        alignItems: 'center',
    },
    button: {
        marginTop: 10,
    },modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        borderRadius: 10,
        padding: 10,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#178838',
    },
    confirmButton: {
        backgroundColor: '#38a169',
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
    },  

});