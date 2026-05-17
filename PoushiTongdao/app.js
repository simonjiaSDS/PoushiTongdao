/* 普世同祷 - 司铎专用 App v1.1 */
(function() {
  'use strict';

  const STORAGE_KEY = 'pusi-tongdao-data';
  const PROTECTED_IDS = ['m1','m2','m3','m4','m5','f1','f2','f3','f4','f5','f6','b1','b2','b3','b4','b5','b6'];

  /* ========== 工具函数 ========== */
  function isProtected(item) {
    return item && (item.protected || PROTECTED_IDS.indexOf(item.id) >= 0);
  }

  function escHtml(s) {
    return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function findById(list, id) {
    if (!list) return null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  /* ========== 农历算法 ========== */
  var lunarInfo = [
    0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
    0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
    0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
    0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
    0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
    0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
    0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
    0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
    0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
    0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
    0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
    0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
    0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
    0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
    0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
    0x14b63
  ];
  var Gan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  var Zhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var Animals = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
  var lunarMonthName = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
  var lunarDayName = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十','卅一'];

  function lYearDays(y) {
    var sum = 348;
    for (var m = 0x8000; m > 0x8; m >>= 1) sum += (lunarInfo[y - 1900] & m) ? 1 : 0;
    return sum + leapDays(y);
  }
  function leapMonth(y) { return lunarInfo[y - 1900] & 0xf; }
  function leapDays(y) {
    if (leapMonth(y)) return (lunarInfo[y - 1900] & 0x10000) ? 30 : 29;
    return 0;
  }
  function monthDays(y, m) { return (lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29; }

  function solarToLunar(yy, mm, dd) {
    if (yy < 1900 || yy > 2100) return {monthStr:'', dayStr:''};
    var offset = Math.floor((Date.UTC(yy, mm - 1, dd) - Date.UTC(1900, 0, 31)) / 86400000);
    var temp = 0;
    var y = 1900;
    for (; y < 2101 && offset > 0; y++) { temp = lYearDays(y); offset -= temp; }
    if (offset < 0) { offset += temp; y--; }
    var year = y;
    var leap = leapMonth(y);
    var isLeap = false;
    var m = 1;
    for (; m < 13 && offset > 0; m++) {
      if (leap > 0 && m === (leap + 1) && !isLeap) { --m; isLeap = true; temp = leapDays(y); }
      else { temp = monthDays(y, m); }
      if (isLeap && m === (leap + 1)) isLeap = false;
      offset -= temp;
    }
    if (offset === 0 && leap > 0 && m === leap + 1) {
      if (isLeap) isLeap = false; else { isLeap = true; --m; }
    }
    if (offset < 0) { offset += temp; --m; }
    var month = m;
    var day = offset + 1;
    return {
      year: year,
      month: month,
      day: day,
      isLeap: isLeap,
      monthStr: (isLeap ? '闰' : '') + lunarMonthName[month - 1] + '月',
      dayStr: lunarDayName[day - 1] || (day + '日')
    };
  }

  /* ========== 数据管理 ========== */
  function getDefaultData() {
    return {
      version: 1, prayer: {},
      mass: [
        {id:'m1',title:'感恩祭第一式',content:'（请将感恩祭第一式经文内容粘贴或导入此处）',protected:true},
        {id:'m2',title:'感恩祭第二式',content:'（请将感恩祭第二式经文内容粘贴或导入此处）',protected:true},
        {id:'m3',title:'感恩祭第三式',content:'（请将感恩祭第三式经文内容粘贴或导入此处）',protected:true},
        {id:'m4',title:'感恩祭第四式',content:'（请将感恩祭第四式经文内容粘贴或导入此处）',protected:true},
        {id:'m5',title:'英语弥撒',content:'（English Mass content here）',protected:true},
      ],
      funeral: [
        {id:'f1',title:'守灵祈祷',content:'（守灵祈祷经文内容）',protected:true},
        {id:'f2',title:'入殓礼',content:'（入殓礼经文内容）',protected:true},
        {id:'f3',title:'辞灵礼',content:'（辞灵礼经文内容）',protected:true},
        {id:'f4',title:'出殡祈祷',content:'（出殡祈祷经文内容）',protected:true},
        {id:'f5',title:'土葬礼',content:'（土葬礼经文内容）',protected:true},
        {id:'f6',title:'火葬礼',content:'（火葬礼经文内容）',protected:true},
      ],
      blessing: [
        {id:'b1',title:'房屋祝福',content:'（房屋祝福经文内容）',protected:true},
        {id:'b2',title:'圣洗圣事',content:'（圣洗圣事经文内容）',protected:true},
        {id:'b3',title:'坚振圣事',content:'（坚振圣事经文内容）',protected:true},
        {id:'b4',title:'婚姻圣事',content:'（婚姻圣事经文内容）',protected:true},
        {id:'b5',title:'病人傅油礼',content:'（病人傅油礼经文内容）',protected:true},
        {id:'b6',title:'平时祝福教友经文',content:'（平时祝福教友经文内容）',protected:true},
      ],
    };
  }

  function loadData() {
    try {
      var raw = '';
      // 先检测 Android 接口是否可用
      var androidOK = false;
      if (window.Android) {
        try { androidOK = Android.isAvailable(); } catch(e) { androidOK = false; }
      }
      console.log('[DEBUG] loadData: window.Android available?', !!window.Android, ', isAvailable=', androidOK);
      // 优先从 Android 原生存储读取（永久存储，不会被系统清除）
      if (window.Android && androidOK) {
        try {
          raw = Android.loadData();
          console.log('[DEBUG] loadData: from Android, raw.length=', raw ? raw.length : 0, ', raw prefix=', raw ? raw.substring(0, 100) : '');
        } catch(e) {
          console.log('[DEBUG] loadData: Android.loadData() failed', e);
          raw = '';
        }
      } else {
        console.log('[DEBUG] loadData: Android NOT available, will use localStorage');
      }
      // 如果 Android 返回空，尝试 localStorage（兼容性备份）
      if (!raw && window.localStorage) {
        raw = localStorage.getItem(STORAGE_KEY);
        console.log('[DEBUG] loadData: from localStorage, raw.length=', raw ? raw.length : 0, ', raw prefix=', raw ? raw.substring(0, 100) : '');
      }
      var data = raw ? JSON.parse(raw) : getDefaultData();
      var keys = ['mass','funeral','blessing'];
      for (var ki = 0; ki < keys.length; ki++) {
        var key = keys[ki];
        var list = data[key] || [];
        for (var i = 0; i < list.length; i++) {
          list[i].protected = isProtected(list[i]);
        }
      }
      // 自动迁移：更新旧标题为新标题
      if (data.blessing) {
        var migrationMap = {
          '餐桌祝福': '圣洗圣事',
          '旅途祝福': '坚振圣事',
          '医疗祝福': '婚姻圣事'
        };
        for (var i = 0; i < data.blessing.length; i++) {
          var item = data.blessing[i];
          if (migrationMap[item.title]) {
            item.title = migrationMap[item.title];
            if (item.id === 'b2') item.content = '（圣洗圣事经文内容）';
            if (item.id === 'b3') item.content = '（坚振圣事经文内容）';
            if (item.id === 'b4') item.content = '（婚姻圣事经文内容）';
          }
        }
        // 如果没有 b5/b6，则添加
        var hasB5 = false, hasB6 = false;
        for (var i = 0; i < data.blessing.length; i++) {
          if (data.blessing[i].id === 'b5') hasB5 = true;
          if (data.blessing[i].id === 'b6') hasB6 = true;
        }
        if (!hasB5) data.blessing.push({id:'b5',title:'病人傅油礼',content:'（病人傅油礼经文内容）',protected:true});
        if (!hasB6) data.blessing.push({id:'b6',title:'平时祝福教友经文',content:'（平时祝福教友经文内容）',protected:true});
        // 同时保存到 Android 原生存储（永久）和 localStorage（备份）
        if (window.Android) { try { Android.saveData(JSON.stringify(data)); } catch(e) {} }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
      return data;
    } catch(e) { return getDefaultData(); }
  }

  function saveData() {
    try {
      var json = JSON.stringify(appData);
      console.log('[DEBUG] saveData: json.length=', json.length, ', json prefix=', json.substring(0, 100));
      var saved = false;
      // 优先保存到 Android 原生存储（永久，不会被系统清除）
      if (window.Android) {
        try {
          saved = Android.saveData(json);  // 现在返回 boolean
          console.log('[DEBUG] saveData: Android.saveData returned', saved);
        } catch(e) {
          console.log('[DEBUG] saveData: Android.saveData failed', e);
        }
      } else {
        console.log('[DEBUG] saveData: window.Android NOT available!');
      }
      // 同时保存到 localStorage 作为备份（即使 Android 保存成功也保存，双重保险）
      if (window.localStorage) { try { localStorage.setItem(STORAGE_KEY, json); } catch(e) {} }
      return saved;
    } catch(e) { console.log('[DEBUG] saveData: exception', e); return false; }
  }

  /* ========== 全局状态 ========== */
  var appData = loadData();
  var pageHistory = ['home'];
  var currentDetail = {type:'', id:''};
  var appState = {selectedDate:null, currentTab:'reading'};
  var currentAddType = '';
  var autoSaveTimer = null;

  /* ========== 页面导航 ========== */
  function switchPage(pageId) {
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) pages[i].classList.remove('active');
    var target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');

    // 只有主页面（有底部导航项的）才高亮对应的导航按钮
    var mainPages = ['home','mass','funeral','blessing','prayer'];
    if (mainPages.indexOf(pageId) >= 0) {
      var navs = document.querySelectorAll('.nav-item');
      for (var i = 0; i < navs.length; i++) navs[i].classList.remove('active');
      var navEl = document.querySelector('.nav-item[data-page="' + pageId + '"]');
      if (navEl) navEl.classList.add('active');
    }

    var nav = document.getElementById('bottom-nav');
    nav.style.display = '';
    var allPages = document.querySelectorAll('.page');
    for (var i = 0; i < allPages.length; i++) {
      allPages[i].style.height = 'calc(100% - 60px)';
    }
    // 记录页面历史（避免重复记录同一页面）
    if (pageHistory.length === 0 || pageHistory[pageHistory.length-1] !== pageId) {
      pageHistory.push(pageId);
    }
    if (pageId==='home') renderCalendar();
    if (pageId==='mass') renderMassList();
    if (pageId==='funeral') renderFuneralList();
    if (pageId==='blessing') renderBlessingList();
  }

  function goBack() {
    if (pageHistory.length <= 1) return;
    pageHistory.pop();
    var prev = pageHistory[pageHistory.length-1] || 'home';
    switchPage(prev);
  }

  /* ========== 日历 ========== */
  var calYear, calMonth;

  function initCalendar() {
    var now = new Date();
    calYear = now.getFullYear();
    calMonth = now.getMonth();
    renderCalendar();
    var weekdays = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    var el = document.getElementById('today-display');
    if (el) el.textContent = now.getFullYear()+'年'+(now.getMonth()+1)+'月'+now.getDate()+'日 '+weekdays[now.getDay()];
  }

  function renderCalendar() {
    var container = document.getElementById('calendar-container');
    if (!container) return;
    var weekdays = ['日','一','二','三','四','五','六'];
    var today = new Date();
    var y = calYear, m = calMonth;
    var firstDay = new Date(y, m, 1).getDay();
    var daysInMonth = new Date(y, m+1, 0).getDate();
    var daysInPrev = new Date(y, m, 0).getDate();
    var html = '<div class="cal-header"><button class="cal-nav" data-action="calPrev">‹</button><span class="cal-month">'+y+'年'+(m+1)+'月</span><button class="cal-nav" data-action="calNext">›</button></div>';
    html += '<div class="cal-days">';
    for (var i = firstDay-1; i >= 0; i--) {
      html += '<div class="cal-day other-month">'+(daysInPrev - i)+'</div>';
    }
    for (var d = 1; d <= daysInMonth; d++) {
      var ds = y+'-'+('0'+(m+1)).slice(-2)+'-'+('0'+d).slice(-2);
      var isToday = (y===today.getFullYear() && m===today.getMonth() && d===today.getDate());
      var cls = isToday ? 'cal-day today' : 'cal-day';
      var lunar = solarToLunar(y, m+1, d);
      html += '<div class="'+cls+'" data-action="onDateClick" data-date="'+ds+'"><span class="day-num">'+d+'</span><span class="day-lunar">'+lunar.dayStr+'</span></div>';
    }
    var totalCells = firstDay + daysInMonth;
    var remaining = (7 - totalCells % 7) % 7;
    for (var i = 1; i <= remaining; i++) html += '<div class="cal-day other-month">'+i+'</div>';
    html += '</div>';
    container.innerHTML = html;
  }

  function calPrev() { calMonth--; if(calMonth<0){calMonth=11;calYear--;} renderCalendar(); }
  function calNext() { calMonth++; if(calMonth>11){calMonth=0;calYear++;} renderCalendar(); }

  function onDateClick(dateStr) {
    if(!dateStr) return;
    appState.selectedDate = dateStr;
    var parts = dateStr.split('-');
    var d = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
    var wds = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    var titleEl = document.getElementById('prayer-date-title');
    if (titleEl) titleEl.textContent = parseInt(parts[0])+'年'+parseInt(parts[1])+'月'+parseInt(parts[2])+'日 '+wds[d.getDay()];
    var tabs = document.querySelectorAll('#prayer-tabs .tab');
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
    var firstTab = document.querySelector('#prayer-tabs .tab');
    if (firstTab) firstTab.classList.add('active');
    loadPrayerTab('reading');
    switchPage('prayer');
  }

  /* ========== 普世同祷 Tabs ========== */
  function switchTab(tabId, el) {
    var tabs = document.querySelectorAll('#prayer-tabs .tab');
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
    if (el) el.classList.add('active');
    appState.currentTab = tabId;
    loadPrayerTab(tabId);
  }

  function loadPrayerTab(tabId) {
    var dateStr = appState.selectedDate;
    var container = document.getElementById('tab-content');
    if (!container) return;
    if (!dateStr) { container.innerHTML = '<p class="empty-hint">请先在日历中选择日期</p>'; return; }
    var prayer = appData.prayer || {};
    var dayData = prayer[dateStr] || {};
    var tabLabels = {reading:'弥撒读经',lecture:'诵读',morning:'晨祷',day:'日祷',evening:'晚祷',night:'夜祷'};
    var content = dayData[tabId] || '（暂无'+tabLabels[tabId]+'内容，请在"设置"中导入或添加数据）';

    // 规范化换行符
    var normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var escaped = normalized.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    // 按连续换行分割段落
    var paragraphs = escaped.split(/\n\n+/);
    var formatted = paragraphs.map(function(p) {
      return '<p style="margin-bottom:12px;">' + p.replace(/\n/g, '<br>') + '</p>';
    }).join('');

    container.innerHTML = '<div style="padding:16px;line-height:2;">' + formatted + '</div>';
  }

  /* ========== 滑动切换 Tab ========== */
  var TAB_ORDER = ['reading', 'lecture', 'morning', 'day', 'evening', 'night'];
  var swipeState = {startX: 0, startY: 0, isSwiping: false};

  function initSwipe() {
    var container = document.getElementById('tab-content');
    if (!container) return;

    container.addEventListener('touchstart', function(e) {
      var touch = e.touches[0];
      swipeState.startX = touch.clientX;
      swipeState.startY = touch.clientY;
      swipeState.isSwiping = true;
    }, {passive: true});

    container.addEventListener('touchmove', function(e) {
      if (!swipeState.isSwiping) return;
      var touch = e.touches[0];
      var diffX = touch.clientX - swipeState.startX;
      var diffY = touch.clientY - swipeState.startY;

      // 如果是垂直滑动，不阻止（允许正常滚动）
      if (Math.abs(diffY) > Math.abs(diffX)) return;

      // 水平滑动，阻止默认行为
      if (Math.abs(diffX) > 10) {
        e.preventDefault();
      }
    }, {passive: false});

    container.addEventListener('touchend', function(e) {
      if (!swipeState.isSwiping) return;
      swipeState.isSwiping = false;

      var touch = e.changedTouches[0];
      var diffX = touch.clientX - swipeState.startX;
      var diffY = touch.clientY - swipeState.startY;

      // 判断是否为有效滑动（水平距离 > 50px，且水平距离 > 垂直距离）
      if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
        var currentIndex = TAB_ORDER.indexOf(appState.currentTab);
        var nextIndex = -1;

        if (diffX > 0) {
          // 向右滑 → 上一个 tab
          nextIndex = currentIndex - 1;
          if (nextIndex < 0) nextIndex = TAB_ORDER.length - 1; // 循环到最后一个
        } else {
          // 向左滑 → 下一个 tab
          nextIndex = currentIndex + 1;
          if (nextIndex >= TAB_ORDER.length) nextIndex = 0; // 循环到第一个
        }

        var nextTabId = TAB_ORDER[nextIndex];
        var nextTabEl = document.querySelector('#prayer-tabs .tab[data-tab="' + nextTabId + '"]');
        if (nextTabEl) switchTab(nextTabId, nextTabEl);
      }
    }, {passive: true});
  }

  /* ========== 日历滑动切换月份 ========== */
  var calSwipeState = {startX:0, startY:0, isSwiping:false};

  function initCalendarSwipe() {
    var container = document.getElementById('calendar-container');
    if (!container) return;

    container.addEventListener('touchstart', function(e) {
      var t = e.touches[0];
      calSwipeState.startX = t.clientX;
      calSwipeState.startY = t.clientY;
      calSwipeState.isSwiping = true;
    }, {passive: true});

    container.addEventListener('touchmove', function(e) {
      if (!calSwipeState.isSwiping) return;
      var t = e.touches[0];
      var dx = t.clientX - calSwipeState.startX;
      var dy = t.clientY - calSwipeState.startY;
      if (Math.abs(dy) > Math.abs(dx)) return;
      if (Math.abs(dx) > 10) e.preventDefault();
    }, {passive: false});

    container.addEventListener('touchend', function(e) {
      if (!calSwipeState.isSwiping) return;
      calSwipeState.isSwiping = false;
      var t = e.changedTouches[0];
      var dx = t.clientX - calSwipeState.startX;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(t.clientY - calSwipeState.startY)) {
        if (dx > 0) calPrev(); else calNext();
      }
    }, {passive: true});
  }

  /* ========== 列表渲染 ========== */
  function renderMassList(){
    var c = document.getElementById('mass-list');
    if (!c) return;
    var html = '';
    var list = appData.mass || [];
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      var lock = isProtected(item);
      var delBtn = lock
        ? '<span style="color:#ccc;font-size:14px;padding:0 8px;" title="内置不可删">🔒</span>'
        : '<button class="item-delete" data-type="mass" data-id="'+item.id+'">✕</button>';
      html += '<div class="list-item" data-type="mass" data-id="'+item.id+'"><span class="item-icon">🙏</span><span class="item-text">' + escHtml(item.title) + '</span>' + delBtn + '</div>';
    }
    c.innerHTML = html;
  }

  function renderFuneralList(){
    var c = document.getElementById('funeral-list');
    if (!c) return;
    var icons = ['🕯️','⚰️','📿','🚶','⛪','🔥'];
    var html = '';
    var list = appData.funeral || [];
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      var lock = isProtected(item);
      var delBtn = lock
        ? '<span style="color:#ccc;font-size:14px;padding:0 8px;" title="内置不可删">🔒</span>'
        : '<button class="item-delete" data-type="funeral" data-id="'+item.id+'">✕</button>';
      html += '<div class="list-item" data-type="funeral" data-id="'+item.id+'"><span class="item-icon">' + (icons[i]||'📿') + '</span><span class="item-text">' + escHtml(item.title) + '</span>' + delBtn + '</div>';
    }
    c.innerHTML = html;
  }

  function renderBlessingList(){
    var c = document.getElementById('blessing-list');
    if (!c) return;
    var icons = ['🏠','💧','✝️','💍','🕊️','🙏','📖','🎵'];
    var html = '';
    var list = appData.blessing || [];
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      var lock = isProtected(item);
      var delBtn = lock
        ? '<span style="color:#ccc;font-size:14px;padding:0 8px;" title="内置不可删">🔒</span>'
        : '<button class="item-delete" data-type="blessing" data-id="'+item.id+'">✕</button>';
      html += '<div class="list-item" data-type="blessing" data-id="'+item.id+'"><span class="item-icon">' + (icons[i]||'✨') + '</span><span class="item-text">' + escHtml(item.title) + '</span>' + delBtn + '</div>';
    }
    c.innerHTML = html;
  }

  function rerenderList(type){
    if(type==='mass') renderMassList();
    else if(type==='funeral') renderFuneralList();
    else if(type==='blessing') renderBlessingList();
  }

  /* ========== 详情页 ========== */
  function showDetail(type,id){
    var item;
    if(type==='mass') item = findById(appData.mass, id);
    else if(type==='funeral') item = findById(appData.funeral, id);
    else if(type==='blessing') item = findById(appData.blessing, id);
    if(!item) return;
    currentDetail = {type:type, id:id};
    var titleEl = document.getElementById('detail-title');
    if (titleEl) titleEl.textContent = item.title;
    var contentEl = document.getElementById('detail-content');
    if (contentEl) contentEl.innerHTML = escHtml(item.content).replace(/\n/g,'<br>');
    var btnEdit = document.getElementById('btn-edit');
    if (btnEdit) btnEdit.style.display = '';
    var btnSave = document.getElementById('btn-save');
    if (btnSave) btnSave.style.display = 'none';
    var btnCancel = document.getElementById('btn-cancel-edit');
    if (btnCancel) btnCancel.style.display = 'none';
    switchPage('detail');
  }

  function enterEditMode(){
    var type = currentDetail.type, id = currentDetail.id;
    var item = findById(appData[type], id);
    if(!item) return;
    var titleEl = document.getElementById('detail-title');
    if (titleEl) titleEl.textContent = '编辑 - '+item.title;
    var contentEl = document.getElementById('detail-content');
    if (contentEl) contentEl.innerHTML =
      '<label style="font-size:14px;color:#666;display:block;margin-bottom:4px;">标题</label>'+
      '<input type="text" id="edit-title" style="width:100%;padding:8px 12px;border:1px solid #ddd;border-radius:8px;font-size:15px;margin:6px 0 12px;box-sizing:border-box;" value="'+escHtml(item.title)+'" oninput="autoSave()">'+
      '<label style="font-size:14px;color:#666;display:block;margin-bottom:4px;">内容</label>'+
      '<textarea id="edit-content" rows="12" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:15px;line-height:1.8;font-family:inherit;resize:vertical;box-sizing:border-box;" oninput="autoSave()">'+escHtml(item.content)+'</textarea>'+
      '<div id="auto-save-tip" style="font-size:12px;color:#999;margin-top:8px;display:none;">正在自动保存...</div>';
    var btnEdit = document.getElementById('btn-edit');
    if (btnEdit) btnEdit.style.display = 'none';
    var btnSave = document.getElementById('btn-save');
    if (btnSave) btnSave.style.display = '';
    var btnCancel = document.getElementById('btn-cancel-edit');
    if (btnCancel) btnCancel.style.display = '';
  }

  function saveEdit(){
    var type = currentDetail.type, id = currentDetail.id;
    var titleInput = document.getElementById('edit-title');
    var contentInput = document.getElementById('edit-content');
    if (!titleInput || !contentInput) return;
    var t = titleInput.value.trim();
    var c = contentInput.value;
    if(!t){alert('标题不能为空');return;}
    var item = findById(appData[type], id);
    if(!item) return;
    item.title = t;
    item.content = c;
    saveData();
    showDetail(type,id);
    alert('保存成功！');
  }

  // 自动保存功能（防抖）
  window.autoSave = function() {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(function() {
      var type = currentDetail.type, id = currentDetail.id;
      var titleInput = document.getElementById('edit-title');
      var contentInput = document.getElementById('edit-content');
      if (!titleInput || !contentInput) return;
      var item = findById(appData[type], id);
      if (!item) return;
      item.title = titleInput.value.trim();
      item.content = contentInput.value;
      saveData();
      console.log('自动保存完成');
    }, 2000);
  };

  function cancelEdit(){ showDetail(currentDetail.type, currentDetail.id); }

  /* ========== 通用增删 ========== */
  function showAddDialog(type){
    currentAddType = type;
    var titles = {mass:'添加感恩祭经文',funeral:'添加亡者礼仪',blessing:'添加其他礼仪'};
    var titleEl = document.getElementById('modal-add-title');
    if (titleEl) titleEl.textContent = titles[type]||'添加';
    var inputTitle = document.getElementById('modal-item-title');
    if (inputTitle) inputTitle.value = '';
    var inputContent = document.getElementById('modal-item-content');
    if (inputContent) inputContent.value = '';
    var modal = document.getElementById('modal-add-item');
    if (modal) modal.classList.add('active');
  }

  function closeModal(id){
    var el = document.getElementById(id);
    if (el) el.classList.remove('active');
  }

  function doAddItem(){
    var titleInput = document.getElementById('modal-item-title');
    var contentInput = document.getElementById('modal-item-content');
    if (!titleInput || !contentInput) return;
    var title = titleInput.value.trim();
    var content = contentInput.value.trim();
    if(!title){alert('请输入标题');return;}
    var id = currentAddType.charAt(0) + Date.now();
    if (!appData[currentAddType]) appData[currentAddType] = [];
    appData[currentAddType].push({id:id, title:title, content:content, protected:false});
    saveData();
    closeModal('modal-add-item');
    rerenderList(currentAddType);
  }

  function deleteItem(type,id){
    var list = appData[type];
    if(!list) return;
    var item = findById(list, id);
    if(!item) return;
    if(isProtected(item)){alert('内置内容不可删除，只能编辑。');return;}
    var labels = {mass:'经文',funeral:'礼仪',blessing:'礼仪'};
    if(!confirm('确定要删除这个'+labels[type]+'吗？')) return;
    appData[type] = list.filter(function(m){return m.id!==id;});
    saveData();
    rerenderList(type);
    if(currentDetail.id===id){
      pageHistory.pop();
      var prev = pageHistory[pageHistory.length-1] || 'home';
      pageHistory.pop();
      switchPage(prev);
    }
  }

  /* ========== 设置功能 ========== */
  function importPrayerData(){
    var modal = document.getElementById('modal-import-prayer');
    if (modal) modal.classList.add('active');
  }

  function importOtherData(){
    var modal = document.getElementById('modal-import-other');
    if (modal) modal.classList.add('active');
  }

  function doImportPrayer(){
    var fileInput = document.getElementById('import-file-prayer');
    if (!fileInput) { alert('找不到文件输入框'); return; }
    if (!fileInput.files || fileInput.files.length === 0) { alert('请先选择文件'); return; }

    handleFileSelect(fileInput.files[0], function(d) {
      if(d.prayer && Object.keys(d.prayer).length > 0) {
        var stats = {added: 0, merged: 0, skipped: 0};
        for (var date in d.prayer) {
          if (appData.prayer[date]) {
            var existingDay = appData.prayer[date];
            var importedDay = d.prayer[date];
            var hasNewData = false;
            var tabs = ['reading', 'lecture', 'morning', 'day', 'evening', 'night'];
            for (var t = 0; t < tabs.length; t++) {
              var tab = tabs[t];
              if (importedDay[tab] && importedDay[tab].trim()) {
                if (!existingDay[tab] || existingDay[tab].indexOf('（') === 0 || existingDay[tab].trim() === '') {
                  existingDay[tab] = importedDay[tab];
                  hasNewData = true;
                }
              }
            }
            if (hasNewData) { stats.merged++; } else { stats.skipped++; }
          } else {
            appData.prayer[date] = d.prayer[date];
            stats.added++;
          }
        }
        saveData();
        var totalDays = Object.keys(appData.prayer).length;
        var msg = '普世同祷数据导入成功！\n\n';
        msg += '新增：' + stats.added + ' 天\n';
        msg += '合并更新：' + stats.merged + ' 天\n';
        msg += '跳过（已有完整数据）：' + stats.skipped + ' 天\n\n';
        msg += '总数据：' + totalDays + ' 天';
        var sortedDates = Object.keys(appData.prayer).sort();
        var firstDate = sortedDates[0];
        if(firstDate) {
          appState.selectedDate = firstDate;
          var parts = firstDate.split('-');
          var dObj = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
          var wds = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
          var titleEl = document.getElementById('prayer-date-title');
          if (titleEl) titleEl.textContent = parseInt(parts[0])+'年'+parseInt(parts[1])+'月'+parseInt(parts[2])+'日 '+wds[dObj.getDay()];
          var tabs = document.querySelectorAll('#prayer-tabs .tab');
          for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
          var firstTab = document.querySelector('#prayer-tabs .tab');
          if (firstTab) firstTab.classList.add('active');
          loadPrayerTab('reading');
          switchPage('prayer');
        }
        alert(msg);
      } else {
        alert('导入文件中没有普世同祷数据！');
      }
      closeModal('modal-import-prayer');
      fileInput.value = '';
    });
  }

  function mergeItems(existingArray, importedArray) {
    if (!existingArray) existingArray = [];
    var stats = {added: 0, updated: 0, skipped: 0};
    for (var i = 0; i < importedArray.length; i++) {
      var importedItem = importedArray[i];
      var existingIndex = -1;
      for (var j = 0; j < existingArray.length; j++) {
        if (existingArray[j].id === importedItem.id) { existingIndex = j; break; }
      }
      if (existingIndex >= 0) {
        if (!isProtected(existingArray[existingIndex])) {
          // 非受保护项目，直接替换
          existingArray[existingIndex] = importedItem;
          stats.updated++;
        } else {
          // 受保护项目，只更新内容，保留 protected 标志
          existingArray[existingIndex].title = importedItem.title;
          existingArray[existingIndex].content = importedItem.content;
          stats.updated++;
        }
      } else {
        existingArray.push(importedItem);
        stats.added++;
      }
    }
    return {array: existingArray, stats: stats};
  }

  /* ========== 文件导入辅助函数 ========== */
  var pendingImportCallback = null;

  function handleFileSelect(file, callback) {
    if (!file) { alert('未选择文件'); return; }
    pendingImportCallback = callback;
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target.result);
        if (pendingImportCallback) {
          pendingImportCallback(data);
          pendingImportCallback = null;
        }
      } catch(err) {
        alert('文件解析失败：' + err.message);
      }
    };
    reader.onerror = function() { alert('读取文件失败，请重试'); };
    reader.readAsText(file);
  }

  function doImportOther(){
    var fileInput = document.getElementById('import-file-other');
    if (!fileInput) { alert('找不到文件输入框'); return; }
    if (!fileInput.files || fileInput.files.length === 0) { alert('请先选择文件'); return; }

    handleFileSelect(fileInput.files[0], function(d) {
      var totalStats = {added: 0, updated: 0, skipped: 0};
      if (d.mass && d.mass.length > 0) {
        var result = mergeItems(appData.mass, d.mass);
        appData.mass = result.array;
        totalStats.added += result.stats.added;
        totalStats.updated += result.stats.updated;
        totalStats.skipped += result.stats.skipped;
      }
      if (d.funeral && d.funeral.length > 0) {
        var result = mergeItems(appData.funeral, d.funeral);
        appData.funeral = result.array;
        totalStats.added += result.stats.added;
        totalStats.updated += result.stats.updated;
        totalStats.skipped += result.stats.skipped;
      }
      if (d.blessing && d.blessing.length > 0) {
        var result = mergeItems(appData.blessing, d.blessing);
        appData.blessing = result.array;
        totalStats.added += result.stats.added;
        totalStats.updated += result.stats.updated;
        totalStats.skipped += result.stats.skipped;
      }
      saveData();
      var msg = '其他数据导入成功！\n\n';
      msg += '新增：' + totalStats.added + ' 项\n';
      msg += '更新：' + totalStats.updated + ' 项\n';
      msg += '跳过（受保护）：' + totalStats.skipped + ' 项';
      alert(msg);
      closeModal('modal-import-other');
      renderMassList(); renderFuneralList(); renderBlessingList();
      fileInput.value = '';
    });
  }

  function updatePrayerData(){
    if(!confirm('将自动下载今天起两个月内的缺失数据，并删除过期超过一个月的数据。\n\n确定要开始更新吗？')) return;
    alert('由于浏览器安全限制，无法直接访问外部网站。\n\n请使用Python脚本更新数据：\n1. 运行脚本：python update_prayer_data.py\n2. 脚本会生成 prayer_data_for_import.json\n3. 在App中导入该文件');
  }

  function exportPrayerData(){
    var dateStr = new Date().toISOString().slice(0,10);
    var prayerData = {prayer: appData.prayer || {}};
    var blob = new Blob([JSON.stringify(prayerData, null, 2)], {type:'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; 
    a.download = '普世同祷_祈祷数据_'+dateStr+'.json';
    a.click(); 
    URL.revokeObjectURL(url);
    alert('祈祷数据已导出：普世同祷_祈祷数据_'+dateStr+'.json\n（包含普世同祷数据）');
  }

  function exportOtherData(){
    var dateStr = new Date().toISOString().slice(0,10);
    var otherData = {
      mass: appData.mass || [],
      funeral: appData.funeral || [],
      blessing: appData.blessing || []
    };
    var blob = new Blob([JSON.stringify(otherData, null, 2)], {type:'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; 
    a.download = '普世同祷_其他数据_'+dateStr+'.json';
    a.click(); 
    URL.revokeObjectURL(url);
    alert('其他数据已导出：普世同祷_其他数据_'+dateStr+'.json\n（包含感恩祭经文、亡者礼仪、其他礼仪）');
  }

  function clearAllData(){
    if(!confirm('确定要清除所有数据吗？此操作不可恢复！')) return;
    if(!confirm('再次确认：清除所有数据？')) return;
    localStorage.removeItem(STORAGE_KEY);
    appData = getDefaultData();
    saveData();
    alert('所有数据已清除，页面将刷新。');
    location.reload();
  }

  /* ========== 字体大小设置（滑动条） ========== */
  var FONT_SIZE_KEY = 'pusi-tongdao-font-size';

  // 将旧字符串值映射为数字，新值直接解析为数字
  function getFontSize() {
    try {
      var raw = localStorage.getItem(FONT_SIZE_KEY);
      if (!raw) return 15;
      // 兼容旧版字符串值
      if (raw === 'small') return 13;
      if (raw === 'medium') return 15;
      if (raw === 'large') return 18;
      var n = parseInt(raw, 10);
      return (isNaN(n) || n < 12) ? 15 : n;
    } catch(e) { return 15; }
  }

  function applyFontSize() {
    var size = getFontSize();
    // 通过 CSS 变量控制字体大小
    document.documentElement.style.setProperty('--content-font-size', size + 'px');
    // 同步滑动条和标签
    var slider = document.getElementById('font-size-slider');
    if (slider) slider.value = size;
    var label = document.getElementById('font-size-label');
    if (label) label.textContent = size + 'px';
  }

  // 供滑动条 oninput 调用
  window.setFontSize = function(size) {
    var n = parseInt(size, 10);
    if (isNaN(n)) n = 15;
    if (n < 12) n = 12;
    if (n > 28) n = 28;
    try { localStorage.setItem(FONT_SIZE_KEY, n); } catch(e) {}
    applyFontSize();
  };

  /* ========== 统一事件委托 ========== */
  document.addEventListener('click', function(e){
    var target = e.target;

    // 处理返回按钮
    if (target.closest('[data-action="goBack"]')) { goBack(); return; }

    // 处理底部导航点击
    var navItem = target.closest('.nav-item');
    if (navItem) { var page = navItem.getAttribute('data-page'); if (page) switchPage(page); return; }

    // 处理 Tab 切换
    var tab = target.closest('.tab');
    if (tab) { var tabId = tab.getAttribute('data-tab'); if (tabId) switchTab(tabId, tab); return; }

    // 处理列表项点击（查看详情）
    var listItem = target.closest('.list-item');
    if (listItem) {
      var type = listItem.getAttribute('data-type');
      var id = listItem.getAttribute('data-id');
      if (type && id) { showDetail(type, id); }
      return;
    }

    // 处理删除按钮
    var delBtn = target.closest('.item-delete');
    if (delBtn) { e.stopPropagation(); var type = delBtn.getAttribute('data-type'); var id = delBtn.getAttribute('data-id'); deleteItem(type, id); return; }

    // 处理日历日期点击
    var calDay = target.closest('[data-action="onDateClick"]');
    if (calDay) { var date = calDay.getAttribute('data-date'); if (date) onDateClick(date); return; }

    // 处理通用动作按钮
    var actionEl = target.closest('[data-action]');
    if (actionEl) {
      var action = actionEl.getAttribute('data-action');
      if (action === 'calPrev') { calPrev(); return; }
      if (action === 'calNext') { calNext(); return; }
      if (action === 'showAddDialog') { var type = actionEl.getAttribute('data-type'); if (type) showAddDialog(type); return; }
      if (action === 'enterEditMode') { enterEditMode(); return; }
      if (action === 'saveEdit') { saveEdit(); return; }
      if (action === 'cancelEdit') { cancelEdit(); return; }
      if (action === 'importPrayerData') { importPrayerData(); return; }
      if (action === 'importOtherData') { importOtherData(); return; }
      if (action === 'exportPrayerData') { exportPrayerData(); return; }
      if (action === 'exportOtherData') { exportOtherData(); return; }
      if (action === 'updatePrayerData') { updatePrayerData(); return; }
      if (action === 'clearAllData') { clearAllData(); return; }
      if (action === 'doImportPrayer') { doImportPrayer(); return; }
      if (action === 'doImportOther') { doImportOther(); return; }
      if (action === 'closeModal') { var modalId = actionEl.getAttribute('data-modal-id'); if (modalId) closeModal(modalId); return; }
    }
  });

  /* ========== 初始化 ========== */
  document.addEventListener('DOMContentLoaded', function(){
    initCalendar();
    renderMassList();
    renderFuneralList();
    renderBlessingList();
    initSwipe(); // 初始化滑动切换
    initCalendarSwipe(); // 初始化日历滑动切换月份
    applyFontSize(); // 应用字体大小
    // 字体滑动条事件
    var slider = document.getElementById('font-size-slider');
    if (slider) {
      slider.addEventListener('input', function() {
        window.setFontSize(this.value);
      });
    }

    // 双指捏合缩放字体
    (function(){
      var pinchState = { active: false, startDist: 0, startSize: 15 };
      function getDist(touches) {
        var dx = touches[0].clientX - touches[1].clientX;
        var dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx*dx + dy*dy);
      }
      document.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
          pinchState.active = true;
          pinchState.startDist = getDist(e.touches);
          pinchState.startSize = getFontSize();
        }
      }, { passive: true });
      document.addEventListener('touchmove', function(e) {
        if (!pinchState.active || e.touches.length !== 2) return;
        var dist = getDist(e.touches);
        var scale = dist / pinchState.startDist;
        var newSize = Math.round(pinchState.startSize * scale);
        if (newSize < 12) newSize = 12;
        if (newSize > 28) newSize = 28;
        window.setFontSize(newSize);
      }, { passive: true });
      document.addEventListener('touchend', function(e) {
        if (e.touches.length < 2) pinchState.active = false;
      }, { passive: true });
    })();

    var confirmBtn = document.getElementById('modal-add-confirm');
    if (confirmBtn) { confirmBtn.onclick = function(){ doAddItem(); }; }
    console.log('普世同祷 App v1.2 初始化完成');
  });

  /* ========== 全局暴露（供WebView接口调用）========== */
  window.appData = appData;
  window.saveData = saveData;
  window.switchPage = switchPage;
  window.loadData = loadData;

  /* 接收 Java 推送的数据（解决 WebView 中 window.Android 不可用的时序问题）*/
  window.receiveDataFromAndroid = function(data) {
    try {
      if (data && typeof data === 'object') {
        appData = data;
        // 重新渲染各列表
        if (typeof renderMassList === 'function') renderMassList();
        if (typeof renderFuneralList === 'function') renderFuneralList();
        if (typeof renderBlessingList === 'function') renderBlessingList();
        console.log('[DEBUG] receiveDataFromAndroid: 数据已接收，appData 已更新');
      } else {
        console.log('[DEBUG] receiveDataFromAndroid: data 为空或格式错误');
      }
    } catch(e) {
      console.log('[DEBUG] receiveDataFromAndroid: 错误', e);
    }
  };

})();
