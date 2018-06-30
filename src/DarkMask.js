import createCanvasAnd2dContext from './helpers.js'

class DarkMask {
    constructor(options) {
        const defaults = {
            lights: [],
            color: 'rgba(0,0,0,0.9)'
        }
        this.options = Object.assign(defaults, this.options)
        this.options = Object.assign(this.options, options)
    }

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

    render(ctx) {
        ctx.drawImage(this._cache.canvas, 0, 0)
    }

    getCanvas() {
        return this._cache.canvas
    }
}

export default DarkMask