use jni::{ JNIEnv,  JavaVM };
use jni::sys::{jint, jstring};
use jni::objects::{ JClass,  JString };

#[no_mangle]
#[allow(non_snake_case)]
pub extern "system" fn JNI_OnLoad(_vm: JavaVM) -> jint {
    // setup_android_logger();
    jni::sys::JNI_VERSION_1_6
}

#[allow(non_snake_case)]
#[no_mangle]
pub extern "system" fn Java_multiprooflabs_tee_MainActivity_callRust<'local>(
    mut env: JNIEnv<'local>,
    _class: JClass<'local>,
    input: JString<'local>,
) -> jstring {
    let input: String = env.get_string(&input).expect("Couldn't get java string!").into();

    env.new_string(format!("In rust we trust! {}", input)).expect("couldn't create JAVA string").into_raw()
}
