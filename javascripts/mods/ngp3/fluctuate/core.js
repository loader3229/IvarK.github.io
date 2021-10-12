let fluc = {
	unl: (force) => force ? (fluc_save && fluc_save.energy > 0) : fluc_tmp.unl,

	setup() {
		fluc_save = {
			time: 0,
			best: 999999999,
			last10: [
				[999999999, 0], [999999999, 0],
				[999999999, 0], [999999999, 0],
				[999999999, 0], [999999999, 0],
				[999999999, 0], [999999999, 0],
				[999999999, 0], [999999999, 0],
			],
			energy: 0,
		}
		player.fluc = fluc_save
		return fluc_save
	},
	compile() {
		if (player.flun) {
			player.fluc = player.flun
			fluc_save = player.fluc
			delete player.flun
		}

		fluc_tmp = { unl: this.unl(true) }
		if (!tmp.ngp3) return

		var data = fluc_save || this.setup()
		this.updateTmp()
	},

	gain() {
		return Math.max(fluc.targ() - fluc_save.energy, 0)
	},
	targ() {
		return Math.floor((Math.log10(player.money.log10()) - 13.5) * 20 + 1)
	},
	req(x) {
		if (!x) x = fluc_save.energy
		return Decimal.pow(10, Math.pow(10, 13.5 + x / 20))
	},
	reset(auto, force) {
		if (!force) {
			if (!pH.can('fluctuate')) return
			if (!auto && !fluc.unl() && !confirm("Fluctuating resets everything that Quantum resets, but also including Quantum content. You will gain Energy in transfer, and you permanently keep your feature unlocks.")) return

			for (var i = fluc_save.last10.length - 1; i > 0; i--) fluc_save.last10[i] = fluc_save.last10[i - 1]
			var gain = fluc.gain()
			fluc_save.last10[0] = [fluc_save.time, gain]
			if (fluc_save.best > fluc_save.time) fluc_save.best = fluc_save.time

			if (fluc_save.energy == 0) {
				fluc_tmp.unl = true
				pH.onPrestige("fluctuate")
			}
			fluc_save.energy += gain
		}
		fluc.doReset()
	},
	doReset(auto, force) {
		doFluctuateResetStuff()
		handleDispOnQuantum(false)

		resetUP()
		GPminpeak = new Decimal(0)
		IPminpeak = new Decimal(0)
		bestRunIppm = new Decimal(0)
		EPminpeakType = 'normal'
		EPminpeak = new Decimal(0)
		QKminpeak = new Decimal(0)
		QKminpeakValue = new Decimal(0)
	},

	updateHeader() {
		getEl("fluctuantEnergy").textContent = getFullExpansion(fluc_save.energy)
		getEl("fluc_req").textContent = shorten(fluc.req())
	},
	updateTab() {
	},
	updateTmp() {
		
	}
}
let fluc_tmp = {}
let fluc_save
let FLUNCTATE = fluc