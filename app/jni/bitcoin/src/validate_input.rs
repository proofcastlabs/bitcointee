use crate::{
    btc_blocks::BtcBlocks,
    error::BtcError,
};

use std::str::FromStr;

pub fn validate_input(s: String) -> Result<String, BtcError> {
    let blocks = BtcBlocks::from_str(&s).expect("to unwrap btc blocks");

    if blocks.is_empty() {
        return Err(BtcError::NoBlocks)
    };

    let result = !blocks.iter().enumerate().fold(false, |acc, (i, block)| {
        let merkle_root_is_valid = block.check_merkle_root();
        debug!("merkle root is valid: {merkle_root_is_valid}");

        let is_chained = if i > 0 {
            let prev_hash = blocks[i - 1].block_hash();
            let expected_prev_hash = block.header.prev_blockhash;
            prev_hash == expected_prev_hash
        } else {
            // NOTE/TODO: Later iterations of this can take either a block hash or the proof of the past set
            // of blocks and check that this first block is chained to that. For now we just assume the first
            // is chained correctly to whatever came before.
            true
        };
        debug!("is chained: {is_chained}");

        // NOTE: We're using `false` to start with here and `||` so we can flip the bool once and have it stay
        // that way if anything is amiss at any point.
        acc || !(merkle_root_is_valid && is_chained)
    });

    if !result {
        Err(BtcError::ValidationError)
    } else {
        let first_block_hash = blocks.first()
            .ok_or_else(|| BtcError::NoFirstBlock)?
            .header
            .block_hash();
        let last_block_hash = blocks.last()
            .ok_or_else(|| BtcError::NoLastBlock)?
            .header
            .block_hash();
        let output = first_block_hash.to_string() +
            &last_block_hash.to_string();

        Ok(output)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_utils::get_sample_btc_blocks_1;

    #[test]
    fn should_validate_input_inner() {
        let s = get_sample_btc_blocks_1().to_string();
        let r = validate_input(s);
        assert!(r.is_ok());
    }
}
