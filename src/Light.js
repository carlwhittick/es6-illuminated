import Vec2 from './Vec2.js'
import { createCanvasAnd2dContext } from './helpers.js'

class Light {
    constructor(options) {
        const defaults = {
            position: new Vec2(),
            distance: 100,
            diffuse: 0.8
        }
        this.options = Object.assign(defaults, options)
    }

    render() {}

    mask(ctx) {
        var c = this._getVisibleMaskCache()
        ctx.drawImage(
            c.canvas,
            Math.round(this.options.position.x - c.w / 2),
            Math.round(this.options.position.y - c.h / 2)
        )
    }

    bounds() {
        return {
            topleft: new Vec2(this.options.position.x - this.options.distance, this.options.position.y - this.options.distance),
            bottomright: new Vec2(this.options.position.x + this.options.distance, this.options.position.y + this.options.distance)
        }
    }

    center() {
        return new Vec2(this.options.distance, this.options.distance)
    }

    forEachSample(f) {
        f(this.options.position)
    }

    _getVisibleMaskCache() {
        var d = Math.floor(this.options.distance * 1.4)
        var hash = '' + d
        if (this.vismaskhash != hash) {
            this.vismaskhash = hash
            var c = this._vismaskcache = createCanvasAnd2dContext('vm' + this.id, 2 * d, 2 * d)
            var g = c.ctx.createRadialGradient(d, d, 0, d, d, d)
            g.addColorStop(0, 'rgba(0,0,0,1)')
            g.addColorStop(1, 'rgba(0,0,0,0)')
            c.ctx.fillStyle = g
            c.ctx.fillRect(0, 0, c.w, c.h)
        }
        return this._vismaskcache
    }

    _getHashCache() {
        return [this.options.distance, this.options.diffuse].toString()
    }
}

export default Light