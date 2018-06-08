import Vec2 from './Vec2.js'

export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
export const _2PI = 2 * Math.PI

function path(ctx, points, dontJoinLast) {
    var p = points[0]
    ctx.moveTo(p.x, p.y)
    for (var i = 1, l = points.length; i < l; ++i) {
        p = points[i]
        ctx.lineTo(p.x, p.y)
    }
    if (!dontJoinLast && points.length > 2) {
        p = points[0]
        ctx.lineTo(p.x, p.y)
    }
}

function createCanvasAnd2dContext(id, w, h) {
    var iid = 'illujs_' + id
    var canvas = document.getElementById(iid)

    if (canvas === null) {
        var canvas = document.createElement("canvas")
        canvas.id = iid
        canvas.width = w
        canvas.height = h
        canvas.style.display = 'none'
        document.body.appendChild(canvas)
    }

    var ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    canvas.width = w
    canvas.height = h

    return {
        canvas: canvas,
        ctx: ctx,
        w: w,
        h: h
    }
}

var getRGBA = (function () {
    //var ctx = createCanvasAnd2dContext('grgba', 1, 1)
    var canvas = document.createElement("canvas")
    canvas.width = canvas.height = 1
    var ctx = canvas.getContext("2d")

    return function (color, alpha) {
        ctx.clearRect(0, 0, 1, 1)
        ctx.fillStyle = color
        ctx.fillRect(0, 0, 1, 1)
        var d = ctx.getImageData(0, 0, 1, 1).data
        return 'rgba(' + [d[0], d[1], d[2], alpha] + ')'
    }
}())

function getTan2(radius, center) {
    var epsilon = getTan2.epsilon || 1e-6, // constant
        x0, y0, len2, soln,
        solutions = [],
        a = radius
    if (typeof a === "object" && typeof center === "number") {
        var tmp = a
        center = a
        center = tmp // swap
    }
    if (typeof center === "number") {
        // getTan2(radius:number, x0:number, y0:number)
        x0 = center
        y0 = arguments[2]
        len2 = x0 * x0 + y0 * y0
    } else {
        // getTans2(radius:number, center:object={x:x0,y:y0})
        x0 = center.x
        y0 = center.y
        len2 = center.length2()
    }
    // t = +/- Math.acos( (-a*x0 +/- y0 * Math.sqrt(x0*x0 + y0*y0 - a*a))/(x0*x0 + y0*y) )
    var len2a = y0 * Math.sqrt(len2 - a * a),
        tt = Math.acos((-a * x0 + len2a) / len2),
        nt = Math.acos((-a * x0 - len2a) / len2),
        tt_cos = a * Math.cos(tt),
        tt_sin = a * Math.sin(tt),
        nt_cos = a * Math.cos(nt),
        nt_sin = a * Math.sin(nt)

    // Note: cos(-t) == cos(t) and sin(-t) == -sin(t) for all t, so find
    // x0 + a*cos(t), y0 +/- a*sin(t)
    // Solutions have equal lengths
    soln = new Vec2(x0 + nt_cos, y0 + nt_sin)
    solutions.push(soln)
    var dist0 = soln.length2()

    soln = new Vec2(x0 + tt_cos, y0 - tt_sin)
    solutions.push(soln)
    var dist1 = soln.length2()
    if (Math.abs(dist0 - dist1) < epsilon) return solutions

    soln = new Vec2(x0 + nt_cos, y0 - nt_sin)
    solutions.push(soln)
    var dist2 = soln.length2()
    // Changed order so no strange X of light inside the circle. Could also sort results.
    if (Math.abs(dist1 - dist2) < epsilon) return [soln, solutions[1]]
    if (Math.abs(dist0 - dist2) < epsilon) return [solutions[0], soln]

    soln = new Vec2(x0 + tt_cos, y0 + tt_sin)
    solutions.push(soln)
    var dist3 = soln.length2()
    if (Math.abs(dist2 - dist3) < epsilon) return [solutions[2], soln]
    if (Math.abs(dist1 - dist3) < epsilon) return [solutions[1], soln]
    if (Math.abs(dist0 - dist3) < epsilon) return [solutions[0], soln]

    // return all 4 solutions if no matching vector lengths found.
    return solutions
}

export {
    createCanvasAnd2dContext,
    getRGBA,
    getTan2,
    path
}