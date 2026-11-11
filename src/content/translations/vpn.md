---
translationOf: vpn
title: A Comprehensive Guide to VPNs and Bypassing Internet Censorship
description: An introduction to VPNs, bypassing internet censorship, and several related tools.
draft: false
sourceRevision: e999d1dd2e4255ab3caed21ee47015cd89f4ed2efc2ebb2beade11e88f207dee
---

**This guide introduces VPNs, explains what it means to bypass internet censorship, and walks through several ways to do it.**

## Contents

- [0. The Basics](#concept)
  - [What Is a VPN?](#what)
  - [What Does “Climbing the Wall” Mean?](#climb)
  - [Why Bypass Internet Censorship?](#whyclimb)
- [1. Using Clash](#clash)
  - [Installation](#install)
  - [Servers and Subscriptions](#node)
  - [Importing a Subscription](#import)
- [2. Using v2rayN](#v2rayN)
  - [Installation](#install2)
  - [Servers](#node2)
- [3. Other VPN Tools](#others)
  - [AoxVPN](#aoxvpn)
  - [Freegate](#freegate)
  - [Greenhub](#greenhub)
  - [Lantern](#lantern)
- [Closing Thoughts](#end)

<a id="concept"></a>

## 0. The Basics

<a id="what"></a>

### What Is a VPN?

VPN stands for **Virtual Private Network**. What does that mean in practice?

Imagine that you are in Beijing and want to travel to the United States. The distance is enormous: even flying might take a day or two. You board your plane, but somewhere along the way, an invisible wall suddenly blocks your route. What do you do?

What if you could dig a tunnel underground, through the Earth's crust, mantle, and core, and come out somewhere in the United States? Think of the scene in *Scissor Seven* where Seven travels to Xuanwu.

![](https://s2.loli.net/2023/01/27/xdV3ZnhjPUMuslt.png)

In this simplified analogy, you connect through a virtual tunnel to a server in another country, then use that server to access the website you want to visit. That virtual network tunnel is the VPN, and the server is often called a *node*.

<a id="climb"></a>

### What Does “Climbing the Wall” Mean?

In mainland China, the government blocks access to many overseas websites, including Google and Wikipedia, citing content it considers inappropriate. This system is often described as an internet “wall,” much like the invisible barrier in the airplane example above.

Using a tool such as a VPN to connect to a server outside that wall, and then accessing overseas websites through it, is commonly called **“climbing the wall”** in Chinese: bypassing internet censorship.

<a id="whyclimb"></a>

### Why Bypass Internet Censorship?

1. A few concerns can lead to entire overseas websites being blocked, even when most of their content is useful. These restrictions create considerable inconvenience for learning and everyday life. For example, around the time I wrote this article, Google Translate had withdrawn from China. Many people were still using Chrome, so translation and extension features became more troublesome to use. Wikipedia, the world's largest encyclopedia, contains plenty of material useful for research, yet it is blocked because it also documents certain historical events. Broadening our horizons and doing academic research are my reasons for seeking access.

2. Even an accessible website can be slow. GitHub, for example, was not blocked in the situation described here, but connections to its overseas servers could be slow. Connecting through a VPN server abroad might provide a faster route to GitHub.

<a id="clash"></a>

## 1. Using Clash

**Introduction: Clash is the tool I have been using. It is a proxy client rather than a service that provides servers: you need to import your own server configuration or subscription.**

**Official releases: [https://github.com/Fndroid/clash_for_windows_pkg/releases](https://github.com/Fndroid/clash_for_windows_pkg/releases)**

<a id="install"></a>

### Installation

I will use **Windows** as an example. Open the GitHub release page and find the Windows package under **Assets**. Download and extract it, then run the installer. After installation, open the installation directory and launch the executable shown in the red box below. This opens the main Clash window.

![](https://s2.loli.net/2023/01/27/XPwMQf2GVUkpacn.png)

<a id="node"></a>

### Servers and Subscriptions

**Website: [https://管人痴.com/](https://xn--gmq396grzd.com/)**

My brother recommended this subscription provider to me, and I found it good value for money. Providers like this, which sell access to proxy servers, are often called *airports* in Chinese internet slang.

Register an account, open the user dashboard, and go to the top-up page.

![](https://s2.loli.net/2023/01/27/4jnCuspZRGIS1UX.png)

For my usage, a monthly VIP5 purchase—15 yuan at the time—was more than enough. Payments were accepted through Alipay, so make sure you have funds available there first.

After topping up, return to the main page and open the store.

![](https://s2.loli.net/2023/01/27/hHAWJi9KIgvCXs1.png)

Choose **Monthly · Individual · Low Traffic · Standard** (**月付 个人小流量 标准版**) and complete the purchase.

<a id="import"></a>

### Importing a Subscription

Return to the dashboard. Under **Quick Start** (**快速使用**), select Windows, scroll down to **Clash for Windows**, and choose the one-click configuration import option.

![](https://s2.loli.net/2023/01/27/9mgNnYryAlV5QLc.png)

The browser should open your installed copy of Clash automatically. In the main window's configuration section, update the subscription.

![](https://s2.loli.net/2023/04/17/vbCYWGZ2dXU43RL.png)

Next, select **Proxies** (**代理**) in the left sidebar. You should see a list of servers. Click the latency-test button in the upper-right corner.

![](https://s2.loli.net/2023/04/17/kZ1sVtaXGSqTLWE.png)

After testing, a latency value appears beside each server. Choose one with **low, reasonably stable latency** and click it to select it.

Then open **General** (**常规**) and enable **System Proxy** (**系统代理**). You can also enable it by right-clicking the Clash icon in the Windows system tray.

Once the Clash cat icon lights up, the proxy is enabled. Try opening [YouTube](https://www.youtube.com) or [Google](https://www.google.com).

<a id="v2rayN"></a>

## 2. Using v2rayN

**Introduction: Like Clash, v2rayN is a straightforward proxy client. In the setup described here, I used it mainly with freely shared servers rather than a paid subscription service.**

**Official releases: [https://github.com/2dust/v2rayN/releases](https://github.com/2dust/v2rayN/releases)**

<a id="install2"></a>

### Installation

Open the release page, select the latest release, and download **v2rayN-Core** from the **Assets** section.

Extract the download and run `v2rayN.exe`. Click its icon in the Windows system tray to show the main window.

<a id="node2"></a>

### Servers

You can search online for freely shared v2rayN servers, for example at [www.iyio.net](https://www.iyio.net/).

![](https://s2.loli.net/2023/01/27/UX8QCbBYmcFgOzI.png)

As shown in the example above, copy the server entries with **Ctrl+C**. Open the main v2rayN window and press **Ctrl+V** to import them. Use **Ctrl+A** to select all entries, then **Ctrl+R** to test their latency.

Select a server with low, stable latency and press **Enter** to activate it. Right-click the system-tray icon, open **System Proxy** (**系统代理**), and select **Automatically Configure System Proxy** (**自动配置系统代理**). The icon turning red indicates that it is enabled.

<a id="others"></a>

## 3. Other VPN Tools

<a id="aoxvpn"></a>

### AoxVPN

**My rating: ⭐️⭐️⭐️⭐️⭐️**

**Website: [https://aoxvpn.com/](https://aoxvpn.com/)**

I used this VPN frequently in the past. It was free, fast, and initially had no ads. Later, ads appeared and the number of non-VIP servers decreased. Even so, I still considered it a decent option among free VPNs.

<a id="freegate"></a>

### Freegate

**My rating: ⭐️⭐️⭐️⭐️**

**Website: [https://dongtaiwang.com/](https://dongtaiwang.com/)**

Freegate is fairly well known. It is portable and consists of a simple executable plus a few configuration files, although it sometimes fails to connect.

<a id="greenhub"></a>

### Greenhub

**My rating: ⭐️⭐️⭐️**

**Website: [https://greenhubtx.ga/](https://greenhubtx.ga/)**

A classmate recommended this VPN to me. Without a VIP subscription, the server selection was limited, and I found the connection somewhat unstable.

<a id="lantern"></a>

### Lantern

**My rating: ⭐️**

**Website: [https://github.com/getlantern/lantern](https://github.com/getlantern/lantern)**

Many readers have probably heard of Lantern, also known as “Blue Lantern” in Chinese. Quite a few people first started bypassing internet restrictions with it. My assessment of its security was poor: the cases I had heard about of people being arrested for VPN use involved Lantern. With the tighter restrictions on VPNs in the years leading up to this article, I felt that it was probably no longer a practical option.

<a id="end"></a>

### Closing Thoughts

There are far more VPN and proxy tools than the ones listed here. I have covered a few commonly used options; you can explore others yourself.

Finally, please use these tools only for academic research and do not spread sensitive information. You are responsible for your own actions and any consequences; this article assumes no liability.

**Tip:** Before shutting down your computer, make sure your VPN or proxy client is turned off. Otherwise, the Windows/Internet Explorer proxy settings may cause your browser to lose internet access the next time you start the computer. If this happens, open Windows Settings, search for **Proxy**, and turn off the option shown below.

![](https://s2.loli.net/2023/04/17/Q8TO9qmGUd5cV47.png)
