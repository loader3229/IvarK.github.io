//FLUCTUANT FIELD
let ff = {
	unl: (force) => force ? fluc.unl() : ff_tmp.unl && ff_tmp.eff,

	data: {
		all: ["am", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"],

		f1: {
			//Superefficient
			//Quantum Eff -> Replicanti Chance Exp
			targ: () => tmp.qe && tmp.qe.exp && 1 / Math.min(2 - tmp.qe.exp * 2, 1) - 1,
			based: "Quantum Efficiency",
			req: 1,
			eff: (x) => 1,
		},
		f2: {
			//Accelerator
			//Replicanti Energy -> Replicanti Stealth
			targ: () => QCs_save && QCs_save.qc5 && Math.log10(QCs_save.qc5.add(1).log10() + 1),
			based: "Replicanti Energy",
			req: 3,
			eff: (x) => 1,
		},
		f3: {
			//Excite
			//Quantum Energy -> Higher Altitudes
			targ: () => qu_save && Decimal.add(qu_save.quarkEnergy, 1).log10(),
			based: "Quantum Energy",
			req: 5,
			eff: (x) => 1,
		},
		f4: {
			//Stretch
			//Vibration Energy -> Longer Altitudes
			targ: () => str_save && Math.log10(str_save.energy + 1),
			based: "Vibration Energy",
			req: 8,
			eff: (x) => 1,
		},
		f5: {
			//Flux
			//Positronic Charge -> Gain Exponent
			targ: () => pos_save && Decimal.add(pos_save.eng, 1).log10(),
			based: "Positronic Charge",
			req: 13,
			eff: (x) => 1,
		},
		f6: {
			//Overseer
			//Red Charge -> Obsure Galaxies
			targ: () => ff.getColorCharge("r"),
			based: "Red Charge",
			req: 21,
			eff: (x) => 1,
			effDisp: (x) => formatPercentage(x - 1),
		},
		f7: {
			//Advancement
			//Green Charge -> Extra Replicanti Compressors
			targ: () => ff.getColorCharge("g"),
			based: "Green Charge",
			req: 34,
			eff: (x) => 1,
		},
		f8: {
			//Dominant
			//Blue Charge -> Higher PB11 Cap
			targ: () => ff.getColorCharge("b"),
			based: "Blue Charge",
			req: 55,
			eff: (x) => 1,
		},

		am: {
			targ: () => 0,
			req: 1,
			based: "antimatter"
		}
	},

	setup() {
		ff_save = {
			links: {},
			arcs: {},
		}
		fluc_save.ff = ff_save
		return ff_save
	},
	compile() {
		ff_tmp = { unl: this.unl(true) }
		if (!tmp.ngp3) return

		var data = ff_save || this.setup()
		this.updateTmp()
	},

	update(diff) {
	},
	updateTmp() {
		ff_tmp = {
			unl: ff_tmp.unl
		}

		ff_tmp.unlocked = []
		ff_tmp.nextAt = 1/0
		for (var i = 0; i < ff.data.all.length; i++) {
			var id = ff.data.all[i]
			if (ff.isUnlocked(id)) ff_tmp.unlocked.push(id)
			else ff_tmp.nextAt = Math.min(ff_tmp.nextAt, ff.data[id].req)
		}

		ff.updateTmpOnTick()
	},
	updateTmpOnTick() {
		if (!ff_tmp.unl) return

		//Energy
		ff_tmp.eng = {}
		for (var i = 0; i < ff.data.all.length; i++) {
			var id = ff.data.all[i]
			ff_tmp.eng[id] = ff.getEnergy(id)
		}

		//Strength
		ff_tmp.str = {}
		for (var i = 0; i < ff.data.all.length; i++) {
			var id = ff.data.all[i]
			ff_tmp.str[id] = ff.getStrength(id)
		}

		//Boosts
		ff_tmp.eff = {}
		for (var i = 1; i <= 8; i++) {
			var id = "f" + i
			ff_tmp.eff[id] = ff.data[id].eff(ff_tmp.str[id] * ff_tmp.eng[id])
		}
	},

	updateTab() {
		for (var i = 0; i < ff.data.all.length; i++) {
			var id = ff.data.all[i]
			getEl("ff_eng_" + id).textContent = shorten(ff_tmp.eng[id]) + " Energy" + (shiftDown ? " (based on " + ff.data[id].based + ")" : " (" + formatPercentage(ff_tmp.str[id]) + "%)")
		}

		for (var i = 1; i <= 8; i++) {
			var id = "f" + i
			var eff = ff_tmp.eff[id]
			getEl("ff_eff_" + id).textContent = (ff.data[id].effDisp || shorten)(eff)
		}

		ff.updateDisplays() // Temp
	},
	updateDisplays() {
		for (var i = 0; i < ff.data.all.length; i++) {
			var id = ff.data.all[i]
			getEl("ff_btn_" + id).style.visibility = ff.isUnlocked(id) ? "visible" : "hidden"
		}
		getEl("ff_unl").textContent = ff_tmp.unlocked.length == 9 ? "" : "Next Perk unlocks at " + getFullExpansion(ff_tmp.nextAt) + " Fluctuant Energy."
	},

	getColorCharge(color) {
		let r = new Decimal(0)
		if (colorCharge !== undefined) {
			if (colorCharge.normal && colorCharge.normal.color) r = colorCharge.normal.charge
			if (colorCharge.sub && colorCharge.sub.color) r = colorCharge.sub.charge
		}
		return r.add(1).log10()
	},

	getEnergy(id) {
		return ff.data[id].targ()
	},
	getStrength(id) {
		return 1
	},
	isUnlocked(id) {
		return fluc_save.energy >= (ff.data[id].req || 0)
	},

	linkPower() {
		
	},
	clear() {
		
	},
}
let ff_tmp = {}
let ff_save
let FLUCTUANT_FIELD = ff