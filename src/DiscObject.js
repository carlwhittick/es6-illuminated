import Vec2 from './Vec2.js'
import { getTan2, path, _2PI } from './helpers.js'
import OpaqueObject from './OpaqueObject.js'

/**
 * A circular, opaque object.
 */
class DiscObject extends OpaqueObject {
    /**
     * Create a new instance of DiscObject.
     * @param {Object} options Options to be applied to this disc object.
     */
    constructor(options) {
        super()
        const defaults = {
            /**
             * Position of the disc object.
             * @property center
             * @type Vec2
             * @default new Vec2()
             */
            center: new Vec2(),

            /**
             * Size of the disc object.
             * @property radius
             * @type Number
             * @default 20
             */
            radius: 20
        }
        this.options = Object.assign(defaults, this.options)
        this.options = Object.assign(this.options, options)
    }

    /**
     * Fill provided context with the shadows projected by this disc object from the origin
     * point, constrained by the given bounds.
     * @param {CanvasRenderContext2D} ctx The canvas context onto which the shadows will be cast.
     * @param {Vec2} origin A vector that represents the origin for the casted shadows.
     * @param {Object} bounds An anonymous object with properties topleft and bottom right representing
     *                        the corners of the boundary.
     */
    cast(ctx, origin, bounds) {
        var m = this.options.center
        var originToM = m.sub(origin)
        var tangentLines = getTan2(this.options.radius, originToM)
        var originToA = tangentLines[0]
        var originToB = tangentLines[1]
        var a = originToA.add(origin)
        var b = originToB.add(origin)
        // normalize to distance
        var distance = ((bounds.bottomright.x - bounds.topleft.x) + (bounds.bottomright.y - bounds.topleft.y)) / 2
        originToM = originToM.normalize().mul(distance)
        originToA = originToA.normalize().mul(distance)
        originToB = originToB.normalize().mul(distance)
        // project points
        var oam = a.add(originToM)
        var obm = b.add(originToM)
        var ap = a.add(originToA)
        var bp = b.add(originToB)
        var start = Math.atan2(originToM.x, -originToM.y)
        ctx.beginPath()
        path(ctx, [b, bp, obm, oam, ap, a], true)
        ctx.arc(m.x, m.y, this.options.radius, start, start + Math.PI)
        ctx.fill()
    }

    /**
     * Draw the path of the disc onto the ctx.
     * @param {CanvasRenderContext2D} ctx The context onto which the path will be drawn.
     */
    path(ctx) {
        ctx.arc(this.options.center.x, this.options.center.y, this.options.radius, 0, _2PI)
    }

    /**
     * Calculate the boundaries of this disc object.
     * @return {Object} An anonymous object with properties topleft and bottom right representing
     *                  the corners of the boundary.
     */
    bounds() {
        return {
            topleft: new Vec2(this.options.center.x - this.options.radius, this.options.center.y - this.options.radius),
            bottomright: new Vec2(this.options.center.x + this.options.radius, this.options.center.y + this.options.radius)
        }
    }

    /**
     * Determine if the given point is inside the disc.
     * @param {Vec2} point The point to be checked.
     * @return {Boolean} True if the disc object contains the given point.
     */
    contains(point) {
        return point.dist2(this.options.center) < this.options.radius * this.options.radius
    }
}

export default DiscObject