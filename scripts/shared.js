// Night mode
if (localStorage.getItem('night') === 'true') document.body.classList.add('night');

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
  var offsetX, offsetY, startX, startY;
  el.addEventListener('mousedown', function(e) {
    if (e.target.closest('.gallery-body,.music-body,.gallery-grid')) return;
    startX = e.clientX; startY = e.clientY;
    var rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
  function onMove(e) {
    if (Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3) {
      el.style.left = (e.clientX - offsetX) + 'px';
      el.style.top = (e.clientY - offsetY) + 'px';
      el.style.right = 'auto';
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

document.addEventListener('click', function(e) {
  if (e.target.closest('.music-widget, .gallery-widget, .clock-widget, .img-widget, .text-widget, .color-widget, .lightbox, .navBar-new, .mosaic, .accent-strip, .site-footer, .archive-widget, .work-filters, model-viewer, a, button, input, img, .win-dot, .feed-post, .feed-readmore, .filter-bubble, .about-photo-widget')) return;
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
