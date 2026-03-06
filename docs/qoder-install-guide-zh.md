# Qoder 安装 AI-Research-SKILLs 指南

本文档介绍如何将 [AI-Research-SKILLs](https://github.com/Orchestra-Research/AI-Research-SKILLs) 的 85 个 AI 研究工程 Skill 安装到 **Qoder** 编码代理中，并实现与官方 `npx` 工具联动的自动更新。

## 目录

- [背景](#背景)
- [架构总览](#架构总览)
- [前置条件](#前置条件)
- [安装步骤](#安装步骤)
  - [方法一：npx 官方安装 + 软链接（推荐）](#方法一npx-官方安装--软链接推荐)
  - [方法二：纯手动安装（无需 Node.js）](#方法二纯手动安装无需-nodejs)
- [更新 Skill](#更新-skill)
- [自定义 Skill 与 Orchestra Skill 共存](#自定义-skill-与-orchestra-skill-共存)
- [验证安装](#验证安装)
- [Skill 使用原理](#skill-使用原理)
- [FAQ](#faq)

---

## 背景

官方 `npx @orchestra-research/ai-research-skills` 安装器支持 Claude Code、Cursor、Codex、Gemini CLI、Qwen Code 等编码代理，但**尚未原生支持 Qoder**。

Qoder 的 Skill 加载路径为项目级的 `.qoder/skills/`，而官方安装器的统一存储目录为 `~/.orchestra/skills/`。

本指南通过**软链接桥接**这两个目录，实现：
- 利用官方工具管理 Skill 源文件
- Qoder 通过软链接无缝读取
- `npx update` 更新后自动同步

---

## 架构总览

```
官方 npx 安装器
      │
      ▼
~/.orchestra/skills/            ← 统一存储目录（npx 管理）
├── 01-model-architecture/
│   ├── litgpt/SKILL.md
│   ├── mamba/SKILL.md
│   └── ...
├── 06-post-training/
│   ├── trl-fine-tuning/SKILL.md
│   └── ...
└── 15-rag/
    ├── chroma/SKILL.md
    └── ...
      │
      │ 软链接
      ▼
<project>/.qoder/skills/        ← Qoder Skill 加载目录
├── litgpt → ~/.orchestra/skills/01-model-architecture/litgpt/
├── chroma → ~/.orchestra/skills/15-rag/chroma/
├── vllm   → ~/.orchestra/skills/12-inference-serving/vllm/
├── ...                          (85 个软链接)
├── my-custom-skill/SKILL.md     (自定义 Skill，实体目录)
└── ...
```

---

## 前置条件

| 依赖 | 方法一（推荐） | 方法二（手动） |
|------|--------------|---------------|
| Git | 需要 | 需要 |
| Node.js / npx | 需要（v16+） | 不需要 |
| 网络访问 GitHub | 需要 | 需要 |

检查环境：

```bash
git --version        # 确认 git 可用
npx --version        # 方法一需要
node --version       # 方法一需要（v16+）
```

---

## 安装步骤

### 方法一：npx 官方安装 + 软链接（推荐）

#### 第一步：用 npx 安装 Skill 到全局目录

```bash
npx @orchestra-research/ai-research-skills
```

交互式安装器会引导你选择要安装的 Skill 类别（可选 "Everything" 全部安装）。
安装完成后，Skill 文件位于 `~/.orchestra/skills/`。

#### 第二步：创建软链接到 .qoder/skills/

```bash
# 设定目标目录（替换为你的项目路径）
DEST="<your-project>/.qoder/skills"
SRC="$HOME/.orchestra/skills"

mkdir -p "$DEST"

# 遍历 ~/.orchestra/skills/ 下所有类别和 Skill，创建扁平化软链接
for category_dir in "$SRC"/[0-9][0-9]-*/; do
    if [ -f "$category_dir/SKILL.md" ]; then
        # standalone skill（如 20-ml-paper-writing）
        skill_name=$(grep -m1 '^name:' "$category_dir/SKILL.md" | sed 's/name: *//' | tr -d '"' | tr -d "'" | xargs)
        [ -z "$skill_name" ] && skill_name=$(basename "$category_dir")
        ln -sf "$category_dir" "$DEST/$skill_name"
    else
        # 嵌套 skill（如 15-rag/chroma）
        for skill_dir in "$category_dir"*/; do
            [ -f "$skill_dir/SKILL.md" ] || continue
            skill_name=$(basename "$skill_dir")
            ln -sf "$skill_dir" "$DEST/$skill_name"
        done
    fi
done

echo "Done! $(ls -la $DEST | grep '^l' | wc -l) symlinks created."
```

#### 第三步：验证

```bash
# 检查软链接数量
ls -la "$DEST" | grep '^l' | wc -l
# 预期输出: 85

# 抽查某个 Skill
cat "$DEST/vllm/SKILL.md" | head -5
```

---

### 方法二：纯手动安装（无需 Node.js）

适用于无法安装 Node.js 的服务器环境。

```bash
# 1. 克隆仓库（shallow clone 节省带宽）
git clone --depth 1 https://github.com/Orchestra-Research/AI-Research-SKILLs.git /tmp/ai-research-skills

# 2. 复制 Skill 到 .qoder/skills/
DEST="<your-project>/.qoder/skills"
SRC="/tmp/ai-research-skills"

mkdir -p "$DEST"

for category_dir in "$SRC"/[0-9][0-9]-*/; do
    if [ -f "$category_dir/SKILL.md" ]; then
        skill_name=$(grep -m1 '^name:' "$category_dir/SKILL.md" | sed 's/name: *//' | tr -d '"' | tr -d "'" | xargs)
        [ -z "$skill_name" ] && skill_name=$(basename "$category_dir")
        mkdir -p "$DEST/$skill_name"
        cp -r "$category_dir"/* "$DEST/$skill_name/"
    else
        for skill_dir in "$category_dir"*/; do
            [ -f "$skill_dir/SKILL.md" ] || continue
            skill_name=$(basename "$skill_dir")
            mkdir -p "$DEST/$skill_name"
            cp -r "$skill_dir"/* "$DEST/$skill_name/"
        done
    fi
done

# 3. 清理
rm -rf /tmp/ai-research-skills

echo "Done! $(ls $DEST | wc -l) skills installed."
```

> **注意**：手动安装方式不支持自动更新，需要重新执行上述脚本来更新。

---

## 更新 Skill

### 方法一用户（npx + 软链接）

```bash
# 只需一条命令——更新 ~/.orchestra/skills/ 中的文件
npx @orchestra-research/ai-research-skills update
```

由于 `.qoder/skills/` 中的条目是指向 `~/.orchestra/skills/` 的软链接，**更新后自动同步，无需额外操作**。

如果上游新增了 Skill，重新执行第二步的软链接脚本即可补上。

### 方法二用户（手动安装）

重新执行[方法二](#方法二纯手动安装无需-nodejs)的安装脚本，它会覆盖更新已有文件。

---

## 自定义 Skill 与 Orchestra Skill 共存

`.qoder/skills/` 目录中可以同时存在：

| 类型 | 示例 | 管理方式 |
|------|------|----------|
| Orchestra Skill（软链接） | `chroma → ~/.orchestra/skills/...` | `npx update` 自动更新 |
| 自定义 Skill（实体目录） | `my-custom-tool/SKILL.md` | 手动维护 |

两者互不干扰。软链接和实体目录天然隔离。

判断方式：

```bash
# 查看哪些是软链接（Orchestra Skill），哪些是实体目录（自定义 Skill）
for d in .qoder/skills/*/; do
    name=$(basename "$d")
    if [ -L "${d%/}" ]; then
        echo "  [orchestra] $name"
    else
        echo "  [custom]    $name"
    fi
done
```

---

## 验证安装

```bash
DEST="<your-project>/.qoder/skills"

echo "=== 统计 ==="
echo "总目录数: $(ls -d $DEST/*/ | wc -l)"
echo "软链接数: $(ls -la $DEST | grep '^l' | wc -l)"
echo "实体目录: $(ls -la $DEST | grep '^d' | grep -v '\.$' | wc -l)"

echo ""
echo "=== 自定义 Skill ==="
for d in $DEST/*/; do
    [ -L "${d%/}" ] && continue
    name=$(basename "$d")
    echo "  $name/  (实体目录)"
done

echo ""
echo "=== 抽样检查 ==="
for skill in vllm chroma deepspeed peft; do
    if [ -f "$DEST/$skill/SKILL.md" ]; then
        echo "  OK: $skill"
    else
        echo "  MISSING: $skill"
    fi
done
```

---

## Skill 使用原理

安装完成后，当你在 Qoder 中描述任务时：

```
用户: "帮我用 vLLM 部署一个 LLaMA 模型的推理服务"
```

Qoder 会：

1. **匹配 Skill** — 扫描 `.qoder/skills/*/SKILL.md` 的 `description` 字段，找到最相关的 Skill
2. **加载专家知识** — 读取对应 `SKILL.md` 中的完整使用指南、代码模板、最佳实践
3. **按指引执行** — 像有一个精通该框架的专家在辅助完成任务

每个 `SKILL.md` 的结构：

```yaml
---
name: serving-llms-vllm
description: Serves LLMs with high throughput using vLLM's PagedAttention...
version: 1.0.0
author: Orchestra Research
tags: [vLLM, Inference, PagedAttention, ...]
dependencies: [vllm, torch, transformers]
---

# vLLM - High-Throughput LLM Serving

## Quick Start
...(详细代码示例、配置指南、踩坑提示)
```

---

## FAQ

### Q: 为什么不直接用 `npx` 安装到 Qoder？

官方安装器的 `agents.js` 中目前未包含 Qoder 配置。它只识别 `.claude/`、`.cursor/`、`.qwen/` 等目录。通过软链接可以优雅地桥接这个差异。

### Q: 上游仓库新增了 Skill，怎么同步？

```bash
# 1. 更新 ~/.orchestra/skills/
npx @orchestra-research/ai-research-skills update

# 2. 重新运行软链接脚本（补上新增的 Skill）
# 使用上面第二步的脚本即可
```

### Q: 我能只安装部分类别吗？

可以。在 `npx` 交互式安装器中选择 "By category" 即可按需安装。软链接脚本会自动只链接已安装的 Skill。

### Q: 软链接断了怎么办？

如果 `~/.orchestra/skills/` 被删除或移动，软链接会失效。重新用 `npx` 安装后再跑一遍软链接脚本即可。

### Q: 与官方 npx 安装相比有什么区别？

| 对比 | 官方 npx | 本方案 |
|------|---------|--------|
| Skill 存储 | `~/.orchestra/skills/` | 同左（软链接指向） |
| 更新 | `npx ... update` | 同左（自动同步） |
| Qoder 支持 | 不支持 | 通过软链接支持 |
| 自定义 Skill | 不涉及 | 实体目录共存 |
