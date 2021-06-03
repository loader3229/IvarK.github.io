var nanospeed = 1
function getNanospeedText(){
	s = ""
	let speeds = []
	let speedDescs = []
	if (ph.did("ghostify")) {
		speeds.push(tmp.ns)
		speedDescs.push("")
	}
	if (nanospeed != 1) {
		speeds.push(nanospeed)
		speedDescs.push("Dev")
	}
	if (ls.mult("nf") != 1) {
		speeds.push(ls.mult("nf"))
		speedDescs.push("'Light Speed' mod")
	}
	return speeds.length >= 1 ? (shiftDown ? getNanofieldSpeedText() :
		"Your Nanofield speed is currently " + factorizeDescs(speeds, speedDescs) + shorten(getNanofieldFinalSpeed()) + "x (hold shift for details)"
		): ""
}

function updateNanoverseTab(){
	getEl("ns").textContent = getNanospeedText()

	let rewards = tmp.qu.nanofield.rewards
	getEl("quarksNanofield").textContent = shortenDimensions(tmp.qu.replicants.quarks)		
	getEl("quarkCharge").textContent = shortenMoney(tmp.qu.nanofield.charge)
	getEl("quarkChargeRate").textContent = shortenDimensions(getQuarkChargeProduction())
	getEl("quarkLoss").textContent = shortenDimensions(getQuarkLossProduction())
	getEl("preonEnergy").textContent = shortenMoney(tmp.qu.nanofield.energy)
	getEl("quarkEnergyRate").textContent = shortenMoney(getQuantumEnergyProduction())
	getEl("quarkPower").textContent = getFullExpansion(tmp.qu.nanofield.power)
	getEl("quarkPowerThreshold").textContent = shortenMoney(tmp.qu.nanofield.powerThreshold)
	getEl("quarkAntienergy").textContent = shortenMoney(tmp.qu.nanofield.antienergy)
	getEl("quarkAntienergyRate").textContent = shortenMoney(getQuarkAntienergyProduction())
	getEl("quarkChargeProductionCap").textContent = shortenMoney(getQuarkChargeProductionCap())

	getEl("rewards").textContent = getFullExpansion(rewards)
	getEl("nfRewardScaling").textContent = getGalaxyScaleName(tmp.nf.scale) + "Nanorewards"

	for (let reward = 1; reward <= 8; reward++) {
		let oldClass = getEl("nfReward" + reward).className
		let newClass = reward > rewards ? "nfRewardlocked" : "nfReward"
		if (oldClass != newClass) getEl("nfReward" + reward).className = newClass

		getEl("nfReward" + reward).textContent = wordizeList(nanoRewards.effectsUsed[reward].map(x => nanoRewards.effectDisplays[x](tmp.nf.effects[x])), true) + "."
		getEl("nfRewardHeader" + reward).textContent = (rewards % 8 + 1 == reward ? "Next" : DISPLAY_NAMES[reward]) + " reward"
		getEl("nfRewardTier" + reward).textContent = "Tier " + getFullExpansion(Math.ceil((rewards + 1 - reward) / 8)) + " / Power: " + tmp.nf.powers[reward].toFixed(1)
	}

	getEl("nfReward5").textContent = (tmp.nf.powers[5] > 15 ? nanoRewards.effectDisplays.light_threshold_speed(tmp.nf.effects.light_threshold_speed) : nanoRewards.effectDisplays.dil_effect_exp(tmp.nf.effects.dil_effect_exp)) + "."
}

function updateNanofieldAntipreon(){
	var rewards = tmp.qu.nanofield.rewards
	getEl("rewards_AP").textContent = getFullExpansion(rewards)
	getEl("rewards_wake").textContent = getFullExpansion(tmp.apgw)
	getEl("sleepy").style.display = tmp.qu.nanofield.apgWoke ? "none" : ""
	getEl("woke").style.display = tmp.qu.nanofield.apgWoke ? "" : "none"
}

function updateNanofieldTab(){
	if (getEl("nanoverse").style.display == "block") updateNanoverseTab()
	if (getEl("antipreon").style.display == "block") updateNanofieldAntipreon()
}

function getQuarkChargeProduction(noSpeed) {
	let ret = new Decimal(1)
	if (isNanoEffectUsed("preon_charge")) ret = tmp.nf.effects.preon_charge
	if (hasNU(3)) ret = ret.times(tmp.nu[3])
	if (hasNU(7)) ret = ret.times(tmp.nu[7])
	if (tmp.qu.nanofield.power > tmp.apgw) ret = ret.div(Decimal.pow(2, (tmp.qu.nanofield.power - tmp.apgw) / 2))
	if (!noSpeed) ret = ret.times(getNanofieldFinalSpeed())
	return ret
}

function startProduceQuarkCharge() {
	tmp.qu.nanofield.producingCharge = !tmp.qu.nanofield.producingCharge
	getEl("produceQuarkCharge").innerHTML = (tmp.qu.nanofield.producingCharge ? "Stop" : "Start") + " production of preon charge." + (tmp.qu.nanofield.producingCharge ? "" : "<br>(You will not get preons when you do this.)")
}

function getQuarkLossProduction() {
	let ret = getQuarkChargeProduction(true)
	let retCube = ret.pow(3)
	if (retCube.gte("1e180")) retCube = retCube.pow(Math.pow(180 / retCube.log10(), 2 / 3))
	ret = ret.times(retCube).times(4e25)
	if (hasNU(3)) ret = ret.div(10)
	if (tmp.qu.nanofield.power > tmp.apgw) ret = ret.pow((tmp.qu.nanofield.power - tmp.apgw) / 5 + 1)
	ret = ret.times(getNanofieldFinalSpeed())
	return ret
}

function getQuantumEnergyProduction() {
	let ret = tmp.qu.nanofield.charge.sqrt()
	if (masteryStudies.has(411)) ret = ret.times(getMTSMult(411))
	if (masteryStudies.has(421)) ret = ret.times(getMTSMult(421))
	if (isNanoEffectUsed("preon_energy")) ret = ret.times(tmp.nf.effects.preon_energy)
	ret = ret.times(getNanofieldFinalSpeed())
	return ret
}

function getQuarkAntienergyProduction() {
	if (hasBosonicUpg(51)) return new Decimal(0)
	let ret = tmp.qu.nanofield.charge.sqrt()
	if (masteryStudies.has(401)) ret = ret.div(getMTSMult(401))
	if (tmp.qu.nanofield.power > tmp.apgw) ret = ret.times(Decimal.pow(2, (tmp.qu.nanofield.power - tmp.apgw) / 2))
	ret = ret.times(getNanofieldFinalSpeed())
	return ret
}

function getQuarkChargeProductionCap() {
	return tmp.qu.nanofield.charge.times(2500).sqrt()
}

var nanoRewards = {
	scaling: {
		max: 4,
		1: {
			start: 0,
			mult(diff) {
				let base = testHarderNGp3 ? 5 : 4
				let init = 50
				return Decimal.pow(base, diff).times(init)
			}
		},
		2: {
			start: 16,
			mult(diff) {
				return Decimal.pow(2, diff * (diff + 3))
			}
		},
		3: {
			start: 125,
			active() {
				return !hasAch("ng3p82")
			},
			mult(diff) {
				return Decimal.pow(2, diff * (diff + 1))
			}
		},
		4: {
			start: 150,
			mult(diff) {
				return Decimal.pow(1.1, diff * (diff + 1) * (diff + 2) / 3 + diff * (diff + 1) / 2 * 19)
			}
		}
	},
	effects: {
		hatch_speed: function(x) {
			return Decimal.pow(25 + 5 * x, x)
		},
		ma_effect_exp: function(x) {
			return Math.sqrt(x * 6.8)
		},
		dil_gal_gain: function(x) {
			x = Math.pow(x, 0.83) * 0.039
			if (x > 1/3) x = (Math.log10(x * 3) + 1) / 3
			return x + 1
		},
		dt_to_ma_exp: function(x) {
			return Math.sqrt(x) * 0.01 + 0.1
		},
		dil_effect_exp: function(x) {
			if (x > 15) tier = Math.log10(x - 5) * 15
			return x * 0.36 + 1
		},
		remote_start: function(x) {
			return x * 2150
		},
		preon_charge: function(x) {
			return Decimal.pow(2.6, x)
		},
		per_10_power: function(x) {
			return x * 0.76
		},
		preon_energy: function(x) {
			return Decimal.pow(2.5, Math.sqrt(x))
		},
		neutrinos: function(x) {
			return Decimal.pow(10, Math.pow(x, 2) * 5)
		},
		light_threshold_speed: function(x) {
			return Math.max(Math.sqrt(x + 1) / 4, 1)
		},
		unknown: function(x) {
			return 1
		}
	},
	effectDisplays: {
		hatch_speed: function(x) {
			return "Eggons hatch " + shorten(x) + "x faster"
		},
		ma_effect_exp: function(x) {
			return "meta-antimatter effect is buffed to ^" + x.toFixed(2)
		},
		dil_gal_gain: function(x) {
			return "you gain " + formatPercentage(x - 1) + "% more free galaxies"
		},
		dt_to_ma_exp: function(x) {
			return "dilated time gives ^" + x.toFixed(3) + " boost to all Meta Dimensions"
		},
		dil_effect_exp: function(x) {
			return "in dilation, Normal Dimension multipliers and Tickspeed are raised by ^" + x.toFixed(2)
		},
		remote_start: function(x) {
			return "Remote Antimatter Galaxies scaling starts " + getFullExpansion(Math.floor(x)) + " later"
		},
		preon_charge: function(x) {
			return "you produce " + shorten(x) + "x faster preon charge"
		},
		per_10_power: function(x) {
			return "multiplier per ten dimensions is increased by " + x.toFixed(2) + "x"
		},
		preon_energy: function(x) {
			return "you produce " + shorten(x) + "x faster preon energy"
		},
		neutrinos: function(x) {
			return "you gain " + shorten(x) + "x more neutrinos"
		},
		light_threshold_speed: function(x) {
			return "Light threshold increases " + x.toFixed(2) + "x slower"
		},
		unknown: function(x) {
			return "they boost something by " + shorten(x) + "x"
		}
	},
	effectsUsed: {
		1: ["hatch_speed"],
		2: ["ma_effect_exp"],
		3: ["dil_gal_gain"],
		4: ["dt_to_ma_exp"],
		5: ["dil_effect_exp"],
		6: ["unknown"],
		7: ["remote_start", "preon_charge"],
		8: ["per_10_power", "preon_energy"],
	},
	effectToReward: {}
}

function isNanoEffectUsed(x) {
	return tmp.quActive && tmp.nf !== undefined && tmp.nf.rewardsUsed !== undefined && tmp.nf.rewardsUsed.includes(x) && tmp.nf.effects !== undefined
}

function getNanofieldSpeedText(){
	text = ""
	if (ph.did("ghostify") && tmp.qu.nanofield.rewards < 16) text += "Ghostify Bonus: " + shorten(player.ghostify.milestone >= 1 ? 6 : 3) + "x, "
	if (hasAch("ng3p78")) text += "'Aren't you already dead' reward: " +shorten(Math.sqrt(getTreeUpgradeLevel(8) * tmp.tue + 1)) + "x, "
	if (hasNU(15)) text += "Neutrino upgrade 15: " + shorten(tmp.nu[15]) + "x, "
	if (GDs.unlocked()) text += "Gravity Well Energy: ^" + shorten(GDs.tmp.nf) + ", "
	var lsSpeed = ls.mult("nf")
	if (lsSpeed != 1) {
		if (lsSpeed > 1) text += "'Light Speed' mod: " + shorten(lsSpeed) + "x, "
		if (lsSpeed < 1) text += "'Light Speed' mod: /" + shorten(1 / lsSpeed) + ", "
	}
	if (nanospeed != 1) {
		if (nanospeed > 1) text += "Dev: " + shorten(nanospeed) + "x, "
		if (nanospeed < 1) text += "Dev: /" + shorten(1 / nanospeed) + ", "
	}
	if (text == "") return "No multipliers currently"
	return text.slice(0, text.length-2)
}

function getNanofieldSpeed() {
	let x = 1
	if (ph.did("ghostify")) x *= tmp.qu.nanofield.rewards >= 16 ? 1 : (player.ghostify.milestone >= 1 ? 6 : 3)
	if (hasAch("ng3p78")) x *= Math.sqrt(getTreeUpgradeLevel(8) * tmp.tue + 1)
	if (hasNU(15)) x = tmp.nu[15].times(x)
	if (GDs.boostUnl('nf')) x = Decimal.pow(x, GDs.tmp.nf)
	return x
}

function getNanofieldFinalSpeed() {
	return Decimal.times(tmp.ns, nanospeed * ls.mult("nf"))
}

function getNanoRewardPower(reward, rewards) {
	let x = Math.ceil((rewards - reward + 1) / 8)
	let apgw = tmp.apgw
	if (rewards >= apgw) {
		let sbsc = Math.ceil((apgw - reward + 1) / 8)
		x = Math.sqrt((x / 2 + sbsc / 2) * sbsc)
		if (reward == (rewards - 1) % 8 + 1) x += 0.5
	}
	return x * tmp.nf.powerEff
}

function getNanoRewardPowerEff() {
	let x = 1
	if (hasBosonicUpg(31)) x *= tmp.blu[31]
	return x
}

function getNanoRewardReq(additional) {
	return getNanoRewardReqFixed(additional - 1 + tmp.qu.nanofield.power)
}

function isNanoScalingActive(x) {
	if (x == 1) return true
	return nanoRewards.scaling[x].active === undefined || nanoRewards.scaling[x].active()
}

function getNanoRewardReqFixed(n) {
	let x = new Decimal(1)
	let d = nanoRewards.scaling
	for (let s = 1; s <= nanoRewards.scaling.max; s++) {
		if (isNanoScalingActive(s) && n >= d[s].start) x = x.times(d[s].mult(n - d[s].start))
	}
	return x.pow(tmp.ppti || 1)
}

function updateNextPreonEnergyThreshold(){
	tmp.qu.nanofield.power += doBulkSpent(tmp.qu.nanofield.energy, getNanoRewardReqFixed, tmp.qu.nanofield.power).toBuy
	tmp.qu.nanofield.powerThreshold = getNanoRewardReq(1)
}

function updateNanoEffectUsages() {
	var data = []
	tmp.nf.rewardsUsed = data
	nanoRewards.effectToReward = {}

	//First reward
	var data2 = [hasBosonicUpg(21) ? "unknown" : "hatch_speed"]
	nanoRewards.effectsUsed[1] = data2

	//Fifth reward
	var data2 = ["dil_effect_exp"]
	data2.push("light_threshold_speed")
	nanoRewards.effectsUsed[5] = data2

	//Seventh reward
	var data2 = [hasBosonicUpg(22) ? "neutrinos" : "remote_start", "preon_charge"]
	nanoRewards.effectsUsed[7] = data2

	//Used Nanofield rewards
	for (var x = 1; x <= 8; x++) {
		var rewards = nanoRewards.effectsUsed[x]
		for (var r = 0; r < rewards.length; r++) {
			data.push(rewards[r])
			nanoRewards.effectToReward[rewards[r]] = x
		}
	}
}

function updateNanoRewardPowers() {
	var data = {}
	tmp.nf.powers = data

	for (var x = 1; x <= 8; x++) data[x] = getNanoRewardPower(x, tmp.nf.rewards)
}

function updateNanoRewardEffects() {
	var data = {}
	tmp.nf.effects = data

	for (var e = 0; e < tmp.nf.rewardsUsed.length; e++) {
		var effect = tmp.nf.rewardsUsed[e]
		tmp.nf.effects[effect] = nanoRewards.effects[effect](tmp.nf.powers[nanoRewards.effectToReward[effect]])
	}
}

function updateNanoRewardScaling() {
	let d = nanoRewards.scaling
	for (let s = 1; s <= nanoRewards.scaling.max; s++) if (isNanoScalingActive(s) && tmp.qu.nanofield.rewards >= d[s].start) tmp.nf.scale = s
	tmp.nf.scale -= 1
}

function updateNanoRewardTemp() {
	tmp.nf = {}

	if (!tmp.ngp3) return
	if (!player.masterystudies.includes("d11")) return

	updateNanoRewardScaling()
	updateNanoEffectUsages()
	//The rest is calculated by updateTemp().
}

function getAntipreonGhostWake() {
	let x = 104
	if (tmp.pce && tmp.pce.ms) x += Math.floor(tmp.pce.ms.ap)
	return x
}