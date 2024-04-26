use jni::{
    objects::{JClass, JString},
    JNIEnv,
};

fn parse_java_log<'a>(env: &'a JNIEnv<'a>, log_level: JString, log_msg: JString) -> Result<(), Box<dyn std::error::Error>> {
    let msg: String = env.get_string(log_msg)?.into();
    let level: String = env.get_string(log_level)?.into();

    match level.to_lowercase().as_ref() {
        "info" => info!("{msg}"),
        "warn" => warn!("{msg}"),
        "error" => error!("{msg}"),
        "trace" => trace!("{msg}"),
        _ => debug!("{msg}"),
    };

    Ok(())
}

// NOTE: This allows java functions to log via the rust library, meaning we only have to manage
// logs in one place (ie in rust) rather than also having to deal with logcat/adb etc on the
// android device.

#[allow(non_snake_case)]
#[no_mangle]
pub extern "C" fn Java_com_androidapp_rustlogger_RustLogger_log(
    env: JNIEnv,
    _class: JClass,
    log_level: JString,
    log_message: JString,
) {
    if let Err(e) = parse_java_log(&env, log_level, log_message) {
        error!("error whilst logging java log: {e}");
    };
}
