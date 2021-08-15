var QCs = {
	setup() {
		QCs_save = {
			in: [],
			comps: 0,
			mod_comps: [],
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
		if (QCs_save.qc1.best === undefined) QCs_save.qc1.best = QCs_save.qc1.boosts
		if (QCs_save.qc1.expands === undefined) QCs_save.qc1.expands = 0
		if (QCs_save.qc1.autoExpand === undefined) QCs_save.qc1.autoExpand = {
			value: 0,
			percentage: 0
		}
		getEl("setAutoExpand_value").value = QCs_save.qc1.autoExpand.value
		getEl("setAutoExpand_percentage").value = QCs_save.qc1.autoExpand.percentage

		if (typeof(QCs_save.qc2) !== "number") QCs_save.qc2 = QCs_save.cloud_disable || 1
		QCs_save.qc5 = new Decimal(QCs_save.qc5)

		if (QCs_save.qc8 === undefined) QCs_save.qc8 = {
			index: 0,
			order: []
		}

		if (QCs_save.best_exclusion || QCs_save.perks_unl || (QCs_save.mod_comps && !QCs_save.mod_comps.length)) {
			QCs_save.mod_comps = []
			delete QCs_save.best_exclusion
			delete QCs_save.perks_unl
		}

		this.updateTmp()
		this.updateDisp()
	},
	reset() {
		QCs_save.qc1 = {
			boosts: 0,
			max: 0,
			best: QCs_save.qc1 && QCs_save.qc1.best,

			expands: 0,
			autoExpand: QCs_save.qc1 && QCs_save.qc1.autoExpand
		}
		if (!QCs_save.qc2) QCs_save.qc2 = 1
		QCs_save.qc3 = undefined
		QCs_save.qc4 = "ng"
		QCs_save.qc5 = new Decimal(0)
		QCs_save.qc6 = 0
		QCs_save.qc7 = 0
	},
	data: {
		max: 8,
		1: {
			unl: () => true,
			desc: () => "There are Replicated Compressors instead of Replicated Galaxies, and TT cost multipliers are doubled.",
			goal: () => player.money.e >= (tmp.exMode ? 1.1e11 : tmp.bgMode ? 5e10 : 1e11),
			goalDisp: () => shortenCosts(Decimal.pow(10, tmp.exMode ? 1.1e11 : tmp.bgMode ? 5e10 : 1e11)) + " antimatter",
			goalMA: Decimal.pow(Number.MAX_VALUE, 1.35),
			hint: "Figure out how to get more Replicanti Chance. (MS35)",

			rewardDesc: (x) => "You can keep Replicated Compressors.",
			rewardEff(str) {
				return 0.1
			},

			upsideDesc: (x) => "Replicated Compressors are 50% weaker, and the replicate interval is " + (tmp.exMode ? "inverted" : "always 1s") + ".",
			perkDesc: (x) => "Each Replicated Compressor gives 10s of Quantum-layer ticks. (not implemented)",
			perkEff() {
				return 1
			},

			overlapReqs: [1/0, 1/0],

			//QC1 Effects
			ttScaling() {
				return tmp.dtMode ? 2 : tmp.exMode ? 1.75 : 1.5
			},

			//Replicanti Compressors
			can: () => QCs_tmp.qc1 && pH.can("eternity") && player.replicanti.amount.gte(QCs_tmp.qc1.req) && QCs_save.qc1.boosts < QCs.data[1].max(),
			compressScalings: [5],
			max: () => 30, //1 + 30 / 20 = 2.5 / 2 = 1.25
			boost() {
				if (!QCs.data[1].can()) return false

				QCs_save.qc1.boosts++
				if (!QCs.inAny()) QCs_save.qc1.best = Math.max(QCs_save.qc1.boosts, QCs_save.qc1.best)
				player.replicanti.amount = new Decimal(1)
				eternity(false, true)

				return true
			},
			extra: () => 0,
			updateTmp() {
				let qc1 = QCs_save.qc1
				delete QCs_tmp.qc1
				if (!QCs.in(1) && !QCs.done(1)) return

				//Boosts
				let boosts = qc1.boosts
				let distantBoosts = Math.max(boosts - this.compressScalings[0], 0)

				//Efficiency
				let str = QCs.modIn(1, "up") ? 0.5 : 1
				let extra = this.extra()
				let eff = (boosts + extra) * str
				let maxEff = (qc1.max + extra) * str

				//Setup
				let data = {
					req: Decimal.pow(10, 1e6 * (distantBoosts + 1)),
					limit: new Decimal("1e6000000"),

					speedMult: Decimal.pow(2, - boosts),
					scalingMult: 1,
					scalingExp: 1 / (1 + boosts / 20),

					effMult: (eff * 3 - maxEff * 2) / 10 + 1,
					effExp: 1 + eff / 20,
				}
				if (QCs.in(1)) data.limit = data.limit.pow((tmp.exMode ? 0.2 : tmp.bgMode ? 0.4 : 0.3) * 5 / 6)
				QCs_tmp.qc1 = data

				//Paired Challenges
				if (PCs.milestoneDone(11)) {
					let pc11 = 0.2 + (PCs_save.lvl - 1) / 35
					data.limit = data.limit.pow(Math.pow(4, -pc11))
					data.effMult *= Math.pow(data.effMult, pc11 / 2)
				}
				if (PCs.milestoneDone(12)) data.limit = data.limit.pow(qc1.expands / 10 + 1)

				//Limit > Req
				data.limit = data.limit.max(data.req)
			},

			//Conversion
			convert(x) {
				if (!QCs_tmp.qc1) return x

				var dilMult = Math.log10(getReplSpeedLimit()) / 1024
				var log = x.log10() * dilMult
				if (log > 1) log = Math.pow(log, QCs_tmp.qc1.effExp)
				log *= QCs_tmp.qc1.effMult / dilMult

				x = Decimal.pow(10, log)
				return x
			},

			updateDisp() {		
				getEl("repCompress").style.display = QCs_tmp.qc1 ? "" : "none"
				getEl("repExpand").style.display = PCs.milestoneDone(12) ? "" : "none"
			},
			updateDispOnTick() {
				let qc1 = QCs_save.qc1
				let data = QCs.data[1]
				if (QCs_tmp.qc1) {
					let qc1Explain = qc1.boosts + data.extra() == 0
					let extra = data.extra()
					getEl("repCompress").innerHTML = "Compress for a " + (qc1Explain ? "small multiplier " : "") + "boost" +
						(!qc1Explain ? "." : ", but reduce the interval scaling.") +
						"<br><span style='font-size: 10px'>(Requires " + shortenCosts(QCs_tmp.qc1.req) + " replicantis)</span>" +
						(!qc1Explain ? "<br>(" +
							getFullExpansion(qc1.boosts) + " / " + getFullExpansion(data.max()) +
							(qc1.boosts > data.compressScalings[0] ? " Distant" : "") +
							(qc1.max || extra > 0 ? ", " + getFullExpansion(qc1.max) + " Max" : "") +
							(extra > 0 ? " + " + getFullExpansion(Math.floor(extra)) : "") +
						")" : "")
					getEl("repCompress").style["font-size"] = qc1Explain ? "11px" : "12px"
					getEl("repCompress").className = data.can() ? "storebtn" : "unavailablebtn"
				}
				if (PCs.milestoneDone(12)) {
					getEl("repExpand").innerHTML = "Energize the Replicantis and expand their space." +
						"<br>Cost: " + shorten(data.expandCost()) + " Replicanti Energy" +
						"<br>(" + getFullExpansion(qc1.expands) + " Expansions)"
					getEl("repExpand").className = data.canExpand() ? "storebtn" : "unavailablebtn"
				}
			},

			//PC1x2 Milestone: Replicanti Expanders
			expandCost: () => Decimal.pow(4, QCs_save.qc1.expands).times(1e7),
			canExpand: () => QCs_tmp.qc5 && QCs_save.qc5.gte(QCs.data[1].expandCost()),
			expandGain: () => Math.floor(QCs_save.qc5.div(QCs.data[1].expandCost()).times(3).add(1).log(4)),
			expandTarget: () => QCs.data[1].expandGain() + QCs_save.qc1.expands,
			expand(auto) {
				if (!this.canExpand()) return

				var cost = QCs.data[1].expandCost()
				var bulk = auto ? Math.floor(QCs.data[1].expandTarget() * QCs_save.qc1.autoExpand.percentage / 100) - QCs_save.qc1.expands : 1
				if (bulk < 0) return

				QCs_save.qc5 = QCs_save.qc5.sub(Decimal.pow(4, bulk).sub(1).div(3).times(cost))
				QCs_save.qc1.expands += bulk
			},
			autoExpand() {
				var save = QCs_save.qc1
				if (!QCs_tmp.qc5) return
				if (save.boosts < save.autoExpand.value) return
				if (this.expandGain() < Math.floor(this.expandTarget() * save.autoExpand.percentage / 100) - save.expands) return
				if (!this.canExpand()) return
				this.expand(true)
			},
			setAutoExpand(x) {
				QCs_save.qc1.autoExpand[x] = parseInt(getEl("setAutoExpand_" + x).value)
			}
		},
		2: {
			unl: () => true,
			desc: () => "Some quantum contents are based on one, but quantum energy multiplier. color powers, and gluons are useless; and you must exclude 1 tier from Positron Cloud.",
			goal: () => pos_save.boosts >= 11,
			goalDisp: () => getFullExpansion(11) + " Positronic Boosters",
			goalMA: Decimal.pow(Number.MAX_VALUE, 2.4),
			hint: "Mess around Positronic Cloud by swapping and excluding.",

			rewardDesc: (x) => "Color charge boosts itself by " + shorten(x) + "x.",
			rewardEff(str) {
				let x = Math.log10((str || colorCharge.normal.charge) + 1) / 2 + 1
				if (PCs.milestoneDone(21)) x *= x
				return x
			},

			upsideDesc: (x) => "Only excluded Positronic Boosts work.",
			perkDesc: (x) => "Entangled Boosts are 50% stronger, but mastery requires 20x more and always anti'd.",
			perkEff() {
				return 1
			},

			overlapReqs: [1/0, 1/0],

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
				quantum(false, true, {}, "restart")
			}
		},
		3: {
			unl: () => true,
			desc: () => "There are only Meta Dimensions that produce AM and IP, but successfully dilating reduces the AM production, and you only gain TP by exiting dilation.",
			goal: () => player.dilation.tachyonParticles.gte(1e6),
			goalDisp: () => shortenCosts(1e6) + " Tachyon Particles",
			goalMA: Decimal.pow(Number.MAX_VALUE, 0.2),
			hint: "Try not to automate dilation, and also not to dilate time frequently.",

			rewardDesc: (x) => "You sacrifice 30% of Meta Dimension Boosts instead of 25%.",
			rewardEff(str) {
				return 1
			},

			upsideDesc: (x) => "???",
			perkDesc: (x) => "Time multiplier is always 1x for the Meta Accelerator base.",
			perkEff() {
				return 1
			},

			overlapReqs: [1/0, 1/0],

			amProd() {
				return getMDProduction(1).max(1).pow(this.amExp())
			},
			amExp() {
				return 20 / Math.sqrt((player.dilation.times || 0) / 4 + 1)
			}
		},
		4: {
			unl: () => true,
			desc: () => "You must exclude one type of galaxy for a single run. Changing the exclusion requires a forced Eternity reset.",
			goal: () => player.dilation.freeGalaxies >= 2800,
			goalDisp: () => getFullExpansion(2800) + " Tachyonic Galaxies",
			goalMA: Decimal.pow(Number.MAX_VALUE, 2.4),
			hint: "Test every single combination of this exclusion, and try to minimize galaxies.",

			rewardDesc: (x) => "Replicated Galaxies contribute to Positronic Charge.",
			rewardEff(str) {
				return
			},

			upsideDesc: (x) => "???",
			perkDesc: (x) => "Total galaxies reduce the QC goal by " + shorten(x) + "x",
			perkEff() {
				return Math.pow(
					Math.sqrt(player.galaxies) +
					Math.sqrt(getTotalRGs()) +
					Math.sqrt(player.dilation.freeGalaxies)
				, 2)
			},

			overlapReqs: [1/0, 1/0],

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
				getEl("coinsPerSec").style.display = QCs.in(4) ? "none" : ""
				getEl("tickSpeedRow").style.display = QCs.in(4) ? "none" : ""

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
			desc: () => "You gain Replicanti Energy based on how many Replicantis you gained. However, Eternitying resets Replicantis, and you start at 1x replicate interval. (reduces over eternity time)",
			goal: () => player.eternityPoints.gte(Decimal.pow(10, 2.8e6)),
			goalDisp: () => shortenCosts(Decimal.pow(10, 2.8e6)) + " Eternity Points",
			goalMA: Decimal.pow(Number.MAX_VALUE, 1.7),
			hint: "Adjust your auto-Eternity time to maximize your production.",

			rewardDesc: (x) => "Sacrificed things are stronger for Positrons, but you sacrifice less galaxies.",
			rewardEff(str) {
				return 1
			},

			upsideDesc: (x) => "???",
			perkDesc: (x) => "Replicated Energy effect is doubled.",
			perkEff() {
				return 1
			},

			overlapReqs: [1/0, 1/0],

			exp: () => 1, //(QCs_save.qc1.boosts + 1) * Math.sqrt(QCs_save.qc1.expands + 1),
			updateTmp() {
				delete QCs_tmp.qc5
				if (!QCs.in(5) && !QCs.done(6)) return

				QCs_tmp.qc5 = {
					mult: new Decimal(QCs_save.qc1.boosts + 1),
					eff_glu: Math.pow(QCs_save.qc5.div(2e6).add(1).log(2), 12 / 7) * 5,
					eff_pos: QCs_save.qc5.div(2e6).add(1).log(2) * 10,
				}
				if (QCs.isRewardOn(6)) QCs_tmp.qc5.mult = QCs_tmp.qc5.mult.times(QCs_tmp.rewards[6])
				if (PCs.milestoneDone(52)) QCs_tmp.qc5.mult = QCs_tmp.qc5.mult.times(2)
				if (QCs.perkActive(5)) {
					QCs_tmp.qc5.eff_glu *= 2
					QCs_tmp.qc5.eff_pos *= 2
				}
			},

			updateDisp() {		
				getEl("qc5_div").style.display = QCs_tmp.qc5 ? "" : "none"
			},
			updateDispOnTick() {		
				let exp = QCs.data[5].exp()
				getEl("qc5_eng").textContent = shorten(QCs_save.qc5)
				getEl("qc5_eng_mult").textContent = shiftDown ? " (+" + shorten(Math.max(QCs_tmp.qc5.mult, 1)) + " per " + shorten(Decimal.pow(10, 1 / Math.min(QCs_tmp.qc5.mult, 1))) + "x)" : ""
				getEl("qc5_eng_exp").textContent = exp > 1 ? shorten(exp) : ""
				getEl("qc5_eff_glu").textContent = shorten(QCs_tmp.qc5.eff_glu)
				getEl("qc5_eff_pos").textContent = shorten(QCs_tmp.qc5.eff_pos)
			},
		},
		6: {
			unl: () => true,
			desc: () => "There is a increasing variable, which nerfs replicanti slowdown; but eternitying subtracts it, and dilating reduces the gain.",
			goal: () => (player.replicanti.amount.e >= 1e6 && QCs_save.qc1.boosts == 4) || QCs_save.qc1.boosts >= 5,
			goalDisp: () => shortenCosts(Decimal.pow(10, 1e6)) + " Replicantis + " + getFullExpansion(4) + " Replicanti Compressors",
			goalMA: Decimal.pow(Number.MAX_VALUE, 2.45),
			hint: "Do long Eternity runs.",

			rewardDesc: (x) => "Replicantis also produce Replicanti Energy; but also boosted by time since Eternity. (" + shorten(QCs_tmp.rewards[6]) + "x)",
			rewardEff(str) {
				let t = player.thisEternity / 10
				let t_puzzle = t
				if (PCs.milestoneDone(61)) t_puzzle /= 2
				if (PCs.milestoneDone(62)) t_puzzle = Math.sqrt(t)

				let x = Math.log2(t + 2)
				if (PCs.milestoneDone(61)) x *= x
				x *= (9 / (Math.abs(5 - t_puzzle) + 1) + 1) //Hindrance... >_<
				return x
			},

			upsideDesc: (x) => "QC6 variable is inverted.",
			perkDesc: (x) => "QC6 variable can’t go below 0.",
			perkEff() {
				return 1
			},

			overlapReqs: [1/0, 1/0],

			updateTmp() {
				delete QCs_tmp.qc6
				if (!QCs.in(6)) return

				QCs_tmp.qc6 = Math.log2(Math.max(QCs.modIn(6, "up") ? QCs_save.qc6 : -QCs_save.qc6, 0) / 100 + 1) + 2
			}
		},
		7: {
			unl: () => true,
			desc: () => "You can’t have all Mastery Studies in a row (except one-column rows), and Meta Dimensions and Time Theorems are reduced to ^0.95.",
			goal: () => player.timestudy.theorem >= 5e82,
			goalDisp: () => shortenDimensions(5e82) + " Time Theorems",
			goalMA: Decimal.pow(Number.MAX_VALUE, 2.3),
			hint: "Do not buy MS22 and MS53/54.",

			rewardDesc: (x) => "Meta Accelerator accelerates 20% faster, and unlock Paired Challenges.",
			rewardEff(str) {
				return 1
			},

			upsideDesc: (x) => "You can't passively generate TT, and QC7 applies to Time Studies. (partly implemented)",
			perkDesc: (x) => "You passively generate 10x more TT.",
			perkEff() {
				return 1
			},

			overlapReqs: [1/0, 1/0],
		},
		8: {
			unl: () => true,
			desc: () => "All Entangled Boosts are unmastered and anti'd. You have to setup a cycle of 2 chosen gluons, and Big Crunching switches your gluon kind to the next one.",
			goal: () => enB.glu.boosterEff() >= 130,
			goalDisp: () => "130 Effective Boosters",
			goalMA: Decimal.pow(Number.MAX_VALUE, 1.8),
			hint: "Make your Auto-Crunch faster than Auto-Eternity.",

			rewardDesc: (x) => "Unlock new comprehensive content for Paired Challenges.",
			rewardEff(str) {
				return 1
			},

			upsideDesc: (x) => "You must setup a cycle on Positronic Boosts. (not implemented)",
			perkDesc: (x) => "You can’t lose your Eternity time.",
			perkEff() {
				return 1
			},

			overlapReqs: [1/0, 1/0],

			switch() {
				var qc8 = QCs_save.qc8
				var eb12 = enB.active("glu", 12)
				qc8.index++
				if (qc8.index >= qc8.order.length) qc8.index = 0
				QCs.data[8].updateDisp()
				if (eb12 != enB.active("glu", 12)) updateColorCharge(true)
			},
			updateDisp() {
				if (!tmp.quUnl) return

				var qc8 = QCs_save.qc8
				var qc8_in = QCs.in(8)
				getEl("qc8_note").innerHTML = qc8_in ? "You have to Big Crunch to switch your gluon kind!<br>Used kinds: " + qc8.order.length + " / 2" : ""
				getEl("qc8_clear").style.display = qc8_in ? "" : "none"

				if (qc8_in) {
					updateGluonsTabOnUpdate()

					var kinds = ["rg", "gb", "br"]
					for (var k = 0; k < kinds.length; k++) {
						var kind = kinds[k]
						getEl("entangle_" + kind).className = qc8.order[qc8.index] == kind ? "chosenbtn2" : qc8.order.includes(kind) ? "chosenbtn" : qc8.order.length == 2 ? "unavailablebtn" : "gluonupgrade " + kind
					}
				}
			},
			clear() {
				if (!confirm("Are you sure?")) return
				QCs_save.qc8.index = 0
				QCs_save.qc8.order = []
				QCs.restart()
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
				data.rewards[x] = this.data[x].rewardEff()
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
		return QCs_tmp.in.length == 2 ? tmp.bgMode : QCs_tmp.in.length != 1
	},
	done(x) {
		return this.unl() && QCs_save.comps >= x
	},
	getGoal() {
		return PCs.in() || QCs_save.mod ? player.meta.bestAntimatter.gte(this.getGoalMA()) : player.meta.bestAntimatter.gte(this.getGoalMA()) && this.data[QCs_tmp.in[0]].goal()
	},
	getGoalDisp() {
		return PCs.in() ? "" : " and " + this.data[QCs_tmp.in[0]].goalDisp()
	},
	getGoalMA(x, mod) {
		var r
		if (x) {
			r = this.data[x].goalMA
			if (mod) r = r.pow(QCs.modData[mod].maExp)
		} else r = PCs.in() ? PCs.goal() : QCs_save.mod ? this.data[QCs_tmp.in[0]].goalMA.pow(QCs.modData[QCs_save.mod].maExp) : this.data[QCs_tmp.in[0]].goalMA
		if (this.perkActive(4)) r = r.div(QCs_tmp.perks[4])
		return r
	},
	isRewardOn(x) {
		return this.done(x) && QCs_tmp.rewards[x]
	},

	modData: {
		up: {
			name: 'Nerfed',
			maExp: 1.25,
			shrunker: 1
		},
		ol: {
			name: "Overlapped",
			maExp: 2,
			shrunker: 1
		},
		us: {
			name: "Unstable",
			maExp: 1/0,
			shrunker: 0
		},
		tl: {
			name: "Timeless",
			maExp: 1/0,
			shrunker: 0
		},
	},
	modIn(x, m) {
		return this.in(x) && QCs_save.mod == m
	},
	modDone(x, m) {
		var data = QCs_save.mod_comps
		return this.unl() && data && data.includes(m + x)
	},

	perkUnl(x) {
		return this.modDone(x, "up")
	},
	perkActive(x) {
		return QCs_tmp.perks[x] && this.perkUnl(x) && this.inAny()
	},
	overlapCan(x) {
		var data = this.data[x]
		if (!PCs.unl()) return
		if (pos_tmp.cloud == undefined) return
		if (this.perkUnl(x)) return
		return pos_tmp.cloud.total >= data.overlapReqs[0] && pos_tmp.cloud.exclude >= data.overlapReqs[1]
	},

	tp() {
		showTab("challenges")
		showChallengesTab("quantumchallenges")
	},
	start(x) {
		quantum(false, true, { qc: x }, "qc")
	},
	restart(x) {
		quantum(false, true, {}, "restart")
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
		getEl("qc_restart").style.display = QCs.in(2) || QCs.in(3) ? "" : "none"
		this.data[1].updateDisp()
		this.data[2].updateCloudDisp()
		this.data[4].updateDisp()
		this.data[5].updateDisp()
		this.data[8].updateDisp()

		//Quantum Challenges
		if (!unl) return

		getEl("qc_effects").innerHTML = QCs_tmp.show_perks ? "" : "All quantum mechanics will change, when entering a Quantum Challenge:<br>" +
			(tmp.bgMode ? "No" : (tmp.exMode ? "No" : "Reduced") + " global quark energy bonus, no") + " gluon nerfs, and mastered boosts only work."
		for (let qc = 1; qc <= this.data.max; qc++) {
			var cUnl = QCs_tmp.unl.includes(qc)

			getEl("qc_" + qc + "_div").style.display = cUnl ? "" : "none"
			if (QCs_tmp.show_perks) {
				var reqs = this.data[qc].overlapReqs
				getEl("qc_" + qc + "_desc").textContent = this.data[qc].upsideDesc()
				getEl("qc_" + qc + "_goal").textContent = "Goal: " + shorten(this.getGoalMA(qc, "up")) + " meta-antimatter"
				getEl("qc_" + qc + "_btn").textContent = this.modIn(qc, "up") ? "Running" : this.modDone(qc, "up") ? (this.perkActive(qc) ? "Perk Activated" : "Completed") : "Start"
				getEl("qc_" + qc + "_btn").className = this.modIn(qc, "up") ? "onchallengebtn" : this.modDone(qc, "up") ? "completedchallengesbtn" : "challengesbtn"
			} else if (cUnl) {
				getEl("qc_" + qc + "_desc").textContent = this.data[qc].desc()
				getEl("qc_" + qc + "_goal").textContent = "Goal: " + shorten(this.data[qc].goalMA) + " meta-antimatter and " + this.data[qc].goalDisp()
				getEl("qc_" + qc + "_btn").textContent = this.in(qc) ? "Running" : this.done(qc) ? "Completed" : "Start"
				getEl("qc_" + qc + "_btn").className = this.in(qc) ? "onchallengebtn" : this.done(qc) ? "completedchallengesbtn" : "challengesbtn"
			}
		}

		getEl("qc_perks").style.display = QCs.done(8) ? "inline" : "none"
		getEl("qc_perks").textContent = QCs_tmp.show_perks ? "Back" : 'Nerfed modifier'
		getEl("qc_perks_note").textContent = QCs_tmp.show_perks ? 'Note: Nerfed modifier doesn\'t have its secondary goals. And perks only work in any Quantum Challenge!' : ""
	},
	updateDispOnTick() {
		if (!this.divInserted) return

		for (let qc = 1; qc <= this.data.max; qc++) {
			if (QCs_tmp.unl.includes(qc)) getEl("qc_" + qc + "_reward").innerHTML = 
				QCs_tmp.show_perks ? "Reward: +1 PC Shrunker<br>Perk: " + this.data[qc].perkDesc(QCs_tmp.perks[qc]) :
				shiftDown || QCs.in(qc) ? "Hint: " + this.data[qc].hint :
				"Reward: " + this.data[qc].rewardDesc(QCs_tmp.rewards[qc])
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