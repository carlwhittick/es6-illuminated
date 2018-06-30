import PolygonObject from './PolygonObject.js'
import Vec2 from './Vec2.js'

/**
 * An opaque line object.
 */
class LineObject extends PolygonObject {
    /**
     * Create a new instance of LineObject.
     * @param {Object} options Options to be applied to the LineObject
     */
    constructor(options) {
        super(options)
        const defaults = {
            /**
             * A vector that is the start point of the line.
             * @property a
             * @type Vec2
             * @default Vec2()
             */
            a: new Vec2(),

            /**
             * A vector that is the last point of the line.
             * @property b
             * @type Vec2
             * @default Vec2()
             */
            b: new Vec2()
        }
        this.options = Object.assign(defaults, this.options)
        this.options = Object.assign(this.options, options)
        
        this.syncFromAB()
    }

    /**
     * Initializes the points defining this line based on its options.
     */
    syncFromAb() {
        this.options.points = [this.options.a, this.options.b]
    }
}

export default LineObject