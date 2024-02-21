import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Dimensions, Alert, Image, StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const screenWidth = Dimensions.get('window').width;

export default function PathDrawingGrid({ floorNumber, floorName }) {
  const initialGridSize = 30; // Initial grid size
  const [gridSize, setGridSize] = useState(initialGridSize);
  const [cellSize, setCellSize] = useState(screenWidth / initialGridSize);
  const [grid, setGrid] = useState(Array.from({ length: initialGridSize }, () => Array.from({ length: initialGridSize }, () => null))); // Change to array of images
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });

  useEffect(() => {
    // Update cellSize when the window dimensions change
    const updateCellSize = () => {
      setCellSize(screenWidth / gridSize);
    };

    Dimensions.addEventListener('change', updateCellSize);

    // Cleanup function to remove the event listener
    return () => {
      //  Dimensions.removeEventListener('change', updateCellSize);
    };
  }, [gridSize]);

  const handleDoubleTapImage = (imageUri) => {
    setSelectedImage(imageUri);
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

  const createMap = () => {
    // Implement your logic to create the map here
    Alert.alert('Map Created!', 'Map has been created successfully.');
    sendDataToBackend(); // Send data to backend when map is created
  };

  const setGridImage = (row, col, imageUri) => {
    const newGrid = [...grid];
    if (
      imageUri === require('./../../assets/images/up.png') ||
      imageUri === require('./../../assets/images/down.png') ||
      imageUri === require('./../../assets/images/washroom.png')
    ) {
      // For one-cell images, set the image URI to the selected cell only
      newGrid[row][col] = imageUri;
    } else {
      // For two-cell images, set the image URI to the 9-cell area centered around the selected cell
      for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
          if (i >= 0 && i < gridSize && j >= 0 && j < gridSize) {
            newGrid[i][j] = imageUri;
          }
        }
      }
    }
    setGrid(newGrid);
  };

  const sendDataToBackend = async () => {
    try {
      // Send data to backend API
      const response = await fetch('YOUR_BACKEND_API_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          floorNumber: floorNumber,
          floorName: floorName,
          grid: grid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send data to backend.');
      }

      console.log('Data sent to backend successfully.');
    } catch (error) {
      console.error('Error sending data to backend:', error);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Display floor information */}
      <View style={styles.floorInfoContainer}>
        <Text style={styles.floorInfoText}>Floor {floorNumber}</Text>
        <Text style={styles.floorInfoText}>{floorName}</Text>
      </View>

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
                {cell && <Image source={cell} style={{ width: '100%', height: '100%' }} />}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Render images below the grid */}
      <View style={styles.imagesContainer}>
        <TouchableOpacity onPress={() => handleDoubleTapImage(require('./../../assets/images/up.png'))}>
          <Image source={require('./../../assets/images/up.png')} style={{ width: cellSize, height: cellSize }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDoubleTapImage(require('./../../assets/images/down.png'))}>
          <Image source={require('./../../assets/images/down.png')} style={{ width: cellSize, height: cellSize }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDoubleTapImage(require('./../../assets/images/Classroom .png'))}>
          <Image source={require('./../../assets/images/Classroom .png')} style={{ width: cellSize * 2, height: cellSize * 2 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDoubleTapImage(require('./../../assets/images/building.png'))}>
          <Image source={require('./../../assets/images/building.png')} style={{ width: cellSize * 2, height: cellSize * 2 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDoubleTapImage(require('./../../assets/images/washroom.png'))}>
          <Image source={require('./../../assets/images/washroom.png')} style={{ width: cellSize, height: cellSize }} />
        </TouchableOpacity>
        {/* Add more image buttons here */}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
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
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
  },
  floorInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  floorInfoText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
});
