---
title: 从零开始搭建个人博客
date: 2023-02-12
description: 本教程会详尽讲解如何从零开始搭建个人博客。
categories: [Experience]
tags: [Blog, Hexo, Github, Netlify, Cloudflare]
slug: blog
draft: false
cover: /img/covers/blog.png
---

**本教程会详尽讲解如何从零开始搭建个人博客。**

## 目录

- [0. 前言](#pre)
  - [1. 为什么要搭建个人博客？](#whyblog)
  - [2. 搭建个人博客需要什么？](#need)
- [1. 安装 Node.js](#nodejs)
  - [1. 什么是 Node.js？](#whatnodejs)
  - [2. 如何安装 Node.js？](#installnodejs)
- [2. 安装 Git](#git)
  - [1. 什么是 Git？](#whatgit)
  - [2. 如何安装 Git？](#installgit)
- [3. 安装 Hexo](#hexo)
  - [1. 什么是 Hexo？](#whathexo)
  - [2. 如何安装 Hexo？](#installhexo)
  - [3. 如何更换 Hexo 主题？](#themes)
- [4. 部署至 GitHub](#github)
  - [1. 什么是 GitHub？](#whatgithub)
  - [2. 为什么要使用 GitHub？](#whygithub)
  - [3. 如何绑定 GitHub？](#bindgithub)
  - [4. 如何将博客部署至 GitHub？](#deploygithub)
- [5. 域名购买](#domain)
  - [1. 什么是域名？](#whatdomain)
  - [2. 购买域名](#buydomain)
- [6. 迁移至 Netlify](#netlify)
  - [1. 什么是 Netlify？](#whatnetlify)
  - [2. 如何使用 Netlify？](#hownetlify)
- [7. Cloudflare 加速](#cloudflare)
  - [1. 什么是 Cloudflare？](#whatcloudflare)
  - [2. 如何使用 Cloudflare？](#howcloudflare)

<a id="pre"></a>

# 0. 前言
<a id="whyblog"></a>

### 1. 为什么要搭建个人博客？
首先，如果你想要深入探索了解知识的话，为什么自己写博客也就不攻自破了。
![001.jpg](https://s2.loli.net/2023/02/21/CfE9RnFjLgP2YSD.jpg)
你可能会问：明明网上有那么多平台像cnblog，csdn，博客园这些让你登录就能非常方便地发布文章的东西，为什么还要废这么大劲整一个个人博客呢？

好问题。设想一下，如果你在其它平台发布文章，那么你看到的便不是像这样精美的界面与好记的网址。而且如果你发布的文章一不小心触碰了什么规则，面临的可能是辛辛苦苦写的文章被删除或封号。

而且在这些平台上的隐私安全会让你不放心，而个人博客便不会有这样的担心。

而亲自写博客又有什么好处呢？可以看下关于学习（链接）的这篇文章，只看别人的文章来学永远不能超越别人。自己总结并且把方法写下来，不但可以加深理解，
在以后遇到同样问题的时候不用再次上网一个个找，而且还可能可以帮助到他人，何乐而不为？

<a id="need"></a>

### 3. 搭建个人博客需要什么？
1. 电脑
2. 手机
3. 网络
4. 金钱（根据选择定，最低一年不到10元）
5. 前端技术（根据情况定）
搭建个人博客，需要的东西非常少，但是非常重要——耐心，兴趣。如果你搭建个人博客只是为了在他人面前炫耀而不做实质性的东西，那么你可以离开这篇文章了。
这两样东西是最基本，也是最难办到的。当你已经准备好这两样东西了的话，那么恭喜你——万事俱备，只欠东风了。那么，接下来就让这股“东风”祝你一臂之力吧！

<a id="nodejs"></a>

# 1. 安装Nodejs
<a id="whatnodejs"></a>

### 1. 什么是Nodejs
Nodejs是前端开发工具，具体可以上网查。

有了Nodejs的帮助我们才能开始搭建个人博客。

<a id="installnodejs"></a>

### 2. 如何安装Nodejs？
**官网：[https://nodejs.org/en/](https://nodejs.org/en/)**

如上图，选择最多用户使用的下载。

下载完以后打开安装程序，一路next就可以了。

安装完后按下Windows+R，打开cmd输入node -v和npm -v，如果能出现版本号就说明安装成功了。

随后，在 nodejs 文件夹中新建两个空文件夹 node_cache、node_global，如下图：

npm install webpack -g ：

然后打开cmd，输入npm install webpack -g ：

然后webpack就在我们如下的文件夹里了。

<a id="git"></a>

# 1. 安装Git
<a id="whatgit"></a>

### 1. 什么是Git
Git是一个版本管理控制系统（缩写VCS），它可以在任何时间点，将文档的状态作为更新记录保存起来，也可以在任何时间点，将更新记录恢复回来。

在开发中，Git已成为现在主流的一种代码托管技术（版本管理工具），基本上大多数的公司都在使用Git进行协同开发。很多代码托管平台也是基于Git来实现的。

Git的基本使用
Git可以帮我们做到很多的事情，比如代码的版本控制，分支管理等。
Git里面主要包含的几个概念有远程仓库，克隆，本地仓库，分支，提交，拉取，合并，推送等。
远程仓库是指我们代码存储在服务器的地方，这个仓库是我们整个团队中所有人都可以访问的地方。
1.克隆

2.分支

3.提交

4.拉取

5.合并

6.推送

有了Git的帮助我们就能更方便地搭建个人博客。

<a id="installgit"></a>

### 2. 如何安装Git？
**官网：[https://git-scm.com/](https://git-scm.com/)**
进入官网，选择适合自己电脑的Git版本，单击Download，然后可以一路next。
结束后，按下鼠标右键，如有出现如下图红框中的Git选项，即为安装成功。

<a id="hexo"></a>

# 3. 安装Hexo
<a id="whathexo"></a>

### 1. 什么是Hexo？
Hexo是来自台湾的大学生创建的一个博客框架，条理清晰，生成速度快。

<a id="installhexo"></a>

### 2. 如何安装Hexo？
按下Win+R打开cmd，输入npm install -g hexo-cli。
随后在一个其它盘新建一个Blog文件夹，点击进入，右键选择Git Bash here，输入hexo init初始化博客。
生成完以后，输入hexo g生成静态部署，这时在你的博客文件夹下会多一个db.json文件。
然后输入hexo s，按下Ctrl+鼠标左键或者手动在浏览器输入http://localhost:4000/就可以查看博客现在的样子了。

<a id="themes"></a>

### 3. 如何更换Hexo主题？
**官网：[https://hexo.io/themes/](https://hexo.io/themes/)**
进入官网查看，选择你喜欢的主题，点击主题图片进行网页预览，点击文字进入主题的github界面。推荐的主题有NexT，Butterfly等。
我当前使用的是argvchs大佬做的particlex主题（官网），简约但不简陋，调色也恰到好处。
进入你的Blog文件夹，点击进入themes，右键Git Bash here，然后输入git clone https://github.com/argvchs/hexo-theme-particlex.git particlex。等待片刻，themes里面就会出现particlex了。
如果出现fatal等标志，可以看我上一篇的翻墙教程（链接）来加速下载速度。
然后在Blog文件夹根目录下的config.yml，找到themes，把你原来的lanscape主题更换为particlex（你的主题名字）。

<a id="github"></a>

# 4. 部署至Github
<a id="whatgithub"></a>

### 1. 什么是Github？
Github是微软旗下的一个托管代码的平台，具有多种功能...

<a id="whygithub"></a>

### 2. 为什么使用Github？
Github在全球都能访问，如果在国内买服务器的话需要备案等一系列极其麻烦的操作。所以使用Github自带的Github Pages功能来把hexo放在上面是
最方便且最简单的方法了。而且由于是Github，不用那么担心发布的文章被查封之类，能够让你专注于写作。

<a id="bindgithub"></a>

### 3. 如何绑定Github？
我们利用SSH来完成GitHub的绑定并提交文件，这样很方便快捷。首先来简单介绍一下SSH协议。

SSH（安全外壳协议，Secure Shell 的缩写）是建立在应用层基础上的安全协议。
SSH 是目前较可靠，专为远程登录会话和其他网络服务提供安全性的协议，利用 SSH 协议可以有效防止远程管理过程中的信息泄露问题。
简单来说，SSH就是保障你的账户安全，将你的数据加密压缩，不仅防止其他人截获你的数据，还能加快传输速度。
如果想详细了解的话，可以看这篇文章：详述 SSH 的原理及其应用 - CSDN，下面就详细介绍如何绑定GitHub和提交文件。

打开cmd，输入ssh，如果出现usage用法说明本机已安装ssh。随后输入ssh-keygen -t rsa生成rsa算法生成的公钥和私钥，一直按回车键直到结束。
随后，如果你跟我一样在windows系统，打开C盘Users文件夹，找到你的用户名，点开.ssh文件夹，以txt打开id_rsa.pub，然后在你注册的
Github的SSH KEY里把所有内容都复制进去保存。

<a id="deploygithub"></a>

### 4. 如何将博客部署至Github？
这一步有点麻烦，需要耐心。
首先，登录**官网：[https://github.com/](https://github.com/)**，注册一个账号（建议用谷歌邮箱）。
之后在如图所示，＋号新建repository，将名称设为你的用户名（一定是用户名，大小写，符号都要一样），如图所示，勾选README和Public。

随后打开你的Blog文件夹，打开config文件，将下图所示的内容替换为你github项目的源地址就行了。

之后，打开gitbash，进行hexo三连击后，hexo deploy（hexo d）一下把项目推到github上。等到成功后，输入USERNAME.github.io，然后就能看见你现在的界面了。
如果显示的是网址不存在或者是404，可以检查一下是不是跳步了或者清除一下浏览器缓存。

<a id="domain"></a>

# 5. 域名购买
<a id="whatdomain"></a>

### 1. 什么是域名？
<a id="buydomain"></a>

### 2. 如何购买域名？
**官网：[https://wanwang.aliyun.com/](https://wanwang.aliyun.com/)**
我是使用阿里云万网进行域名购买的，在此之前需要有一个实名认证过的支付宝账户并且存有至少几十元钱，然后在搜索框处搜索你想要的域名，资金不足的像我一样的学生党可以
选择.top域名，一年只用10元不到，但是我觉得.com比较有逼格，在其他人面前敲出xxx.com很有格调，所以痛惜两顿外卖钱买了个com域名。这需要你在万网有一个账户并且
实名认证，然后就能扫码支付。

支付完成后，需要有一段审核时间，不过不用很久，平均十几二十分钟就好了。

<a id="netlify"></a>

# 6. Netlify部署
<a id="whatnetlify"></a>

### 1. 什么是Netlify？
Netlify是一个托管你Github仓库的平台，具体可以上netlify官网（链接）上查看。（再详细）
因为Github之前和百度闹矛盾，导致Github禁了百度所有的爬虫，所以哪怕你部署在Github上的网站做得再大，在百度上也永远都收录不到。
而如果部署到Netlify上，就可以有所改观。而且，netlify具有cdn（解释）加速，可以让你改变之前在国内访问Github死卡打不开的情况（毕竟不会有人想要自己辛辛苦苦搭的站
因为很难打开没人看吧？）

<a id="hownetlify"></a>

### 2. 如何将Github仓库部署至Netlify？
在Netlify按照指示注册好账号后，连接完Github帐号之后选择导入github项目。

<a id="cloudflare"></a>

# 7. Cloudflare加速
<a id="whatcloudflare"></a>

### 1. 什么是Cloudflare？
Cloudflare是一个像万网一样的域名解析平台，可以让你获取更快的cdn访问，防止网站被攻击或方便域名重定向到其它地方。

<a id="howcloudflare"></a>

### 2. 如何使用Cloudflare？
在Cloudflare按照指示注册好账号后，选择导入部署在netlify的github项目，然后选择压缩文件，强制https等。

后面在page rules中增加blog, www等可以让你重定向到另外一个界面。
