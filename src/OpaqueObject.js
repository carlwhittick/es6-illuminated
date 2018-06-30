import Vec2 from './Vec2.js'

class OpaqueObject {
    constructor(options) {
        const defaults = {
            diffuse: 0.8
        }
        this.options = Object.assign(defaults, options)
        this.uniqueId = 0
    }

    cast() {}

    path() {}

    bounds() {
        return {
            topleft: new Vec2(),
            bottomright: new Vec2()
        }
    }

    contains() {
        return false
    }
}

export default OpaqueObject