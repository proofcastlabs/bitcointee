#![cfg(target_os = "android")]

mod wiring;

pub use self::wiring::Java_xyz_multiproofslabs_MainActivity_callCore;