# Bitcointee

## Requirements

 - Android SDK 33+
 - Android NDK 25.2
 - Rust installed
 - `armv7-linux-androideabi` rust toolchain

## Project setup

### `local.properties`

```
> cat local.properties
sdk.dir=/opt/android-sdk
ndk.dir=/opt/android-sdk/ndk/25.2.9519653
rust.rustcCommand=/<home>/.cargo/bin/rustc
rust.cargoCommand=/<home>/.cargo/bin/cargo
```

### Build the app and install

```bash
./setup-plugdev-perm.sh
./gradlew clean assembleDebug installDebug
adb reverse tcp:3000 tcp:3000
```

## Run

### Run the JSONRPC/WS server

```bash
cd server
pnpm i
node index.js
```

### Run the app

Go on the device and touch the `bitcointee` app.

Check the logs on the server.

