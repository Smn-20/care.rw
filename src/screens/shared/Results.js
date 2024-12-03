import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView
} from "react-native";
import * as Print from 'expo-print';
import { MaterialIcons, Feather, AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../../BaseUrl';
import { shareAsync } from 'expo-sharing';
import { AuthContext } from '../../context/context';
import { Picker } from '@react-native-picker/picker';
import { Dropdown } from 'react-native-element-dropdown';


const Results = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [expanded1, setExpanded1] = useState(false);
  const [expanded2, setExpanded2] = useState(false);
  const [expanded3, setExpanded3] = useState(false);
  const [expanded4, setExpanded4] = useState(false);
  const [expanded5, setExpanded5] = useState(false);
  const [labResults, setLabResults] = useState([]);
  const [patientInfo, setPatientInfo] = useState();
  const [userObj, setUserObj] = useState();
  const [diagnoses, setDiagnoses] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [imaging, setImaging] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState('labResult');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hospital, setHospital] = useState('');
  const [comment, setComment] = useState('');


  const options = [
    { label: 'Lab Result', value: 'labResults' },
    { label: 'Diagnose', value: 'diagnoses' },
    { label: 'Prescription', value: 'prescriptions' },
  ]

  const hospital_name = route.params.hospital_name
  const generatePdf = async (result) => {


    const base64 = "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"


    const htmlContent = `
    <html>
    <body>
    <img width="400px" height="100px" src="data:image/png;base64,${base64}"/>
    <h1>${result.title}</h1>
    <h3>Results uploaded on: ${result.date}</h3>
    <h3>Patient: ${result.patient_name}</h3>
    <h3>Doctor: ${result.doctor_name}</h3>
    <h3>Doctor Reg.number: ${result.doctor_registration_number}</h3>
    <h3>Doctor Qualification: ${result.doctor_qualification}</h3>
    <h3>Hospital: ${result.hospital}</h3>
    <h3>Content: ${result.content}</h3>
    <h3>Comment: ${result.comment}</h3>
    </body>
    </html>
    `;
    
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  };

  

  useEffect( () => {

    fetchLabResultsData();
  }, []);

  const fetchLabResultsData = async () => {
    const user = await AsyncStorage.getItem('user')
    const token = await AsyncStorage.getItem('token');
    setUserObj(JSON.parse(user))
      let id;
      const patientId = route.params.patient_id
      const patient_info = route.params.patientInfo
      if(patient_info){
        setPatientInfo(JSON.parse(patient_info))
      }
      if (patientId) {
        id = patientId
      } else {
        id = JSON.parse(user).id
      }
      const response = await axios.get(
        `${baseURL}/api/lab_results/${route.params.hospital_id}/${id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.status) {
        setLabResults(response.data.message);
      }
      fetchDiagnosesData()
    
  };

  const fetchDiagnosesData = async () => {
    try {
      const user = await AsyncStorage.getItem('user')
      const token = await AsyncStorage.getItem('token');
      let id;
      const patientId = route.params.patient_id
      if (patientId) {
        id = patientId
      } else {
        id = JSON.parse(user).id
      }
      const response = await axios.get(
        `${baseURL}/api/diagnoses/${route.params.hospital_id}/${id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      if (response.data.status) {
        setDiagnoses(response.data.message);
      }
      fetchPrescriptionsData();
    } catch (error) {
      console.error('Error fetching diagnoses data:', error);
    }
  };

  const fetchPrescriptionsData = async () => {
    try {
      const user = await AsyncStorage.getItem('user')
      const token = await AsyncStorage.getItem('token');
      let id;
      const patientId = route.params.patient_id
      if (patientId) {
        id = patientId
      } else {
        id = JSON.parse(user).id
      }
      const response = await axios.get(
        `${baseURL}/api/prescriptions/${route.params.hospital_id}/${id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      if (response.data.status) {
        setPrescriptions(response.data.message);
      }
      fetchImagingData();
    } catch (error) {
      console.error('Error fetching prescription data:', error);
    }
  };

  const openModal = (itemType) => {
    console.log("Open modal clicked");
    setSelectedItemType(itemType);
    setIsModalVisible(true);
  };

  const fetchImagingData = async () => {
    try {
      const user = await AsyncStorage.getItem('user')
      const token = await AsyncStorage.getItem('token');
      let id;
      const patientId = route.params.patient_id
      if (patientId) {
        id = patientId
      } else {
        id = JSON.parse(user).id
      }
      const response = await axios.get(
        `${baseURL}/api/imaging/${route.params.hospital_id}/${id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      if (response.data.status) {
        setImaging(response.data.message);
      }
      fetchVitalsData();
    } catch (error) {
      console.error('Error fetching imaging data:', error);
    }
  };

  const fetchVitalsData = async () => {
    try {
      const user = await AsyncStorage.getItem('user')
      const token = await AsyncStorage.getItem('token');
      let id;
      const patientId = route.params.patient_id
      if (patientId) {
        id = patientId
      } else {
        id = JSON.parse(user).id
      }
      const response = await axios.get(
        `${baseURL}/api/vitals/${route.params.hospital_id}/${id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      if (response.data.status) {
        setVitals(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching vitals data:', error);
    }
  };



  const closeModal = () => {
    setIsModalVisible(false);
  };

  const dateFormatted = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

  const handleSubmit = async () => {
    setLoading(true)
    try {
      

      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      const userId = JSON.parse(user).id;
      const data = JSON.stringify({
        patient_id:route.params.patient_id,
        doctor_id:userId,
        date: dateFormatted(new Date()),
        title,
        content,
        hospital,
        comment,
      });

      let apiUrl;
      if (selectedItemType === 'labResults') {
        apiUrl =
          `${baseURL}/api/lab_results/`;
      } else if (selectedItemType === 'diagnoses') {
        apiUrl =
          `${baseURL}/api/diagnoses/`;
      } else if (selectedItemType === 'prescriptions') {
        apiUrl =
          `${baseURL}/api/prescriptions/`;
      }
      console.log(data)
      const response = await axios.post(apiUrl, data,{headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${token}`
      }});
      setLoading(false)
      if (response.data.status) {
        closeModal();
        setTitle('');
        setContent('');
        setHospital('');
        setComment('');
        fetchLabResultsData();
        fetchDiagnosesData();
        fetchPrescriptionsData();
        alert('Successfully added!')
      }
      else{
        closeModal();
        setTitle('');
        setContent('');
        setHospital('');
        setComment('');
        fetchLabResultsData();
        fetchDiagnosesData();
        fetchPrescriptionsData();
        alert('Somethnig went wrong!')
      }
    } catch (error) {
      setLoading(false)
      console.error('Error submitting data:', error.message);
    }
  };


  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#178838"
        barStyle="dark-content"
        translucent={false}
      />
      <View style={{ flexDirection: 'row', marginBottom: 20, backgroundColor: "#178838", height: "12%", width: '100%' }}>
        <TouchableOpacity style={{ width: '20%', justifyContent: 'center', alignItems: 'center', marginTop: 20 }} onPress={() => navigation.goBack()}>
          <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#F6B6BC', justifyContent: 'center', alignItems: 'center' }}>
            <Feather name="chevron-left" size={24} color="#178838" />
          </View>
        </TouchableOpacity>
        <View style={{ width: '60%', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold', color: "white" }}>Your records at {hospital_name}</Text>
        </View>
        {userObj?.type==="Doctor" &&(
          <TouchableOpacity onPress={() => openModal()} style={{ width: '20%', justifyContent: 'center', alignItems: 'center',marginTop:20 }}>
          <AntDesign name="pluscircleo" size={24} color="white" />
        </TouchableOpacity>
        )}
        
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
          {patientInfo&&(
            <View style={styles.card}>
            <TouchableOpacity onPress={() => setExpanded3(!expanded3)} style={[styles.header,styles.shadow]}>
              <View style={{ width: "90%" }}>
    
                <Text style={styles.headerText}>Patient's Info</Text>
              </View>
              <View style={{ width: "10%" }}>
                <MaterialIcons name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="black" />
              </View>
            </TouchableOpacity>
    
            {expanded3 && (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                 <View style={styles.resultContainer}>
                 <View style={{width:"100%"}}>
                 <Text>Fullname: {patientInfo.fullname}</Text>
                 <Text>Phone: {patientInfo.phone}</Text>
                 <Text>Email: {patientInfo.email}</Text>
                 <Text>DOB: {patientInfo.date_of_birth}</Text>
                 {(patientInfo.other_info && patientInfo.other_info!=="null")&& (
                 <Text>Other Info: {patientInfo.other_info}</Text>
                 )}
                 </View>
                 
               </View>
              
              </ScrollView>
            )}
          </View>
          )}

      <View style={styles.card}>
        <TouchableOpacity onPress={() => setExpanded(!expanded)} style={[styles.header,styles.shadow]}>
          <View style={{ width: "90%" }}>

            <Text style={styles.headerText}>Lab Results</Text>
          </View>
          <View style={{ width: "10%" }}>
            <MaterialIcons name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="black" />
          </View>
        </TouchableOpacity>

        {expanded && (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            {labResults.map((result, index) => (
             <View key={result.id} style={styles.resultContainer}>
             <View style={{width:"90%"}}>
             <Text>Title: {result.title}</Text>
             <Text>Date: {result.date}</Text>
             <Text>Content: {result.content}</Text>
             <Text>Doctor: {result.doctor_name}</Text>
             </View>
             <TouchableOpacity onPress={()=>{generatePdf(result)}}  style={{alignItems:'center',justifyContent:'center'}}>
             <AntDesign name="download" size={24} color="black" />
             </TouchableOpacity>
           </View>
            ))}
          </ScrollView>
        )}
      </View>


      <View style={styles.card}>
        <TouchableOpacity onPress={() => setExpanded1(!expanded1)} style={[styles.header,styles.shadow]}>
          <View style={{ width: "90%" }}>

            <Text style={styles.headerText}>Diagnoses</Text>
          </View>
          <View style={{ width: "10%" }}>
            <MaterialIcons name={expanded1 ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="black" />
          </View>
        </TouchableOpacity>

        {expanded1 && (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            {diagnoses.map((result, index) => (
              <View key={result.id} style={styles.resultContainer}>
              <View style={{width:"90%"}}>
              <Text>Title: {result.title}</Text>
              <Text>Date: {result.date}</Text>
              <Text>Content: {result.content}</Text>
              <Text>Doctor: {result.doctor_name}</Text>
              </View>
              <TouchableOpacity onPress={()=>{generatePdf(result)}}  style={{alignItems:'center',justifyContent:'center'}}>
              <AntDesign name="download" size={24} color="black" />
              </TouchableOpacity>
            </View>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.card}>
        <TouchableOpacity onPress={() => setExpanded2(!expanded2)} style={[styles.header,styles.shadow]}>
          <View style={{ width: "90%" }}>

            <Text style={styles.headerText}>Prescriptions</Text>
          </View>
          <View style={{ width: "10%" }}>
            <MaterialIcons name={expanded2 ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="black" />
          </View>
        </TouchableOpacity>

        {expanded2 && (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            {prescriptions.map((result, index) => (
              <View key={result.id} style={styles.resultContainer}>
              <View style={{width:"90%"}}>
              <Text>Title: {result.title}</Text>
              <Text>Date: {result.date}</Text>
              <Text>Content: {result.content}</Text>
              <Text>Doctor: {result.doctor_name}</Text>
              </View>
              <TouchableOpacity onPress={()=>{generatePdf(result)}}  style={{alignItems:'center',justifyContent:'center'}}>
              <AntDesign name="download" size={24} color="black" />
              </TouchableOpacity>
            </View>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.card}>
        <TouchableOpacity onPress={() => setExpanded4(!expanded4)} style={[styles.header,styles.shadow]}>
          <View style={{ width: "90%" }}>

            <Text style={styles.headerText}>Imaging</Text>
          </View>
          <View style={{ width: "10%" }}>
            <MaterialIcons name={expanded4 ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="black" />
          </View>
        </TouchableOpacity>

        {expanded4 && (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            {imaging.map((result, index) => (
             <View key={result.id} style={styles.resultContainer}>
             <View style={{width:"90%"}}>
             <Text>Title: {result.title}</Text>
             <Text>Date: {result.date}</Text>
             <Text>Content: {result.content}</Text>
             <Text>Doctor: {result.doctor_name}</Text>
             </View>
             <TouchableOpacity onPress={()=>{generatePdf(result)}}  style={{alignItems:'center',justifyContent:'center'}}>
             <AntDesign name="download" size={24} color="black" />
             </TouchableOpacity>
           </View>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.card}>
        <TouchableOpacity onPress={() => setExpanded5(!expanded5)} style={[styles.header,styles.shadow]}>
          <View style={{ width: "90%" }}>

            <Text style={styles.headerText}>Vitals</Text>
          </View>
          <View style={{ width: "10%" }}>
            <MaterialIcons name={expanded5 ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="black" />
          </View>
        </TouchableOpacity>

        {expanded5 && (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            {vitals.map((result, index) => (
             <View key={result.id} style={styles.resultContainer}>
             <View style={{width:"90%"}}>
             <Text>Title: {result.title}</Text>
             <Text>Date: {result.date}</Text>
             <Text>Content: {result.content}</Text>
             <Text>Doctor: {result.doctor_name}</Text>
             </View>
             <TouchableOpacity onPress={()=>{generatePdf(result)}}  style={{alignItems:'center',justifyContent:'center'}}>
             <AntDesign name="download" size={24} color="black" />
             </TouchableOpacity>
           </View>
            ))}
          </ScrollView>
        )}
      </View>

      <Modal visible={isModalVisible} transparent={true} animationType="slide"
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="height" enabled>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={options}
              search
              value={selectedItemType}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="select item"
              searchPlaceholder="Search..."
              onChange={item => {
                setSelectedItemType(item.value);
              }}
              renderLeftIcon={() => (
                <AntDesign
                  style={styles.icon}
                  color='black'
                  name="Safety"
                  size={20}
                />
              )}
            />
            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor={'gray'}
              value={title}
              onChangeText={(text) => setTitle(text)}
            />
            <TextInput
              style={styles.input}
              placeholderTextColor={'gray'}
              placeholder="Content"
              value={content}
              onChangeText={(text) => setContent(text)}
            />
            <TextInput
              style={styles.input}
              placeholderTextColor={'gray'}
              placeholder="Hospital"
              value={hospital}
              onChangeText={(text) => setHospital(text)}
            />
            <TextInput
              style={styles.input}
              placeholderTextColor={'gray'}
              placeholder="Comment"
              value={comment}
              onChangeText={(text) => setComment(text)}
            />
            <View style={{ flexDirection: "row" }}>
              
              <TouchableOpacity onPress={closeModal} style={[styles.modalButton, styles.cancelButton]}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSubmit} style={[styles.modalButton, styles.confirmButton]}>
                <Text style={styles.modalButtonText}>
                {loading ? (
                    <ActivityIndicator size={"small"} color="white" />
                  ) : (
                    "Submit"
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 10,
  },
  header: {
    paddingLeft: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    flexDirection: "row",
    height: 60,
    alignItems: 'center'
  },
  headerText: {
    fontWeight: 'bold',
  },
  content: {
    borderRadius: 8,
    marginTop: 10,
  },
  resultContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 10,
    flexDirection:'row'
  },
  label: {
    marginBottom: 5,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: '80%',
    alignItems: 'center',
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
    color: "#fff",
    fontWeight: 'bold',
  },
  input: {
    fontSize: 14,
    paddingHorizontal: 8,
    backgroundColor: '#f1f4ff',
    borderRadius: 10,
    marginVertical: 10,
    width: '90%',
    height: 45,
  },
  dropdown: {
    height: 50,
    width: '90%',
    borderColor: 'blue',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
    marginTop: 10
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export default Results;
