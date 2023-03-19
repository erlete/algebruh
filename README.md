# Algebruh

Algebruh is an image reader with graphical user interface that allows users to fetch pre-set answers to questions in a quick, efficient way.

## Installation

_The application is only available for the Windows x64 OS. Further implementations for different OSs and architectures are not planned._

This application does not require prior installation. Just download the `.exe` file located in the binary files of the [latest release](https://github.com/erlete/algebruh/releases) and run it.

*Warning: Windows Defender might identify the executable as a threat. It is not, but the compiling method ([PyInstaller](https://pyinstaller.org/en/stable/index.html)) contains some elements that trigger the firewall. If you are not sure about whether the code is safe, feel free to analyze it, since it is open-source.*

## Usage

In the main window application (login), you will be prompted for your username and password. This is due to the fact that the application is designed to operate over remote URLs data, which require an identification to be accessed.

Once again, feel free to examine the code to make sure that your data is not being sent anywhere but the site you are connecting to.

After a successful login, a new window will pop up. This window contains a drag and drop area where users can drop remote and local images in order to identify the linked answer, which will appear in the first text box, followed by an explanation (if existent).

## Disclaimer

**This software serves as educative tool for the author, as well as a tool for users to learn how to answer questions correctly. The software is provided "as is", without warranty of any kind, and shall not be related to any external entities and/or their products.**

**The author does not guarantee the correct operation of the software in any scenario excluded from the internal testing process. The author will not be liable for any repercusions the usage of this software might have on the user.**

**The source code is available for inspection and vulnerability reports. The source code is available for commercial use, patent use, private use, modification and distribution on the conditions stated in the _GNU Affero General Public License v3.0_, available [here](LICENSE).**

**The author will not be liable for any usage of the information of the user in any case. This tool serves only a site onnection purpose, yet how said site uses the information of the user is not the author's responsability.**
