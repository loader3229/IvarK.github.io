//SYNTHESIS
let synt = {
	unl: (force) => force ? fluc.unl() : synt_tmp.unl && synt_tmp.eff,

	data: {
		all: ["am", "dil", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"],

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
			req: 2,
			eff: (x) => 1,
		},
		f3: {
			//Excite
			//Quantum Energy -> Higher Altitudes
			targ: () => qu_save && Decimal.add(qu_save.quarkEnergy, 1).log10(),
			based: "Quantum Energy",
			req: 1/0,
			eff: (x) => 1,
		},
		f4: {
			//Stretch
			//Vibration Energy -> Longer Altitudes
			targ: () => str_save && Math.log10(str_save.energy + 1),
			based: "Vibration Energy",
			req: 1/0,
			eff: (x) => 1,
		},
		f5: {
			//Flux
			//Positronic Charge -> Gain Exponent
			targ: () => pos_save && Decimal.add(pos_save.eng, 1).log10(),
			based: "Positronic Charge",
			req: 1/0,
			eff: (x) => 1,
		},
		f6: {
			//Overseer
			//Red Charge -> Obsure Galaxies
			targ: () => synt.getColorCharge("r"),
			based: "Red Charge",
			req: 1/0,
			eff: (x) => 1,
			effDisp: (x) => formatPercentage(x - 1),
		},
		f7: {
			//Advancement
			//Green Charge -> Extra Replicanti Compressors
			targ: () => synt.getColorCharge("g"),
			based: "Green Charge",
			req: 1/0,
			eff: (x) => 1,
		},
		f8: {
			//Dominant
			//Blue Charge -> Higher PB11 Cap
			targ: () => synt.getColorCharge("b"),
			based: "Blue Charge",
			req: 1/0,
			eff: (x) => 1,
		},

		am: {
			targ: () => 0,
			req: 1,
			based: "antimatter"
		},
		dil: {
			targ: () => 0,
			req: 1/0,
			based: "dilation runs"
		}
	},

	setup() {
		synt_save = {
			am: {},
			dil: {},

			f1: {},
			f2: {},
			f3: {},
			f4: {},
			f5: {},
			f6: {},
			f7: {},
			f8: {},
		}
		fluc_save.synt = synt_save
		return synt_save
	},
	compile() {
		synt_tmp = { unl: this.unl(true) }
		if (!tmp.ngp3) return

		var data = synt_save || this.setup()
		this.updateTmp()
	},

	update(diff) {
	},
	updateTmp() {
		synt_tmp = {
			unl: synt_tmp.unl
		}

		synt_tmp.unlocked = []
		synt_tmp.nextAt = 1/0
		for (var i = 0; i < synt.data.all.length; i++) {
			var id = synt.data.all[i]
			if (synt.isUnlocked(id)) synt_tmp.unlocked.push(id)
			else synt_tmp.nextAt = Math.min(synt_tmp.nextAt, synt.data[id].req)
		}

		synt.updateTmpOnTick()
	},
	updateTmpOnTick() {
		if (!synt_tmp.unl) return

		//Energy
		synt_tmp.eng = {}
		for (var i = 0; i < synt.data.all.length; i++) {
			var id = synt.data.all[i]
			synt_tmp.eng[id] = synt.getEnergy(id)
		}

		//Strength
		synt_tmp.str = {}
		for (var i = 0; i < synt.data.all.length; i++) {
			var id = synt.data.all[i]
			synt_tmp.str[id] = synt.getStrength(id)
		}

		//Boosts
		synt_tmp.eff = {}
		for (var i = 1; i <= 8; i++) {
			var id = "f" + i
			synt_tmp.eff[id] = synt.data[id].eff(synt_tmp.str[id] * synt_tmp.eng[id])
		}
	},

	updateTab() {
		for (var i = 0; i < synt.data.all.length; i++) {
			var id = synt.data.all[i]
			getEl("synt_eng_" + id).textContent = shorten(synt_tmp.eng[id]) + " Energy" + (shiftDown ? " (based on " + synt.data[id].based + ")" : " (" + formatPercentage(synt_tmp.str[id]) + "%)")
		}

		for (var i = 1; i <= 8; i++) {
			var id = "f" + i
			var eff = synt_tmp.eff[id]
			getEl("synt_eff_" + id).textContent = (synt.data[id].effDisp || shorten)(eff)
		}

		synt.updateDisplays() // Temp
	},
	updateDisplays() {
		for (var i = 0; i < synt.data.all.length; i++) {
			var id = synt.data.all[i]
			getEl("synt_btn_" + id).style.visibility = synt.isUnlocked(id) ? "visible" : "hidden"
		}
		getEl("synt_unl").textContent = synt_tmp.unlocked.length == 10 ? "" : "Next Synthesizer unlocks at " + getFullExpansion(synt_tmp.nextAt) + " Fluctuant Energy."
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
		return synt.data[id].targ()
	},
	getStrength(id) {
		return 1
	},
	isUnlocked(id) {
		return fluc_save.energy >= (synt.data[id].req || 0)
	},

	linkPower() {
		
	},
	clear() {
		
	},
}
let synt_tmp = {}
let synt_save
let SYNTHESIS = synt