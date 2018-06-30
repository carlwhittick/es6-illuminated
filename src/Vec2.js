/**
 * Vec2 represents a 2d position or a 2d vector.
 * 
 * Vec2 is based on Box2d’s Vec2 except that in Illuminated.js a Vec2
 * vector is immutable. It means every method creates a new Vec2 instance and
 * you can safely use a same Vec2 instance everywhere because the immutability
 * guarantees that properties will not be modified.
 */
class Vec2 {
    /**
     * Create a vector
     * @param {Number} x The X coordinate.
     * @param {Number} y The Y coordinate.
     */
    constructor(x, y) {
        this.x = x || 0
        this.y = y || 0
    }

    /**
     * Returns a copy of this vector.
     * @return {Vec2} Copy of the current vector.
     */
    copy() {
        return new Vec2(this.x, this.y)
    }

    /**
     * Calculates the dot product of this vector and the given vector.
     * @param {Vec2} v A vector to use to calculate the the dot product.
     * @return {Number} The dot product.
     */
    dot(v) {
        return v.x * this.x + v.y * this.y
    }

    /**
     * Subtracts the given vector from this vector.
     * @param {Vec2} v A vector to subtract.
     * @return {Vec2} The resultant vector
     */
    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y)
    }

    /**
     * Adds the given vector to this vector.
     * @param {Vec2} v A vector to add.
     * @return {Vec2} The resultant vector
     */
    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y)
    }

    /**
     * Multiplies the given vector with this vector.
     * @param {Vec2} n A vector to multiply.
     * @return {Vec2} The resultant vector
     */
    mul(n) {
        return new Vec2(this.x * n, this.y * n)
    }

    /**
     * Caclulates the inverse of this vector.
     * @return {Vec2} A new inversed vector.
     */
    inv() {
        return this.mul(-1)
    }

    /**
     * Calculates the squared distance between this vector and the given vector.
     * @param {Vec2} v A vector with which the squared distance is calculated.
     * @return {Number} The squared distance.
     */
    dist2(v) {
        let dx = this.x - v.x
        let dy = this.y - v.y
        return dx * dx + dy * dy
    }

    /**
     * Calculates the normalized form of this vector.
     * @return {Vec2} The normalized form.
     */
    normalize() {
        let length = Math.sqrt(this.length2())
        return new Vec2(this.x / length, this.y / length)
    }

    /**
     * Calculates the squared length of this vector.
     * @return {Number} The squared length.
     */
    length2() {
        return this.x * this.x + this.y * this.y
    }

    /**
     * Produce a string representation of this vector.
     * @return {String} String representation of this vector.
     */
    toString() {
        return this.x + ',' + this.y
    }

    /**
     * Determines if this vector is within the bounds defined by the given vectors.
     * @param {Vec2} topLeft Top-left of the bounds
     * @param {Vec2} bottomRight Bottom-right of the bounds
     * @return {Boolean} Whether this vector is withing the provided bounds.
     */
    inBound(topLeft, bottomRight) {
        return (topLeft.x < this.x && this.x < bottomRight.x &&
            topLeft.y < this.y && this.y < bottomRight.y)
    }
}

export default Vec2