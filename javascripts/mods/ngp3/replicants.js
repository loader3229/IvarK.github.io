function babyRateUpdating(){
	var eggonRate = tmp.twr.times(getEmperorDimensionMultiplier(1)).times(3).div((hasAch("ng3p35")) ? 1 : 10).times(getSpinToReplicantiSpeed())
	if (eggonRate.lt(3)){
		getEl("eggonRate").textContent = shortenDimensions(eggonRate.times(60))
		getEl("eggonRateTimeframe").textContent = "hour"
	} else if (eggonRate.lt(30)) {
		getEl("eggonRate").textContent = shortenDimensions(eggonRate)
		getEl("eggonRateTimeframe").textContent = "minute"
	} else {
		getEl("eggonRate").textContent = shortenMoney(eggonRate.div(60))
		getEl("eggonRateTimeframe").textContent = "second"
	}
}

function preonGatherRateUpdating(){
	var gatherRateData = getGatherRate()
	getEl("normalReplGatherRate").textContent = shortenDimensions(gatherRateData.normal)
	getEl("workerReplGatherRate").textContent = shortenDimensions(gatherRateData.workersTotal)
	getEl("babyReplGatherRate").textContent = shortenDimensions(gatherRateData.babies)
	getEl("gatherRate").textContent = tmp.qu.nanofield.producingCharge ? '-' + shortenDimensions(getQuarkLossProduction()) + '/s' : '+' + shortenDimensions(gatherRateData.total) + '/s'
}

function getGrowupRatePerMinute(){
	return tmp.twr.plus(tmp.qu.replicants.amount).times(hasAch("ng3p35") ? 3 : 0.3).times(getSpinToReplicantiSpeed())
}

function growupRateUpdating(){
	if (!hasNU(2)) {
		getEl("eggonAmount").textContent = shortenDimensions(tmp.qu.replicants.eggons)
		getEl("hatchProgress").textContent = Math.round(tmp.qu.replicants.babyProgress.toNumber() * 100)+"%"
	}
	var growupRate = getGrowupRatePerMinute()
	if (tmp.qu.replicants.babies.eq(0)) growupRate = growupRate.min(eggonRate)
	if (growupRate.lt(30)) {
		getEl("growupRate").textContent = shortenDimensions(growupRate)
		getEl("growupRateUnit").textContent = "minute"
	} else {
		getEl("growupRate").textContent = shortenMoney(growupRate.div(60))
		getEl("growupRateUnit").textContent = "second"
	}
	getEl("growupProgress").textContent = Math.round(tmp.qu.replicants.ageProgress.toNumber() * 100) + "%"
}

function updateReplicantsTab(){
	getEl("replicantiAmount2").textContent = shortenDimensions(player.replicanti.amount)
	getEl("replicantReset").className = player.replicanti.amount.lt(tmp.qu.replicants.requirement) ? "unavailablebtn" : "storebtn"
	getEl("replicantReset").innerHTML = "Reset replicanti amount for a duplicant.<br>(requires " + shortenCosts(tmp.qu.replicants.requirement) + " replicanti)"
	getEl("replicantAmount").textContent = shortenDimensions(tmp.qu.replicants.amount)
	getEl("workerReplAmount").textContent = shortenDimensions(tmp.twr)
	getEl("babyReplAmount").textContent = shortenDimensions(tmp.qu.replicants.babies)

	preonGatherRateUpdating()

	getEl("gatheredQuarks").textContent = shortenDimensions(tmp.qu.replicants.quarks.floor())

	babyRateUpdating()
	getEl("feedNormal").className = (canFeedReplicant(1) ? "stor" : "unavailabl") + "ebtn"
	getEl("workerProgress").textContent = Math.round(tmp.eds[1].progress.toNumber() * 100) + "%"

	growupRateUpdating()
	
	getEl("reduceHatchSpeed").innerHTML = "Hatch speed: " + hatchSpeedDisplay() + " -> " + hatchSpeedDisplay(true) + "<br>Cost: " + shortenDimensions(tmp.qu.replicants.hatchSpeedCost) + " for all 3 gluons"
	if (player.ghostify.milestones > 7) updateReplicants("display")
}

function updateReplicants(mode) {
	if (getEl("replicantstabbtn").style == "none") return

	if (player.masterystudies == undefined ? true : player.ghostify.milestones < 8) mode = undefined
	if (mode === undefined || mode === "display") {
		getEl("quantumFoodAmount").textContent = getFullExpansion(tmp.qu.replicants.quantumFood)
		if (tmp.qu.quarks.lt(Decimal.pow(10, 1e5))) getEl("buyQuantumFood").innerHTML = "Buy 1 quantum food<br>Cost: " + shortenDimensions(tmp.qu.replicants.quantumFoodCost) + " of all 3 gluons"
		getEl("buyQuantumFood").className = "gluonupgrade " + (tmp.qu.gluons.rg.min(tmp.qu.gluons.gb).min(tmp.qu.gluons.br).lt(tmp.qu.replicants.quantumFoodCost) ? "unavailabl" : "stor") + "ebtn"
		if (tmp.qu.quarks.lt(Decimal.pow(10, 1e5))) getEl("breakLimit").innerHTML = "Limit of workers: " + getLimitMsg() + (isLimitUpgAffordable() ? " -> " + getNextLimitMsg() + "<br>Cost: " + shortenDimensions(tmp.qu.replicants.limitCost) + " for all 3 gluons" : "")
		getEl("breakLimit").className = (tmp.qu.gluons.rg.min(tmp.qu.gluons.gb).min(tmp.qu.gluons.br).lt(tmp.qu.replicants.limitCost) || !isLimitUpgAffordable() ? "unavailabl" : "stor") + "ebtn"
		getEl("reduceHatchSpeed").className = (tmp.qu.gluons.rg.min(tmp.qu.gluons.gb).min(tmp.qu.gluons.br).lt(tmp.qu.replicants.hatchSpeedCost) ? "unavailabl" : "stor") + "ebtn"
		if (player.masterystudies.includes('d11')) {
			getEl("quantumFoodAmountED").textContent = getFullExpansion(tmp.qu.replicants.quantumFood)
			if (tmp.qu.quarks.lt(Decimal.pow(10, 1e5))) getEl("buyQuantumFoodED").innerHTML = "Buy 1 quantum food<br>Cost: "+shortenDimensions(tmp.qu.replicants.quantumFoodCost)+" for all 3 gluons"
			getEl("buyQuantumFoodED").className = "gluonupgrade " + (tmp.qu.gluons.rg.min(tmp.qu.gluons.gb).min(tmp.qu.gluons.br).lt(tmp.qu.replicants.quantumFoodCost) ? "unavailabl" : "stor") + "ebtn"
			if (tmp.qu.quarks.lt(Decimal.pow(10, 1e5))) getEl("breakLimitED").innerHTML = "Limit of workers: " + getLimitMsg() + (isLimitUpgAffordable() ? " -> " + getNextLimitMsg() + "<br>Cost: " + shortenDimensions(tmp.qu.replicants.limitCost) + " of all 3 gluons":"")
			getEl("breakLimitED").className = (tmp.qu.gluons.rg.min(tmp.qu.gluons.gb).min(tmp.qu.gluons.br).lt(tmp.qu.replicants.limitCost) || !isLimitUpgAffordable() ? "unavailabl" : "stor") + "ebtn"
		}
		if (tmp.qu.quarks.gte(Decimal.pow(10, 1e5))){
			getEl("buyQuantumFoodED").innerHTML = "Buy 1 quantum food"
			getEl("buyQuantumFood").innerHTML = "Buy 1 quantum food"
			getEl("breakLimit").innerHTML = "Limit of workers: " + getLimitMsg()
			getEl("breakLimitED").innerHTML = "Limit of workers: " + getLimitMsg()
			getEl("rgRepl").textContent = "lots of"
			getEl("gbRepl").textContent = "many"
			getEl("brRepl").textContent = "tons of"
		} else {
			getEl("rgRepl").textContent = shortenDimensions(tmp.qu.gluons.rg)
			getEl("gbRepl").textContent = shortenDimensions(tmp.qu.gluons.gb)
			getEl("brRepl").textContent = shortenDimensions(tmp.qu.gluons.br)
		}
	}
}

function getGatherRate() {
	var mult = new Decimal(1)
	if (hasMTS(373)) mult = getMTSMult(373)
	var data = {
		normal: tmp.qu.replicants.amount.times(mult),
		babies: tmp.qu.replicants.babies.times(mult).div(20),
		workers: {}
	}
	data.total = data.normal.add(data.babies)
	data.workersTotal = new Decimal(0)
	for (var d = 1; d < 9; d++) {
		data.workers[d] = tmp.eds[d].workers.times(mult).times(Decimal.pow(20, d))
		data.workersTotal = data.workersTotal.add(data.workers[d])
	}
	data.total = data.total.add(data.workersTotal)
	return data
}

function getQuantumFoodCostIncrease(){
	return testHarderNGp3 ? 6 : 5
}

function buyQuantumFood() {
	if (tmp.qu.gluons.rg.min(tmp.qu.gluons.gb).min(tmp.qu.gluons.br).gte(tmp.qu.replicants.quantumFoodCost)) {
		tmp.qu.gluons.rg = tmp.qu.gluons.rg.sub(tmp.qu.replicants.quantumFoodCost)
		tmp.qu.gluons.gb = tmp.qu.gluons.gb.sub(tmp.qu.replicants.quantumFoodCost)
		tmp.qu.gluons.br = tmp.qu.gluons.br.sub(tmp.qu.replicants.quantumFoodCost)
		tmp.qu.replicants.quantumFood++
		tmp.qu.replicants.quantumFoodCost = tmp.qu.replicants.quantumFoodCost.times(getQuantumFoodCostIncrease())
		updateGluonsTabOnUpdate("spend")
		updateReplicants("spend")
	}
}

function reduceHatchSpeed() {
	if (tmp.qu.gluons.rg.min(tmp.qu.gluons.gb).min(tmp.qu.gluons.br).gte(tmp.qu.replicants.hatchSpeedCost)) {
		tmp.qu.gluons.rg = tmp.qu.gluons.rg.sub(tmp.qu.replicants.hatchSpeedCost)
		tmp.qu.gluons.gb = tmp.qu.gluons.gb.sub(tmp.qu.replicants.hatchSpeedCost)
		tmp.qu.gluons.br = tmp.qu.gluons.br.sub(tmp.qu.replicants.hatchSpeedCost)
		tmp.qu.replicants.hatchSpeed = tmp.qu.replicants.hatchSpeed / 1.1
		tmp.qu.replicants.hatchSpeedCost = tmp.qu.replicants.hatchSpeedCost.times(10)
		updateGluonsTabOnUpdate("spend")
		updateReplicants("spend")
	}
}

function hatchSpeedDisplay(next) {
	var speed = getHatchSpeed()
	if (next) speed /= 1.1
	if (speed < 1e-24) return shorten(1/speed) + "/s"
	return timeDisplayShort(speed * 10, true, 1)
}

function getTotalReplicants(data) {
	if (data === undefined) return tmp.twr.add(tmp.qu.replicants.amount).round()
	else return getTotalWorkers(data).add(data.quantum.replicants.amount).round()
}

function getEmperorDimensionMultiplier(dim) {
	let ret = new Decimal(1)
	if (player.currentEternityChall == "eterc11") return ret
	ret = tmp.edgm //Global multiplier of all Emperor Dimensions
	if (hasNU(7) && dim % 2 == 1) ret = ret.times(tmp.nu[7])
	if (dim == 8) ret = ret.times(Decimal.pow(1.05, Math.sqrt(Math.max(0, player.quantum.emperorDimensions[8].perm - 9))))
	return dilates(ret, 1)
}

function getEmperorDimensionGlobalMultiplier() {
	let ret = new Decimal(1)
	if (hasMTS(392)) ret = getMTSMult(392)
	if (hasMTS(402)) ret = ret.times(30)
	if (isTreeUpgActive(6)) ret = ret.times(getTreeUpgradeEffect(6))
	if (tmp.pce && tmp.pce.ms) ret = ret.times(Decimal.pow(tmp.pce.ms.eds, tmp.eds[8].perm))
	if (hasBosonicUpg(35)) ret = ret.times(tmp.blu[35])
	return ret
}

function getEmperorDimensionRateOfChange(dim) {
	if (!canFeedReplicant(dim, true)) return 0
	let toGain = getEmperorDimensionMultiplier(dim + 1).times(tmp.eds[dim + 1].workers).div(20)

	var current = tmp.eds[dim].workers.add(tmp.eds[dim].progress).max(1)
	if (tmp.mod.logRateChange) {
		var change = current.add(toGain).log10()-current.log10()
		if (change < 0 || isNaN(change)) change = 0
	} else var change = toGain.times(10).dividedBy(current)

	return change
}

function feedReplicant(tier, max) {
	if (!canFeedReplicant(tier)) return
	var toFeed = max ? Math.min(tmp.qu.replicants.quantumFood, tmp.qu.replicants.limitDim > tier ? Math.round(getWorkerAmount(tier - 1).toNumber() * 3) : Math.round((tmp.qu.replicants.limit - tmp.eds[tier].perm - tmp.eds[tier].progress.toNumber()) * 3)) : 1
	if (tmp.qu.replicants.limitDim > tier) tmp.qu.replicants.quantumFoodCost = tmp.qu.replicants.quantumFoodCost.div(Decimal.pow(getQuantumFoodCostIncrease(), toFeed))
	tmp.eds[tier].progress = tmp.eds[tier].progress.add(toFeed / 3)
	if (tier < 8 || getWorkerAmount(tier + 1).eq(0)) tmp.eds[tier].progress = tmp.eds[tier].progress.times(3).round().div(3)
	if (tmp.eds[tier].progress.gte(1)) {
		var toAdd = tmp.eds[tier].progress.floor()
		if (tier > 1) tmp.eds[tier-1].workers = tmp.eds[tier - 1].workers.sub(toAdd.min(tmp.eds[tier - 1].workers)).round()
		else tmp.qu.replicants.amount = tmp.qu.replicants.amount.sub(toAdd.min(tmp.qu.replicants.amount)).round()
		tmp.eds[tier].progress = tmp.eds[tier].progress.sub(tmp.eds[tier].progress.min(toAdd))
		tmp.eds[tier].workers = tmp.eds[tier].workers.add(toAdd).round()
		tmp.eds[tier].perm = Math.min(tmp.eds[tier].perm + Math.round(toAdd.toNumber()), tier > 7 ? 1/0 : 10)
		if (tier == 2) giveAchievement("An ant office?")
	}
	tmp.qu.replicants.quantumFood -= toFeed
	updateReplicants("spend")
}

function getWorkerAmount(tier) {
	if (tier < 1) return tmp.qu.replicants.amount
	if (tier > 8) return new Decimal(0)
	return tmp.eds[tier].workers
}

function getTotalWorkers(data) {
	if (data) {
		if (data.quantum.emperorDimensions == undefined) return new Decimal(data.quantum.replicants.workers)
		data = data.quantum.emperorDimensions
	} else data = tmp.eds
	var total = new Decimal(0)
	for (var d = 1; d < 9; d++) total = total.add(data[d].workers)
	return total.round()
}

function buyMaxQuantumFood() {
	let minGluons = tmp.qu.gluons.rg.min(tmp.qu.gluons.gb).min(tmp.qu.gluons.br)
	let cInc = getQuantumFoodCostIncrease()
	let toBuy = Math.floor(minGluons.div(tmp.qu.replicants.quantumFoodCost).times(cInc - 1).add(1).log(cInc))
	if (toBuy < 1) return
	let toSpend = Decimal.pow(cInc, toBuy).minus(1).div(cInc - 1).times(tmp.qu.replicants.quantumFoodCost)
	tmp.qu.gluons.rg = tmp.qu.gluons.rg.sub(tmp.qu.gluons.rg.min(toSpend))
	tmp.qu.gluons.gb = tmp.qu.gluons.gb.sub(tmp.qu.gluons.gb.min(toSpend))
	tmp.qu.gluons.br = tmp.qu.gluons.br.sub(tmp.qu.gluons.br.min(toSpend))
	tmp.qu.replicants.quantumFood += toBuy
	tmp.qu.replicants.quantumFoodCost = tmp.qu.replicants.quantumFoodCost.times(Decimal.pow(cInc, toBuy))
	updateGluonsTabOnUpdate("spend")
	updateReplicants("spend")
}

function canFeedReplicant(tier, auto) {
	if (tmp.qu.replicants.quantumFood < 1 && !auto) return false
	if (tier > 1) {
		if (tmp.eds[tier].workers.gte(tmp.eds[tier - 1].workers)) return auto && hasNU(2)
		if (tmp.eds[tier - 1].workers.lte(10)) return false
	} else {
		if (tmp.eds[1].workers.gte(tmp.qu.replicants.amount)) return auto && hasNU(2)
		if (tmp.qu.replicants.amount.eq(0)) return false
	}
	if (tier > tmp.qu.replicants.limitDim) return false
	if (tier == tmp.qu.replicants.limitDim) return getWorkerAmount(tier).lt(tmp.qu.replicants.limit)
	return true
}

function isLimitUpgAffordable() {
	if (!player.masterystudies.includes("d11")) return tmp.qu.replicants.limit < 10
	return true
}

function getLimitMsg() {
	if (!player.masterystudies.includes("d11")) return tmp.qu.replicants.limit
	return getFullExpansion(tmp.qu.replicants.limit) + " ED" + tmp.qu.replicants.limitDim + "s"
}

function getNextLimitMsg() {
	if (!player.masterystudies.includes("d11")) return tmp.qu.replicants.limit+1
	if (tmp.qu.replicants.limit > 9 && tmp.qu.replicants.limitDim < 8) return "1 ED" + (tmp.qu.replicants.limitDim + 1) + "s"
	return getFullExpansion(tmp.qu.replicants.limit + 1) + " ED" + tmp.qu.replicants.limitDim + "s"
}

function getHatchSpeed() {
	var speed = tmp.qu.replicants.hatchSpeed
	if (hasMTS(361)) speed /= getMTSMult(361)
	if (hasMTS(371)) speed /= getMTSMult(371)
	if (hasMTS(372)) speed /= getMTSMult(372)
	if (hasMTS(381)) speed /= getMTSMult(381)
	if (hasMTS(391)) speed /= getMTSMult(391)
	if (hasMTS(402)) speed /= 30
	if (isNanoEffectUsed("hatch_speed")) speed /= tmp.nf.effects.hatch_speed
	return speed
}

function updateEmperorDimensions() {
	let production = getGatherRate()
	let mults = {}
	let limitDim = tmp.qu.replicants.limitDim
	getEl("rgEDs").textContent = shortenDimensions(tmp.qu.gluons.rg)
	getEl("gbEDs").textContent = shortenDimensions(tmp.qu.gluons.gb)
	getEl("brEDs").textContent = shortenDimensions(tmp.qu.gluons.br)
	getEl("replicantAmountED").textContent=shortenDimensions(tmp.qu.replicants.amount)
	for (var d = 1; d <= 8; d++) mults[d] = getEmperorDimensionMultiplier(d)
	for (var d = 1; d <= 8; d++) {
		if (d > limitDim) getEl("empRow" + d).style.display = "none"
		else {
			getEl("empRow" + d).style.display = ""
			getEl("empD" + d).textContent = DISPLAY_NAMES[d] + " Emperor Dimension x" + formatValue(player.options.notation, mults[d], 2, 1)
			getEl("empAmount" + d).textContent = d < limitDim ? shortenDimensions(tmp.eds[d].workers) + " (+" + shorten(getEmperorDimensionRateOfChange(d)) + dimDescEnd : getFullExpansion(tmp.eds[limitDim].perm)
			getEl("empQuarks" + d).textContent = shorten(production.workers[d])
			getEl("empFeed" + d).className = (canFeedReplicant(d) ? "stor" : "unavailabl") + "ebtn"
			getEl("empFeed" + d).textContent = "Feed (" + (d == limitDim || mults[d + 1].times(tmp.eds[d + 1].workers).div(20).lt(1e3) ? Math.round(tmp.eds[d].progress.toNumber() * 100) + "%, " : "") + getFullExpansion(tmp.eds[d].perm) + " kept)"
			getEl("empFeedMax" + d).className = (canFeedReplicant(d) ? "stor" : "unavailabl") + "ebtn"
		}
	}
	getEl("totalWorkers").textContent = shortenDimensions(tmp.twr)
	getEl("totalQuarkProduction").textContent = shorten(production.workersTotal)
	if (player.ghostify.milestones > 7) updateReplicants("display")
}

function maxReduceHatchSpeed() {
	let minGluons = tmp.qu.gluons.rg.min(tmp.qu.gluons.gb).min(tmp.qu.gluons.br)
	let toBuy = Math.floor(minGluons.div(tmp.qu.replicants.hatchSpeedCost).times(9).add(1).log10())
	if (toBuy < 1) return
	let toSpend = Decimal.pow(10, toBuy).minus(1).div(9).times(tmp.qu.replicants.hatchSpeedCost)
	if (toSpend.gt(tmp.qu.gluons.rg)) tmp.qu.gluons.rg = new Decimal(0)
	else tmp.qu.gluons.rg = tmp.qu.gluons.rg.sub(toSpend)
	if (toSpend.gt(tmp.qu.gluons.gb)) tmp.qu.gluons.gb = new Decimal(0)
	else tmp.qu.gluons.gb = tmp.qu.gluons.gb.sub(toSpend)
	if (toSpend.gt(tmp.qu.gluons.br)) tmp.qu.gluons.br = new Decimal(0)
	else tmp.qu.gluons.br = tmp.qu.gluons.br.sub(toSpend)
	tmp.qu.replicants.hatchSpeed /= Math.pow(1.1, toBuy)
	tmp.qu.replicants.hatchSpeedCost = tmp.qu.replicants.hatchSpeedCost.times(Decimal.pow(10, toBuy))
	updateGluonsTabOnUpdate()
	updateReplicants()
}

function replicantReset(bulk = false) {
	if (player.replicanti.amount.lt(tmp.qu.replicants.requirement)) return
	if (!hasAch("ng3p47")) player.replicanti.amount = new Decimal(1)
	if (hasAch("ng3p74") && bulk) {
		let x = Math.floor(player.replicanti.amount.div(tmp.qu.replicants.requirement).log10() / 1e5) + 1
		tmp.qu.replicants.amount = tmp.qu.replicants.amount.add(x)
		tmp.qu.replicants.requirement = tmp.qu.replicants.requirement.times(Decimal.pow(10, x * 1e5))
	} else {
		tmp.qu.replicants.amount = tmp.qu.replicants.amount.add(1)
		tmp.qu.replicants.requirement = tmp.qu.replicants.requirement.times(Decimal.pow(10, 1e5))
	}
}

function breakLimit() {
	if (tmp.qu.gluons.rg.min(tmp.qu.gluons.gb).min(tmp.qu.gluons.br).gte(tmp.qu.replicants.limitCost) && isLimitUpgAffordable()) {
		tmp.qu.gluons.rg = tmp.qu.gluons.rg.sub(tmp.qu.replicants.limitCost)
		tmp.qu.gluons.gb = tmp.qu.gluons.gb.sub(tmp.qu.replicants.limitCost)
		tmp.qu.gluons.br = tmp.qu.gluons.br.sub(tmp.qu.replicants.limitCost)
		tmp.qu.replicants.limit++
		if (tmp.qu.replicants.limit > 10 && tmp.qu.replicants.limitDim < 8) {
			tmp.qu.replicants.limit = 1
			tmp.qu.replicants.limitDim++
		}
		if (tmp.qu.replicants.limit % 10 > 0) tmp.qu.replicants.limitCost = tmp.qu.replicants.limitCost.times(200)
		updateGluonsTabOnUpdate("spend")
		updateReplicants("spend")
	}
}

function getEDLimitCostIncrease(){
	return testHarderNGp3 ? 300 : 200
}

function maxBuyLimit() {
	var min=tmp.qu.gluons.rg.min(tmp.qu.gluons.gb).min(tmp.qu.gluons.br)
	if (!min.gte(tmp.qu.replicants.limitCost) && isLimitUpgAffordable()) return
	let cInc = getEDLimitCostIncrease()
	for (var i = 0; i < (player.masterystudies.includes("d11") ? 3 : 1); i++) {
		if (i == 1) {
			var toAdd = Math.floor(min.div(tmp.qu.replicants.limitCost).log(200) / 9)
			if (toAdd) {
				var toSpend = Decimal.pow(cInc, toAdd * 9).times(tmp.qu.replicants.limitCost)
				tmp.qu.gluons.rg = tmp.qu.gluons.rg.sub(tmp.qu.gluons.rg.min(toSpend))
				tmp.qu.gluons.gb = tmp.qu.gluons.gb.sub(tmp.qu.gluons.gb.min(toSpend))
				tmp.qu.gluons.br = tmp.qu.gluons.br.sub(tmp.qu.gluons.br.min(toSpend))
				tmp.qu.replicants.limitCost = tmp.qu.replicants.limitCost.times(Decimal.pow(cInc, toAdd * 9))
				tmp.qu.replicants.limit += toAdd * 10
			}
		} else {
			var limit = tmp.qu.replicants.limit
			var toAdd = Math.max(Math.min(Math.floor(min.div(tmp.qu.replicants.limitCost).times(cInc - 1).add(1).log(cInc)), 10 - limit % 10), 0)
			var toSpend = Decimal.pow(cInc, toAdd).sub(1).div(cInc - 1).round().times(tmp.qu.replicants.limitCost)
			tmp.qu.gluons.rg = tmp.qu.gluons.rg.sub(tmp.qu.gluons.rg.min(toSpend))
			tmp.qu.gluons.gb = tmp.qu.gluons.gb.sub(tmp.qu.gluons.gb.min(toSpend))
			tmp.qu.gluons.br = tmp.qu.gluons.br.sub(tmp.qu.gluons.br.min(toSpend))
			tmp.qu.replicants.limitCost = tmp.qu.replicants.limitCost.times(Decimal.pow(cInc, Math.max(Math.min(toAdd, 9 - limit % 10), 0)))
			tmp.qu.replicants.limit += toAdd
		}
		var dimAdd = Math.max(Math.min(Math.ceil(tmp.qu.replicants.limit / 10 - 1), 8 - tmp.qu.replicants.limitDim), 0)
		if (dimAdd > 0) {
			tmp.qu.replicants.limit -= dimAdd * 10
			tmp.qu.replicants.limitDim += dimAdd
		}
		min = tmp.qu.gluons.rg.min(tmp.qu.gluons.gb).min(tmp.qu.gluons.br)
		if (!min.gte(tmp.qu.replicants.limitCost) && isLimitUpgAffordable()) break
	}
	updateGluonsTabOnUpdate()
	updateReplicants()
}

function getSpinToReplicantiSpeed(){
	// log10(green spins) * log10(blue spins) *log10(red spins) 
	if (!hasAch("ng3p54")) return 1
	var r = player.quantum.tod.r.spin.plus(10).log10()
	var g = player.quantum.tod.g.spin.plus(10).log10()
	var b = player.quantum.tod.b.spin.plus(10).log10()
	return r * g * b
}

