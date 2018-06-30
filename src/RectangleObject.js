import Vec2 from './Vec2.js'
import PolygonObject from './PolygonObject.js'

/**
 * A rectangular, opqaue object.
 */
class RectangleObject extends PolygonObject {
    /**
     * Create a new instance of RectangleObject
     * @param {Object} options Options to be applied to this RectangleObject
     */
    constructor(options) {
        super(options)
        const defaults = {
            /**
             * A vector that is the top-left of the rectangle.
             * @property topleft
             * @type Vec2
             * @default new Vec2()
             */
            topleft: new Vec2(),

            /**
             * A vector that is the bottom-right of the rectangle.
             * @property bottomright
             * @type Vec2
             * @default new Vec2()
             */
            bottomright: new Vec2()
        }
        this.options = Object.assign(defaults, this.options)
        this.options = Object.assign(this.options, options)
        this.syncFromTopleftBottomright()
    }

    /**
     * Initializes the points defining this rectangle based on its specified bounds.
     */
    syncFromTopleftBottomright() {
        var a = this.options.topleft
        var b = new Vec2(this.options.bottomright.x, this.options.topleft.y)
        var c = this.options.bottomright
        var d = new Vec2(this.options.topleft.x, this.options.bottomright.y)
        this.options.points = [a, b, c, d]
    }

    /**
     * Draws this rectangle onto the given context
     * @param {CanvasRenderContext2D} ctx The canvas context onto which the rectangle should be drawn.
     */
    fill(ctx) {
        var x = this.options.points[0].x, y = this.options.points[0].y
        ctx.rect(x, y, this.options.points[2].x - x, this.options.points[2].y - y)
    }
}

export default RectangleObject