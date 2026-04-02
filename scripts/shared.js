// Night mode
if (localStorage.getItem('night') === 'true') document.body.classList.add('night');

// Bring widget to front on click
var _topWidgetZ = 100000;
document.addEventListener('mousedown', function(e) {
  var widget = e.target.closest('.music-widget, .gallery-widget, .clock-widget, .img-widget, .text-widget, .color-widget, .paint-widget, .archive-widget, .lightbox, .about-photo-widget, .canvas-paint-panel, .canvas-audio-widget');
  if (widget) {
    _topWidgetZ++;
    widget.style.zIndex = _topWidgetZ;
  }
});

// Universal window controls — close, minimize, center
document.addEventListener('click', function(e) {
  var dot = e.target.closest('.win-dot');
  if (!dot) return;
  var widget = dot.closest('.music-widget, .gallery-widget, .clock-widget, .img-widget, .text-widget, .color-widget, .paint-widget, .archive-widget, .lightbox, .about-photo-widget, .canvas-paint-panel, .canvas-audio-widget, [id$="Widget"], [id$="widget"]') || dot.closest('[style*="border-radius:12px"]') || dot.closest('.win-titlebar').parentElement;
  if (!widget) return;

  if (dot.classList.contains('win-close')) {
    widget.style.display = 'none';
    if (widget._dragPlaceholder) widget._dragPlaceholder.style.display = 'none';
  } else if (dot.classList.contains('win-min')) {
    widget.classList.toggle('minimized');
  } else if (dot.classList.contains('win-max')) {
    var w = widget.offsetWidth || 300;
    var h = widget.offsetHeight || 200;
    widget.style.position = 'fixed';
    widget.style.left = (window.innerWidth / 2 - w / 2) + 'px';
    widget.style.top = (window.innerHeight / 2 - h / 2) + 'px';
    widget.style.right = 'auto';
    widget.style.bottom = 'auto';
    widget.style.zIndex = '99999';
    widget.style.margin = '0';
  }
});

// Ghost cursor trail
(function(){
  var trail = [];
  var max = 6;
  for (var i = 0; i < max; i++) {
    var dot = document.createElement('div');
    dot.style.cssText = 'position:fixed;pointer-events:none;z-index:99998;width:6px;height:6px;border-radius:50%;background:var(--accent,#97c3a0);opacity:0;';
    document.body.appendChild(dot);
    trail.push({el: dot, x: 0, y: 0});
  }
  var mx = 0, my = 0;
  document.addEventListener('mousemove', function(e) { mx = e.clientX; my = e.clientY; });
  function tick() {
    trail[0].x = mx; trail[0].y = my;
    for (var i = 1; i < max; i++) {
      trail[i].x += (trail[i-1].x - trail[i].x) * 0.4;
      trail[i].y += (trail[i-1].y - trail[i].y) * 0.4;
    }
    for (var i = 0; i < max; i++) {
      var d = trail[i];
      var s = 1 - i / max;
      d.el.style.left = d.x - 3 + 'px';
      d.el.style.top = d.y - 3 + 'px';
      d.el.style.opacity = s * 0.4;
      d.el.style.transform = 'scale(' + s + ')';
    }
    requestAnimationFrame(tick);
  }
  tick();
})();

// Marquee click → journal
var marqueeStrip = document.querySelector('.accent-strip');
if (marqueeStrip) marqueeStrip.addEventListener('click', function() { window.location.href = 'journal.html'; });

// Dropdown direction — pop up if dropdown would overflow viewport bottom
(function() {
  var nav = document.querySelector('.navBar-new');
  var dropdown = nav ? nav.querySelector('.nav-dropdown') : null;
  if (!nav || !dropdown) return;

  // Measure dropdown height once by briefly making it visible offscreen
  var dropHeight = 200;
  dropdown.style.visibility = 'hidden';
  dropdown.style.opacity = '0';
  dropdown.style.display = 'flex';
  dropdown.style.position = 'absolute';
  dropdown.style.left = '-9999px';
  dropHeight = dropdown.offsetHeight || 200;
  dropdown.style.left = '';
  dropdown.style.display = '';
  dropdown.style.visibility = '';
  dropdown.style.opacity = '';

  function checkDropDir() {
    var navRect = nav.getBoundingClientRect();
    var spaceBelow = window.innerHeight - navRect.bottom;
    var spaceAbove = navRect.top;
    nav.classList.toggle('drop-up', spaceBelow < dropHeight + 30 && spaceAbove > dropHeight + 30);
  }
  window.addEventListener('scroll', checkDropDir);
  window.addEventListener('resize', checkDropDir);
  checkDropDir();
})();

// Clock
function updateClock() {
  var now = new Date();
  var h = now.getHours();
  var ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  var m = now.getMinutes().toString().padStart(2, '0');
  var s = now.getSeconds().toString().padStart(2, '0');
  var el = document.getElementById('clockDisplay');
  if (el) el.textContent = h + ':' + m + ':' + s + ' ' + ampm;
}
updateClock();
setInterval(updateClock, 1000);

// Draggable
function makeDraggable(el) {
  if (!el) return;
  var offsetX, offsetY, startX, startY, dragging = false;
  el.addEventListener('mousedown', function(e) {
    if (e.target.closest('.gallery-body,.music-body,.gallery-grid,iframe,input,select,textarea,button')) return;
    startX = e.clientX; startY = e.clientY;
    var rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    dragging = false;
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
  function onMove(e) {
    if (Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3) {
      if (!dragging) {
        dragging = true;
        var pos = getComputedStyle(el).position;
        if (pos === 'static' || pos === 'relative') {
          var rect = el.getBoundingClientRect();
          var placeholder = document.createElement('div');
          placeholder.style.width = rect.width + 'px';
          placeholder.style.height = rect.height + 'px';
          placeholder.style.visibility = 'hidden';
          el.parentNode.insertBefore(placeholder, el);
          el._dragPlaceholder = placeholder;
          el.style.position = 'absolute';
          el.style.width = rect.width + 'px';
          el.style.zIndex = '99999';
          el.style.margin = '0';
          el._wasStatic = true;
        }
      }
      if (el._wasStatic) {
        el.style.left = (e.pageX - offsetX) + 'px';
        el.style.top = (e.pageY - offsetY) + 'px';
      } else {
        el.style.left = (e.clientX - offsetX) + 'px';
        el.style.top = (e.clientY - offsetY) + 'px';
      }
      el.style.right = 'auto';
      el.style.bottom = 'auto';
    }
  }
  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  }
}

// Analogous color
function complementOf(hex) {
  var r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  var max = Math.max(r,g,b), min = Math.min(r,g,b);
  var h, s, l = (max+min)/2;
  if (max === min) { h = s = 0; } else {
    var d = max-min; s = l>0.5 ? d/(2-max-min) : d/(max+min);
    if (max===r) h=((g-b)/d+(g<b?6:0))/6; else if (max===g) h=((b-r)/d+2)/6; else h=((r-g)/d+4)/6;
  }
  h = (h+0.083)%1;
  function hue2rgb(p,q,t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;}
  var rr,gg,bb;
  if(s===0){rr=gg=bb=l;}else{var q2=l<0.5?l*(1+s):l+s-l*s;var p2=2*l-q2;rr=hue2rgb(p2,q2,h+1/3);gg=hue2rgb(p2,q2,h);bb=hue2rgb(p2,q2,h-1/3);}
  return '#'+[rr,gg,bb].map(function(x){return Math.round(x*255).toString(16).padStart(2,'0');}).join('');
}

// Accent color system
function applyAccent(color) {
  var swatch = document.getElementById('colorSwatch');
  if (swatch) swatch.style.backgroundColor = color;
  document.documentElement.style.setProperty('--accent', color);

  var comp = complementOf(color);
  document.documentElement.style.setProperty('--complement', comp);

  var r = parseInt(color.slice(1,3),16), g = parseInt(color.slice(3,5),16), b = parseInt(color.slice(5,7),16);
  var lum = (r*299 + g*587 + b*114) / 1000;
  var textColor = lum < 128 ? '#ffffff' : '#1a1a1a';

  var cr = parseInt(comp.slice(1,3),16), cg = parseInt(comp.slice(3,5),16), cb = parseInt(comp.slice(5,7),16);
  var compLum = (cr*299 + cg*587 + cb*114) / 1000;
  var compText = compLum < 128 ? '#ffffff' : '#1a1a1a';
  document.documentElement.style.setProperty('--complement-text', compText);

  document.querySelectorAll('.music-controls, .gallery-header, .lightbox-header, .highlight').forEach(function(el) { el.style.backgroundColor = color; el.style.color = textColor; });
  document.querySelectorAll('.mc-btn, .gallery-label, .gallery-viewall, .gallery-icon, .gallery-count').forEach(function(el) { el.style.color = textColor; });
  document.querySelectorAll('.active').forEach(function(el) { el.style.backgroundColor = color + '40'; });
  document.querySelectorAll('.nav-contact').forEach(function(el) { el.style.backgroundColor = comp; el.style.color = compText; });

  var strip = document.querySelector('.accent-strip');
  if (strip) { strip.style.backgroundColor = color; strip.querySelector('.accent-marquee').style.color = textColor; }

  var footer = document.querySelector('.site-footer');
  if (footer) { footer.style.backgroundColor = color; footer.querySelectorAll('.footer-brand, .footer-copy, .footer-links a').forEach(function(el) { el.style.color = textColor; }); }

  document.documentElement.style.setProperty('--accent-text', textColor);
}

// Init accent picker
(function() {
  var picker = document.getElementById('accentPicker');
  var saved = localStorage.getItem('accent');
  if (saved && picker) { applyAccent(saved); picker.value = saved; }
  if (picker) {
    picker.addEventListener('input', function(e) { applyAccent(e.target.value); localStorage.setItem('accent', e.target.value); });
    picker.addEventListener('change', function(e) { applyAccent(e.target.value); localStorage.setItem('accent', e.target.value); });
  }
})();

// Sun counter + last updated
var sunCount = 0;
var sunCounter = document.createElement('div');
sunCounter.textContent = 'suns: 0';
sunCounter.style.cssText = 'position:absolute;top:32px;left:12px;z-index:10000;font-size:12px;font-family:monospace;color:var(--accent, #97c3a0);pointer-events:none;';
document.body.appendChild(sunCounter);

var lastUpdated = document.createElement('div');
lastUpdated.textContent = 'last updated: 04.01.2026';
lastUpdated.style.cssText = 'position:absolute;top:32px;right:12px;z-index:10000;font-size:12px;font-family:monospace;color:var(--accent, #97c3a0);pointer-events:none;';
document.body.appendChild(lastUpdated);

document.addEventListener('dblclick', function(e) {
  var pc = document.getElementById('paintCanvas');
  if (pc && pc.classList.contains('active')) return;
  if (e.target.closest('.music-widget, .gallery-widget, .clock-widget, .img-widget, .text-widget, .color-widget, .paint-widget, .lightbox, .navBar-new, .mosaic, .accent-strip, .site-footer, .archive-widget, .work-filters, .search-widget, .back-to-top, .mobile-sun-logo, #widgetSummoner, #summonerBtn, #summonerMenu, model-viewer, a, button, input, select, textarea, label, img, .win-dot, .feed-post, .feed-readmore, .filter-bubble, .about-photo-widget, #paintCanvas')) return;
  var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#97c3a0';
  var sun = document.createElement('div');
  sun.style.cssText = 'position:fixed;width:88px;height:88px;pointer-events:none;z-index:9999;left:' + (e.clientX - 29) + 'px;top:' + (e.clientY - 29) + 'px;background-color:' + accent + ';-webkit-mask:url(/assets/sun.png) center/contain no-repeat;mask:url(/assets/sun.png) center/contain no-repeat;filter:drop-shadow(0 0 2px #000) drop-shadow(0 0 1px #fff);';
  document.body.appendChild(sun);
  sunCount++;
  sunCounter.textContent = 'suns: ' + sunCount;
});

// Highlight text on page
function highlightText(query) {
  clearHighlights();
  if (!query || query.length < 2) return 0;
  var body = document.body;
  var walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
    acceptNode: function(node) {
      var parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      var tag = parent.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'IFRAME' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
      if (parent.closest('.accent-strip, .accent-marquee, .search-widget, .search-results')) return NodeFilter.FILTER_REJECT;
      if (node.textContent.toLowerCase().indexOf(query) === -1) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  var nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  var count = 0;
  nodes.forEach(function(textNode) {
    var text = textNode.textContent;
    var lower = text.toLowerCase();
    var idx = lower.indexOf(query);
    if (idx === -1) return;
    var frag = document.createDocumentFragment();
    var lastIdx = 0;
    while (idx !== -1) {
      frag.appendChild(document.createTextNode(text.slice(lastIdx, idx)));
      var mark = document.createElement('mark');
      mark.className = 'search-highlight';
      mark.textContent = text.slice(idx, idx + query.length);
      frag.appendChild(mark);
      lastIdx = idx + query.length;
      count++;
      idx = lower.indexOf(query, lastIdx);
    }
    frag.appendChild(document.createTextNode(text.slice(lastIdx)));
    textNode.parentNode.replaceChild(frag, textNode);
  });
  return count;
}

function clearHighlights() {
  document.querySelectorAll('mark.search-highlight').forEach(function(mark) {
    var parent = mark.parentNode;
    parent.replaceChild(document.createTextNode(mark.textContent), mark);
    parent.normalize();
  });
}

function scrollToFirstHighlight() {
  var first = document.querySelector('mark.search-highlight');
  if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// On page load: check for ?q= param and highlight
(function() {
  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (q) {
    q = q.toLowerCase().trim();
    // Wait for dynamic content to load
    setTimeout(function() {
      var count = highlightText(q);
      if (count > 0) scrollToFirstHighlight();
      var input = document.getElementById('siteSearch');
      if (input) input.value = q;
    }, 500);
  }
})();

// Site search
(function() {
  var pages = [
    {url:'index.html', name:'home'},
    {url:'work.html', name:'work'},
    {url:'art.html', name:'art'},
    {url:'info.html', name:'info'},
    {url:'contact.html', name:'contact'},
    {url:'journal.html', name:'journal'},
    {url:'slash.html', name:'slash'}
  ];
  var indexed = false;
  var input = document.getElementById('siteSearch');
  var results = document.getElementById('searchResults');
  if (!input || !results) return;

  function indexPages() {
    if (indexed) return Promise.resolve();
    indexed = true;
    var tasks = pages.map(function(p) {
      return fetch(p.url).then(function(r) { return r.text(); }).then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('script,style,nav,footer,svg,.accent-strip,.accent-marquee').forEach(function(el) { el.remove(); });
        p.text = doc.body.textContent.replace(/\s+/g, ' ').toLowerCase();
      }).catch(function() { p.text = ''; });
    });
    tasks.push(fetch('journal.json').then(function(r) { return r.json(); }).then(function(data) {
      var journal = pages.find(function(p) { return p.url === 'journal.html'; });
      if (journal && data.entries) {
        var blogText = data.entries.map(function(e) {
          var parts = [e.date || '', e.body || ''];
          if (e.songs) e.songs.forEach(function(s) { parts.push(s.title || '', s.artist || ''); });
          return parts.join(' ');
        }).join(' ');
        journal.text = (journal.text || '') + ' ' + blogText.replace(/\s+/g, ' ').toLowerCase();
      }
    }).catch(function() {}));
    return Promise.all(tasks);
  }

  // Check if query matches current page
  function currentPageUrl() {
    var path = window.location.pathname;
    var file = path.split('/').pop() || 'index.html';
    return file;
  }

  function doSearch(q) {
    results.innerHTML = '';
    clearHighlights();
    if (!q) { results.classList.remove('open'); return; }

    // Highlight on current page first
    var localCount = highlightText(q);
    if (localCount > 0) {
      var thisPage = document.createElement('a');
      thisPage.href = '#';
      thisPage.innerHTML = '<strong>this page</strong> <small style="opacity:0.6">(' + localCount + ' match' + (localCount > 1 ? 'es' : '') + ')</small>';
      thisPage.addEventListener('click', function(e) {
        e.preventDefault();
        scrollToFirstHighlight();
        results.classList.remove('open');
      });
      results.appendChild(thisPage);
    }

    // Search other pages
    var found = localCount > 0;
    var curUrl = currentPageUrl();
    pages.forEach(function(p) {
      if (p.url === curUrl) return;
      var nameMatch = p.name.includes(q);
      var idx = p.text ? p.text.indexOf(q) : -1;
      if (!nameMatch && idx === -1) return;
      found = true;
      var a = document.createElement('a');
      a.href = p.url + '?q=' + encodeURIComponent(q);
      if (idx !== -1) {
        var start = Math.max(0, idx - 20);
        var end = Math.min(p.text.length, idx + q.length + 30);
        var snippet = (start > 0 ? '...' : '') + p.text.slice(start, end).trim() + (end < p.text.length ? '...' : '');
        a.innerHTML = '<strong>' + p.name + '</strong><br><small style="opacity:0.6">' + snippet + '</small>';
      } else {
        a.textContent = p.name;
      }
      results.appendChild(a);
    });
    results.classList.toggle('open', found);
  }

  var debounce;
  input.addEventListener('focus', function() { indexPages(); });
  input.addEventListener('input', function() {
    var q = this.value.toLowerCase().trim();
    clearTimeout(debounce);
    debounce = setTimeout(function() {
      indexPages().then(function() { doSearch(q); });
    }, 150);
  });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      var first = results.querySelector('a');
      if (first) {
        if (first.href.indexOf('#') !== -1 || first.href.indexOf(currentPageUrl()) !== -1) {
          scrollToFirstHighlight();
          results.classList.remove('open');
        } else {
          window.location.href = first.href;
        }
        e.preventDefault();
      }
    }
    if (e.key === 'Escape') {
      clearHighlights();
      input.value = '';
      results.classList.remove('open');
    }
  });
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-widget')) results.classList.remove('open');
  });
})();

// Flipbook wiggle for paint canvas
function initFlipbook(canvas) {
  if (!canvas || canvas._flipbookInit) return;
  canvas._flipbookInit = true;
  var ghost = document.getElementById('paintGhost');
  if (!ghost) {
    ghost = document.createElement('canvas');
    ghost.id = 'paintGhost';
    canvas.parentNode.insertBefore(ghost, canvas.nextSibling);
  }
  var gctx = ghost.getContext('2d');
  setInterval(function() {
    if (!canvas.width || !canvas.height) return;
    if (ghost.width !== canvas.width || ghost.height !== canvas.height) {
      ghost.width = canvas.width; ghost.height = canvas.height;
    }
    gctx.clearRect(0, 0, ghost.width, ghost.height);
    var strips = 80;
    var stripH = Math.ceil(ghost.height / strips);
    var seed = Math.random() * 1000;
    for (var i = 0; i < strips; i++) {
      var y = i * stripH;
      var sx = 1 + Math.sin(i * 7.3 + seed) * 0.002;
      gctx.save();
      gctx.setTransform(sx, 0, 0, 1, 0, 0);
      gctx.drawImage(canvas, 0, y, canvas.width, stripH, 0, y, canvas.width, stripH);
      gctx.restore();
    }
    canvas.style.opacity = '0';
    ghost.style.opacity = '1';
  }, 100);
}

// Auto-init flipbook if paint canvas exists on page load
(function() {
  var c = document.getElementById('paintCanvas');
  if (c) setTimeout(function() { initFlipbook(c); }, 500);
})();

// Universal lightbox for spawned widgets
(function() {
  if (document.getElementById('sharedLightbox')) return;
  var lb = document.createElement('div');
  lb.id = 'sharedLightbox';
  lb.className = 'lightbox';
  lb.innerHTML = '<div class="win-titlebar"><span class="win-title">salvi.world/photos</span><div class="win-dots"><span class="win-dot win-close" onclick="document.getElementById(\'sharedLightbox\').classList.remove(\'active\')">✕</span><span class="win-dot win-min">−</span><span class="win-dot win-max">□</span></div></div><div class="lightbox-body"><span class="lb-arrow lb-prev" onclick="sharedLbNav(-1)">‹</span><img src="" alt=""><span class="lb-arrow lb-next" onclick="sharedLbNav(1)">›</span></div>';
  document.body.appendChild(lb);

  var sharedLbImgs = [], sharedLbIdx = 0;
  window.sharedLbNav = function(dir) {
    sharedLbIdx = (sharedLbIdx + dir + sharedLbImgs.length) % sharedLbImgs.length;
    lb.querySelector('.lightbox-body img').src = sharedLbImgs[sharedLbIdx];
  };
  window.openSharedLightbox = function(imgs, idx) {
    sharedLbImgs = imgs;
    sharedLbIdx = idx || 0;
    lb.querySelector('.lightbox-body img').src = sharedLbImgs[sharedLbIdx];
    lb.classList.add('active');
  };
  document.addEventListener('keydown', function(e) {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') sharedLbNav(-1);
    if (e.key === 'ArrowRight') sharedLbNav(1);
    if (e.key === 'Escape') lb.classList.remove('active');
  });
  // Click on any gallery-grid img that's inside a spawned widget
  document.addEventListener('click', function(e) {
    var img = e.target;
    if (img.tagName !== 'IMG') return;
    var grid = img.closest('.gallery-grid');
    if (!grid) return;
    var imgs = Array.from(grid.querySelectorAll('img'));
    var srcs = imgs.map(function(i) { return i.src; });
    var idx = imgs.indexOf(img);
    openSharedLightbox(srcs, idx);
  });
})();

// Widget summoner — + button at bottom center
(function() {
  var widgets = [
    { name: 'music player', icon: '🎵', html: '<div class="music-widget" style="position:fixed;left:15%;top:25%;z-index:99999;display:block;width:260px;"><div class="win-titlebar"><span class="win-title">salvi.world/audio</span><div class="win-dots"><span class="win-dot win-close" onclick="this.closest(\'.music-widget\').remove()">✕</span><span class="win-dot win-min" onclick="this.closest(\'.music-widget\').classList.toggle(\'minimized\')">−</span><span class="win-dot win-max">□</span></div></div><div class="music-header" onclick="this.closest(\'.music-widget\').classList.toggle(\'open\')"><div class="music-info"><span class="music-dot"></span><span class="music-title"><span class="music-marquee">now playing -- liquiid radio --</span></span></div><div class="music-controls"><span class="mc-btn">⏮</span><span class="mc-btn">▶</span><span class="mc-btn">⏭</span></div></div><div class="music-body"><iframe style="border-radius:12px" src="https://open.spotify.com/embed/playlist/0zM4GAv9I4pJJqM5NfUw3C?utm_source=generator&theme=0" width="100%" height="352" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></div></div>' },
    { name: 'photo gallery', icon: '📸', html: '<div class="gallery-widget" style="position:fixed;right:10%;top:20%;z-index:99999;display:block;width:270px;"><div class="win-titlebar"><span class="win-title">salvi.world/photos</span><div class="win-dots"><span class="win-dot win-close" onclick="this.closest(\'.gallery-widget\').remove()">✕</span><span class="win-dot win-min" onclick="this.closest(\'.gallery-widget\').classList.toggle(\'minimized\')">−</span><span class="win-dot win-max">□</span></div></div><div class="gallery-header" onclick="this.closest(\'.gallery-widget\').classList.toggle(\'open\')"><div class="gallery-preview"><img src="/foto work/IMG_0209.JPG" alt=""><img src="/foto work/IMG_0255.JPG" alt=""><img src="/foto work/IMG_2196.PNG" alt=""></div><span class="gallery-label">photos</span><span class="gallery-viewall">view all +</span></div><div class="gallery-body"><div class="gallery-grid" style="max-height:250px;overflow-y:auto;"><img loading="lazy" src="/foto work/IMG_01.jpg" alt=""><img loading="lazy" src="/foto work/IMG_0202.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0207.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0208.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0209.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0210.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0211.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0212.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0213.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0214.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0215.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0216.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0217.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0218.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0219.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0220.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0221.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0222.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0223.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0224.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0225.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0226.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0227.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0228.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0229.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0230.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0231.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0232.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0233.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0234.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0235.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0236.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0237.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0239.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0240.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0241.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0242.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0243.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0244.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0245.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0246.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0247.jpg" alt=""><img loading="lazy" src="/foto work/IMG_0248.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0249.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0250.jpg" alt=""><img loading="lazy" src="/foto work/IMG_0253.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0254.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0255.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0256.JPG" alt=""><img loading="lazy" src="/foto work/IMG_0495.JPG" alt=""><img loading="lazy" src="/foto work/IMG_2196.PNG" alt=""><img loading="lazy" src="/foto work/IMG_294.jpg" alt=""><img loading="lazy" src="/foto work/IMG_4198.jpg" alt=""><img loading="lazy" src="/foto work/IMG_5565_SnapseedCopy.jpg" alt=""><img loading="lazy" src="/foto work/IMG_5565_SnapseedCopy_SnapseedCopy.jpg" alt=""><img loading="lazy" src="/foto work/IMG_9633_SnapseedCopy.jpg" alt=""></div></div></div>' },
    { name: 'drawing', icon: '🖍️', action: function() {
      var pw = document.getElementById('paintWidget');
      if (pw) { pw.style.display = ''; var tog = document.getElementById('paintToggle'); if (tog && !tog.classList.contains('active')) tog.click(); return; }
      // Spawn paint widget + canvas on pages that don't have it
      var widget = document.createElement('div');
      widget.className = 'paint-widget';
      widget.id = 'paintWidget';
      widget.innerHTML = '<button id="paintToggle" class="active">🖍️</button><button id="paintEraser">🧽</button><input type="color" id="paintColor" value="#97c3a0" class="paint-color-input"><button id="paintExit" class="paint-exit">✕</button><button id="paintClear">🗑️</button>';
      document.body.appendChild(widget);
      var canvas = document.createElement('canvas');
      canvas.id = 'paintCanvas';
      canvas.className = 'active';
      document.body.appendChild(canvas);
      // Init paint
      var c = canvas, ctx = c.getContext('2d');
      c.width = window.innerWidth; c.height = window.innerHeight;
      var on = true, dr = false, er = false, lx, ly, bSize = 8, eSize = 46;
      var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#97c3a0';
      var color = accent;
      document.getElementById('paintToggle').addEventListener('click', function() { on = !on; this.classList.toggle('active', on); this.textContent = on ? '✋' : '🖍️'; });
      document.getElementById('paintColor').addEventListener('input', function() { color = this.value; er = false; document.getElementById('paintEraser').classList.remove('active'); });
      document.getElementById('paintEraser').addEventListener('click', function() { er = !er; this.classList.toggle('active', er); });
      document.getElementById('paintClear').addEventListener('click', function() { ctx.clearRect(0, 0, c.width, c.height); });
      document.getElementById('paintExit').addEventListener('click', function() { on = false; document.getElementById('paintToggle').classList.remove('active'); document.getElementById('paintToggle').textContent = '🖍️'; });
      function draw(x, y) { ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(x, y); ctx.lineWidth = er ? eSize : bSize; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalCompositeOperation = er ? 'destination-out' : 'source-over'; ctx.strokeStyle = er ? 'rgba(0,0,0,1)' : color; ctx.stroke(); lx = x; ly = y; }
      document.addEventListener('mousedown', function(e) { if (!on || e.target.closest('.paint-widget,.navBar-new,.nav-dropdown,.search-widget,.color-widget,.clock-widget,.accent-strip,.site-footer,#widgetSummoner,button,input,select,textarea,iframe')) return; dr = true; lx = e.clientX; ly = e.clientY; });
      document.addEventListener('mousemove', function(e) { if (dr) draw(e.clientX, e.clientY); });
      document.addEventListener('mouseup', function() { dr = false; });
      document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && on) { on = false; document.getElementById('paintToggle').classList.remove('active'); document.getElementById('paintToggle').textContent = '🖍️'; } });
      initFlipbook(canvas);
    } },
    { name: 'clock', icon: '🕐', html: '<div class="clock-widget" style="position:fixed;right:10%;top:30%;z-index:99999;"><span class="clock-display"></span></div>', after: function(el) { var cd = el.querySelector('.clock-display'); function uc() { var n=new Date(),h=n.getHours(),a=h>=12?"PM":"AM"; h=h%12||12; cd.textContent=h+":"+n.getMinutes().toString().padStart(2,"0")+":"+n.getSeconds().toString().padStart(2,"0")+" "+a; } uc(); setInterval(uc,1000); } },
    { name: 'color', icon: '🎨', html: '<div class="color-widget" style="position:fixed;left:10%;top:30%;z-index:99999;display:flex !important;"><div class="color-swatch"><input type="color" class="color-input" value="#97c3a0"></div><label class="color-label">color</label></div>', after: function(el) { var inp=el.querySelector('input[type=color]'); var saved=localStorage.getItem('accent'); if(saved)inp.value=saved; inp.addEventListener('input',function(){applyAccent(this.value);localStorage.setItem('accent',this.value);}); } },
    { name: 'search', icon: '🔍', action: function() { var s = document.getElementById('siteSearch'); if (s) { s.focus(); } } },
    { name: 'night mode', icon: '🌙', action: function(item) { document.body.classList.toggle('night'); localStorage.setItem('night', document.body.classList.contains('night')); item.textContent = document.body.classList.contains('night') ? '☀️' : '🌙'; } },
    { name: 'back to top', icon: '⬆', action: function() { window.scrollTo({top:0,behavior:'smooth'}); } },
    { name: 'slash mode', icon: '/', action: function(item) {
      var key = '_slashOriginals';
      if (document.body[key]) {
        document.body[key].forEach(function(o) { o.node.textContent = o.text; });
        document.body[key] = null;
        document.body.style.fontFamily = '';
        document.body.style.letterSpacing = '';
        item.textContent = '/';
        return;
      }
      var map = {a:'Oo',b:'((',c:'[[',d:'))',e:'(-',f:'(=',g:'O)',h:'][',i:'ii',j:'-i',k:'<<',l:'--',m:'^^',n:'^',o:'\u2299',p:'o_',q:')O',r:'//',s:'(\u22C5)',t:'+',u:'u',v:' \u2216./ ',w:'OO',x:'x',y:'x_',z:')(',' ':'\u00A0\u00A0'};
      var originals = [];
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: function(n) {
          var p = n.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          if (p.closest('script,style,input,textarea,iframe,#widgetSummoner,#summonerMenu,.search-widget,.accent-marquee')) return NodeFilter.FILTER_REJECT;
          if (n.textContent.trim().length === 0) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function(n) {
        originals.push({ node: n, text: n.textContent });
        var out = '', lower = n.textContent.toLowerCase();
        for (var i = 0; i < lower.length; i++) out += map[lower[i]] || lower[i];
        n.textContent = out;
      });
      document.body[key] = originals;
      document.body.style.fontFamily = 'monospace';
      document.body.style.letterSpacing = '0.08em';
      item.textContent = 'abc';
    } }
  ];

  var container = document.createElement('div');
  container.id = 'widgetSummoner';
  container.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:999999;';
  document.body.appendChild(container);

  var btn = document.createElement('div');
  btn.id = 'summonerBtn';
  btn.innerHTML = '+';
  btn.style.cssText = 'width:36px;height:36px;background:white;border:3px solid rgb(210,206,206);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.15);transition:transform 0.2s,background 0.2s;user-select:none;color:#333;margin:0 auto;';
  container.appendChild(btn);

  var menu = document.createElement('div');
  menu.id = 'summonerMenu';
  menu.style.cssText = 'position:absolute;bottom:44px;left:50%;transform:translateX(-50%);background:white;border:3px solid rgb(210,206,206);border-radius:12px;padding:8px;grid-template-columns:repeat(3,1fr);gap:4px;box-shadow:0 4px 20px rgba(0,0,0,0.1);opacity:0;visibility:hidden;transition:opacity 0.25s,visibility 0.25s;display:grid;';
  container.appendChild(menu);

  widgets.forEach(function(w) {
    var item = document.createElement('div');
    item.textContent = w.icon;
    item.title = w.name;
    item.style.cssText = 'padding:6px;font-size:18px;cursor:pointer;border-radius:6px;text-align:center;line-height:1;';
    item.addEventListener('mouseenter', function() { this.style.backgroundColor = '#f0f0f0'; });
    item.addEventListener('mouseleave', function() { this.style.backgroundColor = ''; });
    item.addEventListener('click', function(e) {
      e.stopPropagation();
      if (w.action) { w.action(item); }
      else if (w.html) {
        var div = document.createElement('div');
        div.innerHTML = w.html;
        var el = div.firstChild;
        document.body.appendChild(el);
        if (typeof makeDraggable === 'function') makeDraggable(el);
        if (w.after) w.after(el);
      }
      toggleMenu(false);
    });
    if (w.name === 'night mode' && document.body.classList.contains('night')) item.textContent = '☀️';
    menu.appendChild(item);
  });

  var menuOpen = false;
  function toggleMenu(state) {
    menuOpen = typeof state === 'boolean' ? state : !menuOpen;
    menu.style.opacity = menuOpen ? '1' : '0';
    menu.style.visibility = menuOpen ? 'visible' : 'hidden';
    btn.style.transform = menuOpen ? 'rotate(45deg)' : 'rotate(0deg)';
    btn.style.backgroundColor = menuOpen ? 'var(--accent, #97c3a0)' : 'white';
  }

  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleMenu();
  });
  btn.addEventListener('mouseenter', function() {
    toggleMenu(true);
  });
  var hideTimer;
  container.addEventListener('mouseleave', function() {
    hideTimer = setTimeout(function() { toggleMenu(false); }, 500);
  });
  container.addEventListener('mouseenter', function() {
    clearTimeout(hideTimer);
  });

  document.addEventListener('click', function(e) {
    if (!e.target.closest('#widgetSummoner')) toggleMenu(false);
  });
})();
