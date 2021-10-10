let flun = {
	unl: (force) => force ? (flun_save && flun_save.energy > 0) : flun_tmp.unl,

	setup() {
		flun_save = {
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
		player.flun = flun_save
		return flun_save
	},
	compile() {
		flun_tmp = { unl: this.unl(true) }
		if (!tmp.ngp3) return

		var data = flun_save || this.setup()
		this.updateTmp()
	},

	gain() {
		return 1
	},
	reset(auto, force) {
		if (!force) {
			if (!pH.can('flunctate')) return
			if (!auto && !flun.unl() && !confirm("Flunctating resets everything that Quantum resets, but also including Quantum content. You will gain Energy in transfer, and you permanently keep your feature unlocks.")) return

			for (var i = flun_save.last10.length - 1; i > 0; i--) flun_save.last10[i] = flun_save.last10[i - 1]
			var gain = flun.gain()
			flun_save.last10[0] = [flun_save.time, gain]
			if (flun_save.best > flun_save.time) flun_save.best = flun_save.time

			if (flun_save.energy == 0) {
				flun_tmp.unl = true
				pH.updateActive()
			}
			flun_save.energy += gain
		}
		flun.doReset()
	},
	doReset(auto, force) {
		doFlunctateResetStuff()
		handleDispOnQuantum(false)
	},

	updateTmp() {
		
	}
}
let flun_tmp = {}
let flun_save
let FLUNCTATE = flun