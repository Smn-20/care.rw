import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Modal
} from "react-native";
import { FontAwesome5, FontAwesome, MaterialIcons, MaterialCommunityIcons, Feather, Ionicons, EvilIcons, FontAwesome6 } from '@expo/vector-icons';
import { Agenda } from 'react-native-calendars'
import { Card } from 'react-native-paper';
import { baseURL } from "../../BaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';

const Calendar = ({navigation,route}) => {
    const [traces, setTraces] = useState([])
    const [items, setItems] = useState({})
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [currentDate, setCurrentDate] = useState("")
    const [time, setTime] = useState("")

    const data1 = [
        { time: '07:00', date: null },
    ];
    const data2 = [
        { time: '07:00', date: null },
        { time: '14:00', date: null },
    ];
    const data3 = [
        { time: '07:00', date: null },
        { time: '14:00', date: null },
        { time: '21:00', date: null },
    ];
    const data4 = [
        { time: '07:00', date: null },
        { time: '12:00', date: null },
        { time: '17:00', date: null },
        { time: '22:00', date: null },
    ];
    const data5 = [
        { time: '07:00', date: null },
        { time: '11:00', date: null },
        { time: '15:00', date: null },
        { time: '19:00', date: null },
        { time: '23:00', date: null },
    ];

    const isDateBetween = (randomDateStr, startDateStr, endDateStr) => {
        // Convert strings to Date objects
        const randomDate = new Date(randomDateStr);
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        
        // Check if randomDate is between startDate and endDate
        return randomDate >= startDate && randomDate <= endDate;
    }

    const markAs = async (status) => {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");
        const postObj = JSON.stringify({
            prescription_id: route.params.id,
            date: currentDate,
            time: time,
            status: status
        });
    
        axios
        .post(`${baseURL}/api/dosage-trackers`, postObj, {
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
        })
        .then((res) => {
            setLoading(false);
            if (res.data.status) {
            setShowModal(false);
            alert("Status successfully updated!");
            setItems({})
            getTraces(new Date(currentDate)).then(() => {
                loadItems(new Date(currentDate));
              }).catch(err=>{
                loadItems(new Date(currentDate));
              });
            } else {
            alert("Something went wrong!");
            }
        })
        .catch((error) => {
            setLoading(false);
            alert(error.message);
        });
      };

      const getTraces = async (day) => {
        const dateString = day.dateString || day.toISOString().slice(0, 10);
        const token = await AsyncStorage.getItem("token");
      
        return axios
          .get(`${baseURL}/api/dosage-trackers?prescription_id=${route.params.id}&date=${dateString}`, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          })
          .then((res) => {
            setTraces(res.data.data);
            console.log(res.data.data);
          })
          .catch((error) => {
            console.log(error);
          });
      };
      
      const loadItems = (day) => {
        const dateString = day.dateString || day.toISOString().slice(0, 10);
        setCurrentDate(dateString);
      
        if (isDateBetween(dateString, route.params.start, route.params.end)) {
          let filteredItems;
          switch (route.params.times) {
            case 1:
              filteredItems = (route.params.hours?.split(',').map(h => ({ time: h, date: null })) || data1).map(el => ({ ...el, date: dateString }));
              break;
            case 2:
              filteredItems = (route.params.hours?.split(',').map(h => ({ time: h, date: null })) || data2).map(el => ({ ...el, date: dateString }));
              break;
            case 3:
              filteredItems = (route.params.hours?.split(',').map(h => ({ time: h, date: null })) || data3).map(el => ({ ...el, date: dateString }));
              break;
            case 4:
              filteredItems = (route.params.hours?.split(',').map(h => ({ time: h, date: null })) || data4).map(el => ({ ...el, date: dateString }));
              break;
            case 5:
              filteredItems = (route.params.hours?.split(',').map(h => ({ time: h, date: null })) || data5).map(el => ({ ...el, date: dateString }));
              break;
            default:
              break;
          }
      
          const formattedItems = {};
          formattedItems[dateString] = filteredItems;
      
          setItems(formattedItems);
        } else {
          const formattedItems = {};
          formattedItems[dateString] = [];
          setItems(formattedItems);
        }
      };

    const renderItem = (item) => {
        return (
            <TouchableOpacity style={{ marginRight: 10, marginTop: 30 }}>
                <Text style={{marginBottom:10,fontWeight:'bold'}}>{item.time}</Text>
                <Card>
                    <Card.Content style={{backgroundColor:'#EBFAFA',borderRadius:10}}>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                            <View style={{width:"13%",justifyContent:'center',alignItems:'center'}}>
                                <FontAwesome5 name="clock" size={25}/>
                            </View>
                            <View style={{width:"60%",marginRight:'2%'}}>
                                <Text style={{fontSize:14,fontWeight:'bold',color:'#6E6E72'}}>{route.params.medicineName}</Text>
                                <Text style={{fontSize:13,color:'#6E6E72'}}>{route.params.instructions?route.params.instructions:'No instruction...'}</Text>
                            </View>
                            <View style={{width:"25%"}}>
                                {traces.some(trace => trace.date === currentDate && trace.time == item.time+":00") ? 
                                (
                                    <Text style={{
                                        fontWeight:'bold',
                                        color: traces.find(trace => trace.date === currentDate && trace.time === item.time+":00")?.status === 'taken'?'green':'red'
                                    }}>{traces.find(trace => trace.date === currentDate && trace.time === item.time+":00")?.status}</Text>
                                )
                               :(<TouchableOpacity onPress={()=>{setShowModal(true);setTime(item.time+":00")}} style={{paddingVertical:4,paddingHorizontal:3,borderRadius:5,height:30,borderWidth:0.3,borderColor:'gray',justifyContent:'center',alignItems:'center'}}>
                                <Text style={{fontSize:12}}>Mark As</Text>
                            </TouchableOpacity>)}
                            </View>
                        </View>
                    </Card.Content>
                </Card>
                <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          <TouchableOpacity onPress={()=>setShowModal(false)} style={{width:30,height:30,borderRadius:15,backgroundColor:'white',justifyContent:'center',alignSelf:'flex-end',alignItems:"center",...styles.shadow}}>
              <Ionicons name="close" size={20}/>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Did you take this medicine?</Text>
           
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {markAs('taken');setShowModal(false)}}
              >
                <Text style={{ fontWeight: "500", color: "black" }}>Taken</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton2}
                onPress={() => {markAs('skipped');setShowModal(false)}}
              >
                <Text style={{fontWeight:500,color:'red'}}>
                  Skipped
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
            </TouchableOpacity>
        );
    };

    const renderEmptyDate = () => {
        return (
            <View style={{ flex: 1, paddingLeft:30, justifyContent: 'center',backgroundColor:'white',borderRadius:20,marginTop:20,marginRight:20 }}>
                <Text>Nothing on this day</Text>
            </View>
        );
    };

    useEffect(()=>{
        
      setTimeout(()=>{
        getTraces(new Date()).then(() => {
          loadItems(new Date());
        }).catch(err=>{
          loadItems(new Date());
        });
      },3000)
        
    },[])

    return (
        <View style={{ flex: 1 }}>
            <View style={{ backgroundColor: '#E7FAE6', justifyContent: "center", alignItems: "center", height: "12%", width: '100%' }}>

                <View style={{ flexDirection: "row", marginTop: 20 }}>
                    <TouchableOpacity style={{ width: '20%', justifyContent: 'center', alignItems: 'center' }} onPress={() => navigation.goBack()}>
                        <View style={{ width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' }}>
                            <Feather name="chevron-left" size={24} color="#000" />
                        </View>
                    </TouchableOpacity>
                    <View style={{ width: '60%', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold', color: "black"}}>{route.params.medicineName}</Text>
                    </View>
                    <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center' }}>
                    </View>
                </View>
            </View>
            <Agenda
                items={items}
                theme={{selectedDayBackgroundColor: '#178838',calendarBackground:'#fff'}}
                selected={new Date().toISOString().split('T')[0]}
                onDayPress={day=>{
                    setItems({})
                    setTimeout(()=>{
                        getTraces(day).then(() => {
                            loadItems(day);
                          }).catch(err=>{
                            loadItems(day);
                          });
                    },1000)
                }}
                renderItem={renderItem}
                renderEmptyDate={renderEmptyDate}
            />


        </View>
    )
}

export default Calendar;

const styles = StyleSheet.create({
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
        backgroundColor:'#F5D1D3',
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
})