---
translationOf: vscode
title: Installing VS Code and Setting Up a C++ Environment
description: Notes on installing VS Code, configuring a C++ compiler, and setting up debugging.
draft: false
sourceRevision: 643cecfca2a1c2671f6178452377e336989ee9a9e74c116e1c6adb531a5c470c
---

**Introduction: After spending two or three days trying to get VS Code working, I finally figured it out. The instructions I found online were scattered, so I decided to write up my own notes.**

## 1. Installing VS Code

**Official website: [https://code.visualstudio.com/](https://code.visualstudio.com/)**

Make sure you download **Visual Studio Code**, rather than **Visual Studio**. The correct icon is **blue**, not purple!

If the download is slow, a proxy may help. I planned to write a separate tutorial on using Clash afterward.

The installation is straightforward: follow the prompts, and remember to create a desktop shortcut.

## 2. Appearance and the Chinese Language Pack

You can skip this section if you are happy with the default appearance and English interface.

**Appearance:** On first launch, VS Code offers theme choices and a getting-started walkthrough. Pick a theme you like, mark the walkthrough as complete, and turn off the welcome page on startup if you prefer.

**Chinese interface:** If your operating system uses Chinese, VS Code will usually suggest the Chinese language pack on first launch. If it does not, click the **Extensions** icon on the left—the one that looks like a square with a smaller piece breaking away. Search for `Chinese`, install the language pack, and restart VS Code.

## 3. Installing the C++ Extensions

Open **Extensions**, search for `C++`, and install **C/C++**, **C/C++ Extension Pack**, and **C/C++ Themes**. Wait for the notifications in the lower-right corner to disappear, then restart VS Code.

## 4. Configuring the Compiler

I used the MinGW64 compiler for this setup. If you already have Dev-C++ installed, you can also use its compiler, usually found at `C:\Program Files (x86)\Dev-Cpp\MinGW64`.

**MinGW64 website: [https://sourceforge.net/projects/mingw-w64/files/mingw-w64/mingw-w64-release/](https://sourceforge.net/projects/mingw-w64/files/mingw-w64/mingw-w64-release/)**

Scroll down to version **8.1.0**, which was the version used when I wrote this guide. Choose `x86-64` for a 64-bit operating system, or `i686` for a 32-bit one. The original setup used the `win32` option on Windows and mentioned `posix` for Linux. Download an archive marked `seh` and extract it, preferably to a drive other than C:.

Next, open **Control Panel** and search for **Advanced system settings**. Open **View advanced system settings**, then **Environment Variables**. Under **System variables**, select **Path**, click **Edit**, and click **New**. Add the path to the extracted compiler's `bin` directory. Mine was **`E:\VSCode\mingw64\bin`**.

Open `cmd` and run **`gcc -v`**. If it prints the compiler's version and configuration details, the environment variable is set correctly.

Create a folder named `.vscode` somewhere convenient. I preferred keeping it in a dedicated `VSCode` directory alongside the compiler.

#### Keep this folder: the JSON files and settings used in the following steps will live here.

Now configure the compiler path. In VS Code, choose **File → Open Folder**, open the `.vscode` folder you just created, and trust it. Press **Ctrl + Shift + P** to open the Command Palette, type `C/C++`, and select **Edit Configurations (UI)**. Set these two options:

**1. Compiler path: `E:/VSCode/mingw64/bin/g++.exe`**

Replace this with the path to your own compiler, matching the installation you added to `Path`.

**2. IntelliSense mode: `gcc-x64`**

After saving, you should see a `.vscode` folder in the sidebar containing `c_cpp_properties.json`. That means the configuration file was created.

## 5. Configuring the Build Task

Next, create a `tasks.json` file to tell VS Code how to compile your program. This task calls `g++` to build an executable from your source code.

Press **Ctrl + Shift + P**, type `tasks`, select **Tasks: Configure Default Build Task**, and choose **C/C++: g++.exe build active file**. VS Code will create a configuration file named `tasks.json`.

## 6. Configuring Debugging

This step creates `launch.json` in the `.vscode` folder to hold the debugger settings. Press **Ctrl + N** to create a file and enter a small program, for example:

```cpp
#include<iostream>
using namespace std;
int main(){
    cout<<"hello, world";
    return 0;
}
```

Press **F5**, choose **C++ (GDB/LLDB)**, and select `g++.exe` on the next screen. After the output appears, look for the option to **create a launch.json file**. If `launch.json` appears in the `.vscode` folder created earlier, this part worked.

After building with **F5**, an `.exe` file will appear alongside the `.cpp` file. Open it to run the program.

## 7. Default Build Settings

Without a default configuration, VS Code may ask you to choose a compiler every time you press **F5**. Setting one lets you build and run directly.

Open `launch.json` in the `.vscode` folder and paste in the following configuration. The task names and paths below are kept as they appeared in my original setup; `preLaunchTask` must match the corresponding task's label in `tasks.json`.

```json
{
    // Use IntelliSense to learn about available attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "g++.exe - 生成和调试活动文件",
            "type": "cppdbg",
            "request": "launch",
            "program": "${fileDirname}\\${fileBasenameNoExtension}.exe",
            "args": [],
            "stopAtEntry": false,
            "cwd": "E:\\VSCode\\mingw64\\bin",
            "environment": [],
            "externalConsole": false,
            "MIMode": "gdb",
            "miDebuggerPath": "E:\\VSCode\\mingw64\\bin\\gdb.exe",
            "setupCommands": [
                {
                    "description": "为 gdb 启用整齐打印",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": true
                }
            ],
            "preLaunchTask": "C/C++: g++.exe 生成活动文件"
        }
    ]
}
```

Change `cwd` and `miDebuggerPath` to match your compiler's location, then save the file.

With this configuration, pressing **F5** does not open a separate console window as Dev-C++ does. To show one, change `externalConsole` to `true`.

## 8. Creating a Starter Code Snippet

A starter snippet inserts the code you usually want when creating a new file.

Press **Ctrl + Shift + P**, enter **Configure User Snippets**, and choose **New Global Snippets file**. Give it a name, press **Enter**, and define your starter code.

My JSON file: [https://www.luogu.com.cn/paste/robl6cz4](https://www.luogu.com.cn/paste/robl6cz4)

Save it with **Ctrl + S**, create a new file, and type `#include`. The first suggestion should be the snippet you configured. Press **Enter** to insert it.

## 9. Uninstalling Completely

If you uninstall VS Code normally and later reinstall it, your old settings, opened folders, and extensions may still be there. A normal uninstall leaves some user data behind.

For a fresh installation, uninstall VS Code and then remove the contents of these two directories:

- **`C:\Users\USERNAME\.vscode`**
- **`C:\Users\USERNAME\AppData\Roaming\Code`**

Replace `USERNAME` with your Windows username. After clearing those directories, reinstalling VS Code gives you a fresh setup.

## Closing Thoughts

That covers the basic configuration. Enjoy using VS Code! If anything in my explanation is unclear, the Zhihu articles below go into more detail.

[Reference: https://zhuanlan.zhihu.com/p/87864677](https://zhuanlan.zhihu.com/p/87864677)

[Settings Worth Knowing When You First Use VS Code](https://zhuanlan.zhihu.com/p/62913725)

Additional files: [tasks.json](https://www.luogu.com.cn/paste/nqq35kic), [c_cpp_properties.json](https://www.luogu.com.cn/paste/zron54pi), [starter snippet](https://www.luogu.com.cn/paste/robl6cz4), [launch.json](https://www.luogu.com.cn/paste/aal9qmc2)

Thanks to [The_BJX](https://www.luogu.com.cn/user/364027) for the JSON files and help with the setup.
