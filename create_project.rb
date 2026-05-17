#!/usr/bin/env ruby
require 'xcodeproj'

PROJECT_DIR = File.dirname(File.expand_path(__FILE__))
SOURCE_DIR  = File.join(PROJECT_DIR, 'PoushiTongdao')
PROJ_PATH   = File.join(PROJECT_DIR, 'PoushiTongdao.xcodeproj')
SCHEME_NAME = 'PoushiTongdao'

FileUtils.rm_rf(PROJ_PATH) if File.exist?(PROJ_PATH)

project = Xcodeproj::Project.new(PROJ_PATH)

main_group   = project.main_group
target_group = main_group.find_subpath('PoushiTongdao', true)

# Add source files
swift_files = %w[AppDelegate.swift ViewController.swift Info.plist]
html_files  = %w[index.html app.js style.css]

swift_files.each { |f| target_group.new_file(f) }
html_files.each  { |f| target_group.new_file(f) }

# Create target
target = project.new_target(:application, SCHEME_NAME, :ios, '13.0')

target.build_configurations.each do |config|
  config.build_settings['SWIFT_VERSION']               = '5.0'
  config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
  config.build_settings['INFOPLIST_FILE']             = 'PoushiTongdao/Info.plist'
  config.build_settings['PRODUCT_BUNDLE_IDENTIFIER']  = 'com.poushitongdao.app'
  config.build_settings['PRODUCT_NAME']                = '$(TARGET_NAME)'
  config.build_settings['CODE_SIGN_IDENTITY']         = ''
  config.build_settings['CODE_SIGNING_REQUIRED']       = 'NO'
  config.build_settings['CODE_SIGNING_ALLOWED']        = 'NO'
  config.build_settings['LD_RUNPATH_SEARCH_PATHS']     = ['$(inherited)', '@executable_path/Frameworks']
end

target.debug_build_settings['DEBUG_INFORMATION_FORMAT'] = 'dwarf'
target.debug_build_settings['SWIFT_OPTIMIZATION_LEVEL'] = '-Onone'
target.debug_build_settings['ONLY_ACTIVE_ARCH']          = 'YES'

target.release_build_settings['DEBUG_INFORMATION_FORMAT'] = 'dwarf-with-dsym'
target.release_build_settings['MTL_ENABLE_DEBUG_INFO']   = 'NO'
target.release_build_settings['SWIFT_COMPILATION_MODE']  = 'wholemodule'

# Add WebKit framework (using add_system_framework)
begin
  target.add_system_framework('WebKit')
rescue => e
  puts "Warning: Could not add WebKit framework: #{e.message}"
end

# Create scheme
scheme = Xcodeproj::XCScheme.new(SCHEME_NAME)
scheme.add_run_target(target)

project.save
scheme.save_as(PROJ_PATH, SCHEME_NAME)

puts "Done: #{PROJ_PATH}"
