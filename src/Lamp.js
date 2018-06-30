import Vec2 from './Vec2'
import Light from './Light.js'
import { createCanvasAnd2dContext, getRGBA } from './helpers.js'

/**
 * A circular light rendered as a radial gradient.
 */
class Lamp extends Light {

    /**
     * Create new instance of Lamp
     * @param {Object} options Options to be applied to Lamp
     * @example
     * new Lamp({
     *     position: new Vec2(12, 34),
     *     distance: 100,
     *     diffuse: 0.8,
     *     color: 'rgba(250, 220, 150, 0.8)',
     *     radius: 0,
     *     samples: 1,
     *     angle: 0,
     *     roughness: 0
     * })
     */
    constructor(options) {
        super()
        const defaults = {
            /**
             * The id of this light object.
             * @property id
             * @type Number
             * @default 0
             */
            id: 0,

            /**
             * The color emitted by the lamp. The color can be specified in any CSS format.
             * @property color
             * @type String
             * @default 'rgba(250,220,150,0.8)'
             */
            color: 'rgba(250,220,150,0.8)',

            /**
             * The size of the lamp. Bigger lamps cast smoother shadows.
             * @property radius
             * @type Number
             * @default 0
             */
            radius: 0,

            /**
             * The number of points which will be used for shadow projection. It defines
             * the quality of the rendering.
             * @property samples
             * @type Number
             * @default 1
             */
            samples: 1,

            /**
             * The angle of the orientation of the lamp.
             * @property angle
             * @type Number
             * @default 0
             */
            angle: 0,

            /**
             * The roughness of the oriented effect.
             * @property roughness
             * @type Number
             * @default 0
             */
            roughness: 0
        }
        this.options = Object.assign(defaults, this.options)
        this.options = Object.assign(this.options, options)
    }

    /**
     * Generate a hash key representing this lamp.
     * @return {String} A hash key.
     */
    _getHashCache() {
        return [
            this.options.color,
            this.options.distance,
            this.options.diffuse,
            this.options.angle,
            this.options.roughness,
            this.options.samples,
            this.options.radius
        ].toString()
    }

    /**
     * Return the center of this lamp.
     * i.e. The position where the lamp intensity is the highest
     * @return {Vec2} A new vector that represents the center of this lamp.
     */
    center() {
        return new Vec2(
            (1 - Math.cos(this.options.angle) * this.options.roughness) * this.options.distance,
            (1 + Math.sin(this.options.angle) * this.options.roughness) * this.options.distance
        )
    }

    /**
     * Calculate the boundaries of this lamp based on its properties.
     * @return {Object} An anonymous object with the properties topleft and bottomright representing
     *                  the corners of the boundry.
     */
    bounds() {
        var orientationCenter = new Vec2(
            Math.cos(this.options.angle), -Math.sin(this.options.angle)
        ).mul(this.options.roughness * this.options.distance)
        return {
            topleft: new Vec2(
                this.options.position.x + orientationCenter.x - this.options.distance,
                this.options.position.y + orientationCenter.y - this.options.distance
            ),
            bottomright: new Vec2(
                this.options.position.x + orientationCenter.x + this.options.distance,
                this.options.position.y + orientationCenter.y + this.options.distance
            )
        }
    }

    /**
     * Render a mask representing the visibility. (Used by DarkMask.)
     * @param {CanvasRenderContext2D} ctx The canvas contect to render the mask on.
     */
    mask(ctx) {
        var c = this._getVisibleMaskCache()
        var orientationCenter = new Vec2(
            Math.cos(this.options.angle), -Math.sin(this.options.angle)
        ).mul(this.options.roughness * this.options.distance)
        ctx.drawImage(
            c.canvas, Math.round(this.options.position.x + orientationCenter.x - c.w / 2),
            Math.round(this.options.position.y + orientationCenter.y - c.h / 2)
        )
    }

    /**
     * Renders this lamp's gradient onto a cached canvas at the given position.
     * @param {Vec2} center The center position of the gradient to render.
     */
    _getGradientCache(center) {
        var hashcode = this._getHashCache()
        if (this._cacheHashcode == hashcode) {
            return this._gcache
        }
        this._cacheHashcode = hashcode
        var d = Math.round(this.options.distance)
        var D = d * 2
        var cache = createCanvasAnd2dContext('gc' + this.id, D, D)
        var g = cache.ctx.createRadialGradient(center.x, center.y, 0, d, d, d)
        g.addColorStop(Math.min(1, this.options.radius / this.options.distance), this.options.color)
        g.addColorStop(1, getRGBA(this.options.color, 0))
        cache.ctx.fillStyle = g
        cache.ctx.fillRect(0, 0, cache.w, cache.h)
        return this._gcache = cache
    }

    /**
     * Render the lamp onto the given context (without any shadows).
     * @param {CanvasRenderContext2D} ctx The canvas context to render the light on.
     */
    render(ctx) {
        var center = this.center()
        var c = this._getGradientCache(center)
        ctx.drawImage(
            c.canvas,
            Math.round(this.options.position.x - center.x),
            Math.round(this.options.position.y - center.y)
        )
    }
}

export default Lamp