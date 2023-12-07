//
//  BackgroundBLE.m
//  smartHandle
//
//  Created by Sundeep Ravella on 11/21/23.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <CoreBluetooth/CoreBluetooth.h>
#import <CoreLocation/CoreLocation.h>

@interface iOSBluetoothScannerModule : RCTEventEmitter <RCTBridgeModule, CBCentralManagerDelegate, CBPeripheralDelegate, CLLocationManagerDelegate>

@property (strong, nonatomic) CBCentralManager *centralManager;
@property (strong, nonatomic) CBPeripheral *discoveredPeripheral;
@property (strong, nonatomic) CBPeripheral *restoredPeripheral;
@property (strong, nonatomic) CLLocationManager *locationManager;
@property (strong, nonatomic) NSString * userUUID;
@property (strong, nonatomic) CBService *service;
@property (strong, nonatomic) CBCharacteristic *charac;



@end

@implementation iOSBluetoothScannerModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(startMonitoring) {
  self.locationManager = [[CLLocationManager alloc] init];
  self.locationManager.delegate = self;
  
  [self.locationManager requestAlwaysAuthorization];
  
  
  self.locationManager.desiredAccuracy = kCLLocationAccuracyBest;
  
  self.locationManager.allowsBackgroundLocationUpdates = true;
  self.locationManager.showsBackgroundLocationIndicator = true;
  // Define the coordinates and radius of the region to monitor
  CLLocationCoordinate2D regionCenter = CLLocationCoordinate2DMake(42.55565, -83.38624); // Replace with your desired coordinates
  CLLocationDistance regionRadius = 200.0; // Replace with your desired radius in meters
  // Create a circular region
  CLCircularRegion *circularRegion = [[CLCircularRegion alloc] initWithCenter:regionCenter radius:regionRadius identifier:@"DoorHandle"];
  [self sendEventWithName:@"Gothere" body:@"Got to before monitoring starts"];
  // Start monitoring the circular region
  circularRegion.notifyOnEntry = YES;
  circularRegion.notifyOnExit = YES;
  [self.locationManager startMonitoringForRegion:circularRegion];
  [self sendEventWithName:@"Gothere2" body:@"Got to after monitoring starts"];
  
  
}

- (void)locationManager:(CLLocationManager *)manager didEnterRegion:(CLRegion *)region {
  
  // Trigger an alert or emit an event to React Native
  [self sendEventWithName:@"RegionEntered" body:@{@"regionIdentifier": region.identifier}];
}

- (void)locationManager:(CLLocationManager *)manager didUpdateHeading:(CLHeading *)newHeading {
  [self sendEventWithName:@"HeadingUpdate" body:@"Heading updated"];
}

- (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray<CLLocation *> *)locations {
  [self sendEventWithName:@"LocUpdate" body:@"Location updated"];
  
}

- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error {
  [self sendEventWithName:@"MonitoringFailed" body:[NSString stringWithFormat:@"Failed to monitor: %@", error]];
}

- (void)locationManager:(CLLocationManager *)manager didExitRegion:(CLRegion *)region {
  [self sendEventWithName:@"RegionExited" body:@{@"regionIdentifier": region.identifier}];
}
- (void)locationManager:(CLLocationManager *)manager monitoringDidFailForRegion:(nullable CLRegion *)region withError:(NSError *)error {
  [self sendEventWithName:@"MonitoringRegionFailed" body:[NSString stringWithFormat:@"Failed to monitor: %@", error]];
}

RCT_EXPORT_METHOD(startScan:(NSString *)userUUID) {
  
  self.userUUID = userUUID;
  
  CBUUID *customServiceUUID = [CBUUID UUIDWithString:@"614842ae-f98b-4692-9dcb-0b2339edabe1"];
  
  NSDictionary *options = @{
    CBCentralManagerOptionRestoreIdentifierKey: @"BluetoothScannerIdentifier",
    //          CBCentralManagerScanOptionAllowDuplicatesKey: @NO,
    //          CBCentralManagerScanOptionSolicitedServiceUUIDsKey: @[customServiceUUID]
  };
  
  self.centralManager = [[CBCentralManager alloc] initWithDelegate:self queue:nil options:options];
  
  NSDictionary *scanOptions = @{
    
    CBCentralManagerScanOptionAllowDuplicatesKey: @NO,
    CBCentralManagerScanOptionSolicitedServiceUUIDsKey: @[customServiceUUID]
  };
  
  if (self.centralManager.state == CBManagerStatePoweredOn) {
    [self.centralManager scanForPeripheralsWithServices:@[customServiceUUID] options:scanOptions];
  } else {
    [self sendEventWithName:@"ScanFailed" body:@"Bluetooth not available"];
  }
}

RCT_EXPORT_METHOD(stopScan) {
  [self.centralManager stopScan];
}

- (void)centralManagerDidUpdateState:(CBCentralManager *)central {
  if (central.state == CBManagerStatePoweredOn) {
    NSDictionary *scanOptions = @{CBCentralManagerScanOptionAllowDuplicatesKey: @NO};
    [self.centralManager scanForPeripheralsWithServices:nil options:scanOptions];
  } else {
    [self sendEventWithName:@"ScanFailed" body:@"Bluetooth not available"];
    
  }
}

- (void)centralManager:(CBCentralManager *)central willRestoreState:(NSDictionary<NSString *, id> *)dict {
  // Handle state restoration, if needed
  // You might want to resume scanning or reconnect to peripherals here
  NSArray<CBPeripheral *> *peripherals = dict[CBCentralManagerRestoredStatePeripheralsKey];
  [self sendEventWithName:@"WRS" body:@"In will restore state"];
  //      if (peripherals && peripherals.count > 0) {
  // Attempt to reconnect to each peripheral in the array
  for (CBPeripheral *restoredPeripheral in peripherals) {
    if (restoredPeripheral.state == CBPeripheralStateDisconnected) {
      // Peripheral was previously connected but is now disconnected
      self.restoredPeripheral = restoredPeripheral;
      [self sendEventWithName:@"PeripheralReconnectedAgain" body:restoredPeripheral.identifier.UUIDString];
      [central connectPeripheral:self.restoredPeripheral options:nil];
    } else if (restoredPeripheral.state == CBPeripheralStateConnected) {
      // Peripheral is already connected
      // You may want to notify your React Native code about the reconnection
      [self sendEventWithName:@"PeripheralReconnected" body:restoredPeripheral.identifier.UUIDString];
      
    }
  }
  // }
}

- (void)centralManager:(CBCentralManager *)central didDiscoverPeripheral:(CBPeripheral *)peripheral advertisementData:(NSDictionary<NSString *,id> *)advertisementData RSSI:(NSNumber *)RSSI {
  NSString *peripheralName = advertisementData[CBAdvertisementDataLocalNameKey];
  [self sendEventWithName:@"BluetoothDeviceFoundName" body:peripheralName];
  [self sendEventWithName:@"BluetoothDeviceFound" body:peripheral.identifier.UUIDString];
  if ([peripheralName isEqualToString:@"handle"]) {
    [self sendEventWithName:@"Recognized" body:@"Recognized nano"];
    // Initiate a connection
    // [self.centralManager stopScan];
    self.discoveredPeripheral = peripheral;
    self.discoveredPeripheral.delegate = self;
    [self.centralManager connectPeripheral:self.discoveredPeripheral options:nil];
    
    
  }
}

- (void)centralManager:(CBCentralManager *)central didConnectPeripheral:(CBPeripheral *)peripheral {
  // [self.centralManager stopScan];
  [self sendEventWithName:@"Successful" body:@"Connected"];
  [self.centralManager stopScan];
  if (peripheral.services.count == 0) {
    [self sendEventWithName:@"InDiscoverServices1" body:@"InDiscoverServices1"];
    [self.discoveredPeripheral discoverServices:@[[CBUUID UUIDWithString:@"614842ae-f98b-4692-9dcb-0b2339edabe1"]]];
  }
  else {
    NSData *dataToWrite = [self.userUUID dataUsingEncoding:NSUTF8StringEncoding];
    [self.discoveredPeripheral writeValue:dataToWrite forCharacteristic:self.charac type:CBCharacteristicWriteWithResponse];
    [self sendEventWithName:@"SentCommand1" body:@"Sent Command1"];
  }
  
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverServices:(NSError *)error {
    self.discoveredPeripheral = peripheral;
  
  [self sendEventWithName:@"InDiscoverServices2" body:@"InDiscoverServices2"];

    // Find the desired service
    for (CBService *service in peripheral.services) {
        if ([service.UUID isEqual:[CBUUID UUIDWithString:@"614842ae-f98b-4692-9dcb-0b2339edabe1"]]) {
            // Discover characteristics for the service
            [self.discoveredPeripheral discoverCharacteristics:@[[CBUUID UUIDWithString:@"afbfe7a0-b023-4674-9960-2532a6edd778"]] forService:service];
            break;
        }
    }
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverCharacteristicsForService:(CBService *)service error:(NSError *)error {
    
    self.service = service;
    
    
    // Find the desired characteristic
    for (CBCharacteristic *characteristic in service.characteristics) {
        if ([characteristic.UUID isEqual:[CBUUID UUIDWithString:@"afbfe7a0-b023-4674-9960-2532a6edd778"]]) {
            self.charac = characteristic;
            
            // Write data to the characteristic
            NSData *dataToWrite = [self.userUUID dataUsingEncoding:NSUTF8StringEncoding];
              
              // Write data to the characteristic
            [self.discoveredPeripheral writeValue:dataToWrite forCharacteristic:self.charac type:CBCharacteristicWriteWithResponse];

            [self sendEventWithName:@"SentCommand" body:@"Sent Command"];

            break;
        }
    }
}


-(void) centralManager:(CBCentralManager *)central didDisconnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error {
  [self sendEventWithName:@"Disconnected" body:@"Peripheral disconnected"];
    [self sendEventWithName:@"Reconnecting" body:@"Reconnecting Peripheral"];
          self.discoveredPeripheral = peripheral;
          [self.centralManager connectPeripheral:self.discoveredPeripheral options:nil];
          //[self sendEventWithName:@"Reconnected" body:self.restoredPeripheral];
          
      
}


- (void)centralManager:(CBCentralManager *)central didFailToConnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error {
    [self sendEventWithName:@"ScanFailed" body:[NSString stringWithFormat:@"Failed to connect: %@", error]];
}

- (NSArray<NSString *> *)supportedEvents {
    return @[@"BluetoothDeviceFound", @"ScanFailed", @"Successful", @"Recognized", @"RegionEntered", @"HeadingUpdate", @"LocUpdate", @"MonitoringFailed", @"Gothere", @"Gothere2", @"RegionExited", @"MonitoringRegionFailed", @"PeripheralReconnected", @"PeripheralReconnectedAgain", @"WRS", @"Disconnected", @"Reconnecting", @"Reconnected", @"SentCommand", @"SentCommand1", @"InDiscoverServices1", @"InDiscoverServices2", @"BluetoothDeviceFoundName"];
}

@end
