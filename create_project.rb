#!/usr/bin/env ruby
require 'xcodeproj'

PROJECT_DIR = File.dirname(File.expand_path(__FILE__))
PROJ_PATH   = File.join(PROJECT_DIR, 'PoushiTongdao.xcodeproj')
SCHEME_NAME = 'PoushiTongdao'

puts "PROJECT_DIR: #{PROJECT_DIR}"
puts "Deleting existing project..."

FileUtils.rm_rf(PROJ_PATH) if File.exist?(PROJ_PATH)

puts "Creating new project..."
project = Xcodeproj::Project.new(PROJ_PATH)

# Get groups
main_group   = project.main_group
target_group = main_group.find_subpath('PoushiTongdao', true)

# Source files (relative to PoushiTongdao.xcodeproj = project root)
source_files = [
  'PoushiTongdao/AppDelegate.swift',
  'PoushiTongdao/ViewController.swift',
  'PoushiTongdao/Info.plist',
  'PoushiTongdao/index.html',
  'PoushiTongdao/app.js',
  'PoushiTongdao/style.css',
]

puts "Adding source files..."
source_files.each do |f|
  abs_path = File.join(PROJECT_DIR, f)
  unless File.exist?(abs_path)
    puts "WARNING: File not found: #{abs_path}"
    next
  end
  ref = target_group.new_reference(f)
  ref.name = File.basename(f)
  puts "  Added: #{f}"
end

puts "Creating target..."
target = project.new_target(:application, SCHEME_NAME, :ios, '13.0')

puts "Configuring build settings..."
target.build_configurations.each do |config|
  config.build_settings['SWIFT_VERSION']                = '5.0'
  config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']    = '13.0'
  config.build_settings['INFOPLIST_FILE']               = 'PoushiTongdao/Info.plist'
  config.build_settings['PRODUCT_BUNDLE_IDENTIFIER']      = 'com.poushitongdao.app'
  config.build_settings['PRODUCT_NAME']                  = '$(TARGET_NAME)'
  config.build_settings['CODE_SIGN_IDENTITY']            = ''
  config.build_settings['CODE_SIGNING_REQUIRED']         = 'NO'
  config.build_settings['CODE_SIGNING_ALLOWED']          = 'NO'
  config.build_settings['LD_RUNPATH_SEARCH_PATHS']       = ['$(inherited)', '@executable_path/Frameworks']
  config.build_settings['ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES'] = 'YES'
end

# Debug settings
target.debug_build_settings['DEBUG_INFORMATION_FORMAT']  = 'dwarf'
target.debug_build_settings['SWIFT_OPTIMIZATION_LEVEL']  = '-Onone'
target.debug_build_settings['ONLY_ACTIVE_ARCH']           = 'YES'

# Release settings
target.release_build_settings['DEBUG_INFORMATION_FORMAT'] = 'dwarf-with-dsym'
target.release_build_settings['MTL_ENABLE_DEBUG_INFO']    = 'NO'
target.release_build_settings['SWIFT_COMPILATION_MODE']  = 'wholemodule'

# Add WebKit framework via build settings (more reliable than add_system_framework)
puts "Adding WebKit framework..."
target.build_configurations.each do |config|
  config.build_settings['OTHER_LDFLAGS'] ||= ['$(inherited)']
  config.build_settings['OTHER_LDFLAGS'] << '-framework WebKit'
end

# Add source files to target's sources build phase
puts "Adding files to Sources build phase..."
sources_phase = target.add_sources_build_phase
target_group.files.each do |file_ref|
  next if file_ref.source_tree != '<group>'
  sources_phase.add_file_reference(file_ref) unless sources_phase.files.map(&:file_ref).include?(file_ref)
end

# Create scheme
puts "Creating scheme..."
scheme = Xcodeproj::XCScheme.new(SCHEME_NAME)
scheme.add_run_target(target)

puts "Saving project..."
project.save
scheme.save_as(PROJ_PATH, SCHEME_NAME)

puts "SUCCESS: #{PROJ_PATH}"

# Verify
proj = Xcodeproj::Project.open(PROJ_PATH)
proj.targets.each do |t|
  puts "Target: #{t.name}, platform: #{t.platform.name}"
end
puts "Done."
