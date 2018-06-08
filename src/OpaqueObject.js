class OpaqueObject {
    constructor(options) {
        const defaults = {
            diffuse: 0.8
        }
        this.options = Object.assign(defaults, options)
        this.uniqueId = 0
    }

    cast(ctx, origin, bounds) {}

    path(ctx) {}

    bounds() {
        return {
            topleft: new Vec2(),
            bottomright: new Vec2()
        }
    }

    contains(point) {
        return false
    }
}

export default OpaqueObject