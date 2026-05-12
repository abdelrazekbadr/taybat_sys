watchman watch-del-all || true
rm -rf .expo node_modules/.cache
rm -rf "$TMPDIR/metro-"* "$TMPDIR/haste-map-"* 2>/dev/null || true
npx expo start -c

