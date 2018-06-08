import Vec2 from './Vec2.js'
import PolygonObject from './PolygonObject.js'

class RectangleObject extends PolygonObject {
    constructor(options) {
        super(options)
        const defaults = {
            topleft: new Vec2(),
            bottomright: new Vec2()
        }
        this.options = Object.assign(defaults, this.options)
        this.options = Object.assign(this.options, options)
        this.syncFromTopleftBottomright()
    }
    syncFromTopleftBottomright() {
        var a = this.options.topleft
        var b = new Vec2(this.options.bottomright.x, this.options.topleft.y)
        var c = this.options.bottomright
        var d = new Vec2(this.options.topleft.x, this.options.bottomright.y)
        this.options.points = [a, b, c, d]
    }
    fill(ctx) {
        var x = this.options.points[0].x, y = this.options.points[0].y
        ctx.rect(x, y, this.options.points[2].x - x, this.options.points[2].y - y)
    }
}

export default RectangleObject