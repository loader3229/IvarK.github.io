function galaxyReset(bulk) {
	if (tmp.ri) return

	if (autoS) auto = false
	autoS = true

	player.tickBoughtThisInf = updateTBTIonGalaxy()

	if (player.sacrificed == 0 && bulk > 0) giveAchievement("I don't believe in Gods");

	player.galaxies += bulk

	doGalaxyResetStuff()

	if (player.options.notation == "Emojis") player.spreadingCancer += bulk

	if (player.infinitied < 1 && player.eternities == 0 && !quantumed) {
		getEl("sacrifice").style.display = "none"
		getEl("confirmation").style.display = "none"
		if (inNGM(2) && (player.galaxies > 0 || (inNGM(2) ? player.galacticSacrifice.times > 0 : false))) {
			getEl("gSacrifice").style.display = "inline-block"
			getEl("gConfirmation").style.display = "inline-block"
		}
	}
	if (!hasAch("r111")) setInitialMoney()
	if (hasAch("r66")) player.tickspeed = player.tickspeed.times(0.98);
	if (tmp.quActive && qu_save.bigRip.active) qu_save.bigRip.bestGals = Math.max(qu_save.bigRip.bestGals, player.galaxies)
	if (pH.did("ghostify") && player.ghostify.neutrinos.boosts) gainNeutrinos(bulk, "gen")
	hideDimensions()
	tmp.tickUpdate = true;
}

getEl("secondSoftReset").onclick = function() {
	let ngm4 = tmp.ngmX ? tmp.ngmX >= 4 : false
	let bool1 = !inNC(11) || ngm4
	let bool2 = player.currentChallenge != "postc1"
	let bool3 = player.currentChallenge != "postc5" || player.tickspeedBoosts == undefined
	let bool4 = player.currentChallenge != "postc7"
	let bool5 = (player.currentEternityChall == "eterc6") && !tmp.be
	var bool = bool1 && bool2  && bool3 && bool4 && !bool5 && !tmp.ri && !cantReset()
	if (getAmount(inNC(4) || inNGM(5) ? 6 : 8) >= getGalaxyRequirement() && bool) {
		if ((getEternitied() >= 7 || player.autobuyers[10].bulkBought) && !shiftDown && (!inNC(14) || tmp.ngmX <= 3)) maxBuyGalaxies(true);
		else galaxyReset(1)
	}
}

function getDistantScalingEffect(){
	let speed = 1
	if (pH.did("ghostify") && player.ghostify.neutrinos.boosts >= 6) speed /= tmp.nb[6]
	if (hasAch("ng3p98")) speed *= 0.9
	if (hasAch("ng3p101")) speed *= 0.5
	return speed
}

function getGalaxyRequirement(offset = 0, display) {
	tmp.grd = {} //Galaxy requirement data
	tmp.grd.gals = player.galaxies + offset
	let mult = getGalaxyReqMultiplier()
	let base = tmp.grd.gals * mult
	let amount = 80 + base
	let scaling = 0
	if (inNGM(2)) amount -= (hasGalUpg(22) && tmp.grd.gals >= 1) ? 80 : 60
	if (tmp.ngmX > 3) amount -= 10
	if (inNC(4) || inNGM(5)) amount = player.tickspeedBoosts == undefined ? 99 + base : amount + (inNGM(4) ? 20 : -30)
	if (tmp.be) {
		amount *= 50
		if (qu_save.breakEternity.upgrades.includes(2)) amount /= getBreakUpgMult(2)
		if (player.currentEternityChall == "eterc10" && qu_save.breakEternity.upgrades.includes(9)) amount /= getBreakUpgMult(9)
	}
	if (!player.boughtDims) {
		/*tmp.grd.speed = 1
		if (tmp.ngp3) {
			let ghostlySpeed = tmp.be ? 55 : 1
			let div = 1e4
			let over = tmp.grd.gals / 302500 * ghostlySpeed
			if (over >= 1) {
				if (over >= 3) {
					div /= Math.pow(over, 6) / 729
					scaling = Math.max(scaling, 5)
				}
				if (isLEBoostUnlocked(2) && tmp.be) div *= tmp.leBonus[2]
				tmp.grd.speed = Math.pow(2, (tmp.grd.gals + 1 - 302500 / ghostlySpeed) * ghostlySpeed / div)
				scaling = Math.max(scaling, 4)
			}
		}*/

		let distantStart = getDistantScalingStart()
		if (tmp.grd.gals >= distantStart) {
			let speed = getDistantScalingEffect()
			amount += getDistantAdd(tmp.grd.gals - distantStart + 1) * speed
			if (tmp.grd.gals >= distantStart * 2.5 && inNGM(2)) {
				// 5 times worse scaling
				amount += 4 * speed * getDistantAdd(tmp.grd.gals - distantStart * 2.5 + 1)
				scaling = Math.max(scaling, 2)
			} else scaling = Math.max(scaling, 1)
		}

		let darkStart = getDarkScalingStart()
		if (tmp.grd.gals >= darkStart) scaling = Math.max(scaling, 4)

		let hasRemote = !tmp.be && !hasNU(6) && !hasAch("ng3p117")
		if (hasRemote) {
			let remoteStart = getRemoteScalingStart()
			if (tmp.grd.gals >= remoteStart) {
				let speed2 = 1
				if (dev.boosts.on) speed2 /= remoteStart / 8e3 + 1 //- FUTURE BOOST

				if (display) amount = Decimal.pow(getRemoteScalingBase(), (tmp.grd.gals - remoteStart + 1) * speed2).times(amount)
				else amount *= Math.pow(getRemoteScalingBase(), (tmp.grd.gals - remoteStart + 1) * speed2)
				scaling = Math.max(scaling, 3)
			}
		}
	}
	if (amount + 0 === amount) amount = Math.ceil(amount - getGalaxyReqSub())
	else amount = amount.sub(getGalaxyReqSub()).ceil()

	if (display) return {amount: amount, scaling: scaling}
	return amount
}

function getGalaxyReqMultiplier() {
	if (player.currentChallenge == "postcngmm_1") return 60
	let ret = 60
	if (inNGM(2)) {
		if (hasGalUpg(22)) ret -= 30
	} else if (hasTimeStudy(42)) ret *= tsMults[42]()
	if (inNC(4)) ret = 90
	if (tmp.ngC) ret -= 35
	if (player.infinityUpgrades.includes("galCost")) ret -= 5
	if (player.infinityUpgrades.includes("postinfi52") && player.tickspeedBoosts == undefined) ret -= 3
	if (hasDilationUpg("ngmm12")) ret -= 10
	if (inNGM(2) && hasTimeStudy(42)) ret *= tsMults[42]()
	return ret
}

function getGalaxyReqSub() {
	let sub = 0
	if (player.infinityUpgrades.includes("resetBoost")) sub += 9
	if (player.challenges.includes("postc5")) sub += 1
	if (player.infinityUpgradesRespecced != undefined) sub += getInfUpgPow(6)
	return sub
}

function getDistantScalingStart() {
	if (player.currentEternityChall == "eterc5") return 0
	let n = tmp.ngC ? 1 : 100
	n += getECReward(5)
	if (hasTimeStudy(223)) n += 7
	if (hasTimeStudy(224)) n += Math.floor(getTotalDBs() / 2000)
	if (hasDilationUpg("ngmm11")) n += 25
	if (tmp.ngp3) {
		if (inBigRip() && qu_save.bigRip.upgrades.includes(15)) n += tmp.bru[15]
		if (pl.on()) n -= fNu.tmp.nerfMu
	}

	if (tmp.grd.speed == 1) return Math.max(n, 0)
	return n
}

function getDistantPower() {
	let power = 1
	if (hasTS(194) && tmp.ngC) power = .5
	return power;
}

function getDistantAdd(x) {
	x *= getDistantPower()
	if (inNGM(2) && player.tickspeedBoosts == undefined) return Math.pow(x, 1.5) + x
	return (x + 1) * x
}

function getRemoteScalingStart(galaxies) {
	let n_init = tmp.ngC ? 150 : 800
	let n = 0
	if (inNGM(4)) {
		n_init = 6
		if (player.challenges.includes("postcngm3_1")) n += tmp.cp / 2
	} else if (inNGM(2)) n += 1e7
	n += n_init

	if (hasDilationUpg(5) && tmp.ngC) n += 25

	if (tmp.ngp3) {
		let darkStart = getDarkScalingStart()
		if (galaxies > darkStart) n -= galaxies - darkStart

		for (var t = 251; t <= 253; t++) if (hasMTS(t)) n += getMTSMult(t)

		if (isNanoEffectUsed("remote_start")) n += tmp.nf.effects.remote_start
		if (galaxies > 1/0 && !tmp.be) n -= galaxies
	}
	return n
}

function getRemoteScalingBase() {
	return 1 + 2 / (tmp.ngmX > 3 ? 10 : 1e3)
}

function getDarkScalingStart() {
	return 1/0
}

function maxBuyGalaxies(manual) {
	let max = (manual || (getEternitied() >= 10 && tmp.ngp3_boost && player.autobuyers[10].priority == 0)) ? 1/0 : player.autobuyers[10].priority
	if ((inNC(11) || player.currentEternityChall == "eterc6" || player.currentChallenge == "postc1" || (player.currentChallenge == "postc5" && inNGM(3)) || player.currentChallenge == "postc7") && !tmp.be) return
	if (max > player.galaxies) galaxyReset(doBulkSpent(getAmount(inNC(4) || inNGM(5) ? 6 : 8), getGalaxyRequirement, 0, true).toBuy) //Offset function
}