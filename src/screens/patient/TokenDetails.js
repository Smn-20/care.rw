import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  FlatList,
  Dimensions,
} from "react-native";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  AntDesign,
  Ionicons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseURL } from "../../BaseUrl";
import axios from "axios";
const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

const TokenDetails = ({ navigation, route }) => {
  const [user, setUser] = useState();
  const [index_, setIndex] = useState();
  const [medications, setMedications] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [pharmacies_, setPharmacies_] = useState([]);
  const [refreshing, setRefreshing] = useState();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const getPharmacies = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    const user_ = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user_);
    setUser(userObj);
    axios
      .get(`${baseURL}/api/search-inventory-by-token/${route.params.token}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setPharmacies(res.data.data);
        setPharmacies_(res.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  };

  const search = (value) => {
    const filteredPharmacies = pharmacies_.filter((el) => {
      let elementToLowercase = el.branch_details?.branch_name.toLowerCase();
      let searchToTermLowercase = value.toLowerCase();
      return elementToLowercase.indexOf(searchToTermLowercase) > -1;
    });

    setPharmacies(filteredPharmacies);
  };

  const getMedications = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    const user_ = await AsyncStorage.getItem("user");
    const userObj = JSON.parse(user_);
    setUser(userObj)
    axios
      .get(`${baseURL}/api/prescriptions/${route.params.token}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setMedications(res.data.data);
        setRefreshing(false);
      })
      .catch((error) => {
        setRefreshing(false);
        console.log(error);
      });
  };

  useEffect(() => {
    getMedications();
  }, []);

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (index === index_) {
            setIndex("");
          } else {
            setIndex(index);
          }
        }}
        style={{
          backgroundColor: "#fff",
          padding: 15,
          alignSelf: "center",
          borderRadius: 10,
          marginTop: 10,
          width: "100%",
          marginBottom: 10,
          ...styles.shadow,
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
              width: "22%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                width: 50,
                height: 50,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#b7e7e7",
                borderRadius: 10,
              }}
            >
              <MaterialCommunityIcons name="pill" size={30} />
            </View>
          </View>

          <View
            style={{
              width: "63%",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, color: "black", fontWeight: "bold" }}>
              {item.medication?.name}
            </Text>
            <Text style={{ fontSize: 12, color: "black", marginTop: 5 }}>
              quantity: {item.quantity}
            </Text>
          </View>

          <View
            style={{
              width: "15%",
              justifyContent: "center",
              alignItems: "flex-end",
            }}
          >
            <MaterialCommunityIcons
              name={
                index === index_
                  ? "arrow-up-drop-circle-outline"
                  : "arrow-down-drop-circle-outline"
              }
              size={20}
            />
          </View>
        </View>
        {index === index_ && (
          <View style={styles.content}>
            <View style={styles.resultContainer}>
              <View style={{ width: "100%", flexDirection: "row" }}>
                <View style={{ width: "50%" }}>
                  <Text style={{ color: "#495057" }}>Duration</Text>
                </View>
                <View style={{ width: "50%", alignItems: "flex-end" }}>
                  <Text style={{ color: "gray" }}>{item.duration}</Text>
                </View>
              </View>
              <View style={{ width: "100%", flexDirection: "row" }}>
                <View style={{ width: "50%" }}>
                  <Text style={{ color: "#495057" }}>Frequency</Text>
                </View>
                <View style={{ width: "50%", alignItems: "flex-end" }}>
                  <Text style={{ color: "gray" }}>3 times</Text>
                </View>
              </View>
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ width: "50%" }}>
                  <Text style={{ color: "#495057" }}>Instructions</Text>
                </View>
                <View style={{ width: "30%", alignItems: "flex-end" }}>
                  <Text style={{ color: "gray", textAlign: "right" }}>
                    {item.instructions}
                  </Text>
                </View>
              </View>
            </View>
            {user?.user_type==="patient"&&<TouchableOpacity
              onPress={() =>
                navigation.navigate("SearchPage", {
                  title: "Medicine",
                  searchParam: item.medication.name,
                })
              }
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 35,
                marginTop: 10,
                flexDirection: "row",
                width: "100%",
                backgroundColor: "#DCEDE1",
                borderRadius: 17.5,
              }}
            >
              <FontAwesome5 name="hospital" color="#178838" size={20} />
              <Text
                style={{ color: "#178838", fontWeight: "500", marginLeft: 10 }}
              >
                Search Medication
              </Text>
            </TouchableOpacity>}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderPharmacy = ({ item }) => {
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
            backgroundColor: "#F5F4EC",
            width: "100%",
            paddingHorizontal: 10,
            height: windowHeight / 15,
            borderRadius: 20,
          }}
        >
          <View style={{ width: "80%" }}>
            <Text
              style={{
                color: "#000",
                fontWeight: 500,
                marginLeft: 20,
              }}
            >
              {item.branch_details.branch_name}
            </Text>
            <Text
              style={{
                color: "gray",
                marginLeft: 20,
                marginTop: 4,
              }}
            >
              available medication:{item.available_medication.count}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setShowModal(false);
              navigation.navigate("TokenMedications", {
                branch: item.branch_details.branch_name,
                medications: item.available_medication.medication,
                id: item.branch_id,
              });
            }}
            style={{
              width: "20%",
              flexDirection: "row",
              height: "60%",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#178838",
              borderRadius: 20,
            }}
          >
            <Text style={{ color: "white", marginRight: 5 }}>View</Text>
            <AntDesign color={"white"} name="arrowright" size={12} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          backgroundColor: "#E8F3EB",
          justifyContent: "center",
          alignItems: "center",
          height: windowHeight * 0.12,
          width: "100%",
        }}
      >
        <View style={{ flexDirection: "row", marginTop: 35 }}>
          <TouchableOpacity
            style={{
              width: "20%",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => navigation.goBack()}
          >
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AntDesign name="arrowleft" size={24} color="#000" />
            </View>
          </TouchableOpacity>
          <View
            style={{
              width: "60%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "500", color: "black" }}>
              {route.params.doctor}
            </Text>
            <Text style={{ color: "gray" }}>
              {route.params.dates} | Token: {route.params.token}
            </Text>
          </View>
          <View
            style={{
              width: "20%",
              justifyContent: "center",
              alignItems: "center",
            }}
          ></View>
        </View>
      </View>

      <View style={{ height: windowHeight * 0.88, backgroundColor: "white" }}>
        <View style={{ width: "90%", alignSelf: "center" }}>
          {medications ? (
            <View style={{ paddingBottom: 80 }}>
              {medications.length > 0 ? (
                <FlatList
                  style={{ height: "100%" }}
                  contentContainerStyle={{
                    paddingBottom: 15,
                  }}
                  data={medications}
                  showsVerticalScrollIndicator={false}
                  renderItem={renderItem}
                  keyExtractor={(item, index) => index.toString()}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={() => getMedications()}
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
                  <Text style={{ fontSize: 18, fontWeight: "500" }}>
                    No Token Added yet
                  </Text>
                  <Text style={{ fontSize: 14, color: "gray", marginTop: 15 }}>
                    Search to view your token
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
              }}
            >
              <ActivityIndicator size="large" color="black" />
            </View>
          )}
        </View>
      </View>

      {medications.length > 1 && (
        <View
          style={{
            overflow: "visible",
            position: "absolute",
            backgroundColor: "#fff",
            height: 80,
            top: Dimensions.get("window").height - 80,
            flexDirection: "row",
            width: "100%",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {user?.user_type === "patient" && (
            <TouchableOpacity
              onPress={() => {
                setShowModal(true);
                getPharmacies();
              }}
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 40,
                marginTop: 10,
                flexDirection: "row",
                width: "90%",
                backgroundColor: "#178838",
                borderRadius: 20,
              }}
            >
              <FontAwesome5 name="hospital" color="#fff" size={20} />
              <Text
                style={{ color: "#fff", fontWeight: "500", marginLeft: 10 }}
              >
                Search All Medications
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: "white",
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "flex-end",
                ...styles.shadow,
              }}
            >
              <Ionicons name="close" size={20} />
            </TouchableOpacity>
            <View style={[styles.searchBox]}>
              <View style={{ justifyContent: "center", marginHorizontal: 10 }}>
                <Ionicons name="search" size={24} color="gray" />
              </View>
              <TextInput
                placeholder={`Search Pharmacy`}
                keyboardType="default"
                placeholderTextColor="#666666"
                onChangeText={(value) => {
                  search(value);
                }}
                style={[
                  styles.textInput,
                  {
                    color: "black",
                  },
                ]}
                autoCapitalize="none"
              />
            </View>
            <View
              style={{
                minHeight: windowHeight * 0.5,
                maxHeight: windowHeight * 0.75,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {loading ? (
                <ActivityIndicator color={"black"} size={"large"} />
              ) : pharmacies.length > 0 ? (
                <FlatList
                  contentContainerStyle={{
                    paddingBottom: 100,
                  }}
                  data={pharmacies}
                  showsVerticalScrollIndicator={false}
                  renderItem={renderPharmacy}
                  keyExtractor={(item, index) => index.toString()}
                />
              ) : (
                <Text style={{ marginTop: 20 }}>No Pharmacy...</Text>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TokenDetails;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "gray",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,

    elevation: 4,
  },
  resultContainer: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    padding: 10,
  },
  searchBox: {
    flexDirection: "row",
    backgroundColor: "white",
    height: 40,
    marginTop: 10,
    width: "90%",
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#9DA5BE",
    alignSelf: "center",
  },
  modalContent: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
    elevation: 5,
    width: "90%",
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
});
