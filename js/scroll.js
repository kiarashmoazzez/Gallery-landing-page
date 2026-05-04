  (function () {
    'use strict';
    if (!window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo('#kimo-footer',
      { opacity: 0 },
      { opacity: 1, duration: 0.8,
        scrollTrigger: { trigger: '#kimo-footer', start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    );

  }());
