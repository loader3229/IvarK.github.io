let str = {
	unl: () => str_tmp.unl || PCs_save.best >= 8,

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
		var data = str_save || this.setup()

		this.updateTmp()
	},

	//Updates
	updateTmp() {
		var data = str_tmp
		var effs = str_save.effs
		if (!data.unl) return

		data.vibrated = 0
		for (var e = 1; e <= 12; e++) {
			if (effs["eb" + e + "_vib"]) data.vibrated++
			if (effs["pb" + e + "_vib"]) data.vibrated++
		}
		str_save.spent = str.veCost(data.vibrated)
	},
	updateDisp() {
		getEl("stringstabbtn").style.display = PCs.unl() ? "" : "none"
		getEl("str_unl").style.display = !this.unl() ? "" : "none"
		getEl("str_div").style.display = this.unl() ? "" : "none"

		if (!str_tmp.setupHTML) return

		for (var e = 1; e <= 12; e++) {
			var alt = this.altitude("eb", e)
			getEl("str_eb" + e).className = (this.vibrated("eb", e) ? "chosenbtn" : "storebtn") + " posbtn"
			getEl("str_eb" + e).style.top = (1 - alt) * 30 + "px"
			getEl("str_eb" + e + "_altitude").textContent = alt.toFixed(2)

			var alt = this.altitude("pb", e)
			getEl("str_pb" + e).className = (this.vibrated("pb", e) ? "chosenbtn" : "storebtn") + " posbtn"
			getEl("str_pb" + e).style.top = (1 - alt) * 30 + "px"
			getEl("str_pb" + e + "_altitude").textContent = alt.toFixed(2)
		}
	},

	//Updates on tick
	updateFeatureOnTick() {
		str_save.energy = Math.max(str_save.energy, this.veGain())
	},
	updateDispOnTick() {
		if (!str_tmp.setupHTML) return

		getEl("str_ve").textContent = shorten(str.veUnspent())
	},

	//HTML + DOM elements
	setupBoost(type, x) {
		var id = type + x
		return '<div class="str_boost" id="str_' + id + '_div">' +
			(type == "bb" ?
				'<button class="unavailablebtn posbtn" id="str_' + id + '"></button>'
			:
				'<button id="str_' + id + '" onclick="str.vibrate(\'' + type + '\', ' + x + ')"><b>' + id.toUpperCase() + '</b><br>Altitude: <span id="str_' + id + '_altitude"></span></button>'
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
		return x ? Math.pow(1.1, x - 1) : 0
	},

	//Vibrations
	vibrate(type, x) {
		var id = type + x + "_vib"
		var data = str_save.effs

		if (data[id]) delete data[id]
		else {
			if (str.veUnspent() < str.veCost(str_tmp.vibrated + 1)) return
			data[id] = true
		}

		restartQuantum()
	},
	vibrated(type, x) {
		return str_save.effs[type  + x + "_vib"]
	},
	altitude(type, x) {
		return this.vibrated(type, x) ? (type == "pb" ? 1 : -1) / x : 0
	}
}
let str_tmp = {}
let str_save = {}

let STRINGS = str