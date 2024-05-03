mod btc_block_json;
mod btc_blocks;
mod error;
mod validate_input;
mod test_utils;

#[macro_use]
extern crate log;

use std::str::FromStr;
use crate::validate_input::Proof;
pub use self::error::BtcError;
pub use self::btc_blocks::BtcBlocks;

pub fn handle_input(s: String) -> String {
    let blocks = BtcBlocks::from_str(&s).expect("to unwrap btc blocks");

    if blocks.is_empty() {
        debug!("No blocks given!");
        return "".to_string()
    };

    match validate_input::validate_input(blocks) {
        Proof::True(block_hash_1, block_hash_2) =>
            format!("{block_hash_1}{block_hash_2}").to_string(),
        Proof::False => "".to_string()
    }
}

