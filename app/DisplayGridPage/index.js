import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import ImageZoom from 'react-native-image-pan-zoom';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import { ScrollView } from 'react-native';

// Initialize Supabase client
const supabase = createClient('https://yinihqkmqtemokvacipf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpbmlocWttcXRlbW9rdmFjaXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNjM4NTEsImV4cCI6MjAyMzYzOTg1MX0.SPb-xP8uhX94OTaAepQEX6o0c3gj-okkbEIdXT9Xxpw');

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
    default:
      return null;
  }
}

export default function DisplayGridPage() {
  let [floorId, setFloorId] = useState(1);
  let [gridData, setGridData] = useState([]);
  const [panoramaImageUrl, setPanoramaImageUrl] = useState(null);
  let [No, setNo] = useState(0); // Initialize with the default floor number
  let [minNo, setMinNo] = useState(0); // Initialize with the default minimum floor number
  let [maxNo, setMaxNo] = useState(5); // State to store user's live location
  const [isCustomAlertVisible, setIsCustomAlertVisible] = useState(false); // State to control visibility of custom alert
  const [floorOptions, setFloorOptions] = useState([]); // State to store floor options for custom alert
  const screenWidth = Dimensions.get('window').width;
  let [fromRoomrow, setFromRow] = useState(null);
  let [fromRoomcol, setFromCol] = useState(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedFromRoom, setSelectedFromRoom] = useState('');
  const [selectedToRoom, setSelectedToRoom] = useState('');
  const [roomData, setRoomData] = useState([]);
  const [path, setPath] = useState([]);
  let [userRow, setUserRow] = useState();
  let [userCol, setUserCol] = useState();
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [torow, settoRow] = useState();
  const [tocol, settoCol] = useState();
  const [fromRoom, setFromRoom] = useState('');
  const [toRoom, setToRoom] = useState('');
  const [isFromDropdownVisible, setIsFromDropdownVisible] = useState(false);
  const [isToDropdownVisible, setIsToDropdownVisible] = useState(false);
  let [stairCol, setstaircol] = useState();
  let [stairrow, setstairrow] = useState();
  const [toFloorNo, setFloorToNo] = useState();
  let [isDifferentFloor, setisDifferentFloor] = useState(true);
  let staircaseCoordinates = [];

  let [gridDatafors, setGridDatafors] = useState([]);

  useEffect(() => {
    fetchData();
    fetchGridData();
    fetchFloorNumbers();
    fetchRoomData();
    fetchImageCol()
    fetchImageRowAndCol()


  }, [No]);

  const fetchData = async () => {
    try {
      const collegeId = await AsyncStorage.getItem('CampusId');
      const { data: floorData, error: floorError } = await supabase
        .from('Floor')
        .select('id')
        .eq('Campusid', collegeId)
        .eq('No', No); // Use the global floor number
      floorId = floorData[0].id;
      setFloorId(floorData[0].id);
      console.log("fllllllllll", floorId)
      if (floorError) {
        throw floorError;
      }

      if (floorData) {
        const { data: imageData, error: imageError } = await supabase
          .from('Image')
          .select('filename')
          .eq('floorid', floorId)
          .eq('direction', 'main');
        if (imageError) {
          throw imageError;
        }
        if (imageData) {

          await fetchGridData();
          setPanoramaImageUrl(imageData[0].filename);
          await fetchImageRowAndCol();
          await fetchImageCol();

        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const fetchGridData = async () => {
    try {
      const collegeId = await AsyncStorage.getItem('CampusId');
      const { data, error } = await supabase
        .from('maps')
        .select('grid')
        .eq('floorid', floorId)
        .eq('Campusid', collegeId) // Adjust the floorId value as per your requirement
        .single();


      if (error) {
        throw error;
      }
      if (data) {
        setGridDatafors(data.grid)
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
        setGridData(processedGridData);
      }

    } catch (error) {
      console.error('Error fetching grid data from Supabase:', error);
    }
  };

  // Function to provide directions
  const provideDirections = async (path, toRoom) => {
    let currentStep = 0;

    const getDirection = (from, to) => {
      const rowDiff = to.row - from.row;
      const colDiff = to.col - from.col;

      if (rowDiff > 0 && colDiff === 0) return 'Go front';
      if (rowDiff < 0 && colDiff === 0) return 'Go front';
      if (colDiff > 0 && rowDiff === 0) return 'Go right';
      if (colDiff < 0 && rowDiff === 0) return 'Go left';
      return '';
    };

    const speakDirection = async (direction) => {
      const directionText = `${direction}`;
      try {
        await Speech.speak(directionText, {
          language: 'en',
          pitch: 1.0,
          rate: 1.0
        });
      } catch (error) {
        console.error('Error speaking direction:', error);
      }
    };

    const speakDestination = async (toRoom) => {
      const destinationText = `You have arrived at your destination, ${toRoom}`;
      try {
        await Speech.speak(destinationText, {
          language: 'en',
          pitch: 1.0,
          rate: 1.0
        });


      } catch (error) {
        console.error('Error speaking destination:', error);
      }
    };

    const showNextStep = async () => {
      if (currentStep >= path.length - 1) {

        Alert.alert('You have arrived at your destination.');
        speakDestination(toRoom)
        fetchImage(path.row,path.col)
        return;
      }

      let stepsToMove = Math.min(5, path.length - currentStep - 1);
      let direction = getDirection(path[currentStep], path[currentStep + 1]);

      for (let i = 1; i <= stepsToMove; i++) {
        const nextDirection = getDirection(path[currentStep + i - 1], path[currentStep + i]);
        if (nextDirection !== direction || i === stepsToMove) {
          stepsToMove = i;
          break;
        }
      }
      speakDirection(direction)
      Alert.alert(
        'Direction',
        `Move ${stepsToMove} steps: ${direction}`,
        [{
          text: 'OK', onPress: async () => {
            for (let i = 0; i < stepsToMove; i++) {
              currentStep++;
              setUserCol(path[currentStep].col);
              setUserRow(path[currentStep].row);
            }

            // Check for interaction
            const interactionDetected = await checkForInteraction(path[currentStep].row, path[currentStep].col);
            if (interactionDetected) {
              // Continue in the same direction
              await showNextStep();
              return;
            }

            // Continue showing next step
            await showNextStep();
          }
        }]
      );
    };

    await showNextStep();
  };

  const checkForInteraction = async (row, col) => {

    // Check for image or staircase at the current position
    if (await fetchImageOrNearby(row, col)) {
      // Handle interaction, e.g., display alert or perform action
      setIsAlertVisible(true);
      return true; // Stop further movement
    } else if (row === stairrow && col === stairCol && isDifferentFloor === true) {
      await handleUserReachedStaircase();
      return true; // Stop if staircase found
    }

    // Continue movement if no interaction detected
    return false;
  };
  const fetchImageOrNearby = async (row, col) => {
    try {
      const imageExists = await imageexist(row, col);

      if (imageExists) {
        fetchImage(row, col);
      } else {
        const nearbyImage = await findNearbyImage(row, col);

        if (!nearbyImage) {
          setIsAlertVisible(true);
        } else {
          fetchImage(nearbyImage.row, nearbyImage.col);
        }
      }
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  const imageexist = async (row, col) => {
    try {
      const { data: imageData } = await supabase
        .from('Image')
        .select('filename')
        .eq('floorid', floorId)
        .eq('row', row)
        .eq('col', col);

      return !!imageData[0]; // Return true if imageData exists, otherwise false
    } catch (error) {
      console.error('Error checking image existence:', error);
      return false; // Return false in case of any error
    }
  };

  const findNearbyImage = async (row, col, range = 3) => {
    let lastFoundImage = null;

    for (let r = Math.max(0, row - range); r <= Math.min(gridData.length - 1, row + range); r++) {
      for (let c = Math.max(0, col - range); c <= Math.min(gridData[0].length - 1, col + range); c++) {
        if (await imageexist(r, c)) {
          lastFoundImage = { row: r, col: c }; // Update last found image coordinates
        }
      }
    }

    return lastFoundImage; // Return the coordinates of the last found image, or null if none found
  };


  const findAndSetPath = async (gridData, start, end) => {
    const path = findPath(gridData, start, end);
    setPath(path);
    console.log('Path:', path);

    if (path.length > 0) {
      provideDirections(path);
    }
  };

  const markClosestCellAsRed = async (roomCoordinatesArray) => {
    if (!gridData || gridData.length === 0) {
      console.log('Grid data is empty.');
      return { fromRoom: null, toRoom: null };
    }

    const closestCells = { fromRoom: null, toRoom: null };

    for (const roomCoordinates of roomCoordinatesArray) {
      const { row: selectedRoomRow, col: selectedRoomCol } = roomCoordinates;
      let minDistance = Number.MAX_VALUE;
      let closestRow = null;
      let closestCol = null;

      // Iterate over the grid data to find the closest cell with a path
      gridData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          // Calculate the distance between the current cell and the selected room's position
          const distance = Math.sqrt(Math.pow(selectedRoomRow - rowIndex, 2) + Math.pow(selectedRoomCol - colIndex, 2));

          // Check if the current cell contains a path and if it is closer to the room
          if (cell === 'path' && distance < minDistance) {
            minDistance = distance;
            closestRow = rowIndex;
            closestCol = colIndex;
          }
        });
      });

      // Store the closest cell for the current room
      if (closestRow !== null && closestCol !== null) {
        if (closestCells.fromRoom === null) {
          closestCells.fromRoom = { row: closestRow, col: closestCol };
        } else {
          closestCells.toRoom = { row: closestRow, col: closestCol };
        }
      } else {
        console.log('No path cells found in the grid.');
      }
    }

    return closestCells;
  };

  function findPath(gridData, start, end) {
    const visited = new Set();
    const distances = {}; // Map to store the shortest distances from start to each node
    const previous = {}; // Map to store the previous node on the shortest path to each node

    // Initialize distances for all nodes to infinity except start node
    for (let row = 0; row < gridData.length; row++) {
      for (let col = 0; col < gridData[row].length; col++) {
        distances[`${row},${col}`] = Infinity;
      }
    }
    distances[`${start.row},${start.col}`] = 0;

    while (true) {
      let currentNode = null;
      let minDistance = Infinity;

      // Find the unvisited node with the smallest distance
      for (const nodeStr in distances) {
        const [row, col] = nodeStr.split(',').map(Number);
        if (!visited.has(nodeStr) && distances[nodeStr] < minDistance) {
          currentNode = { row, col };
          minDistance = distances[nodeStr];
        }
      }

      if (!currentNode) break; // No reachable nodes left

      visited.add(`${currentNode.row},${currentNode.col}`);

      // Exit loop if reached the end node
      if (currentNode.row === end.row && currentNode.col === end.col) break;

      // Update distances to neighbors of the current node
      const neighbors = getNeighbors(gridData, currentNode);
      for (const neighbor of neighbors) {
        const neighborStr = `${neighbor.row},${neighbor.col}`;
        const distance = distances[`${currentNode.row},${currentNode.col}`] + 1; // Assuming each step has a cost of 1
        if (distance < distances[neighborStr]) {
          distances[neighborStr] = distance;
          previous[neighborStr] = currentNode;
        }
      }
    }

    // Reconstruct the shortest path
    const path = [];
    let current = end;
    while (previous[`${current.row},${current.col}`]) {
      path.push(current);
      current = previous[`${current.row},${current.col}`];
    }
    path.push(start);

    return path.reverse(); // Reverse the path to start from the start node
  }

  function getNeighbors(gridData, node) {
    const { row, col } = node;
    const neighbors = [];
    if (gridData[row - 1] && gridData[row - 1][col] === 'path') {
      neighbors.push({ row: row - 1, col });
    }
    if (gridData[row + 1] && gridData[row + 1][col] === 'path') {
      neighbors.push({ row: row + 1, col });
    }
    if (gridData[row][col - 1] === 'path') {
      neighbors.push({ row, col: col - 1 });
    }
    if (gridData[row][col + 1] === 'path') {
      neighbors.push({ row, col: col + 1 });
    }
    return neighbors;
  }
  const fetchRoomData = async () => {
    try {
      const collegeId = await AsyncStorage.getItem('CampusId');
      const { data: rooms, error } = await supabase
        .from('Room')
        .select('roomname')
        .eq('campusid', collegeId);
      if (error) {
        throw error;
      }
      if (rooms) {
        setRoomData(rooms.map(room => room.roomname));
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
    }
  };


  const fetchFloorNumbers = async () => {
    try {
      const collegeId = await AsyncStorage.getItem('CampusId');
      const { data: floorNumbers, error } = await supabase
        .from('Floor')
        .select('No')
        .eq('Campusid', collegeId);
      if (error) {
        throw error;
      }

      if (floorNumbers) {
        setFloorOptions(floorNumbers.map(floor => ({ id: floor.No, name: `Floor ${floor.No}` }))); // Set initial floor number
      }
    } catch (error) {
      console.error('Error fetching floor numbers:', error);
    }
  };

  const fetchMinMaxNo = async () => {
    try {
      const collegeId = await AsyncStorage.getItem('CampusId');

      // Fetch minimum No
      const { data: minNoData, error: minNoError } = await supabase
        .from('Floor')
        .select('No')
        .eq('Campusid', collegeId) // Adjust the floorId value as per your requirement
        .order('No', { ascending: true })
        .limit(1)
        .single();

      if (minNoError) {
        throw minNoError;
      }

      if (minNoData) {
        setMinNo(minNoData.No);
      }

      // Fetch maximum No
      const { data: maxNoData, error: maxNoError } = await supabase
        .from('Floor')
        .select('No')
        .eq('Campusid', collegeId) // Adjust the floorId value as per your requirement
        .order('No', { ascending: false })
        .limit(1)
        .single();

      if (maxNoError) {
        throw maxNoError;
      }

      if (maxNoData) {
        setMaxNo(maxNoData.No + 1);
        console.log("maxx", maxNoData.No + 1)
      }
    } catch (error) {
      console.error('Error fetching minimum or maximum No:', error);
    }
  };

  const fetchImageRowAndCol = async () => {
    try {
      const { data: imageData, error: imageError } = await supabase
        .from('Image')
        .select('row')
        .eq('floorid', floorId)
        .eq('direction', 'main');

      if (imageError) {
        throw imageError;
      }

      if (imageData && imageData.length > 0) {
        imarow = imageData[0].row;
        console.log('Image row:', imarow);
        setUserRow(imarow);
      } else {
        console.error('No image row data found');
      }
    } catch (error) {
      console.error('Error fetching image row:', error);
    }
  };

  const fetchImageCol = async () => {
    try {
      const { data: imageData, error: imageError } = await supabase
        .from('Image')
        .select('col')
        .eq('floorid', floorId)
        .eq('direction', 'main');

      if (imageError) {
        throw imageError;
      }

      if (imageData && imageData.length > 0) {
        imacol = imageData[0].col;
        setUserCol(imacol);
        console.log('Image col:', imacol);
      } else {
        console.error('No image col data found');
      }
    } catch (error) {
      console.error('Error fetching image col:', error);
    }
  };


  const handleCircleClick = async () => {
    setIsCustomAlertVisible(true);
  };


  const markCellAsRed = (row, col) => {
    console.log('Marking cell as red:', row, col);
    // Add logic to update the grid and mark the specified cell as red
  };
  const fetchImage = async (row, col) => {
    try {
      console.log(floorId, "hhh")
      const { data: imageData, error } = await supabase
        .from('Image')
        .select('filename')
        .eq('floorid', floorId)
        .eq('row', row)
        .eq('col', col);

      if (error) {
        throw error;
      }

      if (imageData && imageData.length > 0) {
        setPanoramaImageUrl(imageData[0].filename);
      } else {
        console.log('Image not found for row:', row, 'col:', col);
        // Open dialog indicating no image available
      }
    } catch (error) {
      console.error('Error fetching image data:', error);
    }
  };

  const changeDirection = async (direction) => {
    console.log(direction)
    if (direction === 'up') {
      if (No < maxNo) {
        No = No + 1
        setNo(No);
        console.log("upmm", No)
        fetchData();
        fetchGridData();
        console.log("up", No)
      }
    }
    if (direction === 'down') {
      if (No > minNo) {
        console.log("down", No)
        No = No - 1
        setNo(No);
        fetchData();
        fetchGridData();
        console.log(torow, tocol)
      }
    }
    await fetchData();
    await fetchGridData();
  };

  const handleGridCellClick = async (row, col) => {
    try {
      // Check if the clicked cell contains an image
      const cell = gridData[row][col];

      if (cell && typeof cell === 'number') {
        // If the cell contains an image, proceed with showing the alert
        const { data: roomData, error: roomError } = await supabase
          .from('Room')
          .select('roomname')
          .gte('row', row - 2) // Check rows within -3 range
          .lte('row', row + 2) // Check rows within +3 range
          .gte('col', col - 2) // Check columns within -3 range
          .lte('col', col + 2) // Check columns within +3 range
          .eq('Floorid', floorId);


        if (roomError) {
          throw roomError;
        }

        if (roomData && roomData.length > 0) {
          // Access roomname from the first object in the array
          const roomName = roomData[0].roomname;
          Alert.alert(
            'Room Details',
            `Room Name: ${roomName}\nRow: ${row}\nColumn: ${col}`,
            [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
          );
        } else {
          // If no room data found, you can handle this case as needed
          console.log('No room data found for the clicked cell.');
        }
      } else {
        // If the clicked cell does not contain an image, do nothing
        console.log('Clicked cell does not contain an image.');
      }
    } catch (error) {
      console.error('Error fetching room data:', error.message);
    }
  };

  const hasPath = (row, col) => {
    // Check if the given row and column are within the bounds of the grid
    if (row < 0 || row >= gridData.length || col < 0 || col >= gridData[0].length) {
      return false; // Out of bounds, so there's no path
    }

    // Check if the cell at the given row and column contains a path
    return gridData[row][col] === 'path';
  };

  const userMove = async (direction) => {
    try {
      let newRow = userRow;
      let newCol = userCol;
      const maxSteps = 5;
      let step = 0;
      let imageFound = false;

      // Define the movement deltas based on the direction
      let primaryDeltaRow = 0;
      let primaryDeltaCol = 0;

      if (direction === 'front') {
        primaryDeltaRow = 1; // Move downwards
      } else if (direction === 'back') {
        primaryDeltaRow = -1; // Move upwards
      } else if (direction === 'right') {
        primaryDeltaCol = 1; // Move rightwards
      } else if (direction === 'left') {
        primaryDeltaCol = -1; // Move leftwards
      }

      // Variable to store the last valid location
      let lastValidRow = userRow;
      let lastValidCol = userCol;

      // Track the last position to avoid moving backward
      let prevRow;
      let prevCol;

      while (step < maxSteps) {
        const nextRow = newRow + primaryDeltaRow;
        const nextCol = newCol + primaryDeltaCol;

        // Check if the next move is out of bounds or not a valid path
        if (
          nextRow < 0 || nextCol < 0 ||
          nextRow >= gridData.length ||
          nextCol >= gridData[0].length ||
          !hasPath(nextRow, nextCol)
        ) {
          break;
        }

        // Check to prevent moving back to the previous position
      if ((direction !== 'back') && (nextRow === prevRow && nextCol === prevCol)) {
          break;
        }

        // Update the last valid location before the move
        lastValidRow = newRow;
        lastValidCol = newCol;

        // Update the new position
        newRow = nextRow;
        newCol = nextCol;
        step++;

        // Check for image or staircase between steps
        if (await fetchImage(newRow, newCol) || await fetchImage(newRow, newCol - 1)) {
          imageFound = true;
          break;
        }

        // Define next cells to check for interaction
        const nextFrontCell = { row: newRow + 1, col: newCol };
        const nextLeftCell = { row: newRow, col: newCol - 1 };
        const nextRightCell = { row: newRow, col: newCol + 1 };

        // Calculate the back cell relative to the current movement direction
        const nextBackCell = { row: newRow - 1, col: newCol };

        // Check if these cells are valid paths
        const nextIsFrontValid = hasPath(nextFrontCell.row, nextFrontCell.col);
        const nextIsLeftValid = hasPath(nextLeftCell.row, nextLeftCell.col);
        const nextIsRightValid = hasPath(nextRightCell.row, nextRightCell.col);
        const nextIsBackValid = hasPath(nextBackCell.row, nextBackCell.col);

        // Count valid interactions, including the back cell
        const nextInteractionCount = [
          nextIsFrontValid,
          nextIsLeftValid,
          nextIsRightValid,
          nextIsBackValid
        ].filter(Boolean).length;

        if (nextInteractionCount >= 3) {
          break;
        }

        // Update the previous position to the current position before the next move
        prevRow = lastValidRow;
        prevCol = lastValidCol;
      }

      // Update user's location based on the last valid position
      setUserRow(newRow);
      setUserCol(newCol);

      if (imageFound) {
        Alert.alert('Image found at the new location');
      }

      // Return the last valid location
      return { lastValidRow, lastValidCol };
    } catch (error) {
      console.error('Error moving user:', error);
    }
  };


  const isCellInPath = (rowIndex, colIndex) => {
    return path.some(cell => cell.row === rowIndex && cell.col === colIndex);
  };

  const handleSameFloorPath = async (fromRoom, toRoom) => {
    try {
      // Fetch room information for the "From" room
      const { data: roomRowFrom, error: rowErrorFrom } = await supabase
        .from('Room')
        .select('row')
        .eq('roomname', fromRoom);

      if (rowErrorFrom) {
        throw rowErrorFrom;
      }

      const { data: roomColFrom, error: colErrorFrom } = await supabase
        .from('Room')
        .select('col')
        .eq('roomname', fromRoom);

      if (colErrorFrom) {
        throw colErrorFrom;
      }

      const selectedFromRoomRow = roomRowFrom[0].row;
      const selectedFromRoomCol = roomColFrom[0].col;

      // Fetch room information for the "To" room
      const { data: roomRowTo, error: rowErrorTo } = await supabase
        .from('Room')
        .select('row')
        .eq('roomname', toRoom);

      if (rowErrorTo) {
        throw rowErrorTo;
      }

      const { data: roomColTo, error: colErrorTo } = await supabase
        .from('Room')
        .select('col')
        .eq('roomname', toRoom);

      if (colErrorTo) {
        throw colErrorTo;
      }

      const selectedToRoomRow = roomRowTo[0].row;
      const selectedToRoomCol = roomColTo[0].col;

      // Find the closest path from the "From" room to the "To" room and mark it as red
      const closestCells = await markClosestCellAsRed([
        { row: selectedFromRoomRow, col: selectedFromRoomCol },
        { row: selectedToRoomRow, col: selectedToRoomCol }
      ]);

      settoRow(closestCells.toRoom.row);

      settoCol(closestCells.toRoom.col);
      console.log("closet from", closestCells.fromRoom.row)
      console.log("closet from", torow, tocol)

      setUserRow(closestCells.fromRoom.row);
      setUserCol(closestCells.fromRoom.col);
      fetchImage(userRow, userCol)
      // Find the path from the "From" room to the "To" room
      await findAndSetPath(gridData, closestCells.fromRoom, closestCells.toRoom);

      // Additional logic if needed...

    } catch (error) {
      console.error('Error handling same floor path:', error);
    }
  };
  const isCellInUser = (rowIndex, colIndex) => {
    return userRow === rowIndex && userCol === colIndex;
  };

  const handleDifferentFloorPath = async (fromRoom, toRoom) => {
    try {
      // Fetch row and column for the "From" room
      const { data: roomRowFrom, error: rowErrorFrom } = await supabase
        .from('Room')
        .select('row')
        .eq('roomname', fromRoom);

      if (rowErrorFrom) throw rowErrorFrom;

      const { data: roomColFrom, error: colErrorFrom } = await supabase
        .from('Room')
        .select('col')
        .eq('roomname', fromRoom);

      if (colErrorFrom) throw colErrorFrom;

      const selectedFromRoomRow = roomRowFrom[0].row;
      const selectedFromRoomCol = roomColFrom[0].col;


      for (let row = 0; row < gridData.length; row++) {
        for (let col = 0; col < gridData[row].length; col++) {
          if (gridDatafors[row][col] === 1 || gridDatafors[row][col] === 2) {
            staircaseCoordinates.push({ row, col });
          }
        }
      }

      if (staircaseCoordinates.length === 0) throw new Error("Staircase coordinates not found.");

      // Find the closest staircase coordinate
      let closestStaircase = null;
      let minDistance = Infinity;
      for (const staircase of staircaseCoordinates) {
        const distance = Math.abs(staircase.row - selectedFromRoomRow) + Math.abs(staircase.col - selectedFromRoomCol);
        if (distance < minDistance) {
          minDistance = distance;
          closestStaircase = staircase;
        }
      }

      const closestCells = await markClosestCellAsRed([
        { row: selectedFromRoomRow, col: selectedFromRoomCol },
        closestStaircase
      ]);

      setUserRow(closestCells.fromRoom.row);
      setUserCol(closestCells.fromRoom.col);
      const stairrow = closestCells.toRoom.row;
      const staircol = closestCells.toRoom.col;

      await findAndSetPath(gridData, closestCells.fromRoom, closestCells.toRoom);

      // Alert the user to proceed to the staircase
      Alert.alert(
        'Attention',
        'Please proceed to the nearest staircase to reach the desired floor.',
        [{
          text: 'OK', onPress: async () => {
            console.log('User acknowledged to proceed to staircase');
            await handleUserReachedStaircase(toRoom, stairrow, staircol);
          }
        }]
      );

    } catch (error) {
      console.error('Error handling different floor path:', error);
    }
  };


  const handleUserReachedStaircase = async (toRoom, stairrow, staircol) => {
    try {
      const { data: floorIdData, error: floorIdError } = await supabase
        .from('Room')
        .select('Floorid')
        .eq('roomname', toRoom);

      if (floorIdError) throw floorIdError;
      if (floorIdData.length === 0) throw new Error(`Room ${toRoom} not found`);

      const selectedFloorId = floorIdData[0].Floorid;

      const { data: floorNoData, error: floorNoError } = await supabase
        .from('Floor')
        .select('No')
        .eq('id', selectedFloorId);

      if (floorNoError) throw floorNoError;
      if (floorNoData.length === 0) throw new Error(`Floor number not found for FloorId ${selectedFloorId}`);

      const toFloorNo = floorNoData[0].No;

      Alert.alert(
        'Attention',
        `You have reached the staircase. Please go to floor number ${toFloorNo}.`,
        [{
          text: 'OK', onPress: async () => {
            console.log('OK pressed');
            No = toFloorNo;

            await fetchData();
            await fetchGridData();

            await handleSameFloorPathstair(toRoom, stairrow, staircol);
          }
        }]
      );

    } catch (error) {
      console.error('Error handling user reached staircase:', error);
    }
  };

  const handleSameFloorPathstair = async (toRoom, stairrow, staircol) => {
    try {
      // Fetch the row and column for the "To" room
      const { data: roomRowData, error: roomRowError } = await supabase
        .from('Room')
        .select('row')
        .eq('roomname', toRoom)
        ;
      const { data: roomColData, error: roomColError } = await supabase
        .from('Room')
        .select('col')
        .eq('roomname', toRoom);

      if (roomRowError || roomColError) {
        throw roomRowError || roomColError;
      }
      let selectedToRoomRow = roomRowData[0].row;
      let selectedToRoomCol = roomColData[0].col;

      // Fetch grid data for the current room

      // Fetch grid data for the destination room
      const toRoomGridData = await fetchGridDataForRoom(floorId);

      // Find the staircase coordinates for the destination room
      let staircaseCoordinates = [];
      for (let row = 0; row < toRoomGridData.length; row++) {
        for (let col = 0; col < toRoomGridData[row].length; col++) {
          if (toRoomGridData[row][col] === 1 || toRoomGridData[row][col] === 2) {
            staircaseCoordinates.push({ row, col });
          }
        }
      }

      if (staircaseCoordinates.length === 0) {
        throw new Error("Staircase coordinates not found.");
      }

      // Find the closest staircase coordinate to the previous one
      let closestStaircase = null;
      let minDistance = Infinity;
      for (const staircase of staircaseCoordinates) {
        const distance = Math.abs(staircase.row - stairrow) + Math.abs(staircase.col - staircol);
        if (distance < minDistance) {
          minDistance = distance;
          closestStaircase = staircase;
        }
      }
      console.log(closestStaircase, "staircase")
      if (!closestStaircase) {
        throw new Error("No staircase found.");
      }

      const newStairRow = closestStaircase.row;
      const newStairCol = closestStaircase.col;
      console.log(newStairRow, newStairCol, "newstairrow")
      await fetchGridDatato(floorId)
      // Find the closest path from the staircase to the destination room
      const closestCells = await markClosestCellAsRed([
        { row: newStairRow, col: newStairCol },
        { row: selectedToRoomRow, col: selectedToRoomCol }
      ]);
      userRow = closestCells.fromRoom.row;
      userCol = closestCells.fromRoom.col;
      console.log(userRow, userCol, "userrrrrr")
      settoRow(closestCells.toRoom.row);
      settoCol(closestCells.toRoom.col);
      console.log(closestCells.toRoom, "torrommmmm")
      // Find the path from the staircase to the destination room
      await findAndSetPath(gridData, { row: userRow, col: userCol }, closestCells.toRoom);

    } catch (error) {
      console.error('Error handling same floor path stair:', error);
    }
  };
  const fetchGridDataForRoom = async (roomId) => {
    try {
      const collegeId = await AsyncStorage.getItem('CampusId');
      const { data, error } = await supabase
        .from('maps')
        .select('grid')
        .eq('floorid', roomId) // Adjust the filter as per your requirement
        .eq('Campusid', collegeId)
        .single();

      if (error) {
        throw error;
      }
      if (data) {
        console.log(data.grid, "procccc")
        return data.grid;
      }
      return null;
    } catch (error) {
      console.error('Error fetching grid data:', error);
      return null;
    }
  };

  const fetchGridDatato = async (floorId) => {
    try {
      const collegeId = await AsyncStorage.getItem('CampusId');
      const { data, error } = await supabase
        .from('maps')
        .select('grid')
        .eq('floorid', floorId) // Adjust the column name as per your Supabase schema
        .eq('Campusid', collegeId);

      if (error) {
        throw error;
      }

      if (data) {
        ;
        // Ensure that each cell in the grid contains a valid source for the Image component
        const processedGridData = data[0].grid.map(row => row.map(cell => {
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
        gridData = processedGridData;
      }

    } catch (error) {
      console.error('Error fetching grid data from Supabase:', error);
    }
  };

  const handleFromRoomSelect = async (selectedRoom, onClose) => {
    try {
      setFromRoom(selectedRoom);
      const { data: floorIdFrom, error: floorErrorFrom } = await supabase
        .from('Room')
        .select('Floorid')
        .eq('roomname', selectedRoom);

      if (floorErrorFrom) throw floorErrorFrom;

      const { data: floornoTo, error: floornoeTo } = await supabase
        .from('Floor')
        .select('No')
        .eq('id', floorIdFrom[0].Floorid);

      if (floornoeTo) throw floorErrorFrom;

      No = floornoTo[0].No;
      setNo(No);
      await fetchData();
      await fetchGridData();
      fetchRoomData();
      fetchImageCol();
      fetchImageRowAndCol();

      // Fetch room information for the selected room
      const { data: roomRow, error: rowError } = await supabase
        .from('Room')
        .select('row')
        .eq('roomname', selectedRoom);

      if (rowError) throw rowError;

      const { data: roomCol, error: colError } = await supabase
        .from('Room')
        .select('col')
        .eq('roomname', selectedRoom);

      if (colError) throw colError;

      const selectedRoomRow = roomRow[0].row;
      const selectedRoomCol = roomCol[0].col;

      // If the selected room is "Your Location", save the user's current position as the "From" position
      if (selectedRoom === 'Your Location') {

        fromRoomrow = userRow;
        fromRoomcol = userCol;
      } else {
        fromRoomrow = selectedRoomRow;
        fromRoomcol = selectedRoomCol;
      }
      console.log(fromRoomrow, fromRoomcol, selectedRoomRow, selectedRoomCol)
      const imageExists = await imageexist(fromRoomrow, fromRoomcol);

      if (imageExists) {
        fetchImage(fromRoomrow, fromRoomcol);
      }
      else {
        console.log("noo image")
      }
      onClose();
    } catch (error) {
      console.error('Error handling "From" room selection:', error);
    }
  };

  const handleToRoomSelect = async (selectedRoom, onClose) => {
    try {
      setToRoom(selectedRoom);
      // Fetch floor information for the selected rooms
      const { data: floorIdFrom, error: floorErrorFrom } = await supabase
        .from('Room')
        .select('Floorid')
        .eq('roomname', fromRoom);

      if (floorErrorFrom) throw floorErrorFrom;

      const { data: floorIdTo, error: floorErrorTo } = await supabase
        .from('Room')
        .select('Floorid')
        .eq('roomname', selectedRoom);

      if (floorErrorTo) throw floorErrorTo;

      const selectedFloorIdFrom = floorIdFrom[0].Floorid;
      const selectedFloorIdTo = floorIdTo[0].Floorid;
      const { data: floornoTo, error: floornoeTo } = await supabase
        .from('Floor')
        .select('No')
        .eq('id', selectedFloorIdTo);

      if (floornoeTo) throw floorErrorTo;

      setFloorToNo(floornoTo[0].No);

      // Check if the selected rooms are on the same floor
      if (selectedFloorIdFrom === selectedFloorIdTo) {
        isDifferentFloor = true;
        await handleSameFloorPath(fromRoom, selectedRoom);
      } else {
        isDifferentFloor = false;
        await handleDifferentFloorPath(fromRoom, selectedRoom);
      }
      onClose();
    } catch (error) {
      console.error('Error handling selection of To room:', error);
    }
  };

  const CustomFromRoomDialog = ({ visible, onClose, roomOptions, onSelect }) => {
    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.dialogContainer}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Select From Room</Text>
            <ScrollView style={styles.dropdown}>
              {roomOptions.map((room, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdown}
                  onPress={() => {
                    onSelect(room);
                    onClose();
                  }}
                >
                  <Text>{room}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const CustomToRoomDialog = ({ visible, onClose, roomOptions, onSelect }) => {
    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.dialogContainer}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Select To Room</Text>
            <ScrollView style={styles.dropdown}>
              {roomOptions.map((room, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdown}
                  onPress={() => {
                    onSelect(room);
                    onClose();
                  }}
                >
                  <Text>{room}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };
  // Function to find a cell in the path data array
  // Function to determine arrow icon based on adjacent cells and path data
  function getArrowIcon(rowIndex, colIndex) {
    const currentCell = { row: rowIndex, col: colIndex };
    const currentIndex = path.findIndex(cell => cell.row === currentCell.row && cell.col === currentCell.col);
  
    if (currentIndex === -1) {
      // The current cell is not part of the path
      return null;
    }
  
    const nextCell = path[currentIndex + 1];
    const prevCell = path[currentIndex - 1];
  
    if (nextCell) {
      if (nextCell.row === currentCell.row && nextCell.col === currentCell.col + 1) {
        return require('./../../assets/images/right.png');
      } else if (nextCell.row === currentCell.row && nextCell.col === currentCell.col - 1) {
        return require('./../../assets/images/left.png');
      } else if (nextCell.row === currentCell.row - 1 && nextCell.col === currentCell.col) {
        return require('./../../assets/images/uparrow.png');
      } else if (nextCell.row === currentCell.row + 1 && nextCell.col === currentCell.col) {
        return require('./../../assets/images/downarrowr.png');
      }
    }
  
    if (prevCell) {
      if (prevCell.row === currentCell.row && prevCell.col === currentCell.col + 1) {
        return require('./../../assets/images/left.png');
      } else if (prevCell.row === currentCell.row && prevCell.col === currentCell.col - 1) {
        return require('./../../assets/images/right.png');
      } else if (prevCell.row === currentCell.row - 1 && prevCell.col === currentCell.col) {
        return require('./../../assets/images/downarrowr.png');
      } else if (prevCell.row === currentCell.row + 1 && prevCell.col === currentCell.col) {
        return require('./../../assets/images/uparrow.png');
      }
    }
  
    // Default case if no adjacent path cells are found
    return null;
  }
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#9fedd7' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardShouldPersistTaps='handled'>
        <View style={styles.container}>
          <View style={styles.goToButtonContainer}>
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                fromRoom !== '' && styles.activeButton,
              ]}
              onPress={() => setIsFromDropdownVisible(true)}>
              <Text style={styles.dropdownButtonText}>
                {fromRoom !== '' ? fromRoom : 'Select From Room'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dropdownButton,
                fromRoom === '' && styles.disabledButton,
                toRoom !== '' && styles.activeButton,
              ]}
              onPress={() => fromRoom !== '' && setIsToDropdownVisible(true)}
              disabled={fromRoom === ''}>
              <Text style={styles.dropdownButtonText}>
                {toRoom !== '' ? toRoom : 'Select To Room'}
              </Text>
            </TouchableOpacity>

            <CustomFromRoomDialog
              visible={isFromDropdownVisible}
              onClose={() => setIsFromDropdownVisible(false)}
              onSelect={(room) => handleFromRoomSelect(room, () => setIsFromDropdownVisible(false))}
              roomOptions={roomData}
            />

            <CustomToRoomDialog
              visible={isToDropdownVisible}
              onClose={() => setIsToDropdownVisible(false)}
              onSelect={(room) => handleToRoomSelect(room, () => setIsToDropdownVisible(false))}
              roomOptions={roomData}
            />
          </View>

          {panoramaImageUrl && (
            <ImageZoom
              cropWidth={screenWidth}
              cropHeight={300}
              imageWidth={screenWidth}
              imageHeight={300}
              maxOverflow={0}
              minScale={1}
              doubleClickInterval={10}
              centerOn={{
                x: screenWidth / 2,
                y: 300 / 2,
                scale: 1,
                duration: 3,
              }}
              style={styles.imageZoom}
              enableCenterFocus={true}
              centerOnZoomOut={true}
              enableDoubleClickZoom={true}>
              <Image
                source={{ uri: panoramaImageUrl }}
                style={{ width: screenWidth, height: 350 }}
                resizeMode='contain'
              />
            </ImageZoom>
          )}

          <View style={styles.navigationButtonsContainer}>
            <TouchableOpacity style={styles.directionButton} onPress={() => userMove('front')}>
              <Text style={styles.directionButtonText}>Front</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.directionButton} onPress={() => userMove('back')}>
              <Text style={styles.directionButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.directionButton} onPress={() => userMove('right')}>
              <Text style={styles.directionButtonText}>Right</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.directionButton} onPress={() => userMove('left')}>
              <Text style={styles.directionButtonText}>Left</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.directionButton} onPress={() => changeDirection('up')}>
              <Text style={styles.directionButtonText}>Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.directionButton} onPress={() => changeDirection('down')}>
              <Text style={styles.directionButtonText}>Down</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gridContainer}>
            {gridData.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((cell, colIndex) => (
                  <TouchableOpacity
                    key={colIndex}
                    style={[
                      styles.cell,
                      isCellInUser(rowIndex, colIndex) && styles.cellBlue,
                    ]}
                    onPress={() => handleGridCellClick(rowIndex, colIndex)}>
                    {cell === 'path' && isCellInPath(rowIndex, colIndex) && (
                      <Image source={getArrowIcon(rowIndex, colIndex, gridData, path)} style={styles.pathIcon} />
                    )}
                    {cell === 'path' ? (
                      <View style={styles.path} />
                    ) : cell ? (
                      <Image source={cell} style={styles.image} />
                    ) : (
                      <View style={styles.placeholder} />
                    )}
                    {userRow === rowIndex && userCol === colIndex && (
                      <View style={styles.userIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {isAlertVisible && (
            Alert.alert(
              'No Image Available',
              'There is no image available for the current location.',
              [{ text: 'OK', onPress: () => setIsAlertVisible(false) }]
            )
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9fedd7',
    marginTop: 30,
  },
  dropdownButton: {
    width: 180,
    height: 40,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderWidth: 1,// Default to transparent border
  },
  
  activeButton: {
    backgroundColor:'#fce181',
     // Border color when active
  },
  disabledButton: {
backgroundColor:'#9fedd7' // Border color when disabled
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  cellBlue: {
    backgroundColor: 'blue',
  },
  userIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'blue',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -5 }, { translateY: -5 }],
  },
  customAlertContent: {
    backgroundColor: 'white',
    borderRadius: 10,
  },
  roomInput: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  gridContainer: {
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor:'white'
  },
  row: {
    flexDirection: 'row',
  },
  dialog: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    maxHeight: 400,
    overflow: 'scroll',
  },
  pathIcon: {
    width: 10,
    height: 10,
    position: 'relative',
    top: '100%',
    left: '100%',
    backgroundColor: 'white',
    transform: [{ translateX: -7 }, { translateY: -5 }],
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
  customAlertContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellRed: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  customAlert: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  customAlertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  customAlertOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  circle: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    fontSize: 24,
    color: 'white',
  },
  path: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  navigationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  directionButton: {
    marginHorizontal: 2,
    margin: 5,
    padding: 15,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  directionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  goToButtonContainer: {
    top: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});