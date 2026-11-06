---
title: 史上最全翻墙教程
date: 2023-01-23
description: 介绍 VPN、翻墙的概念以及几种相关工具的使用方法。
categories: [Technologies]
tags: [VPN]
slug: vpn
draft: false
cover: /img/covers/vpn.png
---

**这个教程会完整地介绍VPN，翻墙的概念及几种翻墙的方法。**

## 目录

- [0. 概念](#concept)
  - [什么是 VPN？](#what)
  - [什么是翻墙？](#climb)
  - [为什么要翻墙？](#whyclimb)
- [1. Clash 的使用](#clash)
  - [安装](#install)
  - [节点](#node)
  - [导入](#import)
- [2. v2rayN 的使用](#v2rayN)
  - [安装](#install2)
  - [节点](#node2)
- [3. 其它 VPN](#others)
  - [AoxVPN](#aoxvpn)
  - [Freegate](#freegate)
  - [Greenhub](#greenhub)
  - [Lantern](#lantern)
- [结语](#end)

<a id="concept"></a>

## 0. 概念
<a id="what"></a>

### 什么是VPN？
VPN全称为"Virtual Private Network"，翻译过来也就是虚拟网络连接。那么，虚拟网络连接是什么呢？

想象一下，你在北京，你想去美国旅游。但是，两地之间的距离太遥远了，就算坐飞机也需要一两天。你坐上了飞机，坐着坐着，突然出现一道空气墙拦住你的去路。这时候，该怎么办呢？

假设你从地下挖一条隧道，挖穿地壳、地幔、地核，直接到达美国的一个位置呢，就像刺客伍六七去玄武国这一段。

![](https://s2.loli.net/2023/01/27/xdV3ZnhjPUMuslt.png)

在网络世界中，通过一条虚拟隧道光速连接到另一个国家服务器，再通过这个服务器访问你要去的网站，这种虚拟的网络隧道就叫做VPN，服务器就叫做节点。

<a id="climb"></a>

### 什么是翻墙？
在中国大陆境内，由于外国网站可能会有一些不正当的言论，于是国家就设立了一堵网络上的墙，如同上文坐飞机遇到的空气墙一样，阻止国内网民访问众多国外网站，如谷歌，维基百科等。于是，通过像VPN这样的工具，跳过这堵墙直接定位到不受墙影响的其它位置的服务器，再通过这个服务器访问外国的网站，也就被形象地称为“翻墙”。

<a id="whyclimb"></a>

### 为什么要翻墙？
1. 因为少数某些原因，国家就否定了其它绝大多数好的国外网站。这些封锁对我们的学习生活带来了极大麻烦。比如最近谷歌翻译退出中国市场，很多中国网民使用的还是谷歌浏览器，导致在使用过程中翻译及插件功能遇到很多困扰。再比如，世界上最大的百科全书“维基百科”，上面记录了很多对于研究课题很有帮助的知识，只因为记录了一些历史便被封锁。因此，开拓视野，学术研究——这便是翻墙的目的。

2. 不仅如此，像在使用github这种网站时，虽然github没有被封锁，但是因为github服务器是部署在国外的，访问速度很慢。因此通过VPN快速穿越到国外一个位置，再通过那个位置连接github，可以增加访问速度。

<a id="clash"></a>

## 1. Clash的使用
**简介：Clash是我一直在使用的一个梯子，但是它仅仅只是一个帮助我们修改代理的工具而已，需要我们自己把节点导入其中。**

**官网：[https://github.com/Fndroid/clash_for_windows_pkg/releases](https://github.com/Fndroid/clash_for_windows_pkg/releases)**

<a id="install"></a>

### 安装
我以**Windows**系统为例，打开github官网，在**Assets**中找**windows**版本的Clash下载并解压缩。解压完成后，运行安装程序。然后，打开你安装的路径，找到下图红框中的exe程序打开，便会出来Clash的主界面。

![](https://s2.loli.net/2023/01/27/XPwMQf2GVUkpacn.png)

<a id="node"></a>

### 节点
**官网：[https://管人痴.com/](https://xn--gmq396grzd.com/)**

这个机场（卖节点的网站）是之前我哥哥推荐给我的，性价比极高。

进入之后，我们注册一个账号，注册完后进入用户中心，点击进入充值界面。

![](https://s2.loli.net/2023/01/27/4jnCuspZRGIS1UX.png)

通常来说，买一个VIP5的月付，也就是充15元，一个月绰绰有余了。充钱只能使用支付宝，所以先提前导入一点钱到支付宝里。

充完之后返回主页面，选择商店。

![](https://s2.loli.net/2023/01/27/hHAWJi9KIgvCXs1.png)

进入后选择**月付 个人小流量 标准版**购买即可。

<a id="import"></a>

### 导入
返回主页，在**快速使用**选择windows，往下滑，找到Clash for windows，选择配置一键导入

![](https://s2.loli.net/2023/01/27/9mgNnYryAlV5QLc.png)

之后，浏览器会自动打开你已经安装好的Clash，在主界面配置中，更新订阅

![](https://s2.loli.net/2023/04/17/vbCYWGZ2dXU43RL.png)

然后点击左侧**代理**，会出现很多节点。接着点击右上角的测速按钮

![](https://s2.loli.net/2023/04/17/kZ1sVtaXGSqTLWE.png)

测完速之后会在每个代理的右侧显示延迟，选择**延迟较低且波动不大**的代理，鼠标点击选择。

然后在左栏**常规**启用**系统代理**，或右键Windows系统右下角的Clash角标启用**系统代理**。

启用之后看到Clash小猫亮了就说明成功了。打开**油管[www.youtube.com](https://www.youtube.com)** **或 [www.google.com](https://www.google.com)** 试试吧！

<a id="v2rayN"></a>

## 2. v2rayN的使用
**简介：与Clash一样，v2rayN也是一个简单，快捷的代理工具。但与Clash订阅机场类型不同的是，v2rayN更适用于白嫖的节点**

**官网：[https://github.com/2dust/v2rayN/releases](https://github.com/2dust/v2rayN/releases)**

<a id="install2"></a>

### 安装
进入官网选择下载最新版，然后在下面的 _Assets_ 中点击下载**v2rayN-Core**。

下载完后解压缩，打开v2rayN.exe，在windows系统右下角点击v2rayN角标显示主窗口。

<a id="node2"></a>

### 节点
可以上网搜索v2rayN公益节点，如[www.iyio.net](https://www.iyio.net/) 等。

![](https://s2.loli.net/2023/01/27/UX8QCbBYmcFgOzI.png)

如上图所示范例，将这些节点Ctrl+C复制下来，打开v2rayN主界面，Ctrl+V导入这些节点，然后Ctrl+A全选，Ctrl+R测延时，选择延时少且稳定的节点，按下Enter选择，然后在右下角小图标**系统代理**中勾选**自动配置系统代理**，图标变红即为成功。

<a id="others"></a>

## 3. 其它VPN
<a id="aoxvpn"></a>

### AoxVPN
**推荐等级：⭐️⭐️⭐️⭐️⭐️**

**官网：[https://aoxvpn.com/](https://aoxvpn.com/)**

我以前经常使用这款VPN，免费，速度快，没广告。但是后来有广告而且非VIP节点数量减少了。不过这在免费VPN中依旧是相当不错的。
<a id="freegate"></a>

### Freegate
**推荐等级：⭐️⭐️⭐️⭐️**

**官网：[https://dongtaiwang.com/](https://dongtaiwang.com/)**

自由门应该比较大众，很绿色，只有简简单单的exe文件加一些配置文件，但是有时可能会连接不上。
<a id="greenhub"></a>

### Greenhub
**推荐等级：⭐️⭐️⭐️**

**官网：[https://greenhubtx.ga/](https://greenhubtx.ga/)**

同学推荐的VPN，不开VIP节点数量有点少，不是很稳定。
<a id="lantern"></a>

### Lantern
**推荐等级：⭐️**

**官网：[https://github.com/getlantern/lantern](https://github.com/getlantern/lantern)**

蓝灯应该也有很多人听过了，不少翻墙党党员都是从蓝灯走过来的。不过它的安全性很差，开VPN被捕的人当时用的都是蓝灯。而且最近这几年国家对VPN的打击更严厉了，蓝灯大概是用不了了。

<a id="end"></a>

### End. 结语
当然，VPN远不止这些。我在这篇文章列举了一些常用的VPN，还有很多其它类似的我就不一一列举了，下来可以自行探索。最后，翻墙请仅用于学术研究，不要散播敏感信息。如有出事，后果自负，本文不承担任何责任。

Tips: 在关机前，请确保自己的VPN已处于关闭状态，否则下次启动后IE代理会出现问题，导致浏览器访问不了网页。遇到这种情况可以打开Windows设置，搜索"代理"，将如下图所示处关闭即可。
![](https://s2.loli.net/2023/04/17/Q8TO9qmGUd5cV47.png)
