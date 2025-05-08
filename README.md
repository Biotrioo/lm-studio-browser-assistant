# LM Studio Assistant Extension

## Building for Chrome/Edge (Manifest V3)
- Use the default `manifest.json` (Manifest V3)
- Load the extension in Chrome/Edge as an unpacked extension

## Building for Firefox (Manifest V2)
- Copy `manifest.v2.json` to `manifest.json` (overwrite the file)
- Load the extension in Firefox as an unpacked extension

## Optional: Build Script
You can automate switching manifests with a simple script, e.g.:

### Windows (PowerShell)
```
# For Chrome/Edge
Copy-Item manifest.json manifest.backup.json
# For Firefox
Copy-Item manifest.v2.json manifest.json -Force
```

### Linux/macOS
```
# For Chrome/Edge
cp manifest.json manifest.backup.json
# For Firefox
cp manifest.v2.json manifest.json
```

---

- The codebase is modular and works for both MV2 and MV3.
- The background script detects the environment and adapts accordingly. 