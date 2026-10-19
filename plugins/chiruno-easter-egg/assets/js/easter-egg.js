/**
 * 琪露诺彩蛋主题 - 增强版（解决重启后失效）
 * 功能：首页空白点击生成琪露诺图片并播放音效
 * 支持 plugin-manager 生命周期管理
 */
(function () {
    'use strict';

    // ===== 路径缓存（解决重新加载后脚本找不到自身） =====
    var SCRIPT_SRC = (function() {
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].src && scripts[i].src.indexOf('easter-egg.js') !== -1) {
                return scripts[i].src;
            }
        }
        return '';
    })();

    function scriptDir() {
        var idx = SCRIPT_SRC.lastIndexOf('/');
        return idx === -1 ? '' : SCRIPT_SRC.substring(0, idx + 1);
    }

    function assetUrl(relative) {
        return scriptDir() + relative;
    }

    // ===== 配置 =====
    var IMAGE_PATH = '../images/Chiruno.png';
    var CSS_PATH   = '../css/easter-egg.css';
    var AUDIO_PATH = '../audio/Chiruno-Baka.mp3';

    // 备选资源（当本地资源 404 时使用）
    var FALLBACK_IMAGE = 'https://i.pravatar.cc/150?img=5';  // 可替换为任何稳定图片
    var FALLBACK_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // 示例音效

    var DURATION_MS = 3000;
    var MIN_FALL_PX = 120;
    var MAX_EGGS    = 20;

    // [Hexo 主题兼容] 支持子目录部署（如 GitHub Pages 项目站点 /just-as-an-IT/）：
    // 主题在 <html data-site-root="..."> 上提供 config.root，这里把它也视作首页。
    var SITE_ROOT = (function () {
        var root = (document.documentElement && document.documentElement.getAttribute('data-site-root')) || '/';
        if (root.charAt(0) !== '/') root = '/' + root;
        if (root.charAt(root.length - 1) !== '/') root = root + '/';
        return root;
    })();

    var HOMEPAGE_PATHS = ['/', '/index.html', '', SITE_ROOT, SITE_ROOT + 'index.html', SITE_ROOT.replace(/\/$/, '')];
    var INTERACTIVE_TAGS = [
        'a', 'button', 'input', 'select', 'textarea', 'label',
        'option', 'summary', 'audio', 'video', 'embed', 'object',
        'iframe', 'canvas'
    ];
    var INTERACTIVE_ROLES = [
        'button', 'link', 'menuitem', 'tab', 'checkbox',
        'radio', 'switch', 'textbox', 'combobox', 'slider'
    ];

    // ===== 工具函数 =====
    function isHomepage() {
        var path = location.pathname;
        for (var i = 0; i < HOMEPAGE_PATHS.length; i++) {
            if (path === HOMEPAGE_PATHS[i]) return true;
        }
        return false;
    }

    function ensureCss() {
        // 如果已有样式，不再重复注入
        if (document.querySelector('link[href*="easter-egg.css"]')) return;
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = assetUrl(CSS_PATH);
        link.onerror = function() {
            // CSS 加载失败时，使用内联样式兜底（可选）
            console.warn('[chiruno] CSS 加载失败，使用默认样式（无动画）');
        };
        document.head.appendChild(link);
    }

    function isInteractive(el) {
        if (!el || el.nodeType !== 1) return false;
        var tag = el.tagName.toLowerCase();
        if (INTERACTIVE_TAGS.indexOf(tag) !== -1) return true;
        if (el.isContentEditable) return true;
        var role = el.getAttribute && (el.getAttribute('role') || '').toLowerCase();
        if (role && INTERACTIVE_ROLES.indexOf(role) !== -1) return true;
        if (el.closest) {
            var sel = INTERACTIVE_TAGS.join(',') + ',[contenteditable="true"],[role="button"],[role="link"]';
            return !!el.closest(sel);
        }
        return false;
    }

    // ===== 彩蛋生成 =====
    function spawnEgg(x, y) {
        var img = document.createElement('img');
        img.className = 'chiruno-egg';
        img.alt = '琪露诺';
        img.draggable = false;
        img.style.left = x + 'px';
        img.style.top = y + 'px';
        var fall = Math.max(MIN_FALL_PX, window.innerHeight - y - 40);
        img.style.setProperty('--chiruno-fall-distance', fall + 'px');
        img.style.setProperty('--chiruno-egg-duration', (DURATION_MS / 1000) + 's');

        // 尝试加载本地图片，失败则用备选
        img.src = assetUrl(IMAGE_PATH);
        img.onerror = function() {
            this.src = FALLBACK_IMAGE;
        };

        document.body.appendChild(img);

        var eggs = document.querySelectorAll('.chiruno-egg');
        while (eggs.length > MAX_EGGS) {
            if (eggs[0] && eggs[0].parentNode) eggs[0].parentNode.removeChild(eggs[0]);
            eggs = document.querySelectorAll('.chiruno-egg');
        }

        img.addEventListener('animationend', function () {
            removeEgg(img);
        });
        setTimeout(function () {
            removeEgg(img);
        }, DURATION_MS + 500);

        playBaka();
    }

    function removeEgg(el) {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    var audio = null;
    function playBaka() {
        try {
            audio = new Audio(assetUrl(AUDIO_PATH));
            audio.type = 'audio/mpeg';
            audio.preload = 'auto';
            // 如果本地音频加载失败，改用备选
            audio.addEventListener('error', function() {
                console.warn('[chiruno] 本地音频加载失败，使用备选音效');
                audio.src = FALLBACK_AUDIO;
                audio.play().catch(function(e) {});
            });
            audio.currentTime = 0;
            var p = audio.play();
            if (p && typeof p.catch === 'function') {
                p.catch(function (err) {
                    console.warn('[chiruno] 音频播放被拒绝:', err && err.message);
                });
            }
        } catch (e) { /* 静默 */ }
    }

    // ===== 事件处理 =====
    function onClick(e) {
        if (!isHomepage()) return;
        var target = e.target;
        if (target && target.nodeType === 3) target = target.parentNode;
        if (e.button !== undefined && e.button !== 0) return;
        if (isInteractive(target)) return;
        if (window.getSelection && window.getSelection().toString()) return;
        spawnEgg(e.clientX, e.clientY);
    }

    // ===== 生命周期管理 =====
    var isInitialized = false;
    var isDestroyed = false;

    var api = {
        init: function() {
            if (isInitialized && !isDestroyed) return;
            // 移除旧监听（避免重复绑定）
            document.removeEventListener('click', onClick, true);
            document.addEventListener('click', onClick, true);
            ensureCss();
            isInitialized = true;
            isDestroyed = false;
            console.info('[chiruno] 已初始化，图片 URL:', assetUrl(IMAGE_PATH));
        },
        destroy: function() {
            document.removeEventListener('click', onClick, true);
            if (audio) {
                audio.pause();
                audio.src = '';
                audio = null;
            }
            document.querySelectorAll('.chiruno-egg').forEach(function(el) {
                if (el.parentNode) el.remove();
            });
            // 移除 CSS 链接（可选）
            var cssLink = document.querySelector('link[href*="easter-egg.css"]');
            if (cssLink) cssLink.remove();
            isDestroyed = true;
            console.info('[chiruno] 已销毁');
        },
        isActive: function() {
            return isInitialized && !isDestroyed;
        }
    };
    window.__chiruno = api;

    // ===== 自动初始化 =====
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        api.init();
    } else {
        document.addEventListener('DOMContentLoaded', function() { api.init(); });
    }
})();