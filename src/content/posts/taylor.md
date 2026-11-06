---
title: 泰勒展开公式推导
date: 2024-03-29
description: 这个教程会以简单易懂的方式推导泰勒展开公式。
categories: [Algorithms]
tags: [Taylor]
slug: taylor
draft: true
---

**这个教程会以简单易懂的方式推导泰勒展开公式。**

### 0. 变限积分求解
$$
\large\int_{0}^{x} \int_{0}^{x} \int_{0}^{x} 1 \, dx \, dx \, dx = \, ?
$$

先解最内层变限积分：

$$
\large\int_{0}^{x} 1 \, dx = x
$$

将最内层变限积分的解带入第二层：

$$
\large\int_{0}^{x} \int_{0}^{x} x \, dx \, dx = \, ?
$$

再解第二层变限积分，把积分符号内的x看作u并求解：

$$
\large\int_{0}^{x} u \, du = \frac{1}{2!}u^2\bigg|_{0}^{x} = \frac{1}{2!}u^2\bigg|_{0}^{x} = \frac{1}{2!}x^2 - \frac{1}{2!}(0)^2 = \frac{1}{2!}x^2
$$

将第二层变限积分的解带入最外层，把积分符号内的x看作u并求解：

$$
\large\int_{0}^{x} \frac{1}{2!}u^2 \, du = \int_{0}^{x} \frac{1}{2!}u^2 \, du = \frac{1}{3!}u^3\bigg|_0^x
$$

得出最后变限积分结果为：

$$
\large\frac{1}{3!}x^3 - \frac{1}{3!}(0)^3 = \frac{1}{3!}x^3
$$

### 1. 泰勒公式推导
$$
\large f(x) = \int_{c}^{x} f'(x) \, dx + f(a)
$$

$$
\large f'(x) = \int_{c}^{x} f''(x) \, dx + f'(a)
$$

$$
\large f''(x) = \int_{c}^{x} f'''(x) \, dx + f''(a)
$$

$$
\large f'''(x) = \int_{c}^{x} f^{(4)}(x) \, dx + f'''(a)
$$

原函数的信息=导函数的信息积分+初始值

$$
\large f(x) = \int_{c}^{x} \left( \int_{c}^{x} \left( \int_{c}^{x} \left( \int_{c}^{x} f^{(4)}(a) \, dx + f'''(a) \right) \, dx + f''(a) \right) \, dx + f'(a) \right) \, dx + f(a)
$$

$$
\large f(x) = \int_{c}^{x} \left( \int_{c}^{x} \left( \int_{c}^{x} \left( \int_{c}^{x} f^{(4)}(a) \, dx + f'''(a) \right) \, dx \right) \, dx + f''(a) \right) + \frac{f'(a)}{1!} \cdot (x-c)^1 + f(a)
$$

$$
\large f(x) = \int_{c}^{x} \left( \int_{c}^{x} \left( \int_{c}^{x} \left( \int_{c}^{x} f^{(4)}(a) \, dx + f'''(a) \right) \, dx + \frac{f''(a)}{2!} \cdot (x-c)^2 + \frac{f'(a)}{1!} \cdot (x-c)^1 + f(a) \right) \, dx \right)
$$

$$
\large f(x) = \int_{c}^{x} \left( \int_{c}^{x} \left( \int_{c}^{x} \left( \int_{c}^{x} f^{(4)}(a) \, da \right) \, dx + \frac{f'''(a)}{3!} \cdot (x-c)^3 + \frac{f''(a)}{2!} \cdot (x-c)^2 + \frac{f'(a)}{1!} \cdot (x-c)^1 + f(a) \right) \, dx \right)
$$

以此类推，前面剩余的积分为余项，后面为泰勒展开公式。

$$
\large f(x) = f(a) + \frac{f'(a)}{1!} \cdot (x-c)^1 + \frac{f''(a)}{2!} \cdot (x-c)^2 + \frac{f'''(a)}{3!} \cdot (x-c)^3 + \ldots
$$

# End.
**如内容有错误或不明确的地方欢迎联系我进行更正！**
