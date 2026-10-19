/**
 * 梦幻星空 · 五角星飘落
 * 由 _partial/star-field.ejs 输出容器与 data-* 配置，
 * 这里在浏览器端生成星星，代替 Vue 版组件里的 v-for 渲染。
 */
(function () {
  'use strict';

  var field = document.getElementById('star-field');
  if (!field) {
    return;
  }

  var data = field.dataset || {};

  var count = parseInt(data.count, 10);
  if (!isFinite(count) || count <= 0) {
    count = 18;
  }

  var colors = (data.colors || 'pink,blue,white,purple')
    .split(',')
    .map(function (color) {
      return color.trim();
    })
    .filter(Boolean);

  if (!colors.length) {
    colors = ['pink', 'blue', 'white', 'purple'];
  }

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var animated = data.motion !== 'false' && !reduceMotion;

  var fragment = document.createDocumentFragment();

  for (var i = 0; i < count; i += 1) {
    var star = document.createElement('span');
    star.className = 'star ' + colors[Math.floor(Math.random() * colors.length)];
    star.textContent = '★';

    var size = 8 + Math.random() * 16;

    star.style.fontSize = size.toFixed(1) + 'px';
    star.style.left = (Math.random() * 100).toFixed(2) + 'vw';
    star.style.opacity = (0.35 + Math.random() * 0.4).toFixed(2);

    if (animated) {
      var duration = 9 + Math.random() * 12;
      var delay = Math.random() * duration;
      var name = i % 2 === 0 ? 'starfall' : 'starfallReverse';

      star.style.animation = name + ' ' + duration.toFixed(1) + 's linear ' + delay.toFixed(1) + 's infinite';
    } else {
      // 关闭动效时保留静态星点，避免背景完全空白
      star.style.top = (Math.random() * 100).toFixed(2) + 'vh';
      star.style.position = 'absolute';
    }

    fragment.appendChild(star);
  }

  field.appendChild(fragment);
})();
