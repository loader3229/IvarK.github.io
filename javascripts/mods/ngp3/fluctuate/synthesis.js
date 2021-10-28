//SYNTHESIS
let synt = {
	unl: (force) => force ? fluc.unl() : synt_tmp.unl && synt_tmp.boosts,

	data: {
		f1: {
			//Quantum Eff -> Replicanti Chance Exp
			targ: () => tmp.qe && tmp.qe.exp && 1 / (1 - tmp.qe.exp) - 1,
			based: "Quantum Efficiency",
			eff: (x) => 1,
		},
		f2: {
			//Replicanti Energy -> Replicanti Stealth
			targ: () => QCs_save && QCs_save.qc5 && Math.log10(QCs_save.qc5.add(1).log10() + 1),
			based: "Replicanti Energy",
			eff: (x) => 1,
		},
		f3: {
			//Quantum Energy -> Higher Altitudes
			targ: () => qu_save && qu_save.quarkEnergy.add(1).log10(),
			based: "Quantum Energy",
			eff: (x) => 1,
		},
		f4: {
			//Vibration Energy -> Longer Altitudes
			targ: () => str_save && Math.log10(str_save.eng + 1),
			based: "Vibration Energy",
			eff: (x) => 1,
		},
		f5: {
			//Positronic Charge -> Gain Exponent
			targ: () => pos_save && pos_save.add(1).log10(),
			based: "Positronic Charge",
			eff: (x) => 1,
		},
		f6: {
			//Red Charge -> Obsure Galaxies
			targ: () => synt.getColorCharge("r"),
			based: "Red Charge",
			eff: (x) => 1,
		},
		f7: {
			//Green Charge -> Extra Replicanti Compressors
			targ: () => synt.getColorCharge("g"),
			based: "Green Charge",
			eff: (x) => 1,
		},
		f8: {
			//Blue Charge -> Higher PB11 Cap
			targ: () => synt.getColorCharge("b"),
			based: "Blue Charge",
			eff: (x) => 1,
		},

		am: {
			targ: () => 0,
			based: "antimatter"
		},
		am: {
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

		synt_tmp.boosts = {}
		for (var i = 1; i <= 8; i++) synt_tmp.boosts["f" + i] = synt.data["f" + i].eff()
	},

	updateTab() {
	},

	getEnergy(id) {
		
	},
	getColorCharge(color) {
		if (colorCharge === undefined) return new Decimal(0)
		if (colorCharge.normal && colorCharge.normal.color) return colorCharge.normal.charge
		if (colorCharge.sub && colorCharge.sub.color) return colorCharge.sub.charge
		return new Decimal(0)
	},
	getBoost(id) {
		
	},

	linkPower() {
		
	},
	clear() {
		
	},
}
let synt_tmp = {}
let synt_save
let SYNTHESIS = synt