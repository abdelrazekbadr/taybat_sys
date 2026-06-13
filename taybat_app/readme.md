trae-sandbox 'mkdir -p .home/.expo && HOME="$PWD/.home" npx expo start --clear --lan'

npx expo start --clear

---

npx expo run:android --port 8082

---

adb logcat -s ReactNativeJS

---

keytool-keystore android/app/debug.keystore\

-list-v\

-aliasandroiddebugkey\

-storepassandroid\

-keypassandroid

---



exportANDROID_HOME="$HOME/Library/Android/sdk"

exportANDROID_SDK_ROOT="$HOME/Library/Android/sdk"

exportPATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
