quick_error! {
    #[derive(Debug)]
    pub enum LoggerError {
        FlexiLoggerError(err: flexi_logger::FlexiLoggerError) {
            from()
            display("Flexilogger error: {}", err)
        }
    }
}
