// Build: 'dev-196'
(()=>{
  var Xd = Object.create;
  var Ms = Object.defineProperty;
  var Kd = Object.getOwnPropertyDescriptor;
  var Jd = Object.getOwnPropertyNames;
  var bd = Object.getPrototypeOf
    , e1 = Object.prototype.hasOwnProperty;
  var qt = (e,t)=>()=>(t || e((t = {
      exports: {}
  }).exports, t),
  t.exports);
  var t1 = (e,t,n,r)=>{
      if (t && typeof t == "object" || typeof t == "function")
          for (let o of Jd(t))
              !e1.call(e, o) && o !== n && Ms(e, o, {
                  get: ()=>t[o],
                  enumerable: !(r = Kd(t, o)) || r.enumerable
              });
      return e
  }
  ;
  var he = (e,t,n)=>(n = e != null ? Xd(bd(e)) : {},
  t1(t || !e || !e.__esModule ? Ms(n, "default", {
      value: e,
      enumerable: !0
  }) : n, e));
  var Us = qt(le=>{
      "use strict";
      var Sr = Symbol.for("react.element")
        , n1 = Symbol.for("react.portal")
        , r1 = Symbol.for("react.fragment")
        , o1 = Symbol.for("react.strict_mode")
        , i1 = Symbol.for("react.profiler")
        , l1 = Symbol.for("react.provider")
        , u1 = Symbol.for("react.context")
        , s1 = Symbol.for("react.forward_ref")
        , a1 = Symbol.for("react.suspense")
        , c1 = Symbol.for("react.memo")
        , f1 = Symbol.for("react.lazy")
        , zs = Symbol.iterator;
      function d1(e) {
          return e === null || typeof e != "object" ? null : (e = zs && e[zs] || e["@@iterator"],
          typeof e == "function" ? e : null)
      }
      var Is = {
          isMounted: function() {
              return !1
          },
          enqueueForceUpdate: function() {},
          enqueueReplaceState: function() {},
          enqueueSetState: function() {}
      }
        , Ts = Object.assign
        , As = {};
      function Un(e, t, n) {
          this.props = e,
          this.context = t,
          this.refs = As,
          this.updater = n || Is
      }
      Un.prototype.isReactComponent = {};
      Un.prototype.setState = function(e, t) {
          if (typeof e != "object" && typeof e != "function" && e != null)
              throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
          this.updater.enqueueSetState(this, e, t, "setState")
      }
      ;
      Un.prototype.forceUpdate = function(e) {
          this.updater.enqueueForceUpdate(this, e, "forceUpdate")
      }
      ;
      function Rs() {}
      Rs.prototype = Un.prototype;
      function el(e, t, n) {
          this.props = e,
          this.context = t,
          this.refs = As,
          this.updater = n || Is
      }
      var tl = el.prototype = new Rs;
      tl.constructor = el;
      Ts(tl, Un.prototype);
      tl.isPureReactComponent = !0;
      var Ds = Array.isArray
        , js = Object.prototype.hasOwnProperty
        , nl = {
          current: null
      }
        , Bs = {
          key: !0,
          ref: !0,
          __self: !0,
          __source: !0
      };
      function Fs(e, t, n) {
          var r, o = {}, i = null, l = null;
          if (t != null)
              for (r in t.ref !== void 0 && (l = t.ref),
              t.key !== void 0 && (i = "" + t.key),
              t)
                  js.call(t, r) && !Bs.hasOwnProperty(r) && (o[r] = t[r]);
          var s = arguments.length - 2;
          if (s === 1)
              o.children = n;
          else if (1 < s) {
              for (var a = Array(s), k = 0; k < s; k++)
                  a[k] = arguments[k + 2];
              o.children = a
          }
          if (e && e.defaultProps)
              for (r in s = e.defaultProps,
              s)
                  o[r] === void 0 && (o[r] = s[r]);
          return {
              $$typeof: Sr,
              type: e,
              key: i,
              ref: l,
              props: o,
              _owner: nl.current
          }
      }
      function p1(e, t) {
          return {
              $$typeof: Sr,
              type: e.type,
              key: t,
              ref: e.ref,
              props: e.props,
              _owner: e._owner
          }
      }
      function rl(e) {
          return typeof e == "object" && e !== null && e.$$typeof === Sr
      }
      function h1(e) {
          var t = {
              "=": "=0",
              ":": "=2"
          };
          return "$" + e.replace(/[=:]/g, function(n) {
              return t[n]
          })
      }
      var Os = /\/+/g;
      function bi(e, t) {
          return typeof e == "object" && e !== null && e.key != null ? h1("" + e.key) : t.toString(36)
      }
      function wo(e, t, n, r, o) {
          var i = typeof e;
          (i === "undefined" || i === "boolean") && (e = null);
          var l = !1;
          if (e === null)
              l = !0;
          else
              switch (i) {
              case "string":
              case "number":
                  l = !0;
                  break;
              case "object":
                  switch (e.$$typeof) {
                  case Sr:
                  case n1:
                      l = !0
                  }
              }
          if (l)
              return l = e,
              o = o(l),
              e = r === "" ? "." + bi(l, 0) : r,
              Ds(o) ? (n = "",
              e != null && (n = e.replace(Os, "$&/") + "/"),
              wo(o, t, n, "", function(k) {
                  return k
              })) : o != null && (rl(o) && (o = p1(o, n + (!o.key || l && l.key === o.key ? "" : ("" + o.key).replace(Os, "$&/") + "/") + e)),
              t.push(o)),
              1;
          if (l = 0,
          r = r === "" ? "." : r + ":",
          Ds(e))
              for (var s = 0; s < e.length; s++) {
                  i = e[s];
                  var a = r + bi(i, s);
                  l += wo(i, t, n, a, o)
              }
          else if (a = d1(e),
          typeof a == "function")
              for (e = a.call(e),
              s = 0; !(i = e.next()).done; )
                  i = i.value,
                  a = r + bi(i, s++),
                  l += wo(i, t, n, a, o);
          else if (i === "object")
              throw t = String(e),
              Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
          return l
      }
      function yo(e, t, n) {
          if (e == null)
              return e;
          var r = []
            , o = 0;
          return wo(e, r, "", "", function(i) {
              return t.call(n, i, o++)
          }),
          r
      }
      function m1(e) {
          if (e._status === -1) {
              var t = e._result;
              t = t(),
              t.then(function(n) {
                  (e._status === 0 || e._status === -1) && (e._status = 1,
                  e._result = n)
              }, function(n) {
                  (e._status === 0 || e._status === -1) && (e._status = 2,
                  e._result = n)
              }),
              e._status === -1 && (e._status = 0,
              e._result = t)
          }
          if (e._status === 1)
              return e._result.default;
          throw e._result
      }
      var We = {
          current: null
      }
        , ko = {
          transition: null
      }
        , v1 = {
          ReactCurrentDispatcher: We,
          ReactCurrentBatchConfig: ko,
          ReactCurrentOwner: nl
      };
      le.Children = {
          map: yo,
          forEach: function(e, t, n) {
              yo(e, function() {
                  t.apply(this, arguments)
              }, n)
          },
          count: function(e) {
              var t = 0;
              return yo(e, function() {
                  t++
              }),
              t
          },
          toArray: function(e) {
              return yo(e, function(t) {
                  return t
              }) || []
          },
          only: function(e) {
              if (!rl(e))
                  throw Error("React.Children.only expected to receive a single React element child.");
              return e
          }
      };
      le.Component = Un;
      le.Fragment = r1;
      le.Profiler = i1;
      le.PureComponent = el;
      le.StrictMode = o1;
      le.Suspense = a1;
      le.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = v1;
      le.cloneElement = function(e, t, n) {
          if (e == null)
              throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
          var r = Ts({}, e.props)
            , o = e.key
            , i = e.ref
            , l = e._owner;
          if (t != null) {
              if (t.ref !== void 0 && (i = t.ref,
              l = nl.current),
              t.key !== void 0 && (o = "" + t.key),
              e.type && e.type.defaultProps)
                  var s = e.type.defaultProps;
              for (a in t)
                  js.call(t, a) && !Bs.hasOwnProperty(a) && (r[a] = t[a] === void 0 && s !== void 0 ? s[a] : t[a])
          }
          var a = arguments.length - 2;
          if (a === 1)
              r.children = n;
          else if (1 < a) {
              s = Array(a);
              for (var k = 0; k < a; k++)
                  s[k] = arguments[k + 2];
              r.children = s
          }
          return {
              $$typeof: Sr,
              type: e.type,
              key: o,
              ref: i,
              props: r,
              _owner: l
          }
      }
      ;
      le.createContext = function(e) {
          return e = {
              $$typeof: u1,
              _currentValue: e,
              _currentValue2: e,
              _threadCount: 0,
              Provider: null,
              Consumer: null,
              _defaultValue: null,
              _globalName: null
          },
          e.Provider = {
              $$typeof: l1,
              _context: e
          },
          e.Consumer = e
      }
      ;
      le.createElement = Fs;
      le.createFactory = function(e) {
          var t = Fs.bind(null, e);
          return t.type = e,
          t
      }
      ;
      le.createRef = function() {
          return {
              current: null
          }
      }
      ;
      le.forwardRef = function(e) {
          return {
              $$typeof: s1,
              render: e
          }
      }
      ;
      le.isValidElement = rl;
      le.lazy = function(e) {
          return {
              $$typeof: f1,
              _payload: {
                  _status: -1,
                  _result: e
              },
              _init: m1
          }
      }
      ;
      le.memo = function(e, t) {
          return {
              $$typeof: c1,
              type: e,
              compare: t === void 0 ? null : t
          }
      }
      ;
      le.startTransition = function(e) {
          var t = ko.transition;
          ko.transition = {};
          try {
              e()
          } finally {
              ko.transition = t
          }
      }
      ;
      le.unstable_act = function() {
          throw Error("act(...) is not supported in production builds of React.")
      }
      ;
      le.useCallback = function(e, t) {
          return We.current.useCallback(e, t)
      }
      ;
      le.useContext = function(e) {
          return We.current.useContext(e)
      }
      ;
      le.useDebugValue = function() {}
      ;
      le.useDeferredValue = function(e) {
          return We.current.useDeferredValue(e)
      }
      ;
      le.useEffect = function(e, t) {
          return We.current.useEffect(e, t)
      }
      ;
      le.useId = function() {
          return We.current.useId()
      }
      ;
      le.useImperativeHandle = function(e, t, n) {
          return We.current.useImperativeHandle(e, t, n)
      }
      ;
      le.useInsertionEffect = function(e, t) {
          return We.current.useInsertionEffect(e, t)
      }
      ;
      le.useLayoutEffect = function(e, t) {
          return We.current.useLayoutEffect(e, t)
      }
      ;
      le.useMemo = function(e, t) {
          return We.current.useMemo(e, t)
      }
      ;
      le.useReducer = function(e, t, n) {
          return We.current.useReducer(e, t, n)
      }
      ;
      le.useRef = function(e) {
          return We.current.useRef(e)
      }
      ;
      le.useState = function(e) {
          return We.current.useState(e)
      }
      ;
      le.useSyncExternalStore = function(e, t, n) {
          return We.current.useSyncExternalStore(e, t, n)
      }
      ;
      le.useTransition = function() {
          return We.current.useTransition()
      }
      ;
      le.version = "18.2.0"
  }
  );
  var me = qt((B0,Hs)=>{
      "use strict";
      Hs.exports = Us()
  }
  );
  var ya = qt((Lo,fl)=>{
      (function(e, t) {
          typeof Lo == "object" && typeof fl == "object" ? fl.exports = t() : typeof define == "function" && define.amd ? define([], t) : typeof Lo == "object" ? Lo.QRCodeStyling = t() : e.QRCodeStyling = t()
      }
      )(self, function() {
          return (()=>{
              var e = {
                  192: (r,o)=>{
                      var i, l, s = function() {
                          var a = function(z, T) {
                              var O = z
                                , P = V[T]
                                , _ = null
                                , A = 0
                                , Z = null
                                , H = []
                                , Y = {}
                                , Le = function(p, m) {
                                  _ = function(d) {
                                      for (var S = new Array(d), C = 0; C < d; C += 1) {
                                          S[C] = new Array(d);
                                          for (var F = 0; F < d; F += 1)
                                              S[C][F] = null
                                      }
                                      return S
                                  }(A = 4 * O + 17),
                                  N(0, 0),
                                  N(A - 7, 0),
                                  N(0, A - 7),
                                  f(),
                                  u(),
                                  h(p, m),
                                  O >= 7 && c(p),
                                  Z == null && (Z = g(O, P, H)),
                                  y(Z, m)
                              }
                                , N = function(p, m) {
                                  for (var d = -1; d <= 7; d += 1)
                                      if (!(p + d <= -1 || A <= p + d))
                                          for (var S = -1; S <= 7; S += 1)
                                              m + S <= -1 || A <= m + S || (_[p + d][m + S] = 0 <= d && d <= 6 && (S == 0 || S == 6) || 0 <= S && S <= 6 && (d == 0 || d == 6) || 2 <= d && d <= 4 && 2 <= S && S <= 4)
                              }
                                , u = function() {
                                  for (var p = 8; p < A - 8; p += 1)
                                      _[p][6] == null && (_[p][6] = p % 2 == 0);
                                  for (var m = 8; m < A - 8; m += 1)
                                      _[6][m] == null && (_[6][m] = m % 2 == 0)
                              }
                                , f = function() {
                                  for (var p = U.getPatternPosition(O), m = 0; m < p.length; m += 1)
                                      for (var d = 0; d < p.length; d += 1) {
                                          var S = p[m]
                                            , C = p[d];
                                          if (_[S][C] == null)
                                              for (var F = -2; F <= 2; F += 1)
                                                  for (var Q = -2; Q <= 2; Q += 1)
                                                      _[S + F][C + Q] = F == -2 || F == 2 || Q == -2 || Q == 2 || F == 0 && Q == 0
                                      }
                              }
                                , c = function(p) {
                                  for (var m = U.getBCHTypeNumber(O), d = 0; d < 18; d += 1) {
                                      var S = !p && (m >> d & 1) == 1;
                                      _[Math.floor(d / 3)][d % 3 + A - 8 - 3] = S
                                  }
                                  for (d = 0; d < 18; d += 1)
                                      S = !p && (m >> d & 1) == 1,
                                      _[d % 3 + A - 8 - 3][Math.floor(d / 3)] = S
                              }
                                , h = function(p, m) {
                                  for (var d = P << 3 | m, S = U.getBCHTypeInfo(d), C = 0; C < 15; C += 1) {
                                      var F = !p && (S >> C & 1) == 1;
                                      C < 6 ? _[C][8] = F : C < 8 ? _[C + 1][8] = F : _[A - 15 + C][8] = F
                                  }
                                  for (C = 0; C < 15; C += 1)
                                      F = !p && (S >> C & 1) == 1,
                                      C < 8 ? _[8][A - C - 1] = F : C < 9 ? _[8][15 - C - 1 + 1] = F : _[8][15 - C - 1] = F;
                                  _[A - 8][8] = !p
                              }
                                , y = function(p, m) {
                                  for (var d = -1, S = A - 1, C = 7, F = 0, Q = U.getMaskFunction(m), D = A - 1; D > 0; D -= 2)
                                      for (D == 6 && (D -= 1); ; ) {
                                          for (var X = 0; X < 2; X += 1)
                                              if (_[S][D - X] == null) {
                                                  var J = !1;
                                                  F < p.length && (J = (p[F] >>> C & 1) == 1),
                                                  Q(S, D - X) && (J = !J),
                                                  _[S][D - X] = J,
                                                  (C -= 1) == -1 && (F += 1,
                                                  C = 7)
                                              }
                                          if ((S += d) < 0 || A <= S) {
                                              S -= d,
                                              d = -d;
                                              break
                                          }
                                      }
                              }
                                , g = function(p, m, d) {
                                  for (var S = v.getRSBlocks(p, m), C = x(), F = 0; F < d.length; F += 1) {
                                      var Q = d[F];
                                      C.put(Q.getMode(), 4),
                                      C.put(Q.getLength(), U.getLengthInBits(Q.getMode(), p)),
                                      Q.write(C)
                                  }
                                  var D = 0;
                                  for (F = 0; F < S.length; F += 1)
                                      D += S[F].dataCount;
                                  if (C.getLengthInBits() > 8 * D)
                                      throw "code length overflow. (" + C.getLengthInBits() + ">" + 8 * D + ")";
                                  for (C.getLengthInBits() + 4 <= 8 * D && C.put(0, 4); C.getLengthInBits() % 8 != 0; )
                                      C.putBit(!1);
                                  for (; !(C.getLengthInBits() >= 8 * D || (C.put(236, 8),
                                  C.getLengthInBits() >= 8 * D)); )
                                      C.put(17, 8);
                                  return function(X, J) {
                                      for (var te = 0, ae = 0, K = 0, ne = new Array(J.length), ee = new Array(J.length), re = 0; re < J.length; re += 1) {
                                          var Ye = J[re].dataCount
                                            , ke = J[re].totalCount - Ye;
                                          ae = Math.max(ae, Ye),
                                          K = Math.max(K, ke),
                                          ne[re] = new Array(Ye);
                                          for (var oe = 0; oe < ne[re].length; oe += 1)
                                              ne[re][oe] = 255 & X.getBuffer()[oe + te];
                                          te += Ye;
                                          var Se = U.getErrorCorrectPolynomial(ke)
                                            , ce = w(ne[re], Se.getLength() - 1).mod(Se);
                                          for (ee[re] = new Array(Se.getLength() - 1),
                                          oe = 0; oe < ee[re].length; oe += 1) {
                                              var Ee = oe + ce.getLength() - ee[re].length;
                                              ee[re][oe] = Ee >= 0 ? ce.getAt(Ee) : 0
                                          }
                                      }
                                      var ze = 0;
                                      for (oe = 0; oe < J.length; oe += 1)
                                          ze += J[oe].totalCount;
                                      var Ie = new Array(ze)
                                        , Ze = 0;
                                      for (oe = 0; oe < ae; oe += 1)
                                          for (re = 0; re < J.length; re += 1)
                                              oe < ne[re].length && (Ie[Ze] = ne[re][oe],
                                              Ze += 1);
                                      for (oe = 0; oe < K; oe += 1)
                                          for (re = 0; re < J.length; re += 1)
                                              oe < ee[re].length && (Ie[Ze] = ee[re][oe],
                                              Ze += 1);
                                      return Ie
                                  }(C, S)
                              };
                              Y.addData = function(p, m) {
                                  var d = null;
                                  switch (m = m || "Byte") {
                                  case "Numeric":
                                      d = j(p);
                                      break;
                                  case "Alphanumeric":
                                      d = $(p);
                                      break;
                                  case "Byte":
                                      d = q(p);
                                      break;
                                  case "Kanji":
                                      d = G(p);
                                      break;
                                  default:
                                      throw "mode:" + m
                                  }
                                  H.push(d),
                                  Z = null
                              }
                              ,
                              Y.isDark = function(p, m) {
                                  if (p < 0 || A <= p || m < 0 || A <= m)
                                      throw p + "," + m;
                                  return _[p][m]
                              }
                              ,
                              Y.getModuleCount = function() {
                                  return A
                              }
                              ,
                              Y.make = function() {
                                  if (O < 1) {
                                      for (var p = 1; p < 40; p++) {
                                          for (var m = v.getRSBlocks(p, P), d = x(), S = 0; S < H.length; S++) {
                                              var C = H[S];
                                              d.put(C.getMode(), 4),
                                              d.put(C.getLength(), U.getLengthInBits(C.getMode(), p)),
                                              C.write(d)
                                          }
                                          var F = 0;
                                          for (S = 0; S < m.length; S++)
                                              F += m[S].dataCount;
                                          if (d.getLengthInBits() <= 8 * F)
                                              break
                                      }
                                      O = p
                                  }
                                  Le(!1, function() {
                                      for (var Q = 0, D = 0, X = 0; X < 8; X += 1) {
                                          Le(!0, X);
                                          var J = U.getLostPoint(Y);
                                          (X == 0 || Q > J) && (Q = J,
                                          D = X)
                                      }
                                      return D
                                  }())
                              }
                              ,
                              Y.createTableTag = function(p, m) {
                                  p = p || 2;
                                  var d = "";
                                  d += '<table style="',
                                  d += " border-width: 0px; border-style: none;",
                                  d += " border-collapse: collapse;",
                                  d += " padding: 0px; margin: " + (m = m === void 0 ? 4 * p : m) + "px;",
                                  d += '">',
                                  d += "<tbody>";
                                  for (var S = 0; S < Y.getModuleCount(); S += 1) {
                                      d += "<tr>";
                                      for (var C = 0; C < Y.getModuleCount(); C += 1)
                                          d += '<td style="',
                                          d += " border-width: 0px; border-style: none;",
                                          d += " border-collapse: collapse;",
                                          d += " padding: 0px; margin: 0px;",
                                          d += " width: " + p + "px;",
                                          d += " height: " + p + "px;",
                                          d += " background-color: ",
                                          d += Y.isDark(S, C) ? "#000000" : "#ffffff",
                                          d += ";",
                                          d += '"/>';
                                      d += "</tr>"
                                  }
                                  return (d += "</tbody>") + "</table>"
                              }
                              ,
                              Y.createSvgTag = function(p, m, d, S) {
                                  var C = {};
                                  typeof arguments[0] == "object" && (p = (C = arguments[0]).cellSize,
                                  m = C.margin,
                                  d = C.alt,
                                  S = C.title),
                                  p = p || 2,
                                  m = m === void 0 ? 4 * p : m,
                                  (d = typeof d == "string" ? {
                                      text: d
                                  } : d || {}).text = d.text || null,
                                  d.id = d.text ? d.id || "qrcode-description" : null,
                                  (S = typeof S == "string" ? {
                                      text: S
                                  } : S || {}).text = S.text || null,
                                  S.id = S.text ? S.id || "qrcode-title" : null;
                                  var F, Q, D, X, J = Y.getModuleCount() * p + 2 * m, te = "";
                                  for (X = "l" + p + ",0 0," + p + " -" + p + ",0 0,-" + p + "z ",
                                  te += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',
                                  te += C.scalable ? "" : ' width="' + J + 'px" height="' + J + 'px"',
                                  te += ' viewBox="0 0 ' + J + " " + J + '" ',
                                  te += ' preserveAspectRatio="xMinYMin meet"',
                                  te += S.text || d.text ? ' role="img" aria-labelledby="' + M([S.id, d.id].join(" ").trim()) + '"' : "",
                                  te += ">",
                                  te += S.text ? '<title id="' + M(S.id) + '">' + M(S.text) + "</title>" : "",
                                  te += d.text ? '<description id="' + M(d.id) + '">' + M(d.text) + "</description>" : "",
                                  te += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>',
                                  te += '<path d="',
                                  Q = 0; Q < Y.getModuleCount(); Q += 1)
                                      for (D = Q * p + m,
                                      F = 0; F < Y.getModuleCount(); F += 1)
                                          Y.isDark(Q, F) && (te += "M" + (F * p + m) + "," + D + X);
                                  return (te += '" stroke="transparent" fill="black"/>') + "</svg>"
                              }
                              ,
                              Y.createDataURL = function(p, m) {
                                  p = p || 2,
                                  m = m === void 0 ? 4 * p : m;
                                  var d = Y.getModuleCount() * p + 2 * m
                                    , S = m
                                    , C = d - m;
                                  return ie(d, d, function(F, Q) {
                                      if (S <= F && F < C && S <= Q && Q < C) {
                                          var D = Math.floor((F - S) / p)
                                            , X = Math.floor((Q - S) / p);
                                          return Y.isDark(X, D) ? 0 : 1
                                      }
                                      return 1
                                  })
                              }
                              ,
                              Y.createImgTag = function(p, m, d) {
                                  p = p || 2,
                                  m = m === void 0 ? 4 * p : m;
                                  var S = Y.getModuleCount() * p + 2 * m
                                    , C = "";
                                  return C += "<img",
                                  C += ' src="',
                                  C += Y.createDataURL(p, m),
                                  C += '"',
                                  C += ' width="',
                                  C += S,
                                  C += '"',
                                  C += ' height="',
                                  C += S,
                                  C += '"',
                                  d && (C += ' alt="',
                                  C += M(d),
                                  C += '"'),
                                  C + "/>"
                              }
                              ;
                              var M = function(p) {
                                  for (var m = "", d = 0; d < p.length; d += 1) {
                                      var S = p.charAt(d);
                                      switch (S) {
                                      case "<":
                                          m += "&lt;";
                                          break;
                                      case ">":
                                          m += "&gt;";
                                          break;
                                      case "&":
                                          m += "&amp;";
                                          break;
                                      case '"':
                                          m += "&quot;";
                                          break;
                                      default:
                                          m += S
                                      }
                                  }
                                  return m
                              };
                              return Y.createASCII = function(p, m) {
                                  if ((p = p || 1) < 2)
                                      return function(ne) {
                                          ne = ne === void 0 ? 2 : ne;
                                          var ee, re, Ye, ke, oe, Se = 1 * Y.getModuleCount() + 2 * ne, ce = ne, Ee = Se - ne, ze = {
                                              "\u2588\u2588": "\u2588",
                                              "\u2588 ": "\u2580",
                                              " \u2588": "\u2584",
                                              "  ": " "
                                          }, Ie = {
                                              "\u2588\u2588": "\u2580",
                                              "\u2588 ": "\u2580",
                                              " \u2588": " ",
                                              "  ": " "
                                          }, Ze = "";
                                          for (ee = 0; ee < Se; ee += 2) {
                                              for (Ye = Math.floor((ee - ce) / 1),
                                              ke = Math.floor((ee + 1 - ce) / 1),
                                              re = 0; re < Se; re += 1)
                                                  oe = "\u2588",
                                                  ce <= re && re < Ee && ce <= ee && ee < Ee && Y.isDark(Ye, Math.floor((re - ce) / 1)) && (oe = " "),
                                                  ce <= re && re < Ee && ce <= ee + 1 && ee + 1 < Ee && Y.isDark(ke, Math.floor((re - ce) / 1)) ? oe += " " : oe += "\u2588",
                                                  Ze += ne < 1 && ee + 1 >= Ee ? Ie[oe] : ze[oe];
                                              Ze += `
`
                                          }
                                          return Se % 2 && ne > 0 ? Ze.substring(0, Ze.length - Se - 1) + Array(Se + 1).join("\u2580") : Ze.substring(0, Ze.length - 1)
                                      }(m);
                                  p -= 1,
                                  m = m === void 0 ? 2 * p : m;
                                  var d, S, C, F, Q = Y.getModuleCount() * p + 2 * m, D = m, X = Q - m, J = Array(p + 1).join("\u2588\u2588"), te = Array(p + 1).join("  "), ae = "", K = "";
                                  for (d = 0; d < Q; d += 1) {
                                      for (C = Math.floor((d - D) / p),
                                      K = "",
                                      S = 0; S < Q; S += 1)
                                          F = 1,
                                          D <= S && S < X && D <= d && d < X && Y.isDark(C, Math.floor((S - D) / p)) && (F = 0),
                                          K += F ? J : te;
                                      for (C = 0; C < p; C += 1)
                                          ae += K + `
`
                                  }
                                  return ae.substring(0, ae.length - 1)
                              }
                              ,
                              Y.renderTo2dContext = function(p, m) {
                                  m = m || 2;
                                  for (var d = Y.getModuleCount(), S = 0; S < d; S++)
                                      for (var C = 0; C < d; C++)
                                          p.fillStyle = Y.isDark(S, C) ? "black" : "white",
                                          p.fillRect(S * m, C * m, m, m)
                              }
                              ,
                              Y
                          };
                          a.stringToBytes = (a.stringToBytesFuncs = {
                              default: function(z) {
                                  for (var T = [], O = 0; O < z.length; O += 1) {
                                      var P = z.charCodeAt(O);
                                      T.push(255 & P)
                                  }
                                  return T
                              }
                          }).default,
                          a.createStringToBytes = function(z, T) {
                              var O = function() {
                                  for (var _ = ye(z), A = function() {
                                      var u = _.read();
                                      if (u == -1)
                                          throw "eof";
                                      return u
                                  }, Z = 0, H = {}; ; ) {
                                      var Y = _.read();
                                      if (Y == -1)
                                          break;
                                      var Le = A()
                                        , N = A() << 8 | A();
                                      H[String.fromCharCode(Y << 8 | Le)] = N,
                                      Z += 1
                                  }
                                  if (Z != T)
                                      throw Z + " != " + T;
                                  return H
                              }()
                                , P = "?".charCodeAt(0);
                              return function(_) {
                                  for (var A = [], Z = 0; Z < _.length; Z += 1) {
                                      var H = _.charCodeAt(Z);
                                      if (H < 128)
                                          A.push(H);
                                      else {
                                          var Y = O[_.charAt(Z)];
                                          typeof Y == "number" ? (255 & Y) == Y ? A.push(Y) : (A.push(Y >>> 8),
                                          A.push(255 & Y)) : A.push(P)
                                      }
                                  }
                                  return A
                              }
                          }
                          ;
                          var k, L, I, E, R, V = {
                              L: 1,
                              M: 0,
                              Q: 3,
                              H: 2
                          }, U = (k = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]],
                          L = 1335,
                          I = 7973,
                          R = function(z) {
                              for (var T = 0; z != 0; )
                                  T += 1,
                                  z >>>= 1;
                              return T
                          }
                          ,
                          (E = {}).getBCHTypeInfo = function(z) {
                              for (var T = z << 10; R(T) - R(L) >= 0; )
                                  T ^= L << R(T) - R(L);
                              return 21522 ^ (z << 10 | T)
                          }
                          ,
                          E.getBCHTypeNumber = function(z) {
                              for (var T = z << 12; R(T) - R(I) >= 0; )
                                  T ^= I << R(T) - R(I);
                              return z << 12 | T
                          }
                          ,
                          E.getPatternPosition = function(z) {
                              return k[z - 1]
                          }
                          ,
                          E.getMaskFunction = function(z) {
                              switch (z) {
                              case 0:
                                  return function(T, O) {
                                      return (T + O) % 2 == 0
                                  }
                                  ;
                              case 1:
                                  return function(T, O) {
                                      return T % 2 == 0
                                  }
                                  ;
                              case 2:
                                  return function(T, O) {
                                      return O % 3 == 0
                                  }
                                  ;
                              case 3:
                                  return function(T, O) {
                                      return (T + O) % 3 == 0
                                  }
                                  ;
                              case 4:
                                  return function(T, O) {
                                      return (Math.floor(T / 2) + Math.floor(O / 3)) % 2 == 0
                                  }
                                  ;
                              case 5:
                                  return function(T, O) {
                                      return T * O % 2 + T * O % 3 == 0
                                  }
                                  ;
                              case 6:
                                  return function(T, O) {
                                      return (T * O % 2 + T * O % 3) % 2 == 0
                                  }
                                  ;
                              case 7:
                                  return function(T, O) {
                                      return (T * O % 3 + (T + O) % 2) % 2 == 0
                                  }
                                  ;
                              default:
                                  throw "bad maskPattern:" + z
                              }
                          }
                          ,
                          E.getErrorCorrectPolynomial = function(z) {
                              for (var T = w([1], 0), O = 0; O < z; O += 1)
                                  T = T.multiply(w([1, se.gexp(O)], 0));
                              return T
                          }
                          ,
                          E.getLengthInBits = function(z, T) {
                              if (1 <= T && T < 10)
                                  switch (z) {
                                  case 1:
                                      return 10;
                                  case 2:
                                      return 9;
                                  case 4:
                                  case 8:
                                      return 8;
                                  default:
                                      throw "mode:" + z
                                  }
                              else if (T < 27)
                                  switch (z) {
                                  case 1:
                                      return 12;
                                  case 2:
                                      return 11;
                                  case 4:
                                      return 16;
                                  case 8:
                                      return 10;
                                  default:
                                      throw "mode:" + z
                                  }
                              else {
                                  if (!(T < 41))
                                      throw "type:" + T;
                                  switch (z) {
                                  case 1:
                                      return 14;
                                  case 2:
                                      return 13;
                                  case 4:
                                      return 16;
                                  case 8:
                                      return 12;
                                  default:
                                      throw "mode:" + z
                                  }
                              }
                          }
                          ,
                          E.getLostPoint = function(z) {
                              for (var T = z.getModuleCount(), O = 0, P = 0; P < T; P += 1)
                                  for (var _ = 0; _ < T; _ += 1) {
                                      for (var A = 0, Z = z.isDark(P, _), H = -1; H <= 1; H += 1)
                                          if (!(P + H < 0 || T <= P + H))
                                              for (var Y = -1; Y <= 1; Y += 1)
                                                  _ + Y < 0 || T <= _ + Y || H == 0 && Y == 0 || Z == z.isDark(P + H, _ + Y) && (A += 1);
                                      A > 5 && (O += 3 + A - 5)
                                  }
                              for (P = 0; P < T - 1; P += 1)
                                  for (_ = 0; _ < T - 1; _ += 1) {
                                      var Le = 0;
                                      z.isDark(P, _) && (Le += 1),
                                      z.isDark(P + 1, _) && (Le += 1),
                                      z.isDark(P, _ + 1) && (Le += 1),
                                      z.isDark(P + 1, _ + 1) && (Le += 1),
                                      Le != 0 && Le != 4 || (O += 3)
                                  }
                              for (P = 0; P < T; P += 1)
                                  for (_ = 0; _ < T - 6; _ += 1)
                                      z.isDark(P, _) && !z.isDark(P, _ + 1) && z.isDark(P, _ + 2) && z.isDark(P, _ + 3) && z.isDark(P, _ + 4) && !z.isDark(P, _ + 5) && z.isDark(P, _ + 6) && (O += 40);
                              for (_ = 0; _ < T; _ += 1)
                                  for (P = 0; P < T - 6; P += 1)
                                      z.isDark(P, _) && !z.isDark(P + 1, _) && z.isDark(P + 2, _) && z.isDark(P + 3, _) && z.isDark(P + 4, _) && !z.isDark(P + 5, _) && z.isDark(P + 6, _) && (O += 40);
                              var N = 0;
                              for (_ = 0; _ < T; _ += 1)
                                  for (P = 0; P < T; P += 1)
                                      z.isDark(P, _) && (N += 1);
                              return O + Math.abs(100 * N / T / T - 50) / 5 * 10
                          }
                          ,
                          E), se = function() {
                              for (var z = new Array(256), T = new Array(256), O = 0; O < 8; O += 1)
                                  z[O] = 1 << O;
                              for (O = 8; O < 256; O += 1)
                                  z[O] = z[O - 4] ^ z[O - 5] ^ z[O - 6] ^ z[O - 8];
                              for (O = 0; O < 255; O += 1)
                                  T[z[O]] = O;
                              return {
                                  glog: function(P) {
                                      if (P < 1)
                                          throw "glog(" + P + ")";
                                      return T[P]
                                  },
                                  gexp: function(P) {
                                      for (; P < 0; )
                                          P += 255;
                                      for (; P >= 256; )
                                          P -= 255;
                                      return z[P]
                                  }
                              }
                          }();
                          function w(z, T) {
                              if (z.length === void 0)
                                  throw z.length + "/" + T;
                              var O = function() {
                                  for (var _ = 0; _ < z.length && z[_] == 0; )
                                      _ += 1;
                                  for (var A = new Array(z.length - _ + T), Z = 0; Z < z.length - _; Z += 1)
                                      A[Z] = z[Z + _];
                                  return A
                              }()
                                , P = {
                                  getAt: function(_) {
                                      return O[_]
                                  },
                                  getLength: function() {
                                      return O.length
                                  },
                                  multiply: function(_) {
                                      for (var A = new Array(P.getLength() + _.getLength() - 1), Z = 0; Z < P.getLength(); Z += 1)
                                          for (var H = 0; H < _.getLength(); H += 1)
                                              A[Z + H] ^= se.gexp(se.glog(P.getAt(Z)) + se.glog(_.getAt(H)));
                                      return w(A, 0)
                                  },
                                  mod: function(_) {
                                      if (P.getLength() - _.getLength() < 0)
                                          return P;
                                      for (var A = se.glog(P.getAt(0)) - se.glog(_.getAt(0)), Z = new Array(P.getLength()), H = 0; H < P.getLength(); H += 1)
                                          Z[H] = P.getAt(H);
                                      for (H = 0; H < _.getLength(); H += 1)
                                          Z[H] ^= se.gexp(se.glog(_.getAt(H)) + A);
                                      return w(Z, 0).mod(_)
                                  }
                              };
                              return P
                          }
                          var v = function() {
                              var z = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12, 7, 37, 13], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]]
                                , T = function(P, _) {
                                  var A = {};
                                  return A.totalCount = P,
                                  A.dataCount = _,
                                  A
                              }
                                , O = {
                                  getRSBlocks: function(P, _) {
                                      var A = function(c, h) {
                                          switch (h) {
                                          case V.L:
                                              return z[4 * (c - 1) + 0];
                                          case V.M:
                                              return z[4 * (c - 1) + 1];
                                          case V.Q:
                                              return z[4 * (c - 1) + 2];
                                          case V.H:
                                              return z[4 * (c - 1) + 3];
                                          default:
                                              return
                                          }
                                      }(P, _);
                                      if (A === void 0)
                                          throw "bad rs block @ typeNumber:" + P + "/errorCorrectionLevel:" + _;
                                      for (var Z = A.length / 3, H = [], Y = 0; Y < Z; Y += 1)
                                          for (var Le = A[3 * Y + 0], N = A[3 * Y + 1], u = A[3 * Y + 2], f = 0; f < Le; f += 1)
                                              H.push(T(N, u));
                                      return H
                                  }
                              };
                              return O
                          }()
                            , x = function() {
                              var z = []
                                , T = 0
                                , O = {
                                  getBuffer: function() {
                                      return z
                                  },
                                  getAt: function(P) {
                                      var _ = Math.floor(P / 8);
                                      return (z[_] >>> 7 - P % 8 & 1) == 1
                                  },
                                  put: function(P, _) {
                                      for (var A = 0; A < _; A += 1)
                                          O.putBit((P >>> _ - A - 1 & 1) == 1)
                                  },
                                  getLengthInBits: function() {
                                      return T
                                  },
                                  putBit: function(P) {
                                      var _ = Math.floor(T / 8);
                                      z.length <= _ && z.push(0),
                                      P && (z[_] |= 128 >>> T % 8),
                                      T += 1
                                  }
                              };
                              return O
                          }
                            , j = function(z) {
                              var T = z
                                , O = {
                                  getMode: function() {
                                      return 1
                                  },
                                  getLength: function(A) {
                                      return T.length
                                  },
                                  write: function(A) {
                                      for (var Z = T, H = 0; H + 2 < Z.length; )
                                          A.put(P(Z.substring(H, H + 3)), 10),
                                          H += 3;
                                      H < Z.length && (Z.length - H == 1 ? A.put(P(Z.substring(H, H + 1)), 4) : Z.length - H == 2 && A.put(P(Z.substring(H, H + 2)), 7))
                                  }
                              }
                                , P = function(A) {
                                  for (var Z = 0, H = 0; H < A.length; H += 1)
                                      Z = 10 * Z + _(A.charAt(H));
                                  return Z
                              }
                                , _ = function(A) {
                                  if ("0" <= A && A <= "9")
                                      return A.charCodeAt(0) - "0".charCodeAt(0);
                                  throw "illegal char :" + A
                              };
                              return O
                          }
                            , $ = function(z) {
                              var T = z
                                , O = {
                                  getMode: function() {
                                      return 2
                                  },
                                  getLength: function(_) {
                                      return T.length
                                  },
                                  write: function(_) {
                                      for (var A = T, Z = 0; Z + 1 < A.length; )
                                          _.put(45 * P(A.charAt(Z)) + P(A.charAt(Z + 1)), 11),
                                          Z += 2;
                                      Z < A.length && _.put(P(A.charAt(Z)), 6)
                                  }
                              }
                                , P = function(_) {
                                  if ("0" <= _ && _ <= "9")
                                      return _.charCodeAt(0) - "0".charCodeAt(0);
                                  if ("A" <= _ && _ <= "Z")
                                      return _.charCodeAt(0) - "A".charCodeAt(0) + 10;
                                  switch (_) {
                                  case " ":
                                      return 36;
                                  case "$":
                                      return 37;
                                  case "%":
                                      return 38;
                                  case "*":
                                      return 39;
                                  case "+":
                                      return 40;
                                  case "-":
                                      return 41;
                                  case ".":
                                      return 42;
                                  case "/":
                                      return 43;
                                  case ":":
                                      return 44;
                                  default:
                                      throw "illegal char :" + _
                                  }
                              };
                              return O
                          }
                            , q = function(z) {
                              var T = a.stringToBytes(z);
                              return {
                                  getMode: function() {
                                      return 4
                                  },
                                  getLength: function(O) {
                                      return T.length
                                  },
                                  write: function(O) {
                                      for (var P = 0; P < T.length; P += 1)
                                          O.put(T[P], 8)
                                  }
                              }
                          }
                            , G = function(z) {
                              var T = a.stringToBytesFuncs.SJIS;
                              if (!T)
                                  throw "sjis not supported.";
                              (function(P, _) {
                                  var A = T("\u53CB");
                                  if (A.length != 2 || (A[0] << 8 | A[1]) != 38726)
                                      throw "sjis not supported."
                              }
                              )();
                              var O = T(z);
                              return {
                                  getMode: function() {
                                      return 8
                                  },
                                  getLength: function(P) {
                                      return ~~(O.length / 2)
                                  },
                                  write: function(P) {
                                      for (var _ = O, A = 0; A + 1 < _.length; ) {
                                          var Z = (255 & _[A]) << 8 | 255 & _[A + 1];
                                          if (33088 <= Z && Z <= 40956)
                                              Z -= 33088;
                                          else {
                                              if (!(57408 <= Z && Z <= 60351))
                                                  throw "illegal char at " + (A + 1) + "/" + Z;
                                              Z -= 49472
                                          }
                                          Z = 192 * (Z >>> 8 & 255) + (255 & Z),
                                          P.put(Z, 13),
                                          A += 2
                                      }
                                      if (A < _.length)
                                          throw "illegal char at " + (A + 1)
                                  }
                              }
                          }
                            , b = function() {
                              var z = []
                                , T = {
                                  writeByte: function(O) {
                                      z.push(255 & O)
                                  },
                                  writeShort: function(O) {
                                      T.writeByte(O),
                                      T.writeByte(O >>> 8)
                                  },
                                  writeBytes: function(O, P, _) {
                                      P = P || 0,
                                      _ = _ || O.length;
                                      for (var A = 0; A < _; A += 1)
                                          T.writeByte(O[A + P])
                                  },
                                  writeString: function(O) {
                                      for (var P = 0; P < O.length; P += 1)
                                          T.writeByte(O.charCodeAt(P))
                                  },
                                  toByteArray: function() {
                                      return z
                                  },
                                  toString: function() {
                                      var O = "";
                                      O += "[";
                                      for (var P = 0; P < z.length; P += 1)
                                          P > 0 && (O += ","),
                                          O += z[P];
                                      return O + "]"
                                  }
                              };
                              return T
                          }
                            , ye = function(z) {
                              var T = z
                                , O = 0
                                , P = 0
                                , _ = 0
                                , A = {
                                  read: function() {
                                      for (; _ < 8; ) {
                                          if (O >= T.length) {
                                              if (_ == 0)
                                                  return -1;
                                              throw "unexpected end of file./" + _
                                          }
                                          var H = T.charAt(O);
                                          if (O += 1,
                                          H == "=")
                                              return _ = 0,
                                              -1;
                                          H.match(/^\s$/) || (P = P << 6 | Z(H.charCodeAt(0)),
                                          _ += 6)
                                      }
                                      var Y = P >>> _ - 8 & 255;
                                      return _ -= 8,
                                      Y
                                  }
                              }
                                , Z = function(H) {
                                  if (65 <= H && H <= 90)
                                      return H - 65;
                                  if (97 <= H && H <= 122)
                                      return H - 97 + 26;
                                  if (48 <= H && H <= 57)
                                      return H - 48 + 52;
                                  if (H == 43)
                                      return 62;
                                  if (H == 47)
                                      return 63;
                                  throw "c:" + H
                              };
                              return A
                          }
                            , ie = function(z, T, O) {
                              for (var P = function(N, u) {
                                  var f = N
                                    , c = u
                                    , h = new Array(N * u)
                                    , y = {
                                      setPixel: function(p, m, d) {
                                          h[m * f + p] = d
                                      },
                                      write: function(p) {
                                          p.writeString("GIF87a"),
                                          p.writeShort(f),
                                          p.writeShort(c),
                                          p.writeByte(128),
                                          p.writeByte(0),
                                          p.writeByte(0),
                                          p.writeByte(0),
                                          p.writeByte(0),
                                          p.writeByte(0),
                                          p.writeByte(255),
                                          p.writeByte(255),
                                          p.writeByte(255),
                                          p.writeString(","),
                                          p.writeShort(0),
                                          p.writeShort(0),
                                          p.writeShort(f),
                                          p.writeShort(c),
                                          p.writeByte(0);
                                          var m = g(2);
                                          p.writeByte(2);
                                          for (var d = 0; m.length - d > 255; )
                                              p.writeByte(255),
                                              p.writeBytes(m, d, 255),
                                              d += 255;
                                          p.writeByte(m.length - d),
                                          p.writeBytes(m, d, m.length - d),
                                          p.writeByte(0),
                                          p.writeString(";")
                                      }
                                  }
                                    , g = function(p) {
                                      for (var m = 1 << p, d = 1 + (1 << p), S = p + 1, C = M(), F = 0; F < m; F += 1)
                                          C.add(String.fromCharCode(F));
                                      C.add(String.fromCharCode(m)),
                                      C.add(String.fromCharCode(d));
                                      var Q, D, X, J = b(), te = (Q = J,
                                      D = 0,
                                      X = 0,
                                      {
                                          write: function(ee, re) {
                                              if (ee >>> re)
                                                  throw "length over";
                                              for (; D + re >= 8; )
                                                  Q.writeByte(255 & (ee << D | X)),
                                                  re -= 8 - D,
                                                  ee >>>= 8 - D,
                                                  X = 0,
                                                  D = 0;
                                              X |= ee << D,
                                              D += re
                                          },
                                          flush: function() {
                                              D > 0 && Q.writeByte(X)
                                          }
                                      });
                                      te.write(m, S);
                                      var ae = 0
                                        , K = String.fromCharCode(h[ae]);
                                      for (ae += 1; ae < h.length; ) {
                                          var ne = String.fromCharCode(h[ae]);
                                          ae += 1,
                                          C.contains(K + ne) ? K += ne : (te.write(C.indexOf(K), S),
                                          C.size() < 4095 && (C.size() == 1 << S && (S += 1),
                                          C.add(K + ne)),
                                          K = ne)
                                      }
                                      return te.write(C.indexOf(K), S),
                                      te.write(d, S),
                                      te.flush(),
                                      J.toByteArray()
                                  }
                                    , M = function() {
                                      var p = {}
                                        , m = 0
                                        , d = {
                                          add: function(S) {
                                              if (d.contains(S))
                                                  throw "dup key:" + S;
                                              p[S] = m,
                                              m += 1
                                          },
                                          size: function() {
                                              return m
                                          },
                                          indexOf: function(S) {
                                              return p[S]
                                          },
                                          contains: function(S) {
                                              return p[S] !== void 0
                                          }
                                      };
                                      return d
                                  };
                                  return y
                              }(z, T), _ = 0; _ < T; _ += 1)
                                  for (var A = 0; A < z; A += 1)
                                      P.setPixel(A, _, O(A, _));
                              var Z = b();
                              P.write(Z);
                              for (var H = function() {
                                  var N = 0
                                    , u = 0
                                    , f = 0
                                    , c = ""
                                    , h = {}
                                    , y = function(M) {
                                      c += String.fromCharCode(g(63 & M))
                                  }
                                    , g = function(M) {
                                      if (!(M < 0)) {
                                          if (M < 26)
                                              return 65 + M;
                                          if (M < 52)
                                              return M - 26 + 97;
                                          if (M < 62)
                                              return M - 52 + 48;
                                          if (M == 62)
                                              return 43;
                                          if (M == 63)
                                              return 47
                                      }
                                      throw "n:" + M
                                  };
                                  return h.writeByte = function(M) {
                                      for (N = N << 8 | 255 & M,
                                      u += 8,
                                      f += 1; u >= 6; )
                                          y(N >>> u - 6),
                                          u -= 6
                                  }
                                  ,
                                  h.flush = function() {
                                      if (u > 0 && (y(N << 6 - u),
                                      N = 0,
                                      u = 0),
                                      f % 3 != 0)
                                          for (var M = 3 - f % 3, p = 0; p < M; p += 1)
                                              c += "="
                                  }
                                  ,
                                  h.toString = function() {
                                      return c
                                  }
                                  ,
                                  h
                              }(), Y = Z.toByteArray(), Le = 0; Le < Y.length; Le += 1)
                                  H.writeByte(Y[Le]);
                              return H.flush(),
                              "data:image/gif;base64," + H
                          };
                          return a
                      }();
                      s.stringToBytesFuncs["UTF-8"] = function(a) {
                          return function(k) {
                              for (var L = [], I = 0; I < k.length; I++) {
                                  var E = k.charCodeAt(I);
                                  E < 128 ? L.push(E) : E < 2048 ? L.push(192 | E >> 6, 128 | 63 & E) : E < 55296 || E >= 57344 ? L.push(224 | E >> 12, 128 | E >> 6 & 63, 128 | 63 & E) : (I++,
                                  E = 65536 + ((1023 & E) << 10 | 1023 & k.charCodeAt(I)),
                                  L.push(240 | E >> 18, 128 | E >> 12 & 63, 128 | E >> 6 & 63, 128 | 63 & E))
                              }
                              return L
                          }(a)
                      }
                      ,
                      (l = typeof (i = function() {
                          return s
                      }
                      ) == "function" ? i.apply(o, []) : i) === void 0 || (r.exports = l)
                  }
                  ,
                  676: (r,o,i)=>{
                      "use strict";
                      i.d(o, {
                          default: ()=>Le
                      });
                      var l = function() {
                          return (l = Object.assign || function(N) {
                              for (var u, f = 1, c = arguments.length; f < c; f++)
                                  for (var h in u = arguments[f])
                                      Object.prototype.hasOwnProperty.call(u, h) && (N[h] = u[h]);
                              return N
                          }
                          ).apply(this, arguments)
                      }
                        , s = function() {
                          for (var N = 0, u = 0, f = arguments.length; u < f; u++)
                              N += arguments[u].length;
                          var c = Array(N)
                            , h = 0;
                          for (u = 0; u < f; u++)
                              for (var y = arguments[u], g = 0, M = y.length; g < M; g++,
                              h++)
                                  c[h] = y[g];
                          return c
                      }
                        , a = function(N) {
                          return !!N && typeof N == "object" && !Array.isArray(N)
                      };
                      function k(N) {
                          for (var u = [], f = 1; f < arguments.length; f++)
                              u[f - 1] = arguments[f];
                          if (!u.length)
                              return N;
                          var c = u.shift();
                          return c !== void 0 && a(N) && a(c) ? (N = l({}, N),
                          Object.keys(c).forEach(function(h) {
                              var y = N[h]
                                , g = c[h];
                              Array.isArray(y) && Array.isArray(g) ? N[h] = g : a(y) && a(g) ? N[h] = k(Object.assign({}, y), g) : N[h] = g
                          }),
                          k.apply(void 0, s([N], u))) : N
                      }
                      function L(N, u) {
                          var f = document.createElement("a");
                          f.download = u,
                          f.href = N,
                          document.body.appendChild(f),
                          f.click(),
                          document.body.removeChild(f)
                      }
                      function I(N) {
                          return u = this,
                          f = void 0,
                          h = function() {
                              return function(y, g) {
                                  var M, p, m, d, S = {
                                      label: 0,
                                      sent: function() {
                                          if (1 & m[0])
                                              throw m[1];
                                          return m[1]
                                      },
                                      trys: [],
                                      ops: []
                                  };
                                  return d = {
                                      next: C(0),
                                      throw: C(1),
                                      return: C(2)
                                  },
                                  typeof Symbol == "function" && (d[Symbol.iterator] = function() {
                                      return this
                                  }
                                  ),
                                  d;
                                  function C(F) {
                                      return function(Q) {
                                          return function(D) {
                                              if (M)
                                                  throw new TypeError("Generator is already executing.");
                                              for (; S; )
                                                  try {
                                                      if (M = 1,
                                                      p && (m = 2 & D[0] ? p.return : D[0] ? p.throw || ((m = p.return) && m.call(p),
                                                      0) : p.next) && !(m = m.call(p, D[1])).done)
                                                          return m;
                                                      switch (p = 0,
                                                      m && (D = [2 & D[0], m.value]),
                                                      D[0]) {
                                                      case 0:
                                                      case 1:
                                                          m = D;
                                                          break;
                                                      case 4:
                                                          return S.label++,
                                                          {
                                                              value: D[1],
                                                              done: !1
                                                          };
                                                      case 5:
                                                          S.label++,
                                                          p = D[1],
                                                          D = [0];
                                                          continue;
                                                      case 7:
                                                          D = S.ops.pop(),
                                                          S.trys.pop();
                                                          continue;
                                                      default:
                                                          if (!((m = (m = S.trys).length > 0 && m[m.length - 1]) || D[0] !== 6 && D[0] !== 2)) {
                                                              S = 0;
                                                              continue
                                                          }
                                                          if (D[0] === 3 && (!m || D[1] > m[0] && D[1] < m[3])) {
                                                              S.label = D[1];
                                                              break
                                                          }
                                                          if (D[0] === 6 && S.label < m[1]) {
                                                              S.label = m[1],
                                                              m = D;
                                                              break
                                                          }
                                                          if (m && S.label < m[2]) {
                                                              S.label = m[2],
                                                              S.ops.push(D);
                                                              break
                                                          }
                                                          m[2] && S.ops.pop(),
                                                          S.trys.pop();
                                                          continue
                                                      }
                                                      D = g.call(y, S)
                                                  } catch (X) {
                                                      D = [6, X],
                                                      p = 0
                                                  } finally {
                                                      M = m = 0
                                                  }
                                              if (5 & D[0])
                                                  throw D[1];
                                              return {
                                                  value: D[0] ? D[1] : void 0,
                                                  done: !0
                                              }
                                          }([F, Q])
                                      }
                                  }
                              }(this, function(y) {
                                  return [2, new Promise(function(g) {
                                      var M = new XMLHttpRequest;
                                      M.onload = function() {
                                          var p = new FileReader;
                                          p.onloadend = function() {
                                              g(p.result)
                                          }
                                          ,
                                          p.readAsDataURL(M.response)
                                      }
                                      ,
                                      M.open("GET", N),
                                      M.responseType = "blob",
                                      M.send()
                                  }
                                  )]
                              })
                          }
                          ,
                          new ((c = void 0) || (c = Promise))(function(y, g) {
                              function M(d) {
                                  try {
                                      m(h.next(d))
                                  } catch (S) {
                                      g(S)
                                  }
                              }
                              function p(d) {
                                  try {
                                      m(h.throw(d))
                                  } catch (S) {
                                      g(S)
                                  }
                              }
                              function m(d) {
                                  var S;
                                  d.done ? y(d.value) : (S = d.value,
                                  S instanceof c ? S : new c(function(C) {
                                      C(S)
                                  }
                                  )).then(M, p)
                              }
                              m((h = h.apply(u, f || [])).next())
                          }
                          );
                          var u, f, c, h
                      }
                      let E = {
                          L: .07,
                          M: .15,
                          Q: .25,
                          H: .3
                      };
                      var R = function() {
                          return (R = Object.assign || function(N) {
                              for (var u, f = 1, c = arguments.length; f < c; f++)
                                  for (var h in u = arguments[f])
                                      Object.prototype.hasOwnProperty.call(u, h) && (N[h] = u[h]);
                              return N
                          }
                          ).apply(this, arguments)
                      };
                      let V = function() {
                          function N(u) {
                              var f = u.svg
                                , c = u.type;
                              this._svg = f,
                              this._type = c
                          }
                          return N.prototype.draw = function(u, f, c, h) {
                              var y;
                              switch (this._type) {
                              case "dots":
                                  y = this._drawDot;
                                  break;
                              case "classy":
                                  y = this._drawClassy;
                                  break;
                              case "classy-rounded":
                                  y = this._drawClassyRounded;
                                  break;
                              case "rounded":
                                  y = this._drawRounded;
                                  break;
                              case "extra-rounded":
                                  y = this._drawExtraRounded;
                                  break;
                              case "square":
                              default:
                                  y = this._drawSquare
                              }
                              y.call(this, {
                                  x: u,
                                  y: f,
                                  size: c,
                                  getNeighbor: h
                              })
                          }
                          ,
                          N.prototype._rotateFigure = function(u) {
                              var f, c = u.x, h = u.y, y = u.size, g = u.rotation, M = g === void 0 ? 0 : g, p = c + y / 2, m = h + y / 2;
                              (0,
                              u.draw)(),
                              (f = this._element) === null || f === void 0 || f.setAttribute("transform", "rotate(" + 180 * M / Math.PI + "," + p + "," + m + ")")
                          }
                          ,
                          N.prototype._basicDot = function(u) {
                              var f = this
                                , c = u.size
                                , h = u.x
                                , y = u.y;
                              this._rotateFigure(R(R({}, u), {
                                  draw: function() {
                                      f._element = document.createElementNS("http://www.w3.org/2000/svg", "circle"),
                                      f._element.setAttribute("cx", String(h + c / 2)),
                                      f._element.setAttribute("cy", String(y + c / 2)),
                                      f._element.setAttribute("r", String(c / 2))
                                  }
                              }))
                          }
                          ,
                          N.prototype._basicSquare = function(u) {
                              var f = this
                                , c = u.size
                                , h = u.x
                                , y = u.y;
                              this._rotateFigure(R(R({}, u), {
                                  draw: function() {
                                      f._element = document.createElementNS("http://www.w3.org/2000/svg", "rect"),
                                      f._element.setAttribute("x", String(h)),
                                      f._element.setAttribute("y", String(y)),
                                      f._element.setAttribute("width", String(c)),
                                      f._element.setAttribute("height", String(c))
                                  }
                              }))
                          }
                          ,
                          N.prototype._basicSideRounded = function(u) {
                              var f = this
                                , c = u.size
                                , h = u.x
                                , y = u.y;
                              this._rotateFigure(R(R({}, u), {
                                  draw: function() {
                                      f._element = document.createElementNS("http://www.w3.org/2000/svg", "path"),
                                      f._element.setAttribute("d", "M " + h + " " + y + "v " + c + "h " + c / 2 + "a " + c / 2 + " " + c / 2 + ", 0, 0, 0, 0 " + -c)
                                  }
                              }))
                          }
                          ,
                          N.prototype._basicCornerRounded = function(u) {
                              var f = this
                                , c = u.size
                                , h = u.x
                                , y = u.y;
                              this._rotateFigure(R(R({}, u), {
                                  draw: function() {
                                      f._element = document.createElementNS("http://www.w3.org/2000/svg", "path"),
                                      f._element.setAttribute("d", "M " + h + " " + y + "v " + c + "h " + c + "v " + -c / 2 + "a " + c / 2 + " " + c / 2 + ", 0, 0, 0, " + -c / 2 + " " + -c / 2)
                                  }
                              }))
                          }
                          ,
                          N.prototype._basicCornerExtraRounded = function(u) {
                              var f = this
                                , c = u.size
                                , h = u.x
                                , y = u.y;
                              this._rotateFigure(R(R({}, u), {
                                  draw: function() {
                                      f._element = document.createElementNS("http://www.w3.org/2000/svg", "path"),
                                      f._element.setAttribute("d", "M " + h + " " + y + "v " + c + "h " + c + "a " + c + " " + c + ", 0, 0, 0, " + -c + " " + -c)
                                  }
                              }))
                          }
                          ,
                          N.prototype._basicCornersRounded = function(u) {
                              var f = this
                                , c = u.size
                                , h = u.x
                                , y = u.y;
                              this._rotateFigure(R(R({}, u), {
                                  draw: function() {
                                      f._element = document.createElementNS("http://www.w3.org/2000/svg", "path"),
                                      f._element.setAttribute("d", "M " + h + " " + y + "v " + c / 2 + "a " + c / 2 + " " + c / 2 + ", 0, 0, 0, " + c / 2 + " " + c / 2 + "h " + c / 2 + "v " + -c / 2 + "a " + c / 2 + " " + c / 2 + ", 0, 0, 0, " + -c / 2 + " " + -c / 2)
                                  }
                              }))
                          }
                          ,
                          N.prototype._drawDot = function(u) {
                              var f = u.x
                                , c = u.y
                                , h = u.size;
                              this._basicDot({
                                  x: f,
                                  y: c,
                                  size: h,
                                  rotation: 0
                              })
                          }
                          ,
                          N.prototype._drawSquare = function(u) {
                              var f = u.x
                                , c = u.y
                                , h = u.size;
                              this._basicSquare({
                                  x: f,
                                  y: c,
                                  size: h,
                                  rotation: 0
                              })
                          }
                          ,
                          N.prototype._drawRounded = function(u) {
                              var f = u.x
                                , c = u.y
                                , h = u.size
                                , y = u.getNeighbor
                                , g = y ? +y(-1, 0) : 0
                                , M = y ? +y(1, 0) : 0
                                , p = y ? +y(0, -1) : 0
                                , m = y ? +y(0, 1) : 0
                                , d = g + M + p + m;
                              if (d !== 0)
                                  if (d > 2 || g && M || p && m)
                                      this._basicSquare({
                                          x: f,
                                          y: c,
                                          size: h,
                                          rotation: 0
                                      });
                                  else {
                                      if (d === 2) {
                                          var S = 0;
                                          return g && p ? S = Math.PI / 2 : p && M ? S = Math.PI : M && m && (S = -Math.PI / 2),
                                          void this._basicCornerRounded({
                                              x: f,
                                              y: c,
                                              size: h,
                                              rotation: S
                                          })
                                      }
                                      if (d === 1)
                                          return S = 0,
                                          p ? S = Math.PI / 2 : M ? S = Math.PI : m && (S = -Math.PI / 2),
                                          void this._basicSideRounded({
                                              x: f,
                                              y: c,
                                              size: h,
                                              rotation: S
                                          })
                                  }
                              else
                                  this._basicDot({
                                      x: f,
                                      y: c,
                                      size: h,
                                      rotation: 0
                                  })
                          }
                          ,
                          N.prototype._drawExtraRounded = function(u) {
                              var f = u.x
                                , c = u.y
                                , h = u.size
                                , y = u.getNeighbor
                                , g = y ? +y(-1, 0) : 0
                                , M = y ? +y(1, 0) : 0
                                , p = y ? +y(0, -1) : 0
                                , m = y ? +y(0, 1) : 0
                                , d = g + M + p + m;
                              if (d !== 0)
                                  if (d > 2 || g && M || p && m)
                                      this._basicSquare({
                                          x: f,
                                          y: c,
                                          size: h,
                                          rotation: 0
                                      });
                                  else {
                                      if (d === 2) {
                                          var S = 0;
                                          return g && p ? S = Math.PI / 2 : p && M ? S = Math.PI : M && m && (S = -Math.PI / 2),
                                          void this._basicCornerExtraRounded({
                                              x: f,
                                              y: c,
                                              size: h,
                                              rotation: S
                                          })
                                      }
                                      if (d === 1)
                                          return S = 0,
                                          p ? S = Math.PI / 2 : M ? S = Math.PI : m && (S = -Math.PI / 2),
                                          void this._basicSideRounded({
                                              x: f,
                                              y: c,
                                              size: h,
                                              rotation: S
                                          })
                                  }
                              else
                                  this._basicDot({
                                      x: f,
                                      y: c,
                                      size: h,
                                      rotation: 0
                                  })
                          }
                          ,
                          N.prototype._drawClassy = function(u) {
                              var f = u.x
                                , c = u.y
                                , h = u.size
                                , y = u.getNeighbor
                                , g = y ? +y(-1, 0) : 0
                                , M = y ? +y(1, 0) : 0
                                , p = y ? +y(0, -1) : 0
                                , m = y ? +y(0, 1) : 0;
                              g + M + p + m !== 0 ? g || p ? M || m ? this._basicSquare({
                                  x: f,
                                  y: c,
                                  size: h,
                                  rotation: 0
                              }) : this._basicCornerRounded({
                                  x: f,
                                  y: c,
                                  size: h,
                                  rotation: Math.PI / 2
                              }) : this._basicCornerRounded({
                                  x: f,
                                  y: c,
                                  size: h,
                                  rotation: -Math.PI / 2
                              }) : this._basicCornersRounded({
                                  x: f,
                                  y: c,
                                  size: h,
                                  rotation: Math.PI / 2
                              })
                          }
                          ,
                          N.prototype._drawClassyRounded = function(u) {
                              var f = u.x
                                , c = u.y
                                , h = u.size
                                , y = u.getNeighbor
                                , g = y ? +y(-1, 0) : 0
                                , M = y ? +y(1, 0) : 0
                                , p = y ? +y(0, -1) : 0
                                , m = y ? +y(0, 1) : 0;
                              g + M + p + m !== 0 ? g || p ? M || m ? this._basicSquare({
                                  x: f,
                                  y: c,
                                  size: h,
                                  rotation: 0
                              }) : this._basicCornerExtraRounded({
                                  x: f,
                                  y: c,
                                  size: h,
                                  rotation: Math.PI / 2
                              }) : this._basicCornerExtraRounded({
                                  x: f,
                                  y: c,
                                  size: h,
                                  rotation: -Math.PI / 2
                              }) : this._basicCornersRounded({
                                  x: f,
                                  y: c,
                                  size: h,
                                  rotation: Math.PI / 2
                              })
                          }
                          ,
                          N
                      }();
                      var U = function() {
                          return (U = Object.assign || function(N) {
                              for (var u, f = 1, c = arguments.length; f < c; f++)
                                  for (var h in u = arguments[f])
                                      Object.prototype.hasOwnProperty.call(u, h) && (N[h] = u[h]);
                              return N
                          }
                          ).apply(this, arguments)
                      };
                      let se = function() {
                          function N(u) {
                              var f = u.svg
                                , c = u.type;
                              this._svg = f,
                              this._type = c
                          }
                          return N.prototype.draw = function(u, f, c, h) {
                              var y;
                              switch (this._type) {
                              case "square":
                                  y = this._drawSquare;
                                  break;
                              case "extra-rounded":
                                  y = this._drawExtraRounded;
                                  break;
                              case "dot":
                              default:
                                  y = this._drawDot
                              }
                              y.call(this, {
                                  x: u,
                                  y: f,
                                  size: c,
                                  rotation: h
                              })
                          }
                          ,
                          N.prototype._rotateFigure = function(u) {
                              var f, c = u.x, h = u.y, y = u.size, g = u.rotation, M = g === void 0 ? 0 : g, p = c + y / 2, m = h + y / 2;
                              (0,
                              u.draw)(),
                              (f = this._element) === null || f === void 0 || f.setAttribute("transform", "rotate(" + 180 * M / Math.PI + "," + p + "," + m + ")")
                          }
                          ,
                          N.prototype._basicDot = function(u) {
                              var f = this
                                , c = u.size
                                , h = u.x
                                , y = u.y
                                , g = c / 7;
                              this._rotateFigure(U(U({}, u), {
                                  draw: function() {
                                      f._element = document.createElementNS("http://www.w3.org/2000/svg", "path"),
                                      f._element.setAttribute("clip-rule", "evenodd"),
                                      f._element.setAttribute("d", "M " + (h + c / 2) + " " + y + "a " + c / 2 + " " + c / 2 + " 0 1 0 0.1 0zm 0 " + g + "a " + (c / 2 - g) + " " + (c / 2 - g) + " 0 1 1 -0.1 0Z")
                                  }
                              }))
                          }
                          ,
                          N.prototype._basicSquare = function(u) {
                              var f = this
                                , c = u.size
                                , h = u.x
                                , y = u.y
                                , g = c / 7;
                              this._rotateFigure(U(U({}, u), {
                                  draw: function() {
                                      f._element = document.createElementNS("http://www.w3.org/2000/svg", "path"),
                                      f._element.setAttribute("clip-rule", "evenodd"),
                                      f._element.setAttribute("d", "M " + h + " " + y + "v " + c + "h " + c + "v " + -c + "zM " + (h + g) + " " + (y + g) + "h " + (c - 2 * g) + "v " + (c - 2 * g) + "h " + (2 * g - c) + "z")
                                  }
                              }))
                          }
                          ,
                          N.prototype._basicExtraRounded = function(u) {
                              var f = this
                                , c = u.size
                                , h = u.x
                                , y = u.y
                                , g = c / 7;
                              this._rotateFigure(U(U({}, u), {
                                  draw: function() {
                                      f._element = document.createElementNS("http://www.w3.org/2000/svg", "path"),
                                      f._element.setAttribute("clip-rule", "evenodd"),
                                      f._element.setAttribute("d", "M " + h + " " + (y + 2.5 * g) + "v " + 2 * g + "a " + 2.5 * g + " " + 2.5 * g + ", 0, 0, 0, " + 2.5 * g + " " + 2.5 * g + "h " + 2 * g + "a " + 2.5 * g + " " + 2.5 * g + ", 0, 0, 0, " + 2.5 * g + " " + 2.5 * -g + "v " + -2 * g + "a " + 2.5 * g + " " + 2.5 * g + ", 0, 0, 0, " + 2.5 * -g + " " + 2.5 * -g + "h " + -2 * g + "a " + 2.5 * g + " " + 2.5 * g + ", 0, 0, 0, " + 2.5 * -g + " " + 2.5 * g + "M " + (h + 2.5 * g) + " " + (y + g) + "h " + 2 * g + "a " + 1.5 * g + " " + 1.5 * g + ", 0, 0, 1, " + 1.5 * g + " " + 1.5 * g + "v " + 2 * g + "a " + 1.5 * g + " " + 1.5 * g + ", 0, 0, 1, " + 1.5 * -g + " " + 1.5 * g + "h " + -2 * g + "a " + 1.5 * g + " " + 1.5 * g + ", 0, 0, 1, " + 1.5 * -g + " " + 1.5 * -g + "v " + -2 * g + "a " + 1.5 * g + " " + 1.5 * g + ", 0, 0, 1, " + 1.5 * g + " " + 1.5 * -g)
                                  }
                              }))
                          }
                          ,
                          N.prototype._drawDot = function(u) {
                              var f = u.x
                                , c = u.y
                                , h = u.size
                                , y = u.rotation;
                              this._basicDot({
                                  x: f,
                                  y: c,
                                  size: h,
                                  rotation: y
                              })
                          }
                          ,
                          N.prototype._drawSquare = function(u) {
                              var f = u.x
                                , c = u.y
                                , h = u.size
                                , y = u.rotation;
                              this._basicSquare({
                                  x: f,
                                  y: c,
                                  size: h,
                                  rotation: y
                              })
                          }
                          ,
                          N.prototype._drawExtraRounded = function(u) {
                              var f = u.x
                                , c = u.y
                                , h = u.size
                                , y = u.rotation;
                              this._basicExtraRounded({
                                  x: f,
                                  y: c,
                                  size: h,
                                  rotation: y
                              })
                          }
                          ,
                          N
                      }();
                      var w = function() {
                          return (w = Object.assign || function(N) {
                              for (var u, f = 1, c = arguments.length; f < c; f++)
                                  for (var h in u = arguments[f])
                                      Object.prototype.hasOwnProperty.call(u, h) && (N[h] = u[h]);
                              return N
                          }
                          ).apply(this, arguments)
                      };
                      let v = function() {
                          function N(u) {
                              var f = u.svg
                                , c = u.type;
                              this._svg = f,
                              this._type = c
                          }
                          return N.prototype.draw = function(u, f, c, h) {
                              var y;
                              switch (this._type) {
                              case "square":
                                  y = this._drawSquare;
                                  break;
                              case "dot":
                              default:
                                  y = this._drawDot
                              }
                              y.call(this, {
                                  x: u,
                                  y: f,
                                  size: c,
                                  rotation: h
                              })
                          }
                          ,
                          N.prototype._rotateFigure = function(u) {
                              var f, c = u.x, h = u.y, y = u.size, g = u.rotation, M = g === void 0 ? 0 : g, p = c + y / 2, m = h + y / 2;
                              (0,
                              u.draw)(),
                              (f = this._element) === null || f === void 0 || f.setAttribute("transform", "rotate(" + 180 * M / Math.PI + "," + p + "," + m + ")")
                          }
                          ,
                          N.prototype._basicDot = function(u) {
                              var f = this
                                , c = u.size
                                , h = u.x
                                , y = u.y;
                              this._rotateFigure(w(w({}, u), {
                                  draw: function() {
                                      f._element = document.createElementNS("http://www.w3.org/2000/svg", "circle"),
                                      f._element.setAttribute("cx", String(h + c / 2)),
                                      f._element.setAttribute("cy", String(y + c / 2)),
                                      f._element.setAttribute("r", String(c / 2))
                                  }
                              }))
                          }
                          ,
                          N.prototype._basicSquare = function(u) {
                              var f = this
                                , c = u.size
                                , h = u.x
                                , y = u.y;
                              this._rotateFigure(w(w({}, u), {
                                  draw: function() {
                                      f._element = document.createElementNS("http://www.w3.org/2000/svg", "rect"),
                                      f._element.setAttribute("x", String(h)),
                                      f._element.setAttribute("y", String(y)),
                                      f._element.setAttribute("width", String(c)),
                                      f._element.setAttribute("height", String(c))
                                  }
                              }))
                          }
                          ,
                          N.prototype._drawDot = function(u) {
                              var f = u.x
                                , c = u.y
                                , h = u.size
                                , y = u.rotation;
                              this._basicDot({
                                  x: f,
                                  y: c,
                                  size: h,
                                  rotation: y
                              })
                          }
                          ,
                          N.prototype._drawSquare = function(u) {
                              var f = u.x
                                , c = u.y
                                , h = u.size
                                , y = u.rotation;
                              this._basicSquare({
                                  x: f,
                                  y: c,
                                  size: h,
                                  rotation: y
                              })
                          }
                          ,
                          N
                      }()
                        , x = "circle";
                      var j = function(N, u, f, c) {
                          return new (f || (f = Promise))(function(h, y) {
                              function g(m) {
                                  try {
                                      p(c.next(m))
                                  } catch (d) {
                                      y(d)
                                  }
                              }
                              function M(m) {
                                  try {
                                      p(c.throw(m))
                                  } catch (d) {
                                      y(d)
                                  }
                              }
                              function p(m) {
                                  var d;
                                  m.done ? h(m.value) : (d = m.value,
                                  d instanceof f ? d : new f(function(S) {
                                      S(d)
                                  }
                                  )).then(g, M)
                              }
                              p((c = c.apply(N, u || [])).next())
                          }
                          )
                      }
                        , $ = function(N, u) {
                          var f, c, h, y, g = {
                              label: 0,
                              sent: function() {
                                  if (1 & h[0])
                                      throw h[1];
                                  return h[1]
                              },
                              trys: [],
                              ops: []
                          };
                          return y = {
                              next: M(0),
                              throw: M(1),
                              return: M(2)
                          },
                          typeof Symbol == "function" && (y[Symbol.iterator] = function() {
                              return this
                          }
                          ),
                          y;
                          function M(p) {
                              return function(m) {
                                  return function(d) {
                                      if (f)
                                          throw new TypeError("Generator is already executing.");
                                      for (; g; )
                                          try {
                                              if (f = 1,
                                              c && (h = 2 & d[0] ? c.return : d[0] ? c.throw || ((h = c.return) && h.call(c),
                                              0) : c.next) && !(h = h.call(c, d[1])).done)
                                                  return h;
                                              switch (c = 0,
                                              h && (d = [2 & d[0], h.value]),
                                              d[0]) {
                                              case 0:
                                              case 1:
                                                  h = d;
                                                  break;
                                              case 4:
                                                  return g.label++,
                                                  {
                                                      value: d[1],
                                                      done: !1
                                                  };
                                              case 5:
                                                  g.label++,
                                                  c = d[1],
                                                  d = [0];
                                                  continue;
                                              case 7:
                                                  d = g.ops.pop(),
                                                  g.trys.pop();
                                                  continue;
                                              default:
                                                  if (!((h = (h = g.trys).length > 0 && h[h.length - 1]) || d[0] !== 6 && d[0] !== 2)) {
                                                      g = 0;
                                                      continue
                                                  }
                                                  if (d[0] === 3 && (!h || d[1] > h[0] && d[1] < h[3])) {
                                                      g.label = d[1];
                                                      break
                                                  }
                                                  if (d[0] === 6 && g.label < h[1]) {
                                                      g.label = h[1],
                                                      h = d;
                                                      break
                                                  }
                                                  if (h && g.label < h[2]) {
                                                      g.label = h[2],
                                                      g.ops.push(d);
                                                      break
                                                  }
                                                  h[2] && g.ops.pop(),
                                                  g.trys.pop();
                                                  continue
                                              }
                                              d = u.call(N, g)
                                          } catch (S) {
                                              d = [6, S],
                                              c = 0
                                          } finally {
                                              f = h = 0
                                          }
                                      if (5 & d[0])
                                          throw d[1];
                                      return {
                                          value: d[0] ? d[1] : void 0,
                                          done: !0
                                      }
                                  }([p, m])
                              }
                          }
                      }
                        , q = [[1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1]]
                        , G = [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 1, 1, 0, 0], [0, 0, 1, 1, 1, 0, 0], [0, 0, 1, 1, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]];
                      let b = function() {
                          function N(u) {
                              this._element = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
                              this._element.setAttribute("width", String(u.width)),
                              this._element.setAttribute("height", String(u.height)),
                              this._defs = document.createElementNS("http://www.w3.org/2000/svg", "defs"),
                              this._element.appendChild(this._defs),
                              this._options = u
                          }
                          return Object.defineProperty(N.prototype, "width", {
                              get: function() {
                                  return this._options.width
                              },
                              enumerable: !1,
                              configurable: !0
                          }),
                          Object.defineProperty(N.prototype, "height", {
                              get: function() {
                                  return this._options.height
                              },
                              enumerable: !1,
                              configurable: !0
                          }),
                          N.prototype.getElement = function() {
                              return this._element
                          }
                          ,
                          N.prototype.drawQR = function(u) {
                              return j(this, void 0, void 0, function() {
                                  var f, c, h, y, g, M, p, m, d, S, C = this;
                                  return $(this, function(F) {
                                      switch (F.label) {
                                      case 0:
                                          return f = u.getModuleCount(),
                                          c = Math.min(this._options.width, this._options.height) - 2 * this._options.margin,
                                          h = this._options.shape === x ? c / Math.sqrt(2) : c,
                                          y = Math.floor(h / f),
                                          g = {
                                              hideXDots: 0,
                                              hideYDots: 0,
                                              width: 0,
                                              height: 0
                                          },
                                          this._qr = u,
                                          this._options.image ? [4, this.loadImage()] : [3, 2];
                                      case 1:
                                          if (F.sent(),
                                          !this._image)
                                              return [2];
                                          M = this._options,
                                          p = M.imageOptions,
                                          m = M.qrOptions,
                                          d = p.imageSize * E[m.errorCorrectionLevel],
                                          S = Math.floor(d * f * f),
                                          g = function(Q) {
                                              var D = Q.originalHeight
                                                , X = Q.originalWidth
                                                , J = Q.maxHiddenDots
                                                , te = Q.maxHiddenAxisDots
                                                , ae = Q.dotSize
                                                , K = {
                                                  x: 0,
                                                  y: 0
                                              }
                                                , ne = {
                                                  x: 0,
                                                  y: 0
                                              };
                                              if (D <= 0 || X <= 0 || J <= 0 || ae <= 0)
                                                  return {
                                                      height: 0,
                                                      width: 0,
                                                      hideYDots: 0,
                                                      hideXDots: 0
                                                  };
                                              var ee = D / X;
                                              return K.x = Math.floor(Math.sqrt(J / ee)),
                                              K.x <= 0 && (K.x = 1),
                                              te && te < K.x && (K.x = te),
                                              K.x % 2 == 0 && K.x--,
                                              ne.x = K.x * ae,
                                              K.y = 1 + 2 * Math.ceil((K.x * ee - 1) / 2),
                                              ne.y = Math.round(ne.x * ee),
                                              (K.y * K.x > J || te && te < K.y) && (te && te < K.y ? (K.y = te,
                                              K.y % 2 == 0 && K.x--) : K.y -= 2,
                                              ne.y = K.y * ae,
                                              K.x = 1 + 2 * Math.ceil((K.y / ee - 1) / 2),
                                              ne.x = Math.round(ne.y / ee)),
                                              {
                                                  height: ne.y,
                                                  width: ne.x,
                                                  hideYDots: K.y,
                                                  hideXDots: K.x
                                              }
                                          }({
                                              originalWidth: this._image.width,
                                              originalHeight: this._image.height,
                                              maxHiddenDots: S,
                                              maxHiddenAxisDots: f - 14,
                                              dotSize: y
                                          }),
                                          F.label = 2;
                                      case 2:
                                          return this.drawBackground(),
                                          this.drawDots(function(Q, D) {
                                              var X, J, te, ae, K, ne;
                                              return !(C._options.imageOptions.hideBackgroundDots && Q >= (f - g.hideXDots) / 2 && Q < (f + g.hideXDots) / 2 && D >= (f - g.hideYDots) / 2 && D < (f + g.hideYDots) / 2 || !((X = q[Q]) === null || X === void 0) && X[D] || !((J = q[Q - f + 7]) === null || J === void 0) && J[D] || !((te = q[Q]) === null || te === void 0) && te[D - f + 7] || !((ae = G[Q]) === null || ae === void 0) && ae[D] || !((K = G[Q - f + 7]) === null || K === void 0) && K[D] || !((ne = G[Q]) === null || ne === void 0) && ne[D - f + 7])
                                          }),
                                          this.drawCorners(),
                                          this._options.image ? [4, this.drawImage({
                                              width: g.width,
                                              height: g.height,
                                              count: f,
                                              dotSize: y
                                          })] : [3, 4];
                                      case 3:
                                          F.sent(),
                                          F.label = 4;
                                      case 4:
                                          return [2]
                                      }
                                  })
                              })
                          }
                          ,
                          N.prototype.drawBackground = function() {
                              var u, f, c, h = this._element, y = this._options;
                              if (h) {
                                  var g = (u = y.backgroundOptions) === null || u === void 0 ? void 0 : u.gradient
                                    , M = (f = y.backgroundOptions) === null || f === void 0 ? void 0 : f.color;
                                  if ((g || M) && this._createColor({
                                      options: g,
                                      color: M,
                                      additionalRotation: 0,
                                      x: 0,
                                      y: 0,
                                      height: y.height,
                                      width: y.width,
                                      name: "background-color"
                                  }),
                                  (c = y.backgroundOptions) === null || c === void 0 ? void 0 : c.round) {
                                      var p = Math.min(y.width, y.height)
                                        , m = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                                      this._backgroundClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath"),
                                      this._backgroundClipPath.setAttribute("id", "clip-path-background-color"),
                                      this._defs.appendChild(this._backgroundClipPath),
                                      m.setAttribute("x", String((y.width - p) / 2)),
                                      m.setAttribute("y", String((y.height - p) / 2)),
                                      m.setAttribute("width", String(p)),
                                      m.setAttribute("height", String(p)),
                                      m.setAttribute("rx", String(p / 2 * y.backgroundOptions.round)),
                                      this._backgroundClipPath.appendChild(m)
                                  }
                              }
                          }
                          ,
                          N.prototype.drawDots = function(u) {
                              var f, c, h = this;
                              if (!this._qr)
                                  throw "QR code is not defined";
                              var y = this._options
                                , g = this._qr.getModuleCount();
                              if (g > y.width || g > y.height)
                                  throw "The canvas is too small.";
                              var M = Math.min(y.width, y.height) - 2 * y.margin
                                , p = y.shape === x ? M / Math.sqrt(2) : M
                                , m = Math.floor(p / g)
                                , d = Math.floor((y.width - g * m) / 2)
                                , S = Math.floor((y.height - g * m) / 2)
                                , C = new V({
                                  svg: this._element,
                                  type: y.dotsOptions.type
                              });
                              this._dotsClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath"),
                              this._dotsClipPath.setAttribute("id", "clip-path-dot-color"),
                              this._defs.appendChild(this._dotsClipPath),
                              this._createColor({
                                  options: (f = y.dotsOptions) === null || f === void 0 ? void 0 : f.gradient,
                                  color: y.dotsOptions.color,
                                  additionalRotation: 0,
                                  x: 0,
                                  y: 0,
                                  height: y.height,
                                  width: y.width,
                                  name: "dot-color"
                              });
                              for (var F = function(ke) {
                                  for (var oe = function(ce) {
                                      return u && !u(ke, ce) ? "continue" : !((c = Q._qr) === null || c === void 0) && c.isDark(ke, ce) ? (C.draw(d + ke * m, S + ce * m, m, function(Ee, ze) {
                                          return !(ke + Ee < 0 || ce + ze < 0 || ke + Ee >= g || ce + ze >= g) && !(u && !u(ke + Ee, ce + ze)) && !!h._qr && h._qr.isDark(ke + Ee, ce + ze)
                                      }),
                                      void (C._element && Q._dotsClipPath && Q._dotsClipPath.appendChild(C._element))) : "continue"
                                  }, Se = 0; Se < g; Se++)
                                      oe(Se)
                              }, Q = this, D = 0; D < g; D++)
                                  F(D);
                              if (y.shape === x) {
                                  var X = Math.floor((M / m - g) / 2)
                                    , J = g + 2 * X
                                    , te = d - X * m
                                    , ae = S - X * m
                                    , K = []
                                    , ne = Math.floor(J / 2);
                                  for (D = 0; D < J; D++) {
                                      K[D] = [];
                                      for (var ee = 0; ee < J; ee++)
                                          D >= X - 1 && D <= J - X && ee >= X - 1 && ee <= J - X || Math.sqrt((D - ne) * (D - ne) + (ee - ne) * (ee - ne)) > ne ? K[D][ee] = 0 : K[D][ee] = this._qr.isDark(ee - 2 * X < 0 ? ee : ee >= g ? ee - 2 * X : ee - X, D - 2 * X < 0 ? D : D >= g ? D - 2 * X : D - X) ? 1 : 0
                                  }
                                  var re = function(ke) {
                                      for (var oe = function(ce) {
                                          if (!K[ke][ce])
                                              return "continue";
                                          C.draw(te + ke * m, ae + ce * m, m, function(Ee, ze) {
                                              var Ie;
                                              return !!(!((Ie = K[ke + Ee]) === null || Ie === void 0) && Ie[ce + ze])
                                          }),
                                          C._element && Ye._dotsClipPath && Ye._dotsClipPath.appendChild(C._element)
                                      }, Se = 0; Se < J; Se++)
                                          oe(Se)
                                  }
                                    , Ye = this;
                                  for (D = 0; D < J; D++)
                                      re(D)
                              }
                          }
                          ,
                          N.prototype.drawCorners = function() {
                              var u = this;
                              if (!this._qr)
                                  throw "QR code is not defined";
                              var f = this._element
                                , c = this._options;
                              if (!f)
                                  throw "Element code is not defined";
                              var h = this._qr.getModuleCount()
                                , y = Math.min(c.width, c.height) - 2 * c.margin
                                , g = c.shape === x ? y / Math.sqrt(2) : y
                                , M = Math.floor(g / h)
                                , p = 7 * M
                                , m = 3 * M
                                , d = Math.floor((c.width - h * M) / 2)
                                , S = Math.floor((c.height - h * M) / 2);
                              [[0, 0, 0], [1, 0, Math.PI / 2], [0, 1, -Math.PI / 2]].forEach(function(C) {
                                  var F, Q, D, X, J, te, ae, K, ne, ee, re, Ye, ke = C[0], oe = C[1], Se = C[2], ce = d + ke * M * (h - 7), Ee = S + oe * M * (h - 7), ze = u._dotsClipPath, Ie = u._dotsClipPath;
                                  if ((!((F = c.cornersSquareOptions) === null || F === void 0) && F.gradient || !((Q = c.cornersSquareOptions) === null || Q === void 0) && Q.color) && ((ze = document.createElementNS("http://www.w3.org/2000/svg", "clipPath")).setAttribute("id", "clip-path-corners-square-color-" + ke + "-" + oe),
                                  u._defs.appendChild(ze),
                                  u._cornersSquareClipPath = u._cornersDotClipPath = Ie = ze,
                                  u._createColor({
                                      options: (D = c.cornersSquareOptions) === null || D === void 0 ? void 0 : D.gradient,
                                      color: (X = c.cornersSquareOptions) === null || X === void 0 ? void 0 : X.color,
                                      additionalRotation: Se,
                                      x: ce,
                                      y: Ee,
                                      height: p,
                                      width: p,
                                      name: "corners-square-color-" + ke + "-" + oe
                                  })),
                                  (J = c.cornersSquareOptions) === null || J === void 0 ? void 0 : J.type) {
                                      var Ze = new se({
                                          svg: u._element,
                                          type: c.cornersSquareOptions.type
                                      });
                                      Ze.draw(ce, Ee, p, Se),
                                      Ze._element && ze && ze.appendChild(Ze._element)
                                  } else
                                      for (var yn = new V({
                                          svg: u._element,
                                          type: c.dotsOptions.type
                                      }), Gd = function(It) {
                                          for (var Xi = function(Sn) {
                                              if (!(!((te = q[It]) === null || te === void 0) && te[Sn]))
                                                  return "continue";
                                              yn.draw(ce + It * M, Ee + Sn * M, M, function(Ki, Ji) {
                                                  var xn;
                                                  return !!(!((xn = q[It + Ki]) === null || xn === void 0) && xn[Sn + Ji])
                                              }),
                                              yn._element && ze && ze.appendChild(yn._element)
                                          }, kn = 0; kn < q[It].length; kn++)
                                              Xi(kn)
                                      }, wn = 0; wn < q.length; wn++)
                                          Gd(wn);
                                  if ((!((ae = c.cornersDotOptions) === null || ae === void 0) && ae.gradient || !((K = c.cornersDotOptions) === null || K === void 0) && K.color) && ((Ie = document.createElementNS("http://www.w3.org/2000/svg", "clipPath")).setAttribute("id", "clip-path-corners-dot-color-" + ke + "-" + oe),
                                  u._defs.appendChild(Ie),
                                  u._cornersDotClipPath = Ie,
                                  u._createColor({
                                      options: (ne = c.cornersDotOptions) === null || ne === void 0 ? void 0 : ne.gradient,
                                      color: (ee = c.cornersDotOptions) === null || ee === void 0 ? void 0 : ee.color,
                                      additionalRotation: Se,
                                      x: ce + 2 * M,
                                      y: Ee + 2 * M,
                                      height: m,
                                      width: m,
                                      name: "corners-dot-color-" + ke + "-" + oe
                                  })),
                                  (re = c.cornersDotOptions) === null || re === void 0 ? void 0 : re.type) {
                                      var Yi = new v({
                                          svg: u._element,
                                          type: c.cornersDotOptions.type
                                      });
                                      Yi.draw(ce + 2 * M, Ee + 2 * M, m, Se),
                                      Yi._element && Ie && Ie.appendChild(Yi._element)
                                  } else {
                                      yn = new V({
                                          svg: u._element,
                                          type: c.dotsOptions.type
                                      });
                                      var Yd = function(It) {
                                          for (var Xi = function(Sn) {
                                              if (!(!((Ye = G[It]) === null || Ye === void 0) && Ye[Sn]))
                                                  return "continue";
                                              yn.draw(ce + It * M, Ee + Sn * M, M, function(Ki, Ji) {
                                                  var xn;
                                                  return !!(!((xn = G[It + Ki]) === null || xn === void 0) && xn[Sn + Ji])
                                              }),
                                              yn._element && Ie && Ie.appendChild(yn._element)
                                          }, kn = 0; kn < G[It].length; kn++)
                                              Xi(kn)
                                      };
                                      for (wn = 0; wn < G.length; wn++)
                                          Yd(wn)
                                  }
                              })
                          }
                          ,
                          N.prototype.loadImage = function() {
                              var u = this;
                              return new Promise(function(f, c) {
                                  var h = u._options
                                    , y = new Image;
                                  if (!h.image)
                                      return c("Image is not defined");
                                  typeof h.imageOptions.crossOrigin == "string" && (y.crossOrigin = h.imageOptions.crossOrigin),
                                  u._image = y,
                                  y.onload = function() {
                                      f()
                                  }
                                  ,
                                  y.src = h.image
                              }
                              )
                          }
                          ,
                          N.prototype.drawImage = function(u) {
                              var f = u.width
                                , c = u.height
                                , h = u.count
                                , y = u.dotSize;
                              return j(this, void 0, void 0, function() {
                                  var g, M, p, m, d, S, C, F, Q;
                                  return $(this, function(D) {
                                      switch (D.label) {
                                      case 0:
                                          return g = this._options,
                                          M = Math.floor((g.width - h * y) / 2),
                                          p = Math.floor((g.height - h * y) / 2),
                                          m = M + g.imageOptions.margin + (h * y - f) / 2,
                                          d = p + g.imageOptions.margin + (h * y - c) / 2,
                                          S = f - 2 * g.imageOptions.margin,
                                          C = c - 2 * g.imageOptions.margin,
                                          (F = document.createElementNS("http://www.w3.org/2000/svg", "image")).setAttribute("x", String(m)),
                                          F.setAttribute("y", String(d)),
                                          F.setAttribute("width", S + "px"),
                                          F.setAttribute("height", C + "px"),
                                          [4, I(g.image || "")];
                                      case 1:
                                          return Q = D.sent(),
                                          F.setAttribute("href", Q || ""),
                                          this._element.appendChild(F),
                                          [2]
                                      }
                                  })
                              })
                          }
                          ,
                          N.prototype._createColor = function(u) {
                              var f = u.options
                                , c = u.color
                                , h = u.additionalRotation
                                , y = u.x
                                , g = u.y
                                , M = u.height
                                , p = u.width
                                , m = u.name
                                , d = p > M ? p : M
                                , S = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                              if (S.setAttribute("x", String(y)),
                              S.setAttribute("y", String(g)),
                              S.setAttribute("height", String(M)),
                              S.setAttribute("width", String(p)),
                              S.setAttribute("clip-path", "url('#clip-path-" + m + "')"),
                              f) {
                                  var C;
                                  if (f.type === "radial")
                                      (C = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient")).setAttribute("id", m),
                                      C.setAttribute("gradientUnits", "userSpaceOnUse"),
                                      C.setAttribute("fx", String(y + p / 2)),
                                      C.setAttribute("fy", String(g + M / 2)),
                                      C.setAttribute("cx", String(y + p / 2)),
                                      C.setAttribute("cy", String(g + M / 2)),
                                      C.setAttribute("r", String(d / 2));
                                  else {
                                      var F = ((f.rotation || 0) + h) % (2 * Math.PI)
                                        , Q = (F + 2 * Math.PI) % (2 * Math.PI)
                                        , D = y + p / 2
                                        , X = g + M / 2
                                        , J = y + p / 2
                                        , te = g + M / 2;
                                      Q >= 0 && Q <= .25 * Math.PI || Q > 1.75 * Math.PI && Q <= 2 * Math.PI ? (D -= p / 2,
                                      X -= M / 2 * Math.tan(F),
                                      J += p / 2,
                                      te += M / 2 * Math.tan(F)) : Q > .25 * Math.PI && Q <= .75 * Math.PI ? (X -= M / 2,
                                      D -= p / 2 / Math.tan(F),
                                      te += M / 2,
                                      J += p / 2 / Math.tan(F)) : Q > .75 * Math.PI && Q <= 1.25 * Math.PI ? (D += p / 2,
                                      X += M / 2 * Math.tan(F),
                                      J -= p / 2,
                                      te -= M / 2 * Math.tan(F)) : Q > 1.25 * Math.PI && Q <= 1.75 * Math.PI && (X += M / 2,
                                      D += p / 2 / Math.tan(F),
                                      te -= M / 2,
                                      J -= p / 2 / Math.tan(F)),
                                      (C = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient")).setAttribute("id", m),
                                      C.setAttribute("gradientUnits", "userSpaceOnUse"),
                                      C.setAttribute("x1", String(Math.round(D))),
                                      C.setAttribute("y1", String(Math.round(X))),
                                      C.setAttribute("x2", String(Math.round(J))),
                                      C.setAttribute("y2", String(Math.round(te)))
                                  }
                                  f.colorStops.forEach(function(ae) {
                                      var K = ae.offset
                                        , ne = ae.color
                                        , ee = document.createElementNS("http://www.w3.org/2000/svg", "stop");
                                      ee.setAttribute("offset", 100 * K + "%"),
                                      ee.setAttribute("stop-color", ne),
                                      C.appendChild(ee)
                                  }),
                                  S.setAttribute("fill", "url('#" + m + "')"),
                                  this._defs.appendChild(C)
                              } else
                                  c && S.setAttribute("fill", c);
                              this._element.appendChild(S)
                          }
                          ,
                          N
                      }()
                        , ye = "canvas";
                      for (var ie = {}, z = 0; z <= 40; z++)
                          ie[z] = z;
                      let T = {
                          type: ye,
                          shape: "square",
                          width: 300,
                          height: 300,
                          data: "",
                          margin: 0,
                          qrOptions: {
                              typeNumber: ie[0],
                              mode: void 0,
                              errorCorrectionLevel: "Q"
                          },
                          imageOptions: {
                              hideBackgroundDots: !0,
                              imageSize: .4,
                              crossOrigin: void 0,
                              margin: 0
                          },
                          dotsOptions: {
                              type: "square",
                              color: "#000"
                          },
                          backgroundOptions: {
                              round: 0,
                              color: "#fff"
                          }
                      };
                      var O = function() {
                          return (O = Object.assign || function(N) {
                              for (var u, f = 1, c = arguments.length; f < c; f++)
                                  for (var h in u = arguments[f])
                                      Object.prototype.hasOwnProperty.call(u, h) && (N[h] = u[h]);
                              return N
                          }
                          ).apply(this, arguments)
                      };
                      function P(N) {
                          var u = O({}, N);
                          if (!u.colorStops || !u.colorStops.length)
                              throw "Field 'colorStops' is required in gradient";
                          return u.rotation ? u.rotation = Number(u.rotation) : u.rotation = 0,
                          u.colorStops = u.colorStops.map(function(f) {
                              return O(O({}, f), {
                                  offset: Number(f.offset)
                              })
                          }),
                          u
                      }
                      function _(N) {
                          var u = O({}, N);
                          return u.width = Number(u.width),
                          u.height = Number(u.height),
                          u.margin = Number(u.margin),
                          u.imageOptions = O(O({}, u.imageOptions), {
                              hideBackgroundDots: !!u.imageOptions.hideBackgroundDots,
                              imageSize: Number(u.imageOptions.imageSize),
                              margin: Number(u.imageOptions.margin)
                          }),
                          u.margin > Math.min(u.width, u.height) && (u.margin = Math.min(u.width, u.height)),
                          u.dotsOptions = O({}, u.dotsOptions),
                          u.dotsOptions.gradient && (u.dotsOptions.gradient = P(u.dotsOptions.gradient)),
                          u.cornersSquareOptions && (u.cornersSquareOptions = O({}, u.cornersSquareOptions),
                          u.cornersSquareOptions.gradient && (u.cornersSquareOptions.gradient = P(u.cornersSquareOptions.gradient))),
                          u.cornersDotOptions && (u.cornersDotOptions = O({}, u.cornersDotOptions),
                          u.cornersDotOptions.gradient && (u.cornersDotOptions.gradient = P(u.cornersDotOptions.gradient))),
                          u.backgroundOptions && (u.backgroundOptions = O({}, u.backgroundOptions),
                          u.backgroundOptions.gradient && (u.backgroundOptions.gradient = P(u.backgroundOptions.gradient))),
                          u
                      }
                      var A = i(192)
                        , Z = i.n(A)
                        , H = function(N, u, f, c) {
                          return new (f || (f = Promise))(function(h, y) {
                              function g(m) {
                                  try {
                                      p(c.next(m))
                                  } catch (d) {
                                      y(d)
                                  }
                              }
                              function M(m) {
                                  try {
                                      p(c.throw(m))
                                  } catch (d) {
                                      y(d)
                                  }
                              }
                              function p(m) {
                                  var d;
                                  m.done ? h(m.value) : (d = m.value,
                                  d instanceof f ? d : new f(function(S) {
                                      S(d)
                                  }
                                  )).then(g, M)
                              }
                              p((c = c.apply(N, u || [])).next())
                          }
                          )
                      }
                        , Y = function(N, u) {
                          var f, c, h, y, g = {
                              label: 0,
                              sent: function() {
                                  if (1 & h[0])
                                      throw h[1];
                                  return h[1]
                              },
                              trys: [],
                              ops: []
                          };
                          return y = {
                              next: M(0),
                              throw: M(1),
                              return: M(2)
                          },
                          typeof Symbol == "function" && (y[Symbol.iterator] = function() {
                              return this
                          }
                          ),
                          y;
                          function M(p) {
                              return function(m) {
                                  return function(d) {
                                      if (f)
                                          throw new TypeError("Generator is already executing.");
                                      for (; g; )
                                          try {
                                              if (f = 1,
                                              c && (h = 2 & d[0] ? c.return : d[0] ? c.throw || ((h = c.return) && h.call(c),
                                              0) : c.next) && !(h = h.call(c, d[1])).done)
                                                  return h;
                                              switch (c = 0,
                                              h && (d = [2 & d[0], h.value]),
                                              d[0]) {
                                              case 0:
                                              case 1:
                                                  h = d;
                                                  break;
                                              case 4:
                                                  return g.label++,
                                                  {
                                                      value: d[1],
                                                      done: !1
                                                  };
                                              case 5:
                                                  g.label++,
                                                  c = d[1],
                                                  d = [0];
                                                  continue;
                                              case 7:
                                                  d = g.ops.pop(),
                                                  g.trys.pop();
                                                  continue;
                                              default:
                                                  if (!((h = (h = g.trys).length > 0 && h[h.length - 1]) || d[0] !== 6 && d[0] !== 2)) {
                                                      g = 0;
                                                      continue
                                                  }
                                                  if (d[0] === 3 && (!h || d[1] > h[0] && d[1] < h[3])) {
                                                      g.label = d[1];
                                                      break
                                                  }
                                                  if (d[0] === 6 && g.label < h[1]) {
                                                      g.label = h[1],
                                                      h = d;
                                                      break
                                                  }
                                                  if (h && g.label < h[2]) {
                                                      g.label = h[2],
                                                      g.ops.push(d);
                                                      break
                                                  }
                                                  h[2] && g.ops.pop(),
                                                  g.trys.pop();
                                                  continue
                                              }
                                              d = u.call(N, g)
                                          } catch (S) {
                                              d = [6, S],
                                              c = 0
                                          } finally {
                                              f = h = 0
                                          }
                                      if (5 & d[0])
                                          throw d[1];
                                      return {
                                          value: d[0] ? d[1] : void 0,
                                          done: !0
                                      }
                                  }([p, m])
                              }
                          }
                      };
                      let Le = function() {
                          function N(u) {
                              this._options = u ? _(k(T, u)) : T,
                              this.update()
                          }
                          return N._clearContainer = function(u) {
                              u && (u.innerHTML = "")
                          }
                          ,
                          N.prototype._setupSvg = function() {
                              var u = this;
                              if (this._qr) {
                                  var f = new b(this._options);
                                  this._svg = f.getElement(),
                                  this._svgDrawingPromise = f.drawQR(this._qr).then(function() {
                                      var c;
                                      u._svg && ((c = u._extension) === null || c === void 0 || c.call(u, f.getElement(), u._options))
                                  })
                              }
                          }
                          ,
                          N.prototype._setupCanvas = function() {
                              var u, f = this;
                              this._qr && (this._canvas = document.createElement("canvas"),
                              this._canvas.width = this._options.width,
                              this._canvas.height = this._options.height,
                              this._setupSvg(),
                              this._canvasDrawingPromise = (u = this._svgDrawingPromise) === null || u === void 0 ? void 0 : u.then(function() {
                                  if (f._svg) {
                                      var c = f._svg
                                        , h = new XMLSerializer().serializeToString(c)
                                        , y = "data:image/svg+xml;base64," + btoa(h)
                                        , g = new Image;
                                      return new Promise(function(M) {
                                          g.onload = function() {
                                              var p, m;
                                              (m = (p = f._canvas) === null || p === void 0 ? void 0 : p.getContext("2d")) === null || m === void 0 || m.drawImage(g, 0, 0),
                                              M()
                                          }
                                          ,
                                          g.src = y
                                      }
                                      )
                                  }
                              }))
                          }
                          ,
                          N.prototype._getElement = function(u) {
                              return u === void 0 && (u = "png"),
                              H(this, void 0, void 0, function() {
                                  return Y(this, function(f) {
                                      switch (f.label) {
                                      case 0:
                                          if (!this._qr)
                                              throw "QR code is empty";
                                          return u.toLowerCase() !== "svg" ? [3, 2] : (this._svg && this._svgDrawingPromise || this._setupSvg(),
                                          [4, this._svgDrawingPromise]);
                                      case 1:
                                          return f.sent(),
                                          [2, this._svg];
                                      case 2:
                                          return this._canvas && this._canvasDrawingPromise || this._setupCanvas(),
                                          [4, this._canvasDrawingPromise];
                                      case 3:
                                          return f.sent(),
                                          [2, this._canvas]
                                      }
                                  })
                              })
                          }
                          ,
                          N.prototype.update = function(u) {
                              N._clearContainer(this._container),
                              this._options = u ? _(k(this._options, u)) : this._options,
                              this._options.data && (this._qr = Z()(this._options.qrOptions.typeNumber, this._options.qrOptions.errorCorrectionLevel),
                              this._qr.addData(this._options.data, this._options.qrOptions.mode || function(f) {
                                  switch (!0) {
                                  case /^[0-9]*$/.test(f):
                                      return "Numeric";
                                  case /^[0-9A-Z $%*+\-./:]*$/.test(f):
                                      return "Alphanumeric";
                                  default:
                                      return "Byte"
                                  }
                              }(this._options.data)),
                              this._qr.make(),
                              this._options.type === ye ? this._setupCanvas() : this._setupSvg(),
                              this.append(this._container))
                          }
                          ,
                          N.prototype.append = function(u) {
                              if (u) {
                                  if (typeof u.appendChild != "function")
                                      throw "Container should be a single DOM node";
                                  this._options.type === ye ? this._canvas && u.appendChild(this._canvas) : this._svg && u.appendChild(this._svg),
                                  this._container = u
                              }
                          }
                          ,
                          N.prototype.applyExtension = function(u) {
                              if (!u)
                                  throw "Extension function should be defined.";
                              this._extension = u,
                              this.update()
                          }
                          ,
                          N.prototype.deleteExtension = function() {
                              this._extension = void 0,
                              this.update()
                          }
                          ,
                          N.prototype.getRawData = function(u) {
                              return u === void 0 && (u = "png"),
                              H(this, void 0, void 0, function() {
                                  var f, c, h;
                                  return Y(this, function(y) {
                                      switch (y.label) {
                                      case 0:
                                          if (!this._qr)
                                              throw "QR code is empty";
                                          return [4, this._getElement(u)];
                                      case 1:
                                          return (f = y.sent()) ? u.toLowerCase() === "svg" ? (c = new XMLSerializer,
                                          h = c.serializeToString(f),
                                          [2, new Blob([`<?xml version="1.0" standalone="no"?>\r
` + h],{
                                              type: "image/svg+xml"
                                          })]) : [2, new Promise(function(g) {
                                              return f.toBlob(g, "image/" + u, 1)
                                          }
                                          )] : [2, null]
                                      }
                                  })
                              })
                          }
                          ,
                          N.prototype.download = function(u) {
                              return H(this, void 0, void 0, function() {
                                  var f, c, h, y, g;
                                  return Y(this, function(M) {
                                      switch (M.label) {
                                      case 0:
                                          if (!this._qr)
                                              throw "QR code is empty";
                                          return f = "png",
                                          c = "qr",
                                          typeof u == "string" ? (f = u,
                                          console.warn("Extension is deprecated as argument for 'download' method, please pass object { name: '...', extension: '...' } as argument")) : typeof u == "object" && u !== null && (u.name && (c = u.name),
                                          u.extension && (f = u.extension)),
                                          [4, this._getElement(f)];
                                      case 1:
                                          return (h = M.sent()) ? (f.toLowerCase() === "svg" ? (y = new XMLSerializer,
                                          g = `<?xml version="1.0" standalone="no"?>\r
` + (g = y.serializeToString(h)),
                                          L("data:image/svg+xml;charset=utf-8," + encodeURIComponent(g), c + ".svg")) : L(h.toDataURL("image/" + f), c + "." + f),
                                          [2]) : [2]
                                      }
                                  })
                              })
                          }
                          ,
                          N
                      }()
                  }
              }
                , t = {};
              function n(r) {
                  if (t[r])
                      return t[r].exports;
                  var o = t[r] = {
                      exports: {}
                  };
                  return e[r](o, o.exports, n),
                  o.exports
              }
              return n.n = r=>{
                  var o = r && r.__esModule ? ()=>r.default : ()=>r;
                  return n.d(o, {
                      a: o
                  }),
                  o
              }
              ,
              n.d = (r,o)=>{
                  for (var i in o)
                      n.o(o, i) && !n.o(r, i) && Object.defineProperty(r, i, {
                          enumerable: !0,
                          get: o[i]
                      })
              }
              ,
              n.o = (r,o)=>Object.prototype.hasOwnProperty.call(r, o),
              n(676)
          }
          )().default
      })
  }
  );
  var Oa = qt(de=>{
      "use strict";
      function ml(e, t) {
          var n = e.length;
          e.push(t);
          e: for (; 0 < n; ) {
              var r = n - 1 >>> 1
                , o = e[r];
              if (0 < zo(o, t))
                  e[r] = t,
                  e[n] = o,
                  n = r;
              else
                  break e
          }
      }
      function yt(e) {
          return e.length === 0 ? null : e[0]
      }
      function Oo(e) {
          if (e.length === 0)
              return null;
          var t = e[0]
            , n = e.pop();
          if (n !== t) {
              e[0] = n;
              e: for (var r = 0, o = e.length, i = o >>> 1; r < i; ) {
                  var l = 2 * (r + 1) - 1
                    , s = e[l]
                    , a = l + 1
                    , k = e[a];
                  if (0 > zo(s, n))
                      a < o && 0 > zo(k, s) ? (e[r] = k,
                      e[a] = n,
                      r = a) : (e[r] = s,
                      e[l] = n,
                      r = l);
                  else if (a < o && 0 > zo(k, n))
                      e[r] = k,
                      e[a] = n,
                      r = a;
                  else
                      break e
              }
          }
          return t
      }
      function zo(e, t) {
          var n = e.sortIndex - t.sortIndex;
          return n !== 0 ? n : e.id - t.id
      }
      typeof performance == "object" && typeof performance.now == "function" ? (_a = performance,
      de.unstable_now = function() {
          return _a.now()
      }
      ) : (dl = Date,
      Ca = dl.now(),
      de.unstable_now = function() {
          return dl.now() - Ca
      }
      );
      var _a, dl, Ca, Mt = [], Xt = [], P1 = 1, st = null, Fe = 3, Io = !1, Cn = !1, Mr = !1, Ma = typeof setTimeout == "function" ? setTimeout : null, Pa = typeof clearTimeout == "function" ? clearTimeout : null, Ea = typeof setImmediate < "u" ? setImmediate : null;
      typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
      function vl(e) {
          for (var t = yt(Xt); t !== null; ) {
              if (t.callback === null)
                  Oo(Xt);
              else if (t.startTime <= e)
                  Oo(Xt),
                  t.sortIndex = t.expirationTime,
                  ml(Mt, t);
              else
                  break;
              t = yt(Xt)
          }
      }
      function gl(e) {
          if (Mr = !1,
          vl(e),
          !Cn)
              if (yt(Mt) !== null)
                  Cn = !0,
                  wl(yl);
              else {
                  var t = yt(Xt);
                  t !== null && kl(gl, t.startTime - e)
              }
      }
      function yl(e, t) {
          Cn = !1,
          Mr && (Mr = !1,
          Pa(Pr),
          Pr = -1),
          Io = !0;
          var n = Fe;
          try {
              for (vl(t),
              st = yt(Mt); st !== null && (!(st.expirationTime > t) || e && !Da()); ) {
                  var r = st.callback;
                  if (typeof r == "function") {
                      st.callback = null,
                      Fe = st.priorityLevel;
                      var o = r(st.expirationTime <= t);
                      t = de.unstable_now(),
                      typeof o == "function" ? st.callback = o : st === yt(Mt) && Oo(Mt),
                      vl(t)
                  } else
                      Oo(Mt);
                  st = yt(Mt)
              }
              if (st !== null)
                  var i = !0;
              else {
                  var l = yt(Xt);
                  l !== null && kl(gl, l.startTime - t),
                  i = !1
              }
              return i
          } finally {
              st = null,
              Fe = n,
              Io = !1
          }
      }
      var To = !1
        , Do = null
        , Pr = -1
        , La = 5
        , za = -1;
      function Da() {
          return !(de.unstable_now() - za < La)
      }
      function pl() {
          if (Do !== null) {
              var e = de.unstable_now();
              za = e;
              var t = !0;
              try {
                  t = Do(!0, e)
              } finally {
                  t ? Nr() : (To = !1,
                  Do = null)
              }
          } else
              To = !1
      }
      var Nr;
      typeof Ea == "function" ? Nr = function() {
          Ea(pl)
      }
      : typeof MessageChannel < "u" ? (hl = new MessageChannel,
      Na = hl.port2,
      hl.port1.onmessage = pl,
      Nr = function() {
          Na.postMessage(null)
      }
      ) : Nr = function() {
          Ma(pl, 0)
      }
      ;
      var hl, Na;
      function wl(e) {
          Do = e,
          To || (To = !0,
          Nr())
      }
      function kl(e, t) {
          Pr = Ma(function() {
              e(de.unstable_now())
          }, t)
      }
      de.unstable_IdlePriority = 5;
      de.unstable_ImmediatePriority = 1;
      de.unstable_LowPriority = 4;
      de.unstable_NormalPriority = 3;
      de.unstable_Profiling = null;
      de.unstable_UserBlockingPriority = 2;
      de.unstable_cancelCallback = function(e) {
          e.callback = null
      }
      ;
      de.unstable_continueExecution = function() {
          Cn || Io || (Cn = !0,
          wl(yl))
      }
      ;
      de.unstable_forceFrameRate = function(e) {
          0 > e || 125 < e ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : La = 0 < e ? Math.floor(1e3 / e) : 5
      }
      ;
      de.unstable_getCurrentPriorityLevel = function() {
          return Fe
      }
      ;
      de.unstable_getFirstCallbackNode = function() {
          return yt(Mt)
      }
      ;
      de.unstable_next = function(e) {
          switch (Fe) {
          case 1:
          case 2:
          case 3:
              var t = 3;
              break;
          default:
              t = Fe
          }
          var n = Fe;
          Fe = t;
          try {
              return e()
          } finally {
              Fe = n
          }
      }
      ;
      de.unstable_pauseExecution = function() {}
      ;
      de.unstable_requestPaint = function() {}
      ;
      de.unstable_runWithPriority = function(e, t) {
          switch (e) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
              break;
          default:
              e = 3
          }
          var n = Fe;
          Fe = e;
          try {
              return t()
          } finally {
              Fe = n
          }
      }
      ;
      de.unstable_scheduleCallback = function(e, t, n) {
          var r = de.unstable_now();
          switch (typeof n == "object" && n !== null ? (n = n.delay,
          n = typeof n == "number" && 0 < n ? r + n : r) : n = r,
          e) {
          case 1:
              var o = -1;
              break;
          case 2:
              o = 250;
              break;
          case 5:
              o = 1073741823;
              break;
          case 4:
              o = 1e4;
              break;
          default:
              o = 5e3
          }
          return o = n + o,
          e = {
              id: P1++,
              callback: t,
              priorityLevel: e,
              startTime: n,
              expirationTime: o,
              sortIndex: -1
          },
          n > r ? (e.sortIndex = n,
          ml(Xt, e),
          yt(Mt) === null && e === yt(Xt) && (Mr ? (Pa(Pr),
          Pr = -1) : Mr = !0,
          kl(gl, n - r))) : (e.sortIndex = o,
          ml(Mt, e),
          Cn || Io || (Cn = !0,
          wl(yl))),
          e
      }
      ;
      de.unstable_shouldYield = Da;
      de.unstable_wrapCallback = function(e) {
          var t = Fe;
          return function() {
              var n = Fe;
              Fe = t;
              try {
                  return e.apply(this, arguments)
              } finally {
                  Fe = n
              }
          }
      }
  }
  );
  var Ta = qt((dm,Ia)=>{
      "use strict";
      Ia.exports = Oa()
  }
  );
  var Hd = qt(lt=>{
      "use strict";
      var Hc = me()
        , ot = Ta();
      function B(e) {
          for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++)
              t += "&args[]=" + encodeURIComponent(arguments[n]);
          return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
      }
      var Vc = new Set
        , Xr = {};
      function jn(e, t) {
          fr(e, t),
          fr(e + "Capture", t)
      }
      function fr(e, t) {
          for (Xr[e] = t,
          e = 0; e < t.length; e++)
              Vc.add(t[e])
      }
      var Vt = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u")
        , Ql = Object.prototype.hasOwnProperty
        , L1 = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/
        , Aa = {}
        , Ra = {};
      function z1(e) {
          return Ql.call(Ra, e) ? !0 : Ql.call(Aa, e) ? !1 : L1.test(e) ? Ra[e] = !0 : (Aa[e] = !0,
          !1)
      }
      function D1(e, t, n, r) {
          if (n !== null && n.type === 0)
              return !1;
          switch (typeof t) {
          case "function":
          case "symbol":
              return !0;
          case "boolean":
              return r ? !1 : n !== null ? !n.acceptsBooleans : (e = e.toLowerCase().slice(0, 5),
              e !== "data-" && e !== "aria-");
          default:
              return !1
          }
      }
      function O1(e, t, n, r) {
          if (t === null || typeof t > "u" || D1(e, t, n, r))
              return !0;
          if (r)
              return !1;
          if (n !== null)
              switch (n.type) {
              case 3:
                  return !t;
              case 4:
                  return t === !1;
              case 5:
                  return isNaN(t);
              case 6:
                  return isNaN(t) || 1 > t
              }
          return !1
      }
      function Ge(e, t, n, r, o, i, l) {
          this.acceptsBooleans = t === 2 || t === 3 || t === 4,
          this.attributeName = r,
          this.attributeNamespace = o,
          this.mustUseProperty = n,
          this.propertyName = e,
          this.type = t,
          this.sanitizeURL = i,
          this.removeEmptyString = l
      }
      var Be = {};
      "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
          Be[e] = new Ge(e,0,!1,e,null,!1,!1)
      });
      [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
          var t = e[0];
          Be[t] = new Ge(t,1,!1,e[1],null,!1,!1)
      });
      ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
          Be[e] = new Ge(e,2,!1,e.toLowerCase(),null,!1,!1)
      });
      ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
          Be[e] = new Ge(e,2,!1,e,null,!1,!1)
      });
      "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
          Be[e] = new Ge(e,3,!1,e.toLowerCase(),null,!1,!1)
      });
      ["checked", "multiple", "muted", "selected"].forEach(function(e) {
          Be[e] = new Ge(e,3,!0,e,null,!1,!1)
      });
      ["capture", "download"].forEach(function(e) {
          Be[e] = new Ge(e,4,!1,e,null,!1,!1)
      });
      ["cols", "rows", "size", "span"].forEach(function(e) {
          Be[e] = new Ge(e,6,!1,e,null,!1,!1)
      });
      ["rowSpan", "start"].forEach(function(e) {
          Be[e] = new Ge(e,5,!1,e.toLowerCase(),null,!1,!1)
      });
      var Au = /[\-:]([a-z])/g;
      function Ru(e) {
          return e[1].toUpperCase()
      }
      "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
          var t = e.replace(Au, Ru);
          Be[t] = new Ge(t,1,!1,e,null,!1,!1)
      });
      "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
          var t = e.replace(Au, Ru);
          Be[t] = new Ge(t,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)
      });
      ["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
          var t = e.replace(Au, Ru);
          Be[t] = new Ge(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)
      });
      ["tabIndex", "crossOrigin"].forEach(function(e) {
          Be[e] = new Ge(e,1,!1,e.toLowerCase(),null,!1,!1)
      });
      Be.xlinkHref = new Ge("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);
      ["src", "href", "action", "formAction"].forEach(function(e) {
          Be[e] = new Ge(e,1,!1,e.toLowerCase(),null,!0,!0)
      });
      function ju(e, t, n, r) {
          var o = Be.hasOwnProperty(t) ? Be[t] : null;
          (o !== null ? o.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (O1(t, n, o, r) && (n = null),
          r || o === null ? z1(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : o.mustUseProperty ? e[o.propertyName] = n === null ? o.type === 3 ? !1 : "" : n : (t = o.attributeName,
          r = o.attributeNamespace,
          n === null ? e.removeAttribute(t) : (o = o.type,
          n = o === 3 || o === 4 && n === !0 ? "" : "" + n,
          r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))))
      }
      var $t = Hc.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
        , Ao = Symbol.for("react.element")
        , qn = Symbol.for("react.portal")
        , Gn = Symbol.for("react.fragment")
        , Bu = Symbol.for("react.strict_mode")
        , Zl = Symbol.for("react.profiler")
        , Qc = Symbol.for("react.provider")
        , Zc = Symbol.for("react.context")
        , Fu = Symbol.for("react.forward_ref")
        , Wl = Symbol.for("react.suspense")
        , $l = Symbol.for("react.suspense_list")
        , Uu = Symbol.for("react.memo")
        , Jt = Symbol.for("react.lazy");
      Symbol.for("react.scope");
      Symbol.for("react.debug_trace_mode");
      var Wc = Symbol.for("react.offscreen");
      Symbol.for("react.legacy_hidden");
      Symbol.for("react.cache");
      Symbol.for("react.tracing_marker");
      var ja = Symbol.iterator;
      function Lr(e) {
          return e === null || typeof e != "object" ? null : (e = ja && e[ja] || e["@@iterator"],
          typeof e == "function" ? e : null)
      }
      var Ce = Object.assign, Sl;
      function jr(e) {
          if (Sl === void 0)
              try {
                  throw Error()
              } catch (n) {
                  var t = n.stack.trim().match(/\n( *(at )?)/);
                  Sl = t && t[1] || ""
              }
          return `
` + Sl + e
      }
      var xl = !1;
      function _l(e, t) {
          if (!e || xl)
              return "";
          xl = !0;
          var n = Error.prepareStackTrace;
          Error.prepareStackTrace = void 0;
          try {
              if (t)
                  if (t = function() {
                      throw Error()
                  }
                  ,
                  Object.defineProperty(t.prototype, "props", {
                      set: function() {
                          throw Error()
                      }
                  }),
                  typeof Reflect == "object" && Reflect.construct) {
                      try {
                          Reflect.construct(t, [])
                      } catch (k) {
                          var r = k
                      }
                      Reflect.construct(e, [], t)
                  } else {
                      try {
                          t.call()
                      } catch (k) {
                          r = k
                      }
                      e.call(t.prototype)
                  }
              else {
                  try {
                      throw Error()
                  } catch (k) {
                      r = k
                  }
                  e()
              }
          } catch (k) {
              if (k && r && typeof k.stack == "string") {
                  for (var o = k.stack.split(`
`), i = r.stack.split(`
`), l = o.length - 1, s = i.length - 1; 1 <= l && 0 <= s && o[l] !== i[s]; )
                      s--;
                  for (; 1 <= l && 0 <= s; l--,
                  s--)
                      if (o[l] !== i[s]) {
                          if (l !== 1 || s !== 1)
                              do
                                  if (l--,
                                  s--,
                                  0 > s || o[l] !== i[s]) {
                                      var a = `
` + o[l].replace(" at new ", " at ");
                                      return e.displayName && a.includes("<anonymous>") && (a = a.replace("<anonymous>", e.displayName)),
                                      a
                                  }
                              while (1 <= l && 0 <= s);
                          break
                      }
              }
          } finally {
              xl = !1,
              Error.prepareStackTrace = n
          }
          return (e = e ? e.displayName || e.name : "") ? jr(e) : ""
      }
      function I1(e) {
          switch (e.tag) {
          case 5:
              return jr(e.type);
          case 16:
              return jr("Lazy");
          case 13:
              return jr("Suspense");
          case 19:
              return jr("SuspenseList");
          case 0:
          case 2:
          case 15:
              return e = _l(e.type, !1),
              e;
          case 11:
              return e = _l(e.type.render, !1),
              e;
          case 1:
              return e = _l(e.type, !0),
              e;
          default:
              return ""
          }
      }
      function ql(e) {
          if (e == null)
              return null;
          if (typeof e == "function")
              return e.displayName || e.name || null;
          if (typeof e == "string")
              return e;
          switch (e) {
          case Gn:
              return "Fragment";
          case qn:
              return "Portal";
          case Zl:
              return "Profiler";
          case Bu:
              return "StrictMode";
          case Wl:
              return "Suspense";
          case $l:
              return "SuspenseList"
          }
          if (typeof e == "object")
              switch (e.$$typeof) {
              case Zc:
                  return (e.displayName || "Context") + ".Consumer";
              case Qc:
                  return (e._context.displayName || "Context") + ".Provider";
              case Fu:
                  var t = e.render;
                  return e = e.displayName,
                  e || (e = t.displayName || t.name || "",
                  e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"),
                  e;
              case Uu:
                  return t = e.displayName || null,
                  t !== null ? t : ql(e.type) || "Memo";
              case Jt:
                  t = e._payload,
                  e = e._init;
                  try {
                      return ql(e(t))
                  } catch {}
              }
          return null
      }
      function T1(e) {
          var t = e.type;
          switch (e.tag) {
          case 24:
              return "Cache";
          case 9:
              return (t.displayName || "Context") + ".Consumer";
          case 10:
              return (t._context.displayName || "Context") + ".Provider";
          case 18:
              return "DehydratedFragment";
          case 11:
              return e = t.render,
              e = e.displayName || e.name || "",
              t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef");
          case 7:
              return "Fragment";
          case 5:
              return t;
          case 4:
              return "Portal";
          case 3:
              return "Root";
          case 6:
              return "Text";
          case 16:
              return ql(t);
          case 8:
              return t === Bu ? "StrictMode" : "Mode";
          case 22:
              return "Offscreen";
          case 12:
              return "Profiler";
          case 21:
              return "Scope";
          case 13:
              return "Suspense";
          case 19:
              return "SuspenseList";
          case 25:
              return "TracingMarker";
          case 1:
          case 0:
          case 17:
          case 2:
          case 14:
          case 15:
              if (typeof t == "function")
                  return t.displayName || t.name || null;
              if (typeof t == "string")
                  return t
          }
          return null
      }
      function pn(e) {
          switch (typeof e) {
          case "boolean":
          case "number":
          case "string":
          case "undefined":
              return e;
          case "object":
              return e;
          default:
              return ""
          }
      }
      function $c(e) {
          var t = e.type;
          return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio")
      }
      function A1(e) {
          var t = $c(e) ? "checked" : "value"
            , n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t)
            , r = "" + e[t];
          if (!e.hasOwnProperty(t) && typeof n < "u" && typeof n.get == "function" && typeof n.set == "function") {
              var o = n.get
                , i = n.set;
              return Object.defineProperty(e, t, {
                  configurable: !0,
                  get: function() {
                      return o.call(this)
                  },
                  set: function(l) {
                      r = "" + l,
                      i.call(this, l)
                  }
              }),
              Object.defineProperty(e, t, {
                  enumerable: n.enumerable
              }),
              {
                  getValue: function() {
                      return r
                  },
                  setValue: function(l) {
                      r = "" + l
                  },
                  stopTracking: function() {
                      e._valueTracker = null,
                      delete e[t]
                  }
              }
          }
      }
      function Ro(e) {
          e._valueTracker || (e._valueTracker = A1(e))
      }
      function qc(e) {
          if (!e)
              return !1;
          var t = e._valueTracker;
          if (!t)
              return !0;
          var n = t.getValue()
            , r = "";
          return e && (r = $c(e) ? e.checked ? "true" : "false" : e.value),
          e = r,
          e !== n ? (t.setValue(e),
          !0) : !1
      }
      function ci(e) {
          if (e = e || (typeof document < "u" ? document : void 0),
          typeof e > "u")
              return null;
          try {
              return e.activeElement || e.body
          } catch {
              return e.body
          }
      }
      function Gl(e, t) {
          var n = t.checked;
          return Ce({}, t, {
              defaultChecked: void 0,
              defaultValue: void 0,
              value: void 0,
              checked: n ?? e._wrapperState.initialChecked
          })
      }
      function Ba(e, t) {
          var n = t.defaultValue == null ? "" : t.defaultValue
            , r = t.checked != null ? t.checked : t.defaultChecked;
          n = pn(t.value != null ? t.value : n),
          e._wrapperState = {
              initialChecked: r,
              initialValue: n,
              controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null
          }
      }
      function Gc(e, t) {
          t = t.checked,
          t != null && ju(e, "checked", t, !1)
      }
      function Yl(e, t) {
          Gc(e, t);
          var n = pn(t.value)
            , r = t.type;
          if (n != null)
              r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
          else if (r === "submit" || r === "reset") {
              e.removeAttribute("value");
              return
          }
          t.hasOwnProperty("value") ? Xl(e, t.type, n) : t.hasOwnProperty("defaultValue") && Xl(e, t.type, pn(t.defaultValue)),
          t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked)
      }
      function Fa(e, t, n) {
          if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
              var r = t.type;
              if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null))
                  return;
              t = "" + e._wrapperState.initialValue,
              n || t === e.value || (e.value = t),
              e.defaultValue = t
          }
          n = e.name,
          n !== "" && (e.name = ""),
          e.defaultChecked = !!e._wrapperState.initialChecked,
          n !== "" && (e.name = n)
      }
      function Xl(e, t, n) {
          (t !== "number" || ci(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n))
      }
      var Br = Array.isArray;
      function ir(e, t, n, r) {
          if (e = e.options,
          t) {
              t = {};
              for (var o = 0; o < n.length; o++)
                  t["$" + n[o]] = !0;
              for (n = 0; n < e.length; n++)
                  o = t.hasOwnProperty("$" + e[n].value),
                  e[n].selected !== o && (e[n].selected = o),
                  o && r && (e[n].defaultSelected = !0)
          } else {
              for (n = "" + pn(n),
              t = null,
              o = 0; o < e.length; o++) {
                  if (e[o].value === n) {
                      e[o].selected = !0,
                      r && (e[o].defaultSelected = !0);
                      return
                  }
                  t !== null || e[o].disabled || (t = e[o])
              }
              t !== null && (t.selected = !0)
          }
      }
      function Kl(e, t) {
          if (t.dangerouslySetInnerHTML != null)
              throw Error(B(91));
          return Ce({}, t, {
              value: void 0,
              defaultValue: void 0,
              children: "" + e._wrapperState.initialValue
          })
      }
      function Ua(e, t) {
          var n = t.value;
          if (n == null) {
              if (n = t.children,
              t = t.defaultValue,
              n != null) {
                  if (t != null)
                      throw Error(B(92));
                  if (Br(n)) {
                      if (1 < n.length)
                          throw Error(B(93));
                      n = n[0]
                  }
                  t = n
              }
              t == null && (t = ""),
              n = t
          }
          e._wrapperState = {
              initialValue: pn(n)
          }
      }
      function Yc(e, t) {
          var n = pn(t.value)
            , r = pn(t.defaultValue);
          n != null && (n = "" + n,
          n !== e.value && (e.value = n),
          t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)),
          r != null && (e.defaultValue = "" + r)
      }
      function Ha(e) {
          var t = e.textContent;
          t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t)
      }
      function Xc(e) {
          switch (e) {
          case "svg":
              return "http://www.w3.org/2000/svg";
          case "math":
              return "http://www.w3.org/1998/Math/MathML";
          default:
              return "http://www.w3.org/1999/xhtml"
          }
      }
      function Jl(e, t) {
          return e == null || e === "http://www.w3.org/1999/xhtml" ? Xc(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e
      }
      var jo, Kc = function(e) {
          return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, o) {
              MSApp.execUnsafeLocalFunction(function() {
                  return e(t, n, r, o)
              })
          }
          : e
      }(function(e, t) {
          if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML"in e)
              e.innerHTML = t;
          else {
              for (jo = jo || document.createElement("div"),
              jo.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>",
              t = jo.firstChild; e.firstChild; )
                  e.removeChild(e.firstChild);
              for (; t.firstChild; )
                  e.appendChild(t.firstChild)
          }
      });
      function Kr(e, t) {
          if (t) {
              var n = e.firstChild;
              if (n && n === e.lastChild && n.nodeType === 3) {
                  n.nodeValue = t;
                  return
              }
          }
          e.textContent = t
      }
      var Hr = {
          animationIterationCount: !0,
          aspectRatio: !0,
          borderImageOutset: !0,
          borderImageSlice: !0,
          borderImageWidth: !0,
          boxFlex: !0,
          boxFlexGroup: !0,
          boxOrdinalGroup: !0,
          columnCount: !0,
          columns: !0,
          flex: !0,
          flexGrow: !0,
          flexPositive: !0,
          flexShrink: !0,
          flexNegative: !0,
          flexOrder: !0,
          gridArea: !0,
          gridRow: !0,
          gridRowEnd: !0,
          gridRowSpan: !0,
          gridRowStart: !0,
          gridColumn: !0,
          gridColumnEnd: !0,
          gridColumnSpan: !0,
          gridColumnStart: !0,
          fontWeight: !0,
          lineClamp: !0,
          lineHeight: !0,
          opacity: !0,
          order: !0,
          orphans: !0,
          tabSize: !0,
          widows: !0,
          zIndex: !0,
          zoom: !0,
          fillOpacity: !0,
          floodOpacity: !0,
          stopOpacity: !0,
          strokeDasharray: !0,
          strokeDashoffset: !0,
          strokeMiterlimit: !0,
          strokeOpacity: !0,
          strokeWidth: !0
      }
        , R1 = ["Webkit", "ms", "Moz", "O"];
      Object.keys(Hr).forEach(function(e) {
          R1.forEach(function(t) {
              t = t + e.charAt(0).toUpperCase() + e.substring(1),
              Hr[t] = Hr[e]
          })
      });
      function Jc(e, t, n) {
          return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || Hr.hasOwnProperty(e) && Hr[e] ? ("" + t).trim() : t + "px"
      }
      function bc(e, t) {
          e = e.style;
          for (var n in t)
              if (t.hasOwnProperty(n)) {
                  var r = n.indexOf("--") === 0
                    , o = Jc(n, t[n], r);
                  n === "float" && (n = "cssFloat"),
                  r ? e.setProperty(n, o) : e[n] = o
              }
      }
      var j1 = Ce({
          menuitem: !0
      }, {
          area: !0,
          base: !0,
          br: !0,
          col: !0,
          embed: !0,
          hr: !0,
          img: !0,
          input: !0,
          keygen: !0,
          link: !0,
          meta: !0,
          param: !0,
          source: !0,
          track: !0,
          wbr: !0
      });
      function bl(e, t) {
          if (t) {
              if (j1[e] && (t.children != null || t.dangerouslySetInnerHTML != null))
                  throw Error(B(137, e));
              if (t.dangerouslySetInnerHTML != null) {
                  if (t.children != null)
                      throw Error(B(60));
                  if (typeof t.dangerouslySetInnerHTML != "object" || !("__html"in t.dangerouslySetInnerHTML))
                      throw Error(B(61))
              }
              if (t.style != null && typeof t.style != "object")
                  throw Error(B(62))
          }
      }
      function eu(e, t) {
          if (e.indexOf("-") === -1)
              return typeof t.is == "string";
          switch (e) {
          case "annotation-xml":
          case "color-profile":
          case "font-face":
          case "font-face-src":
          case "font-face-uri":
          case "font-face-format":
          case "font-face-name":
          case "missing-glyph":
              return !1;
          default:
              return !0
          }
      }
      var tu = null;
      function Hu(e) {
          return e = e.target || e.srcElement || window,
          e.correspondingUseElement && (e = e.correspondingUseElement),
          e.nodeType === 3 ? e.parentNode : e
      }
      var nu = null
        , lr = null
        , ur = null;
      function Va(e) {
          if (e = vo(e)) {
              if (typeof nu != "function")
                  throw Error(B(280));
              var t = e.stateNode;
              t && (t = Bi(t),
              nu(e.stateNode, e.type, t))
          }
      }
      function ef(e) {
          lr ? ur ? ur.push(e) : ur = [e] : lr = e
      }
      function tf() {
          if (lr) {
              var e = lr
                , t = ur;
              if (ur = lr = null,
              Va(e),
              t)
                  for (e = 0; e < t.length; e++)
                      Va(t[e])
          }
      }
      function nf(e, t) {
          return e(t)
      }
      function rf() {}
      var Cl = !1;
      function of(e, t, n) {
          if (Cl)
              return e(t, n);
          Cl = !0;
          try {
              return nf(e, t, n)
          } finally {
              Cl = !1,
              (lr !== null || ur !== null) && (rf(),
              tf())
          }
      }
      function Jr(e, t) {
          var n = e.stateNode;
          if (n === null)
              return null;
          var r = Bi(n);
          if (r === null)
              return null;
          n = r[t];
          e: switch (t) {
          case "onClick":
          case "onClickCapture":
          case "onDoubleClick":
          case "onDoubleClickCapture":
          case "onMouseDown":
          case "onMouseDownCapture":
          case "onMouseMove":
          case "onMouseMoveCapture":
          case "onMouseUp":
          case "onMouseUpCapture":
          case "onMouseEnter":
              (r = !r.disabled) || (e = e.type,
              r = !(e === "button" || e === "input" || e === "select" || e === "textarea")),
              e = !r;
              break e;
          default:
              e = !1
          }
          if (e)
              return null;
          if (n && typeof n != "function")
              throw Error(B(231, t, typeof n));
          return n
      }
      var ru = !1;
      if (Vt)
          try {
              Wn = {},
              Object.defineProperty(Wn, "passive", {
                  get: function() {
                      ru = !0
                  }
              }),
              window.addEventListener("test", Wn, Wn),
              window.removeEventListener("test", Wn, Wn)
          } catch {
              ru = !1
          }
      var Wn;
      function B1(e, t, n, r, o, i, l, s, a) {
          var k = Array.prototype.slice.call(arguments, 3);
          try {
              t.apply(n, k)
          } catch (L) {
              this.onError(L)
          }
      }
      var Vr = !1
        , fi = null
        , di = !1
        , ou = null
        , F1 = {
          onError: function(e) {
              Vr = !0,
              fi = e
          }
      };
      function U1(e, t, n, r, o, i, l, s, a) {
          Vr = !1,
          fi = null,
          B1.apply(F1, arguments)
      }
      function H1(e, t, n, r, o, i, l, s, a) {
          if (U1.apply(this, arguments),
          Vr) {
              if (Vr) {
                  var k = fi;
                  Vr = !1,
                  fi = null
              } else
                  throw Error(B(198));
              di || (di = !0,
              ou = k)
          }
      }
      function Bn(e) {
          var t = e
            , n = e;
          if (e.alternate)
              for (; t.return; )
                  t = t.return;
          else {
              e = t;
              do
                  t = e,
                  t.flags & 4098 && (n = t.return),
                  e = t.return;
              while (e)
          }
          return t.tag === 3 ? n : null
      }
      function lf(e) {
          if (e.tag === 13) {
              var t = e.memoizedState;
              if (t === null && (e = e.alternate,
              e !== null && (t = e.memoizedState)),
              t !== null)
                  return t.dehydrated
          }
          return null
      }
      function Qa(e) {
          if (Bn(e) !== e)
              throw Error(B(188))
      }
      function V1(e) {
          var t = e.alternate;
          if (!t) {
              if (t = Bn(e),
              t === null)
                  throw Error(B(188));
              return t !== e ? null : e
          }
          for (var n = e, r = t; ; ) {
              var o = n.return;
              if (o === null)
                  break;
              var i = o.alternate;
              if (i === null) {
                  if (r = o.return,
                  r !== null) {
                      n = r;
                      continue
                  }
                  break
              }
              if (o.child === i.child) {
                  for (i = o.child; i; ) {
                      if (i === n)
                          return Qa(o),
                          e;
                      if (i === r)
                          return Qa(o),
                          t;
                      i = i.sibling
                  }
                  throw Error(B(188))
              }
              if (n.return !== r.return)
                  n = o,
                  r = i;
              else {
                  for (var l = !1, s = o.child; s; ) {
                      if (s === n) {
                          l = !0,
                          n = o,
                          r = i;
                          break
                      }
                      if (s === r) {
                          l = !0,
                          r = o,
                          n = i;
                          break
                      }
                      s = s.sibling
                  }
                  if (!l) {
                      for (s = i.child; s; ) {
                          if (s === n) {
                              l = !0,
                              n = i,
                              r = o;
                              break
                          }
                          if (s === r) {
                              l = !0,
                              r = i,
                              n = o;
                              break
                          }
                          s = s.sibling
                      }
                      if (!l)
                          throw Error(B(189))
                  }
              }
              if (n.alternate !== r)
                  throw Error(B(190))
          }
          if (n.tag !== 3)
              throw Error(B(188));
          return n.stateNode.current === n ? e : t
      }
      function uf(e) {
          return e = V1(e),
          e !== null ? sf(e) : null
      }
      function sf(e) {
          if (e.tag === 5 || e.tag === 6)
              return e;
          for (e = e.child; e !== null; ) {
              var t = sf(e);
              if (t !== null)
                  return t;
              e = e.sibling
          }
          return null
      }
      var af = ot.unstable_scheduleCallback
        , Za = ot.unstable_cancelCallback
        , Q1 = ot.unstable_shouldYield
        , Z1 = ot.unstable_requestPaint
        , Me = ot.unstable_now
        , W1 = ot.unstable_getCurrentPriorityLevel
        , Vu = ot.unstable_ImmediatePriority
        , cf = ot.unstable_UserBlockingPriority
        , pi = ot.unstable_NormalPriority
        , $1 = ot.unstable_LowPriority
        , ff = ot.unstable_IdlePriority
        , Ti = null
        , Dt = null;
      function q1(e) {
          if (Dt && typeof Dt.onCommitFiberRoot == "function")
              try {
                  Dt.onCommitFiberRoot(Ti, e, void 0, (e.current.flags & 128) === 128)
              } catch {}
      }
      var _t = Math.clz32 ? Math.clz32 : X1
        , G1 = Math.log
        , Y1 = Math.LN2;
      function X1(e) {
          return e >>>= 0,
          e === 0 ? 32 : 31 - (G1(e) / Y1 | 0) | 0
      }
      var Bo = 64
        , Fo = 4194304;
      function Fr(e) {
          switch (e & -e) {
          case 1:
              return 1;
          case 2:
              return 2;
          case 4:
              return 4;
          case 8:
              return 8;
          case 16:
              return 16;
          case 32:
              return 32;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
              return e & 4194240;
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
              return e & 130023424;
          case 134217728:
              return 134217728;
          case 268435456:
              return 268435456;
          case 536870912:
              return 536870912;
          case 1073741824:
              return 1073741824;
          default:
              return e
          }
      }
      function hi(e, t) {
          var n = e.pendingLanes;
          if (n === 0)
              return 0;
          var r = 0
            , o = e.suspendedLanes
            , i = e.pingedLanes
            , l = n & 268435455;
          if (l !== 0) {
              var s = l & ~o;
              s !== 0 ? r = Fr(s) : (i &= l,
              i !== 0 && (r = Fr(i)))
          } else
              l = n & ~o,
              l !== 0 ? r = Fr(l) : i !== 0 && (r = Fr(i));
          if (r === 0)
              return 0;
          if (t !== 0 && t !== r && !(t & o) && (o = r & -r,
          i = t & -t,
          o >= i || o === 16 && (i & 4194240) !== 0))
              return t;
          if (r & 4 && (r |= n & 16),
          t = e.entangledLanes,
          t !== 0)
              for (e = e.entanglements,
              t &= r; 0 < t; )
                  n = 31 - _t(t),
                  o = 1 << n,
                  r |= e[n],
                  t &= ~o;
          return r
      }
      function K1(e, t) {
          switch (e) {
          case 1:
          case 2:
          case 4:
              return t + 250;
          case 8:
          case 16:
          case 32:
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
              return t + 5e3;
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
              return -1;
          case 134217728:
          case 268435456:
          case 536870912:
          case 1073741824:
              return -1;
          default:
              return -1
          }
      }
      function J1(e, t) {
          for (var n = e.suspendedLanes, r = e.pingedLanes, o = e.expirationTimes, i = e.pendingLanes; 0 < i; ) {
              var l = 31 - _t(i)
                , s = 1 << l
                , a = o[l];
              a === -1 ? (!(s & n) || s & r) && (o[l] = K1(s, t)) : a <= t && (e.expiredLanes |= s),
              i &= ~s
          }
      }
      function iu(e) {
          return e = e.pendingLanes & -1073741825,
          e !== 0 ? e : e & 1073741824 ? 1073741824 : 0
      }
      function df() {
          var e = Bo;
          return Bo <<= 1,
          !(Bo & 4194240) && (Bo = 64),
          e
      }
      function El(e) {
          for (var t = [], n = 0; 31 > n; n++)
              t.push(e);
          return t
      }
      function ho(e, t, n) {
          e.pendingLanes |= t,
          t !== 536870912 && (e.suspendedLanes = 0,
          e.pingedLanes = 0),
          e = e.eventTimes,
          t = 31 - _t(t),
          e[t] = n
      }
      function b1(e, t) {
          var n = e.pendingLanes & ~t;
          e.pendingLanes = t,
          e.suspendedLanes = 0,
          e.pingedLanes = 0,
          e.expiredLanes &= t,
          e.mutableReadLanes &= t,
          e.entangledLanes &= t,
          t = e.entanglements;
          var r = e.eventTimes;
          for (e = e.expirationTimes; 0 < n; ) {
              var o = 31 - _t(n)
                , i = 1 << o;
              t[o] = 0,
              r[o] = -1,
              e[o] = -1,
              n &= ~i
          }
      }
      function Qu(e, t) {
          var n = e.entangledLanes |= t;
          for (e = e.entanglements; n; ) {
              var r = 31 - _t(n)
                , o = 1 << r;
              o & t | e[r] & t && (e[r] |= t),
              n &= ~o
          }
      }
      var fe = 0;
      function pf(e) {
          return e &= -e,
          1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1
      }
      var hf, Zu, mf, vf, gf, lu = !1, Uo = [], on = null, ln = null, un = null, br = new Map, eo = new Map, en = [], ep = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
      function Wa(e, t) {
          switch (e) {
          case "focusin":
          case "focusout":
              on = null;
              break;
          case "dragenter":
          case "dragleave":
              ln = null;
              break;
          case "mouseover":
          case "mouseout":
              un = null;
              break;
          case "pointerover":
          case "pointerout":
              br.delete(t.pointerId);
              break;
          case "gotpointercapture":
          case "lostpointercapture":
              eo.delete(t.pointerId)
          }
      }
      function zr(e, t, n, r, o, i) {
          return e === null || e.nativeEvent !== i ? (e = {
              blockedOn: t,
              domEventName: n,
              eventSystemFlags: r,
              nativeEvent: i,
              targetContainers: [o]
          },
          t !== null && (t = vo(t),
          t !== null && Zu(t)),
          e) : (e.eventSystemFlags |= r,
          t = e.targetContainers,
          o !== null && t.indexOf(o) === -1 && t.push(o),
          e)
      }
      function tp(e, t, n, r, o) {
          switch (t) {
          case "focusin":
              return on = zr(on, e, t, n, r, o),
              !0;
          case "dragenter":
              return ln = zr(ln, e, t, n, r, o),
              !0;
          case "mouseover":
              return un = zr(un, e, t, n, r, o),
              !0;
          case "pointerover":
              var i = o.pointerId;
              return br.set(i, zr(br.get(i) || null, e, t, n, r, o)),
              !0;
          case "gotpointercapture":
              return i = o.pointerId,
              eo.set(i, zr(eo.get(i) || null, e, t, n, r, o)),
              !0
          }
          return !1
      }
      function yf(e) {
          var t = Mn(e.target);
          if (t !== null) {
              var n = Bn(t);
              if (n !== null) {
                  if (t = n.tag,
                  t === 13) {
                      if (t = lf(n),
                      t !== null) {
                          e.blockedOn = t,
                          gf(e.priority, function() {
                              mf(n)
                          });
                          return
                      }
                  } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
                      e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
                      return
                  }
              }
          }
          e.blockedOn = null
      }
      function ei(e) {
          if (e.blockedOn !== null)
              return !1;
          for (var t = e.targetContainers; 0 < t.length; ) {
              var n = uu(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
              if (n === null) {
                  n = e.nativeEvent;
                  var r = new n.constructor(n.type,n);
                  tu = r,
                  n.target.dispatchEvent(r),
                  tu = null
              } else
                  return t = vo(n),
                  t !== null && Zu(t),
                  e.blockedOn = n,
                  !1;
              t.shift()
          }
          return !0
      }
      function $a(e, t, n) {
          ei(e) && n.delete(t)
      }
      function np() {
          lu = !1,
          on !== null && ei(on) && (on = null),
          ln !== null && ei(ln) && (ln = null),
          un !== null && ei(un) && (un = null),
          br.forEach($a),
          eo.forEach($a)
      }
      function Dr(e, t) {
          e.blockedOn === t && (e.blockedOn = null,
          lu || (lu = !0,
          ot.unstable_scheduleCallback(ot.unstable_NormalPriority, np)))
      }
      function to(e) {
          function t(o) {
              return Dr(o, e)
          }
          if (0 < Uo.length) {
              Dr(Uo[0], e);
              for (var n = 1; n < Uo.length; n++) {
                  var r = Uo[n];
                  r.blockedOn === e && (r.blockedOn = null)
              }
          }
          for (on !== null && Dr(on, e),
          ln !== null && Dr(ln, e),
          un !== null && Dr(un, e),
          br.forEach(t),
          eo.forEach(t),
          n = 0; n < en.length; n++)
              r = en[n],
              r.blockedOn === e && (r.blockedOn = null);
          for (; 0 < en.length && (n = en[0],
          n.blockedOn === null); )
              yf(n),
              n.blockedOn === null && en.shift()
      }
      var sr = $t.ReactCurrentBatchConfig
        , mi = !0;
      function rp(e, t, n, r) {
          var o = fe
            , i = sr.transition;
          sr.transition = null;
          try {
              fe = 1,
              Wu(e, t, n, r)
          } finally {
              fe = o,
              sr.transition = i
          }
      }
      function op(e, t, n, r) {
          var o = fe
            , i = sr.transition;
          sr.transition = null;
          try {
              fe = 4,
              Wu(e, t, n, r)
          } finally {
              fe = o,
              sr.transition = i
          }
      }
      function Wu(e, t, n, r) {
          if (mi) {
              var o = uu(e, t, n, r);
              if (o === null)
                  Ol(e, t, r, vi, n),
                  Wa(e, r);
              else if (tp(o, e, t, n, r))
                  r.stopPropagation();
              else if (Wa(e, r),
              t & 4 && -1 < ep.indexOf(e)) {
                  for (; o !== null; ) {
                      var i = vo(o);
                      if (i !== null && hf(i),
                      i = uu(e, t, n, r),
                      i === null && Ol(e, t, r, vi, n),
                      i === o)
                          break;
                      o = i
                  }
                  o !== null && r.stopPropagation()
              } else
                  Ol(e, t, r, null, n)
          }
      }
      var vi = null;
      function uu(e, t, n, r) {
          if (vi = null,
          e = Hu(r),
          e = Mn(e),
          e !== null)
              if (t = Bn(e),
              t === null)
                  e = null;
              else if (n = t.tag,
              n === 13) {
                  if (e = lf(t),
                  e !== null)
                      return e;
                  e = null
              } else if (n === 3) {
                  if (t.stateNode.current.memoizedState.isDehydrated)
                      return t.tag === 3 ? t.stateNode.containerInfo : null;
                  e = null
              } else
                  t !== e && (e = null);
          return vi = e,
          null
      }
      function wf(e) {
          switch (e) {
          case "cancel":
          case "click":
          case "close":
          case "contextmenu":
          case "copy":
          case "cut":
          case "auxclick":
          case "dblclick":
          case "dragend":
          case "dragstart":
          case "drop":
          case "focusin":
          case "focusout":
          case "input":
          case "invalid":
          case "keydown":
          case "keypress":
          case "keyup":
          case "mousedown":
          case "mouseup":
          case "paste":
          case "pause":
          case "play":
          case "pointercancel":
          case "pointerdown":
          case "pointerup":
          case "ratechange":
          case "reset":
          case "resize":
          case "seeked":
          case "submit":
          case "touchcancel":
          case "touchend":
          case "touchstart":
          case "volumechange":
          case "change":
          case "selectionchange":
          case "textInput":
          case "compositionstart":
          case "compositionend":
          case "compositionupdate":
          case "beforeblur":
          case "afterblur":
          case "beforeinput":
          case "blur":
          case "fullscreenchange":
          case "focus":
          case "hashchange":
          case "popstate":
          case "select":
          case "selectstart":
              return 1;
          case "drag":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "mousemove":
          case "mouseout":
          case "mouseover":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "scroll":
          case "toggle":
          case "touchmove":
          case "wheel":
          case "mouseenter":
          case "mouseleave":
          case "pointerenter":
          case "pointerleave":
              return 4;
          case "message":
              switch (W1()) {
              case Vu:
                  return 1;
              case cf:
                  return 4;
              case pi:
              case $1:
                  return 16;
              case ff:
                  return 536870912;
              default:
                  return 16
              }
          default:
              return 16
          }
      }
      var nn = null
        , $u = null
        , ti = null;
      function kf() {
          if (ti)
              return ti;
          var e, t = $u, n = t.length, r, o = "value"in nn ? nn.value : nn.textContent, i = o.length;
          for (e = 0; e < n && t[e] === o[e]; e++)
              ;
          var l = n - e;
          for (r = 1; r <= l && t[n - r] === o[i - r]; r++)
              ;
          return ti = o.slice(e, 1 < r ? 1 - r : void 0)
      }
      function ni(e) {
          var t = e.keyCode;
          return "charCode"in e ? (e = e.charCode,
          e === 0 && t === 13 && (e = 13)) : e = t,
          e === 10 && (e = 13),
          32 <= e || e === 13 ? e : 0
      }
      function Ho() {
          return !0
      }
      function qa() {
          return !1
      }
      function it(e) {
          function t(n, r, o, i, l) {
              this._reactName = n,
              this._targetInst = o,
              this.type = r,
              this.nativeEvent = i,
              this.target = l,
              this.currentTarget = null;
              for (var s in e)
                  e.hasOwnProperty(s) && (n = e[s],
                  this[s] = n ? n(i) : i[s]);
              return this.isDefaultPrevented = (i.defaultPrevented != null ? i.defaultPrevented : i.returnValue === !1) ? Ho : qa,
              this.isPropagationStopped = qa,
              this
          }
          return Ce(t.prototype, {
              preventDefault: function() {
                  this.defaultPrevented = !0;
                  var n = this.nativeEvent;
                  n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1),
                  this.isDefaultPrevented = Ho)
              },
              stopPropagation: function() {
                  var n = this.nativeEvent;
                  n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
                  this.isPropagationStopped = Ho)
              },
              persist: function() {},
              isPersistent: Ho
          }),
          t
      }
      var yr = {
          eventPhase: 0,
          bubbles: 0,
          cancelable: 0,
          timeStamp: function(e) {
              return e.timeStamp || Date.now()
          },
          defaultPrevented: 0,
          isTrusted: 0
      }, qu = it(yr), mo = Ce({}, yr, {
          view: 0,
          detail: 0
      }), ip = it(mo), Nl, Ml, Or, Ai = Ce({}, mo, {
          screenX: 0,
          screenY: 0,
          clientX: 0,
          clientY: 0,
          pageX: 0,
          pageY: 0,
          ctrlKey: 0,
          shiftKey: 0,
          altKey: 0,
          metaKey: 0,
          getModifierState: Gu,
          button: 0,
          buttons: 0,
          relatedTarget: function(e) {
              return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget
          },
          movementX: function(e) {
              return "movementX"in e ? e.movementX : (e !== Or && (Or && e.type === "mousemove" ? (Nl = e.screenX - Or.screenX,
              Ml = e.screenY - Or.screenY) : Ml = Nl = 0,
              Or = e),
              Nl)
          },
          movementY: function(e) {
              return "movementY"in e ? e.movementY : Ml
          }
      }), Ga = it(Ai), lp = Ce({}, Ai, {
          dataTransfer: 0
      }), up = it(lp), sp = Ce({}, mo, {
          relatedTarget: 0
      }), Pl = it(sp), ap = Ce({}, yr, {
          animationName: 0,
          elapsedTime: 0,
          pseudoElement: 0
      }), cp = it(ap), fp = Ce({}, yr, {
          clipboardData: function(e) {
              return "clipboardData"in e ? e.clipboardData : window.clipboardData
          }
      }), dp = it(fp), pp = Ce({}, yr, {
          data: 0
      }), Ya = it(pp), hp = {
          Esc: "Escape",
          Spacebar: " ",
          Left: "ArrowLeft",
          Up: "ArrowUp",
          Right: "ArrowRight",
          Down: "ArrowDown",
          Del: "Delete",
          Win: "OS",
          Menu: "ContextMenu",
          Apps: "ContextMenu",
          Scroll: "ScrollLock",
          MozPrintableKey: "Unidentified"
      }, mp = {
          8: "Backspace",
          9: "Tab",
          12: "Clear",
          13: "Enter",
          16: "Shift",
          17: "Control",
          18: "Alt",
          19: "Pause",
          20: "CapsLock",
          27: "Escape",
          32: " ",
          33: "PageUp",
          34: "PageDown",
          35: "End",
          36: "Home",
          37: "ArrowLeft",
          38: "ArrowUp",
          39: "ArrowRight",
          40: "ArrowDown",
          45: "Insert",
          46: "Delete",
          112: "F1",
          113: "F2",
          114: "F3",
          115: "F4",
          116: "F5",
          117: "F6",
          118: "F7",
          119: "F8",
          120: "F9",
          121: "F10",
          122: "F11",
          123: "F12",
          144: "NumLock",
          145: "ScrollLock",
          224: "Meta"
      }, vp = {
          Alt: "altKey",
          Control: "ctrlKey",
          Meta: "metaKey",
          Shift: "shiftKey"
      };
      function gp(e) {
          var t = this.nativeEvent;
          return t.getModifierState ? t.getModifierState(e) : (e = vp[e]) ? !!t[e] : !1
      }
      function Gu() {
          return gp
      }
      var yp = Ce({}, mo, {
          key: function(e) {
              if (e.key) {
                  var t = hp[e.key] || e.key;
                  if (t !== "Unidentified")
                      return t
              }
              return e.type === "keypress" ? (e = ni(e),
              e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? mp[e.keyCode] || "Unidentified" : ""
          },
          code: 0,
          location: 0,
          ctrlKey: 0,
          shiftKey: 0,
          altKey: 0,
          metaKey: 0,
          repeat: 0,
          locale: 0,
          getModifierState: Gu,
          charCode: function(e) {
              return e.type === "keypress" ? ni(e) : 0
          },
          keyCode: function(e) {
              return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0
          },
          which: function(e) {
              return e.type === "keypress" ? ni(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0
          }
      })
        , wp = it(yp)
        , kp = Ce({}, Ai, {
          pointerId: 0,
          width: 0,
          height: 0,
          pressure: 0,
          tangentialPressure: 0,
          tiltX: 0,
          tiltY: 0,
          twist: 0,
          pointerType: 0,
          isPrimary: 0
      })
        , Xa = it(kp)
        , Sp = Ce({}, mo, {
          touches: 0,
          targetTouches: 0,
          changedTouches: 0,
          altKey: 0,
          metaKey: 0,
          ctrlKey: 0,
          shiftKey: 0,
          getModifierState: Gu
      })
        , xp = it(Sp)
        , _p = Ce({}, yr, {
          propertyName: 0,
          elapsedTime: 0,
          pseudoElement: 0
      })
        , Cp = it(_p)
        , Ep = Ce({}, Ai, {
          deltaX: function(e) {
              return "deltaX"in e ? e.deltaX : "wheelDeltaX"in e ? -e.wheelDeltaX : 0
          },
          deltaY: function(e) {
              return "deltaY"in e ? e.deltaY : "wheelDeltaY"in e ? -e.wheelDeltaY : "wheelDelta"in e ? -e.wheelDelta : 0
          },
          deltaZ: 0,
          deltaMode: 0
      })
        , Np = it(Ep)
        , Mp = [9, 13, 27, 32]
        , Yu = Vt && "CompositionEvent"in window
        , Qr = null;
      Vt && "documentMode"in document && (Qr = document.documentMode);
      var Pp = Vt && "TextEvent"in window && !Qr
        , Sf = Vt && (!Yu || Qr && 8 < Qr && 11 >= Qr)
        , Ka = String.fromCharCode(32)
        , Ja = !1;
      function xf(e, t) {
          switch (e) {
          case "keyup":
              return Mp.indexOf(t.keyCode) !== -1;
          case "keydown":
              return t.keyCode !== 229;
          case "keypress":
          case "mousedown":
          case "focusout":
              return !0;
          default:
              return !1
          }
      }
      function _f(e) {
          return e = e.detail,
          typeof e == "object" && "data"in e ? e.data : null
      }
      var Yn = !1;
      function Lp(e, t) {
          switch (e) {
          case "compositionend":
              return _f(t);
          case "keypress":
              return t.which !== 32 ? null : (Ja = !0,
              Ka);
          case "textInput":
              return e = t.data,
              e === Ka && Ja ? null : e;
          default:
              return null
          }
      }
      function zp(e, t) {
          if (Yn)
              return e === "compositionend" || !Yu && xf(e, t) ? (e = kf(),
              ti = $u = nn = null,
              Yn = !1,
              e) : null;
          switch (e) {
          case "paste":
              return null;
          case "keypress":
              if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
                  if (t.char && 1 < t.char.length)
                      return t.char;
                  if (t.which)
                      return String.fromCharCode(t.which)
              }
              return null;
          case "compositionend":
              return Sf && t.locale !== "ko" ? null : t.data;
          default:
              return null
          }
      }
      var Dp = {
          color: !0,
          date: !0,
          datetime: !0,
          "datetime-local": !0,
          email: !0,
          month: !0,
          number: !0,
          password: !0,
          range: !0,
          search: !0,
          tel: !0,
          text: !0,
          time: !0,
          url: !0,
          week: !0
      };
      function ba(e) {
          var t = e && e.nodeName && e.nodeName.toLowerCase();
          return t === "input" ? !!Dp[e.type] : t === "textarea"
      }
      function Cf(e, t, n, r) {
          ef(r),
          t = gi(t, "onChange"),
          0 < t.length && (n = new qu("onChange","change",null,n,r),
          e.push({
              event: n,
              listeners: t
          }))
      }
      var Zr = null
        , no = null;
      function Op(e) {
          Af(e, 0)
      }
      function Ri(e) {
          var t = Jn(e);
          if (qc(t))
              return e
      }
      function Ip(e, t) {
          if (e === "change")
              return t
      }
      var Ef = !1;
      Vt && (Vt ? (Qo = "oninput"in document,
      Qo || (Ll = document.createElement("div"),
      Ll.setAttribute("oninput", "return;"),
      Qo = typeof Ll.oninput == "function"),
      Vo = Qo) : Vo = !1,
      Ef = Vo && (!document.documentMode || 9 < document.documentMode));
      var Vo, Qo, Ll;
      function ec() {
          Zr && (Zr.detachEvent("onpropertychange", Nf),
          no = Zr = null)
      }
      function Nf(e) {
          if (e.propertyName === "value" && Ri(no)) {
              var t = [];
              Cf(t, no, e, Hu(e)),
              of(Op, t)
          }
      }
      function Tp(e, t, n) {
          e === "focusin" ? (ec(),
          Zr = t,
          no = n,
          Zr.attachEvent("onpropertychange", Nf)) : e === "focusout" && ec()
      }
      function Ap(e) {
          if (e === "selectionchange" || e === "keyup" || e === "keydown")
              return Ri(no)
      }
      function Rp(e, t) {
          if (e === "click")
              return Ri(t)
      }
      function jp(e, t) {
          if (e === "input" || e === "change")
              return Ri(t)
      }
      function Bp(e, t) {
          return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t
      }
      var Et = typeof Object.is == "function" ? Object.is : Bp;
      function ro(e, t) {
          if (Et(e, t))
              return !0;
          if (typeof e != "object" || e === null || typeof t != "object" || t === null)
              return !1;
          var n = Object.keys(e)
            , r = Object.keys(t);
          if (n.length !== r.length)
              return !1;
          for (r = 0; r < n.length; r++) {
              var o = n[r];
              if (!Ql.call(t, o) || !Et(e[o], t[o]))
                  return !1
          }
          return !0
      }
      function tc(e) {
          for (; e && e.firstChild; )
              e = e.firstChild;
          return e
      }
      function nc(e, t) {
          var n = tc(e);
          e = 0;
          for (var r; n; ) {
              if (n.nodeType === 3) {
                  if (r = e + n.textContent.length,
                  e <= t && r >= t)
                      return {
                          node: n,
                          offset: t - e
                      };
                  e = r
              }
              e: {
                  for (; n; ) {
                      if (n.nextSibling) {
                          n = n.nextSibling;
                          break e
                      }
                      n = n.parentNode
                  }
                  n = void 0
              }
              n = tc(n)
          }
      }
      function Mf(e, t) {
          return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Mf(e, t.parentNode) : "contains"in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1
      }
      function Pf() {
          for (var e = window, t = ci(); t instanceof e.HTMLIFrameElement; ) {
              try {
                  var n = typeof t.contentWindow.location.href == "string"
              } catch {
                  n = !1
              }
              if (n)
                  e = t.contentWindow;
              else
                  break;
              t = ci(e.document)
          }
          return t
      }
      function Xu(e) {
          var t = e && e.nodeName && e.nodeName.toLowerCase();
          return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true")
      }
      function Fp(e) {
          var t = Pf()
            , n = e.focusedElem
            , r = e.selectionRange;
          if (t !== n && n && n.ownerDocument && Mf(n.ownerDocument.documentElement, n)) {
              if (r !== null && Xu(n)) {
                  if (t = r.start,
                  e = r.end,
                  e === void 0 && (e = t),
                  "selectionStart"in n)
                      n.selectionStart = t,
                      n.selectionEnd = Math.min(e, n.value.length);
                  else if (e = (t = n.ownerDocument || document) && t.defaultView || window,
                  e.getSelection) {
                      e = e.getSelection();
                      var o = n.textContent.length
                        , i = Math.min(r.start, o);
                      r = r.end === void 0 ? i : Math.min(r.end, o),
                      !e.extend && i > r && (o = r,
                      r = i,
                      i = o),
                      o = nc(n, i);
                      var l = nc(n, r);
                      o && l && (e.rangeCount !== 1 || e.anchorNode !== o.node || e.anchorOffset !== o.offset || e.focusNode !== l.node || e.focusOffset !== l.offset) && (t = t.createRange(),
                      t.setStart(o.node, o.offset),
                      e.removeAllRanges(),
                      i > r ? (e.addRange(t),
                      e.extend(l.node, l.offset)) : (t.setEnd(l.node, l.offset),
                      e.addRange(t)))
                  }
              }
              for (t = [],
              e = n; e = e.parentNode; )
                  e.nodeType === 1 && t.push({
                      element: e,
                      left: e.scrollLeft,
                      top: e.scrollTop
                  });
              for (typeof n.focus == "function" && n.focus(),
              n = 0; n < t.length; n++)
                  e = t[n],
                  e.element.scrollLeft = e.left,
                  e.element.scrollTop = e.top
          }
      }
      var Up = Vt && "documentMode"in document && 11 >= document.documentMode
        , Xn = null
        , su = null
        , Wr = null
        , au = !1;
      function rc(e, t, n) {
          var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
          au || Xn == null || Xn !== ci(r) || (r = Xn,
          "selectionStart"in r && Xu(r) ? r = {
              start: r.selectionStart,
              end: r.selectionEnd
          } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(),
          r = {
              anchorNode: r.anchorNode,
              anchorOffset: r.anchorOffset,
              focusNode: r.focusNode,
              focusOffset: r.focusOffset
          }),
          Wr && ro(Wr, r) || (Wr = r,
          r = gi(su, "onSelect"),
          0 < r.length && (t = new qu("onSelect","select",null,t,n),
          e.push({
              event: t,
              listeners: r
          }),
          t.target = Xn)))
      }
      function Zo(e, t) {
          var n = {};
          return n[e.toLowerCase()] = t.toLowerCase(),
          n["Webkit" + e] = "webkit" + t,
          n["Moz" + e] = "moz" + t,
          n
      }
      var Kn = {
          animationend: Zo("Animation", "AnimationEnd"),
          animationiteration: Zo("Animation", "AnimationIteration"),
          animationstart: Zo("Animation", "AnimationStart"),
          transitionend: Zo("Transition", "TransitionEnd")
      }
        , zl = {}
        , Lf = {};
      Vt && (Lf = document.createElement("div").style,
      "AnimationEvent"in window || (delete Kn.animationend.animation,
      delete Kn.animationiteration.animation,
      delete Kn.animationstart.animation),
      "TransitionEvent"in window || delete Kn.transitionend.transition);
      function ji(e) {
          if (zl[e])
              return zl[e];
          if (!Kn[e])
              return e;
          var t = Kn[e], n;
          for (n in t)
              if (t.hasOwnProperty(n) && n in Lf)
                  return zl[e] = t[n];
          return e
      }
      var zf = ji("animationend")
        , Df = ji("animationiteration")
        , Of = ji("animationstart")
        , If = ji("transitionend")
        , Tf = new Map
        , oc = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
      function mn(e, t) {
          Tf.set(e, t),
          jn(t, [e])
      }
      for (Wo = 0; Wo < oc.length; Wo++)
          $o = oc[Wo],
          ic = $o.toLowerCase(),
          lc = $o[0].toUpperCase() + $o.slice(1),
          mn(ic, "on" + lc);
      var $o, ic, lc, Wo;
      mn(zf, "onAnimationEnd");
      mn(Df, "onAnimationIteration");
      mn(Of, "onAnimationStart");
      mn("dblclick", "onDoubleClick");
      mn("focusin", "onFocus");
      mn("focusout", "onBlur");
      mn(If, "onTransitionEnd");
      fr("onMouseEnter", ["mouseout", "mouseover"]);
      fr("onMouseLeave", ["mouseout", "mouseover"]);
      fr("onPointerEnter", ["pointerout", "pointerover"]);
      fr("onPointerLeave", ["pointerout", "pointerover"]);
      jn("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
      jn("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
      jn("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
      jn("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
      jn("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
      jn("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
      var Ur = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" ")
        , Hp = new Set("cancel close invalid load scroll toggle".split(" ").concat(Ur));
      function uc(e, t, n) {
          var r = e.type || "unknown-event";
          e.currentTarget = n,
          H1(r, t, void 0, e),
          e.currentTarget = null
      }
      function Af(e, t) {
          t = (t & 4) !== 0;
          for (var n = 0; n < e.length; n++) {
              var r = e[n]
                , o = r.event;
              r = r.listeners;
              e: {
                  var i = void 0;
                  if (t)
                      for (var l = r.length - 1; 0 <= l; l--) {
                          var s = r[l]
                            , a = s.instance
                            , k = s.currentTarget;
                          if (s = s.listener,
                          a !== i && o.isPropagationStopped())
                              break e;
                          uc(o, s, k),
                          i = a
                      }
                  else
                      for (l = 0; l < r.length; l++) {
                          if (s = r[l],
                          a = s.instance,
                          k = s.currentTarget,
                          s = s.listener,
                          a !== i && o.isPropagationStopped())
                              break e;
                          uc(o, s, k),
                          i = a
                      }
              }
          }
          if (di)
              throw e = ou,
              di = !1,
              ou = null,
              e
      }
      function ve(e, t) {
          var n = t[hu];
          n === void 0 && (n = t[hu] = new Set);
          var r = e + "__bubble";
          n.has(r) || (Rf(t, e, 2, !1),
          n.add(r))
      }
      function Dl(e, t, n) {
          var r = 0;
          t && (r |= 4),
          Rf(n, e, r, t)
      }
      var qo = "_reactListening" + Math.random().toString(36).slice(2);
      function oo(e) {
          if (!e[qo]) {
              e[qo] = !0,
              Vc.forEach(function(n) {
                  n !== "selectionchange" && (Hp.has(n) || Dl(n, !1, e),
                  Dl(n, !0, e))
              });
              var t = e.nodeType === 9 ? e : e.ownerDocument;
              t === null || t[qo] || (t[qo] = !0,
              Dl("selectionchange", !1, t))
          }
      }
      function Rf(e, t, n, r) {
          switch (wf(t)) {
          case 1:
              var o = rp;
              break;
          case 4:
              o = op;
              break;
          default:
              o = Wu
          }
          n = o.bind(null, t, n, e),
          o = void 0,
          !ru || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (o = !0),
          r ? o !== void 0 ? e.addEventListener(t, n, {
              capture: !0,
              passive: o
          }) : e.addEventListener(t, n, !0) : o !== void 0 ? e.addEventListener(t, n, {
              passive: o
          }) : e.addEventListener(t, n, !1)
      }
      function Ol(e, t, n, r, o) {
          var i = r;
          if (!(t & 1) && !(t & 2) && r !== null)
              e: for (; ; ) {
                  if (r === null)
                      return;
                  var l = r.tag;
                  if (l === 3 || l === 4) {
                      var s = r.stateNode.containerInfo;
                      if (s === o || s.nodeType === 8 && s.parentNode === o)
                          break;
                      if (l === 4)
                          for (l = r.return; l !== null; ) {
                              var a = l.tag;
                              if ((a === 3 || a === 4) && (a = l.stateNode.containerInfo,
                              a === o || a.nodeType === 8 && a.parentNode === o))
                                  return;
                              l = l.return
                          }
                      for (; s !== null; ) {
                          if (l = Mn(s),
                          l === null)
                              return;
                          if (a = l.tag,
                          a === 5 || a === 6) {
                              r = i = l;
                              continue e
                          }
                          s = s.parentNode
                      }
                  }
                  r = r.return
              }
          of(function() {
              var k = i
                , L = Hu(n)
                , I = [];
              e: {
                  var E = Tf.get(e);
                  if (E !== void 0) {
                      var R = qu
                        , V = e;
                      switch (e) {
                      case "keypress":
                          if (ni(n) === 0)
                              break e;
                      case "keydown":
                      case "keyup":
                          R = wp;
                          break;
                      case "focusin":
                          V = "focus",
                          R = Pl;
                          break;
                      case "focusout":
                          V = "blur",
                          R = Pl;
                          break;
                      case "beforeblur":
                      case "afterblur":
                          R = Pl;
                          break;
                      case "click":
                          if (n.button === 2)
                              break e;
                      case "auxclick":
                      case "dblclick":
                      case "mousedown":
                      case "mousemove":
                      case "mouseup":
                      case "mouseout":
                      case "mouseover":
                      case "contextmenu":
                          R = Ga;
                          break;
                      case "drag":
                      case "dragend":
                      case "dragenter":
                      case "dragexit":
                      case "dragleave":
                      case "dragover":
                      case "dragstart":
                      case "drop":
                          R = up;
                          break;
                      case "touchcancel":
                      case "touchend":
                      case "touchmove":
                      case "touchstart":
                          R = xp;
                          break;
                      case zf:
                      case Df:
                      case Of:
                          R = cp;
                          break;
                      case If:
                          R = Cp;
                          break;
                      case "scroll":
                          R = ip;
                          break;
                      case "wheel":
                          R = Np;
                          break;
                      case "copy":
                      case "cut":
                      case "paste":
                          R = dp;
                          break;
                      case "gotpointercapture":
                      case "lostpointercapture":
                      case "pointercancel":
                      case "pointerdown":
                      case "pointermove":
                      case "pointerout":
                      case "pointerover":
                      case "pointerup":
                          R = Xa
                      }
                      var U = (t & 4) !== 0
                        , se = !U && e === "scroll"
                        , w = U ? E !== null ? E + "Capture" : null : E;
                      U = [];
                      for (var v = k, x; v !== null; ) {
                          x = v;
                          var j = x.stateNode;
                          if (x.tag === 5 && j !== null && (x = j,
                          w !== null && (j = Jr(v, w),
                          j != null && U.push(io(v, j, x)))),
                          se)
                              break;
                          v = v.return
                      }
                      0 < U.length && (E = new R(E,V,null,n,L),
                      I.push({
                          event: E,
                          listeners: U
                      }))
                  }
              }
              if (!(t & 7)) {
                  e: {
                      if (E = e === "mouseover" || e === "pointerover",
                      R = e === "mouseout" || e === "pointerout",
                      E && n !== tu && (V = n.relatedTarget || n.fromElement) && (Mn(V) || V[Qt]))
                          break e;
                      if ((R || E) && (E = L.window === L ? L : (E = L.ownerDocument) ? E.defaultView || E.parentWindow : window,
                      R ? (V = n.relatedTarget || n.toElement,
                      R = k,
                      V = V ? Mn(V) : null,
                      V !== null && (se = Bn(V),
                      V !== se || V.tag !== 5 && V.tag !== 6) && (V = null)) : (R = null,
                      V = k),
                      R !== V)) {
                          if (U = Ga,
                          j = "onMouseLeave",
                          w = "onMouseEnter",
                          v = "mouse",
                          (e === "pointerout" || e === "pointerover") && (U = Xa,
                          j = "onPointerLeave",
                          w = "onPointerEnter",
                          v = "pointer"),
                          se = R == null ? E : Jn(R),
                          x = V == null ? E : Jn(V),
                          E = new U(j,v + "leave",R,n,L),
                          E.target = se,
                          E.relatedTarget = x,
                          j = null,
                          Mn(L) === k && (U = new U(w,v + "enter",V,n,L),
                          U.target = x,
                          U.relatedTarget = se,
                          j = U),
                          se = j,
                          R && V)
                              t: {
                                  for (U = R,
                                  w = V,
                                  v = 0,
                                  x = U; x; x = $n(x))
                                      v++;
                                  for (x = 0,
                                  j = w; j; j = $n(j))
                                      x++;
                                  for (; 0 < v - x; )
                                      U = $n(U),
                                      v--;
                                  for (; 0 < x - v; )
                                      w = $n(w),
                                      x--;
                                  for (; v--; ) {
                                      if (U === w || w !== null && U === w.alternate)
                                          break t;
                                      U = $n(U),
                                      w = $n(w)
                                  }
                                  U = null
                              }
                          else
                              U = null;
                          R !== null && sc(I, E, R, U, !1),
                          V !== null && se !== null && sc(I, se, V, U, !0)
                      }
                  }
                  e: {
                      if (E = k ? Jn(k) : window,
                      R = E.nodeName && E.nodeName.toLowerCase(),
                      R === "select" || R === "input" && E.type === "file")
                          var $ = Ip;
                      else if (ba(E))
                          if (Ef)
                              $ = jp;
                          else {
                              $ = Ap;
                              var q = Tp
                          }
                      else
                          (R = E.nodeName) && R.toLowerCase() === "input" && (E.type === "checkbox" || E.type === "radio") && ($ = Rp);
                      if ($ && ($ = $(e, k))) {
                          Cf(I, $, n, L);
                          break e
                      }
                      q && q(e, E, k),
                      e === "focusout" && (q = E._wrapperState) && q.controlled && E.type === "number" && Xl(E, "number", E.value)
                  }
                  switch (q = k ? Jn(k) : window,
                  e) {
                  case "focusin":
                      (ba(q) || q.contentEditable === "true") && (Xn = q,
                      su = k,
                      Wr = null);
                      break;
                  case "focusout":
                      Wr = su = Xn = null;
                      break;
                  case "mousedown":
                      au = !0;
                      break;
                  case "contextmenu":
                  case "mouseup":
                  case "dragend":
                      au = !1,
                      rc(I, n, L);
                      break;
                  case "selectionchange":
                      if (Up)
                          break;
                  case "keydown":
                  case "keyup":
                      rc(I, n, L)
                  }
                  var G;
                  if (Yu)
                      e: {
                          switch (e) {
                          case "compositionstart":
                              var b = "onCompositionStart";
                              break e;
                          case "compositionend":
                              b = "onCompositionEnd";
                              break e;
                          case "compositionupdate":
                              b = "onCompositionUpdate";
                              break e
                          }
                          b = void 0
                      }
                  else
                      Yn ? xf(e, n) && (b = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (b = "onCompositionStart");
                  b && (Sf && n.locale !== "ko" && (Yn || b !== "onCompositionStart" ? b === "onCompositionEnd" && Yn && (G = kf()) : (nn = L,
                  $u = "value"in nn ? nn.value : nn.textContent,
                  Yn = !0)),
                  q = gi(k, b),
                  0 < q.length && (b = new Ya(b,e,null,n,L),
                  I.push({
                      event: b,
                      listeners: q
                  }),
                  G ? b.data = G : (G = _f(n),
                  G !== null && (b.data = G)))),
                  (G = Pp ? Lp(e, n) : zp(e, n)) && (k = gi(k, "onBeforeInput"),
                  0 < k.length && (L = new Ya("onBeforeInput","beforeinput",null,n,L),
                  I.push({
                      event: L,
                      listeners: k
                  }),
                  L.data = G))
              }
              Af(I, t)
          })
      }
      function io(e, t, n) {
          return {
              instance: e,
              listener: t,
              currentTarget: n
          }
      }
      function gi(e, t) {
          for (var n = t + "Capture", r = []; e !== null; ) {
              var o = e
                , i = o.stateNode;
              o.tag === 5 && i !== null && (o = i,
              i = Jr(e, n),
              i != null && r.unshift(io(e, i, o)),
              i = Jr(e, t),
              i != null && r.push(io(e, i, o))),
              e = e.return
          }
          return r
      }
      function $n(e) {
          if (e === null)
              return null;
          do
              e = e.return;
          while (e && e.tag !== 5);
          return e || null
      }
      function sc(e, t, n, r, o) {
          for (var i = t._reactName, l = []; n !== null && n !== r; ) {
              var s = n
                , a = s.alternate
                , k = s.stateNode;
              if (a !== null && a === r)
                  break;
              s.tag === 5 && k !== null && (s = k,
              o ? (a = Jr(n, i),
              a != null && l.unshift(io(n, a, s))) : o || (a = Jr(n, i),
              a != null && l.push(io(n, a, s)))),
              n = n.return
          }
          l.length !== 0 && e.push({
              event: t,
              listeners: l
          })
      }
      var Vp = /\r\n?/g
        , Qp = /\u0000|\uFFFD/g;
      function ac(e) {
          return (typeof e == "string" ? e : "" + e).replace(Vp, `
`).replace(Qp, "")
      }
      function Go(e, t, n) {
          if (t = ac(t),
          ac(e) !== t && n)
              throw Error(B(425))
      }
      function yi() {}
      var cu = null
        , fu = null;
      function du(e, t) {
          return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null
      }
      var pu = typeof setTimeout == "function" ? setTimeout : void 0
        , Zp = typeof clearTimeout == "function" ? clearTimeout : void 0
        , cc = typeof Promise == "function" ? Promise : void 0
        , Wp = typeof queueMicrotask == "function" ? queueMicrotask : typeof cc < "u" ? function(e) {
          return cc.resolve(null).then(e).catch($p)
      }
      : pu;
      function $p(e) {
          setTimeout(function() {
              throw e
          })
      }
      function Il(e, t) {
          var n = t
            , r = 0;
          do {
              var o = n.nextSibling;
              if (e.removeChild(n),
              o && o.nodeType === 8)
                  if (n = o.data,
                  n === "/$") {
                      if (r === 0) {
                          e.removeChild(o),
                          to(t);
                          return
                      }
                      r--
                  } else
                      n !== "$" && n !== "$?" && n !== "$!" || r++;
              n = o
          } while (n);
          to(t)
      }
      function sn(e) {
          for (; e != null; e = e.nextSibling) {
              var t = e.nodeType;
              if (t === 1 || t === 3)
                  break;
              if (t === 8) {
                  if (t = e.data,
                  t === "$" || t === "$!" || t === "$?")
                      break;
                  if (t === "/$")
                      return null
              }
          }
          return e
      }
      function fc(e) {
          e = e.previousSibling;
          for (var t = 0; e; ) {
              if (e.nodeType === 8) {
                  var n = e.data;
                  if (n === "$" || n === "$!" || n === "$?") {
                      if (t === 0)
                          return e;
                      t--
                  } else
                      n === "/$" && t++
              }
              e = e.previousSibling
          }
          return null
      }
      var wr = Math.random().toString(36).slice(2)
        , zt = "__reactFiber$" + wr
        , lo = "__reactProps$" + wr
        , Qt = "__reactContainer$" + wr
        , hu = "__reactEvents$" + wr
        , qp = "__reactListeners$" + wr
        , Gp = "__reactHandles$" + wr;
      function Mn(e) {
          var t = e[zt];
          if (t)
              return t;
          for (var n = e.parentNode; n; ) {
              if (t = n[Qt] || n[zt]) {
                  if (n = t.alternate,
                  t.child !== null || n !== null && n.child !== null)
                      for (e = fc(e); e !== null; ) {
                          if (n = e[zt])
                              return n;
                          e = fc(e)
                      }
                  return t
              }
              e = n,
              n = e.parentNode
          }
          return null
      }
      function vo(e) {
          return e = e[zt] || e[Qt],
          !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e
      }
      function Jn(e) {
          if (e.tag === 5 || e.tag === 6)
              return e.stateNode;
          throw Error(B(33))
      }
      function Bi(e) {
          return e[lo] || null
      }
      var mu = []
        , bn = -1;
      function vn(e) {
          return {
              current: e
          }
      }
      function ge(e) {
          0 > bn || (e.current = mu[bn],
          mu[bn] = null,
          bn--)
      }
      function pe(e, t) {
          bn++,
          mu[bn] = e.current,
          e.current = t
      }
      var hn = {}
        , Qe = vn(hn)
        , Je = vn(!1)
        , On = hn;
      function dr(e, t) {
          var n = e.type.contextTypes;
          if (!n)
              return hn;
          var r = e.stateNode;
          if (r && r.__reactInternalMemoizedUnmaskedChildContext === t)
              return r.__reactInternalMemoizedMaskedChildContext;
          var o = {}, i;
          for (i in n)
              o[i] = t[i];
          return r && (e = e.stateNode,
          e.__reactInternalMemoizedUnmaskedChildContext = t,
          e.__reactInternalMemoizedMaskedChildContext = o),
          o
      }
      function be(e) {
          return e = e.childContextTypes,
          e != null
      }
      function wi() {
          ge(Je),
          ge(Qe)
      }
      function dc(e, t, n) {
          if (Qe.current !== hn)
              throw Error(B(168));
          pe(Qe, t),
          pe(Je, n)
      }
      function jf(e, t, n) {
          var r = e.stateNode;
          if (t = t.childContextTypes,
          typeof r.getChildContext != "function")
              return n;
          r = r.getChildContext();
          for (var o in r)
              if (!(o in t))
                  throw Error(B(108, T1(e) || "Unknown", o));
          return Ce({}, n, r)
      }
      function ki(e) {
          return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || hn,
          On = Qe.current,
          pe(Qe, e),
          pe(Je, Je.current),
          !0
      }
      function pc(e, t, n) {
          var r = e.stateNode;
          if (!r)
              throw Error(B(169));
          n ? (e = jf(e, t, On),
          r.__reactInternalMemoizedMergedChildContext = e,
          ge(Je),
          ge(Qe),
          pe(Qe, e)) : ge(Je),
          pe(Je, n)
      }
      var Bt = null
        , Fi = !1
        , Tl = !1;
      function Bf(e) {
          Bt === null ? Bt = [e] : Bt.push(e)
      }
      function Yp(e) {
          Fi = !0,
          Bf(e)
      }
      function gn() {
          if (!Tl && Bt !== null) {
              Tl = !0;
              var e = 0
                , t = fe;
              try {
                  var n = Bt;
                  for (fe = 1; e < n.length; e++) {
                      var r = n[e];
                      do
                          r = r(!0);
                      while (r !== null)
                  }
                  Bt = null,
                  Fi = !1
              } catch (o) {
                  throw Bt !== null && (Bt = Bt.slice(e + 1)),
                  af(Vu, gn),
                  o
              } finally {
                  fe = t,
                  Tl = !1
              }
          }
          return null
      }
      var er = []
        , tr = 0
        , Si = null
        , xi = 0
        , at = []
        , ct = 0
        , In = null
        , Ft = 1
        , Ut = "";
      function En(e, t) {
          er[tr++] = xi,
          er[tr++] = Si,
          Si = e,
          xi = t
      }
      function Ff(e, t, n) {
          at[ct++] = Ft,
          at[ct++] = Ut,
          at[ct++] = In,
          In = e;
          var r = Ft;
          e = Ut;
          var o = 32 - _t(r) - 1;
          r &= ~(1 << o),
          n += 1;
          var i = 32 - _t(t) + o;
          if (30 < i) {
              var l = o - o % 5;
              i = (r & (1 << l) - 1).toString(32),
              r >>= l,
              o -= l,
              Ft = 1 << 32 - _t(t) + o | n << o | r,
              Ut = i + e
          } else
              Ft = 1 << i | n << o | r,
              Ut = e
      }
      function Ku(e) {
          e.return !== null && (En(e, 1),
          Ff(e, 1, 0))
      }
      function Ju(e) {
          for (; e === Si; )
              Si = er[--tr],
              er[tr] = null,
              xi = er[--tr],
              er[tr] = null;
          for (; e === In; )
              In = at[--ct],
              at[ct] = null,
              Ut = at[--ct],
              at[ct] = null,
              Ft = at[--ct],
              at[ct] = null
      }
      var rt = null
        , nt = null
        , we = !1
        , xt = null;
      function Uf(e, t) {
          var n = ft(5, null, null, 0);
          n.elementType = "DELETED",
          n.stateNode = t,
          n.return = e,
          t = e.deletions,
          t === null ? (e.deletions = [n],
          e.flags |= 16) : t.push(n)
      }
      function hc(e, t) {
          switch (e.tag) {
          case 5:
              var n = e.type;
              return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t,
              t !== null ? (e.stateNode = t,
              rt = e,
              nt = sn(t.firstChild),
              !0) : !1;
          case 6:
              return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t,
              t !== null ? (e.stateNode = t,
              rt = e,
              nt = null,
              !0) : !1;
          case 13:
              return t = t.nodeType !== 8 ? null : t,
              t !== null ? (n = In !== null ? {
                  id: Ft,
                  overflow: Ut
              } : null,
              e.memoizedState = {
                  dehydrated: t,
                  treeContext: n,
                  retryLane: 1073741824
              },
              n = ft(18, null, null, 0),
              n.stateNode = t,
              n.return = e,
              e.child = n,
              rt = e,
              nt = null,
              !0) : !1;
          default:
              return !1
          }
      }
      function vu(e) {
          return (e.mode & 1) !== 0 && (e.flags & 128) === 0
      }
      function gu(e) {
          if (we) {
              var t = nt;
              if (t) {
                  var n = t;
                  if (!hc(e, t)) {
                      if (vu(e))
                          throw Error(B(418));
                      t = sn(n.nextSibling);
                      var r = rt;
                      t && hc(e, t) ? Uf(r, n) : (e.flags = e.flags & -4097 | 2,
                      we = !1,
                      rt = e)
                  }
              } else {
                  if (vu(e))
                      throw Error(B(418));
                  e.flags = e.flags & -4097 | 2,
                  we = !1,
                  rt = e
              }
          }
      }
      function mc(e) {
          for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; )
              e = e.return;
          rt = e
      }
      function Yo(e) {
          if (e !== rt)
              return !1;
          if (!we)
              return mc(e),
              we = !0,
              !1;
          var t;
          if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type,
          t = t !== "head" && t !== "body" && !du(e.type, e.memoizedProps)),
          t && (t = nt)) {
              if (vu(e))
                  throw Hf(),
                  Error(B(418));
              for (; t; )
                  Uf(e, t),
                  t = sn(t.nextSibling)
          }
          if (mc(e),
          e.tag === 13) {
              if (e = e.memoizedState,
              e = e !== null ? e.dehydrated : null,
              !e)
                  throw Error(B(317));
              e: {
                  for (e = e.nextSibling,
                  t = 0; e; ) {
                      if (e.nodeType === 8) {
                          var n = e.data;
                          if (n === "/$") {
                              if (t === 0) {
                                  nt = sn(e.nextSibling);
                                  break e
                              }
                              t--
                          } else
                              n !== "$" && n !== "$!" && n !== "$?" || t++
                      }
                      e = e.nextSibling
                  }
                  nt = null
              }
          } else
              nt = rt ? sn(e.stateNode.nextSibling) : null;
          return !0
      }
      function Hf() {
          for (var e = nt; e; )
              e = sn(e.nextSibling)
      }
      function pr() {
          nt = rt = null,
          we = !1
      }
      function bu(e) {
          xt === null ? xt = [e] : xt.push(e)
      }
      var Xp = $t.ReactCurrentBatchConfig;
      function kt(e, t) {
          if (e && e.defaultProps) {
              t = Ce({}, t),
              e = e.defaultProps;
              for (var n in e)
                  t[n] === void 0 && (t[n] = e[n]);
              return t
          }
          return t
      }
      var _i = vn(null)
        , Ci = null
        , nr = null
        , es = null;
      function ts() {
          es = nr = Ci = null
      }
      function ns(e) {
          var t = _i.current;
          ge(_i),
          e._currentValue = t
      }
      function yu(e, t, n) {
          for (; e !== null; ) {
              var r = e.alternate;
              if ((e.childLanes & t) !== t ? (e.childLanes |= t,
              r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t),
              e === n)
                  break;
              e = e.return
          }
      }
      function ar(e, t) {
          Ci = e,
          es = nr = null,
          e = e.dependencies,
          e !== null && e.firstContext !== null && (e.lanes & t && (Ke = !0),
          e.firstContext = null)
      }
      function pt(e) {
          var t = e._currentValue;
          if (es !== e)
              if (e = {
                  context: e,
                  memoizedValue: t,
                  next: null
              },
              nr === null) {
                  if (Ci === null)
                      throw Error(B(308));
                  nr = e,
                  Ci.dependencies = {
                      lanes: 0,
                      firstContext: e
                  }
              } else
                  nr = nr.next = e;
          return t
      }
      var Pn = null;
      function rs(e) {
          Pn === null ? Pn = [e] : Pn.push(e)
      }
      function Vf(e, t, n, r) {
          var o = t.interleaved;
          return o === null ? (n.next = n,
          rs(t)) : (n.next = o.next,
          o.next = n),
          t.interleaved = n,
          Zt(e, r)
      }
      function Zt(e, t) {
          e.lanes |= t;
          var n = e.alternate;
          for (n !== null && (n.lanes |= t),
          n = e,
          e = e.return; e !== null; )
              e.childLanes |= t,
              n = e.alternate,
              n !== null && (n.childLanes |= t),
              n = e,
              e = e.return;
          return n.tag === 3 ? n.stateNode : null
      }
      var bt = !1;
      function os(e) {
          e.updateQueue = {
              baseState: e.memoizedState,
              firstBaseUpdate: null,
              lastBaseUpdate: null,
              shared: {
                  pending: null,
                  interleaved: null,
                  lanes: 0
              },
              effects: null
          }
      }
      function Qf(e, t) {
          e = e.updateQueue,
          t.updateQueue === e && (t.updateQueue = {
              baseState: e.baseState,
              firstBaseUpdate: e.firstBaseUpdate,
              lastBaseUpdate: e.lastBaseUpdate,
              shared: e.shared,
              effects: e.effects
          })
      }
      function Ht(e, t) {
          return {
              eventTime: e,
              lane: t,
              tag: 0,
              payload: null,
              callback: null,
              next: null
          }
      }
      function an(e, t, n) {
          var r = e.updateQueue;
          if (r === null)
              return null;
          if (r = r.shared,
          ue & 2) {
              var o = r.pending;
              return o === null ? t.next = t : (t.next = o.next,
              o.next = t),
              r.pending = t,
              Zt(e, n)
          }
          return o = r.interleaved,
          o === null ? (t.next = t,
          rs(r)) : (t.next = o.next,
          o.next = t),
          r.interleaved = t,
          Zt(e, n)
      }
      function ri(e, t, n) {
          if (t = t.updateQueue,
          t !== null && (t = t.shared,
          (n & 4194240) !== 0)) {
              var r = t.lanes;
              r &= e.pendingLanes,
              n |= r,
              t.lanes = n,
              Qu(e, n)
          }
      }
      function vc(e, t) {
          var n = e.updateQueue
            , r = e.alternate;
          if (r !== null && (r = r.updateQueue,
          n === r)) {
              var o = null
                , i = null;
              if (n = n.firstBaseUpdate,
              n !== null) {
                  do {
                      var l = {
                          eventTime: n.eventTime,
                          lane: n.lane,
                          tag: n.tag,
                          payload: n.payload,
                          callback: n.callback,
                          next: null
                      };
                      i === null ? o = i = l : i = i.next = l,
                      n = n.next
                  } while (n !== null);
                  i === null ? o = i = t : i = i.next = t
              } else
                  o = i = t;
              n = {
                  baseState: r.baseState,
                  firstBaseUpdate: o,
                  lastBaseUpdate: i,
                  shared: r.shared,
                  effects: r.effects
              },
              e.updateQueue = n;
              return
          }
          e = n.lastBaseUpdate,
          e === null ? n.firstBaseUpdate = t : e.next = t,
          n.lastBaseUpdate = t
      }
      function Ei(e, t, n, r) {
          var o = e.updateQueue;
          bt = !1;
          var i = o.firstBaseUpdate
            , l = o.lastBaseUpdate
            , s = o.shared.pending;
          if (s !== null) {
              o.shared.pending = null;
              var a = s
                , k = a.next;
              a.next = null,
              l === null ? i = k : l.next = k,
              l = a;
              var L = e.alternate;
              L !== null && (L = L.updateQueue,
              s = L.lastBaseUpdate,
              s !== l && (s === null ? L.firstBaseUpdate = k : s.next = k,
              L.lastBaseUpdate = a))
          }
          if (i !== null) {
              var I = o.baseState;
              l = 0,
              L = k = a = null,
              s = i;
              do {
                  var E = s.lane
                    , R = s.eventTime;
                  if ((r & E) === E) {
                      L !== null && (L = L.next = {
                          eventTime: R,
                          lane: 0,
                          tag: s.tag,
                          payload: s.payload,
                          callback: s.callback,
                          next: null
                      });
                      e: {
                          var V = e
                            , U = s;
                          switch (E = t,
                          R = n,
                          U.tag) {
                          case 1:
                              if (V = U.payload,
                              typeof V == "function") {
                                  I = V.call(R, I, E);
                                  break e
                              }
                              I = V;
                              break e;
                          case 3:
                              V.flags = V.flags & -65537 | 128;
                          case 0:
                              if (V = U.payload,
                              E = typeof V == "function" ? V.call(R, I, E) : V,
                              E == null)
                                  break e;
                              I = Ce({}, I, E);
                              break e;
                          case 2:
                              bt = !0
                          }
                      }
                      s.callback !== null && s.lane !== 0 && (e.flags |= 64,
                      E = o.effects,
                      E === null ? o.effects = [s] : E.push(s))
                  } else
                      R = {
                          eventTime: R,
                          lane: E,
                          tag: s.tag,
                          payload: s.payload,
                          callback: s.callback,
                          next: null
                      },
                      L === null ? (k = L = R,
                      a = I) : L = L.next = R,
                      l |= E;
                  if (s = s.next,
                  s === null) {
                      if (s = o.shared.pending,
                      s === null)
                          break;
                      E = s,
                      s = E.next,
                      E.next = null,
                      o.lastBaseUpdate = E,
                      o.shared.pending = null
                  }
              } while (1);
              if (L === null && (a = I),
              o.baseState = a,
              o.firstBaseUpdate = k,
              o.lastBaseUpdate = L,
              t = o.shared.interleaved,
              t !== null) {
                  o = t;
                  do
                      l |= o.lane,
                      o = o.next;
                  while (o !== t)
              } else
                  i === null && (o.shared.lanes = 0);
              An |= l,
              e.lanes = l,
              e.memoizedState = I
          }
      }
      function gc(e, t, n) {
          if (e = t.effects,
          t.effects = null,
          e !== null)
              for (t = 0; t < e.length; t++) {
                  var r = e[t]
                    , o = r.callback;
                  if (o !== null) {
                      if (r.callback = null,
                      r = n,
                      typeof o != "function")
                          throw Error(B(191, o));
                      o.call(r)
                  }
              }
      }
      var Zf = new Hc.Component().refs;
      function wu(e, t, n, r) {
          t = e.memoizedState,
          n = n(r, t),
          n = n == null ? t : Ce({}, t, n),
          e.memoizedState = n,
          e.lanes === 0 && (e.updateQueue.baseState = n)
      }
      var Ui = {
          isMounted: function(e) {
              return (e = e._reactInternals) ? Bn(e) === e : !1
          },
          enqueueSetState: function(e, t, n) {
              e = e._reactInternals;
              var r = qe()
                , o = fn(e)
                , i = Ht(r, o);
              i.payload = t,
              n != null && (i.callback = n),
              t = an(e, i, o),
              t !== null && (Ct(t, e, o, r),
              ri(t, e, o))
          },
          enqueueReplaceState: function(e, t, n) {
              e = e._reactInternals;
              var r = qe()
                , o = fn(e)
                , i = Ht(r, o);
              i.tag = 1,
              i.payload = t,
              n != null && (i.callback = n),
              t = an(e, i, o),
              t !== null && (Ct(t, e, o, r),
              ri(t, e, o))
          },
          enqueueForceUpdate: function(e, t) {
              e = e._reactInternals;
              var n = qe()
                , r = fn(e)
                , o = Ht(n, r);
              o.tag = 2,
              t != null && (o.callback = t),
              t = an(e, o, r),
              t !== null && (Ct(t, e, r, n),
              ri(t, e, r))
          }
      };
      function yc(e, t, n, r, o, i, l) {
          return e = e.stateNode,
          typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, i, l) : t.prototype && t.prototype.isPureReactComponent ? !ro(n, r) || !ro(o, i) : !0
      }
      function Wf(e, t, n) {
          var r = !1
            , o = hn
            , i = t.contextType;
          return typeof i == "object" && i !== null ? i = pt(i) : (o = be(t) ? On : Qe.current,
          r = t.contextTypes,
          i = (r = r != null) ? dr(e, o) : hn),
          t = new t(n,i),
          e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null,
          t.updater = Ui,
          e.stateNode = t,
          t._reactInternals = e,
          r && (e = e.stateNode,
          e.__reactInternalMemoizedUnmaskedChildContext = o,
          e.__reactInternalMemoizedMaskedChildContext = i),
          t
      }
      function wc(e, t, n, r) {
          e = t.state,
          typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r),
          typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r),
          t.state !== e && Ui.enqueueReplaceState(t, t.state, null)
      }
      function ku(e, t, n, r) {
          var o = e.stateNode;
          o.props = n,
          o.state = e.memoizedState,
          o.refs = Zf,
          os(e);
          var i = t.contextType;
          typeof i == "object" && i !== null ? o.context = pt(i) : (i = be(t) ? On : Qe.current,
          o.context = dr(e, i)),
          o.state = e.memoizedState,
          i = t.getDerivedStateFromProps,
          typeof i == "function" && (wu(e, t, i, n),
          o.state = e.memoizedState),
          typeof t.getDerivedStateFromProps == "function" || typeof o.getSnapshotBeforeUpdate == "function" || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (t = o.state,
          typeof o.componentWillMount == "function" && o.componentWillMount(),
          typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount(),
          t !== o.state && Ui.enqueueReplaceState(o, o.state, null),
          Ei(e, n, o, r),
          o.state = e.memoizedState),
          typeof o.componentDidMount == "function" && (e.flags |= 4194308)
      }
      function Ir(e, t, n) {
          if (e = n.ref,
          e !== null && typeof e != "function" && typeof e != "object") {
              if (n._owner) {
                  if (n = n._owner,
                  n) {
                      if (n.tag !== 1)
                          throw Error(B(309));
                      var r = n.stateNode
                  }
                  if (!r)
                      throw Error(B(147, e));
                  var o = r
                    , i = "" + e;
                  return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === i ? t.ref : (t = function(l) {
                      var s = o.refs;
                      s === Zf && (s = o.refs = {}),
                      l === null ? delete s[i] : s[i] = l
                  }
                  ,
                  t._stringRef = i,
                  t)
              }
              if (typeof e != "string")
                  throw Error(B(284));
              if (!n._owner)
                  throw Error(B(290, e))
          }
          return e
      }
      function Xo(e, t) {
          throw e = Object.prototype.toString.call(t),
          Error(B(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e))
      }
      function kc(e) {
          var t = e._init;
          return t(e._payload)
      }
      function $f(e) {
          function t(w, v) {
              if (e) {
                  var x = w.deletions;
                  x === null ? (w.deletions = [v],
                  w.flags |= 16) : x.push(v)
              }
          }
          function n(w, v) {
              if (!e)
                  return null;
              for (; v !== null; )
                  t(w, v),
                  v = v.sibling;
              return null
          }
          function r(w, v) {
              for (w = new Map; v !== null; )
                  v.key !== null ? w.set(v.key, v) : w.set(v.index, v),
                  v = v.sibling;
              return w
          }
          function o(w, v) {
              return w = dn(w, v),
              w.index = 0,
              w.sibling = null,
              w
          }
          function i(w, v, x) {
              return w.index = x,
              e ? (x = w.alternate,
              x !== null ? (x = x.index,
              x < v ? (w.flags |= 2,
              v) : x) : (w.flags |= 2,
              v)) : (w.flags |= 1048576,
              v)
          }
          function l(w) {
              return e && w.alternate === null && (w.flags |= 2),
              w
          }
          function s(w, v, x, j) {
              return v === null || v.tag !== 6 ? (v = Hl(x, w.mode, j),
              v.return = w,
              v) : (v = o(v, x),
              v.return = w,
              v)
          }
          function a(w, v, x, j) {
              var $ = x.type;
              return $ === Gn ? L(w, v, x.props.children, j, x.key) : v !== null && (v.elementType === $ || typeof $ == "object" && $ !== null && $.$$typeof === Jt && kc($) === v.type) ? (j = o(v, x.props),
              j.ref = Ir(w, v, x),
              j.return = w,
              j) : (j = ai(x.type, x.key, x.props, null, w.mode, j),
              j.ref = Ir(w, v, x),
              j.return = w,
              j)
          }
          function k(w, v, x, j) {
              return v === null || v.tag !== 4 || v.stateNode.containerInfo !== x.containerInfo || v.stateNode.implementation !== x.implementation ? (v = Vl(x, w.mode, j),
              v.return = w,
              v) : (v = o(v, x.children || []),
              v.return = w,
              v)
          }
          function L(w, v, x, j, $) {
              return v === null || v.tag !== 7 ? (v = Dn(x, w.mode, j, $),
              v.return = w,
              v) : (v = o(v, x),
              v.return = w,
              v)
          }
          function I(w, v, x) {
              if (typeof v == "string" && v !== "" || typeof v == "number")
                  return v = Hl("" + v, w.mode, x),
                  v.return = w,
                  v;
              if (typeof v == "object" && v !== null) {
                  switch (v.$$typeof) {
                  case Ao:
                      return x = ai(v.type, v.key, v.props, null, w.mode, x),
                      x.ref = Ir(w, null, v),
                      x.return = w,
                      x;
                  case qn:
                      return v = Vl(v, w.mode, x),
                      v.return = w,
                      v;
                  case Jt:
                      var j = v._init;
                      return I(w, j(v._payload), x)
                  }
                  if (Br(v) || Lr(v))
                      return v = Dn(v, w.mode, x, null),
                      v.return = w,
                      v;
                  Xo(w, v)
              }
              return null
          }
          function E(w, v, x, j) {
              var $ = v !== null ? v.key : null;
              if (typeof x == "string" && x !== "" || typeof x == "number")
                  return $ !== null ? null : s(w, v, "" + x, j);
              if (typeof x == "object" && x !== null) {
                  switch (x.$$typeof) {
                  case Ao:
                      return x.key === $ ? a(w, v, x, j) : null;
                  case qn:
                      return x.key === $ ? k(w, v, x, j) : null;
                  case Jt:
                      return $ = x._init,
                      E(w, v, $(x._payload), j)
                  }
                  if (Br(x) || Lr(x))
                      return $ !== null ? null : L(w, v, x, j, null);
                  Xo(w, x)
              }
              return null
          }
          function R(w, v, x, j, $) {
              if (typeof j == "string" && j !== "" || typeof j == "number")
                  return w = w.get(x) || null,
                  s(v, w, "" + j, $);
              if (typeof j == "object" && j !== null) {
                  switch (j.$$typeof) {
                  case Ao:
                      return w = w.get(j.key === null ? x : j.key) || null,
                      a(v, w, j, $);
                  case qn:
                      return w = w.get(j.key === null ? x : j.key) || null,
                      k(v, w, j, $);
                  case Jt:
                      var q = j._init;
                      return R(w, v, x, q(j._payload), $)
                  }
                  if (Br(j) || Lr(j))
                      return w = w.get(x) || null,
                      L(v, w, j, $, null);
                  Xo(v, j)
              }
              return null
          }
          function V(w, v, x, j) {
              for (var $ = null, q = null, G = v, b = v = 0, ye = null; G !== null && b < x.length; b++) {
                  G.index > b ? (ye = G,
                  G = null) : ye = G.sibling;
                  var ie = E(w, G, x[b], j);
                  if (ie === null) {
                      G === null && (G = ye);
                      break
                  }
                  e && G && ie.alternate === null && t(w, G),
                  v = i(ie, v, b),
                  q === null ? $ = ie : q.sibling = ie,
                  q = ie,
                  G = ye
              }
              if (b === x.length)
                  return n(w, G),
                  we && En(w, b),
                  $;
              if (G === null) {
                  for (; b < x.length; b++)
                      G = I(w, x[b], j),
                      G !== null && (v = i(G, v, b),
                      q === null ? $ = G : q.sibling = G,
                      q = G);
                  return we && En(w, b),
                  $
              }
              for (G = r(w, G); b < x.length; b++)
                  ye = R(G, w, b, x[b], j),
                  ye !== null && (e && ye.alternate !== null && G.delete(ye.key === null ? b : ye.key),
                  v = i(ye, v, b),
                  q === null ? $ = ye : q.sibling = ye,
                  q = ye);
              return e && G.forEach(function(z) {
                  return t(w, z)
              }),
              we && En(w, b),
              $
          }
          function U(w, v, x, j) {
              var $ = Lr(x);
              if (typeof $ != "function")
                  throw Error(B(150));
              if (x = $.call(x),
              x == null)
                  throw Error(B(151));
              for (var q = $ = null, G = v, b = v = 0, ye = null, ie = x.next(); G !== null && !ie.done; b++,
              ie = x.next()) {
                  G.index > b ? (ye = G,
                  G = null) : ye = G.sibling;
                  var z = E(w, G, ie.value, j);
                  if (z === null) {
                      G === null && (G = ye);
                      break
                  }
                  e && G && z.alternate === null && t(w, G),
                  v = i(z, v, b),
                  q === null ? $ = z : q.sibling = z,
                  q = z,
                  G = ye
              }
              if (ie.done)
                  return n(w, G),
                  we && En(w, b),
                  $;
              if (G === null) {
                  for (; !ie.done; b++,
                  ie = x.next())
                      ie = I(w, ie.value, j),
                      ie !== null && (v = i(ie, v, b),
                      q === null ? $ = ie : q.sibling = ie,
                      q = ie);
                  return we && En(w, b),
                  $
              }
              for (G = r(w, G); !ie.done; b++,
              ie = x.next())
                  ie = R(G, w, b, ie.value, j),
                  ie !== null && (e && ie.alternate !== null && G.delete(ie.key === null ? b : ie.key),
                  v = i(ie, v, b),
                  q === null ? $ = ie : q.sibling = ie,
                  q = ie);
              return e && G.forEach(function(T) {
                  return t(w, T)
              }),
              we && En(w, b),
              $
          }
          function se(w, v, x, j) {
              if (typeof x == "object" && x !== null && x.type === Gn && x.key === null && (x = x.props.children),
              typeof x == "object" && x !== null) {
                  switch (x.$$typeof) {
                  case Ao:
                      e: {
                          for (var $ = x.key, q = v; q !== null; ) {
                              if (q.key === $) {
                                  if ($ = x.type,
                                  $ === Gn) {
                                      if (q.tag === 7) {
                                          n(w, q.sibling),
                                          v = o(q, x.props.children),
                                          v.return = w,
                                          w = v;
                                          break e
                                      }
                                  } else if (q.elementType === $ || typeof $ == "object" && $ !== null && $.$$typeof === Jt && kc($) === q.type) {
                                      n(w, q.sibling),
                                      v = o(q, x.props),
                                      v.ref = Ir(w, q, x),
                                      v.return = w,
                                      w = v;
                                      break e
                                  }
                                  n(w, q);
                                  break
                              } else
                                  t(w, q);
                              q = q.sibling
                          }
                          x.type === Gn ? (v = Dn(x.props.children, w.mode, j, x.key),
                          v.return = w,
                          w = v) : (j = ai(x.type, x.key, x.props, null, w.mode, j),
                          j.ref = Ir(w, v, x),
                          j.return = w,
                          w = j)
                      }
                      return l(w);
                  case qn:
                      e: {
                          for (q = x.key; v !== null; ) {
                              if (v.key === q)
                                  if (v.tag === 4 && v.stateNode.containerInfo === x.containerInfo && v.stateNode.implementation === x.implementation) {
                                      n(w, v.sibling),
                                      v = o(v, x.children || []),
                                      v.return = w,
                                      w = v;
                                      break e
                                  } else {
                                      n(w, v);
                                      break
                                  }
                              else
                                  t(w, v);
                              v = v.sibling
                          }
                          v = Vl(x, w.mode, j),
                          v.return = w,
                          w = v
                      }
                      return l(w);
                  case Jt:
                      return q = x._init,
                      se(w, v, q(x._payload), j)
                  }
                  if (Br(x))
                      return V(w, v, x, j);
                  if (Lr(x))
                      return U(w, v, x, j);
                  Xo(w, x)
              }
              return typeof x == "string" && x !== "" || typeof x == "number" ? (x = "" + x,
              v !== null && v.tag === 6 ? (n(w, v.sibling),
              v = o(v, x),
              v.return = w,
              w = v) : (n(w, v),
              v = Hl(x, w.mode, j),
              v.return = w,
              w = v),
              l(w)) : n(w, v)
          }
          return se
      }
      var hr = $f(!0)
        , qf = $f(!1)
        , go = {}
        , Ot = vn(go)
        , uo = vn(go)
        , so = vn(go);
      function Ln(e) {
          if (e === go)
              throw Error(B(174));
          return e
      }
      function is(e, t) {
          switch (pe(so, t),
          pe(uo, e),
          pe(Ot, go),
          e = t.nodeType,
          e) {
          case 9:
          case 11:
              t = (t = t.documentElement) ? t.namespaceURI : Jl(null, "");
              break;
          default:
              e = e === 8 ? t.parentNode : t,
              t = e.namespaceURI || null,
              e = e.tagName,
              t = Jl(t, e)
          }
          ge(Ot),
          pe(Ot, t)
      }
      function mr() {
          ge(Ot),
          ge(uo),
          ge(so)
      }
      function Gf(e) {
          Ln(so.current);
          var t = Ln(Ot.current)
            , n = Jl(t, e.type);
          t !== n && (pe(uo, e),
          pe(Ot, n))
      }
      function ls(e) {
          uo.current === e && (ge(Ot),
          ge(uo))
      }
      var xe = vn(0);
      function Ni(e) {
          for (var t = e; t !== null; ) {
              if (t.tag === 13) {
                  var n = t.memoizedState;
                  if (n !== null && (n = n.dehydrated,
                  n === null || n.data === "$?" || n.data === "$!"))
                      return t
              } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
                  if (t.flags & 128)
                      return t
              } else if (t.child !== null) {
                  t.child.return = t,
                  t = t.child;
                  continue
              }
              if (t === e)
                  break;
              for (; t.sibling === null; ) {
                  if (t.return === null || t.return === e)
                      return null;
                  t = t.return
              }
              t.sibling.return = t.return,
              t = t.sibling
          }
          return null
      }
      var Al = [];
      function us() {
          for (var e = 0; e < Al.length; e++)
              Al[e]._workInProgressVersionPrimary = null;
          Al.length = 0
      }
      var oi = $t.ReactCurrentDispatcher
        , Rl = $t.ReactCurrentBatchConfig
        , Tn = 0
        , _e = null
        , De = null
        , Te = null
        , Mi = !1
        , $r = !1
        , ao = 0
        , Kp = 0;
      function Ue() {
          throw Error(B(321))
      }
      function ss(e, t) {
          if (t === null)
              return !1;
          for (var n = 0; n < t.length && n < e.length; n++)
              if (!Et(e[n], t[n]))
                  return !1;
          return !0
      }
      function as(e, t, n, r, o, i) {
          if (Tn = i,
          _e = t,
          t.memoizedState = null,
          t.updateQueue = null,
          t.lanes = 0,
          oi.current = e === null || e.memoizedState === null ? t0 : n0,
          e = n(r, o),
          $r) {
              i = 0;
              do {
                  if ($r = !1,
                  ao = 0,
                  25 <= i)
                      throw Error(B(301));
                  i += 1,
                  Te = De = null,
                  t.updateQueue = null,
                  oi.current = r0,
                  e = n(r, o)
              } while ($r)
          }
          if (oi.current = Pi,
          t = De !== null && De.next !== null,
          Tn = 0,
          Te = De = _e = null,
          Mi = !1,
          t)
              throw Error(B(300));
          return e
      }
      function cs() {
          var e = ao !== 0;
          return ao = 0,
          e
      }
      function Lt() {
          var e = {
              memoizedState: null,
              baseState: null,
              baseQueue: null,
              queue: null,
              next: null
          };
          return Te === null ? _e.memoizedState = Te = e : Te = Te.next = e,
          Te
      }
      function ht() {
          if (De === null) {
              var e = _e.alternate;
              e = e !== null ? e.memoizedState : null
          } else
              e = De.next;
          var t = Te === null ? _e.memoizedState : Te.next;
          if (t !== null)
              Te = t,
              De = e;
          else {
              if (e === null)
                  throw Error(B(310));
              De = e,
              e = {
                  memoizedState: De.memoizedState,
                  baseState: De.baseState,
                  baseQueue: De.baseQueue,
                  queue: De.queue,
                  next: null
              },
              Te === null ? _e.memoizedState = Te = e : Te = Te.next = e
          }
          return Te
      }
      function co(e, t) {
          return typeof t == "function" ? t(e) : t
      }
      function jl(e) {
          var t = ht()
            , n = t.queue;
          if (n === null)
              throw Error(B(311));
          n.lastRenderedReducer = e;
          var r = De
            , o = r.baseQueue
            , i = n.pending;
          if (i !== null) {
              if (o !== null) {
                  var l = o.next;
                  o.next = i.next,
                  i.next = l
              }
              r.baseQueue = o = i,
              n.pending = null
          }
          if (o !== null) {
              i = o.next,
              r = r.baseState;
              var s = l = null
                , a = null
                , k = i;
              do {
                  var L = k.lane;
                  if ((Tn & L) === L)
                      a !== null && (a = a.next = {
                          lane: 0,
                          action: k.action,
                          hasEagerState: k.hasEagerState,
                          eagerState: k.eagerState,
                          next: null
                      }),
                      r = k.hasEagerState ? k.eagerState : e(r, k.action);
                  else {
                      var I = {
                          lane: L,
                          action: k.action,
                          hasEagerState: k.hasEagerState,
                          eagerState: k.eagerState,
                          next: null
                      };
                      a === null ? (s = a = I,
                      l = r) : a = a.next = I,
                      _e.lanes |= L,
                      An |= L
                  }
                  k = k.next
              } while (k !== null && k !== i);
              a === null ? l = r : a.next = s,
              Et(r, t.memoizedState) || (Ke = !0),
              t.memoizedState = r,
              t.baseState = l,
              t.baseQueue = a,
              n.lastRenderedState = r
          }
          if (e = n.interleaved,
          e !== null) {
              o = e;
              do
                  i = o.lane,
                  _e.lanes |= i,
                  An |= i,
                  o = o.next;
              while (o !== e)
          } else
              o === null && (n.lanes = 0);
          return [t.memoizedState, n.dispatch]
      }
      function Bl(e) {
          var t = ht()
            , n = t.queue;
          if (n === null)
              throw Error(B(311));
          n.lastRenderedReducer = e;
          var r = n.dispatch
            , o = n.pending
            , i = t.memoizedState;
          if (o !== null) {
              n.pending = null;
              var l = o = o.next;
              do
                  i = e(i, l.action),
                  l = l.next;
              while (l !== o);
              Et(i, t.memoizedState) || (Ke = !0),
              t.memoizedState = i,
              t.baseQueue === null && (t.baseState = i),
              n.lastRenderedState = i
          }
          return [i, r]
      }
      function Yf() {}
      function Xf(e, t) {
          var n = _e
            , r = ht()
            , o = t()
            , i = !Et(r.memoizedState, o);
          if (i && (r.memoizedState = o,
          Ke = !0),
          r = r.queue,
          fs(bf.bind(null, n, r, e), [e]),
          r.getSnapshot !== t || i || Te !== null && Te.memoizedState.tag & 1) {
              if (n.flags |= 2048,
              fo(9, Jf.bind(null, n, r, o, t), void 0, null),
              Ae === null)
                  throw Error(B(349));
              Tn & 30 || Kf(n, t, o)
          }
          return o
      }
      function Kf(e, t, n) {
          e.flags |= 16384,
          e = {
              getSnapshot: t,
              value: n
          },
          t = _e.updateQueue,
          t === null ? (t = {
              lastEffect: null,
              stores: null
          },
          _e.updateQueue = t,
          t.stores = [e]) : (n = t.stores,
          n === null ? t.stores = [e] : n.push(e))
      }
      function Jf(e, t, n, r) {
          t.value = n,
          t.getSnapshot = r,
          ed(t) && td(e)
      }
      function bf(e, t, n) {
          return n(function() {
              ed(t) && td(e)
          })
      }
      function ed(e) {
          var t = e.getSnapshot;
          e = e.value;
          try {
              var n = t();
              return !Et(e, n)
          } catch {
              return !0
          }
      }
      function td(e) {
          var t = Zt(e, 1);
          t !== null && Ct(t, e, 1, -1)
      }
      function Sc(e) {
          var t = Lt();
          return typeof e == "function" && (e = e()),
          t.memoizedState = t.baseState = e,
          e = {
              pending: null,
              interleaved: null,
              lanes: 0,
              dispatch: null,
              lastRenderedReducer: co,
              lastRenderedState: e
          },
          t.queue = e,
          e = e.dispatch = e0.bind(null, _e, e),
          [t.memoizedState, e]
      }
      function fo(e, t, n, r) {
          return e = {
              tag: e,
              create: t,
              destroy: n,
              deps: r,
              next: null
          },
          t = _e.updateQueue,
          t === null ? (t = {
              lastEffect: null,
              stores: null
          },
          _e.updateQueue = t,
          t.lastEffect = e.next = e) : (n = t.lastEffect,
          n === null ? t.lastEffect = e.next = e : (r = n.next,
          n.next = e,
          e.next = r,
          t.lastEffect = e)),
          e
      }
      function nd() {
          return ht().memoizedState
      }
      function ii(e, t, n, r) {
          var o = Lt();
          _e.flags |= e,
          o.memoizedState = fo(1 | t, n, void 0, r === void 0 ? null : r)
      }
      function Hi(e, t, n, r) {
          var o = ht();
          r = r === void 0 ? null : r;
          var i = void 0;
          if (De !== null) {
              var l = De.memoizedState;
              if (i = l.destroy,
              r !== null && ss(r, l.deps)) {
                  o.memoizedState = fo(t, n, i, r);
                  return
              }
          }
          _e.flags |= e,
          o.memoizedState = fo(1 | t, n, i, r)
      }
      function xc(e, t) {
          return ii(8390656, 8, e, t)
      }
      function fs(e, t) {
          return Hi(2048, 8, e, t)
      }
      function rd(e, t) {
          return Hi(4, 2, e, t)
      }
      function od(e, t) {
          return Hi(4, 4, e, t)
      }
      function id(e, t) {
          if (typeof t == "function")
              return e = e(),
              t(e),
              function() {
                  t(null)
              }
              ;
          if (t != null)
              return e = e(),
              t.current = e,
              function() {
                  t.current = null
              }
      }
      function ld(e, t, n) {
          return n = n != null ? n.concat([e]) : null,
          Hi(4, 4, id.bind(null, t, e), n)
      }
      function ds() {}
      function ud(e, t) {
          var n = ht();
          t = t === void 0 ? null : t;
          var r = n.memoizedState;
          return r !== null && t !== null && ss(t, r[1]) ? r[0] : (n.memoizedState = [e, t],
          e)
      }
      function sd(e, t) {
          var n = ht();
          t = t === void 0 ? null : t;
          var r = n.memoizedState;
          return r !== null && t !== null && ss(t, r[1]) ? r[0] : (e = e(),
          n.memoizedState = [e, t],
          e)
      }
      function ad(e, t, n) {
          return Tn & 21 ? (Et(n, t) || (n = df(),
          _e.lanes |= n,
          An |= n,
          e.baseState = !0),
          t) : (e.baseState && (e.baseState = !1,
          Ke = !0),
          e.memoizedState = n)
      }
      function Jp(e, t) {
          var n = fe;
          fe = n !== 0 && 4 > n ? n : 4,
          e(!0);
          var r = Rl.transition;
          Rl.transition = {};
          try {
              e(!1),
              t()
          } finally {
              fe = n,
              Rl.transition = r
          }
      }
      function cd() {
          return ht().memoizedState
      }
      function bp(e, t, n) {
          var r = fn(e);
          if (n = {
              lane: r,
              action: n,
              hasEagerState: !1,
              eagerState: null,
              next: null
          },
          fd(e))
              dd(t, n);
          else if (n = Vf(e, t, n, r),
          n !== null) {
              var o = qe();
              Ct(n, e, r, o),
              pd(n, t, r)
          }
      }
      function e0(e, t, n) {
          var r = fn(e)
            , o = {
              lane: r,
              action: n,
              hasEagerState: !1,
              eagerState: null,
              next: null
          };
          if (fd(e))
              dd(t, o);
          else {
              var i = e.alternate;
              if (e.lanes === 0 && (i === null || i.lanes === 0) && (i = t.lastRenderedReducer,
              i !== null))
                  try {
                      var l = t.lastRenderedState
                        , s = i(l, n);
                      if (o.hasEagerState = !0,
                      o.eagerState = s,
                      Et(s, l)) {
                          var a = t.interleaved;
                          a === null ? (o.next = o,
                          rs(t)) : (o.next = a.next,
                          a.next = o),
                          t.interleaved = o;
                          return
                      }
                  } catch {} finally {}
              n = Vf(e, t, o, r),
              n !== null && (o = qe(),
              Ct(n, e, r, o),
              pd(n, t, r))
          }
      }
      function fd(e) {
          var t = e.alternate;
          return e === _e || t !== null && t === _e
      }
      function dd(e, t) {
          $r = Mi = !0;
          var n = e.pending;
          n === null ? t.next = t : (t.next = n.next,
          n.next = t),
          e.pending = t
      }
      function pd(e, t, n) {
          if (n & 4194240) {
              var r = t.lanes;
              r &= e.pendingLanes,
              n |= r,
              t.lanes = n,
              Qu(e, n)
          }
      }
      var Pi = {
          readContext: pt,
          useCallback: Ue,
          useContext: Ue,
          useEffect: Ue,
          useImperativeHandle: Ue,
          useInsertionEffect: Ue,
          useLayoutEffect: Ue,
          useMemo: Ue,
          useReducer: Ue,
          useRef: Ue,
          useState: Ue,
          useDebugValue: Ue,
          useDeferredValue: Ue,
          useTransition: Ue,
          useMutableSource: Ue,
          useSyncExternalStore: Ue,
          useId: Ue,
          unstable_isNewReconciler: !1
      }
        , t0 = {
          readContext: pt,
          useCallback: function(e, t) {
              return Lt().memoizedState = [e, t === void 0 ? null : t],
              e
          },
          useContext: pt,
          useEffect: xc,
          useImperativeHandle: function(e, t, n) {
              return n = n != null ? n.concat([e]) : null,
              ii(4194308, 4, id.bind(null, t, e), n)
          },
          useLayoutEffect: function(e, t) {
              return ii(4194308, 4, e, t)
          },
          useInsertionEffect: function(e, t) {
              return ii(4, 2, e, t)
          },
          useMemo: function(e, t) {
              var n = Lt();
              return t = t === void 0 ? null : t,
              e = e(),
              n.memoizedState = [e, t],
              e
          },
          useReducer: function(e, t, n) {
              var r = Lt();
              return t = n !== void 0 ? n(t) : t,
              r.memoizedState = r.baseState = t,
              e = {
                  pending: null,
                  interleaved: null,
                  lanes: 0,
                  dispatch: null,
                  lastRenderedReducer: e,
                  lastRenderedState: t
              },
              r.queue = e,
              e = e.dispatch = bp.bind(null, _e, e),
              [r.memoizedState, e]
          },
          useRef: function(e) {
              var t = Lt();
              return e = {
                  current: e
              },
              t.memoizedState = e
          },
          useState: Sc,
          useDebugValue: ds,
          useDeferredValue: function(e) {
              return Lt().memoizedState = e
          },
          useTransition: function() {
              var e = Sc(!1)
                , t = e[0];
              return e = Jp.bind(null, e[1]),
              Lt().memoizedState = e,
              [t, e]
          },
          useMutableSource: function() {},
          useSyncExternalStore: function(e, t, n) {
              var r = _e
                , o = Lt();
              if (we) {
                  if (n === void 0)
                      throw Error(B(407));
                  n = n()
              } else {
                  if (n = t(),
                  Ae === null)
                      throw Error(B(349));
                  Tn & 30 || Kf(r, t, n)
              }
              o.memoizedState = n;
              var i = {
                  value: n,
                  getSnapshot: t
              };
              return o.queue = i,
              xc(bf.bind(null, r, i, e), [e]),
              r.flags |= 2048,
              fo(9, Jf.bind(null, r, i, n, t), void 0, null),
              n
          },
          useId: function() {
              var e = Lt()
                , t = Ae.identifierPrefix;
              if (we) {
                  var n = Ut
                    , r = Ft;
                  n = (r & ~(1 << 32 - _t(r) - 1)).toString(32) + n,
                  t = ":" + t + "R" + n,
                  n = ao++,
                  0 < n && (t += "H" + n.toString(32)),
                  t += ":"
              } else
                  n = Kp++,
                  t = ":" + t + "r" + n.toString(32) + ":";
              return e.memoizedState = t
          },
          unstable_isNewReconciler: !1
      }
        , n0 = {
          readContext: pt,
          useCallback: ud,
          useContext: pt,
          useEffect: fs,
          useImperativeHandle: ld,
          useInsertionEffect: rd,
          useLayoutEffect: od,
          useMemo: sd,
          useReducer: jl,
          useRef: nd,
          useState: function() {
              return jl(co)
          },
          useDebugValue: ds,
          useDeferredValue: function(e) {
              var t = ht();
              return ad(t, De.memoizedState, e)
          },
          useTransition: function() {
              var e = jl(co)[0]
                , t = ht().memoizedState;
              return [e, t]
          },
          useMutableSource: Yf,
          useSyncExternalStore: Xf,
          useId: cd,
          unstable_isNewReconciler: !1
      }
        , r0 = {
          readContext: pt,
          useCallback: ud,
          useContext: pt,
          useEffect: fs,
          useImperativeHandle: ld,
          useInsertionEffect: rd,
          useLayoutEffect: od,
          useMemo: sd,
          useReducer: Bl,
          useRef: nd,
          useState: function() {
              return Bl(co)
          },
          useDebugValue: ds,
          useDeferredValue: function(e) {
              var t = ht();
              return De === null ? t.memoizedState = e : ad(t, De.memoizedState, e)
          },
          useTransition: function() {
              var e = Bl(co)[0]
                , t = ht().memoizedState;
              return [e, t]
          },
          useMutableSource: Yf,
          useSyncExternalStore: Xf,
          useId: cd,
          unstable_isNewReconciler: !1
      };
      function vr(e, t) {
          try {
              var n = ""
                , r = t;
              do
                  n += I1(r),
                  r = r.return;
              while (r);
              var o = n
          } catch (i) {
              o = `
Error generating stack: ` + i.message + `
` + i.stack
          }
          return {
              value: e,
              source: t,
              stack: o,
              digest: null
          }
      }
      function Fl(e, t, n) {
          return {
              value: e,
              source: null,
              stack: n ?? null,
              digest: t ?? null
          }
      }
      function Su(e, t) {
          try {
              console.error(t.value)
          } catch (n) {
              setTimeout(function() {
                  throw n
              })
          }
      }
      var o0 = typeof WeakMap == "function" ? WeakMap : Map;
      function hd(e, t, n) {
          n = Ht(-1, n),
          n.tag = 3,
          n.payload = {
              element: null
          };
          var r = t.value;
          return n.callback = function() {
              zi || (zi = !0,
              Du = r),
              Su(e, t)
          }
          ,
          n
      }
      function md(e, t, n) {
          n = Ht(-1, n),
          n.tag = 3;
          var r = e.type.getDerivedStateFromError;
          if (typeof r == "function") {
              var o = t.value;
              n.payload = function() {
                  return r(o)
              }
              ,
              n.callback = function() {
                  Su(e, t)
              }
          }
          var i = e.stateNode;
          return i !== null && typeof i.componentDidCatch == "function" && (n.callback = function() {
              Su(e, t),
              typeof r != "function" && (cn === null ? cn = new Set([this]) : cn.add(this));
              var l = t.stack;
              this.componentDidCatch(t.value, {
                  componentStack: l !== null ? l : ""
              })
          }
          ),
          n
      }
      function _c(e, t, n) {
          var r = e.pingCache;
          if (r === null) {
              r = e.pingCache = new o0;
              var o = new Set;
              r.set(t, o)
          } else
              o = r.get(t),
              o === void 0 && (o = new Set,
              r.set(t, o));
          o.has(n) || (o.add(n),
          e = y0.bind(null, e, t, n),
          t.then(e, e))
      }
      function Cc(e) {
          do {
              var t;
              if ((t = e.tag === 13) && (t = e.memoizedState,
              t = t !== null ? t.dehydrated !== null : !0),
              t)
                  return e;
              e = e.return
          } while (e !== null);
          return null
      }
      function Ec(e, t, n, r, o) {
          return e.mode & 1 ? (e.flags |= 65536,
          e.lanes = o,
          e) : (e === t ? e.flags |= 65536 : (e.flags |= 128,
          n.flags |= 131072,
          n.flags &= -52805,
          n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = Ht(-1, 1),
          t.tag = 2,
          an(n, t, 1))),
          n.lanes |= 1),
          e)
      }
      var i0 = $t.ReactCurrentOwner
        , Ke = !1;
      function $e(e, t, n, r) {
          t.child = e === null ? qf(t, null, n, r) : hr(t, e.child, n, r)
      }
      function Nc(e, t, n, r, o) {
          n = n.render;
          var i = t.ref;
          return ar(t, o),
          r = as(e, t, n, r, i, o),
          n = cs(),
          e !== null && !Ke ? (t.updateQueue = e.updateQueue,
          t.flags &= -2053,
          e.lanes &= ~o,
          Wt(e, t, o)) : (we && n && Ku(t),
          t.flags |= 1,
          $e(e, t, r, o),
          t.child)
      }
      function Mc(e, t, n, r, o) {
          if (e === null) {
              var i = n.type;
              return typeof i == "function" && !ks(i) && i.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15,
              t.type = i,
              vd(e, t, i, r, o)) : (e = ai(n.type, null, r, t, t.mode, o),
              e.ref = t.ref,
              e.return = t,
              t.child = e)
          }
          if (i = e.child,
          !(e.lanes & o)) {
              var l = i.memoizedProps;
              if (n = n.compare,
              n = n !== null ? n : ro,
              n(l, r) && e.ref === t.ref)
                  return Wt(e, t, o)
          }
          return t.flags |= 1,
          e = dn(i, r),
          e.ref = t.ref,
          e.return = t,
          t.child = e
      }
      function vd(e, t, n, r, o) {
          if (e !== null) {
              var i = e.memoizedProps;
              if (ro(i, r) && e.ref === t.ref)
                  if (Ke = !1,
                  t.pendingProps = r = i,
                  (e.lanes & o) !== 0)
                      e.flags & 131072 && (Ke = !0);
                  else
                      return t.lanes = e.lanes,
                      Wt(e, t, o)
          }
          return xu(e, t, n, r, o)
      }
      function gd(e, t, n) {
          var r = t.pendingProps
            , o = r.children
            , i = e !== null ? e.memoizedState : null;
          if (r.mode === "hidden")
              if (!(t.mode & 1))
                  t.memoizedState = {
                      baseLanes: 0,
                      cachePool: null,
                      transitions: null
                  },
                  pe(or, tt),
                  tt |= n;
              else {
                  if (!(n & 1073741824))
                      return e = i !== null ? i.baseLanes | n : n,
                      t.lanes = t.childLanes = 1073741824,
                      t.memoizedState = {
                          baseLanes: e,
                          cachePool: null,
                          transitions: null
                      },
                      t.updateQueue = null,
                      pe(or, tt),
                      tt |= e,
                      null;
                  t.memoizedState = {
                      baseLanes: 0,
                      cachePool: null,
                      transitions: null
                  },
                  r = i !== null ? i.baseLanes : n,
                  pe(or, tt),
                  tt |= r
              }
          else
              i !== null ? (r = i.baseLanes | n,
              t.memoizedState = null) : r = n,
              pe(or, tt),
              tt |= r;
          return $e(e, t, o, n),
          t.child
      }
      function yd(e, t) {
          var n = t.ref;
          (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512,
          t.flags |= 2097152)
      }
      function xu(e, t, n, r, o) {
          var i = be(n) ? On : Qe.current;
          return i = dr(t, i),
          ar(t, o),
          n = as(e, t, n, r, i, o),
          r = cs(),
          e !== null && !Ke ? (t.updateQueue = e.updateQueue,
          t.flags &= -2053,
          e.lanes &= ~o,
          Wt(e, t, o)) : (we && r && Ku(t),
          t.flags |= 1,
          $e(e, t, n, o),
          t.child)
      }
      function Pc(e, t, n, r, o) {
          if (be(n)) {
              var i = !0;
              ki(t)
          } else
              i = !1;
          if (ar(t, o),
          t.stateNode === null)
              li(e, t),
              Wf(t, n, r),
              ku(t, n, r, o),
              r = !0;
          else if (e === null) {
              var l = t.stateNode
                , s = t.memoizedProps;
              l.props = s;
              var a = l.context
                , k = n.contextType;
              typeof k == "object" && k !== null ? k = pt(k) : (k = be(n) ? On : Qe.current,
              k = dr(t, k));
              var L = n.getDerivedStateFromProps
                , I = typeof L == "function" || typeof l.getSnapshotBeforeUpdate == "function";
              I || typeof l.UNSAFE_componentWillReceiveProps != "function" && typeof l.componentWillReceiveProps != "function" || (s !== r || a !== k) && wc(t, l, r, k),
              bt = !1;
              var E = t.memoizedState;
              l.state = E,
              Ei(t, r, l, o),
              a = t.memoizedState,
              s !== r || E !== a || Je.current || bt ? (typeof L == "function" && (wu(t, n, L, r),
              a = t.memoizedState),
              (s = bt || yc(t, n, s, r, E, a, k)) ? (I || typeof l.UNSAFE_componentWillMount != "function" && typeof l.componentWillMount != "function" || (typeof l.componentWillMount == "function" && l.componentWillMount(),
              typeof l.UNSAFE_componentWillMount == "function" && l.UNSAFE_componentWillMount()),
              typeof l.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof l.componentDidMount == "function" && (t.flags |= 4194308),
              t.memoizedProps = r,
              t.memoizedState = a),
              l.props = r,
              l.state = a,
              l.context = k,
              r = s) : (typeof l.componentDidMount == "function" && (t.flags |= 4194308),
              r = !1)
          } else {
              l = t.stateNode,
              Qf(e, t),
              s = t.memoizedProps,
              k = t.type === t.elementType ? s : kt(t.type, s),
              l.props = k,
              I = t.pendingProps,
              E = l.context,
              a = n.contextType,
              typeof a == "object" && a !== null ? a = pt(a) : (a = be(n) ? On : Qe.current,
              a = dr(t, a));
              var R = n.getDerivedStateFromProps;
              (L = typeof R == "function" || typeof l.getSnapshotBeforeUpdate == "function") || typeof l.UNSAFE_componentWillReceiveProps != "function" && typeof l.componentWillReceiveProps != "function" || (s !== I || E !== a) && wc(t, l, r, a),
              bt = !1,
              E = t.memoizedState,
              l.state = E,
              Ei(t, r, l, o);
              var V = t.memoizedState;
              s !== I || E !== V || Je.current || bt ? (typeof R == "function" && (wu(t, n, R, r),
              V = t.memoizedState),
              (k = bt || yc(t, n, k, r, E, V, a) || !1) ? (L || typeof l.UNSAFE_componentWillUpdate != "function" && typeof l.componentWillUpdate != "function" || (typeof l.componentWillUpdate == "function" && l.componentWillUpdate(r, V, a),
              typeof l.UNSAFE_componentWillUpdate == "function" && l.UNSAFE_componentWillUpdate(r, V, a)),
              typeof l.componentDidUpdate == "function" && (t.flags |= 4),
              typeof l.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof l.componentDidUpdate != "function" || s === e.memoizedProps && E === e.memoizedState || (t.flags |= 4),
              typeof l.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && E === e.memoizedState || (t.flags |= 1024),
              t.memoizedProps = r,
              t.memoizedState = V),
              l.props = r,
              l.state = V,
              l.context = a,
              r = k) : (typeof l.componentDidUpdate != "function" || s === e.memoizedProps && E === e.memoizedState || (t.flags |= 4),
              typeof l.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && E === e.memoizedState || (t.flags |= 1024),
              r = !1)
          }
          return _u(e, t, n, r, i, o)
      }
      function _u(e, t, n, r, o, i) {
          yd(e, t);
          var l = (t.flags & 128) !== 0;
          if (!r && !l)
              return o && pc(t, n, !1),
              Wt(e, t, i);
          r = t.stateNode,
          i0.current = t;
          var s = l && typeof n.getDerivedStateFromError != "function" ? null : r.render();
          return t.flags |= 1,
          e !== null && l ? (t.child = hr(t, e.child, null, i),
          t.child = hr(t, null, s, i)) : $e(e, t, s, i),
          t.memoizedState = r.state,
          o && pc(t, n, !0),
          t.child
      }
      function wd(e) {
          var t = e.stateNode;
          t.pendingContext ? dc(e, t.pendingContext, t.pendingContext !== t.context) : t.context && dc(e, t.context, !1),
          is(e, t.containerInfo)
      }
      function Lc(e, t, n, r, o) {
          return pr(),
          bu(o),
          t.flags |= 256,
          $e(e, t, n, r),
          t.child
      }
      var Cu = {
          dehydrated: null,
          treeContext: null,
          retryLane: 0
      };
      function Eu(e) {
          return {
              baseLanes: e,
              cachePool: null,
              transitions: null
          }
      }
      function kd(e, t, n) {
          var r = t.pendingProps, o = xe.current, i = !1, l = (t.flags & 128) !== 0, s;
          if ((s = l) || (s = e !== null && e.memoizedState === null ? !1 : (o & 2) !== 0),
          s ? (i = !0,
          t.flags &= -129) : (e === null || e.memoizedState !== null) && (o |= 1),
          pe(xe, o & 1),
          e === null)
              return gu(t),
              e = t.memoizedState,
              e !== null && (e = e.dehydrated,
              e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1,
              null) : (l = r.children,
              e = r.fallback,
              i ? (r = t.mode,
              i = t.child,
              l = {
                  mode: "hidden",
                  children: l
              },
              !(r & 1) && i !== null ? (i.childLanes = 0,
              i.pendingProps = l) : i = Zi(l, r, 0, null),
              e = Dn(e, r, n, null),
              i.return = t,
              e.return = t,
              i.sibling = e,
              t.child = i,
              t.child.memoizedState = Eu(n),
              t.memoizedState = Cu,
              e) : ps(t, l));
          if (o = e.memoizedState,
          o !== null && (s = o.dehydrated,
          s !== null))
              return l0(e, t, l, r, s, o, n);
          if (i) {
              i = r.fallback,
              l = t.mode,
              o = e.child,
              s = o.sibling;
              var a = {
                  mode: "hidden",
                  children: r.children
              };
              return !(l & 1) && t.child !== o ? (r = t.child,
              r.childLanes = 0,
              r.pendingProps = a,
              t.deletions = null) : (r = dn(o, a),
              r.subtreeFlags = o.subtreeFlags & 14680064),
              s !== null ? i = dn(s, i) : (i = Dn(i, l, n, null),
              i.flags |= 2),
              i.return = t,
              r.return = t,
              r.sibling = i,
              t.child = r,
              r = i,
              i = t.child,
              l = e.child.memoizedState,
              l = l === null ? Eu(n) : {
                  baseLanes: l.baseLanes | n,
                  cachePool: null,
                  transitions: l.transitions
              },
              i.memoizedState = l,
              i.childLanes = e.childLanes & ~n,
              t.memoizedState = Cu,
              r
          }
          return i = e.child,
          e = i.sibling,
          r = dn(i, {
              mode: "visible",
              children: r.children
          }),
          !(t.mode & 1) && (r.lanes = n),
          r.return = t,
          r.sibling = null,
          e !== null && (n = t.deletions,
          n === null ? (t.deletions = [e],
          t.flags |= 16) : n.push(e)),
          t.child = r,
          t.memoizedState = null,
          r
      }
      function ps(e, t) {
          return t = Zi({
              mode: "visible",
              children: t
          }, e.mode, 0, null),
          t.return = e,
          e.child = t
      }
      function Ko(e, t, n, r) {
          return r !== null && bu(r),
          hr(t, e.child, null, n),
          e = ps(t, t.pendingProps.children),
          e.flags |= 2,
          t.memoizedState = null,
          e
      }
      function l0(e, t, n, r, o, i, l) {
          if (n)
              return t.flags & 256 ? (t.flags &= -257,
              r = Fl(Error(B(422))),
              Ko(e, t, l, r)) : t.memoizedState !== null ? (t.child = e.child,
              t.flags |= 128,
              null) : (i = r.fallback,
              o = t.mode,
              r = Zi({
                  mode: "visible",
                  children: r.children
              }, o, 0, null),
              i = Dn(i, o, l, null),
              i.flags |= 2,
              r.return = t,
              i.return = t,
              r.sibling = i,
              t.child = r,
              t.mode & 1 && hr(t, e.child, null, l),
              t.child.memoizedState = Eu(l),
              t.memoizedState = Cu,
              i);
          if (!(t.mode & 1))
              return Ko(e, t, l, null);
          if (o.data === "$!") {
              if (r = o.nextSibling && o.nextSibling.dataset,
              r)
                  var s = r.dgst;
              return r = s,
              i = Error(B(419)),
              r = Fl(i, r, void 0),
              Ko(e, t, l, r)
          }
          if (s = (l & e.childLanes) !== 0,
          Ke || s) {
              if (r = Ae,
              r !== null) {
                  switch (l & -l) {
                  case 4:
                      o = 2;
                      break;
                  case 16:
                      o = 8;
                      break;
                  case 64:
                  case 128:
                  case 256:
                  case 512:
                  case 1024:
                  case 2048:
                  case 4096:
                  case 8192:
                  case 16384:
                  case 32768:
                  case 65536:
                  case 131072:
                  case 262144:
                  case 524288:
                  case 1048576:
                  case 2097152:
                  case 4194304:
                  case 8388608:
                  case 16777216:
                  case 33554432:
                  case 67108864:
                      o = 32;
                      break;
                  case 536870912:
                      o = 268435456;
                      break;
                  default:
                      o = 0
                  }
                  o = o & (r.suspendedLanes | l) ? 0 : o,
                  o !== 0 && o !== i.retryLane && (i.retryLane = o,
                  Zt(e, o),
                  Ct(r, e, o, -1))
              }
              return ws(),
              r = Fl(Error(B(421))),
              Ko(e, t, l, r)
          }
          return o.data === "$?" ? (t.flags |= 128,
          t.child = e.child,
          t = w0.bind(null, e),
          o._reactRetry = t,
          null) : (e = i.treeContext,
          nt = sn(o.nextSibling),
          rt = t,
          we = !0,
          xt = null,
          e !== null && (at[ct++] = Ft,
          at[ct++] = Ut,
          at[ct++] = In,
          Ft = e.id,
          Ut = e.overflow,
          In = t),
          t = ps(t, r.children),
          t.flags |= 4096,
          t)
      }
      function zc(e, t, n) {
          e.lanes |= t;
          var r = e.alternate;
          r !== null && (r.lanes |= t),
          yu(e.return, t, n)
      }
      function Ul(e, t, n, r, o) {
          var i = e.memoizedState;
          i === null ? e.memoizedState = {
              isBackwards: t,
              rendering: null,
              renderingStartTime: 0,
              last: r,
              tail: n,
              tailMode: o
          } : (i.isBackwards = t,
          i.rendering = null,
          i.renderingStartTime = 0,
          i.last = r,
          i.tail = n,
          i.tailMode = o)
      }
      function Sd(e, t, n) {
          var r = t.pendingProps
            , o = r.revealOrder
            , i = r.tail;
          if ($e(e, t, r.children, n),
          r = xe.current,
          r & 2)
              r = r & 1 | 2,
              t.flags |= 128;
          else {
              if (e !== null && e.flags & 128)
                  e: for (e = t.child; e !== null; ) {
                      if (e.tag === 13)
                          e.memoizedState !== null && zc(e, n, t);
                      else if (e.tag === 19)
                          zc(e, n, t);
                      else if (e.child !== null) {
                          e.child.return = e,
                          e = e.child;
                          continue
                      }
                      if (e === t)
                          break e;
                      for (; e.sibling === null; ) {
                          if (e.return === null || e.return === t)
                              break e;
                          e = e.return
                      }
                      e.sibling.return = e.return,
                      e = e.sibling
                  }
              r &= 1
          }
          if (pe(xe, r),
          !(t.mode & 1))
              t.memoizedState = null;
          else
              switch (o) {
              case "forwards":
                  for (n = t.child,
                  o = null; n !== null; )
                      e = n.alternate,
                      e !== null && Ni(e) === null && (o = n),
                      n = n.sibling;
                  n = o,
                  n === null ? (o = t.child,
                  t.child = null) : (o = n.sibling,
                  n.sibling = null),
                  Ul(t, !1, o, n, i);
                  break;
              case "backwards":
                  for (n = null,
                  o = t.child,
                  t.child = null; o !== null; ) {
                      if (e = o.alternate,
                      e !== null && Ni(e) === null) {
                          t.child = o;
                          break
                      }
                      e = o.sibling,
                      o.sibling = n,
                      n = o,
                      o = e
                  }
                  Ul(t, !0, n, null, i);
                  break;
              case "together":
                  Ul(t, !1, null, null, void 0);
                  break;
              default:
                  t.memoizedState = null
              }
          return t.child
      }
      function li(e, t) {
          !(t.mode & 1) && e !== null && (e.alternate = null,
          t.alternate = null,
          t.flags |= 2)
      }
      function Wt(e, t, n) {
          if (e !== null && (t.dependencies = e.dependencies),
          An |= t.lanes,
          !(n & t.childLanes))
              return null;
          if (e !== null && t.child !== e.child)
              throw Error(B(153));
          if (t.child !== null) {
              for (e = t.child,
              n = dn(e, e.pendingProps),
              t.child = n,
              n.return = t; e.sibling !== null; )
                  e = e.sibling,
                  n = n.sibling = dn(e, e.pendingProps),
                  n.return = t;
              n.sibling = null
          }
          return t.child
      }
      function u0(e, t, n) {
          switch (t.tag) {
          case 3:
              wd(t),
              pr();
              break;
          case 5:
              Gf(t);
              break;
          case 1:
              be(t.type) && ki(t);
              break;
          case 4:
              is(t, t.stateNode.containerInfo);
              break;
          case 10:
              var r = t.type._context
                , o = t.memoizedProps.value;
              pe(_i, r._currentValue),
              r._currentValue = o;
              break;
          case 13:
              if (r = t.memoizedState,
              r !== null)
                  return r.dehydrated !== null ? (pe(xe, xe.current & 1),
                  t.flags |= 128,
                  null) : n & t.child.childLanes ? kd(e, t, n) : (pe(xe, xe.current & 1),
                  e = Wt(e, t, n),
                  e !== null ? e.sibling : null);
              pe(xe, xe.current & 1);
              break;
          case 19:
              if (r = (n & t.childLanes) !== 0,
              e.flags & 128) {
                  if (r)
                      return Sd(e, t, n);
                  t.flags |= 128
              }
              if (o = t.memoizedState,
              o !== null && (o.rendering = null,
              o.tail = null,
              o.lastEffect = null),
              pe(xe, xe.current),
              r)
                  break;
              return null;
          case 22:
          case 23:
              return t.lanes = 0,
              gd(e, t, n)
          }
          return Wt(e, t, n)
      }
      var xd, Nu, _d, Cd;
      xd = function(e, t) {
          for (var n = t.child; n !== null; ) {
              if (n.tag === 5 || n.tag === 6)
                  e.appendChild(n.stateNode);
              else if (n.tag !== 4 && n.child !== null) {
                  n.child.return = n,
                  n = n.child;
                  continue
              }
              if (n === t)
                  break;
              for (; n.sibling === null; ) {
                  if (n.return === null || n.return === t)
                      return;
                  n = n.return
              }
              n.sibling.return = n.return,
              n = n.sibling
          }
      }
      ;
      Nu = function() {}
      ;
      _d = function(e, t, n, r) {
          var o = e.memoizedProps;
          if (o !== r) {
              e = t.stateNode,
              Ln(Ot.current);
              var i = null;
              switch (n) {
              case "input":
                  o = Gl(e, o),
                  r = Gl(e, r),
                  i = [];
                  break;
              case "select":
                  o = Ce({}, o, {
                      value: void 0
                  }),
                  r = Ce({}, r, {
                      value: void 0
                  }),
                  i = [];
                  break;
              case "textarea":
                  o = Kl(e, o),
                  r = Kl(e, r),
                  i = [];
                  break;
              default:
                  typeof o.onClick != "function" && typeof r.onClick == "function" && (e.onclick = yi)
              }
              bl(n, r);
              var l;
              n = null;
              for (k in o)
                  if (!r.hasOwnProperty(k) && o.hasOwnProperty(k) && o[k] != null)
                      if (k === "style") {
                          var s = o[k];
                          for (l in s)
                              s.hasOwnProperty(l) && (n || (n = {}),
                              n[l] = "")
                      } else
                          k !== "dangerouslySetInnerHTML" && k !== "children" && k !== "suppressContentEditableWarning" && k !== "suppressHydrationWarning" && k !== "autoFocus" && (Xr.hasOwnProperty(k) ? i || (i = []) : (i = i || []).push(k, null));
              for (k in r) {
                  var a = r[k];
                  if (s = o?.[k],
                  r.hasOwnProperty(k) && a !== s && (a != null || s != null))
                      if (k === "style")
                          if (s) {
                              for (l in s)
                                  !s.hasOwnProperty(l) || a && a.hasOwnProperty(l) || (n || (n = {}),
                                  n[l] = "");
                              for (l in a)
                                  a.hasOwnProperty(l) && s[l] !== a[l] && (n || (n = {}),
                                  n[l] = a[l])
                          } else
                              n || (i || (i = []),
                              i.push(k, n)),
                              n = a;
                      else
                          k === "dangerouslySetInnerHTML" ? (a = a ? a.__html : void 0,
                          s = s ? s.__html : void 0,
                          a != null && s !== a && (i = i || []).push(k, a)) : k === "children" ? typeof a != "string" && typeof a != "number" || (i = i || []).push(k, "" + a) : k !== "suppressContentEditableWarning" && k !== "suppressHydrationWarning" && (Xr.hasOwnProperty(k) ? (a != null && k === "onScroll" && ve("scroll", e),
                          i || s === a || (i = [])) : (i = i || []).push(k, a))
              }
              n && (i = i || []).push("style", n);
              var k = i;
              (t.updateQueue = k) && (t.flags |= 4)
          }
      }
      ;
      Cd = function(e, t, n, r) {
          n !== r && (t.flags |= 4)
      }
      ;
      function Tr(e, t) {
          if (!we)
              switch (e.tailMode) {
              case "hidden":
                  t = e.tail;
                  for (var n = null; t !== null; )
                      t.alternate !== null && (n = t),
                      t = t.sibling;
                  n === null ? e.tail = null : n.sibling = null;
                  break;
              case "collapsed":
                  n = e.tail;
                  for (var r = null; n !== null; )
                      n.alternate !== null && (r = n),
                      n = n.sibling;
                  r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null
              }
      }
      function He(e) {
          var t = e.alternate !== null && e.alternate.child === e.child
            , n = 0
            , r = 0;
          if (t)
              for (var o = e.child; o !== null; )
                  n |= o.lanes | o.childLanes,
                  r |= o.subtreeFlags & 14680064,
                  r |= o.flags & 14680064,
                  o.return = e,
                  o = o.sibling;
          else
              for (o = e.child; o !== null; )
                  n |= o.lanes | o.childLanes,
                  r |= o.subtreeFlags,
                  r |= o.flags,
                  o.return = e,
                  o = o.sibling;
          return e.subtreeFlags |= r,
          e.childLanes = n,
          t
      }
      function s0(e, t, n) {
          var r = t.pendingProps;
          switch (Ju(t),
          t.tag) {
          case 2:
          case 16:
          case 15:
          case 0:
          case 11:
          case 7:
          case 8:
          case 12:
          case 9:
          case 14:
              return He(t),
              null;
          case 1:
              return be(t.type) && wi(),
              He(t),
              null;
          case 3:
              return r = t.stateNode,
              mr(),
              ge(Je),
              ge(Qe),
              us(),
              r.pendingContext && (r.context = r.pendingContext,
              r.pendingContext = null),
              (e === null || e.child === null) && (Yo(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024,
              xt !== null && (Tu(xt),
              xt = null))),
              Nu(e, t),
              He(t),
              null;
          case 5:
              ls(t);
              var o = Ln(so.current);
              if (n = t.type,
              e !== null && t.stateNode != null)
                  _d(e, t, n, r, o),
                  e.ref !== t.ref && (t.flags |= 512,
                  t.flags |= 2097152);
              else {
                  if (!r) {
                      if (t.stateNode === null)
                          throw Error(B(166));
                      return He(t),
                      null
                  }
                  if (e = Ln(Ot.current),
                  Yo(t)) {
                      r = t.stateNode,
                      n = t.type;
                      var i = t.memoizedProps;
                      switch (r[zt] = t,
                      r[lo] = i,
                      e = (t.mode & 1) !== 0,
                      n) {
                      case "dialog":
                          ve("cancel", r),
                          ve("close", r);
                          break;
                      case "iframe":
                      case "object":
                      case "embed":
                          ve("load", r);
                          break;
                      case "video":
                      case "audio":
                          for (o = 0; o < Ur.length; o++)
                              ve(Ur[o], r);
                          break;
                      case "source":
                          ve("error", r);
                          break;
                      case "img":
                      case "image":
                      case "link":
                          ve("error", r),
                          ve("load", r);
                          break;
                      case "details":
                          ve("toggle", r);
                          break;
                      case "input":
                          Ba(r, i),
                          ve("invalid", r);
                          break;
                      case "select":
                          r._wrapperState = {
                              wasMultiple: !!i.multiple
                          },
                          ve("invalid", r);
                          break;
                      case "textarea":
                          Ua(r, i),
                          ve("invalid", r)
                      }
                      bl(n, i),
                      o = null;
                      for (var l in i)
                          if (i.hasOwnProperty(l)) {
                              var s = i[l];
                              l === "children" ? typeof s == "string" ? r.textContent !== s && (i.suppressHydrationWarning !== !0 && Go(r.textContent, s, e),
                              o = ["children", s]) : typeof s == "number" && r.textContent !== "" + s && (i.suppressHydrationWarning !== !0 && Go(r.textContent, s, e),
                              o = ["children", "" + s]) : Xr.hasOwnProperty(l) && s != null && l === "onScroll" && ve("scroll", r)
                          }
                      switch (n) {
                      case "input":
                          Ro(r),
                          Fa(r, i, !0);
                          break;
                      case "textarea":
                          Ro(r),
                          Ha(r);
                          break;
                      case "select":
                      case "option":
                          break;
                      default:
                          typeof i.onClick == "function" && (r.onclick = yi)
                      }
                      r = o,
                      t.updateQueue = r,
                      r !== null && (t.flags |= 4)
                  } else {
                      l = o.nodeType === 9 ? o : o.ownerDocument,
                      e === "http://www.w3.org/1999/xhtml" && (e = Xc(n)),
                      e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = l.createElement("div"),
                      e.innerHTML = "<script><\/script>",
                      e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = l.createElement(n, {
                          is: r.is
                      }) : (e = l.createElement(n),
                      n === "select" && (l = e,
                      r.multiple ? l.multiple = !0 : r.size && (l.size = r.size))) : e = l.createElementNS(e, n),
                      e[zt] = t,
                      e[lo] = r,
                      xd(e, t, !1, !1),
                      t.stateNode = e;
                      e: {
                          switch (l = eu(n, r),
                          n) {
                          case "dialog":
                              ve("cancel", e),
                              ve("close", e),
                              o = r;
                              break;
                          case "iframe":
                          case "object":
                          case "embed":
                              ve("load", e),
                              o = r;
                              break;
                          case "video":
                          case "audio":
                              for (o = 0; o < Ur.length; o++)
                                  ve(Ur[o], e);
                              o = r;
                              break;
                          case "source":
                              ve("error", e),
                              o = r;
                              break;
                          case "img":
                          case "image":
                          case "link":
                              ve("error", e),
                              ve("load", e),
                              o = r;
                              break;
                          case "details":
                              ve("toggle", e),
                              o = r;
                              break;
                          case "input":
                              Ba(e, r),
                              o = Gl(e, r),
                              ve("invalid", e);
                              break;
                          case "option":
                              o = r;
                              break;
                          case "select":
                              e._wrapperState = {
                                  wasMultiple: !!r.multiple
                              },
                              o = Ce({}, r, {
                                  value: void 0
                              }),
                              ve("invalid", e);
                              break;
                          case "textarea":
                              Ua(e, r),
                              o = Kl(e, r),
                              ve("invalid", e);
                              break;
                          default:
                              o = r
                          }
                          bl(n, o),
                          s = o;
                          for (i in s)
                              if (s.hasOwnProperty(i)) {
                                  var a = s[i];
                                  i === "style" ? bc(e, a) : i === "dangerouslySetInnerHTML" ? (a = a ? a.__html : void 0,
                                  a != null && Kc(e, a)) : i === "children" ? typeof a == "string" ? (n !== "textarea" || a !== "") && Kr(e, a) : typeof a == "number" && Kr(e, "" + a) : i !== "suppressContentEditableWarning" && i !== "suppressHydrationWarning" && i !== "autoFocus" && (Xr.hasOwnProperty(i) ? a != null && i === "onScroll" && ve("scroll", e) : a != null && ju(e, i, a, l))
                              }
                          switch (n) {
                          case "input":
                              Ro(e),
                              Fa(e, r, !1);
                              break;
                          case "textarea":
                              Ro(e),
                              Ha(e);
                              break;
                          case "option":
                              r.value != null && e.setAttribute("value", "" + pn(r.value));
                              break;
                          case "select":
                              e.multiple = !!r.multiple,
                              i = r.value,
                              i != null ? ir(e, !!r.multiple, i, !1) : r.defaultValue != null && ir(e, !!r.multiple, r.defaultValue, !0);
                              break;
                          default:
                              typeof o.onClick == "function" && (e.onclick = yi)
                          }
                          switch (n) {
                          case "button":
                          case "input":
                          case "select":
                          case "textarea":
                              r = !!r.autoFocus;
                              break e;
                          case "img":
                              r = !0;
                              break e;
                          default:
                              r = !1
                          }
                      }
                      r && (t.flags |= 4)
                  }
                  t.ref !== null && (t.flags |= 512,
                  t.flags |= 2097152)
              }
              return He(t),
              null;
          case 6:
              if (e && t.stateNode != null)
                  Cd(e, t, e.memoizedProps, r);
              else {
                  if (typeof r != "string" && t.stateNode === null)
                      throw Error(B(166));
                  if (n = Ln(so.current),
                  Ln(Ot.current),
                  Yo(t)) {
                      if (r = t.stateNode,
                      n = t.memoizedProps,
                      r[zt] = t,
                      (i = r.nodeValue !== n) && (e = rt,
                      e !== null))
                          switch (e.tag) {
                          case 3:
                              Go(r.nodeValue, n, (e.mode & 1) !== 0);
                              break;
                          case 5:
                              e.memoizedProps.suppressHydrationWarning !== !0 && Go(r.nodeValue, n, (e.mode & 1) !== 0)
                          }
                      i && (t.flags |= 4)
                  } else
                      r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r),
                      r[zt] = t,
                      t.stateNode = r
              }
              return He(t),
              null;
          case 13:
              if (ge(xe),
              r = t.memoizedState,
              e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
                  if (we && nt !== null && t.mode & 1 && !(t.flags & 128))
                      Hf(),
                      pr(),
                      t.flags |= 98560,
                      i = !1;
                  else if (i = Yo(t),
                  r !== null && r.dehydrated !== null) {
                      if (e === null) {
                          if (!i)
                              throw Error(B(318));
                          if (i = t.memoizedState,
                          i = i !== null ? i.dehydrated : null,
                          !i)
                              throw Error(B(317));
                          i[zt] = t
                      } else
                          pr(),
                          !(t.flags & 128) && (t.memoizedState = null),
                          t.flags |= 4;
                      He(t),
                      i = !1
                  } else
                      xt !== null && (Tu(xt),
                      xt = null),
                      i = !0;
                  if (!i)
                      return t.flags & 65536 ? t : null
              }
              return t.flags & 128 ? (t.lanes = n,
              t) : (r = r !== null,
              r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192,
              t.mode & 1 && (e === null || xe.current & 1 ? Oe === 0 && (Oe = 3) : ws())),
              t.updateQueue !== null && (t.flags |= 4),
              He(t),
              null);
          case 4:
              return mr(),
              Nu(e, t),
              e === null && oo(t.stateNode.containerInfo),
              He(t),
              null;
          case 10:
              return ns(t.type._context),
              He(t),
              null;
          case 17:
              return be(t.type) && wi(),
              He(t),
              null;
          case 19:
              if (ge(xe),
              i = t.memoizedState,
              i === null)
                  return He(t),
                  null;
              if (r = (t.flags & 128) !== 0,
              l = i.rendering,
              l === null)
                  if (r)
                      Tr(i, !1);
                  else {
                      if (Oe !== 0 || e !== null && e.flags & 128)
                          for (e = t.child; e !== null; ) {
                              if (l = Ni(e),
                              l !== null) {
                                  for (t.flags |= 128,
                                  Tr(i, !1),
                                  r = l.updateQueue,
                                  r !== null && (t.updateQueue = r,
                                  t.flags |= 4),
                                  t.subtreeFlags = 0,
                                  r = n,
                                  n = t.child; n !== null; )
                                      i = n,
                                      e = r,
                                      i.flags &= 14680066,
                                      l = i.alternate,
                                      l === null ? (i.childLanes = 0,
                                      i.lanes = e,
                                      i.child = null,
                                      i.subtreeFlags = 0,
                                      i.memoizedProps = null,
                                      i.memoizedState = null,
                                      i.updateQueue = null,
                                      i.dependencies = null,
                                      i.stateNode = null) : (i.childLanes = l.childLanes,
                                      i.lanes = l.lanes,
                                      i.child = l.child,
                                      i.subtreeFlags = 0,
                                      i.deletions = null,
                                      i.memoizedProps = l.memoizedProps,
                                      i.memoizedState = l.memoizedState,
                                      i.updateQueue = l.updateQueue,
                                      i.type = l.type,
                                      e = l.dependencies,
                                      i.dependencies = e === null ? null : {
                                          lanes: e.lanes,
                                          firstContext: e.firstContext
                                      }),
                                      n = n.sibling;
                                  return pe(xe, xe.current & 1 | 2),
                                  t.child
                              }
                              e = e.sibling
                          }
                      i.tail !== null && Me() > gr && (t.flags |= 128,
                      r = !0,
                      Tr(i, !1),
                      t.lanes = 4194304)
                  }
              else {
                  if (!r)
                      if (e = Ni(l),
                      e !== null) {
                          if (t.flags |= 128,
                          r = !0,
                          n = e.updateQueue,
                          n !== null && (t.updateQueue = n,
                          t.flags |= 4),
                          Tr(i, !0),
                          i.tail === null && i.tailMode === "hidden" && !l.alternate && !we)
                              return He(t),
                              null
                      } else
                          2 * Me() - i.renderingStartTime > gr && n !== 1073741824 && (t.flags |= 128,
                          r = !0,
                          Tr(i, !1),
                          t.lanes = 4194304);
                  i.isBackwards ? (l.sibling = t.child,
                  t.child = l) : (n = i.last,
                  n !== null ? n.sibling = l : t.child = l,
                  i.last = l)
              }
              return i.tail !== null ? (t = i.tail,
              i.rendering = t,
              i.tail = t.sibling,
              i.renderingStartTime = Me(),
              t.sibling = null,
              n = xe.current,
              pe(xe, r ? n & 1 | 2 : n & 1),
              t) : (He(t),
              null);
          case 22:
          case 23:
              return ys(),
              r = t.memoizedState !== null,
              e !== null && e.memoizedState !== null !== r && (t.flags |= 8192),
              r && t.mode & 1 ? tt & 1073741824 && (He(t),
              t.subtreeFlags & 6 && (t.flags |= 8192)) : He(t),
              null;
          case 24:
              return null;
          case 25:
              return null
          }
          throw Error(B(156, t.tag))
      }
      function a0(e, t) {
          switch (Ju(t),
          t.tag) {
          case 1:
              return be(t.type) && wi(),
              e = t.flags,
              e & 65536 ? (t.flags = e & -65537 | 128,
              t) : null;
          case 3:
              return mr(),
              ge(Je),
              ge(Qe),
              us(),
              e = t.flags,
              e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128,
              t) : null;
          case 5:
              return ls(t),
              null;
          case 13:
              if (ge(xe),
              e = t.memoizedState,
              e !== null && e.dehydrated !== null) {
                  if (t.alternate === null)
                      throw Error(B(340));
                  pr()
              }
              return e = t.flags,
              e & 65536 ? (t.flags = e & -65537 | 128,
              t) : null;
          case 19:
              return ge(xe),
              null;
          case 4:
              return mr(),
              null;
          case 10:
              return ns(t.type._context),
              null;
          case 22:
          case 23:
              return ys(),
              null;
          case 24:
              return null;
          default:
              return null
          }
      }
      var Jo = !1
        , Ve = !1
        , c0 = typeof WeakSet == "function" ? WeakSet : Set
        , W = null;
      function rr(e, t) {
          var n = e.ref;
          if (n !== null)
              if (typeof n == "function")
                  try {
                      n(null)
                  } catch (r) {
                      Ne(e, t, r)
                  }
              else
                  n.current = null
      }
      function Mu(e, t, n) {
          try {
              n()
          } catch (r) {
              Ne(e, t, r)
          }
      }
      var Dc = !1;
      function f0(e, t) {
          if (cu = mi,
          e = Pf(),
          Xu(e)) {
              if ("selectionStart"in e)
                  var n = {
                      start: e.selectionStart,
                      end: e.selectionEnd
                  };
              else
                  e: {
                      n = (n = e.ownerDocument) && n.defaultView || window;
                      var r = n.getSelection && n.getSelection();
                      if (r && r.rangeCount !== 0) {
                          n = r.anchorNode;
                          var o = r.anchorOffset
                            , i = r.focusNode;
                          r = r.focusOffset;
                          try {
                              n.nodeType,
                              i.nodeType
                          } catch {
                              n = null;
                              break e
                          }
                          var l = 0
                            , s = -1
                            , a = -1
                            , k = 0
                            , L = 0
                            , I = e
                            , E = null;
                          t: for (; ; ) {
                              for (var R; I !== n || o !== 0 && I.nodeType !== 3 || (s = l + o),
                              I !== i || r !== 0 && I.nodeType !== 3 || (a = l + r),
                              I.nodeType === 3 && (l += I.nodeValue.length),
                              (R = I.firstChild) !== null; )
                                  E = I,
                                  I = R;
                              for (; ; ) {
                                  if (I === e)
                                      break t;
                                  if (E === n && ++k === o && (s = l),
                                  E === i && ++L === r && (a = l),
                                  (R = I.nextSibling) !== null)
                                      break;
                                  I = E,
                                  E = I.parentNode
                              }
                              I = R
                          }
                          n = s === -1 || a === -1 ? null : {
                              start: s,
                              end: a
                          }
                      } else
                          n = null
                  }
              n = n || {
                  start: 0,
                  end: 0
              }
          } else
              n = null;
          for (fu = {
              focusedElem: e,
              selectionRange: n
          },
          mi = !1,
          W = t; W !== null; )
              if (t = W,
              e = t.child,
              (t.subtreeFlags & 1028) !== 0 && e !== null)
                  e.return = t,
                  W = e;
              else
                  for (; W !== null; ) {
                      t = W;
                      try {
                          var V = t.alternate;
                          if (t.flags & 1024)
                              switch (t.tag) {
                              case 0:
                              case 11:
                              case 15:
                                  break;
                              case 1:
                                  if (V !== null) {
                                      var U = V.memoizedProps
                                        , se = V.memoizedState
                                        , w = t.stateNode
                                        , v = w.getSnapshotBeforeUpdate(t.elementType === t.type ? U : kt(t.type, U), se);
                                      w.__reactInternalSnapshotBeforeUpdate = v
                                  }
                                  break;
                              case 3:
                                  var x = t.stateNode.containerInfo;
                                  x.nodeType === 1 ? x.textContent = "" : x.nodeType === 9 && x.documentElement && x.removeChild(x.documentElement);
                                  break;
                              case 5:
                              case 6:
                              case 4:
                              case 17:
                                  break;
                              default:
                                  throw Error(B(163))
                              }
                      } catch (j) {
                          Ne(t, t.return, j)
                      }
                      if (e = t.sibling,
                      e !== null) {
                          e.return = t.return,
                          W = e;
                          break
                      }
                      W = t.return
                  }
          return V = Dc,
          Dc = !1,
          V
      }
      function qr(e, t, n) {
          var r = t.updateQueue;
          if (r = r !== null ? r.lastEffect : null,
          r !== null) {
              var o = r = r.next;
              do {
                  if ((o.tag & e) === e) {
                      var i = o.destroy;
                      o.destroy = void 0,
                      i !== void 0 && Mu(t, n, i)
                  }
                  o = o.next
              } while (o !== r)
          }
      }
      function Vi(e, t) {
          if (t = t.updateQueue,
          t = t !== null ? t.lastEffect : null,
          t !== null) {
              var n = t = t.next;
              do {
                  if ((n.tag & e) === e) {
                      var r = n.create;
                      n.destroy = r()
                  }
                  n = n.next
              } while (n !== t)
          }
      }
      function Pu(e) {
          var t = e.ref;
          if (t !== null) {
              var n = e.stateNode;
              switch (e.tag) {
              case 5:
                  e = n;
                  break;
              default:
                  e = n
              }
              typeof t == "function" ? t(e) : t.current = e
          }
      }
      function Ed(e) {
          var t = e.alternate;
          t !== null && (e.alternate = null,
          Ed(t)),
          e.child = null,
          e.deletions = null,
          e.sibling = null,
          e.tag === 5 && (t = e.stateNode,
          t !== null && (delete t[zt],
          delete t[lo],
          delete t[hu],
          delete t[qp],
          delete t[Gp])),
          e.stateNode = null,
          e.return = null,
          e.dependencies = null,
          e.memoizedProps = null,
          e.memoizedState = null,
          e.pendingProps = null,
          e.stateNode = null,
          e.updateQueue = null
      }
      function Nd(e) {
          return e.tag === 5 || e.tag === 3 || e.tag === 4
      }
      function Oc(e) {
          e: for (; ; ) {
              for (; e.sibling === null; ) {
                  if (e.return === null || Nd(e.return))
                      return null;
                  e = e.return
              }
              for (e.sibling.return = e.return,
              e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
                  if (e.flags & 2 || e.child === null || e.tag === 4)
                      continue e;
                  e.child.return = e,
                  e = e.child
              }
              if (!(e.flags & 2))
                  return e.stateNode
          }
      }
      function Lu(e, t, n) {
          var r = e.tag;
          if (r === 5 || r === 6)
              e = e.stateNode,
              t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode,
              t.insertBefore(e, n)) : (t = n,
              t.appendChild(e)),
              n = n._reactRootContainer,
              n != null || t.onclick !== null || (t.onclick = yi));
          else if (r !== 4 && (e = e.child,
          e !== null))
              for (Lu(e, t, n),
              e = e.sibling; e !== null; )
                  Lu(e, t, n),
                  e = e.sibling
      }
      function zu(e, t, n) {
          var r = e.tag;
          if (r === 5 || r === 6)
              e = e.stateNode,
              t ? n.insertBefore(e, t) : n.appendChild(e);
          else if (r !== 4 && (e = e.child,
          e !== null))
              for (zu(e, t, n),
              e = e.sibling; e !== null; )
                  zu(e, t, n),
                  e = e.sibling
      }
      var Re = null
        , St = !1;
      function Kt(e, t, n) {
          for (n = n.child; n !== null; )
              Md(e, t, n),
              n = n.sibling
      }
      function Md(e, t, n) {
          if (Dt && typeof Dt.onCommitFiberUnmount == "function")
              try {
                  Dt.onCommitFiberUnmount(Ti, n)
              } catch {}
          switch (n.tag) {
          case 5:
              Ve || rr(n, t);
          case 6:
              var r = Re
                , o = St;
              Re = null,
              Kt(e, t, n),
              Re = r,
              St = o,
              Re !== null && (St ? (e = Re,
              n = n.stateNode,
              e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : Re.removeChild(n.stateNode));
              break;
          case 18:
              Re !== null && (St ? (e = Re,
              n = n.stateNode,
              e.nodeType === 8 ? Il(e.parentNode, n) : e.nodeType === 1 && Il(e, n),
              to(e)) : Il(Re, n.stateNode));
              break;
          case 4:
              r = Re,
              o = St,
              Re = n.stateNode.containerInfo,
              St = !0,
              Kt(e, t, n),
              Re = r,
              St = o;
              break;
          case 0:
          case 11:
          case 14:
          case 15:
              if (!Ve && (r = n.updateQueue,
              r !== null && (r = r.lastEffect,
              r !== null))) {
                  o = r = r.next;
                  do {
                      var i = o
                        , l = i.destroy;
                      i = i.tag,
                      l !== void 0 && (i & 2 || i & 4) && Mu(n, t, l),
                      o = o.next
                  } while (o !== r)
              }
              Kt(e, t, n);
              break;
          case 1:
              if (!Ve && (rr(n, t),
              r = n.stateNode,
              typeof r.componentWillUnmount == "function"))
                  try {
                      r.props = n.memoizedProps,
                      r.state = n.memoizedState,
                      r.componentWillUnmount()
                  } catch (s) {
                      Ne(n, t, s)
                  }
              Kt(e, t, n);
              break;
          case 21:
              Kt(e, t, n);
              break;
          case 22:
              n.mode & 1 ? (Ve = (r = Ve) || n.memoizedState !== null,
              Kt(e, t, n),
              Ve = r) : Kt(e, t, n);
              break;
          default:
              Kt(e, t, n)
          }
      }
      function Ic(e) {
          var t = e.updateQueue;
          if (t !== null) {
              e.updateQueue = null;
              var n = e.stateNode;
              n === null && (n = e.stateNode = new c0),
              t.forEach(function(r) {
                  var o = k0.bind(null, e, r);
                  n.has(r) || (n.add(r),
                  r.then(o, o))
              })
          }
      }
      function wt(e, t) {
          var n = t.deletions;
          if (n !== null)
              for (var r = 0; r < n.length; r++) {
                  var o = n[r];
                  try {
                      var i = e
                        , l = t
                        , s = l;
                      e: for (; s !== null; ) {
                          switch (s.tag) {
                          case 5:
                              Re = s.stateNode,
                              St = !1;
                              break e;
                          case 3:
                              Re = s.stateNode.containerInfo,
                              St = !0;
                              break e;
                          case 4:
                              Re = s.stateNode.containerInfo,
                              St = !0;
                              break e
                          }
                          s = s.return
                      }
                      if (Re === null)
                          throw Error(B(160));
                      Md(i, l, o),
                      Re = null,
                      St = !1;
                      var a = o.alternate;
                      a !== null && (a.return = null),
                      o.return = null
                  } catch (k) {
                      Ne(o, t, k)
                  }
              }
          if (t.subtreeFlags & 12854)
              for (t = t.child; t !== null; )
                  Pd(t, e),
                  t = t.sibling
      }
      function Pd(e, t) {
          var n = e.alternate
            , r = e.flags;
          switch (e.tag) {
          case 0:
          case 11:
          case 14:
          case 15:
              if (wt(t, e),
              Pt(e),
              r & 4) {
                  try {
                      qr(3, e, e.return),
                      Vi(3, e)
                  } catch (U) {
                      Ne(e, e.return, U)
                  }
                  try {
                      qr(5, e, e.return)
                  } catch (U) {
                      Ne(e, e.return, U)
                  }
              }
              break;
          case 1:
              wt(t, e),
              Pt(e),
              r & 512 && n !== null && rr(n, n.return);
              break;
          case 5:
              if (wt(t, e),
              Pt(e),
              r & 512 && n !== null && rr(n, n.return),
              e.flags & 32) {
                  var o = e.stateNode;
                  try {
                      Kr(o, "")
                  } catch (U) {
                      Ne(e, e.return, U)
                  }
              }
              if (r & 4 && (o = e.stateNode,
              o != null)) {
                  var i = e.memoizedProps
                    , l = n !== null ? n.memoizedProps : i
                    , s = e.type
                    , a = e.updateQueue;
                  if (e.updateQueue = null,
                  a !== null)
                      try {
                          s === "input" && i.type === "radio" && i.name != null && Gc(o, i),
                          eu(s, l);
                          var k = eu(s, i);
                          for (l = 0; l < a.length; l += 2) {
                              var L = a[l]
                                , I = a[l + 1];
                              L === "style" ? bc(o, I) : L === "dangerouslySetInnerHTML" ? Kc(o, I) : L === "children" ? Kr(o, I) : ju(o, L, I, k)
                          }
                          switch (s) {
                          case "input":
                              Yl(o, i);
                              break;
                          case "textarea":
                              Yc(o, i);
                              break;
                          case "select":
                              var E = o._wrapperState.wasMultiple;
                              o._wrapperState.wasMultiple = !!i.multiple;
                              var R = i.value;
                              R != null ? ir(o, !!i.multiple, R, !1) : E !== !!i.multiple && (i.defaultValue != null ? ir(o, !!i.multiple, i.defaultValue, !0) : ir(o, !!i.multiple, i.multiple ? [] : "", !1))
                          }
                          o[lo] = i
                      } catch (U) {
                          Ne(e, e.return, U)
                      }
              }
              break;
          case 6:
              if (wt(t, e),
              Pt(e),
              r & 4) {
                  if (e.stateNode === null)
                      throw Error(B(162));
                  o = e.stateNode,
                  i = e.memoizedProps;
                  try {
                      o.nodeValue = i
                  } catch (U) {
                      Ne(e, e.return, U)
                  }
              }
              break;
          case 3:
              if (wt(t, e),
              Pt(e),
              r & 4 && n !== null && n.memoizedState.isDehydrated)
                  try {
                      to(t.containerInfo)
                  } catch (U) {
                      Ne(e, e.return, U)
                  }
              break;
          case 4:
              wt(t, e),
              Pt(e);
              break;
          case 13:
              wt(t, e),
              Pt(e),
              o = e.child,
              o.flags & 8192 && (i = o.memoizedState !== null,
              o.stateNode.isHidden = i,
              !i || o.alternate !== null && o.alternate.memoizedState !== null || (vs = Me())),
              r & 4 && Ic(e);
              break;
          case 22:
              if (L = n !== null && n.memoizedState !== null,
              e.mode & 1 ? (Ve = (k = Ve) || L,
              wt(t, e),
              Ve = k) : wt(t, e),
              Pt(e),
              r & 8192) {
                  if (k = e.memoizedState !== null,
                  (e.stateNode.isHidden = k) && !L && e.mode & 1)
                      for (W = e,
                      L = e.child; L !== null; ) {
                          for (I = W = L; W !== null; ) {
                              switch (E = W,
                              R = E.child,
                              E.tag) {
                              case 0:
                              case 11:
                              case 14:
                              case 15:
                                  qr(4, E, E.return);
                                  break;
                              case 1:
                                  rr(E, E.return);
                                  var V = E.stateNode;
                                  if (typeof V.componentWillUnmount == "function") {
                                      r = E,
                                      n = E.return;
                                      try {
                                          t = r,
                                          V.props = t.memoizedProps,
                                          V.state = t.memoizedState,
                                          V.componentWillUnmount()
                                      } catch (U) {
                                          Ne(r, n, U)
                                      }
                                  }
                                  break;
                              case 5:
                                  rr(E, E.return);
                                  break;
                              case 22:
                                  if (E.memoizedState !== null) {
                                      Ac(I);
                                      continue
                                  }
                              }
                              R !== null ? (R.return = E,
                              W = R) : Ac(I)
                          }
                          L = L.sibling
                      }
                  e: for (L = null,
                  I = e; ; ) {
                      if (I.tag === 5) {
                          if (L === null) {
                              L = I;
                              try {
                                  o = I.stateNode,
                                  k ? (i = o.style,
                                  typeof i.setProperty == "function" ? i.setProperty("display", "none", "important") : i.display = "none") : (s = I.stateNode,
                                  a = I.memoizedProps.style,
                                  l = a != null && a.hasOwnProperty("display") ? a.display : null,
                                  s.style.display = Jc("display", l))
                              } catch (U) {
                                  Ne(e, e.return, U)
                              }
                          }
                      } else if (I.tag === 6) {
                          if (L === null)
                              try {
                                  I.stateNode.nodeValue = k ? "" : I.memoizedProps
                              } catch (U) {
                                  Ne(e, e.return, U)
                              }
                      } else if ((I.tag !== 22 && I.tag !== 23 || I.memoizedState === null || I === e) && I.child !== null) {
                          I.child.return = I,
                          I = I.child;
                          continue
                      }
                      if (I === e)
                          break e;
                      for (; I.sibling === null; ) {
                          if (I.return === null || I.return === e)
                              break e;
                          L === I && (L = null),
                          I = I.return
                      }
                      L === I && (L = null),
                      I.sibling.return = I.return,
                      I = I.sibling
                  }
              }
              break;
          case 19:
              wt(t, e),
              Pt(e),
              r & 4 && Ic(e);
              break;
          case 21:
              break;
          default:
              wt(t, e),
              Pt(e)
          }
      }
      function Pt(e) {
          var t = e.flags;
          if (t & 2) {
              try {
                  e: {
                      for (var n = e.return; n !== null; ) {
                          if (Nd(n)) {
                              var r = n;
                              break e
                          }
                          n = n.return
                      }
                      throw Error(B(160))
                  }
                  switch (r.tag) {
                  case 5:
                      var o = r.stateNode;
                      r.flags & 32 && (Kr(o, ""),
                      r.flags &= -33);
                      var i = Oc(e);
                      zu(e, i, o);
                      break;
                  case 3:
                  case 4:
                      var l = r.stateNode.containerInfo
                        , s = Oc(e);
                      Lu(e, s, l);
                      break;
                  default:
                      throw Error(B(161))
                  }
              } catch (a) {
                  Ne(e, e.return, a)
              }
              e.flags &= -3
          }
          t & 4096 && (e.flags &= -4097)
      }
      function d0(e, t, n) {
          W = e,
          Ld(e, t, n)
      }
      function Ld(e, t, n) {
          for (var r = (e.mode & 1) !== 0; W !== null; ) {
              var o = W
                , i = o.child;
              if (o.tag === 22 && r) {
                  var l = o.memoizedState !== null || Jo;
                  if (!l) {
                      var s = o.alternate
                        , a = s !== null && s.memoizedState !== null || Ve;
                      s = Jo;
                      var k = Ve;
                      if (Jo = l,
                      (Ve = a) && !k)
                          for (W = o; W !== null; )
                              l = W,
                              a = l.child,
                              l.tag === 22 && l.memoizedState !== null ? Rc(o) : a !== null ? (a.return = l,
                              W = a) : Rc(o);
                      for (; i !== null; )
                          W = i,
                          Ld(i, t, n),
                          i = i.sibling;
                      W = o,
                      Jo = s,
                      Ve = k
                  }
                  Tc(e, t, n)
              } else
                  o.subtreeFlags & 8772 && i !== null ? (i.return = o,
                  W = i) : Tc(e, t, n)
          }
      }
      function Tc(e) {
          for (; W !== null; ) {
              var t = W;
              if (t.flags & 8772) {
                  var n = t.alternate;
                  try {
                      if (t.flags & 8772)
                          switch (t.tag) {
                          case 0:
                          case 11:
                          case 15:
                              Ve || Vi(5, t);
                              break;
                          case 1:
                              var r = t.stateNode;
                              if (t.flags & 4 && !Ve)
                                  if (n === null)
                                      r.componentDidMount();
                                  else {
                                      var o = t.elementType === t.type ? n.memoizedProps : kt(t.type, n.memoizedProps);
                                      r.componentDidUpdate(o, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate)
                                  }
                              var i = t.updateQueue;
                              i !== null && gc(t, i, r);
                              break;
                          case 3:
                              var l = t.updateQueue;
                              if (l !== null) {
                                  if (n = null,
                                  t.child !== null)
                                      switch (t.child.tag) {
                                      case 5:
                                          n = t.child.stateNode;
                                          break;
                                      case 1:
                                          n = t.child.stateNode
                                      }
                                  gc(t, l, n)
                              }
                              break;
                          case 5:
                              var s = t.stateNode;
                              if (n === null && t.flags & 4) {
                                  n = s;
                                  var a = t.memoizedProps;
                                  switch (t.type) {
                                  case "button":
                                  case "input":
                                  case "select":
                                  case "textarea":
                                      a.autoFocus && n.focus();
                                      break;
                                  case "img":
                                      a.src && (n.src = a.src)
                                  }
                              }
                              break;
                          case 6:
                              break;
                          case 4:
                              break;
                          case 12:
                              break;
                          case 13:
                              if (t.memoizedState === null) {
                                  var k = t.alternate;
                                  if (k !== null) {
                                      var L = k.memoizedState;
                                      if (L !== null) {
                                          var I = L.dehydrated;
                                          I !== null && to(I)
                                      }
                                  }
                              }
                              break;
                          case 19:
                          case 17:
                          case 21:
                          case 22:
                          case 23:
                          case 25:
                              break;
                          default:
                              throw Error(B(163))
                          }
                      Ve || t.flags & 512 && Pu(t)
                  } catch (E) {
                      Ne(t, t.return, E)
                  }
              }
              if (t === e) {
                  W = null;
                  break
              }
              if (n = t.sibling,
              n !== null) {
                  n.return = t.return,
                  W = n;
                  break
              }
              W = t.return
          }
      }
      function Ac(e) {
          for (; W !== null; ) {
              var t = W;
              if (t === e) {
                  W = null;
                  break
              }
              var n = t.sibling;
              if (n !== null) {
                  n.return = t.return,
                  W = n;
                  break
              }
              W = t.return
          }
      }
      function Rc(e) {
          for (; W !== null; ) {
              var t = W;
              try {
                  switch (t.tag) {
                  case 0:
                  case 11:
                  case 15:
                      var n = t.return;
                      try {
                          Vi(4, t)
                      } catch (a) {
                          Ne(t, n, a)
                      }
                      break;
                  case 1:
                      var r = t.stateNode;
                      if (typeof r.componentDidMount == "function") {
                          var o = t.return;
                          try {
                              r.componentDidMount()
                          } catch (a) {
                              Ne(t, o, a)
                          }
                      }
                      var i = t.return;
                      try {
                          Pu(t)
                      } catch (a) {
                          Ne(t, i, a)
                      }
                      break;
                  case 5:
                      var l = t.return;
                      try {
                          Pu(t)
                      } catch (a) {
                          Ne(t, l, a)
                      }
                  }
              } catch (a) {
                  Ne(t, t.return, a)
              }
              if (t === e) {
                  W = null;
                  break
              }
              var s = t.sibling;
              if (s !== null) {
                  s.return = t.return,
                  W = s;
                  break
              }
              W = t.return
          }
      }
      var p0 = Math.ceil
        , Li = $t.ReactCurrentDispatcher
        , hs = $t.ReactCurrentOwner
        , dt = $t.ReactCurrentBatchConfig
        , ue = 0
        , Ae = null
        , Pe = null
        , je = 0
        , tt = 0
        , or = vn(0)
        , Oe = 0
        , po = null
        , An = 0
        , Qi = 0
        , ms = 0
        , Gr = null
        , Xe = null
        , vs = 0
        , gr = 1 / 0
        , jt = null
        , zi = !1
        , Du = null
        , cn = null
        , bo = !1
        , rn = null
        , Di = 0
        , Yr = 0
        , Ou = null
        , ui = -1
        , si = 0;
      function qe() {
          return ue & 6 ? Me() : ui !== -1 ? ui : ui = Me()
      }
      function fn(e) {
          return e.mode & 1 ? ue & 2 && je !== 0 ? je & -je : Xp.transition !== null ? (si === 0 && (si = df()),
          si) : (e = fe,
          e !== 0 || (e = window.event,
          e = e === void 0 ? 16 : wf(e.type)),
          e) : 1
      }
      function Ct(e, t, n, r) {
          if (50 < Yr)
              throw Yr = 0,
              Ou = null,
              Error(B(185));
          ho(e, n, r),
          (!(ue & 2) || e !== Ae) && (e === Ae && (!(ue & 2) && (Qi |= n),
          Oe === 4 && tn(e, je)),
          et(e, r),
          n === 1 && ue === 0 && !(t.mode & 1) && (gr = Me() + 500,
          Fi && gn()))
      }
      function et(e, t) {
          var n = e.callbackNode;
          J1(e, t);
          var r = hi(e, e === Ae ? je : 0);
          if (r === 0)
              n !== null && Za(n),
              e.callbackNode = null,
              e.callbackPriority = 0;
          else if (t = r & -r,
          e.callbackPriority !== t) {
              if (n != null && Za(n),
              t === 1)
                  e.tag === 0 ? Yp(jc.bind(null, e)) : Bf(jc.bind(null, e)),
                  Wp(function() {
                      !(ue & 6) && gn()
                  }),
                  n = null;
              else {
                  switch (pf(r)) {
                  case 1:
                      n = Vu;
                      break;
                  case 4:
                      n = cf;
                      break;
                  case 16:
                      n = pi;
                      break;
                  case 536870912:
                      n = ff;
                      break;
                  default:
                      n = pi
                  }
                  n = jd(n, zd.bind(null, e))
              }
              e.callbackPriority = t,
              e.callbackNode = n
          }
      }
      function zd(e, t) {
          if (ui = -1,
          si = 0,
          ue & 6)
              throw Error(B(327));
          var n = e.callbackNode;
          if (cr() && e.callbackNode !== n)
              return null;
          var r = hi(e, e === Ae ? je : 0);
          if (r === 0)
              return null;
          if (r & 30 || r & e.expiredLanes || t)
              t = Oi(e, r);
          else {
              t = r;
              var o = ue;
              ue |= 2;
              var i = Od();
              (Ae !== e || je !== t) && (jt = null,
              gr = Me() + 500,
              zn(e, t));
              do
                  try {
                      v0();
                      break
                  } catch (s) {
                      Dd(e, s)
                  }
              while (1);
              ts(),
              Li.current = i,
              ue = o,
              Pe !== null ? t = 0 : (Ae = null,
              je = 0,
              t = Oe)
          }
          if (t !== 0) {
              if (t === 2 && (o = iu(e),
              o !== 0 && (r = o,
              t = Iu(e, o))),
              t === 1)
                  throw n = po,
                  zn(e, 0),
                  tn(e, r),
                  et(e, Me()),
                  n;
              if (t === 6)
                  tn(e, r);
              else {
                  if (o = e.current.alternate,
                  !(r & 30) && !h0(o) && (t = Oi(e, r),
                  t === 2 && (i = iu(e),
                  i !== 0 && (r = i,
                  t = Iu(e, i))),
                  t === 1))
                      throw n = po,
                      zn(e, 0),
                      tn(e, r),
                      et(e, Me()),
                      n;
                  switch (e.finishedWork = o,
                  e.finishedLanes = r,
                  t) {
                  case 0:
                  case 1:
                      throw Error(B(345));
                  case 2:
                      Nn(e, Xe, jt);
                      break;
                  case 3:
                      if (tn(e, r),
                      (r & 130023424) === r && (t = vs + 500 - Me(),
                      10 < t)) {
                          if (hi(e, 0) !== 0)
                              break;
                          if (o = e.suspendedLanes,
                          (o & r) !== r) {
                              qe(),
                              e.pingedLanes |= e.suspendedLanes & o;
                              break
                          }
                          e.timeoutHandle = pu(Nn.bind(null, e, Xe, jt), t);
                          break
                      }
                      Nn(e, Xe, jt);
                      break;
                  case 4:
                      if (tn(e, r),
                      (r & 4194240) === r)
                          break;
                      for (t = e.eventTimes,
                      o = -1; 0 < r; ) {
                          var l = 31 - _t(r);
                          i = 1 << l,
                          l = t[l],
                          l > o && (o = l),
                          r &= ~i
                      }
                      if (r = o,
                      r = Me() - r,
                      r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * p0(r / 1960)) - r,
                      10 < r) {
                          e.timeoutHandle = pu(Nn.bind(null, e, Xe, jt), r);
                          break
                      }
                      Nn(e, Xe, jt);
                      break;
                  case 5:
                      Nn(e, Xe, jt);
                      break;
                  default:
                      throw Error(B(329))
                  }
              }
          }
          return et(e, Me()),
          e.callbackNode === n ? zd.bind(null, e) : null
      }
      function Iu(e, t) {
          var n = Gr;
          return e.current.memoizedState.isDehydrated && (zn(e, t).flags |= 256),
          e = Oi(e, t),
          e !== 2 && (t = Xe,
          Xe = n,
          t !== null && Tu(t)),
          e
      }
      function Tu(e) {
          Xe === null ? Xe = e : Xe.push.apply(Xe, e)
      }
      function h0(e) {
          for (var t = e; ; ) {
              if (t.flags & 16384) {
                  var n = t.updateQueue;
                  if (n !== null && (n = n.stores,
                  n !== null))
                      for (var r = 0; r < n.length; r++) {
                          var o = n[r]
                            , i = o.getSnapshot;
                          o = o.value;
                          try {
                              if (!Et(i(), o))
                                  return !1
                          } catch {
                              return !1
                          }
                      }
              }
              if (n = t.child,
              t.subtreeFlags & 16384 && n !== null)
                  n.return = t,
                  t = n;
              else {
                  if (t === e)
                      break;
                  for (; t.sibling === null; ) {
                      if (t.return === null || t.return === e)
                          return !0;
                      t = t.return
                  }
                  t.sibling.return = t.return,
                  t = t.sibling
              }
          }
          return !0
      }
      function tn(e, t) {
          for (t &= ~ms,
          t &= ~Qi,
          e.suspendedLanes |= t,
          e.pingedLanes &= ~t,
          e = e.expirationTimes; 0 < t; ) {
              var n = 31 - _t(t)
                , r = 1 << n;
              e[n] = -1,
              t &= ~r
          }
      }
      function jc(e) {
          if (ue & 6)
              throw Error(B(327));
          cr();
          var t = hi(e, 0);
          if (!(t & 1))
              return et(e, Me()),
              null;
          var n = Oi(e, t);
          if (e.tag !== 0 && n === 2) {
              var r = iu(e);
              r !== 0 && (t = r,
              n = Iu(e, r))
          }
          if (n === 1)
              throw n = po,
              zn(e, 0),
              tn(e, t),
              et(e, Me()),
              n;
          if (n === 6)
              throw Error(B(345));
          return e.finishedWork = e.current.alternate,
          e.finishedLanes = t,
          Nn(e, Xe, jt),
          et(e, Me()),
          null
      }
      function gs(e, t) {
          var n = ue;
          ue |= 1;
          try {
              return e(t)
          } finally {
              ue = n,
              ue === 0 && (gr = Me() + 500,
              Fi && gn())
          }
      }
      function Rn(e) {
          rn !== null && rn.tag === 0 && !(ue & 6) && cr();
          var t = ue;
          ue |= 1;
          var n = dt.transition
            , r = fe;
          try {
              if (dt.transition = null,
              fe = 1,
              e)
                  return e()
          } finally {
              fe = r,
              dt.transition = n,
              ue = t,
              !(ue & 6) && gn()
          }
      }
      function ys() {
          tt = or.current,
          ge(or)
      }
      function zn(e, t) {
          e.finishedWork = null,
          e.finishedLanes = 0;
          var n = e.timeoutHandle;
          if (n !== -1 && (e.timeoutHandle = -1,
          Zp(n)),
          Pe !== null)
              for (n = Pe.return; n !== null; ) {
                  var r = n;
                  switch (Ju(r),
                  r.tag) {
                  case 1:
                      r = r.type.childContextTypes,
                      r != null && wi();
                      break;
                  case 3:
                      mr(),
                      ge(Je),
                      ge(Qe),
                      us();
                      break;
                  case 5:
                      ls(r);
                      break;
                  case 4:
                      mr();
                      break;
                  case 13:
                      ge(xe);
                      break;
                  case 19:
                      ge(xe);
                      break;
                  case 10:
                      ns(r.type._context);
                      break;
                  case 22:
                  case 23:
                      ys()
                  }
                  n = n.return
              }
          if (Ae = e,
          Pe = e = dn(e.current, null),
          je = tt = t,
          Oe = 0,
          po = null,
          ms = Qi = An = 0,
          Xe = Gr = null,
          Pn !== null) {
              for (t = 0; t < Pn.length; t++)
                  if (n = Pn[t],
                  r = n.interleaved,
                  r !== null) {
                      n.interleaved = null;
                      var o = r.next
                        , i = n.pending;
                      if (i !== null) {
                          var l = i.next;
                          i.next = o,
                          r.next = l
                      }
                      n.pending = r
                  }
              Pn = null
          }
          return e
      }
      function Dd(e, t) {
          do {
              var n = Pe;
              try {
                  if (ts(),
                  oi.current = Pi,
                  Mi) {
                      for (var r = _e.memoizedState; r !== null; ) {
                          var o = r.queue;
                          o !== null && (o.pending = null),
                          r = r.next
                      }
                      Mi = !1
                  }
                  if (Tn = 0,
                  Te = De = _e = null,
                  $r = !1,
                  ao = 0,
                  hs.current = null,
                  n === null || n.return === null) {
                      Oe = 1,
                      po = t,
                      Pe = null;
                      break
                  }
                  e: {
                      var i = e
                        , l = n.return
                        , s = n
                        , a = t;
                      if (t = je,
                      s.flags |= 32768,
                      a !== null && typeof a == "object" && typeof a.then == "function") {
                          var k = a
                            , L = s
                            , I = L.tag;
                          if (!(L.mode & 1) && (I === 0 || I === 11 || I === 15)) {
                              var E = L.alternate;
                              E ? (L.updateQueue = E.updateQueue,
                              L.memoizedState = E.memoizedState,
                              L.lanes = E.lanes) : (L.updateQueue = null,
                              L.memoizedState = null)
                          }
                          var R = Cc(l);
                          if (R !== null) {
                              R.flags &= -257,
                              Ec(R, l, s, i, t),
                              R.mode & 1 && _c(i, k, t),
                              t = R,
                              a = k;
                              var V = t.updateQueue;
                              if (V === null) {
                                  var U = new Set;
                                  U.add(a),
                                  t.updateQueue = U
                              } else
                                  V.add(a);
                              break e
                          } else {
                              if (!(t & 1)) {
                                  _c(i, k, t),
                                  ws();
                                  break e
                              }
                              a = Error(B(426))
                          }
                      } else if (we && s.mode & 1) {
                          var se = Cc(l);
                          if (se !== null) {
                              !(se.flags & 65536) && (se.flags |= 256),
                              Ec(se, l, s, i, t),
                              bu(vr(a, s));
                              break e
                          }
                      }
                      i = a = vr(a, s),
                      Oe !== 4 && (Oe = 2),
                      Gr === null ? Gr = [i] : Gr.push(i),
                      i = l;
                      do {
                          switch (i.tag) {
                          case 3:
                              i.flags |= 65536,
                              t &= -t,
                              i.lanes |= t;
                              var w = hd(i, a, t);
                              vc(i, w);
                              break e;
                          case 1:
                              s = a;
                              var v = i.type
                                , x = i.stateNode;
                              if (!(i.flags & 128) && (typeof v.getDerivedStateFromError == "function" || x !== null && typeof x.componentDidCatch == "function" && (cn === null || !cn.has(x)))) {
                                  i.flags |= 65536,
                                  t &= -t,
                                  i.lanes |= t;
                                  var j = md(i, s, t);
                                  vc(i, j);
                                  break e
                              }
                          }
                          i = i.return
                      } while (i !== null)
                  }
                  Td(n)
              } catch ($) {
                  t = $,
                  Pe === n && n !== null && (Pe = n = n.return);
                  continue
              }
              break
          } while (1)
      }
      function Od() {
          var e = Li.current;
          return Li.current = Pi,
          e === null ? Pi : e
      }
      function ws() {
          (Oe === 0 || Oe === 3 || Oe === 2) && (Oe = 4),
          Ae === null || !(An & 268435455) && !(Qi & 268435455) || tn(Ae, je)
      }
      function Oi(e, t) {
          var n = ue;
          ue |= 2;
          var r = Od();
          (Ae !== e || je !== t) && (jt = null,
          zn(e, t));
          do
              try {
                  m0();
                  break
              } catch (o) {
                  Dd(e, o)
              }
          while (1);
          if (ts(),
          ue = n,
          Li.current = r,
          Pe !== null)
              throw Error(B(261));
          return Ae = null,
          je = 0,
          Oe
      }
      function m0() {
          for (; Pe !== null; )
              Id(Pe)
      }
      function v0() {
          for (; Pe !== null && !Q1(); )
              Id(Pe)
      }
      function Id(e) {
          var t = Rd(e.alternate, e, tt);
          e.memoizedProps = e.pendingProps,
          t === null ? Td(e) : Pe = t,
          hs.current = null
      }
      function Td(e) {
          var t = e;
          do {
              var n = t.alternate;
              if (e = t.return,
              t.flags & 32768) {
                  if (n = a0(n, t),
                  n !== null) {
                      n.flags &= 32767,
                      Pe = n;
                      return
                  }
                  if (e !== null)
                      e.flags |= 32768,
                      e.subtreeFlags = 0,
                      e.deletions = null;
                  else {
                      Oe = 6,
                      Pe = null;
                      return
                  }
              } else if (n = s0(n, t, tt),
              n !== null) {
                  Pe = n;
                  return
              }
              if (t = t.sibling,
              t !== null) {
                  Pe = t;
                  return
              }
              Pe = t = e
          } while (t !== null);
          Oe === 0 && (Oe = 5)
      }
      function Nn(e, t, n) {
          var r = fe
            , o = dt.transition;
          try {
              dt.transition = null,
              fe = 1,
              g0(e, t, n, r)
          } finally {
              dt.transition = o,
              fe = r
          }
          return null
      }
      function g0(e, t, n, r) {
          do
              cr();
          while (rn !== null);
          if (ue & 6)
              throw Error(B(327));
          n = e.finishedWork;
          var o = e.finishedLanes;
          if (n === null)
              return null;
          if (e.finishedWork = null,
          e.finishedLanes = 0,
          n === e.current)
              throw Error(B(177));
          e.callbackNode = null,
          e.callbackPriority = 0;
          var i = n.lanes | n.childLanes;
          if (b1(e, i),
          e === Ae && (Pe = Ae = null,
          je = 0),
          !(n.subtreeFlags & 2064) && !(n.flags & 2064) || bo || (bo = !0,
          jd(pi, function() {
              return cr(),
              null
          })),
          i = (n.flags & 15990) !== 0,
          n.subtreeFlags & 15990 || i) {
              i = dt.transition,
              dt.transition = null;
              var l = fe;
              fe = 1;
              var s = ue;
              ue |= 4,
              hs.current = null,
              f0(e, n),
              Pd(n, e),
              Fp(fu),
              mi = !!cu,
              fu = cu = null,
              e.current = n,
              d0(n, e, o),
              Z1(),
              ue = s,
              fe = l,
              dt.transition = i
          } else
              e.current = n;
          if (bo && (bo = !1,
          rn = e,
          Di = o),
          i = e.pendingLanes,
          i === 0 && (cn = null),
          q1(n.stateNode, r),
          et(e, Me()),
          t !== null)
              for (r = e.onRecoverableError,
              n = 0; n < t.length; n++)
                  o = t[n],
                  r(o.value, {
                      componentStack: o.stack,
                      digest: o.digest
                  });
          if (zi)
              throw zi = !1,
              e = Du,
              Du = null,
              e;
          return Di & 1 && e.tag !== 0 && cr(),
          i = e.pendingLanes,
          i & 1 ? e === Ou ? Yr++ : (Yr = 0,
          Ou = e) : Yr = 0,
          gn(),
          null
      }
      function cr() {
          if (rn !== null) {
              var e = pf(Di)
                , t = dt.transition
                , n = fe;
              try {
                  if (dt.transition = null,
                  fe = 16 > e ? 16 : e,
                  rn === null)
                      var r = !1;
                  else {
                      if (e = rn,
                      rn = null,
                      Di = 0,
                      ue & 6)
                          throw Error(B(331));
                      var o = ue;
                      for (ue |= 4,
                      W = e.current; W !== null; ) {
                          var i = W
                            , l = i.child;
                          if (W.flags & 16) {
                              var s = i.deletions;
                              if (s !== null) {
                                  for (var a = 0; a < s.length; a++) {
                                      var k = s[a];
                                      for (W = k; W !== null; ) {
                                          var L = W;
                                          switch (L.tag) {
                                          case 0:
                                          case 11:
                                          case 15:
                                              qr(8, L, i)
                                          }
                                          var I = L.child;
                                          if (I !== null)
                                              I.return = L,
                                              W = I;
                                          else
                                              for (; W !== null; ) {
                                                  L = W;
                                                  var E = L.sibling
                                                    , R = L.return;
                                                  if (Ed(L),
                                                  L === k) {
                                                      W = null;
                                                      break
                                                  }
                                                  if (E !== null) {
                                                      E.return = R,
                                                      W = E;
                                                      break
                                                  }
                                                  W = R
                                              }
                                      }
                                  }
                                  var V = i.alternate;
                                  if (V !== null) {
                                      var U = V.child;
                                      if (U !== null) {
                                          V.child = null;
                                          do {
                                              var se = U.sibling;
                                              U.sibling = null,
                                              U = se
                                          } while (U !== null)
                                      }
                                  }
                                  W = i
                              }
                          }
                          if (i.subtreeFlags & 2064 && l !== null)
                              l.return = i,
                              W = l;
                          else
                              e: for (; W !== null; ) {
                                  if (i = W,
                                  i.flags & 2048)
                                      switch (i.tag) {
                                      case 0:
                                      case 11:
                                      case 15:
                                          qr(9, i, i.return)
                                      }
                                  var w = i.sibling;
                                  if (w !== null) {
                                      w.return = i.return,
                                      W = w;
                                      break e
                                  }
                                  W = i.return
                              }
                      }
                      var v = e.current;
                      for (W = v; W !== null; ) {
                          l = W;
                          var x = l.child;
                          if (l.subtreeFlags & 2064 && x !== null)
                              x.return = l,
                              W = x;
                          else
                              e: for (l = v; W !== null; ) {
                                  if (s = W,
                                  s.flags & 2048)
                                      try {
                                          switch (s.tag) {
                                          case 0:
                                          case 11:
                                          case 15:
                                              Vi(9, s)
                                          }
                                      } catch ($) {
                                          Ne(s, s.return, $)
                                      }
                                  if (s === l) {
                                      W = null;
                                      break e
                                  }
                                  var j = s.sibling;
                                  if (j !== null) {
                                      j.return = s.return,
                                      W = j;
                                      break e
                                  }
                                  W = s.return
                              }
                      }
                      if (ue = o,
                      gn(),
                      Dt && typeof Dt.onPostCommitFiberRoot == "function")
                          try {
                              Dt.onPostCommitFiberRoot(Ti, e)
                          } catch {}
                      r = !0
                  }
                  return r
              } finally {
                  fe = n,
                  dt.transition = t
              }
          }
          return !1
      }
      function Bc(e, t, n) {
          t = vr(n, t),
          t = hd(e, t, 1),
          e = an(e, t, 1),
          t = qe(),
          e !== null && (ho(e, 1, t),
          et(e, t))
      }
      function Ne(e, t, n) {
          if (e.tag === 3)
              Bc(e, e, n);
          else
              for (; t !== null; ) {
                  if (t.tag === 3) {
                      Bc(t, e, n);
                      break
                  } else if (t.tag === 1) {
                      var r = t.stateNode;
                      if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (cn === null || !cn.has(r))) {
                          e = vr(n, e),
                          e = md(t, e, 1),
                          t = an(t, e, 1),
                          e = qe(),
                          t !== null && (ho(t, 1, e),
                          et(t, e));
                          break
                      }
                  }
                  t = t.return
              }
      }
      function y0(e, t, n) {
          var r = e.pingCache;
          r !== null && r.delete(t),
          t = qe(),
          e.pingedLanes |= e.suspendedLanes & n,
          Ae === e && (je & n) === n && (Oe === 4 || Oe === 3 && (je & 130023424) === je && 500 > Me() - vs ? zn(e, 0) : ms |= n),
          et(e, t)
      }
      function Ad(e, t) {
          t === 0 && (e.mode & 1 ? (t = Fo,
          Fo <<= 1,
          !(Fo & 130023424) && (Fo = 4194304)) : t = 1);
          var n = qe();
          e = Zt(e, t),
          e !== null && (ho(e, t, n),
          et(e, n))
      }
      function w0(e) {
          var t = e.memoizedState
            , n = 0;
          t !== null && (n = t.retryLane),
          Ad(e, n)
      }
      function k0(e, t) {
          var n = 0;
          switch (e.tag) {
          case 13:
              var r = e.stateNode
                , o = e.memoizedState;
              o !== null && (n = o.retryLane);
              break;
          case 19:
              r = e.stateNode;
              break;
          default:
              throw Error(B(314))
          }
          r !== null && r.delete(t),
          Ad(e, n)
      }
      var Rd;
      Rd = function(e, t, n) {
          if (e !== null)
              if (e.memoizedProps !== t.pendingProps || Je.current)
                  Ke = !0;
              else {
                  if (!(e.lanes & n) && !(t.flags & 128))
                      return Ke = !1,
                      u0(e, t, n);
                  Ke = !!(e.flags & 131072)
              }
          else
              Ke = !1,
              we && t.flags & 1048576 && Ff(t, xi, t.index);
          switch (t.lanes = 0,
          t.tag) {
          case 2:
              var r = t.type;
              li(e, t),
              e = t.pendingProps;
              var o = dr(t, Qe.current);
              ar(t, n),
              o = as(null, t, r, e, o, n);
              var i = cs();
              return t.flags |= 1,
              typeof o == "object" && o !== null && typeof o.render == "function" && o.$$typeof === void 0 ? (t.tag = 1,
              t.memoizedState = null,
              t.updateQueue = null,
              be(r) ? (i = !0,
              ki(t)) : i = !1,
              t.memoizedState = o.state !== null && o.state !== void 0 ? o.state : null,
              os(t),
              o.updater = Ui,
              t.stateNode = o,
              o._reactInternals = t,
              ku(t, r, e, n),
              t = _u(null, t, r, !0, i, n)) : (t.tag = 0,
              we && i && Ku(t),
              $e(null, t, o, n),
              t = t.child),
              t;
          case 16:
              r = t.elementType;
              e: {
                  switch (li(e, t),
                  e = t.pendingProps,
                  o = r._init,
                  r = o(r._payload),
                  t.type = r,
                  o = t.tag = x0(r),
                  e = kt(r, e),
                  o) {
                  case 0:
                      t = xu(null, t, r, e, n);
                      break e;
                  case 1:
                      t = Pc(null, t, r, e, n);
                      break e;
                  case 11:
                      t = Nc(null, t, r, e, n);
                      break e;
                  case 14:
                      t = Mc(null, t, r, kt(r.type, e), n);
                      break e
                  }
                  throw Error(B(306, r, ""))
              }
              return t;
          case 0:
              return r = t.type,
              o = t.pendingProps,
              o = t.elementType === r ? o : kt(r, o),
              xu(e, t, r, o, n);
          case 1:
              return r = t.type,
              o = t.pendingProps,
              o = t.elementType === r ? o : kt(r, o),
              Pc(e, t, r, o, n);
          case 3:
              e: {
                  if (wd(t),
                  e === null)
                      throw Error(B(387));
                  r = t.pendingProps,
                  i = t.memoizedState,
                  o = i.element,
                  Qf(e, t),
                  Ei(t, r, null, n);
                  var l = t.memoizedState;
                  if (r = l.element,
                  i.isDehydrated)
                      if (i = {
                          element: r,
                          isDehydrated: !1,
                          cache: l.cache,
                          pendingSuspenseBoundaries: l.pendingSuspenseBoundaries,
                          transitions: l.transitions
                      },
                      t.updateQueue.baseState = i,
                      t.memoizedState = i,
                      t.flags & 256) {
                          o = vr(Error(B(423)), t),
                          t = Lc(e, t, r, n, o);
                          break e
                      } else if (r !== o) {
                          o = vr(Error(B(424)), t),
                          t = Lc(e, t, r, n, o);
                          break e
                      } else
                          for (nt = sn(t.stateNode.containerInfo.firstChild),
                          rt = t,
                          we = !0,
                          xt = null,
                          n = qf(t, null, r, n),
                          t.child = n; n; )
                              n.flags = n.flags & -3 | 4096,
                              n = n.sibling;
                  else {
                      if (pr(),
                      r === o) {
                          t = Wt(e, t, n);
                          break e
                      }
                      $e(e, t, r, n)
                  }
                  t = t.child
              }
              return t;
          case 5:
              return Gf(t),
              e === null && gu(t),
              r = t.type,
              o = t.pendingProps,
              i = e !== null ? e.memoizedProps : null,
              l = o.children,
              du(r, o) ? l = null : i !== null && du(r, i) && (t.flags |= 32),
              yd(e, t),
              $e(e, t, l, n),
              t.child;
          case 6:
              return e === null && gu(t),
              null;
          case 13:
              return kd(e, t, n);
          case 4:
              return is(t, t.stateNode.containerInfo),
              r = t.pendingProps,
              e === null ? t.child = hr(t, null, r, n) : $e(e, t, r, n),
              t.child;
          case 11:
              return r = t.type,
              o = t.pendingProps,
              o = t.elementType === r ? o : kt(r, o),
              Nc(e, t, r, o, n);
          case 7:
              return $e(e, t, t.pendingProps, n),
              t.child;
          case 8:
              return $e(e, t, t.pendingProps.children, n),
              t.child;
          case 12:
              return $e(e, t, t.pendingProps.children, n),
              t.child;
          case 10:
              e: {
                  if (r = t.type._context,
                  o = t.pendingProps,
                  i = t.memoizedProps,
                  l = o.value,
                  pe(_i, r._currentValue),
                  r._currentValue = l,
                  i !== null)
                      if (Et(i.value, l)) {
                          if (i.children === o.children && !Je.current) {
                              t = Wt(e, t, n);
                              break e
                          }
                      } else
                          for (i = t.child,
                          i !== null && (i.return = t); i !== null; ) {
                              var s = i.dependencies;
                              if (s !== null) {
                                  l = i.child;
                                  for (var a = s.firstContext; a !== null; ) {
                                      if (a.context === r) {
                                          if (i.tag === 1) {
                                              a = Ht(-1, n & -n),
                                              a.tag = 2;
                                              var k = i.updateQueue;
                                              if (k !== null) {
                                                  k = k.shared;
                                                  var L = k.pending;
                                                  L === null ? a.next = a : (a.next = L.next,
                                                  L.next = a),
                                                  k.pending = a
                                              }
                                          }
                                          i.lanes |= n,
                                          a = i.alternate,
                                          a !== null && (a.lanes |= n),
                                          yu(i.return, n, t),
                                          s.lanes |= n;
                                          break
                                      }
                                      a = a.next
                                  }
                              } else if (i.tag === 10)
                                  l = i.type === t.type ? null : i.child;
                              else if (i.tag === 18) {
                                  if (l = i.return,
                                  l === null)
                                      throw Error(B(341));
                                  l.lanes |= n,
                                  s = l.alternate,
                                  s !== null && (s.lanes |= n),
                                  yu(l, n, t),
                                  l = i.sibling
                              } else
                                  l = i.child;
                              if (l !== null)
                                  l.return = i;
                              else
                                  for (l = i; l !== null; ) {
                                      if (l === t) {
                                          l = null;
                                          break
                                      }
                                      if (i = l.sibling,
                                      i !== null) {
                                          i.return = l.return,
                                          l = i;
                                          break
                                      }
                                      l = l.return
                                  }
                              i = l
                          }
                  $e(e, t, o.children, n),
                  t = t.child
              }
              return t;
          case 9:
              return o = t.type,
              r = t.pendingProps.children,
              ar(t, n),
              o = pt(o),
              r = r(o),
              t.flags |= 1,
              $e(e, t, r, n),
              t.child;
          case 14:
              return r = t.type,
              o = kt(r, t.pendingProps),
              o = kt(r.type, o),
              Mc(e, t, r, o, n);
          case 15:
              return vd(e, t, t.type, t.pendingProps, n);
          case 17:
              return r = t.type,
              o = t.pendingProps,
              o = t.elementType === r ? o : kt(r, o),
              li(e, t),
              t.tag = 1,
              be(r) ? (e = !0,
              ki(t)) : e = !1,
              ar(t, n),
              Wf(t, r, o),
              ku(t, r, o, n),
              _u(null, t, r, !0, e, n);
          case 19:
              return Sd(e, t, n);
          case 22:
              return gd(e, t, n)
          }
          throw Error(B(156, t.tag))
      }
      ;
      function jd(e, t) {
          return af(e, t)
      }
      function S0(e, t, n, r) {
          this.tag = e,
          this.key = n,
          this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null,
          this.index = 0,
          this.ref = null,
          this.pendingProps = t,
          this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null,
          this.mode = r,
          this.subtreeFlags = this.flags = 0,
          this.deletions = null,
          this.childLanes = this.lanes = 0,
          this.alternate = null
      }
      function ft(e, t, n, r) {
          return new S0(e,t,n,r)
      }
      function ks(e) {
          return e = e.prototype,
          !(!e || !e.isReactComponent)
      }
      function x0(e) {
          if (typeof e == "function")
              return ks(e) ? 1 : 0;
          if (e != null) {
              if (e = e.$$typeof,
              e === Fu)
                  return 11;
              if (e === Uu)
                  return 14
          }
          return 2
      }
      function dn(e, t) {
          var n = e.alternate;
          return n === null ? (n = ft(e.tag, t, e.key, e.mode),
          n.elementType = e.elementType,
          n.type = e.type,
          n.stateNode = e.stateNode,
          n.alternate = e,
          e.alternate = n) : (n.pendingProps = t,
          n.type = e.type,
          n.flags = 0,
          n.subtreeFlags = 0,
          n.deletions = null),
          n.flags = e.flags & 14680064,
          n.childLanes = e.childLanes,
          n.lanes = e.lanes,
          n.child = e.child,
          n.memoizedProps = e.memoizedProps,
          n.memoizedState = e.memoizedState,
          n.updateQueue = e.updateQueue,
          t = e.dependencies,
          n.dependencies = t === null ? null : {
              lanes: t.lanes,
              firstContext: t.firstContext
          },
          n.sibling = e.sibling,
          n.index = e.index,
          n.ref = e.ref,
          n
      }
      function ai(e, t, n, r, o, i) {
          var l = 2;
          if (r = e,
          typeof e == "function")
              ks(e) && (l = 1);
          else if (typeof e == "string")
              l = 5;
          else
              e: switch (e) {
              case Gn:
                  return Dn(n.children, o, i, t);
              case Bu:
                  l = 8,
                  o |= 8;
                  break;
              case Zl:
                  return e = ft(12, n, t, o | 2),
                  e.elementType = Zl,
                  e.lanes = i,
                  e;
              case Wl:
                  return e = ft(13, n, t, o),
                  e.elementType = Wl,
                  e.lanes = i,
                  e;
              case $l:
                  return e = ft(19, n, t, o),
                  e.elementType = $l,
                  e.lanes = i,
                  e;
              case Wc:
                  return Zi(n, o, i, t);
              default:
                  if (typeof e == "object" && e !== null)
                      switch (e.$$typeof) {
                      case Qc:
                          l = 10;
                          break e;
                      case Zc:
                          l = 9;
                          break e;
                      case Fu:
                          l = 11;
                          break e;
                      case Uu:
                          l = 14;
                          break e;
                      case Jt:
                          l = 16,
                          r = null;
                          break e
                      }
                  throw Error(B(130, e == null ? e : typeof e, ""))
              }
          return t = ft(l, n, t, o),
          t.elementType = e,
          t.type = r,
          t.lanes = i,
          t
      }
      function Dn(e, t, n, r) {
          return e = ft(7, e, r, t),
          e.lanes = n,
          e
      }
      function Zi(e, t, n, r) {
          return e = ft(22, e, r, t),
          e.elementType = Wc,
          e.lanes = n,
          e.stateNode = {
              isHidden: !1
          },
          e
      }
      function Hl(e, t, n) {
          return e = ft(6, e, null, t),
          e.lanes = n,
          e
      }
      function Vl(e, t, n) {
          return t = ft(4, e.children !== null ? e.children : [], e.key, t),
          t.lanes = n,
          t.stateNode = {
              containerInfo: e.containerInfo,
              pendingChildren: null,
              implementation: e.implementation
          },
          t
      }
      function _0(e, t, n, r, o) {
          this.tag = t,
          this.containerInfo = e,
          this.finishedWork = this.pingCache = this.current = this.pendingChildren = null,
          this.timeoutHandle = -1,
          this.callbackNode = this.pendingContext = this.context = null,
          this.callbackPriority = 0,
          this.eventTimes = El(0),
          this.expirationTimes = El(-1),
          this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0,
          this.entanglements = El(0),
          this.identifierPrefix = r,
          this.onRecoverableError = o,
          this.mutableSourceEagerHydrationData = null
      }
      function Ss(e, t, n, r, o, i, l, s, a) {
          return e = new _0(e,t,n,s,a),
          t === 1 ? (t = 1,
          i === !0 && (t |= 8)) : t = 0,
          i = ft(3, null, null, t),
          e.current = i,
          i.stateNode = e,
          i.memoizedState = {
              element: r,
              isDehydrated: n,
              cache: null,
              transitions: null,
              pendingSuspenseBoundaries: null
          },
          os(i),
          e
      }
      function C0(e, t, n) {
          var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
          return {
              $$typeof: qn,
              key: r == null ? null : "" + r,
              children: e,
              containerInfo: t,
              implementation: n
          }
      }
      function Bd(e) {
          if (!e)
              return hn;
          e = e._reactInternals;
          e: {
              if (Bn(e) !== e || e.tag !== 1)
                  throw Error(B(170));
              var t = e;
              do {
                  switch (t.tag) {
                  case 3:
                      t = t.stateNode.context;
                      break e;
                  case 1:
                      if (be(t.type)) {
                          t = t.stateNode.__reactInternalMemoizedMergedChildContext;
                          break e
                      }
                  }
                  t = t.return
              } while (t !== null);
              throw Error(B(171))
          }
          if (e.tag === 1) {
              var n = e.type;
              if (be(n))
                  return jf(e, n, t)
          }
          return t
      }
      function Fd(e, t, n, r, o, i, l, s, a) {
          return e = Ss(n, r, !0, e, o, i, l, s, a),
          e.context = Bd(null),
          n = e.current,
          r = qe(),
          o = fn(n),
          i = Ht(r, o),
          i.callback = t ?? null,
          an(n, i, o),
          e.current.lanes = o,
          ho(e, o, r),
          et(e, r),
          e
      }
      function Wi(e, t, n, r) {
          var o = t.current
            , i = qe()
            , l = fn(o);
          return n = Bd(n),
          t.context === null ? t.context = n : t.pendingContext = n,
          t = Ht(i, l),
          t.payload = {
              element: e
          },
          r = r === void 0 ? null : r,
          r !== null && (t.callback = r),
          e = an(o, t, l),
          e !== null && (Ct(e, o, l, i),
          ri(e, o, l)),
          l
      }
      function Ii(e) {
          if (e = e.current,
          !e.child)
              return null;
          switch (e.child.tag) {
          case 5:
              return e.child.stateNode;
          default:
              return e.child.stateNode
          }
      }
      function Fc(e, t) {
          if (e = e.memoizedState,
          e !== null && e.dehydrated !== null) {
              var n = e.retryLane;
              e.retryLane = n !== 0 && n < t ? n : t
          }
      }
      function xs(e, t) {
          Fc(e, t),
          (e = e.alternate) && Fc(e, t)
      }
      function E0() {
          return null
      }
      var Ud = typeof reportError == "function" ? reportError : function(e) {
          console.error(e)
      }
      ;
      function _s(e) {
          this._internalRoot = e
      }
      $i.prototype.render = _s.prototype.render = function(e) {
          var t = this._internalRoot;
          if (t === null)
              throw Error(B(409));
          Wi(e, t, null, null)
      }
      ;
      $i.prototype.unmount = _s.prototype.unmount = function() {
          var e = this._internalRoot;
          if (e !== null) {
              this._internalRoot = null;
              var t = e.containerInfo;
              Rn(function() {
                  Wi(null, e, null, null)
              }),
              t[Qt] = null
          }
      }
      ;
      function $i(e) {
          this._internalRoot = e
      }
      $i.prototype.unstable_scheduleHydration = function(e) {
          if (e) {
              var t = vf();
              e = {
                  blockedOn: null,
                  target: e,
                  priority: t
              };
              for (var n = 0; n < en.length && t !== 0 && t < en[n].priority; n++)
                  ;
              en.splice(n, 0, e),
              n === 0 && yf(e)
          }
      }
      ;
      function Cs(e) {
          return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11)
      }
      function qi(e) {
          return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "))
      }
      function Uc() {}
      function N0(e, t, n, r, o) {
          if (o) {
              if (typeof r == "function") {
                  var i = r;
                  r = function() {
                      var k = Ii(l);
                      i.call(k)
                  }
              }
              var l = Fd(t, r, e, 0, null, !1, !1, "", Uc);
              return e._reactRootContainer = l,
              e[Qt] = l.current,
              oo(e.nodeType === 8 ? e.parentNode : e),
              Rn(),
              l
          }
          for (; o = e.lastChild; )
              e.removeChild(o);
          if (typeof r == "function") {
              var s = r;
              r = function() {
                  var k = Ii(a);
                  s.call(k)
              }
          }
          var a = Ss(e, 0, !1, null, null, !1, !1, "", Uc);
          return e._reactRootContainer = a,
          e[Qt] = a.current,
          oo(e.nodeType === 8 ? e.parentNode : e),
          Rn(function() {
              Wi(t, a, n, r)
          }),
          a
      }
      function Gi(e, t, n, r, o) {
          var i = n._reactRootContainer;
          if (i) {
              var l = i;
              if (typeof o == "function") {
                  var s = o;
                  o = function() {
                      var a = Ii(l);
                      s.call(a)
                  }
              }
              Wi(t, l, e, o)
          } else
              l = N0(n, t, e, o, r);
          return Ii(l)
      }
      hf = function(e) {
          switch (e.tag) {
          case 3:
              var t = e.stateNode;
              if (t.current.memoizedState.isDehydrated) {
                  var n = Fr(t.pendingLanes);
                  n !== 0 && (Qu(t, n | 1),
                  et(t, Me()),
                  !(ue & 6) && (gr = Me() + 500,
                  gn()))
              }
              break;
          case 13:
              Rn(function() {
                  var r = Zt(e, 1);
                  if (r !== null) {
                      var o = qe();
                      Ct(r, e, 1, o)
                  }
              }),
              xs(e, 1)
          }
      }
      ;
      Zu = function(e) {
          if (e.tag === 13) {
              var t = Zt(e, 134217728);
              if (t !== null) {
                  var n = qe();
                  Ct(t, e, 134217728, n)
              }
              xs(e, 134217728)
          }
      }
      ;
      mf = function(e) {
          if (e.tag === 13) {
              var t = fn(e)
                , n = Zt(e, t);
              if (n !== null) {
                  var r = qe();
                  Ct(n, e, t, r)
              }
              xs(e, t)
          }
      }
      ;
      vf = function() {
          return fe
      }
      ;
      gf = function(e, t) {
          var n = fe;
          try {
              return fe = e,
              t()
          } finally {
              fe = n
          }
      }
      ;
      nu = function(e, t, n) {
          switch (t) {
          case "input":
              if (Yl(e, n),
              t = n.name,
              n.type === "radio" && t != null) {
                  for (n = e; n.parentNode; )
                      n = n.parentNode;
                  for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'),
                  t = 0; t < n.length; t++) {
                      var r = n[t];
                      if (r !== e && r.form === e.form) {
                          var o = Bi(r);
                          if (!o)
                              throw Error(B(90));
                          qc(r),
                          Yl(r, o)
                      }
                  }
              }
              break;
          case "textarea":
              Yc(e, n);
              break;
          case "select":
              t = n.value,
              t != null && ir(e, !!n.multiple, t, !1)
          }
      }
      ;
      nf = gs;
      rf = Rn;
      var M0 = {
          usingClientEntryPoint: !1,
          Events: [vo, Jn, Bi, ef, tf, gs]
      }
        , Ar = {
          findFiberByHostInstance: Mn,
          bundleType: 0,
          version: "18.2.0",
          rendererPackageName: "react-dom"
      }
        , P0 = {
          bundleType: Ar.bundleType,
          version: Ar.version,
          rendererPackageName: Ar.rendererPackageName,
          rendererConfig: Ar.rendererConfig,
          overrideHookState: null,
          overrideHookStateDeletePath: null,
          overrideHookStateRenamePath: null,
          overrideProps: null,
          overridePropsDeletePath: null,
          overridePropsRenamePath: null,
          setErrorHandler: null,
          setSuspenseHandler: null,
          scheduleUpdate: null,
          currentDispatcherRef: $t.ReactCurrentDispatcher,
          findHostInstanceByFiber: function(e) {
              return e = uf(e),
              e === null ? null : e.stateNode
          },
          findFiberByHostInstance: Ar.findFiberByHostInstance || E0,
          findHostInstancesForRefresh: null,
          scheduleRefresh: null,
          scheduleRoot: null,
          setRefreshHandler: null,
          getCurrentFiber: null,
          reconcilerVersion: "18.2.0-next-9e3b772b8-20220608"
      };
      if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && (Rr = __REACT_DEVTOOLS_GLOBAL_HOOK__,
      !Rr.isDisabled && Rr.supportsFiber))
          try {
              Ti = Rr.inject(P0),
              Dt = Rr
          } catch {}
      var Rr;
      lt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = M0;
      lt.createPortal = function(e, t) {
          var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
          if (!Cs(t))
              throw Error(B(200));
          return C0(e, t, null, n)
      }
      ;
      lt.createRoot = function(e, t) {
          if (!Cs(e))
              throw Error(B(299));
          var n = !1
            , r = ""
            , o = Ud;
          return t != null && (t.unstable_strictMode === !0 && (n = !0),
          t.identifierPrefix !== void 0 && (r = t.identifierPrefix),
          t.onRecoverableError !== void 0 && (o = t.onRecoverableError)),
          t = Ss(e, 1, !1, null, null, n, !1, r, o),
          e[Qt] = t.current,
          oo(e.nodeType === 8 ? e.parentNode : e),
          new _s(t)
      }
      ;
      lt.findDOMNode = function(e) {
          if (e == null)
              return null;
          if (e.nodeType === 1)
              return e;
          var t = e._reactInternals;
          if (t === void 0)
              throw typeof e.render == "function" ? Error(B(188)) : (e = Object.keys(e).join(","),
              Error(B(268, e)));
          return e = uf(t),
          e = e === null ? null : e.stateNode,
          e
      }
      ;
      lt.flushSync = function(e) {
          return Rn(e)
      }
      ;
      lt.hydrate = function(e, t, n) {
          if (!qi(t))
              throw Error(B(200));
          return Gi(null, e, t, !0, n)
      }
      ;
      lt.hydrateRoot = function(e, t, n) {
          if (!Cs(e))
              throw Error(B(405));
          var r = n != null && n.hydratedSources || null
            , o = !1
            , i = ""
            , l = Ud;
          if (n != null && (n.unstable_strictMode === !0 && (o = !0),
          n.identifierPrefix !== void 0 && (i = n.identifierPrefix),
          n.onRecoverableError !== void 0 && (l = n.onRecoverableError)),
          t = Fd(t, null, e, 1, n ?? null, o, !1, i, l),
          e[Qt] = t.current,
          oo(e),
          r)
              for (e = 0; e < r.length; e++)
                  n = r[e],
                  o = n._getVersion,
                  o = o(n._source),
                  t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, o] : t.mutableSourceEagerHydrationData.push(n, o);
          return new $i(t)
      }
      ;
      lt.render = function(e, t, n) {
          if (!qi(t))
              throw Error(B(200));
          return Gi(null, e, t, !1, n)
      }
      ;
      lt.unmountComponentAtNode = function(e) {
          if (!qi(e))
              throw Error(B(40));
          return e._reactRootContainer ? (Rn(function() {
              Gi(null, null, e, !1, function() {
                  e._reactRootContainer = null,
                  e[Qt] = null
              })
          }),
          !0) : !1
      }
      ;
      lt.unstable_batchedUpdates = gs;
      lt.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
          if (!qi(n))
              throw Error(B(200));
          if (e == null || e._reactInternals === void 0)
              throw Error(B(38));
          return Gi(e, t, n, !1, r)
      }
      ;
      lt.version = "18.2.0-next-9e3b772b8-20220608"
  }
  );
  var Zd = qt((hm,Qd)=>{
      "use strict";
      function Vd() {
          if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
              try {
                  __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Vd)
              } catch (e) {
                  console.error(e)
              }
      }
      Vd(),
      Qd.exports = Hd()
  }
  );
  var $d = qt(Es=>{
      "use strict";
      var Wd = Zd();
      Es.createRoot = Wd.createRoot,
      Es.hydrateRoot = Wd.hydrateRoot;
      var mm
  }
  );
  var kr = class {
      constructor(t) {
          this.browser = t
      }
      isMobile() {
          return false
      }
      isAppleDevice() {
          return ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(this.browser.platform) || this.browser.userAgent.includes("Mac")
      }
      isIOS() {
          return false
      }
      isTouchDevice() {
          return "ontouchstart"in window || "ontouchend"in document || navigator.maxTouchPoints > 0 || navigator.maxTouchPoints > 0
      }
  }
  ;
  var Ps = new kr(navigator)
    , Fn = ()=>Ps.isMobile()
    , Ls = ()=>Ps.isIOS();
  var _n = he(me());
  function ol(e, t) {
      var i;
      let n = new URL(t)
        , r = (i = n.pathname.split("/").pop()) != null ? i : ""
        , o = new URL(e);
      return o.pathname = r,
      o.search = n.search,
      o.hash = n.hash,
      {
          transactionID: r,
          searchString: o.search,
          universalLink: o.href,
          universalLinkWOProtocol: g1(o)
      }
  }
  var g1 = e=>e.href.replace(`${e.protocol}//`, "");
  var Vs = (e,t)=>{
      let n = new URL(e)
        , r = n.pathname.split("/");
      return r.pop(),
      n.pathname = [...r, t].join("/"),
      n.search = "",
      n.hash = "",
      n.href
  }
  ;
  var So = he(me())
    , il = So.default.createContext(null)
    , Qs = il.Provider
    , Hn = ()=>{
      let e = So.default.useContext(il);
      if (!e)
          throw "UniversalLinkContext must be provided";
      return e.link
  }
    , Zs = ()=>{
      let e = So.default.useContext(il);
      if (!e)
          throw "UniversalLinkContext must be provided";
      return e.membersUrl
  }
  ;
  var xr, y1 = e=>{
      xr = e
  }
  ;
  typeof window != "undefined" && y1(window.localStorage);
  var Tt = class {
      constructor(t, n) {
          this.key = t;
          this.initialValue = n;
          this.get = ()=>{
              let t = xr == null ? void 0 : xr.getItem(this.key);
              if (typeof t != "string")
                  return this.initialValue;
              try {
                  return JSON.parse(t)
              } catch (n) {
                  return this.initialValue
              }
          }
          ;
          this.set = t=>{
              xr.setItem(this.key, JSON.stringify(t))
          }
      }
      static create(t, n) {
          return new Tt(t,n)
      }
  }
  ;
  var At = he(me())
    , Ws = Tt.create("cookieInfoReceived", !1)
    , $s = ()=>{
      let[e,t] = At.default.useState(!1)
        , [n,r] = At.default.useState(Ws.get());
      return At.default.useEffect(()=>{
          !n && t(!0)
      }
      , []),
      n ? null : At.default.createElement("section", {
          className: `fixed inset-x-0 bottom-0 z-10 transition-transform delay-[5000ms] duration-1000 ${e ? "translate-y-0" : "translate-y-full"}`,
          style: {
              backgroundColor: "#1d1346"
          }
      }, At.default.createElement("div", {
          className: "w-content py-2 text-white"
      }, At.default.createElement("div", {
          className: "flex items-center justify-between gap-5 lg:gap-60"
      }, At.default.createElement("div", {
          className: "text-2xs font-light lg:text-xl lg:leading-tight"
      }, "\u0414\u043B\u044F \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u044F \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0430 \u043D\u0430\u0448\u0435\u0433\u043E \u0441\u0435\u0440\u0432\u0438\u0441\u0430 \u043C\u044B\xA0\u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u043C \u043D\u0430\xA0\u0441\u0430\u0439\u0442\u0435 \u0442\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u044E cookies."), At.default.createElement("a", {
          href: "#",
          onClick: ()=>{
              Ws.set(!0),
              r(!0)
          }
          ,
          className: "py-1 text-xs font-semibold lg:text-xl"
      }, "\u0421\u043E\u0433\u043B\u0430\u0441\u0435\u043D"))))
  }
  ;
  var Vn = he(me());
  var ut = he(me())
    , qs = ({className: e})=>ut.default.createElement("svg", {
      viewBox: "0 0 400 200",
      fill: "none",
      className: e
  }, ut.default.createElement("path", {
      fill: "#2A273F",
      fillRule: "evenodd",
      d: "M355.3 53.1v49.7h-17.5V68H321v34.8h-17.5V53.1h51.8ZM295 80.7c0 14.5-12 24-28.3 24-16.7 0-29-10-29-33 0-19.6 12.6-35.8 31.1-36 8.2 0 25.6-.5 25.6-.5l-7.8 14.5h-15.8c-8 0-15.3 6-16.3 14.3 4.3-4 10-6.3 16.8-6.3 14.8 0 23.7 9 23.7 23Zm-18 0c0-6.5-4.2-10.3-10.2-10.3-6.2 0-10.4 4-10.4 10.4 0 6.1 4.2 10.6 10.4 10.6 6.5 0 10.2-4.8 10.2-10.7ZM223.6 87.7s-4.2 2.4-10.5 2.9c-7.3.2-13.8-4.3-13.8-12.3 0-7.8 5.7-12.3 13.6-12.3 4.8 0 11.2 3.3 11.2 3.3l7-12.6c-4.4-3.3-10.3-5.1-17.1-5.1-17.3 0-30.7 11-30.7 26.6 0 15.7 12.6 26.5 30.7 26.2 5-.2 12-2 16.3-4.6l-6.7-12Z",
      clipRule: "evenodd"
  }), ut.default.createElement("path", {
      fill: "#605CA4",
      fillRule: "evenodd",
      d: "m0 43.4 24.2 43.2v26.3L0 155.9V43.5Z",
      clipRule: "evenodd"
  }), ut.default.createElement("path", {
      fill: "#DA2157",
      fillRule: "evenodd",
      d: "M93 70.8 115.9 57h46.5L93 99V70.9Z",
      clipRule: "evenodd"
  }), ut.default.createElement("path", {
      fill: "#FAB828",
      fillRule: "evenodd",
      d: "M93 43.2v57.1L69 85.4V0l24 43.2Z",
      clipRule: "evenodd"
  }), ut.default.createElement("path", {
      fill: "#EE7332",
      fillRule: "evenodd",
      d: "M162.3 56.9h-46.5L93 43.1 69 0l93.4 56.9Z",
      clipRule: "evenodd"
  }), ut.default.createElement("path", {
      fill: "#66B438",
      fillRule: "evenodd",
      d: "M93 156.2v-27.8L69 113.8v85.6L93 156.2Z",
      clipRule: "evenodd"
  }), ut.default.createElement("path", {
      fill: "#208ACA",
      fillRule: "evenodd",
      d: "m115.8 142.5-91.5-56L0 43.5l162.3 99h-46.5Z",
      clipRule: "evenodd"
  }), ut.default.createElement("path", {
      fill: "#1B823E",
      fillRule: "evenodd",
      d: "m68.9 199.4 24.3-43.2 22.6-13.7h46.5l-93.4 56.9Z",
      clipRule: "evenodd"
  }), ut.default.createElement("path", {
      fill: "#9A4F98",
      fillRule: "evenodd",
      d: "m0 156 69.2-42.1-23.3-14.2-21.6 13.2-24.3 43Z",
      clipRule: "evenodd"
  }), ut.default.createElement("path", {
      fill: "#2A273F",
      fillRule: "evenodd",
      d: "M200.6 136.6a5 5 0 0 1-2 1.5 7.8 7.8 0 0 1-5.5 0 6.1 6.1 0 0 1-3.6-3.3c-.3-.8-.5-1.7-.5-2.7 0-1 .2-1.8.5-2.6a6.3 6.3 0 0 1 5.9-4c1 0 2 .1 2.8.4a5 5 0 0 1 2.2 1.2l-1 1.8c-.6-.5-1.2-.8-1.8-1-.6-.2-1.2-.3-1.9-.3a4.3 4.3 0 0 0-3 1.2l-1 1.4c-.2.6-.3 1.2-.3 1.9s.1 1.3.3 1.8l1 1.5a5 5 0 0 0 6.8-.4l1.1 1.6ZM203.5 138.4v-12.6h2.2v9.4l7.2-9.4h2.2v12.6h-2.2V129l-7.2 9.4h-2.2ZM230.2 136.6a5 5 0 0 1-2.1 1.5 7.8 7.8 0 0 1-5.5 0 6.1 6.1 0 0 1-3.6-3.3 7.2 7.2 0 0 1 1.4-7.4 6.4 6.4 0 0 1 4.6-2c1 0 1.9.2 2.8.5a5 5 0 0 1 2.1 1.2l-1 1.8c-.5-.5-1.1-.8-1.7-1-.6-.2-1.3-.3-2-.3a4.3 4.3 0 0 0-3 1.2l-1 1.4c-.1.6-.3 1.2-.3 1.9s.2 1.3.4 1.8l1 1.5c.4.4.9.7 1.4.9a5 5 0 0 0 3.9-.2 5 5 0 0 0 1.5-1.2l1 1.7ZM231.1 125.8h11.7v2.2H238v10.4h-2.3V128h-4.7v-2.2ZM255.4 137a6 6 0 0 1-2.2 1.3 8.6 8.6 0 0 1-5.5 0 5.9 5.9 0 0 1-3.6-3.4c-.2-1-.4-1.8-.4-2.8 0-1 .2-1.8.5-2.6a6 6 0 0 1 3.3-3.5 7.2 7.2 0 0 1 5.2-.1 5.7 5.7 0 0 1 3.1 3c.3.7.5 1.5.5 2.4 0 .5 0 1-.2 1.5h-9.8c0 1.2.5 2.1 1.3 2.8.9.6 1.9 1 3.2 1 .8 0 1.6-.2 2.2-.4a5 5 0 0 0 1.7-1l.7 1.8Zm-5.2-9.4a4 4 0 0 0-2.8 1c-.7.6-1.1 1.4-1.3 2.4h7.8c0-1.1-.4-2-1-2.5-.7-.6-1.6-1-2.7-1ZM259.1 125.8h2l5 6.2 4.5-6.2h2v12.6h-2.2v-9.2L266 135l-4.6-5.8v9.2H259v-12.6ZM276.8 126.6a8.5 8.5 0 0 1 4.2-1.1c1.8 0 3 .4 3.8 1.3.7.9 1 2.1 1 3.8v7.6h-2v-1.6a5 5 0 0 1-1.6 1.2c-.6.4-1.5.6-2.5.6a4 4 0 0 1-2.8-1c-.8-.7-1.1-1.7-1.1-2.9 0-.6.1-1.2.4-1.7.2-.5.5-.9 1-1.2.4-.3.9-.6 1.5-.8l1.9-.2 1.6.1c.6.2 1.1.4 1.5.7v-1.6l-.5-1.3a2 2 0 0 0-.8-.8l-1.5-.2c-.8 0-1.5 0-2 .2l-1.5.7-.6-1.8Zm3.7 9.8c.8 0 1.5-.2 2-.5l1.2-1.1v-1.6a4.8 4.8 0 0 0-3.8-.7c-.3 0-.6.2-.9.4l-.6.6-.2 1c0 .5.2 1 .6 1.3.4.4 1 .6 1.7.6ZM306.9 120.3c-.4.5-.8.9-1.3 1l-1.5.6-1.7.3c-.6 0-1.3.3-2 .6a4 4 0 0 0-1.4 1 6 6 0 0 0-1 1.6l-.5 1.7-.3 1.8c.3-.5.6-.9 1-1.2a5.7 5.7 0 0 1 2.5-1.5c.5-.2 1-.2 1.6-.2.9 0 1.7.1 2.4.4a5.1 5.1 0 0 1 3 3.3 7.6 7.6 0 0 1 0 5 6.3 6.3 0 0 1-6 4c-1 0-2-.2-2.8-.6a6 6 0 0 1-2.1-1.5 7 7 0 0 1-1.4-2.5c-.3-1-.4-2-.4-3.2l.1-3c.1-1 .4-2 .7-2.9.4-1 .8-1.8 1.4-2.5.6-.8 1.5-1.4 2.5-1.8l2-.6a279.6 279.6 0 0 0 2.9-.7c.4-.1.8-.4 1-.8l1.3 1.7Zm-9.5 11c0 .8 0 1.5.3 2.2l.8 1.6a4 4 0 0 0 3.1 1.5 4.1 4.1 0 0 0 3-1.3c.4-.3.7-.8.9-1.3.2-.5.3-1 .3-1.7 0-1.2-.4-2.2-1-3-.8-.8-1.8-1.2-3-1.2a4.6 4.6 0 0 0-4 2l-.4 1.2ZM311.3 125.8h2.2v3.8h2.1c1 0 1.8 0 2.4.3a4 4 0 0 1 1.5 1c.4.4.7.8.8 1.4a5.6 5.6 0 0 1 0 3.2c-.2.6-.5 1-.9 1.5-.4.4-1 .7-1.6 1-.6.2-1.5.4-2.4.4h-4v-12.6Zm2.2 5.9v4.6h1.7c1 0 1.8-.2 2.3-.6.5-.4.7-1 .7-1.7 0-.8-.2-1.4-.7-1.8-.5-.3-1.2-.5-2.3-.5h-1.7Zm9.4-6h2.3v12.7h-2.3v-12.6ZM340 136.6a5 5 0 0 1-2.2 1.5c-.8.4-1.8.6-2.7.6-1 0-2-.2-2.8-.5a6 6 0 0 1-3.5-3.4c-.3-.8-.5-1.7-.5-2.7 0-1 .2-1.8.5-2.6a6.3 6.3 0 0 1 6-4c1 0 1.9.1 2.7.4a5 5 0 0 1 2.2 1.2l-1 1.8c-.6-.5-1.2-.8-1.8-1-.6-.2-1.2-.3-1.9-.3a4.3 4.3 0 0 0-3 1.2l-1 1.4c-.2.6-.3 1.2-.3 1.9s.1 1.3.4 1.8a4.2 4.2 0 0 0 2.4 2.3 5 5 0 0 0 5.4-1.3l1 1.7ZM341.2 125.8h11.3v2.2H348v10.4h-2.2V128h-4.6v-2.2ZM355 125.8h2.3v1.4c.4-.5 1-.9 1.7-1.2a6 6 0 0 1 2.5-.5c.9 0 1.7.1 2.4.5a5.3 5.3 0 0 1 3 3.3 8 8 0 0 1 0 5.3 6.3 6.3 0 0 1-3.4 3.6c-.8.3-1.7.5-2.7.5-.7 0-1.3 0-2-.2-.6-.2-1.1-.4-1.5-.7v6.2H355v-18.2Zm5.9 1.8c-.8 0-1.5.1-2.1.5-.6.3-1.2.7-1.5 1.2v6.3a5.4 5.4 0 0 0 3.3 1c.7 0 1.3-.1 1.8-.4a4 4 0 0 0 2.2-2.4 5.6 5.6 0 0 0 0-3.6c-.1-.5-.4-1-.7-1.4-.4-.4-.8-.7-1.3-.9-.5-.2-1-.3-1.7-.3ZM370.4 125.8h2.3v3.8h2.1c1 0 1.8 0 2.5.3.6.3 1.1.6 1.5 1 .4.4.7.8.8 1.4a5.5 5.5 0 0 1 0 3.2c-.2.6-.5 1-.9 1.5-.4.4-1 .7-1.6 1-.7.2-1.5.4-2.5.4h-4.2v-12.6Zm2.3 5.9v4.6h1.7c1.1 0 1.9-.2 2.4-.6.4-.4.7-1 .7-1.7 0-.8-.3-1.4-.8-1.8-.4-.3-1.2-.5-2.3-.5h-1.7Zm9.6-6h2.3v12.7h-2.3v-12.6ZM395.2 131.9l4.8 6.5h-2.8l-3.7-5.1-3.8 5h-2.6l4.8-6.3-4.5-6.2h2.8l3.4 4.7 3.5-4.7h2.6l-4.5 6ZM199 154h-6.8v10.5h-2.3v-12.6h11.4v12.6H199V154ZM213.8 154h-4.4l-.1 2.2c-.2 1.8-.4 3.2-.7 4.3a8 8 0 0 1-1 2.5c-.5.6-1 1-1.5 1.2l-1.8.3-.2-2.2c.2 0 .5 0 .8-.2.3-.1.6-.4 1-.9a16.8 16.8 0 0 0 1.3-5.5l.1-3.8h8.7v12.4h-2.2v-10.2ZM220.2 152.7a8.5 8.5 0 0 1 4.2-1.1c1.8 0 3 .4 3.8 1.3.7.9 1 2.1 1 3.8v7.6h-2v-1.6a5 5 0 0 1-1.6 1.2c-.6.4-1.5.6-2.5.6a4 4 0 0 1-2.8-1c-.8-.7-1.1-1.7-1.1-2.9 0-.6.1-1.2.3-1.7.3-.5.6-.9 1-1.2l1.6-.8 1.9-.2 1.6.1c.6.2 1.1.4 1.5.7v-1.6c-.1-.5-.3-1-.5-1.2a2 2 0 0 0-.8-.8c-.4-.2-1-.3-1.5-.3-.8 0-1.5 0-2 .2l-1.5.7-.6-1.8Zm3.7 9.8c.8 0 1.5-.2 2-.5l1.2-1.1v-1.6a4.8 4.8 0 0 0-3.8-.7c-.3 0-.6.2-.9.4l-.6.6-.2 1c0 .5.2 1 .6 1.3.4.4 1 .6 1.7.6ZM231.4 151.9h11.4v2.2h-4.6v10.4H236V154h-4.6V152ZM255.4 162.8c-.6.6-1.3 1-2.2 1.3a8.4 8.4 0 0 1-5.2 0c-.9-.4-1.6-.8-2.2-1.4-.5-.6-1-1.2-1.3-2a7.3 7.3 0 0 1 0-5.2 5.9 5.9 0 0 1 3.2-3.4 7 7 0 0 1 5-.1 5.5 5.5 0 0 1 3.1 3c.3.6.5 1.4.5 2.2 0 .6 0 1-.2 1.5h-9.6c.1 1.2.6 2 1.4 2.7.8.7 1.8 1 3 1 .8 0 1.5-.1 2.2-.4a5 5 0 0 0 1.6-.9l.7 1.7Zm-5-9.2a4 4 0 0 0-2.8 1c-.7.6-1 1.4-1.2 2.3h7.6c0-1-.4-1.8-1-2.4-.7-.6-1.5-.9-2.6-.9ZM257.5 151.9h2.8l4.3 6-4.6 6.6h-2.8l4.9-6.5-4.6-6.1Zm7.7 0h2.2v12.6h-2.2v-12.6Zm5.3 6 5 6.6h-2.8L268 158l4.4-6.1h2.7l-4.6 6ZM287.8 162.8c-.6.6-1.3 1-2.2 1.3a8.4 8.4 0 0 1-5.3 0c-.8-.4-1.5-.8-2-1.4-.6-.6-1.1-1.2-1.4-2a7.3 7.3 0 0 1 0-5.2 5.8 5.8 0 0 1 3.2-3.4 7 7 0 0 1 5-.1 5.5 5.5 0 0 1 3.1 3c.3.6.5 1.4.5 2.2 0 .6 0 1-.2 1.5H279c.1 1.2.6 2 1.4 2.7.7.7 1.8 1 3 1 .8 0 1.5-.1 2.2-.4a5 5 0 0 0 1.6-.9l.7 1.7Zm-5-9.2a4 4 0 0 0-2.8 1c-.7.6-1 1.4-1.2 2.3h7.6c0-1-.4-1.8-1-2.4-.7-.6-1.6-.9-2.6-.9ZM291.5 164.5v-12.7h2.3v9.4l7.4-9.4h2.3v12.7h-2.3V155l-7.4 9.5h-2.3Zm4-19.2c0 1.5.8 2.2 2.2 2.2 1.2 0 2-.7 2-2.2h2.2l-.3 1.5c-.2.5-.5 1-.9 1.3a4.2 4.2 0 0 1-3 1.1c-.7 0-1.4 0-2-.3a4 4 0 0 1-1.3-.8l-.8-1.3c-.2-.4-.3-1-.3-1.5h2.2Z",
      clipRule: "evenodd"
  }));
  var Gs = ()=>Vn.default.createElement("header", {
      className: "w-content flex animate-slide-down items-center justify-between pt-3 sm:pt-6 md:pt-9"
  }, Vn.default.createElement("div", {
      className: "w-28 sm:w-32 md:w-40"
  }, Vn.default.createElement(qs, {
      className: "w-full"
  })), Vn.default.createElement("div", {
      className: "text-base md:text-2xl"
  }, Vn.default.createElement("a", {
      href: "https://sbp.nspk.ru/"
  }, "sbp.nspk.ru")));
  var Qn = he(me());
  var mt = he(me())
    , Xs = ()=>mt.default.createElement("div", {
      className: "flex h-1.5 lg:h-3"
  }, mt.default.createElement("div", {
      style: Ys
  }), mt.default.createElement("div", {
      style: w1
  }), mt.default.createElement("div", {
      style: k1
  }), mt.default.createElement("div", {
      style: S1
  }), mt.default.createElement("div", {
      style: x1
  }), mt.default.createElement("div", {
      style: _1
  }), mt.default.createElement("div", {
      style: C1
  }), mt.default.createElement("div", {
      style: E1
  }), mt.default.createElement("div", {
      style: Ys
  }))
    , Ys = {
      backgroundColor: "#8f4794",
      width: "5%"
  }
    , w1 = {
      backgroundColor: "#5b57a2",
      width: "5%"
  }
    , k1 = {
      backgroundColor: "#0698d6",
      width: "10%"
  }
    , S1 = {
      backgroundColor: "#00853f",
      width: "14%"
  }
    , x1 = {
      backgroundColor: "#78b72a",
      width: "22%"
  }
    , _1 = {
      backgroundColor: "#f9b429",
      width: "11%"
  }
    , C1 = {
      backgroundColor: "#ef8019",
      width: "18%"
  }
    , E1 = {
      backgroundColor: "#e40646",
      width: "13%"
  };
  var _r = he(me())
    , Ks = ()=>{
      let e = _r.default.useMemo(()=>new Date().getFullYear(), []);
      return _r.default.createElement(_r.default.Fragment, null, "\u0412\u0441\u0435 \u043F\u043B\u0430\u0442\u0435\u0436\u0438 \u043F\u0440\u043E\u0432\u043E\u0434\u044F\u0442\u0441\u044F \u0421\u0438\u0441\u0442\u0435\u043C\u043E\u0439 \u0411\u044B\u0441\u0442\u0440\u044B\u0445 \u041F\u043B\u0430\u0442\u0435\u0436\u0435\u0439.", _r.default.createElement("br", null), "\xA9 ", e, " \u0421\u0438\u0441\u0442\u0435\u043C\u0430 \u0411\u044B\u0441\u0442\u0440\u044B\u0445 \u041F\u043B\u0430\u0442\u0435\u0436\u0435\u0439. \u0412\u0441\u0435 \u043F\u0440\u0430\u0432\u0430 \u0437\u0430\u0449\u0438\u0449\u0435\u043D\u044B.")
  }
  ;
  var Js = ()=>Qn.default.createElement("footer", {
      className: "w-content pb-3 lg:pb-7"
  }, Qn.default.createElement("div", {
      className: "mb-3 lg:mb-7"
  }, Qn.default.createElement(Xs, null)), Qn.default.createElement("div", {
      className: "text-center text-2xs font-light leading-none sm:text-xs lg:text-xl lg:leading-none"
  }, Qn.default.createElement(Ks, null)));
  var Rt = he(me());
  var bs = e=>e.length !== 32 ? !1 : /[A-Z0-9]{32}/.test(e);
  var ea = ({children: e})=>{
      let {transactionID: t} = Hn();
      return Rt.default.useMemo(()=>bs(t), [t]) ? Rt.default.createElement(Rt.default.Fragment, null, e) : Rt.default.createElement("div", {
          className: "flex items-center justify-center p-20"
      }, Rt.default.createElement("div", {
          className: "flex flex-col items-center gap-6 rounded-lg bg-red-100 px-6 py-4"
      }, Rt.default.createElement("p", null, "\u041F\u043E\u0445\u043E\u0436\u0435, \u0447\u0442\u043E-\u0442\u043E \u043F\u043E\u0448\u043B\u043E \u043D\u0435 \u0442\u0430\u043A c \u0438\u0434\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0440\u043E\u043C \u043F\u043B\u0430\u0442\u0451\u0436\u043D\u043E\u0439 \u0441\u0441\u044B\u043B\u043A\u0438:"), Rt.default.createElement("div", {
          className: "rounded-md bg-red-300 p-1 text-red-900"
      }, t), Rt.default.createElement("p", null, "\u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435, \u0447\u0442\u043E \u0441\u0441\u044B\u043B\u043A\u0430 \u0431\u044B\u043B\u0430 \u0432\u0432\u0435\u0434\u0435\u043D\u0430 \u0432\u0435\u0440\u043D\u043E.")))
  }
  ;
  var ta = ({baseOrigin: e, className: t, currentURL: n, children: r, membersURLPath: o})=>{
      let i = ol(e, n)
        , l = Vs(n, o);
      return _n.default.createElement(Qs, {
          value: {
              link: i,
              membersUrl: l
          }
      }, _n.default.createElement("div", {
          className: t
      }, _n.default.createElement(Gs, null), _n.default.createElement(ea, null, r), _n.default.createElement(Js, null)), _n.default.createElement($s, null))
  }
  ;
  var xo = he(me())
    , na = ({title: e, subtitle: t})=>xo.default.createElement("div", {
      className: "flex flex-col justify-center font-bold leading-[1.2] xl:w-[580px]"
  }, xo.default.createElement("div", {
      className: "text-[80px] xl:text-[90px]"
  }, e), xo.default.createElement("div", {
      className: "-mt-1 text-[34px]"
  }, t));
  function Cr(...e) {
      return e.filter(t=>t).join(" ")
  }
  var _o = he(me())
    , ra = ({className: e, title: t, subtitle: n})=>_o.default.createElement("div", {
      className: Cr("font-bold lg:flex", e)
  }, _o.default.createElement("div", {
      className: "text-4xl lg:text-3xl"
  }, t), _o.default.createElement("div", {
      className: "text-xl leading-none lg:text-3xl"
  }, n));
  var ll = he(me())
    , oa = ({children: e})=>Fn() ? null : ll.default.createElement(ll.default.Fragment, null, e);
  var ul = he(me())
    , ia = ({children: e})=>Fn() ? ul.default.createElement(ul.default.Fragment, null, e) : null;
  var gt = he(me());
  var vt = he(me());
  var la = (e,t)=>e.toLowerCase().replace(t, "")
    , ua = (e,t,n=/[\s-]+/g)=>la(e, n).includes(la(t, n));
  var Zn = class {
      constructor(t) {
          this.items = t
      }
      static create(t, n=[]) {
          let r = []
            , o = i=>{
              !i || r.some(l=>l.schema === i.schema) || r.push(i)
          }
          ;
          for (let i of n)
              o(t.find(l=>l.bankName === i));
          return t.forEach(o),
          new Zn(r)
      }
      select(t="") {
          return this.items.filter(n=>ua(n.bankName, t))
      }
  }
  ;
  var Gt = he(me());
  var sa = (e,t,n)=>{
      if (Er(t)) {
          let o = t.webClientUrl.endsWith("/");
          return `${t.webClientUrl}${o ? "" : "/"}${e.transactionID}${e.searchString}`
      }
      return n ? `${t.schema}://${e.universalLinkWOProtocol}` : `intent://${e.universalLinkWOProtocol}#Intent;scheme=${t.schema};end`
  }
    , Er = e=>!!e.webClientUrl && (e.isWebClientActive === !0 || e.isWebClientActive === "true");
  var Co = he(me())
    , Eo = ({className: e})=>Co.default.createElement("svg", {
      viewBox: "0 0 80 80",
      width: "80",
      height: "80",
      className: e
  }, Co.default.createElement("rect", {
      width: "80",
      height: "80",
      fill: "#F4F3F6",
      rx: "18"
  }), Co.default.createElement("path", {
      fill: "#DFDDE5",
      d: "M19.252 58.8891h41.4948c.6953 0 1.2574.5564 1.2574 1.245v3.7352c0 .3437-.2804.6225-.6286.6225H18.6234c-.3471 0-.6288-.2788-.6288-.6225v-3.7352c0-.6886.5633-1.245 1.2575-1.245h-.0001Zm30.1781-23.0337h6.2871c.3482 0 .6288.2776.6288.6226v1.245c0 .3437-.2806.6225-.6288.6225v14.9408c.3482 0 .6288.2776.6288.6226v1.245c0 .3437-.2806.6225-.6288.6225h-6.2871c-.3471 0-.6286-.2788-.6286-.6225v-1.245c0-.2988.2162-.5354.4978-.5965V38.3183c-.2816-.0611-.4978-.2976-.4978-.5951v-1.2451c0-.345.2815-.6226.6286-.6226v-.0001Zm-12.5742 0h6.2871c.3483 0 .6287.2776.6287.6226v1.245c0 .3199-.2477.5752-.5622.6088v14.9669c.3145.0336.5622.2889.5622.6102v1.245c0 .3435-.2804.6225-.6287.6225h-6.2871c-.3471 0-.6288-.279-.6288-.6225v-1.245c0-.3213.249-.5766.5633-.6102V38.3318c-.3143-.0336-.5633-.2889-.5633-.6088v-1.245c0-.345.2817-.6226.6288-.6226Zm-12.5742 0h6.2871c.3483 0 .6288.2776.6288.6226v1.245c0 .3437-.2805.6225-.6288.6225v14.9408c.3483 0 .6288.2776.6288.6226v1.245c0 .3437-.2805.6225-.6288.6225h-6.2871c-.347 0-.6286-.2788-.6286-.6225v-1.245c0-.345.2816-.6226.6286-.6226V38.3455c-.347 0-.6286-.2788-.6286-.6225v-1.245c0-.345.2816-.6226.6286-.6226Zm15.0941-20.1912a1.268 1.268 0 0 1 1.2486 0L61.3718 27.404c.391.2215.6325.6337.6325 1.0806v3.6356c0 .3436-.2804.6226-.6287.6226H18.6234c-.347 0-.6288-.279-.6288-.6226v-3.6356c0-.4469.2427-.8591.6338-1.0806l20.7475-11.7398h-.0001Zm.0175 6.8908a.738.738 0 0 1 1.2124 0l3.1426 4.5261a.7382.7382 0 0 1-.6062 1.1589h-6.2852a.738.738 0 0 1-.6062-1.1589l3.1426-4.5261Z"
  }));
  var sl = he(me())
    , aa = ({className: e})=>sl.default.createElement("svg", {
      width: "15",
      height: "22",
      viewBox: "0 0 15 22",
      className: e
  }, sl.default.createElement("path", {
      fill: "#1D1346",
      fillOpacity: "0.7",
      d: "m4.431 21.4057 9.896-8.745c.8973-.7929.8973-2.0786 0-2.8715L3.922.5943C3.0253-.198 1.5692-.198.6725.5943s-.8967 2.0791 0 2.8715L9.453 11.225l-8.2713 7.3093c-.8967.7924-.8967 2.0791 0 2.8715.8967.7924 2.3527.7924 3.2494 0Z"
  }));
  var No = Tt.create("sbpBankUsed", [])
    , N1 = {
      get: ()=>No.get(),
      add: e=>{
          No.set([e, ...No.get().filter(t=>t !== e)])
      }
      ,
      clear: ()=>No.set([])
  }
    , Mo = ()=>N1;
  var al = "flex items-center px-3 py-1.5 md:basis-1/2 md:p-3 lg:p-4"
    , ca = ({bank: e, index: t})=>{
      let[n,r] = Gt.default.useState(!1)
        , o = Hn()
        , i = Mo()
        , l = Er(e)
        , s = ()=>{
          i.add(e.bankName)
      }
      ;
      return Gt.default.createElement("a", {
          href: sa(o, e, Ls()),
          onClick: s,
          className: al,
          "data-testid": l ? "web-link" : "app-link"
      }, Gt.default.createElement("div", {
          className: "relative h-8 w-8 shrink-0 overflow-hidden rounded-lg"
      }, !n && Gt.default.createElement("img", {
          src: e.logoURL,
          onError: ()=>r(!0),
          className: "relative z-10 bg-white",
          crossOrigin: "anonymous",
          loading: t > 8 ? "lazy" : void 0
      }), Gt.default.createElement(Eo, {
          className: "absolute inset-0 h-full w-full"
      })), Gt.default.createElement("span", {
          className: "grow px-3 text-xl font-bold"
      }, e.bankName), Gt.default.createElement(aa, {
          className: "w-2 shrink-0"
      }))
  }
  ;
  var Po = he(me());
  var fa = ()=>Po.default.createElement("div", {
      className: `animate-pulse ${al}`
  }, Po.default.createElement(Eo, {
      className: "h-8 w-8"
  }), Po.default.createElement("div", {
      className: "ml-3 h-4 grow rounded-md bg-gray-200"
  }));
  var Yt = he(me());
  var da = Yt.default.createContext(null)
    , pa = ({children: e})=>{
      let t = M1();
      return Yt.default.createElement(da.Provider, {
          value: t
      }, e)
  }
    , ha = ()=>{
      let e = Yt.default.useContext(da);
      if (!e)
          throw "BanksContext must be provided";
      return e
  }
    , M1 = ()=>{
      let e = Zs()
        , [t,n] = Yt.default.useState(!0)
        , [r,o] = Yt.default.useState("")
        , [i,l] = Yt.default.useState([]);
      return Yt.default.useEffect(()=>{
          fetch(e).then(s=>s.json()).then(s=>{
              l(s.dictionary)
          }
          ).catch(()=>{
              o("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0441\u043F\u0438\u0441\u043E\u043A \u0431\u0430\u043D\u043A\u043E\u0432")
          }
          ).finally(()=>{
              n(!1)
          }
          )
      }
      , []),
      {
          banks: i,
          loading: t,
          error: r
      }
  }
  ;
  var ma = ({query: e, webClientsOnly: t})=>{
      let {banks: n, loading: r, error: o} = ha()
        , i = Mo()
        , l = vt.default.useMemo(()=>{
          let s = Zn.create(n, i.get()).select(e);
          return t ? s.filter(Er) : s
      }
      , [n, e, t]);
      return r ? vt.default.createElement(vt.default.Fragment, null, [...Array(8).keys()].map(s=>vt.default.createElement(fa, {
          key: s
      }))) : o ? vt.default.createElement("div", {
          className: "p-3"
      }, o) : l.length === 0 ? e ? vt.default.createElement("div", {
          className: "p-3"
      }, "\u041F\u043E \u0412\u0430\u0448\u0435\u043C\u0443 \u0437\u0430\u043F\u0440\u043E\u0441\u0443 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u0432 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E") : vt.default.createElement("div", {
          className: "p-3"
      }, "\u0421\u043F\u0438\u0441\u043E\u043A \u043F\u0443\u0441\u0442. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C \u043F\u043E\u0437\u0436\u0435.") : vt.default.createElement(vt.default.Fragment, null, l.map((s,a)=>vt.default.createElement(ca, {
          key: s.schema,
          bank: s,
          index: a
      })))
  }
  ;
  var cl = he(me())
    , va = ({className: e})=>cl.default.createElement("svg", {
      width: "28",
      height: "29",
      viewBox: "0 0 28 29",
      className: e
  }, cl.default.createElement("path", {
      fill: "#1D1346",
      fillOpacity: "0.35",
      d: "M9.011 17.5643.0636 26.512l1.6803 1.6804 8.9641-8.9641c1.788 1.3977 4.0385 2.2311 6.482 2.2311 5.8168 0 10.5391-4.7223 10.5391-10.5391 0-5.8166-4.7223-10.539-10.5391-10.539-5.8166 0-10.539 4.7224-10.539 10.539 0 2.5181.885 4.8311 2.3602 6.644ZM17.19 2.7577c4.5051 0 8.1627 3.6576 8.1627 8.1626 0 4.5051-3.6576 8.1627-8.1627 8.1627-4.505 0-8.1626-3.6576-8.1626-8.1627 0-4.505 3.6576-8.1626 8.1626-8.1626Z"
  }));
  var ga = ({className: e, webClientsOnly: t, wrap: n=!0})=>{
      let[r,o] = gt.default.useState("");
      return gt.default.createElement("section", {
          className: Cr("flex flex-col overflow-hidden", e)
      }, gt.default.createElement("div", {
          className: "relative"
      }, gt.default.createElement("input", {
          type: "text",
          value: r,
          onChange: i=>o(i.target.value),
          placeholder: "\u041F\u043E\u0438\u0441\u043A",
          className: "w-full rounded-md bg-white py-1 pl-3 pr-8 outline-none"
      }), gt.default.createElement("div", {
          className: "pointer-events-none absolute inset-y-0 right-3 flex items-center"
      }, gt.default.createElement(va, {
          className: "w-4"
      }))), gt.default.createElement("div", {
          className: "mb-1 mt-4 text-xl font-bold"
      }, "\u0412\u0441\u0435 \u0431\u0430\u043D\u043A\u0438"), gt.default.createElement("div", {
          className: "blur-y animate-delay animate-slide-up overflow-hidden rounded-md bg-white"
      }, gt.default.createElement("div", {
          className: Cr("h-full overflow-y-auto py-1", n && "md:flex md:flex-wrap"),
          "data-testid": "banks-list"
      }, gt.default.createElement(ma, {
          query: r,
          webClientsOnly: t
      }))))
  }
  ;
  var Sa = he(me());
  var wa = he(ya());
  function ka(e) {
      return new wa.default({
          width: 330,
          height: 330,
          data: e,
          margin: 10,
          qrOptions: {
              typeNumber: 0,
              mode: "Byte",
              errorCorrectionLevel: "Q"
          },
          imageOptions: {
              hideBackgroundDots: !1,
              imageSize: .5,
              margin: 0
          },
          dotsOptions: {
              type: "square",
              color: "#1d1346",
              gradient: null
          },
          backgroundOptions: {
              color: "#ffffff"
          },
          image: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCA1MDAgNTAwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zOnNlcmlmPSJodHRwOi8vd3d3LnNlcmlmLmNvbS8iIHN0eWxlPSJmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MS41OyI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjUwMCIgaGVpZ2h0PSI1MDAiIHN0eWxlPSJmaWxsOiNmZmY7c3Ryb2tlOiNmZmY7c3Ryb2tlLXdpZHRoOjFweDsiLz48Zz48cGF0aCBkPSJNODguNjU4LDEzNy43MDFsNDcuOTc3LDg1Ljk5MWwtMCw1Mi40MjhsLTQ3Ljg5OCw4NS44MjRsLTAuMDc5LC0yMjQuMjQzWiIgc3R5bGU9ImZpbGw6IzYwNWNhNDsiLz48cGF0aCBkPSJNMjczLjgxLDE5Mi40NDFsNDUuMTQ4LC0yNy42NjJsOTIuMzg0LC0wLjA3bC0xMzcuNTMyLDg0LjIyNWwwLC01Ni40OTNaIiBzdHlsZT0iZmlsbDojZGEyMTU3OyIvPjxwYXRoIGQ9Ik0yNzMuNTYsMTM3LjI4M2wwLjI1LDExMy43ODNsLTQ4LjMzMSwtMjkuNjA2bC0wLC0xNzAuMTE2bDQ4LjA4MSw4NS45MzlaIiBzdHlsZT0iZmlsbDojZmFiODI4OyIvPjxwYXRoIGQ9Ik00MTEuMzQxLDE2NC42MzlsLTkyLjQsMC4wN2wtNDUuNDA3LC0yNy41MjJsLTQ4LjA1NSwtODUuODQzbDE4NS44NjIsMTEzLjI5NVoiIHN0eWxlPSJmaWxsOiNlZTczMzI7Ii8+PHBhdGggZD0iTTI3My44MSwzNjIuNDk0bDAsLTU1LjMxOWwtNDguMzMxLC0yOS4xbDAuMDA4LDE3MC41ODFsNDguMzIzLC04Ni4xNjJaIiBzdHlsZT0iZmlsbDojNjZiNDM4OyIvPjxwYXRoIGQ9Ik0zMTguOTM5LDMzNC45MzVsLTE4Mi4wMzIsLTExMS4yOTRsLTQ4LjI0OSwtODUuOTRsMzIyLjY4MywxOTcuMTI2bC05Mi40MDIsMC4xMDhaIiBzdHlsZT0iZmlsbDojMjA4YWNhOyIvPjxwYXRoIGQ9Ik0yMjUuNDc5LDQ0OC42NTZsNDguMzQ0LC04Ni4xODlsNDUuMDkxLC0yNy40MjNsOTIuNDI3LC0wLjEwOWwtMTg1Ljg2MiwxMTMuNzIxWiIgc3R5bGU9ImZpbGw6IzFiODIzZTsiLz48cGF0aCBkPSJNODguNjU4LDM2MS45NDRsMTM3LjE3NywtODMuNzQ5bC00Ni4xMywtMjguMTk1bC00Mi44NywyNi4xODVsLTQ4LjE3Nyw4NS43NTlaIiBzdHlsZT0iZmlsbDojOWE0Zjk4OyIvPjwvZz48L3N2Zz4=",
          cornersSquareOptions: {
              type: "square",
              color: "#1d1346",
              gradient: null
          },
          cornersDotOptions: {
              type: "square",
              color: "#1d1346"
          }
      })
  }
  var xa = ()=>{
      let e = Hn();
      return Sa.default.createElement("div", {
          ref: n=>{
              ka(e.universalLink).append(n)
          }
          ,
          className: "flex h-[330px] min-w-[330px] justify-center"
      })
  }
  ;
  var Nt = he(me())
    , qd = he($d());
  function Ns() {
      let e = "https://qr.nspk.ru"
        , t = document.getElementById("payment-form");
      (0,
      qd.createRoot)(t).render(Nt.default.createElement(ta, {
          baseOrigin: e,
          currentURL: document.getElementById("app_url").innerText,
          membersURLPath: "proxyapp/c2bmembers.json",
          className: Fn() ? "tall:flex tall:h-screen tall:flex-col" : ""
      }, Nt.default.createElement(ia, null, Nt.default.createElement(ra, {
          className: "w-content mt-4",
          title: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435\xA0",
          subtitle: "\u0431\u0430\u043D\u043A\u043E\u0432\u0441\u043A\u043E\u0435 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0438\xA0\u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435\xA0\u043E\u043F\u043B\u0430\u0442\u0443"
      }), Nt.default.createElement(pa, null, Nt.default.createElement(ga, {
          className: "w-content my-4"
      }))), Nt.default.createElement(oa, null, Nt.default.createElement("div", {
          className: "w-content overflow-hidden py-8 lg:py-24"
      }, Nt.default.createElement("section", {
          className: "animate-delay animate-slide-up lg:flex lg:gap-16"
      }, Nt.default.createElement(xa, null), Nt.default.createElement(na, {
          title: "\u0414\u043B\u044F \u043E\u043F\u043B\u0430\u0442\u044B",
          subtitle: "\u043E\u0442\u0441\u043A\u0430\u043D\u0438\u0440\u0443\u0439\u0442\u0435 QR-\u043A\u043E\u0434 \u0432\xA0\u043C\u043E\u0431\u0438\u043B\u044C\u043D\u043E\u043C \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438 \u0431\u0430\u043D\u043A\u0430 \u0438\u043B\u0438 \u0448\u0442\u0430\u0442\u043D\u043E\u0439 \u043A\u0430\u043C\u0435\u0440\u043E\u0439 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430"
      })))))),
      document.body.classList.add("loaded")
  }
  Ns();
}
)();
/*! Bundled license information:

react/cjs/react.production.min.js:
(**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *)

scheduler/cjs/scheduler.production.min.js:
(**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *)

react-dom/cjs/react-dom.production.min.js:
(**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *)
*/
