import { Platform } from 'react-native';
import Constants from 'expo-constants';

const isDevice = Constants.isDevice;

// Troque pelo seu IP quando for testar no celular
const MEU_IP = '192.168.1.105';

export const BASE_URL = isDevice
  ? `http://${MEU_IP}:3000/api`         // celular físico
  : Platform.OS === 'android'
  ? 'http://10.0.2.2:3000/api'          // emulador Android
  : 'http://localhost:3000/api';         // emulador iOS