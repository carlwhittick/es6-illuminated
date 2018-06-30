import Vec2 from './Vec2.js'

/**
 * Abstract class for opaque objects.
 */
class OpaqueObject {
    /**
     * Create a new instace of Opaque object.
     * @param {Object} options Options to be applied to this OpaqueObject.
     */
    constructor(options) {
        const defaults = {
            /**
             * How diffuse this opaque object should be.
             * @property diffuse
             * @type Number
             * @default 0.8
             */
            diffuse: 0.8
        }
        this.options = Object.assign(defaults, options)
        this.uniqueId = 0
    }

    /**
     * Fill provided context with the shadows projected by this opaque object at the origin
     * point, constrained by the given bounds.
     * @param {CanvasRenderingContext2D} ctx The canvas context onto which the shadows will be cast.
     * @param {Vec2} origin A vector that represents the origin for the shadows cast.
     * @param {Object} bounds An anonymous object with the properties topleft and bottomright representing
     *                        the corners of the boundry.
     */
    cast() {}

    /**
     * Draw the path of the opaque object shape onto the ctx.
     * @param {CanvasRenderingContext2D} ctx The context onto which the path will be drawn.
     */
    path() {}

    /**
     * Calculate the boundaries of this opaque object.
     * @return {Object} An anonymous object with the properties topleft and bottomright representing
     *                  the corners of this boundry.
     */
    bounds() {
        return {
            topleft: new Vec2(),
            bottomright: new Vec2()
        }
    }

    /**
     * Determine if the given point is inside the object.
     * @return {Boolean} True if the opaque object contains the given point.
     */
    contains() {
        return false
    }
}

export default OpaqueObject