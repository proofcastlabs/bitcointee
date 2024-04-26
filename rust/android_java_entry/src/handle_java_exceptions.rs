use jni::JNIEnv;
use crate::AndroidJavaEntryError;

pub(crate) fn check_and_handle_java_exceptions<'a>(
    env: &'a JNIEnv<'a>,
    print_exceptions: bool,
) -> Result<(), AndroidJavaEntryError> {
    if matches!(env.exception_check(), Ok(true)) {
        if print_exceptions {
            env.exception_describe()?;
        };
        env.exception_clear()?;
        Err(AndroidJavaEntryError::JavaExceptionOccurred)
    } else {
        Ok(())
    }
}
