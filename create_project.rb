#!/usr/bin/env ruby
require 'xcodeproj'

# ── Paths ──────────────────────────────────────────────────
PROJECT_DIR = File.dirname(File.expand_path(__FILE__))
SOURCE_DIR  = File.join(PROJECT_DIR, 'PoushiTongdao')
PROJ_PATH   = File.join(PROJECT_DIR, 'PoushiTongdao.xcodeproj')
SCHEME_NAME = 'PoushiTongdao'

# ── Remove existing project ─────────────────────────────────
FileUtils.rm_rf(PROJ_PATH) if File.exist?(PROJ_PATH)

# ── Create project ──────────────────────────────────────────
project = Xcodeproj::Project.new(PROJ_PATH)

# Set compatibility version (Xcode 14 compatible)
project.attributes['compatibilityVersion'] = 'Xcode 14.0'
project.build_configuration_list['SWIFT_VERSION'] = '5.0'

# ── Add source files ───────────────────────────────────────
main_group = project.main_group
target_group = main_group.find_subpath(File.join('PoushiTongdao'), true)

swift_files = %w[AppDelegate.swift ViewController.swift Info.plist]
html_files  = %w[index.html app.js style.css]

target_group.clear_sources
swift_files.each do |f|
  path = File.join(SOURCE_DIR, f)
  ref  = target_group.new_file(f)
  ref.source_tree = '<group>'
end

html_files.each do |f|
  path = File.join(SOURCE_DIR, f)
  ref  = target_group.new_file(f)
  ref.source_tree = '<group>'
end

# ── Create target ──────────────────────────────────────────
target = project.new_target(:application, SCHEME_NAME, :ios, '13.0')
target.product_type = 'com.apple.product-type.application'

# Build settings
target.build_settings['SWIFT_VERSION']                   = '5.0'
target.build_settings['IPHONEOS_DEPLOYMENT_TARGET']      = '13.0'
target.build_settings['INFOPLIST_FILE']                  = 'PoushiTongdao/Info.plist'
target.build_settings['PRODUCT_BUNDLE_IDENTIFIER']       = 'com.poushitongdao.app'
target.build_settings['PRODUCT_NAME']                    = '$(TARGET_NAME)'
target.build_settings['GENERATE_INFOPLIST_FILE']         = 'NO'
target.build_settings['CODE_SIGN_IDENTITY']              = ''
target.build_settings['CODE_SIGNING_REQUIRED']          = 'NO'
target.build_settings['CODE_SIGNING_ALLOWED']           = 'NO'
target.build_settings['LD_RUNPATH_SEARCH_PATHS']         = ['$(inherited)', '@executable_path/Frameworks']
target.build_settings['ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES'] = 'YES'

# Release-specific
target.release_build_settings['SWIFT_COMPILATION_MODE'] = 'wholemodule'
target.release_build_settings['DEBUG_INFORMATION_FORMAT'] = 'dwarf-with-dsym'
target.release_build_settings['MTL_ENABLE_DEBUG_INFO']   = 'NO'

# Debug-specific
target.debug_build_settings['DEBUG_INFORMATION_FORMAT']   = 'dwarf'
target.debug_build_settings['MTL_ENABLE_DEBUG_INFO']     = 'INCLUDE_SOURCE'
target.debug_build_settings['SWIFT_OPTIMIZATION_LEVEL']  = '-Onone'
target.debug_build_settings['ONLY_ACTIVE_ARCH']          = 'YES'

# ── Add WebKit framework ───────────────────────────────────
webkit_ref = project.new(Xcodeproj::Project::Object::PBXFileReference).tap do |ref|
  ref.name         = 'WebKit.framework'
  ref.path         = 'System/Library/Frameworks/WebKit.framework'
  ref.source_tree  = 'SDKROOT'
  ref.last_known_file_type = 'wrapper.framework'
end

# Add framework to target
framework_build_file = target.add_system_framework(webkit_ref, 'WebKit.framework')

# ── Add sources and resources to build phases ─────────────
# Note: Swift files auto-added to Sources, HTML/JS/CSS to Resources

# ── Create scheme ──────────────────────────────────────────
scheme = Xcodeproj::XCScheme.new(SCHEME_NAME)
scheme.add_test_target(target)
scheme.add_build_target(target)
scheme.add_run_target(target)

# ── Save ───────────────────────────────────────────────────
project.save
scheme.save_as(PROJ_PATH, SCHEME_NAME)

puts "Project created at: #{PROJ_PATH}"
puts "Target: #{SCHEME_NAME}"
