let str = {
	unl: (force) => force ? (PCs_save && PCs_save.best >= 8) : str_tmp.unl,

	//Data
	data: {
		letters: ["α", "β", "γ"],
		names: ["Alpha", "Beta", "Gamma"],
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
		if (!data.unl) return

		var vibrated = str_save.vibrated
		var all = this.data.all

		data.alt = {}
		data.disable = {}
		data.vibrated = vibrated.length
		for (var i = 0; i < data.vibrated; i++) this.onVibrate(vibrated[i])
		str_save.spent = str.veCost(data.vibrated)

		//Powers
		data.powers = {}
		for (var i = 1; i <= 12; i++) {
			var pow = Math.ceil(i / 4)
			data.powers[pow] = (data.powers[pow] || 0) + this.altitude(i)
		}
	},
	updateDisp() {
		getEl("stringstabbtn").style.display = PCs.unl() ? "" : "none"

		var unl = this.unl()
		getEl("str_unl").style.display = !unl ? "" : "none"
		getEl("str_div").style.display = unl ? "" : "none"
		if (unl) getEl("str_cost").textContent = "(the next one costs " + shorten(this.veCost(str_tmp.vibrated + 1) - this.veCost(str_tmp.vibrated)) + ")"

		if (!str_tmp.setupHTML) return

		for (var e = 1; e <= 12; e++) {
			var pos = this.data.pos[id]
			var alt = this.altitude(e)
			getEl("str_" + e + "_altitude").textContent = alt.toFixed(3)
			getEl("str_" + e).style.top = (1 - alt) * 72 + "px"
		}
	},

	//Updates on tick
	updateTmpOnTick() {
		var data = str_tmp
		if (!data.unl) return

		data.str = Math.max(Math.log2(str_save.energy * 4) / 4, 1)
	},
	updateDispOnTick() {
		if (!str_tmp.setupHTML || !str_tmp.unl) return

		let ve = str.veUnspent()
		getEl("str_ve").textContent = (ve < 0 ? "-" : "") + shorten(Math.abs(ve))
		getEl("str_warn").textContent = ve < 0 ? "Strings have been disabled due to spending too many Vibration Energy!" : "WARNING: Vibrating costs Vibration Energy, and also performs a Quantum reset!"

		for (var i = 1; i <= 12; i++) {
			var alt = str.altitude(i)
			getEl("str_" + i + "_eff").textContent = (alt < 0 ? "-" : "+") + shorten(Math.abs(alt) * str_tmp.str) + " to " + str.data.names[Math.ceil(i / 4) - 1]
			getEl("str_" + i).className = (str_save.vibrated.includes(i) ? "chosenbtn2" : str.vibrated(i) ? (str_tmp.disable[i] > i ? "chosenbtn3" : "chosenbtn") : str.canVibrate(i) ? "storebtn" : "unavailablebtn") + " pos_btn"
		}

		for (var p = 1; p <= 3; p++) {
			var pow = str_tmp.powers[p]
			getEl("str_" + p + "_power").textContent = str.data.names[p-1] + ": " + (pow < 0 ? "-" : "") + shorten(Math.abs(pow) * str_tmp.str)

			var pb_nerf = str.nerf_pb(p * 4)
			getEl("str_" + p + "_eb_eff").textContent = shorten(str.eff_eb(p * 4)) + "x stronger to Entangled Boosts " + (p * 4 - 3) + " - " + (p * 4)
			getEl("str_" + p + "_eb_nerf").innerHTML = pow < 0 ? "<b class='warning'>Effective at " + shorten(str.nerf_pb(p * 4)) + " Quantum Power</b>" : ""
			getEl("str_" + p + "_pb_eff").textContent = "+" + shorten(str.eff_pb(p * 4)) + "x charge multiplier to Positronic Boosts " + (p * 4 - 3) + " - " + (p * 4)
			getEl("str_" + p + "_pb_nerf").innerHTML = pb_nerf == 1 ? "" : "<b class='" + (pb_nerf < 1 ? "charged" : "warning") + "'>" + (pb_nerf < 1 ? "/" + shorten(1 / pb_nerf) : shorten(pb_nerf) + "x") + " charge requirement</b>"
		}
		getEl("str_strength").textContent = "Manifold Surgery: " + shorten(str_tmp.str) + "x strength to String boosts"
	},
	updateFeatureOnTick() {
		str_save.energy = Math.max(str_save.energy, this.veGain())
	},

	//HTML + DOM elements
	setupBoost(x) {
		return '<div class="str_boost' + '" id="str_' + x + '_div">' +
			'<button id="str_' + x + '" onclick="str.vibrate(' + x + ')">' +
			'<b>' + str.data.letters[Math.ceil(x / 4) - 1] + ((x - 1) % 4 + 1) + '</b><br>' +
			'<span id="str_' + x + '_eff"></span></button>' +
			'<br><span id="str_' + x + '_altitude"></span></div>'
	},
	setupHTML() {
		if (str_tmp.setupHTML) return
		str_tmp.setupHTML = true

		var html = ""
		for (var e = 1; e <= 12; e++) html += this.setupBoost(e)
		getEl("str_boosts").innerHTML = html

		str.updateDisp()
	},

	//Vibration Energy
	veGain() {
		let r = qu_save.quarkEnergy.add(1).log10()
		r *= Math.log10(QCs_save.qc5.add(1).log10() + 1)
		r *= Math.pow(4, PCs_save.lvl / 8 - 1)
		return r
	},
	veUnspent() {
		return str_save.energy - str_save.spent
	},
	veCost(x) {
		return x ? Math.pow(2.25, x - 1) : 0
	},

	//Vibrations
	canVibrate(x) {
		if (str_tmp.disable[x] !== undefined) return
		if (str_save.energy < str.veCost(str_tmp.vibrated + 1)) return
		return true
	},
	vibrate(x) {
		if (str_tmp.disable[x]) {
			var disable = str_tmp.disable[x]
			var vibrated = str_save.vibrated
			var new_vibrated = []
			for (var i = 0; i < vibrated.length; i++) if (vibrated[i] != disable) new_vibrated.push(vibrated[i])
			str_save.vibrated = new_vibrated
		} else {
			if (!str.canVibrate(x)) return
			str_save.vibrated.push(x)
		}
	
		if (str.veUnspent() < 0 || dev.noReset) {
			str.updateTmp()
			str.updateDisp()
		} else restartQuantum(true)
	},
	vibrated(x) {
		return str.unl() && ((str_save.vibrated && str_save.vibrated.includes(x)) || str_tmp.disable[x])
	},
	onVibrate(x) {
		for (var p = -3; p <= 3; p++) {
			var d = Math.abs(p) + 1
			var y = p + x
			var add = 2 * (d % 2) / ((d - 1) / 3 + 1) - 1
			if (add < 0) add *= -add / 3
			add /= 2
			str_tmp.alt[y] = (str_tmp.alt[y] || 0) + add
		}

		str_tmp.disable[x] = x
	},

	//Altitudes
	altitude(x, next) {
		if (this.disabled()) return
		let r = str_tmp.alt[x] || 0
		if (r < 0) r /= 2
		return Math.max(Math.min(r, 1), -1)
	},
	eff(x) {
		if (!str.unl()) return 0
		let r = str_tmp.powers[Math.ceil(x / 4)]
		r *= str_tmp.str
		return r
	},
	eff_eb(x) {
		let exp = 1
		return Math.pow(1 + Math.abs(this.eff(x)), exp)
	},
	eff_pb(x) {
		return Math.abs(this.eff(x)) * 8
	},
	nerf_eb(x) {
		var alt = this.eff(x)
		return alt < 0 ? -alt * 3e3 : 0
	},
	nerf_pb(x) {
		var alt = this.eff(x)
		return alt < 0 ? Math.pow(1 - alt, 4) : Math.pow(2, -alt)
	},

	//Presets
	exportPreset() {
		let str = []
		let letters = " abcdefghijklmnopqrstuvwxyz"
		for (var i = 0; i < str_save.vibrated.length; i++) {
			var letter = letters[str_save.vibrated[i]]
			if (i % 2 == 1) letter = letter.toUpperCase()
			str += letter
		}

		copyToClipboard(str)
	},
	getPreset(x) {
		let letters = " abcdefghijklmnopqrstuvwxyz"
		let rev_letters = {}
		for (var i = 1; i <= 26; i++) rev_letters[letters[i]] = i

		let set = []
		for (var i = 0; i < x.length; i++) set.push(rev_letters[x[i].toLowerCase()])
		return set
	},
	importPreset() {
		var x = prompt("WARNING! Importing a preset will restart your Quantum run!")
		x = str.getPreset(x)

		str_save.vibrated = []
		str_save.spent = 0
		var ve = str_save.energy
		for (var i = 0; i < x.length; i++) {
			var k = x[i]
			if (str.canVibrate(k)) {
				str_save.vibrated.push(k)
				str_save.spent = str.veCost(str_save.vibrated.length)
			}
		}

		restartQuantum()
	},

	//Others
	clear() {
		if (!confirm("Are you sure?")) return

		str_save.vibrated = []
		str_save.spent = 0
		restartQuantum()
	},
	disabled() {
		return !str.unl() || this.veUnspent() < 0
	}
}
let str_tmp = {}
let str_save = {}

let STRINGS = str

/* TO DO:
- NEVER ADD SOMETHING THAT WORKS LIKE VIBRATERS. IT WOULD MAKE STRINGS MORE COMPLICATED.

V1. Stretchers: Vibraters vibrate more boosts.
V2. Amplifiers: Vibraters increase the altitudes.
V3. Generators: Vibraters make charged boosts generate Vibration Energy.
V4. Stablizers: Boosts decay less from the center of Vibraters.
V5. Condensers: Vibraters cover one less boost from choosing.

S1. Shrunkers: More boosts are overlapped.
S2. Exciters: Boosts with positive altitudes are stronger.
S3. Boosters: The main boosts from strings are stronger.
	(2x stronger makes boosts act like they have 2x altitude.)
S4. Altituders: Boosts have 0.1 altitude farther away from 0.
S5. Zoomers: Altitudes are rooted by an exponent.

MIGHT SCRAP THAT:
1. Chargers: Reduce the penalties of negative altitudes.

WHY?!
B1. ???: Vibration Energy generate extra Quantum Energy.
B2. ???: Vibraters increase the quantum efficiency.
B3. ???: The closest altitude to 0 boosts ???.
B4. ???: Positronic Charge adds the efficiency of Quantum Energy in Vibration Energy gain.
B5. String Prestiges: They works like prestiges, which buffs String boosts, but reduce the altitudes.
*/