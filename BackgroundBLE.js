import { NativeEventEmitter, NativeModules } from 'react-native';
import { BleManager, Characteristic } from 'react-native-ble-plx';
const { iOSBluetoothScannerModule } = NativeModules;
const bluetoothScannerEventEmitter = new NativeEventEmitter(iOSBluetoothScannerModule);

const customUserUUID = '3a88832b-7494-4a6c-ae7c-8f1948506a68';
const manager = new BleManager();

export const startScan = (uuid) => {
  //console.log(iOSBluetoothScannerModule)

  iOSBluetoothScannerModule.startScan(uuid);
}

export const startMonitor = () => {
  iOSBluetoothScannerModule.startMonitoring();
}



const subscription0 = bluetoothScannerEventEmitter.addListener(
  'RegionEntered',
  (deviceAddress) => {
    console.log("User has entered region, starting bluetooth scan");
    startScan();
  }
);

const subscriptionName = bluetoothScannerEventEmitter.addListener(
  'BluetoothDeviceFoundName',
  (deviceName) => {
    console.log(`Found Bluetooth device name: ${deviceName}`);
  }
);


// Listen for Bluetooth device events
const subscription = bluetoothScannerEventEmitter.addListener(
  'BluetoothDeviceFound',
  (deviceAddress) => {
    console.log(`Found Bluetooth device: ${deviceAddress}`);
  }
);

const subscription2 = bluetoothScannerEventEmitter.addListener(
  'ScanFailed',
  (message) => {
    console.log(`${message}`);
  }
);

const subscription3 = bluetoothScannerEventEmitter.addListener(
  'Successful',
  (message) => {
    console.log(`${message}`);
  }
);

const subscription4 = bluetoothScannerEventEmitter.addListener(
  'Recognized',
  (message) => {
    console.log(`${message}`);
  }
);

const subscription5 = bluetoothScannerEventEmitter.addListener(
  'HeadingUpdate',
  (message) => {
    console.log(`${message}`);
  }
);

const subscription6 = bluetoothScannerEventEmitter.addListener(
  'LocUpdate',
  (message) => {
    console.log(`${message}`);
  }
);

const subscription7 = bluetoothScannerEventEmitter.addListener(
  'MonitoringFailed',
  (message) => {
    console.log(`${message}`);
  }
);

const subscription8 = bluetoothScannerEventEmitter.addListener(
  'MonitoringRegionFailed',
  (message) => {
    console.log(`${message}`);
  }
);

const subscription9 = bluetoothScannerEventEmitter.addListener(
  'Gothere',
  (message) => {
    console.log(`${message}`);
  }
);

const subscription10 = bluetoothScannerEventEmitter.addListener(
  'PeripheralReconnected',
  (message) => {
    console.log(`${message}`);
  }
);

const subscription11 = bluetoothScannerEventEmitter.addListener(
  'Gothere2',
  (message) => {
    console.log(`${message}`);
  }
);

const subscription12 = bluetoothScannerEventEmitter.addListener(
  'RegionExited',
  (message) => {
    console.log(`${message}`);
  }
);



const subscription13 = bluetoothScannerEventEmitter.addListener(
  'PeripheralReconnectedAgain',
  (message) => {
    console.log('Actually reconnected (maybe)');
  }
);

const subscription14 = bluetoothScannerEventEmitter.addListener(
  'WRS',
  (message) => {
    console.log(`${message}`);
  }
);

const subscription15 = bluetoothScannerEventEmitter.addListener(
  'Disconnected',
  (message) => {
    console.log(`${message}`);
  }
);

const subscription16 = bluetoothScannerEventEmitter.addListener(
  'Reconnecting',
  (message) => {
    console.log(`${message}`);
  }
);

const subscription17 = bluetoothScannerEventEmitter.addListener(
  'Reconnected',
  (message) => {
    console.log(`${message}`);

  }
);

const subscription18 = bluetoothScannerEventEmitter.addListener(
  'SentCommand',
  (message) => {
    console.log(`${message}`);

  }
);

const subscription19 = bluetoothScannerEventEmitter.addListener(
  'SentCommand1',
  (message) => {
    console.log(`${message}`);

  }
);

const subscription20 = bluetoothScannerEventEmitter.addListener(
  'InDiscoverServices1',
  (message) => {
    console.log(`${message}`);

  }
);

const subscription21 = bluetoothScannerEventEmitter.addListener(
  'InDiscoverServices2',
  (message) => {
    console.log(`${message}`);

  }
);



// Stop scanning after 10 seconds (for demonstration purposes)
export const setTimeout1 = () => {
  setTimeout(() => {
    iOSBluetoothScannerModule.stopScan();
    subscription0.remove();
    subscription.remove();
    subscription2.remove();
    subscription3.remove();
    subscription4.remove();
  }, 10000);
}

