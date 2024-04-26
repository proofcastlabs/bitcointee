use thiserror::Error;

#[derive(Debug, Error)]
pub enum JavaEntryAndroidError {
    #[error("a java exception occurred and was handled - see logs for details")]
    JavaExceptionOccurred,

    #[error("jni error: {0}")]
    Jni(#[from] jni::errors::Error),
}
