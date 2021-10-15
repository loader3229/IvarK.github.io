//FLUCTUATE
let fluc = {
	unl: (force) => force ? (fluc_save && fluc_save.energy > 0) : fluc_tmp.unl,

	setup() {
		fluc_save = {
			time: 0,
			best: 999999999,
			bestAM: 0,
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
		data.bestAM = new Decimal(data.bestAM || player.money)
		this.updateTmp()
	},

	gain() {
		if (!fluc.unl()) return 1
		return Math.max(fluc.targ() - fluc_save.energy, 0)
	},
	targ() {
		return Math.floor((Math.log10(fluc_save.bestAM.log10()) - 13.5) * 20 + 1)
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

	update(diff) {
		FDs.update(diff)
	},
	updateTmp() {
		
	},
	updateTmpOnTick() {
		FDs.updateTmp()
	},

	updateHeader() {
		getEl("fluctuantEnergy").textContent = getFullExpansion(fluc_save.energy)
	},
	updateTab() {
		getEl("fluc_req").textContent = shorten(fluc.req())
	}
}
let fluc_tmp = {}
let fluc_save
let FLUNCTATE = fluc

//FLUCTUATE DIMENSIONS
let FDs = {
	setup() {
		FDs_save = {
			shards: 0,
			spent: 0,
			meta: 0
		}
		for (var i = 1; i <= 8; i++) FDs_save[i] = { amt: 0, bgt: 0 }
		fluc_save.dims = FDs_save
		return FDs_save
	},
	compile() {
		FDs_tmp = {}
		if (!fluc_save) return

		var data = FDs_save || this.setup()
		data.meta = new Decimal(data.meta)
		for (var i = 1; i <= 8; i++) FDs_save[i].amt = new Decimal(FDs_save[i].amt)
	},

	update(diff) {
		var eng = fluc_save.energy
		FDs_save.shards = Math.max(FDs_save.shards, Math.floor(eng * Math.min(eng / 2 + 2, 8)))

		for (var i = 7; i >= 1; i--) FDs_save[i].amt = FDs_save[i].amt.add(FDs_save[i+1].amt.times(this.dimMult(i + 1)).times(diff / 50))
		FDs_save.meta = FDs_save.meta.add(FDs_save[1].amt.times(this.dimMult(1)).times(diff))
	},
	updateTmp() {
		if (!fluc.unl()) return
		var eng_log = FDs_save.meta.add(1).log10()
		FDs_tmp = {
			eff_rep: Math.pow(1.01, eng_log),
			eff_qe: (3 / 1.75 - 1) * Math.min(eng_log / 150, 1) + 1
		}
	},
	updateDisp() {
		getEl("fd_ds").textContent = shortenDimensions(this.unspent())
		getEl("fd_me").textContent = shortenMoney(FDs_save.meta)
		getEl("fd_eff_rep").textContent = "^" + shorten(FDs_tmp.eff_rep)
		getEl("fd_eff_qe").textContent = "^" + shorten(FDs_tmp.eff_qe)

		for (var i = 1; i <= 8; i++) {
			getEl("fd" + i + "_row").style.display = i == 1 || FDs_save[i - 1].bgt > 0 ? "" : "none"
			getEl("fd" + i).textContent = DISPLAY_NAMES[i] + " Fluctuant Dimension x" + shorten(this.dimMult(i))
			getEl("fd" + i + "_amt").textContent = shortenDimensions(FDs_save[i].amt)
			getEl("fd" + i + "_buy").textContent = shortenDimensions(this.cost(i)) + " DS"
			getEl("fd" + i + "_buy").className = this.unspent() >= this.cost(i) ? "storebtn" : "unavailablebtn"
		}
	},

	unspent() {
		return FDs_save.shards - FDs_save.spent
	},
	buy(x) {
		let cost = FDs.cost(x)
		if (!(FDs.unspent() >= cost)) return
		FDs_save.spent += cost
		FDs_save[x].bgt++
		FDs_save[x].amt = FDs_save[x].amt.add(1)
	},
	cost(x) {
		return Math.min(FDs_save[x].bgt * 2 + x, 12)
	},
	dimMult(x) {
		var r = Decimal.pow(2.5, FDs_save[x].bgt - 1).max(1)
		if (hasAch("ng3p31")) r = r.times(1.5)
		return r
	}
}
let FDs_tmp = {}
let FDs_save
let FLUNCTANT_DIMS = FDs