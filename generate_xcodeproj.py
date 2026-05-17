#!/usr/bin/env python3
"""
生成普世同祷 iOS 项目的 Xcode project.pbxproj 文件
运行后会在 ios/ 目录下生成 PoushiTongdao.xcodeproj/project.pbxproj
"""
import os
import uuid
import xml.etree.ElementTree as ET

# ── 生成24字符hex ID ──────────────────────────────────────
def mid():
    return uuid.uuid4().hex[:24].upper()

# ── 收集所有对象 ──────────────────────────────────────────
objs = {}
def reg(o):
    oid = mid()
    objs[oid] = o
    return oid

# BuildFile
bf_appdelegate   = reg({"isa": "PBXBuildFile", "fileRef": reg({"isa":"PBXFileReference","lastKnownFileType":"sourcecode.swift","path":"AppDelegate.swift","sourceTree":"<group>"})})
# 上面写法不对，需要重新设计：先注册fileRef，再注册buildFile

# 重新来：先定义所有ID，再填充对象
# ── 手动指定所有ID（确保可重复）──────────────────────────
IDS = {
    "root":            "AAAAAAAAAAAAAAAAAAAAAA",
    "target":          "BBBBBBBBBBBBBBBBBBBBBB",
    "configList":      "CCCCCCCCCCCCCCCCCCCCCC",
    "configDebug":     "DDDDDDDDDDDDDDDDDDDDDD",
    "configRelease":   "EEEEEEEEEEEEEEEEEEEEEE",
    "sourcesBuild":    "FFFFFFFFFFFFFFFFFFFFFF",
    "frameworksBuild":"1111111111111111111111",
    "resourcesBuild":  "2222222222222222222222",
    "mainGroup":       "3333333333333333333333",
    "targetGroup":     "4444444444444444444444",
    "productsGroup":   "5555555555555555555555",
    "appProduct":      "6666666666666666666666",
    # FileReferences
    "fr_appdelegate":  "7777777777777777777777",
    "fr_viewcontrol":  "8888888888888888888888",
    "fr_infoplist":    "9999999999999999999999",
    "fr_indexhtml":    "AAAAAAAAAAAAAAAAAABBBB",
    "fr_appjs":        "AAAAAAAAAAAAAAAAAACCCC",
    "fr_stylecss":     "AAAAAAAAAAAAAAAAAADDDD",
    "fr_webkit":       "AAAAAAAAAAAAAAAAAAEEEE",
    # BuildFiles
    "bf_appdelegate":  "BBBBBBBBBBBBBBBBAAA111",
    "bf_viewcontrol":  "BBBBBBBBBBBBBBBBAAA222",
    "bf_indexhtml":    "BBBBBBBBBBBBBBBBAAA333",
    "bf_appjs":        "BBBBBBBBBBBBBBBBAAA444",
    "bf_stylecss":     "BBBBBBBBBBBBBBBBAAA555",
    "bf_webkit":       "BBBBBBBBBBBBBBBBAAA666",
}

# ── 构建对象字典 ─────────────────────────────────────────
o = {}

# PBXBuildFile
o[IDS["bf_appdelegate"]] = {"isa":"PBXBuildFile","fileRef": IDS["fr_appdelegate"]}
o[IDS["bf_viewcontrol"]] = {"isa":"PBXBuildFile","fileRef": IDS["fr_viewcontrol"]}
o[IDS["bf_indexhtml"]]   = {"isa":"PBXBuildFile","fileRef": IDS["fr_indexhtml"]}
o[IDS["bf_appjs"]]       = {"isa":"PBXBuildFile","fileRef": IDS["fr_appjs"]}
o[IDS["bf_stylecss"]]    = {"isa":"PBXBuildFile","fileRef": IDS["fr_stylecss"]}
o[IDS["bf_webkit"]]      = {"isa":"PBXBuildFile","fileRef": IDS["fr_webkit"]}

# PBXFileReference
o[IDS["fr_appdelegate"]] = {"isa":"PBXFileReference","lastKnownFileType":"sourcecode.swift","path":"AppDelegate.swift","sourceTree":"<group>"}
o[IDS["fr_viewcontrol"]] = {"isa":"PBXFileReference","lastKnownFileType":"sourcecode.swift","path":"ViewController.swift","sourceTree":"<group>"}
o[IDS["fr_infoplist"]]   = {"isa":"PBXFileReference","lastKnownFileType":"text.plist.xml","path":"Info.plist","sourceTree":"<group>"}
o[IDS["fr_indexhtml"]]   = {"isa":"PBXFileReference","lastKnownFileType":"text.html","path":"index.html","sourceTree":"<group>"}
o[IDS["fr_appjs"]]       = {"isa":"PBXFileReference","lastKnownFileType":"sourcecode.javascript","path":"app.js","sourceTree":"<group>"}
o[IDS["fr_stylecss"]]    = {"isa":"PBXFileReference","lastKnownFileType":"text.css","path":"style.css","sourceTree":"<group>"}
o[IDS["fr_webkit"]]      = {"isa":"PBXFileReference","lastKnownFileType":"wrapper.framework","name":"WebKit.framework","path":"System/Library/Frameworks/WebKit.framework","sourceTree":"SDKROOT"}
o[IDS["appProduct"]]     = {"isa":"PBXFileReference","explicitFileType":"wrapper.application","includeInIndex":0,"path":"PoushiTongdao.app","sourceTree":"BUILT_PRODUCTS_DIR"}

# PBXFrameworksBuildPhase
o[IDS["frameworksBuild"]] = {"isa":"PBXFrameworksBuildPhase","buildActionMask":2147483647,"files":[IDS["bf_webkit"]],"runOnlyForDeploymentPostprocessing":0}

# PBXGroup
o[IDS["mainGroup"]] = {"isa":"PBXGroup","children":[IDS["targetGroup"], IDS["productsGroup"]],"sourceTree":"<group>"}
o[IDS["targetGroup"]] = {"isa":"PBXGroup","children":[IDS["fr_appdelegate"],IDS["fr_viewcontrol"],IDS["fr_infoplist"],IDS["fr_indexhtml"],IDS["fr_appjs"],IDS["fr_stylecss"]],"path":"PoushiTongdao","sourceTree":"<group>"}
o[IDS["productsGroup"]] = {"isa":"PBXGroup","children":[IDS["appProduct"]],"name":"Products","sourceTree":"<group>"}

# PBXNativeTarget
o[IDS["target"]] = {"isa":"PBXNativeTarget","buildConfigurationList":IDS["configList"],"buildPhases":[IDS["sourcesBuild"],IDS["frameworksBuild"],IDS["resourcesBuild"]],"name":"PoushiTongdao","productName":"PoushiTongdao","productReference":IDS["appProduct"],"productType":"com.apple.product-type.application"}

# PBXProject
o[IDS["root"]] = {"isa":"PBXProject","attributes":{"BuildIndependentTargetsInParallel":True,"LastSwiftUpdateCheck":"1500","LastUpgradeCheck":"1500","TargetAttributes":{IDS["target"]:{"CreatedOnToolsVersion":"15.0"}}},"buildConfigurationList":IDS["configList"],"compatibilityVersion":"Xcode 14.0","developmentRegion":"en","hasScannedForEncodings":0,"knownRegions":["en","Base"],"mainGroup":IDS["mainGroup"],"productRefGroup":IDS["productsGroup"],"projectDirPath":"","projectRoot":"","targets":[IDS["target"]]}

# PBXResourcesBuildPhase
o[IDS["resourcesBuild"]] = {"isa":"PBXResourcesBuildPhase","buildActionMask":2147483647,"files":[IDS["bf_indexhtml"],IDS["bf_appjs"],IDS["bf_stylecss"]],"runOnlyForDeploymentPostprocessing":0}

# PBXSourcesBuildPhase
o[IDS["sourcesBuild"]] = {"isa":"PBXSourcesBuildPhase","buildActionMask":2147483647,"files":[IDS["bf_appdelegate"],IDS["bf_viewcontrol"]],"runOnlyForDeploymentPostprocessing":0}

# XCBuildConfiguration - Debug
o[IDS["configDebug"]] = {"isa":"XCBuildConfiguration","buildSettings":{"ALWAYS_SEARCH_USER_PATHS":"NO","ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS":"NO","CLANG_ANALYZER_NONNULL":"YES","CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION":"YES_AGGRESSIVE","CLANG_CXX_LANGUAGE_STANDARD":"gnu++20","CLANG_ENABLE_MODULES":"YES","CLANG_ENABLE_OBJC_ARC":"YES","CLANG_ENABLE_OBJC_WEAK":"YES","DEBUG_INFORMATION_FORMAT":"dwarf","ENABLE_STRICT_OBJC_MSGSEND":"YES","ENABLE_TESTABILITY":"YES","ENABLE_USER_SCRIPT_SANDBOXING":"YES","GCC_C_LANGUAGE_STANDARD":"gnu17","GCC_DYNAMIC_NO_PIC":"NO","GCC_NO_COMMON_BLOCKS":"YES","GCC_OPTIMIZATION_LEVEL":"0","GCC_PREPROCESSOR_DEFINITIONS":["DEBUG=1","$(inherited)"],"GCC_WARN_64_TO_32_BIT_CONVERSION":"YES","GCC_WARN_ABOUT_RETURN_TYPE":"YES_ERROR","GCC_WARN_UNDECLARED_SELECTOR":"YES","GCC_WARN_UNINITIALIZED_AUTOS":"YES_AGGRESSIVE","GCC_WARN_UNUSED_FUNCTION":"YES","GCC_WARN_UNUSED_VARIABLE":"YES","IPHONEOS_DEPLOYMENT_TARGET":"13.0","LOCALIZATION_PREFERS_STRING_CATALOGS":"YES","MTL_ENABLE_DEBUG_INFO":"INCLUDE_SOURCE","MTL_FAST_MATH":"YES","ONLY_ACTIVE_ARCH":"YES","SDKROOT":"iphoneos","SWIFT_ACTIVE_COMPILATION_CONDITIONS":"DEBUG $(inherited)","SWIFT_OPTIMIZATION_LEVEL":"-Onone"},"name":"Debug"}

# XCBuildConfiguration - Release
o[IDS["configRelease"]] = {"isa":"XCBuildConfiguration","buildSettings":{"ALWAYS_SEARCH_USER_PATHS":"NO","ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS":"NO","CLANG_ANALYZER_NONNULL":"YES","CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION":"YES_AGGRESSIVE","CLANG_CXX_LANGUAGE_STANDARD":"gnu++20","CLANG_ENABLE_MODULES":"YES","CLANG_ENABLE_OBJC_ARC":"YES","CLANG_ENABLE_OBJC_WEAK":"YES","DEBUG_INFORMATION_FORMAT":"dwarf-with-dsym","ENABLE_NS_ASSERTIONS":"NO","ENABLE_STRICT_OBJC_MSGSEND":"YES","ENABLE_USER_SCRIPT_SANDBOXING":"YES","GCC_C_LANGUAGE_STANDARD":"gnu17","GCC_NO_COMMON_BLOCKS":"YES","GCC_WARN_64_TO_32_BIT_CONVERSION":"YES","GCC_WARN_ABOUT_RETURN_TYPE":"YES_ERROR","GCC_WARN_UNDECLARED_SELECTOR":"YES","GCC_WARN_UNINITIALIZED_AUTOS":"YES_AGGRESSIVE","GCC_WARN_UNUSED_FUNCTION":"YES","GCC_WARN_UNUSED_VARIABLE":"YES","IPHONEOS_DEPLOYMENT_TARGET":"13.0","LOCALIZATION_PREFERS_STRING_CATALOGS":"YES","MTL_ENABLE_DEBUG_INFO":"NO","MTL_FAST_MATH":"YES","SDKROOT":"iphoneos","SWIFT_COMPILATION_MODE":"wholemodule"},"name":"Release"}

# XCConfigurationList
o[IDS["configList"]] = {"isa":"XCConfigurationList","buildConfigurations":[IDS["configDebug"], IDS["configRelease"]],"defaultConfigurationIsVisible":0,"defaultConfigurationName":"Release"}

# ── 序列化为 pbxproj 格式 ────────────────────────────────
def dict_to_pbx(d, indent=1):
    """将 dict 转为 pbxproj 风格的字符串"""
    if isinstance(d, bool):
        return "1" if d else "0"
    if isinstance(d, int):
        return str(d)
    if isinstance(d, str):
        return f'"{d}"'
    if isinstance(d, list):
        items = ",\n".join(" " * indent * 2 + dict_to_pbx(x, indent) for x in d)
        return "(\n" + items + "\n" + " " * (indent-1) * 2 + ")"
    if isinstance(d, dict):
        entries = []
        for k, v in d.items():
            entries.append(" " * indent * 2 + f"{k} = {dict_to_pbx(v, indent+1)};")
        return "{\n" + "\n".join(entries) + "\n" + " " * (indent-1) * 2 + "}"
    return str(d)

def build_pbx_content(objs_dict, root_id):
    lines = []
    lines.append('// !$*UTF8*$!')
    lines.append('{')
    lines.append(f'  archiveVersion = 1;')
    lines.append(f'  classes = {{}};')
    lines.append(f'  objectVersion = 56;')
    lines.append(f'  objects = {{')
    for oid, val in objs_dict.items():
        inner = dict_to_pbx(val, 3)
        lines.append(f'    {oid} = {inner};')
    lines.append(f'  }};')
    lines.append(f'  rootObject = {root_id};')
    lines.append('}')
    return "\n".join(lines)

# ── 写入文件 ─────────────────────────────────────────────
out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "PoushiTongdao.xcodeproj")
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, "project.pbxproj")

content = build_pbx_content(o, IDS["root"])
with open(out_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"已生成: {out_path}")
print(f"对象数量: {len(o)}")
