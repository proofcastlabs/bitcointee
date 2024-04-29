mod btc_block_json;
mod btc_blocks;
mod constants;
mod curl;
mod error;
mod get_block_hashes;
mod get_blocks;
mod json_response;
mod test_utils;
mod write_blocks;

#[macro_use]
extern crate log;


use self::{
    curl::curl,
    json_response::JsonResponse;
    btc_blocks::BtcBlocks,
    constants::{DEFAULT_ELF_PATH, MAX_NUM_BLOCKS},
    error::BtcError,
    get_blocks::get_blocks,
    write_blocks::write_blocks_to_file,
};

pub fn handle_input(s: String) -> String {
    "In rust we truuuust".to_string()
}
