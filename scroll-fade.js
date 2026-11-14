/* Site-wide scroll softness: a gentle fade at the bottom of the window, and content that
   fades up as it scrolls into view. Elements already on screen at load are left alone,
   and everything stays static for people who prefer reduced motion. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var css =
    '.sf-edge{position:fixed;left:0;right:0;bottom:0;height:96px;pointer-events:none;z-index:20;' +
    'background:linear-gradient(to bottom,rgba(251,251,252,0),var(--bg,#fbfbfc) 92%);transition:opacity .3s ease}' +
    '.sf-edge.is-end{opacity:0}' +
    '@media (max-width:760px){.sf-edge{height:64px}}' +
    '.sf-hide{opacity:0;transform:translateY(24px)}' +
    '.sf-in{opacity:1;transform:none;transition:opacity .8s ease,transform .8s cubic-bezier(.2,.7,.2,1)}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function init() {
    // Bottom fade; hidden once the page is scrolled to the very end so the last line is clear.
    var edge = document.createElement('div');
    edge.className = 'sf-edge';
    edge.setAttribute('aria-hidden', 'true');
    document.body.appendChild(edge);
    function atEnd() {
      var end = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      edge.classList.toggle('is-end', end);
    }
    window.addEventListener('scroll', atEnd, { passive: true });
    window.addEventListener('resize', atEnd);
    atEnd();

    if (reduce || !('IntersectionObserver' in window)) return;
    var els = document.querySelectorAll('.home .intro, .home .project, .overview > *, .content .section > *');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('sf-in');
        e.target.classList.remove('sf-hide');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    var vh = window.innerHeight;
    Array.prototype.forEach.call(els, function (el) {
      if (el.getBoundingClientRect().top < vh) return; // already visible: don't animate
      el.classList.add('sf-hide');
      io.observe(el);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
