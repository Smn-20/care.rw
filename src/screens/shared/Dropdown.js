import { Entypo, Feather, FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useContext } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { AuthContext } from "../../context/context";
const windowHeight = Dimensions.get("window").height;
const Dropdown = ({ navigation, isVisible, onClose, names, phone }) => {
  const context = useContext(AuthContext);
  return (
    <Modal
      transparent={true}
      animationType="none"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
          }}
        >
          <View
            style={{
              marginTop: windowHeight / 8,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              width: "100%",
              height: windowHeight - windowHeight / 8,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                position: "absolute",
                right: 5,
                paddingVertical: 20,
                borderRadius: 10,
                width: 250,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", marginHorizontal:20 }}
              >
                <View>
                  <FontAwesome5
                    name="user"
                    size={24}
                    style={{ marginRight: 25 }}
                  />
                </View>
                <View>
                  <Text style={{ color: "black", fontSize: 16 }}>
                    {names}
                  </Text>
                  <Text style={{ color: "gray", fontSize: 12,marginTop:5 }}>
                    {phone}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  borderBottomColor: "gray",
                  borderBottomWidth: 1,
                  marginVertical: 5,
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Profile");
                  onClose();
                }}
                style={{ flexDirection: "row", alignItems: "center", marginHorizontal:20,marginTop:10 }}
              >
                <View>
                  <Feather
                    name="settings"
                    size={16}
                    style={{ marginRight: 10 }}
                  />
                </View>
                <View>
                  <Text style={{ color: "black", fontSize: 16 }}>
                    Accounts Settings
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  marginTop: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  marginHorizontal: 20
                }}
                onPress={() => {
                  navigation.navigate("Report");
                  onClose();
                }}
              >
                <View>
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color="black"
                    style={{ marginRight: 10 }}
                  />
                </View>
                <View>
                  <Text style={{ color: "black", fontSize: 16 }}>Reports</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  marginTop: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  marginHorizontal: 20
                }}
                onPress={() => {
                  navigation.navigate("Prescriptions");
                  onClose();
                }}
              >
                <View>
                  <Entypo
                    name="add-to-list"
                    size={16}
                    style={{ marginRight: 10 }}
                  />
                </View>
                <View>
                  <Text style={{ color: "black", fontSize: 16 }}>
                    Prescriptions
                  </Text>
                </View>
              </TouchableOpacity>
              <View
                style={{
                  borderBottomColor: "gray",
                  borderBottomWidth: 1,
                  marginVertical: 10,
                }}
              />
              <TouchableOpacity
                style={{
                  marginTop: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  marginHorizontal: 20
                }}
                onPress={() => {
                  context.signOut()
                  onClose();
                }}
              >
                <View>
                <MaterialIcons name="logout" size={16} style={{ marginRight: 10 }} color="black" />
                </View>
                <View>
                  <Text style={{ color: "black", fontSize: 16 }}>
                    Logout
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default Dropdown;
