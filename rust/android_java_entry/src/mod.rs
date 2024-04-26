mod call_core;
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
    call_core::Java_com_androidapp_RustBridge_callCore,
    rust_java_log::Java_com_androidapp_rustlogger_RustLogger_log,
};
