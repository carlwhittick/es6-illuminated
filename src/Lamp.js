import Vec2 from './Vec2'
import Light from './Light.js'
import { createCanvasAnd2dContext, getRGBA } from './helpers.js'

class Lamp extends Light {
    constructor(options) {
        super()
        const defaults = {
            id: 0,
            color: 'rgba(250,220,150,0.8)',
            radius: 0,
            samples: 1,
            angle: 0,
            roughness: 0
        }
        this.options = Object.assign(defaults, this.options)
        this.options = Object.assign(this.options, options)
    }

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

    center() {
        return new Vec2(
            (1 - Math.cos(this.options.angle) * this.options.roughness) * this.options.distance,
            (1 + Math.sin(this.options.angle) * this.options.roughness) * this.options.distance
        )
    }

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