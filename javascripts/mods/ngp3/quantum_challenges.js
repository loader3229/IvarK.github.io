var QCs = {
	setup() {
		QCs_save = {
			in: [],
			comps: 0,
			mod_comps: {},
			best: {},
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

		if (QCs_save.best_exclusion || QCs_save.perks_unl) {
			QCs_save.mod_comps = {}
			delete QCs_save.best_exclusion
			delete QCs_save.perks_unl
		}

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

			perkDesc: (x) => "Boost something by " + shorten(x) + "x",
			perkReqs: [0, 0],
			perkEff() {
				return 1
			},

			ttScaling() {
				return tmp.dtMode ? 2 : tmp.exMode ? 1.75 : 1.5
			},
			compressScaling() {
				let x = 5
				if (hasAch("ng3p27")) x += 0.5
				return x
			},
			updateTmp() {
				delete QCs_tmp.qc1
				if (!QCs.in(1) && !QCs.done(1)) return

				let boosts = QCs_save.qc1.boosts
				let maxBoosts = QCs_save.qc1.max
				let brokenBoosts = Math.max(QCs_save.qc1.boosts - this.compressScaling(), 0)

				let data = {
					req: Decimal.pow(10, 1e6 + 2e5 * brokenBoosts),
					limit: new Decimal("1e6000000"),

					speedMult: Decimal.pow(4, -brokenBoosts).times(Math.pow(boosts / 2 + 1, 2)),
					scalingMult: Math.pow(2, Math.max(boosts - 20, 0) / 20),
					scalingExp: 1 / Math.min(1 + boosts / 20, 2),

					effMult: maxBoosts / 30 + boosts / 15 + 1,
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

			can: () => QCs_tmp.qc1 && pH.can("eternity") && player.replicanti.amount.gte(QCs_tmp.qc1.req) && QCs_save.qc1.boosts < QCs.data[1].max(),
			max: () => QCs.in(6) ? 6 : 20,
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

			perkDesc: (x) => "Boost something by " + shorten(x) + "x",
			perkReqs: [0, 0],
			perkEff() {
				return 1
			},

			updateCloudDisp() {
				if (!pos_tmp.cloud) return

				let unl = QCs.in(2)
				for (let t = 1; t <= 3; t++) {
					getEl("pos_cloud" + t + "_toggle").parentElement.style.display = unl && pos_tmp.cloud[t] ? "" : "none"
					getEl("pos_cloud" + t + "_cell").colspan = unl && pos_tmp.cloud[t] ? 1 : 2
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

			perkDesc: (x) => "Boost something by " + shorten(x) + "x",
			perkReqs: [0, 0],
			perkEff() {
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

			perkDesc: (x) => "Boost something by " + shorten(x) + "x",
			perkReqs: [0, 0],
			perkEff() {
				return 1
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

			perkDesc: (x) => "Boost something by " + shorten(x) + "x",
			perkReqs: [0, 0],
			perkEff() {
				return 1
			},

			updateTmp() {
				delete QCs_tmp.qc5
				if (!QCs.in(5) && !QCs.done(6)) return

				QCs_tmp.qc5 = {
					mult: 1 / (Math.log10(QCs_save.qc1.boosts + 1) + 1),
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
			goal: () => player.replicanti.amount.e >= 1e6 && QCs_save.qc1.boosts >= 6,
			goalDisp: () => shortenCosts(Decimal.pow(10, 1e6)) + " Replicantis + " + getFullExpansion(6) + " Replicanti Compressors",
			goalMA: Decimal.pow(Number.MAX_VALUE, 2.7),
			hint: "Do long Eternity runs.",

			rewardDesc: (x) => "Replicantis also produce Replicanti Energy; but also boosted by time since Eternity. (" + shorten(QCs_tmp.rewards[6]) + "x)",
			rewardEff(str) {
				return (9 / (Math.abs(50 - player.thisEternity) + 1) + 1) * Math.log2(player.thisEternity / 10 + 2)
			},

			perkDesc: (x) => "Boost something by " + shorten(x) + "x",
			perkReqs: [0, 0],
			perkEff() {
				return 1
			},

			updateTmp() {
				delete QCs_tmp.qc6
				if (!QCs.in(6)) return

				QCs_tmp.qc6 = Math.log2(Math.max(-QCs_save.qc6, 0) / 100 + 1) + 2
			}
		},
		7: {
			unl: () => true,
			desc: () => "Unlock a new set of Mastery Studies, but color charge subtracts color powers instead of the main catches, and disable red power.",
			goal: () => player.timestudy.theorem >= 5e86,
			goalDisp: () => shortenDimensions(5e86) + " Time Theorems",
			goalMA: Decimal.pow(Number.MAX_VALUE, 3.7),
			hint: "It's a tricky puzzle.",

			perkDesc: (x) => "Boost something by " + shorten(x) + "x",
			perkReqs: [0, 0],
			perkEff() {
				return 1
			},

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

			perkDesc: (x) => "Boost something by " + shorten(x) + "x",
			perkReqs: [0, 0],
			perkEff() {
				return 1
			},

			rewardDesc: (x) => "In dilation runs, strengthen the base formulas of RGs, but remove multipliers. (not implemented)",
			rewardEff(str) {
				return 1
			}
		},
	},

	updateTmp() {
		let data = { unl: [], in: [], rewards: {}, perks: {}, show_perks: QCs_tmp.show_perks }
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
				if (PCs.unl()) data.perks[x] = this.data[x].perkEff(1)
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
	isntCatched() {
		return QCs_tmp.in.length != 1 || this.in(7)
	},
	done(x) {
		return this.unl() && QCs_save.comps >= x
	},
	getGoal() {
		return PCs.in() ? player.meta.bestAntimatter.gte(this.getGoalMA()) : player.meta.bestAntimatter.gte(this.getGoalMA()) && this.data[QCs_tmp.in[0]].goal()
	},
	getGoalDisp() {
		return PCs.in() ? "" : " and " + this.data[QCs_tmp.in[0]].goalDisp()
	},
	getGoalMA() {
		return PCs.in() ? PCs.goal() : this.data[QCs_tmp.in[0]].goalMA
	},
	isRewardOn(x) {
		return this.done(x) && QCs_tmp.rewards[x]
	},

	modDone(x, m) {
		var data = QCs_save.mod_comps
		return this.unl() && data && data[m] && data[m].includes(x)
	},

	perkUnl(x) {
		var data = QCs_save.mod_comps
		return this.modDone(x, "perk")
	},
	perkCan(x) {
		var data = this.data[x]
		if (!PCs.unl()) return
		if (pos_tmp.cloud == undefined) return
		if (this.perkUnl(x)) return
		return pos_tmp.cloud.total >= data.perkReqs[0] && pos_tmp.cloud.exclude >= data.perkReqs[1]
	},
	perkActive(x) {
		return QCs_tmp.perks[x] && this.perkUnl(x) && this.inAny()
	},

	tp() {
		showTab("challenges")
		showChallengesTab("quantumchallenges")
	},
	start(x) {
		quantum(false, true, x)
	},
	restart(x) {
		quantum(false, true, QCs_save.in)
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
		'<span id="qc_' + x + '_goal"></span><br>' +
		'<span id="qc_' + x + '_reward"></span>' +
		'</div></div></td>',
	divInserted: false,

	updateDisp() {
		let unl = this.divInserted && this.unl() && pH.shown("quantum")

		//In Quantum Challenges
		getEl("qc_restart").style.display = QCs.in(2) || QCs.in(8) ? "" : "none"
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
			if (QCs_tmp.show_perks) {
				var reqs = this.data[qc].perkReqs
				getEl("qc_" + qc + "_desc").textContent = "Quantum Challenge " + qc + " Perk: " + this.data[qc].perkDesc(QCs_tmp.perks[qc])
				getEl("qc_" + qc + "_goal").textContent = "Requires: Complete QC" + qc + " + " + reqs[0] + " used Positronic Boosts + " + reqs[1] + " excluded Positronic Boosts"
				getEl("qc_" + qc + "_btn").textContent = this.perkCan(qc) ? "Can unlock!" :
					!this.perkUnl(qc) ? "Locked" :
					"Obtained"
				getEl("qc_" + qc + "_btn").className = this.perkCan(qc) ? (this.in(qc) ? "onchallengebtn" : "challengesbtn") :
					!this.perkUnl(qc) ? "lockedchallengesbtn" :
					"completedchallengesbtn"
			} else if (cUnl) {
				getEl("qc_" + qc + "_desc").textContent = this.data[qc].desc()
				getEl("qc_" + qc + "_goal").textContent = "Goal: " + shorten(this.data[qc].goalMA) + " meta-antimatter and " + this.data[qc].goalDisp()
				getEl("qc_" + qc + "_btn").textContent = this.in(qc) ? "Running" : this.done(qc) ? "Completed" : "Start"
				getEl("qc_" + qc + "_btn").className = this.in(qc) ? "onchallengebtn" : this.done(qc) ? "completedchallengesbtn" : "challengesbtn"
			}
		}

		getEl("qc_perks").style.display = PCs.unl() ? "" : "none"
		getEl("qc_perks").textContent = QCs_tmp.show_perks ? "Back" : "View perks"
		getEl("qc_perks_note").textContent = QCs_tmp.show_perks ? "Note: Perks only work in specific Quantum Challenge. However, mastered Perks work in any Quantum Challenge!" : ""

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
	},
	viewPerks() {
		QCs_tmp.show_perks = !QCs_tmp.show_perks
		QCs.updateDisp()
	}
}
var QCs_save = undefined
var QCs_tmp = { unl: [], in: [], rewards: {}, perks: {}, show_perks: false }

let QUANTUM_CHALLENGES = QCs


//PAIRED CHALLENGES
var PCs = {
	setup: {},
	setupData() {
		var data = {
			qc1_ids: [null, 7, 6, 4, 2, 8, 1, 5, 3],
			qc2_ids: [null, 3, 5, 1, 8, 2, 4, 6, 7],
			qc1_lvls: [null, 1, 2, 3, 4, 10, 11, 12, 13],
			qc2_lvls: [null, 1, 2, 4, 8, 14, 15, 17, 18],
			setup: true
		}
		PCs.data = data
		getEl("pc_table").innerHTML = ""

		data.lvls = {}
		data.pos = {}
		for (var x = 1; x <= 8; x++) {
			for (var y = 1; y <= 9 - x; y++) {
				var lvl = data.qc1_lvls[x] + data.qc2_lvls[y] - 1
				data.lvls[lvl] = (data.lvls[lvl] || 0) + 1
				data.pos[this.conv(data.qc1_ids[x], data.qc2_ids[y])] = x * 10 + y
			}
		}

		var sum = 0
		PCs_tmp.lvl = 1
		for (var i = 1; i <= 18; i++) {
			sum += data.lvls[i]
			data.lvls[i] = sum
		}
	},

	setup() {
		PCs_save = {
			comps: [],
			skips: [],
			lvl: 1
		}
		qu_save.pc = PCs_save
		return PCs_save
	},
	compile() {
		PCs_save = undefined
		PCs.data = {}
		PCs_tmp = { unl: PCs.unl() }
		if (!tmp.ngp3 || qu_save === undefined) {
			this.updateTmp()
			this.updateDisp()
			return
		}

		let data = qu_save.pc
		if (data === undefined) data = this.setup()
		PCs_save = data

		this.updateTmp()
	},

	unl() {
		return qu_save && qu_save.qc && qu_save.qc.comps >= 7
	},
	updateTmp() {
		if (!PCs_tmp.unl) return
		if (!PCs.data.setup) this.setupData()

		//Level up!
		var oldLvl = PCs_save.lvl
		var lvlData = PCs.data.lvls
		var comps = PCs_save.comps.length
		while (PCs_save.lvl < 19 && comps >= lvlData[PCs_save.lvl]) PCs_save.lvl++
		if (PCs_save.lvl > oldLvl) {
			for (var i = 0; i < PCs.data.all.length; i++) this.updateButton(PCs.data.all[i])
		}

		this.updateTmpOnTick()
	},
	updateTmpOnTick() {
	},

	start(x) {
		quantum(false, true, PCs.convBack(x))
	},
	in(x) {
		return QCs_tmp.in.length >= 2
	},
	goal(pc) {
		var QCs = this.convBack(pc)
		return new Decimal(1/0)
	},
	conv(c1, c2) {
		return Math.min(c1 * 10 + c2, c2 * 10 + c1)
	},
	convBack(pc) {
		return [Math.floor(pc / 10), pc % 10]
	},
	done(c1, c2) {
		var id = this.conv(c1, c2)
		return PCs.unl() && (PCs_save.comps.includes(id) || PCs_save.skips.includes(id))
	},

	setupButton: (pc) => '<td><button id="pc' + pc + '" class="challengesbtn" onclick="PCs.start(' + pc + ')">PC' + Math.floor(pc / 10) + "+" + pc % 10 + '</button></td>',
	setupHeader: (qc) => '<td>QC' + qc + '<br><button class="storebtn" onclick="PCs.openMilestones(' + qc + ')">Milestones</button></td>',
	setupHTML() {
		var el = getEl("pc_table")
		var data = PCs.data
		if (PCs.data.setupHTML) return

		//Setup header
		var html = "<td></td>"
		for (var i = 1; i <= 8; i++) html += this.setupHeader(data.qc1_ids[i])
		el.insertRow(0).innerHTML = html

		//Setup rows
		data.all = []
		for (var x = 1; x <= 8; x++) {
			var html = "<td>QC" + data.qc2_ids[x]+ "</td>"
			for (var i = 1; i <= 9 - x; i++) {
				var pc = this.conv(data.qc1_ids[x], data.qc2_ids[i])
				html += this.setupButton(pc)
				data.all.push(pc)
			}
			el.insertRow(x).innerHTML = html
		}

		for (var i = 0; i < data.all.length; i++) this.updateButton(data.all[i])

		data.setupHTML = true
		this.updateDisp()
	},
	updateButton(pc) {
		var qcs = this.convBack(pc)
		var pos = this.convBack(PCs.data.pos[pc])
		var lvl = PCs.data.qc1_lvls[pos[0]] + PCs.data.qc2_lvls[pos[1]] - 1

		getEl("pc" + pc).style.display = PCs_save.lvl >= lvl ? "" : "none"
		if (PCs_save.lvl >= lvl) getEl("pc" + pc).className = /*QCs.in(qcs[0]) && QCs.in(qcs[1]) ? "onchallengebtn" :*/ PCs_save.comps.includes(pc) ? "completedchallengesbtn" : "challengesbtn"
	},

	updateDisp() {
		if (!PCs_tmp.unl) return
		if (!PCs.data.setupHTML) return

		getEl("pc_lvl").textContent = getFullExpansion(PCs_save.lvl)
		getEl("pc_comps").textContent = getFullExpansion(PCs_save.comps.length) + " / " + getFullExpansion(PCs.data.lvls[Math.min(PCs_save.lvl, 18)])
	}
}
var PCs_save = undefined
var PCs_tmp = { unl: false }