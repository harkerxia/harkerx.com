---
translationOf: blog
title: Building a Personal Blog from Scratch
description: A detailed walkthrough of building a personal blog from scratch.
draft: false
sourceRevision: d42cda05992f1069dcc93ebd2dfc67f14cdfc78a8de046219af4a7bceb0580bf
---

**This tutorial walks through how to build a personal blog from scratch.**

## Contents

- [0. Introduction](#pre)
  - [1. Why Build a Personal Blog?](#whyblog)
  - [2. What Do You Need?](#need)
- [1. Installing Node.js](#nodejs)
  - [1. What Is Node.js?](#whatnodejs)
  - [2. How to Install Node.js](#installnodejs)
- [2. Installing Git](#git)
  - [1. What Is Git?](#whatgit)
  - [2. How to Install Git](#installgit)
- [3. Installing Hexo](#hexo)
  - [1. What Is Hexo?](#whathexo)
  - [2. How to Install Hexo](#installhexo)
  - [3. Changing Your Hexo Theme](#themes)
- [4. Deploying to GitHub](#github)
  - [1. What Is GitHub?](#whatgithub)
  - [2. Why Use GitHub?](#whygithub)
  - [3. Connecting to GitHub](#bindgithub)
  - [4. Deploying Your Blog to GitHub](#deploygithub)
- [5. Buying a Domain](#domain)
  - [1. What Is a Domain Name?](#whatdomain)
  - [2. Buying a Domain Name](#buydomain)
- [6. Moving to Netlify](#netlify)
  - [1. What Is Netlify?](#whatnetlify)
  - [2. How to Use Netlify](#hownetlify)
- [7. Speeding Things Up with Cloudflare](#cloudflare)
  - [1. What Is Cloudflare?](#whatcloudflare)
  - [2. How to Use Cloudflare](#howcloudflare)

<a id="pre"></a>

# 0. Introduction

<a id="whyblog"></a>

### 1. Why Build a Personal Blog?

If you want to explore a subject in depth, the value of writing a blog soon becomes clear.

![001.jpg](https://s2.loli.net/2023/02/21/CfE9RnFjLgP2YSD.jpg)

You might ask: with platforms such as CNBlogs and CSDN making it so easy to sign in and publish an article, why go to all this trouble to build a personal blog?

Fair question. On another platform, you do not get the same freedom to create your own interface and choose an easy-to-remember address. If an article happens to break a platform rule, you may also lose something you worked hard on, or even have your account suspended.

Privacy on those platforms can be another concern. A personal blog gives you more control over that side of things, too.

What do you gain from writing the posts yourself? I mentioned an article about learning here in the original draft, though I had not added its link. Reading other people's explanations alone will only take you so far. Summarizing what you learn and writing down your own approach deepens your understanding. The next time you run into the same problem, you have your own reference instead of searching the web all over again. It might even help someone else. Why not give it a try?

<a id="need"></a>

### 2. What Do You Need?

1. A computer
2. A phone
3. An internet connection
4. Some money, depending on your choices; my lowest-cost option at the time was under RMB 10 per year
5. Some frontend knowledge, depending on what you want to build

The list is short, but two things matter most: patience and interest. If the only goal is to show off a website without putting anything meaningful into it, this guide probably is not for you.

Those two qualities are both the basics and the hardest part. Once you have them, you are ready to get started. Let the rest of this guide give you a push in the right direction!

<a id="nodejs"></a>

# 1. Installing Node.js

<a id="whatnodejs"></a>

### 1. What Is Node.js?

Node.js is one of the tools used in frontend development. You can look up a more detailed introduction online.

We will use it to get our personal blog up and running.

<a id="installnodejs"></a>

### 2. How to Install Node.js

**Official website: [https://nodejs.org/en/](https://nodejs.org/en/)**

Choose the download recommended for most users.

Once it finishes downloading, open the installer and follow the prompts by clicking **Next**.

After installation, press **Windows + R**, open `cmd`, and enter `node -v` and `npm -v`. If both commands print a version number, the installation worked.

Next, create two empty folders named `node_cache` and `node_global` inside your Node.js directory.

Open `cmd` and enter `npm install webpack -g` to install webpack globally. Afterward, webpack will be in the corresponding installation directory.

<a id="git"></a>

# 2. Installing Git

<a id="whatgit"></a>

### 1. What Is Git?

Git is a version control system, or VCS. It records the state of your files over time so that you can return to an earlier version when needed.

Git has become a common tool for managing code and working with other developers. Many code hosting platforms are built around it.

It helps with version control, branch management, and more. Some of its main concepts are remote repositories, cloning, local repositories, branches, commits, pulling, merging, and pushing. A remote repository stores your code on a server where the rest of your team can access it.

The basic operations include:

1. Clone
2. Branch
3. Commit
4. Pull
5. Merge
6. Push

Git will make it easier to build and maintain our personal blog.

<a id="installgit"></a>

### 2. How to Install Git

**Official website: [https://git-scm.com/](https://git-scm.com/)**

Choose the version for your computer, click **Download**, and follow the installation prompts.

When the installer finishes, right-click in a folder. If the Git options appear in the context menu, the installation succeeded.

<a id="hexo"></a>

# 3. Installing Hexo

<a id="whathexo"></a>

### 1. What Is Hexo?

Hexo is a blogging framework created by a university student from Taiwan. It has a clear structure and generates pages quickly.

<a id="installhexo"></a>

### 2. How to Install Hexo

Press **Windows + R**, open `cmd`, and enter `npm install -g hexo-cli`.

Create a folder named `Blog` on another drive. Open it, right-click, choose **Git Bash Here**, and run `hexo init` to initialize the blog.

Then run `hexo g` to generate the static site. You will also see a `db.json` file in the blog directory.

Run `hexo s`, then **Ctrl + click** the local address or enter `http://localhost:4000/` in your browser to see how your blog looks.

<a id="themes"></a>

### 3. Changing Your Hexo Theme

**Official website: [https://hexo.io/themes/](https://hexo.io/themes/)**

Browse the themes and choose one you like. Click a theme's image to preview it, or click its name to open its GitHub page. NexT and Butterfly are two themes I recommended in the original guide.

At the time, I was using argvchs's particlex theme. It was simple without feeling bare, and I liked its colors.

Open the `themes` directory inside your `Blog` folder, right-click, choose **Git Bash Here**, and run:

`git clone https://github.com/argvchs/hexo-theme-particlex.git particlex`

After a short wait, a `particlex` folder should appear. If you get a `fatal` error or the download is slow, the earlier article about bypassing internet censorship may help; the original draft did not include a link here.

In the configuration file at the root of your `Blog` directory, find the theme setting and replace the original `landscape` theme with `particlex`, or the name of whichever theme you installed.

<a id="github"></a>

# 4. Deploying to GitHub

<a id="whatgithub"></a>

### 1. What Is GitHub?

GitHub is a code hosting platform owned by Microsoft, with many features for managing and sharing code.

<a id="whygithub"></a>

### 2. Why Use GitHub?

GitHub is accessible worldwide. Hosting a site on a server in mainland China involves additional steps such as registration, so using GitHub Pages to host a Hexo blog was the simplest option for me.

Hosting it on GitHub also meant fewer worries about a blogging platform taking down individual posts, leaving me more room to focus on writing.

<a id="bindgithub"></a>

### 3. Connecting to GitHub

We will use SSH to connect to GitHub and submit files. First, a brief introduction to SSH.

SSH stands for **Secure Shell**. It is a protocol used to secure remote login sessions and other network services. It encrypts communication to help prevent information from being intercepted during remote administration.

In simpler terms, SSH protects the connection used to access your account. The original draft also mentioned a CSDN article about SSH's principles and uses, but did not include its URL.

Open `cmd` and enter `ssh`. If it prints usage information, SSH is installed. Then run `ssh-keygen -t rsa` to create an RSA public/private key pair, pressing **Enter** through the prompts.

On Windows, open your user directory under `C:\Users`, find the `.ssh` folder, and open `id_rsa.pub` as a text file. Copy its entire contents into the **SSH keys** section of your GitHub account settings and save it.

<a id="deploygithub"></a>

### 4. Deploying Your Blog to GitHub

This step takes a little patience.

First, visit **[https://github.com/](https://github.com/)** and create an account. I suggested using a Gmail address in the original guide.

Use the **+** menu to create a new repository. Match your username carefully, including its spelling and punctuation, when setting up the personal Pages repository. Select **Public** and include a **README**.

Open your blog's configuration file and replace the deployment repository address with the address of your GitHub repository.

In Git Bash, run the usual Hexo clean/generate/deploy sequence, ending with `hexo deploy`, or `hexo d`, to push the site to GitHub. Once it succeeds, open `USERNAME.github.io` to see the site.

If the address does not exist or returns a 404, check whether you missed a step and try clearing your browser cache.

<a id="domain"></a>

# 5. Buying a Domain

<a id="whatdomain"></a>

### 1. What Is a Domain Name?

<a id="buydomain"></a>

### 2. Buying a Domain Name

**Official website: [https://wanwang.aliyun.com/](https://wanwang.aliyun.com/)**

I bought my domain through Alibaba Cloud's HiChina service. Before buying, I needed a verified Alipay account with enough money in it. Search for the domain name you want.

For a student on a tight budget, a `.top` domain cost less than RMB 10 for the first year when I wrote this. Still, I liked the look of `.com`, so I reluctantly spent the equivalent of a couple of takeout meals on one. You need an account with the registrar and identity verification before paying by scanning the payment code.

There is a short review period after payment. In my experience, it took roughly 10–20 minutes.

<a id="netlify"></a>

# 6. Deploying to Netlify

<a id="whatnetlify"></a>

### 1. What Is Netlify?

Netlify is a platform that can deploy a site from your GitHub repository. The original draft left a placeholder for a fuller explanation and a link to its website.

One reason I considered moving was Baidu indexing. At the time, I understood GitHub's restrictions on Baidu crawlers to mean that a GitHub Pages site would not be indexed there. Hosting on Netlify offered another option.

Netlify also provides a CDN. For readers in mainland China who struggled to load GitHub-hosted pages, that could make the site easier to reach. After all, it would be a shame to spend all that time building a blog only for visitors to give up because it was too slow to open.

<a id="hownetlify"></a>

### 2. Deploying a GitHub Repository to Netlify

Create a Netlify account by following its instructions, connect your GitHub account, and choose the GitHub project you want to import.

<a id="cloudflare"></a>

# 7. Speeding Things Up with Cloudflare

<a id="whatcloudflare"></a>

### 1. What Is Cloudflare?

Cloudflare provides services including DNS, CDN delivery, protection against attacks, and redirects to other addresses.

<a id="howcloudflare"></a>

### 2. How to Use Cloudflare

Follow the instructions to create a Cloudflare account and connect the site deployed from GitHub through Netlify. The original setup then enabled options such as compression and forcing HTTPS.

You can also add page rules for addresses such as `blog` and `www` to redirect them elsewhere.
