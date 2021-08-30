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
		str_tmp = { unl: this.unl(true) }
		if (!tmp.ngp3 || qu_save === undefined) return

		this.data.all = []
		for (var i = 1; i <= 12; i++) {
			this.data.all.push("eb" + i)
			this.data.pos["eb" + i] = i + 4

			this.data.all.push("pb" + i)
			this.data.pos["pb" + i] = i
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
		data.vibrated = vibrated.length
		for (var i = 0; i < data.vibrated; i++) this.onVibrate(vibrated[i])
		str_save.spent = str.veCost(data.vibrated)

		var tiers = {}
		data.order = {}
		data.rev_order = {}
		for (var i = 1; i <= 12; i++) {
			var tier = enB.pos.lvl(i)
			tiers[tier] = (tiers[tier] || 0) + 1
			data.order[(tier - 1) * tier + tiers[tier]] = i
			data.rev_order[i] = (tier - 1) * tier + tiers[tier]
		}
	},
	updateDisp() {
		getEl("stringstabbtn").style.display = PCs.unl() ? "" : "none"

		var unl = this.unl()
		getEl("str_unl").style.display = !unl ? "" : "none"
		getEl("str_div").style.display = unl ? "" : "none"
		if (unl) getEl("str_cost").textContent = "(the next one costs " + shorten(this.veCost(str_tmp.vibrated + 1) - this.veCost(str_tmp.vibrated)) + ")"

		if (!str_tmp.setupHTML) return

		var all = this.data.all
		for (var e = 0; e < all.length; e++) {
			var id = all[e]
			var num = this.conv(id.split("b")[1])
			var pos = this.data.pos[id]
			var alt = this.altitude(pos)
			getEl("str_" + id + "_title").textContent = (id.split("b")[0] + "b" + num).toUpperCase()
			getEl("str_" + id + "_altitude").textContent = this.altitude(pos).toFixed(2) + (pos % 4 == 1 ? " altitude" : "")
			getEl("str_" + id).className = (str_save.vibrated.includes(pos) ? "chosenbtn" : this.vibrated(pos) ? "chosenbtn2" : this.canVibrate(pos) ? "storebtn" : "unavailablebtn") + " posbtn"
			getEl("str_" + id).style.top = (1 - alt) * 72 + "px"
		}
	},

	//Updates on tick
	updateTmpOnTick() {
		var data = str_tmp
		if (!data.unl) return

		data.str = Math.max(str.veUnspent() - 3, 1)
	},
	updateDispOnTick() {
		if (!str_tmp.setupHTML || !str_tmp.unl) return

		getEl("str_ve").textContent = shorten(str.veUnspent())
		getEl("str_strength").textContent = "Altitude Power: " + formatPercentage(str_tmp.str) + "%"

		for (var i = 1; i <= 12; i++) {
			var eb_id = str.conv(i)
			var eb_pos = str.data.pos["eb" + i]
			getEl("str_eb" + i).setAttribute('ach-tooltip', "Boost: " + enB.glu[eb_id].dispFull(enB_tmp["glu" + eb_id]))
			getEl("str_eb" + i + "_eff").textContent = formatPercentage(str.eff_eb(i) - 1) + "% stronger"
			getEl("str_eb" + i + "_nerf").innerHTML = str.altitude(eb_pos) < 0 ? "at " + shorten(str.nerf_eb(i)) + "<br>effective boosters" : ""

			var pb_id = str.conv(i)
			var pb_pos = str.data.pos["pb" + i]
			var pb_nerf = str.nerf_pb(i)
			getEl("str_pb" + i).setAttribute('ach-tooltip', "Boost: " + enB.pos[pb_id].dispFull(enB_tmp["pos" + pb_id]))
			getEl("str_pb" + i + "_eff").textContent = "+" + shorten(str.eff_pb(i)) + "x charge"
			getEl("str_pb" + i + "_nerf").className = pb_nerf < 1 ? "charged" : pb_nerf > 1 ? "warning" : ""
			getEl("str_pb" + i + "_nerf").innerHTML = (pb_nerf < 1 ? "/" + shorten(1 / pb_nerf) : shorten(pb_nerf) + "x") + "<br>requirement"
		}
	},
	updateFeatureOnTick() {
		str_save.energy = Math.max(str_save.energy, this.veGain())
	},

	//HTML + DOM elements
	setupBoost(type, x, fix) {
		var id = type + x
		return '<div class="str_boost' + (fix ? " fix" : "") + '" id="str_' + id + '_div">' +
			'<button id="str_' + id + '" onclick="str.vibrate(\'' + type + '\', ' + x + ')">' +
			'<b id="str_' + id + '_title"></b><br>' +
			'<span id="str_' + id + '_eff"></span><br>' +
			'<b class="warning" id="str_' + id + '_nerf" style="font-size: 8px"></b></button>' +
			'<br><span id="str_' + id + '_altitude"></span></div>'
	},
	setupHTML() {
		if (str_tmp.setupHTML) return
		str_tmp.setupHTML = true

		var html = this.setupBoost("", 0, true)
		for (var e = 1; e <= 12; e++) html += this.setupBoost("eb", e)
		getEl("str_boosts_ent").innerHTML = html

		var html = this.setupBoost("", 0, true)
		for (var p = 1; p <= 12; p++) html += this.setupBoost("pb", p)
		getEl("str_boosts_pos").innerHTML = html

		str.updateDisp()
	},

	//Vibration Energy
	veGain() {
		return qu_save.quarkEnergy.add(1).log10() * Math.log10(QCs_save.qc5.add(1).log10() + 1)
	},
	veUnspent() {
		return str_save.energy - str_save.spent
	},
	veCost(x) {
		return x ? Math.pow(2, x - 2) : 0
	},

	//Vibrations
	canVibrate(x) {
		if (str_save.energy < str.veCost(str_tmp.vibrated + 1)) return
		return true
	},
	vibrate(type, x) {
		var id = str.data.pos[type + x]
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
		for (var p = -2; p <= 2; p++) {
			var y = p + x
			str_tmp.alt[y] = (str_tmp.alt[y] || 0) + (1 - 2 * (Math.abs(p) % 2)) / (Math.abs(p) + 2)
		}

		str_tmp.disable[x - 1] = x
		str_tmp.disable[x] = x
		str_tmp.disable[x + 1] = x
	},

	//Altitudes
	altitude(x) {
		return this.unl() ? Math.max(Math.min(str_tmp.alt[x] || 0, 1), -1) : 0
	},
	conv(x, rev) {
		return !str.unl() ? x : rev ? str_tmp.rev_order[x] : str_tmp.order[x]
	},
	eff_eb(x) {
		return 1 + Math.abs(this.altitude(this.data.pos["eb" + x])) * str_tmp.str
	},
	eff_pb(x) {
		return Math.abs(this.altitude(this.data.pos["pb" + x])) * 8 * str_tmp.str
	},
	nerf_eb(x) {
		var alt = this.altitude(this.data.pos["eb" + x]) * str_tmp.str
		return alt < 0 ? -alt * 1e3 : 0
	},
	nerf_pb(x) {
		var alt = this.altitude(this.data.pos["pb" + x]) * str_tmp.str
		return alt < 0 ? 1 - alt : 1 / (1 + alt)
	}
}
let str_tmp = {}
let str_save = {}

let STRINGS = str
