### :alien: Rationale

This small library is designed to work with an android device, allowing it to interface with rust in a generic way. It exposes two functions that can be wired into the android app. They are: `Java_com_androidapp_rustlogger_RustLogger_log` and `Java_com_androidapp_RustBridge_callRust`.

__`Java_com_androidapp_rustlogger_RustLogger_log`__

This function allows java logs to be piped through to rust, allowing java logs to also accrue into whatever logging system you're using for the rust side of things. This avoids having to track both android device logs (via logcat or similar) _and_ rust logs, instead the latter will also contain the former.

__`Java_com_androidapp_RustBridge_callRust`__

This function is the entry point into rust from java. Java should call this function providing a string argument. The function returns to java a string also.

### :wrench: Building

This library by default targets `aarch64-linux-android`. (See `./.cargo/config.toml`)

You also need to tell the compiler where to find the android-specific clang compiler, and the llvm archiver, via two environment variables: `TARGET_CC` and `TARGET_AR`, otherwise you will run into compilation issues due to the `ring` crate dependency.

Those two items are part of the the android native development kit (the NDK), whose location will also need to be set correctly under the `$NDK_HOME` environment variable.

With all of that in place, you will be able to successfully compile this library (in this directory) thusly (your paths may differ):

```
TARGET_CC="$NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android30-clang" \
TARGET_AR="$NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar" \
cargo build --release
```
