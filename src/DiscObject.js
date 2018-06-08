import Vec2 from './Vec2.js'
import { getTan2, path, _2PI } from './helpers.js'
import OpaqueObject from './OpaqueObject.js'

class DiscObject extends OpaqueObject {
    constructor(options) {
        super()
        const defaults = {
            center: new Vec2(),
            radius: 20
        }
        this.options = Object.assign(defaults, this.options)
        this.options = Object.assign(this.options, options)
    }
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
    path(ctx) {
        ctx.arc(this.options.center.x, this.options.center.y, this.options.radius, 0, _2PI)
    }
    bounds() {
        return {
            topleft: new Vec2(this.options.center.x - this.options.radius, this.options.center.y - this.options.radius),
            bottomright: new Vec2(this.options.center.x + this.options.radius, this.options.center.y + this.options.radius)
        }
    }
    contains(point) {
        return point.dist2(this.options.center) < this.options.radius * this.options.radius
    }
}

export default DiscObject