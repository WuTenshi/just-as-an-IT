/**
 * 梦幻星空 · 交互脚本
 * 移动端菜单、回到顶部、目录高亮、代码复制。
 */
(function () {
  'use strict';

  /* ---------------- 移动端菜单 ---------------- */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------------- 回到顶部 ---------------- */

  var backTop = document.querySelector('.back-to-top');

  if (backTop) {
    var onScroll = function () {
      backTop.classList.toggle('is-visible', window.scrollY > 480);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------- 目录跟随高亮 ---------------- */

  var tocLinks = Array.prototype.slice.call(
    document.querySelectorAll('.post-toc a[href^="#"]')
  );

  if (tocLinks.length && 'IntersectionObserver' in window) {
    var headingMap = {};

    tocLinks.forEach(function (link) {
      var id = decodeURIComponent(link.getAttribute('href').slice(1));
      var heading = document.getElementById(id);
      if (heading) {
        headingMap[id] = link;
      }
    });

    var current = null;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          var link = headingMap[entry.target.id];
          if (!link || link === current) {
            return;
          }

          if (current) {
            current.classList.remove('is-active');
          }

          link.classList.add('is-active');
          current = link;
        });
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    );

    Object.keys(headingMap).forEach(function (id) {
      var heading = document.getElementById(id);
      if (heading) {
        observer.observe(heading);
      }
    });
  }

  /* ---------------- 代码块复制 ---------------- */

  var blocks = Array.prototype.slice.call(
    document.querySelectorAll('.article-content figure.highlight, .article-content > pre')
  );

  blocks.forEach(function (block) {
    if (block.querySelector('.code-copy')) {
      return;
    }

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.textContent = '复制';

    button.addEventListener('click', function () {
      var code = block.querySelector('td.code pre, code, pre') || block;
      var text = code.innerText.replace(/\n$/, '');

      var done = function () {
        button.textContent = '已复制';
        button.classList.add('is-copied');
        setTimeout(function () {
          button.textContent = '复制';
          button.classList.remove('is-copied');
        }, 1800);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          button.textContent = '复制失败';
        });
        return;
      }

      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();

      try {
        document.execCommand('copy');
        done();
      } catch (error) {
        button.textContent = '复制失败';
      }

      document.body.removeChild(area);
    });

    block.appendChild(button);
  });
})();
