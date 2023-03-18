"""Configuration module.

This module contains all configuration constants required to establish a
connection with the server, authenticate the user and access the course.

Constants:
    COURSE_ID (str): ID of the course.
    BASE_URL (str): base URL of the site.
    LOGIN_EXT (str): extension of the login page.
    ACCESS_EXT (str): extension of the access page.
    ATTACHMENT_EXT (str): extension of the attachments page.
    LOGIN_URL (str): URL of the login page.
    ACCESS_URL (str): URL of the access page.
    ATTACHMENT_URL (str): URL of the attachments page.

Authors:
    Paulo Sanchez (@erlete)
"""

COURSE_ID = "O06G151V0116"
BASE_URL = "https://torricelli.uvigo.es/aula/claroline"

LOGIN_EXT = "auth/login.php"
ACCESS_EXT = "aula/claroline/course/index.php"
ATTACHMENT_EXT = "exercise/get_attachment.php"

LOGIN_URL = f"{BASE_URL}/{LOGIN_EXT}"
ACCESS_URL = f"{BASE_URL}/{ACCESS_EXT}?cid={COURSE_ID}"
ATTACHMENT_URL = f"{BASE_URL}/{ATTACHMENT_EXT}"
