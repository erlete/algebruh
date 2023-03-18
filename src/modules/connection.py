"""Connection module.

This module contains all required functionalities for the user to establish a
connection with the site and save their data in a session.

Authors:
    Paulo Sanchez (@erlete)
"""

from io import BytesIO
from typing import Optional, Union

import mechanize
from PIL import Image

from .config import ACCESS_URL, ATTACHMENT_URL, LOGIN_URL
from .logger import Logger


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

    def __init__(self, username: str, password: str,
                 log_level: int = 1) -> None:
        """Initialize a Session instance.

        Args:
            username (str): username for the login process.
            password (str): password for the login process.
            log_level (int, optional): message logging level. Defaults to 1.
        """
        self._logger = Logger(log_level)
        self._authenticated = False
        self._accessed = False

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

        self._logger.log(f"Setting session username to \"{value}\"...", 0)
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

        self._logger.log(f"Setting session pasword to \"{value}\"...", 0)
        self._password = value

    def login(self):
        """Log into the site.

        This method logs the user into the site and stores its credentials
        for subsequent requests.
        """
        self._logger.log(f"Opening \"{LOGIN_URL}\"...", 0)
        self.browser.open(LOGIN_URL)

        self._logger.log("Selecting form and setting attributes...", 0)
        self.browser.select_form(nr=0)
        self.browser["login"] = self.username
        self.browser["password"] = self.password

        try:
            self._logger.log("Submitting data...", 0)
            self.browser.submit()

        # An error is generated due to a 301 response code, but it is OK:
        except mechanize.HTTPError:
            self._authenticated = True
            self._logger.log("Authentication successful.", 1)

            self._logger.log(f"Opening \"{ACCESS_URL}\"...", 0)
            self.browser.open(ACCESS_URL)

            response = self.browser.response()
            if response.code == 200:
                self._accessed = True
                self._logger.log("Access successful.")
            else:
                self._logger.log("Access error.", 2)

        else:
            self._logger.log("Authentication error.", 2)

    def get_attachment(
                self,
                x: Union[int, str],
                y: Union[int, str],
                z: Union[int, str]
            ) -> Optional[Image.Image]:
        """Get an image attachment from the site.

        Args:
            x (int | str): X code of the URL.
            y (int | str): Y code of the URL.
            z (int | str): Z code of the URL.

        Raises:
            RuntimeError: if the user is not authenticated.
            RuntimeError: if the user does not have access permissions.
            TypeError: if any of the arguments is not an int or str.
            TypeError: if any of the arguments does not contain 1-3 characters.

        Returns:
            PIL.Image.Image | None: image attachment (if existent, else None).
        """
        if not self._authenticated:
            raise RuntimeError("user is not authenticated.")
        elif not self._accessed:
            raise RuntimeError("user does not have access permissions.")

        if not all(isinstance(code, (int, str)) for code in (x, y, z)):
            raise TypeError(
                "x, y and z codes must be integer or string values"
            )

        x, y, z = str(x), str(y), str(z)

        if not all(
                1 <= len(code) <= 3 and code.isnumeric()
                for code in (x, y, z)
                ):
            raise TypeError(
                "x, y and z values must contain between 1 and 3 numeric "
                + "characters"
            )

        try:
            url = f"{ATTACHMENT_URL}?id=download_{x}_{y}_{z}"
            self._logger.log(f"Opening \"{url}\"...", 0)
            self.browser.open(url)

        except mechanize.HTTPError:
            self._logger.log("Unable to fetch attachment.", 2)
            return None

        self._logger.log("Attachment fetch successful.", 0)
        return Image.open(BytesIO(
            self.browser.response().get_data()
        ))
