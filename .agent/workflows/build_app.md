---
description: Build the Electron application for macOS
---

This workflow builds the application into a standalone macOS executable (DMG file).

1.  Navigate to the project directory:
    ```bash
    cd multi-tab-query-agent
    ```

2.  Run the build command for macOS:
    // turbo
    ```bash
    yarn run build:mac
    ```

3.  Locate the output:
    The built artifact (DMG file) will be located in the `dist` directory.
    ```bash
    open dist
    ```
