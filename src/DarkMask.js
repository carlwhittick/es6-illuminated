import createCanvasAnd2dContext from './helpers.js'

/**
 * Defines the dark layer which hides the dark area not illuminated by a set of
 * lights.
 */
class DarkMask {
    /**
     * Create a new instance of DarkMask
     * @param {Object} options Options to be applied to DarkMask
     */
    constructor(options) {
        const defaults = {
            /**
             * An array of {{#crossLink "illuminated.Light"}}{{/crossLink}} objects that
             * illuminate the rest of the scene.
             * @property lights
             * @type Array
             * @default []
             */
            lights: [],

            /**
             * The color of the dark area in RGBA format.
             * @property color
             * @type String
             * @default 'rgba(0,0,0,0.9)'
             */
            color: 'rgba(0,0,0,0.9)'
        }
        this.options = Object.assign(defaults, this.options)
        this.options = Object.assign(this.options, options)
    }

    /**
     * Compute the dark mask.
     * @param {Number} w Width of the canvas context.
     * @param {Number} h Height of the canvas context.
     */
    compute(w, h) {
        if (!this._cache || this._cache.w != w || this._cache.h != h)
            this._cache = createCanvasAnd2dContext('dm', w, h)
        var ctx = this._cache.ctx
        ctx.save()
        ctx.clearRect(0, 0, w, h)
        ctx.fillStyle = this.color
        ctx.fillRect(0, 0, w, h)
        ctx.globalCompositeOperation = 'destination-out'
        this.options.lights.forEach(function (light) {
            light.mask(ctx)
        })
        ctx.restore()
    }

    /**
     * Draws the dark mask onto the given context.
     * @param {CanvasRenderContext2D} ctx The canvas context on which to draw.
     */
    render(ctx) {
        ctx.drawImage(this._cache.canvas, 0, 0)
    }

    /**
     * Gives the dark mask back.
     * @return {CanvasRenderContext2D} The canvas context.
     */
    getCanvas() {
        return this._cache.canvas
    }
}

export default DarkMask