(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.illuminated = {})));
}(this, (function (exports) { 'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  var Vec2 = function () {
      function Vec2(x, y) {
          classCallCheck(this, Vec2);

          this.x = x || 0;
          this.y = y || 0;
      }

      createClass(Vec2, [{
          key: 'copy',
          value: function copy() {
              return new Vec2(this.x, this.y);
          }
      }, {
          key: 'dot',
          value: function dot(v) {
              return v.x * this.x + v.y * this.y;
          }
      }, {
          key: 'sub',
          value: function sub(v) {
              return new Vec2(this.x - v.x, this.y - v.y);
          }
      }, {
          key: 'add',
          value: function add(v) {
              return new Vec2(this.x + v.x, this.y + v.y);
          }
      }, {
          key: 'mul',
          value: function mul(n) {
              return new Vec2(this.x * n, this.y * n);
          }
      }, {
          key: 'inv',
          value: function inv() {
              return this.mul(-1);
          }
      }, {
          key: 'dist2',
          value: function dist2(v) {
              var dx = this.x - v.x;
              var dy = this.y - v.y;
              return dx * dx + dy * dy;
          }
      }, {
          key: 'normalize',
          value: function normalize() {
              var length = Math.sqrt(this.length2());
              return new Vec2(this.x / length, this.y / length);
          }
      }, {
          key: 'length2',
          value: function length2() {
              return this.x * this.x + this.y * this.y;
          }
      }, {
          key: 'toString',
          value: function toString() {
              return this.x + ',' + this.y;
          }
      }, {
          key: 'inBound',
          value: function inBound(topLeft, bottomRight) {
              return topLeft.x < this.x && this.x < bottomRight.x && topLeft.y < this.y && this.y < bottomRight.y;
          }
      }]);
      return Vec2;
  }();

  var GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
  var _2PI = 2 * Math.PI;

  function path(ctx, points, dontJoinLast) {
      var p = points[0];
      ctx.moveTo(p.x, p.y);
      for (var i = 1, l = points.length; i < l; ++i) {
          p = points[i];
          ctx.lineTo(p.x, p.y);
      }
      if (!dontJoinLast && points.length > 2) {
          p = points[0];
          ctx.lineTo(p.x, p.y);
      }
  }

  function createCanvasAnd2dContext(id, w, h) {
      var iid = 'illujs_' + id;
      var canvas = document.getElementById(iid);

      if (canvas === null) {
          canvas = document.createElement('canvas');
          canvas.id = iid;
          canvas.width = w;
          canvas.height = h;
          canvas.style.display = 'none';
          document.body.appendChild(canvas);
      }

      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      canvas.width = w;
      canvas.height = h;

      return {
          canvas: canvas,
          ctx: ctx,
          w: w,
          h: h
      };
  }

  var getRGBA = function () {
      //var ctx = createCanvasAnd2dContext('grgba', 1, 1)
      var canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      var ctx = canvas.getContext('2d');

      return function (color, alpha) {
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, 1, 1);
          var d = ctx.getImageData(0, 0, 1, 1).data;
          return 'rgba(' + [d[0], d[1], d[2], alpha] + ')';
      };
  }();

  function getTan2(radius, center) {
      var epsilon = getTan2.epsilon || 1e-6,
          // constant
      x0,
          y0,
          len2,
          soln,
          solutions = [],
          a = radius;
      if ((typeof a === 'undefined' ? 'undefined' : _typeof(a)) === 'object' && typeof center === 'number') {
          var tmp = a;
          center = a;
          center = tmp; // swap
      }
      if (typeof center === 'number') {
          // getTan2(radius:number, x0:number, y0:number)
          x0 = center;
          y0 = arguments[2];
          len2 = x0 * x0 + y0 * y0;
      } else {
          // getTans2(radius:number, center:object={x:x0,y:y0})
          x0 = center.x;
          y0 = center.y;
          len2 = center.length2();
      }
      // t = +/- Math.acos( (-a*x0 +/- y0 * Math.sqrt(x0*x0 + y0*y0 - a*a))/(x0*x0 + y0*y) )
      var len2a = y0 * Math.sqrt(len2 - a * a),
          tt = Math.acos((-a * x0 + len2a) / len2),
          nt = Math.acos((-a * x0 - len2a) / len2),
          tt_cos = a * Math.cos(tt),
          tt_sin = a * Math.sin(tt),
          nt_cos = a * Math.cos(nt),
          nt_sin = a * Math.sin(nt);

      // Note: cos(-t) == cos(t) and sin(-t) == -sin(t) for all t, so find
      // x0 + a*cos(t), y0 +/- a*sin(t)
      // Solutions have equal lengths
      soln = new Vec2(x0 + nt_cos, y0 + nt_sin);
      solutions.push(soln);
      var dist0 = soln.length2();

      soln = new Vec2(x0 + tt_cos, y0 - tt_sin);
      solutions.push(soln);
      var dist1 = soln.length2();
      if (Math.abs(dist0 - dist1) < epsilon) return solutions;

      soln = new Vec2(x0 + nt_cos, y0 - nt_sin);
      solutions.push(soln);
      var dist2 = soln.length2();
      // Changed order so no strange X of light inside the circle. Could also sort results.
      if (Math.abs(dist1 - dist2) < epsilon) return [soln, solutions[1]];
      if (Math.abs(dist0 - dist2) < epsilon) return [solutions[0], soln];

      soln = new Vec2(x0 + tt_cos, y0 + tt_sin);
      solutions.push(soln);
      var dist3 = soln.length2();
      if (Math.abs(dist2 - dist3) < epsilon) return [solutions[2], soln];
      if (Math.abs(dist1 - dist3) < epsilon) return [solutions[1], soln];
      if (Math.abs(dist0 - dist3) < epsilon) return [solutions[0], soln];

      // return all 4 solutions if no matching vector lengths found.
      return solutions;
  }

  var Light = function () {
      function Light(options) {
          classCallCheck(this, Light);

          var defaults$$1 = {
              position: new Vec2(),
              distance: 100,
              diffuse: 0.8
          };
          this.options = Object.assign(defaults$$1, options);
      }

      createClass(Light, [{
          key: 'render',
          value: function render() {}
      }, {
          key: 'mask',
          value: function mask(ctx) {
              var c = this._getVisibleMaskCache();
              ctx.drawImage(c.canvas, Math.round(this.options.position.x - c.w / 2), Math.round(this.options.position.y - c.h / 2));
          }
      }, {
          key: 'bounds',
          value: function bounds() {
              return {
                  topleft: new Vec2(this.options.position.x - this.options.distance, this.options.position.y - this.options.distance),
                  bottomright: new Vec2(this.options.position.x + this.options.distance, this.options.position.y + this.options.distance)
              };
          }
      }, {
          key: 'center',
          value: function center() {
              return new Vec2(this.options.distance, this.options.distance);
          }
      }, {
          key: 'forEachSample',
          value: function forEachSample(f) {
              f(this.options.position);
          }
      }, {
          key: '_getVisibleMaskCache',
          value: function _getVisibleMaskCache() {
              var d = Math.floor(this.options.distance * 1.4);
              var hash = '' + d;
              if (this.vismaskhash != hash) {
                  this.vismaskhash = hash;
                  var c = this._vismaskcache = createCanvasAnd2dContext('vm' + this.id, 2 * d, 2 * d);
                  var g = c.ctx.createRadialGradient(d, d, 0, d, d, d);
                  g.addColorStop(0, 'rgba(0,0,0,1)');
                  g.addColorStop(1, 'rgba(0,0,0,0)');
                  c.ctx.fillStyle = g;
                  c.ctx.fillRect(0, 0, c.w, c.h);
              }
              return this._vismaskcache;
          }
      }, {
          key: '_getHashCache',
          value: function _getHashCache() {
              return [this.options.distance, this.options.diffuse].toString();
          }
      }]);
      return Light;
  }();

  var Lighting = function () {
      function Lighting(options) {
          classCallCheck(this, Lighting);

          var defaults$$1 = {
              light: new Light(),
              objects: []
          };
          this.options = Object.assign(defaults$$1, this.options);
          this.options = Object.assign(this.options, options);
      }

      createClass(Lighting, [{
          key: 'createCache',
          value: function createCache(w, h) {
              this._cache = createCanvasAnd2dContext('lc', w, h);
              this._castcache = createCanvasAnd2dContext('lcc', w, h);
          }
      }, {
          key: 'cast',
          value: function cast(ctxoutput) {
              var light = this.options.light;
              var n = light.samples;
              var c = this._castcache;
              var ctx = c.ctx;
              ctx.clearRect(0, 0, c.w, c.h);
              // Draw shadows for each light sample and objects
              ctx.fillStyle = 'rgba(0,0,0,' + Math.round(100 / n) / 100 + ')'; // Is there any better way?
              var bounds = light.bounds();
              var objects = this.options.objects;
              light.forEachSample(function (position) {
                  for (var o = 0, l = objects.length; o < l; ++o) {
                      if (objects[o].contains(position)) {
                          ctx.fillRect(bounds.topleft.x, bounds.topleft.y, bounds.bottomright.x - bounds.topleft.x, bounds.bottomright.y - bounds.topleft.y);
                          return;
                      }
                  }
                  objects.forEach(function (object) {
                      object.cast(ctx, position, bounds);
                  });
              });
              // Draw objects diffuse - the intensity of the light penetration in objects
              objects.forEach(function (object) {
                  var diffuse = object.diffuse === undefined ? 0.8 : object.diffuse;
                  diffuse *= light.diffuse;
                  ctx.fillStyle = 'rgba(0,0,0,' + (1 - diffuse) + ')';
                  ctx.beginPath();
                  object.path(ctx);
                  ctx.fill();
              });
              ctxoutput.drawImage(c.canvas, 0, 0);
          }
      }, {
          key: 'compute',
          value: function compute(w, h) {
              if (!this._cache || this._cache.w != w || this._cache.h != h) this.createCache(w, h);
              var ctx = this._cache.ctx;
              var light = this.options.light;
              ctx.save();
              ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

              light.render(ctx);
              ctx.globalCompositeOperation = 'destination-out';
              this.cast(ctx);
              ctx.restore();
          }
      }, {
          key: 'render',
          value: function render(ctx) {
              ctx.drawImage(this._cache.canvas, 0, 0);
          }
      }, {
          key: 'getCanvas',
          value: function getCanvas() {
              return this._cache.canvas;
          }
      }]);
      return Lighting;
  }();

  var Lamp = function (_Light) {
      inherits(Lamp, _Light);

      function Lamp(options) {
          classCallCheck(this, Lamp);

          var _this = possibleConstructorReturn(this, (Lamp.__proto__ || Object.getPrototypeOf(Lamp)).call(this));

          var defaults$$1 = {
              id: 0,
              color: 'rgba(250,220,150,0.8)',
              radius: 0,
              samples: 1,
              angle: 0,
              roughness: 0
          };
          _this.options = Object.assign(defaults$$1, _this.options);
          _this.options = Object.assign(_this.options, options);
          return _this;
      }

      createClass(Lamp, [{
          key: '_getHashCache',
          value: function _getHashCache() {
              return [this.options.color, this.options.distance, this.options.diffuse, this.options.angle, this.options.roughness, this.options.samples, this.options.radius].toString();
          }
      }, {
          key: 'center',
          value: function center() {
              return new Vec2((1 - Math.cos(this.options.angle) * this.options.roughness) * this.options.distance, (1 + Math.sin(this.options.angle) * this.options.roughness) * this.options.distance);
          }
      }, {
          key: 'bounds',
          value: function bounds() {
              var orientationCenter = new Vec2(Math.cos(this.options.angle), -Math.sin(this.options.angle)).mul(this.options.roughness * this.options.distance);
              return {
                  topleft: new Vec2(this.options.position.x + orientationCenter.x - this.options.distance, this.options.position.y + orientationCenter.y - this.options.distance),
                  bottomright: new Vec2(this.options.position.x + orientationCenter.x + this.options.distance, this.options.position.y + orientationCenter.y + this.options.distance)
              };
          }
      }, {
          key: 'mask',
          value: function mask(ctx) {
              var c = this._getVisibleMaskCache();
              var orientationCenter = new Vec2(Math.cos(this.options.angle), -Math.sin(this.options.angle)).mul(this.options.roughness * this.options.distance);
              ctx.drawImage(c.canvas, Math.round(this.options.position.x + orientationCenter.x - c.w / 2), Math.round(this.options.position.y + orientationCenter.y - c.h / 2));
          }
      }, {
          key: '_getGradientCache',
          value: function _getGradientCache(center) {
              var hashcode = this._getHashCache();
              if (this._cacheHashcode == hashcode) {
                  return this._gcache;
              }
              this._cacheHashcode = hashcode;
              var d = Math.round(this.options.distance);
              var D = d * 2;
              var cache = createCanvasAnd2dContext('gc' + this.id, D, D);
              var g = cache.ctx.createRadialGradient(center.x, center.y, 0, d, d, d);
              g.addColorStop(Math.min(1, this.options.radius / this.options.distance), this.options.color);
              g.addColorStop(1, getRGBA(this.options.color, 0));
              cache.ctx.fillStyle = g;
              cache.ctx.fillRect(0, 0, cache.w, cache.h);
              return this._gcache = cache;
          }
      }, {
          key: 'render',
          value: function render(ctx) {
              var center = this.center();
              var c = this._getGradientCache(center);
              ctx.drawImage(c.canvas, Math.round(this.options.position.x - center.x), Math.round(this.options.position.y - center.y));
          }
      }]);
      return Lamp;
  }(Light);

  var OpaqueObject = function () {
      function OpaqueObject(options) {
          classCallCheck(this, OpaqueObject);

          var defaults$$1 = {
              diffuse: 0.8
          };
          this.options = Object.assign(defaults$$1, options);
          this.uniqueId = 0;
      }

      createClass(OpaqueObject, [{
          key: 'cast',
          value: function cast() {}
      }, {
          key: 'path',
          value: function path() {}
      }, {
          key: 'bounds',
          value: function bounds() {
              return {
                  topleft: new Vec2(),
                  bottomright: new Vec2()
              };
          }
      }, {
          key: 'contains',
          value: function contains() {
              return false;
          }
      }]);
      return OpaqueObject;
  }();

  var DiscObject = function (_OpaqueObject) {
      inherits(DiscObject, _OpaqueObject);

      function DiscObject(options) {
          classCallCheck(this, DiscObject);

          var _this = possibleConstructorReturn(this, (DiscObject.__proto__ || Object.getPrototypeOf(DiscObject)).call(this));

          var defaults$$1 = {
              center: new Vec2(),
              radius: 20
          };
          _this.options = Object.assign(defaults$$1, _this.options);
          _this.options = Object.assign(_this.options, options);
          return _this;
      }

      createClass(DiscObject, [{
          key: 'cast',
          value: function cast(ctx, origin, bounds) {
              var m = this.options.center;
              var originToM = m.sub(origin);
              var tangentLines = getTan2(this.options.radius, originToM);
              var originToA = tangentLines[0];
              var originToB = tangentLines[1];
              var a = originToA.add(origin);
              var b = originToB.add(origin);
              // normalize to distance
              var distance = (bounds.bottomright.x - bounds.topleft.x + (bounds.bottomright.y - bounds.topleft.y)) / 2;
              originToM = originToM.normalize().mul(distance);
              originToA = originToA.normalize().mul(distance);
              originToB = originToB.normalize().mul(distance);
              // project points
              var oam = a.add(originToM);
              var obm = b.add(originToM);
              var ap = a.add(originToA);
              var bp = b.add(originToB);
              var start = Math.atan2(originToM.x, -originToM.y);
              ctx.beginPath();
              path(ctx, [b, bp, obm, oam, ap, a], true);
              ctx.arc(m.x, m.y, this.options.radius, start, start + Math.PI);
              ctx.fill();
          }
      }, {
          key: 'path',
          value: function path$$1(ctx) {
              ctx.arc(this.options.center.x, this.options.center.y, this.options.radius, 0, _2PI);
          }
      }, {
          key: 'bounds',
          value: function bounds() {
              return {
                  topleft: new Vec2(this.options.center.x - this.options.radius, this.options.center.y - this.options.radius),
                  bottomright: new Vec2(this.options.center.x + this.options.radius, this.options.center.y + this.options.radius)
              };
          }
      }, {
          key: 'contains',
          value: function contains(point) {
              return point.dist2(this.options.center) < this.options.radius * this.options.radius;
          }
      }]);
      return DiscObject;
  }(OpaqueObject);

  var PolygonObject = function (_OpaqueObject) {
      inherits(PolygonObject, _OpaqueObject);

      function PolygonObject(options) {
          classCallCheck(this, PolygonObject);

          var _this = possibleConstructorReturn(this, (PolygonObject.__proto__ || Object.getPrototypeOf(PolygonObject)).call(this));

          var defaults$$1 = {
              points: []
          };
          _this.options = Object.assign(defaults$$1, _this.options);
          _this.options = Object.assign(_this.options, options);
          return _this;
      }

      createClass(PolygonObject, [{
          key: 'bounds',
          value: function bounds() {
              var topleft = this.options.points[0].copy();
              var bottomright = topleft.copy();
              for (var p = 1, l = this.options.points.length; p < l; ++p) {
                  var point = this.options.points[p];
                  if (point.x > bottomright.x) bottomright.x = point.x;
                  if (point.y > bottomright.y) bottomright.y = point.y;
                  if (point.x < topleft.x) topleft.x = point.x;
                  if (point.y < topleft.y) topleft.y = point.y;
              }
              return {
                  topleft: topleft,
                  bottomright: bottomright
              };
          }
      }, {
          key: 'contains',
          value: function contains(p) {
              var points = this.options.points;
              var i,
                  l = points.length,
                  j = l - 1;
              var x = p.x,
                  y = p.y;
              var oddNodes = false;

              for (i = 0; i < l; i++) {
                  if ((points[i].y < y && points[j].y >= y || points[j].y < y && points[i].y >= y) && (points[i].x <= x || points[j].x <= x)) {
                      if (points[i].x + (y - points[i].y) / (points[j].y - points[i].y) * (points[j].x - points[i].x) < x) {
                          oddNodes = !oddNodes;
                      }
                  }
                  j = i;
              }
              return oddNodes;
          }
      }, {
          key: 'path',
          value: function path$$1(ctx) {
              path(ctx, this.options.points);
          }
      }, {
          key: 'cast',
          value: function cast(ctx, origin, bounds) {
              // The current implementation of projection is a bit hacky... do you have a proper solution?
              var distance = (bounds.bottomright.x - bounds.topleft.x + (bounds.bottomright.y - bounds.topleft.y)) / 2;
              this._forEachVisibleEdges(origin, bounds, function (a, b, originToA, originToB, aToB) {
                  var m; // m is the projected point of origin to [a, b]
                  var t = originToA.inv().dot(aToB) / aToB.length2();
                  if (t < 0) m = a;else if (t > 1) m = b;else m = a.add(aToB.mul(t));
                  var originToM = m.sub(origin);
                  // normalize to distance
                  originToM = originToM.normalize().mul(distance);
                  originToA = originToA.normalize().mul(distance);
                  originToB = originToB.normalize().mul(distance);
                  // project points
                  var oam = a.add(originToM);
                  var obm = b.add(originToM);
                  var ap = a.add(originToA);
                  var bp = b.add(originToB);
                  ctx.beginPath();
                  path(ctx, [a, b, bp, obm, oam, ap]);
                  ctx.fill();
              });
          }
      }, {
          key: '_forEachVisibleEdges',
          value: function _forEachVisibleEdges(origin, bounds, f) {
              var a = this.options.points[this.options.points.length - 1],
                  b;
              for (var p = 0, l = this.options.points.length; p < l; ++p, a = b) {
                  b = this.options.points[p];
                  if (a.inBound(bounds.topleft, bounds.bottomright)) {
                      var originToA = a.sub(origin);
                      var originToB = b.sub(origin);
                      var aToB = b.sub(a);
                      var normal = new Vec2(aToB.y, -aToB.x);
                      if (normal.dot(originToA) < 0) {
                          f(a, b, originToA, originToB, aToB);
                      }
                  }
              }
          }
      }]);
      return PolygonObject;
  }(OpaqueObject);

  var RectangleObject = function (_PolygonObject) {
      inherits(RectangleObject, _PolygonObject);

      function RectangleObject(options) {
          classCallCheck(this, RectangleObject);

          var _this = possibleConstructorReturn(this, (RectangleObject.__proto__ || Object.getPrototypeOf(RectangleObject)).call(this, options));

          var defaults$$1 = {
              topleft: new Vec2(),
              bottomright: new Vec2()
          };
          _this.options = Object.assign(defaults$$1, _this.options);
          _this.options = Object.assign(_this.options, options);
          _this.syncFromTopleftBottomright();
          return _this;
      }

      createClass(RectangleObject, [{
          key: 'syncFromTopleftBottomright',
          value: function syncFromTopleftBottomright() {
              var a = this.options.topleft;
              var b = new Vec2(this.options.bottomright.x, this.options.topleft.y);
              var c = this.options.bottomright;
              var d = new Vec2(this.options.topleft.x, this.options.bottomright.y);
              this.options.points = [a, b, c, d];
          }
      }, {
          key: 'fill',
          value: function fill(ctx) {
              var x = this.options.points[0].x,
                  y = this.options.points[0].y;
              ctx.rect(x, y, this.options.points[2].x - x, this.options.points[2].y - y);
          }
      }]);
      return RectangleObject;
  }(PolygonObject);

  var LineObject = function (_PolygonObject) {
      inherits(LineObject, _PolygonObject);

      function LineObject(options) {
          classCallCheck(this, LineObject);

          var _this = possibleConstructorReturn(this, (LineObject.__proto__ || Object.getPrototypeOf(LineObject)).call(this, options));

          var defaults$$1 = {
              a: new Vec2(),
              b: new Vec2()
          };
          _this.options = Object.assign(defaults$$1, _this.options);
          _this.options = Object.assign(_this.options, options);

          _this.syncFromAB();
          return _this;
      }

      createClass(LineObject, [{
          key: 'syncFromAb',
          value: function syncFromAb() {
              this.options.points = [this.options.a, this.options.b];
          }
      }]);
      return LineObject;
  }(PolygonObject);

  exports.Vec2 = Vec2;
  exports.Lighting = Lighting;
  exports.Lamp = Lamp;
  exports.DiscObject = DiscObject;
  exports.RectangleObject = RectangleObject;
  exports.LineObject = LineObject;
  exports.PolygonObject = PolygonObject;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWxsdW1pbmF0ZWQuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9WZWMyLmpzIiwiLi4vc3JjL2hlbHBlcnMuanMiLCIuLi9zcmMvTGlnaHQuanMiLCIuLi9zcmMvTGlnaHRpbmcuanMiLCIuLi9zcmMvTGFtcC5qcyIsIi4uL3NyYy9PcGFxdWVPYmplY3QuanMiLCIuLi9zcmMvRGlzY09iamVjdC5qcyIsIi4uL3NyYy9Qb2x5Z29uT2JqZWN0LmpzIiwiLi4vc3JjL1JlY3RhbmdsZU9iamVjdC5qcyIsIi4uL3NyYy9MaW5lT2JqZWN0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFZlYzIge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSkge1xyXG4gICAgICAgIHRoaXMueCA9IHggfHwgMFxyXG4gICAgICAgIHRoaXMueSA9IHkgfHwgMFxyXG4gICAgfVxyXG5cclxuICAgIGNvcHkoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKHRoaXMueCwgdGhpcy55KVxyXG4gICAgfVxyXG5cclxuICAgIGRvdCh2KSB7XHJcbiAgICAgICAgcmV0dXJuIHYueCAqIHRoaXMueCArIHYueSAqIHRoaXMueVxyXG4gICAgfVxyXG5cclxuICAgIHN1Yih2KSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKHRoaXMueCAtIHYueCwgdGhpcy55IC0gdi55KVxyXG4gICAgfVxyXG5cclxuICAgIGFkZCh2KSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKHRoaXMueCArIHYueCwgdGhpcy55ICsgdi55KVxyXG4gICAgfVxyXG5cclxuICAgIG11bChuKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKHRoaXMueCAqIG4sIHRoaXMueSAqIG4pXHJcbiAgICB9XHJcblxyXG4gICAgaW52KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm11bCgtMSlcclxuICAgIH1cclxuXHJcbiAgICBkaXN0Mih2KSB7XHJcbiAgICAgICAgbGV0IGR4ID0gdGhpcy54IC0gdi54XHJcbiAgICAgICAgbGV0IGR5ID0gdGhpcy55IC0gdi55XHJcbiAgICAgICAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5XHJcbiAgICB9XHJcblxyXG4gICAgbm9ybWFsaXplKCkge1xyXG4gICAgICAgIGxldCBsZW5ndGggPSBNYXRoLnNxcnQodGhpcy5sZW5ndGgyKCkpXHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKHRoaXMueCAvIGxlbmd0aCwgdGhpcy55IC8gbGVuZ3RoKVxyXG4gICAgfVxyXG5cclxuICAgIGxlbmd0aDIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueVxyXG4gICAgfVxyXG5cclxuICAgIHRvU3RyaW5nKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnggKyAnLCcgKyB0aGlzLnlcclxuICAgIH1cclxuXHJcbiAgICBpbkJvdW5kKHRvcExlZnQsIGJvdHRvbVJpZ2h0KSB7XHJcbiAgICAgICAgcmV0dXJuICh0b3BMZWZ0LnggPCB0aGlzLnggJiYgdGhpcy54IDwgYm90dG9tUmlnaHQueCAmJlxyXG4gICAgICAgICAgICB0b3BMZWZ0LnkgPCB0aGlzLnkgJiYgdGhpcy55IDwgYm90dG9tUmlnaHQueSlcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVmVjMiIsImltcG9ydCBWZWMyIGZyb20gJy4vVmVjMi5qcydcclxuXHJcbmV4cG9ydCBjb25zdCBHT0xERU5fQU5HTEUgPSBNYXRoLlBJICogKDMgLSBNYXRoLnNxcnQoNSkpXHJcbmV4cG9ydCBjb25zdCBfMlBJID0gMiAqIE1hdGguUElcclxuXHJcbmZ1bmN0aW9uIHBhdGgoY3R4LCBwb2ludHMsIGRvbnRKb2luTGFzdCkge1xyXG4gICAgdmFyIHAgPSBwb2ludHNbMF1cclxuICAgIGN0eC5tb3ZlVG8ocC54LCBwLnkpXHJcbiAgICBmb3IgKHZhciBpID0gMSwgbCA9IHBvaW50cy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcclxuICAgICAgICBwID0gcG9pbnRzW2ldXHJcbiAgICAgICAgY3R4LmxpbmVUbyhwLngsIHAueSlcclxuICAgIH1cclxuICAgIGlmICghZG9udEpvaW5MYXN0ICYmIHBvaW50cy5sZW5ndGggPiAyKSB7XHJcbiAgICAgICAgcCA9IHBvaW50c1swXVxyXG4gICAgICAgIGN0eC5saW5lVG8ocC54LCBwLnkpXHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUNhbnZhc0FuZDJkQ29udGV4dChpZCwgdywgaCkge1xyXG4gICAgdmFyIGlpZCA9ICdpbGx1anNfJyArIGlkXHJcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWlkKVxyXG5cclxuICAgIGlmIChjYW52YXMgPT09IG51bGwpIHtcclxuICAgICAgICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxyXG4gICAgICAgIGNhbnZhcy5pZCA9IGlpZFxyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHdcclxuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaFxyXG4gICAgICAgIGNhbnZhcy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXHJcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodClcclxuXHJcbiAgICBjYW52YXMud2lkdGggPSB3XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gaFxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgY2FudmFzOiBjYW52YXMsXHJcbiAgICAgICAgY3R4OiBjdHgsXHJcbiAgICAgICAgdzogdyxcclxuICAgICAgICBoOiBoXHJcbiAgICB9XHJcbn1cclxuXHJcbnZhciBnZXRSR0JBID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8vdmFyIGN0eCA9IGNyZWF0ZUNhbnZhc0FuZDJkQ29udGV4dCgnZ3JnYmEnLCAxLCAxKVxyXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXHJcbiAgICBjYW52YXMud2lkdGggPSBjYW52YXMuaGVpZ2h0ID0gMVxyXG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChjb2xvciwgYWxwaGEpIHtcclxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIDEsIDEpXHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yXHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIDEsIDEpXHJcbiAgICAgICAgdmFyIGQgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIDEsIDEpLmRhdGFcclxuICAgICAgICByZXR1cm4gJ3JnYmEoJyArIFtkWzBdLCBkWzFdLCBkWzJdLCBhbHBoYV0gKyAnKSdcclxuICAgIH1cclxufSgpKVxyXG5cclxuZnVuY3Rpb24gZ2V0VGFuMihyYWRpdXMsIGNlbnRlcikge1xyXG4gICAgdmFyIGVwc2lsb24gPSBnZXRUYW4yLmVwc2lsb24gfHwgMWUtNiwgLy8gY29uc3RhbnRcclxuICAgICAgICB4MCwgeTAsIGxlbjIsIHNvbG4sXHJcbiAgICAgICAgc29sdXRpb25zID0gW10sXHJcbiAgICAgICAgYSA9IHJhZGl1c1xyXG4gICAgaWYgKHR5cGVvZiBhID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgY2VudGVyID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgIHZhciB0bXAgPSBhXHJcbiAgICAgICAgY2VudGVyID0gYVxyXG4gICAgICAgIGNlbnRlciA9IHRtcCAvLyBzd2FwXHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIGNlbnRlciA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAvLyBnZXRUYW4yKHJhZGl1czpudW1iZXIsIHgwOm51bWJlciwgeTA6bnVtYmVyKVxyXG4gICAgICAgIHgwID0gY2VudGVyXHJcbiAgICAgICAgeTAgPSBhcmd1bWVudHNbMl1cclxuICAgICAgICBsZW4yID0geDAgKiB4MCArIHkwICogeTBcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gZ2V0VGFuczIocmFkaXVzOm51bWJlciwgY2VudGVyOm9iamVjdD17eDp4MCx5OnkwfSlcclxuICAgICAgICB4MCA9IGNlbnRlci54XHJcbiAgICAgICAgeTAgPSBjZW50ZXIueVxyXG4gICAgICAgIGxlbjIgPSBjZW50ZXIubGVuZ3RoMigpXHJcbiAgICB9XHJcbiAgICAvLyB0ID0gKy8tIE1hdGguYWNvcyggKC1hKngwICsvLSB5MCAqIE1hdGguc3FydCh4MCp4MCArIHkwKnkwIC0gYSphKSkvKHgwKngwICsgeTAqeSkgKVxyXG4gICAgdmFyIGxlbjJhID0geTAgKiBNYXRoLnNxcnQobGVuMiAtIGEgKiBhKSxcclxuICAgICAgICB0dCA9IE1hdGguYWNvcygoLWEgKiB4MCArIGxlbjJhKSAvIGxlbjIpLFxyXG4gICAgICAgIG50ID0gTWF0aC5hY29zKCgtYSAqIHgwIC0gbGVuMmEpIC8gbGVuMiksXHJcbiAgICAgICAgdHRfY29zID0gYSAqIE1hdGguY29zKHR0KSxcclxuICAgICAgICB0dF9zaW4gPSBhICogTWF0aC5zaW4odHQpLFxyXG4gICAgICAgIG50X2NvcyA9IGEgKiBNYXRoLmNvcyhudCksXHJcbiAgICAgICAgbnRfc2luID0gYSAqIE1hdGguc2luKG50KVxyXG5cclxuICAgIC8vIE5vdGU6IGNvcygtdCkgPT0gY29zKHQpIGFuZCBzaW4oLXQpID09IC1zaW4odCkgZm9yIGFsbCB0LCBzbyBmaW5kXHJcbiAgICAvLyB4MCArIGEqY29zKHQpLCB5MCArLy0gYSpzaW4odClcclxuICAgIC8vIFNvbHV0aW9ucyBoYXZlIGVxdWFsIGxlbmd0aHNcclxuICAgIHNvbG4gPSBuZXcgVmVjMih4MCArIG50X2NvcywgeTAgKyBudF9zaW4pXHJcbiAgICBzb2x1dGlvbnMucHVzaChzb2xuKVxyXG4gICAgdmFyIGRpc3QwID0gc29sbi5sZW5ndGgyKClcclxuXHJcbiAgICBzb2xuID0gbmV3IFZlYzIoeDAgKyB0dF9jb3MsIHkwIC0gdHRfc2luKVxyXG4gICAgc29sdXRpb25zLnB1c2goc29sbilcclxuICAgIHZhciBkaXN0MSA9IHNvbG4ubGVuZ3RoMigpXHJcbiAgICBpZiAoTWF0aC5hYnMoZGlzdDAgLSBkaXN0MSkgPCBlcHNpbG9uKSByZXR1cm4gc29sdXRpb25zXHJcblxyXG4gICAgc29sbiA9IG5ldyBWZWMyKHgwICsgbnRfY29zLCB5MCAtIG50X3NpbilcclxuICAgIHNvbHV0aW9ucy5wdXNoKHNvbG4pXHJcbiAgICB2YXIgZGlzdDIgPSBzb2xuLmxlbmd0aDIoKVxyXG4gICAgLy8gQ2hhbmdlZCBvcmRlciBzbyBubyBzdHJhbmdlIFggb2YgbGlnaHQgaW5zaWRlIHRoZSBjaXJjbGUuIENvdWxkIGFsc28gc29ydCByZXN1bHRzLlxyXG4gICAgaWYgKE1hdGguYWJzKGRpc3QxIC0gZGlzdDIpIDwgZXBzaWxvbikgcmV0dXJuIFtzb2xuLCBzb2x1dGlvbnNbMV1dXHJcbiAgICBpZiAoTWF0aC5hYnMoZGlzdDAgLSBkaXN0MikgPCBlcHNpbG9uKSByZXR1cm4gW3NvbHV0aW9uc1swXSwgc29sbl1cclxuXHJcbiAgICBzb2xuID0gbmV3IFZlYzIoeDAgKyB0dF9jb3MsIHkwICsgdHRfc2luKVxyXG4gICAgc29sdXRpb25zLnB1c2goc29sbilcclxuICAgIHZhciBkaXN0MyA9IHNvbG4ubGVuZ3RoMigpXHJcbiAgICBpZiAoTWF0aC5hYnMoZGlzdDIgLSBkaXN0MykgPCBlcHNpbG9uKSByZXR1cm4gW3NvbHV0aW9uc1syXSwgc29sbl1cclxuICAgIGlmIChNYXRoLmFicyhkaXN0MSAtIGRpc3QzKSA8IGVwc2lsb24pIHJldHVybiBbc29sdXRpb25zWzFdLCBzb2xuXVxyXG4gICAgaWYgKE1hdGguYWJzKGRpc3QwIC0gZGlzdDMpIDwgZXBzaWxvbikgcmV0dXJuIFtzb2x1dGlvbnNbMF0sIHNvbG5dXHJcblxyXG4gICAgLy8gcmV0dXJuIGFsbCA0IHNvbHV0aW9ucyBpZiBubyBtYXRjaGluZyB2ZWN0b3IgbGVuZ3RocyBmb3VuZC5cclxuICAgIHJldHVybiBzb2x1dGlvbnNcclxufVxyXG5cclxuZXhwb3J0IHtcclxuICAgIGNyZWF0ZUNhbnZhc0FuZDJkQ29udGV4dCxcclxuICAgIGdldFJHQkEsXHJcbiAgICBnZXRUYW4yLFxyXG4gICAgcGF0aFxyXG59IiwiaW1wb3J0IFZlYzIgZnJvbSAnLi9WZWMyLmpzJ1xyXG5pbXBvcnQgeyBjcmVhdGVDYW52YXNBbmQyZENvbnRleHQgfSBmcm9tICcuL2hlbHBlcnMuanMnXHJcblxyXG5jbGFzcyBMaWdodCB7XHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICAgICAgY29uc3QgZGVmYXVsdHMgPSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgVmVjMigpLFxyXG4gICAgICAgICAgICBkaXN0YW5jZTogMTAwLFxyXG4gICAgICAgICAgICBkaWZmdXNlOiAwLjhcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgb3B0aW9ucylcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXIoKSB7fVxyXG5cclxuICAgIG1hc2soY3R4KSB7XHJcbiAgICAgICAgdmFyIGMgPSB0aGlzLl9nZXRWaXNpYmxlTWFza0NhY2hlKClcclxuICAgICAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICAgICAgICBjLmNhbnZhcyxcclxuICAgICAgICAgICAgTWF0aC5yb3VuZCh0aGlzLm9wdGlvbnMucG9zaXRpb24ueCAtIGMudyAvIDIpLFxyXG4gICAgICAgICAgICBNYXRoLnJvdW5kKHRoaXMub3B0aW9ucy5wb3NpdGlvbi55IC0gYy5oIC8gMilcclxuICAgICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgYm91bmRzKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHRvcGxlZnQ6IG5ldyBWZWMyKHRoaXMub3B0aW9ucy5wb3NpdGlvbi54IC0gdGhpcy5vcHRpb25zLmRpc3RhbmNlLCB0aGlzLm9wdGlvbnMucG9zaXRpb24ueSAtIHRoaXMub3B0aW9ucy5kaXN0YW5jZSksXHJcbiAgICAgICAgICAgIGJvdHRvbXJpZ2h0OiBuZXcgVmVjMih0aGlzLm9wdGlvbnMucG9zaXRpb24ueCArIHRoaXMub3B0aW9ucy5kaXN0YW5jZSwgdGhpcy5vcHRpb25zLnBvc2l0aW9uLnkgKyB0aGlzLm9wdGlvbnMuZGlzdGFuY2UpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNlbnRlcigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzIodGhpcy5vcHRpb25zLmRpc3RhbmNlLCB0aGlzLm9wdGlvbnMuZGlzdGFuY2UpXHJcbiAgICB9XHJcblxyXG4gICAgZm9yRWFjaFNhbXBsZShmKSB7XHJcbiAgICAgICAgZih0aGlzLm9wdGlvbnMucG9zaXRpb24pXHJcbiAgICB9XHJcblxyXG4gICAgX2dldFZpc2libGVNYXNrQ2FjaGUoKSB7XHJcbiAgICAgICAgdmFyIGQgPSBNYXRoLmZsb29yKHRoaXMub3B0aW9ucy5kaXN0YW5jZSAqIDEuNClcclxuICAgICAgICB2YXIgaGFzaCA9ICcnICsgZFxyXG4gICAgICAgIGlmICh0aGlzLnZpc21hc2toYXNoICE9IGhhc2gpIHtcclxuICAgICAgICAgICAgdGhpcy52aXNtYXNraGFzaCA9IGhhc2hcclxuICAgICAgICAgICAgdmFyIGMgPSB0aGlzLl92aXNtYXNrY2FjaGUgPSBjcmVhdGVDYW52YXNBbmQyZENvbnRleHQoJ3ZtJyArIHRoaXMuaWQsIDIgKiBkLCAyICogZClcclxuICAgICAgICAgICAgdmFyIGcgPSBjLmN0eC5jcmVhdGVSYWRpYWxHcmFkaWVudChkLCBkLCAwLCBkLCBkLCBkKVxyXG4gICAgICAgICAgICBnLmFkZENvbG9yU3RvcCgwLCAncmdiYSgwLDAsMCwxKScpXHJcbiAgICAgICAgICAgIGcuYWRkQ29sb3JTdG9wKDEsICdyZ2JhKDAsMCwwLDApJylcclxuICAgICAgICAgICAgYy5jdHguZmlsbFN0eWxlID0gZ1xyXG4gICAgICAgICAgICBjLmN0eC5maWxsUmVjdCgwLCAwLCBjLncsIGMuaClcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Zpc21hc2tjYWNoZVxyXG4gICAgfVxyXG5cclxuICAgIF9nZXRIYXNoQ2FjaGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIFt0aGlzLm9wdGlvbnMuZGlzdGFuY2UsIHRoaXMub3B0aW9ucy5kaWZmdXNlXS50b1N0cmluZygpXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IExpZ2h0IiwiaW1wb3J0IHsgY3JlYXRlQ2FudmFzQW5kMmRDb250ZXh0IH0gZnJvbSAnLi9oZWxwZXJzLmpzJ1xyXG5pbXBvcnQgTGlnaHQgZnJvbSAnLi9MaWdodC5qcydcclxuXHJcbmNsYXNzIExpZ2h0aW5nIHtcclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgICAgICBjb25zdCBkZWZhdWx0cyA9IHtcclxuICAgICAgICAgICAgbGlnaHQ6IG5ldyBMaWdodCgpLFxyXG4gICAgICAgICAgICBvYmplY3RzOiBbXVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKGRlZmF1bHRzLCB0aGlzLm9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih0aGlzLm9wdGlvbnMsIG9wdGlvbnMpXHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlQ2FjaGUodywgaCkge1xyXG4gICAgICAgIHRoaXMuX2NhY2hlID0gY3JlYXRlQ2FudmFzQW5kMmRDb250ZXh0KCdsYycsIHcsIGgpXHJcbiAgICAgICAgdGhpcy5fY2FzdGNhY2hlID0gY3JlYXRlQ2FudmFzQW5kMmRDb250ZXh0KCdsY2MnLCB3LCBoKVxyXG4gICAgfVxyXG5cclxuICAgIGNhc3QoY3R4b3V0cHV0KSB7XHJcbiAgICAgICAgdmFyIGxpZ2h0ID0gdGhpcy5vcHRpb25zLmxpZ2h0XHJcbiAgICAgICAgdmFyIG4gPSBsaWdodC5zYW1wbGVzXHJcbiAgICAgICAgdmFyIGMgPSB0aGlzLl9jYXN0Y2FjaGVcclxuICAgICAgICB2YXIgY3R4ID0gYy5jdHhcclxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGMudywgYy5oKVxyXG4gICAgICAgIC8vIERyYXcgc2hhZG93cyBmb3IgZWFjaCBsaWdodCBzYW1wbGUgYW5kIG9iamVjdHNcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMCwwLDAsJyArIE1hdGgucm91bmQoMTAwIC8gbikgLyAxMDAgKyAnKScgLy8gSXMgdGhlcmUgYW55IGJldHRlciB3YXk/XHJcbiAgICAgICAgdmFyIGJvdW5kcyA9IGxpZ2h0LmJvdW5kcygpXHJcbiAgICAgICAgdmFyIG9iamVjdHMgPSB0aGlzLm9wdGlvbnMub2JqZWN0c1xyXG4gICAgICAgIGxpZ2h0LmZvckVhY2hTYW1wbGUoZnVuY3Rpb24gKHBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIG8gPSAwLCBsID0gb2JqZWN0cy5sZW5ndGg7IG8gPCBsOyArK28pIHtcclxuICAgICAgICAgICAgICAgIGlmIChvYmplY3RzW29dLmNvbnRhaW5zKHBvc2l0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdChib3VuZHMudG9wbGVmdC54LCBib3VuZHMudG9wbGVmdC55LCBib3VuZHMuYm90dG9tcmlnaHQueCAtIGJvdW5kcy50b3BsZWZ0LngsIGJvdW5kcy5ib3R0b21yaWdodC55IC0gYm91bmRzLnRvcGxlZnQueSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvYmplY3RzLmZvckVhY2goZnVuY3Rpb24gKG9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgb2JqZWN0LmNhc3QoY3R4LCBwb3NpdGlvbiwgYm91bmRzKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLy8gRHJhdyBvYmplY3RzIGRpZmZ1c2UgLSB0aGUgaW50ZW5zaXR5IG9mIHRoZSBsaWdodCBwZW5ldHJhdGlvbiBpbiBvYmplY3RzXHJcbiAgICAgICAgb2JqZWN0cy5mb3JFYWNoKGZ1bmN0aW9uIChvYmplY3QpIHtcclxuICAgICAgICAgICAgdmFyIGRpZmZ1c2UgPSBvYmplY3QuZGlmZnVzZSA9PT0gdW5kZWZpbmVkID8gMC44IDogb2JqZWN0LmRpZmZ1c2VcclxuICAgICAgICAgICAgZGlmZnVzZSAqPSBsaWdodC5kaWZmdXNlXHJcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSAncmdiYSgwLDAsMCwnICsgKDEgLSBkaWZmdXNlKSArICcpJ1xyXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKClcclxuICAgICAgICAgICAgb2JqZWN0LnBhdGgoY3R4KVxyXG4gICAgICAgICAgICBjdHguZmlsbCgpXHJcbiAgICAgICAgfSlcclxuICAgICAgICBjdHhvdXRwdXQuZHJhd0ltYWdlKGMuY2FudmFzLCAwLCAwKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbXB1dGUodywgaCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fY2FjaGUgfHwgdGhpcy5fY2FjaGUudyAhPSB3IHx8IHRoaXMuX2NhY2hlLmggIT0gaClcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVDYWNoZSh3LCBoKVxyXG4gICAgICAgIHZhciBjdHggPSB0aGlzLl9jYWNoZS5jdHhcclxuICAgICAgICB2YXIgbGlnaHQgPSB0aGlzLm9wdGlvbnMubGlnaHRcclxuICAgICAgICBjdHguc2F2ZSgpXHJcbiAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjdHguY2FudmFzLndpZHRoLCBjdHguY2FudmFzLmhlaWdodClcclxuXHJcbiAgICAgICAgbGlnaHQucmVuZGVyKGN0eClcclxuICAgICAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2Rlc3RpbmF0aW9uLW91dCdcclxuICAgICAgICB0aGlzLmNhc3QoY3R4KVxyXG4gICAgICAgIGN0eC5yZXN0b3JlKClcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXIoY3R4KSB7XHJcbiAgICAgICAgY3R4LmRyYXdJbWFnZSh0aGlzLl9jYWNoZS5jYW52YXMsIDAsIDApXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q2FudmFzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jYWNoZS5jYW52YXNcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTGlnaHRpbmciLCJpbXBvcnQgVmVjMiBmcm9tICcuL1ZlYzInXHJcbmltcG9ydCBMaWdodCBmcm9tICcuL0xpZ2h0LmpzJ1xyXG5pbXBvcnQgeyBjcmVhdGVDYW52YXNBbmQyZENvbnRleHQsIGdldFJHQkEgfSBmcm9tICcuL2hlbHBlcnMuanMnXHJcblxyXG5jbGFzcyBMYW1wIGV4dGVuZHMgTGlnaHQge1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgICAgIHN1cGVyKClcclxuICAgICAgICBjb25zdCBkZWZhdWx0cyA9IHtcclxuICAgICAgICAgICAgaWQ6IDAsXHJcbiAgICAgICAgICAgIGNvbG9yOiAncmdiYSgyNTAsMjIwLDE1MCwwLjgpJyxcclxuICAgICAgICAgICAgcmFkaXVzOiAwLFxyXG4gICAgICAgICAgICBzYW1wbGVzOiAxLFxyXG4gICAgICAgICAgICBhbmdsZTogMCxcclxuICAgICAgICAgICAgcm91Z2huZXNzOiAwXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIHRoaXMub3B0aW9ucylcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucywgb3B0aW9ucylcclxuICAgIH1cclxuXHJcbiAgICBfZ2V0SGFzaENhY2hlKCkge1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5jb2xvcixcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmRpc3RhbmNlLFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuZGlmZnVzZSxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmFuZ2xlLFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucm91Z2huZXNzLFxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuc2FtcGxlcyxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnJhZGl1c1xyXG4gICAgICAgIF0udG9TdHJpbmcoKVxyXG4gICAgfVxyXG5cclxuICAgIGNlbnRlcigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzIoXHJcbiAgICAgICAgICAgICgxIC0gTWF0aC5jb3ModGhpcy5vcHRpb25zLmFuZ2xlKSAqIHRoaXMub3B0aW9ucy5yb3VnaG5lc3MpICogdGhpcy5vcHRpb25zLmRpc3RhbmNlLFxyXG4gICAgICAgICAgICAoMSArIE1hdGguc2luKHRoaXMub3B0aW9ucy5hbmdsZSkgKiB0aGlzLm9wdGlvbnMucm91Z2huZXNzKSAqIHRoaXMub3B0aW9ucy5kaXN0YW5jZVxyXG4gICAgICAgIClcclxuICAgIH1cclxuXHJcbiAgICBib3VuZHMoKSB7XHJcbiAgICAgICAgdmFyIG9yaWVudGF0aW9uQ2VudGVyID0gbmV3IFZlYzIoXHJcbiAgICAgICAgICAgIE1hdGguY29zKHRoaXMub3B0aW9ucy5hbmdsZSksIC1NYXRoLnNpbih0aGlzLm9wdGlvbnMuYW5nbGUpXHJcbiAgICAgICAgKS5tdWwodGhpcy5vcHRpb25zLnJvdWdobmVzcyAqIHRoaXMub3B0aW9ucy5kaXN0YW5jZSlcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0b3BsZWZ0OiBuZXcgVmVjMihcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wb3NpdGlvbi54ICsgb3JpZW50YXRpb25DZW50ZXIueCAtIHRoaXMub3B0aW9ucy5kaXN0YW5jZSxcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wb3NpdGlvbi55ICsgb3JpZW50YXRpb25DZW50ZXIueSAtIHRoaXMub3B0aW9ucy5kaXN0YW5jZVxyXG4gICAgICAgICAgICApLFxyXG4gICAgICAgICAgICBib3R0b21yaWdodDogbmV3IFZlYzIoXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMucG9zaXRpb24ueCArIG9yaWVudGF0aW9uQ2VudGVyLnggKyB0aGlzLm9wdGlvbnMuZGlzdGFuY2UsXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMucG9zaXRpb24ueSArIG9yaWVudGF0aW9uQ2VudGVyLnkgKyB0aGlzLm9wdGlvbnMuZGlzdGFuY2VcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtYXNrKGN0eCkge1xyXG4gICAgICAgIHZhciBjID0gdGhpcy5fZ2V0VmlzaWJsZU1hc2tDYWNoZSgpXHJcbiAgICAgICAgdmFyIG9yaWVudGF0aW9uQ2VudGVyID0gbmV3IFZlYzIoXHJcbiAgICAgICAgICAgIE1hdGguY29zKHRoaXMub3B0aW9ucy5hbmdsZSksIC1NYXRoLnNpbih0aGlzLm9wdGlvbnMuYW5nbGUpXHJcbiAgICAgICAgKS5tdWwodGhpcy5vcHRpb25zLnJvdWdobmVzcyAqIHRoaXMub3B0aW9ucy5kaXN0YW5jZSlcclxuICAgICAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICAgICAgICBjLmNhbnZhcywgTWF0aC5yb3VuZCh0aGlzLm9wdGlvbnMucG9zaXRpb24ueCArIG9yaWVudGF0aW9uQ2VudGVyLnggLSBjLncgLyAyKSxcclxuICAgICAgICAgICAgTWF0aC5yb3VuZCh0aGlzLm9wdGlvbnMucG9zaXRpb24ueSArIG9yaWVudGF0aW9uQ2VudGVyLnkgLSBjLmggLyAyKVxyXG4gICAgICAgIClcclxuICAgIH1cclxuXHJcbiAgICBfZ2V0R3JhZGllbnRDYWNoZShjZW50ZXIpIHtcclxuICAgICAgICB2YXIgaGFzaGNvZGUgPSB0aGlzLl9nZXRIYXNoQ2FjaGUoKVxyXG4gICAgICAgIGlmICh0aGlzLl9jYWNoZUhhc2hjb2RlID09IGhhc2hjb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nY2FjaGVcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY2FjaGVIYXNoY29kZSA9IGhhc2hjb2RlXHJcbiAgICAgICAgdmFyIGQgPSBNYXRoLnJvdW5kKHRoaXMub3B0aW9ucy5kaXN0YW5jZSlcclxuICAgICAgICB2YXIgRCA9IGQgKiAyXHJcbiAgICAgICAgdmFyIGNhY2hlID0gY3JlYXRlQ2FudmFzQW5kMmRDb250ZXh0KCdnYycgKyB0aGlzLmlkLCBELCBEKVxyXG4gICAgICAgIHZhciBnID0gY2FjaGUuY3R4LmNyZWF0ZVJhZGlhbEdyYWRpZW50KGNlbnRlci54LCBjZW50ZXIueSwgMCwgZCwgZCwgZClcclxuICAgICAgICBnLmFkZENvbG9yU3RvcChNYXRoLm1pbigxLCB0aGlzLm9wdGlvbnMucmFkaXVzIC8gdGhpcy5vcHRpb25zLmRpc3RhbmNlKSwgdGhpcy5vcHRpb25zLmNvbG9yKVxyXG4gICAgICAgIGcuYWRkQ29sb3JTdG9wKDEsIGdldFJHQkEodGhpcy5vcHRpb25zLmNvbG9yLCAwKSlcclxuICAgICAgICBjYWNoZS5jdHguZmlsbFN0eWxlID0gZ1xyXG4gICAgICAgIGNhY2hlLmN0eC5maWxsUmVjdCgwLCAwLCBjYWNoZS53LCBjYWNoZS5oKVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9nY2FjaGUgPSBjYWNoZVxyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlcihjdHgpIHtcclxuICAgICAgICB2YXIgY2VudGVyID0gdGhpcy5jZW50ZXIoKVxyXG4gICAgICAgIHZhciBjID0gdGhpcy5fZ2V0R3JhZGllbnRDYWNoZShjZW50ZXIpXHJcbiAgICAgICAgY3R4LmRyYXdJbWFnZShcclxuICAgICAgICAgICAgYy5jYW52YXMsXHJcbiAgICAgICAgICAgIE1hdGgucm91bmQodGhpcy5vcHRpb25zLnBvc2l0aW9uLnggLSBjZW50ZXIueCksXHJcbiAgICAgICAgICAgIE1hdGgucm91bmQodGhpcy5vcHRpb25zLnBvc2l0aW9uLnkgLSBjZW50ZXIueSlcclxuICAgICAgICApXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IExhbXAiLCJpbXBvcnQgVmVjMiBmcm9tICcuL1ZlYzIuanMnXHJcblxyXG5jbGFzcyBPcGFxdWVPYmplY3Qge1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgICAgIGNvbnN0IGRlZmF1bHRzID0ge1xyXG4gICAgICAgICAgICBkaWZmdXNlOiAwLjhcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnVuaXF1ZUlkID0gMFxyXG4gICAgfVxyXG5cclxuICAgIGNhc3QoKSB7fVxyXG5cclxuICAgIHBhdGgoKSB7fVxyXG5cclxuICAgIGJvdW5kcygpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0b3BsZWZ0OiBuZXcgVmVjMigpLFxyXG4gICAgICAgICAgICBib3R0b21yaWdodDogbmV3IFZlYzIoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb250YWlucygpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgT3BhcXVlT2JqZWN0IiwiaW1wb3J0IFZlYzIgZnJvbSAnLi9WZWMyLmpzJ1xyXG5pbXBvcnQgeyBnZXRUYW4yLCBwYXRoLCBfMlBJIH0gZnJvbSAnLi9oZWxwZXJzLmpzJ1xyXG5pbXBvcnQgT3BhcXVlT2JqZWN0IGZyb20gJy4vT3BhcXVlT2JqZWN0LmpzJ1xyXG5cclxuY2xhc3MgRGlzY09iamVjdCBleHRlbmRzIE9wYXF1ZU9iamVjdCB7XHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICAgICAgc3VwZXIoKVxyXG4gICAgICAgIGNvbnN0IGRlZmF1bHRzID0ge1xyXG4gICAgICAgICAgICBjZW50ZXI6IG5ldyBWZWMyKCksXHJcbiAgICAgICAgICAgIHJhZGl1czogMjBcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgdGhpcy5vcHRpb25zKVxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24odGhpcy5vcHRpb25zLCBvcHRpb25zKVxyXG4gICAgfVxyXG4gICAgY2FzdChjdHgsIG9yaWdpbiwgYm91bmRzKSB7XHJcbiAgICAgICAgdmFyIG0gPSB0aGlzLm9wdGlvbnMuY2VudGVyXHJcbiAgICAgICAgdmFyIG9yaWdpblRvTSA9IG0uc3ViKG9yaWdpbilcclxuICAgICAgICB2YXIgdGFuZ2VudExpbmVzID0gZ2V0VGFuMih0aGlzLm9wdGlvbnMucmFkaXVzLCBvcmlnaW5Ub00pXHJcbiAgICAgICAgdmFyIG9yaWdpblRvQSA9IHRhbmdlbnRMaW5lc1swXVxyXG4gICAgICAgIHZhciBvcmlnaW5Ub0IgPSB0YW5nZW50TGluZXNbMV1cclxuICAgICAgICB2YXIgYSA9IG9yaWdpblRvQS5hZGQob3JpZ2luKVxyXG4gICAgICAgIHZhciBiID0gb3JpZ2luVG9CLmFkZChvcmlnaW4pXHJcbiAgICAgICAgLy8gbm9ybWFsaXplIHRvIGRpc3RhbmNlXHJcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gKChib3VuZHMuYm90dG9tcmlnaHQueCAtIGJvdW5kcy50b3BsZWZ0LngpICsgKGJvdW5kcy5ib3R0b21yaWdodC55IC0gYm91bmRzLnRvcGxlZnQueSkpIC8gMlxyXG4gICAgICAgIG9yaWdpblRvTSA9IG9yaWdpblRvTS5ub3JtYWxpemUoKS5tdWwoZGlzdGFuY2UpXHJcbiAgICAgICAgb3JpZ2luVG9BID0gb3JpZ2luVG9BLm5vcm1hbGl6ZSgpLm11bChkaXN0YW5jZSlcclxuICAgICAgICBvcmlnaW5Ub0IgPSBvcmlnaW5Ub0Iubm9ybWFsaXplKCkubXVsKGRpc3RhbmNlKVxyXG4gICAgICAgIC8vIHByb2plY3QgcG9pbnRzXHJcbiAgICAgICAgdmFyIG9hbSA9IGEuYWRkKG9yaWdpblRvTSlcclxuICAgICAgICB2YXIgb2JtID0gYi5hZGQob3JpZ2luVG9NKVxyXG4gICAgICAgIHZhciBhcCA9IGEuYWRkKG9yaWdpblRvQSlcclxuICAgICAgICB2YXIgYnAgPSBiLmFkZChvcmlnaW5Ub0IpXHJcbiAgICAgICAgdmFyIHN0YXJ0ID0gTWF0aC5hdGFuMihvcmlnaW5Ub00ueCwgLW9yaWdpblRvTS55KVxyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgICAgIHBhdGgoY3R4LCBbYiwgYnAsIG9ibSwgb2FtLCBhcCwgYV0sIHRydWUpXHJcbiAgICAgICAgY3R4LmFyYyhtLngsIG0ueSwgdGhpcy5vcHRpb25zLnJhZGl1cywgc3RhcnQsIHN0YXJ0ICsgTWF0aC5QSSlcclxuICAgICAgICBjdHguZmlsbCgpXHJcbiAgICB9XHJcbiAgICBwYXRoKGN0eCkge1xyXG4gICAgICAgIGN0eC5hcmModGhpcy5vcHRpb25zLmNlbnRlci54LCB0aGlzLm9wdGlvbnMuY2VudGVyLnksIHRoaXMub3B0aW9ucy5yYWRpdXMsIDAsIF8yUEkpXHJcbiAgICB9XHJcbiAgICBib3VuZHMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdG9wbGVmdDogbmV3IFZlYzIodGhpcy5vcHRpb25zLmNlbnRlci54IC0gdGhpcy5vcHRpb25zLnJhZGl1cywgdGhpcy5vcHRpb25zLmNlbnRlci55IC0gdGhpcy5vcHRpb25zLnJhZGl1cyksXHJcbiAgICAgICAgICAgIGJvdHRvbXJpZ2h0OiBuZXcgVmVjMih0aGlzLm9wdGlvbnMuY2VudGVyLnggKyB0aGlzLm9wdGlvbnMucmFkaXVzLCB0aGlzLm9wdGlvbnMuY2VudGVyLnkgKyB0aGlzLm9wdGlvbnMucmFkaXVzKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGNvbnRhaW5zKHBvaW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHBvaW50LmRpc3QyKHRoaXMub3B0aW9ucy5jZW50ZXIpIDwgdGhpcy5vcHRpb25zLnJhZGl1cyAqIHRoaXMub3B0aW9ucy5yYWRpdXNcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRGlzY09iamVjdCIsImltcG9ydCBWZWMyIGZyb20gJy4vVmVjMi5qcydcclxuaW1wb3J0IHsgcGF0aCB9IGZyb20gJy4vaGVscGVycy5qcydcclxuaW1wb3J0IE9wYXF1ZU9iamVjdCBmcm9tICcuL09wYXF1ZU9iamVjdC5qcydcclxuXHJcbmNsYXNzIFBvbHlnb25PYmplY3QgZXh0ZW5kcyBPcGFxdWVPYmplY3Qge1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgICAgIHN1cGVyKClcclxuICAgICAgICBjb25zdCBkZWZhdWx0cyA9IHtcclxuICAgICAgICAgICAgcG9pbnRzOiBbXVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKGRlZmF1bHRzLCB0aGlzLm9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih0aGlzLm9wdGlvbnMsIG9wdGlvbnMpXHJcbiAgICB9XHJcblxyXG4gICAgYm91bmRzKCkge1xyXG4gICAgICAgIHZhciB0b3BsZWZ0ID0gdGhpcy5vcHRpb25zLnBvaW50c1swXS5jb3B5KClcclxuICAgICAgICB2YXIgYm90dG9tcmlnaHQgPSB0b3BsZWZ0LmNvcHkoKVxyXG4gICAgICAgIGZvciAodmFyIHAgPSAxLCBsID0gdGhpcy5vcHRpb25zLnBvaW50cy5sZW5ndGg7IHAgPCBsOyArK3ApIHtcclxuICAgICAgICAgICAgdmFyIHBvaW50ID0gdGhpcy5vcHRpb25zLnBvaW50c1twXVxyXG4gICAgICAgICAgICBpZiAocG9pbnQueCA+IGJvdHRvbXJpZ2h0LngpXHJcbiAgICAgICAgICAgICAgICBib3R0b21yaWdodC54ID0gcG9pbnQueFxyXG4gICAgICAgICAgICBpZiAocG9pbnQueSA+IGJvdHRvbXJpZ2h0LnkpXHJcbiAgICAgICAgICAgICAgICBib3R0b21yaWdodC55ID0gcG9pbnQueVxyXG4gICAgICAgICAgICBpZiAocG9pbnQueCA8IHRvcGxlZnQueClcclxuICAgICAgICAgICAgICAgIHRvcGxlZnQueCA9IHBvaW50LnhcclxuICAgICAgICAgICAgaWYgKHBvaW50LnkgPCB0b3BsZWZ0LnkpXHJcbiAgICAgICAgICAgICAgICB0b3BsZWZ0LnkgPSBwb2ludC55XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHRvcGxlZnQ6IHRvcGxlZnQsXHJcbiAgICAgICAgICAgIGJvdHRvbXJpZ2h0OiBib3R0b21yaWdodFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb250YWlucyhwKSB7XHJcbiAgICAgICAgdmFyIHBvaW50cyA9IHRoaXMub3B0aW9ucy5wb2ludHNcclxuICAgICAgICB2YXIgaSwgbCA9IHBvaW50cy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGogPSBsIC0gMVxyXG4gICAgICAgIHZhciB4ID0gcC54LFxyXG4gICAgICAgICAgICB5ID0gcC55XHJcbiAgICAgICAgdmFyIG9kZE5vZGVzID0gZmFsc2VcclxuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoKHBvaW50c1tpXS55IDwgeSAmJiBwb2ludHNbal0ueSA+PSB5IHx8XHJcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRzW2pdLnkgPCB5ICYmIHBvaW50c1tpXS55ID49IHkpICYmXHJcbiAgICAgICAgICAgICAgICAocG9pbnRzW2ldLnggPD0geCB8fCBwb2ludHNbal0ueCA8PSB4KSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBvaW50c1tpXS54ICsgKHkgLSBwb2ludHNbaV0ueSkgLyAocG9pbnRzW2pdLnkgLSBwb2ludHNbaV0ueSkgKiAocG9pbnRzW2pdLnggLSBwb2ludHNbaV0ueCkgPCB4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2RkTm9kZXMgPSAhb2RkTm9kZXNcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBqID0gaVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb2RkTm9kZXNcclxuICAgIH1cclxuXHJcbiAgICBwYXRoKGN0eCkge1xyXG4gICAgICAgIHBhdGgoY3R4LCB0aGlzLm9wdGlvbnMucG9pbnRzKVxyXG4gICAgfVxyXG5cclxuICAgIGNhc3QoY3R4LCBvcmlnaW4sIGJvdW5kcykge1xyXG4gICAgICAgIC8vIFRoZSBjdXJyZW50IGltcGxlbWVudGF0aW9uIG9mIHByb2plY3Rpb24gaXMgYSBiaXQgaGFja3kuLi4gZG8geW91IGhhdmUgYSBwcm9wZXIgc29sdXRpb24/XHJcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gKChib3VuZHMuYm90dG9tcmlnaHQueCAtIGJvdW5kcy50b3BsZWZ0LngpICsgKGJvdW5kcy5ib3R0b21yaWdodC55IC0gYm91bmRzLnRvcGxlZnQueSkpIC8gMlxyXG4gICAgICAgIHRoaXMuX2ZvckVhY2hWaXNpYmxlRWRnZXMob3JpZ2luLCBib3VuZHMsIGZ1bmN0aW9uIChhLCBiLCBvcmlnaW5Ub0EsIG9yaWdpblRvQiwgYVRvQikge1xyXG4gICAgICAgICAgICB2YXIgbSAvLyBtIGlzIHRoZSBwcm9qZWN0ZWQgcG9pbnQgb2Ygb3JpZ2luIHRvIFthLCBiXVxyXG4gICAgICAgICAgICB2YXIgdCA9IG9yaWdpblRvQS5pbnYoKS5kb3QoYVRvQikgLyBhVG9CLmxlbmd0aDIoKVxyXG4gICAgICAgICAgICBpZiAodCA8IDApXHJcbiAgICAgICAgICAgICAgICBtID0gYVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0ID4gMSlcclxuICAgICAgICAgICAgICAgIG0gPSBiXHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIG0gPSBhLmFkZChhVG9CLm11bCh0KSlcclxuICAgICAgICAgICAgdmFyIG9yaWdpblRvTSA9IG0uc3ViKG9yaWdpbilcclxuICAgICAgICAgICAgLy8gbm9ybWFsaXplIHRvIGRpc3RhbmNlXHJcbiAgICAgICAgICAgIG9yaWdpblRvTSA9IG9yaWdpblRvTS5ub3JtYWxpemUoKS5tdWwoZGlzdGFuY2UpXHJcbiAgICAgICAgICAgIG9yaWdpblRvQSA9IG9yaWdpblRvQS5ub3JtYWxpemUoKS5tdWwoZGlzdGFuY2UpXHJcbiAgICAgICAgICAgIG9yaWdpblRvQiA9IG9yaWdpblRvQi5ub3JtYWxpemUoKS5tdWwoZGlzdGFuY2UpXHJcbiAgICAgICAgICAgIC8vIHByb2plY3QgcG9pbnRzXHJcbiAgICAgICAgICAgIHZhciBvYW0gPSBhLmFkZChvcmlnaW5Ub00pXHJcbiAgICAgICAgICAgIHZhciBvYm0gPSBiLmFkZChvcmlnaW5Ub00pXHJcbiAgICAgICAgICAgIHZhciBhcCA9IGEuYWRkKG9yaWdpblRvQSlcclxuICAgICAgICAgICAgdmFyIGJwID0gYi5hZGQob3JpZ2luVG9CKVxyXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKClcclxuICAgICAgICAgICAgcGF0aChjdHgsIFthLCBiLCBicCwgb2JtLCBvYW0sIGFwXSlcclxuICAgICAgICAgICAgY3R4LmZpbGwoKVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgX2ZvckVhY2hWaXNpYmxlRWRnZXMob3JpZ2luLCBib3VuZHMsIGYpIHtcclxuICAgICAgICB2YXIgYSA9IHRoaXMub3B0aW9ucy5wb2ludHNbdGhpcy5vcHRpb25zLnBvaW50cy5sZW5ndGggLSAxXSxcclxuICAgICAgICAgICAgYlxyXG4gICAgICAgIGZvciAodmFyIHAgPSAwLCBsID0gdGhpcy5vcHRpb25zLnBvaW50cy5sZW5ndGg7IHAgPCBsOyArK3AsIGEgPSBiKSB7XHJcbiAgICAgICAgICAgIGIgPSB0aGlzLm9wdGlvbnMucG9pbnRzW3BdXHJcbiAgICAgICAgICAgIGlmIChhLmluQm91bmQoYm91bmRzLnRvcGxlZnQsIGJvdW5kcy5ib3R0b21yaWdodCkpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvcmlnaW5Ub0EgPSBhLnN1YihvcmlnaW4pXHJcbiAgICAgICAgICAgICAgICB2YXIgb3JpZ2luVG9CID0gYi5zdWIob3JpZ2luKVxyXG4gICAgICAgICAgICAgICAgdmFyIGFUb0IgPSBiLnN1YihhKVxyXG4gICAgICAgICAgICAgICAgdmFyIG5vcm1hbCA9IG5ldyBWZWMyKGFUb0IueSwgLWFUb0IueClcclxuICAgICAgICAgICAgICAgIGlmIChub3JtYWwuZG90KG9yaWdpblRvQSkgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZihhLCBiLCBvcmlnaW5Ub0EsIG9yaWdpblRvQiwgYVRvQilcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUG9seWdvbk9iamVjdCIsImltcG9ydCBWZWMyIGZyb20gJy4vVmVjMi5qcydcclxuaW1wb3J0IFBvbHlnb25PYmplY3QgZnJvbSAnLi9Qb2x5Z29uT2JqZWN0LmpzJ1xyXG5cclxuY2xhc3MgUmVjdGFuZ2xlT2JqZWN0IGV4dGVuZHMgUG9seWdvbk9iamVjdCB7XHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9ucylcclxuICAgICAgICBjb25zdCBkZWZhdWx0cyA9IHtcclxuICAgICAgICAgICAgdG9wbGVmdDogbmV3IFZlYzIoKSxcclxuICAgICAgICAgICAgYm90dG9tcmlnaHQ6IG5ldyBWZWMyKClcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgdGhpcy5vcHRpb25zKVxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24odGhpcy5vcHRpb25zLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMuc3luY0Zyb21Ub3BsZWZ0Qm90dG9tcmlnaHQoKVxyXG4gICAgfVxyXG4gICAgc3luY0Zyb21Ub3BsZWZ0Qm90dG9tcmlnaHQoKSB7XHJcbiAgICAgICAgdmFyIGEgPSB0aGlzLm9wdGlvbnMudG9wbGVmdFxyXG4gICAgICAgIHZhciBiID0gbmV3IFZlYzIodGhpcy5vcHRpb25zLmJvdHRvbXJpZ2h0LngsIHRoaXMub3B0aW9ucy50b3BsZWZ0LnkpXHJcbiAgICAgICAgdmFyIGMgPSB0aGlzLm9wdGlvbnMuYm90dG9tcmlnaHRcclxuICAgICAgICB2YXIgZCA9IG5ldyBWZWMyKHRoaXMub3B0aW9ucy50b3BsZWZ0LngsIHRoaXMub3B0aW9ucy5ib3R0b21yaWdodC55KVxyXG4gICAgICAgIHRoaXMub3B0aW9ucy5wb2ludHMgPSBbYSwgYiwgYywgZF1cclxuICAgIH1cclxuICAgIGZpbGwoY3R4KSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLm9wdGlvbnMucG9pbnRzWzBdLngsIHkgPSB0aGlzLm9wdGlvbnMucG9pbnRzWzBdLnlcclxuICAgICAgICBjdHgucmVjdCh4LCB5LCB0aGlzLm9wdGlvbnMucG9pbnRzWzJdLnggLSB4LCB0aGlzLm9wdGlvbnMucG9pbnRzWzJdLnkgLSB5KVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSZWN0YW5nbGVPYmplY3QiLCJpbXBvcnQgUG9seWdvbk9iamVjdCBmcm9tICcuL1BvbHlnb25PYmplY3QuanMnXHJcbmltcG9ydCBWZWMyIGZyb20gJy4vVmVjMi5qcydcclxuXHJcbmNsYXNzIExpbmVPYmplY3QgZXh0ZW5kcyBQb2x5Z29uT2JqZWN0IHtcclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgICAgICBzdXBlcihvcHRpb25zKVxyXG4gICAgICAgIGNvbnN0IGRlZmF1bHRzID0ge1xyXG4gICAgICAgICAgICBhOiBuZXcgVmVjMigpLFxyXG4gICAgICAgICAgICBiOiBuZXcgVmVjMigpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIHRoaXMub3B0aW9ucylcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucywgb3B0aW9ucylcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnN5bmNGcm9tQUIoKVxyXG4gICAgfVxyXG5cclxuICAgIHN5bmNGcm9tQWIoKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnBvaW50cyA9IFt0aGlzLm9wdGlvbnMuYSwgdGhpcy5vcHRpb25zLmJdXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IExpbmVPYmplY3QiXSwibmFtZXMiOlsiVmVjMiIsIngiLCJ5IiwidiIsIm4iLCJtdWwiLCJkeCIsImR5IiwibGVuZ3RoIiwiTWF0aCIsInNxcnQiLCJsZW5ndGgyIiwidG9wTGVmdCIsImJvdHRvbVJpZ2h0IiwiR09MREVOX0FOR0xFIiwiUEkiLCJfMlBJIiwicGF0aCIsImN0eCIsInBvaW50cyIsImRvbnRKb2luTGFzdCIsInAiLCJtb3ZlVG8iLCJpIiwibCIsImxpbmVUbyIsImNyZWF0ZUNhbnZhc0FuZDJkQ29udGV4dCIsImlkIiwidyIsImgiLCJpaWQiLCJjYW52YXMiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiY3JlYXRlRWxlbWVudCIsIndpZHRoIiwiaGVpZ2h0Iiwic3R5bGUiLCJkaXNwbGF5IiwiYm9keSIsImFwcGVuZENoaWxkIiwiZ2V0Q29udGV4dCIsImNsZWFyUmVjdCIsImdldFJHQkEiLCJjb2xvciIsImFscGhhIiwiZmlsbFN0eWxlIiwiZmlsbFJlY3QiLCJkIiwiZ2V0SW1hZ2VEYXRhIiwiZGF0YSIsImdldFRhbjIiLCJyYWRpdXMiLCJjZW50ZXIiLCJlcHNpbG9uIiwieDAiLCJ5MCIsImxlbjIiLCJzb2xuIiwic29sdXRpb25zIiwiYSIsInRtcCIsImFyZ3VtZW50cyIsImxlbjJhIiwidHQiLCJhY29zIiwibnQiLCJ0dF9jb3MiLCJjb3MiLCJ0dF9zaW4iLCJzaW4iLCJudF9jb3MiLCJudF9zaW4iLCJwdXNoIiwiZGlzdDAiLCJkaXN0MSIsImFicyIsImRpc3QyIiwiZGlzdDMiLCJMaWdodCIsIm9wdGlvbnMiLCJkZWZhdWx0cyIsInBvc2l0aW9uIiwiZGlzdGFuY2UiLCJkaWZmdXNlIiwiT2JqZWN0IiwiYXNzaWduIiwiYyIsIl9nZXRWaXNpYmxlTWFza0NhY2hlIiwiZHJhd0ltYWdlIiwicm91bmQiLCJ0b3BsZWZ0IiwiYm90dG9tcmlnaHQiLCJmIiwiZmxvb3IiLCJoYXNoIiwidmlzbWFza2hhc2giLCJfdmlzbWFza2NhY2hlIiwiZyIsImNyZWF0ZVJhZGlhbEdyYWRpZW50IiwiYWRkQ29sb3JTdG9wIiwidG9TdHJpbmciLCJMaWdodGluZyIsImxpZ2h0Iiwib2JqZWN0cyIsIl9jYWNoZSIsIl9jYXN0Y2FjaGUiLCJjdHhvdXRwdXQiLCJzYW1wbGVzIiwiYm91bmRzIiwiZm9yRWFjaFNhbXBsZSIsIm8iLCJjb250YWlucyIsImZvckVhY2giLCJvYmplY3QiLCJjYXN0IiwidW5kZWZpbmVkIiwiYmVnaW5QYXRoIiwiZmlsbCIsImNyZWF0ZUNhY2hlIiwic2F2ZSIsInJlbmRlciIsImdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiIsInJlc3RvcmUiLCJMYW1wIiwiYW5nbGUiLCJyb3VnaG5lc3MiLCJvcmllbnRhdGlvbkNlbnRlciIsImhhc2hjb2RlIiwiX2dldEhhc2hDYWNoZSIsIl9jYWNoZUhhc2hjb2RlIiwiX2djYWNoZSIsIkQiLCJjYWNoZSIsIm1pbiIsIl9nZXRHcmFkaWVudENhY2hlIiwiT3BhcXVlT2JqZWN0IiwidW5pcXVlSWQiLCJEaXNjT2JqZWN0Iiwib3JpZ2luIiwibSIsIm9yaWdpblRvTSIsInN1YiIsInRhbmdlbnRMaW5lcyIsIm9yaWdpblRvQSIsIm9yaWdpblRvQiIsImFkZCIsImIiLCJub3JtYWxpemUiLCJvYW0iLCJvYm0iLCJhcCIsImJwIiwic3RhcnQiLCJhdGFuMiIsImFyYyIsInBvaW50IiwiUG9seWdvbk9iamVjdCIsImNvcHkiLCJqIiwib2RkTm9kZXMiLCJfZm9yRWFjaFZpc2libGVFZGdlcyIsImFUb0IiLCJ0IiwiaW52IiwiZG90IiwiaW5Cb3VuZCIsIm5vcm1hbCIsIlJlY3RhbmdsZU9iamVjdCIsInN5bmNGcm9tVG9wbGVmdEJvdHRvbXJpZ2h0IiwicmVjdCIsIkxpbmVPYmplY3QiLCJzeW5jRnJvbUFCIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFBTUE7RUFDRixrQkFBWUMsQ0FBWixFQUFlQyxDQUFmLEVBQWtCO0VBQUE7O0VBQ2QsYUFBS0QsQ0FBTCxHQUFTQSxLQUFLLENBQWQ7RUFDQSxhQUFLQyxDQUFMLEdBQVNBLEtBQUssQ0FBZDtFQUNIOzs7O2lDQUVNO0VBQ0gsbUJBQU8sSUFBSUYsSUFBSixDQUFTLEtBQUtDLENBQWQsRUFBaUIsS0FBS0MsQ0FBdEIsQ0FBUDtFQUNIOzs7OEJBRUdDLEdBQUc7RUFDSCxtQkFBT0EsRUFBRUYsQ0FBRixHQUFNLEtBQUtBLENBQVgsR0FBZUUsRUFBRUQsQ0FBRixHQUFNLEtBQUtBLENBQWpDO0VBQ0g7Ozs4QkFFR0MsR0FBRztFQUNILG1CQUFPLElBQUlILElBQUosQ0FBUyxLQUFLQyxDQUFMLEdBQVNFLEVBQUVGLENBQXBCLEVBQXVCLEtBQUtDLENBQUwsR0FBU0MsRUFBRUQsQ0FBbEMsQ0FBUDtFQUNIOzs7OEJBRUdDLEdBQUc7RUFDSCxtQkFBTyxJQUFJSCxJQUFKLENBQVMsS0FBS0MsQ0FBTCxHQUFTRSxFQUFFRixDQUFwQixFQUF1QixLQUFLQyxDQUFMLEdBQVNDLEVBQUVELENBQWxDLENBQVA7RUFDSDs7OzhCQUVHRSxHQUFHO0VBQ0gsbUJBQU8sSUFBSUosSUFBSixDQUFTLEtBQUtDLENBQUwsR0FBU0csQ0FBbEIsRUFBcUIsS0FBS0YsQ0FBTCxHQUFTRSxDQUE5QixDQUFQO0VBQ0g7OztnQ0FFSztFQUNGLG1CQUFPLEtBQUtDLEdBQUwsQ0FBUyxDQUFDLENBQVYsQ0FBUDtFQUNIOzs7Z0NBRUtGLEdBQUc7RUFDTCxnQkFBSUcsS0FBSyxLQUFLTCxDQUFMLEdBQVNFLEVBQUVGLENBQXBCO0VBQ0EsZ0JBQUlNLEtBQUssS0FBS0wsQ0FBTCxHQUFTQyxFQUFFRCxDQUFwQjtFQUNBLG1CQUFPSSxLQUFLQSxFQUFMLEdBQVVDLEtBQUtBLEVBQXRCO0VBQ0g7OztzQ0FFVztFQUNSLGdCQUFJQyxTQUFTQyxLQUFLQyxJQUFMLENBQVUsS0FBS0MsT0FBTCxFQUFWLENBQWI7RUFDQSxtQkFBTyxJQUFJWCxJQUFKLENBQVMsS0FBS0MsQ0FBTCxHQUFTTyxNQUFsQixFQUEwQixLQUFLTixDQUFMLEdBQVNNLE1BQW5DLENBQVA7RUFDSDs7O29DQUVTO0VBQ04sbUJBQU8sS0FBS1AsQ0FBTCxHQUFTLEtBQUtBLENBQWQsR0FBa0IsS0FBS0MsQ0FBTCxHQUFTLEtBQUtBLENBQXZDO0VBQ0g7OztxQ0FFVTtFQUNQLG1CQUFPLEtBQUtELENBQUwsR0FBUyxHQUFULEdBQWUsS0FBS0MsQ0FBM0I7RUFDSDs7O2tDQUVPVSxTQUFTQyxhQUFhO0VBQzFCLG1CQUFRRCxRQUFRWCxDQUFSLEdBQVksS0FBS0EsQ0FBakIsSUFBc0IsS0FBS0EsQ0FBTCxHQUFTWSxZQUFZWixDQUEzQyxJQUNKVyxRQUFRVixDQUFSLEdBQVksS0FBS0EsQ0FEYixJQUNrQixLQUFLQSxDQUFMLEdBQVNXLFlBQVlYLENBRC9DO0VBRUg7Ozs7O0VDbERFLElBQU1ZLGVBQWVMLEtBQUtNLEVBQUwsSUFBVyxJQUFJTixLQUFLQyxJQUFMLENBQVUsQ0FBVixDQUFmLENBQXJCO0FBQ1AsRUFBTyxJQUFNTSxPQUFPLElBQUlQLEtBQUtNLEVBQXRCOztFQUVQLFNBQVNFLElBQVQsQ0FBY0MsR0FBZCxFQUFtQkMsTUFBbkIsRUFBMkJDLFlBQTNCLEVBQXlDO0VBQ3JDLFFBQUlDLElBQUlGLE9BQU8sQ0FBUCxDQUFSO0VBQ0FELFFBQUlJLE1BQUosQ0FBV0QsRUFBRXBCLENBQWIsRUFBZ0JvQixFQUFFbkIsQ0FBbEI7RUFDQSxTQUFLLElBQUlxQixJQUFJLENBQVIsRUFBV0MsSUFBSUwsT0FBT1gsTUFBM0IsRUFBbUNlLElBQUlDLENBQXZDLEVBQTBDLEVBQUVELENBQTVDLEVBQStDO0VBQzNDRixZQUFJRixPQUFPSSxDQUFQLENBQUo7RUFDQUwsWUFBSU8sTUFBSixDQUFXSixFQUFFcEIsQ0FBYixFQUFnQm9CLEVBQUVuQixDQUFsQjtFQUNIO0VBQ0QsUUFBSSxDQUFDa0IsWUFBRCxJQUFpQkQsT0FBT1gsTUFBUCxHQUFnQixDQUFyQyxFQUF3QztFQUNwQ2EsWUFBSUYsT0FBTyxDQUFQLENBQUo7RUFDQUQsWUFBSU8sTUFBSixDQUFXSixFQUFFcEIsQ0FBYixFQUFnQm9CLEVBQUVuQixDQUFsQjtFQUNIO0VBQ0o7O0VBRUQsU0FBU3dCLHdCQUFULENBQWtDQyxFQUFsQyxFQUFzQ0MsQ0FBdEMsRUFBeUNDLENBQXpDLEVBQTRDO0VBQ3hDLFFBQUlDLE1BQU0sWUFBWUgsRUFBdEI7RUFDQSxRQUFJSSxTQUFTQyxTQUFTQyxjQUFULENBQXdCSCxHQUF4QixDQUFiOztFQUVBLFFBQUlDLFdBQVcsSUFBZixFQUFxQjtFQUNqQkEsaUJBQVNDLFNBQVNFLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBVDtFQUNBSCxlQUFPSixFQUFQLEdBQVlHLEdBQVo7RUFDQUMsZUFBT0ksS0FBUCxHQUFlUCxDQUFmO0VBQ0FHLGVBQU9LLE1BQVAsR0FBZ0JQLENBQWhCO0VBQ0FFLGVBQU9NLEtBQVAsQ0FBYUMsT0FBYixHQUF1QixNQUF2QjtFQUNBTixpQkFBU08sSUFBVCxDQUFjQyxXQUFkLENBQTBCVCxNQUExQjtFQUNIOztFQUVELFFBQUliLE1BQU1hLE9BQU9VLFVBQVAsQ0FBa0IsSUFBbEIsQ0FBVjtFQUNBdkIsUUFBSXdCLFNBQUosQ0FBYyxDQUFkLEVBQWlCLENBQWpCLEVBQW9CWCxPQUFPSSxLQUEzQixFQUFrQ0osT0FBT0ssTUFBekM7O0VBRUFMLFdBQU9JLEtBQVAsR0FBZVAsQ0FBZjtFQUNBRyxXQUFPSyxNQUFQLEdBQWdCUCxDQUFoQjs7RUFFQSxXQUFPO0VBQ0hFLGdCQUFRQSxNQURMO0VBRUhiLGFBQUtBLEdBRkY7RUFHSFUsV0FBR0EsQ0FIQTtFQUlIQyxXQUFHQTtFQUpBLEtBQVA7RUFNSDs7RUFFRCxJQUFJYyxVQUFXLFlBQVk7RUFDdkI7RUFDQSxRQUFJWixTQUFTQyxTQUFTRSxhQUFULENBQXVCLFFBQXZCLENBQWI7RUFDQUgsV0FBT0ksS0FBUCxHQUFlSixPQUFPSyxNQUFQLEdBQWdCLENBQS9CO0VBQ0EsUUFBSWxCLE1BQU1hLE9BQU9VLFVBQVAsQ0FBa0IsSUFBbEIsQ0FBVjs7RUFFQSxXQUFPLFVBQVVHLEtBQVYsRUFBaUJDLEtBQWpCLEVBQXdCO0VBQzNCM0IsWUFBSXdCLFNBQUosQ0FBYyxDQUFkLEVBQWlCLENBQWpCLEVBQW9CLENBQXBCLEVBQXVCLENBQXZCO0VBQ0F4QixZQUFJNEIsU0FBSixHQUFnQkYsS0FBaEI7RUFDQTFCLFlBQUk2QixRQUFKLENBQWEsQ0FBYixFQUFnQixDQUFoQixFQUFtQixDQUFuQixFQUFzQixDQUF0QjtFQUNBLFlBQUlDLElBQUk5QixJQUFJK0IsWUFBSixDQUFpQixDQUFqQixFQUFvQixDQUFwQixFQUF1QixDQUF2QixFQUEwQixDQUExQixFQUE2QkMsSUFBckM7RUFDQSxlQUFPLFVBQVUsQ0FBQ0YsRUFBRSxDQUFGLENBQUQsRUFBT0EsRUFBRSxDQUFGLENBQVAsRUFBYUEsRUFBRSxDQUFGLENBQWIsRUFBbUJILEtBQW5CLENBQVYsR0FBc0MsR0FBN0M7RUFDSCxLQU5EO0VBT0gsQ0FiYyxFQUFmOztFQWVBLFNBQVNNLE9BQVQsQ0FBaUJDLE1BQWpCLEVBQXlCQyxNQUF6QixFQUFpQztFQUM3QixRQUFJQyxVQUFVSCxRQUFRRyxPQUFSLElBQW1CLElBQWpDO0VBQUE7RUFDSUMsTUFESjtFQUFBLFFBQ1FDLEVBRFI7RUFBQSxRQUNZQyxJQURaO0VBQUEsUUFDa0JDLElBRGxCO0VBQUEsUUFFSUMsWUFBWSxFQUZoQjtFQUFBLFFBR0lDLElBQUlSLE1BSFI7RUFJQSxRQUFJLFFBQU9RLENBQVAseUNBQU9BLENBQVAsT0FBYSxRQUFiLElBQXlCLE9BQU9QLE1BQVAsS0FBa0IsUUFBL0MsRUFBeUQ7RUFDckQsWUFBSVEsTUFBTUQsQ0FBVjtFQUNBUCxpQkFBU08sQ0FBVDtFQUNBUCxpQkFBU1EsR0FBVCxDQUhxRDtFQUl4RDtFQUNELFFBQUksT0FBT1IsTUFBUCxLQUFrQixRQUF0QixFQUFnQztFQUM1QjtFQUNBRSxhQUFLRixNQUFMO0VBQ0FHLGFBQUtNLFVBQVUsQ0FBVixDQUFMO0VBQ0FMLGVBQU9GLEtBQUtBLEVBQUwsR0FBVUMsS0FBS0EsRUFBdEI7RUFDSCxLQUxELE1BS087RUFDSDtFQUNBRCxhQUFLRixPQUFPcEQsQ0FBWjtFQUNBdUQsYUFBS0gsT0FBT25ELENBQVo7RUFDQXVELGVBQU9KLE9BQU8xQyxPQUFQLEVBQVA7RUFDSDtFQUNEO0VBQ0EsUUFBSW9ELFFBQVFQLEtBQUsvQyxLQUFLQyxJQUFMLENBQVUrQyxPQUFPRyxJQUFJQSxDQUFyQixDQUFqQjtFQUFBLFFBQ0lJLEtBQUt2RCxLQUFLd0QsSUFBTCxDQUFVLENBQUMsQ0FBQ0wsQ0FBRCxHQUFLTCxFQUFMLEdBQVVRLEtBQVgsSUFBb0JOLElBQTlCLENBRFQ7RUFBQSxRQUVJUyxLQUFLekQsS0FBS3dELElBQUwsQ0FBVSxDQUFDLENBQUNMLENBQUQsR0FBS0wsRUFBTCxHQUFVUSxLQUFYLElBQW9CTixJQUE5QixDQUZUO0VBQUEsUUFHSVUsU0FBU1AsSUFBSW5ELEtBQUsyRCxHQUFMLENBQVNKLEVBQVQsQ0FIakI7RUFBQSxRQUlJSyxTQUFTVCxJQUFJbkQsS0FBSzZELEdBQUwsQ0FBU04sRUFBVCxDQUpqQjtFQUFBLFFBS0lPLFNBQVNYLElBQUluRCxLQUFLMkQsR0FBTCxDQUFTRixFQUFULENBTGpCO0VBQUEsUUFNSU0sU0FBU1osSUFBSW5ELEtBQUs2RCxHQUFMLENBQVNKLEVBQVQsQ0FOakI7O0VBUUE7RUFDQTtFQUNBO0VBQ0FSLFdBQU8sSUFBSTFELElBQUosQ0FBU3VELEtBQUtnQixNQUFkLEVBQXNCZixLQUFLZ0IsTUFBM0IsQ0FBUDtFQUNBYixjQUFVYyxJQUFWLENBQWVmLElBQWY7RUFDQSxRQUFJZ0IsUUFBUWhCLEtBQUsvQyxPQUFMLEVBQVo7O0VBRUErQyxXQUFPLElBQUkxRCxJQUFKLENBQVN1RCxLQUFLWSxNQUFkLEVBQXNCWCxLQUFLYSxNQUEzQixDQUFQO0VBQ0FWLGNBQVVjLElBQVYsQ0FBZWYsSUFBZjtFQUNBLFFBQUlpQixRQUFRakIsS0FBSy9DLE9BQUwsRUFBWjtFQUNBLFFBQUlGLEtBQUttRSxHQUFMLENBQVNGLFFBQVFDLEtBQWpCLElBQTBCckIsT0FBOUIsRUFBdUMsT0FBT0ssU0FBUDs7RUFFdkNELFdBQU8sSUFBSTFELElBQUosQ0FBU3VELEtBQUtnQixNQUFkLEVBQXNCZixLQUFLZ0IsTUFBM0IsQ0FBUDtFQUNBYixjQUFVYyxJQUFWLENBQWVmLElBQWY7RUFDQSxRQUFJbUIsUUFBUW5CLEtBQUsvQyxPQUFMLEVBQVo7RUFDQTtFQUNBLFFBQUlGLEtBQUttRSxHQUFMLENBQVNELFFBQVFFLEtBQWpCLElBQTBCdkIsT0FBOUIsRUFBdUMsT0FBTyxDQUFDSSxJQUFELEVBQU9DLFVBQVUsQ0FBVixDQUFQLENBQVA7RUFDdkMsUUFBSWxELEtBQUttRSxHQUFMLENBQVNGLFFBQVFHLEtBQWpCLElBQTBCdkIsT0FBOUIsRUFBdUMsT0FBTyxDQUFDSyxVQUFVLENBQVYsQ0FBRCxFQUFlRCxJQUFmLENBQVA7O0VBRXZDQSxXQUFPLElBQUkxRCxJQUFKLENBQVN1RCxLQUFLWSxNQUFkLEVBQXNCWCxLQUFLYSxNQUEzQixDQUFQO0VBQ0FWLGNBQVVjLElBQVYsQ0FBZWYsSUFBZjtFQUNBLFFBQUlvQixRQUFRcEIsS0FBSy9DLE9BQUwsRUFBWjtFQUNBLFFBQUlGLEtBQUttRSxHQUFMLENBQVNDLFFBQVFDLEtBQWpCLElBQTBCeEIsT0FBOUIsRUFBdUMsT0FBTyxDQUFDSyxVQUFVLENBQVYsQ0FBRCxFQUFlRCxJQUFmLENBQVA7RUFDdkMsUUFBSWpELEtBQUttRSxHQUFMLENBQVNELFFBQVFHLEtBQWpCLElBQTBCeEIsT0FBOUIsRUFBdUMsT0FBTyxDQUFDSyxVQUFVLENBQVYsQ0FBRCxFQUFlRCxJQUFmLENBQVA7RUFDdkMsUUFBSWpELEtBQUttRSxHQUFMLENBQVNGLFFBQVFJLEtBQWpCLElBQTBCeEIsT0FBOUIsRUFBdUMsT0FBTyxDQUFDSyxVQUFVLENBQVYsQ0FBRCxFQUFlRCxJQUFmLENBQVA7O0VBRXZDO0VBQ0EsV0FBT0MsU0FBUDtFQUNIOztNQ25IS29CO0VBQ0YsbUJBQVlDLE9BQVosRUFBcUI7RUFBQTs7RUFDakIsWUFBTUMsY0FBVztFQUNiQyxzQkFBVSxJQUFJbEYsSUFBSixFQURHO0VBRWJtRixzQkFBVSxHQUZHO0VBR2JDLHFCQUFTO0VBSEksU0FBakI7RUFLQSxhQUFLSixPQUFMLEdBQWVLLE9BQU9DLE1BQVAsQ0FBY0wsV0FBZCxFQUF3QkQsT0FBeEIsQ0FBZjtFQUNIOzs7O21DQUVROzs7K0JBRUo5RCxLQUFLO0VBQ04sZ0JBQUlxRSxJQUFJLEtBQUtDLG9CQUFMLEVBQVI7RUFDQXRFLGdCQUFJdUUsU0FBSixDQUNJRixFQUFFeEQsTUFETixFQUVJdEIsS0FBS2lGLEtBQUwsQ0FBVyxLQUFLVixPQUFMLENBQWFFLFFBQWIsQ0FBc0JqRixDQUF0QixHQUEwQnNGLEVBQUUzRCxDQUFGLEdBQU0sQ0FBM0MsQ0FGSixFQUdJbkIsS0FBS2lGLEtBQUwsQ0FBVyxLQUFLVixPQUFMLENBQWFFLFFBQWIsQ0FBc0JoRixDQUF0QixHQUEwQnFGLEVBQUUxRCxDQUFGLEdBQU0sQ0FBM0MsQ0FISjtFQUtIOzs7bUNBRVE7RUFDTCxtQkFBTztFQUNIOEQseUJBQVMsSUFBSTNGLElBQUosQ0FBUyxLQUFLZ0YsT0FBTCxDQUFhRSxRQUFiLENBQXNCakYsQ0FBdEIsR0FBMEIsS0FBSytFLE9BQUwsQ0FBYUcsUUFBaEQsRUFBMEQsS0FBS0gsT0FBTCxDQUFhRSxRQUFiLENBQXNCaEYsQ0FBdEIsR0FBMEIsS0FBSzhFLE9BQUwsQ0FBYUcsUUFBakcsQ0FETjtFQUVIUyw2QkFBYSxJQUFJNUYsSUFBSixDQUFTLEtBQUtnRixPQUFMLENBQWFFLFFBQWIsQ0FBc0JqRixDQUF0QixHQUEwQixLQUFLK0UsT0FBTCxDQUFhRyxRQUFoRCxFQUEwRCxLQUFLSCxPQUFMLENBQWFFLFFBQWIsQ0FBc0JoRixDQUF0QixHQUEwQixLQUFLOEUsT0FBTCxDQUFhRyxRQUFqRztFQUZWLGFBQVA7RUFJSDs7O21DQUVRO0VBQ0wsbUJBQU8sSUFBSW5GLElBQUosQ0FBUyxLQUFLZ0YsT0FBTCxDQUFhRyxRQUF0QixFQUFnQyxLQUFLSCxPQUFMLENBQWFHLFFBQTdDLENBQVA7RUFDSDs7O3dDQUVhVSxHQUFHO0VBQ2JBLGNBQUUsS0FBS2IsT0FBTCxDQUFhRSxRQUFmO0VBQ0g7OztpREFFc0I7RUFDbkIsZ0JBQUlsQyxJQUFJdkMsS0FBS3FGLEtBQUwsQ0FBVyxLQUFLZCxPQUFMLENBQWFHLFFBQWIsR0FBd0IsR0FBbkMsQ0FBUjtFQUNBLGdCQUFJWSxPQUFPLEtBQUsvQyxDQUFoQjtFQUNBLGdCQUFJLEtBQUtnRCxXQUFMLElBQW9CRCxJQUF4QixFQUE4QjtFQUMxQixxQkFBS0MsV0FBTCxHQUFtQkQsSUFBbkI7RUFDQSxvQkFBSVIsSUFBSSxLQUFLVSxhQUFMLEdBQXFCdkUseUJBQXlCLE9BQU8sS0FBS0MsRUFBckMsRUFBeUMsSUFBSXFCLENBQTdDLEVBQWdELElBQUlBLENBQXBELENBQTdCO0VBQ0Esb0JBQUlrRCxJQUFJWCxFQUFFckUsR0FBRixDQUFNaUYsb0JBQU4sQ0FBMkJuRCxDQUEzQixFQUE4QkEsQ0FBOUIsRUFBaUMsQ0FBakMsRUFBb0NBLENBQXBDLEVBQXVDQSxDQUF2QyxFQUEwQ0EsQ0FBMUMsQ0FBUjtFQUNBa0Qsa0JBQUVFLFlBQUYsQ0FBZSxDQUFmLEVBQWtCLGVBQWxCO0VBQ0FGLGtCQUFFRSxZQUFGLENBQWUsQ0FBZixFQUFrQixlQUFsQjtFQUNBYixrQkFBRXJFLEdBQUYsQ0FBTTRCLFNBQU4sR0FBa0JvRCxDQUFsQjtFQUNBWCxrQkFBRXJFLEdBQUYsQ0FBTTZCLFFBQU4sQ0FBZSxDQUFmLEVBQWtCLENBQWxCLEVBQXFCd0MsRUFBRTNELENBQXZCLEVBQTBCMkQsRUFBRTFELENBQTVCO0VBQ0g7RUFDRCxtQkFBTyxLQUFLb0UsYUFBWjtFQUNIOzs7MENBRWU7RUFDWixtQkFBTyxDQUFDLEtBQUtqQixPQUFMLENBQWFHLFFBQWQsRUFBd0IsS0FBS0gsT0FBTCxDQUFhSSxPQUFyQyxFQUE4Q2lCLFFBQTlDLEVBQVA7RUFDSDs7Ozs7TUNyRENDO0VBQ0Ysc0JBQVl0QixPQUFaLEVBQXFCO0VBQUE7O0VBQ2pCLFlBQU1DLGNBQVc7RUFDYnNCLG1CQUFPLElBQUl4QixLQUFKLEVBRE07RUFFYnlCLHFCQUFTO0VBRkksU0FBakI7RUFJQSxhQUFLeEIsT0FBTCxHQUFlSyxPQUFPQyxNQUFQLENBQWNMLFdBQWQsRUFBd0IsS0FBS0QsT0FBN0IsQ0FBZjtFQUNBLGFBQUtBLE9BQUwsR0FBZUssT0FBT0MsTUFBUCxDQUFjLEtBQUtOLE9BQW5CLEVBQTRCQSxPQUE1QixDQUFmO0VBQ0g7Ozs7c0NBRVdwRCxHQUFHQyxHQUFHO0VBQ2QsaUJBQUs0RSxNQUFMLEdBQWMvRSx5QkFBeUIsSUFBekIsRUFBK0JFLENBQS9CLEVBQWtDQyxDQUFsQyxDQUFkO0VBQ0EsaUJBQUs2RSxVQUFMLEdBQWtCaEYseUJBQXlCLEtBQXpCLEVBQWdDRSxDQUFoQyxFQUFtQ0MsQ0FBbkMsQ0FBbEI7RUFDSDs7OytCQUVJOEUsV0FBVztFQUNaLGdCQUFJSixRQUFRLEtBQUt2QixPQUFMLENBQWF1QixLQUF6QjtFQUNBLGdCQUFJbkcsSUFBSW1HLE1BQU1LLE9BQWQ7RUFDQSxnQkFBSXJCLElBQUksS0FBS21CLFVBQWI7RUFDQSxnQkFBSXhGLE1BQU1xRSxFQUFFckUsR0FBWjtFQUNBQSxnQkFBSXdCLFNBQUosQ0FBYyxDQUFkLEVBQWlCLENBQWpCLEVBQW9CNkMsRUFBRTNELENBQXRCLEVBQXlCMkQsRUFBRTFELENBQTNCO0VBQ0E7RUFDQVgsZ0JBQUk0QixTQUFKLEdBQWdCLGdCQUFnQnJDLEtBQUtpRixLQUFMLENBQVcsTUFBTXRGLENBQWpCLElBQXNCLEdBQXRDLEdBQTRDLEdBQTVELENBUFk7RUFRWixnQkFBSXlHLFNBQVNOLE1BQU1NLE1BQU4sRUFBYjtFQUNBLGdCQUFJTCxVQUFVLEtBQUt4QixPQUFMLENBQWF3QixPQUEzQjtFQUNBRCxrQkFBTU8sYUFBTixDQUFvQixVQUFVNUIsUUFBVixFQUFvQjtFQUNwQyxxQkFBSyxJQUFJNkIsSUFBSSxDQUFSLEVBQVd2RixJQUFJZ0YsUUFBUWhHLE1BQTVCLEVBQW9DdUcsSUFBSXZGLENBQXhDLEVBQTJDLEVBQUV1RixDQUE3QyxFQUFnRDtFQUM1Qyx3QkFBSVAsUUFBUU8sQ0FBUixFQUFXQyxRQUFYLENBQW9COUIsUUFBcEIsQ0FBSixFQUFtQztFQUMvQmhFLDRCQUFJNkIsUUFBSixDQUFhOEQsT0FBT2xCLE9BQVAsQ0FBZTFGLENBQTVCLEVBQStCNEcsT0FBT2xCLE9BQVAsQ0FBZXpGLENBQTlDLEVBQWlEMkcsT0FBT2pCLFdBQVAsQ0FBbUIzRixDQUFuQixHQUF1QjRHLE9BQU9sQixPQUFQLENBQWUxRixDQUF2RixFQUEwRjRHLE9BQU9qQixXQUFQLENBQW1CMUYsQ0FBbkIsR0FBdUIyRyxPQUFPbEIsT0FBUCxDQUFlekYsQ0FBaEk7RUFDQTtFQUNIO0VBQ0o7RUFDRHNHLHdCQUFRUyxPQUFSLENBQWdCLFVBQVVDLE1BQVYsRUFBa0I7RUFDOUJBLDJCQUFPQyxJQUFQLENBQVlqRyxHQUFaLEVBQWlCZ0UsUUFBakIsRUFBMkIyQixNQUEzQjtFQUNILGlCQUZEO0VBR0gsYUFWRDtFQVdBO0VBQ0FMLG9CQUFRUyxPQUFSLENBQWdCLFVBQVVDLE1BQVYsRUFBa0I7RUFDOUIsb0JBQUk5QixVQUFVOEIsT0FBTzlCLE9BQVAsS0FBbUJnQyxTQUFuQixHQUErQixHQUEvQixHQUFxQ0YsT0FBTzlCLE9BQTFEO0VBQ0FBLDJCQUFXbUIsTUFBTW5CLE9BQWpCO0VBQ0FsRSxvQkFBSTRCLFNBQUosR0FBZ0IsaUJBQWlCLElBQUlzQyxPQUFyQixJQUFnQyxHQUFoRDtFQUNBbEUsb0JBQUltRyxTQUFKO0VBQ0FILHVCQUFPakcsSUFBUCxDQUFZQyxHQUFaO0VBQ0FBLG9CQUFJb0csSUFBSjtFQUNILGFBUEQ7RUFRQVgsc0JBQVVsQixTQUFWLENBQW9CRixFQUFFeEQsTUFBdEIsRUFBOEIsQ0FBOUIsRUFBaUMsQ0FBakM7RUFDSDs7O2tDQUVPSCxHQUFHQyxHQUFHO0VBQ1YsZ0JBQUksQ0FBQyxLQUFLNEUsTUFBTixJQUFnQixLQUFLQSxNQUFMLENBQVk3RSxDQUFaLElBQWlCQSxDQUFqQyxJQUFzQyxLQUFLNkUsTUFBTCxDQUFZNUUsQ0FBWixJQUFpQkEsQ0FBM0QsRUFDSSxLQUFLMEYsV0FBTCxDQUFpQjNGLENBQWpCLEVBQW9CQyxDQUFwQjtFQUNKLGdCQUFJWCxNQUFNLEtBQUt1RixNQUFMLENBQVl2RixHQUF0QjtFQUNBLGdCQUFJcUYsUUFBUSxLQUFLdkIsT0FBTCxDQUFhdUIsS0FBekI7RUFDQXJGLGdCQUFJc0csSUFBSjtFQUNBdEcsZ0JBQUl3QixTQUFKLENBQWMsQ0FBZCxFQUFpQixDQUFqQixFQUFvQnhCLElBQUlhLE1BQUosQ0FBV0ksS0FBL0IsRUFBc0NqQixJQUFJYSxNQUFKLENBQVdLLE1BQWpEOztFQUVBbUUsa0JBQU1rQixNQUFOLENBQWF2RyxHQUFiO0VBQ0FBLGdCQUFJd0csd0JBQUosR0FBK0IsaUJBQS9CO0VBQ0EsaUJBQUtQLElBQUwsQ0FBVWpHLEdBQVY7RUFDQUEsZ0JBQUl5RyxPQUFKO0VBQ0g7OztpQ0FFTXpHLEtBQUs7RUFDUkEsZ0JBQUl1RSxTQUFKLENBQWMsS0FBS2dCLE1BQUwsQ0FBWTFFLE1BQTFCLEVBQWtDLENBQWxDLEVBQXFDLENBQXJDO0VBQ0g7OztzQ0FFVztFQUNSLG1CQUFPLEtBQUswRSxNQUFMLENBQVkxRSxNQUFuQjtFQUNIOzs7OztNQ25FQzZGOzs7RUFDRixrQkFBWTVDLE9BQVosRUFBcUI7RUFBQTs7RUFBQTs7RUFFakIsWUFBTUMsY0FBVztFQUNidEQsZ0JBQUksQ0FEUztFQUViaUIsbUJBQU8sdUJBRk07RUFHYlEsb0JBQVEsQ0FISztFQUlid0QscUJBQVMsQ0FKSTtFQUtiaUIsbUJBQU8sQ0FMTTtFQU1iQyx1QkFBVztFQU5FLFNBQWpCO0VBUUEsY0FBSzlDLE9BQUwsR0FBZUssT0FBT0MsTUFBUCxDQUFjTCxXQUFkLEVBQXdCLE1BQUtELE9BQTdCLENBQWY7RUFDQSxjQUFLQSxPQUFMLEdBQWVLLE9BQU9DLE1BQVAsQ0FBYyxNQUFLTixPQUFuQixFQUE0QkEsT0FBNUIsQ0FBZjtFQVhpQjtFQVlwQjs7OzswQ0FFZTtFQUNaLG1CQUFPLENBQ0gsS0FBS0EsT0FBTCxDQUFhcEMsS0FEVixFQUVILEtBQUtvQyxPQUFMLENBQWFHLFFBRlYsRUFHSCxLQUFLSCxPQUFMLENBQWFJLE9BSFYsRUFJSCxLQUFLSixPQUFMLENBQWE2QyxLQUpWLEVBS0gsS0FBSzdDLE9BQUwsQ0FBYThDLFNBTFYsRUFNSCxLQUFLOUMsT0FBTCxDQUFhNEIsT0FOVixFQU9ILEtBQUs1QixPQUFMLENBQWE1QixNQVBWLEVBUUxpRCxRQVJLLEVBQVA7RUFTSDs7O21DQUVRO0VBQ0wsbUJBQU8sSUFBSXJHLElBQUosQ0FDSCxDQUFDLElBQUlTLEtBQUsyRCxHQUFMLENBQVMsS0FBS1ksT0FBTCxDQUFhNkMsS0FBdEIsSUFBK0IsS0FBSzdDLE9BQUwsQ0FBYThDLFNBQWpELElBQThELEtBQUs5QyxPQUFMLENBQWFHLFFBRHhFLEVBRUgsQ0FBQyxJQUFJMUUsS0FBSzZELEdBQUwsQ0FBUyxLQUFLVSxPQUFMLENBQWE2QyxLQUF0QixJQUErQixLQUFLN0MsT0FBTCxDQUFhOEMsU0FBakQsSUFBOEQsS0FBSzlDLE9BQUwsQ0FBYUcsUUFGeEUsQ0FBUDtFQUlIOzs7bUNBRVE7RUFDTCxnQkFBSTRDLG9CQUFvQixJQUFJL0gsSUFBSixDQUNwQlMsS0FBSzJELEdBQUwsQ0FBUyxLQUFLWSxPQUFMLENBQWE2QyxLQUF0QixDQURvQixFQUNVLENBQUNwSCxLQUFLNkQsR0FBTCxDQUFTLEtBQUtVLE9BQUwsQ0FBYTZDLEtBQXRCLENBRFgsRUFFdEJ4SCxHQUZzQixDQUVsQixLQUFLMkUsT0FBTCxDQUFhOEMsU0FBYixHQUF5QixLQUFLOUMsT0FBTCxDQUFhRyxRQUZwQixDQUF4QjtFQUdBLG1CQUFPO0VBQ0hRLHlCQUFTLElBQUkzRixJQUFKLENBQ0wsS0FBS2dGLE9BQUwsQ0FBYUUsUUFBYixDQUFzQmpGLENBQXRCLEdBQTBCOEgsa0JBQWtCOUgsQ0FBNUMsR0FBZ0QsS0FBSytFLE9BQUwsQ0FBYUcsUUFEeEQsRUFFTCxLQUFLSCxPQUFMLENBQWFFLFFBQWIsQ0FBc0JoRixDQUF0QixHQUEwQjZILGtCQUFrQjdILENBQTVDLEdBQWdELEtBQUs4RSxPQUFMLENBQWFHLFFBRnhELENBRE47RUFLSFMsNkJBQWEsSUFBSTVGLElBQUosQ0FDVCxLQUFLZ0YsT0FBTCxDQUFhRSxRQUFiLENBQXNCakYsQ0FBdEIsR0FBMEI4SCxrQkFBa0I5SCxDQUE1QyxHQUFnRCxLQUFLK0UsT0FBTCxDQUFhRyxRQURwRCxFQUVULEtBQUtILE9BQUwsQ0FBYUUsUUFBYixDQUFzQmhGLENBQXRCLEdBQTBCNkgsa0JBQWtCN0gsQ0FBNUMsR0FBZ0QsS0FBSzhFLE9BQUwsQ0FBYUcsUUFGcEQ7RUFMVixhQUFQO0VBVUg7OzsrQkFFSWpFLEtBQUs7RUFDTixnQkFBSXFFLElBQUksS0FBS0Msb0JBQUwsRUFBUjtFQUNBLGdCQUFJdUMsb0JBQW9CLElBQUkvSCxJQUFKLENBQ3BCUyxLQUFLMkQsR0FBTCxDQUFTLEtBQUtZLE9BQUwsQ0FBYTZDLEtBQXRCLENBRG9CLEVBQ1UsQ0FBQ3BILEtBQUs2RCxHQUFMLENBQVMsS0FBS1UsT0FBTCxDQUFhNkMsS0FBdEIsQ0FEWCxFQUV0QnhILEdBRnNCLENBRWxCLEtBQUsyRSxPQUFMLENBQWE4QyxTQUFiLEdBQXlCLEtBQUs5QyxPQUFMLENBQWFHLFFBRnBCLENBQXhCO0VBR0FqRSxnQkFBSXVFLFNBQUosQ0FDSUYsRUFBRXhELE1BRE4sRUFDY3RCLEtBQUtpRixLQUFMLENBQVcsS0FBS1YsT0FBTCxDQUFhRSxRQUFiLENBQXNCakYsQ0FBdEIsR0FBMEI4SCxrQkFBa0I5SCxDQUE1QyxHQUFnRHNGLEVBQUUzRCxDQUFGLEdBQU0sQ0FBakUsQ0FEZCxFQUVJbkIsS0FBS2lGLEtBQUwsQ0FBVyxLQUFLVixPQUFMLENBQWFFLFFBQWIsQ0FBc0JoRixDQUF0QixHQUEwQjZILGtCQUFrQjdILENBQTVDLEdBQWdEcUYsRUFBRTFELENBQUYsR0FBTSxDQUFqRSxDQUZKO0VBSUg7Ozs0Q0FFaUJ3QixRQUFRO0VBQ3RCLGdCQUFJMkUsV0FBVyxLQUFLQyxhQUFMLEVBQWY7RUFDQSxnQkFBSSxLQUFLQyxjQUFMLElBQXVCRixRQUEzQixFQUFxQztFQUNqQyx1QkFBTyxLQUFLRyxPQUFaO0VBQ0g7RUFDRCxpQkFBS0QsY0FBTCxHQUFzQkYsUUFBdEI7RUFDQSxnQkFBSWhGLElBQUl2QyxLQUFLaUYsS0FBTCxDQUFXLEtBQUtWLE9BQUwsQ0FBYUcsUUFBeEIsQ0FBUjtFQUNBLGdCQUFJaUQsSUFBSXBGLElBQUksQ0FBWjtFQUNBLGdCQUFJcUYsUUFBUTNHLHlCQUF5QixPQUFPLEtBQUtDLEVBQXJDLEVBQXlDeUcsQ0FBekMsRUFBNENBLENBQTVDLENBQVo7RUFDQSxnQkFBSWxDLElBQUltQyxNQUFNbkgsR0FBTixDQUFVaUYsb0JBQVYsQ0FBK0I5QyxPQUFPcEQsQ0FBdEMsRUFBeUNvRCxPQUFPbkQsQ0FBaEQsRUFBbUQsQ0FBbkQsRUFBc0Q4QyxDQUF0RCxFQUF5REEsQ0FBekQsRUFBNERBLENBQTVELENBQVI7RUFDQWtELGNBQUVFLFlBQUYsQ0FBZTNGLEtBQUs2SCxHQUFMLENBQVMsQ0FBVCxFQUFZLEtBQUt0RCxPQUFMLENBQWE1QixNQUFiLEdBQXNCLEtBQUs0QixPQUFMLENBQWFHLFFBQS9DLENBQWYsRUFBeUUsS0FBS0gsT0FBTCxDQUFhcEMsS0FBdEY7RUFDQXNELGNBQUVFLFlBQUYsQ0FBZSxDQUFmLEVBQWtCekQsUUFBUSxLQUFLcUMsT0FBTCxDQUFhcEMsS0FBckIsRUFBNEIsQ0FBNUIsQ0FBbEI7RUFDQXlGLGtCQUFNbkgsR0FBTixDQUFVNEIsU0FBVixHQUFzQm9ELENBQXRCO0VBQ0FtQyxrQkFBTW5ILEdBQU4sQ0FBVTZCLFFBQVYsQ0FBbUIsQ0FBbkIsRUFBc0IsQ0FBdEIsRUFBeUJzRixNQUFNekcsQ0FBL0IsRUFBa0N5RyxNQUFNeEcsQ0FBeEM7RUFDQSxtQkFBTyxLQUFLc0csT0FBTCxHQUFlRSxLQUF0QjtFQUNIOzs7aUNBRU1uSCxLQUFLO0VBQ1IsZ0JBQUltQyxTQUFTLEtBQUtBLE1BQUwsRUFBYjtFQUNBLGdCQUFJa0MsSUFBSSxLQUFLZ0QsaUJBQUwsQ0FBdUJsRixNQUF2QixDQUFSO0VBQ0FuQyxnQkFBSXVFLFNBQUosQ0FDSUYsRUFBRXhELE1BRE4sRUFFSXRCLEtBQUtpRixLQUFMLENBQVcsS0FBS1YsT0FBTCxDQUFhRSxRQUFiLENBQXNCakYsQ0FBdEIsR0FBMEJvRCxPQUFPcEQsQ0FBNUMsQ0FGSixFQUdJUSxLQUFLaUYsS0FBTCxDQUFXLEtBQUtWLE9BQUwsQ0FBYUUsUUFBYixDQUFzQmhGLENBQXRCLEdBQTBCbUQsT0FBT25ELENBQTVDLENBSEo7RUFLSDs7O0lBdEZjNkU7O01DRmJ5RDtFQUNGLDBCQUFZeEQsT0FBWixFQUFxQjtFQUFBOztFQUNqQixZQUFNQyxjQUFXO0VBQ2JHLHFCQUFTO0VBREksU0FBakI7RUFHQSxhQUFLSixPQUFMLEdBQWVLLE9BQU9DLE1BQVAsQ0FBY0wsV0FBZCxFQUF3QkQsT0FBeEIsQ0FBZjtFQUNBLGFBQUt5RCxRQUFMLEdBQWdCLENBQWhCO0VBQ0g7Ozs7aUNBRU07OztpQ0FFQTs7O21DQUVFO0VBQ0wsbUJBQU87RUFDSDlDLHlCQUFTLElBQUkzRixJQUFKLEVBRE47RUFFSDRGLDZCQUFhLElBQUk1RixJQUFKO0VBRlYsYUFBUDtFQUlIOzs7cUNBRVU7RUFDUCxtQkFBTyxLQUFQO0VBQ0g7Ozs7O01DcEJDMEk7OztFQUNGLHdCQUFZMUQsT0FBWixFQUFxQjtFQUFBOztFQUFBOztFQUVqQixZQUFNQyxjQUFXO0VBQ2I1QixvQkFBUSxJQUFJckQsSUFBSixFQURLO0VBRWJvRCxvQkFBUTtFQUZLLFNBQWpCO0VBSUEsY0FBSzRCLE9BQUwsR0FBZUssT0FBT0MsTUFBUCxDQUFjTCxXQUFkLEVBQXdCLE1BQUtELE9BQTdCLENBQWY7RUFDQSxjQUFLQSxPQUFMLEdBQWVLLE9BQU9DLE1BQVAsQ0FBYyxNQUFLTixPQUFuQixFQUE0QkEsT0FBNUIsQ0FBZjtFQVBpQjtFQVFwQjs7OzsrQkFDSTlELEtBQUt5SCxRQUFROUIsUUFBUTtFQUN0QixnQkFBSStCLElBQUksS0FBSzVELE9BQUwsQ0FBYTNCLE1BQXJCO0VBQ0EsZ0JBQUl3RixZQUFZRCxFQUFFRSxHQUFGLENBQU1ILE1BQU4sQ0FBaEI7RUFDQSxnQkFBSUksZUFBZTVGLFFBQVEsS0FBSzZCLE9BQUwsQ0FBYTVCLE1BQXJCLEVBQTZCeUYsU0FBN0IsQ0FBbkI7RUFDQSxnQkFBSUcsWUFBWUQsYUFBYSxDQUFiLENBQWhCO0VBQ0EsZ0JBQUlFLFlBQVlGLGFBQWEsQ0FBYixDQUFoQjtFQUNBLGdCQUFJbkYsSUFBSW9GLFVBQVVFLEdBQVYsQ0FBY1AsTUFBZCxDQUFSO0VBQ0EsZ0JBQUlRLElBQUlGLFVBQVVDLEdBQVYsQ0FBY1AsTUFBZCxDQUFSO0VBQ0E7RUFDQSxnQkFBSXhELFdBQVcsQ0FBRTBCLE9BQU9qQixXQUFQLENBQW1CM0YsQ0FBbkIsR0FBdUI0RyxPQUFPbEIsT0FBUCxDQUFlMUYsQ0FBdkMsSUFBNkM0RyxPQUFPakIsV0FBUCxDQUFtQjFGLENBQW5CLEdBQXVCMkcsT0FBT2xCLE9BQVAsQ0FBZXpGLENBQW5GLENBQUQsSUFBMEYsQ0FBekc7RUFDQTJJLHdCQUFZQSxVQUFVTyxTQUFWLEdBQXNCL0ksR0FBdEIsQ0FBMEI4RSxRQUExQixDQUFaO0VBQ0E2RCx3QkFBWUEsVUFBVUksU0FBVixHQUFzQi9JLEdBQXRCLENBQTBCOEUsUUFBMUIsQ0FBWjtFQUNBOEQsd0JBQVlBLFVBQVVHLFNBQVYsR0FBc0IvSSxHQUF0QixDQUEwQjhFLFFBQTFCLENBQVo7RUFDQTtFQUNBLGdCQUFJa0UsTUFBTXpGLEVBQUVzRixHQUFGLENBQU1MLFNBQU4sQ0FBVjtFQUNBLGdCQUFJUyxNQUFNSCxFQUFFRCxHQUFGLENBQU1MLFNBQU4sQ0FBVjtFQUNBLGdCQUFJVSxLQUFLM0YsRUFBRXNGLEdBQUYsQ0FBTUYsU0FBTixDQUFUO0VBQ0EsZ0JBQUlRLEtBQUtMLEVBQUVELEdBQUYsQ0FBTUQsU0FBTixDQUFUO0VBQ0EsZ0JBQUlRLFFBQVFoSixLQUFLaUosS0FBTCxDQUFXYixVQUFVNUksQ0FBckIsRUFBd0IsQ0FBQzRJLFVBQVUzSSxDQUFuQyxDQUFaO0VBQ0FnQixnQkFBSW1HLFNBQUo7RUFDQXBHLGlCQUFLQyxHQUFMLEVBQVUsQ0FBQ2lJLENBQUQsRUFBSUssRUFBSixFQUFRRixHQUFSLEVBQWFELEdBQWIsRUFBa0JFLEVBQWxCLEVBQXNCM0YsQ0FBdEIsQ0FBVixFQUFvQyxJQUFwQztFQUNBMUMsZ0JBQUl5SSxHQUFKLENBQVFmLEVBQUUzSSxDQUFWLEVBQWEySSxFQUFFMUksQ0FBZixFQUFrQixLQUFLOEUsT0FBTCxDQUFhNUIsTUFBL0IsRUFBdUNxRyxLQUF2QyxFQUE4Q0EsUUFBUWhKLEtBQUtNLEVBQTNEO0VBQ0FHLGdCQUFJb0csSUFBSjtFQUNIOzs7a0NBQ0lwRyxLQUFLO0VBQ05BLGdCQUFJeUksR0FBSixDQUFRLEtBQUszRSxPQUFMLENBQWEzQixNQUFiLENBQW9CcEQsQ0FBNUIsRUFBK0IsS0FBSytFLE9BQUwsQ0FBYTNCLE1BQWIsQ0FBb0JuRCxDQUFuRCxFQUFzRCxLQUFLOEUsT0FBTCxDQUFhNUIsTUFBbkUsRUFBMkUsQ0FBM0UsRUFBOEVwQyxJQUE5RTtFQUNIOzs7bUNBQ1E7RUFDTCxtQkFBTztFQUNIMkUseUJBQVMsSUFBSTNGLElBQUosQ0FBUyxLQUFLZ0YsT0FBTCxDQUFhM0IsTUFBYixDQUFvQnBELENBQXBCLEdBQXdCLEtBQUsrRSxPQUFMLENBQWE1QixNQUE5QyxFQUFzRCxLQUFLNEIsT0FBTCxDQUFhM0IsTUFBYixDQUFvQm5ELENBQXBCLEdBQXdCLEtBQUs4RSxPQUFMLENBQWE1QixNQUEzRixDQUROO0VBRUh3Qyw2QkFBYSxJQUFJNUYsSUFBSixDQUFTLEtBQUtnRixPQUFMLENBQWEzQixNQUFiLENBQW9CcEQsQ0FBcEIsR0FBd0IsS0FBSytFLE9BQUwsQ0FBYTVCLE1BQTlDLEVBQXNELEtBQUs0QixPQUFMLENBQWEzQixNQUFiLENBQW9CbkQsQ0FBcEIsR0FBd0IsS0FBSzhFLE9BQUwsQ0FBYTVCLE1BQTNGO0VBRlYsYUFBUDtFQUlIOzs7bUNBQ1F3RyxPQUFPO0VBQ1osbUJBQU9BLE1BQU0vRSxLQUFOLENBQVksS0FBS0csT0FBTCxDQUFhM0IsTUFBekIsSUFBbUMsS0FBSzJCLE9BQUwsQ0FBYTVCLE1BQWIsR0FBc0IsS0FBSzRCLE9BQUwsQ0FBYTVCLE1BQTdFO0VBQ0g7OztJQTdDb0JvRjs7TUNBbkJxQjs7O0VBQ0YsMkJBQVk3RSxPQUFaLEVBQXFCO0VBQUE7O0VBQUE7O0VBRWpCLFlBQU1DLGNBQVc7RUFDYjlELG9CQUFRO0VBREssU0FBakI7RUFHQSxjQUFLNkQsT0FBTCxHQUFlSyxPQUFPQyxNQUFQLENBQWNMLFdBQWQsRUFBd0IsTUFBS0QsT0FBN0IsQ0FBZjtFQUNBLGNBQUtBLE9BQUwsR0FBZUssT0FBT0MsTUFBUCxDQUFjLE1BQUtOLE9BQW5CLEVBQTRCQSxPQUE1QixDQUFmO0VBTmlCO0VBT3BCOzs7O21DQUVRO0VBQ0wsZ0JBQUlXLFVBQVUsS0FBS1gsT0FBTCxDQUFhN0QsTUFBYixDQUFvQixDQUFwQixFQUF1QjJJLElBQXZCLEVBQWQ7RUFDQSxnQkFBSWxFLGNBQWNELFFBQVFtRSxJQUFSLEVBQWxCO0VBQ0EsaUJBQUssSUFBSXpJLElBQUksQ0FBUixFQUFXRyxJQUFJLEtBQUt3RCxPQUFMLENBQWE3RCxNQUFiLENBQW9CWCxNQUF4QyxFQUFnRGEsSUFBSUcsQ0FBcEQsRUFBdUQsRUFBRUgsQ0FBekQsRUFBNEQ7RUFDeEQsb0JBQUl1SSxRQUFRLEtBQUs1RSxPQUFMLENBQWE3RCxNQUFiLENBQW9CRSxDQUFwQixDQUFaO0VBQ0Esb0JBQUl1SSxNQUFNM0osQ0FBTixHQUFVMkYsWUFBWTNGLENBQTFCLEVBQ0kyRixZQUFZM0YsQ0FBWixHQUFnQjJKLE1BQU0zSixDQUF0QjtFQUNKLG9CQUFJMkosTUFBTTFKLENBQU4sR0FBVTBGLFlBQVkxRixDQUExQixFQUNJMEYsWUFBWTFGLENBQVosR0FBZ0IwSixNQUFNMUosQ0FBdEI7RUFDSixvQkFBSTBKLE1BQU0zSixDQUFOLEdBQVUwRixRQUFRMUYsQ0FBdEIsRUFDSTBGLFFBQVExRixDQUFSLEdBQVkySixNQUFNM0osQ0FBbEI7RUFDSixvQkFBSTJKLE1BQU0xSixDQUFOLEdBQVV5RixRQUFRekYsQ0FBdEIsRUFDSXlGLFFBQVF6RixDQUFSLEdBQVkwSixNQUFNMUosQ0FBbEI7RUFDUDtFQUNELG1CQUFPO0VBQ0h5Rix5QkFBU0EsT0FETjtFQUVIQyw2QkFBYUE7RUFGVixhQUFQO0VBSUg7OzttQ0FFUXZFLEdBQUc7RUFDUixnQkFBSUYsU0FBUyxLQUFLNkQsT0FBTCxDQUFhN0QsTUFBMUI7RUFDQSxnQkFBSUksQ0FBSjtFQUFBLGdCQUFPQyxJQUFJTCxPQUFPWCxNQUFsQjtFQUFBLGdCQUNJdUosSUFBSXZJLElBQUksQ0FEWjtFQUVBLGdCQUFJdkIsSUFBSW9CLEVBQUVwQixDQUFWO0VBQUEsZ0JBQ0lDLElBQUltQixFQUFFbkIsQ0FEVjtFQUVBLGdCQUFJOEosV0FBVyxLQUFmOztFQUVBLGlCQUFLekksSUFBSSxDQUFULEVBQVlBLElBQUlDLENBQWhCLEVBQW1CRCxHQUFuQixFQUF3QjtFQUNwQixvQkFBSSxDQUFDSixPQUFPSSxDQUFQLEVBQVVyQixDQUFWLEdBQWNBLENBQWQsSUFBbUJpQixPQUFPNEksQ0FBUCxFQUFVN0osQ0FBVixJQUFlQSxDQUFsQyxJQUNHaUIsT0FBTzRJLENBQVAsRUFBVTdKLENBQVYsR0FBY0EsQ0FBZCxJQUFtQmlCLE9BQU9JLENBQVAsRUFBVXJCLENBQVYsSUFBZUEsQ0FEdEMsTUFFQ2lCLE9BQU9JLENBQVAsRUFBVXRCLENBQVYsSUFBZUEsQ0FBZixJQUFvQmtCLE9BQU80SSxDQUFQLEVBQVU5SixDQUFWLElBQWVBLENBRnBDLENBQUosRUFFNEM7RUFDeEMsd0JBQUlrQixPQUFPSSxDQUFQLEVBQVV0QixDQUFWLEdBQWMsQ0FBQ0MsSUFBSWlCLE9BQU9JLENBQVAsRUFBVXJCLENBQWYsS0FBcUJpQixPQUFPNEksQ0FBUCxFQUFVN0osQ0FBVixHQUFjaUIsT0FBT0ksQ0FBUCxFQUFVckIsQ0FBN0MsS0FBbURpQixPQUFPNEksQ0FBUCxFQUFVOUosQ0FBVixHQUFja0IsT0FBT0ksQ0FBUCxFQUFVdEIsQ0FBM0UsQ0FBZCxHQUE4RkEsQ0FBbEcsRUFBcUc7RUFDakcrSixtQ0FBVyxDQUFDQSxRQUFaO0VBQ0g7RUFDSjtFQUNERCxvQkFBSXhJLENBQUo7RUFDSDtFQUNELG1CQUFPeUksUUFBUDtFQUNIOzs7a0NBRUk5SSxLQUFLO0VBQ05ELGlCQUFLQyxHQUFMLEVBQVUsS0FBSzhELE9BQUwsQ0FBYTdELE1BQXZCO0VBQ0g7OzsrQkFFSUQsS0FBS3lILFFBQVE5QixRQUFRO0VBQ3RCO0VBQ0EsZ0JBQUkxQixXQUFXLENBQUUwQixPQUFPakIsV0FBUCxDQUFtQjNGLENBQW5CLEdBQXVCNEcsT0FBT2xCLE9BQVAsQ0FBZTFGLENBQXZDLElBQTZDNEcsT0FBT2pCLFdBQVAsQ0FBbUIxRixDQUFuQixHQUF1QjJHLE9BQU9sQixPQUFQLENBQWV6RixDQUFuRixDQUFELElBQTBGLENBQXpHO0VBQ0EsaUJBQUsrSixvQkFBTCxDQUEwQnRCLE1BQTFCLEVBQWtDOUIsTUFBbEMsRUFBMEMsVUFBVWpELENBQVYsRUFBYXVGLENBQWIsRUFBZ0JILFNBQWhCLEVBQTJCQyxTQUEzQixFQUFzQ2lCLElBQXRDLEVBQTRDO0VBQ2xGLG9CQUFJdEIsQ0FBSixDQURrRjtFQUVsRixvQkFBSXVCLElBQUluQixVQUFVb0IsR0FBVixHQUFnQkMsR0FBaEIsQ0FBb0JILElBQXBCLElBQTRCQSxLQUFLdkosT0FBTCxFQUFwQztFQUNBLG9CQUFJd0osSUFBSSxDQUFSLEVBQ0l2QixJQUFJaEYsQ0FBSixDQURKLEtBRUssSUFBSXVHLElBQUksQ0FBUixFQUNEdkIsSUFBSU8sQ0FBSixDQURDLEtBR0RQLElBQUloRixFQUFFc0YsR0FBRixDQUFNZ0IsS0FBSzdKLEdBQUwsQ0FBUzhKLENBQVQsQ0FBTixDQUFKO0VBQ0osb0JBQUl0QixZQUFZRCxFQUFFRSxHQUFGLENBQU1ILE1BQU4sQ0FBaEI7RUFDQTtFQUNBRSw0QkFBWUEsVUFBVU8sU0FBVixHQUFzQi9JLEdBQXRCLENBQTBCOEUsUUFBMUIsQ0FBWjtFQUNBNkQsNEJBQVlBLFVBQVVJLFNBQVYsR0FBc0IvSSxHQUF0QixDQUEwQjhFLFFBQTFCLENBQVo7RUFDQThELDRCQUFZQSxVQUFVRyxTQUFWLEdBQXNCL0ksR0FBdEIsQ0FBMEI4RSxRQUExQixDQUFaO0VBQ0E7RUFDQSxvQkFBSWtFLE1BQU16RixFQUFFc0YsR0FBRixDQUFNTCxTQUFOLENBQVY7RUFDQSxvQkFBSVMsTUFBTUgsRUFBRUQsR0FBRixDQUFNTCxTQUFOLENBQVY7RUFDQSxvQkFBSVUsS0FBSzNGLEVBQUVzRixHQUFGLENBQU1GLFNBQU4sQ0FBVDtFQUNBLG9CQUFJUSxLQUFLTCxFQUFFRCxHQUFGLENBQU1ELFNBQU4sQ0FBVDtFQUNBL0gsb0JBQUltRyxTQUFKO0VBQ0FwRyxxQkFBS0MsR0FBTCxFQUFVLENBQUMwQyxDQUFELEVBQUl1RixDQUFKLEVBQU9LLEVBQVAsRUFBV0YsR0FBWCxFQUFnQkQsR0FBaEIsRUFBcUJFLEVBQXJCLENBQVY7RUFDQXJJLG9CQUFJb0csSUFBSjtFQUNILGFBdEJEO0VBdUJIOzs7K0NBRW9CcUIsUUFBUTlCLFFBQVFoQixHQUFHO0VBQ3BDLGdCQUFJakMsSUFBSSxLQUFLb0IsT0FBTCxDQUFhN0QsTUFBYixDQUFvQixLQUFLNkQsT0FBTCxDQUFhN0QsTUFBYixDQUFvQlgsTUFBcEIsR0FBNkIsQ0FBakQsQ0FBUjtFQUFBLGdCQUNJMkksQ0FESjtFQUVBLGlCQUFLLElBQUk5SCxJQUFJLENBQVIsRUFBV0csSUFBSSxLQUFLd0QsT0FBTCxDQUFhN0QsTUFBYixDQUFvQlgsTUFBeEMsRUFBZ0RhLElBQUlHLENBQXBELEVBQXVELEVBQUVILENBQUYsRUFBS3VDLElBQUl1RixDQUFoRSxFQUFtRTtFQUMvREEsb0JBQUksS0FBS25FLE9BQUwsQ0FBYTdELE1BQWIsQ0FBb0JFLENBQXBCLENBQUo7RUFDQSxvQkFBSXVDLEVBQUUwRyxPQUFGLENBQVV6RCxPQUFPbEIsT0FBakIsRUFBMEJrQixPQUFPakIsV0FBakMsQ0FBSixFQUFtRDtFQUMvQyx3QkFBSW9ELFlBQVlwRixFQUFFa0YsR0FBRixDQUFNSCxNQUFOLENBQWhCO0VBQ0Esd0JBQUlNLFlBQVlFLEVBQUVMLEdBQUYsQ0FBTUgsTUFBTixDQUFoQjtFQUNBLHdCQUFJdUIsT0FBT2YsRUFBRUwsR0FBRixDQUFNbEYsQ0FBTixDQUFYO0VBQ0Esd0JBQUkyRyxTQUFTLElBQUl2SyxJQUFKLENBQVNrSyxLQUFLaEssQ0FBZCxFQUFpQixDQUFDZ0ssS0FBS2pLLENBQXZCLENBQWI7RUFDQSx3QkFBSXNLLE9BQU9GLEdBQVAsQ0FBV3JCLFNBQVgsSUFBd0IsQ0FBNUIsRUFBK0I7RUFDM0JuRCwwQkFBRWpDLENBQUYsRUFBS3VGLENBQUwsRUFBUUgsU0FBUixFQUFtQkMsU0FBbkIsRUFBOEJpQixJQUE5QjtFQUNIO0VBQ0o7RUFDSjtFQUNKOzs7SUFsR3VCMUI7O01DRHRCZ0M7OztFQUNGLDZCQUFZeEYsT0FBWixFQUFxQjtFQUFBOztFQUFBLHFJQUNYQSxPQURXOztFQUVqQixZQUFNQyxjQUFXO0VBQ2JVLHFCQUFTLElBQUkzRixJQUFKLEVBREk7RUFFYjRGLHlCQUFhLElBQUk1RixJQUFKO0VBRkEsU0FBakI7RUFJQSxjQUFLZ0YsT0FBTCxHQUFlSyxPQUFPQyxNQUFQLENBQWNMLFdBQWQsRUFBd0IsTUFBS0QsT0FBN0IsQ0FBZjtFQUNBLGNBQUtBLE9BQUwsR0FBZUssT0FBT0MsTUFBUCxDQUFjLE1BQUtOLE9BQW5CLEVBQTRCQSxPQUE1QixDQUFmO0VBQ0EsY0FBS3lGLDBCQUFMO0VBUmlCO0VBU3BCOzs7O3VEQUM0QjtFQUN6QixnQkFBSTdHLElBQUksS0FBS29CLE9BQUwsQ0FBYVcsT0FBckI7RUFDQSxnQkFBSXdELElBQUksSUFBSW5KLElBQUosQ0FBUyxLQUFLZ0YsT0FBTCxDQUFhWSxXQUFiLENBQXlCM0YsQ0FBbEMsRUFBcUMsS0FBSytFLE9BQUwsQ0FBYVcsT0FBYixDQUFxQnpGLENBQTFELENBQVI7RUFDQSxnQkFBSXFGLElBQUksS0FBS1AsT0FBTCxDQUFhWSxXQUFyQjtFQUNBLGdCQUFJNUMsSUFBSSxJQUFJaEQsSUFBSixDQUFTLEtBQUtnRixPQUFMLENBQWFXLE9BQWIsQ0FBcUIxRixDQUE5QixFQUFpQyxLQUFLK0UsT0FBTCxDQUFhWSxXQUFiLENBQXlCMUYsQ0FBMUQsQ0FBUjtFQUNBLGlCQUFLOEUsT0FBTCxDQUFhN0QsTUFBYixHQUFzQixDQUFDeUMsQ0FBRCxFQUFJdUYsQ0FBSixFQUFPNUQsQ0FBUCxFQUFVdkMsQ0FBVixDQUF0QjtFQUNIOzs7K0JBQ0k5QixLQUFLO0VBQ04sZ0JBQUlqQixJQUFJLEtBQUsrRSxPQUFMLENBQWE3RCxNQUFiLENBQW9CLENBQXBCLEVBQXVCbEIsQ0FBL0I7RUFBQSxnQkFBa0NDLElBQUksS0FBSzhFLE9BQUwsQ0FBYTdELE1BQWIsQ0FBb0IsQ0FBcEIsRUFBdUJqQixDQUE3RDtFQUNBZ0IsZ0JBQUl3SixJQUFKLENBQVN6SyxDQUFULEVBQVlDLENBQVosRUFBZSxLQUFLOEUsT0FBTCxDQUFhN0QsTUFBYixDQUFvQixDQUFwQixFQUF1QmxCLENBQXZCLEdBQTJCQSxDQUExQyxFQUE2QyxLQUFLK0UsT0FBTCxDQUFhN0QsTUFBYixDQUFvQixDQUFwQixFQUF1QmpCLENBQXZCLEdBQTJCQSxDQUF4RTtFQUNIOzs7SUFyQnlCMko7O01DQXhCYzs7O0VBQ0Ysd0JBQVkzRixPQUFaLEVBQXFCO0VBQUE7O0VBQUEsMkhBQ1hBLE9BRFc7O0VBRWpCLFlBQU1DLGNBQVc7RUFDYnJCLGVBQUcsSUFBSTVELElBQUosRUFEVTtFQUVibUosZUFBRyxJQUFJbkosSUFBSjtFQUZVLFNBQWpCO0VBSUEsY0FBS2dGLE9BQUwsR0FBZUssT0FBT0MsTUFBUCxDQUFjTCxXQUFkLEVBQXdCLE1BQUtELE9BQTdCLENBQWY7RUFDQSxjQUFLQSxPQUFMLEdBQWVLLE9BQU9DLE1BQVAsQ0FBYyxNQUFLTixPQUFuQixFQUE0QkEsT0FBNUIsQ0FBZjs7RUFFQSxjQUFLNEYsVUFBTDtFQVRpQjtFQVVwQjs7Ozt1Q0FFWTtFQUNULGlCQUFLNUYsT0FBTCxDQUFhN0QsTUFBYixHQUFzQixDQUFDLEtBQUs2RCxPQUFMLENBQWFwQixDQUFkLEVBQWlCLEtBQUtvQixPQUFMLENBQWFtRSxDQUE5QixDQUF0QjtFQUNIOzs7SUFmb0JVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7In0=
