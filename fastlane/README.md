fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

### upload_metadata

```sh
[bundle exec] fastlane upload_metadata
```

Upload metadata to App Store Connect

### upload_release_notes

```sh
[bundle exec] fastlane upload_release_notes
```

Upload only release notes to App Store Connect

### resize_screenshots

```sh
[bundle exec] fastlane resize_screenshots
```

Resize screenshots to correct dimensions

### upload_screenshots

```sh
[bundle exec] fastlane upload_screenshots
```

Upload screenshots to App Store Connect

### upload_start

```sh
[bundle exec] fastlane upload_start
```

Upload based on boolean controls set at top of file

----


## iOS

### ios upload

```sh
[bundle exec] fastlane ios upload
```

Upload metadata and screenshots to App Store Connect

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
