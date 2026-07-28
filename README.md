This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Release Quality Gates

The repository now includes a CI workflow at `.github/workflows/ci.yml` that runs on pull requests and on pushes to `main`/`master`.

Before shipping, the following checks must pass:

- `npm run lint`
- `npm run typecheck`
- `npm test -- --ci`
- `npm run test:rules`

## EAS Build Pipeline (baseline)

An `eas.json` file is included with `development`, `preview`, and `production` profiles.

Typical usage:

```sh
npm i -g eas-cli
eas login
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

For store builds, use the `production` profile.

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Firebase Auth (React Native Firebase)

This project uses **React Native Firebase**:

- `@react-native-firebase/app`
- `@react-native-firebase/auth`

### Install

```sh
npm i @react-native-firebase/app @react-native-firebase/auth

# iOS only
cd ios && bundle exec pod install && cd ..
```

### Native configuration

- **Android**:
  - Ensure `android/build.gradle` includes:
    - `classpath 'com.google.gms:google-services:4.4.4'`
  - Ensure `android/app/build.gradle` includes:
    - `apply plugin: 'com.google.gms.google-services'`
  - Ensure `android/app/google-services.json` exists (already present in this repo).
- **iOS**:
  - Ensure `ios/GoogleService-Info.plist` exists (already present in this repo).

### Error + rectification (what was wrong here)

- **Error**: `npm install` / `yarn` fails with a JSON parse error (commonly like `Unexpected token ... in JSON at position ...`).
- **Cause**: `package.json` had an invalid stray character (`ˇ`) after the `react-native` version.
- **Fix**: Removed the stray character so `package.json` is valid JSON again. After that, reinstall dependencies:

```sh
rm -rf node_modules
npm i
```

### iOS Pod error + rectification (FirebaseAuth static libraries)

- **Error**:
  - `[!] The following Swift pods cannot yet be integrated as static libraries...`
  - `FirebaseAuth` depends on `FirebaseAuthInterop`, `FirebaseAppCheckInterop`, `RecaptchaInterop` which “do not define modules”.
- **Fix**: In `ios/Podfile`, enable modular headers **for those interop pods**:
  - `pod 'FirebaseAuthInterop', :modular_headers => true`
  - `pod 'FirebaseAppCheckInterop', :modular_headers => true`
  - `pod 'RecaptchaInterop', :modular_headers => true`

Then run:

```sh
cd ios
bundle exec pod install
```

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
