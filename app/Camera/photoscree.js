import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';

const PhotoScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [flashToggle, setFlashToggle] = useState(false);
    const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
    const [hasPermission, setHasPermission] = useState(null);
    const cameraRef = useRef(null);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestPermissionsAsync();
            setHasPermission(status === 'granted');
            setLoading(false);
        })();
    }, []);

    const toggleFlash = () => {
        setFlashToggle(!flashToggle);
    };

    const toggleCameraType = () => {
        setCameraType(
            cameraType === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
        );
    };

    const takePhoto = async () => {
        if (cameraRef.current) {
            try {
                let photo = await cameraRef.current.takePictureAsync({ quality: 1 });
                console.log(photo);
            } catch (error) {
                console.error('Failed to take picture', error);
            }
        }
    };

    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} size="large" color="red" />;
    }

    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View style={styles.container}>
            <Camera
                style={styles.camera}
                type={cameraType}
                flashMode={flashToggle ? Camera.Constants.FlashMode.on : Camera.Constants.FlashMode.off}
                ref={cameraRef}
            />
            
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
        width: '100%',
    },
    button: {
        backgroundColor: 'transparent',
        padding: 15,
    },
    icon: {
        width: 30,
        height: 30,
    },
});

export default PhotoScreen;
