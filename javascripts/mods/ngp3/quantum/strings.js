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
			vibrated: []
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
		for (var i = 1; i <= 3; i++) {
			this.data.all.push("bb" + i)
			this.data.pos["bb" + i] = i + 12
		}
		for (var i = 1; i <= 12; i++) {
			this.data.all.push("eb" + i)
			this.data.pos["eb" + i] = i + 15
		}

		var data = str_save || this.setup()
		if (data.effs) delete data.effs
		if (!data.vibrated) data.vibrated = []

		this.updateTmp()
	},

	//Updates
	updateTmp() {
		var data = str_tmp
		var vibrated = str_save.vibrated
		var all = this.data.all
		if (!data.unl) return

		data.alt = {}
		data.disable = {}
		data.vibrated = 0
		for (var e = 0; e < all.length; e++) {
			var id = all[e]
			if (vibrated.includes(id)) {
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
			getEl("str_" + id).className = (str_save.vibrated.includes(id) ? "chosenbtn" : this.vibrated(id) ? "chosenbtn2" : this.canVibrate(id) ? "storebtn" : "unavailablebtn") + " posbtn"
			getEl("str_" + id).style.top = (1 - alt) * 72 + "px"
			if (id[0] != "b") getEl("str_" + id + "_altitude").textContent = alt.toFixed(2) + " altitude"
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
			getEl("str_eb" + i + "_nerf").innerHTML = str.altitude("eb" + i) < 0 ? "+" + shorten(str.nerf_eb(i)) + " mastery<br>requirement" : ""

			var pb_nerf = str.nerf_pb(i)
			getEl("str_pb" + i + "_eff").textContent = "+" + shorten(str.eff_pb(i)) + "x charge"
			getEl("str_pb" + i + "_nerf").className = pb_nerf < 1 ? "charged" : pb_nerf > 1 ? "warning" : ""
			getEl("str_pb" + i + "_nerf").innerHTML = (pb_nerf < 1 ? "/" + shorten(1 / pb_nerf) : shorten(pb_nerf) + "x") + " charge<br>requirement"
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
				'<button id="str_' + id + '" onclick="str.vibrate(\'' + type + '\', ' + x + ')"></button>'
			:
				'<button id="str_' + id + '" onclick="str.vibrate(\'' + type + '\', ' + x + ')"><b>' + id.toUpperCase() + '</b><br>' +
				'<span id="str_' + id + '_eff"></span><br>' +
				'<b class="warning" id="str_' + id + '_nerf" style="font-size: 8px"></b></button>'
			) + '<br>' +
			'<span id="str_' + id + '_altitude"></span></div>'
	},
	setupHTML() {
		if (str_tmp.setupHTML) return
		str_tmp.setupHTML = true

		var html = ""
		for (var p = 12; p >= 1; p--) html += this.setupBoost("pb", p)
		for (var b = 1; b <= 3; b++) html += this.setupBoost("bb", b)
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
		return x ? Math.pow(2, x - 2) : 0
	},

	//Vibrations
	canVibrate(x) {
		if (x[0] == "b") return
		if (str_save.energy < str.veCost(str_tmp.vibrated + 1)) return

		var all = this.data.all
		var pos = this.data.pos[x]

		if (str_tmp.disable[all[pos - 2]] || str_tmp.disable[all[pos]]) return
		return true
	},
	vibrate(type, x) {
		var id = type + x
		if (str_tmp.disable[id]) {
			var disable = str_tmp.disable[id]
			var vibrated = str_save.vibrated
			var new_vibrated = []
			for (var i = 0; i < vibrated.length; i++) if (vibrated[i] != disable) new_vibrated.push(vibrated[i])
			str_save.vibrated = new_vibrated
		} else {
			if (!str.canVibrate(id)) return
			str_save.vibrated.push(id)
		}

		restartQuantum(true)
	},
	vibrated(x) {
		return str.unl() && ((str_save.vibrated && str_save.vibrated.includes(x)) || str_tmp.disable[x])
	},
	onVibrate(x) {
		var pos = this.data.pos[x]
		for (var p = -4; p <= 4; p++) {
			var dist = Math.abs(p)
			var id = this.data.all[pos + p - 1]
			if (id) {
				var dist_rel = Math.max(dist, 1)
				if (dist <= 1 && !str_tmp.disable[id]) str_tmp.disable[id] = x
				str_tmp.alt[id] = (str_tmp.alt[id] || 0) + (1 - 2 * (dist_rel % 2)) / dist_rel / 2
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
		return alt < 0 ? 1 - alt : 1 / (1 + alt)
	}
}
let str_tmp = {}
let str_save = {}

let STRINGS = str
