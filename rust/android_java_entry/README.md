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
