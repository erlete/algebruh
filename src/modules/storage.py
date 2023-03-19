"""Container module for storage utilities.

Authors:
    Paulo Sanchez (@erlete)
"""

import json
from typing import Any, Optional


def load_json(path: str) -> dict[Any, Any]:
    """Load a JSON file in memory.

    Args:
        path (str): path to the file.

    Returns:
        dict[Any, Any]: parsed dictionary.
    """
    with open(path, mode="r", encoding="utf-8") as fp:
        return json.load(fp)


class DBHandler:
    """Database handling class.

    This class allows controlled access to the databases that relate file IDs,
    hashes and linked data.
    """

    def __init__(self, path: str) -> None:
        """Initialize a DBHandler instance.

        Args:
            path (str): path to the database directory.
        """
        self.path = path
        self._by_id = self._load(f"{path}\\by_id.json")
        self._by_hash = self._load(f"{path}\\by_hash.json")

    def _load(self, name: str) -> dict[Any, Any]:
        """Load a JSON file in memory.

        Args:
            name (str): path to the file.

        Returns:
            dict[Any, Any]: parsed dictionary.
        """
        with open(name, mode="r", encoding="utf-8") as fp:
            return json.load(fp)

    def id_search(self, id_: str) -> Optional[dict[str, str]]:
        """Search for the contents of a file by id.

        Args:
            id_ (str): id of the file.

        Returns:
            Optional[dict[str, str]]: stored data.
        """
        return self._by_id.get(str(id_))

    def hash_search(self, hash_: str) -> Optional[dict[str, str]]:
        """Search for the contents of a file by hash.

        Args:
            hash_ (str): hash of the file.

        Returns:
            Optional[dict[str, str]]: stored data.
        """
        return self._by_hash.get(str(hash_))
