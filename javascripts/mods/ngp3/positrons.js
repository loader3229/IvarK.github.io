var pos = {
	setup() {
		pos_save = {
			amt: 0,
			eng: 0,
			boosts: 0,
			exictons: {}
		}
		return pos_save
	},
	compile() {
		pos_save = undefined
		if (!tmp.ngp3 || qu_save === undefined) {
			this.updateTmp()
			return
		}

		let data = qu_save.pos
		if (data === undefined) data = this.setup()
		pos_save = data

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
		if (!data.swaps) data.swaps = {}

		if (data.consumedQE) delete data.consumedQE
		if (data.sacGals) delete data.sacGals
		if (data.sacBoosts) delete data.sacBoosts
		if (data.excite) delete data.excite

		this.updateTmp()
	},
	unl() {
		return tmp.ngp3 && player.masterystudies.includes("d7")
	},
	on() {
		return this.unl() && pos_save.on
	},
	toggle() {
		pos_save.on = !pos_save.on
		quantum(false, true)
	},
	maxSacMult() {
		return 0.25
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
				return x / 125
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
		var data = {}
		pos_tmp = data
		if (pos_save === undefined) return

		data.next_swaps = {...pos_save.swaps}
		data.cloud_div = {}

		this.updateCloud()
	},
	updateCloud() {
		var data = {}
		pos_tmp.cloud = data

		//Unlocks
		var unl = enB.mastered("pos", 3)
		getEl("pos_boost_div").colspan = unl ? 1 : 2
		getEl("pos_cloud_div").style.display = unl ? "" : "none"
		getEl("pos_cloud_req").textContent = unl ? "" : "To unlock Positron Cloud, you need to master 3 Positronic Boosts."
		if (!unl) return

		//Mechanic
		for (var i = 1; i <= enB.pos.max; i++) {
			var lvl = enB.pos.lvl(i)
			var nextLvl = enB.pos.lvl(i, true)
			var has = enB.mastered("pos", i)
			getEl("pos_boost" + i + "_btn").style.display = has ? "" : "none"
			if (has) {
				if (pos_tmp.cloud_div[i] != nextLvl) getEl("pos_cloud" + nextLvl + "_boosts").appendChild(getEl("pos_boost" + i + "_btn"))
				pos_tmp.cloud_div[i] = nextLvl

				getEl("pos_boost" + i + "_btn").className = pos_tmp.chosen ?
					(pos_tmp.chosen == i ? "chosenbtn posbtn" : this.canSwap(i) ? "storebtn posbtn" : "unavailablebtn posbtn") :
					(pos_tmp.next_swaps[i] ? "chosenbtn posbtn" : "storebtn posbtn")
				getEl("pos_boost" + i + "_excite").textContent = "(Tier " + lvl + (lvl != nextLvl ? " -> " + nextLvl : "") + ")"

				pos_tmp.cloud[lvl] = (pos_tmp.cloud[lvl] || 0) + 1
			}
		}

		for (var i = 1; i <= 3; i++) {
			getEl("pos_cloud" + i + "_num").textContent = "Tier " + i + ": " + (pos_tmp.cloud[i] || 0) + " / " + i * 2
			getEl("pos_cloud" + i + "_cell").className = this.isCloudRewardActive(i) ? "green" : ""
		}
	},
	updateTmpOnTick() {
		if (!this.unl()) return
		let data = pos_tmp

		//Meta Dimension Boosts or Quantum Energy -> Positrons
		pos_save.eng = 0
		if (this.on()) {
			let mdbStart = 0
			let mdbMult = 0.25

			data.sac_mdb = Math.floor(Math.max(player.meta.resets - mdbStart, 0) * mdbMult)
			data.sac_qe = qu_save.quarkEnergy / (tmp.ngp3_mul ? 9 : 3)
			pos_save.amt = Math.sqrt(Math.min(data.sac_mdb, Math.pow(data.sac_qe * 1.5, 2))) * 250
		} else {
			data.sac_mdb = 0
			data.sac_qe = 0
			pos_save.amt = 0
		}

		//Galaxies -> Charge
		let types = ["ng", "rg", "eg", "tg"]
		let pcSum = 0
		for (var i = 0; i < types.length; i++) {
			var type = types[i]
			var save_data = pos_save.gals[type]

			data["pow_" + type] = this.types[type].pow(pos_save.amt)
			save_data.sac = Math.floor(this.types[type].sacGals(data["pow_" + type]))
			save_data.pc = this.types[type].basePcGain(save_data.sac)
			pcSum += save_data.pc
		}
		pos_save.eng = Math.pow(pcSum, 4)
	},

	isCloudRewardActive(x) {
		return pos_tmp.cloud[x] >= x * 2
	},
	canSwap(x) {
		return !pos_tmp.next_swaps[x] && Math.abs(enB.pos.lvl(pos_tmp.chosen, true) - enB.pos.lvl(x, true)) == 1
	},
	swap(x) {
		if (!pos_tmp.chosen) {
			if (pos_tmp.next_swaps[x]) {
				var y = pos_tmp.next_swaps[x]
				delete pos_tmp.next_swaps[x]
				delete pos_tmp.next_swaps[y]
			} else {
				pos_tmp.chosen = x
			}
		} else if (pos_tmp.chosen == x) {
			delete pos_tmp.chosen
		} else {
			if (!this.canSwap(x)) return
			pos_tmp.next_swaps[x] = pos_tmp.chosen
			pos_tmp.next_swaps[pos_tmp.chosen] = x
			delete pos_tmp.chosen
		}
		this.updateCloud()
	},

	updateTab() {
		enB.updateOnTick("pos")

		getEl("pos_formula").textContent = getFullExpansion(pos_tmp.sac_mdb) + " Meta Dimension Boosts + " + shorten(pos_tmp.sac_qe) + " Quantum Energy ->"
		getEl("pos_toggle").textContent = pos_save.on ? "ON" : "OFF"
		getEl("pos_amt").textContent = getFullExpansion(pos_save.amt)

		let types = ["ng", "rg", "eg", "tg"]
		let msg = []
		for (var i = 0; i < types.length; i++) {
			var type = types[i]
			var gals = pos_save.gals[type].sac
			if (gals > 0 || type == "ng") msg.push(getFullExpansion(gals) + " sacrificed " + pos.types[type].galName)
		}

		getEl("pos_charge_formula").innerHTML = wordizeList(msg, false, " +<br>", false) + " -> "

		if (enB.has("pos", 4)) getEl("enB_pos4_exp").textContent = "^" + (1 / enB_tmp.pos4).toFixed(Math.floor(3 + Math.log10(enB_tmp.pos4)))
	}
}
var pos_save = undefined
var pos_tmp = {}

let POSITRONS = pos