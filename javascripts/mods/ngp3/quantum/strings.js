let str = {
	unl: (force) => (!force && str_tmp.unl) || (PCs_save && PCs_save.best >= 8),

	//Data
	data: {
		all: [],
		pos: {}
	},

	//Save Data
	setup() {
		str_save = {
			energy: 0,
			spent: 0,
			effs: {}
		}
		qu_save.str = str_save
		return str_save
	},
	compile() {
		str_tmp = { unl: this.unl() }
		if (!tmp.ngp3 || qu_save === undefined) return

		this.data.all = []
		for (var i = 12; i >= 1; i--) {
			this.data.all.push("pb" + i)
			this.data.pos["pb" + i] = (13 - i)
		}
		for (var i = 1; i <= 12; i++) {
			this.data.all.push("eb" + i)
			this.data.pos["eb" + i] = i + 12
		}

		var data = str_save || this.setup()

		this.updateTmp()
	},

	//Updates
	updateTmp() {
		var data = str_tmp
		var effs = str_save.effs
		var all = this.data.all
		if (!data.unl) return

		data.alt = {}
		data.vibrated = 0
		for (var e = 0; e < all.length; e++) {
			var id = all[e]
			if (this.vibrated(id)) {
				data.vibrated++
				this.onVibrate(id)
			}
		}
		str_save.spent = str.veCost(data.vibrated)

	},
	updateDisp() {
		getEl("stringstabbtn").style.display = PCs.unl() ? "" : "none"

		var unl = this.unl()
		getEl("str_unl").style.display = !unl ? "" : "none"
		getEl("str_div").style.display = unl ? "" : "none"
		getEl("str_boosts").style.display = unl ? "" : "none"
		if (!unl) getEl("str_strength").textContent = ""
		if (unl) getEl("str_cost").textContent = "(the next one costs " + shorten(this.veCost(str_tmp.vibrated + 1) - this.veCost(str_tmp.vibrated)) + ")"

		if (!str_tmp.setupHTML) return

		var all = this.data.all
		for (var e = 0; e < all.length; e++) {
			var id = all[e]
			var alt = this.altitude(id)
			getEl("str_" + id).className = (this.vibrated(id) ? "chosenbtn" : "storebtn") + " posbtn"
			getEl("str_" + id).style.top = (1 - alt) * 72 + "px"
			getEl("str_" + id + "_altitude").textContent = alt.toFixed(2) + " altitude"
		}
	},

	//Updates on tick
	updateTmpOnTick() {
		var data = str_tmp
		if (!data.unl) return

		data.str = 1
	},
	updateDispOnTick() {
		if (!str_tmp.setupHTML || !str_tmp.unl) return

		getEl("str_ve").textContent = shorten(str.veUnspent())
		getEl("str_strength").textContent = "Altitude Power: " + formatPercentage(str_tmp.str) + "%"

		for (var i = 1; i <= 12; i++) {
			getEl("str_eb" + i + "_eff").textContent = formatPercentage(str.eff_eb(i) - 1) + "% stronger"
			getEl("str_pb" + i + "_eff").textContent = "+" + shorten(str.eff_pb(i)) + "x charge"

			getEl("str_eb" + i + "_nerf").innerHTML = str.altitude("eb" + i) < 0 ? "+" + shorten(str.nerf_eb(i)) + " mastery<br>requirement" : ""
			getEl("str_pb" + i + "_nerf").innerHTML = str.altitude("pb" + i) < 0 ? shorten(str.nerf_pb(i)) + "x charge<br>requirement" : ""
		}
	},
	updateFeatureOnTick() {
		str_save.energy = Math.max(str_save.energy, this.veGain())
	},

	//HTML + DOM elements
	setupBoost(type, x) {
		var id = type + x
		return '<div class="str_boost" id="str_' + id + '_div">' +
			(type == "bb" ?
				'<button class="unavailablebtn posbtn" id="str_' + id + '"></button>'
			:
				'<button id="str_' + id + '" onclick="str.vibrate(\'' + type + '\', ' + x + ')"><b>' + id.toUpperCase() + '</b><br>' +
				'<span id="str_' + id + '_eff"></span><br>' +
				'<b class="warning" id="str_' + id + '_nerf" style="font-size: 8px"></b></button><br>' +
				'<span id="str_' + id + '_altitude"></span>'
			) +
			'</div>'
	},
	setupHTML() {
		if (str_tmp.setupHTML) return
		str_tmp.setupHTML = true

		var html = ""
		for (var p = 12; p >= 1; p--) html += this.setupBoost("pb", p)
		//for (var b = 1; b <= 6; b++) html += this.setupBoost("bb", b)
		for (var e = 1; e <= 12; e++) html += this.setupBoost("eb", e)
		getEl("str_boosts").innerHTML = html

		str.updateDisp()
	},

	//Vibration Energy
	veGain() {
		return Math.log10(qu_save.quarkEnergy + 1) * Math.log10(QCs_save.qc5.add(1).log10() + 1)
	},
	veUnspent() {
		return str_save.energy - str_save.spent
	},
	veCost(x) {
		return x ? Math.pow(2, x - 1) : 0
	},

	//Vibrations
	vibrate(type, x) {
		var id = type + x + "_vib"
		var data = str_save.effs

		if (data[id]) delete data[id]
		else {
			if (str_save.energy < str.veCost(str_tmp.vibrated + 1)) return
			data[id] = true
		}

		restartQuantum(true)
	},
	vibrated(x) {
		return str_save.effs[x + "_vib"]
	},
	onVibrate(x) {
		var pos = this.data.pos[x]
		for (var x = -3; x <= 3; x++) {
			var id = this.data.all[pos + x - 1]
			if (id) {
				str_tmp.alt[id] = (str_tmp.alt[id] || 0) + (1 - 2 * ((x + 3) % 2)) / (Math.abs(x) + 1) / 2
			}
		}
	},

	//Altitudes
	altitude(x) {
		return this.unl() ? Math.max(Math.min(str_tmp.alt[x] || 0, 1), -1) : 0
	},
	eff_eb(x) {
		return 1 + Math.abs(this.altitude("eb" + x)) * str_tmp.str
	},
	eff_pb(x) {
		return Math.abs(this.altitude("pb" + x)) * 8 * str_tmp.str
	},
	nerf_eb(x) {
		var alt = this.altitude("eb" + x) * str_tmp.str
		return alt < 0 ? -alt * 1e3 : 0
	},
	nerf_pb(x) {
		var alt = this.altitude("pb" + x) * str_tmp.str
		return alt < 0 ? 1 - alt : 1
	}
}
let str_tmp = {}
let str_save = {}

let STRINGS = str
