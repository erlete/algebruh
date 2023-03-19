
import sys
from io import BytesIO

import mechanize
import numpy as np
import PIL
import PyQt6
from PIL import Image
from PIL.ImageQt import ImageQt
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QPixmap
from PyQt6.QtWidgets import (QApplication, QLabel, QPushButton, QVBoxLayout,
                             QWidget)

from src.modules.connection import Session
from src.modules.storage import DBHandler

br = mechanize.Browser()


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

    VALID_EXTENSIONS = (".png",)

    def __init__(self, session: Session) -> None:
        """Initialize a MainWidget instance.

        Args:
            session (Session): client session.
        """
        self.session = session
        self.dbhandler = DBHandler()

        super().__init__()
        self.resize(400, 400)
        self.setAcceptDrops(True)

        mainLayout = QVBoxLayout()

        self.photoViewer = ImageLabel()
        mainLayout.addWidget(self.photoViewer)
        # add a button that clears the pixmap
        self.clearButton = QPushButton("Clear")
        self.clearButton.clicked.connect(self.clear_pixmap)
        mainLayout.addWidget(self.clearButton)

        self.setLayout(mainLayout)

    @classmethod
    def is_valid(cls, file_path: str) -> bool:
        """Determine whether the file path is valid.

        Args:
            file_path (str): file path to check.

        Returns:
            bool: True if the file path is valid, False otherwise.
        """
        return file_path.endswith(cls.VALID_EXTENSIONS)

    def clear_pixmap(self):
        self.photoViewer.clear()
        self.resize(400, 400)
        self.photoViewer.setText("\n\nDrag and drop image here\n\n")
        self.photoViewer.setStyleSheet("""
            QLabel {
                border: 4px dashed #aaa
            }
        """)

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
        """
        if self.is_valid(event.mimeData().text()):

            url = event.mimeData().urls()[0].url()

            self.session.browser.open(url)
            response = self.session.browser.response()

            img = Image.open(BytesIO(response.get_data()))
            img_hash = str(hash(tuple(np.array(img.getdata()).flatten())))

            print(f"{self.dbhandler.hash_search(img_hash) = }")
            self.photoViewer.setPixmap(QPixmap.fromImage(ImageQt(img)))

            event.accept()

        else:
            event.ignore()
            self.clear_pixmap()


class App:

    def __init__(self, session: Session) -> None:
        """Initialize an App instance.

        Args:
            session (Session): client session.
        """
        self.session = session
        app = QApplication(sys.argv)
        demo = MainWidget(session)
        demo.show()
        app.exec()

App(Session("123", "123"))
