let dsStudyCosts = {
	1: () => tmp.ngC ? 3e3 : tmp.ngp3 ? 4e3 : 5e3,
	2: () => 1e5,
	3: () => 1e6,
	4: () => 1e7,
	5: () => 1e8,

	// Meta
	6: () => getMetaUnlCost()
}

function buyDilationStudy(name) {
	let cost = dsStudyCosts[name]
	if (player.timestudy.theorem >= cost && !player.dilation.studies.includes(name) && (player.dilation.studies.includes(name - 1) || name < 2)) {
		if (name == 1) {
			if (ECComps("eterc11") + ECComps("eterc12") < 10 || getTotalTT(player) < getDilationTotalTTReq()) return
			showEternityTab("dilation")
			ls.reset()
			if (player.eternityUpgrades.length < 1) giveAchievement("Work harder.")
			if (player.blackhole != undefined) updateEternityUpgrades()
		} else if (name > 5) {
			giveAchievement("I'm so meta")
			showTab("dimensions")
			showDimTab("metadimensions")
			updateDilationUpgradeCosts()
		}
		player.dilation.studies.push(name)
		player.timestudy.theorem -= cost
		getEl("dilstudy"+name).className = "dilationupgbought"
		updateTimeStudyButtons(true)
		drawStudyTree()
	}
}

function hasDilationStudy(x) {
	if (x > 6) return masteryStudies.has("d" + x)
	return tmp.eterUnl && player.dilation.studies.includes(x)
}

function getDTMultPostBRU11() {
	let gain = new Decimal(1)

	return gain

	/*
		OLD STUFF

		if (hasAch("ng3p41")) gain = gain.times(Decimal.pow(4, Math.sqrt(player.quantum.nanofield.rewards)))
		if (masteryStudies.has(322)) gain = gain.times(getMTSMult(322))
		if (masteryStudies.has(341)) gain = gain.times(getMTSMult(341))
		if (isTreeUpgActive(7)) gain = gain.times(getTreeUpgradeEffect(7))
	*/
}

function getBaseDTProduction() {
	let tp = player.dilation.tachyonParticles
	let exp = getDTGainExp()
	let gain = tp.pow(exp)

	if (player.exdilation != undefined) gain = gain.times(getNGUDTGain())
	gain = gain.times(getEternityBoostToDT())

	if (hasDilationUpg('ngpp6')) gain = gain.times(getDil17Bonus())
	if (hasDilationUpg('ngusp3')) gain = gain.times(getD22Bonus())

	//Achievements
	if (hasAch("r137") && (tmp.mod.newGamePlusVersion || tmp.ngp3)) gain = gain.times(Decimal.pow(tmp.newNGP3E ? 2.25 : 1.75, Math.sqrt(tmp.rmPseudo.max(1).log10() / (masteryStudies.has(293) ? 9e3 : 1e4) + 1)))

	//NG+3
	if (tmp.ngp3) {
		if (hasAch("r138")) gain = gain.times(tmp.newNGP3E ? 3 : 2)
		if (hasAch("ngpp13")) gain = gain.times(2)
		if (hasAch("ng3p11")) gain = gain.times(3)
		if (hasBosonicUpg(15)) gain = gain.times(tmp.blu[15].dt)
	}
	return gain
}

function getDilTimeGainPerSecond() {
	let gain = getBaseDTProduction()
	/*if (tmp.ngp3) {
		let lgain = gain.log10()
		lgain = softcap(lgain, "dt_log")
		gain = Decimal.pow(10, lgain)
	}*/

	gain = gain.times(Decimal.pow(2, getDilUpgPower(1)))	

	if (player.dilation.rebuyables[6] && tmp.ngC) gain = gain.times(Decimal.pow(getDil6Base(), getDilUpgPower(6)))
	if (tmp.ngC) gain = softcap(gain, "dt_ngC")
	if (player.dilation.upgrades.includes("ngp3c1") && tmp.ngC) gain = gain.times(50)
	if (player.dilation.upgrades.includes("ngp3c2") && tmp.ngC) gain = gain.times(100)

	return gain.times(ls.mult("dil"))
}

function getDTGainExp() {
	let exp = 1
	//if (ph.has("ghostify") && player.ghostify && player.ghostify.ghostlyPhotons.unl) exp *= tmp.le[0]
	return exp
}

function getEternitiesAndDTBoostExp() {
	let exp = 0
	if (hasDilationUpg('ngpp2')) exp += tmp.mod.ngudpV ? .2 : .1
	if (hasDilationUpg('ngud2')) exp += .1
	if (hasDilationUpg('ngmm3')) exp += .1
	return exp
}

function getDilPower() {
	let ret = Decimal.pow(getDil3Power(), getDilUpgPower(3))
	if (hasDilationUpg("ngud1")) ret = ret.times(getD18Bonus())
	if (tmp.ngp3) {
		if (hasAch("ng3p11")) ret = ret.times(Math.max(getTotalRGs() / 125, 1))

		if (masteryStudies.has(264)) ret = ret.times(5)
		if (masteryStudies.has(341)) ret = ret.times(getMTSMult(341))

		if (tmp.quActive) ret = ret.times(colorBoosts.b)
	}
	if (player.dilation.rebuyables[6] && tmp.ngC) ret = ret.times(Decimal.pow(getDil6Base(), getDilUpgPower(6)))
	if (player.dilation.upgrades.includes("ngpp2") && tmp.ngC) ret = ret.times(Decimal.mul(nA(getEternitied(), 1), player.dilation.dilatedTime.plus(1).sqrt()).log10()+1)
	return ret
}

function hasDilationUpg(x) {
	return tmp.eterUnl && player.dilation.upgrades.includes(x)
}

function getDilUpgPower(x) {
	let r = player.dilation.rebuyables[x] || 0
	if (tmp.mod.nguspV) r += exDilationUpgradeStrength(x)
	else if (player.exdilation != undefined && !tmp.mod.ngudpV) r *= exDilationUpgradeStrength(x)
	if (player.dilation.upgrades.includes("ngp3c8") && tmp.ngC && x != 3) r *= getDil85Mult()
	return r
}

function getDil3Power() {
	let ret = 3
	if (tmp.mod.nguspV) ret += getDilUpgPower(4) / 2
	if (player.dilation.upgrades.includes("ngp3c8") && tmp.ngC) ret = Decimal.pow(ret, getDil85Mult())
	return ret
}

function getDil6Base() {
	if (!tmp.ngC) return 1;
	let base = Math.sqrt(player.dilation.dilatedTime.plus(1).log10()+1)
	return base;
}

function getDilationTPFormulaExp(disable){
	return getDilExp(disable)
}

function getDilExp(disable) {
	let ret = 1.5
	if (tmp.newNGP3E) ret += .1
	if (player.meta !== undefined && !tmp.mod.nguspV) ret += getDilUpgPower(4) / 4
	if (tmp.ngp3) {
		if ((!tmp.qu.bigRip.active || tmp.qu.bigRip.upgrades.includes(11)) && isTreeUpgActive(2) && disable != "TU3") ret += getTreeUpgradeEffect(2)
	}
	return ret
}

function getTotalTPGain(){
	return getDilGain()
}

function getTotalTachyonParticleGain(){
	return getDilGain()
}

function getDilGain() {
	if (player.money.lt(10)) return new Decimal(0)
	let log = Math.log10(player.money.log10() / 400) * getDilExp() + getDilPower().log10()
	let gain = Decimal.pow(10, log)

	if (tmp.ngC) gain = softcap(gain, "tp_ngC")
	if (player.dilation.upgrades.includes("ngp3c3") && tmp.ngC) gain = gain.times(10)
	if (player.dilation.upgrades.includes("ngp3c6") && tmp.ngC) gain = gain.times(getDil83Mult())
	return gain;
}

function getReqForTPGain() {
	let tplog = player.dilation.totalTachyonParticles.log10()
	return Decimal.pow(10, Decimal.pow(10, tplog).div(getDilPower()).pow(1 / getDilExp()).toNumber() * 400)
}

function getNGUDTGain(){
	let gain = new Decimal(1)
	gain = gain.times(getBlackholePowerEffect())
	if (ETER_UPGS.has(7)) gain = gain.times(1 + Math.log10(Math.max(1, player.money.log(10))) / 40)
	if (ETER_UPGS.has(8)) gain = gain.times(1 + Math.log10(Math.max(1, player.infinityPoints.log(10))) / 20)
	if (ETER_UPGS.has(9)) gain = gain.times(1 + Math.log10(Math.max(1, player.eternityPoints.log(10))) / 10)
	return gain
}

function getDilatedTimeGainPerSecond(){
	return getDilTimeGainPerSecond()
}

function getEternityBoostToDT(){
	let gain = new Decimal(1)
	let eterExp = getEternitiesAndDTBoostExp()
	if (eterExp > 0) gain = gain.times(Decimal.max(getEternitied(), 1).pow(eterExp))
	if (hasDilationUpg('ngpp2') && tmp.newNGP3E) {
		let e = new Decimal(getEternitied())
		gain = gain.times(e.max(10).log10()).times(Math.pow(e.max(1e7).log10() - 6,3))
		if (e.gt(1e14)) gain = gain.times(Math.sqrt(e.log10()))
		if (e.gt(1e20)) gain = gain.pow(Math.max(Math.pow(e.log10(), .005) - .01, 1.05))
	}
	if (tmp.ngC) {
		gain = gain.times(gain.log10() * 5 + 1)
		gain = gain.times(Decimal.pow(player.dilation.tachyonParticles.plus(1).log10() + 1, eterExp))
	}
	return gain
}

function dilates(x, m) {
	let e = 1
	let y = x
	let a = false
	if (player.dilation.active && m != 2 && (m != "meta" || !hasAch("ng3p63") || QCs.inAny())) {
		e *= dilationPowerStrength()
		if (tmp.mod.newGameMult) e = 0.9 + Math.min((player.dilation.dilatedTime.add(1).log10()) / 1000, 0.05)
		if (player.exdilation != undefined && !tmp.mod.ngudpV && !tmp.mod.nguspV) e += exDilationBenefit() * (1-e)
		if (hasDilationUpg(9)) e *= 1.05
		if (player.dilation.rebuyables[5]) e += 0.0025 * (1 - 1 / Math.pow(player.dilation.rebuyables[5] + 1 , 1 / 3))
		a = true
	}
	if (inNGM(2) && m != 1) {
		e *= dilationPowerStrength()
		a = true
	}
	if (a) {
		if (m != "tick") x = x.max(1)
		else if (player.galacticSacrifice == undefined) x = x.times(1e3)
		if (x.gt(10)) x = Decimal.pow(10, Math.pow(x.log10(), e))
		if (m == "tick" && player.galacticSacrifice == undefined) x = x.div(1e3)
		if (m == "tick" && x.lt(1)) x = Decimal.div(1, x)
	}
	return x.max(0).min(y)
}

function dilationPowerStrength() {
	let pow = 0.75
	if (tmp.mod.ngmX >= 4) pow = 0.7
	return pow;
}

/**
 *
 * @param {Name of the ugrade} id
 * @param {Cost of the upgrade} cost
 * @param {Cost increase for the upgrade, only for rebuyables} costInc
 *
 * id 1-3 are rebuyables
 *
 * id 2 resets your dilated time and free galaxies
 *
 */

const DIL_UPGS = []
const DIL_UPG_SIZES = [6, 8]
const DIL_UPG_COSTS = {
	r1: [1e5, 10, 1/0],
	r2: [1e6, 100, 1/0],
	r3: [1e7, 20, 72],
	r4: [1e8, 1e4, 24],
	r6: [5e6, 50, 1],
	u4: 5e6,
	u5: 1e9,
	u6: 5e7,
	u7: 2e12,
	u8: 1e10,
	u9: 1e11,
	u10: 1e15,
	ngud1: 1e20,
	ngud2: 1e25,
	ngpp1: 1e20,
	ngpp1_p3: 1e14,
	ngpp2: 1e25,
	ngpp2_p3: 1e16,
	ngpp3: 1e50,
	ngpp4: 1e60,
	ngpp5: 1e80,
	ngpp6: 1e100,
	ngpp3_usp: 1e79,
	ngpp4_usp: 1e84,
	ngpp5_usp: 1e89,
	ngpp6_usp: 1e100,
	ngpp1_c: 1e18,
	ngpp2_c: 5e18,
	ngusp1: 1e50,
	ngusp2: 1e55,
	ngusp3: 1e94,
	ngusp3: 1e94,
	ngp3c1: 2.5e10,
	ngp3c2: 5e13,
	ngp3c3: 1e16,
	ngp3c4: 5e20,
	ngp3c5: 1.5e21,
	ngp3c6: 4e21,
	ngp3c7: 3e23,
	ngp3c8: 1e24,
	ngp3c9: 1/0,
}

const DIL_UPG_OLD_POS_IDS = {
	4: 4,
	5: 5,
	6: 6,
	7: 7,
	8: 8,
	9: 9,
	10: 10,
	12: "ngpp1",
	13: "ngpp2",
	14: "ngpp3",
	15: "ngpp4",
	16: "ngpp5",
	17: "ngpp6",
	18: "ngud1",
	19: "ngud2",
	20: "ngusp1",
	21: "ngusp2",
	22: "ngusp3"
}

const DIL_UPG_POS_IDS = {
	11: "r1",     12: "r2",     13: "r3",     14: "r4",     15: "r6",    
	21: 4,        22: 5,        23: 6,        24: "ngpp1",  25: "ngp3c1",
	31: 7,        32: 8,        33: 9,        34: "ngpp2",  35: "ngp3c2",
	71: "ngp3c4", 72: "ngp3c5", 73: "ngp3c6", 74: "ngp3c7", 75: "ngp3c8",
	51: "ngpp3",  52: "ngpp4",  53: "ngpp5",  54: "ngpp6",  55: "ngp3c9",
	41: 10,       42: "ngud1",  43: "ngud2",  44: "ngusp1", 45: "ngusp2", 46: "ngp3c3",
	61: "ngusp3",
}

const DIL_UPG_ID_POS = {}
const DIL_UPG_UNLOCKED = {}

function setupDilationUpgradeList() {
	for (var x = 1; x <= DIL_UPG_SIZES[0]; x++) {
		for (var y = 1; y <= DIL_UPG_SIZES[1]; y++)	{
			let push = false
			let pos = y * 10 + x
			let id = DIL_UPG_POS_IDS[pos]
			if (id) push = true
			if (push) {
				DIL_UPGS.push(pos)
				DIL_UPG_ID_POS[id] = pos
			}
		}
	}
}

function getDilUpgId(x) {
	let r = DIL_UPG_POS_IDS[x]
	return r
}

function isDilUpgUnlocked(id) {
	if (id == "r4") return player.meta !== undefined
	if (id == "r6") return tmp.ngC

	id = toString(id)
	let ngpp = id.split("ngpp")[1]
	let ngmm = id.split("ngmm")[1]
	if (ngpp) {
		ngpp = parseInt(ngpp)
		let r = player.meta !== undefined
		if (ngpp >= 3) r = r && player.dilation.studies.includes(6)
		return r
	}
	if (id.split("ngud")[1]) {
		let r = player.exdilation !== undefined
		if (id == "ngud2") r = r && tmp.mod.nguspV === undefined
		return r
	}
	if (id.split("ngusp")[1]) {
		let r = tmp.mod.nguspV !== undefined
		if (id != "ngusp1") r = r && player.dilation.studies.includes(6)
		return r
	}
	if (id.split("ngp3c")[1]) {
		let r = tmp.ngC
		if (id == "ngp3c9") r = r && player.dilation.studies.includes(6)
		return r
	}
	return true
}

function getDilUpgCost(id) {
	if (id + 0 === id) id = "u" + toString(id)
	else if (id[0] == "r") {
		let cost = getRebuyableDilUpgCost(id[1])
		return cost.gte("1e10000000") ? new Decimal(1/0) : cost
	}

	let cost = DIL_UPG_COSTS[id]
	let ngpp = id.split("ngpp")[1]
	if (ngpp) {
		ngpp = parseInt(ngpp)
		if (ngpp >= 3 && tmp.mod.nguspV !== undefined) cost = DIL_UPG_COSTS[id + "_usp"]
	}
	if (tmp.ngp3) cost = DIL_UPG_COSTS[id + "_p3"] || cost
	if (tmp.ngC && ngpp) {
		if (ngpp < 3) cost = DIL_UPG_COSTS[id + "_c"]
	}
	return cost
}

function getRebuyableDilUpgCost(id, lvl) {
	if (!lvl) lvl = player.dilation.rebuyables[id] || 0

	let costGroup = DIL_UPG_COSTS["r" + id]
	let cost = new Decimal(costGroup[0]).times(Decimal.pow(costGroup[1], lvl))

	if (tmp.mod.nguspV) {
		if (id >= 4) cost = cost.times(1e7)
		if (id >= 3 && cost.gte(1e25)) cost = Decimal.pow(10, Math.pow(cost.log10() / 2.5 - 5, 2))
	} else if (id >= 3) {
		if (id == 4 && tmp.ngp3) cost = cost.div(Math.pow(Math.max(10 - lvl, 1), 2))
		if (player.meta != undefined && lvl >= costGroup[2]) {
			let exp = 2
			if (id == 4 && QCs.isRewardOn(7)) exp = QCs.tmp.rewards[7]

			let costSS = Decimal.pow(costGroup[1], (lvl - costGroup[2] + 1) * Math.pow(lvl - costGroup[2] + 2, exp - 1) / 4)
			if (id == 3 && enB.active("glu", 5)) costSS = costSS.pow(1 / enB.tmp.glu5)
			return cost.times(costSS)
		}
		if (player.exdilation != undefined && !tmp.mod.ngudpV && cost.gt(1e30)) cost = cost.div(1e30).pow(cost.log(1e30)).times(1e30)
	}
	return cost
}

function buyDilationUpgrade(pos, max, isId) {
	let id = pos
	if (isId) pos = DIL_UPG_ID_POS[id]
	else id = getDilUpgId(id)
	let cost = getDilUpgCost(id)
	if (!player.dilation.dilatedTime.gte(cost)) return
	let rebuyable = toString(id)[0] == "r"
	if (rebuyable) {
		// Rebuyable
		player.dilation.dilatedTime = player.dilation.dilatedTime.sub(cost)
		player.dilation.rebuyables[id[1]] = (player.dilation.rebuyables[id[1]] || 0) + 1
		
		if (id[1] == 2) {
			if (!tmp.ngp3) player.dilation.dilatedTime = new Decimal(0)
			resetDilationGalaxies()
		}
		if (id[1] == 3 && hasAch("ng3p13")) setTachyonParticles(player.dilation.tachyonParticles.times(getDil3Power()))
	} else {
		// Not rebuyable
		if (hasDilationUpg(id)) return

		player.dilation.dilatedTime = player.dilation.dilatedTime.sub(cost)
		player.dilation.upgrades.push(id)
		if (tmp.mod.nguspV !== undefined && !player.dilation.autoUpgrades.includes(id)) player.dilation.autoUpgrades.push(id)
		if (id == 4 || id == "ngmm1") player.dilation.freeGalaxies *= 2 // Double the current galaxies
		if (id == 10) {
			tmp.qu.wasted = false
			if (tmp.ngp3) tmp.qu.wasted = false
			ls.reset()
		}
		if (id == "ngpp3" && tmp.ngp3 && !tmp.ngC) {
			updateMilestones()
			if (getEternitied() >= 1e9) player.dbPower = new Decimal(getDimensionBoostPower())
		}
		if (id == "ngpp6" && tmp.ngp3) {
			getEl("masterystudyunlock").style.display = ""
			getEl("respecMastery").style.display = "block"
			getEl("respecMastery2").style.display = "block"
			if (!quantumed) {
				$.notify("Congratulations for unlocking Mastery Studies! You can either click the 'mastery studies' button\nor 'continue to mastery studies' button in the Time Studies menu.")
				getEl("welcomeMessage").innerHTML = "Congratulations for reaching the end-game of NG++. In NG+3, the game keeps going with a lot of new content starting at Mastery Studies. You can either click the 'Mastery studies' tab button or 'Continue to mastery studies' button in the Time Studies menu to access the new Mastery Studies available."
				getEl("welcome").style.display = "flex"
			}
		}
	}
	if (max) return true
	if (rebuyable) updateDilationUpgradeCost(pos, id)
	updateDilationUpgradeButtons()
}

function getTTProduction() {
	let tp = player.dilation.tachyonParticles
	if (tmp.quUnl) tp = tp.times(colorBoosts.b)

	let r = getTTGenPart(tp)
	r /= (hasAch("ng3p51") ? 200 : 2e4)

	r *= ls.mult("tt")
	return r
}

function getTTGenPart(x) {
	if (!x) return new Decimal(0)
	x = x.max(1).log10()
	let y = 69
	if (x > y) x = Math.pow(x - y + 1, 2/3) + y - 1
	return Math.pow(10, x)
}

function updateDilationUpgradeButtons() {
	for (var i = 0; i < DIL_UPGS.length; i++) {
		var pos = DIL_UPGS[i]
		var id = getDilUpgId(pos)
		var unl = isDilUpgUnlocked(id)
		if (DIL_UPG_UNLOCKED[id] != unl) {
			if (unl) {
				DIL_UPG_UNLOCKED[id] = 1
				updateDilationUpgradeCost(pos, id)
			} else delete DIL_UPG_UNLOCKED[id]
			getEl("dil" + pos).parentElement.style.display = unl ? "" : "none"
		}
		if (unl) getEl("dil" + pos).className = hasDilationUpg(id) || (id == "r2" && !canBuyGalaxyThresholdUpg()) ? "dilationupgbought" : player.dilation.dilatedTime.gte(getDilUpgCost(id)) ? "dilationupg" : "dilationupglocked"
	}

	getEl("dil11desc").textContent = "Currently: " + shorten(Decimal.pow(2, getDilUpgPower(1))) + "x"
	getEl("dil12eff").textContent = "Scaling: +" + formatPercentage(getFreeGalaxyThresholdIncrease() - 1) + "%"

	var power = getDil3Power()
	getEl("dil13desc").innerHTML = "You gain " + shorten(power) + "x more Tachyon Particles."
	getEl("dil13eff").innerHTML = "Currently: " + shorten(Decimal.pow(power, getDilUpgPower(3))) + "x"
	getEl("dil14eff").innerHTML = tmp.mod.nguspV ? "Currently: 3x -> " + (getDilUpgPower(4) / 2 + 3).toFixed(2) + "x" : "Currently: ^0.25 -> ^" + (getDilUpgPower(4) / 4 + 0.25).toFixed(2)

	getEl("dil22desc").innerHTML = tmp.ngC ? "Remote Galaxy scaling starts 25 galaxies later." : "Replicanti multiplier speeds up Time Dimensions.<br>Currently: " + shorten(tmp.rm.pow(getRepToTDExp())) + "x"
	getEl("dil31desc").textContent = "Currently: " + shortenMoney(player.dilation.dilatedTime.max(1).pow(1000).max(1)) + "x"
	getEl("dil32desc").textContent = tmp.ngC ? "Replicated Condensers are 15% stronger." : "Unlock the ability to pick all the study paths from the first split."
	getEl("dil34desc").textContent = tmp.ngC ? "Eternities, TP, & DT power up each other." : "Eternities and dilated time power up each other."

	var genSpeed = getTTProduction()
	getEl("dil41desc").textContent = "Currently: " + shortenMoney(hasAch("ng3p44") && player.timestudy.theorem / genSpeed < 3600 ? genSpeed * 10 : genSpeed)+"/s"

	if (player.dilation.studies.includes(6)) {
		getEl("dil51desc").textContent = "Currently: " + shortenMoney(getDil14Bonus()) + 'x';
		getEl("dil52desc").textContent = "Currently: " + shortenMoney(getDil15Bonus()) + 'x';
		getEl("dil54formula").textContent = tmp.ngp3 ? "(x^0.0045)" : "(log(x)^0.5)"
		getEl("dil54desc").textContent = "Currently: " + shortenMoney(getDil17Bonus()) + 'x';
	}
	if (player.exdilation != undefined) getEl("dil42desc").textContent = "Currently: "+shortenMoney(getD18Bonus())+"x"
	if (isDilUpgUnlocked("ngusp2")) {
		getEl("dil45desc").textContent = "Currently: +" + shortenMoney(getD21Bonus()) + " to exponent before softcap"
		getEl("dil61desc").textContent = "Currently: " + shortenMoney(getD22Bonus()) + "x"
	}
	if (tmp.ngC) {
		getEl("dil25desc").textContent = "Currently: "+shortenMoney((getDil26Mult()-1)*100)+"% stronger"
		getEl("dil35desc").textContent = "Currently: +"+shortenMoney(getDil36Mult())
		getEl("dil45desc").textContent = "Currently: "+shortenMoney((getDil46Mult()-1)*100)+"% stronger"
		getEl("dil73desc").textContent = "Currently: "+shortenMoney(getDil83Mult())+"x"
		getEl("dil75desc").textContent = "Currently: "+shortenMoney((getDil85Mult()-1)*100)+"% stronger"
	}
}

function updateDilationUpgradeCost(pos, id) {
	if (id == "r2" && !canBuyGalaxyThresholdUpg()) getEl("dil" + pos + "cost").textContent = "Maxed out"
	else {
		let r = getDilUpgCost(id)
		if (id == "r4" && tmp.ngp3) r = shorten(r)
		else if (id == "r3") r = formatValue(player.options.notation, getRebuyableDilUpgCost(3), 1, 1)
		else r = shortenCosts(r)
		getEl("dil" + pos + "cost").textContent = "Cost: " + r + " dilated time"
	}
	if (id == "ngud1") getEl("dil42oom").textContent = shortenCosts(new Decimal("1e1000"))
}

function updateDilationUpgradeCosts() {
	for (let i = 0; i < DIL_UPGS.length; i++) {
		var pos = DIL_UPGS[i]
		var id = getDilUpgId(pos)
		if (DIL_UPG_UNLOCKED[id]) updateDilationUpgradeCost(pos, id)
	}
}

function canBuyGalaxyThresholdUpg() {
	return true
}

function getFreeGalaxyThresholdIncrease() {
	let thresholdMult = 1.35
	if (QCs.isRewardOn(8)) thresholdMult = QCs.tmp.rewards[8]

	let dil2 = getDilUpgPower(2)
	if (dil2 > 0) thresholdMult += (5 - thresholdMult) * Math.pow(0.8, dil2)
	else thresholdMult = 5

	if (tmp.ngp3 && dil2 > 30) thresholdMult = Math.pow(thresholdMult, 1 / Math.sqrt(Math.log10(dil2 / 3)))

	if (player.exdilation != undefined) thresholdMult -= Math.min(.1 * exDilationUpgradeStrength(2), 0.2)
	if (thresholdMult < 1.15 && tmp.mod.nguspV !== undefined) thresholdMult = 1.05 + 0.1 / (2.15 - thresholdMult)
	return thresholdMult
}

function gainDilationGalaxies() {
	let thresholdMult = getFreeGalaxyThresholdIncrease()
	let thresholdStart = getFreeGalaxyThresholdStart()
	let galaxyMult = getFreeGalaxyGainMult()

	let baseGain = Math.floor(player.dilation.dilatedTime.div(thresholdStart).log(thresholdMult) + 1)
	let oldGals = Math.round(player.dilation.freeGalaxies / galaxyMult)
	let gained = Math.max(baseGain, oldGals)

	player.dilation.freeGalaxies = gained * galaxyMult
	player.dilation.nextThreshold = Decimal.pow(thresholdMult, gained).times(thresholdStart)

	if (baseGain > oldGals && QCs.isRewardOn(4)) replicantiIncrease((baseGain - oldGals) * QCs.tmp.rewards[4] * 10)
}

function getFreeGalaxyGainMult() {
	let galaxyMult = hasDilationUpg(4) ? 2 : 1
	if (hasDilationUpg("ngmm1")) galaxyMult *= 2
	if (tmp.mod.ngudpV && !tmp.mod.nguepV) galaxyMult /= 1.5
	if (isNanoEffectUsed("dil_gal_gain")) galaxyMult *= tmp.nf.effects.dil_gal_gain
	let exp = tmp.newNGP3E ? 1.1 : 1
	return Math.pow(galaxyMult, exp)
}

function getFreeGalaxyThresholdStart() {
	return new Decimal(1000)
}

function resetDilationGalaxies() {
	player.dilation.nextThreshold = getFreeGalaxyThresholdStart()
	player.dilation.freeGalaxies = 0
	gainDilationGalaxies()
}

function getBaseDilGalaxyEff() {
	let x = 1
	if (masteryStudies.has(263)) x *= 1.25
	if (enB.active("pos", 8)) x *= enB.tmp.pos8
	if (hasBosonicUpg(34)) x *= tmp.blu[34]

	return x
}

var failsafeDilateTime = false
function dilateTime(auto, shortcut) {
	if (shortcut && player.dilation.active) return
	if (failsafeDilateTime) return
	if (!player.dilation.studies.includes(1)) return
	failsafeDilateTime = true
	var onActive = player.dilation.active
	if (!onActive && tmp.mod.dilationConf && !auto) if (!confirm("Dilating time will start a new Eternity where all of your Normal/Infinity/Time Dimension multiplier's exponents and the Tickspeed multiplier's exponent will be reduced to ^ 0.75. If you can Eternity while dilated, you'll be rewarded with tachyon particles based on your antimatter and tachyon particles.")) return
	if (tmp.ngp3) {
		if (onActive) player.eternityBuyer.statBeforeDilation++
		else player.eternityBuyer.statBeforeDilation = 0
		player.eternityBuyer.tpUpgraded = false
	}
	eternity(true, true, undefined, true)
	if (!onActive) player.dilation.active = true;
	resetUP()
}

function updateDilationDisplay() {
	if (getEl("dilation").style.display == "block" && getEl("eternitystore").style.display == "block") {
		getEl("tachyonParticleAmount").textContent = shortenMoney(player.dilation.tachyonParticles)
		getEl("dilatedTimeAmount").textContent = shortenMoney(player.dilation.dilatedTime)
		getEl("dilatedTimePerSecond").textContent = "+" + shortenMoney(getDilTimeGainPerSecond()) + "/s"
		getEl("galaxyThreshold").textContent = shortenMoney(player.dilation.nextThreshold)
		getEl("dilatedGalaxies").textContent = getFullExpansion(Math.floor(player.dilation.freeGalaxies))
	}
}

function getDilationTotalTTReq() {
	return tmp.ngC ? 13500 : 13000
}

function getDil26Mult() {
	let mult = Math.pow(10, Math.pow(Math.log10(player.dilation.tachyonParticles.plus(1).log10()/5+1)+1, 1/4)-1)
	return mult;
}

function getDil36Mult() {
	let mult = Math.pow(player.dilation.dilatedTime.plus(1).log10()+1, 1/5)*5
	return mult;
}

function getDil46Mult() {
	let mult = Math.pow(Math.log10(player.dilation.dilatedTime.plus(1).log10()+1)+1, 2);
	return mult;
}

function getDil83Mult() {
	let mult = Decimal.pow(player.eternityPoints.plus(1).log10()+1, 0.75);
	return mult;
}

function getDil85Mult() {
	let tp = player.dilation.tachyonParticles
	if (tp.gte(Number.MAX_VALUE)) tp = tp.sqrt().times(Decimal.sqrt(Number.MAX_VALUE))
	let mult = Math.pow(tp.plus(1).log10()+1, 0.165)
	return mult;
}