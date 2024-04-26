use flexi_logger::{Cleanup, Criterion, FileSpec, Logger, Naming};

use crate::LoggerError;

lazy_static! {
    static ref NUM_LOGS: usize = {
        // NOTE: This allows a user to change `NUM_LOGS` via an env var upon building.

        const MIN_NUM_LOGS: usize = 2;
        const MAX_NUM_LOGS: usize = 100;
        const DEFAULT_NUM_LOGS_STR: &str = "50";
        let default_num_logs = DEFAULT_NUM_LOGS_STR.parse::<usize>().expect("This obviously won't fail!");

        // NOTE: First check the env var or default to our amount...
        let num_logs_str = option_env!("NUM_LOGS").unwrap_or_else(|| DEFAULT_NUM_LOGS_STR);

        // NOTE: Now we need to parse the above amount from str to usize...
        let num_logs = num_logs_str.parse::<usize>().unwrap_or(default_num_logs);

        // NOTE: Finally, sanity checks...
        if !(MIN_NUM_LOGS..=MAX_NUM_LOGS).contains(&num_logs) {
            default_num_logs
        } else {
            num_logs
        }
    };

    static ref LOG_SIZE: u64 = {
        // NOTE: This allows a user to change `LOG_SIZE` via an env var upon building.

        const MIN_LOG_SIZE: u64 = 1000; // NOTE: 1kb
        const MAX_LOG_SIZE: u64 = 1_000_000_000; // NOTE: 1gb
        const DEFAULT_LOG_SIZE: &str = "1000000"; // NOTE: 1mb
        let default_log_size = DEFAULT_LOG_SIZE.parse::<u64>().expect("This obviously won't fail!");

        let log_size_str = option_env!("LOG_SIZE").unwrap_or_else(|| DEFAULT_LOG_SIZE);

        // NOTE: Now we need to parse the above amount from str to u64...
        let log_size = log_size_str.parse::<u64>().unwrap_or(default_log_size);

        // NOTE: Finally, sanity checks...
        if !(MIN_LOG_SIZE..=MAX_LOG_SIZE).contains(&log_size) {
            default_log_size
        } else {
            log_size
        }
    };

    static ref LOG_PATH: String = {
        // NOTE This allows a user to change the default log path via an env var upon building.

        const DEFAULT_LOG_PATH: &str = "./logs/";
        option_env!("LOG_PATH").unwrap_or_else(|| DEFAULT_LOG_PATH).to_string()
    };

    static ref LOG_LEVEL: String = {
        // NOTE This allows a user to change the default log level via an env var upon building.


        const DEFAULT_LOG_LEVEL: &str = "info";
        let log_level = option_env!("LOG_LEVEL").unwrap_or_else(|| DEFAULT_LOG_LEVEL).to_lowercase();

        let log_levels = ["info", "warn", "debug", "error", "trace"];
        if log_levels.contains(&log_level.as_ref()) {
            log_level
        } else {
            "info".to_string()
        }
    };
}

pub fn initialize_file_logger() -> Result<(), LoggerError> {
    let num_logs_to_keep = *NUM_LOGS / 2; // NOTE: We'll keep half of them compressed.

    Logger::try_with_str(&*LOG_LEVEL).and_then(|logger| {
        logger
            .format(flexi_logger::opt_format) // NOTE: This adds more detail to log entries, timestamp, file-path etc.
            .log_to_file(FileSpec::default().directory(&*LOG_PATH))
            .rotate(
                Criterion::Size(*LOG_SIZE),
                Naming::Timestamps,
                Cleanup::KeepLogAndCompressedFiles(num_logs_to_keep, num_logs_to_keep),
            )
            .append()
            .start()
    })?;
    trace!("logger started with traces!");
    Ok(())
}
