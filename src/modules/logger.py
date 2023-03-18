"""Container module for the Logger class.

Authors:
    Paulo Sanchez (@erlete)
"""

from colorama import Fore


class Logger:
    """Logger class for on-screen logging.

    This class provides a simple way to log messages to the console using
    colors to visually represent log levels. It also provides a way to set
    the verbosity level of the logger, so that only messages with a level
    equal to or greater than the pre-set verbosity level are displayed.

    Attributes:
        CONFIG (list): configuration for the logger (class attribute).
        log_level (int): log level.
    """

    CONFIG = (
        {"level": "DEBUG", "color": Fore.LIGHTBLACK_EX},
        {"level": "INFO", "color": Fore.LIGHTWHITE_EX},
        {"level": "WARNING", "color": Fore.YELLOW},
        {"level": "ERROR", "color": Fore.RED},
        {"level": "CRITICAL", "color": Fore.LIGHTRED_EX},
    )

    def __init__(self, log_level: int = 1) -> None:
        """Initialize a new Logger instance.

        Args:
            log_level (int, optional): log level (between 0 and 4, inclusive).
                Defaults to 1.
        """
        self.log_level = log_level

    @property
    def log_level(self) -> int:
        """Get the log level.

        Returns:
            int: log level.
        """
        return self._log_level

    @log_level.setter
    def log_level(self, log_level: int) -> None:
        """Set the log level.

        Args:
            log_level (int): log level.
        """
        if not isinstance(log_level, int):
            raise TypeError("log_level must be an integer")

        if not 0 <= log_level < len(Logger.CONFIG) - 1:
            raise ValueError(
                f"log_level must be between 0 and {len(Logger.CONFIG)}, "
                + "inclusive."
            )

        self._log_level = log_level

    def log(self, message: str, log_level: int = 1, end: str = "\n") -> None:
        r"""Log a message.

        This method logs a message to the console if the log level of the
        message is equal or lower than the log level of the logger.

        Args:
            message (str): message to log.
            log_level (int, optional): log level. Defaults to 1.
            end (str, optional): end of line character. Defaults to "\n"
        """
        if log_level >= self.log_level:
            print(
                f"{self.CONFIG[log_level].get('color')}"
                + f"{self.CONFIG[log_level].get('level')}: {message}"
                + f"{Fore.RESET}",
                end=end,
            )
