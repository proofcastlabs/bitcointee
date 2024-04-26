use android_logger::{init_once, Config};
use jni::{sys::jint, JavaVM};
use log::LevelFilter;

#[no_mangle]
#[allow(non_snake_case, improper_ctypes_definitions)]
pub extern "system" fn JNI_OnLoad(_vm: JavaVM) -> jint {
    init_once(Config::default().with_max_level(LevelFilter::Debug));
    info!("android logger loaded");
    jni::sys::JNI_VERSION_1_6
}
