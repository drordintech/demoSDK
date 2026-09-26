/// <reference path="../node_modules/@dr-odin/web-sdk/dist/index.d.ts" />

interface BluetoothDevice {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

interface BluetoothRemoteGATTServer {
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(service: string): Promise<unknown>;
}

interface Navigator {
  bluetooth?: {
    requestDevice(options: object): Promise<BluetoothDevice>;
  };
}
