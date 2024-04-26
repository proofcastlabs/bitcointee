#![cfg(target_os = "android")]

#[macro_use]
extern crate log;

mod call_rust;
mod constants;
mod handle_java_exceptions;
mod jni_on_load;
mod error;
mod rust_java_log;
mod type_aliases;

use self::{
    handle_java_exceptions::check_and_handle_java_exceptions,
    type_aliases::JavaPointer,
};

pub use self::{
    error::AndroidJavaEntryError,
    // NOTE: Thkhe following two function names _must_ be reflected correctly in the java app via class names/paths
    call_rust::Java_multiprooflabs_tee_MainActivity_callRust,
    rust_java_log::Java_multiprooflabs_tee_RustLogger_log,
};
