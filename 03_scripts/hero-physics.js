(function () {
    // Hero physics test — the hand-drawn stickers drop into the #f2f2f2 box with gravity,
    // settle, then keep a little life in them (small random nudges instead of going fully
    // still), and can be picked up and dragged around by the visitor. Built with Matter.js
    // (vendored in 03_scripts/vendor).
    //
    // Physics run in a fixed 1200x720 "world" regardless of screen size; the world's DOM layer
    // is CSS-scaled to fit however wide the box actually renders, so the simulation itself never
    // has to be recomputed on resize — only the mouse coordinates need the same scale undone.
    var WORLD_W = 1200;
    var WORLD_H = 720;
    // thickness of the invisible walls. Generous on purpose: a fast drag-throw into a wall can
    // rest with several px of overlap once settled (an ordinary small-penetration artifact of
    // rectangle-vs-rectangle solving near where two static walls meet at a corner) — a thin wall
    // would let that overlap poke out its far side, so the walls are made thick enough that it
    // never can.
    var WALL = 300;

    // Displayed sizes: every piece is scaled by the same factor that would resize the original
    // artwork's own canvas (Hero-before-3.svg, 1499x900 — the same ~5:3 as the real hero) to fit
    // this 1200x720 world. That keeps every piece the size it was actually drawn at relative to
    // the hero, rather than an arbitrary size picked just to look good in this test box.
    var SOURCE_CANVAS_H = 900;

    // Each piece's actual illustrated silhouette (not its bounding box) — traced from its own
    // alpha channel so two pieces can rest right up against one another without the ink visibly
    // overlapping, the way a plain rectangle hitbox would let them. `pts` are in the piece's own
    // local units (the same units as w/h, i.e. before the display `scale` below is applied);
    // `cx`/`cy` is that polygon's true centre of mass in the same units, needed to keep the
    // artwork lined up correctly with its (rotating) physics body — see the render setup below.
    var PIECES = [
        { name: 'letter-a', w: 756.5, h: 836.1, cx: 379.35, cy: 445.52, pts: [[298.84,4.18],[461.84,4.18],[470.20,33.44],[474.38,39.71],[484.83,75.25],[501.55,117.05],[512.00,152.59],[516.18,158.86],[526.62,194.39],[543.34,236.20],[553.79,271.73],[570.51,313.54],[580.96,349.07],[597.68,390.88],[608.13,426.41],[624.84,468.22],[635.29,503.75],[639.47,510.02],[649.92,545.56],[654.10,551.83],[750.23,829.83],[589.32,829.83],[543.34,693.96],[539.16,687.69],[516.18,614.53],[507.82,595.72],[244.50,595.72],[240.32,599.90],[238.23,610.35],[234.06,616.62],[160.91,829.83],[4.18,829.83]] },
        { name: 'card-hh', w: 318.2, h: 277.9, cx: 155.66, cy: 136.50, pts: [[206.83,3.98],[208.42,3.98],[209.22,5.57],[218.76,34.24],[220.35,35.83],[228.31,37.42],[236.26,40.61],[246.60,46.18],[252.97,50.96],[264.11,62.11],[273.65,76.44],[279.22,89.98],[282.40,101.13],[283.99,103.52],[287.97,117.05],[289.56,119.44],[313.43,188.72],[308.65,191.11],[281.61,199.87],[279.22,201.46],[265.70,205.44],[263.31,207.03],[249.79,211.01],[233.88,217.38],[220.35,221.36],[217.97,222.96],[204.44,226.94],[188.53,233.31],[175.01,237.29],[159.10,243.66],[73.19,273.12],[3.98,75.65]] },
        { name: 'arrow', w: 149.0, h: 225.9, cx: 74.21, cy: 112.66, pts: [[3.95,3.95],[144.48,3.95],[144.48,221.38],[3.95,221.38]] },
        { name: 'swatch', w: 274.0, h: 188.3, cx: 136.62, cy: 93.82, pts: [[57.54,4.11],[73.30,4.11],[76.72,5.48],[82.20,6.16],[87.00,8.22],[89.05,8.22],[117.82,17.12],[143.85,23.97],[148.65,26.02],[169.88,31.50],[174.68,33.55],[176.73,33.55],[205.50,42.45],[231.53,49.30],[245.23,55.46],[250.02,58.89],[260.30,69.84],[266.47,81.48],[268.52,88.33],[269.21,98.60],[269.89,99.29],[269.21,99.97],[268.52,111.61],[262.36,131.47],[262.36,133.52],[260.30,138.31],[258.93,145.16],[254.14,156.80],[247.97,165.70],[239.07,173.92],[228.10,180.08],[215.78,183.51],[200.02,183.51],[160.29,172.55],[136.32,165.02],[134.26,165.02],[131.52,163.65],[129.46,163.65],[105.49,156.12],[103.44,156.12],[100.70,154.75],[98.64,154.75],[74.67,147.22],[72.61,147.22],[69.87,145.85],[67.82,145.85],[48.64,139.68],[41.78,138.31],[29.46,132.84],[23.29,128.73],[13.02,117.77],[6.17,104.08],[4.11,95.18],[4.11,79.43],[5.48,73.27],[15.76,38.34],[22.60,25.33],[30.83,16.43],[38.36,10.96],[48.64,6.16]] },
        { name: 'email-tag', w: 336.9, h: 126.0, cx: 168.03, cy: 62.58, pts: [[47.17,4.20],[288.89,4.20],[331.85,61.32],[331.85,63.84],[288.89,120.96],[47.17,120.96],[4.21,63.84],[4.21,61.32]] },
        { name: 'asterisk', w: 141.3, h: 237.7, cx: 70.36, cy: 118.56, pts: [[70.65,3.57],[78.96,4.16],[86.68,6.54],[94.40,10.70],[102.71,18.42],[108.05,27.34],[110.43,35.06],[111.02,54.67],[118.74,58.24],[123.49,61.80],[130.02,68.93],[134.18,76.66],[135.96,82.01],[136.55,91.51],[137.14,92.11],[136.55,92.70],[136.55,98.05],[134.18,106.37],[131.21,112.31],[125.86,118.85],[130.61,124.79],[134.18,132.52],[135.36,137.27],[135.96,149.16],[132.99,160.45],[128.24,168.77],[123.49,174.12],[116.36,179.46],[108.65,183.03],[108.65,193.13],[108.05,193.73],[108.05,199.67],[106.87,205.02],[103.30,213.34],[99.15,219.28],[91.43,226.41],[83.71,230.57],[75.40,232.95],[67.68,233.54],[67.09,232.95],[61.74,232.95],[54.03,230.57],[46.31,226.41],[38.00,218.68],[32.65,209.77],[30.28,202.04],[29.68,182.43],[21.97,178.87],[17.22,175.30],[9.50,166.39],[6.53,160.45],[4.16,152.13],[4.16,139.05],[6.53,130.73],[9.50,124.79],[14.84,118.26],[10.09,112.31],[5.94,102.21],[4.75,96.27],[4.75,87.95],[7.72,76.66],[10.09,71.90],[14.84,65.37],[24.34,57.64],[32.06,54.08],[32.06,44.57],[32.65,43.97],[32.65,37.44],[33.84,32.09],[37.40,23.77],[41.56,17.83],[49.28,10.70],[56.99,6.54],[62.34,4.75],[70.06,4.16]] },
        { name: 'ribbon-pencil', w: 315.5, h: 320.6, cx: 182.09, cy: 139.93, pts: [[219.41,4.01],[239.43,4.01],[240.23,4.81],[248.24,5.61],[260.25,9.62],[278.66,20.04],[291.48,32.06],[298.68,41.68],[306.69,58.51],[309.89,71.33],[309.89,76.14],[310.70,76.94],[309.89,99.39],[305.09,116.22],[300.29,125.84],[290.68,139.46],[282.67,147.48],[265.05,159.50],[290.68,230.83],[285.87,300.56],[283.47,306.17],[279.47,310.98],[274.66,314.19],[269.86,315.79],[260.25,315.79],[250.64,310.98],[204.99,261.29],[203.39,254.88],[201.79,252.47],[196.19,234.84],[194.59,232.44],[188.98,214.80],[179.37,189.96],[122.52,210.79],[105.70,214.00],[93.69,214.00],[92.89,213.20],[87.28,213.20],[76.07,210.79],[57.65,202.78],[47.24,195.57],[35.23,183.54],[24.82,166.71],[13.61,134.65],[12.01,132.25],[4.00,105.80],[4.00,95.38],[6.41,87.36],[9.61,81.75],[16.82,74.54],[24.02,70.53],[45.64,63.32],[48.05,61.72],[60.06,59.31],[67.26,60.11],[74.47,62.52],[80.08,65.72],[86.48,72.14],[92.09,83.36],[99.29,107.40],[104.90,121.03],[107.30,119.42],[148.94,105.00],[149.74,104.20],[147.34,92.97],[147.34,78.55],[148.14,77.75],[148.94,68.13],[155.35,49.69],[162.55,37.67],[172.16,26.45],[188.18,14.43],[204.99,7.21]] },
        { name: 'ruler', w: 292.9, h: 582.4, cx: 145.72, cy: 290.47, pts: [[120.95,4.37],[288.53,43.68],[285.61,50.96],[284.16,64.06],[272.50,110.66],[271.04,123.76],[259.38,170.35],[257.93,183.46],[255.01,190.74],[244.81,243.15],[241.90,250.43],[241.90,256.26],[238.98,263.54],[231.70,302.85],[228.78,310.13],[228.78,315.95],[225.87,323.23],[218.58,362.54],[215.67,369.82],[215.67,375.65],[212.75,382.93],[212.75,388.75],[209.84,396.03],[202.55,435.34],[199.64,442.62],[199.64,448.45],[196.72,455.73],[196.72,461.55],[193.81,468.83],[189.44,495.04],[186.52,502.32],[186.52,508.14],[183.61,515.42],[183.61,521.25],[170.49,576.58],[2.91,537.26],[5.83,529.98],[7.29,516.88],[18.94,470.29],[20.40,457.18],[32.06,410.59],[33.52,397.49],[36.43,390.21],[46.63,337.79],[49.55,330.51],[49.55,324.69],[52.46,317.41],[59.75,278.10],[62.66,270.82],[62.66,264.99],[65.57,257.71],[72.86,218.40],[75.78,211.12],[75.78,205.30],[78.69,198.02],[85.98,158.70],[88.89,151.42],[88.89,145.60],[91.80,138.32],[91.80,132.50],[94.72,125.22],[99.09,99.01],[102.00,91.73],[102.00,85.90],[104.92,78.62],[104.92,72.80],[107.83,65.52],[107.83,59.70]] }
    ];

    document.addEventListener('DOMContentLoaded', function () {
        var box = document.querySelector('[data-hero-physics]');

        if (!box || !window.Matter) {
            return;
        }

        var Engine = Matter.Engine, World = Matter.World, Bodies = Matter.Bodies,
            Body = Matter.Body, Mouse = Matter.Mouse, MouseConstraint = Matter.MouseConstraint,
            Events = Matter.Events, Common = Matter.Common;

        // enables Bodies.fromVertices to split a concave outline (the "A", the ribbon+pencil...)
        // into the convex parts Matter's solver needs — vendored alongside matter.min.js
        if (window.decomp) {
            Common.setDecomp(window.decomp);
        }

        var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        var basePath = box.getAttribute('data-hero-physics') || '../00_assets/01_images/Homepage/hero-pieces/';
        var scale = WORLD_H / SOURCE_CANVAS_H;

        var world = document.createElement('div');
        world.className = 'hero-physics__world';
        world.style.width = WORLD_W + 'px';
        world.style.height = WORLD_H + 'px';
        box.appendChild(world);

        var restartBtn = document.createElement('button');
        restartBtn.type = 'button';
        restartBtn.className = 'hero-physics__restart';
        restartBtn.textContent = 'Drop again';
        box.appendChild(restartBtn);

        var hint = document.createElement('p');
        hint.className = 'hero-physics__hint';
        hint.textContent = 'Drag the pieces around';
        box.appendChild(hint);

        var engine = Engine.create();
        engine.gravity.y = 1;
        // reduced motion: let bodies actually go to sleep once they land, instead of running
        // them forever just to hold them motionless (enableSleeping is what lets the idle
        // jitter below keep happening, so it stays on otherwise)
        engine.enableSleeping = reduceMotion;
        // There are only 8 bodies total, several of them concave (decomposed into multiple convex
        // parts internally), landing in a pile tight enough that many of them touch several
        // neighbours at once. Matter's default solver iteration counts (6/4/2) are tuned for many
        // simple bodies and don't fully resolve that many simultaneous contacts — the pile ends up
        // with a couple of px of real, lasting overlap between bodies rather than a rendering bug.
        // Since the body count here is tiny, solving much harder every frame costs nothing visible
        // in exchange for actually pushing every contact apart.
        engine.positionIterations = 30;
        engine.velocityIterations = 20;
        engine.constraintIterations = 8;

        // Once a piece has landed it must never leave the box again — including on a hard
        // drag-throw upward — but a ceiling sitting across y=0 from the start would also catch
        // every piece on its very first entrance, since they all fall in from off-screen above.
        // Collision categories solve both at once: the ceiling only collides with CAT_SETTLED,
        // and each piece starts as plain CAT_PIECE (ignoring the ceiling) until the moment it
        // first crosses into the box, when its category flips to CAT_SETTLED for good.
        var CAT_PIECE = 0x0002;
        var CAT_SETTLED = 0x0004;
        var CAT_CEILING = 0x0008;

        // The "A" always belongs on the right, every other piece always on the left — aRight/aLeft
        // set where the "A"'s own column sits, DIVIDER_X the hard line between the two sides.
        var aWidth = PIECES[0].w * scale; // letter-a is PIECES[0]
        var aRight = WORLD_W - 60;
        var aLeft = aRight - aWidth;
        var leftZoneMax = aLeft - 40;
        var DIVIDER_X = aLeft - 20;

        var walls = [
            Bodies.rectangle(WORLD_W / 2, WORLD_H + WALL / 2, WORLD_W + WALL * 2, WALL, { isStatic: true }),
            Bodies.rectangle(WORLD_W / 2, -WALL / 2, WORLD_W + WALL * 2, WALL, { isStatic: true, collisionFilter: { category: CAT_CEILING } }),
            Bodies.rectangle(-WALL / 2, WORLD_H / 2, WALL, WORLD_H + WALL * 2, { isStatic: true }),
            Bodies.rectangle(WORLD_W + WALL / 2, WORLD_H / 2, WALL, WORLD_H + WALL * 2, { isStatic: true }),
            // The one request that must hold at all times, not just on the initial drop: the "A"
            // never ends up left of everything else. A soft, starting-position-only preference let
            // the "A" get shoved left by the pile crowding it (seven pieces packed left of it,
            // pushing back), which then shrank the pile's own room even further — a compounding
            // squeeze. A real, permanent, invisible partition (full height, so nothing ever drops
            // in from directly above and gets caught on it) fixes the requirement outright and
            // gives the pile a guaranteed, un-shrinkable floor to settle on.
            Bodies.rectangle(DIVIDER_X, WORLD_H / 2, 20, WORLD_H + WALL * 2, { isStatic: true })
        ];
        World.add(engine.world, walls);

        function startXFor(index) {
            if (index === 0) {
                return aLeft + aWidth / 2 + (Math.random() - 0.5) * 30;
            }
            return 70 + Math.random() * Math.max(60, leftZoneMax - 70);
        }

        // Bigger pieces land first and form a base the smaller ones settle into and around, the
        // way stacking real objects works best biggest-first — rank 0 lands soonest. The "A" (index
        // 0) sits outside this: it has the whole right side to itself, so drop order doesn't matter
        // for it.
        var dropRank = PIECES.map(function (p, i) { return i; })
            .filter(function (i) { return i !== 0; })
            .sort(function (i, j) { return (PIECES[j].w * PIECES[j].h) - (PIECES[i].w * PIECES[i].h); });
        var rankOf = {};
        dropRank.forEach(function (i, rank) { rankOf[i] = rank; });

        // Each piece's *exact* concave outline was tried first as its collision shape (via
        // Matter's poly-decomp), but the traced boundary carries the original artwork's own
        // hand-drawn wobble — tiny in-and-out zigzags along what reads as a straight edge — and
        // decomposing that at full fidelity split some pieces (the ruler, worst of all) into 15-24
        // slivers of convex parts. With seven pieces landing in the room the "A" doesn't take,
        // that many contacts between that many slivers is more than the solver can fully keep
        // apart every frame, and the couple of px it can't resolve reads as one piece's artwork
        // torn or bitten into by its neighbour.
        //
        // Using each piece's convex hull as its collision shape instead trades away letting a
        // neighbour's ink rest inside a piece's own concave notches (the "A"'s counter, the
        // ribbon's loop) for a hull that's a single simple part, always fully containing the true
        // ink (a hull can only be equal to or larger than the shape it wraps, never smaller), and
        // trivial for the solver to keep separated from its neighbours — so two touching hulls can
        // never let ink actually overlap. The rendered image itself is untouched either way.
        var HULL_MARGIN = 5; // original-artwork units, applied before the display `scale`
        function convexHull(pts, cx, cy, margin) {
            var grown = pts.map(function (pt) {
                var dx = pt[0] - cx, dy = pt[1] - cy;
                var len = Math.sqrt(dx * dx + dy * dy);
                var factor = len < 0.01 ? 1 : (len + margin) / len;
                return { x: cx + dx * factor, y: cy + dy * factor };
            });
            return Matter.Vertices.hull(grown);
        }

        var pieces = PIECES.map(function (p, index) {
            var w = p.w * scale, h = p.h * scale;
            var startX = startXFor(index);
            // Staggered so they cascade in rather than land in one thud — and staggered by a lot:
            // a 140-unit head start only bought about 100ms between two pieces actually reaching
            // the floor (most of the height difference is covered while both are still
            // accelerating), so all seven were effectively arriving within the same ~second and
            // asking the solver to settle a crowd at once, rather than one piece at a time onto an
            // already-resting pile — the harder problem is exactly where the persistent overlap
            // was coming from. Ordered by dropRank (biggest first), not array position.
            var order = index === 0 ? 0 : rankOf[index];
            var startY = -h - order * 480 - Math.random() * 150;

            var hull = convexHull(p.pts, p.cx, p.cy, HULL_MARGIN);
            var verts = hull.map(function (pt) {
                return { x: pt.x * scale, y: pt.y * scale };
            });
            // Bodies.fromVertices centres the body on whatever polygon it's actually given — the
            // hull's own centre of mass, not the true artwork's (p.cx/p.cy), since growing the
            // outline and taking its convex hull shifts the centroid, especially for an asymmetric
            // concave piece (the ribbon+pencil, the asterisk). The wrapper below pivots at the
            // body's position, so the image offset has to be measured from *this* centre, not the
            // artwork's, or the art renders off its own physics pivot and swings further out of
            // place as the piece rotates.
            var hullCentre = Matter.Vertices.centre(hull);

            var body = Bodies.fromVertices(startX, startY, [verts], {
                restitution: 0.38,
                friction: 0.5,
                frictionAir: 0.018,
                angle: (Math.random() - 0.5) * 1.2,
                // mask omits only CAT_CEILING: it still collides with the floor/side walls,
                // other still-falling pieces, AND anything already CAT_SETTLED — otherwise a
                // later piece would fall straight through one that landed ahead of it
                collisionFilter: { category: CAT_PIECE, mask: 0x0001 | CAT_PIECE | CAT_SETTLED }
            });

            // Render as a wrapper (moved+rotated to the body, pivoting at its own top-left = the
            // body's centre) containing the actual <img>, offset by the fixed, never-rotating
            // vector from that centre to the image's top-left corner — the wrapper's own rotation
            // then carries the image around correctly, exactly as the physics body rotates.
            var wrapper = document.createElement('div');
            wrapper.className = 'hero-physics__piece-wrap';
            world.appendChild(wrapper);

            var img = document.createElement('img');
            img.className = 'hero-physics__piece';
            img.src = basePath + p.name + '.svg';
            img.alt = '';
            img.style.width = w + 'px';
            img.style.height = h + 'px';
            img.style.left = (-hullCentre.x * scale) + 'px';
            img.style.top = (-hullCentre.y * scale) + 'px';
            wrapper.appendChild(img);

            return { body: body, el: wrapper, entered: false, nextNudge: performance.now() + 1500 + Math.random() * 2500 };
        });

        World.add(engine.world, pieces.map(function (p) { return p.body; }));

        window.__heroDebug = { engine: engine, pieces: pieces, Matter: Matter };

        // Stacking order. This is a 2D simulation — there's no real depth, only paint order — so
        // rather than a fixed order (which meant whichever piece happened to be added to the page
        // last always painted on top, even sitting well behind another piece it's now resting
        // against), each piece's z-index is set the moment it actually lands, and bumped again
        // if the visitor picks it up: last one down (or last one held) reads as being on top,
        // matching how a real pile of stickers would look.
        var nextZ = 1;

        // ---- dragging -----------------------------------------------------------------------
        // The mouse element is the box itself (not the scaled world), so raw event coordinates
        // are in screen px; Matter.Mouse can scale those into world units for us via mouse.scale,
        // which we keep in sync with the CSS scale applied to the world layer.
        var mouse = Mouse.create(box);

        // Matter.Mouse also binds a 'wheel' handler (for canvas zoom/pan controls we have no use
        // for) that calls event.preventDefault() unconditionally — that blocks the page's normal
        // scroll wheel the moment the cursor is over the box. mouse.mousewheel is still the exact
        // function reference Mouse.create just bound, so this un-registers only that listener.
        box.removeEventListener('wheel', mouse.mousewheel);
        var mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
        });
        World.add(engine.world, mouseConstraint);

        // Matter.Mouse binds mousemove/mousedown/mouseup to a single element (the box). That's
        // right for starting a drag (only clicks inside the box should grab a piece), but a drag
        // that carries the cursor up out of the box — dragging something toward the top edge is
        // the obvious way to do that — means the eventual mouseup lands on whatever's outside the
        // box instead, which Matter never hears, so the piece would stay stuck to the cursor
        // forever. These two listeners are a release-only safety net: they feed the same event
        // straight to Matter's own handler so a release always registers no matter where the
        // cursor ends up.
        window.addEventListener('mouseup', mouse.mouseup);
        window.addEventListener('touchend', mouse.mouseup);

        // waking a body the visitor is holding, and giving whatever they release a little life,
        // both matter more once sleeping is disabled — but keeping the API call is harmless and
        // documents the intent if sleeping is ever turned back on
        Events.on(mouseConstraint, 'startdrag', function (e) {
            Body.setAngularVelocity(e.body, 0);

            // bring whatever's being handled to the front — see nextZ below
            var held = pieces.filter(function (p) { return p.body === e.body; })[0];

            if (held) {
                held.el.style.zIndex = nextZ++;
            }
        });

        function syncScale() {
            var rect = box.getBoundingClientRect();
            var s = rect.width / WORLD_W;
            world.style.transform = 'scale(' + s + ')';
            mouse.scale = { x: 1 / s, y: 1 / s };
        }

        syncScale();
        window.addEventListener('resize', syncScale);

        // ---- idle life: small random nudges so nothing ever looks fully dead ----------------
        function nudge(now) {
            if (reduceMotion) {
                return;
            }

            pieces.forEach(function (p) {
                if (now < p.nextNudge) {
                    return;
                }

                p.nextNudge = now + 2200 + Math.random() * 3600;

                // skip anything currently being dragged
                if (mouseConstraint.body === p.body) {
                    return;
                }

                var speed = Math.hypot(p.body.velocity.x, p.body.velocity.y);

                // only nudge things that have actually come to rest, so the initial drop
                // and any drag-throw still play out with real physics first
                if (speed > 0.6) {
                    return;
                }

                Body.applyForce(p.body, p.body.position, {
                    x: (Math.random() - 0.5) * 0.0022 * p.body.mass,
                    y: -Math.random() * 0.002 * p.body.mass
                });
                Body.setAngularVelocity(p.body, p.body.angularVelocity + (Math.random() - 0.5) * 0.03);
            });
        }

        // once a piece's centre first crosses into the box, seal it in behind the ceiling for
        // the rest of its life — checked every frame, but it's a single comparison per piece
        // and only ever flips once
        function sealEntered() {
            pieces.forEach(function (p) {
                if (!p.entered && p.body.position.y > 0) {
                    p.entered = true;
                    Body.set(p.body, 'collisionFilter', { category: CAT_SETTLED, mask: 0x0001 | CAT_PIECE | CAT_SETTLED | CAT_CEILING });
                    p.el.style.zIndex = nextZ++;
                }
            });
        }

        // ---- render loop: read body transforms onto the DOM elements ------------------------
        function render() {
            pieces.forEach(function (p) {
                var b = p.body;
                p.el.style.transform = 'translate(' + b.position.x + 'px, ' + b.position.y + 'px) rotate(' + b.angle + 'rad)';
            });
        }

        var running = true;
        var lastTime = performance.now();

        function tick(now) {
            if (!running) {
                return;
            }

            var delta = Math.min(now - lastTime, 33);
            lastTime = now;
            Engine.update(engine, delta);
            sealEntered();
            nudge(now);
            render();
            requestAnimationFrame(tick);
        }

        // don't spend CPU animating a box that's scrolled out of view
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && !running) {
                        running = true;
                        lastTime = performance.now();
                        requestAnimationFrame(tick);
                    } else if (!entry.isIntersecting) {
                        running = false;
                    }
                });
            }, { threshold: 0.05 }).observe(box);
        }

        requestAnimationFrame(tick);

        restartBtn.addEventListener('click', function () {
            pieces.forEach(function (p, index) {
                var order = index === 0 ? 0 : rankOf[index];
                p.entered = false;
                Body.set(p.body, 'collisionFilter', { category: CAT_PIECE, mask: 0x0001 | CAT_PIECE | CAT_SETTLED });
                Body.setPosition(p.body, {
                    x: startXFor(index),
                    y: -80 - order * 480 - Math.random() * 150
                });
                Body.setAngle(p.body, (Math.random() - 0.5) * 1.2);
                Body.setVelocity(p.body, { x: 0, y: 0 });
                Body.setAngularVelocity(p.body, 0);
                p.nextNudge = performance.now() + 1500 + Math.random() * 2500;
            });
        });

        if (reduceMotion) {
            // still let them drop once and settle, just skip the perpetual jitter afterwards
            hint.textContent = 'Drag the pieces around';
        }
    });
})();
