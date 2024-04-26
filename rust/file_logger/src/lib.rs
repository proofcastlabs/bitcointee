#[macro_use]
extern crate quick_error;
#[macro_use]
extern crate lazy_static;
#[macro_use]
extern crate log;

mod errors;
mod file_logger;

pub use self::{errors::LoggerError, file_logger::initialize_file_logger as init_logger};
