window.initDebugC64 = function (Module) {
    var f;
    f ||= typeof Module != "undefined" ? Module : {};
    var aa = "object" == typeof window,
        ba = "function" == typeof importScripts,
        ca =
            "object" == typeof process &&
            "object" == typeof process.versions &&
            "string" == typeof process.versions.node &&
            "renderer" != process.type,
        da = Object.assign({}, f),
        ea = [],
        fa = "./this.program",
        ha = (a, b) => {
            throw b;
        },
        k = "",
        ia,
        ja;
    if (ca) {
        var fs = require("fs"),
            ka = require("path");
        k = __dirname + "/";
        ja = (a) => {
            a = la(a) ? new URL(a) : ka.normalize(a);
            return fs.readFileSync(a);
        };
        ia = (a) => {
            a = la(a) ? new URL(a) : ka.normalize(a);
            return new Promise((b, c) => {
                fs.readFile(a, void 0, (d, e) => {
                    d ? c(d) : b(e.buffer);
                });
            });
        };
        !f.thisProgram &&
            1 < process.argv.length &&
            (fa = process.argv[1].replace(/\\/g, "/"));
        ea = process.argv.slice(2);
        "undefined" != typeof module && (module.exports = f);
        ha = (a, b) => {
            process.exitCode = a;
            throw b;
        };
    } else if (aa || ba)
        ba
            ? (k = self.location.href)
            : "undefined" != typeof document &&
              document.currentScript &&
              (k = document.currentScript.src),
            (k = k.startsWith("blob:")
                ? ""
                : k.substr(0, k.replace(/[?#].*/, "").lastIndexOf("/") + 1)),
            ba &&
                (ja = (a) => {
                    var b = new XMLHttpRequest();
                    b.open("GET", a, !1);
                    b.responseType = "arraybuffer";
                    b.send(null);
                    return new Uint8Array(b.response);
                }),
            (ia = (a) =>
                la(a)
                    ? new Promise((b, c) => {
                          var d = new XMLHttpRequest();
                          d.open("GET", a, !0);
                          d.responseType = "arraybuffer";
                          d.onload = () => {
                              200 == d.status || (0 == d.status && d.response)
                                  ? b(d.response)
                                  : c(d.status);
                          };
                          d.onerror = c;
                          d.send(null);
                      })
                    : fetch(a, { credentials: "same-origin" }).then((b) =>
                          b.ok
                              ? b.arrayBuffer()
                              : Promise.reject(Error(b.status + " : " + b.url))
                      ));
    var ma = f.print || console.log.bind(console),
        n = f.printErr || console.error.bind(console);
    Object.assign(f, da);
    da = null;
    f.arguments && (ea = f.arguments);
    f.thisProgram && (fa = f.thisProgram);
    var na = f.wasmBinary,
        oa,
        q = !1,
        pa,
        r,
        t,
        qa,
        ra,
        u,
        w,
        x,
        y;
    function sa() {
        var a = oa.buffer;
        f.HEAP8 = r = new Int8Array(a);
        f.HEAP16 = qa = new Int16Array(a);
        f.HEAPU8 = t = new Uint8Array(a);
        f.HEAPU16 = ra = new Uint16Array(a);
        f.HEAP32 = u = new Int32Array(a);
        f.HEAPU32 = w = new Uint32Array(a);
        f.HEAPF32 = x = new Float32Array(a);
        f.HEAPF64 = y = new Float64Array(a);
    }
    var ta = [],
        ua = [],
        va = [],
        wa = [];
    function xa() {
        var a = f.preRun;
        a && ("function" == typeof a && (a = [a]), a.forEach(ya));
        za(ta);
    }
    function ya(a) {
        ta.unshift(a);
    }
    function Aa(a) {
        wa.unshift(a);
    }
    var z = 0,
        Ba = null,
        A = null;
    function Ca(a) {
        f.onAbort?.(a);
        a = "Aborted(" + a + ")";
        n(a);
        q = !0;
        throw new WebAssembly.RuntimeError(
            a + ". Build with -sASSERTIONS for more info."
        );
    }
    var Da = (a) => a.startsWith("data:application/octet-stream;base64,"),
        la = (a) => a.startsWith("file://"),
        Ea;
    function Fa(a) {
        if (a == Ea && na) return new Uint8Array(na);
        if (ja) return ja(a);
        throw "both async and sync fetching of the wasm failed";
    }
    function Ga(a) {
        return na
            ? Promise.resolve().then(() => Fa(a))
            : ia(a).then(
                  (b) => new Uint8Array(b),
                  () => Fa(a)
              );
    }
    function Ha(a, b, c) {
        return Ga(a)
            .then((d) => WebAssembly.instantiate(d, b))
            .then(c, (d) => {
                n(`failed to asynchronously prepare wasm: ${d}`);
                Ca(d);
            });
    }
    function Ia(a, b) {
        var c = Ea;
        na ||
        "function" != typeof WebAssembly.instantiateStreaming ||
        Da(c) ||
        la(c) ||
        ca ||
        "function" != typeof fetch
            ? Ha(c, a, b)
            : fetch(c, { credentials: "same-origin" }).then((d) =>
                  WebAssembly.instantiateStreaming(d, a).then(b, function (e) {
                      n(`wasm streaming compile failed: ${e}`);
                      n("falling back to ArrayBuffer instantiation");
                      return Ha(c, a, b);
                  })
              );
    }
    var Ka = {
        101868: () => {
            const a = f._webapi_input;
            f._webapi_input = (b) => {
                Ja(() => a(B(b)));
            };
        },
    };
    function La(a) {
        this.name = "ExitStatus";
        this.message = `Program terminated with exit(${a})`;
        this.status = a;
    }
    var za = (a) => {
            a.forEach((b) => b(f));
        },
        Ma = f.noExitRuntime || !0,
        Na = "undefined" != typeof TextDecoder ? new TextDecoder() : void 0,
        C = (a, b = 0, c = NaN) => {
            var d = b + c;
            for (c = b; a[c] && !(c >= d); ) ++c;
            if (16 < c - b && a.buffer && Na)
                return Na.decode(a.subarray(b, c));
            for (d = ""; b < c; ) {
                var e = a[b++];
                if (e & 128) {
                    var h = a[b++] & 63;
                    if (192 == (e & 224))
                        d += String.fromCharCode(((e & 31) << 6) | h);
                    else {
                        var g = a[b++] & 63;
                        e =
                            224 == (e & 240)
                                ? ((e & 15) << 12) | (h << 6) | g
                                : ((e & 7) << 18) |
                                  (h << 12) |
                                  (g << 6) |
                                  (a[b++] & 63);
                        65536 > e
                            ? (d += String.fromCharCode(e))
                            : ((e -= 65536),
                              (d += String.fromCharCode(
                                  55296 | (e >> 10),
                                  56320 | (e & 1023)
                              )));
                    }
                } else d += String.fromCharCode(e);
            }
            return d;
        },
        D = {},
        Oa = (a) => {
            a instanceof La || "unwind" == a || ha(1, a);
        },
        Pa = 0,
        Qa = (a) => {
            pa = a;
            Ma || 0 < Pa || (f.onExit?.(a), (q = !0));
            ha(a, new La(a));
        },
        Ra = (a) => {
            pa = a;
            Qa(a);
        },
        Sa = () => {
            if (!(Ma || 0 < Pa))
                try {
                    var a = pa;
                    pa = a;
                    Qa(a);
                } catch (b) {
                    Oa(b);
                }
        },
        Ta = (a) => {
            if (!q)
                try {
                    a(), Sa();
                } catch (b) {
                    Oa(b);
                }
        },
        Ua = [],
        bb = (a, b) => {
            Va = a;
            Wa = b;
            if (E)
                if (((Xa ||= !0), 0 == a))
                    F = function () {
                        setTimeout(
                            Ya,
                            Math.max(0, Za + b - performance.now()) | 0
                        );
                    };
                else if (1 == a)
                    F = function () {
                        $a(Ya);
                    };
                else if (2 == a) {
                    if ("undefined" == typeof ab)
                        if ("undefined" == typeof setImmediate) {
                            var c = [];
                            addEventListener(
                                "message",
                                (d) => {
                                    if (
                                        "setimmediate" === d.data ||
                                        "setimmediate" === d.data.target
                                    )
                                        d.stopPropagation(), c.shift()();
                                },
                                !0
                            );
                            ab = (d) => {
                                c.push(d);
                                if (ba) {
                                    let e;
                                    (e = f).setImmediates ??
                                        (e.setImmediates = []);
                                    f.setImmediates.push(d);
                                    postMessage({ target: "setimmediate" });
                                } else postMessage("setimmediate", "*");
                            };
                        } else ab = setImmediate;
                    F = function () {
                        ab(Ya);
                    };
                }
        },
        kb = (a, b, c, d, e) => {
            function h() {
                return g < cb ? (Sa(), !1) : !0;
            }
            E = a;
            db = d;
            var g = cb;
            Xa = !1;
            Ya = function () {
                if (!q)
                    if (0 < eb.length) {
                        var l = eb.shift();
                        l.te(l.je);
                        if (fb) {
                            var m = fb,
                                p = 0 == m % 1 ? m - 1 : Math.floor(m);
                            fb = l.le ? p : (8 * m + (p + 0.5)) / 9;
                        }
                        f.setStatus &&
                            ((l = f.statusMessage || "Please wait..."),
                            (m = fb ?? 0),
                            (p = gb.re ?? 0),
                            m
                                ? m < p
                                    ? f.setStatus(
                                          "{message} ({expected - remaining}/{expected})"
                                      )
                                    : f.setStatus(l)
                                : f.setStatus(""));
                        h() && setTimeout(Ya, 0);
                    } else if (h())
                        if (
                            ((hb = (hb + 1) | 0),
                            1 == Va && 1 < Wa && 0 != hb % Wa)
                        )
                            F();
                        else {
                            0 == Va && (Za = performance.now());
                            a: if (!q) {
                                for (l of ib) if (!1 === l()) break a;
                                Ta(a);
                                for (m of jb) m();
                            }
                            h() && F();
                        }
            };
            e || (b && 0 < b ? bb(0, 1e3 / b) : bb(1, 1), F());
            if (c) throw "unwind";
        },
        Xa = !1,
        F = null,
        cb = 0,
        E = null,
        db = 0,
        Va = 0,
        Wa = 0,
        hb = 0,
        eb = [],
        ib = [],
        jb = [];
    function lb() {
        F = null;
        cb++;
    }
    var mb = 0;
    function $a(a) {
        if ("function" == typeof requestAnimationFrame)
            requestAnimationFrame(a);
        else {
            var b = Date.now();
            if (0 === mb) mb = b + 1e3 / 60;
            else for (; b + 2 >= mb; ) mb += 1e3 / 60;
            setTimeout(a, Math.max(mb - b, 0));
        }
    }
    var gb = {},
        Za,
        Ya,
        ab,
        fb;
    function nb(a) {
        var b = H.hd[a];
        b.target.removeEventListener(b.gd, b.Ld, b.jd);
        H.hd.splice(a, 1);
    }
    function ob() {
        if (
            navigator.userActivation
                ? navigator.userActivation.isActive
                : H.zd && H.ae.xd
        ) {
            var a = H.od;
            H.od = [];
            for (var b of a) b.Cd(...b.Hd);
        }
    }
    function I(a) {
        if (!a.target) return -4;
        if (a.kd)
            (a.Ld = function (c) {
                ++H.zd;
                H.ae = a;
                ob();
                a.ld(c);
                ob();
                --H.zd;
            }),
                a.target.addEventListener(a.gd, a.Ld, a.jd),
                H.hd.push(a);
        else
            for (var b = 0; b < H.hd.length; ++b)
                H.hd[b].target == a.target && H.hd[b].gd == a.gd && nb(b--);
        return 0;
    }
    function pb(a) {
        return a
            ? a == window
                ? "#window"
                : a == screen
                ? "#screen"
                : a?.nodeName || ""
            : "";
    }
    var H = {
            ke: 0,
            ue: 0,
            Ad: 0,
            vd: 0,
            Gd: 0,
            Ed: 0,
            yd: 0,
            pe: 0,
            xe: 0,
            oe: 0,
            se: 0,
            Bd: 0,
            Fe: 0,
            Dd: 0,
            ze() {
                for (; H.hd.length; ) nb(H.hd.length - 1);
                H.od = [];
            },
            zd: 0,
            od: [],
            ne(a, b, c) {
                function d(h, g) {
                    if (h.length != g.length) return !1;
                    for (var l in h) if (h[l] != g[l]) return !1;
                    return !0;
                }
                for (var e of H.od) if (e.Cd == a && d(e.Hd, c)) return;
                H.od.push({ Cd: a, Rd: b, Hd: c });
                H.od.sort((h, g) => h.Rd < g.Rd);
            },
            Be(a) {
                H.od = H.od.filter((b) => b.Cd != a);
            },
            hd: [],
            Ae: (a, b) => {
                for (var c = 0; c < H.hd.length; ++c)
                    H.hd[c].target != a || (b && b != H.hd[c].gd) || nb(c--);
            },
            fullscreenEnabled() {
                return (
                    document.fullscreenEnabled ||
                    document.webkitFullscreenEnabled
                );
            },
        },
        qb = [
            0,
            "undefined" != typeof document ? document : 0,
            "undefined" != typeof window ? window : 0,
        ],
        J = (a) => {
            a = 2 < a ? (a ? C(t, a) : "") : a;
            return (
                qb[a] ||
                ("undefined" != typeof document
                    ? document.querySelector(a)
                    : void 0)
            );
        },
        rb = (a) =>
            0 > qb.indexOf(a) ? a.getBoundingClientRect() : { left: 0, top: 0 },
        sb = [],
        tb,
        K = (a) => {
            var b = sb[a];
            b ||
                (a >= sb.length && (sb.length = a + 1),
                (sb[a] = b = tb.get(a)));
            return b;
        },
        L = (a, b, c) => {
            var d = t;
            if (!(0 < c)) return 0;
            var e = b;
            c = b + c - 1;
            for (var h = 0; h < a.length; ++h) {
                var g = a.charCodeAt(h);
                if (55296 <= g && 57343 >= g) {
                    var l = a.charCodeAt(++h);
                    g = (65536 + ((g & 1023) << 10)) | (l & 1023);
                }
                if (127 >= g) {
                    if (b >= c) break;
                    d[b++] = g;
                } else {
                    if (2047 >= g) {
                        if (b + 1 >= c) break;
                        d[b++] = 192 | (g >> 6);
                    } else {
                        if (65535 >= g) {
                            if (b + 2 >= c) break;
                            d[b++] = 224 | (g >> 12);
                        } else {
                            if (b + 3 >= c) break;
                            d[b++] = 240 | (g >> 18);
                            d[b++] = 128 | ((g >> 12) & 63);
                        }
                        d[b++] = 128 | ((g >> 6) & 63);
                    }
                    d[b++] = 128 | (g & 63);
                }
            }
            d[b] = 0;
            return b - e;
        },
        ub = (a, b, c, d, e, h) => {
            H.yd || (H.yd = M(256));
            a = {
                target: J(a),
                gd: h,
                kd: d,
                ld: (g = event) => {
                    var l = g.target.id ? g.target.id : "",
                        m = H.yd;
                    L(pb(g.target), m + 0, 128);
                    L(l, m + 128, 128);
                    K(d)(e, m, b) && g.preventDefault();
                },
                jd: c,
            };
            return I(a);
        },
        vb = (a, b, c, d, e, h) => {
            H.Ad || (H.Ad = M(160));
            a = {
                target: J(a),
                gd: h,
                kd: d,
                ld: (g) => {
                    var l = H.Ad;
                    y[l >> 3] = g.timeStamp;
                    var m = l >> 2;
                    u[m + 2] = g.location;
                    r[l + 12] = g.ctrlKey;
                    r[l + 13] = g.shiftKey;
                    r[l + 14] = g.altKey;
                    r[l + 15] = g.metaKey;
                    r[l + 16] = g.repeat;
                    u[m + 5] = g.charCode;
                    u[m + 6] = g.keyCode;
                    u[m + 7] = g.which;
                    L(g.key || "", l + 32, 32);
                    L(g.code || "", l + 64, 32);
                    L(g.char || "", l + 96, 32);
                    L(g.locale || "", l + 128, 32);
                    K(d)(e, l, b) && g.preventDefault();
                },
                jd: c,
            };
            return I(a);
        },
        wb = (a, b, c) => {
            y[a >> 3] = b.timeStamp;
            var d = a >> 2;
            u[d + 2] = b.screenX;
            u[d + 3] = b.screenY;
            u[d + 4] = b.clientX;
            u[d + 5] = b.clientY;
            r[a + 24] = b.ctrlKey;
            r[a + 25] = b.shiftKey;
            r[a + 26] = b.altKey;
            r[a + 27] = b.metaKey;
            qa[2 * d + 14] = b.button;
            qa[2 * d + 15] = b.buttons;
            u[d + 8] = b.movementX;
            u[d + 9] = b.movementY;
            a = rb(c);
            u[d + 10] = b.clientX - (a.left | 0);
            u[d + 11] = b.clientY - (a.top | 0);
        },
        xb = (a, b, c, d, e, h) => {
            H.vd || (H.vd = M(64));
            a = J(a);
            return I({
                target: a,
                xd: "mousemove" != h && "mouseenter" != h && "mouseleave" != h,
                gd: h,
                kd: d,
                ld: (g = event) => {
                    wb(H.vd, g, a);
                    K(d)(e, H.vd, b) && g.preventDefault();
                },
                jd: c,
            });
        },
        yb = (a, b, c, d, e) => {
            H.Bd || (H.Bd = M(257));
            return I({
                target: a,
                gd: e,
                kd: d,
                ld: (h = event) => {
                    var g = H.Bd,
                        l =
                            document.pointerLockElement ||
                            document.qd ||
                            document.Nd ||
                            document.Md;
                    r[g] = !!l;
                    var m = l?.id || "";
                    L(pb(l), g + 1, 128);
                    L(m, g + 129, 128);
                    K(d)(20, g, b) && h.preventDefault();
                },
                jd: c,
            });
        },
        zb = (a, b, c, d, e) =>
            I({
                target: a,
                gd: e,
                kd: d,
                ld: (h = event) => {
                    K(d)(38, 0, b) && h.preventDefault();
                },
                jd: c,
            }),
        Ab = (a, b, c, d) => {
            H.Ed || (H.Ed = M(36));
            a = J(a);
            return I({
                target: a,
                gd: "resize",
                kd: d,
                ld: (e = event) => {
                    if (e.target == a) {
                        var h = document.body;
                        if (h) {
                            var g = H.Ed;
                            u[g >> 2] = 0;
                            u[(g + 4) >> 2] = h.clientWidth;
                            u[(g + 8) >> 2] = h.clientHeight;
                            u[(g + 12) >> 2] = innerWidth;
                            u[(g + 16) >> 2] = innerHeight;
                            u[(g + 20) >> 2] = outerWidth;
                            u[(g + 24) >> 2] = outerHeight;
                            u[(g + 28) >> 2] = pageXOffset | 0;
                            u[(g + 32) >> 2] = pageYOffset | 0;
                            K(d)(10, g, b) && e.preventDefault();
                        }
                    }
                },
                jd: c,
            });
        },
        Bb = (a, b, c, d, e, h) => {
            H.Dd || (H.Dd = M(1552));
            a = J(a);
            return I({
                target: a,
                xd: "touchstart" == h || "touchend" == h,
                gd: h,
                kd: d,
                ld: (g) => {
                    var l = {},
                        m = g.touches;
                    for (var p of m) (p.Od = p.Qd = 0), (l[p.identifier] = p);
                    for (var v of g.changedTouches)
                        (v.Od = 1), (l[v.identifier] = v);
                    for (var Q of g.targetTouches) l[Q.identifier].Qd = 1;
                    m = H.Dd;
                    y[m >> 3] = g.timeStamp;
                    r[m + 12] = g.ctrlKey;
                    r[m + 13] = g.shiftKey;
                    r[m + 14] = g.altKey;
                    r[m + 15] = g.metaKey;
                    p = m + 16;
                    v = rb(a);
                    Q = 0;
                    for (let G of Object.values(l))
                        if (
                            ((l = p >> 2),
                            (u[l] = G.identifier),
                            (u[l + 1] = G.screenX),
                            (u[l + 2] = G.screenY),
                            (u[l + 3] = G.clientX),
                            (u[l + 4] = G.clientY),
                            (u[l + 5] = G.pageX),
                            (u[l + 6] = G.pageY),
                            (r[p + 28] = G.Od),
                            (r[p + 29] = G.Qd),
                            (u[l + 8] = G.clientX - (v.left | 0)),
                            (u[l + 9] = G.clientY - (v.top | 0)),
                            (p += 48),
                            31 < ++Q)
                        )
                            break;
                    u[(m + 8) >> 2] = Q;
                    K(d)(e, m, b) && g.preventDefault();
                },
                jd: c,
            });
        },
        N,
        Cb = (a) => {
            var b = a.getExtension("ANGLE_instanced_arrays");
            b &&
                ((a.vertexAttribDivisor = (c, d) =>
                    b.vertexAttribDivisorANGLE(c, d)),
                (a.drawArraysInstanced = (c, d, e, h) =>
                    b.drawArraysInstancedANGLE(c, d, e, h)),
                (a.drawElementsInstanced = (c, d, e, h, g) =>
                    b.drawElementsInstancedANGLE(c, d, e, h, g)));
        },
        Db = (a) => {
            var b = a.getExtension("OES_vertex_array_object");
            b &&
                ((a.createVertexArray = () => b.createVertexArrayOES()),
                (a.deleteVertexArray = (c) => b.deleteVertexArrayOES(c)),
                (a.bindVertexArray = (c) => b.bindVertexArrayOES(c)),
                (a.isVertexArray = (c) => b.isVertexArrayOES(c)));
        },
        Eb = (a) => {
            var b = a.getExtension("WEBGL_draw_buffers");
            b && (a.drawBuffers = (c, d) => b.drawBuffersWEBGL(c, d));
        },
        Fb = (a) => {
            a.qe = a.getExtension(
                "WEBGL_draw_instanced_base_vertex_base_instance"
            );
        },
        Gb = (a) => {
            a.ve = a.getExtension(
                "WEBGL_multi_draw_instanced_base_vertex_base_instance"
            );
        },
        Hb = (a) => {
            var b =
                "ANGLE_instanced_arrays EXT_blend_minmax EXT_disjoint_timer_query EXT_frag_depth EXT_shader_texture_lod EXT_sRGB OES_element_index_uint OES_fbo_render_mipmap OES_standard_derivatives OES_texture_float OES_texture_half_float OES_texture_half_float_linear OES_vertex_array_object WEBGL_color_buffer_float WEBGL_depth_texture WEBGL_draw_buffers EXT_color_buffer_float EXT_conservative_depth EXT_disjoint_timer_query_webgl2 EXT_texture_norm16 NV_shader_noperspective_interpolation WEBGL_clip_cull_distance EXT_clip_control EXT_color_buffer_half_float EXT_depth_clamp EXT_float_blend EXT_polygon_offset_clamp EXT_texture_compression_bptc EXT_texture_compression_rgtc EXT_texture_filter_anisotropic KHR_parallel_shader_compile OES_texture_float_linear WEBGL_blend_func_extended WEBGL_compressed_texture_astc WEBGL_compressed_texture_etc WEBGL_compressed_texture_etc1 WEBGL_compressed_texture_s3tc WEBGL_compressed_texture_s3tc_srgb WEBGL_debug_renderer_info WEBGL_debug_shaders WEBGL_lose_context WEBGL_multi_draw WEBGL_polygon_mode".split(
                    " "
                );
            return (a.getSupportedExtensions() || []).filter((c) =>
                b.includes(c)
            );
        },
        Ib = 1,
        Jb = [],
        O = [],
        Kb = [],
        Lb = [],
        P = [],
        R = [],
        Mb = [],
        Nb = [],
        S = [],
        Ob = {},
        Pb = 4,
        Qb = 0,
        Rb = (a) => {
            for (var b = Ib++, c = a.length; c < b; c++) a[c] = null;
            return b;
        },
        U = (a, b, c, d) => {
            for (var e = 0; e < a; e++) {
                var h = N[c](),
                    g = h && Rb(d);
                h ? ((h.name = g), (d[g] = h)) : (T ||= 1282);
                u[(b + 4 * e) >> 2] = g;
            }
        },
        Tb = (a, b) => {
            a.qd ||
                ((a.qd = a.getContext),
                (a.getContext = function (d, e) {
                    e = a.qd(d, e);
                    return ("webgl" == d) == e instanceof WebGLRenderingContext
                        ? e
                        : null;
                }));
            var c =
                1 < b.Pd ? a.getContext("webgl2", b) : a.getContext("webgl", b);
            return c ? Sb(c, b) : 0;
        },
        Sb = (a, b) => {
            var c = Rb(Nb),
                d = { handle: c, attributes: b, version: b.Pd, wd: a };
            a.canvas && (a.canvas.ie = d);
            Nb[c] = d;
            ("undefined" == typeof b.Kd || b.Kd) && Ub(d);
            return c;
        },
        Ub = (a) => {
            a ||= V;
            if (!a.fe) {
                a.fe = !0;
                var b = a.wd;
                b.ge = b.getExtension("WEBGL_multi_draw");
                b.ee = b.getExtension("EXT_polygon_offset_clamp");
                b.de = b.getExtension("EXT_clip_control");
                b.he = b.getExtension("WEBGL_polygon_mode");
                Cb(b);
                Db(b);
                Eb(b);
                Fb(b);
                Gb(b);
                2 <= a.version &&
                    (b.Jd = b.getExtension("EXT_disjoint_timer_query_webgl2"));
                if (2 > a.version || !b.Jd)
                    b.Jd = b.getExtension("EXT_disjoint_timer_query");
                Hb(b).forEach((c) => {
                    c.includes("lose_context") ||
                        c.includes("debug") ||
                        b.getExtension(c);
                });
            }
        },
        T,
        V,
        Vb = (a, b, c, d, e, h) => {
            a = {
                target: J(a),
                gd: h,
                kd: d,
                ld: (g = event) => {
                    K(d)(e, 0, b) && g.preventDefault();
                },
                jd: c,
            };
            I(a);
        },
        Wb = (a, b, c, d) => {
            H.Gd || (H.Gd = M(96));
            return I({
                target: a,
                xd: !0,
                gd: "wheel",
                kd: d,
                ld: (e = event) => {
                    var h = H.Gd;
                    wb(h, e, a);
                    y[(h + 64) >> 3] = e.deltaX;
                    y[(h + 72) >> 3] = e.deltaY;
                    y[(h + 80) >> 3] = e.deltaZ;
                    u[(h + 88) >> 2] = e.deltaMode;
                    K(d)(9, h, b) && e.preventDefault();
                },
                jd: c,
            });
        },
        Xb = ["default", "low-power", "high-performance"],
        Yb = {},
        $b = () => {
            if (!Zb) {
                var a = {
                        USER: "web_user",
                        LOGNAME: "web_user",
                        PATH: "/",
                        PWD: "/",
                        HOME: "/home/web_user",
                        LANG:
                            (
                                ("object" == typeof navigator &&
                                    navigator.languages &&
                                    navigator.languages[0]) ||
                                "C"
                            ).replace("-", "_") + ".UTF-8",
                        _: fa || "./this.program",
                    },
                    b;
                for (b in Yb) void 0 === Yb[b] ? delete a[b] : (a[b] = Yb[b]);
                var c = [];
                for (b in a) c.push(`${b}=${a[b]}`);
                Zb = c;
            }
            return Zb;
        },
        Zb,
        ac = [null, [], []],
        bc = [];
    function cc() {
        var a = Hb(N);
        return (a = a.concat(a.map((b) => "GL_" + b)));
    }
    var dc = (a, b) => {
            if (b) {
                var c = void 0;
                switch (a) {
                    case 36346:
                        c = 1;
                        break;
                    case 36344:
                        return;
                    case 34814:
                    case 36345:
                        c = 0;
                        break;
                    case 34466:
                        var d = N.getParameter(34467);
                        c = d ? d.length : 0;
                        break;
                    case 33309:
                        if (2 > V.version) {
                            T ||= 1282;
                            return;
                        }
                        c = cc().length;
                        break;
                    case 33307:
                    case 33308:
                        if (2 > V.version) {
                            T ||= 1280;
                            return;
                        }
                        c = 33307 == a ? 3 : 0;
                }
                if (void 0 === c)
                    switch (((d = N.getParameter(a)), typeof d)) {
                        case "number":
                            c = d;
                            break;
                        case "boolean":
                            c = d ? 1 : 0;
                            break;
                        case "string":
                            T ||= 1280;
                            return;
                        case "object":
                            if (null === d)
                                switch (a) {
                                    case 34964:
                                    case 35725:
                                    case 34965:
                                    case 36006:
                                    case 36007:
                                    case 32873:
                                    case 34229:
                                    case 36662:
                                    case 36663:
                                    case 35053:
                                    case 35055:
                                    case 36010:
                                    case 35097:
                                    case 35869:
                                    case 32874:
                                    case 36389:
                                    case 35983:
                                    case 35368:
                                    case 34068:
                                        c = 0;
                                        break;
                                    default:
                                        T ||= 1280;
                                        return;
                                }
                            else {
                                if (
                                    d instanceof Float32Array ||
                                    d instanceof Uint32Array ||
                                    d instanceof Int32Array ||
                                    d instanceof Array
                                ) {
                                    for (a = 0; a < d.length; ++a)
                                        u[(b + 4 * a) >> 2] = d[a];
                                    return;
                                }
                                try {
                                    c = d.name | 0;
                                } catch (e) {
                                    T ||= 1280;
                                    n(
                                        `GL_INVALID_ENUM in glGet${0}v: Unknown object returned from WebGL getParameter(${a})! (error: ${e})`
                                    );
                                    return;
                                }
                            }
                            break;
                        default:
                            T ||= 1280;
                            n(
                                `GL_INVALID_ENUM in glGet${0}v: Native code calling glGet${0}v(${a}) and it returns ${d} of type ${typeof d}!`
                            );
                            return;
                    }
                u[b >> 2] = c;
            } else T ||= 1281;
        },
        ec = (a) => {
            for (var b = 0, c = 0; c < a.length; ++c) {
                var d = a.charCodeAt(c);
                127 >= d
                    ? b++
                    : 2047 >= d
                    ? (b += 2)
                    : 55296 <= d && 57343 >= d
                    ? ((b += 4), ++c)
                    : (b += 3);
            }
            return b;
        },
        fc = (a) => {
            var b = ec(a) + 1,
                c = M(b);
            c && L(a, c, b);
            return c;
        },
        gc = (a) => "]" == a.slice(-1) && a.lastIndexOf("["),
        hc = (a) => {
            a -= 5120;
            return 0 == a
                ? r
                : 1 == a
                ? t
                : 2 == a
                ? qa
                : 4 == a
                ? u
                : 6 == a
                ? x
                : 5 == a || 28922 == a || 28520 == a || 30779 == a || 30782 == a
                ? w
                : ra;
        },
        ic = (a, b, c, d, e) => {
            a = hc(a);
            b =
                d *
                (((Qb || c) *
                    ({
                        5: 3,
                        6: 4,
                        8: 2,
                        29502: 3,
                        29504: 4,
                        26917: 2,
                        26918: 2,
                        29846: 3,
                        29847: 4,
                    }[b - 6402] || 1) *
                    a.BYTES_PER_ELEMENT +
                    Pb -
                    1) &
                    -Pb);
            return a.subarray(
                e >>> (31 - Math.clz32(a.BYTES_PER_ELEMENT)),
                (e + b) >>> (31 - Math.clz32(a.BYTES_PER_ELEMENT))
            );
        },
        W = (a) => {
            var b = N.be;
            if (b) {
                var c = b.rd[a];
                "number" == typeof c &&
                    (b.rd[a] = c =
                        N.getUniformLocation(
                            b,
                            b.Zd[a] + (0 < c ? `[${c}]` : "")
                        ));
                return c;
            }
            T ||= 1282;
        },
        X = [],
        jc = [],
        B = (a) => {
            var b = ec(a) + 1,
                c = kc(b);
            L(a, c, b);
            return c;
        },
        Ja = (a) => {
            var b = lc();
            a();
            mc(b);
        };
    f.requestAnimationFrame = $a;
    f.pauseMainLoop = lb;
    f.resumeMainLoop = function () {
        cb++;
        var a = Va,
            b = Wa,
            c = E;
        E = null;
        kb(c, 0, !1, db, !0);
        bb(a, b);
        F();
    };
    f.preMainLoop && ib.push(f.preMainLoop);
    f.postMainLoop && jb.push(f.postMainLoop);
    for (var Y = 0; 32 > Y; ++Y) bc.push(Array(Y));
    var nc = new Float32Array(288);
    for (Y = 0; 288 >= Y; ++Y) X[Y] = nc.subarray(0, Y);
    var oc = new Int32Array(288);
    for (Y = 0; 288 >= Y; ++Y) jc[Y] = oc.subarray(0, Y);
    var Ec = {
            na: function () {
                return 0;
            },
            nb: function () {
                return 0;
            },
            ob: function () {},
            sb: () => {
                Ca("");
            },
            rb: (a, b, c) => t.copyWithin(a, b, b + c),
            hb: () => {
                Ma = !1;
                Pa = 0;
            },
            ib: (a, b) => {
                D[a] && (clearTimeout(D[a].id), delete D[a]);
                if (!b) return 0;
                var c = setTimeout(() => {
                    delete D[a];
                    Ta(() => pc(a, performance.now()));
                }, b);
                D[a] = { id: c, Ee: b };
                return 0;
            },
            Xa: (a, b, c) => {
                Ua.length = 0;
                for (var d; (d = t[b++]); ) {
                    var e = 105 != d;
                    e &= 112 != d;
                    c += e && c % 8 ? 4 : 0;
                    Ua.push(
                        112 == d ? w[c >> 2] : 105 == d ? u[c >> 2] : y[c >> 3]
                    );
                    c += e ? 8 : 4;
                }
                return Ka[a](...Ua);
            },
            Oa: () => {
                lb();
                E = null;
            },
            ga: () =>
                ("number" == typeof devicePixelRatio && devicePixelRatio) || 1,
            ia: (a, b, c) => {
                a = J(a);
                if (!a) return -4;
                a = rb(a);
                y[b >> 3] = a.width;
                y[c >> 3] = a.height;
                return 0;
            },
            z: () => performance.now(),
            Pa: () => performance.now(),
            Va: (a, b) => {
                function c(d) {
                    K(a)(d, b) && requestAnimationFrame(c);
                }
                return requestAnimationFrame(c);
            },
            jb: (a) => {
                var b = t.length;
                a >>>= 0;
                if (2147483648 < a) return !1;
                for (var c = 1; 4 >= c; c *= 2) {
                    var d = b * (1 + 0.2 / c);
                    d = Math.min(d, a + 100663296);
                    a: {
                        d =
                            ((Math.min(
                                2147483648,
                                65536 * Math.ceil(Math.max(a, d) / 65536)
                            ) -
                                oa.buffer.byteLength +
                                65535) /
                                65536) |
                            0;
                        try {
                            oa.grow(d);
                            sa();
                            var e = 1;
                            break a;
                        } catch (h) {}
                        e = void 0;
                    }
                    if (e) return !0;
                }
                return !1;
            },
            Q: (a, b, c, d) => ub(a, b, c, d, 12, "blur"),
            fa: (a, b, c) => {
                a = J(a);
                if (!a) return -4;
                a.width = b;
                a.height = c;
                return 0;
            },
            R: (a, b, c, d) => ub(a, b, c, d, 13, "focus"),
            _: (a, b, c, d) => vb(a, b, c, d, 2, "keydown"),
            Y: (a, b, c, d) => vb(a, b, c, d, 1, "keypress"),
            Z: (a, b, c, d) => vb(a, b, c, d, 3, "keyup"),
            Wa: (a, b, c) => {
                a = K(a);
                kb(a, b, c);
            },
            ea: (a, b, c, d) => xb(a, b, c, d, 5, "mousedown"),
            ba: (a, b, c, d) => xb(a, b, c, d, 33, "mouseenter"),
            aa: (a, b, c, d) => xb(a, b, c, d, 34, "mouseleave"),
            ca: (a, b, c, d) => xb(a, b, c, d, 8, "mousemove"),
            da: (a, b, c, d) => xb(a, b, c, d, 6, "mouseup"),
            T: (a, b, c, d) => {
                if (
                    !document ||
                    !document.body ||
                    !(
                        document.body.requestPointerLock ||
                        document.body.qd ||
                        document.body.Nd ||
                        document.body.Md
                    )
                )
                    return -1;
                a = J(a);
                if (!a) return -4;
                yb(a, b, c, d, "mozpointerlockchange");
                yb(a, b, c, d, "webkitpointerlockchange");
                yb(a, b, c, d, "mspointerlockchange");
                return yb(a, b, c, d, "pointerlockchange");
            },
            S: (a, b, c, d) => {
                if (
                    !document ||
                    !(
                        document.body.requestPointerLock ||
                        document.body.qd ||
                        document.body.Nd ||
                        document.body.Md
                    )
                )
                    return -1;
                a = J(a);
                if (!a) return -4;
                zb(a, b, c, d, "mozpointerlockerror");
                zb(a, b, c, d, "webkitpointerlockerror");
                zb(a, b, c, d, "mspointerlockerror");
                return zb(a, b, c, d, "pointerlockerror");
            },
            ha: (a, b, c, d) => Ab(a, b, c, d),
            U: (a, b, c, d) => Bb(a, b, c, d, 25, "touchcancel"),
            V: (a, b, c, d) => Bb(a, b, c, d, 23, "touchend"),
            W: (a, b, c, d) => Bb(a, b, c, d, 24, "touchmove"),
            X: (a, b, c, d) => Bb(a, b, c, d, 22, "touchstart"),
            P: (a, b, c, d) => {
                Vb(a, b, c, d, 31, "webglcontextlost");
                return 0;
            },
            O: (a, b, c, d) => {
                Vb(a, b, c, d, 32, "webglcontextrestored");
                return 0;
            },
            $: (a, b, c, d) =>
                (a = J(a))
                    ? "undefined" != typeof a.onwheel
                        ? Wb(a, b, c, d)
                        : -1
                    : -4,
            Ua: (a, b) => {
                var c = b >> 2;
                b = {
                    alpha: !!r[b + 0],
                    depth: !!r[b + 1],
                    stencil: !!r[b + 2],
                    antialias: !!r[b + 3],
                    premultipliedAlpha: !!r[b + 4],
                    preserveDrawingBuffer: !!r[b + 5],
                    powerPreference: Xb[u[c + 2]],
                    failIfMajorPerformanceCaveat: !!r[b + 12],
                    Pd: u[c + 4],
                    we: u[c + 5],
                    Kd: r[b + 24],
                    ce: r[b + 25],
                    ye: u[c + 7],
                    Ce: r[b + 32],
                };
                a = J(a);
                return !a || b.ce ? 0 : Tb(a, b);
            },
            Sa: (a, b) => {
                a = Nb[a];
                b = b ? C(t, b) : "";
                b.startsWith("GL_") && (b = b.substr(3));
                "ANGLE_instanced_arrays" == b && Cb(N);
                "OES_vertex_array_object" == b && Db(N);
                "WEBGL_draw_buffers" == b && Eb(N);
                "WEBGL_draw_instanced_base_vertex_base_instance" == b && Fb(N);
                "WEBGL_multi_draw_instanced_base_vertex_base_instance" == b &&
                    Gb(N);
                "WEBGL_multi_draw" == b &&
                    (N.ge = N.getExtension("WEBGL_multi_draw"));
                "EXT_polygon_offset_clamp" == b &&
                    (N.ee = N.getExtension("EXT_polygon_offset_clamp"));
                "EXT_clip_control" == b &&
                    (N.de = N.getExtension("EXT_clip_control"));
                "WEBGL_polygon_mode" == b &&
                    (N.he = N.getExtension("WEBGL_polygon_mode"));
                return !!a.wd.getExtension(b);
            },
            Ta: (a) => {
                V = Nb[a];
                f.me = N = V?.wd;
                return !a || N ? 0 : -5;
            },
            pb: (a, b) => {
                var c = 0;
                $b().forEach((d, e) => {
                    var h = b + c;
                    e = w[(a + 4 * e) >> 2] = h;
                    for (h = 0; h < d.length; ++h) r[e++] = d.charCodeAt(h);
                    r[e] = 0;
                    c += d.length + 1;
                });
                return 0;
            },
            qb: (a, b) => {
                var c = $b();
                w[a >> 2] = c.length;
                var d = 0;
                c.forEach((e) => (d += e.length + 1));
                w[b >> 2] = d;
                return 0;
            },
            ma: () => 52,
            mb: () => 52,
            fb: function () {
                return 70;
            },
            kb: (a, b, c, d) => {
                for (var e = 0, h = 0; h < c; h++) {
                    var g = w[b >> 2],
                        l = w[(b + 4) >> 2];
                    b += 8;
                    for (var m = 0; m < l; m++) {
                        var p = t[g + m],
                            v = ac[a];
                        0 === p || 10 === p
                            ? ((1 === a ? ma : n)(C(v)), (v.length = 0))
                            : v.push(p);
                    }
                    e += l;
                }
                w[d >> 2] = e;
                return 0;
            },
            k: function (a, b, c) {
                const d = a ? C(t, a) : "";
                let e;
                try {
                    e = window.indexedDB.open("chips", 1);
                } catch (h) {
                    console.log(
                        "fs_js_load_snapshot: failed to open IndexedDB with " +
                            h
                    );
                }
                e.onupgradeneeded = () => {
                    console.log("fs_js_load_snapshot: creating db");
                    e.result.createObjectStore("store");
                };
                e.onsuccess = () => {
                    var h = e.result;
                    let g;
                    try {
                        g = h.transaction(["store"], "readwrite");
                    } catch (p) {
                        console.log(
                            "fs_js_load_snapshot: db.transaction failed with",
                            p
                        );
                        return;
                    }
                    h = g.objectStore("store");
                    let l = d + "_" + b,
                        m = h.get(l);
                    m.onsuccess = () => {
                        if (void 0 !== m.result) {
                            let p = m.result.length;
                            console.log(
                                "fs_js_load_snapshot:",
                                l,
                                "successfully loaded",
                                p,
                                "bytes"
                            );
                            let v = qc(p);
                            t.set(m.result, v);
                            rc(c, v, p);
                        } else rc(c, 0, 0);
                    };
                    m.onerror = () => {
                        console.log("fs_js_load_snapshot: FAILED loading", l);
                    };
                    g.onerror = () => {
                        console.log("fs_js_load_snapshot: transaction onerror");
                    };
                };
                e.onerror = () => {
                    console.log("fs_js_load_snapshot: open_request onerror");
                };
            },
            oc: function (a, b, c, d) {
                const e = a ? C(t, a) : "";
                console.log("fs_js_save_snapshot: called with", e, b);
                let h;
                try {
                    h = window.indexedDB.open("chips", 1);
                } catch (g) {
                    console.log(
                        "fs_js_save_snapshot: failed to open IndexedDB with " +
                            g
                    );
                    return;
                }
                h.onupgradeneeded = () => {
                    console.log("fs_js_save_snapshot: creating db");
                    h.result.createObjectStore("store");
                };
                h.onsuccess = () => {
                    console.log("fs_js_save_snapshot: onsuccess");
                    let g = h.result.transaction(["store"], "readwrite");
                    var l = g.objectStore("store");
                    let m = e + "_" + b;
                    l = l.put(t.subarray(c, c + d), m);
                    l.onsuccess = () => {
                        console.log(
                            "fs_js_save_snapshot:",
                            m,
                            "successfully stored"
                        );
                    };
                    l.onerror = () => {
                        console.log("fs_js_save_snapshot: FAILED to store", m);
                    };
                    g.onerror = () => {
                        console.log("fs_js_save_snapshot: transaction onerror");
                    };
                };
                h.onerror = () => {
                    console.log("fs_js_save_snapshot: open_request onerror");
                };
            },
            m: (a) => N.activeTexture(a),
            ya: (a, b) => {
                N.attachShader(O[a], R[b]);
            },
            b: (a, b) => {
                35051 == a ? (N.Id = b) : 35052 == a && (N.nd = b);
                N.bindBuffer(a, Jb[b]);
            },
            a: (a, b, c) => {
                N.bindBufferBase(a, b, Jb[c]);
            },
            o: (a, b) => {
                N.bindFramebuffer(a, Kb[b]);
            },
            mc: (a, b) => {
                N.bindRenderbuffer(a, Lb[b]);
            },
            l: (a, b) => {
                N.bindSampler(a, S[b]);
            },
            c: (a, b) => {
                N.bindTexture(a, P[b]);
            },
            N: (a) => {
                N.bindVertexArray(Mb[a]);
            },
            J: (a, b, c, d) => N.blendColor(a, b, c, d),
            K: (a, b) => N.blendEquationSeparate(a, b),
            L: (a, b, c, d) => N.blendFuncSeparate(a, b, c, d),
            xb: (a, b, c, d, e, h, g, l, m, p) =>
                N.blitFramebuffer(a, b, c, d, e, h, g, l, m, p),
            Ca: (a, b, c, d) => {
                2 <= V.version
                    ? c && b
                        ? N.bufferData(a, t, d, c, b)
                        : N.bufferData(a, b, d)
                    : N.bufferData(a, c ? t.subarray(c, c + b) : b, d);
            },
            D: (a, b, c, d) => {
                2 <= V.version
                    ? c && N.bufferSubData(a, b, t, d, c)
                    : N.bufferSubData(a, b, t.subarray(d, d + c));
            },
            sa: (a) => N.checkFramebufferStatus(a),
            Sb: (a, b, c, d) => N.clearBufferfi(a, b, c, d),
            qa: (a, b, c) => {
                N.clearBufferfv(a, b, x, c >> 2);
            },
            Rb: (a, b, c) => {
                N.clearBufferiv(a, b, u, c >> 2);
            },
            r: (a, b, c, d) => {
                N.colorMask(!!a, !!b, !!c, !!d);
            },
            Wb: (a) => {
                N.compileShader(R[a]);
            },
            gc: (a, b, c, d, e, h, g, l) => {
                2 <= V.version
                    ? N.nd || !g
                        ? N.compressedTexImage2D(a, b, c, d, e, h, g, l)
                        : N.compressedTexImage2D(a, b, c, d, e, h, t, l, g)
                    : N.compressedTexImage2D(
                          a,
                          b,
                          c,
                          d,
                          e,
                          h,
                          t.subarray(l, l + g)
                      );
            },
            ec: (a, b, c, d, e, h, g, l, m) => {
                N.nd
                    ? N.compressedTexImage3D(a, b, c, d, e, h, g, l, m)
                    : N.compressedTexImage3D(a, b, c, d, e, h, g, t, m, l);
            },
            ac: () => {
                var a = Rb(O),
                    b = N.createProgram();
                b.name = a;
                b.ud = b.sd = b.td = 0;
                b.Fd = 1;
                O[a] = b;
                return a;
            },
            Yb: (a) => {
                var b = Rb(R);
                R[b] = N.createShader(a);
                return b;
            },
            G: (a) => N.cullFace(a),
            Ga: (a, b) => {
                for (var c = 0; c < a; c++) {
                    var d = u[(b + 4 * c) >> 2],
                        e = Jb[d];
                    e &&
                        (N.deleteBuffer(e),
                        (e.name = 0),
                        (Jb[d] = null),
                        d == N.Id && (N.Id = 0),
                        d == N.nd && (N.nd = 0));
                }
            },
            f: (a, b) => {
                for (var c = 0; c < a; ++c) {
                    var d = u[(b + 4 * c) >> 2],
                        e = Kb[d];
                    e && (N.deleteFramebuffer(e), (e.name = 0), (Kb[d] = null));
                }
            },
            p: (a) => {
                if (a) {
                    var b = O[a];
                    b
                        ? (N.deleteProgram(b), (b.name = 0), (O[a] = null))
                        : (T ||= 1281);
                }
            },
            E: (a, b) => {
                for (var c = 0; c < a; c++) {
                    var d = u[(b + 4 * c) >> 2],
                        e = Lb[d];
                    e &&
                        (N.deleteRenderbuffer(e), (e.name = 0), (Lb[d] = null));
                }
            },
            g: (a, b) => {
                for (var c = 0; c < a; c++) {
                    var d = u[(b + 4 * c) >> 2],
                        e = S[d];
                    e && (N.deleteSampler(e), (e.name = 0), (S[d] = null));
                }
            },
            C: (a) => {
                if (a) {
                    var b = R[a];
                    b ? (N.deleteShader(b), (R[a] = null)) : (T ||= 1281);
                }
            },
            F: (a, b) => {
                for (var c = 0; c < a; c++) {
                    var d = u[(b + 4 * c) >> 2],
                        e = P[d];
                    e && (N.deleteTexture(e), (e.name = 0), (P[d] = null));
                }
            },
            Ea: (a, b) => {
                for (var c = 0; c < a; c++) {
                    var d = u[(b + 4 * c) >> 2];
                    N.deleteVertexArray(Mb[d]);
                    Mb[d] = null;
                }
            },
            w: (a) => N.depthFunc(a),
            v: (a) => {
                N.depthMask(!!a);
            },
            e: (a) => N.disable(a),
            M: (a) => {
                N.disableVertexAttribArray(a);
            },
            zb: (a, b, c) => {
                N.drawArrays(a, b, c);
            },
            Ab: (a, b, c, d) => {
                N.drawArraysInstanced(a, b, c, d);
            },
            ra: (a, b) => {
                for (var c = bc[a], d = 0; d < a; d++)
                    c[d] = u[(b + 4 * d) >> 2];
                N.drawBuffers(c);
            },
            Bb: (a, b, c, d) => {
                N.drawElements(a, b, c, d);
            },
            Cb: (a, b, c, d, e) => {
                N.drawElementsInstanced(a, b, c, d, e);
            },
            j: (a) => N.enable(a),
            Nb: (a) => {
                N.enableVertexAttribArray(a);
            },
            ta: (a, b, c, d) => {
                N.framebufferRenderbuffer(a, b, c, Lb[d]);
            },
            q: (a, b, c, d, e) => {
                N.framebufferTexture2D(a, b, c, P[d], e);
            },
            B: (a, b, c, d, e) => {
                N.framebufferTextureLayer(a, b, P[c], d, e);
            },
            H: (a) => N.frontFace(a),
            Da: (a, b) => {
                U(a, b, "createBuffer", Jb);
            },
            ua: (a, b) => {
                U(a, b, "createFramebuffer", Kb);
            },
            Ba: (a, b) => {
                U(a, b, "createRenderbuffer", Lb);
            },
            bc: (a, b) => {
                U(a, b, "createSampler", S);
            },
            kc: (a, b) => {
                U(a, b, "createTexture", P);
            },
            Na: (a, b) => {
                U(a, b, "createVertexArray", Mb);
            },
            Ub: (a, b) => N.getAttribLocation(O[a], b ? C(t, b) : ""),
            d: (a, b) => dc(a, b),
            _b: (a, b, c, d) => {
                a = N.getProgramInfoLog(O[a]);
                null === a && (a = "(unknown error)");
                b = 0 < b && d ? L(a, d, b) : 0;
                c && (u[c >> 2] = b);
            },
            xa: (a, b, c) => {
                if (c)
                    if (a >= Ib) T ||= 1281;
                    else if (((a = O[a]), 35716 == b))
                        (a = N.getProgramInfoLog(a)),
                            null === a && (a = "(unknown error)"),
                            (u[c >> 2] = a.length + 1);
                    else if (35719 == b) {
                        if (!a.ud) {
                            var d = N.getProgramParameter(a, 35718);
                            for (b = 0; b < d; ++b)
                                a.ud = Math.max(
                                    a.ud,
                                    N.getActiveUniform(a, b).name.length + 1
                                );
                        }
                        u[c >> 2] = a.ud;
                    } else if (35722 == b) {
                        if (!a.sd)
                            for (
                                d = N.getProgramParameter(a, 35721), b = 0;
                                b < d;
                                ++b
                            )
                                a.sd = Math.max(
                                    a.sd,
                                    N.getActiveAttrib(a, b).name.length + 1
                                );
                        u[c >> 2] = a.sd;
                    } else if (35381 == b) {
                        if (!a.td)
                            for (
                                d = N.getProgramParameter(a, 35382), b = 0;
                                b < d;
                                ++b
                            )
                                a.td = Math.max(
                                    a.td,
                                    N.getActiveUniformBlockName(a, b).length + 1
                                );
                        u[c >> 2] = a.td;
                    } else u[c >> 2] = N.getProgramParameter(a, b);
                else T ||= 1281;
            },
            Vb: (a, b, c, d) => {
                a = N.getShaderInfoLog(R[a]);
                null === a && (a = "(unknown error)");
                b = 0 < b && d ? L(a, d, b) : 0;
                c && (u[c >> 2] = b);
            },
            va: (a, b, c) => {
                c
                    ? 35716 == b
                        ? ((a = N.getShaderInfoLog(R[a])),
                          null === a && (a = "(unknown error)"),
                          (u[c >> 2] = a ? a.length + 1 : 0))
                        : 35720 == b
                        ? ((a = N.getShaderSource(R[a])),
                          (u[c >> 2] = a ? a.length + 1 : 0))
                        : (u[c >> 2] = N.getShaderParameter(R[a], b))
                    : (T ||= 1281);
            },
            La: (a, b) => {
                if (2 > V.version) return (T ||= 1282), 0;
                var c = Ob[a];
                if (c) return 0 > b || b >= c.length ? ((T ||= 1281), 0) : c[b];
                switch (a) {
                    case 7939:
                        return (
                            (c = cc().map(fc)),
                            (c = Ob[a] = c),
                            0 > b || b >= c.length ? ((T ||= 1281), 0) : c[b]
                        );
                    default:
                        return (T ||= 1280), 0;
                }
            },
            t: (a, b) => {
                b = b ? C(t, b) : "";
                if ((a = O[a])) {
                    var c = a,
                        d = c.rd,
                        e = c.$d,
                        h;
                    if (!d) {
                        c.rd = d = {};
                        c.Zd = {};
                        var g = N.getProgramParameter(c, 35718);
                        for (h = 0; h < g; ++h) {
                            var l = N.getActiveUniform(c, h);
                            var m = l.name;
                            l = l.size;
                            var p = gc(m);
                            p = 0 < p ? m.slice(0, p) : m;
                            var v = c.Fd;
                            c.Fd += l;
                            e[p] = [l, v];
                            for (m = 0; m < l; ++m) (d[v] = m), (c.Zd[v++] = p);
                        }
                    }
                    c = a.rd;
                    d = 0;
                    e = b;
                    h = gc(b);
                    0 < h &&
                        ((d = parseInt(b.slice(h + 1)) >>> 0),
                        (e = b.slice(0, h)));
                    if (
                        (e = a.$d[e]) &&
                        d < e[0] &&
                        ((d += e[1]),
                        (c[d] = c[d] || N.getUniformLocation(a, b)))
                    )
                        return d;
                } else T ||= 1281;
                return -1;
            },
            wb: (a, b, c) => {
                for (var d = bc[b], e = 0; e < b; e++)
                    d[e] = u[(c + 4 * e) >> 2];
                N.invalidateFramebuffer(a, d);
            },
            $b: (a) => {
                a = O[a];
                N.linkProgram(a);
                a.rd = 0;
                a.$d = {};
            },
            Ma: (a, b) => {
                3317 == a ? (Pb = b) : 3314 == a && (Qb = b);
                N.pixelStorei(a, b);
            },
            I: (a, b) => N.polygonOffset(a, b),
            yb: (a) => N.readBuffer(a),
            lc: (a, b, c, d, e) =>
                N.renderbufferStorageMultisample(a, b, c, d, e),
            za: (a, b, c) => {
                N.samplerParameterf(S[a], b, c);
            },
            h: (a, b, c) => {
                N.samplerParameteri(S[a], b, c);
            },
            s: (a, b, c, d) => N.scissor(a, b, c, d),
            Xb: (a, b, c, d) => {
                for (var e = "", h = 0; h < b; ++h) {
                    var g = (g = w[(c + 4 * h) >> 2])
                        ? C(t, g, d ? w[(d + 4 * h) >> 2] : void 0)
                        : "";
                    e += g;
                }
                N.shaderSource(R[a], e);
            },
            Ja: (a, b, c) => N.stencilFunc(a, b, c),
            pa: (a, b, c, d) => N.stencilFuncSeparate(a, b, c, d),
            u: (a) => N.stencilMask(a),
            Ia: (a, b, c) => N.stencilOp(a, b, c),
            oa: (a, b, c, d) => N.stencilOpSeparate(a, b, c, d),
            fc: (a, b, c, d, e, h, g, l, m) => {
                if (2 <= V.version) {
                    if (N.nd) {
                        N.texImage2D(a, b, c, d, e, h, g, l, m);
                        return;
                    }
                    if (m) {
                        var p = hc(l);
                        m >>>= 31 - Math.clz32(p.BYTES_PER_ELEMENT);
                        N.texImage2D(a, b, c, d, e, h, g, l, p, m);
                        return;
                    }
                }
                p = m ? ic(l, g, d, e, m) : null;
                N.texImage2D(a, b, c, d, e, h, g, l, p);
            },
            dc: (a, b, c, d, e, h, g, l, m, p) => {
                if (N.nd) N.texImage3D(a, b, c, d, e, h, g, l, m, p);
                else if (p) {
                    var v = hc(m);
                    N.texImage3D(
                        a,
                        b,
                        c,
                        d,
                        e,
                        h,
                        g,
                        l,
                        m,
                        v,
                        p >>> (31 - Math.clz32(v.BYTES_PER_ELEMENT))
                    );
                } else N.texImage3D(a, b, c, d, e, h, g, l, m, null);
            },
            jc: (a, b, c) => N.texParameteri(a, b, c),
            ic: (a, b, c, d, e) => N.texStorage2D(a, b, c, d, e),
            hc: (a, b, c, d, e, h) => N.texStorage3D(a, b, c, d, e, h),
            ub: (a, b, c, d, e, h, g, l, m) => {
                if (2 <= V.version) {
                    if (N.nd) {
                        N.texSubImage2D(a, b, c, d, e, h, g, l, m);
                        return;
                    }
                    if (m) {
                        var p = hc(l);
                        N.texSubImage2D(
                            a,
                            b,
                            c,
                            d,
                            e,
                            h,
                            g,
                            l,
                            p,
                            m >>> (31 - Math.clz32(p.BYTES_PER_ELEMENT))
                        );
                        return;
                    }
                }
                m = m ? ic(l, g, e, h, m) : null;
                N.texSubImage2D(a, b, c, d, e, h, g, l, m);
            },
            tb: (a, b, c, d, e, h, g, l, m, p, v) => {
                if (N.nd) N.texSubImage3D(a, b, c, d, e, h, g, l, m, p, v);
                else if (v) {
                    var Q = hc(p);
                    N.texSubImage3D(
                        a,
                        b,
                        c,
                        d,
                        e,
                        h,
                        g,
                        l,
                        m,
                        p,
                        Q,
                        v >>> (31 - Math.clz32(Q.BYTES_PER_ELEMENT))
                    );
                } else N.texSubImage3D(a, b, c, d, e, h, g, l, m, p, null);
            },
            Mb: (a, b, c) => {
                if (2 <= V.version) b && N.uniform1fv(W(a), x, c >> 2, b);
                else {
                    if (288 >= b)
                        for (var d = X[b], e = 0; e < b; ++e)
                            d[e] = x[(c + 4 * e) >> 2];
                    else d = x.subarray(c >> 2, (c + 4 * b) >> 2);
                    N.uniform1fv(W(a), d);
                }
            },
            wa: (a, b) => {
                N.uniform1i(W(a), b);
            },
            Ib: (a, b, c) => {
                if (2 <= V.version) b && N.uniform1iv(W(a), u, c >> 2, b);
                else {
                    if (288 >= b)
                        for (var d = jc[b], e = 0; e < b; ++e)
                            d[e] = u[(c + 4 * e) >> 2];
                    else d = u.subarray(c >> 2, (c + 4 * b) >> 2);
                    N.uniform1iv(W(a), d);
                }
            },
            Lb: (a, b, c) => {
                if (2 <= V.version) b && N.uniform2fv(W(a), x, c >> 2, 2 * b);
                else {
                    if (144 >= b) {
                        b *= 2;
                        for (var d = X[b], e = 0; e < b; e += 2)
                            (d[e] = x[(c + 4 * e) >> 2]),
                                (d[e + 1] = x[(c + (4 * e + 4)) >> 2]);
                    } else d = x.subarray(c >> 2, (c + 8 * b) >> 2);
                    N.uniform2fv(W(a), d);
                }
            },
            Hb: (a, b, c) => {
                if (2 <= V.version) b && N.uniform2iv(W(a), u, c >> 2, 2 * b);
                else {
                    if (144 >= b) {
                        b *= 2;
                        for (var d = jc[b], e = 0; e < b; e += 2)
                            (d[e] = u[(c + 4 * e) >> 2]),
                                (d[e + 1] = u[(c + (4 * e + 4)) >> 2]);
                    } else d = u.subarray(c >> 2, (c + 8 * b) >> 2);
                    N.uniform2iv(W(a), d);
                }
            },
            Kb: (a, b, c) => {
                if (2 <= V.version) b && N.uniform3fv(W(a), x, c >> 2, 3 * b);
                else {
                    if (96 >= b) {
                        b *= 3;
                        for (var d = X[b], e = 0; e < b; e += 3)
                            (d[e] = x[(c + 4 * e) >> 2]),
                                (d[e + 1] = x[(c + (4 * e + 4)) >> 2]),
                                (d[e + 2] = x[(c + (4 * e + 8)) >> 2]);
                    } else d = x.subarray(c >> 2, (c + 12 * b) >> 2);
                    N.uniform3fv(W(a), d);
                }
            },
            Fb: (a, b, c) => {
                if (2 <= V.version) b && N.uniform3iv(W(a), u, c >> 2, 3 * b);
                else {
                    if (96 >= b) {
                        b *= 3;
                        for (var d = jc[b], e = 0; e < b; e += 3)
                            (d[e] = u[(c + 4 * e) >> 2]),
                                (d[e + 1] = u[(c + (4 * e + 4)) >> 2]),
                                (d[e + 2] = u[(c + (4 * e + 8)) >> 2]);
                    } else d = u.subarray(c >> 2, (c + 12 * b) >> 2);
                    N.uniform3iv(W(a), d);
                }
            },
            Jb: (a, b, c) => {
                if (2 <= V.version) b && N.uniform4fv(W(a), x, c >> 2, 4 * b);
                else {
                    if (72 >= b) {
                        var d = X[4 * b],
                            e = x;
                        c >>= 2;
                        b *= 4;
                        for (var h = 0; h < b; h += 4) {
                            var g = c + h;
                            d[h] = e[g];
                            d[h + 1] = e[g + 1];
                            d[h + 2] = e[g + 2];
                            d[h + 3] = e[g + 3];
                        }
                    } else d = x.subarray(c >> 2, (c + 16 * b) >> 2);
                    N.uniform4fv(W(a), d);
                }
            },
            Eb: (a, b, c) => {
                if (2 <= V.version) b && N.uniform4iv(W(a), u, c >> 2, 4 * b);
                else {
                    if (72 >= b) {
                        b *= 4;
                        for (var d = jc[b], e = 0; e < b; e += 4)
                            (d[e] = u[(c + 4 * e) >> 2]),
                                (d[e + 1] = u[(c + (4 * e + 4)) >> 2]),
                                (d[e + 2] = u[(c + (4 * e + 8)) >> 2]),
                                (d[e + 3] = u[(c + (4 * e + 12)) >> 2]);
                    } else d = u.subarray(c >> 2, (c + 16 * b) >> 2);
                    N.uniform4iv(W(a), d);
                }
            },
            Db: (a, b, c, d) => {
                if (2 <= V.version)
                    b && N.uniformMatrix4fv(W(a), !!c, x, d >> 2, 16 * b);
                else {
                    if (18 >= b) {
                        var e = X[16 * b],
                            h = x;
                        d >>= 2;
                        b *= 16;
                        for (var g = 0; g < b; g += 16) {
                            var l = d + g;
                            e[g] = h[l];
                            e[g + 1] = h[l + 1];
                            e[g + 2] = h[l + 2];
                            e[g + 3] = h[l + 3];
                            e[g + 4] = h[l + 4];
                            e[g + 5] = h[l + 5];
                            e[g + 6] = h[l + 6];
                            e[g + 7] = h[l + 7];
                            e[g + 8] = h[l + 8];
                            e[g + 9] = h[l + 9];
                            e[g + 10] = h[l + 10];
                            e[g + 11] = h[l + 11];
                            e[g + 12] = h[l + 12];
                            e[g + 13] = h[l + 13];
                            e[g + 14] = h[l + 14];
                            e[g + 15] = h[l + 15];
                        }
                    } else e = x.subarray(d >> 2, (d + 64 * b) >> 2);
                    N.uniformMatrix4fv(W(a), !!c, e);
                }
            },
            i: (a) => {
                a = O[a];
                N.useProgram(a);
                N.be = a;
            },
            Ob: (a, b) => {
                N.vertexAttribDivisor(a, b);
            },
            Pb: (a, b, c, d, e, h) => {
                N.vertexAttribPointer(a, b, c, !!d, e, h);
            },
            n: (a, b, c, d) => N.viewport(a, b, c, d),
            gb: Qa,
            Fa: function () {
                f.Sd = (a) => {
                    0 != sc() && (a.preventDefault(), (a.returnValue = " "));
                };
                window.addEventListener("beforeunload", f.Sd);
            },
            cc: function () {
                f.Yd = (a) => {
                    const b = a.clipboardData.getData("text");
                    Ja(() => {
                        const c = B(b);
                        tc(c);
                    });
                };
                window.addEventListener("paste", f.Yd);
            },
            Qb: function (a) {
                f.De = [];
                a = a ? C(t, a) : "";
                a = document.getElementById(a);
                f.Td = (b) => {
                    b.stopPropagation();
                    b.preventDefault();
                };
                f.Ud = (b) => {
                    b.stopPropagation();
                    b.preventDefault();
                };
                f.Vd = (b) => {
                    b.stopPropagation();
                    b.preventDefault();
                };
                f.Wd = (b) => {
                    b.stopPropagation();
                    b.preventDefault();
                    const c = b.dataTransfer.files;
                    f.Xd = c;
                    uc(c.length);
                    for (let e = 0; e < c.length; e++)
                        Ja(() => {
                            const h = B(c[e].name);
                            vc(e, h);
                        });
                    let d = 0;
                    b.shiftKey && (d |= 1);
                    b.ctrlKey && (d |= 2);
                    b.altKey && (d |= 4);
                    b.metaKey && (d |= 8);
                    wc(b.clientX, b.clientY, d);
                };
                a.addEventListener("dragenter", f.Td, !1);
                a.addEventListener("dragleave", f.Ud, !1);
                a.addEventListener("dragover", f.Vd, !1);
                a.addEventListener("drop", f.Wd, !1);
            },
            cb: function () {
                const a = document.getElementById("sokol-app-favicon");
                a && document.head.removeChild(a);
            },
            Gb: function (a) {
                const b = f.Xd;
                return 0 > a || a >= b.length ? 0 : b[a].size;
            },
            vb: function (a, b, c, d, e) {
                const h = new FileReader();
                h.onload = (g) => {
                    g = g.target.result;
                    g.byteLength > d
                        ? xc(a, 0, 1, b, 0, c, d, e)
                        : (t.set(new Uint8Array(g), c),
                          xc(a, 1, 0, b, g.byteLength, c, d, e));
                };
                h.onerror = () => {
                    xc(a, 0, 2, b, 0, c, d, e);
                };
                h.readAsArrayBuffer(f.Xd[a]);
            },
            eb: function (a) {
                a = a ? C(t, a) : "";
                f.pd = document.getElementById(a);
                f.pd || console.log("sokol_app.h: invalid target:" + a);
                f.pd.requestPointerLock ||
                    console.log(
                        "sokol_app.h: target doesn't support requestPointerLock:" +
                            a
                    );
            },
            nc: function () {
                window.removeEventListener("beforeunload", f.Sd);
            },
            Zb: function () {
                window.removeEventListener("paste", f.Yd);
            },
            lb: function (a) {
                a = a ? C(t, a) : "";
                a = document.getElementById(a);
                a.removeEventListener("dragenter", f.Td);
                a.removeEventListener("dragleave", f.Ud);
                a.removeEventListener("dragover", f.Vd);
                a.removeEventListener("drop", f.Wd);
            },
            A: function () {
                f.pd && f.pd.requestPointerLock && f.pd.requestPointerLock();
            },
            db: function (a, b) {
                if (f.pd) {
                    if (0 === b) a = "none";
                    else
                        switch (a) {
                            case 0:
                                a = "auto";
                                break;
                            case 1:
                                a = "default";
                                break;
                            case 2:
                                a = "text";
                                break;
                            case 3:
                                a = "crosshair";
                                break;
                            case 4:
                                a = "pointer";
                                break;
                            case 5:
                                a = "ew-resize";
                                break;
                            case 6:
                                a = "ns-resize";
                                break;
                            case 7:
                                a = "nwse-resize";
                                break;
                            case 8:
                                a = "nesw-resize";
                                break;
                            case 9:
                                a = "all-scroll";
                                break;
                            case 10:
                                a = "not-allowed";
                                break;
                            default:
                                a = "auto";
                        }
                    f.pd.style.cursor = a;
                }
            },
            bb: function (a, b, c) {
                const d = document.createElement("canvas");
                d.width = a;
                d.height = b;
                const e = d.getContext("2d"),
                    h = e.createImageData(a, b);
                h.data.set(t.subarray(c, c + a * b * 4));
                e.putImageData(h, 0, 0);
                a = document.createElement("link");
                a.id = "sokol-app-favicon";
                a.rel = "shortcut icon";
                a.href = d.toDataURL();
                document.head.appendChild(a);
            },
            Tb: function (a) {
                a = a ? C(t, a) : "";
                const b = document.createElement("textarea");
                b.setAttribute("autocomplete", "off");
                b.setAttribute("autocorrect", "off");
                b.setAttribute("autocapitalize", "off");
                b.setAttribute("spellcheck", "false");
                b.style.left = "-100px";
                b.style.top = "-100px";
                b.style.height = 1;
                b.style.width = 1;
                b.value = a;
                document.body.appendChild(b);
                b.select();
                document.execCommand("copy");
                document.body.removeChild(b);
            },
            Ya: function () {
                const a = new URLSearchParams(window.location.search).entries();
                for (let b = a.next(); !b.done; b = a.next()) {
                    const c = b.value[0],
                        d = b.value[1];
                    Ja(() => {
                        const e = B(c),
                            h = B(d);
                        yc(e, h);
                    });
                }
            },
            _a: function () {
                return f.md ? f.md.bufferSize : 0;
            },
            ab: function (a, b, c) {
                f.ed = null;
                f.md = null;
                "undefined" !== typeof AudioContext
                    ? (f.ed = new AudioContext({
                          sampleRate: a,
                          latencyHint: "interactive",
                      }))
                    : ((f.ed = null),
                      console.log("sokol_audio.h: no WebAudio support"));
                return f.ed
                    ? (console.log(
                          "sokol_audio.h: sample rate ",
                          f.ed.sampleRate
                      ),
                      (f.md = f.ed.createScriptProcessor(c, 0, b)),
                      (f.md.onaudioprocess = (d) => {
                          const e = d.outputBuffer.length,
                              h = zc(e);
                          if (h) {
                              const g = d.outputBuffer.numberOfChannels;
                              for (let l = 0; l < g; l++) {
                                  const m = d.outputBuffer.getChannelData(l);
                                  for (let p = 0; p < e; p++)
                                      m[p] = x[(h >> 2) + (g * p + l)];
                              }
                          }
                      }),
                      f.md.connect(f.ed.destination),
                      (a = () => {
                          f.ed && "suspended" === f.ed.state && f.ed.resume();
                      }),
                      document.addEventListener("click", a, { once: !0 }),
                      document.addEventListener("touchend", a, { once: !0 }),
                      document.addEventListener("keydown", a, { once: !0 }),
                      1)
                    : 0;
            },
            $a: function () {
                return f.ed ? f.ed.sampleRate : 0;
            },
            la: function () {
                const a = f.ed;
                null !== a &&
                    (f.md && f.md.disconnect(),
                    a.close(),
                    (f.ed = null),
                    (f.md = null));
            },
            Za: function () {
                if (f.ed) return "suspended" === f.ed.state ? 1 : 0;
            },
            y: function (a, b, c, d, e, h) {
                b = b ? C(t, b) : "";
                const g = new XMLHttpRequest();
                g.open("GET", b);
                g.responseType = "arraybuffer";
                const l = 0 < d;
                l &&
                    g.setRequestHeader(
                        "Range",
                        "bytes=" + c + "-" + (c + d - 1)
                    );
                g.onreadystatechange = function () {
                    if (g.readyState == XMLHttpRequest.DONE)
                        if (206 == g.status || (200 == g.status && !l)) {
                            const m = new Uint8Array(g.response),
                                p = m.length;
                            p <= h ? (t.set(m, e), Ac(a, d, p)) : Bc(a);
                        } else Cc(a, g.status);
                };
                g.send();
            },
            ka: function (a, b) {
                b = b ? C(t, b) : "";
                const c = new XMLHttpRequest();
                c.open("HEAD", b);
                c.onreadystatechange = function () {
                    if (c.readyState == XMLHttpRequest.DONE)
                        if (200 == c.status) {
                            const d = c.getResponseHeader("Content-Length");
                            Dc(a, d);
                        } else Cc(a, c.status);
                };
                c.send();
            },
            Aa: function () {
                return navigator.userAgent.includes("Macintosh") ? 1 : 0;
            },
            ja: function (a, b) {
                b = b ? C(t, b) : "";
                switch (a) {
                    case 0:
                        console.error(b);
                        break;
                    case 1:
                        console.error(b);
                        break;
                    case 2:
                        console.warn(b);
                        break;
                    default:
                        console.info(b);
                }
            },
            Ra: function () {
                f.webapi_onContinued
                    ? f.webapi_onContinued()
                    : console.log("no Module.webapi_onContinued function");
            },
            Qa: function () {
                f.webapi_onReboot
                    ? f.webapi_onReboot()
                    : console.log("no Module.webapi_onReboot function");
            },
            Ka: function () {
                f.webapi_onReset
                    ? f.webapi_onReset()
                    : console.log("no Module.webapi_onReset function");
            },
            x: function (a, b) {
                f.webapi_onStopped
                    ? f.webapi_onStopped(a, b)
                    : console.log("no Module.webapi_onStopped function");
            },
            Ha: function (a) {
                f.webapi_onTick
                    ? ((a >>= 2),
                      f.webapi_onTick({
                          pins_flags: f.HEAPU32[a],
                          pins_addr: f.HEAPU32[a + 1],
                      }))
                    : f.first_webapi_js_event_tick &&
                      (console.log("no Module.webapi_onTick function"),
                      (f.first_webapi_js_event_tick = !1));
            },
        },
        Z = (function () {
            function a(c) {
                Z = c.exports;
                oa = Z.pc;
                sa();
                tb = Z.$c;
                ua.unshift(Z.qc);
                z--;
                f.monitorRunDependencies?.(z);
                0 == z &&
                    (null !== Ba && (clearInterval(Ba), (Ba = null)),
                    A && ((c = A), (A = null), c()));
                return Z;
            }
            var b = { a: Ec };
            z++;
            f.monitorRunDependencies?.(z);
            if (f.instantiateWasm)
                try {
                    return f.instantiateWasm(b, a);
                } catch (c) {
                    return (
                        n(
                            `Module.instantiateWasm callback failed with error: ${c}`
                        ),
                        !1
                    );
                }
            Ea ??= Da("c64-ui.wasm")
                ? "c64-ui.wasm"
                : f.locateFile
                ? f.locateFile("c64-ui.wasm", k)
                : k + "c64-ui.wasm";
            Ia(b, function (c) {
                a(c.instance);
            });
            return {};
        })(),
        M = (a) => (M = Z.rc)(a),
        qc = (f._fs_emsc_alloc = (a) => (qc = f._fs_emsc_alloc = Z.sc)(a)),
        rc = (f._fs_emsc_load_snapshot_callback = (a, b, c) =>
            (rc = f._fs_emsc_load_snapshot_callback = Z.tc)(a, b, c));
    f._webapi_dbg_connect = () => (f._webapi_dbg_connect = Z.uc)();
    f._webapi_dbg_disconnect = () => (f._webapi_dbg_disconnect = Z.vc)();
    f._webapi_alloc = (a) => (f._webapi_alloc = Z.wc)(a);
    f._webapi_free = (a) => (f._webapi_free = Z.xc)(a);
    f._webapi_boot = () => (f._webapi_boot = Z.yc)();
    f._webapi_reset = () => (f._webapi_reset = Z.zc)();
    f._webapi_ready = () => (f._webapi_ready = Z.Ac)();
    f._webapi_load = (a, b) => (f._webapi_load = Z.Bc)(a, b);
    f._webapi_load_snapshot = (a) => (f._webapi_load_snapshot = Z.Cc)(a);
    f._webapi_save_snapshot = (a) => (f._webapi_save_snapshot = Z.Dc)(a);
    f._webapi_dbg_add_breakpoint = (a) =>
        (f._webapi_dbg_add_breakpoint = Z.Ec)(a);
    f._webapi_dbg_remove_breakpoint = (a) =>
        (f._webapi_dbg_remove_breakpoint = Z.Fc)(a);
    f._webapi_dbg_break = () => (f._webapi_dbg_break = Z.Gc)();
    f._webapi_dbg_continue = () => (f._webapi_dbg_continue = Z.Hc)();
    f._webapi_dbg_step_next = () => (f._webapi_dbg_step_next = Z.Ic)();
    f._webapi_dbg_step_into = () => (f._webapi_dbg_step_into = Z.Jc)();
    f._webapi_dbg_cpu_state = () => (f._webapi_dbg_cpu_state = Z.Kc)();
    f._webapi_dbg_request_disassembly = (a, b, c) =>
        (f._webapi_dbg_request_disassembly = Z.Lc)(a, b, c);
    f._webapi_dbg_read_memory = (a, b) =>
        (f._webapi_dbg_read_memory = Z.Mc)(a, b);
    f._webapi_input = (a) => (f._webapi_input = Z.Nc)(a);
    var tc = (f.__sapp_emsc_onpaste = (a) =>
            (tc = f.__sapp_emsc_onpaste = Z.Oc)(a)),
        sc = (f.__sapp_html5_get_ask_leave_site = () =>
            (sc = f.__sapp_html5_get_ask_leave_site = Z.Pc)()),
        uc = (f.__sapp_emsc_begin_drop = (a) =>
            (uc = f.__sapp_emsc_begin_drop = Z.Qc)(a)),
        vc = (f.__sapp_emsc_drop = (a, b) =>
            (vc = f.__sapp_emsc_drop = Z.Rc)(a, b)),
        wc = (f.__sapp_emsc_end_drop = (a, b, c) =>
            (wc = f.__sapp_emsc_end_drop = Z.Sc)(a, b, c)),
        xc = (f.__sapp_emsc_invoke_fetch_cb = (a, b, c, d, e, h, g, l) =>
            (xc = f.__sapp_emsc_invoke_fetch_cb = Z.Tc)(
                a,
                b,
                c,
                d,
                e,
                h,
                g,
                l
            )),
        Fc = (f._main = (a, b) => (Fc = f._main = Z.Uc)(a, b)),
        zc = (f.__saudio_emsc_pull = (a) =>
            (zc = f.__saudio_emsc_pull = Z.Vc)(a)),
        yc = (f.__sargs_add_kvp = (a, b) =>
            (yc = f.__sargs_add_kvp = Z.Wc)(a, b)),
        Dc = (f.__sfetch_emsc_head_response = (a, b) =>
            (Dc = f.__sfetch_emsc_head_response = Z.Xc)(a, b)),
        Ac = (f.__sfetch_emsc_get_response = (a, b, c) =>
            (Ac = f.__sfetch_emsc_get_response = Z.Yc)(a, b, c)),
        Cc = (f.__sfetch_emsc_failed_http_status = (a, b) =>
            (Cc = f.__sfetch_emsc_failed_http_status = Z.Zc)(a, b)),
        Bc = (f.__sfetch_emsc_failed_buffer_too_small = (a) =>
            (Bc = f.__sfetch_emsc_failed_buffer_too_small = Z._c)(a)),
        pc = (a, b) => (pc = Z.ad)(a, b),
        mc = (a) => (mc = Z.bd)(a),
        kc = (a) => (kc = Z.cd)(a),
        lc = () => (lc = Z.dd)(),
        Gc,
        Hc;
    A = function Ic() {
        Gc || Jc();
        Gc || (A = Ic);
    };
    function Kc(a = []) {
        var b = Fc;
        a.unshift(fa);
        var c = a.length,
            d = kc(4 * (c + 1)),
            e = d;
        a.forEach((g) => {
            w[e >> 2] = B(g);
            e += 4;
        });
        w[e >> 2] = 0;
        try {
            var h = b(c, d);
            Ra(h);
        } catch (g) {
            Oa(g);
        }
    }
    function Jc() {
        var a = ea;
        function b() {
            if (!Gc && ((Gc = 1), (f.calledRun = 1), !q)) {
                za(ua);
                za(va);
                f.onRuntimeInitialized?.();
                Lc && Kc(a);
                var c = f.postRun;
                c && ("function" == typeof c && (c = [c]), c.forEach(Aa));
                za(wa);
            }
        }
        if (!(0 < z)) {
            if (!Hc && ((Hc = 1), xa(), 0 < z)) return;
            f.setStatus
                ? (f.setStatus("Running..."),
                  setTimeout(() => {
                      setTimeout(() => f.setStatus(""), 1);
                      b();
                  }, 1))
                : b();
        }
    }
    if (f.preInit)
        for (
            "function" == typeof f.preInit && (f.preInit = [f.preInit]);
            0 < f.preInit.length;

        )
            f.preInit.pop()();
    var Lc = !0;
    f.noInitialRun && (Lc = !1);
    Jc();
};
