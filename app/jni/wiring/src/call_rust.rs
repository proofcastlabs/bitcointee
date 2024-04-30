use crate::AndroidJavaEntryError;
use std::panic;

#[cfg(feature = "file-logger")]
use file_logger::init_logger;
use jni::{
    objects::{JClass, JString, JObject},
    sys::jstring,
    JNIEnv,
};
use jni::errors::ErrorKind::JavaException;
use jni::sys::JNI_ERR;
use log::error;
use bitcoin_light_client::BtcError::ParseInt;

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

fn throw(env: &JNIEnv, err: &str) {
    if let Err(e) = env.throw(("java/lang/Exception", err)) {
        warn!("Failed to throw Java exception: `{e}`. Exception was: `{err}`");
    }
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
    // NOTE this is needed to print out any
    // panic occurred
    panic::set_hook(Box::new(|panic_info| {
        error!("{panic_info}");
    }));

    // NOTE See here for the catch_unwind: https://doc.rust-lang.org/std/panic/fn.catch_unwind.html
    // Relevant bit: > It is currently undefined behavior to unwind from Rust code into foreign code,
    // so this function is particularly useful when Rust is called from another language (normally C).
    // This can run arbitrary Rust code, capturing a panic and allowing a graceful handling of the error.
    match panic::catch_unwind(|| {
        call_rust_inner(&env, input)
    }) {
        Ok(v) => match v {
            Ok(s) => s,
            Err(e) => {
                error!("{e}");
                throw(&env, &format!("{e}"));
                JObject::null().into_inner()
            }
        },
        Err(e) => {
            throw(&env, &format!("Rust code panicked, check logcat for further information!"));
            JObject::null().into_inner()
        }
    }
}
