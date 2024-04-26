use crate::AndroidJavaEntryError;
use std::panic;

#[cfg(feature = "file-logger")]
use file_logger::init_logger;
use jni::{
    objects::{JClass, JString},
    sys::jstring,
    JNIEnv,
};

#[cfg(feature = "ethereum")]
use ethereum_light_client::handle_input;

#[cfg(feature = "bitcoin")]
use bitcoin_light_client::handle_input;

type JavaPointer = jni::sys::_jobject;

fn to_response(
    env: &JNIEnv<'_>,
    s: String
) -> Result<*mut JavaPointer, AndroidJavaEntryError> {
    Ok(env.new_string(s)?.into_inner())
}

#[cfg(feature = "file-logger")]
fn call_rust_inner(
    env: &JNIEnv<'_>,
    input: JString,
) -> Result<*mut JavaPointer, AndroidJavaEntryError> {
    init_logger()?;
    to_response(env, handle_input(env.get_string(input)?.into()))
}

#[cfg(not(feature = "file-logger"))]
fn call_rust_inner(
    env: &JNIEnv<'_>,
    input: JString,
) -> Result<*mut JavaPointer, AndroidJavaEntryError> {
    to_response(env, handle_input(env.get_string(input)?.into()))
}

// NOTE: This function accepts as its input a string from java, and returns similar.
// TODO/FIXME: Would be more efficient to update this to take and return bytes.

#[allow(non_snake_case)]
#[no_mangle]
pub extern "C" fn Java_multiprooflabs_tee_MainActivity_callRust(
    env: JNIEnv,
    _class: JClass,
    input: JString,
) -> jstring {
    // NOTE See here for the catch_unwind: https://doc.rust-lang.org/std/panic/fn.catch_unwind.html
    // Relevant bit: > It is currently undefined behavior to unwind from Rust code into foreign code,
    // so this function is particularly useful when Rust is called from another language (normally C).
    // This can run arbitrary Rust code, capturing a panic and allowing a graceful handling of the error.
    panic::catch_unwind(|| {
        match call_rust_inner(&env, input) {
            Ok(r) => r,
            Err(e) => {
                error!("{e}");
                // NOTE: Convert the error to a response to return to the caller
                to_response(&env, e.to_string()).expect("this should not fail")
            },
        }
    }).expect("this not to fail")
}
