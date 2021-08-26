var pos = {
	setup() {
		pos_save = {
			on: false,
			amt: 0,
			eng: 0,
			boosts: 0,
			swaps: {}
		}
		qu_save.pos = pos_save
		return pos_save
	},
	compile() {
		if (!tmp.ngp3 || qu_save === undefined) {
			this.updateTmp()
			return
		}

		let data = pos_save || this.setup()

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
		if (data.exictons) delete data.exictons
		if (data.excite) delete data.excite

		pos_tmp.tab = enB.mastered("pos", 2) ? "cloud" : "boost"
		this.updateTmp()
	},
	unl() {
		return tmp.ngp3 && player.masterystudies.includes("d7")
	},
	on() {
		return this.unl() && pos_save && pos_save.on
	},
	toggle() {
		if (pos_save.on && !confirm("You will lose access to Positronic Boosts except the mastered ones. Are you sure?")) return
		pos_save.on = !pos_save.on
		restartQuantum()
	},
	types: {
		ng: {
			galName: "Antimatter Galaxies",
			pow(x) {
				return x * pos_tmp.mults.gal
			},
			sacGals(x) {
				return Math.min(player.galaxies / 4, x)
			},
			basePcGain(x) {
				return Math.pow(x * pos_tmp.mults.base_pc, 2)
			}
		},
		rg: {
			galName: "base Replicated Galaxies",
			pow(x) {
				return QCs.done(4) ? x * pos_tmp.mults.gal * (PCs.milestoneDone(41) ? 3 : 2) / 5 : 0
			},
			sacGals(x) {
				return Math.min(player.replicanti.galaxies / 4, x)
			},
			basePcGain(x) {
				return Math.pow(x * pos_tmp.mults.base_pc, 2)
			}
		},
		eg: {
			galName: "extra Replicated Galaxies",
			pow(x) {
				return PCs.milestoneDone(43) ? x * pos_tmp.mults.gal / 5 : 0
			},
			sacGals(x) {
				return Math.min(tmp.extraRG * pos_tmp.mults.gal, x)
			},
			basePcGain(x) {
				return Math.pow(x * pos_tmp.mults.base_pc, 2)
			}
		},
		tg: {
			galName: "Tachyonic Galaxies",
			pow(x) {
				return 0 //x / 4
			},
			sacGals(x) {
				return Math.min(player.dilation.freeGalaxies * pos_tmp.mults.gal, x)
			},
			basePcGain(x) {
				return Math.pow(x * pos_tmp.mults.base_pc, 2)
			}
		}
	},
	updateTmp() {
		var data = { tab: pos_tmp.tab }
		pos_tmp = data
		if (pos_save === undefined) return

		data.next_swaps = {...pos_save.swaps}
		data.cloud_div = {}

		data.mults = {
			mdb: QCs.done(3) ? (PCs.milestoneDone(31) ? 1/3 : 0.3) : 0.25,
			mdb_eff: QCs.done(5) ? 1.5 : 1,
			gal: QCs.done(5) ? 0.2 : 0.25,
			base_pc: QCs.done(5) ? 1 / 100 : 1 / 125
		}
		if (PCs.milestoneDone(51)) data.mults.base_pc *= 1.2

		this.updateCloud()
	},
	updateCloud(quick) {
		pos_tmp.cloud = {}

		//Unlocks
		var unl = enB.mastered("pos", 2)
		getEl("pos_tab").style.display = unl ? "" : "none"
		getEl("pos_tab").textContent = pos_tmp.tab == "cloud" ? "Show boosts" : "Show cloud"
		getEl("pos_boost_div").style.display = pos_tmp.tab == "boost" ? "" : "none"
		getEl("pos_cloud_div").style.display = pos_tmp.tab == "cloud" ? "" : "none"
		getEl("pos_cloud_req").innerHTML = unl || !enB.has("pos", 2) ? "" : "<br>To unlock Positron Cloud, you need to get " + getFullExpansion(enB.getMastered("pos", 2)) + " Positronic Boosters."
		getEl("pos_cloud_disabled").style.display = this.swapsDisabled() ? "" : "none"

		data = {
			total: 0,
			exclude: 0,
			swaps: pos.getSwaps(),
			swaps_amt: 0,
			swaps_next: 0,
		}
		pos_tmp.cloud = data

		//Mechanic
		data.swaps = pos.getSwaps()
		for (var i = 1; i <= enB.pos.max; i++) {
			var originalLvl = enB.pos[i].tier
			var lvl = enB.pos.lvl(i)
			var nextLvl = enB.pos.lvl(i, true)

			var has = enB.mastered("pos", i)
			var excluded = pos.excluded(i)

			getEl("pos_boost" + i + "_btn").style.display = has ? "" : "none"
			if (has) {
				if (pos_tmp.cloud_div[i] != nextLvl) getEl("pos_cloud" + nextLvl + "_boosts").appendChild(getEl("pos_boost" + i + "_btn"))
				pos_tmp.cloud_div[i] = nextLvl

				getEl("pos_boost" + i + "_btn").className = pos_tmp.chosen ? (pos_tmp.chosen == i ? "chosenbtn posbtn" : this.canSwap(i) ? "storebtn posbtn" : "unavailablebtn posbtn") :
					excluded ? "unavailablebtn posbtn" :
					(pos_tmp.next_swaps[i] ? "chosenbtn posbtn" : lvl != nextLvl ? "chosenbtn2 posbtn" : "storebtn posbtn")
				getEl("pos_boost" + i + "_excite").innerHTML = (lvl != nextLvl ? "(Next: " + lvl + " -> " + nextLvl + ")" : "Tier " + originalLvl + (originalLvl != lvl ? " -> " + lvl : "") + (pos_tmp.chosen == i ? "<br>(Selected)" : originalLvl != lvl ? "<br>(from PB" + pos_save.swaps[i] + ")" : ""))
				data[lvl] = (data[lvl] || 0) + 1

				if (originalLvl != lvl) data.swaps_amt++
				if (originalLvl != nextLvl) data.swaps_next++

				if (excluded) data.exclude++
				else data.total++
			}
		}

		for (var i = 1; i <= 3; i++) {
			getEl("pos_cloud" + i + "_cell").innerHTML = "<b>Tier " + i + ": " + (data[i] || 0) + " / " + i * 2 + "</b>"
			getEl("pos_cloud" + i + "_cell").className = "pos_tier " + (data[i] >= i * 2 ? "green" : "")
			getEl("pos_cloud" + i + "_cell").style.display = data[i] ? "" : "none"
		}
		getEl("pos_cloud_total").textContent = "Total: " + data.total + (data.exclude ? " used // " + data.exclude + " excluded" : "") + (data.swaps_next == 0 ? "" : " (Requires " + shortenDimensions(this.swapCost(data.swaps_next)) + " sacrificed quantum energy)")
	},
	updateTmpOnTick() {
		if (!this.unl()) return
		let data = pos_tmp

		//Meta Dimension Boosts or Quantum Energy -> Positrons
		pos_save.eng = 0
		if (this.on()) {
			let mdbStart = 0
			let mdbMult = pos_tmp.mults.mdb

			data.sac_mdb = Math.floor(Math.max(player.meta.resets - mdbStart, 0) * mdbMult)
			data.sac_qe = qu_save.quarkEnergy / (tmp.ngp3_mul ? 9 : 3)
			pos_save.amt = Math.sqrt(Math.min(
				data.sac_mdb * (PCs.milestoneDone(51) ? Math.max(data.sac_mdb / 30, 1) : 1) * pos_tmp.mults.mdb_eff,
				Math.pow(data.sac_qe * (tmp.bgMode ? 2 : 1.5), 2)
			)) * 300
		} else {
			data.sac_mdb = 0
			data.sac_qe = 0
			pos_save.amt = 0
		}
		if (futureBoost("excited_positrons") && dev.boosts.tmp[2]) pos_save.amt *= dev.boosts.tmp[2]

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
		if (!pos.on() && enB.active("glu", 6)) pos_save.eng = enB_tmp.glu6
		else pos_save.eng = Math.pow(pcSum, 2)
		if (futureBoost("potential_strings") && dev.boosts.tmp[3]) pos_save.eng *= dev.boosts.tmp[3]
	},

	canSwap(x) {
		var old = enB.pos.lvl(x, true)
		var nw = enB.pos.lvl(pos_tmp.chosen, true)
		return !pos_tmp.next_swaps[x] && (PCs.milestoneDone(22) ? old != nw : Math.abs(old - nw) == 1)
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
	clearSwaps() {
		pos_tmp.next_swaps = {}
		pos.updateCloud()
	},
	cancelSwaps() {
		if (!confirm("Do you want to cancel changes on Positronic Cloud?")) return
		pos_tmp.next_swaps = {... pos_save.swaps}
		pos.updateCloud()
	},
	applySwaps() {
		if (!confirm("Do you want to apply the changes immediately? This restarts your Quantum run!")) return
		restartQuantum()
	},
	getSwaps() {
		return this.swapsDisabled() ? pos_save.swaps : {}
	},
	swapsDisabled() {
		return !pos.on() || (QCs_save.disable_swaps && QCs_save.disable_swaps.active)
	},
	swapCost(x) {
		return Math.pow(2, x / 2)
	},
	excluded(x) {
		return (futureBoost("exclude_any_qc") ? QCs.inAny() : QCs.in(2)) ? enB.pos.lvl(x) == QCs_save.qc2 : false
	},

	getCloudBtn: (x) => '<button id="pos_boost' + x + '_btn" onclick="pos.swap(' + x + ')">' +
							'<span>' +
								'<b>PB' + x + '</b><br>' +
								'<p id="pos_boost' + x + '_charge"></p>' +
								'<p id="pos_boost' + x + '_excite">(+0 tiers)</p>' +
							'</span>' +
						'</button>',
	setupHTML() {
		var html = ""
		for (var i = 1; i <= enB.pos.max; i++) html += this.getCloudBtn(i)
		getEl("pos_cloud1_boosts").innerHTML = html
	},

	updateTab() {
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

		enB.updateOnTick("pos")
		if (pos_tmp.tab == "boost") {
			if (enB.has("pos", 4)) getEl("enB_pos4_exp").textContent = "^" + (1 / enB_tmp.pos4).toFixed(3)
			if (enB.has("pos", 11)) getEl("enB_pos11_exp").textContent = "x^1/" + shorten(1 / enB_tmp.pos11 / getAQSGainExp())

			for (var i = 1; i <= enB.pos.max; i++) {
				if (!enB.has("pos", i)) return
				getEl("enB_pos" + i).className = enB.color(i, "pos")
			}
		}
		if (pos_tmp.tab == "cloud") {
			for (var i = 1; i <= enB.pos.max; i++) {
				if (enB.mastered("pos", i)) pos.updateCharge(i)
			}
		}
	},
	updateCharge(i) {
		var lvl = enB.pos.lvl(i)
		var match = enB.pos.lvl(i, true) == lvl
		var charged = match && enB.pos.charged(i)
		var undercharged = match && lvl < 3 && lvl == enB.pos[i].tier && enB.pos.charged(i, lvl + 1)
		getEl("pos_boost" + i + "_charge").textContent = undercharged ? "Undercharged! (Switch to Tier " + (lvl + 1) + ")" : charged ? "Charged (" + enB.pos.chargeEff(i) + "x)" : "Charge: " + shorten(enB.pos.chargeReq(i, true))
		getEl("pos_boost" + i + "_charge").className = undercharged ? "undercharged" : charged ? "charged" : ""
	},
	switchTab() {
		pos_tmp.tab = pos_tmp.tab == "cloud" ? "boost" : "cloud"
		getEl("pos_boost_div").style.display = pos_tmp.tab == "boost" ? "" : "none"
		getEl("pos_cloud_div").style.display = pos_tmp.tab == "cloud" ? "" : "none"
		getEl("pos_tab").textContent = pos_tmp.tab == "cloud" ? "Show boosts" : "Show cloud"
	}
}
var pos_save = undefined
var pos_tmp = {}

let POSITRONS = pos