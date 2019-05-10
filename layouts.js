UNIT_SIZE_PX = 32  // Size of a default unit in pixels

function abs(x) {
	return x>0? x: -x
}

function sum(arr) {
	var res = 0
	for (var i in arr) res += arr[i]
	return res
}

function dot(a, b) {
	var res = 0
	for (var i in a) res += a[i]*b[i]
	return res
}

function hsum(ns, pows, s){
	var res = 0
	for (var i in ns) res += ns[i] * s**pows[i]
	return res;
}

function max(arr) {
	var res = arr[0]
	for (var i in arr)
		if (arr[i] > res) res = arr[i]
	return res
}

function min(arr) {
	var res = arr[0]
	for (var i in arr)
		if (arr[i] < res) res = arr[i]
	return res
}

function each_get(arr, key) {
	var result = new Array(arr.length)
	for (var i in arr) result[i] = arr[i][key]
	return result
}

function solve_unit(size_px, ns, pows, max_iters=30, tol=0.01) {
	// h = size_px / UNIT_SIZE_PX - total height in units,
	// n_i = ns[i] - hight of each element in cells,
	// s - scale (size of a cell (pow=1) in units),
	// p_i = pows[i] - scale power for each element.
	//
	// We solve the following equation on s:
	// h = sum_i{n_i * s^p_i}
	//
	// Returns size in pixels for each container.
	// The function usually returns in <5us.

	var h = size_px / UNIT_SIZE_PX
	var dhds0 = dot(ns, pows)
	var s0 = h / dhds0
	var h0 = hsum(ns, pows, s0)
	var s1 = s0 - (h0 - h) / dhds0
	s1 = s1<0 ? 0 : s1

	for (var i=0; i<max_iters && s1!=s0 && abs(h0-h)>tol; i++) {
		var h1 = hsum(ns, pows, s1)
		var dhds = (h1-h0) / (s1-s0)
		dhds = 0.9*dhds + 0.1*dhds0  // regularization
		var s2 = s1 - (h1 - h) / dhds
		s0 = s1
		s1 = s2<0 ? 0 : s2
		h0 = h1
	}

	var result = new Array(ns.length)
	for (var i in ns) {
		result[i] = UNIT_SIZE_PX * ns[i] * s1**pows[i]
	}
	return result
}

class Rect {
	constructor(x, y, w, h) {
		// in pixels
		this.x = x
		this.y = y
		this.w = w
		this.h = h
	}

	copy() {
		return new Rect(this.x, this.y, this.w, this.h)
	}
}

class Container {
	canvas = null
	rect = new Rect()
	cursor_style = null
	bg_color = null

	// size in cells
	constructor(w=1, h=1, pow=1) {
		this.w = w
		this.h = h
		this.pow = pow
	}

	draw(canvas, rect) {
		this.canvas = canvas
		this.rect = rect.copy()

		if (this.bg_color) {
			var ctx = canvas.getContext("2d")
			ctx.fillStyle = this.bg_color
			ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
		}
	}

	hit_test(x, y) {
		var r = this.rect
		return r.x < x && x < r.x+r.w && r.y < y && y < r.y+r.h
	}

	handle_event(event, type) {
		try {
			this[type](event)
			return true
		} catch {
			return false
		}
	}

	onmousemove(event) {
		if (this.onclick && !this.cursor_style) {
			this.cursor_style = "pointer"
		}
		if (this.cursor_style && this.hit_test(event.offsetX, event.offsetY)) {
			this.canvas.style.cursor = this.cursor_style
		}
	}
}

class Layout extends Container {
	children = new Array()
	padding = 0
	spacing = 0

	_solve_sizes_and_spacing(size_px, ns) {
		var pows = each_get(this.children, "pow")
		var space = this.padding * 2 + this.spacing * (this.children.length-1)
		var padding = 0, spacing = 0
		if (space > 0) {
			ns.push(space)
			pows.push(1)
		}

		var solution = solve_unit(size_px, ns, pows)

		if (space > 0) {
			padding = solution[this.children.length] * this.padding / space
			spacing = solution[this.children.length] * this.spacing / space
		}

		return [solution, padding, spacing]
	}

	append(child) {
		this.children.push(child)
	}

	handle_event(event, type) {
		for (var i in this.children) {
			if (this.children[i].hit_test(event.offsetX, event.offsetY) &&
				this.children[i].handle_event(event, type))
			{
				return true
			}
		}
		return false
	}
}

class HBox extends Layout {
	draw(canvas, rect) {
		super.draw(canvas, rect)
		
		var [solution, padding, spacing] = this._solve_sizes_and_spacing(
			rect.w, each_get(this.children, "w"))
		var x = rect.x + padding, max_h = 0

		for (var i in this.children) {
			var c = this.children[i]
			c.draw(canvas, new Rect(x, rect.y, solution[i], rect.h))
			x += c.rect.w + spacing
			max_h = max([c.rect.h, max_h])
		}
		x += padding - spacing

		this.rect.w = x - rect.x
		this.rect.h = max_h
	}
}

class VBox extends Layout {
	draw(canvas, rect) {
		super.draw(canvas, rect)

		var [solution, padding, spacing] = this._solve_sizes_and_spacing(
			rect.h, each_get(this.children, "h"))
		var y = rect.y + padding, max_w = 0

		for (var i in this.children) {
			var c = this.children[i]
			c.draw(canvas, new Rect(rect.x, y, rect.w, solution[i]))
			y += c.rect.h + spacing
			max_w = max([c.rect.w, max_w])
		}
		y += padding - spacing

		this.rect.w = max_w
		this.rect.h = y - rect.y
	}
}

class TextBox extends Container {
	constructor(text="") {
		super()
		this.text = text
	}

	draw(canvas, rect) {
		super.draw(canvas, rect)
		var ctx = canvas.getContext("2d")
		ctx.font = rect.h*0.8 + "px arial"
		ctx.fillStyle = "black"
		ctx.fillText(this.text, rect.x, rect.y+rect.h*0.8)
	}
}

class ImgBox extends Container {
	constructor(url="") {
		super()
		this.img = new Image()
		this.img.onload = ()=>this._draw_later()
		this.img.src = url
	}

	_draw_later() {
		var ctx = this.canvas.getContext("2d")
		var r = this.rect
		ctx.drawImage(this.img, r.x, r.y, r.w, r.h)
	}

	draw(canvas, rect) {
		super.draw(canvas, rect)
		this._draw_later()
	}
}