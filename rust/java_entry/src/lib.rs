#![cfg(target_os = "android")]

#[macro_use]
extern crate log;

mod android;

pub use self::android::{
    JavaEntryAndroidError,
    // NOTE: The following two function names _must_ be reflected correctly in the java app via class names/paths
    Java_com_androidapp_RustBridge_callCore,
    Java_com_androidapp_rustlogger_RustLogger_log,
};
