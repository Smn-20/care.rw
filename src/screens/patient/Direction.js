import React from 'react'
import { View, Text, Platform, Image, TouchableOpacity, StatusBar, ScrollView, Dimensions, TextInput, ActivityIndicator, Linking } from 'react-native';
import { Feather, FontAwesome, FontAwesome5, Ionicons, Entypo, MaterialIcons, Fontisto } from '@expo/vector-icons';
import { WebView } from "react-native-webview";
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const Direction = (props) => {
    const link= props.route.params.link
    const name = props.route.params.name
    return (
        <View>
            <StatusBar
                backgroundColor="#0A2133"
                barStyle='dark-content'
                translucent={false}
            />
            <View style={{ width: windowWidth, backgroundColor: '#0A2133', height: windowHeight / 8, flexDirection: 'row' }}>

                <TouchableOpacity onPress={() => { props.navigation.goBack() }} style={{ width: '25%', alignItems: 'center', justifyContent: 'center', marginTop: '8%' }}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={{ width: '50%', alignItems: 'center', justifyContent: 'center', marginTop: '8%' }}>
                    <Text style={{ color: 'white', fontSize: 18 }}>{name} Map</Text>
                </View>
                <View style={{ width: '25%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: '8%' }}>
                    <TouchableOpacity onPress={() => { props.navigation.navigate('Notifications') }} style={{ marginRight: '5%' }}>
                    </TouchableOpacity>
                    
                </View>

            </View>
            <View style={{height: windowHeight *7 / 8}}>

                <WebView
                source={{ uri: link }}
                />

            </View>
        </View>
    )
}

export default Direction