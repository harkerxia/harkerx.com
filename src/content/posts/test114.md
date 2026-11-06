---
title: "test114 — Astro Solitude Markdown 功能测试"
date: 2026-11-06
description: "用于检查 HarkerX Harbor 的标题跳转、LaTeX、代码高亮、图片、表格、链接及 Markdown 排版。"
categories: [Testing]
tags: [Astro, Markdown, Test]
slug: test114
draft: true
---

> **测试说明：** 本文是 HarkerX Harbor 的 Markdown 排版检查清单。可以直接点击下面的目录、复制代码，并在桌面和手机上分别查看显示效果。

## Quick navigation

- [Heading and anchors（标题跳转）](#heading-and-anchors)
- [Inline formatting（行内格式）](#inline-formatting)
- [LaTeX math（数学公式）](#latex-math)
- [Code blocks（代码高亮）](#code-blocks)
- [Links and images（链接与图片）](#links-and-images)
- [Lists and tables（列表与表格）](#lists-and-tables)
- [Quotes and details（引用与折叠）](#quotes-and-details)
- [Footnotes（脚注）](#footnotes)
- [Final checklist（检查清单）](#final-checklist)

---

## Heading and anchors

### H3: 三级标题

普通段落：这段用来测试正文的中文、English、数字 123 和行间距是否正常。

#### H4: 四级标题

测试更小一级标题、标题间距和右侧 TOC 是否按层级缩进。

##### H5: 五级标题

标题较多时，检查目录不会遮挡正文。

**站内锚点跳转：** [点击跳转到数学公式](#latex-math)；[点击跳到最后检查清单](#final-checklist)。

## Inline formatting

这里包含 **粗体**、*斜体*、***粗斜体***、~~删除线~~ 和 `inline code`。

标准 HTML 高亮：<mark>这段应该有高亮背景</mark>。

扩展语法测试：==这段双等号高亮是否有效？==（若显示为原始等号，表示当前 Markdown 处理器未启用该扩展，不影响 `<mark>`）。

上标/下标的数学写法：$x^2$、$a_1$、$H_2O$；特殊字符：`<`, `>`, `&`, `#`。

---

## LaTeX math

**行内公式：** 勾股定理 $a^2+b^2=c^2$，以及欧拉恒等式 $e^{i\pi}+1=0$。

**独立公式：**

$$
\int_0^1 x^2\,dx = \left[\frac{x^3}{3}\right]_0^1 = \frac{1}{3}
$$

**矩阵：**

$$
A = \begin{pmatrix}
1 & 2 \\
3 & 4
\end{pmatrix}, \qquad \det(A) = -2
$$

**多行对齐（同时测试长公式换行）：**

$$
\begin{aligned}
(a+b)^3 &= a^3+3a^2b+3ab^2+b^3 \\
        &= a^3+b^3+3ab(a+b)
\end{aligned}
$$

**求和和极限：**

$$
\sum_{k=1}^{n} k = \frac{n(n+1)}{2},
\qquad \lim_{x\to 0}\frac{\sin x}{x}=1
$$

> 观察项：是否渲染成公式？是否在手机屏幕上横向溢出？公式是否与前后段落保持合理间距？

---

## Code blocks

**Python 代码高亮：**

```python
def fibonacci(n: int) -> int:
    """Return the n-th Fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(f"F(10) = {fibonacci(10)}")
```

**C++ 代码高亮：**

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> values{1, 2, 3};
    for (const auto value : values) {
        std::cout << value << '\n';
    }
    return 0;
}
```

**TypeScript 代码高亮：**

```ts
interface Post {
  title: string;
  published: boolean;
}

const post: Post = { title: 'test114', published: false };
console.log(post.title);
```

**Shell 命令：**

```bash
pnpm dev
pnpm build
git status
```

**纯文本（无语言）：**

```
This is plain text.
No syntax highlighting is expected here.
```

**行号、复制按钮、长代码横向滚动**是否出现，取决于当前 Solitude 版本的代码块样式；这篇文章用来实际观察，而不预设它们一定存在。

---

## Links and images

- 外部链接：[Astro 官方文档](https://docs.astro.build/)
- 站内链接：[回到首页](/) · [文章归档](/archives/) · [关于我](/about/)
- 锚点链接：[跳到顶部的 Quick navigation](#quick-navigation)
- 带标题的链接：[Markdown Guide](https://www.markdownguide.org/ "Markdown Guide")

**本地图片测试：** 下面引用你之前设置的头像路径；如果你的头像不在这里，请把路径换成当前实际路径。

![HarkerX avatar — alt 文本测试](/img/avatar.png)

*这是图片说明（斜体）。请检查图片加载、居中、宽度、Alt 文本以及点击放大功能（若主题对文章图片启用了 Lightbox）。*

---

## Lists and tables

**无序列表：**

- Astro
  - Content Collections
  - Static Site Generation
- GitHub Actions
- Cloudflare

**有序列表：**

1. 编辑 Markdown 文件。
2. 运行 `pnpm dev` 预览。
3. 运行 `pnpm build` 验证。
4. Push 到 GitHub，等待部署完成。

**任务列表：**

- [x] Markdown 正文可见
- [ ] LaTeX 和代码块显示正常
- [ ] 内部锚点和外部链接可点击
- [ ] 手机端布局没有横向溢出

**表格：**

| 功能 | 测试内容 | 预期结果 |
|:--|:--:|--:|
| Markdown | **Bold** / *Italic* | 正常渲染 |
| LaTeX | $E=mc^2$ | 显示数学公式 |
| Code | `print(114)` | 等宽字体 |
| Anchor | [跳转](#final-checklist) | 到达检查清单 |

---

## Quotes and details

> 一级引用：这是一个 Blockquote。
>
> 第二段引用，包含 **粗体** 与 `inline code`。
>
> > 嵌套引用：这段应该有第二层缩进。

下面是原生 HTML 折叠区块（点击标题展开）：

<details>
<summary>点击展开测试内容</summary>

这里是折叠内容。若当前 Markdown 渲染器正常支持 HTML，点击后应当显示这段文字。

</details>

分隔线测试：

---

## Footnotes

这里放一个脚注[^note]，再放一个带链接的脚注[^astro]。

[^note]: 这是脚注的详细文字，用于测试页脚标记、回跳链接和字体大小。
[^astro]: 可以查阅 [Astro 文档](https://docs.astro.build/) 了解 Markdown 与 MDX。

---

## Final checklist

- [ ] 标题层级与右侧目录显示正常。
- [ ] 手动目录和锚点跳转有效。
- [ ] 行内公式、独立公式、矩阵、`aligned` 正常。
- [ ] Python / C++ / TypeScript / Bash 代码高亮正常。
- [ ] 代码块可读，不会把页面撑出屏幕。
- [ ] 外部链接、站内链接和图片正常。
- [ ] 表格、任务列表、引用、折叠区块与脚注正常。
- [ ] 日间模式、夜间模式和手机端显示正常。

**测试结束。** [↑ 返回 Quick navigation](#quick-navigation)
