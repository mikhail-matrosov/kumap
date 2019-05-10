class Meter extends Container {
	bg_color = "#BBB"

	constructor(data=[], color="#F0F") {
		super()
		this.data = data
		this.color = color
	}

	draw(canvas, rect) {
		super.draw(canvas, rect)
		var ctx = canvas.getContext("2d")
		ctx.fillStyle = this.color
		if (this.data.length > 1) {
			ctx.beginPath();
			ctx.moveTo(rect.x, rect.y+rect.h);
			var imul = rect.w/(this.data.length-1)
			var vmul = rect.h/max(this.data)
			for (var i in this.data) {
				ctx.lineTo(rect.x + i*imul,
				           rect.y + rect.h - this.data[i]*vmul);
			}
			ctx.lineTo(rect.x+rect.w, rect.y+rect.h);
			ctx.closePath();
			ctx.fill();
		}
	}
}

class Pod extends HBox {
	status = "Ready"
	uptime = "13h"
	node = "Node67"
	cpu = [0, 0, 0.1, 0.5, 0.2, 0.3, 0.4, 0.5]
	mem = [0, 0, 100,  50,  80, 90,  110, 105]

	bg_color = "#BBB"
	padding = 0.1
	spacing = 0.1

	constructor() {
		super()
		var vb1 = new VBox()
		vb1.w = 3
		this.append(vb1)

		vb1.padding = vb1.spacing = 0.1
		vb1.append(new TextBox(this.uptime))
		vb1.append(new TextBox(this.node))
		vb1.append(new Meter(this.cpu, "#8F8"))
		vb1.append(new Meter(this.mem, "#88F"))

		var vb2 = new VBox()
		vb2.padding = vb2.spacing = 0.1
		this.append(vb2)

		var b1 = new ImgBox("assets/logs.svg")
		b1.onclick = e=>console.log("B1")
		vb2.append(b1)

		var b2 = new ImgBox("assets/exec.svg")
		b2.onclick = e=>console.log("B2")
		vb2.append(b2)

		var b3 = new ImgBox("assets/edit.svg")
		b3.onclick = e=>console.log("B3")
		vb2.append(b3)

		var b4 = new ImgBox("assets/delete.svg")
		b4.cursor_style = "pointer"
		b4.onclick = e=>console.log("B4")
		vb2.append(b4)
	}

	draw(canvas, rect) {
		var x = rect.x, y = rect.y, w = min([rect.w, rect.h])
		var colors = {"Waiting": "#FFA", "Ready": "#EEE", "Terminated": "#FBB"}
		this.bg_color = colors[this.status]
		super.draw(canvas, new Rect(x, y, w, w))
	}
}

class ReplicaSetHeader extends HBox {
	status = "Ready"

	w = 2
	padding = 0.1
	spacing = 0.1

	constructor() {
		super()
		var vb1 = new VBox()
		vb1.w = 7
		vb1.padding = vb1.spacing = 0.1
		var l1 = new HBox()
		l1.pow = 0.5
		l1.append(new TextBox("17h"))
		l1.append(new TextBox("10/15"))
		vb1.append(l1)
		vb1.append(new TextBox("…prod:648"))
		vb1.append(new Container(1, 2 + this.spacing))
		this.append(vb1)

		var vb2 = new VBox()
		vb2.padding = vb2.spacing = 0.1
		var b1 = new ImgBox("assets/logs.svg")
		b1.onclick = e=>console.log("B1")
		vb2.append(b1)
		vb2.append(new Container(1, 3 + this.spacing*2))
		this.append(vb2)
	}

	draw(canvas, rect) {
		var x = rect.x, y = rect.y, w = min([rect.w, rect.h*2])
		var h = w/2
		var colors = {"Waiting": "#FFA", "Ready": "#EEE", "Terminated": "#FBB"}
		this.bg_color = colors[this.status]
		super.draw(canvas, new Rect(x, y, w, h))
	}
}

class ReplicaSet extends HBox {
	h = 4
	spacing = 0.05

	constructor() {
		super()
		this.header = new ReplicaSetHeader()
		this.append(this.header)
	}
}

class DeploymentHeader extends HBox {
	pow = 0.5
	w=8
	status = "Ready"
	spacing = 0.1

	constructor() {
		super()
		var t = new TextBox("Deployment")
		t.w = 3
		this.append(t)

		var t = new TextBox("20/15")
		t.w = 2
		t.pow = 0.5
		this.append(t)

		var b = new ImgBox("assets/logs.svg")
		b.onclick = e=>console.log("logs")
		b.pow = 0.5
		this.append(b)

		var b = new ImgBox("assets/edit.svg")
		b.onclick = e=>console.log("edit")
		b.pow = 0.5
		this.append(b)

		var b = new ImgBox("assets/delete.svg")
		b.onclick = e=>console.log("delete")
		b.pow = 0.5
		this.append(b)
	}

	draw(canvas, rect) {
		var colors = {"Waiting": "#FFA", "Ready": "#EEE"}
		this.bg_color = colors[this.status]
		super.draw(canvas, rect)
	}
}