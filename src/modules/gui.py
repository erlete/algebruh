"""Container module for application classes.

This module contains all application-related classes, used to represent a
graphical user interface for the programs of the repository.

Authors:
    Paulo Sanchez (@erlete)
"""

import datetime
import os
import sys
from io import BytesIO
from random import randint
from typing import Any, Dict

import numpy as np
import PyQt6
from PIL import Image
from PIL.ImageQt import ImageQt
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QIcon, QPixmap
from PyQt6.QtWidgets import (QApplication, QHBoxLayout, QLabel, QLineEdit,
                             QMainWindow, QPushButton, QScrollArea, QTextEdit,
                             QVBoxLayout, QWidget)

from .connection import Session
from .storage import DBHandler


def resource_path(relative_path: str) -> str:
    """Get absolute path to resource (required by .exe filesystem).

    Args:
        relative_path (str): path to the resource.

    Returns:
        str: parsed path to the resource.
    """
    try:
        base_path = sys._MEIPASS  # type: ignore
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)


class ImageField(QLabel):
    """Image field that allows drag and drop operations."""

    def __init__(self):
        """Initialize an ImageLabel instance."""
        super().__init__()

        self.setMinimumSize(200, 100)

        self.setAcceptDrops(True)
        self.setOpenExternalLinks(True)
        self.setWordWrap(True)

        self.setText("Drag and drop image here")
        self.setTextFormat(Qt.TextFormat.RichText)
        self.setTextInteractionFlags(Qt.TextInteractionFlag.NoTextInteraction)
        self.setAlignment(Qt.AlignmentFlag.AlignCenter)

        self.setStyleSheet("""
            QLabel {
                border: 4px dashed #aaa
            }
        """)

    def clear(self):
        """Clear image field contents."""
        super().clear()
        self.setText("Drag and drop image here")
        self.setStyleSheet("""
            QLabel {
                border: 4px dashed #aaa
            }
        """)


class AnswerField(QScrollArea):
    """Scrollable text field for the answer.

    Attributes:
        text (QTextEdit): the text field.
    """

    def __init__(self, placeholder_text: str, read_only: bool = True) -> None:
        """Initialize an AnswerField instance.

        Args:
            placeholder_text (str): the placeholder text.
            read_only (bool): whether the field is read-only.
        """
        super().__init__()

        self._placeholder_text = placeholder_text

        self._text = QTextEdit()
        self._text.setReadOnly(read_only)
        self._text.setContentsMargins(5, 5, 5, 5)
        self._text.setPlaceholderText(placeholder_text)
        self._text.setLineWrapMode(QTextEdit.LineWrapMode.NoWrap)

        self.setWidgetResizable(True)
        self.setMinimumSize(200, 100)

        self.setAlignment(Qt.AlignmentFlag.AlignLeft)

        self.setWidget(self._text)

    @property
    def text(self) -> str:
        """Get the text field.

        Returns:
            str: the text field.
        """
        return self._text.toPlainText()

    @text.setter
    def text(self, value: str) -> None:
        """Set the text field.

        Args:
            value (str): the text field.
        """
        if not isinstance(value, str):
            raise TypeError(
                "expected type str for"
                + f" {self.__class__.__name__}.text but got"
                + f" {type(value).__name__} instead"
            )

        self._text.setText(value)

    def clear(self):
        """Clear the answer field."""
        self._text.clear()
        self._text.setPlaceholderText(self._placeholder_text)


class AnswerWindow(QMainWindow):
    """Answer retrieval widget.

    Attributes:
        session (Session): client session.
        dbhandler (DBHandler): database handler.
        VALID_EXTENSIONS (tuple[str]): valid extensions for dropped files.
    """

    VALID_EXTENSIONS = (".png",)

    def __init__(self, session: Session, admin_login: bool, dummy_admin_login: bool) -> None:
        """Initialize a MainWidget instance.

        Args:
            session (Session): client session.
            admin_login(bool): whether the login is performed by an admin.
            dummy_adming_login(bool): a troll admin
        """
        super().__init__()

        self.session = session
        self.dbhandler = DBHandler(resource_path("databases"))

        self.__admin_login = admin_login
        self.__dummy_admin_login = dummy_admin_login
        self.__log: Dict[str, Any] = {}

        self.setWindowTitle("Algebruh - Answer Retrieval")
        self.setWindowIcon(QIcon(resource_path("icon.ico")))

        self.setAcceptDrops(True)
        self.setMinimumSize(800, 300)

        self.setup()

    def setup(self) -> None:
        """Set up window components."""
        self.setup_widgets()
        self.setup_event_handlers()
        self.setup_layout()

    def setup_widgets(self) -> None:
        """Set up window widgets."""
        self.image_field = ImageField()
        self.answer_field = AnswerField("Answer: ")
        self.explanation_field = AnswerField("Explanation: ")
        self.clear_button = QPushButton("Clear")

    def setup_event_handlers(self) -> None:
        """Set up widget event handlers."""
        self.clear_button.clicked.connect(self.reset)

    def setup_layout(self) -> None:
        """Set up window layout."""
        central_wdg, secondary_wdg = QWidget(), QWidget()
        central_lay, secondary_lay = QVBoxLayout(), QHBoxLayout()

        secondary_lay.addWidget(self.answer_field)
        secondary_lay.addWidget(self.explanation_field)
        secondary_wdg.setLayout(secondary_lay)

        central_lay.addWidget(self.image_field)
        central_lay.addWidget(secondary_wdg)
        central_lay.addWidget(self.clear_button)
        central_wdg.setLayout(central_lay)

        self.setCentralWidget(central_wdg)

    @staticmethod
    def invert(answer: bool) -> str:
        """Invert an answer.

        What is this method? Why is it here? Who knows...

        Args:
            answer (bool): answer to invert.

        Returns:
            str: the inverted answer.
        """
        if answer == "Verdadero":
            return "Falso"

        elif answer == "Falso":
            return "Verdadero"

        return ""

    @classmethod
    def is_valid(cls, path: str) -> bool:
        """Determine whether the path is valid.

        Args:
            path (str): path to check.

        Returns:
            bool: True if the path is valid, False otherwise.
        """
        return path.endswith(cls.VALID_EXTENSIONS) or path.startswith("http")

    def reset(self) -> None:
        """Reset contents of all fields."""
        self.image_field.clear()
        self.answer_field.clear()
        self.explanation_field.clear()

    def dragEnterEvent(self, event: PyQt6.QtGui.QDragEnterEvent) -> None:
        """Handle the drag enter event.

        Args:
            event (PyQt6.QtGui.QDragEnterEvent): drag enter event.
        """
        if self.is_valid(event.mimeData().text()):
            self.image_field.setStyleSheet("""
                QLabel {
                    border: 6px dashed #9fe05e
                }
            """)

        else:
            self.image_field.setStyleSheet("""
                QLabel {
                    border: 6px dashed #940c13
                }
            """)

        event.accept()

    def dragLeaveEvent(self, event: PyQt6.QtGui.QDragLeaveEvent) -> None:
        """Handle the drag leave event.

        Args:
            event (PyQt6.QtGui.QDragLeaveEvent): drag leave event.
        """
        self.image_field.setStyleSheet("""
            QLabel {
                border: 4px dashed #aaa
            }
        """)

        event.accept()

    def dropEvent(self, event: PyQt6.QtGui.QDropEvent) -> None:
        """Handle the drop event.

        Args:
            event (PyQt6.QtGui.QDropEvent): drop event.

        Raises:
            RuntimeError: if the client is not logged into the site.
        """
        if not self.session.is_logged_in():
            raise RuntimeError("the client is not logged into the site.")

        if not self.is_valid(event.mimeData().text()):
            event.ignore()
            self.reset()

            return None

        event.accept()

        self.session.browser.open(event.mimeData().urls()[0].url())
        response = self.session.browser.response()
        img = Image.open(BytesIO(response.get_data()))
        img_hash = str(hash(tuple(np.array(img.getdata()).flatten())))
        data = self.dbhandler.hash_search(img_hash)

        self.image_field.setPixmap(QPixmap.fromImage(ImageQt(img)))

        if data is None:
            self.answer_field.text = "Answer not found!"
            self.explanation_field.text = "Explanation not found!"

            return None

        if img_hash in self.__log:
            self.answer_field.text = (
                f"Answer: {self.__log[img_hash]['answer']}"
            )
            self.explanation_field.text = (
                f"Explanation: {self.__log[img_hash]['explanation']}"
            )

            return None

        # Wait what? You found the easter egg!

        if self.__admin_login:
            ans = data["answer"]
            exp = data["explanation"]

        ## Added easter egg, will always fail so be careful if you're doing a test and you enter this mode (the troll mode XD)
        elif self.__dummy_admin_login :
            ans = self.invert(data["answer"]) 
            exp = ""

        else:
            # Yes, the program fails questions on purpose.
            #   This is done in order to avoid excessive OP tool usage.
            #   Yes, yes, you want to use it in admin mode too... I get it.
            #   Just add a % before your email in the login and you will
            #   be authenticated as admin.
            #
            # Example (user vs. admin login)
            #   john@doe.com
            #   %john@doe.com
            #
            # You tell this to anyone and I will filter your IP to the
            #   russian mafia.

            wrong = not bool(randint(0, 7))

            if wrong:
                ans = self.invert(data["answer"])  # Fail on purpose >:)
                exp = ""
            else:
                ans = data["answer"]
                exp = data["explanation"]

        self.answer_field.text = f"Answer: {ans}"
        self.explanation_field.text = f"Explanation: {exp}"

        self.__log[img_hash] = {
            "answer": ans,
            "explanation": exp
        }


class LoginWindow(QMainWindow):
    """Login window for the application.

    This window is used to create a new session for the client.
    """

    def __init__(self) -> None:
        """Initialize a LoginWindow instance."""
        super().__init__()
        self.setWindowTitle("Algebruh - Login")
        self.setWindowIcon(QIcon(resource_path("icon.ico")))

        self.resize(400, 300)
        self.setFixedSize(self.size())

        self.setup()

    def setup(self) -> None:
        """Set up window widgets."""
        self.setup_widgets()
        self.setup_event_handlers()
        self.setup_layout()

    def setup_widgets(self) -> None:
        """Set up window widgets."""
        self.header = QLabel("Welcome to Algebruh!")
        self.header.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.header.setStyleSheet("""
            QLabel {
                font-weight: bold;
                font-size: 20px;
            }
        """)

        self.login_status = QLabel("""
            Login to continue.
            Do not worry, we do not store your credentials.
            They are sent only to the login page and then discarded.
        """.replace("\t", ""))
        self.login_status.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.login_status.setStyleSheet("""
            QLabel {
                font-size: 12px;
                font-weight: normal;
            }
        """)

        self.user = QLineEdit()
        self.user.setPlaceholderText("Username")

        self.password = QLineEdit()
        self.password.setPlaceholderText("Password")
        self.password.setEchoMode(QLineEdit.EchoMode.Password)

        self.submit = QPushButton("Submit")

        year = datetime.datetime.now().year
        self.copyrightLabel = QLabel(
            f"© {year} Paulo Sanchez (@erlete). All rights reserved."
        )
        self.copyrightLabel.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.copyrightLabel.setStyleSheet("""
            QLabel {
                font-size: 10px;
            }
        """)

    def setup_event_handlers(self) -> None:
        """Set up widget event handlers."""
        self.submit.clicked.connect(self.login)

    def setup_layout(self) -> None:
        """Set up window layout."""
        central_wdg = QWidget()
        central_lay = QVBoxLayout()

        central_lay.setContentsMargins(20, 20, 20, 20)
        central_lay.setSpacing(10)

        central_lay.addWidget(self.header)
        central_lay.addWidget(self.login_status)
        central_lay.addWidget(self.user)
        central_lay.addWidget(self.password)
        central_lay.addWidget(self.submit)
        central_lay.addWidget(self.copyrightLabel)

        central_wdg.setLayout(central_lay)

        self.setCentralWidget(central_wdg)

    def login(self) -> None:
        """Login method for the application.

        This method is used to get the username and password from the user
        and then attempt to login to the site. If the login is successful,
        the main window is opened. Otherwise, the user is notified that the
        login was unsuccessful.
        """
        self.submit.setEnabled(False)

        username = self.user.text()
        password = self.password.text()

        # Huh... what could this be?
        dummy_admin_login = False
        admin_login = False
        if username.startswith("%"):
            admin_login = True
            username = username[1:]
            
        elif username.startswith("!"):
            dummy_admin_login = True
            username = username[1:]

        session = Session(username, password)
        session.login()

        if session.is_logged_in():
            self.close()
            self.main = AnswerWindow(session, admin_login, dummy_admin_login)
            self.main.show()

        else:
            self.submit.setEnabled(True)
            self.login_status.setText("Invalid username or password")
            self.login_status.setStyleSheet("""
                QLabel {
                    color: red;
                    font-weight: bold;
                }
            """)

            self.user.setText("")
            self.user.setPlaceholderText("Username")
            self.password.setText("")
            self.password.setPlaceholderText("Password")


class App:
    """Main application interface.

    This is the interface for the application that the user must use to
    interact with the programs in the repository.
    """

    def start(self) -> None:
        """Execute the application."""
        app = QApplication(sys.argv)
        demo = LoginWindow()
        demo.show()
        app.exec()
