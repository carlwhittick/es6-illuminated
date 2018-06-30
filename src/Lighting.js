import { createCanvasAnd2dContext } from './helpers.js'
import Light from './Light.js'

class Lighting {
    constructor(options) {
        const defaults = {
            light: new Light(),
            objects: []
        }
        this.options = Object.assign(defaults, this.options)
        this.options = Object.assign(this.options, options)
    }

    createCache(w, h) {
        this._cache = createCanvasAnd2dContext('lc', w, h)
        this._castcache = createCanvasAnd2dContext('lcc', w, h)
    }

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

    render(ctx) {
        ctx.drawImage(this._cache.canvas, 0, 0)
    }

    getCanvas() {
        return this._cache.canvas
    }
}

export default Lighting