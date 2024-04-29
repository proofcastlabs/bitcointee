mod btc_block_json;
mod btc_blocks;
mod constants;
mod curl;
mod error;
mod get_block_hashes;
mod validate_input;
mod get_blocks;
mod json_response;
mod test_utils;
mod write_blocks;

#[macro_use]
extern crate log;

pub use self::error::BtcError;

pub fn handle_input(s: String) -> String {
    validate_input::validate_input(s).expect("errors to be handled internally via return type")
}

