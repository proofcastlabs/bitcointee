#![cfg(target_os = "android")]

mod wiring;

pub use self::wiring::Java_xyz_multiprooflabs_bitcointee_MainActivity_callCore;