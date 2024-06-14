function canBreakInfinity() {
	return player.autobuyers[11] % 1 != 0 && player.autobuyers[11].interval <= 100
}

function breakInfinity() {
	if (!canBreakInfinity()) return false
	if (player.break && !player.currentChallenge.includes("post")) {
		player.break = false
		el("break").textContent = "BREAK INFINITY"
	} else {
		player.break = true
		el("break").textContent = "FIX INFINITY"
	}
}

function onPostBreak() {
	return (player.break && inNC(0)) || player.currentChallenge.includes("p")
}

function getInfinityPointGain(){
	return gainedInfinityPoints()
}

function getIPGain(){
	return gainedInfinityPoints()
}

function getIPGainDiv(){
	let div = 308;
	if (hasTS(111)) {
		let newDiv = tmp.ngC ? 50 : 285;
		if (hasTS(197) && tmp.ngC) newDiv /= 1.5
		div = newDiv
	}
	else if (hasAch("r103")) div = 307.8;
	if (inNGM(2) && player.tickspeedBoosts == undefined) div -= galIP()
	return div
}

function gainedInfinityPoints(next) {
	if (QCs.in(3)) return QCs.data[3].amProd()

	let div = getIPGainDiv()
	let uIPM = player.dilation.upgrades.includes("ngp3c5") && tmp.ngC

	if (player.infinityUpgradesRespecced == undefined) var ret = Decimal.pow(10, player.money.e / div - 0.75).times(uIPM ? 1 : getIPMult())
	else var ret = player.money.div(Number.MAX_VALUE).pow(2 * (1 - Math.log10(2)) / Decimal.log10(Number.MAX_VALUE)).times(uIPM ? 1 : getIPMult())
	if (hasTS(41)) ret = ret.times(Decimal.pow(tsMults[41](), player.galaxies + player.replicanti.galaxies))
	if (hasTS(51)) ret = ret.times(tsMults[51]())
	if (hasTS(141)) ret = ret.times(tsMults[141]())
	if (hasTS(142)) ret = ret.times(1e25)
	if (hasTS(143)) ret = ret.times(Decimal.pow(15, Math.log(player.thisInfinityTime+1)*Math.pow(player.thisInfinityTime+1, 0.125)))
	if (hasAch("r116")) ret = ret.times(Decimal.add(getInfinitied(), 1).pow(Math.log10(2)))
	if (hasAch("r125")) ret = ret.times(Decimal.pow(2, Math.log(player.thisInfinityTime+1)*Math.pow(player.thisInfinityTime+1, 0.11)))
	if (player.dilation.upgrades.includes(7)) ret = ret.times(player.dilation.dilatedTime.max(1).pow(1000))
	if (player.boughtDims) {
		ret = ret.times(Decimal.pow(Math.max(1e4/player.thisInfinityTime),player.timestudy.ers_studies[5]+(next==5?1:0)))
		ret = ret.times(Decimal.pow(player.thisInfinityTime/10,player.timestudy.ers_studies[6]+(next==6?1:0)))
	}
	if (player.tickspeedBoosts != undefined && hasAch("r95") && player.eightAmount > 5000) ret = ret.times(Decimal.pow(player.eightAmount, 2))
	if (tmp.ngC) {
		ret = softcap(ret, "ip_ngC")
		if (player.infinityUpgrades.includes("postinfi80")) ret = ret.times(ngC.breakInfUpgs[80]())
		if (player.replicanti.unl) ret = ret.times(getIDReplMult())
		if (uIPM) ret = ret.times(getIPMult())
	}
	return ret.floor()
}

function getIPMult() {
	let mult = player.infMult
	if (inNGM(2) && player.tickspeedBoosts == undefined) {
		if (hasAch("r85")) mult = mult.times(4)
		if (hasAch("r93")) mult = mult.times(4)
		if (hasAch("r43")) mult = mult.times(1.25)
		if (hasAch("r55")) mult = mult.times(Math.min(Math.log10(Math.max(6000 / player.bestInfinityTime, 10)), 10))
		if (hasAch("r41")) mult = mult.times(Math.pow(Math.log10(Math.max(player.spreadingCancer, 10)), .05))
		if (hasAch("r51")) {
			let galaxies = Math.max((player.galaxies + getFullEffRGs() + getEffectiveTGs()), 0) // just in case
			if (galaxies < 5) mult = mult.times(Math.max(galaxies, 1))
			else if (galaxies < 50) mult = mult.times(Decimal.pow(galaxies + 5, 0.5).plus(2))
			else mult = mult.times(Decimal.pow(galaxies, 0.3).plus(7))
		}
	}
	if(aarMod.newGame4MinusRespeccedVersion){
		if (hasAch("r55")) mult = mult.times(Math.min(Math.log10(Math.max(6000 / player.bestInfinityTime, 10)), 10));
		if (hasAch("r41")) mult = mult.times(Math.pow(Math.log10(Math.max(player.spreadingCancer, 10)), .05)).times(2);
	}
	return mult;
}

function toggleCrunchMode(freeze) {
	if (player.autoCrunchMode == "amount") {
		player.autoCrunchMode = "time"
		el("togglecrunchmode").textContent = "Auto crunch mode: time"
		el("limittext").textContent = "Seconds between crunches:"
	} else if (player.autoCrunchMode == "time"){
		player.autoCrunchMode = "relative"
		el("togglecrunchmode").textContent = "Auto crunch mode: X times last crunch"
		el("limittext").textContent = "X times last crunch:"
	} else if (player.autoCrunchMode == "relative" && player.boughtDims){
		player.autoCrunchMode = "replicanti"
		el("togglecrunchmode").innerHTML = "Auto crunch mode: replicated galaxies"
		el("limittext").innerHTML = "Replicanti galaxies needed for crunch:"
		el("maxReplicantiCrunchSwitchDiv").style.display = 'inline'
	} else {
		player.autoCrunchMode = "amount"
		el("togglecrunchmode").textContent = "Auto crunch mode: amount"
		el("limittext").textContent = "Amount of IP to wait until reset:"
		el("maxReplicantiCrunchSwitchDiv").style.display = 'none'
		if (!freeze&&player.autobuyers[11].priority.toString().toLowerCase()=="max") {
			player.autobuyers[11].priority = E(1)
			el("priority12").value=1
		}
	}
}

var bestRunIppm = E(0)
function updateLastTenRuns() {
	var listed = 0
	var tempBest = 0
	var tempTime = E(0)
	var tempIP = E(0)
	bestRunIppm = E(0)
	for (var i=0; i<10; i++) {
		if (player.lastTenRuns[i][1].gt(0)) {
			var ippm = player.lastTenRuns[i][1].dividedBy(player.lastTenRuns[i][0]/600)
			if (ippm.gt(tempBest)) tempBest = ippm
			var tempstring = "(" + rateFormat(ippm, "IP") + ")"
			var msg = "The infinity " + (i == 0 ? '1 infinity' : (i + 1) + ' infinities') + " ago took " + timeDisplayShort(player.lastTenRuns[i][0], false, 3)
			if (player.lastTenRuns[i][2]) msg += " in " + getNCName(player.lastTenRuns[i][2])
			msg += " and gave " + shortenDimensions(player.lastTenRuns[i][1]) +" IP. "+ tempstring
			el("run"+(i+1)).textContent = msg
			tempTime = tempTime.plus(player.lastTenRuns[i][0])
			tempIP = tempIP.plus(player.lastTenRuns[i][1])
			listed++
		} else el("run"+(i+1)).textContent = ""
	}
	if (listed > 1) {
		tempTime = tempTime.dividedBy(listed)
		tempIP = tempIP.dividedBy(listed)
		var ippm = tempIP.dividedBy(tempTime/600)
		var tempstring = "(" + rateFormat(ippm, "IP") + ")"
		averageIP = tempIP
		el("averagerun").textContent = "Average time of the last " + listed + " Infinities: " + timeDisplayShort(tempTime, false, 3) + " | Average IP gain: " + shortenDimensions(tempIP) + " IP. " + tempstring
		
		if (tempBest.gte(1e8)) giveAchievement("Oh hey, you're still here");
		if (tempBest.gte(1e300)) giveAchievement("MAXIMUM OVERDRIVE");
		bestRunIppm = tempBest
	} else el("averagerun").innerHTML = ""
}

function getInfinitiedStat(){
	return getInfinitied()
}

function getInfinitied() {
	return c_max(c_add(player.infinitied,player.infinitiedBank),0)
}

function getInfinitiedGain() {
	let infGain = 1
	if (qMs.tmp.amt >= 18) infGain = 250
	else if (player.thisInfinityTime >= 50 && hasAch("r87")) infGain = 250
	if (hasTS(32)) infGain *= tsMults[32]()
	if (tmp.ngp3 && hasAch("ngpp18")) infGain *= 10
	if (hasAch("r133") && player.meta) infGain = c_mul(player.dilation.dilatedTime.pow(.25).max(1), infGain)
	if (dev.boosts.tmp[5]) infGain = c_mul(infGain, Decimal.pow(infGain, dev.boosts.tmp[5] - 1))
	return c_add(infGain, hasAch("r87") && inNGM(2) ? 249 : 0)
}

function doCrunchIDAutobuy(){
	if (getEternitied() > 10 && player.currentEternityChall !== "eterc8" && player.currentEternityChall !== "eterc2" && player.currentEternityChall !== "eterc10") {
		for (var i = 1; i < getEternitied() - 9 && i < 9; i++) {
			if (player.infDimBuyers[i-1]) {
				buyMaxInfDims(i, true)
				buyManyInfinityDimension(i, true)
			}
		}
	}
}

function doIRCrunchResetStuff(){
	if (player.infinityUpgradesRespecced == undefined) return 
	player.singularity.darkMatter = E(0)
	player.dimtechs.discounts = 0
	if (player.dimtechs.respec) {
		var total = 0
		for (let dim = 1; dim < 9; dim++) total += player.dimtechs["dim" + dim + "Upgrades"]
		total += player.dimtechs.tickUpgrades
		player.infinityPoints = player.infinityPoints.add(Decimal.pow(5, total).sub(1).div(4).round().times(1e95))
		player.dimtechs.tickUpgrades = 0
		for (let dim = 1; dim < 9; dim++) player.dimtechs["dim" + dim + "Upgrades"] = 0
		player.dimtechs.respec = false
	}	
}

function doGPUpgCrunchUpdating(g11MultShown){
	var showg11Mult = player.infinitied > 0 || player.eternities !== 0 || pH.did("quantum")
	if (inNGM(2) && (showg11Mult != g11MultShown)) {
		el("galaxy11").innerHTML = "Normal" + (tmp.ngmX > 3 ? " and Time D" : " d")+"imensions are " + (showg11Mult ? "cheaper based on your infinitied stat.<br>Currently: <span id='galspan11'></span>x":"99% cheaper.")+"<br>Cost: 1 GP"
		el("galaxy15").innerHTML = "Normal and Time Dimensions produce " + (showg11Mult ? "faster based on your infinitied stat.<br>Currently: <span id='galspan15'></span>x":"100x faster")+".<br>Cost: 1 GP"
	}
}

function doDefaultTickspeedReduction(){
	if (hasAch("r36")) player.tickspeed = player.tickspeed.times(0.98);
	if (hasAch("r45")) player.tickspeed = player.tickspeed.times(0.98);
	if (hasAch("r66")) player.tickspeed = player.tickspeed.times(0.98);
	if (hasAch("r83")) player.tickspeed = player.tickspeed.times(Decimal.pow(0.95, player.galaxies));
}

function doAfterResetCrunchStuff(g11MultShown){
	el("challengeconfirmation").style.display = "inline-block"
	if (!player.options.retryChallenge) player.currentChallenge = ""
	doIRCrunchResetStuff()
	updateSingularity()
	updateDimTechs()
	if (player.replicanti.unl && !hasAch("r95")) player.replicanti.amount = E(1)
	if (!tmp.ngC && !hasAch("ng3p67")) player.replicanti.galaxies = hasTS(33) ? Math.floor(player.replicanti.galaxies / 2) : 0
	player.tdBoosts = resetTDBoosts()
	resetPSac()
	resetTDsOnNGM4()
	reduceDimCosts()
	setInitialResetPower();
	doDefaultTickspeedReduction()
	checkSecondSetOnCrunchAchievements()
	updateAutobuyers();
	setInitialMoney()
	resetInfDimensions();
	hideDimensions()
	tmp.tickUpdate = true;
	GPminpeak = E(0)
	IPminpeak = E(0)
	doGPUpgCrunchUpdating(g11MultShown)
	doCrunchIDAutobuy()
	replicantiShopABRun()
	Marathon2 = 0;
	updateChallenges();
	updateNCVisuals()
	updateChallengeTimes()
	updateLastTenRuns()
}

function doCrunchInfinitiesGain(){
	let infGain
	if (player.currentEternityChall == "eterc4") {
		infGain = 1
		if (player.infinitied >= 16 - (ECComps("eterc4") * 4)) {
			setTimeout(exitChallenge, 500)
			onChallengeFail()
		}
	} else infGain = getInfinitiedGain()
	player.infinitied = c_add(player.infinitied, infGain)
}

var isEmptiness=false
function bigCrunch(autoed) {
	var challNumber
	var split = player.currentChallenge.split("challenge")
	if (split[1] != undefined) challNumber = parseInt(split[1])
	var icID = checkICID(player.currentChallenge)
	if (icID) challNumber = icID
	var crunchStuff = (player.money.gte(Number.MAX_VALUE) && !player.currentChallenge.includes("post")) || (player.currentChallenge !== "" && player.money.gte(player.challengeTarget))
	//crunch stuff is whether we are completing a non NG-(4+) NC/IC
	if (!crunchStuff) {
		updateChallenges()
		updateNCVisuals()
		updateChallengeTimes()
		updateLastTenRuns()
		return
	}
	pH.onPrestige("infinity")
	
	if ((!hasAch("r55") || (player.options.animations.bigCrunch === "always" && !autoed)) && isEmptiness && implosionCheck === 0 && player.options.animations.bigCrunch) {
		implosionCheck = 1;
		el("body").style.animation = "implode 2s 1";
		setTimeout(function(){ el("body").style.animation = ""; }, 2000)
		setTimeout(bigCrunch, 1000)
		return
	}
	implosionCheck = 0;
	checkOnCrunchAchievements()
	if (player.currentChallenge != "" && player.challengeTimes[challNumber-2] > player.thisInfinityTime) player.challengeTimes[challNumber-2] = player.thisInfinityTime
	if (tmp.ngmX >= 4) if (player.galacticSacrifice.chall) {
		challNumber = player.galacticSacrifice.chall
		if (player.challengeTimes[challNumber-2] > player.thisInfinityTime) player.challengeTimes[challNumber-2] = player.thisInfinityTime
	}
	if (player.currentChallenge.includes("post") && player.infchallengeTimes[challNumber-1] > player.thisInfinityTime) player.infchallengeTimes[challNumber-1] = player.thisInfinityTime
	if (player.currentChallenge == "postc5" && player.thisInfinityTime <= 100) giveAchievement("Hevipelle did nothing wrong")
	if (player.tickspeedBoosts != undefined && player.thisInfinityTime <= 100 && player.currentChallenge == "postc7") giveAchievement("Hevipelle did nothing wrong")
	if (isEmptiness) {
		showTab("dimensions")
		isEmptiness = false
		pH.updateDisplay()
	}
	if (player.currentChallenge != "" && !player.challenges.includes(player.currentChallenge)) player.challenges.push(player.currentChallenge);
	if (inNGM(4) && player.galacticSacrifice.chall) {
		if (!player.challenges.includes("challenge" + player.galacticSacrifice.chall)) player.challenges.push("challenge" + player.galacticSacrifice.chall)
		delete player.galacticSacrifice.chall
	}
	if (player.currentChallenge == "postc8") giveAchievement("Anti-antichallenged");
	var add = getIPMult()
	if ((player.break && player.currentChallenge == "") || player.infinityUpgradesRespecced != undefined) add = gainedInfinityPoints()
	else if (hasTS(51)) add = add.times(1e15)
	player.infinityPoints = player.infinityPoints.plus(add)
	if (player.infinityPoints.lt(1e16)) player.infinityPoints = player.infinityPoints.round()
	var array = [player.thisInfinityTime, add]
	if (player.currentChallenge != "") array.push(player.currentChallenge)
	addTime(array)
	checkYoDawg()

	if (autoS && auto) {
		if (gainedInfinityPoints().dividedBy(player.thisInfinityTime).gt(player.autoIP) && !player.break) player.autoIP = gainedInfinityPoints().dividedBy(player.thisInfinityTime);
		if (player.thisInfinityTime<player.autoTime) player.autoTime = player.thisInfinityTime;
	}

	auto = autoS; //only allow autoing if prev crunch was autoed
	autoS = true;

	if (player.currentEternityChall !== "eterc12") player.bestInfinityTime = Math.min(player.bestInfinityTime, player.thisInfinityTime)
	doCrunchInfinitiesGain()
	doCrunchResetStuff()

	var g11MultShown = pH.did("infinity")
	doAfterResetCrunchStuff(g11MultShown)
}

//INFINITY UPGRADES
let INF_UPGS = {
	normal: {
		ids: {
			11: "timeMult",
			21: "dimMult",
			31: "timeMult2",
			41: "skipReset1",
			12: "18Mult",
			22: "27Mult",
			32: "unspentBonus",
			42: "skipReset2",
			13: "36Mult",
			23: "45Mult",
			33: "resetMult",
			43: "skipReset3",
			14: "resetBoost",
			24: "galaxyBoost",
			34: "passiveGen",
			44: "skipResetGalaxy",
		},
		costs: {
			11: 1,
			21: 1,
			31: 3,
			41() {
				return tmp.bgMode ? 2 : 20
			},
			12: 1,
			22: 1,
			32: 5,
			42() {
				return tmp.bgMode ? 3 : 40
			},
			13: 1,
			23: 1,
			33: 7,
			43() {
				return tmp.bgMode ? 5 : 80
			},
			14: 1,
			24: 2,
			34: 10,
			44() {
				return tmp.bgMode ? 8 : 300
			}
		},
		getCost(x) {
			x = this.costs[x]
			if (typeof(x) == "function") x = x()

			if (tmp.ngmR && x % 10 > 2) x *= 2
			return x
		},
		can(x) {
			let y = x % 10
			if (y > 1 && !player.infinityUpgrades.includes(this.ids[x - 1])) return false
			return player.infinityPoints.gte(this.getCost(x))
		},
		buy(x) {
			let id = this.ids[x]
			if (player.infinityUpgrades.includes(id)) return
			if (!this.can(x)) return

			player.infinityUpgrades.push(id)
			player.infinityPoints = player.infinityPoints.minus(this.getCost(x))
		}
	}
}

function buyInfinityUpgrade(name, cost) {
	if (player.infinityPoints.gte(cost) && !player.infinityUpgrades.includes(name)) {
		player.infinityUpgrades.push(name)
		player.infinityPoints = player.infinityPoints.minus(cost)
		if (name == "bulkBoost") DimBoostBulkDisplay()
		if (name == "autoBuyerUpgrade") updateAutobuyers()
		if (name == "postinfi53") for (tier = 1; tier <= 8; tier++) {
			let dim = player["infinityDimension" + tier]
			dim.cost = Decimal.pow(getIDCostMult(tier),dim.baseAmount / 10).times(infBaseCost[tier])
		}
	}
}

//INFINITY UPGRADES: IP MULTIPLIER
function getIPMultPower() {
	let ret = 2
	if (hasMTS(241)) ret = 2.2
	if (hasGalUpg(53)) ret += Math.pow(1.25, -15e4 / player.galacticSacrifice.galaxyPoints.log10())
	return ret
}

var ipMultCostIncrease = 10
function doInitInfMultStuff() {
	if (aarMod.newGameExpVersion !== undefined) ipMultCostIncrease=4
	else ipMultCostIncrease=10
}

el("infiMult").onclick = function() {
	if (canBuyIPMult()) {
		player.infinityPoints = player.infinityPoints.minus(player.infMultCost)
		player.infMult = player.infMult.times(getIPMultPower());
		player.autoIP = player.autoIP.times(getIPMultPower());
		player.infMultCost = player.infMultCost.times(ipMultCostIncrease)
		if (player.autobuyers[11].priority !== undefined && player.autobuyers[11].priority !== null && player.autoCrunchMode == "amount") player.autobuyers[11].priority = Decimal.times(player.autobuyers[11].priority, 2);
		if (player.autoCrunchMode == "amount") el("priority12").value = formatValue("Scientific", player.autobuyers[11].priority, 2, 0);
	}
}

function canBuyIPMult() {
	if (tmp.ngC || tmp.bgMode || player.infinityUpgradesRespecced != undefined) return player.infinityPoints.gte(player.infMultCost)
	return player.infinityUpgrades.includes("skipResetGalaxy") && player.infinityUpgrades.includes("passiveGen") && player.infinityUpgrades.includes("galaxyBoost") && player.infinityUpgrades.includes("resetBoost") && player.infinityPoints.gte(player.infMultCost)
}

function bumpInfMult() {
	var otherMults = 1
	if (hasAch("r85")) otherMults *= 4
	if (hasAch("r93")) otherMults *= 4
	var old = getIPMultPower()
	doInitInfMultStuff()
	player.infMult = player.infMult.div(otherMults).pow(Math.log10(getIPMultPower()) / Math.log10(old)).times(otherMults)
}