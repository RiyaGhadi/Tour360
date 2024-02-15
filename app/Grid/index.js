import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FontAwesome6, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function PathDrawingGrid() {
  const initialGridSize = 30; // Initial grid size
  const initialCellSize = screenWidth / initialGridSize;

  const [gridSize, setGridSize] = useState(initialGridSize);
  const [cellSize, setCellSize] = useState(initialCellSize);
  const [grid, setGrid] = useState(Array.from({ length: initialGridSize }, () => Array.from({ length: initialGridSize }, () => false)));
  const [selectedCell, setSelectedCell] = useState(null);
  const [icons, setIcons] = useState([]);

  const handleDoubleTapIcon = (iconName) => {
    setIcons([...icons, iconName]);
  };

  const handleSingleTapGrid = (row, col) => {
    if (icons.length > 0) {
      const newIcons = [...icons];
      const icon = newIcons.pop();
      setGridIcon(row, col, icon);
      setIcons(newIcons);
    } else {
      // Toggle the state of the cell between black and blue
      const newGrid = [...grid];
      newGrid[row][col] = !newGrid[row][col];
      setGrid(newGrid);
    } 
  };

  const createMap = () => {
    // Implement your logic to create the map here
    Alert.alert('Map Created!', 'Map has been created successfully.');
  };

  const setGridIcon = (row, col, iconName) => {
    const newGrid = [...grid];
    for (let i = row; i < row + 3; i++) {
      for (let j = col; j < col + 3; j++) {
        newGrid[i][j] = iconName;
      }
    }
    setGrid(newGrid);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Render icons below the grid */}
      <View style={styles.iconsContainer}>
        <TouchableOpacity onPress={() => handleDoubleTapIcon('restroom')}>
          <FontAwesome6 name="restroom" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDoubleTapIcon('building-o')}>
          <FontAwesome name="building-o" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDoubleTapIcon('stairs')}>
          <FontAwesome6 name="stairs" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDoubleTapIcon('meeting-room')}>
          <MaterialIcons name="meeting-room" size={24} color="black" />
        </TouchableOpacity>
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
                    backgroundColor: cell ? 'black' : 'white', // Set background color based on cell state
                  },
                  selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex ? styles.cellSelected : null
                ]}
                onPress={() => handleSingleTapGrid(rowIndex, colIndex)}
              />
            ))}
          </View>
        ))}
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
    backgroundColor: 'blue',
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingBottom: 25,
    marginTop: 20,
  },
});
