"""Authentication module.

This module contains all required functionalities for the user to establish a
connection with the site and save their data in a session.

Authors:
    Paulo Sanchez (@erlete)
"""

import mechanize

from .config import ACCESS_URL, LOGIN_URL


class Browser(mechanize.Browser):
    """Customized mechanize.Browser descendant class."""

    def __init__(self):
        """Initialize a Browser instance."""
        super().__init__()

        self.set_handle_equiv(True)
        self.set_handle_gzip(True)
        self.set_handle_redirect(True)
        self.set_handle_referer(True)
        self.set_handle_robots(False)
        self.set_handle_refresh(
            mechanize._http.HTTPRefreshProcessor(),
            max_time=1
        )

        self.addheaders = [("User-agent", "Chrome")]


class Session:
    """Client session handler.

    This class represents a session that the user starts with the site.

    Attributes:
        username (str): username for the login process.
        password (str): password for the login process.
        browser (Browser): browser instance for the session.
    """

    def __init__(self, username: str, password: str) -> None:
        """Initialize a Session instance.

        Args:
            username (str): username for the login process.
            password (str): password for the login process.
        """
        self.username = username
        self.password = password
        self.browser = Browser()

    @property
    def username(self) -> str:
        """Get the username.

        Returns:
            str: the username.
        """
        return self._username

    @username.setter
    def username(self, value: str) -> None:
        """Set the username.

        Args:
            value (str): the username.
        """
        if not isinstance(value, str):
            raise TypeError(
                "expected type str for"
                + f" {self.__class__.__name__}.username but got"
                + f" {type(value).__name__} instead"
            )

        self._username = value

    @property
    def password(self) -> str:
        """Get the password.

        Returns:
            str: the password.
        """
        return self._password

    @password.setter
    def password(self, value: str) -> None:
        """Set the password.

        Args:
            value (str): the password.
        """
        if not isinstance(value, str):
            raise TypeError(
                "expected type str for"
                + f" {self.__class__.__name__}.password but got"
                + f" {type(value).__name__} instead"
            )

        self._password = value

    def login(self):
        """Log into the site.

        This method logs the user into the site and stores its credentials
        for subsequent requests.
        """
        self.browser.open(LOGIN_URL)

        self.browser.select_form(nr=0)
        self.browser["login"] = self.username
        self.browser["password"] = self.password

        # An error is generated due to a 301 response code, but it is OK:
        try:
            self.browser.submit()
        except Exception:
            pass

        self.browser.open(ACCESS_URL)
        _ = self.browser.response()  # This might be unnecessary.
