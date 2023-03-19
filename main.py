"""Main executable module of the application.

Authors:
    Paulo Sanchez (@erlete)
"""

from auth import PASSWORD, USER
from src.modules.connection import Session
from src.modules.gui import App

session = Session(USER, PASSWORD)
session.login()

app = App(session)
app.start()
