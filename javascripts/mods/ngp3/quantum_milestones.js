//New: v3.0 / Old: v1.79
let qMs = {
	tmp: {},
	data: {
		types: ["sr", "rl", "en", "ch"],
		sr: {
			name: "Speedrun",
			targ: () => qu_save.best,
			targDisp: timeDisplay,
			daysStart: () => tmp.dtMode ? 0.25 : tmp.exMode ? 0.375 : tmp.bgMode ? 0.75 : 0.5,
			gain: (x) => Math.log10(86400 * qMs.data.sr.daysStart() / x) / Math.log10(2) * 3 + 1,
			nextAt: (x) => Math.pow(2, (1 - x) / 3) * 86400 * qMs.data.sr.daysStart()
		},
		rl: {
			name: "Relativistic",
			targ: () => new Decimal(player.dilation.bestTP || 0),
			targDisp: shorten,
			gain: (x) => (x.max(1).log10() - 80) / 5 + 1,
			nextAt: (x) => Decimal.pow(10, (x - 1) * 5 + 80)
		},
		en: {
			name: "Enegretic",
			targ: () => qu_save.bestEnergy || 0,
			targDisp: shorten,
			gain: (x) => Math.sqrt(Math.max(x - 0.5, 0)) * 3,
			nextAt: (x) => Math.pow(x / 3, 2) + 0.5
		},
		ch: {
			name: "Challenging",
			unl: () => QCs.unl(),
			targ: () => 0,
			targDisp: getFullExpansion,
			gain: (x) => 0,
			nextAt: (x) => 1/0
		}
	},
	update() {
		let data = {}
		qMs.tmp = data

		data.amt = 0
		data.points = 0
		data.metaSpeed = 10
		if (!tmp.quUnl) return

		//Milestone Points
		let types = qMs.data.types
		for (var i = 0; i < types.length; i++) {
			var type = types[i]
			var typeData = qMs.data[type]
			var unl = typeData.unl ? typeData.unl() : true

			data["targ_" + type] = typeData.targ()
			data["amt_" + type] = Math.max(Math.floor(typeData.gain(data["targ_" + type])), 0)
			data.points += data["amt_" + type]
		}

		//Milestones
		for (var i = 1; i <= qMs.max; i++) {
			if (data.points >= qMs[i].req) data.amt++
			else delete qu_save.disabledRewards[i]
		}

		if (qMs.tmp.amt >= 12) data.metaSpeed *= Math.pow(0.9, Math.pow(qMs.tmp.amt - 12 + 1, 1 + Math.max(qMs.tmp.amt - 20, 0) / 15))
	},
	updateDisplay() {
		if (tmp.quUnl) {
			let types = qMs.data.types
			for (var i = 0; i < types.length; i++) {
				var type = types[i]
				var typeData = qMs.data[type]
				var unl = typeData.unl ? typeData.unl() : true

				getEl("qMs_" + type + "_cell").style.display = unl ? "" : "none"
			}

			for (var i = 1; i <= qMs.max; i++) {
				getEl("qMs_req_" + i).textContent = "Milestone Point #" + getFullExpansion(qMs[i].req)
				getEl("qMs_reward_" + i).className = qMs.tmp.amt < i || qMs.forceOff(i) ? "qMs_locked" :
					!this[i].disablable ? "qMs_reward" :
					"qMs_toggle_" + (!qu_save.disabledRewards[i] ? "on" : "off")
				getEl("qMs_reward_" + i).textContent = qMs[i].eff()
			}
		}

		getEl('dilationmode').style.display = qMs.tmp.amt >= 5 ? "" : "none"
		getEl('rebuyupgauto').style.display = qMs.tmp.amt >= 11 ? "" : "none"
		getEl('metaboostauto').style.display = qMs.tmp.amt >= 14 ? "" : "none"
		getEl("autoBuyerQuantum").style.display = qMs.tmp.amt >= 18 ? "" : "none"
		getEl('rebuyupgmax').style.display = qMs.tmp.amt < 24 ? "" : "none"
	},
	updateDisplayOnTick() {
		let types = qMs.data.types
		for (var i = 0; i < types.length; i++) {
			var type = types[i]
			var typeData = qMs.data[type]
			var unl = typeData.unl ? typeData.unl() : true

			if (unl) {
				getEl("qMs_" + type + "_target").textContent = typeData.targDisp(qMs.tmp["targ_" + type])
				getEl("qMs_" + type + "_points").textContent = getFullExpansion(qMs.tmp["amt_" + type])
				getEl("qMs_" + type + "_next").textContent = typeData.targDisp(typeData.nextAt(qMs.tmp["amt_" + type] + 1))
			}
		}

		getEl("qMs_points").textContent = getFullExpansion(qMs.tmp.points)
	},
	isOn(id) {
		return qMs.tmp.amt >= id && (!this[id].disablable || !qu_save.disabledRewards[id]) && !qMs.forceOff(id)
	},
	forceOff(id) {
		return qMs[id].forceDisable !== undefined && qMs[id].forceDisable()
	},
	toggle(id) {
		if (!qMs[id].disablable) return
		if (qMs.forceOff(id)) return
		if (qMs.tmp.amt < id) return

		let on = !qu_save.disabledRewards[id]
		qu_save.disabledRewards[id] = on
		getEl("qMs_reward_" + id).className = "qMs_toggle_" + (!on ? "on" : "off")
	},

	max: 32,
	1: {
		req: 1,
		eff: () => "Start with 100 Eternities, and EC completions no longer respec studies",
		effGot: () => "You now start with 100 Eternities, EC completions no longer respec studies."
	},
	2: {
		req: 2,
		eff: () => "Unlock the autobuyer for Time Theorems, start with 3x more Eternities per milestone, and keep Eternity Challenges",
		effGot: () => "You now can automatically buy Time Theorems, start with 3x more Eternities per milestone, and keep Eternity Challenges."
	},
	3: {
		req: 3,
		disablable: true,
		eff: () => "Keep all your Eternity Upgrades and Time Studies",
		effGot: () => "You now can keep all your Eternity Upgrades and Time Studies."
	},
	4: {
		req: 4,
		eff: () => "Unlock the 'X times eternitied' mode for auto-Eternity",
		effGot: () => "You have unlocked the 'X times eternitied' mode for auto-Eternity."
	},
	5: {
		req: 5,
		disablable: true,
		eff: () => "Start with Time Dilation unlocked & 1 TP" + (tmp.dtMode ? "" : " and each time you buy '3x TP' upgrade, your TP amount is increased by 3x"),
		effGot: () => "You now start with Time Dilation unlocked & 1 TP" + (tmp.dtMode ? "" : " and each time you buy '3x TP' upgrade, your TP amount is increased by 3x.")
	},
	6: {
		req: 6,
		eff: () => "Start with all 8 Time Dimensions",
		effGot: () => "You now start with all 8 Time Dimensions."
	},
	7: {
		req: 7,
		eff: () => "Keep all your dilation upgrades except the repeatables",
		effGot: () => "You now can keep all your dilation upgrades except the repeatables."
	},
	8: {
		req: 8,
		forceDisable: () => tmp.dtMode || QCs.inAny(),
		disablable: true,
		eff: () => tmp.dtMode ? "N/A" : "Keep " + (tmp.exMode ? "25% of" : tmp.bgMode ? "all" : "50% of") + " your dilation upgrades that boost TP gain",
		effGot: () => tmp.dtMode ? "" : "You now can keep " + (tmp.exMode ? "25% of" : tmp.bgMode ? "all" : "50% of") + " your dilation upgrades that boost TP gain."
	},
	9: {
		req: 9,
		eff: () => "Start with Meta Dimensions unlocked",
		effGot: () => "You now start with Meta Dimensions unlocked."
	},
	10: {
		req: 10,
		eff: () => "Keep all your mastery studies",
		effGot: () => "You now can keep all your mastery studies."
	},
	11: {
		req: 11,
		eff: () => "Unlock the autobuyer for repeatable dilation upgrades",
		effGot: () => "You now can automatically buy repeatable dilation upgrades."
	},
	12: {
		req: 12,
		eff: () => "Reduce the interval of auto-dilation upgrades and MDs by 10% per milestone" + (qMs.tmp.amt >= 12 ? " (" + shorten(1 / qMs.tmp.metaSpeed) + "/s)" : ""),
		effGot: () => "The interval of auto-dilation upgrades and MDs is now reduced by 10% per milestone."
	},
	13: {
		req: 13,
		eff: () => "Reduce the interval of auto-slow MDs by 1 tick per milestone (repeats for each following milestone)",
		effGot: () => "The interval of auto-slow MDs is now reduced by 1 tick per milestone. (repeats for each following milestone)"
	},
	14: {
		req: 14,
		eff: () => "Unlock the autobuyer for meta-Dimension Boosts",
		effGot: () => "You now can automatically buy meta-Dimension Boosts."
	},
	15: {
		req: 15,
		eff: () => "Unlock an option for auto-Eternity that automatically dilates for each interval of Eternity runs",
		effGot: () => "You have unlocked an option for auto-Eternity that automatically dilates for each interval of Eternity runs."
	},
	16: {
		req: 16,
		eff: () => "Start with " + shortenCosts(1e30) + " meta-antimatter",
		effGot: () => "You now start with " + shortenCosts(1e30) + " meta-antimatter."
	},
	17: {
		req: 17,
		eff: () => "All Meta Dimensions are available for purchase on Quantum",
		effGot: () => "All Meta Dimensions are now available for purchase on Quantum."
	},
	18: {
		req: 18,
		eff: () => "Unlock the autobuyer for Quantum runs",
		effGot: () => "You can now automatically go Quantum."
	},
	19: {
		req: 19,
		eff: () => "Start with 4 Meta-Dimension Boosts and Meta-Dimension Boosts no longer reset Meta Dimensions",
		effGot: () => "You now start with 4 Meta-Dimension Boosts and Meta-Dimension Boosts no longer reset Meta Dimensions anymore."
	},
	20: {
		req: 20,
		eff: () => "Gain banked infinities based on your post-crunch infinitied stat",
		effGot: () => "Gain banked infinities based on your post-crunch infinitied stat."
	},
	21: {
		req: 25,
		eff: () => "Each milestone greatly reduces the interval of auto-dilation upgrades and MDBs",
		effGot: () => "Each milestone now greatly reduces the interval of auto-dilation upgrades and MDBs."
	},
	22: {
		req: 30,
		eff: () => "'2 Million Infinities' effect is always applied and is increased to " + shorten(1e3) + "x",
		effGot: () => "'2 Million Infinities' effect is now always applied and is increased to " + shorten(1e3) + "x."
	},
	23: {
		req: 35,
		eff: () => "All Infinity-related autobuyers fire for each tick",
		effGot: () => "All Infinity-related autobuyers now fire for each tick"
	},
	24: {
		req: 45,
		disablable: true,
		eff: () => "Auto-dilation upgrades maximize all repeatable dilation upgrades",
		effGot: () => "Auto-dilation upgrades now can maximize all repeatable dilation upgrades."
	},
	25: {
		req: 55,
		forceDisable: () => QCs.inAny(),
		disablable: true,
		eff: () => "Each Quantum reduces Replicantis by ^0.95.",
		effGot: () => "Each following Quantum run now reduces Replicantis by ^0.95."
	},
	26: {
		req: 70,
		disablable: true,
		eff: () => "Start with one dilation worth of TP at same antimatter as total",
		effGot: () => "You now start with one dilation worth of TP at same antimatter as total."
	},
	27: {
		req: 80,
		disablable: true,
		eff: () => "Some achievement rewards are disabled when turned off",
		effGot: () => "Some achievement rewards are disabled when turned off."
	},
	28: {
		req: 100,
		eff: () => "Unlock the autobuyer for Entangled Boosters (not implemented)",
		effGot: () => "You now can automatically get Entangled Boosters."
	},
	29: {
		req: 125,
		eff: () => "Unlock the autobuyer for Positronic Boosters (not implemented)",
		effGot: () => "You now can automatically get Positronic Boosters."
	},
	30: {
		req: 150,
		eff: () => "Able to maximize Meta-Dimension Boosts",
		effGot: () => "You now can maximize Meta-Dimension Boosts."
	},
	31: {
		req: 175,
		disablable: true,
		eff: () => "Start with exactly 4 completions of EC14.",
		effGot: () => "You now start with exactly 4 completions of EC14."
	},
	32: {
		req: 200,
		eff: () => "Able to purchase all time studies without blocking",
		effGot: () => "You now can buy every single time study."
	}
}