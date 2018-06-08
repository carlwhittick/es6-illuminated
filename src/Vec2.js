class Vec2 {
    constructor(x, y) {
        this.x = x || 0
        this.y = y || 0
    }

    copy() {
        return new Vec2(this.x, this.y)
    }

    dot(v) {
        return v.x * this.x + v.y * this.y
    }

    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y)
    }

    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y)
    }

    mul(n) {
        return new Vec2(this.x * n, this.y * n)
    }

    inv() {
        return this.mul(-1)
    }

    dist2(v) {
        let dx = this.x - v.x
        let dy = this.y - v.y
        return dx * dx + dy * dy
    }

    normalize() {
        let length = Math.sqrt(this.length2())
        return new Vec2(this.x / length, this.y / length)
    }

    length2(v) {
        return this.x * this.x + this.y * this.y
    }

    toString() {
        return this.x + "," + this.y
    }

    inBound(topLeft, bottomRight) {
        return (topLeft.x < this.x && this.x < bottomRight.x &&
            topLeft.y < this.y && this.y < bottomRight.y)
    }
}

export default Vec2