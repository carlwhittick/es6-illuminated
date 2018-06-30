import { createCanvasAnd2dContext } from './helpers.js'
import Light from './Light.js'

/**
 * Defines the lighting of one light through a set of opaque objects.
 */
class Lighting {
    /**
     * Create a new instance of Lighting.
     * @param {Object} options Options to be applied to the Lighting.
     */
    constructor(options) {
        const defaults = {
            /**
             * The source of the lighting.
             * @property light
             * @type Light
             * @default new Light()
             */
            light: new Light(),

            /**
             * An array of {{#crossLink "illuminated.OpaqueObject"}}{{/crossLink}} objects
             * which stop the light and create shadows.
             * @property objects
             * @type Array
             * @default []
             */
            objects: []
        }
        this.options = Object.assign(defaults, this.options)
        this.options = Object.assign(this.options, options)
    }

    /**
     * Create caches for canvas contexts.
     * @param {Number} w Width of the contexts.
     * @param {Number} h Height of the contexts.
     */
    createCache(w, h) {
        this._cache = createCanvasAnd2dContext('lc', w, h)
        this._castcache = createCanvasAnd2dContext('lcc', w, h)
    }

    /**
     * Draw the shadows that are cast by the objects. You usually don't have to use
     * it if you use render().
     * @param {CanvasRenderContext2D} ctxoutput The canvas context onto which the shadows will be drawn.
     */
    cast(ctxoutput) {
        var light = this.options.light
        var n = light.samples
        var c = this._castcache
        var ctx = c.ctx
        ctx.clearRect(0, 0, c.w, c.h)
        // Draw shadows for each light sample and objects
        ctx.fillStyle = 'rgba(0,0,0,' + Math.round(100 / n) / 100 + ')' // Is there any better way?
        var bounds = light.bounds()
        var objects = this.options.objects
        light.forEachSample(function (position) {
            for (var o = 0, l = objects.length; o < l; ++o) {
                if (objects[o].contains(position)) {
                    ctx.fillRect(bounds.topleft.x, bounds.topleft.y, bounds.bottomright.x - bounds.topleft.x, bounds.bottomright.y - bounds.topleft.y)
                    return
                }
            }
            objects.forEach(function (object) {
                object.cast(ctx, position, bounds)
            })
        })
        // Draw objects diffuse - the intensity of the light penetration in objects
        objects.forEach(function (object) {
            var diffuse = object.diffuse === undefined ? 0.8 : object.diffuse
            diffuse *= light.diffuse
            ctx.fillStyle = 'rgba(0,0,0,' + (1 - diffuse) + ')'
            ctx.beginPath()
            object.path(ctx)
            ctx.fill()
        })
        ctxoutput.drawImage(c.canvas, 0, 0)
    }

    /**
     * Compute the shadows to cast.
     * @param {Number} w Width of the canvas context.
     * @param {Number} h Height of the canvas context.
     */
    compute(w, h) {
        if (!this._cache || this._cache.w != w || this._cache.h != h)
            this.createCache(w, h)
        var ctx = this._cache.ctx
        var light = this.options.light
        ctx.save()
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        light.render(ctx)
        ctx.globalCompositeOperation = 'destination-out'
        this.cast(ctx)
        ctx.restore()
    }

    /**
     * Draws the light and shadows onto the given context.
     * @param {CanvasRenderContext2D} ctx The canvas context on which to draw.
     */
    render(ctx) {
        ctx.drawImage(this._cache.canvas, 0, 0)
    }

    /**
     * Returns the light and shadows onto the given context as canvas.
     * @return {Canvas} The picture of the light and shadow.
     */
    getCanvas() {
        return this._cache.canvas
    }
}

export default Lighting