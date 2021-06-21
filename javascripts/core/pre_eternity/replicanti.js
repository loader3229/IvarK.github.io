function getReplUnlCost() {
	if (inNGM(2) && player.tickspeedBoosts === undefined) return 1e80
	if (tmp.ngC) return 1e111
	return 1e140
}

function unlockReplicantis() {
	let cost = getReplUnlCost()
	if (player.infinityPoints.gte(cost)) {
		getEl("replicantidiv").style.display = "inline-block"
		getEl("replicantiunlock").style.display = "none"
		player.replicanti.unl = true
		player.replicanti.amount = new Decimal(1)
		player.infinityPoints = player.infinityPoints.minus(cost)
		ls.reset()
	}
}

function replicantiIncrease(diff) {
	if (!player.replicanti.unl || player.currentEternityChall == "eterc14") {
		replicantiTicks = 0
		return
	}

	let lim = getReplicantiLimit(true)
	if (player.replicanti.amount.gt(0)) replicantiTicks += diff
	if (player.replicanti.amount.lt(lim)) {
		if (!useContinuousRep()) notContinuousReplicantiUpdating()
		if (useContinuousRep()) continuousReplicantiUpdating(replicantiTicks)
	}

	player.replicanti.amount = player.replicanti.amount.min(lim)
	if (player.replicanti.amount.eq(lim)) replicantiTicks = 0

	let auto = player.replicanti.galaxybuyer
	if (auto && tmp.ngC) ngC.condense.rep.buy()
	if (auto && canGetReplicatedGalaxy() && (canAutoReplicatedGalaxy() || player.currentEternityChall == "eterc14")) replicantiGalaxy()

	if (tmp.ngp3 && player.masterystudies.includes("d10") && qu_save.autoOptions.replicantiReset && player.replicanti.amount.gt(qu_save.replicants.requirement)) replicantReset(true)
	if (QCs.data[1].can() && player.replicanti.amount.eq(lim)) {
		QCs_save.qc1.max++
		QCs.data[1].boost()
	}
}

function getReplicantiLimit(cap = false) {
	let lim = player.boughtDims ? player.replicanti.limit : new Decimal(Number.MAX_VALUE)
	let limBroke = isReplicantiLimitBroken()

	if (cap) {
		if (limBroke) lim = new Decimal(1/0)
		else if (tmp.ngC) {
			if (hasTS(52)) lim = lim.pow(tsMults[52]())
			if (hasTS(192)) lim = lim.times(player.timeShards.plus(1))
			if (hasDilationUpg("ngp3c4")) lim = lim.times(player.dilation.dilatedTime.plus(1).pow(2500))
			return lim
		}
	}
	if (QCs_tmp.qc1) lim = lim.min(QCs_tmp.qc1.limit)

	return lim
}

function isReplicantiLimitBroken() {
	return hasTimeStudy(192) && !tmp.ngC
}

function getReplMult(next) {
	let exp = 2
	if (inNGM(2)) exp = Math.max(2, Math.pow(player.galaxies, .4))
	if (player.boughtDims) {
		exp += (player.timestudy.ers_studies[3] + (next ? 1 : 0)) / 2
		if (hasAch('r108')) exp *= 1.09;
	}
	if (tmp.ngC && ngC.tmp) exp *= ngC.tmp.rep.eff2 * 2.5

	let repl = QCs.data[1].convert(player.replicanti.amount)
	let replmult = Decimal.max(repl.log(2), 1).pow(exp)
	if (hasTimeStudy(21) && !tmp.ngC) replmult = replmult.plus(repl.pow(0.032))
	if (hasTimeStudy(102)) {
		let rg = getFullEffRGs()
		let base = new Decimal(replmult)

		replmult = base.times(Decimal.pow(5, rg))
		if (hasMTS(303)) replmult = replmult.max(base.pow(getMTSMult(303)))
	}
	return replmult
}

function upgradeReplicantiChance() {
	if (player.infinityPoints.gte(player.replicanti.chanceCost) && isChanceAffordable() && player.eterc8repl > 0) {
		if (pH.did("ghostify")) if (player.ghostify.milestones < 11) player.infinityPoints = player.infinityPoints.minus(player.replicanti.chanceCost)
		else player.infinityPoints = player.infinityPoints.minus(player.replicanti.chanceCost)
		player.replicanti.chance = Math.round(player.replicanti.chance * 100 + 1) / 100
		if (player.currentEternityChall == "eterc8") player.eterc8repl -= 1
		getEl("eterc8repl").textContent = "You have " + player.eterc8repl + " purchases left."
		player.replicanti.chanceCost = player.replicanti.chanceCost.times(1e15)
	}
}

function isChanceAffordable() {
	return player.replicanti.chance < 1 || (tmp.ngp3 && hasMTS(265))
}

function upgradeReplicantiInterval() {
	if (!isIntervalAffordable() || !player.infinityPoints.gte(player.replicanti.intervalCost) || player.eterc8repl <= 0) return 
	player.infinityPoints = player.infinityPoints.minus(player.replicanti.intervalCost)

	player.replicanti.interval *= 0.9
	if (!isIntervalAffordable()) player.replicanti.interval = (hasTimeStudy(22) || player.boughtDims ? 1 : 50)

	if (player.replicanti.interval < 1) {
		let x = 1 / player.replicanti.interval
		// if (x > 1e10) x = Math.pow(x / 1e5, 2)
		player.replicanti.intervalCost = Decimal.pow("1e800", x)
	} else player.replicanti.intervalCost = player.replicanti.intervalCost.times(1e10)

	if (player.currentEternityChall == "eterc8") player.eterc8repl -= 1
	getEl("eterc8repl").textContent = "You have " + player.eterc8repl + " purchases left."
}

function isIntervalAffordable() {
	if (hasMTS(282)) return true
	return player.replicanti.interval > (hasTimeStudy(22) || player.boughtDims ? 1 : 50)
}

function getRGCost(offset = 0, costChange) {
	let ret = player.replicanti.galCost
	if (offset > 0) {
		let increase = 0
		if (player.currentEternityChall == "eterc6") increase = offset * ((offset + player.replicanti.gal * 2) + 3)
		else increase = offset * (2.5 * (offset + player.replicanti.gal * 2) + 22.5)
		if (player.replicanti.gal + offset > 99) increase += (offset - Math.max(99 - player.replicanti.gal, 0)) * (25 * (offset - Math.max(99 - player.replicanti.gal, 0) + Math.max(player.replicanti.gal, 99) * 2) - 4725)
		
		let scaleStart = tmp.ngC ? 250 : 400
		if (player.replicanti.gal + offset > scaleStart - 1) {
			if (player.exdilation != undefined) for (var g = Math.max(player.replicanti.gal, scaleStart - 1); g < player.replicanti.gal + offset; g++) increase += Math.pow(g - 389, 2)
			if (player.meta != undefined) {
				var isReduced = tmp.ngp3 && hasMTS(266)
				if (isReduced) increase += (Math.pow(player.replicanti.gal + offset - scaleStart, 3) - Math.pow(Math.max(player.replicanti.gal - scaleStart, 0), 3)) * 10 / doubleMSMult(1)
				else for (var g = Math.max(player.replicanti.gal, scaleStart - 1); g < player.replicanti.gal + offset; g++) increase += 5 * Math.floor(Math.pow(1.2, g - scaleStart + 6))
			}
		}
		ret = ret.times(Decimal.pow(10, increase))
	}

	if (hasTimeStudy(233) && !costChange) ret = ret.dividedBy(tsMults[233]())

	return ret
}

function upgradeReplicantiGalaxy() {
	var cost = getRGCost()
	if (player.infinityPoints.gte(cost) && player.eterc8repl !== 0) {
		player.infinityPoints = player.infinityPoints.minus(cost)
		player.replicanti.galCost = getRGCost(1)
		player.replicanti.gal += 1
		if (player.currentEternityChall == "eterc8") player.eterc8repl -= 1
		getEl("eterc8repl").textContent = "You have "+player.eterc8repl+" purchases left."
		return true
	}
	return false
}

function replicantiGalaxy() {
	var maxGal = getMaxRG()
	if (!canGetReplicatedGalaxy()) return
	if (player.galaxyMaxBulk) player.replicanti.galaxies = maxGal
	else player.replicanti.galaxies++
	if (!tmp.ngp3 || !hasAch("ngpp16")) player.replicanti.amount = Decimal.div(hasAch("r126") ? player.replicanti.amount : 1, Number.MAX_VALUE).max(1)
	galaxyReset(0)
}

function replicantiGalaxyBulkModeToggle() {
	player.galaxyMaxBulk = !player.galaxyMaxBulk
	getEl('replicantibulkmodetoggle').textContent = "Mode: " + (player.galaxyMaxBulk ? "Max" : "Singles")
}

function canGetReplicatedGalaxy() {
	return player.replicanti.galaxies < getMaxRG() && player.replicanti.amount.gte(getReplicantiLimit())
}

function canAutoReplicatedGalaxy() {
	return (hasAch("r136") && tmp.ngp3_boost && (tmp.bgMode || Decimal.div(1e3, getTickspeed()).log10() >= tmp.dtMode ? 8e6 : tmp.exMode ? 4e6 : 2e6)) || !hasTimeStudy(131) || tmp.ngC
}

function getMaxRG() {
	if (QCs.in(1)) return 0

	let ret = player.replicanti.gal
	if (hasTimeStudy(131) && !hasMTS(304)) ret += Math.floor(ret * 0.5)
	return ret
}

function autoBuyRG() {
	if (!player.infinityPoints.gte(getRGCost())) return

	let data = doBulkSpent(player.infinityPoints, getRGCost, 0, false, hasMTS(265) ? undefined : 200 + Math.max(400 - player.replicanti.gal, 0))
	player.replicanti.infinityPoints = data.res
	player.replicanti.galCost = getRGCost(data.toBuy, true)
	player.replicanti.gal += data.toBuy
}

var extraReplBase = 0
function updateExtraReplBase() {
	extraReplBase = 0
	if (hasTimeStudy(225)) extraReplBase += tsMults[225]()
	if (hasTimeStudy(226)) extraReplBase += tsMults[226]()
}

var extraReplMulti = 1
function updateExtraReplMult() {
	let x = 1
	if (QCs.in(1)) x = 0
	else if (tmp.ngp3) {
		if (enB.active("glu", 2)) x *= tmp_enB.glu2
	}
	extraReplMulti = x
}

function getTotalRGs() {
	return player.replicanti.galaxies + tmp.extraRG
}

function getFullEffRGs(min) {
	if (QCs.in(1)) return 0

	let x = player.replicanti.galaxies
	if (hasMTS(301)) x = getTotalRGs()
	else if (min) x = Math.min(x, player.replicanti.gal)

	return x
}

function getReplGalaxyEff() {
	let x = 1

	if (player.boughtDims) x = Math.log10(player.replicanti.limit.log(2)) / Math.log10(2) / 10
	else if (ECComps("eterc8") > 0) x = getECReward(8)

	if (hasMTS(311)) x *= Math.pow(tsMults[232](), getMTSMult(311))
	if (hasBosonicUpg(34)) x *= tmp.blu[34]

	return x
}

function replicantiGalaxyAutoToggle() {
	player.replicanti.galaxybuyer=!player.replicanti.galaxybuyer
	getEl("replicantiresettoggle").textContent="Auto galaxy "+(player.replicanti.galaxybuyer?"ON":"OFF")+(!canAutoReplicatedGalaxy()?" (disabled)":"")
}

function getReplicantiBaseInterval(speed) {
	if (speed === undefined) speed = player.replicanti.interval

	speed = new Decimal(speed)
	if (enB.active("glu", 6)) speed = Decimal.div(1000, 3 - speed.log10() * tmp_enB.glu6)
	if (speed.lt(1)) speed = speed.pow(0.25)

	return speed
}

function getReplicantiIntervalMult() {
	let interval = 1
	if (tmp.ngC) interval /= 20

	if (hasTimeStudy(62)) interval /= tsMults[62]()
	if (hasTimeStudy(213)) interval /= tsMults[213]()
	if (isBigRipUpgradeActive(4)) interval /= 10

	if (player.replicanti.amount.gt(Number.MAX_VALUE) || hasTimeStudy(133)) interval *= 10
	if (player.replicanti.amount.lt(Number.MAX_VALUE) && hasAch("r134")) interval /= 2

	interval = new Decimal(interval)
	if (player.exdilation != undefined) interval = interval.div(getBlackholePowerEffect().pow(1/3))
	if (player.dilation.upgrades.includes('ngpp1') && tmp.mod.nguspV && !tmp.mod.nguepV) interval = interval.div(player.dilation.dilatedTime.max(1).pow(0.05))
	if (player.dilation.upgrades.includes("ngmm9")) interval = interval.div(getDil72Mult())
	if (enB.active("pos", 4)) interval = interval.div(tmp_enB.pos4)
	if (tmp.ngC && ngC.tmp) interval = interval.div(ngC.tmp.rep.eff1)
	return interval
}

function getReplicantiFinalInterval() {
	let x = tmp.rep.baseInt.div(ls.mult("rep"))
	if (player.replicanti.amount.gt(getReplScaleStart())) {
		if (player.boughtDims) {
			let base = hasAch("r107") ? Math.max(player.replicanti.amount.log(2) / 1024, 1) : 1
			x = Math.pow(base, -.25) * x.toNumber()
		} else x = Decimal.pow(tmp.rep.speeds.inc, Math.max(player.replicanti.amount.log10() - tmp.rep.speeds.exp, 0) / tmp.rep.speeds.exp).times(x)
	}
	return x
}

function getReplScaleStart() {
	return Number.MAX_VALUE
}

function getReplSpeed() {
	let inc = .2
	let exp = Math.floor(Decimal.log10(getReplScaleStart()))
	if (hasDilationUpg('ngpp1') && (!tmp.mod.nguspV || tmp.mod.nguepV)) {
		let expDiv = 10
		if (tmp.ngp3) expDiv = 9
		let x = 1 + player.dilation.dilatedTime.max(1).log10() / expDiv

		inc /= Math.min(x, 20)
	}
	inc = inc + 1

	return {inc: inc, exp: exp}
}

function getReplSpeedExpMult() {
	let exp = 1

	//Eternity
	if (tmp.rep.ec14) exp *= tmp.rep.ec14.ooms

	//Quantum
	if (tmp.quActive) exp *= colorBoosts.g

	//Ghostify
	if (GDs.boostUnl('rep')) exp *= GDs.tmp.rep

	return exp
}

function boostReplSpeedExp(exp) {
	//Pre-Boosts
	if (hasMTS(281)) exp += mTs_tmp[281]

	//Boosts
	exp *= getReplSpeedExpMult()

	//Post-Boosts
	if (hasMTS(284)) exp += mTs_tmp[284]

	//QC1: Scaling Reduction
	if (QCs_tmp.qc1) exp = Math.pow(exp, QCs_tmp.qc1.scalingExp) * QCs_tmp.qc1.scalingMult

	return exp
}

function updateEC14Reward() {
	let data = tmp.rep
	if (data.baseEst && ECComps("eterc14")) {
		//Sub-1ms reduction -> Lower replicanti scaling
		let pow = getECReward(14)
		let div = data.baseEst.pow(pow)

		data.ec14 = {
			interval: div,
			ooms: div.max(1).log10() * (1 + ECComps("eterc14") / 10) + 1
		}
	} else {
		data.ec14 = {
			interval: new Decimal(1),
			ooms: 1
		}
	}
}

function boostReplicateInterval() {
	let x = new Decimal(1)
	let data = tmp.rep

	data.baseBaseInt = data.baseInt
	if (ECComps("eterc14")) {
		let pow = getECReward(14)
		data.ec14.interval = data.ec14.interval.div(Math.pow(data.speeds.exp / Math.log10(data.speeds.inc), pow))
		x = x.div(data.ec14.interval)
	}
	if (QCs_tmp.qc1) x = x.times(QCs_tmp.qc1.speedMult)

	data.intBoost = x
	data.baseInt = data.baseInt.div(x)
	data.baseEst = data.baseEst.times(x)
}

function updateReplicantiTemp() {
	var data = {}
	tmp.rep = data

	data.ln = player.replicanti.amount.ln()

	data.baseChance = Math.round(player.replicanti.chance * 100)

	let pow = 1
	if (hasMTS(265)) pow = getMTSMult(265, "update")
	if (pow > 1) data.chance = Decimal.pow(data.baseChance / 100, pow.toNumber())
	else data.chance = data.baseChance / 100

	data.freq = 0
	if (Decimal.gte(data.chance, "1e9999998")) data.freq = Decimal.times(Math.log10(data.baseChance / 100 + 1) / Math.log10(2), pow)

	let estChance = data.freq ? data.freq.times(Math.log10(2) / Math.log10(Math.E) * 1e3) : Decimal.add(data.chance, 1).log(Math.E) * 1e3

	data.intUpg = getReplicantiBaseInterval()
	data.intMult = getReplicantiIntervalMult()

	data.baseInt = data.intUpg.times(data.intMult)
	data.baseBaseEst = Decimal.div(estChance, data.baseInt)
	data.baseEst = data.baseBaseEst

	data.speeds = getReplSpeed()
	updateEC14Reward()
	data.speeds.exp = boostReplSpeedExp(data.speeds.exp)
	boostReplicateInterval()

	data.interval = getReplicantiFinalInterval()

	data.est = Decimal.div(estChance, data.interval)
	data.estLog = data.est.times(Math.log10(Math.E))
}

function runRandomReplicanti(chance) {
	if (Decimal.gte(chance, 1)) {
		player.replicanti.amount = player.replicanti.amount.times(2)
		return
	}
	var temp = player.replicanti.amount
	if (typeof(chance) == "object") chance = chance.toNumber()
	for (var i = 0; temp.gt(i); i++) {
		if (chance > Math.random()) player.replicanti.amount = player.replicanti.amount.plus(1)
		if (i >= 99) return
	}
}

function notContinuousReplicantiUpdating() {
	var chance = tmp.rep.chance
	if (typeof(chance) !== "number") chance = chance.toNumber()
	var interval = tmp.rep.interval.div(100).toNumber()

	var ticks = Math.floor(replicantiTicks / interval)
	var ticksLeft = ticks
	var ticksPerTick = Math.ceil(ticks / 10)

	while (player.replicanti.amount.lt(Number.MAX_VALUE) && ticksLeft > 0) {
		if (chance == 1) {
			player.replicanti.amount = player.replicanti.amount.times(Decimal.pow(2, ticksLeft * Math.log2(chance + 1))).round()
			ticksLeft = 0
		} else if (player.replicanti.amount.lte(100)) {
			runRandomReplicanti(chance) //chance should be a decimal
			ticksLeft--
		} else {
			var ticksRan = Math.min(ticksLeft, ticksPerTick)
			var counter = 0
			for (var x = 0; x < 100; x++) if (chance > Math.random()) counter++
			player.replicanti.amount = player.replicanti.amount.times(Decimal.pow(counter / 100 + 1, ticksRan)).round()
			ticksLeft -= ticksRan
		}
	}
	replicantiTicks -= (ticks - ticksLeft) * interval
}

function continuousReplicantiUpdating(diff){
	if (isReplicantiLimitBroken()) {
		let ln = tmp.rep.ln
		if (tmp.rep.est.toNumber() > 0 && tmp.rep.est.toNumber() < 1/0) ln += Math.log((diff * tmp.rep.est / 10) * (Math.log10(tmp.rep.speeds.inc) / tmp.rep.speeds.exp) + 1) / (Math.log10(tmp.rep.speeds.inc) / tmp.rep.speeds.exp)
		else ln += tmp.rep.est.times(diff * Math.log10(tmp.rep.speeds.inc) / tmp.rep.speeds.exp / 10).add(1).log(Math.E) / (Math.log10(tmp.rep.speeds.inc) / tmp.rep.speeds.exp)

		player.replicanti.amount = Decimal.pow(Math.E, ln)
	} else player.replicanti.amount = Decimal.pow(Math.E, tmp.rep.ln + (diff * tmp.rep.est / 10))
	replicantiTicks = 0
}

function useContinuousRep() {
	return replicantiTicks > 1e3 || Decimal.gt(tmp.rep.chance, 1) || tmp.rep.interval.lt(0.1) || getReplicantiLimit(true).gt(Number.MAX_VALUE)
}

function handleReplTabs() {
	let major = QCs_tmp.qc1 !== undefined

	if (major != (tmp.repMajor || false)) {
		getEl("replicantitabbtn").style.display = major || player.infinityUpgradesRespecced ? "none" : ""

		if (major && getEl("replicantis").style.display == "block") showInfTab("preinf")

		getEl("replicantis").className = major ? "" : "inftab"
		getEl("replicantis").style.display = major || getEl("repMajor").style.display == "block" ? "" : "none"
		getEl(major ? "repMajor" : "infinity").appendChild(getEl("replicantis"))
	}
	getEl("repMajorBtn").style.display = major && !isEmptiness ? "" : "none"
	tmp.repMajor = major
}
