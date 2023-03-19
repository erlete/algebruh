"""Container module for application classes.

This module contains all application-related classes, used to represent a
graphical user interface.

Authors:
    Paulo Sanchez (@erlete)
"""

import datetime
import sys
from io import BytesIO

import numpy as np
import PyQt6
from PIL import Image
from PIL.ImageQt import ImageQt
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QPixmap
from PyQt6.QtWidgets import (QApplication, QLabel, QPushButton, QVBoxLayout,
                             QWidget)

from .connection import Session
from .storage import DBHandler


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
                font-size: 8px;
            }
        """)

        mainLayout.addWidget(self.photoViewer)
        mainLayout.addWidget(self.answerLabel)
        mainLayout.addWidget(self.explanationLabel)
        mainLayout.addWidget(self.clearButton)

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
        demo = MainWidget(self.session)
        demo.show()
        app.exec()
