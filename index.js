(function() {
    const e = document.createElement("link").relList;
    if (e && e.supports && e.supports("modulepreload"))
        return;
    for (const s of document.querySelectorAll('link[rel="modulepreload"]'))
        i(s);
    new MutationObserver(s=>{
        for (const n of s)
            if (n.type === "childList")
                for (const o of n.addedNodes)
                    o.tagName === "LINK" && o.rel === "modulepreload" && i(o)
    }
    ).observe(document, {
        childList: !0,
        subtree: !0
    });
    function t(s) {
        const n = {};
        return s.integrity && (n.integrity = s.integrity),
        s.referrerPolicy && (n.referrerPolicy = s.referrerPolicy),
        s.crossOrigin === "use-credentials" ? n.credentials = "include" : s.crossOrigin === "anonymous" ? n.credentials = "omit" : n.credentials = "same-origin",
        n
    }
    function i(s) {
        if (s.ep)
            return;
        s.ep = !0;
        const n = t(s);
        fetch(s.href, n)
    }
  }
  )();
  const J = async()=>{}
  , N = r=>{
    const e = r.byteLength - 8;
    if (e - 1 <= 0)
        throw new Error("sharedArrayBuffer size is too small");
    const i = new Uint8Array(r,4 + 4)
      , s = new Int32Array(r,0,2)
      , n = ()=>{
        const l = Atomics.load(s, 0)
          , d = Atomics.load(s, 1)
          , w = l <= d ? e - d + l - 1 : l - d - 1
          , p = e - 1 - w;
        return {
            r: l,
            w: d,
            remainingCapacity: w,
            storedDataSize: p
        }
    }
      , o = l=>{
        Atomics.store(s, 0, l),
        Atomics.notify(s, 0)
    }
      , c = l=>{
        f("updateW"),
        Atomics.store(s, 1, l),
        Atomics.notify(s, 1)
    }
      , f = l=>{
        console.log({
            isWebWorker: typeof WorkerGlobalScope < "u",
            msg: l
        })
    }
      , a = ()=>{
        f("blocking wait w change"),
        Atomics.wait(s, 1, Atomics.load(s, 1)),
        f("blocking wait w change")
    }
      , u = async()=>{
        const l = Atomics.waitAsync(s, 1, Atomics.load(s, 1));
        l.async && await l.value
    }
      , h = {
        write: l=>{
            const d = n();
            if (l.byteLength > d.remainingCapacity)
                throw new Error("FIXME: capacity over");
            let w = d.w;
            for (let p = 0; p < l.byteLength; ++p)
                i[w] = l[p],
                w = (w + 1) % e;
            c(w)
        }
        ,
        read: ()=>{
            const l = n()
              , d = new Uint8Array(l.storedDataSize);
            let w = l.r;
            for (let p = 0; p < l.storedDataSize; ++p)
                d[p] = i[w],
                w = (w + 1) % e;
            return o(w),
            d
        }
        ,
        readBlocking: ()=>{
            const l = h.read();
            return l.byteLength !== 0 ? l : (a(),
            h.read())
        }
        ,
        blockUntilReadable: ()=>{
            a()
        }
        ,
        readBlockingAsync: async()=>(await u(),
        h.read())
    };
    return h
  }
  ;
  function Z(r) {
    for (var e = r.length, t = 0, i = 0; i < e; ) {
        var s = r.charCodeAt(i++);
        if (s & 4294967168)
            if (!(s & 4294965248))
                t += 2;
            else {
                if (s >= 55296 && s <= 56319 && i < e) {
                    var n = r.charCodeAt(i);
                    (n & 64512) === 56320 && (++i,
                    s = ((s & 1023) << 10) + (n & 1023) + 65536)
                }
                s & 4294901760 ? t += 4 : t += 3
            }
        else {
            t++;
            continue
        }
    }
    return t
  }
  function Q(r, e, t) {
    for (var i = r.length, s = t, n = 0; n < i; ) {
        var o = r.charCodeAt(n++);
        if (o & 4294967168)
            if (!(o & 4294965248))
                e[s++] = o >> 6 & 31 | 192;
            else {
                if (o >= 55296 && o <= 56319 && n < i) {
                    var c = r.charCodeAt(n);
                    (c & 64512) === 56320 && (++n,
                    o = ((o & 1023) << 10) + (c & 1023) + 65536)
                }
                o & 4294901760 ? (e[s++] = o >> 18 & 7 | 240,
                e[s++] = o >> 12 & 63 | 128,
                e[s++] = o >> 6 & 63 | 128) : (e[s++] = o >> 12 & 15 | 224,
                e[s++] = o >> 6 & 63 | 128)
            }
        else {
            e[s++] = o;
            continue
        }
        e[s++] = o & 63 | 128
    }
  }
  var j = new TextEncoder
  , ee = 50;
  function te(r, e, t) {
    j.encodeInto(r, e.subarray(t))
  }
  function re(r, e, t) {
    r.length > ee ? te(r, e, t) : Q(r, e, t)
  }
  var ie = 4096;
  function O(r, e, t) {
    for (var i = e, s = i + t, n = [], o = ""; i < s; ) {
        var c = r[i++];
        if (!(c & 128))
            n.push(c);
        else if ((c & 224) === 192) {
            var f = r[i++] & 63;
            n.push((c & 31) << 6 | f)
        } else if ((c & 240) === 224) {
            var f = r[i++] & 63
              , a = r[i++] & 63;
            n.push((c & 31) << 12 | f << 6 | a)
        } else if ((c & 248) === 240) {
            var f = r[i++] & 63
              , a = r[i++] & 63
              , u = r[i++] & 63
              , h = (c & 7) << 18 | f << 12 | a << 6 | u;
            h > 65535 && (h -= 65536,
            n.push(h >>> 10 & 1023 | 55296),
            h = 56320 | h & 1023),
            n.push(h)
        } else
            n.push(c);
        n.length >= ie && (o += String.fromCharCode.apply(String, n),
        n.length = 0)
    }
    return n.length > 0 && (o += String.fromCharCode.apply(String, n)),
    o
  }
  var ne = new TextDecoder
  , se = 200;
  function oe(r, e, t) {
    var i = r.subarray(e, e + t);
    return ne.decode(i)
  }
  function ae(r, e, t) {
    return t > se ? oe(r, e, t) : O(r, e, t)
  }
  var S = function() {
    function r(e, t) {
        this.type = e,
        this.data = t
    }
    return r
  }()
  , ce = globalThis && globalThis.__extends || function() {
    var r = function(e, t) {
        return r = Object.setPrototypeOf || {
            __proto__: []
        }instanceof Array && function(i, s) {
            i.__proto__ = s
        }
        || function(i, s) {
            for (var n in s)
                Object.prototype.hasOwnProperty.call(s, n) && (i[n] = s[n])
        }
        ,
        r(e, t)
    };
    return function(e, t) {
        if (typeof t != "function" && t !== null)
            throw new TypeError("Class extends value " + String(t) + " is not a constructor or null");
        r(e, t);
        function i() {
            this.constructor = e
        }
        e.prototype = t === null ? Object.create(t) : (i.prototype = t.prototype,
        new i)
    }
  }()
  , x = function(r) {
    ce(e, r);
    function e(t) {
        var i = r.call(this, t) || this
          , s = Object.create(e.prototype);
        return Object.setPrototypeOf(i, s),
        Object.defineProperty(i, "name", {
            configurable: !0,
            enumerable: !1,
            value: e.name
        }),
        i
    }
    return e
  }(Error)
  , E = 4294967295;
  function le(r, e, t) {
    var i = t / 4294967296
      , s = t;
    r.setUint32(e, i),
    r.setUint32(e + 4, s)
  }
  function V(r, e, t) {
    var i = Math.floor(t / 4294967296)
      , s = t;
    r.setUint32(e, i),
    r.setUint32(e + 4, s)
  }
  function H(r, e) {
    var t = r.getInt32(e)
      , i = r.getUint32(e + 4);
    return t * 4294967296 + i
  }
  function fe(r, e) {
    var t = r.getUint32(e)
      , i = r.getUint32(e + 4);
    return t * 4294967296 + i
  }
  var ue = -1
  , he = 4294967296 - 1
  , de = 17179869184 - 1;
  function we(r) {
    var e = r.sec
      , t = r.nsec;
    if (e >= 0 && t >= 0 && e <= de)
        if (t === 0 && e <= he) {
            var i = new Uint8Array(4)
              , s = new DataView(i.buffer);
            return s.setUint32(0, e),
            i
        } else {
            var n = e / 4294967296
              , o = e & 4294967295
              , i = new Uint8Array(8)
              , s = new DataView(i.buffer);
            return s.setUint32(0, t << 2 | n & 3),
            s.setUint32(4, o),
            i
        }
    else {
        var i = new Uint8Array(12)
          , s = new DataView(i.buffer);
        return s.setUint32(0, t),
        V(s, 4, e),
        i
    }
  }
  function pe(r) {
    var e = r.getTime()
      , t = Math.floor(e / 1e3)
      , i = (e - t * 1e3) * 1e6
      , s = Math.floor(i / 1e9);
    return {
        sec: t + s,
        nsec: i - s * 1e9
    }
  }
  function ve(r) {
    if (r instanceof Date) {
        var e = pe(r);
        return we(e)
    } else
        return null
  }
  function ye(r) {
    var e = new DataView(r.buffer,r.byteOffset,r.byteLength);
    switch (r.byteLength) {
    case 4:
        {
            var t = e.getUint32(0)
              , i = 0;
            return {
                sec: t,
                nsec: i
            }
        }
    case 8:
        {
            var s = e.getUint32(0)
              , n = e.getUint32(4)
              , t = (s & 3) * 4294967296 + n
              , i = s >>> 2;
            return {
                sec: t,
                nsec: i
            }
        }
    case 12:
        {
            var t = H(e, 4)
              , i = e.getUint32(0);
            return {
                sec: t,
                nsec: i
            }
        }
    default:
        throw new x("Unrecognized data size for timestamp (expected 4, 8, or 12): ".concat(r.length))
    }
  }
  function ge(r) {
    var e = ye(r);
    return new Date(e.sec * 1e3 + e.nsec / 1e6)
  }
  var xe = {
    type: ue,
    encode: ve,
    decode: ge
  }
  , K = function() {
    function r() {
        this.builtInEncoders = [],
        this.builtInDecoders = [],
        this.encoders = [],
        this.decoders = [],
        this.register(xe)
    }
    return r.prototype.register = function(e) {
        var t = e.type
          , i = e.encode
          , s = e.decode;
        if (t >= 0)
            this.encoders[t] = i,
            this.decoders[t] = s;
        else {
            var n = 1 + t;
            this.builtInEncoders[n] = i,
            this.builtInDecoders[n] = s
        }
    }
    ,
    r.prototype.tryToEncode = function(e, t) {
        for (var i = 0; i < this.builtInEncoders.length; i++) {
            var s = this.builtInEncoders[i];
            if (s != null) {
                var n = s(e, t);
                if (n != null) {
                    var o = -1 - i;
                    return new S(o,n)
                }
            }
        }
        for (var i = 0; i < this.encoders.length; i++) {
            var s = this.encoders[i];
            if (s != null) {
                var n = s(e, t);
                if (n != null) {
                    var o = i;
                    return new S(o,n)
                }
            }
        }
        return e instanceof S ? e : null
    }
    ,
    r.prototype.decode = function(e, t, i) {
        var s = t < 0 ? this.builtInDecoders[-1 - t] : this.decoders[t];
        return s ? s(e, t, i) : new S(t,e)
    }
    ,
    r.defaultCodec = new r,
    r
  }();
  function I(r) {
    return r instanceof Uint8Array ? r : ArrayBuffer.isView(r) ? new Uint8Array(r.buffer,r.byteOffset,r.byteLength) : r instanceof ArrayBuffer ? new Uint8Array(r) : Uint8Array.from(r)
  }
  function me(r) {
    if (r instanceof ArrayBuffer)
        return new DataView(r);
    var e = I(r);
    return new DataView(e.buffer,e.byteOffset,e.byteLength)
  }
  var Ue = 100
  , Ee = 2048
  , _e = function() {
    function r(e) {
        var t, i, s, n, o, c, f, a;
        this.extensionCodec = (t = e?.extensionCodec) !== null && t !== void 0 ? t : K.defaultCodec,
        this.context = e?.context,
        this.useBigInt64 = (i = e?.useBigInt64) !== null && i !== void 0 ? i : !1,
        this.maxDepth = (s = e?.maxDepth) !== null && s !== void 0 ? s : Ue,
        this.initialBufferSize = (n = e?.initialBufferSize) !== null && n !== void 0 ? n : Ee,
        this.sortKeys = (o = e?.sortKeys) !== null && o !== void 0 ? o : !1,
        this.forceFloat32 = (c = e?.forceFloat32) !== null && c !== void 0 ? c : !1,
        this.ignoreUndefined = (f = e?.ignoreUndefined) !== null && f !== void 0 ? f : !1,
        this.forceIntegerToFloat = (a = e?.forceIntegerToFloat) !== null && a !== void 0 ? a : !1,
        this.pos = 0,
        this.view = new DataView(new ArrayBuffer(this.initialBufferSize)),
        this.bytes = new Uint8Array(this.view.buffer)
    }
    return r.prototype.reinitializeState = function() {
        this.pos = 0
    }
    ,
    r.prototype.encodeSharedRef = function(e) {
        return this.reinitializeState(),
        this.doEncode(e, 1),
        this.bytes.subarray(0, this.pos)
    }
    ,
    r.prototype.encode = function(e) {
        return this.reinitializeState(),
        this.doEncode(e, 1),
        this.bytes.slice(0, this.pos)
    }
    ,
    r.prototype.doEncode = function(e, t) {
        if (t > this.maxDepth)
            throw new Error("Too deep objects in depth ".concat(t));
        e == null ? this.encodeNil() : typeof e == "boolean" ? this.encodeBoolean(e) : typeof e == "number" ? this.forceIntegerToFloat ? this.encodeNumberAsFloat(e) : this.encodeNumber(e) : typeof e == "string" ? this.encodeString(e) : this.useBigInt64 && typeof e == "bigint" ? this.encodeBigInt64(e) : this.encodeObject(e, t)
    }
    ,
    r.prototype.ensureBufferSizeToWrite = function(e) {
        var t = this.pos + e;
        this.view.byteLength < t && this.resizeBuffer(t * 2)
    }
    ,
    r.prototype.resizeBuffer = function(e) {
        var t = new ArrayBuffer(e)
          , i = new Uint8Array(t)
          , s = new DataView(t);
        i.set(this.bytes),
        this.view = s,
        this.bytes = i
    }
    ,
    r.prototype.encodeNil = function() {
        this.writeU8(192)
    }
    ,
    r.prototype.encodeBoolean = function(e) {
        e === !1 ? this.writeU8(194) : this.writeU8(195)
    }
    ,
    r.prototype.encodeNumber = function(e) {
        !this.forceIntegerToFloat && Number.isSafeInteger(e) ? e >= 0 ? e < 128 ? this.writeU8(e) : e < 256 ? (this.writeU8(204),
        this.writeU8(e)) : e < 65536 ? (this.writeU8(205),
        this.writeU16(e)) : e < 4294967296 ? (this.writeU8(206),
        this.writeU32(e)) : this.useBigInt64 ? this.encodeNumberAsFloat(e) : (this.writeU8(207),
        this.writeU64(e)) : e >= -32 ? this.writeU8(224 | e + 32) : e >= -128 ? (this.writeU8(208),
        this.writeI8(e)) : e >= -32768 ? (this.writeU8(209),
        this.writeI16(e)) : e >= -2147483648 ? (this.writeU8(210),
        this.writeI32(e)) : this.useBigInt64 ? this.encodeNumberAsFloat(e) : (this.writeU8(211),
        this.writeI64(e)) : this.encodeNumberAsFloat(e)
    }
    ,
    r.prototype.encodeNumberAsFloat = function(e) {
        this.forceFloat32 ? (this.writeU8(202),
        this.writeF32(e)) : (this.writeU8(203),
        this.writeF64(e))
    }
    ,
    r.prototype.encodeBigInt64 = function(e) {
        e >= BigInt(0) ? (this.writeU8(207),
        this.writeBigUint64(e)) : (this.writeU8(211),
        this.writeBigInt64(e))
    }
    ,
    r.prototype.writeStringHeader = function(e) {
        if (e < 32)
            this.writeU8(160 + e);
        else if (e < 256)
            this.writeU8(217),
            this.writeU8(e);
        else if (e < 65536)
            this.writeU8(218),
            this.writeU16(e);
        else if (e < 4294967296)
            this.writeU8(219),
            this.writeU32(e);
        else
            throw new Error("Too long string: ".concat(e, " bytes in UTF-8"))
    }
    ,
    r.prototype.encodeString = function(e) {
        var t = 5
          , i = Z(e);
        this.ensureBufferSizeToWrite(t + i),
        this.writeStringHeader(i),
        re(e, this.bytes, this.pos),
        this.pos += i
    }
    ,
    r.prototype.encodeObject = function(e, t) {
        var i = this.extensionCodec.tryToEncode(e, this.context);
        if (i != null)
            this.encodeExtension(i);
        else if (Array.isArray(e))
            this.encodeArray(e, t);
        else if (ArrayBuffer.isView(e))
            this.encodeBinary(e);
        else if (typeof e == "object")
            this.encodeMap(e, t);
        else
            throw new Error("Unrecognized object: ".concat(Object.prototype.toString.apply(e)))
    }
    ,
    r.prototype.encodeBinary = function(e) {
        var t = e.byteLength;
        if (t < 256)
            this.writeU8(196),
            this.writeU8(t);
        else if (t < 65536)
            this.writeU8(197),
            this.writeU16(t);
        else if (t < 4294967296)
            this.writeU8(198),
            this.writeU32(t);
        else
            throw new Error("Too large binary: ".concat(t));
        var i = I(e);
        this.writeU8a(i)
    }
    ,
    r.prototype.encodeArray = function(e, t) {
        var i = e.length;
        if (i < 16)
            this.writeU8(144 + i);
        else if (i < 65536)
            this.writeU8(220),
            this.writeU16(i);
        else if (i < 4294967296)
            this.writeU8(221),
            this.writeU32(i);
        else
            throw new Error("Too large array: ".concat(i));
        for (var s = 0, n = e; s < n.length; s++) {
            var o = n[s];
            this.doEncode(o, t + 1)
        }
    }
    ,
    r.prototype.countWithoutUndefined = function(e, t) {
        for (var i = 0, s = 0, n = t; s < n.length; s++) {
            var o = n[s];
            e[o] !== void 0 && i++
        }
        return i
    }
    ,
    r.prototype.encodeMap = function(e, t) {
        var i = Object.keys(e);
        this.sortKeys && i.sort();
        var s = this.ignoreUndefined ? this.countWithoutUndefined(e, i) : i.length;
        if (s < 16)
            this.writeU8(128 + s);
        else if (s < 65536)
            this.writeU8(222),
            this.writeU16(s);
        else if (s < 4294967296)
            this.writeU8(223),
            this.writeU32(s);
        else
            throw new Error("Too large map object: ".concat(s));
        for (var n = 0, o = i; n < o.length; n++) {
            var c = o[n]
              , f = e[c];
            this.ignoreUndefined && f === void 0 || (this.encodeString(c),
            this.doEncode(f, t + 1))
        }
    }
    ,
    r.prototype.encodeExtension = function(e) {
        var t = e.data.length;
        if (t === 1)
            this.writeU8(212);
        else if (t === 2)
            this.writeU8(213);
        else if (t === 4)
            this.writeU8(214);
        else if (t === 8)
            this.writeU8(215);
        else if (t === 16)
            this.writeU8(216);
        else if (t < 256)
            this.writeU8(199),
            this.writeU8(t);
        else if (t < 65536)
            this.writeU8(200),
            this.writeU16(t);
        else if (t < 4294967296)
            this.writeU8(201),
            this.writeU32(t);
        else
            throw new Error("Too large extension object: ".concat(t));
        this.writeI8(e.type),
        this.writeU8a(e.data)
    }
    ,
    r.prototype.writeU8 = function(e) {
        this.ensureBufferSizeToWrite(1),
        this.view.setUint8(this.pos, e),
        this.pos++
    }
    ,
    r.prototype.writeU8a = function(e) {
        var t = e.length;
        this.ensureBufferSizeToWrite(t),
        this.bytes.set(e, this.pos),
        this.pos += t
    }
    ,
    r.prototype.writeI8 = function(e) {
        this.ensureBufferSizeToWrite(1),
        this.view.setInt8(this.pos, e),
        this.pos++
    }
    ,
    r.prototype.writeU16 = function(e) {
        this.ensureBufferSizeToWrite(2),
        this.view.setUint16(this.pos, e),
        this.pos += 2
    }
    ,
    r.prototype.writeI16 = function(e) {
        this.ensureBufferSizeToWrite(2),
        this.view.setInt16(this.pos, e),
        this.pos += 2
    }
    ,
    r.prototype.writeU32 = function(e) {
        this.ensureBufferSizeToWrite(4),
        this.view.setUint32(this.pos, e),
        this.pos += 4
    }
    ,
    r.prototype.writeI32 = function(e) {
        this.ensureBufferSizeToWrite(4),
        this.view.setInt32(this.pos, e),
        this.pos += 4
    }
    ,
    r.prototype.writeF32 = function(e) {
        this.ensureBufferSizeToWrite(4),
        this.view.setFloat32(this.pos, e),
        this.pos += 4
    }
    ,
    r.prototype.writeF64 = function(e) {
        this.ensureBufferSizeToWrite(8),
        this.view.setFloat64(this.pos, e),
        this.pos += 8
    }
    ,
    r.prototype.writeU64 = function(e) {
        this.ensureBufferSizeToWrite(8),
        le(this.view, this.pos, e),
        this.pos += 8
    }
    ,
    r.prototype.writeI64 = function(e) {
        this.ensureBufferSizeToWrite(8),
        V(this.view, this.pos, e),
        this.pos += 8
    }
    ,
    r.prototype.writeBigUint64 = function(e) {
        this.ensureBufferSizeToWrite(8),
        this.view.setBigUint64(this.pos, e),
        this.pos += 8
    }
    ,
    r.prototype.writeBigInt64 = function(e) {
        this.ensureBufferSizeToWrite(8),
        this.view.setBigInt64(this.pos, e),
        this.pos += 8
    }
    ,
    r
  }();
  function Se(r, e) {
    var t = new _e(e);
    return t.encodeSharedRef(r)
  }
  function D(r) {
    return "".concat(r < 0 ? "-" : "", "0x").concat(Math.abs(r).toString(16).padStart(2, "0"))
  }
  var Te = 16
  , Ae = 16
  , Ie = function() {
    function r(e, t) {
        e === void 0 && (e = Te),
        t === void 0 && (t = Ae),
        this.maxKeyLength = e,
        this.maxLengthPerKey = t,
        this.hit = 0,
        this.miss = 0,
        this.caches = [];
        for (var i = 0; i < this.maxKeyLength; i++)
            this.caches.push([])
    }
    return r.prototype.canBeCached = function(e) {
        return e > 0 && e <= this.maxKeyLength
    }
    ,
    r.prototype.find = function(e, t, i) {
        var s = this.caches[i - 1];
        e: for (var n = 0, o = s; n < o.length; n++) {
            for (var c = o[n], f = c.bytes, a = 0; a < i; a++)
                if (f[a] !== e[t + a])
                    continue e;
            return c.str
        }
        return null
    }
    ,
    r.prototype.store = function(e, t) {
        var i = this.caches[e.length - 1]
          , s = {
            bytes: e,
            str: t
        };
        i.length >= this.maxLengthPerKey ? i[Math.random() * i.length | 0] = s : i.push(s)
    }
    ,
    r.prototype.decode = function(e, t, i) {
        var s = this.find(e, t, i);
        if (s != null)
            return this.hit++,
            s;
        this.miss++;
        var n = O(e, t, i)
          , o = Uint8Array.prototype.slice.call(e, t, t + i);
        return this.store(o, n),
        n
    }
    ,
    r
  }()
  , be = globalThis && globalThis.__awaiter || function(r, e, t, i) {
    function s(n) {
        return n instanceof t ? n : new t(function(o) {
            o(n)
        }
        )
    }
    return new (t || (t = Promise))(function(n, o) {
        function c(u) {
            try {
                a(i.next(u))
            } catch (h) {
                o(h)
            }
        }
        function f(u) {
            try {
                a(i.throw(u))
            } catch (h) {
                o(h)
            }
        }
        function a(u) {
            u.done ? n(u.value) : s(u.value).then(c, f)
        }
        a((i = i.apply(r, e || [])).next())
    }
    )
  }
  , k = globalThis && globalThis.__generator || function(r, e) {
    var t = {
        label: 0,
        sent: function() {
            if (n[0] & 1)
                throw n[1];
            return n[1]
        },
        trys: [],
        ops: []
    }, i, s, n, o;
    return o = {
        next: c(0),
        throw: c(1),
        return: c(2)
    },
    typeof Symbol == "function" && (o[Symbol.iterator] = function() {
        return this
    }
    ),
    o;
    function c(a) {
        return function(u) {
            return f([a, u])
        }
    }
    function f(a) {
        if (i)
            throw new TypeError("Generator is already executing.");
        for (; o && (o = 0,
        a[0] && (t = 0)),
        t; )
            try {
                if (i = 1,
                s && (n = a[0] & 2 ? s.return : a[0] ? s.throw || ((n = s.return) && n.call(s),
                0) : s.next) && !(n = n.call(s, a[1])).done)
                    return n;
                switch (s = 0,
                n && (a = [a[0] & 2, n.value]),
                a[0]) {
                case 0:
                case 1:
                    n = a;
                    break;
                case 4:
                    return t.label++,
                    {
                        value: a[1],
                        done: !1
                    };
                case 5:
                    t.label++,
                    s = a[1],
                    a = [0];
                    continue;
                case 7:
                    a = t.ops.pop(),
                    t.trys.pop();
                    continue;
                default:
                    if (n = t.trys,
                    !(n = n.length > 0 && n[n.length - 1]) && (a[0] === 6 || a[0] === 2)) {
                        t = 0;
                        continue
                    }
                    if (a[0] === 3 && (!n || a[1] > n[0] && a[1] < n[3])) {
                        t.label = a[1];
                        break
                    }
                    if (a[0] === 6 && t.label < n[1]) {
                        t.label = n[1],
                        n = a;
                        break
                    }
                    if (n && t.label < n[2]) {
                        t.label = n[2],
                        t.ops.push(a);
                        break
                    }
                    n[2] && t.ops.pop(),
                    t.trys.pop();
                    continue
                }
                a = e.call(r, t)
            } catch (u) {
                a = [6, u],
                s = 0
            } finally {
                i = n = 0
            }
        if (a[0] & 5)
            throw a[1];
        return {
            value: a[0] ? a[1] : void 0,
            done: !0
        }
    }
  }
  , F = globalThis && globalThis.__asyncValues || function(r) {
    if (!Symbol.asyncIterator)
        throw new TypeError("Symbol.asyncIterator is not defined.");
    var e = r[Symbol.asyncIterator], t;
    return e ? e.call(r) : (r = typeof __values == "function" ? __values(r) : r[Symbol.iterator](),
    t = {},
    i("next"),
    i("throw"),
    i("return"),
    t[Symbol.asyncIterator] = function() {
        return this
    }
    ,
    t);
    function i(n) {
        t[n] = r[n] && function(o) {
            return new Promise(function(c, f) {
                o = r[n](o),
                s(c, f, o.done, o.value)
            }
            )
        }
    }
    function s(n, o, c, f) {
        Promise.resolve(f).then(function(a) {
            n({
                value: a,
                done: c
            })
        }, o)
    }
  }
  , m = globalThis && globalThis.__await || function(r) {
    return this instanceof m ? (this.v = r,
    this) : new m(r)
  }
  , Be = globalThis && globalThis.__asyncGenerator || function(r, e, t) {
    if (!Symbol.asyncIterator)
        throw new TypeError("Symbol.asyncIterator is not defined.");
    var i = t.apply(r, e || []), s, n = [];
    return s = {},
    o("next"),
    o("throw"),
    o("return"),
    s[Symbol.asyncIterator] = function() {
        return this
    }
    ,
    s;
    function o(l) {
        i[l] && (s[l] = function(d) {
            return new Promise(function(w, p) {
                n.push([l, d, w, p]) > 1 || c(l, d)
            }
            )
        }
        )
    }
    function c(l, d) {
        try {
            f(i[l](d))
        } catch (w) {
            h(n[0][3], w)
        }
    }
    function f(l) {
        l.value instanceof m ? Promise.resolve(l.value.v).then(a, u) : h(n[0][2], l)
    }
    function a(l) {
        c("next", l)
    }
    function u(l) {
        c("throw", l)
    }
    function h(l, d) {
        l(d),
        n.shift(),
        n.length && c(n[0][0], n[0][1])
    }
  }
  , R = "array"
  , T = "map_key"
  , Ce = "map_value"
  , De = function(r) {
    return typeof r == "string" || typeof r == "number"
  }
  , _ = -1
  , z = new DataView(new ArrayBuffer(0))
  , ke = new Uint8Array(z.buffer);
  try {
    z.getInt8(0)
  } catch (r) {
    if (!(r instanceof RangeError))
        throw new Error("This module is not supported in the current JavaScript engine because DataView does not throw RangeError on out-of-bounds access")
  }
  var M = RangeError
  , W = new M("Insufficient data")
  , Me = new Ie
  , ze = function() {
    function r(e) {
        var t, i, s, n, o, c, f;
        this.totalPos = 0,
        this.pos = 0,
        this.view = z,
        this.bytes = ke,
        this.headByte = _,
        this.stack = [],
        this.extensionCodec = (t = e?.extensionCodec) !== null && t !== void 0 ? t : K.defaultCodec,
        this.context = e?.context,
        this.useBigInt64 = (i = e?.useBigInt64) !== null && i !== void 0 ? i : !1,
        this.maxStrLength = (s = e?.maxStrLength) !== null && s !== void 0 ? s : E,
        this.maxBinLength = (n = e?.maxBinLength) !== null && n !== void 0 ? n : E,
        this.maxArrayLength = (o = e?.maxArrayLength) !== null && o !== void 0 ? o : E,
        this.maxMapLength = (c = e?.maxMapLength) !== null && c !== void 0 ? c : E,
        this.maxExtLength = (f = e?.maxExtLength) !== null && f !== void 0 ? f : E,
        this.keyDecoder = e?.keyDecoder !== void 0 ? e.keyDecoder : Me
    }
    return r.prototype.reinitializeState = function() {
        this.totalPos = 0,
        this.headByte = _,
        this.stack.length = 0
    }
    ,
    r.prototype.setBuffer = function(e) {
        this.bytes = I(e),
        this.view = me(this.bytes),
        this.pos = 0
    }
    ,
    r.prototype.appendBuffer = function(e) {
        if (this.headByte === _ && !this.hasRemaining(1))
            this.setBuffer(e);
        else {
            var t = this.bytes.subarray(this.pos)
              , i = I(e)
              , s = new Uint8Array(t.length + i.length);
            s.set(t),
            s.set(i, t.length),
            this.setBuffer(s)
        }
    }
    ,
    r.prototype.hasRemaining = function(e) {
        return this.view.byteLength - this.pos >= e
    }
    ,
    r.prototype.createExtraByteError = function(e) {
        var t = this
          , i = t.view
          , s = t.pos;
        return new RangeError("Extra ".concat(i.byteLength - s, " of ").concat(i.byteLength, " byte(s) found at buffer[").concat(e, "]"))
    }
    ,
    r.prototype.decode = function(e) {
        this.reinitializeState(),
        this.setBuffer(e);
        var t = this.doDecodeSync();
        if (this.hasRemaining(1))
            throw this.createExtraByteError(this.pos);
        return t
    }
    ,
    r.prototype.decodeMulti = function(e) {
        return k(this, function(t) {
            switch (t.label) {
            case 0:
                this.reinitializeState(),
                this.setBuffer(e),
                t.label = 1;
            case 1:
                return this.hasRemaining(1) ? [4, this.doDecodeSync()] : [3, 3];
            case 2:
                return t.sent(),
                [3, 1];
            case 3:
                return [2]
            }
        })
    }
    ,
    r.prototype.decodeAsync = function(e) {
        var t, i, s, n, o, c, f;
        return be(this, void 0, void 0, function() {
            var a, u, h, l, d, w, p, v;
            return k(this, function(g) {
                switch (g.label) {
                case 0:
                    a = !1,
                    g.label = 1;
                case 1:
                    g.trys.push([1, 6, 7, 12]),
                    t = !0,
                    i = F(e),
                    g.label = 2;
                case 2:
                    return [4, i.next()];
                case 3:
                    if (s = g.sent(),
                    n = s.done,
                    !!n)
                        return [3, 5];
                    f = s.value,
                    t = !1;
                    try {
                        if (h = f,
                        a)
                            throw this.createExtraByteError(this.totalPos);
                        this.appendBuffer(h);
                        try {
                            u = this.doDecodeSync(),
                            a = !0
                        } catch (L) {
                            if (!(L instanceof M))
                                throw L
                        }
                        this.totalPos += this.pos
                    } finally {
                        t = !0
                    }
                    g.label = 4;
                case 4:
                    return [3, 2];
                case 5:
                    return [3, 12];
                case 6:
                    return l = g.sent(),
                    o = {
                        error: l
                    },
                    [3, 12];
                case 7:
                    return g.trys.push([7, , 10, 11]),
                    !t && !n && (c = i.return) ? [4, c.call(i)] : [3, 9];
                case 8:
                    g.sent(),
                    g.label = 9;
                case 9:
                    return [3, 11];
                case 10:
                    if (o)
                        throw o.error;
                    return [7];
                case 11:
                    return [7];
                case 12:
                    if (a) {
                        if (this.hasRemaining(1))
                            throw this.createExtraByteError(this.totalPos);
                        return [2, u]
                    }
                    throw d = this,
                    w = d.headByte,
                    p = d.pos,
                    v = d.totalPos,
                    new RangeError("Insufficient data in parsing ".concat(D(w), " at ").concat(v, " (").concat(p, " in the current buffer)"))
                }
            })
        })
    }
    ,
    r.prototype.decodeArrayStream = function(e) {
        return this.decodeMultiAsync(e, !0)
    }
    ,
    r.prototype.decodeStream = function(e) {
        return this.decodeMultiAsync(e, !1)
    }
    ,
    r.prototype.decodeMultiAsync = function(e, t) {
        return Be(this, arguments, function() {
            var s, n, o, c, f, a, u, h, l, d, w, p;
            return k(this, function(v) {
                switch (v.label) {
                case 0:
                    s = t,
                    n = -1,
                    v.label = 1;
                case 1:
                    v.trys.push([1, 15, 16, 21]),
                    o = !0,
                    c = F(e),
                    v.label = 2;
                case 2:
                    return [4, m(c.next())];
                case 3:
                    if (f = v.sent(),
                    l = f.done,
                    !!l)
                        return [3, 14];
                    p = f.value,
                    o = !1,
                    v.label = 4;
                case 4:
                    if (v.trys.push([4, , 12, 13]),
                    a = p,
                    t && n === 0)
                        throw this.createExtraByteError(this.totalPos);
                    this.appendBuffer(a),
                    s && (n = this.readArraySize(),
                    s = !1,
                    this.complete()),
                    v.label = 5;
                case 5:
                    v.trys.push([5, 10, , 11]),
                    v.label = 6;
                case 6:
                    return [4, m(this.doDecodeSync())];
                case 7:
                    return [4, v.sent()];
                case 8:
                    return v.sent(),
                    --n === 0 ? [3, 9] : [3, 6];
                case 9:
                    return [3, 11];
                case 10:
                    if (u = v.sent(),
                    !(u instanceof M))
                        throw u;
                    return [3, 11];
                case 11:
                    return this.totalPos += this.pos,
                    [3, 13];
                case 12:
                    return o = !0,
                    [7];
                case 13:
                    return [3, 2];
                case 14:
                    return [3, 21];
                case 15:
                    return h = v.sent(),
                    d = {
                        error: h
                    },
                    [3, 21];
                case 16:
                    return v.trys.push([16, , 19, 20]),
                    !o && !l && (w = c.return) ? [4, m(w.call(c))] : [3, 18];
                case 17:
                    v.sent(),
                    v.label = 18;
                case 18:
                    return [3, 20];
                case 19:
                    if (d)
                        throw d.error;
                    return [7];
                case 20:
                    return [7];
                case 21:
                    return [2]
                }
            })
        })
    }
    ,
    r.prototype.doDecodeSync = function() {
        e: for (; ; ) {
            var e = this.readHeadByte()
              , t = void 0;
            if (e >= 224)
                t = e - 256;
            else if (e < 192)
                if (e < 128)
                    t = e;
                else if (e < 144) {
                    var i = e - 128;
                    if (i !== 0) {
                        this.pushMapState(i),
                        this.complete();
                        continue e
                    } else
                        t = {}
                } else if (e < 160) {
                    var i = e - 144;
                    if (i !== 0) {
                        this.pushArrayState(i),
                        this.complete();
                        continue e
                    } else
                        t = []
                } else {
                    var s = e - 160;
                    t = this.decodeUtf8String(s, 0)
                }
            else if (e === 192)
                t = null;
            else if (e === 194)
                t = !1;
            else if (e === 195)
                t = !0;
            else if (e === 202)
                t = this.readF32();
            else if (e === 203)
                t = this.readF64();
            else if (e === 204)
                t = this.readU8();
            else if (e === 205)
                t = this.readU16();
            else if (e === 206)
                t = this.readU32();
            else if (e === 207)
                this.useBigInt64 ? t = this.readU64AsBigInt() : t = this.readU64();
            else if (e === 208)
                t = this.readI8();
            else if (e === 209)
                t = this.readI16();
            else if (e === 210)
                t = this.readI32();
            else if (e === 211)
                this.useBigInt64 ? t = this.readI64AsBigInt() : t = this.readI64();
            else if (e === 217) {
                var s = this.lookU8();
                t = this.decodeUtf8String(s, 1)
            } else if (e === 218) {
                var s = this.lookU16();
                t = this.decodeUtf8String(s, 2)
            } else if (e === 219) {
                var s = this.lookU32();
                t = this.decodeUtf8String(s, 4)
            } else if (e === 220) {
                var i = this.readU16();
                if (i !== 0) {
                    this.pushArrayState(i),
                    this.complete();
                    continue e
                } else
                    t = []
            } else if (e === 221) {
                var i = this.readU32();
                if (i !== 0) {
                    this.pushArrayState(i),
                    this.complete();
                    continue e
                } else
                    t = []
            } else if (e === 222) {
                var i = this.readU16();
                if (i !== 0) {
                    this.pushMapState(i),
                    this.complete();
                    continue e
                } else
                    t = {}
            } else if (e === 223) {
                var i = this.readU32();
                if (i !== 0) {
                    this.pushMapState(i),
                    this.complete();
                    continue e
                } else
                    t = {}
            } else if (e === 196) {
                var i = this.lookU8();
                t = this.decodeBinary(i, 1)
            } else if (e === 197) {
                var i = this.lookU16();
                t = this.decodeBinary(i, 2)
            } else if (e === 198) {
                var i = this.lookU32();
                t = this.decodeBinary(i, 4)
            } else if (e === 212)
                t = this.decodeExtension(1, 0);
            else if (e === 213)
                t = this.decodeExtension(2, 0);
            else if (e === 214)
                t = this.decodeExtension(4, 0);
            else if (e === 215)
                t = this.decodeExtension(8, 0);
            else if (e === 216)
                t = this.decodeExtension(16, 0);
            else if (e === 199) {
                var i = this.lookU8();
                t = this.decodeExtension(i, 1)
            } else if (e === 200) {
                var i = this.lookU16();
                t = this.decodeExtension(i, 2)
            } else if (e === 201) {
                var i = this.lookU32();
                t = this.decodeExtension(i, 4)
            } else
                throw new x("Unrecognized type byte: ".concat(D(e)));
            this.complete();
            for (var n = this.stack; n.length > 0; ) {
                var o = n[n.length - 1];
                if (o.type === R)
                    if (o.array[o.position] = t,
                    o.position++,
                    o.position === o.size)
                        n.pop(),
                        t = o.array;
                    else
                        continue e;
                else if (o.type === T) {
                    if (!De(t))
                        throw new x("The type of key must be string or number but " + typeof t);
                    if (t === "__proto__")
                        throw new x("The key __proto__ is not allowed");
                    o.key = t,
                    o.type = Ce;
                    continue e
                } else if (o.map[o.key] = t,
                o.readCount++,
                o.readCount === o.size)
                    n.pop(),
                    t = o.map;
                else {
                    o.key = null,
                    o.type = T;
                    continue e
                }
            }
            return t
        }
    }
    ,
    r.prototype.readHeadByte = function() {
        return this.headByte === _ && (this.headByte = this.readU8()),
        this.headByte
    }
    ,
    r.prototype.complete = function() {
        this.headByte = _
    }
    ,
    r.prototype.readArraySize = function() {
        var e = this.readHeadByte();
        switch (e) {
        case 220:
            return this.readU16();
        case 221:
            return this.readU32();
        default:
            {
                if (e < 160)
                    return e - 144;
                throw new x("Unrecognized array type byte: ".concat(D(e)))
            }
        }
    }
    ,
    r.prototype.pushMapState = function(e) {
        if (e > this.maxMapLength)
            throw new x("Max length exceeded: map length (".concat(e, ") > maxMapLengthLength (").concat(this.maxMapLength, ")"));
        this.stack.push({
            type: T,
            size: e,
            key: null,
            readCount: 0,
            map: {}
        })
    }
    ,
    r.prototype.pushArrayState = function(e) {
        if (e > this.maxArrayLength)
            throw new x("Max length exceeded: array length (".concat(e, ") > maxArrayLength (").concat(this.maxArrayLength, ")"));
        this.stack.push({
            type: R,
            size: e,
            array: new Array(e),
            position: 0
        })
    }
    ,
    r.prototype.decodeUtf8String = function(e, t) {
        var i;
        if (e > this.maxStrLength)
            throw new x("Max length exceeded: UTF-8 byte length (".concat(e, ") > maxStrLength (").concat(this.maxStrLength, ")"));
        if (this.bytes.byteLength < this.pos + t + e)
            throw W;
        var s = this.pos + t, n;
        return this.stateIsMapKey() && (!((i = this.keyDecoder) === null || i === void 0) && i.canBeCached(e)) ? n = this.keyDecoder.decode(this.bytes, s, e) : n = ae(this.bytes, s, e),
        this.pos += t + e,
        n
    }
    ,
    r.prototype.stateIsMapKey = function() {
        if (this.stack.length > 0) {
            var e = this.stack[this.stack.length - 1];
            return e.type === T
        }
        return !1
    }
    ,
    r.prototype.decodeBinary = function(e, t) {
        if (e > this.maxBinLength)
            throw new x("Max length exceeded: bin length (".concat(e, ") > maxBinLength (").concat(this.maxBinLength, ")"));
        if (!this.hasRemaining(e + t))
            throw W;
        var i = this.pos + t
          , s = this.bytes.subarray(i, i + e);
        return this.pos += t + e,
        s
    }
    ,
    r.prototype.decodeExtension = function(e, t) {
        if (e > this.maxExtLength)
            throw new x("Max length exceeded: ext length (".concat(e, ") > maxExtLength (").concat(this.maxExtLength, ")"));
        var i = this.view.getInt8(this.pos + t)
          , s = this.decodeBinary(e, t + 1);
        return this.extensionCodec.decode(s, i, this.context)
    }
    ,
    r.prototype.lookU8 = function() {
        return this.view.getUint8(this.pos)
    }
    ,
    r.prototype.lookU16 = function() {
        return this.view.getUint16(this.pos)
    }
    ,
    r.prototype.lookU32 = function() {
        return this.view.getUint32(this.pos)
    }
    ,
    r.prototype.readU8 = function() {
        var e = this.view.getUint8(this.pos);
        return this.pos++,
        e
    }
    ,
    r.prototype.readI8 = function() {
        var e = this.view.getInt8(this.pos);
        return this.pos++,
        e
    }
    ,
    r.prototype.readU16 = function() {
        var e = this.view.getUint16(this.pos);
        return this.pos += 2,
        e
    }
    ,
    r.prototype.readI16 = function() {
        var e = this.view.getInt16(this.pos);
        return this.pos += 2,
        e
    }
    ,
    r.prototype.readU32 = function() {
        var e = this.view.getUint32(this.pos);
        return this.pos += 4,
        e
    }
    ,
    r.prototype.readI32 = function() {
        var e = this.view.getInt32(this.pos);
        return this.pos += 4,
        e
    }
    ,
    r.prototype.readU64 = function() {
        var e = fe(this.view, this.pos);
        return this.pos += 8,
        e
    }
    ,
    r.prototype.readI64 = function() {
        var e = H(this.view, this.pos);
        return this.pos += 8,
        e
    }
    ,
    r.prototype.readU64AsBigInt = function() {
        var e = this.view.getBigUint64(this.pos);
        return this.pos += 8,
        e
    }
    ,
    r.prototype.readI64AsBigInt = function() {
        var e = this.view.getBigInt64(this.pos);
        return this.pos += 8,
        e
    }
    ,
    r.prototype.readF32 = function() {
        var e = this.view.getFloat32(this.pos);
        return this.pos += 4,
        e
    }
    ,
    r.prototype.readF64 = function() {
        var e = this.view.getFloat64(this.pos);
        return this.pos += 8,
        e
    }
    ,
    r
  }()
  , Le = globalThis && globalThis.__generator || function(r, e) {
    var t = {
        label: 0,
        sent: function() {
            if (n[0] & 1)
                throw n[1];
            return n[1]
        },
        trys: [],
        ops: []
    }, i, s, n, o;
    return o = {
        next: c(0),
        throw: c(1),
        return: c(2)
    },
    typeof Symbol == "function" && (o[Symbol.iterator] = function() {
        return this
    }
    ),
    o;
    function c(a) {
        return function(u) {
            return f([a, u])
        }
    }
    function f(a) {
        if (i)
            throw new TypeError("Generator is already executing.");
        for (; o && (o = 0,
        a[0] && (t = 0)),
        t; )
            try {
                if (i = 1,
                s && (n = a[0] & 2 ? s.return : a[0] ? s.throw || ((n = s.return) && n.call(s),
                0) : s.next) && !(n = n.call(s, a[1])).done)
                    return n;
                switch (s = 0,
                n && (a = [a[0] & 2, n.value]),
                a[0]) {
                case 0:
                case 1:
                    n = a;
                    break;
                case 4:
                    return t.label++,
                    {
                        value: a[1],
                        done: !1
                    };
                case 5:
                    t.label++,
                    s = a[1],
                    a = [0];
                    continue;
                case 7:
                    a = t.ops.pop(),
                    t.trys.pop();
                    continue;
                default:
                    if (n = t.trys,
                    !(n = n.length > 0 && n[n.length - 1]) && (a[0] === 6 || a[0] === 2)) {
                        t = 0;
                        continue
                    }
                    if (a[0] === 3 && (!n || a[1] > n[0] && a[1] < n[3])) {
                        t.label = a[1];
                        break
                    }
                    if (a[0] === 6 && t.label < n[1]) {
                        t.label = n[1],
                        n = a;
                        break
                    }
                    if (n && t.label < n[2]) {
                        t.label = n[2],
                        t.ops.push(a);
                        break
                    }
                    n[2] && t.ops.pop(),
                    t.trys.pop();
                    continue
                }
                a = e.call(r, t)
            } catch (u) {
                a = [6, u],
                s = 0
            } finally {
                i = n = 0
            }
        if (a[0] & 5)
            throw a[1];
        return {
            value: a[0] ? a[1] : void 0,
            done: !0
        }
    }
  }
  , U = globalThis && globalThis.__await || function(r) {
    return this instanceof U ? (this.v = r,
    this) : new U(r)
  }
  , Fe = globalThis && globalThis.__asyncGenerator || function(r, e, t) {
    if (!Symbol.asyncIterator)
        throw new TypeError("Symbol.asyncIterator is not defined.");
    var i = t.apply(r, e || []), s, n = [];
    return s = {},
    o("next"),
    o("throw"),
    o("return"),
    s[Symbol.asyncIterator] = function() {
        return this
    }
    ,
    s;
    function o(l) {
        i[l] && (s[l] = function(d) {
            return new Promise(function(w, p) {
                n.push([l, d, w, p]) > 1 || c(l, d)
            }
            )
        }
        )
    }
    function c(l, d) {
        try {
            f(i[l](d))
        } catch (w) {
            h(n[0][3], w)
        }
    }
    function f(l) {
        l.value instanceof U ? Promise.resolve(l.value.v).then(a, u) : h(n[0][2], l)
    }
    function a(l) {
        c("next", l)
    }
    function u(l) {
        c("throw", l)
    }
    function h(l, d) {
        l(d),
        n.shift(),
        n.length && c(n[0][0], n[0][1])
    }
  }
  ;
  function Re(r) {
    return r[Symbol.asyncIterator] != null
  }
  function We(r) {
    if (r == null)
        throw new Error("Assertion Failure: value must not be null nor undefined")
  }
  function Pe(r) {
    return Fe(this, arguments, function() {
        var t, i, s, n;
        return Le(this, function(o) {
            switch (o.label) {
            case 0:
                t = r.getReader(),
                o.label = 1;
            case 1:
                o.trys.push([1, , 9, 10]),
                o.label = 2;
            case 2:
                return [4, U(t.read())];
            case 3:
                return i = o.sent(),
                s = i.done,
                n = i.value,
                s ? [4, U(void 0)] : [3, 5];
            case 4:
                return [2, o.sent()];
            case 5:
                return We(n),
                [4, U(n)];
            case 6:
                return [4, o.sent()];
            case 7:
                return o.sent(),
                [3, 2];
            case 8:
                return [3, 10];
            case 9:
                return t.releaseLock(),
                [7];
            case 10:
                return [2]
            }
        })
    })
  }
  function Ne(r) {
    return Re(r) ? r : Pe(r)
  }
  globalThis && globalThis.__awaiter;
  globalThis && globalThis.__generator;
  function Oe(r, e) {
    var t = Ne(r)
      , i = new ze(e);
    return i.decodeStream(t)
  }
  const Ve = new Worker(new URL("worker.js",self.location),{
    type: "module"
  })
  , X = new SharedArrayBuffer(65536)
  , G = new SharedArrayBuffer(65536);
  J();
  Ve.postMessage({
    sharedArrayBuffer: X,
    sharedArrayBuffer2: G
  });
  const He = N(X)
  , Ke = N(G);
  function Xe(r) {
    return new ReadableStream({
        async pull(e) {
            const {value: t, done: i} = await r.next();
            i ? e.close() : e.enqueue(t)
        }
    })
  }
  const b = 100
  , B = 32
  , y = {
    cursor: {
        row: 0,
        col: 0
    },
    defaultColors: {
        fg: 0,
        bg: 0
    },
    grid: Array.from({
        length: B
    }, r=>Array.from({
        length: b
    }, ()=>({
        char: " "
    })))
  }
  , Ge = ()=>{
    const r = document.createElement("div");
    r.style.fontFamily = "'Fira Code'",
    r.style.padding = "0",
    r.style.margin = "0",
    r.style.whiteSpace = "pre";
    for (let e = 0; e < B; ++e) {
        const t = document.createElement("div");
        r.appendChild(t);
        for (let i = 0; i < b; ++i) {
            const s = document.createElement("span");
            s.style.display = "inline-block",
            s.style.margin = "0",
            s.textContent = " ",
            s.style.padding = "0",
            t.appendChild(s)
        }
    }
    return r
  }
  , Ye = ()=>{
    y.grid.forEach((r,e)=>{
        const t = Y.children[e];
        r.forEach((i,s)=>{
            const n = t.children[s];
            n.textContent = i.char,
            n.style.color = P(i.fg ?? y.defaultColors.fg),
            n.style.backgroundColor = P(i.bg ?? y.defaultColors.bg),
            e === y.cursor.row && s === y.cursor.col ? n.style.filter = "invert(1)" : n.style.filter = "none"
        }
        )
    }
    )
  }
  ;
  globalThis.printState = ()=>{
    console.log(y.grid.map(r=>r.map(e=>e.char).join("")).join(`
  `))
  }
  ;
  const P = r=>`#${r.toString(16).padStart(6, "0")}`
  , qe = r=>{
    (async()=>{
        for await(const e of Oe(Xe(async function*() {
            for (; ; )
                yield await He.readBlockingAsync()
        }())))
            r(e)
    }
    )()
  }
  , $e = ({width: r, height: e})=>({
    updateChar: (t,i,s,n)=>{
        if (s.length !== 1)
            throw new Error("invalid char set:" + s);
        y.grid[t][i].char = s;
        const o = n === 0 ? void 0 : $.get(n);
        y.grid[t][i].bg = o?.rgb_attr?.background,
        y.grid[t][i].fg = o?.rgb_attr?.foreground
    }
    ,
    updateCursor: (t,i)=>{
        y.cursor = {
            row: t,
            col: i
        }
    }
    ,
    defaultColorsSet: t=>{
        y.defaultColors.fg = t.rgb_fg,
        y.defaultColors.bg = t.rgb_bg
    }
    ,
    gridScroll: t=>{
        if (t.grid !== 1)
            throw new Error(`unsupported grid ${t.grid}`);
        if (t.cols !== 0)
            throw new Error("non zero cols is not supported");
        if (t.rows === 0)
            throw new Error("scrolling rows 0 is probably wrong");
        const {top: i, rows: s, bot: n} = t
          , o = s < 0;
        for (let c = o ? n - s - 1 : i - s + 1; o ? c >= i - s : c < n - s; o ? --c : ++c)
            y.grid[c] && (y.grid[c] = structuredClone(y.grid[c + s]))
    }
  })
  , A = $e({
    width: b,
    height: B
  })
  , Je = document.getElementById("app")
  , Y = Ge();
  Je.appendChild(Y);
  const q = new Map
  , $ = new Map
  , Ze = r=>{
    for (const [e,...t] of r)
        if (e === "grid_line")
            for (const i of t) {
                const [s,n,o,c,f] = i;
                if (console.log("CELLS", c.map(h=>h[0]).join("")),
                s !== 1)
                    throw new Error("unknown grid");
                let a = o, u;
                for (let h = 0; h < c.length; ++h) {
                    const [l,d,w] = c[h];
                    u === void 0 && (u = d);
                    const p = d ?? u;
                    if (p === void 0)
                        throw new Error("this should not happen: hl_id was undefined");
                    const v = w ?? 1;
                    for (let g = 0; g < v; ++g)
                        console.log("updatechar", {
                            row: n,
                            col: a,
                            char: l,
                            hl_id: p
                        }),
                        A.updateChar(n, a, l, p),
                        a += 1
                }
            }
        else if (e === "flush")
            Ye();
        else if (e === "hl_attr_define")
            for (const i of t) {
                const [s,n,o,c] = i;
                $.set(s, {
                    id: s,
                    rgb_attr: n,
                    cterm_attr: o,
                    info: c
                })
            }
        else if (e === "hl_group_set")
            for (const i of t) {
                const [s,n] = i;
                console.log("hl_group_set", {
                    name: s,
                    hl_id: n
                })
            }
        else if (e === "grid_cursor_goto")
            for (const i of t) {
                const [s,n,o] = i;
                if (s !== 1)
                    throw new Error("unknown grid");
                A.updateCursor(n, o)
            }
        else if (e === "default_colors_set")
            for (const i of t) {
                const [s,n,o,c,f] = i;
                A.defaultColorsSet({
                    rgb_fg: s,
                    rgb_bg: n,
                    rgb_sp: o,
                    cterm_fg: c,
                    cterm_bg: f
                })
            }
        else if (e === "grid_clear")
            console.log("grid_clear");
        else if (e === "grid_scroll")
            for (const i of t) {
                const [s,n,o,c,f,a,u] = i;
                if (s !== 1)
                    throw new Error("unknown grid");
                if (u !== 0)
                    throw new Error("cols was not 0 in grid_scroll");
                A.gridScroll({
                    grid: s,
                    top: n,
                    bot: o,
                    left: c,
                    right: f,
                    rows: a,
                    cols: u
                })
            }
        else
            console.log("unhandled UI event: ", e, t)
  }
  ;
  qe(r=>{
    if (r[0] === 1) {
        const e = {
            msgid: r[1],
            error: r[2],
            result: r[3]
        }
          , t = q.get(e.msgid);
        if (!t)
            throw new Error("msgpack rpc internal error");
        e.error ? t.reject(new Error(JSON.stringify(e.error))) : t.resolve(e.result)
    } else if (r[0] === 2) {
        const e = {
            method: r[1],
            params: r[2]
        };
        if (e.method === "redraw")
            Ze(e.params);
        else
            throw new Error("unrecognized notification method: " + e.method)
    } else
        throw new Error("unrecognized msgpack type: " + r[0])
  }
  );
  const Qe = (()=>{
    let e = 0;
    return ()=>++e % 2147483647
  }
  )()
  , C = (r,...e)=>{
    const t = Qe();
    return new Promise((i,s)=>{
        q.set(t, {
            resolve: i,
            reject: s
        }),
        Ke.write(Se([0, t, r, e]))
    }
    )
  }
  ;
  await C("nvim_ui_attach", b, B, {
    ext_linegrid: !0
  });
  await C("nvim_command", "setf markdown");
  await C("nvim_buf_set_lines", 0, 0, 1, !1, ["This is my blog, there are many like it, but this one is mine"]);
  const je = r=>{
    const e = r.key;
    if (e === "<")
        return "<LT>";
    if (e === "Enter")
        return "<CR>";
    if (e === "Escape")
        return "<ESC>";
    if (e === "Tab")
        return "<Tab>";
    if (e.length === 1)
        return r.ctrlKey ? `<C-${e}>` : e;
    throw new Error("unrecognized key input: " + e)
  }
  ;
  window.addEventListener("keydown", r=>{
    r.preventDefault(),
    console.log(r),
    C("nvim_input", je(r))
  }
  );
  