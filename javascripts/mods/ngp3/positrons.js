let POSITRONS = {
	setup() {
		return {
			amt: 0,
			eng: 0,
			boosts: 0
		}
	},
	compile() {
		pos.save = undefined
		if (tmp.qu === undefined) return

		let data = tmp.qu.pos
		if (data === undefined) data = pos.setup()
		pos.save = data

		if (!data.on) {
			data.amt = 0
			data.eng = 0
		}
		if (!data.boosts) data.boosts = 0
		if (!data.gals) data.gals = {
			ng: {sac: 0, qe: 0, pc: 0},
			rg: {sac: 0, qe: 0, pc: 0},
			eg: {sac: 0, qe: 0, pc: 0},
			tg: {sac: 0, qe: 0, pc: 0}
		}

		if (data.consumedQE) delete data.consumedQE
		if (data.sacGals) delete data.sacGals
		if (data.sacBoosts) delete data.sacBoosts
	},
	unl() {
		return tmp.quActive && pos.save && masteryStudies.has("d7")
	},
	on() {
		return pos.unl() && pos.save.on
	},
	toggle() {
		pos.save.on = !pos.save.on
		quantum(false, true)
	},
	maxSacMult() {
		return QCs.isRewardOn(2) ? QCs.tmp.rewards[2] : 0.25
	},
	types: {
		ng: {
			galName: "Antimatter Galaxies",
			pow(x) {
				return x / 4
			},
			sacGals(x) {
				return Math.min(player.galaxies / 4, x)
			},
			basePcGain(x) {
				return x / 200
			}
		},
		rg: {
			galName: "base Replicated Galaxies",
			pow(x) {
				return 0
			},
			sacGals(x) {
				return 0
			},
			basePcGain(x) {
				return x
			}
		},
		eg: {
			galName: "extra Replicated Galaxies",
			pow(x) {
				return 0
			},
			sacGals(x) {
				return 0
			},
			basePcGain(x) {
				return x
			}
		},
		tg: {
			galName: "Tachyonic Galaxies",
			pow(x) {
				return 0
			},
			sacGals(x) {
				return 0
			},
			basePcGain(x) {
				return x
			}
		}
	},
	updateTmp() {
		let data = {}
		pos.tmp = data
		if (!pos.save) return

		//Meta Dimension Boosts or Quantum Energy -> Positrons
		pos.save.eng = 0
		if (pos.on()) {
			let mdbStart = 15
			let mdbMult = 0.25
			if (QCs.isRewardOn(5)) mdbMult = QCs.tmp.rewards[5]

			data.sac_mdb = Math.floor(Math.max(player.meta.resets - mdbStart, 0) * mdbMult)
			data.sac_qe = tmp.qu.quarkEnergy / (tmp.ngp3_mul ? 9 : 3)
			pos.save.amt = Math.floor(Math.min(Math.pow(data.sac_mdb, 2), data.sac_qe) * 100)
		} else {
			data.sac_mdb = 0
			data.sac_qe = 0
			pos.save.amt = 0
		}

		//Galaxies -> Charge
		let types = ["ng", "rg", "eg", "tg"]
		let pcSum = 0
		for (var i = 0; i < types.length; i++) {
			var type = types[i]
			var save_data = pos.save.gals[type]

			data["pow_" + type] = pos.types[type].pow(pos.save.amt)
			save_data.sac = Math.floor(pos.types[type].sacGals(data["pow_" + type]))
			save_data.pc = pos.types[type].basePcGain(save_data.sac)
			pcSum += Math.sqrt(save_data.pc)
		}
		pos.save.eng = Math.pow(pcSum, 4)
	},
	updateTab() {
		enB.update("pos")
		enB.updateOnTick("pos")

		getEl("pos_formula").textContent = getFullExpansion(pos.tmp.sac_mdb) + " Meta Dimension Boosts + " + shorten(pos.tmp.sac_qe) + " Quantum Energy ->"
		getEl("pos_toggle").textContent = pos.save.on ? "ON" : "OFF"
		getEl("pos_amt").textContent = getFullExpansion(pos.save.amt)

		let types = ["ng", "rg", "eg", "tg"]
		let msg = []
		for (var i = 0; i < types.length; i++) {
			var type = types[i]
			var gals = pos.save.gals[type].sac
			if (gals > 0 || type == "ng") msg.push(getFullExpansion(gals) + " sacrificed " + pos.types[type].galName)
		}

		getEl("pos_charge_formula").innerHTML = wordizeList(msg, false, " +<br>", false) + " -> "
	
		if (enB.has("pos", 3)) getEl("enB_pos3_exp").textContent = "^" + (1 / enB.tmp.pos3).toFixed(Math.floor(3 + Math.log10(enB.tmp.pos3)))
	}
}
let pos = POSITRONS