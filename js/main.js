  (function () {
    'use strict';

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── Spring ──────────────────────────────────────────────────────────────
    function Spring(v, k, d) {
      this.cur = v; this.tgt = v; this.vel = 0;
      this.k = k || 0.08; this.d = d || 0.82;
    }
    Spring.prototype.tick = function () {
      this.vel = (this.vel + (this.tgt - this.cur) * this.k) * this.d;
      this.cur += this.vel;
    };
    Spring.prototype.set = function (v) {
      this.cur = v; this.tgt = v; this.vel = 0;
    };
    Spring.prototype.tune = function (k, d) {
      if (reduceMotion) {
        k = Math.max(k, 0.16);
        d = Math.min(d, 0.42);
      }
      this.k = k;
      this.d = d;
      this.vel *= 0.55;
    };

    // ─── S-Curve ─────────────────────────────────────────────────────────────
    var N    = 32;
    var CW   = 430;   // world-unit span of the curve
    var CAMP = 88;    // amplitude
    var cardScale = 1;
    var cards = [];

    function curvePt(t) {
      var x = -CW / 2 + t * CW;
      var y = -CAMP * Math.sin(t * Math.PI * 2);
      var angle = -Math.atan2(
        -CAMP * Math.PI * 2 * Math.cos(t * Math.PI * 2),
        CW
      );
      return { x: x, y: y, angle: angle };
    }

    // ─── Three.js setup ──────────────────────────────────────────────────────
    var canvas  = document.getElementById('gl');
    var body    = document.getElementById('stage-body');
    var stageEl = document.getElementById('stage');

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = false;

    var scene = new THREE.Scene();
    var cam   = new THREE.PerspectiveCamera(60, 1, 1, 2000);
    cam.position.z = 480;

    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    var dLight = new THREE.DirectionalLight(0xfff6ec, 0.55);
    dLight.position.set(160, 260, 380);
    scene.add(dLight);

    var group = new THREE.Group();
    scene.add(group);

    // ─── Resize ──────────────────────────────────────────────────────────────
    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }

    function syncRibbonLayout() {
      for (var i = 0; i < cards.length; i++) {
        var c = cards[i];
        var pt = curvePt(c.t);
        var bz = i * 0.5;

        c.base.x = pt.x;
        c.base.y = pt.y;
        c.base.z = bz;
        c.base.rz = pt.angle;

        if (c.state === 'ribbon') {
          c.sx.tgt = pt.x;
          c.sy.tgt = pt.y;
          c.sz.tgt = bz;
          c.srz.tgt = pt.angle;
        }
      }
    }

    function resize() {
      var w = body.clientWidth;
      var h = body.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);

      var aspect = w / h;
      cardScale = clamp(Math.min(w / 900, h / 560), 0.86, 1.58);
      CW = clamp(430 * Math.pow(clamp(aspect, 0.52, 2.25) / 1.35, 0.45), 240, 610);
      CAMP = clamp(88 * Math.pow(clamp(h, 560, 1080) / 680, 0.35), 76, 132);

      var fov = THREE.MathUtils.degToRad(cam.fov);
      var objectW = CW + (70 * cardScale);
      var objectH = (CAMP * 2) + (82 * cardScale);
      var widthFill = aspect < 0.75 ? 0.90 : 0.82;
      var heightFill = aspect < 0.75 ? 0.48 : 0.72;
      var zForW = objectW / (2 * Math.tan(fov / 2) * aspect * widthFill);
      var zForH = objectH / (2 * Math.tan(fov / 2) * heightFill);
      cam.position.z = clamp(Math.max(zForW, zForH), 320, 760);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      syncRibbonLayout();
      retargetFocusLayout();
      if (journey && chapters) {
        refreshSectionTops();
        updateJourneyFromScroll();
      }
    }
    resize();
    if (window.ResizeObserver) {
      new ResizeObserver(resize).observe(body);
    }
    window.addEventListener('resize', resize);

    // ─── Textures (public-domain paintings with generated fallback) ──────────
    var FAMOUS_WORKS = [
      { title: 'The Starry Night', artist: 'Vincent van Gogh', year: '1889', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg' },
      { title: 'Mona Lisa', artist: 'Leonardo da Vinci', year: 'c. 1503-06', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/1280px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg' },
      { title: 'The Great Wave off Kanagawa', artist: 'Katsushika Hokusai', year: 'c. 1831', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Great_Wave_off_Kanagawa2.jpg/1280px-Great_Wave_off_Kanagawa2.jpg' },
      { title: 'Girl with a Pearl Earring', artist: 'Johannes Vermeer', year: 'c. 1665', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/1280px-Meisje_met_de_parel.jpg' },
      { title: 'The Kiss', artist: 'Gustav Klimt', year: '1907-08', url: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Gustav_Klimt_016.jpg' }
    ];
    var WORKS = [];
    for (var wi = 0; wi < N; wi++) {
      WORKS.push(FAMOUS_WORKS[wi % FAMOUS_WORKS.length]);
    }

    function randomFor(seed) {
      var s = seed;
      return function () {
        s = Math.sin(s * 78.233 + 12.9898) * 43758.5453;
        return s - Math.floor(s);
      };
    }

    function createArtworkTexture(index) {
      var canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 940;
      var ctx = canvas.getContext('2d');
      var rnd = randomFor(index + 3);
      var palettes = [
        ['#f4efe4', '#101010', '#d72828', '#1f58a8', '#f0c63a'],
        ['#f6ead8', '#273247', '#d65a38', '#88a6a3', '#efe2b7'],
        ['#ece8df', '#202020', '#6c87a8', '#b94735', '#d9c57a'],
        ['#f7f3e9', '#11151b', '#d35b2f', '#315f72', '#e8d0a6'],
        ['#efe6d4', '#20282b', '#a6b7aa', '#c84a36', '#e6b94c']
      ];
      var p = palettes[index % palettes.length];

      ctx.fillStyle = p[0];
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (index % 4 === 0) {
        ctx.lineWidth = 16;
        ctx.strokeStyle = p[1];
        var x = 70;
        while (x < canvas.width - 40) {
          x += 90 + rnd() * 115;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x + rnd() * 30 - 15, canvas.height);
          ctx.stroke();
        }
        var y = 90;
        while (y < canvas.height - 50) {
          y += 95 + rnd() * 130;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y + rnd() * 34 - 17);
          ctx.stroke();
        }
        for (var a = 0; a < 7; a++) {
          ctx.fillStyle = p[2 + (a % 3)];
          ctx.fillRect(rnd() * 570 + 40, rnd() * 760 + 40, 70 + rnd() * 170, 70 + rnd() * 210);
        }
      } else if (index % 4 === 1) {
        for (var b = 0; b < 18; b++) {
          ctx.save();
          ctx.translate(rnd() * canvas.width, rnd() * canvas.height);
          ctx.rotate((rnd() - 0.5) * 1.4);
          ctx.fillStyle = p[1 + (b % 4)];
          ctx.globalAlpha = 0.58 + rnd() * 0.34;
          ctx.fillRect(-90 - rnd() * 90, -20 - rnd() * 40, 180 + rnd() * 240, 38 + rnd() * 120);
          ctx.restore();
        }
      } else if (index % 4 === 2) {
        for (var c = 0; c < 26; c++) {
          ctx.beginPath();
          ctx.fillStyle = p[1 + (c % 4)];
          ctx.globalAlpha = 0.38 + rnd() * 0.48;
          ctx.arc(rnd() * canvas.width, rnd() * canvas.height, 18 + rnd() * 118, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.lineWidth = 5;
        ctx.strokeStyle = p[1];
        for (var d = 0; d < 12; d++) {
          ctx.beginPath();
          ctx.moveTo(rnd() * canvas.width, rnd() * canvas.height);
          ctx.bezierCurveTo(rnd() * canvas.width, rnd() * canvas.height, rnd() * canvas.width, rnd() * canvas.height, rnd() * canvas.width, rnd() * canvas.height);
          ctx.stroke();
        }
      } else {
        for (var e = 0; e < 16; e++) {
          ctx.save();
          ctx.translate(canvas.width * (0.18 + rnd() * 0.64), canvas.height * (0.12 + rnd() * 0.76));
          ctx.rotate((rnd() - 0.5) * 2.2);
          ctx.fillStyle = p[1 + (e % 4)];
          ctx.globalAlpha = 0.45 + rnd() * 0.4;
          ctx.beginPath();
          ctx.moveTo(-80 - rnd() * 90, -40 - rnd() * 70);
          ctx.quadraticCurveTo(20 + rnd() * 130, -110 - rnd() * 80, 100 + rnd() * 130, 30 + rnd() * 90);
          ctx.quadraticCurveTo(20 + rnd() * 110, 120 + rnd() * 80, -120 - rnd() * 50, 50 + rnd() * 70);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.globalAlpha = 0.055;
      for (var g = 0; g < 2600; g++) {
        ctx.fillStyle = rnd() > 0.5 ? '#000' : '#fff';
        ctx.fillRect(rnd() * canvas.width, rnd() * canvas.height, 1, 1);
      }
      ctx.globalAlpha = 1;

      var texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      return texture;
    }

    var tLoader = new THREE.TextureLoader();

    function coverTexture(texture) {
      var image = texture.image;
      if (!image || !image.width || !image.height) return;

      var imageAspect = image.width / image.height;
      var cardAspect = CW2 / CH2;
      texture.offset.set(0, 0);
      texture.repeat.set(1, 1);

      if (imageAspect > cardAspect) {
        texture.repeat.x = cardAspect / imageAspect;
        texture.offset.x = (1 - texture.repeat.x) / 2;
      } else {
        texture.repeat.y = imageAspect / cardAspect;
        texture.offset.y = (1 - texture.repeat.y) / 2;
      }

      texture.needsUpdate = true;
    }

    function loadArtworkTexture(work, fallbackIndex) {
      if (!work.url) return createArtworkTexture(fallbackIndex);

      if (/^https?:\/\//i.test(work.url)) {
        tLoader.setCrossOrigin('anonymous');
      } else {
        tLoader.setCrossOrigin('');
      }

      var texture = tLoader.load(
        work.url,
        function (remoteTexture) {
          coverTexture(remoteTexture);
        },
        undefined,
        function () {
          var fallback = createArtworkTexture(fallbackIndex);
          texture.image = fallback.image;
          texture.offset.copy(fallback.offset);
          texture.repeat.copy(fallback.repeat);
          texture.needsUpdate = true;
        }
      );
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      return texture;
    }

    // ─── Geometry (shared) ───────────────────────────────────────────────────
    var CW2 = 52, CH2 = 68;
    var geo  = new THREE.PlaneGeometry(CW2, CH2);

    // Back-face material (cream ivory)
    var backMat = new THREE.MeshStandardMaterial({
      color: 0xf4ede3, roughness: 0.6
    });

    // ─── Build Cards ─────────────────────────────────────────────────────────
    for (var i = 0; i < N; i++) {
      var t  = i / (N - 1);
      var pt = curvePt(t);
      var bz = i * 0.5;

      var work = WORKS[i % WORKS.length];
      var tex = loadArtworkTexture(work, i);

      var frontMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.34,
        metalness: 0.0,
      });

      // Two-sided card: front + back meshes in a pivot
      var pivot = new THREE.Group();
      var front = new THREE.Mesh(geo, frontMat);
      var back  = new THREE.Mesh(geo, backMat);
      back.rotation.y = Math.PI;
      back.position.z = -0.5;
      pivot.add(front);
      pivot.add(back);

      pivot.position.set(pt.x, pt.y, bz);
      pivot.rotation.z = pt.angle;

      group.add(pivot);

      cards.push({
        pivot: pivot,
        front: front,
        i: i,
        t: t,
        base: { x: pt.x, y: pt.y, z: bz, rz: pt.angle },
        state: 'ribbon',
        scatter: null,
        hovered: false,
        // Springs
        sx:  new Spring(pt.x,    0.08, 0.83),
        sy:  new Spring(pt.y,    0.08, 0.83),
        sz:  new Spring(bz,      0.09, 0.83),
        srz: new Spring(pt.angle,0.07, 0.86),
        srx: new Spring(0,       0.10, 0.80),
        ss:  new Spring(0,       0.11, 0.77),
      });
    }

    // Group tilt springs
    var gry = new Spring(0, 0.038, 0.90);
    var grx = new Spring(0, 0.038, 0.90);

    // ─── Mouse & Raycasting ───────────────────────────────────────────────────
    var ndc     = new THREE.Vector2();
    var ray     = new THREE.Raycaster();
    var hovered = null;
    var dragged = null;
    var draggingActive = false;
    var focused = null;
    var mouseActive = false;
    var mouseTimer  = null;
    var pmx = 0;
    var downX = 0;
    var downY = 0;

    var focusInfo  = document.getElementById('focus-info');
    var focusClose = document.getElementById('focus-close');
    var focusTitle = document.getElementById('focus-title');
    var focusCopy  = document.getElementById('focus-copy');
    var focusMeta  = document.getElementById('focus-meta');

    var journey = {
      phase: 0,
      activeIndex: 0,
      sectionTops: [],
      focusCardIndex: 3,
    };

    var chapters = [
      {
        id: 'hero-anchor',
        num: '01',
        title: 'Hero /<br>Closed Collection',
        desc: 'The collection is whole. Elegant. Mysterious. An invitation to explore.'
      },
      {
        id: 'ks02',
        num: '02',
        title: 'Ribbon<br>Unlocks',
        desc: 'As you scroll, the same hero ribbon loosens. Pieces break free and move into space.'
      },
      {
        id: 'ks03',
        num: '03',
        title: 'Immersive<br>Gallery Cloud',
        desc: 'You move through the collection as a single continuous field of floating works.'
      },
      {
        id: 'ks04',
        num: '04',
        title: 'Focus',
        desc: 'Scroll slower. One piece comes forward while the rest softens into the background.'
      },
      {
        id: 'ks05',
        num: '05',
        title: 'Details',
        desc: 'Get closer. Texture, surface, and detail become the main scene.'
      },
      {
        id: 'ks06',
        num: '06',
        title: 'Closing',
        desc: 'The journey resolves back into a compact ribbon, ready to be explored again.'
      }
    ];

    var journeyNum = document.getElementById('journey-num');
    var journeyTitle = document.getElementById('journey-title');
    var journeyDesc = document.getElementById('journey-desc');
    var progressDots = Array.prototype.slice.call(document.querySelectorAll('.stage-progress-dot'));
    var menuBtn = document.getElementById('menu-btn');
    var pageMenu = document.getElementById('page-menu');
    var menuLinks = Array.prototype.slice.call(document.querySelectorAll('.page-menu-link'));
    var stageArtLabel = document.getElementById('stage-art-label');
    var closingHeadline = document.getElementById('closing-headline');

    function mix(a, b, t) {
      return a + (b - a) * t;
    }

    var bgStops = [
      {
        stage: '#fbf7ee',
        bg: '#f4efe4',
        fg: '#111111',
        muted: '#888888',
        ui: '#1a1a1a',
        uiIcon: '#ffffff',
        pill: '#ebebeb',
      },
      {
        stage: '#f2e5d3',
        bg: '#dccab1',
        fg: '#15120f',
        muted: '#7b6d5d',
        ui: '#1a1a1a',
        uiIcon: '#ffffff',
        pill: '#ded1bf',
      },
      {
        stage: '#9f907a',
        bg: '#6c6254',
        fg: '#100f0d',
        muted: '#3f3930',
        ui: '#171411',
        uiIcon: '#ffffff',
        pill: '#817565',
      },
      {
        stage: '#191714',
        bg: '#0d0c0a',
        fg: '#f5eee3',
        muted: '#aaa195',
        ui: '#f5eee3',
        uiIcon: '#111111',
        pill: '#2d2924',
      },
      {
        stage: '#101820',
        bg: '#070b10',
        fg: '#f2eee6',
        muted: '#a3adb5',
        ui: '#f2eee6',
        uiIcon: '#111111',
        pill: '#26313b',
      },
      {
        stage: '#fbf7ee',
        bg: '#f4efe4',
        fg: '#111111',
        muted: '#888888',
        ui: '#1a1a1a',
        uiIcon: '#ffffff',
        pill: '#ebebeb',
      }
    ];

    function hexToRgb(hex) {
      var clean = hex.replace('#', '');
      return {
        r: parseInt(clean.slice(0, 2), 16),
        g: parseInt(clean.slice(2, 4), 16),
        b: parseInt(clean.slice(4, 6), 16),
      };
    }

    function mixRgb(a, b, t) {
      return {
        r: Math.round(mix(a.r, b.r, t)),
        g: Math.round(mix(a.g, b.g, t)),
        b: Math.round(mix(a.b, b.b, t)),
      };
    }

    function rgbString(rgb) {
      return 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';
    }

    function rgbVars(rgb) {
      return rgb.r + ',' + rgb.g + ',' + rgb.b;
    }

    function updateBackgroundTone(phase) {
      var low = Math.floor(phase);
      var high = Math.min(bgStops.length - 1, low + 1);
      var local = smoothstep(phase - low);
      var stageRgb = mixRgb(hexToRgb(bgStops[low].stage), hexToRgb(bgStops[high].stage), local);
      var bgRgb = mixRgb(hexToRgb(bgStops[low].bg), hexToRgb(bgStops[high].bg), local);
      var fgRgb = mixRgb(hexToRgb(bgStops[low].fg), hexToRgb(bgStops[high].fg), local);
      var mutedRgb = mixRgb(hexToRgb(bgStops[low].muted), hexToRgb(bgStops[high].muted), local);
      var uiRgb = mixRgb(hexToRgb(bgStops[low].ui), hexToRgb(bgStops[high].ui), local);
      var uiIconRgb = mixRgb(hexToRgb(bgStops[low].uiIcon), hexToRgb(bgStops[high].uiIcon), local);
      var pillRgb = mixRgb(hexToRgb(bgStops[low].pill), hexToRgb(bgStops[high].pill), local);
      document.documentElement.style.setProperty('--stage', rgbString(stageRgb));
      document.documentElement.style.setProperty('--stage-rgb', rgbVars(stageRgb));
      document.documentElement.style.setProperty('--bg', rgbString(bgRgb));
      document.documentElement.style.setProperty('--fg', rgbString(fgRgb));
      document.documentElement.style.setProperty('--fg-rgb', rgbVars(fgRgb));
      document.documentElement.style.setProperty('--muted', rgbString(mutedRgb));
      document.documentElement.style.setProperty('--ui', rgbString(uiRgb));
      document.documentElement.style.setProperty('--ui-icon', rgbString(uiIconRgb));
      document.documentElement.style.setProperty('--pill', rgbString(pillRgb));
    }

    function smoothstep(t) {
      t = clamp(t, 0, 1);
      return t * t * (3 - 2 * t);
    }

    function lerpTarget(a, b, t) {
      return {
        x: mix(a.x, b.x, t),
        y: mix(a.y, b.y, t),
        z: mix(a.z, b.z, t),
        rz: mix(a.rz, b.rz, t),
        rx: mix(a.rx, b.rx, t),
        s: mix(a.s, b.s, t),
      };
    }

    function chapterTarget(c, index) {
      var visible = visibleWorldAt(0);
      var t = c.t;
      var seedA = seededRand((c.i + 1) * 19);
      var seedB = seededRand((c.i + 1) * 43);
      var seedC = seededRand((c.i + 1) * 71);

      if (index === 0) {
        return { x: c.base.x, y: c.base.y - visible.height * 0.035, z: c.base.z, rz: c.base.rz, rx: 0, s: cam.aspect < 0.75 ? 0.9 : 0.84 };
      }

      if (index === 1) {
        var spreadX = (t - 0.5) * visible.width * (cam.aspect < 0.75 ? 0.72 : 0.66);
        var waveY = -Math.sin(t * Math.PI * 2.2) * visible.height * 0.18;
        var lift = Math.sin(t * Math.PI * 4) * visible.height * 0.06;
        return {
          x: mix(c.base.x, spreadX, 0.68),
          y: mix(c.base.y, waveY + lift, 0.72),
          z: 22 + seedA * 130,
          rz: c.base.rz + (seedB - 0.5) * 0.34,
          rx: (seedC - 0.5) * 0.22,
          s: 0.88 + seedA * 0.22,
        };
      }

      if (index === 2) {
        return {
          x: (seedA - 0.5) * visible.width * 0.86,
          y: (seedB - 0.5) * visible.height * 0.78,
          z: -70 + seedC * 260,
          rz: (seededRand((c.i + 1) * 97) - 0.5) * 0.92,
          rx: (seededRand((c.i + 1) * 109) - 0.5) * 0.34,
          s: (0.56 + seededRand((c.i + 1) * 131) * 0.94) / cardScale,
        };
      }

      if (index === 3) {
        if (c.i === journey.focusCardIndex) {
          return { x: cam.aspect < 0.75 ? 0 : -visible.width * 0.08, y: visible.height * 0.02, z: 168, rz: 0, rx: 0, s: (cam.aspect < 0.75 ? 2.0 : 2.42) / cardScale };
        }
        var angle = seedA * Math.PI * 2;
        var radius = 0.52 + seedB * 0.46;
        var targetX = Math.cos(angle) * visible.width * 0.42 * radius;
        var targetY = Math.sin(angle) * visible.height * 0.42 * radius;
        if (Math.abs(targetX) < visible.width * 0.15 && Math.abs(targetY) < visible.height * 0.18) {
          targetX += (c.i % 2 ? -1 : 1) * visible.width * 0.26;
        }
        return {
          x: targetX,
          y: targetY,
          z: -36 + seedC * 46,
          rz: (seedB - 0.5) * 0.7,
          rx: 0,
          s: (0.42 + seedA * 0.22) / cardScale,
        };
      }

      if (index === 4) {
        if (c.i === journey.focusCardIndex) {
          return {
            x: cam.aspect < 0.75 ? 0 : -visible.width * 0.10,
            y: cam.aspect < 0.75 ? visible.height * 0.02 : 0,
            z: 210,
            rz: 0,
            rx: 0,
            s: (cam.aspect < 0.75 ? 4.4 : 5.8) / cardScale,
          };
        }
        return {
          x: (seedA < 0.5 ? -1 : 1) * visible.width * (0.38 + seedB * 0.20),
          y: (seedC - 0.5) * visible.height * 0.56,
          z: -110 + seedA * 38,
          rz: (seedB - 0.5) * 0.55,
          rx: 0,
          s: (0.36 + seedC * 0.18) / cardScale,
        };
      }

      var closingX = (t - 0.5) * visible.width * (cam.aspect < 0.75 ? 0.44 : 0.30);
      var closingY = -Math.sin(t * Math.PI * 2) * visible.height * 0.055;
      return {
        x: closingX,
        y: closingY - visible.height * 0.04,
        z: c.base.z * 0.2,
        rz: c.base.rz * 0.74,
        rx: 0,
        s: (cam.aspect < 0.75 ? 0.48 : 0.56) / cardScale,
      };
    }

    function journeyTarget(c) {
      var low = Math.floor(journey.phase);
      var high = Math.min(chapters.length - 1, low + 1);
      var local = smoothstep(journey.phase - low);
      return lerpTarget(chapterTarget(c, low), chapterTarget(c, high), local);
    }

    function refreshSectionTops() {
      journey.sectionTops = chapters.map(function (chapter, idx) {
        if (idx === 0) return 0;
        var el = document.getElementById(chapter.id);
        return el ? el.offsetTop : idx * window.innerHeight;
      });
    }

    function setChapterUi(index) {
      index = clamp(index, 0, chapters.length - 1);
      if (journey.activeIndex === index && journeyNum.textContent === chapters[index].num) return;
      journey.activeIndex = index;

      var chapter = chapters[index];
      journeyNum.textContent = chapter.num;
      journeyTitle.innerHTML = chapter.title;
      journeyDesc.textContent = chapter.desc;
      progressDots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
      menuLinks.forEach(function (link, linkIndex) {
        link.classList.toggle('is-active', linkIndex === index);
      });
    }

    function updateJourneyFromScroll() {
      if (!journey.sectionTops.length) refreshSectionTops();

      var marker = window.scrollY + window.innerHeight * 0.42;
      var phase = 0;
      for (var i = 0; i < journey.sectionTops.length - 1; i++) {
        var start = journey.sectionTops[i];
        var end = journey.sectionTops[i + 1];
        if (marker >= start && marker <= end) {
          phase = i + clamp((marker - start) / Math.max(1, end - start), 0, 1);
          break;
        }
        if (marker > end) phase = i + 1;
      }

      journey.phase = clamp(phase, 0, chapters.length - 1);
      setChapterUi(Math.round(journey.phase));
      updateBackgroundTone(journey.phase);

      var focusAmount = clamp(1 - Math.abs(journey.phase - 3), 0, 1);
      var detailAmount = clamp(1 - Math.abs(journey.phase - 4), 0, 1);
      var closingAmount = clamp((journey.phase - 4.62) / 0.38, 0, 1);
      var headlineAmount = clamp(1 - ((window.scrollY / Math.max(1, window.innerHeight)) - 0.04) / 0.24, 0, 1);
      gsap.to('.hw', { opacity: focused ? 0 : headlineAmount, duration: 0.18, overwrite: true });
      gsap.to(stageArtLabel, { opacity: Math.max(focusAmount, detailAmount) * 0.92, duration: 0.22, overwrite: true });
      gsap.to(closingHeadline, { opacity: closingAmount, y: (1 - closingAmount) * 12, duration: 0.22, overwrite: true });

      var footer = document.getElementById('kimo-footer');
      if (footer) {
        var footerTop = footer.getBoundingClientRect().top;
        var fade = clamp((window.innerHeight * 0.86 - footerTop) / (window.innerHeight * 0.32), 0, 1);
        if (fade > 0.001) {
          stageEl.style.opacity = String(1 - fade * 0.95);
          stageEl.style.pointerEvents = fade > 0.65 ? 'none' : '';
        } else if (stageEl.getAttribute('data-entered') === 'true') {
          stageEl.style.opacity = '1';
          stageEl.style.pointerEvents = '';
        }
      }
    }

    progressDots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = document.getElementById(dot.getAttribute('data-target'));
        if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    });

    function setMenuOpen(open) {
      if (!menuBtn || !pageMenu) return;
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      pageMenu.classList.toggle('is-open', open);
      pageMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    }

    function scrollToChapter(targetId) {
      var target = document.getElementById(targetId);
      if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }

    if (menuBtn && pageMenu) {
      menuBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setMenuOpen(menuBtn.getAttribute('aria-expanded') !== 'true');
      });

      menuLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          scrollToChapter(link.getAttribute('data-target'));
          setMenuOpen(false);
        });
      });

      document.addEventListener('click', function (e) {
        if (!pageMenu.classList.contains('is-open')) return;
        if (pageMenu.contains(e.target) || menuBtn.contains(e.target)) return;
        setMenuOpen(false);
      });

      window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setMenuOpen(false);
      });
    }

    var spill = document.getElementById('spill');
    if (spill) {
      spill.addEventListener('click', function () {
        scrollToChapter('ks02');
      });
    }

    window.addEventListener('scroll', updateJourneyFromScroll, { passive: true });
    window.addEventListener('load', function () {
      refreshSectionTops();
      updateJourneyFromScroll();
    });
    refreshSectionTops();
    updateJourneyFromScroll();

    function setNDC(e) {
      var r = canvas.getBoundingClientRect();
      ndc.x =  ((e.clientX - r.left) / r.width)  * 2 - 1;
      ndc.y = -((e.clientY - r.top)  / r.height) * 2 + 1;
    }

    function worldAt(e, z) {
      var r  = canvas.getBoundingClientRect();
      var nx =  ((e.clientX - r.left) / r.width)  * 2 - 1;
      var ny = -((e.clientY - r.top)  / r.height) * 2 + 1;
      var v  = new THREE.Vector3(nx, ny, 0.5).unproject(cam);
      var d  = v.sub(cam.position).normalize();
      var dist = (z - cam.position.z) / d.z;
      return cam.position.clone().add(d.multiplyScalar(dist));
    }

    function getPivots() {
      return cards.map(function (c) { return c.pivot; });
    }

    function visibleWorldAt(z) {
      var depth = cam.position.z - z;
      var height = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * depth;
      return {
        width: height * cam.aspect,
        height: height,
      };
    }

    function seededRand(seed) {
      var x = Math.sin(seed * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    }

    function tuneCard(c, profile) {
      if (profile === 'focus-main') {
        c.sx.tune(0.082, 0.58);
        c.sy.tune(0.082, 0.58);
        c.sz.tune(0.080, 0.56);
        c.srz.tune(0.076, 0.58);
        c.srx.tune(0.078, 0.56);
        c.ss.tune(0.086, 0.56);
        return;
      }

      if (profile === 'focus-rest') {
        c.sx.tune(0.074, 0.56);
        c.sy.tune(0.074, 0.56);
        c.sz.tune(0.070, 0.54);
        c.srz.tune(0.070, 0.56);
        c.srx.tune(0.074, 0.54);
        c.ss.tune(0.078, 0.54);
        return;
      }

      if (profile === 'drag') {
        c.sx.tune(0.110, 0.66);
        c.sy.tune(0.110, 0.66);
        c.sz.tune(0.105, 0.62);
        c.srz.tune(0.090, 0.64);
        c.srx.tune(0.095, 0.62);
        c.ss.tune(0.105, 0.60);
        return;
      }

      c.sx.tune(0.085, 0.58);
      c.sy.tune(0.085, 0.58);
      c.sz.tune(0.082, 0.56);
      c.srz.tune(0.078, 0.58);
      c.srx.tune(0.080, 0.56);
      c.ss.tune(0.088, 0.56);
    }

    function retargetFocusLayout() {
      if (!focused) return;

      var visible = visibleWorldAt(0);
      var desiredFocusScale = cam.aspect < 0.75 ? 2.12 : 2.46;
      var desiredRestScale = cam.aspect < 0.75 ? 0.48 : 0.56;

      for (var i = 0; i < cards.length; i++) {
        var c = cards[i];

        if (c === focused) {
          tuneCard(c, 'focus-main');
          c.state = 'focused';
          c.sx.tgt = 0;
          c.sy.tgt = visible.height * 0.03;
          c.sz.tgt = 155;
          c.srz.tgt = 0;
          c.srx.tgt = 0;
          c.ss.tgt = desiredFocusScale / cardScale;
          continue;
        }

        var rx = visible.width * (cam.aspect < 0.75 ? 0.43 : 0.46);
        var ry = visible.height * (cam.aspect < 0.75 ? 0.39 : 0.42);
        var angle = seededRand((focused.i + 1) * 91 + c.i * 17) * Math.PI * 2;
        var radius = 0.50 + seededRand((focused.i + 1) * 37 + c.i * 29) * 0.48;
        var sideBias = c.i % 2 === 0 ? 1 : -1;
        var xJitter = (seededRand(c.i * 53 + focused.i * 11) - 0.5) * visible.width * 0.18;
        var yJitter = (seededRand(c.i * 71 + focused.i * 13) - 0.5) * visible.height * 0.16;

        var targetX = Math.cos(angle) * rx * radius + xJitter;
        var targetY = Math.sin(angle) * ry * radius + yJitter;

        if (Math.abs(targetX) < visible.width * 0.16 && Math.abs(targetY) < visible.height * 0.20) {
          targetX += sideBias * visible.width * (0.22 + seededRand(c.i * 19) * 0.18);
          targetY += (targetY < 0 ? -1 : 1) * visible.height * 0.18;
        }

        c.state = 'focus-rest';
        tuneCard(c, 'focus-rest');
        c.sx.tgt = targetX;
        c.sy.tgt = targetY;
        c.sz.tgt = -30 + seededRand(c.i * 97 + focused.i * 7) * 40;
        c.srz.tgt = (seededRand(c.i * 43 + focused.i * 5) - 0.5) * 0.72;
        c.srx.tgt = 0;
        c.ss.tgt = (desiredRestScale * (0.86 + seededRand(c.i * 31 + focused.i * 3) * 0.28)) / cardScale;
      }
    }

    function setFocusInfo(c) {
      var work = WORKS[c.i];
      focusTitle.textContent = work.title;
      focusCopy.textContent = 'A selected work from the same continuous collection ribbon, lifted forward from the hero stage for a closer look.';
      focusMeta.innerHTML = '';

      [work.artist, 'Artwork', work.year].forEach(function (item) {
        var span = document.createElement('span');
        span.textContent = item;
        focusMeta.appendChild(span);
      });
    }

    function openFocus(c) {
      if (!c) return;
      if (hovered) hovered.hovered = false;
      hovered = null;
      dragged = null;
      draggingActive = false;
      focused = c;

      setFocusInfo(c);
      focusInfo.classList.add('is-open');
      focusInfo.setAttribute('aria-hidden', 'false');
      gry.tgt = 0;
      grx.tgt = 0;
      retargetFocusLayout();

      gsap.killTweensOf('#focus-info, .hw, #hint');
      gsap.to('#focus-info', {
        opacity: 1,
        y: 0,
        duration: reduceMotion ? 0.16 : 0.72,
        ease: 'expo.out',
      });
      gsap.to('.hw, #hint', {
        opacity: 0,
        duration: reduceMotion ? 0.12 : 0.42,
        ease: 'power2.out',
      });
      canvas.style.cursor = 'default';
    }

    function closeFocus() {
      if (!focused) return;
      focused = null;
      draggingActive = false;
      focusInfo.classList.remove('is-open');
      focusInfo.setAttribute('aria-hidden', 'true');

      gsap.killTweensOf('#focus-info, .hw, #hint');
      gsap.to('#focus-info', {
        opacity: 0,
        y: 18,
        duration: reduceMotion ? 0.12 : 0.42,
        ease: 'power3.inOut',
      });
      gsap.to('.hw', {
        opacity: 1,
        duration: reduceMotion ? 0.16 : 0.58,
        ease: 'power2.out',
      });

      for (var i = 0; i < cards.length; i++) {
        returnToRibbon(cards[i]);
      }
    }

    canvas.addEventListener('mousemove', function (e) {
      setNDC(e);
      mouseActive = true;
      clearTimeout(mouseTimer);
      mouseTimer = setTimeout(function () { mouseActive = false; }, 1800);

      if (focused) {
        gry.tgt = 0;
        grx.tgt = 0;
        canvas.style.cursor = 'default';
        return;
      }

      gry.tgt = 0;
      grx.tgt = 0;

      if (dragged) {
        var mdx = e.clientX - downX;
        var mdy = e.clientY - downY;
        var moveDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (!draggingActive && moveDist < 12) {
          canvas.style.cursor = 'grab';
          return;
        }
        if (!draggingActive) {
          draggingActive = true;
          dragged.state = 'dragging';
          tuneCard(dragged, 'drag');
        }
        var w = worldAt(e, 105);
        dragged.sx.tgt = w.x;
        dragged.sy.tgt = w.y;
        dragged.sz.tgt = 105;
        var vx = e.clientX - pmx;
        dragged.srz.tgt = vx * 0.020;
        dragged.srx.tgt = -0.38;
        pmx = e.clientX;
        canvas.style.cursor = 'grabbing';
        return;
      }

      // Hover detection
      ray.setFromCamera(ndc, cam);
      var hits = ray.intersectObjects(getPivots(), true);
      var hit = null;
      if (hits.length) {
        var obj = hits[0].object;
        for (var ci = 0; ci < cards.length; ci++) {
          if (cards[ci].pivot === obj || cards[ci].front === obj) {
            hit = cards[ci]; break;
          }
        }
        // handle back mesh too
        if (!hit) {
          for (var ci2 = 0; ci2 < cards.length; ci2++) {
            if (cards[ci2].pivot.children.indexOf(obj) !== -1) {
              hit = cards[ci2]; break;
            }
          }
        }
      }

      if (hovered !== hit) {
        if (hovered) hovered.hovered = false;
        hovered = hit;
        if (hovered) hovered.hovered = true;
      }
      canvas.style.cursor = hovered ? 'grab' : 'default';
    });

    canvas.addEventListener('mousedown', function (e) {
      if (focused) return;
      if (journey.phase > 0.82) return;
      if (!hovered) return;
      e.preventDefault();
      dragged = hovered;
      draggingActive = false;
      pmx = e.clientX;
      downX = e.clientX;
      downY = e.clientY;
      canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('mouseup', function (e) {
      if (!dragged) return;
      var c = dragged;
      dragged = null;

      var dx = c.sx.cur - c.base.x;
      var dy = c.sy.cur - c.base.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var sx = e.clientX - downX;
      var sy = e.clientY - downY;
      var screenDist = Math.sqrt(sx * sx + sy * sy);

      if (!draggingActive || screenDist < 12) {
        openFocus(c);
      } else if (dist > 115) {
        tuneCard(c, 'ribbon');
        c.state = 'scattered';
        c.scatter = { x: c.sx.cur, y: c.sy.cur };
        c.sx.tgt  = c.sx.cur;
        c.sy.tgt  = c.sy.cur;
        c.sz.tgt  = 32;
            c.srz.tgt = (Math.random() - 0.5) * 0.28;
        c.srx.tgt = 0;
        c.ss.tgt  = 1.0;
        updateCount();
      } else {
        returnToRibbon(c);
      }
      draggingActive = false;
      canvas.style.cursor = hovered ? 'grab' : 'default';
    });

    canvas.addEventListener('mouseleave', function () {
      if (dragged) { returnToRibbon(dragged); dragged = null; draggingActive = false; }
      if (hovered) { hovered.hovered = false; hovered = null; }
      gry.tgt = 0; grx.tgt = 0;
      canvas.style.cursor = 'default';
    });

    // Double-click scattered card → return to ribbon
    canvas.addEventListener('dblclick', function () {
      if (focused) return;
      ray.setFromCamera(ndc, cam);
      var scattered = cards.filter(function (c) { return c.state === 'scattered'; });
      var hits = ray.intersectObjects(scattered.map(function (c) { return c.pivot; }), true);
      if (hits.length) {
        var obj = hits[0].object;
        for (var ci = 0; ci < scattered.length; ci++) {
          var sc = scattered[ci];
          if (sc.pivot === obj || sc.pivot.children.indexOf(obj) !== -1) {
            returnToRibbon(sc);
            break;
          }
        }
      }
    });

    function returnToRibbon(c) {
      tuneCard(c, 'ribbon');
      c.state   = 'ribbon';
      c.scatter = null;
      c.sx.tgt  = c.base.x;
      c.sy.tgt  = c.base.y;
      c.sz.tgt  = c.base.z;
      c.srz.tgt = c.base.rz;
      c.srx.tgt = 0;
      c.ss.tgt  = 1.0;
      updateCount();
    }

    function updateCount() {
      var scattered = cards.filter(function (c) { return c.state === 'scattered'; }).length;
      var inRibbon  = N - scattered;
      document.getElementById('card-count').textContent = inRibbon + ' works' + (scattered ? ' · ' + scattered + ' floating' : '');
    }

    focusClose.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeFocus();
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeFocus();
    });

    // ─── Entrance animation ───────────────────────────────────────────────────
    var tl = gsap.timeline({ delay: 0.12 });

    tl.to('#stage', {
      opacity: 1,
      scale: 1,
      duration: 0.7,
      ease: 'power3.out',
      onComplete: function () {
        stageEl.setAttribute('data-entered', 'true');
        updateJourneyFromScroll();
      },
    }, 0.18);

    tl.to('.hw', {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
      stagger: 0.1,
    }, 0.62);

    tl.to('#launch-date, #card-count', {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
    }, 0.82);

    tl.call(function () {
      // Ribbon draws from center outward
      var mid = Math.floor(N / 2);
      var order = [];
      for (var i = 0; i <= mid; i++) {
        if (mid - i >= 0) order.push(mid - i);
        if (mid + i < N && i > 0) order.push(mid + i);
      }
      order.forEach(function (idx, di) {
        setTimeout(function () {
          cards[idx].ss.tgt = 1;
        }, di * 28);
      });

      // Drag hint fades in then out
      setTimeout(function () {
        if (focused) return;
        gsap.to('#hint', { opacity: 1, duration: 0.6 });
        setTimeout(function () {
          if (focused) return;
          gsap.to('#hint', { opacity: 0, duration: 1.0 });
        }, 2800);
      }, 1000);
    }, [], 0.68);

    // ─── Render loop ──────────────────────────────────────────────────────────
    var t0 = null;

    function tick(now) {
      requestAnimationFrame(tick);
      if (!t0) t0 = now;
      gry.tgt = 0;
      grx.tgt = 0;

      gry.tick(); grx.tick();
      group.rotation.y = gry.cur;
      group.rotation.x = grx.cur;

      for (var i = 0; i < N; i++) {
        var c = cards[i];

        if (c.state === 'ribbon') {
          var jt = journeyTarget(c);
          var targetX = jt.x;
          var targetY = jt.y;
          var targetZ = jt.z;
          var targetScale = jt.s;
          var targetRot = jt.rz;
          var targetRx = jt.rx;

          if (hovered && !dragged && hovered.state === 'ribbon' && journey.phase < 0.82) {
            var delta = i - hovered.i;
            var distance = Math.abs(delta);
            var tangentX = Math.cos(c.base.rz);
            var tangentY = Math.sin(c.base.rz);
            var normalX = -Math.sin(c.base.rz);
            var normalY = Math.cos(c.base.rz);

            if (c === hovered) {
              targetX += normalX * 18;
              targetY += normalY * 26;
              targetZ += 52;
              targetScale = 1.08;
            } else if (distance <= 4) {
              var side = delta < 0 ? -1 : 1;
              var strength = (5 - distance) / 4;
              var slide = strength * 34;
              var depth = strength * 24;
              var settle = strength * 9;

              targetX += tangentX * side * slide - normalX * settle;
              targetY += tangentY * side * slide - normalY * settle;
              targetZ += depth * (distance <= 2 ? 0.72 : 0.36);
              targetRot += side * strength * 0.08;
              targetScale = 1 - strength * 0.025;
            }
          }

          c.sx.tgt = targetX;
          c.sy.tgt = targetY;
          c.sz.tgt = targetZ;
          c.srz.tgt = targetRot;
          c.ss.tgt = targetScale;

          if (c === hovered && !dragged && journey.phase < 0.82) {
            c.srx.tgt = targetRx - 0.04;
          } else {
            c.srx.tgt = targetRx;
          }
        }
        // scattered: springs settle at scatter position (no override)

        c.sx.tick();
        c.sy.tick();
        c.sz.tick();
        c.srz.tick();
        c.srx.tick();
        c.ss.tick();

        var s = Math.max(0, c.ss.cur);
        c.pivot.position.set(c.sx.cur, c.sy.cur, c.sz.cur);
        c.pivot.rotation.z = c.srz.cur;
        c.pivot.rotation.x = c.srx.cur;
        c.pivot.scale.setScalar(s * cardScale);
      }

      renderer.render(scene, cam);
    }

    requestAnimationFrame(tick);

  }());
