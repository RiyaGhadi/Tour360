import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Dimensions, Alert, Image, StyleSheet, Text, ScrollView ,ImageBackground} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createClient } from '@supabase/supabase-js';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Supabase client
const supabase = createClient('https://yinihqkmqtemokvacipf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpbmlocWttcXRlbW9rdmFjaXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNjM4NTEsImV4cCI6MjAyMzYzOTg1MX0.SPb-xP8uhX94OTaAepQEX6o0c3gj-okkbEIdXT9Xxpw');

const screenWidth = Dimensions.get('window').width;

export default function PathDrawingGrid() {
  const initialGridSize = 30; // Initial grid size
  const [gridSize, setGridSize] = useState(initialGridSize);
  const [cellSize, setCellSize] = useState(screenWidth / initialGridSize);
  const [grid, setGrid] = useState(Array.from({ length: initialGridSize }, () => Array.from({ length: initialGridSize }, () => null))); // Change to array of images
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [campusId, setCampusId] = useState(null);
  const [floors, setFloors] = useState([]);
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const [savedFloors, setSavedFloors] = useState([]);
  const navigation = useNavigation();

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

  const handleDoubleTapImage = (imageNumber) => {
    setSelectedImage(imageNumber);
  };

  const handleSingleTapGrid = (row, col) => {
    // Check if an image is already placed in the selected cell
    if (grid[row][col] !== null) {
      // If an image is present, remove it and deactivate the path
      const newGrid = [...grid];
      newGrid[row][col] = null;
      setSelectedImage(null);
      setSelectedCell({ row: null, col: null });
      setGrid(newGrid);
    } else if (selectedImage) {
      // If an image is selected, place it on the grid
      setSelectedCell({ row, col });
      setGridImage(row, col, selectedImage);
      setSelectedImage(null); // Deactivate the image after placing it
    } else {
      // If no image is present and no image is selected, draw a path on single tap
      const newGrid = [...grid];
      newGrid[row][col] = 'path';
      setGrid(newGrid);
    }
  };

  const createMapAndSave = async () => {
    if (!selectedFloorId) {
      Alert.alert('Select a floor', 'Please select a floor to save.');
      return;
    }

    // Save the grid for the selected floor
    saveGridToSupabase(selectedFloorId);
  };

  const saveGridToSupabase = async (floorId) => {
    try {
      // Check if a record already exists for the floorId
      const { data: existingData, error: fetchError } = await supabase
        .from('maps')
        .select('id')
        .eq('floorid', floorId)
        .single();
  
      if (existingData) {
        // Update the existing record
        const { data: updateData, error: updateError } = await supabase
          .from('maps')
          .update({ grid, Campusid: campusId })
          .eq('floorid', floorId);
  
        if (updateError) {
          throw updateError;
        }
  
        console.log('Data updated in Supabase successfully:', updateData);
        Alert.alert('Success', `Data for floor updated in Supabase successfully`);

        // Update the savedFloors state if the update was successful
        setSavedFloors(prev => [...new Set([...prev, floorId])]);
      } else {
        // Insert a new record
        const { data: insertData, error: insertError } = await supabase
          .from('maps')
          .insert([
            {
              floorid: floorId,
              grid,
              Campusid: campusId
            }
          ]);
  
        if (insertError) {
          throw insertError;
        }
  
        console.log('Data inserted into Supabase successfully:', insertData);
        Alert.alert('Success', `Data for floor saved to Supabase successfully`);

        // Update the savedFloors state if the insertion was successful
        setSavedFloors(prev => [...new Set([...prev, floorId])]);
      }
    } catch (error) {
      console.error('Error saving/updating data to Supabase:', error);
      Alert.alert('Error', 'Failed to save/update data to Supabase');
    }
  };
  
  const setGridImage = (row, col, imageNumber) => {
    const newGrid = [...grid];
    if (imageNumber !== null) {
      // Store the image number in the selected cell
      if (imageNumber === 3 || imageNumber === 4) {
        // For building and classroom, set the image URI to the 3x3 area centered around the selected cell
        for (let i = row - 1; i <= row + 1; i++) {
          for (let j = col - 1; j <= col + 1; j++) {
            if (i >= 0 && i < gridSize && j >= 0 && j < gridSize) {
              newGrid[i][j] = imageNumber;
            }
          }
        }
      } else {
        // For other images, set the image URI to the selected cell only
        newGrid[row][col] = imageNumber;
      }
    }
    setGrid(newGrid);
  };

  return (
    <ImageBackground
    source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp1R_3LRWcgJVv_zo-z-NJdXq7XXsqZdz28Q&usqp=CAU' }}
    style={styles.backgroundImage}
 // Adding blur effect
  >
    <GestureHandlerRootView style={styles.container}>
      {/* Display floor selection */}
    
        <Text style={styles.floorSelectionTitle}>Select Floor to Save</Text>
        <ScrollView style={styles.floorSelectionContainer}>
        {floors.map(floor => (
          <TouchableOpacity 
            key={floor.id}
            style={[styles.floorButton, selectedFloorId === floor.id ? styles.selectedFloorButton : null]}
            onPress={() => setSelectedFloorId(floor.id)}
          >
            <Text style={styles.floorButtonText}>{floor.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Render the grid */}
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={[
                  styles.cell,
                  {
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: grid[rowIndex][colIndex] === 'path' ? 'blue' : 'white',
                  },
                  selectedCell.row === rowIndex && selectedCell.col === colIndex ? styles.cellSelected : null
                ]}
                onPress={() => handleSingleTapGrid(rowIndex, colIndex)}
              >
                {/* Render images within the grid cell */}
                {cell !== null && <Image source={getImageFromNumber(cell)} style={{ width: '100%', height: '100%' }} />}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Render images below the grid */}
      <View style={styles.imagesContainer}>
        <TouchableOpacity onPress={() => handleDoubleTapImage(1)}>
          <Image source={require('./../../assets/images/up.png')} style={{ width: cellSize*2, height: cellSize*2 ,margin:15}} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDoubleTapImage(2)}>
          <Image source={require('./../../assets/images/down.png')} style={{ width: cellSize*2, height: cellSize *2,margin:15}} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDoubleTapImage(3)}>
          <Image source={require('./../../assets/images/Classroom .png')} style={{ width: cellSize * 3, height: cellSize * 3,margin:15 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDoubleTapImage(4)}>
          <Image source={require('./../../assets/images/building.png')} style={{ width: cellSize * 3, height: cellSize * 3 ,margin:15}} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDoubleTapImage(5)}>
          <Image source={require('./../../assets/images/washroom.png')} style={{ width: cellSize*2, height: cellSize*2 ,margin:15}} />
        </TouchableOpacity>
        {/* Add more image buttons here */}
      </View>
      <View style={styles.buttonRow}>
  <TouchableOpacity style={styles.saveButton} onPress={createMapAndSave}>
    <Text style={styles.saveButtonText}>Create Map and Save</Text>
  </TouchableOpacity>

  {/* Button to navigate to location, enabled only when all floors are saved */}
  <TouchableOpacity 
    style={[styles.saveButtonnext, savedFloors.length === floors.length ? {} : styles.disabledButton]} 
    onPress={() => navigation.navigate('Location')}
    disabled={savedFloors.length !== floors.length}
  >
    <Text style={styles.saveButtonText}>Next</Text>
  </TouchableOpacity>
</View>

    </GestureHandlerRootView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:75
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 1,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellSelected: {
    backgroundColor: 'black', // Selected cell color
  },
  imagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height:100,
    
  },
  floorSelectionContainer: {
    maxHeight: 150,
    marginBottom: 25,
  },
  floorSelectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
 
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom:20
    
  },
  saveButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    marginRight:10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonnext: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    marginLeft:20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  floorButton: {
    padding: 10,
    marginBottom: 5,
    borderRadius: 25,
    borderColor:'black',
    borderWidth:1 
  },
  selectedFloorButton: {
    backgroundColor: '#7ed8fa',
  },
  floorButtonText: {
    fontSize: 16,
   textAlign:'center'
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
