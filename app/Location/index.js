import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Dimensions, Alert, Image, StyleSheet, Text, ScrollView, Modal, TextInput } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createClient } from '@supabase/supabase-js';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';


// Initialize Supabase client
const supabase = createClient('https://yinihqkmqtemokvacipf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpbmlocWttcXRlbW9rdmFjaXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNjM4NTEsImV4cCI6MjAyMzYzOTg1MX0.SPb-xP8uhX94OTaAepQEX6o0c3gj-okkbEIdXT9Xxpw');

const screenWidth = Dimensions.get('window').width;

export default function UploadImages() {
  const initialGridSize = 30; // Initial grid size
  const [gridSize, setGridSize] = useState(initialGridSize);
  const [cellSize, setCellSize] = useState(screenWidth / initialGridSize);
  const [grid, setGrid] = useState(Array.from({ length: initialGridSize }, () => Array.from({ length: initialGridSize }, () => null))); // Change to array of images
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [campusId, setCampusId] = useState(null);
  const [floors, setFloors] = useState([]);
  let [selectedFloorId, setSelectedFloorId] = useState(null);
  const navigation = useNavigation();
  const [roomName, setRoomName] = useState('');
  const [entryPoints, setEntryPoints] = useState([]);
  // State to keep track of entry points for each floor
  const [isSettingRoomPoint, setIsSettingRoomPoint] = useState(false); // State to differentiate between setting room names and entry points
  const [isSettingEntryPoint, setIsSettingEntryPoint] = useState(false); // State to keep track of entry points for each floor

  const router = useRouter();
  let filename

  useEffect(() => {
    // Retrieve campusId from AsyncStorage
    AsyncStorage.getItem('campusId')
      .then(idObject => {
        const campusId = JSON.parse(idObject)[0].id;
        setCampusId(campusId);
        // Fetch total number of floors using campusId
        fetchFloors(campusId);
      })
      .catch(error => {
        console.error('Error retrieving campusId from AsyncStorage:', error);
      });

    // Update cellSize when the window dimensions change
    const updateCellSize = () => {
      setCellSize(screenWidth / gridSize);
    };

    const dimensionChangeListener = Dimensions.addEventListener('change', updateCellSize);

    // Cleanup function to remove the event listener
    return () => {
      dimensionChangeListener.remove();
    };
  }, [gridSize]);

  const fetchFloors = async (campusId) => {
    try {
      const { data, error } = await supabase
        .from('Floor')
        .select('*')
        .eq('Campusid', campusId);

      if (error) {
        throw error;
      }

      setFloors(data.map((floor, index) => ({
        label: `Floor ${index + 1}: ${floor.Floorname}`,
        value: floor.No,
        id: floor.id
      })));
    } catch (error) {
      console.error('Error fetching floors from Supabase:', error);
      Alert.alert('Error', 'Failed to fetch floors from Supabase');
    }
  };

  const fetchGridData = async (floorId) => {
    try {
      const collegeId = await AsyncStorage.getItem('CampusId');
      const { data, error } = await supabase
        .from('maps')
        .select('grid')
        .eq('floorid', floorId)
        .eq('Campusid', campusId) // Adjust the floorId value as per your requirement
        .single();


      if (error) {
        throw error;
      }
      if (data) {
        // Ensure that each cell in the grid contains a valid source for the Image component
        const processedGridData = data.grid.map(row => row.map(cell => {
          // Check if cell is a number (image number)
          if (typeof cell === 'number') {
            // If cell contains a number, get image source based on the number
            return getImageFromNumber(cell);
          } else if (cell === 'path') {
            // If cell contains 'path', return a flag to indicate a path
            return 'path';
          }
          // If cell is not a number or 'path', return null
          return null;
        }));
        setGrid(processedGridData);
      }

    } catch (error) {
      console.error('Error fetching grid data from Supabase:', error);
    }
  };
  const handleSingleTapGrid = (row, col) => {
    let cell = grid[row][col];
  
    // Check if the current cell is an entry point
    const isEntryPoint = entryPoints.some(
      entry => entry.floorId === selectedFloorId && entry.row === row && entry.col === col
    );
  
    if (cell === 'path' && !isEntryPoint) {
      if (isSettingEntryPoint) {
        // Set entry point on 'path' cell
        setEntryPoint(selectedFloorId, row, col);
        setIsSettingEntryPoint(false);
        setIsModalVisible(false); // Hide the modal
      } else {
        // Handle tap action for 'path' cells
        setSelectedCell({ row, col });
        setIsSettingRoomPoint(false); // Assuming no room details needed
        setIsSettingEntryPoint(true); // Enable setting entry point
        setIsModalVisible(true);
      }
    } else if (isEntryPoint) {
      // Prompt for removal or update
      Alert.alert(
        'Modify Entry Point',
        'Do you want to remove the entry point or update it?',
        [
          {
            text: 'Update',
            onPress: () => {
              setIsModalVisible(true); // Open modal for updating
              setIsSettingRoomPoint(false); // Assuming no room details needed for update
              setIsSettingEntryPoint(false);
              // Additional logic if needed
            }
          },
          {
            text: 'Remove',
            onPress: () => {
              removeEntryPoint(selectedFloorId, row, col); // Ensure it's a 'path' cell inside this function
              // Additional logic after removal if needed
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } else if (typeof cell === 'number') {
      // Handle tap action for number cells if needed
      setSelectedCell({ row, col });
      setIsSettingRoomPoint(true); // Set room point if cell is a number
      setIsSettingEntryPoint(true); // Enable setting entry point
      setIsModalVisible(true);
    } else {
      // Empty cell or invalid selection
      Alert.alert(
        'Invalid Selection',
        'You can only select a cell containing "path" or a number.'
      );
    }
  };
  
  


  const submitOverallData = async () => {
    try {
      console.log(entryPoints, "entry");

      // Retrieve the user ID from AsyncStorage
      const idObject = await AsyncStorage.getItem('id');
      const id = JSON.parse(idObject).id;

      for (const entry of entryPoints) {
        const { floorId, row, col } = entry;

        // Check if the row and column already exist for the selected floor in the Image table
        const { data: existingData, error: selectError } = await supabase
          .from('Image')
          .select('*')
          .eq('floorid', floorId)
          .eq('row', row)
          .eq('col', col)
          .single();

        if (selectError && selectError.code !== 'PGRST116') { // PGRST116 means no rows found
          throw selectError;
        }

        if (existingData) {
          // Update existing entry in the Image table
          const { data: updateData, error: updateError } = await supabase
            .from('Image')
            .update({
              'userid': id,
              'direction': 'main', // Assuming direction should be updated to 'main'
            })
            .eq('floorid', floorId)
            .eq('row', row)
            .eq('col', col);

          if (updateError) {
            throw updateError;
          }

          console.log(`Location data updated for floorId: ${floorId}, row: ${row}, col: ${col} in Supabase successfully:`, updateData);
        } else {
          // Insert new entry into the Image table
          const { data: insertData, error: insertError } = await supabase
            .from('Image')
            .insert([
              {
                'floorid': floorId,
                'row': row,
                'col': col,
                'direction': 'main', // Assuming direction should be set to 'main'
              },
            ]);

          if (insertError) {
            throw insertError;
          }

          console.log(`Entry point saved for floorId: ${floorId}, row: ${row}, col: ${col} to Supabase successfully:`, insertData);
        }
      }

      Alert.alert('Success', 'Entry points saved/updated successfully.');
      router.navigate('/');

    } catch (error) {
      console.error('Error saving entry data to Supabase:', error);
      Alert.alert('Error', 'Failed to save entry data to Supabase');
    }
  };

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude.toString());
      setLongitude(location.coords.longitude.toString());
    } catch (error) {
      console.error('Error getting user location:', error);
    }
  };

  const handleUploadImage = async () => {
    try {
      // Request permission to access the device's photo library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        // Permission denied, show an alert
        Alert.alert('Permission required', 'Permission to access photos is required!');
        return;
      }

      // Launch the image picker
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!pickerResult.cancelled) {
        // Image selection was cancelled



        // Image selected successfully
        const imgUri = pickerResult.assets[0];

        // Read the selected image as base64 string
        const base64 = await FileSystem.readAsStringAsync(imgUri.uri, { encoding: 'base64' });

        // Generate a unique filename for the uploaded image
        const fileName = `image_${campusId}_${selectedFloorId}_${selectedCell.row}_${selectedCell.col}.png`;

        // Set the content type for the uploaded image
        const contentType = imgUri.type === 'image/png';

        // Construct the file path
        const filePath = `${fileName}`;

        // Upload the image to Supabase storage
        const { data, error } = await supabase.storage.from('images').upload(filePath, decode(base64), { contentType });

        if (error) {
          throw error;
        }

        console.log('Image uploaded successfully. URL:', fileName);
        // Optionally, you can handle the response from the upload
        let filename = 'https://yinihqkmqtemokvacipf.supabase.co/storage/v1/object/public/images/' + fileName
        console.log(filename, "file name")
        getLocation()
        saveLocationData(filename)
        console.log('Image uploaded successfully:', data);

      }
    } catch (error) {
      // Handle errors
      console.error('Error uploading image:', error.message);
    }
  };
  const saveds = async () => {
    if (roomName) {
      // Check if a room entry already exists for this location
      const { data: existingRoomData, error: selectRoomError } = await supabase
        .from('Room')
        .select('*')
        .eq('Floorid', selectedFloorId)
        .eq('row', selectedCell.row)
        .eq('col', selectedCell.col)
        .single();

      if (selectRoomError && selectRoomError.code !== 'PGRST116') { // PGRST116 means no rows found
        throw selectRoomError;
      }

      if (existingRoomData) {
        // Update existing room entry
        const { data: updateRoomData, error: updateRoomError } = await supabase
          .from('Room')
          .update({
            'Floorid': selectedFloorId,
            'latitude': parseFloat(latitude),
            'longitude': parseFloat(longitude),
            'row': selectedCell.row,
            'col': selectedCell.col,
            'campusid': campusId, // Ensure you have the campusId in scope
            'roomname': roomName,
          })
          .eq('Floorid', selectedFloorId)
          .eq('row', selectedCell.row)
          .eq('col', selectedCell.col);

        if (updateRoomError) {
          throw updateRoomError;
        }

        console.log('Room data updated in Supabase successfully:', updateRoomData);
      } else {
        // Insert new room entry
        const { data: insertRoomData, error: insertRoomError } = await supabase.from('Room').insert([
          {
            'Floorid': selectedFloorId,
            'latitude': parseFloat(latitude),
            'longitude': parseFloat(longitude),
            'row': selectedCell.row,
            'col': selectedCell.col,
            'campusid': campusId, // Ensure you have the campusId in scope
            'roomname': roomName,
          },
        ]);

        if (insertRoomError) {
          throw insertRoomError;
        }

        console.log('Room data saved to Supabase successfully:', insertRoomData);

        // Close the modal after image upload
        setIsModalVisible(false);
      }
    }
  }
  const saveLocationData = async (filename) => {
    console.log(latitude, longitude, imageUri, selectedFloorId, filename, roomName);

    if (!selectedFloorId) {
      Alert.alert('Select a floor', 'Please select a floor to save.');
      return;
    }

    if (!latitude || !longitude || !filename) {
      Alert.alert('Incomplete data', 'Please provide location data and image.');
      return;
    }

    try {
      // Retrieve the user ID from AsyncStorage
      const idObject = await AsyncStorage.getItem('id');
      const id = JSON.parse(idObject).id;

      // Check if the row and column already exist for the selected floor in the Image table
      const { data: existingData, error: selectError } = await supabase
        .from('Image')
        .select('*')
        .eq('floorid', selectedFloorId)
        .eq('row', selectedCell.row)
        .eq('col', selectedCell.col)
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 means no rows found
        throw selectError;
      }

      let operation;
      if (existingData) {
        // Update existing entry in the Image table
        const { data: updateData, error: updateError } = await supabase
          .from('Image')
          .update({
            'userid': id,
            'latitude': parseFloat(latitude),
            'longitude': parseFloat(longitude),
            'filename': filename,
          })
          .eq('floorid', selectedFloorId)
          .eq('row', selectedCell.row)
          .eq('col', selectedCell.col);

        if (updateError) {
          throw updateError;
        }

        operation = 'updated';
        console.log('Location data updated in Supabase successfully:', updateData);
      } else {
        // Insert new entry into the Image table
        const { data: insertData, error: insertError } = await supabase.from('Image').insert([
          {
            'userid': id,
            'floorid': selectedFloorId,
            'latitude': parseFloat(latitude),
            'longitude': parseFloat(longitude),
            'filename': filename,
            'row': selectedCell.row,
            'col': selectedCell.col,
          },
        ]);

        if (insertError) {
          throw insertError;
        }

        operation = 'inserted';
        console.log('Location data saved to Supabase successfully:', insertData);
      }

      // Check if roomName is provided and save it to the Room table
      if (roomName) {
        // Check if a room entry already exists for this location
        const { data: existingRoomData, error: selectRoomError } = await supabase
          .from('Room')
          .select('*')
          .eq('Floorid', selectedFloorId)
          .eq('row', selectedCell.row)
          .eq('col', selectedCell.col)
          .single();

        if (selectRoomError && selectRoomError.code !== 'PGRST116') { // PGRST116 means no rows found
          throw selectRoomError;
        }

        if (existingRoomData) {
          // Update existing room entry
          const { data: updateRoomData, error: updateRoomError } = await supabase
            .from('Room')
            .update({
              'Floorid': selectedFloorId,
              'latitude': parseFloat(latitude),
              'longitude': parseFloat(longitude),
              'row': selectedCell.row,
              'col': selectedCell.col,
              'campusid': campusId, // Ensure you have the campusId in scope
              'roomname': roomName,
            })
            .eq('Floorid', selectedFloorId)
            .eq('row', selectedCell.row)
            .eq('col', selectedCell.col);

          if (updateRoomError) {
            throw updateRoomError;
          }

          console.log('Room data updated in Supabase successfully:', updateRoomData);
        } else {
          // Insert new room entry
          const { data: insertRoomData, error: insertRoomError } = await supabase.from('Room').insert([
            {
              'Floorid': selectedFloorId,
              'latitude': parseFloat(latitude),
              'longitude': parseFloat(longitude),
              'row': selectedCell.row,
              'col': selectedCell.col,
              'campusid': campusId, // Ensure you have the campusId in scope
              'roomname': roomName,
            },
          ]);

          if (insertRoomError) {
            throw insertRoomError;
          }

          console.log('Room data saved to Supabase successfully:', insertRoomData);
        }
      }

      Alert.alert('Success', `Location data ${operation} in Supabase successfully`);
      setLatitude('');
      setLongitude('');
      setRoomName('');
      setImageUri(null);
    } catch (error) {
      console.error('Error saving location data to Supabase:', error);
      Alert.alert('Error', 'Failed to save location data to Supabase');
    }
  };

  const showEntryPointDialog = () => {
    Alert.alert(
      "Set Entry Point",
      "Tap a cell to set the entry point.",
      [
        { text: "OK", onPress: () => setIsSettingEntryPoint(true) }
      ],
      { cancelable: false }
    );
  };


  const setEntryPoint = (floorId, row, col) => {
    const exists = entryPoints.some(entry => entry.floorId === floorId);

    if (!exists) {
      setEntryPoints([...entryPoints, { floorId, row, col }]);
      Alert.alert('Success', `Entry point set at (${row}, ${col}) for floor ${floorId}`);
    }
  };
  const removeEntryPoint = (floorId, row, col) => {
    // Filter out the entry point that matches the floorId, row, and col
    const updatedEntryPoints = entryPoints.filter(
      entry => !(entry.floorId === floorId && entry.row === row && entry.col === col)
    );
  
    // Update the entryPoints state with the filtered array
    setEntryPoints(updatedEntryPoints);
    showEntryPointDialog();

  };
  

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Display floor selection */}
      <ScrollView style={styles.floorSelectionContainer}>
        <Text style={styles.floorSelectionTitle}>Select Floor</Text>
        {floors.map(floor => (
          <TouchableOpacity
            key={floor.id}
            style={[styles.floorButton, selectedFloorId === floor.id ? styles.selectedFloorButton : null]}
            onPress={() => {
              setSelectedFloorId(floor.id);
              console.log(floor.id);
              fetchGridData(floor.id);

              // Check if entry point is already set for this floor
              const entryPointExists = entryPoints.some(entry => entry.floorId === floor.id);
              if (!entryPointExists) {
                showEntryPointDialog();
              }
            }}
          >
            <Text style={styles.floorButtonText}>{floor.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Render the grid */}

      <View style={styles.gridContainer}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => {
              // Check if the current cell is the entry point for the selected floor
              const isEntryPoint = entryPoints.some(
                entry => entry.floorId === selectedFloorId && entry.row === rowIndex && entry.col === colIndex
              );

              return (
                <TouchableOpacity
                  key={colIndex}
                  style={[
                    styles.cell,
                    isEntryPoint ? styles.entryPointCell : null,
                  ]}
                  onPress={() => {
                    handleSingleTapGrid(rowIndex, colIndex);
                  }}
                >
                  {cell === 'path' ? (
                    <View style={styles.path}>
                      {isEntryPoint && <View style={styles.entryPointOverlay} />}
                    </View>
                  ) : cell ? (
                    <View style={styles.image}>
                      <Image source={cell} style={styles.image} />
                      {isEntryPoint && <View style={styles.entryPointOverlay} />}
                    </View>
                  ) : (
                    <View style={styles.placeholder}>
                      {isEntryPoint && <View style={styles.entryPointOverlay} />}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <BlurView style={styles.modalOverlay} intensity={50}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}> Details</Text>
              {isSettingRoomPoint && (
                <TextInput
                  style={styles.input}
                  placeholder="Room Name"
                  value={roomName}
                  onChangeText={setRoomName}
                />
              )}
              <TextInput
                style={styles.input}
                placeholder="Latitude"
                value={latitude}
                onChangeText={setLatitude}
              />
              <TextInput
                style={styles.input}
                placeholder="Longitude"
                value={longitude}
                onChangeText={setLongitude}
              />
              <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
                <Text style={styles.buttonText}>Get Current Location</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadButton} onPress={handleUploadImage}>
                <Text style={styles.buttonText}>Upload Image</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={saveds}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>

      <TouchableOpacity style={styles.submitOverallButton} onPress={submitOverallData}>
        <Text style={styles.submitOverallButtonText}>Submit</Text>
      </TouchableOpacity>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9fedd7',
  },
  entryPointCell: {
    backgroundColorcolor: 'red',
  },
  row: {
    flexDirection: 'row',
  },
  gridContainer: {
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: 'white',
  },
  entryPointOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.5)', // Red overlay with 50% transparency
    zIndex: 1, // Ensure it appears above other content in the cell
  },
  path: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  cell: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  cellSelected: {
    backgroundColor: 'black', // Selected cell color
  },
  floorSelectionContainer: {
    maxHeight: 300,
    marginBottom: 25,
    maxWidth: 200,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 25,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 10,
    shadowColor: 'blue',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
  },
  floorSelectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  submitOverallButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  floorButton: {
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
    borderColor: 'black',
    borderWidth: 2,
  },
  selectedFloorButton: {
    backgroundColor: '#fce181',
  },
  floorButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: 'white',
    width: 200,
    padding: 10,
    marginBottom: 20,
  },
  locationButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: 200,
  },
  uploadButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: 200,
  },
  closeButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    width: 200,
  },
  submitButton: {
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    width: 200,
  },
  submitOverallButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 25,
    marginTop: 30,
    width: 250,
    textAlign: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

// Function to return image source based on image number
function getImageFromNumber(imageNumber) {
  switch (imageNumber) {
    case 1:
      return require('./../../assets/images/up.png');
    case 2:
      return require('./../../assets/images/down.png');
    case 3:
      return require('./../../assets/images/Classroom .png');
    case 4:
      return require('./../../assets/images/building.png');
    case 5:
      return require('./../../assets/images/washroom.png');
    // Add more cases for additional images if needed
    default:
      return null;
  }
}