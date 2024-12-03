import React, { useState } from 'react';
import { View, Image, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const ImageEditorScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [caption, setCaption] = useState('');
  const [inputHeight, setInputHeight] = useState(40);

  const handleSelectImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Enables basic cropping
      aspect: [4, 3], // Optional: specify the aspect ratio for cropping
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      {imageUri ? (
        <ScrollView contentContainerStyle={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </ScrollView>
      ) : (
        <Button title="Select Image" onPress={handleSelectImage} />
      )}

      {imageUri && (
        <View style={styles.captionContainer}>
          <TextInput
            style={[styles.input, { height: inputHeight }]}
            multiline={true}
            placeholder="Add a caption..."
            value={caption}
            onChangeText={(text) => setCaption(text)}
            onContentSizeChange={(event) =>
              setInputHeight(Math.min(70, event.nativeEvent.contentSize.height))
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor: 'white',
  },
  imageContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 4 / 3, // Maintain aspect ratio
    borderRadius: 8,
  },
  captionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f2f2f2',
  },
  input: {
    flex: 1,
    maxHeight: 70, // Maximum height for the TextInput
    paddingHorizontal: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
});

export default ImageEditorScreen;
