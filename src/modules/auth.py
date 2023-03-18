import mechanize

from auth import ACCESS_URL, LOGIN_URL


class Browser(mechanize.Browser):

    def __init__(self):
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



    def __init__(self, username: str, password: str) -> None:
        self.usename = username
        self.password = password

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
