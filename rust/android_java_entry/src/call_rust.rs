use crate::AndroidJavaEntryError;
use std::panic;

#[cfg(feature = "file-logger")]
use file_logger::init_logger;
use jni::{
    objects::{JClass, JObject, JString},
    sys::jstring,
    JNIEnv,
};

use super::JavaPointer;

#[cfg(feature = "ethereum")]
use ethereum_light_client::handle_input;

#[cfg(feature = "bitcoin")]
use bitcoin_light_client::handle_input;

fn to_response(
    env: &JNIEnv<'_>,
    s: String
) -> Result<*mut JavaPointer, AndroidJavaEntryError> {
    Ok(env.new_string(s)?.into_inner())
}

#[cfg(feature = "file-logger")]
fn call_rust_inner(
    env: &JNIEnv<'_>,
    strongbox_java_class: JObject,
    db_java_class: JObject,
    input: JString,
) -> Result<*mut JavaPointer, AndroidJavaEntryError> {
    init_logger()?;
    to_response(env, handle_input(env.get_string(input)?.into()))
}

#[cfg(not(feature = "file-logger"))]
fn call_rust_inner(
    env: &JNIEnv<'_>,
    strongbox_java_class: JObject,
    db_java_class: JObject,
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
    strongbox_java_class: JObject, // FIXME rm1
    db_java_class: JObject, // FIXME rm!
    input: JString,
) -> jstring {
    unimplemented!("");
    /*
    let result = panic::catch_unwind(|| {
        match call_rust_inner(&env, strongbox_java_class, db_java_class, input) {
            Ok(r) => r,
            Err(e) => {
                error!("{e}");

                // First we need to cancel the db transaction...
                match env.call_method(db_java_class, "cancelTransaction", "()V", &[]) {
                    Ok(_) => {
                        env.exception_describe().expect("this not to fail"); // FIXME
                        env.exception_clear().expect("this not to fail"); // FIXME How to handle if an exception
                                                                          // occurred here? Do we return anything?
                    },
                    Err(e) => {
                        // FIXME check for java exceptions!
                        error!("{e}");
                        let r: String = match WebSocketMessagesEncodable::Error(WebSocketMessagesError::JavaDb(
                            "could not cancel db tx".into(),
                        ))
                        .try_into()
                        {
                            Ok(s) => s,
                            Err(e) => {
                                error!("{e}");
                                format!("{e}")
                            },
                        };
                        return env
                            .new_string(r.to_string())
                            .expect("this should not fail")
                            .into_inner();
                    },
                };

                // NOTE: Now we need to handle whatever went wrong. Lets wrap the error in an encodable websocket
                // message and return it to the caller.
                let r: String = match WebSocketMessagesEncodable::Error(e.into()).try_into() {
                    Ok(s) => s,
                    Err(e) => {
                        error!("error encoding error into WebsocketMessagesEncodable: {e}");
                        format!("{e}")
                    },
                };
                env.new_string(r.to_string())
                    .expect("this should not fail")
                    .into_inner()
            },
        }
    });
    match result {
        Ok(r) => r,
        Err(e) => {
            error!("something panicked: {e:?}");
            let msg = WebSocketMessagesEncodable::Error(WebSocketMessagesError::Panicked);
            let s: String = msg.try_into().expect("this not to fail");
            env.new_string(s).expect("this should not fail").into_inner()
        },
    }
    */
}
