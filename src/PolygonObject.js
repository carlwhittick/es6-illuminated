import Vec2 from './Vec2.js'
import { path } from './helpers.js'
import OpaqueObject from './OpaqueObject.js'

/**
 * An opaque polygon object
 */
class PolygonObject extends OpaqueObject {
    /**
     * Create a new PolygonObject instance.
     * @param {Object} options Options to be applied to the PolygonObject
     */
    constructor(options) {
        super()
        const defaults = {
            /**
             * An array of Vec2 points that
             * define the polygon.
             * @property points
             * @type Array
             * @default []
             */
            points: []
        }
        this.options = Object.assign(defaults, this.options)
        this.options = Object.assign(this.options, options)
    }

    /**
     * Calculate the boundaries of this polygon object.
     * @return {Object} An anonymous object with properties topleft and bottom right representing
     *                  the corners of the boundary.
     */
    bounds() {
        var topleft = this.options.points[0].copy()
        var bottomright = topleft.copy()
        for (var p = 1, l = this.options.points.length; p < l; ++p) {
            var point = this.options.points[p]
            if (point.x > bottomright.x)
                bottomright.x = point.x
            if (point.y > bottomright.y)
                bottomright.y = point.y
            if (point.x < topleft.x)
                topleft.x = point.x
            if (point.y < topleft.y)
                topleft.y = point.y
        }
        return {
            topleft: topleft,
            bottomright: bottomright
        }
    }

    /**
     * Determine if the given point is inside the polygon.
     * @param {Vec2} p The point to be checked.
     * @return {Boolean} True if the polygon object contains the given point.
     */
    contains(p) {
        var points = this.options.points
        var i, l = points.length,
            j = l - 1
        var x = p.x,
            y = p.y
        var oddNodes = false

        for (i = 0; i < l; i++) {
            if ((points[i].y < y && points[j].y >= y ||
                    points[j].y < y && points[i].y >= y) &&
                (points[i].x <= x || points[j].x <= x)) {
                if (points[i].x + (y - points[i].y) / (points[j].y - points[i].y) * (points[j].x - points[i].x) < x) {
                    oddNodes = !oddNodes
                }
            }
            j = i
        }
        return oddNodes
    }

    /**
     * Draw the path of the polygon onto the ctx.
     * @param {CanvasRenderContext2D} ctx The context onto which the path will be drawn.
     */
    path(ctx) {
        path(ctx, this.options.points)
    }

    /**
     * Fill provided context with the shadows projected by this polygon object from the origin
     * point, constrained by the given bounds.
     * @param {CanvasRenderContext2D} ctx The canvas context onto which the shadows will be cast.
     * @param {Vec2} origin A vector that represents the origin for the casted shadows.
     * @param {Object} bounds An anonymous object with properties topleft and bottom right representing
     *                        the corners of the boundary.
     */
    cast(ctx, origin, bounds) {
        // The current implementation of projection is a bit hacky... do you have a proper solution?
        var distance = ((bounds.bottomright.x - bounds.topleft.x) + (bounds.bottomright.y - bounds.topleft.y)) / 2
        this._forEachVisibleEdges(origin, bounds, function (a, b, originToA, originToB, aToB) {
            var m // m is the projected point of origin to [a, b]
            var t = originToA.inv().dot(aToB) / aToB.length2()
            if (t < 0)
                m = a
            else if (t > 1)
                m = b
            else
                m = a.add(aToB.mul(t))
            var originToM = m.sub(origin)
            // normalize to distance
            originToM = originToM.normalize().mul(distance)
            originToA = originToA.normalize().mul(distance)
            originToB = originToB.normalize().mul(distance)
            // project points
            var oam = a.add(originToM)
            var obm = b.add(originToM)
            var ap = a.add(originToA)
            var bp = b.add(originToB)
            ctx.beginPath()
            path(ctx, [a, b, bp, obm, oam, ap])
            ctx.fill()
        })
    }

    /**
     * Invoke a function for each of the visible edges in this polygon.
     * @param {Vec2} origin A vector that represents the origin for the casted shadows.
     * @param {Object} bounds An anonymous object with properties topleft and bottom right representing
     *                        the corners of the boundary.
     * @param {Function} f The function to be called.
     */
    _forEachVisibleEdges(origin, bounds, f) {
        var a = this.options.points[this.options.points.length - 1],
            b
        for (var p = 0, l = this.options.points.length; p < l; ++p, a = b) {
            b = this.options.points[p]
            if (a.inBound(bounds.topleft, bounds.bottomright)) {
                var originToA = a.sub(origin)
                var originToB = b.sub(origin)
                var aToB = b.sub(a)
                var normal = new Vec2(aToB.y, -aToB.x)
                if (normal.dot(originToA) < 0) {
                    f(a, b, originToA, originToB, aToB)
                }
            }
        }
    }
}

export default PolygonObject