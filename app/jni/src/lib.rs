#![cfg(target_os = "android")]

mod wiring;

pub use self::wiring::Java_multiprooflabs_tee_MainActivity_callRust;