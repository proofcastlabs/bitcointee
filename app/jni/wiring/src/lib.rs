#![cfg(target_os = "android")]

#[macro_use]
extern crate log;

mod call_rust;
mod jni_on_load;
mod error;
mod rust_java_log;

pub use self::{
    error::AndroidJavaEntryError,
    // NOTE: Thkhe following two function names _must_ be reflected correctly in the java app via class names/paths
    call_rust::Java_multiprooflabs_tee_MainActivity_callRust,
    rust_java_log::Java_multiprooflabs_tee_RustLogger_log,
};
