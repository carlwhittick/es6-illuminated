import Vec2 from './Vec2.js'
import Lighting from './Lighting.js'

import Lamp from './Lamp.js'

import DiscObject from './DiscObject.js'
import RectangleObject from "./RectangleObject"


//!STAexport RT
var canvas = document.getElementById("screen")
var ctx = canvas.getContext("2d")
var light = new Lamp({
    position: new Vec2(200, 150),
    distance: 200
})
var disc = new DiscObject({
    center: new Vec2(100, 100),
    radius: 30
})
var rect = new RectangleObject({
    topleft: new Vec2(250, 200),
    bottomright: new Vec2(350, 250)
})
console.log("RECT", rect)
var lighting = new Lighting({
    light: light,
    objects: [disc, rect]
})
lighting.compute(canvas.width, canvas.height)
ctx.fillStyle = "black"
ctx.fillRect(0, 0, canvas.width, canvas.height)
lighting.render(ctx)