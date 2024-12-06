import {
    createElement,
    useEffect,
    useRef,
    useState
} from 'react'
import {
    StyleSheet,
    Text,
    Button,
    View,
    useWindowDimensions
} from 'react-native'
import {
    Frame,
    Camera as VisionCamera,
    useCameraDevice,
    useCameraPermission,
} from 'react-native-vision-camera'
import { useAppState } from '@react-native-community/hooks'
import {
    Camera,
    Face,
    FaceDetectionOptions
} from 'react-native-vision-camera-face-detector'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated'

/**
 * Face detection component
 *
 * @return {JSX.Element} Component
 */
export function FaceDetection(): JSX.Element {
    const {
        width,
        height
    } = useWindowDimensions()
    const {
        hasPermission,
        requestPermission
    } = useCameraPermission()
    const [
        cameraMounted,
        setCameraMounted
    ] = useState<boolean>(false)
    const [
        cameraPaused,
        setCameraPaused
    ] = useState<boolean>(false)
    const [
        autoScale,
        setAutoScale
    ] = useState<boolean>(true)
    const [
        facingFront,
        setFacingFront
    ] = useState<boolean>(true)
    const faceDetectionOptions = useRef<FaceDetectionOptions>({
        performanceMode: 'fast',
        classificationMode: 'all',
        windowWidth: width,
        windowHeight: height
    }).current
    const appState = useAppState()
    const isCameraActive = (
        !cameraPaused &&
        appState === 'active'
    )
    const cameraDevice = useCameraDevice(facingFront ? 'front' : 'back')
    //
    // vision camera ref
    //
    const camera = useRef<VisionCamera>(null)
    //
    // face rectangle position
    //
    const aFaceW = useSharedValue(0)
    const aFaceH = useSharedValue(0)
    const aFaceX = useSharedValue(0)
    const aFaceY = useSharedValue(0)
    const aRot = useSharedValue(0)
    const animatedStyle = useAnimatedStyle(() => ({
        position: 'absolute',
        borderWidth: 4,
        borderLeftColor: 'rgb(0,255,0)',
        borderRightColor: 'rgb(0,255,0)',
        borderBottomColor: 'rgb(0,255,0)',
        borderTopColor: 'rgb(255,0,0)',
        width: withTiming(aFaceW.value, {
            duration: 100
        }),
        height: withTiming(aFaceH.value, {
            duration: 100
        }),
        left: withTiming(aFaceX.value, {
            duration: 100
        }),
        top: withTiming(aFaceY.value, {
            duration: 100
        }),
        transform: [{
            rotate: `${aRot.value}deg`
        }]
    }))

    useEffect(() => {
        if (hasPermission) return
        requestPermission()
    }, [])

    /**
     * Handle camera UI rotation
     * 
     * @param {number} rotation Camera rotation
     */
    function handleUiRotation(
        rotation: number
    ) {
        aRot.value = rotation
    }

    /**
     * Hanldes camera mount error event
     *
     * @param {any} error Error event
     */
    function handleCameraMountError(
        error: any
    ) {
        console.error('camera mount error', error)
    }

    /**
     * Handle detection result
     * 
     * @param {Face[]} faces Detection result 
     * @returns {void}
     */
    function handleFacesDetected(
        faces: Face[],
        frame: Frame
    ): void {
        console.log(
            'faces', faces.length,
            'frame', frame.toString()
        )
        // if no faces are detected we do nothing
        if (Object.keys(faces).length <= 0) return

        const { bounds } = faces[0]
        const {
            width,
            height,
            x,
            y
        } = bounds
        aFaceW.value = width
        aFaceH.value = height
        aFaceX.value = x
        aFaceY.value = y

        // only call camera methods if ref is defined
        if (camera.current) {
            // take photo, capture video, etc...
        }
    }

    const pausedCameraText = () => {
        if (cameraPaused) {
            return(<Text
                style={{
                    width: '100%',
                    backgroundColor: 'rgb(0,0,255)',
                    textAlign: 'center',
                    color: 'white'
                }}
            >
                Camera is PAUSED
            </Text>)
        }
        else{
            <View/>
        }
    }

    const renderCamera = () => {
        if (hasPermission && cameraDevice) {
            if (cameraMounted) {
                return (<View>
                    <Camera
                        ref={camera}
                        style={StyleSheet.absoluteFill}
                        isActive={isCameraActive}
                        device={cameraDevice}
                        onError={handleCameraMountError}
                        faceDetectionCallback={handleFacesDetected}
                        onUIRotationChanged={handleUiRotation}
                        faceDetectionOptions={{
                            ...faceDetectionOptions,
                            autoScale
                        }} />
                    <Animated.View
                        style={animatedStyle} />
                        <View>
                        {pausedCameraText()}</View>
                </View>
                )
            }
            else {
                return(<Text
                    style={{
                        width: '100%',
                        backgroundColor: 'rgb(255,255,0)',
                        textAlign: 'center'
                    }}
                >
                    Camera is NOT mounted
                </Text>)
            }
        }
        else{
            return(<Text
                style={{
                    width: '100%',
                    backgroundColor: 'rgb(255,0,0)',
                    textAlign: 'center',
                    color: 'white'
                }}
            >
                No camera device or permission
            </Text>)
        }
    }

    const renderCameraBtn = () =>{
        return(<View
            style={{
                position: 'absolute',
                bottom: 20,
                left: 0,
                right: 0,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
                <View
                    style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-around'
                    }}
                >
                    <Button
                        onPress={() => setFacingFront((current: any) => !current)}
                        title={'Toggle Cam'} />

                    <Button
                        onPress={() => setAutoScale((current: any) => !current)}
                        title={`${autoScale ? 'Disable' : 'Enable'} Scale`} />
                </View>
                <View
                    style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-around'
                    }}
                >
                    <Button
                        onPress={() => setCameraPaused((current: any) => !current)}
                        title={`${cameraPaused ? 'Resume' : 'Pause'} Cam`} />

                    <Button
                        onPress={() => setCameraMounted((current: any) => !current)}
                        title={`${cameraMounted ? 'Unmount' : 'Mount'} Cam`} />
                </View>
            </View>)
    }

    return (
        <View style={[
            StyleSheet.absoluteFill, {
                alignItems: 'center',
                justifyContent: 'center'
            }
        ]}>
            {renderCamera()}
            {renderCameraBtn()}
        </View>
    )
}