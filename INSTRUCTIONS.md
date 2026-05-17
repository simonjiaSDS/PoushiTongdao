# 普世同祷 iOS 版 — Mac 安装指南

## 方案A：用 XcodeGen 自动生成项目（推荐）

### 第一步：在 Mac 上准备文件
将整个 `ios/` 文件夹拷贝到 Mac 上，例如桌面：
```
~/Desktop/ios/
├── PoushiTongdao/
│   ├── AppDelegate.swift
│   ├── ViewController.swift
│   ├── Info.plist
│   ├── index.html
│   ├── app.js
│   └── style.css
└── project.yml
```

### 第二步：安装 XcodeGen
在 Mac 终端执行：
```bash
# 如果已安装 Homebrew：
brew install xcodegen

# 如果没有 Homebrew，先安装 Homebrew：
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 第三步：生成 Xcode 项目
```bash
cd ~/Desktop/ios
xcodegen generate
```
执行后会生成 `PoushiTongdao.xcodeproj` 文件。

### 第四步：在 Xcode 中打开并安装到 iPhone
1. 双击 `PoushiTongdao.xcodeproj` 用 Xcode 打开
2. 用 USB 连接 iPhone 到 Mac
3. 在 Xcode 顶部工具栏，点击设备选择器（显示 "Any iOS Device" 的地方），选择您的 iPhone
4. 点击 ▶️（Run）按钮，App 会自动安装到 iPhone

> ⚠️ 首次安装需在 iPhone 上信任开发者：  
> 设置 → 通用 → VPN与设备管理 → 信任您的 Apple ID

---

## 方案B：手动在 Xcode 中创建项目

### 第一步：在 Mac 上创建新项目
1. 打开 Xcode → Create New Project
2. 选择 iOS → App
3. 填写：
   - Product Name: `PoushiTongdao`
   - Interface: `Storyboard`（之后会删除 storyboard）
   - Language: `Swift`
4. 保存到桌面

### 第二步：替换 Swift 文件
将项目中的以下文件替换为 Windows 上生成的文件：
- 用 `AppDelegate.swift` 替换项目的 `AppDelegate.swift`
- 用 `ViewController.swift` 替换项目的 `ViewController.swift`
- 用 `Info.plist` 替换项目的 `Info.plist`

### 第三步：添加 HTML/JS/CSS 到项目
1. 在 Xcode 中，右键点击项目文件夹 → Add Files to "PoushiTongdao"
2. 选择 `index.html`、`app.js`、`style.css` 三个文件
3. 勾选 "Copy items if needed" 和 "Add to target: PoushiTongdao"
4. 点击 Add

### 第四步：添加 WebKit 框架
1. 点击项目名 → TARGETS → Build Phases → Link Binary With Libraries
2. 点击 + 号，搜索 `WebKit.framework`，添加

### 第五步：删除 Storyboard 引用（已用代码布局）
1. 在项目的 `Info.plist` 中删除 `Main storyboard file base name` 项
2. 在 TARGETS → General → Development Info 中，将 Main Interface 留空

### 第六步：安装到 iPhone
同方案A第四步。

---

## 常见问题

**Q: Xcode 提示 "Signing & Capabilities" 错误？**  
A: 在 TARGETS → Signing & Capabilities 中，选择您的 Apple ID（免费账户即可），Bundle Identifier 改为唯一名称（如 `com.您的名字.PoushiTongdao`）。

**Q: iPhone 上提示"未受信任的开发者"？**  
A: iPhone 上：设置 → 通用 → VPN与设备管理 → 点击您的 Apple ID → 信任。

**Q: 想更新 HTML/JS/CSS 内容怎么办？**  
A: 在 Windows 上修改文件 → 拷贝到 Mac 项目目录覆盖 → 在 Xcode 中点击 Run 重新安装。
