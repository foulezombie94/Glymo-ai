import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Image, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ChevronLeft, RefreshCw, Image as ImageIcon, History as HistoryIcon, Barcode, Camera } from 'lucide-react-native';
import { supabase } from '../lib/supabase.js';
import { fetchProductByBarcode } from '../lib/off.js';


export default function ScannerScreen({ navigation, route }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facing, setFacing] = useState(/** @type {'back' | 'front'} */ ('back'));
  const [isFrozen, setIsFrozen] = useState(false);

  const [isSearchingBarcode, setIsSearchingBarcode] = useState(false);
  const [scanMode, setScanMode] = useState(route.params?.mode || 'ai'); // 'ai' or 'barcode'
  

  const cameraRef = useRef(null);

  useEffect(() => {
    if (route.params?.mode) {
      setScanMode(route.params.mode);
    }
  }, [route.params?.mode]);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black justify-center items-center px-10">
        <Text className="text-white text-center mb-6 text-lg">We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} className="bg-primary px-10 py-4 rounded-3xl">
          <Text className="text-white font-bold text-lg">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || isAnalyzing || isFrozen) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
      });
      setCapturedImage(photo.uri);
      setIsFrozen(true);
      await identifyMeal(photo.base64);
    } catch {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const handleBarcodeScanned = async ({ data }) => {
    if (scanMode !== 'barcode' || isFrozen || isSearchingBarcode || isAnalyzing) return;
    
    setIsFrozen(true);
    setIsSearchingBarcode(true);
    try {
      const product = await fetchProductByBarcode(data);
      if (product) {
        setCapturedImage(null); // No photo for barcode usually
        navigation.navigate('ResultsDetail', { mealData: { ...product, image_url: product.image_url } });
        resetScanner();
      } else {
        Alert.alert("Not Found", "Product not found nearby.");
        setIsFrozen(false);
      }
    } catch {
      Alert.alert("Error", "Failed to search product.");
      setIsFrozen(false);
    } finally {
      setIsSearchingBarcode(false);
    }
  };

  const identifyMeal = async (base64) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('identify-meal', {
        body: { image: base64 },
      });
      if (error) throw error;

      if (data?.product) {
        navigation.navigate('ResultsDetail', { 
          mealData: { 
            ...data.product, 
            image_url: `data:image/jpeg;base64,${base64}` 
          } 
        });
        resetScanner();
      } else {
         throw new Error("Invalid AI response");
      }
    } catch (_err) {
      console.error(_err);
      Alert.alert("Analysis Failed", "Could not identify the meal. Try again.");
      setIsFrozen(false);
      setCapturedImage(null);
    } finally {
      setIsAnalyzing(false);
    }
  };


  const resetScanner = () => {

    setCapturedImage(null);
    setIsFrozen(false);
    setIsAnalyzing(false);
    setIsSearchingBarcode(false);
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView 
        ref={cameraRef} 
        className="flex-1" 
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
        }}
        onBarcodeScanned={isFrozen || scanMode === 'ai' ? undefined : handleBarcodeScanned}
      >
        {/* Frozen Frame Overlay */}
        {capturedImage && (
          <Image source={{ uri: capturedImage }} style={StyleSheet.absoluteFill} />
        )}

        <View className="flex-1 bg-black/10">
          {/* Header */}
          <View className="pt-12 px-6 flex-row justify-between items-center">
             <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              className="w-12 h-12 bg-black/30 rounded-full items-center justify-center backdrop-blur-md"
            >
                <ChevronLeft color="white" size={28} />
             </TouchableOpacity>

             <View className="bg-black/40 px-5 py-2.5 rounded-full flex-row items-center backdrop-blur-md border border-white/10">
                {scanMode === 'ai' ? <Camera color="white" size={16} /> : <Barcode color="white" size={16} />}
                <Text className="text-white text-xs font-black uppercase tracking-widest ml-2">
                  {isAnalyzing || isSearchingBarcode ? "Analyzing..." : `${scanMode === 'ai' ? 'AI' : 'Barcode'} Mode`}
                </Text>
             </View>

             <TouchableOpacity 
              onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
              className="w-12 h-12 bg-black/30 rounded-full items-center justify-center backdrop-blur-md"
            >
                <RefreshCw color="white" size={24} />
             </TouchableOpacity>
          </View>

          {/* Viewfinder */}
          <View className="flex-1 items-center justify-center">
            <View className={`w-72 h-72 border-2 ${isFrozen ? 'border-primary shadow-2xl' : 'border-white/30'} rounded-[40px] items-center justify-center`}>
               {(isAnalyzing || isSearchingBarcode) && (
                 <View className="bg-black/20 p-6 rounded-3xl backdrop-blur-md">
                   <ActivityIndicator color="white" size="large" />
                 </View>
               )}
            </View>
            <Text className="text-white/60 font-bold mt-8 text-sm uppercase tracking-widest">
              {isFrozen ? "Review Result" : `Align ${scanMode === 'ai' ? 'Meal' : 'Barcode'} in frame`}
            </Text>
          </View>

          {/* Mode Switcher */}
          {!isFrozen && (
            <View className="flex-row justify-center mb-8 gap-4">
              <TouchableOpacity 
                onPress={() => setScanMode('ai')}
                className={`px-6 py-3 rounded-2xl flex-row items-center border ${scanMode === 'ai' ? 'bg-primary border-primary' : 'bg-black/30 border-white/10'}`}
              >
                <Camera color="white" size={18} />
                <Text className="text-white font-black ml-2 text-xs uppercase">AI</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setScanMode('barcode')}
                className={`px-6 py-3 rounded-2xl flex-row items-center border ${scanMode === 'barcode' ? 'bg-primary border-primary' : 'bg-black/30 border-white/10'}`}
              >
                <Barcode color="white" size={18} />
                <Text className="text-white font-black ml-2 text-xs uppercase">Code</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Result Overlay removed - now navigates to ResultsDetailScreen */}

          {/* Bottom Bar (Only when not frozen) */}
          {!isFrozen && (
            <View className="pb-12 px-10 flex-row justify-between items-center">
              <TouchableOpacity className="items-center opacity-70">
                 <View className="w-14 h-14 bg-black/30 rounded-full items-center justify-center border border-white/10">
                    <ImageIcon color="white" size={24} />
                 </View>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleCapture}
                disabled={scanMode === 'barcode'} // In barcode mode, it scans automatically
                className={`w-24 h-24 rounded-full border-4 ${scanMode === 'barcode' ? 'border-white/10' : 'border-white/30'} items-center justify-center`}
              >
                <View className={`w-20 h-20 ${scanMode === 'barcode' ? 'bg-white/10' : 'bg-white shadow-xl shadow-white/20'} rounded-full items-center justify-center`}>
                  {scanMode === 'ai' ? <Camera color="#101828" size={32} /> : <Barcode color="white" size={32} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => navigation.navigate('History')}
                className="items-center opacity-70"
              >
                 <View className="w-14 h-14 bg-black/30 rounded-full items-center justify-center border border-white/10">
                    <HistoryIcon color="white" size={24} />
                 </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
}
