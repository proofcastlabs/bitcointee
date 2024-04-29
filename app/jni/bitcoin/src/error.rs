use thiserror::Error;

#[derive(Debug, Error)]
pub enum BtcError {
    #[error("no last block in blocks")]
    NoLastBlock,

    #[error("validation error - check logs for details")]
    ValidationError,

    #[error("no blocks were passed in")]
    NoBlocks,

    #[error("hex array error: {0}")]
    HexArray(#[from] bitcoin::hex::HexToArrayError),

    #[error("serde json error: {0}")]
    SerdeJson(#[from] serde_json::Error),

    #[error("utf8 error: {0}")]
    Utf8(#[from] std::str::Utf8Error),

    #[error("btc consensus encode error: {0}")]
    BtcConsensusEncode(#[from] bitcoin::consensus::encode::Error),

    #[error("from hex error: {0}")]
    FromHex(#[from] ::hex::FromHexError),

    #[error("from slice error: {0}")]
    FromSlice(#[from] bitcoin::hashes::FromSliceError),

    #[error("parse int error: {0}")]
    ParseInt(#[from] std::num::ParseIntError),

    #[error("i/o error: {0}")]
    Io(#[from] std::io::Error),
}
