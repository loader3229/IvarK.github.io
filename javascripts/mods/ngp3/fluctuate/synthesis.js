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
			eff: (x) => 1,
		},
		f2: {
			//Accelerator
			//Replicanti Energy -> Replicanti Stealth
			targ: () => QCs_save && QCs_save.qc5 && Math.log10(QCs_save.qc5.add(1).log10() + 1),
			based: "Replicanti Energy",
			eff: (x) => 1,
		},
		f3: {
			//Excite
			//Quantum Energy -> Higher Altitudes
			targ: () => qu_save && qu_save.quarkEnergy.add(1).log10(),
			based: "Quantum Energy",
			eff: (x) => 1,
		},
		f4: {
			//Stretch
			//Vibration Energy -> Longer Altitudes
			targ: () => str_save && Math.log10(str_save.energy + 1),
			based: "Vibration Energy",
			eff: (x) => 1,
		},
		f5: {
			//Flux
			//Positronic Charge -> Gain Exponent
			targ: () => pos_save && pos_save.eng && pos_save.eng.add(1).log10(),
			based: "Positronic Charge",
			eff: (x) => 1,
		},
		f6: {
			//Overseer
			//Red Charge -> Obsure Galaxies
			targ: () => synt.getColorCharge("r"),
			based: "Red Charge",
			eff: (x) => 1,
			effDisp: (x) => formatPercentage(x - 1),
		},
		f7: {
			//Advancement
			//Green Charge -> Extra Replicanti Compressors
			targ: () => synt.getColorCharge("g"),
			based: "Green Charge",
			eff: (x) => 1,
		},
		f8: {
			//Dominant
			//Blue Charge -> Higher PB11 Cap
			targ: () => synt.getColorCharge("b"),
			based: "Blue Charge",
			eff: (x) => 1,
		},

		am: {
			targ: () => 0,
			based: "antimatter"
		},
		dil: {
			targ: () => 0,
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

	linkPower() {
		
	},
	clear() {
		
	},
}
let synt_tmp = {}
let synt_save
let SYNTHESIS = synt