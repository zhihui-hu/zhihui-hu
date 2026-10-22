---
title: PHP2Shell 漏洞解读：一次内存不足如何变成远程代码执行，以及该怎么升级
slug: php2shell-cve-2026-109618-109619
publishedAt: 2026-10-22
summary: 2026 年 10 月，PHP 紧急修复了两个可未授权远程执行代码的漏洞 PHP2Shell，欧洲多国政府网站为此临时下线。本文从事件经过讲起，解释 OOM 中断与跨请求残留状态为何能被利用，再整理版本排查、升级与临时缓解的具体做法。
keywords:
  - PHP2Shell
  - PHP 漏洞
  - CVE-2026-109618
  - CVE-2026-109619
  - PHP 8.4.27
  - PHP 8.3.36
  - mod_php
  - PHP-FPM
tags:
  - PHP
  - 安全漏洞
  - 源码分析
  - 工程实践
  - AI
---

## 前言

2026 年 10 月 21 日前后，很多人发现一些平时很稳定的网站突然打不开了：荷兰议会下议院、荷兰 MijnOverheid、比利时外交部、苏格兰爱丁堡市议会，甚至 BBC 的《神秘博士》节目页面。芬兰干脆临时关闭了政府的公共网络服务。

这些网站并没有被同一伙人攻破，而是在**主动下线避险**。原因是 PHP 官方即将发布两个严重漏洞的修复，而漏洞信息在补丁发布前就已经泄露。这组漏洞被称为 **PHP2Shell**，编号为 CVE-2026-109618 和 CVE-2026-109619。

中文媒体的报道标题大多写着“AI 找到藏了 20 年的漏洞”。这句话有一半对，有一半需要展开：漏洞确实是在 AI 辅助审计中被确认的，但“20 年”指的是这类问题的源头，而不是某一行代码。

这篇文章先回顾事件，再解释漏洞原理，最后给出排查和升级的具体步骤。如果你只关心怎么修，可以直接跳到“先确认自己是否受影响”。

**资料核对截至 2026 年 10 月 22 日。** 技术细节以 PHP 官方公告和 GitHub 安全通告为准；媒体报道中只有单一来源的内容，会在文中单独说明。

## 发生了什么

### 1. 时间线

| 时间（UTC）           | 事件                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 2004 年               | Stefan Esser 公开了 PHP 第一个与 `memory_limit` 相关的远程漏洞，这是本次研究的思路起点                                          |
| 2024 年               | OSTIF 组织、Quarkslab 执行的外部审计中，PHP 核心开发者发现了 OOM 问题的早期迹象，但当时没有找到可利用的路径，修复方案也迟迟未定 |
| 2026-07-30            | 安全公司 Calif 作为 OpenAI “Patch the Planet” 项目的一部分，开始审计 PHP                                                        |
| 2026-08-11            | Calif 报告了无条件的远程代码执行；OpenAI 同日独立报告了相同根因                                                                 |
| 2026-08-24            | Wiz 报告了更多攻击路径                                                                                                          |
| 2026-10-20 约 15:00   | 两个 CVE 编号在论坛和社交媒体上流出，附带错误的发布时间和 CVSS 分数                                                             |
| 2026-10-20 19:30      | PHP 官方提前发布预告，并把补丁时间从 22 日提前到 21 日 14:00                                                                    |
| 2026-10-21 07:41      | Chainguard 提前发布了包含补丁的镜像，攻击者可以对比二进制差异                                                                   |
| 2026-10-21 14:00 前后 | PHP 发布 8.5.12、8.4.27、8.3.36、8.2.35                                                                                         |

时间线主要依据 [PHP Foundation 的事件说明](https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/) 和 [Calif 的技术文章](https://calif.io/php2shell)。

PHP Foundation 在说明中承认，2024 年发现问题后迟迟没有修复，是“结构性失败”：安全团队靠共识做决定，几种修复方案又各有兼容性代价，加上熟悉引擎内部的人手不足，修复工作反复停滞。

### 2. 为什么网站要主动下线

一般的安全更新，管理员排个维护窗口升级即可。这次不同，有三个因素叠加：

- **影响面极大**。PHP 支撑着 WordPress、Drupal、Joomla、Magento、MediaWiki 等大量系统，主机面板和各种设备的管理界面里也常常内置 PHP。
- **不需要登录**。在 Apache mod_php 上，攻击请求在任何应用代码执行之前就能触发问题，跟网站写得好不好无关。
- **信息提前泄露**。补丁发布前，CVE 编号、一段演示视频和预发布镜像都已经流出。亚马逊称在 10 月 17 日就观察到相关的利用尝试，Cloudflare 和 watchTowr 也报告了早期攻击流量；美国 CISA 则表示截至 21 日尚未观察到利用。

因此 CERT-EU、英国 NCSC、荷兰 NCSC 和美国 NSA 都给出了类似建议：**无法立即升级的系统，考虑先下线**。日本国家网络安全机构也发出了升级提醒，首相高市早苗在 X 上发文，提醒大家检查自己对外公开的网站是否运行在 PHP 上。

于是就出现了文章开头的景象。被报道下线的服务，除了前面列出的政府网站，还包括荷兰国立公共卫生与环境研究所、比利时网络安全中心、法国内政部网站、维基媒体的多项配套服务，以及日本的一批游戏和电商平台。

## 技术背景：一次内存不足，怎么就变成了 RCE

PHP2Shell 是两个漏洞，根因相关，但利用方式不同。官方给两者的评分都是 CVSS v4.0 **9.2（Critical）**，漏洞类型均为 CWE-416（释放后使用）。

### 1. 前提：PHP 用 longjmp 处理致命错误

PHP 引擎是 C 写的。当请求超过 `memory_limit`，或者发生其他致命错误时，引擎不会一层层返回错误码，而是用 `longjmp()` 直接跳出当前上下文，进入请求清理流程（源码里常见的 `zend_bailout()` 就是它）。

这种做法很快，但有一个隐含的要求：**任何时候被跳出去，内存中的数据结构都必须是完整的**。如果某段代码执行到一半、数据只初始化了一部分，这时被强行打断，清理阶段读到的就是一个“半成品”。

### 2. CVE-2026-109618：OOM 打断了初始化

Calif 的文章里给了一个很典型的例子，出自 Zend 哈希表插入函数 `_zend_hash_str_add_or_update_i`：

```c
idx = ht->nNumUsed++;
ht->nNumOfElements++;
p = ht->arData + idx;
p->key = zend_string_init(str, len, persistent); /* 这里可能触发 OOM 并跳出 */
p->h = ZSTR_H(p->key) = h;
ZVAL_COPY_VALUE(&p->val, pData);
```

计数器先加一，新槽位就已经对清理代码“可见”；然后才分配 key。如果恰好在分配 key 时内存耗尽，后面的赋值全被跳过。但计数器已经加过了，请求清理时 `zend_array_destroy()` 会按 `nNumUsed` 遍历，把这个槽位里残留的旧字节当成有效数据来释放。

剩下的问题是：**攻击者能不能让 OOM 恰好发生在这一刻？** 研究者找到了两种办法：

- **绕过 `post_max_size`**。PHP 用请求头里声明的 `Content-Length` 和 `post_max_size` 比较，却不限制实际读入的字节。分块传输的 HTTP/1.1 请求，或者没有长度的 HTTP/2 请求，都可以绕开这个检查。
- **用很小的请求体耗尽内存**。`filename=""` 的空上传字段不计入 `max_file_uploads`，但 PHP 仍会为它在 `$_FILES` 中创建 name、type、tmp_name 等 6 个条目；字段名如果是 `files[a][b][c]...` 这样的多层嵌套，每个条目都要建出完整层级。于是几 MB 的请求体，能在 PHP 内部膨胀成上百 MB 的哈希表。

把两者结合起来，攻击者就能控制“哪一次分配”碰到 `memory_limit`。

为什么 mod_php 风险最高？官方通告解释：Apache mod_php **无论请求启动是否成功，都会执行请求清理**。而 multipart 请求体的自动解析发生在请求启动阶段，这意味着整个攻击在应用代码运行之前就已完成。PHP-FPM 则会在请求启动失败时直接让子进程退出，避开了这条最直接的路径，但在应用代码运行后仍可能触达，因此同样被列为受影响。

### 3. CVE-2026-109619：上一个请求留下的“幽灵状态”

PHP 的工作进程会连续处理很多请求。进程里有一些全局变量（错误信息、会话、扩展状态等）会暂时指向某个请求自己的内存。请求结束前，这些全局变量必须清空，然后请求内存才能释放。

问题出在两个环节：

- **生产者**：如果在全局状态设置之后、复位之前发生了致命错误（包括 OOM、执行超时），复位就会被跳过，全局变量仍然指向即将释放的内存。
- **消费者**：同一个工作进程处理下一个请求时，有些操作会在正常初始化**之前**运行，读到这个悬空指针。

官方确认了两条完整路径：

1. **PHP 8.5 的致命错误回溯**：开启 `fatal_error_backtraces` 后，回溯信息保存在全局状态里，而关闭请求时总会漏掉它的复位。
2. **会话上传进度（session upload progress）**：这个功能默认开启，不需要应用调用 `session_start()`，就会在初始化之前处理会话相关状态。

这个漏洞要求两次请求落到同一个工作进程上。进程越多、流量越杂，成功需要的尝试次数越多，但并不能消除风险。

### 4. 所以，“藏了 20 年”是怎么回事

把几个时间点放在一起就清楚了：

- **2004 年**：Stefan Esser 发现了第一个 `memory_limit` 远程漏洞，“OOM 中断引擎留下脏状态”这一类问题从那时起就为人所知。
- **2012 年**：PHP 5.4.0 发布。Calif 能追溯到的最早受影响代码路径，就来自这个版本。
- **2024 年**：审计中再次发现 OOM 问题，但没有证明可利用。
- **2026 年**：证明了可利用，并且是默认配置下未授权的 RCE。

所以，“20 年”说的是漏洞类型的历史；具体有问题的代码，从 PHP 5.4 开始，大约 14 年。

## 先确认自己是否受影响

### 1. 对照修复版本

| 分支              | 修复版本     | 说明                                                       |
| ----------------- | ------------ | ---------------------------------------------------------- |
| PHP 8.5.x         | 8.5.12       | 官方发布                                                   |
| PHP 8.4.x         | 8.4.27       | 官方发布                                                   |
| PHP 8.3.x         | 8.3.36       | 官方发布                                                   |
| PHP 8.2.x         | 8.2.35       | 官方发布；8.2 将于 2026-12-31 停止支持                     |
| PHP 7.4、8.0、8.1 | 无官方二进制 | 官方提供了最小化源码补丁，或使用发行版、LTS 厂商的回移补丁 |
| PHP 7.3 及更早    | 无           | 只要能处理 Web 请求，就应视为受影响，尽快迁移              |

受影响的运行方式包括 PHP-FPM、Apache mod_php、php-cgi、FrankenPHP 和 LiteSpeed（LSAPI）。只在命令行跑脚本、不处理 Web 请求的 PHP，不在这次的主要攻击面上。

### 2. 查实际处理请求的 PHP，而不是终端里的 php

命令行里的 `php -v` 和 Web 服务用的可能是两个不同的二进制。分别检查：

```bash
# 命令行 PHP
php -v

# PHP-FPM（不同发行版的命令名可能是 php-fpm8.3 等）
php-fpm -v

# Apache 是否加载了 mod_php
apachectl -M 2>/dev/null | grep -i php
```

最可靠的办法是让 Web 服务自己告诉你。可以临时放一个只有你能访问的脚本，确认后立即删除：

```php
<?php
// 只输出版本与 SAPI，不要使用 phpinfo() 暴露全部配置
header('Content-Type: text/plain');
echo PHP_VERSION, ' ', PHP_SAPI, PHP_EOL;
```

`PHP_SAPI` 会显示 `apache2handler`（mod_php）、`fpm-fcgi`、`cgi-fcgi`、`litespeed` 等，用来判断风险等级。

### 3. 发行版软件包要看厂商公告

Debian、Ubuntu、RHEL、AlmaLinux 等发行版经常把补丁回移到旧的版本号上，所以**不能只看前三段版本号**。查已安装的包：

```bash
# Debian / Ubuntu
dpkg -l | grep -E '^ii\s+php'

# RHEL / AlmaLinux / Rocky
rpm -qa | grep -i '^php'
```

然后对照所用发行版针对 CVE-2026-109618、CVE-2026-109619 的安全公告。例如 [AlmaLinux 已经发布了修复包](https://almalinux.org/blog/2026-10-21-php2shell-cve-2026-109618-cve-2026-109619/)。

另外，PHP 官方特别提到：依赖志愿者维护的 `rpms.remirepo.net` 的用户，当天拿不到更新，建议改用发行版的包或自行编译。

### 4. 别漏掉“看不见的 PHP”

盘点时容易遗漏的地方：

- Docker 镜像，包括构建阶段和运行阶段使用的基础镜像。
- cPanel、Plesk 等主机控制面板。
- 路由器、NAS、监控系统等设备内置的管理后台。
- 内网的 phpMyAdmin、Roundcube、Nextcloud、Zabbix 之类的工具。
- 外包或第三方托管的网站。

## 升级与临时缓解

### 1. 首选：升级并重启所有工作进程

```bash
# Debian / Ubuntu（以 8.3 为例，具体包名以发行版为准）
sudo apt update
sudo apt install --only-upgrade 'php8.3*'
sudo systemctl restart php8.3-fpm   # 或 sudo systemctl restart apache2

# RHEL 系
sudo dnf upgrade 'php*'
sudo systemctl restart php-fpm      # 或 sudo systemctl restart httpd
```

使用官方 Docker 镜像的，重新拉取并构建，不要依赖本地缓存：

```bash
docker build --pull --no-cache -t my-app .
```

升级后再用前面的脚本确认 Web 服务里的版本。**只装了新包而没有重启进程，旧代码仍在内存里运行。**

### 2. 暂时不能升级：按官方建议缩小攻击面

以下措施来自 [PHP 官方公告](https://www.php.net/archive/2026.php)。官方反复强调：**它们只能降低特定路径的风险，不能让系统变得安全。**

针对 CVE-2026-109618：

- 设置 `memory_limit=-1`，并确保应用无法改回有限值。
- 调低 `post_max_size`：不需要上传文件的，用 `8M`；需要上传的，用 `32M`；`upload_max_filesize` 要小于 `post_max_size`。
- 在 Web 服务器或代理层限制请求体大小、字段数量、multipart 分段数和嵌套深度，并且要覆盖没有 `Content-Length` 的请求。
- **不要**用 `RLIMIT_AS` 或 `RLIMIT_DATA` 代替，它们会让底层 `mmap()` 失败，反而触发漏洞路径。

针对 CVE-2026-109619：

- 设置 `session.upload_progress.enabled=0`。
- PHP 8.5 设置 `fatal_error_backtraces=0`。
- 修改后重启**所有**工作进程。

PHP-FPM 可以写在 pool 配置里，用 `php_admin_*` 防止应用覆盖：

```ini
; /etc/php/8.3/fpm/pool.d/www.conf
php_admin_value[memory_limit] = -1
php_admin_value[post_max_size] = 8M
php_admin_value[upload_max_filesize] = 4M
php_admin_flag[session.upload_progress.enabled] = off
; 仅 PHP 8.5
; php_admin_flag[fatal_error_backtraces] = off
```

Apache mod_php 写在站点或全局配置里：

```apache
<IfModule php_module>
    php_admin_value memory_limit -1
    php_admin_value post_max_size 8M
    php_admin_value upload_max_filesize 4M
    php_admin_flag session.upload_progress.enabled off
</IfModule>
```

注意，`session.upload_progress.enabled` 必须在请求解析之前生效，**不能**用 `ini_set()` 或 FPM 的 `.user.ini` 来设置。

`memory_limit=-1` 本身也有代价：它去掉了 PHP 对单个请求的内存保护，可能让内存耗尽型拒绝服务变得更容易。所以要配合前端的请求体限制，以及容器或 cgroup 的内存上限。官方建议这类上限最好只杀掉出问题的那个工作进程，而不是整个容器。

如果业务完全不需要 multipart 表单，可以直接在前端拦截这类请求。性能允许的话，也可以设置 `pm.max_requests=1`，让每个 FPM 子进程只处理一个请求，从而切断跨请求的残留状态。

### 3. 修补之后：检查是否已被入侵

补丁只能阻止新的攻击。英国 NCSC 提醒运维人员留意后门，尤其是那些在补丁发布前就暴露在公网上的系统：

- 检查 Web 目录中最近新增或修改的 `.php` 文件。
- 查看 Web 服务器和 PHP 日志中集中出现的大体积 multipart 请求、内存耗尽错误和工作进程崩溃。
- 排查以 Web 服务账号身份启动的异常进程和外连。
- 如果发现异常，按入侵事件处理：保留现场、隔离主机、轮换服务器上能读到的密钥和数据库密码。

## 更大的图景

### 1. AI 让找漏洞变快了，但方向仍需人来定

这次的发现者有三方：Calif、OpenAI 和 Wiz，都使用了大模型辅助审计。Wiz 称这是 AI 发现过的最严重的漏洞。

不过 Calif 研究员 Ryan Austin 的总结很值得一读。他说，大家此前已经用 AI 对 PHP 做了大量审计，他原本没期望能找到什么严重问题。真正起作用的，是他了解 PHP 的漏洞历史，主动引导模型去找 2004 年那类问题的“远亲”。他的观察是：模型默认会从最新、最有名的漏洞出发做变体分析，而不会主动回到冷门的老旧利用手法上。

另一面是维护者的压力。PHP Foundation 提到，自 7 月 1 日以来，团队已经发布了 15 个 CVE，同时处理了 100 多个无效、重复或无法复现的报告。AI 能帮忙验证和归并报告，但每个判断和补丁仍然需要人来完成。

### 2. 政府网站上的“老 PHP”

这次下线潮中政府网站特别显眼，原因并不复杂：大量公共网站基于 Drupal、WordPress 等 CMS，部署后由不同供应商维护多年，版本盘点往往不完整。在不知道自己跑的是哪个版本、能不能当天升级的情况下，下线是最保守的选择。

荷兰政府也特别说明，Rijksoverheid.nl 等许多网站并不使用 PHP，不受影响。可见“先知道自己有什么”本身就是安全能力的一部分。

## 结语

PHP2Shell 的技术核心并不神秘：致命错误用 `longjmp` 跳出，而某些代码在被打断时，数据结构还处于“半成品”状态。这类问题二十多年前就被提出过，这次是第一次被完整地证明在默认配置下可远程利用。

落到实际操作上，就是三件事：找到真正处理 Web 请求的 PHP 进程；升级到 8.5.12、8.4.27、8.3.36、8.2.35 或厂商的补丁版本，并重启所有工作进程；对于补丁前就暴露在公网的系统，再做一次入侵排查。

还在用 PHP 7.x 甚至更早版本的，这次真的该迁移了。

## 参考文章

- [PHP：2026 年 10 月安全公告与版本发布](https://www.php.net/archive/2026.php)
- [GHSA-w8hw-w9fx-j79w：RCE via OOM corruption（CVE-2026-109618）](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w)
- [GHSA-6wmf-4rv5-p3rp：RCE via stale global state（CVE-2026-109619）](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp)
- [PHP Foundation：Today's PHP Security Release, and How We're Strengthening PHP Security](https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/)
- [Calif：php2shell 技术文章](https://calif.io/php2shell)
- [BBC：Websites taken down worldwide as critical PHP cyber-security update issued](https://www.bbc.com/news/articles/cmly0lg3w5x2o)
- [The Brussels Times：Major websites go offline as critical PHP vulnerability triggers security fears](https://www.brusselstimes.com/belgium/2371464/major-websites-go-offline-as-critical-php-vulnerability-triggers-security-fears)
- [AlmaLinux：php2shell 修复包发布](https://almalinux.org/blog/2026-10-21-php2shell-cve-2026-109618-cve-2026-109619/)
- [Wikipedia：PHP2Shell](https://en.wikipedia.org/wiki/PHP2Shell)
