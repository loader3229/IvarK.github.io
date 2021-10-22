//SYNTHESIS
let synt = {
	unl: (force) => force ? fluc.unl() : synt_tmp.unl,

	data: {
		f1: {
			targ: () => qu_save && qu_save.quarkEnergy.log10(),
			eff: (x) => 1,
		},
		f2: {
			targ: () => QCs_save && QCs_save.qc5 && QCs_save.qc5.log10(),
			eff: (x) => 1,
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
		if (!synt.unl()) return
		synt_tmp.boosts = {}
		synt_tmp.boosts.f1 = synt.data.f1.eff()
		synt_tmp.boosts.f2 = synt.data.f2.eff()
	},

	updateTab() {
	},

	getEnergy(id) {
		
	},
	getBoost(id) {
		
	},
}
let synt_tmp = {}
let synt_save
let SYNTHESIS = synt