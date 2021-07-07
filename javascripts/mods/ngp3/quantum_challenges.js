var QCs = {
	setup() {
		QCs_save = {
			in: [],
			comps: 0,
			best: {},
			best_exclusion: {},
			cloud_disable: 1
		}
		return QCs_save
	},
	compile() {
		QCs_save = undefined
		if (!tmp.ngp3 || qu_save === undefined) {
			this.updateTmp()
			this.updateDisp()
			return
		}

		let data = qu_save.qc
		if (data === undefined) data = this.setup()
		QCs_save = data

		if (QCs_save.qc1 === undefined) this.reset()
		if (typeof(QCs_save.qc2) !== "number") QCs_save.qc2 = QCs_save.cloud_disable || 1

		this.updateTmp()
		this.updateDisp()
	},
	reset() {
		QCs_save.qc1 = {boosts: 0, max: 0}
		QCs_save.qc3 = undefined
		QCs_save.qc4 = "ng"
		QCs_save.qc5 = 0
		QCs_save.qc6 = 0
		QCs_save.qc7 = 0
		QCs_save.qc8 = undefined //Same as QC5
	},
	data: {
		max: 8,
		1: {
			unl: () => true,
			desc: () => "There are Replicated Compressors instead of Replicated Galaxies, and TT softcap is " + formatReductionPercentage(QCs.data[1].ttScaling()) + "% faster.",
			goal: () => QCs_save.qc1.boosts >= (tmp.dtMode ? 5 : 4),
			goalDisp: () => (tmp.dtMode ? 5 : 4) + " Replicated Compressors",
			goalMA: Decimal.pow(Number.MAX_VALUE, 1.3),
			hint: "Figure out how to get more Replicanti Chance (MS35), and to minimize the spending of TT.",
			rewardDesc: (x) => "You can keep Replicated Compressors.",
			rewardEff(str) {
				return 0.1
			},

			ttScaling() {
				return tmp.dtMode ? 2 : tmp.exMode ? 1.75 : 1.5
			},
			compressScaling() {
				return 5
			},
			updateTmp() {
				delete QCs_tmp.qc1
				if (!QCs.in(1) && !QCs.done(1)) return

				let boosts = QCs_save.qc1.boosts
				let maxBoosts = QCs_save.qc1.max
				let brokenBoosts = Math.max(QCs_save.qc1.boosts - this.compressScaling(), 0)

				let data = {
					req: Decimal.pow(10, 1e6 + 2e5 * Math.max(boosts - 5, 0)),
					limit: new Decimal("1e6000000"),

					speedMult: Decimal.pow(boosts + 1, 2 + brokenBoosts / 2),
					scalingMult: Math.pow(2, Math.max(boosts - 20, 0) / 20),
					scalingExp: 1 / Math.min(1 + boosts / 20, 2),

					effMult: maxBoosts / 30 + (boosts - brokenBoosts) / 15 + 1,
					effExp: Math.min(1 + boosts / 20, 2)
				}
				QCs_tmp.qc1 = data

				if (QCs.in(1)) {
					data.limit = data.limit.pow((tmp.exMode ? 0.2 : tmp.bgMode ? 0.4 : 0.3) * 5 / 6)
				}
			},
			convert(x) {
				if (!QCs_tmp.qc1) return x

				var dilMult = Math.log2(getReplSpeedLimit()) / 1024
				x = Decimal.pow(2, Math.pow(x.log(2) * dilMult * QCs_tmp.qc1.effMult, QCs_tmp.qc1.effExp) / dilMult)
				return x
			},

			can: () => QCs_tmp.qc1 && pH.can("eternity") && player.replicanti.amount.gte(QCs_tmp.qc1.req) && QCs_save.qc1.boosts < 20,
			boost() {
				if (!QCs.data[1].can()) return false

				QCs_save.qc1.boosts++
				player.replicanti.amount = Decimal.pow(10, Math.pow(player.replicanti.amount.log10(), 0.9))
				eternity(false, true)
				return true
			}
		},
		2: {
			unl: () => true,
			desc: () => "Some quantum contents are based on one, but quantum energy multiplier. color powers, and gluons are useless; and you must exclude 1 tier from Positron Cloud.",
			goal: () => pos_save.boosts >= 7,
			goalDisp: () => "7 Positronic Boosters",
			goalMA: Decimal.pow(Number.MAX_VALUE, 1.1),
			hint: "Mess around Positronic Cloud by swapping and excluding.",
			rewardDesc: (x) => "Color charge also multiply a color power that's used by it. (" + shorten(x) + "x)",
			rewardEff(str) {
				return Math.log10(colorCharge.normal.charge + 1) / 2 + 1
			},

			updateCloudDisp() {
				let unl = QCs.in(2)
				for (let t = 1; t <= 3; t++) {
					getEl("pos_cloud" + t + "_toggle").style.display = unl && pos_tmp.cloud[t] ? "" : "none"
					if (unl) getEl("pos_cloud" + t + "_toggle").className = (QCs_save.qc2 == t ? "chosenbtn" : "storebtn") + " longbtn"
				}
			},
			switch(x) {
				if (QCs_save.qc2 == x) return
				if (!confirm("This will restart your run. Are you sure?")) return
				QCs_save.qc2 = x
				quantum(false, true, 2, false, false, true)
			}
		},
		3: {
			unl: () => true,
			desc: () => "There are only Meta Dimensions that produce antimatter, but successfully dilating reduces antimatter production.",
			goal: () => player.dilation.times >= 3,
			goalDisp: () => "4 successful dilation runs",
			goalMA: Decimal.pow(Number.MAX_VALUE, 0.15),
			hint: "Try not to automate dilation, and also not to dilate time frequently.",
			rewardDesc: (x) => "You sacrifice 30% of Meta Dimension Boosts instead of 25%.",
			rewardEff(str) {
				return 1
			},

			amProd() {
				return getMDProduction(1).max(1).pow(this.amExp())
			},
			amExp() {
				return 20 / Math.sqrt((player.dilation.times || 0) / 3 + 1)
			}
		},
		4: {
			unl: () => true,
			desc: () => "You must exclude one type of galaxy for a single run. Changing the exclusion requires a forced Eternity reset.",
			goal: () => player.dilation.freeGalaxies >= 2900,
			goalDisp: () => getFullExpansion(2900) + " Tachyonic Galaxies",
			goalMA: Decimal.pow(Number.MAX_VALUE, 2.4),
			hint: "Test every single combination of this exclusion, and try to minimize galaxies.",
			rewardDesc: (x) => "Replicated Galaxies contribute to Positronic Charge.",
			rewardEff(str) {
				return
			},

			updateTmp() {
				delete QCs_tmp.qc4
				if (!QCs.in(4)) return

				var gals = {
					ng: player.galaxies,
					rg: player.replicanti.galaxies,
					eg: tmp.extraRG || 0,
					tg: player.dilation.freeGalaxies,
				}
				var sum = gals.ng + gals.rg + gals.eg + gals.tg
				
				QCs_tmp.qc4 = {
					diff: Math.abs(gals[QCs_save.qc4] - (sum - gals[QCs_save.qc4]) / 3)
				}
				QCs_tmp.qc4.boost = Math.log2(QCs_tmp.qc4.diff / 500 + 1) / 5 + 1
			},

			updateDisp() {		
				getEl("qc4_div").style.display = QCs.in(4) ? "" : "none"
				getEl("coinsPerSec").style.display = QCs.in(4) || QCs.done(4) ? "none" : ""
				getEl("tickSpeedRow").style.display = QCs.in(4) || QCs.done(4) ? "none" : ""

				if (!QCs.in(4)) return
				var types = ["ng", "rg", "eg", "tg"]
				for (var t = 0; t < types.length; t++) {
					var type = types[t]
					getEl("qc4_" + type).className = (QCs_save.qc4 == type ? "chosenbtn" : "storebtn")
				}
			},
			switch(x) {
				QCs_save.qc4 = x
				eternity(true)
				this.updateDisp()
			}
		},
		5: {
			unl: () => true,
			desc: () => "Replicantis only produce Replicanti Energy by gaining, which increases effective Quantum Energy and Positronic Charge.",
			goal: () => player.eternityPoints.gte(Decimal.pow(10, 2.4e6)),
			goalDisp: () => shortenCosts(Decimal.pow(10, 2.4e6)) + " Eternity Points",
			goalMA: Decimal.pow(Number.MAX_VALUE, 1.7),
			hint: "Do sub-1 Eternity runs before getting Compressors.",
			rewardDesc: (x) => "Sacrificed things are stronger for Positrons, but you sacrifice less galaxies.",
			rewardEff(str) {
				return 1
			},

			updateTmp() {
				delete QCs_tmp.qc5
				if (!QCs.in(5) && !QCs.done(6)) return

				QCs_tmp.qc5 = {
					mult: 1 / Math.log2(QCs_save.qc1.boosts + 2),
					eff: Math.pow(Math.log2(QCs_save.qc5 / 2e6 + 1), 2),
				}
				if (QCs.isRewardOn(6)) QCs_tmp.qc5.mult *= QCs_tmp.rewards[6]
			},

			updateDisp() {		
				getEl("qc5_div").style.display = QCs_tmp.qc5 ? "" : "none"
			},
			updateDispOnTick() {		
				getEl("qc5_eng").textContent = shorten(QCs_save.qc5)
				getEl("qc5_eng_mult").textContent = shiftDown ? " (+" + shorten(Math.max(QCs_tmp.qc5.mult, 1)) + " per " + shorten(Decimal.pow(10, 1 / Math.min(QCs_tmp.qc5.mult, 1))) + "x)" : ""
				getEl("qc5_eff").textContent = shorten(QCs_tmp.qc5.eff)
			},
		},
		6: {
			unl: () => true,
			desc: () => "There is a increasing variable, which gives different boosts; but eternitying subtracts it, and dilating reduces the gain.",
			goal: () => player.replicanti.amount.e >= 1e6 && QCs_save.qc1.boosts >= 5,
			goalDisp: () => shortenCosts(Decimal.pow(10, 1e6)) + " Replicantis + 5 Replicanti Compressors",
			goalMA: Decimal.pow(Number.MAX_VALUE, 2.4),
			hint: "Do long Eternity runs.",

			updateTmp() {
				delete QCs_tmp.qc6
				if (!QCs.in(6)) return

				QCs_tmp.qc6 = Math.log2(Math.max(-QCs_save.qc6, 0) / 100 + 1) + 2
			},

			rewardDesc: (x) => "Replicantis also produce Replicanti Energy; but also boosted by time since Eternity. (" + shorten(QCs_tmp.rewards[6]) + "x)",
			rewardEff(str) {
				return (9 / (Math.abs(50 - player.thisEternity) + 1) + 1) * Math.log2(player.thisEternity / 10 + 2)
			}
		},
		7: {
			unl: () => true,
			desc: () => "Unlock a new set of Mastery Studies, but color charge subtracts color powers instead of the main catches.",
			goal: () => false,
			goalDisp: () => "(not implemented)",
			goalMA: new Decimal(1),
			hint: "It's a tricky puzzle.",
			rewardDesc: (x) => "You keep that set of Mastery Studies, and unlock Paired Challenges. (not implemented)",
			rewardEff(str) {
				return 1
			}
		},
		8: {
			unl: () => true,
			desc: () => "You must exclude one type of galaxy in each type of run: normal and dilated Eternity runs.",
			goal: () => false,
			goalDisp: () => "(not implemented)",
			goalMA: new Decimal(1),
			hint: "Trial and error.",
			rewardDesc: (x) => "In dilation runs, strengthen the base formulas of RGs, but remove multipliers. (not implemented)",
			rewardEff(str) {
				return 1
			}
		},
	},

	updateTmp() {
		let data = { unl: [], in: [], rewards: {} }
		QCs_tmp = data

		if (!this.unl()) return
		for (let x = 1; x <= this.data.max; x++) {
			if (this.data[x].unl()) {
				if (QCs_save.in.includes(x)) data.in.push(x)
				data.unl.push(x)
				if (!this.done(x)) break
			}
		}

		this.updateTmpOnTick()
	},
	updateTmpOnTick() {
		if (!this.unl()) return
		
		let data = QCs_tmp
		for (let x = this.data.max; x; x--) {
			if (data.unl.includes(x)) {
				data.rewards[x] = this.data[x].rewardEff(1)
			}
			if (this.data[x].updateTmp) this.data[x].updateTmp()
		}
	},

	unl() {
		return tmp.ngp3 && player.masterystudies.includes("d8")
	},
	in(x) {
		return QCs_tmp.in.includes(x)
	},
	inAny() {
		return QCs_tmp.in.length >= 1
	},
	done(x) {
		return this.unl() && QCs_save.comps >= x
	},
	isRewardOn(x) {
		return this.done(x) && QCs_tmp.rewards[x]
	},
	getGoal() {
		return QCs_tmp.in.length >= 2 ? true : player.meta.bestAntimatter.gte(this.getGoalMA()) && this.data[QCs_tmp.in[0]].goal()
	},
	getGoalDisp() {
		return QCs_tmp.in.length >= 2 ? "" : " and " + this.data[QCs_tmp.in[0]].goalDisp()
	},
	getGoalMA() {
		return this.data[QCs_tmp.in[0]].goalMA
	},

	tp() {
		showTab("challenges")
		showChallengesTab("quantumchallenges")
	},
	start(x) {
		quantum(false, true, x)
	},

	setupDiv() {
		if (this.divInserted) return

		let html = ""
		for (let x = 1; x <= this.data.max; x++) html += (x % 2 == 1 ? "<tr>" : "") + this.divTemp(x) + ((x + 1) % 2 == 1 ? "</tr>" : "")
		getEl("qcs_div").innerHTML = html

		this.divInserted = true
	},
	divTemp: (x) =>
		'<td><div class="quantumchallengediv" id="qc_' + x + '_div">' +
		'<span id="qc_' + x + '_desc"></span><br><br>' +
		'<div class="outer"><button id="qc_' + x + '_btn" class="challengesbtn" onclick="QCs.start(' + x + ')">Start</button><br>' +
		'Goal: <span id="qc_' + x + '_goal"></span><br>' +
		'<span id="qc_' + x + '_reward"></span>' +
		'</div></div></td>',
	divInserted: false,

	updateDisp() {
		let unl = this.divInserted && this.unl() && pH.shown("quantum")

		//In Quantum Challenges
		getEl("repCompress").style.display = QCs_tmp.qc1 ? "" : "none"
		this.data[2].updateCloudDisp()
		this.data[4].updateDisp()
		this.data[5].updateDisp()

		//Quantum Challenges
		if (!unl) return

		getEl("qc_effects").textContent = (tmp.bgMode ? "No" : (tmp.exMode ? "No" : "Reduced") + " global quark energy bonus, no") + " gluon nerfs, and mastered boosts only work."
		for (let qc = 1; qc <= this.data.max; qc++) {
			var cUnl = QCs_tmp.unl.includes(qc)

			getEl("qc_" + qc + "_div").style.display = cUnl ? "" : "none"
			if (cUnl) {
				getEl("qc_" + qc + "_desc").textContent = this.data[qc].desc()
				getEl("qc_" + qc + "_goal").textContent = shorten(this.data[qc].goalMA) + " meta-antimatter and " + this.data[qc].goalDisp()
				getEl("qc_" + qc + "_btn").textContent = this.in(qc) ? "Running" : this.done(qc) ? "Completed" : "Start"
				getEl("qc_" + qc + "_btn").className = this.in(qc) ? "onchallengebtn" : this.done(qc) ? "completedchallengesbtn" : "challengesbtn"
			}
		}

		//Paired Challenges
		/*
		assigned = []
		var assignedNums = {}
		getEl("pairedchallenges").style.display = player.masterystudies.includes("d9") ? "" : "none"
		getEl("respecPC").style.display = player.masterystudies.includes("d9") ? "" : "none"
		for (var pc = 1; pc <= 4; pc++) {
			var subChalls = qu_save.pairedChallenges.order[pc]
			if (subChalls) for (var sc = 0; sc < 2; sc++) {
				var subChall = subChalls[sc]
				if (subChall) {
					assigned.push(subChall)
					assignedNums[subChall] = pc
				}
			}
			if (player.masterystudies.includes("d9")) {
				var property = "pc" + pc
				var sc1 = qu_save.pairedChallenges.order[pc] ? qu_save.pairedChallenges.order[pc][0] : 0
				var sc2 = (sc1 ? qu_save.pairedChallenges.order[pc].length > 1 : false) ? qu_save.pairedChallenges.order[pc][1] : 0
				getEl(property+"desc").textContent = "Paired Challenge "+pc+": Both Quantum Challenge " + (sc1 ? sc1 : "?") + " and " + (sc2 ? sc2 : "?") + " are applied."
				getEl(property+"cost").textContent = "Cost: Still none. ;/"
				getEl(property+"goal").textContent = "Goal: " + (sc2 ? shortenCosts(Decimal.pow(10, this.getGoalMA(subChalls))) : "???") + " antimatter"
				getEl(property).textContent = pcFocus == pc ? "Cancel" : (qu_save.pairedChallenges.order[pc] ? qu_save.pairedChallenges.order[pc].length < 2 : true) ? "Assign" : qu_save.pairedChallenges.current == pc ? "Running" : qu_save.pairedChallenges.completed >= pc ? "Completed" : qu_save.pairedChallenges.completed + 1 < pc ? "Locked" : "Start"
				getEl(property).className = pcFocus == pc || (qu_save.pairedChallenges.order[pc] ? qu_save.pairedChallenges.order[pc].length < 2 : true) ? "challengesbtn" : qu_save.pairedChallenges.completed >= pc ? "completedchallengesbtn" : qu_save.pairedChallenges.completed + 1 <pc ? "lockedchallengesbtn" : qu_save.pairedChallenges.current == pc ? "onchallengebtn" : "challengesbtn"

				var sc1t = Math.min(sc1, sc2)
				var sc2t = Math.max(sc1, sc2)
				if (player.masterystudies.includes("d14")) {
					getEl(property + "br").style.display = ""
					getEl(property + "br").textContent = sc1t != 6 || sc2t != 8 ? "QC6 & 8" : qu_save.bigRip.active ? "Big Ripped" : qu_save.pairedChallenges.completed + 1 < pc ? "Locked" : "Big Rip"
					getEl(property + "br").className = sc1t != 6 || sc2t != 8 ? "lockedchallengesbtn" : qu_save.bigRip.active ? "onchallengebtn" : qu_save.pairedChallenges.completed + 1 < pc ? "lockedchallengesbtn" : "bigripbtn"
				} else getEl(property + "br").style.display = "none"
			}
		}
		*/

		//Big Rip
		getEl("bigrip").style.display = player.masterystudies.includes("d14") ? "" : "none"
		if (hasMTS("d14")) {
			var max = getMaxBigRipUpgrades()
			getEl("spaceShards").textContent = shortenDimensions(qu_save.bigRip.spaceShards)
			for (var u = 18; u <= 20; u++) getEl("bigripupg" + u).parentElement.style.display = u > max ? "none" : ""
			for (var u = 1; u <= max; u++) {
				getEl("bigripupg" + u).className = qu_save.bigRip.upgrades.includes(u) ? "gluonupgradebought bigrip" + (isBigRipUpgradeActive(u, true) ? "" : "off") : qu_save.bigRip.spaceShards.lt(bigRipUpgCosts[u]) ? "gluonupgrade unavailablebtn" : "gluonupgrade bigrip"
				getEl("bigripupg" + u + "cost").textContent = shortenDimensions(new Decimal(bigRipUpgCosts[u]))
			}
		}
	},
	updateDispOnTick() {
		if (!this.divInserted) return

		for (let qc = 1; qc <= this.data.max; qc++) {
			if (QCs_tmp.unl.includes(qc)) getEl("qc_" + qc + "_reward").textContent = shiftDown || QCs.in(qc) ? "Hint: " + this.data[qc].hint : "Reward: " + this.data[qc].rewardDesc(QCs_tmp.rewards[qc])
		}
	},
	updateBest() {
		//Rework coming soon
	}
}
var QCs_save = undefined
var QCs_tmp = { unl: [], in: [], rewards: {} }

let QUANTUM_CHALLENGES = QCs