---
title: VSCode的安装及环境配置
date: 2022-08-23
description: VSCode 的安装、C++ 编译器配置以及调试环境设置记录。
categories: [Experience]
tags: [C++, VSCode]
slug: vscode
draft: false
cover: /img/covers/vscode.png
---

**前言：本人搞VSC搞了两三天，终于搞好了。网上的方法有些杂碎，所以自己写了个总结。**

## 1. 安装VSCode
**官网：[https://code.visualstudio.com/](https://code.visualstudio.com/)**

（注意，不要自己搜索错下载成Visual Studio。下载正确的图标是**蓝色**的，而不是紫色的！）

如果觉得下载太慢了，可以挂个梯子。我会在之后写一个Clash挂梯子的教程。

安装没有好讲的，一路前进，记得创建桌面快捷方式。

## 2. 美观及汉化
如果认为英文与观感不影响使用的这一步可以跳过。

**美化**：初次安装VSCode，会有主题选择与新手教学。在这里，根据喜好选择一个主题，并在教学标记已完成，启动时不显示欢迎界面。

**汉化**：通常来说，只要你的操作系统是中文的，在首次安装的时候会弹出汉化的插件。不过如果没有弹出，点击最左侧下面有一块飞出去的巧克力图标，那个是扩展。在扩展搜索框中搜索Chinese，就能出来汉化插件了，安装重启软件后即可完成汉化。

## 3. 安装C++扩展
点击扩展图标，搜索C++，安装 C/C++ 及 C/C++ Extension Pack 和 C/C++ Themes。等右下角的提示窗口消失后，重新启动软件则安装成功。

## 4. 配置编译器
在这里，我使用的是MinGW64的编译器，当然懒的也可以直接找到Dev-C++的编译器，通常在“C:\Program Files (x86)\Dev-Cpp\MinGW64”目录下。

**MinGW64官网：[https://sourceforge.net/projects/mingw-w64/files/mingw-w64/mingw-w64-release/](https://sourceforge.net/projects/mingw-w64/files/mingw-w64/mingw-w64-release/)**

打开官网后一直往下拉，选当前最新的8.1.0版本。64位操作系统找x86-64，32位找i686。Windows版本下载win32，Linux用户下载posix版本。随后选择带seh的压缩包下载解压，建议解压在C盘外的其它盘。

随后打开控制面板。在面板中搜索“**高级系统**”，点开“**查看高级系统设置**”，打开“**环境变量**”，单击下方“**系统变量**”中的**Path**，选择**编辑**，单击右侧**新建**，输入刚刚解压的文件夹中bin的路径。以我的为例，就是输入“**E:\VSCode\mingw64\bin**”到这里就配置完成了。打开cmd输入**gcc -v**查看，如果出现十几行代码就说明环境变量配置成功。

接下来，在一个你常用的地方创建一个文件夹，名字叫“.vscode”。最好是专门创建一个VSCode文件夹，把编译器和.vscode放在一起。 

#### 注意，这个文件夹十分重要，切忌轻易删除，因为后面重要的json文件及配置都要在这个文件夹中操作。

接下来配置编译器路径。首先打开VSCode，单击左上角文件，选择打开文件夹，打开我们刚刚创建的.vscode并信任该文件夹。然后按快捷键Ctrl+Shift+P调出命令面板，输入C/C++，选择“Edit Configurations(UI)”进入配置。这里需要配置两个选项：

**1.编译器路径：E:/VSCode/mingw64/bin/g++.exe**

这里的路径根据大家自己安装的编译器位置和配置的环境变量位置所决定。

**2.IntelliSense模式：选择gcc-x64。**

配置完成后，此时在侧边栏可以发现多了一个.vscode文件夹，里面有一个c_cpp_properties.json文件，说明上述配置成功。

## 5. 配置构建任务
接下来，需要创建一个tasks.json文件来告诉VSCode如何编译程序。该任务将调用g++编译器基于源代码创建可执行文件。按快捷键Ctrl+Shift+P调出命令面板，输入tasks，选择“**Tasks:Configure Default Build Task**”，再选择“**C/C++: g++.exe build active file**”，此时会出现一个名为tasks.json的配置文件。

## 6. 配置调试设置
这里主要是为了在.vscode文件夹中产生一个launch.json文件，用来配置调试的相关信息。首先，按下Ctrl+N新建一个文件，随便打点代码，以下为示例：
```cpp
#include<iostream>
using namespace std;
int main(){
    cout<<"hello, world";
    return 0;
}
```
随后按下F5编译，选择C++(GDB/LLDB)，在接下来的界面中选择g++.exe，然后在底下会出来一串代码，紧接着会在左侧产生一个横条，点击“创建launch.json文件”。检查一下，如果在之前创建的.vscode文件夹内有一个launch.json文件，就说明成功了。

之后，按下F5编译后，会在cpp文件下新建一个exe程序，点开exe程序就能执行操作了。

## 7. 默认编译设置
没有设置这个的话，每次按下F5都会让你选择一个编译器进行编译。而有了这个，按下F5可以直接编译运行了。进行这个操作需要用到launch.json文件。首先，打开.vscode文件夹，找到launch.json，随后把以下代码复制进去：
```json
{
    // 使用 IntelliSense 了解相关属性。 
    // 悬停以查看现有属性的描述。
    // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
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
其中，cwd和miDebuggerPath改成你的编译器路径。保存后，cpp文件就会自动编译了。

另外，以上代码会让VSCode编译器按下F5后不像Dev一样显示控制台窗口，通过修改externalConsole为true可以改为显示。

## 8. 缺省源设置
何为缺省源？缺省源就是在你新建一个文件的时候默认出现的代码。

在VSCode中按下Ctrl+Shift+P，在弹出的对话框中输入Configure User Snippets，选择新建全局代码片段，随便取个名按下Enter，然后就能设置缺省源了。

我的json文件见：[https://www.luogu.com.cn/paste/robl6cz4](https://www.luogu.com.cn/paste/robl6cz4)

设置完缺省源后，按下Ctrl+S保存文件，然后新建个文件，打出#include，弹出来的第一个就是我们设置的缺省源，按下回车就出现代码了。

## 9. 完全卸载
如果之前安装过VSCode但是只是简单卸载，再次安装后会出现之前的配置信息，包括打开的文件夹、安装过的扩展等，这是因为之前没有完全将VSCode卸载干净造成的。

如果想干净卸载掉VSCode再重新安装的话，就需要在卸载之后再删除掉两个目录的内容。分别是：**C:\Users\用户名\.vscode 和 C:\Users\用户名\AppData\Roaming\Code**

删除掉这两个目录的内容之后，再安装VSCode，就相当于是全新安装了。

## End. 结语

到这里，VSCode的配置基本上就弄好了，开启你的愉快旅程吧！鉴于本人能力有限，如有解释不清的，详情见下方知乎通道。

[参考来源：https://zhuanlan.zhihu.com/p/87864677](https://zhuanlan.zhihu.com/p/87864677)

[第一次使用VSCode应该知道的设置](https://zhuanlan.zhihu.com/p/62913725)

附：[tasks.json](https://www.luogu.com.cn/paste/nqq35kic)，[c_cpp_properties.json](https://www.luogu.com.cn/paste/zron54pi)，[缺省源](https://www.luogu.com.cn/paste/robl6cz4)，[launch.json](https://www.luogu.com.cn/paste/aal9qmc2)

鸣谢 [The_BJX](https://www.luogu.com.cn/user/364027) 提供的json文件与帮助支持
