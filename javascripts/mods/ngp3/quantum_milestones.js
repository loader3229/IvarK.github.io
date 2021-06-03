//New: v3.0 / Old: v1.79
let qMs = {
	tmp: {},
	data: {
		types: ["sr", "rl", "en", "ch"],
		sr: {
			name: "Speedrun",
			targ: () => tmp.qu.best,
			targDisp: timeDisplay,
			gain: (x) => Math.log10(86400 / x) / Math.log10(2) * 2 + 1,
			nextAt: (x) => Math.pow(2, (1 - x) / 2) * 86400
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
			targ: () => tmp.qu.bestEnergy || 0,
			targDisp: shorten,
			gain: (x) => Math.sqrt(x) * 2,
			nextAt: (x) => Math.pow(x / 2, 2)
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
		if (!tmp.ngp3) return

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
			else delete tmp.qu.disabledRewards[i]
		}
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
				getEl("qMs_reward_" + i).className = qMs.tmp.amt < i ? "qMs_locked" :
					!this[i].disablable ? "qMs_reward" :
					"qMs_toggle_" + (!tmp.qu.disabledRewards[i] ? "on" : "off")
				getEl("qMs_reward_" + i).textContent = qMs[i].eff()
			}
		}

		getEl('dilationmode').style.display = qMs.tmp.amt >= 4 ? "" : "none"
		getEl('rebuyupgauto').style.display = qMs.tmp.amt >= 7 ? "" : "none"
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
		return qMs.tmp.amt >= id && (!this[id].disablable || !tmp.qu.disabledRewards[id])
	},
	toggle(id) {
		if (!this[id].disablable) return
		if (qMs.tmp.amt < id) return

		let on = !tmp.qu.disabledRewards[id]
		tmp.qu.disabledRewards[id] = on
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
		eff: () => "Unlock the autobuyer for Time Theorems, start with Eternities (based on Quantum Milestones), and keep Eternity Challenges",
		effGot: () => "You now can automatically buy Time Theorems, start with Eternities (based on Quantum Milestones), and keep Eternity Challenges."
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
		eff: () => "Start with Time Dilation unlocked & 1 TP and each time you buy '3x TP' upgrade, your TP amount is increased by 3x",
		effGot: () => "You now start with Time Dilation unlocked & 1 TP and each time you buy '3x TP' upgrade, your TP amount is increased by 3x."
	},
	6: {
		req: 6,
		eff: () => "Start with all 8 Time Dimensions",
		effGot: () => "You now start with all 8 Time Dimensions."
	},
	7: {
		req: 7,
		eff: () => "Keep all your dilation upgrades expect the repeatables",
		effGot: () => "You now can keep all your dilation upgrades expect the repeatables."
	},
	8: {
		req: 8,
		eff: () => "Keep all your dilation upgrades that boost TP gain",
		effGot: () => "You now can keep all your dilation upgrades that boost TP gain."
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
		eff: () => "Reduce the interval of auto-dilation upgrades and MDs by 10% (repeats for each following milestone)",
		effGot: () => "The interval of auto-dilation upgrades and MDs is now reduced by 10%. (repeats for each following milestone)"
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
		req: 16,
		eff: () => "Unlock an option for auto-Eternity that automatically dilates for each interval of Eternity runs",
		effGot: () => "You have unlocked an option for auto-Eternity that automatically dilates for each interval of Eternity runs."
	},
	16: {
		req: 18,
		eff: () => "Start with " + shortenCosts(1e30) + " meta-antimatter",
		effGot: () => "You now start with " + shortenCosts(1e30) + " meta-antimatter."
	},
	17: {
		req: 20,
		eff: () => "All Meta Dimensions are available for purchase on Quantum",
		effGot: () => "All Meta Dimensions are now available for purchase on Quantum."
	},
	18: {
		req: 22,
		eff: () => "Unlock the autobuyer for Quantum runs",
		effGot: () => "You can now automatically go Quantum."
	},
	19: {
		req: 24,
		eff: () => "Start with 4 Meta-Dimension Boosts and Meta-Dimension Boosts no longer reset Meta Dimensions",
		effGot: () => "You now start with 4 Meta-Dimension Boosts and Meta-Dimension Boosts no longer reset Meta Dimensions anymore."
	},
	20: {
		req: 27,
		eff: () => "Gain banked infinities based on your post-crunch infinitied stat",
		effGot: () => "Gain banked infinities based on your post-crunch infinitied stat."
	},
	21: {
		req: 30,
		eff: () => "Each milestone greatly reduces the interval of auto-dilation upgrades and MDBs",
		effGot: () => "Each milestone now greatly reduces the interval of auto-dilation upgrades and MDBs."
	},
	22: {
		req: 35,
		eff: () => "'2 Million Infinities' effect actives at 1s instead of 5s",
		effGot: () => "'2 Million Infinities' effect now actives at 1s instead of 5s."
	},
	23: {
		req: 40,
		eff: () => "All Infinity-related autobuyers fire for each tick",
		effGot: () => "All Infinity-related autobuyers now fire for each tick"
	},
	24: {
		req: 50,
		disablable: true,
		eff: () => "Auto-dilation upgrades maximize all repeatable dilation upgrades",
		effGot: () => "Auto-dilation upgrades now can maximize all repeatable dilation upgrades."
	},
	25: {
		req: 60,
		eff: () => "Each Quantum reduces Replicantis by ^0.95.",
		effGot: () => "Each following Quantum run now reduces Replicantis by ^0.95."
	},
	26: {
		req: 75,
		eff: () => "Start with one dilation worth of TP at " + shorten(Number.MAX_VALUE) + " antimatter (not implemented)",
		effGot: () => "You now start with one dilation worth of TP at " + shorten(Number.MAX_VALUE) + " antimatter"
	},
	27: {
		req: 85,
		disablable: true,
		eff: () => "You can toggle some achievement rewards",
		effGot: () => "You now toggle some achievement rewards"
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