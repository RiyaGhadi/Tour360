import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Dimensions, Alert, Image, StyleSheet, Text, ScrollView, TextInput, ImageBackground, Modal } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import * as Location from 'expo-location';
import * as Crypto from 'expo-crypto';
import { BlurView } from 'expo-blur';
// Initialize Supabase client
const supabase = createClient('https://yinihqkmqtemokvacipf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpbmlocWttcXRlbW9rdmFjaXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNjM4NTEsImV4cCI6MjAyMzYzOTg1MX0.SPb-xP8uhX94OTaAepQEX6o0c3gj-okkbEIdXT9Xxpw');

const screenWidth = Dimensions.get('window').width;

export default function Edit() {
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
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [activeSection, setActiveSection] = useState('Profile'); // Default active section
    const [isAddingFloor, setIsAddingFloor] = useState(false); // State for showing/hiding add floor modal
    const [editingFloorId, setEditingFloorId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editNo, setEditNo] = useState('');
    const [newNo, setNewNo] = useState('');
    const [entryPoints, setEntryPoints] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');// State to keep track of entry points for each floor
    const [isSettingRoomPoint, setIsSettingRoomPoint] = useState(false); // State to differentiate between setting room names and entry points
    const [isSettingEntryPoint, setIsSettingEntryPoint] = useState(false); // State to keep track of entry points for each floor
    let filename

    useEffect(() => {
        fetchUserData();
        // Retrieve campusId from AsyncStorage
        AsyncStorage.getItem('campusId')
            .then(idObject => {
                const campusId = JSON.parse(idObject);
                setCampusId(campusId);
                // Fetch total number of floors using campusId
                fetchFloors(campusId);

                fetchEntryPoints(campusId);
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

    // Function to handle fetching floors
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

            // After fetching floors, if there's a saved floor, fetch its grid data
            if (data.length > 0) {
                const firstFloorId = data[0].id; // Assuming the first floor as default
                handleFloorSelection(firstFloorId); // Select the first floor by default
            }
        } catch (error) {
            console.error('Error fetching floors from Supabase:', error);
            Alert.alert('Error', 'Failed to fetch floors from Supabase');
        }
    };

    // Function to fetch grid data for a specific floor
    const fetchGridData = async (floorId) => {
        try {
            const { data, error } = await supabase
                .from('maps')
                .select('grid')
                .eq('floorid', floorId)
                .single();

            if (error) {
                throw error;
            }

            // Update the grid state with fetched data
            if (data) {
                setGrid(data.grid);
            } else {
                // If no data found, initialize with an empty grid
                setGrid(Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => null)));
            }
        } catch (error) {
            console.error('Error fetching grid data:', error);
            Alert.alert('Error', 'Failed to fetch grid data from Supabase');
        }
    };

    // Function to handle floor selection
    const handleFloorSelection = (floorId) => {
        setSelectedFloorId(floorId);
        fetchGridData(floorId); // Fetch grid data for the selected floor
    };
    const handleFloorSelectionfloor = (floorId) => {
        setSelectedFloorId(floorId); // Fetch grid data for the selected floor
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
    // Function to update the grid data on Supabase
    const updateMap = async () => {
        if (!selectedFloorId) {
            Alert.alert('Select a floor', 'Please select a floor to save.');
            return;
        }

        // Save the grid for the selected floor
        saveGridToSupabase(selectedFloorId);
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

    const handleSingleTapGridLO = (row, col) => {
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

        } catch (error) {
            console.error('Error saving entry data to Supabase:', error);
            Alert.alert('Error', 'Failed to save entry data to Supabase');
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

    const saveGridToSupabase = async (floorId) => {
        try {
            // Check if a grid already exists for the specified floor
            const { data: existingGrid, error: fetchError } = await supabase
                .from('maps')
                .select('*')
                .eq('floorid', floorId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no data found
                throw fetchError;
            }

            let data, error;
            if (existingGrid) {
                // If a grid already exists, update it
                ({ data, error } = await supabase
                    .from('maps')
                    .update({ grid: grid })
                    .eq('floorid', floorId));
            } else {
                // If no grid exists, insert a new one
                ({ data, error } = await supabase.from('maps').insert([
                    {
                        floorid: floorId,
                        grid: grid,
                        Campusid: campusId
                    },
                ]));
            }

            if (error) {
                throw error;
            }

            console.log('Data saved to Supabase successfully:', data);
            Alert.alert('Success', `Data for floor ${existingGrid ? 'updated' : 'saved'} to Supabase successfully`);

            // Add the floorId to the saved floors list
            setSavedFloors([...savedFloors, floorId]);

            // Reset the grid to an empty grid
            setGrid(Array.from({ length: initialGridSize }, () => Array.from({ length: initialGridSize }, () => null)));

        } catch (error) {
            console.error('Error saving data to Supabase:', error);
            Alert.alert('Error', 'Failed to save data to Supabase');
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
    const saveProfile = async () => {
        if (!validateFields()) {
            return;
        }

        try {
            const userIdString = await AsyncStorage.getItem('id');

            // Parse the JSON string to extract the id property
            const userIdObject = JSON.parse(userIdString);
            const userId = userIdObject;

            const { data, error } = await supabase
                .from('User')
                .update({
                    name: name,
                    surname: surname,
                    email: email,
                })
                .eq('id', userId)
                .single();

            if (error) {
                throw error;
            }

            Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
        } catch (error) {
            console.error('Error updating profile:', error.message);
            Alert.alert('Error', 'Failed to update profile.');
        }
    };
    const updatePassword = async () => {
        try {
          // Validate input fields
          if (!currentPassword || !newPassword || !confirmNewPassword) {
            Alert.alert('Incomplete Form', 'Please fill out all fields.');
            return;
          }
    
          if (newPassword !== confirmNewPassword) {
            Alert.alert('Passwords do not match', 'Please make sure new passwords match.');
            return;
          }
    
          // Retrieve userId from AsyncStorage
          const userIdString = await AsyncStorage.getItem('id');
          const userIdObject = JSON.parse(userIdString);
          const userId = userIdObject;
    
          // Fetch user's current hashed password from your database
          const { data: userData, error: userError } = await supabase
            .from('User')
            .select('password')
            .eq('id', userId)
            .single();
    
          if (userError) {
            throw userError;
          }
    
          // Compare hashed current password with provided current password
          const hashedCurrentPassword = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            currentPassword
          );
    
          if (userData.password !== hashedCurrentPassword) {
            throw new Error('Invalid current password.');
          }
    
          // Hash new password before updating in database
          const hashedNewPassword = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            newPassword
          );
    
          // Update password in your database
          const { data: updatedUser, updateError } = await supabase
            .from('User')
            .update({
              password: hashedNewPassword,
            })
            .eq('id', userId)
            .single();
    
          if (updateError) {
            throw updateError;
          }
    
          Alert.alert('Password Updated', 'Your password has been updated successfully.');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
        } catch (error) {
          console.error('Error updating password:', error.message);
          Alert.alert('Error', 'Failed to update password. Please check your current password and try again.');
        }
      };
    const validateFields = () => {
        if (!name.trim()) {
            Alert.alert('Name is required', 'Please enter your name.');
            return false;
        }
        if (!surname.trim()) {
            Alert.alert('Surname is required', 'Please enter your surname.');
            return false;
        }
        if (!validateEmail(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return false;
        }
        return true;
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const renderProfileSection = () => {
        return (
            <GestureHandlerRootView style={styles.container}>
                <View style={{
                    flex: 1,
                    width: '100%',
                }}>
                    <Text style={styles.sectionTitle}>Profile Section</Text>
                    <TextInput
                        style={{
                            height: 40,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 5,
                            marginBottom: 10,
                            paddingHorizontal: 10,
                        }}
                        placeholder="Name"
                        value={name}
                        onChangeText={setName}
                    />

                    <TextInput
                        style={{
                            height: 40,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 5,
                            marginBottom: 10,
                            paddingHorizontal: 10,
                        }}
                        placeholder="Surname"
                        value={surname}
                        onChangeText={setSurname}
                    />

                    <TextInput
                        style={{
                            height: 40,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 5,
                            marginBottom: 10,
                            paddingHorizontal: 10,
                        }}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <TouchableOpacity style={{
                        backgroundColor: 'blue',
                        paddingVertical: 12,
                        borderRadius: 5,
                        alignItems: 'center',
                        marginTop: 10,
                    }} onPress={saveProfile}>
                        <Text style={styles.buttonText}>Save Profile</Text>
                    </TouchableOpacity>

                    <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        marginTop: 10,
                        marginBottom: 5,
                    }}>Update Password</Text>
                    <TextInput
                        style={{
                            height: 40,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 5,
                            marginBottom: 10,
                            paddingHorizontal: 10,
                        }}
                        placeholder="Current Password"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry={true}
                    />
                    <TextInput
                        style={{
                            height: 40,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 5,
                            marginBottom: 10,
                            paddingHorizontal: 10,
                        }}
                        placeholder="New Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={true}
                    />
                    <TextInput
                        style={{
                            height: 40,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 5,
                            marginBottom: 10,
                            paddingHorizontal: 10,
                        }}
                        placeholder="Confirm New Password"
                        value={confirmNewPassword}
                        onChangeText={setConfirmNewPassword}
                        secureTextEntry={true}
                    />
                    <TouchableOpacity style={{
                        backgroundColor: 'blue',
                        paddingVertical: 12,
                        borderRadius: 5,
                        alignItems: 'center',
                        marginTop: 10,
                    }} onPress={updatePassword}>
                        <Text style={styles.buttonText}>Update Password</Text>
                    </TouchableOpacity>
                </View>
            </GestureHandlerRootView>
        );
    };

    const fetchUserData = async () => {
        try {

            const userIdString = await AsyncStorage.getItem('id');

            // Parse the JSON string to extract the id property
            const userIdObject = JSON.parse(userIdString);
            const userId = userIdObject;

            // Query user table using the retrieved user ID
            const { data, error } = await supabase
                .from('User')
                .select('name, email, surname') // Include the image URL in the selection
                .eq('id', userId)
                .single();

            if (error) {
                throw error;
            }

            if (data) {
                setName(data.name);
                setSurname(data.surname);
                setEmail(data.email);
            }
        } catch (error) {
            console.error('Error fetching user data:', error.message);
            Alert.alert('Error', 'Failed to fetch user data.');
        }
    };

    const fetchGridDataLo = async (floorId) => {
        try {
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
    // Add a new floor
    const addFloor = async () => {
        try {
            // Insert the new floor into Supabase
            const { data, error } = await supabase
                .from('Floor')
                .insert([{ Floorname: name, No: newNo, Campusid: campusId }]);

            if (error) {
                throw error;
            }

            console.log('Floor added successfully:', data);

            // Refresh the floor list and reset form
            fetchFloors(campusId);
            setName('');
            setNewNo(''); // Reset the floor number input
            setIsAddingFloor(false);
        } catch (error) {
            console.error('Error adding floor:', error);
            Alert.alert('Error', 'Failed to add floor');
        }
    };

    // Toggle edit mode for a selected floor
    const toggleEditFloor = async (floorId) => {
        try {
            const { data, error } = await supabase
                .from('Floor')
                .select('Floorname, No') // Include No for fetching
                .eq('id', floorId)
                .single();

            if (error) {
                throw error;
            }

            setEditingFloorId(floorId);
            setEditName(data.Floorname);
            setEditNo(data.No); // Set the fetched floor number
        } catch (error) {
            console.error('Error fetching floor data for edit:', error);
            Alert.alert('Error', 'Failed to fetch floor data for edit');
        }
    };

    // Update the selected floor's details
    const updateFloor = async () => {
        try {
            // Update the floor in Supabase
            const { data, error } = await supabase
                .from('Floor')
                .update([{ Floorname: editName, No: editNo }]) // Update No as well
                .eq('id', editingFloorId);

            if (error) {
                throw error;
            }

            console.log('Floor updated successfully:', data);

            // Refresh the floor list and reset edit form
            fetchFloors(campusId);
            setEditingFloorId(null);
            setEditName('');
            setEditNo(''); // Reset the floor number input
        } catch (error) {
            console.error('Error updating floor:', error);
            Alert.alert('Error', 'Failed to update floor');
        }
    };


    const deleteFloor = async () => {
        if (!selectedFloorId) {
            Alert.alert('Select a floor', 'Please select a floor to delete.');
            return;
        }

        // Confirm deletion with the user
        Alert.alert(
            'Delete Floor',
            'Are you sure you want to delete this floor?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { data, error } = await supabase
                                .from('Floor')
                                .delete()
                                .eq('id', selectedFloorId);

                            if (error) {
                                throw error;
                            }

                            console.log('Floor deleted successfully:', data);

                            // Refresh the floor list after deletion
                            fetchFloors(campusId);

                            // Reset the selected floor
                            setSelectedFloorId(null);

                            Alert.alert('Success', 'Floor deleted successfully');
                        } catch (error) {
                            console.error('Error deleting floor:', error);
                            Alert.alert('Error', 'Failed to delete floor');
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const renderFloorManagementSection = () => {
        return (
            <GestureHandlerRootView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollView}>
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Floor Management Section</Text>
                        <Text style={styles.floorSelectionTitle}>Select Floor to Update</Text>
                        <ScrollView style={styles.floorSelectionContainer}>
                            {floors.map(floor => (
                                <TouchableOpacity
                                    key={floor.id}
                                    style={[styles.floorButton, selectedFloorId === floor.id ? styles.selectedFloorButton : null]}
                                    onPress={() => handleFloorSelectionfloor(floor.id)}
                                >
                                    <Text style={styles.floorButtonText}>{floor.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.addFloorButton} onPress={() => setIsAddingFloor(true)}>
                                <Text style={styles.buttonText}>Add Floor</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.editFloorButton} onPress={() => toggleEditFloor(selectedFloorId)}>
                                <Text style={styles.buttonText}>Edit Floor</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteFloorButton} onPress={deleteFloor}>
                                <Text style={styles.buttonText}>Delete Floor</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                {/* Modal for adding a new floor */}
                {isAddingFloor && (
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 150,
                        marginTop: 50
                    }}>
                        <View style={{
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
                            backgroundColor: 'rgba(255, 255, 255, 0.98)'
                        }}>
                            <Text style={styles.modalTitle}>Add New Floor</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Floorname"
                                value={name}
                                onChangeText={setName}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Floor Number"
                                value={newNo}
                                onChangeText={setNewNo}
                                keyboardType="numeric"
                            />
                            <View style={styles.modalButtonRow}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setIsAddingFloor(false)}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.addButton]}
                                    onPress={addFloor}
                                >
                                    <Text style={styles.buttonText}>Add Floor</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* Modal for editing a floor */}
                {editingFloorId && (
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 150,
                        marginTop: 50
                    }}>
                        <View style={{
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
                            backgroundColor: 'rgba(255, 255, 255, 0.98)'
                        }}>
                            <Text style={styles.modalTitle}>Edit Floor</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Floorname"
                                value={editName}
                                onChangeText={setEditName}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Floor Number"
                                value={editNo}
                                onChangeText={setEditNo}
                                keyboardType="numeric"
                            />
                            <View style={styles.modalButtonRow}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setEditingFloorId(null)}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={updateFloor}
                                >
                                    <Text style={styles.buttonText}>Update Floor</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </GestureHandlerRootView>
        );
    };
    const fetchEntryPoints = async (campusId) => {
        try {
            // Step 1: Fetch all floorIds associated with the given campusId
            const { data: floorData, error: floorError } = await supabase
                .from('Floor')
                .select('id') // Assuming 'id' is the column for floorId
                .eq('Campusid', campusId);

            if (floorError) {
                throw floorError;
            }

            // Extract floorIds from the fetched data
            const floorIds = floorData.map(floor => floor.id);

            if (floorIds.length === 0) {
                console.warn('No floors found for the given campusId');
                return;
            }

            // Step 2: Fetch entry points from the Image table for each floorId where direction is 'main'
            const { data: imageData, error: imageError } = await supabase
                .from('Image')
                .select('floorid, row, col')
                .in('floorid', floorIds) // Fetch entry points for all the floorIds
                .eq('direction', 'main');

            if (imageError) {
                throw imageError;
            }

            // Step 3: Update the entryPoints state with the fetched data
            const entryPoints = imageData.map(entry => ({
                floorId: entry.floorid,
                row: entry.row,
                col: entry.col
            }));

            setEntryPoints(entryPoints);

        } catch (error) {
            console.error('Error fetching entry points:', error);
            Alert.alert('Error', 'Failed to fetch entry points from Supabase');
        }
    };


    const renderGridSection = () => {
        return (
            <GestureHandlerRootView style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                {/* Display floor selection */}
                <Text style={styles.floorSelectionTitle}>Select Floor to Update</Text>
                <ScrollView style={styles.floorSelectionContainer}>
                    {floors.map(floor => (
                        <TouchableOpacity
                            key={floor.id}
                            style={[styles.floorButton, selectedFloorId === floor.id ? styles.selectedFloorButton : null]}
                            onPress={() => handleFloorSelection(floor.id)}
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
                        <Image source={require('./../../assets/images/up.png')} style={{ width: cellSize * 2, height: cellSize * 2, margin: 15 }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDoubleTapImage(2)}>
                        <Image source={require('./../../assets/images/down.png')} style={{ width: cellSize * 2, height: cellSize * 2, margin: 15 }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDoubleTapImage(3)}>
                        <Image source={require('./../../assets/images/Classroom .png')} style={{ width: cellSize * 3, height: cellSize * 3, margin: 15 }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDoubleTapImage(4)}>
                        <Image source={require('./../../assets/images/building.png')} style={{ width: cellSize * 3, height: cellSize * 3, margin: 15 }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDoubleTapImage(5)}>
                        <Image source={require('./../../assets/images/washroom.png')} style={{ width: cellSize * 2, height: cellSize * 2, margin: 15 }} />
                    </TouchableOpacity>
                    {/* Add more image buttons here */}
                </View>

                {/* Render buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.saveButton} onPress={updateMap}>
                        <Text style={styles.saveButtonText}>Update</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        backgroundColor: 'red',
                        padding: 10,
                        borderRadius: 20,
                        marginTop: 1,
                        marginBottom: 15,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '45%',
                    }} onPress={() => deleteFloorAndGrid(selectedFloorId)}>
                        <Text style={styles.saveButtonText}>Delete Floor</Text>
                    </TouchableOpacity>
                </View>

            </GestureHandlerRootView>
        );
    };
    const renderImageUploadSection = () => {
        return (
            <GestureHandlerRootView style={styles.container}>
                {/* Display floor selection */}
                <ScrollView style={styles.floorSelectionContainerLo}>
                    <Text style={styles.floorSelectionTitle}>Select Floor</Text>
                    {floors.map(floor => (
                        <TouchableOpacity
                            key={floor.id}
                            style={[styles.floorButton, selectedFloorId === floor.id ? styles.selectedFloorButton : null]}
                            onPress={() => {
                                setSelectedFloorId(floor.id);
                                console.log(floor.id);
                                fetchGridDataLo(floor.id);

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
                                            handleSingleTapGridLO(rowIndex, colIndex);
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
                                        style={styles.inputLo}
                                        placeholder="Room Name"
                                        value={roomName}
                                        onChangeText={setRoomName}
                                    />
                                )}
                                <TextInput
                                    style={styles.inputLo}
                                    placeholder="Latitude"
                                    value={latitude}
                                    onChangeText={setLatitude}
                                />
                                <TextInput
                                    style={styles.inputLo}
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
    };

    return (
        <ImageBackground
            source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp1R_3LRWcgJVv_zo-z-NJdXq7XXsqZdz28Q&usqp=CAU' }}
            style={styles.backgroundImage}
        >
            <GestureHandlerRootView style={styles.container}>
                {/* Tabs for different sections */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeSection === 'Profile' ? styles.activeTab : null]}
                        onPress={() => setActiveSection('Profile')}
                    >
                        <Text style={styles.tabText}>Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeSection === 'Floor ' ? styles.activeTab : null]}
                        onPress={() => setActiveSection('Floor Management')}
                    >
                        <Text style={styles.tabText}>Floor</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeSection === 'Grid' ? styles.activeTab : null]}
                        onPress={() => setActiveSection('Grid')}
                    >
                        <Text style={styles.tabText}>Grid</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeSection === 'Image' ? styles.activeTab : null]}
                        onPress={() => setActiveSection('Image')}
                    >
                        <Text style={styles.tabText}>Image Upload</Text>
                    </TouchableOpacity>
                </View>

                {/* Render active section based on tab selection */}
                {activeSection === 'Profile' && renderProfileSection()}
                {activeSection === 'Floor Management' && renderFloorManagementSection()}
                {activeSection === 'Grid' && renderGridSection()}
                {activeSection === 'Image' && renderImageUploadSection()}
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
        marginTop: 60,
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
        marginBottom: 10,
    },
    tabButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#4CAF50',
    },
    activeTab: {
        backgroundColor: '#2196F3',
    },
    tabText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        width: '80%',
        height: 40,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        marginBottom: 10,
        paddingLeft: 10,
    },
    saveButton: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 20,
        marginTop: 1,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: '45%',
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    cancelButton: {
        backgroundColor: '#757575',
    },
    addButton: {
        backgroundColor: '#4CAF50',
    },
    confirmButton: {
        backgroundColor: '#2196F3',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    floorSelectionContainer: {
        maxHeight: 150,
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 20,
        width: '100%',
    },
    floorButton: {
        padding: 10,
        marginBottom: 5,
        borderRadius: 25,
        borderColor: 'black',
        borderWidth: 2,
    },
    selectedFloorButton: {
        backgroundColor: '#7ed8fa',
    },
    floorButtonText: {
        fontSize: 16,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
    },

    imagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 1,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    addFloorButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: '30%',
    },
    editFloorButton: {
        backgroundColor: '#FFC107',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: '30%',
    },
    deleteFloorButton: {
        backgroundColor: '#F44336',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: '30%',
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
    floorSelectionContainerLo: {
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
    inputLo: {
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