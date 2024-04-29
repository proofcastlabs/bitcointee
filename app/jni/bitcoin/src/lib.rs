mod btc_block_json;
mod btc_blocks;
mod error;
mod validate_input;
mod test_utils;

#[macro_use]
extern crate log;

pub use self::error::BtcError;

pub fn handle_input(s: String) -> String {
    validate_input::validate_input(s).expect("errors to be handled internally via return type")
}

