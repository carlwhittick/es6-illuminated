import PolygonObject from './PolygonObject.js'

class LineObject extends PolygonObject {
    constructor(options) {
        super(options)
        const defaults = {
            a: new Vec2(),
            b: new Vec2()
        }
        this.options = Object.assign(defaults, this.options)
        this.options = Object.assign(this.options, options)
        console.log(this.options)
        this.syncFromAB()
    }

    syncFromAb() {
        this.options.points = [this.options.a, this.options.b]
    }
}

export default LineObject