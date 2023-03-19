"""Container module for application classes.

This module contains all application-related classes, used to represent a
graphical user interface.

Authors:
    Paulo Sanchez (@erlete)
"""

import datetime
import os
import sys
from io import BytesIO

import numpy as np
import PyQt6
from PIL import Image
from PIL.ImageQt import ImageQt
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QIcon, QPixmap
from PyQt6.QtWidgets import (QApplication, QLabel, QLineEdit, QMainWindow,
                             QPushButton, QVBoxLayout, QWidget)

from .connection import Session
from .storage import DBHandler


def resource_path(relative_path):
    """Get absolute path to resource, works for dev and for PyInstaller."""
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)


class ImageLabel(QLabel):
    """Label for the image to display."""

    def __init__(self):
        """Initialize an ImageLabel instance."""
        super().__init__()

        self.setAcceptDrops(True)
        self.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.setIndent(4)
        self.setLineWidth(4)
        self.setMargin(10)
        self.setMidLineWidth(4)
        self.setOpenExternalLinks(True)
        self.setText("\n\nDrag and drop image here\n\n")
        self.setTextFormat(Qt.TextFormat.RichText)
        self.setTextInteractionFlags(Qt.TextInteractionFlag.NoTextInteraction)
        self.setWordWrap(True)

        self.setStyleSheet("""
            QLabel {
                border: 4px dashed #aaa
            }
        """)


class MainWidget(QWidget):
    """Main widget of the application.

    Attributes:
        session (Session): client session.
        dbhandler (DBHandler): database handler.
        VALID_EXTENSIONS (tuple[str]): valid extensions for dropped files.
    """

    VALID_EXTENSIONS = (".png",)

    def __init__(self, session: Session) -> None:
        """Initialize a MainWidget instance.

        Args:
            session (Session): client session.
        """
        self.session = session
        self.dbhandler = DBHandler()

        super().__init__()
        self.resize(1200, 400)

        self.setAcceptDrops(True)

        mainLayout = QVBoxLayout()

        self.photoViewer = ImageLabel()

        self.clearButton = QPushButton("Clear")
        self.clearButton.clicked.connect(self.clear_pixmap)

        self.answerLabel = QLabel("Answer: ")
        self.answerLabel.setWordWrap(True)
        self.answerLabel.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.answerLabel.setStyleSheet("""
            QLabel {
                font-weight: bold;
                font-size: 13px;
            }
        """)

        self.explanationLabel = QLabel("Explanation: ")
        self.explanationLabel.setWordWrap(True)
        self.explanationLabel.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.explanationLabel.setStyleSheet("""
            QLabel {
                font-size: 11px;
            }
        """)

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

        mainLayout.addWidget(self.photoViewer)
        mainLayout.addWidget(self.answerLabel)
        mainLayout.addWidget(self.explanationLabel)
        mainLayout.addWidget(self.clearButton)
        mainLayout.addWidget(self.copyrightLabel)

        self.setLayout(mainLayout)

    @classmethod
    def is_valid(cls, path: str) -> bool:
        """Determine whether the path is valid.

        Args:
            path (str): path to check.

        Returns:
            bool: True if the path is valid, False otherwise.
        """
        return path.endswith(cls.VALID_EXTENSIONS) or path.startswith("http")

    def clear_pixmap(self) -> None:
        """Clear the pixel map from the window."""
        self.photoViewer.clear()
        self.photoViewer.setText("\n\nDrag and drop image here\n\n")
        self.photoViewer.setStyleSheet("""
            QLabel {
                border: 4px dashed #aaa
            }
        """)
        self.answerLabel.setText("Answer: ")
        self.explanationLabel.setText("Explanation: ")

    def dragEnterEvent(self, event: PyQt6.QtGui.QDragEnterEvent) -> None:
        """Handle the drag enter event.

        Args:
            event (PyQt6.QtGui.QDragEnterEvent): drag enter event.
        """
        if self.is_valid(event.mimeData().text()):
            self.photoViewer.setStyleSheet("""
                QLabel {
                    border: 6px dashed #9fe05e
                }
            """)

        else:
            self.photoViewer.setStyleSheet("""
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
        self.photoViewer.setStyleSheet("""
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

        if self.is_valid(event.mimeData().text()):

            url = event.mimeData().urls()[0].url()

            self.session.browser.open(url)
            response = self.session.browser.response()

            img = Image.open(BytesIO(response.get_data()))
            img_hash = str(hash(tuple(np.array(img.getdata()).flatten())))
            data = self.dbhandler.hash_search(img_hash)

            if data is not None:
                self.answerLabel.setText(f"Answer: {data['answer']}")
                self.explanationLabel.setText(
                    f"Explanation: {data['explanation']}"
                )
            else:
                self.answerLabel.setText("Answer: Not found")
                self.explanationLabel.setText("Explanation: Not found")

            self.photoViewer.setPixmap(QPixmap.fromImage(ImageQt(img)))

            event.accept()

        else:
            event.ignore()
            self.clear_pixmap()


class LoginWindow(QMainWindow):

    def __init__(self) -> None:
        """Initialize a LoginWindow instance."""
        super().__init__()
        self.setWindowTitle("Algebruh - Login")

        self.setWindowIcon(QIcon(resource_path("media/icon.ico")))
        self.resize(400, 300)
        self.setFixedSize(self.size())

        self.header = QLabel("Welcome to Algebruh!")
        self.header.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.header.setStyleSheet("""
            QLabel {
                font-weight: bold;
                font-size: 20px;
            }
        """)

        self.login_status = QLabel(
            "Login to continue. Do not worry, we" +
            "\ndo not store your credentials. They are sent" +
            "\nonly to the login page and then discarded."
        )
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

        self._layout = QVBoxLayout()
        self._layout.setContentsMargins(20, 20, 20, 20)
        self._layout.setSpacing(10)

        self._layout.addWidget(self.header)
        self._layout.addWidget(self.login_status)
        self._layout.addWidget(self.user)
        self._layout.addWidget(self.password)
        self._layout.addWidget(self.submit)

        widget = QWidget()
        widget.setLayout(self._layout)

        self.setCentralWidget(widget)

        self.submit.clicked.connect(self.login)

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

        session = Session(username, password)
        session.login()

        if session.is_logged_in():
            self.close()
            self.main = MainWidget(session)
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
    """Main interactive application.

    This is the main application that the user must use to interact with the
    programs in the repository.

    Attributes:
        session (Session): client session.
    """

    def __init__(self, session: Session) -> None:
        """Initialize an App instance.

        Args:
            session (Session): client session.
        """
        self.session = session

    def start(self) -> None:
        """Execute the application."""
        app = QApplication(sys.argv)
        # demo = MainWidget(self.session)
        demo = LoginWindow()
        demo.show()
        app.exec()
