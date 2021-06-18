//meta dimensions
function getMetaAntimatterStart(bigRip) {
	let x = 10
	if (qMs.tmp.amt >= 16 && !bigRip) x = 1e30
	else if (hasAch("ngpp12")) x = 100
	return new Decimal(x)
}

function getDilationMDMultiplier() {
	let pow = 0.1
	let div = 1e40
	if (enB.active("glu", 8)) pow = tmp_enB.glu8
	if (tmp.mod.nguspV !== undefined) div = 1e50

	if (tmp.mod.ngudpV && !tmp.mod.nguepV) {
		let l = tmp.qu.colorPowers.b.plus(10).log10()
		let x = 3 - Math.log10(l + 1)
		if (tmp.mod.ngumuV) {
			if (x < 2) x = 2 - 2 * (2 - x) / (5 - x)
		} else {
			x = Math.max(x, 2)
			if (l > 5000) x -= Math.min(Math.log10(l - 4900) - 2, 2) / 3
		}
		pow /= x
	}
	let ret = player.dilation.dilatedTime.div(div).pow(pow).plus(1)
	return ret
}

function getMDMultiplier(tier) {
	if (player.currentEternityChall === "eterc11") return new Decimal(1)
	let ret = Decimal.pow(getPerTenMetaPower(), Math.floor(player.meta[tier].bought / 10))
	ret = ret.times(Decimal.pow(getMetaBoostPower(), Math.max(Math.max(player.meta.resets - (pos.on() ? save_tmp.sac_mdb : 0), 0) + 1 - tier, 0)))
	ret = ret.times(tmp.mdGlobalMult) //Global multiplier of all Meta Dimensions

	//Achievements:
	if (tier == 1 && hasAch("ng3p21")) ret = ret.times(player.meta.bestAntimatter.max(1).log10() / 5 + 1)
	if (tier <= 3 && hasAch("ng3p17")) ret = ret.times(Decimal.pow(1.001, Math.pow(player.totalmoney.plus(10).log10(), 0.25)))

	//Positronic Boosts:
	if (tier == 1 && enB.active("pos", 4)) ret = ret.times(tmp_enB.pos4)

	//Dilation Upgrades:
	if (hasDilationUpg("ngmm8")) ret = ret.pow(getDil71Mult())

	return ret
}

function getMDGlobalMult() {
	let ret = getDilationMDMultiplier()
	if (hasDilationUpg("ngpp3")) ret = ret.times(getDil14Bonus())
	if (hasAch("ngpp12")) ret = ret.times(1.1)
	if (tmp.ngp3) {
		//Achievement Rewards
		if (hasAch("ng3p11")) ret = ret.times(Math.min(Math.max(Math.log10(player.eternityPoints.max(1).log10()), 1) / 2, 2.5))
		if (hasAch("ng3p13")) ret = ret.times(Decimal.pow(8, Math.pow(Decimal.plus(quantumWorth, 1).log10(), 0.25)))
		if (hasAch("ng3p57")) ret = ret.times(1 + player.timeShards.plus(1).log10())
	}
	return ret
}

function getPerTenMetaPower() {
	let r = 2
	let exp = 1
	if (hasDilationUpg("ngpp4")) r = getDil15Bonus()
	return Math.pow(r, exp)
}

function getMetaBoostPower() {
	let r = 2
	if (hasDilationUpg("ngpp4")) r = getDil15Bonus()
	if (hasAch("ngpp14") && !tmp.ngp3) r *= 1.01

	let exp = 1
	if (tmp.ngp3 && hasAch("ngpp14")) exp = 1.05
	if (enB.active("glu", 5) && pos.on()) exp *= tmp_enB.glu5
	if (hasAch("ng3p26")) exp = 1.5 - 0.5 / Math.log2(player.meta.resets / 100 + 2)
	return Math.pow(r, exp)
}

function getMDDescription(tier) {
	if (tier == Math.min(8, player.meta.resets + 4)) return getFullExpansion(player.meta[tier].bought) + ' (' + dimMetaBought(tier) + ')';
	else {
		let a = shortenDimensions(player.meta[tier].amount)
		if (tmp.ngp3 && player.meta.bestOverGhostifies.log10() > 1e4) return a
		let b = ' (' + dimMetaBought(tier) + ')  (+' + formatValue(player.options.notation, getMDRateOfChange(tier), 2, 2) + dimDescEnd
		return a+b
	}
}

function getMDRateOfChange(tier) {
	let toGain = getMDProduction(tier + 1);

	var current = player.meta[tier].amount.max(1);
	if (tmp.mod.logRateChange) {
		var change = current.add(toGain.div(10)).log10() - current.log10()
		if (change < 0 || isNaN(change)) change = 0
	} else var change  = toGain.times(10).dividedBy(current);

	return change;
}

function canBuyMetaDimension(tier) {
    if (tier > player.meta.resets + 4) return false;
    if (qMs.tmp.amt < 17 && tier > 1 && player.meta[tier - 1].amount.eq(0)) return false;
    return true;
}

function clearMetaDimensions () { //Resets costs and amounts
	for (var i = 1; i <= 8; i++) {
		player.meta[i].amount = new Decimal(0);
		player.meta[i].bought = 0;
		player.meta[i].cost = new Decimal(initCost[i - 1]);
	}
}

function getMetaShiftRequirement() { 
	var mdb = player.meta.resets
	var data = {tier: Math.min(8, mdb + 4), amount: 20, mult: 15}

	if (tmp.ngp3_mul) data.mult--

	data.amount += data.mult * Math.max(mdb - 4, 0)
	if (isTreeUpgActive(1)) data.amount -= getTreeUpgradeEffect(1)
	if (hasNU(1)) data.amount -= tmp.nu[1]
	
	return data
}

function getMDBoostRequirement(){
	return getMetaShiftRequirement()
}

function metaBoost() {
	let req = getMetaShiftRequirement()

	if (!(player.meta[req.tier].bought >= req.amount)) return

	let isNU1ReductionActive = hasNU(1) ? !tmp.qu.bigRip.active : false
	if (qMs.tmp.amt >= 30) {
		if (isNU1ReductionActive && player.meta.resets < 110) {
			player.meta.resets = Math.min(player.meta.resets + Math.floor((player.meta[8].bought - req.amount) / (req.mult + 1)) + 1, 110)
			req = getMetaShiftRequirement()
		}
		player.meta.resets += Math.floor((player.meta[8].bought - req.amount) / req.mult) + 1

		if (player.meta[8].bought >= getMetaShiftRequirement().amount) player.meta.resets++
	} else player.meta.resets++

	if (hasAch("ng3p72")) return

	player.meta.antimatter = getMetaAntimatterStart()
	if (qMs.tmp.amt < 19) clearMetaDimensions()
}


function dimMetaCostMult(tier) {
	return new Decimal(costMults[tier]);
}

function dimMetaBought(tier) {
	return player.meta[tier].bought % 10;
}

function metaBuyOneDimension(tier) {
	var cost = player.meta[tier].cost;
	if (!canBuyMetaDimension(tier)) return false;
	if (!canAffordMetaDimension(cost)) return false;
	player.meta.antimatter = player.meta.antimatter.minus(cost);
	player.meta[tier].amount = player.meta[tier].amount.plus(1);
	player.meta[tier].bought++;
	if (player.meta[tier].bought % 10 < 1) {
		player.meta[tier].cost = getMetaCost(tier, player.meta[tier].bought / 10)
	}
	if (tier > 7) giveAchievement("And still no ninth dimension...")
	return true;
}

function getMetaCost(tier, boughtTen) {
	let cost = Decimal.times(initCost[tier], dimMetaCostMult(tier).pow(boughtTen))
	let scalingStart = Math.ceil(Decimal.div(getMetaCostScalingStart(), initCost[tier]).log(dimMetaCostMult(tier)))
	if (boughtTen >= scalingStart) cost = cost.times(Decimal.pow(10, (boughtTen - scalingStart + 1) * (boughtTen - scalingStart + 2) / 2))
	return cost
}

function getMetaCostScalingStart() {
	return 1/0
}

function getMetaMaxCost(tier) {
	return player.meta[tier].cost.times(10 - dimMetaBought(tier));
}

function metaBuyManyDimension(tier) {
	var cost = getMetaMaxCost(tier);
	if (!canBuyMetaDimension(tier)) {
		return false;
	}
	if (!canAffordMetaDimension(cost)) {
		return false;
	}
	player.meta.antimatter = player.meta.antimatter.minus(cost);
	player.meta[tier].amount = player.meta[tier].amount.plus(10 - dimMetaBought(tier));
	player.meta[tier].bought += 10 - dimMetaBought(tier)
	player.meta[tier].cost = getMetaCost(tier, player.meta[tier].bought / 10)
	if (tier > 7) giveAchievement("And still no ninth dimension...")
	return true;
}

function buyMaxMetaDimension(tier, bulk) {
	if (!canBuyMetaDimension(tier)) return
	if (getMetaMaxCost(tier).gt(player.meta.antimatter)) return
	var currentBought = Math.floor(player.meta[tier].bought / 10)
	var bought = player.meta.antimatter.div(10).div(initCost[tier]).log(dimMetaCostMult(tier)) + 1
	var scalingStart = Math.ceil(Decimal.div(getMetaCostScalingStart(), initCost[tier]).log(dimMetaCostMult(tier)))
	if (bought >= scalingStart) {
		let b = dimMetaCostMult(tier).log10() + 0.5
		bought = Math.sqrt(b * b + 2 * (bought - scalingStart) * dimMetaCostMult(tier).log10()) - b + scalingStart
	}
	bought = Math.floor(bought) - currentBought
	if (bulk) bought = Math.min(bought, bulk)
	var num = bought
	var tempMA = player.meta.antimatter
	if (num > 1) {
		while (num > 0) {
			var temp = tempMA
			var cost = getMetaCost(tier, currentBought + num - 1).times(num > 1 ? 10 : 10 - dimMetaBought(tier))
			if (cost.gt(tempMA)) {
				tempMA = player.meta.antimatter.sub(cost)
				bought--
			} else tempMA = tempMA.sub(cost)
			if (temp.eq(tempMA) || currentBought + num > 9007199254740991) break
			num--
		}
	} else {
		tempMA = tempMA.sub(getMetaCost(tier, currentBought).times(10 - dimMetaBought(tier)))
		bought = 1
	}
	player.meta.antimatter = tempMA
	player.meta[tier].amount = player.meta[tier].amount.add(bought * 10 - dimMetaBought(tier))
	player.meta[tier].bought += bought * 10 - dimMetaBought(tier)
	player.meta[tier].cost = getMetaCost(tier, currentBought + bought)
	if (tier >= 8) giveAchievement("And still no ninth dimension...")
}

function canAffordMetaDimension(cost) {
	return cost.lte(player.meta.antimatter);
}

for (let i = 1; i <= 8; i++) {
	getEl("meta" + i).onclick = function () {
		if (moreEMsUnlocked() && (pH.did("quantum") || getEternitied() >= tmp.ngp3_em[3])) player.autoEterOptions["md" + i] = !player.autoEterOptions["md" + i]
		else metaBuyOneDimension(i)
	}
	getEl("metaMax" + i).onclick = function () {
		if (shiftDown && moreEMsUnlocked() && (pH.did("quantum") || getEternitied() >= tmp.ngp3_em[3])) metaBuyOneDimension(i)
		else metaBuyManyDimension(i);
	}
}

getEl("metaMaxAll").onclick = function () {
	for (let i = 1; i <= 8; i++) buyMaxMetaDimension(i)
}

getEl("metaSoftReset").onclick = function () {
	metaBoost();
}

function getMDProduction(tier) {
	let ret = player.meta[tier].amount.floor()
	if (tier < 8 && hasAch("ng3p22")) ret = ret.add(player.meta[1].amount.floor().pow(1 / 8))
	return ret.times(getMDMultiplier(tier));
}

function getExtraDimensionBoostPower(ma) {
	if (!ma) ma = getExtraDimensionBoostPowerUse()
	if (tmp.ngp3) ma = softcap(ma, "ma")

	ma = Decimal.pow(ma, getMADimBoostPowerExp(ma)).max(1)

	let l2 = ma.log(2)
	if (l2 > 1024) {
		if (tmp.mod.nguspV) l2 = Math.pow(l2 * 32, 2/3)
		ma = Decimal.pow(2, l2)
	}
	return ma
}

function getExtraDimensionBoostPowerUse() {
	let r = player.meta.bestAntimatter
	//if (hasAch("ng3p71")) r = player.meta.bestOverQuantums
	return r
}

function getExtraDimensionBoostPowerExponent(ma = player.meta.antimatter){
	return getMADimBoostPowerExp(ma)
}

function getMADimBoostPowerExp(ma) {
	let power = 8
	if (hasDilationUpg("ngpp5")) power++
	if (hasMTS(262)) power += doubleMSMult(0.5)
	if (isNanoEffectUsed("ma_effect_exp")) power += tmp.nf.effects.ma_effect_exp
	return power
}

function getRelativeMADimBoostPowerExp(ma) {
	let exp = getMADimBoostPowerExp(ma)
	let eff = Decimal.pow(ma, exp)
	let effSC = getExtraDimensionBoostPower(ma)

	return exp * effSC.log10() / eff.log10()
}

function getDil14Bonus() {
	return 1 + Math.log10(1 - Math.min(0, player.tickspeed.log(10)));
}

function getDil17Bonus() {
	let r = player.meta.bestAntimatter.max(1)
	if (tmp.ngp3) r = r.pow(getDil17Exp())
	else r = Math.sqrt(r.log10())
	return r
}

function getDil17Exp() {
	if (enB.active("glu", 4)) return tmp_enB.glu4
	return 0.0045
}

function updateOverallMetaDimensionsStuff(){
	getEl("metaAntimatterAmount").textContent = shortenMoney(player.meta.antimatter)
	getEl("metaAntimatterBest").textContent = shortenMoney(player.meta.bestAntimatter)
	getEl("bestAntimatterQuantum").textContent = player.masterystudies && pH.did("quantum") ? "Your best" + (pH.did("ghostify") ? "" : "-ever") + " meta-antimatter" + (pH.did("ghostify") ? " in this Ghostify" : "") + " was " + shortenMoney(player.meta.bestOverQuantums) + "." : ""
	setAndMaybeShow("bestMAOverGhostifies", pH.did("ghostify"), '"Your best-ever meta-antimatter was " + shortenMoney(player.meta.bestOverGhostifies) + "."')

	getEl("metaAntimatterTranslation").style.display = tmp.ngp3 ? "" : "none"
	getEl("metaAntimatterPower").textContent = "^" + shorten(getRelativeMADimBoostPowerExp(getExtraDimensionBoostPowerUse()))
	getEl("metaAntimatterEffect").textContent = shortenMoney(getExtraDimensionBoostPower())
	getEl("metaAntimatterPerSec").textContent = 'You are getting ' + shortenDimensions(getMDProduction(1)) + ' meta-antimatter per second.'
}

function updateMetaDimensions () {
	updateOverallMetaDimensionsStuff()
	let showDim = false
	let useTwo = player.options.notation == "Logarithm" ? 2 : 0
	let autod = moreEMsUnlocked() && (pH.did("quantum") || getEternitied() >= tmp.ngp3_em[3])
	for (let tier = 8; tier > 0; tier--) {
		showDim = showDim || canBuyMetaDimension(tier)
		getEl(tier + "MetaRow").style.display = showDim ? "" : "none"
		if (showDim) {
			getEl(tier + "MetaD").textContent = DISPLAY_NAMES[tier] + " Meta Dimension x" + formatValue(player.options.notation, getMDMultiplier(tier), 2, 1)
			getEl("meta" + tier + "Amount").textContent = getMDDescription(tier)
			getEl("meta" + tier).textContent = autod ? "Auto: " + (player.autoEterOptions["md" + tier] ? "ON" : "OFF") : "Cost: " + formatValue(player.options.notation, player.meta[tier].cost, useTwo, 0) + " MA"
			getEl('meta' + tier).className = autod ? "storebtn" : canAffordMetaDimension(player.meta[tier].cost) ? 'storebtn' : 'unavailablebtn'
			getEl("metaMax"+tier).textContent = (autod ? (shiftDown ? "Singles: " : pH.did("ghostify") ? "" : "Cost: ") : "Until 10: ") + formatValue(player.options.notation, ((shiftDown && autod) ? player.meta[tier].cost : getMetaMaxCost(tier)), useTwo, 0) + " MA"
			getEl('metaMax' + tier).className = canAffordMetaDimension((shiftDown && autod) ? player.meta[tier].cost : getMetaMaxCost(tier)) ? 'storebtn' : 'unavailablebtn'
		}
	}
	var isMetaShift = player.meta.resets < 4
	var metaShiftRequirement = getMetaShiftRequirement()
		getEl("metaResetLabel").textContent = 'Meta-Dimension ' + (isMetaShift ? "Shift" : "Boost") + ' ('+ getFullExpansion(player.meta.resets) +'): requires ' + getFullExpansion(Math.floor(metaShiftRequirement.amount)) + " " + DISPLAY_NAMES[metaShiftRequirement.tier] + " Meta Dimensions"
		getEl("metaSoftReset").textContent = "Reset meta-dimensions for a " + (isMetaShift ? "new dimension" : "boost")
	if (player.meta[metaShiftRequirement.tier].bought >= metaShiftRequirement.amount) {
		getEl("metaSoftReset").className = 'storebtn'
	} else {
		getEl("metaSoftReset").className = 'unavailablebtn'
	}
	var bigRipped = tmp.ngp3 && tmp.qu.bigRip.active
	var req = getQuantumReq()
	var reqGotten = isQuantumReached()
	var newClassName = reqGotten ? (bigRipped && player.options.theme == "Aarex's Modifications" ? "" : "storebtn ") + (bigRipped ? "aarexmodsghostifybtn" : "") : 'unavailablebtn'
	var message = 'Lose all your previous progress, but '
	getEl("quantumResetLabel").textContent = (bigRipped ? 'Ghostify' : 'Quantum') + ': requires ' + shorten(req) + (tmp.ngp3 ? " best" : "") + ' meta-antimatter'
		+ (QCs.inAny() ? QCs.getGoalDisp() : tmp.ngp3 && !tmp.ngp3_mul ? " and an EC14 completion" : "")
	if (reqGotten && bigRipped && pH.did("ghostify")) {
		var GS = getGHPGain()
		message += "gain " + shortenDimensions(GS) + " Ghost Particle" + (GS.lt(2) ? "" : "s")
	} else if (reqGotten && !bigRipped && pH.did("quantum")) {
		var QS = quarkGain()
		message += "gain " + shortenDimensions(QS) + " quark" + (QS.lt(2) ? "" : "s") + " for boosts"
	} else message += "get a boost"
	getEl("quantum").textContent = message
	if (getEl("quantum").className !== newClassName) getEl("quantum").className = newClassName

	getEl("metaAccelerator").textContent = enB.active("pos", 4) ? "Meta Accelerator: " + shorten(tmp_enB.pos4) + "x to MA, DT, and replicate interval" : ""
}

function getDil15Bonus() {
	let x = 1
	let max = 3

	if (tmp.mod.nguspV !== undefined) x = Math.min(Math.max(player.dilation.dilatedTime.max(1).log10() / 10 - 6.25, 2), max)
	else x = Math.min(Math.log10(player.dilation.dilatedTime.max(1e10).log(10)) + 1, max)

	return x
}

function getMetaUnlCost() {
	if (tmp.ngp3) return 1e20
	return 1e24
}