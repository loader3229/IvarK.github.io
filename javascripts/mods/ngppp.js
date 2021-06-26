var testHarderNGp3 = false

function updateNGP3EterUpgs() {
	if (pH.did("quantum"))  {
		getEl("eterrowMS").style.display = ""
		getEl("eter13").className = (player.eternityUpgrades.includes(13)) ? "eternityupbtnbought" : (player.eternityPoints.gte(1/0)) ? "eternityupbtn" : "eternityupbtnlocked"
		getEl("eter14").className = (player.eternityUpgrades.includes(14)) ? "eternityupbtnbought" : (player.eternityPoints.gte(1/0)) ? "eternityupbtn" : "eternityupbtnlocked"
		getEl("eter15").className = (player.eternityUpgrades.includes(15)) ? "eternityupbtnbought" : (player.eternityPoints.gte(1/0)) ? "eternityupbtn" : "eternityupbtnlocked"
	} else getEl("eterrowMS").style.display = "none"
}

//v1.5 
function showQuantumTab(tabName) {
	//iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
	var tabs = document.getElementsByClassName('quantumtab');
	var tab;
	var oldTab
	for (var i = 0; i < tabs.length; i++) {
		tab = tabs.item(i);
		if (tab.style.display == 'block') oldTab = tab.id
		if (tab.id === tabName) { 
			tab.style.display = 'block';
		} else {
			tab.style.display = 'none';
		}
	}
	if (oldTab != tabName) {
		aarMod.tabsSave.tabQuantum = tabName
		if (tabName == "uquarks" && getEl("quantumtab").style.display !== "none") {
			resizeCanvas()
			requestAnimationFrame(drawQuarkAnimation)
		}
	}
	closeToolTip()
}

var quantumTabs = {
	tabIds: ["uquarks", "gluons", "speedruns", "positrons", "replicants", "nanofield", "tod"],
	update: {
		uquarks: updateQuarksTab,
		gluons: updateGluonsTab,
		speedruns: qMs.updateDisplayOnTick,
		positrons: pos.updateTab, //temp
		replicants: updateReplicantsTab,
		nanofield: updateNanofieldTab,
		tod: updateTreeOfDecayTab
	}
}

function updateQuantumTabs() {
	getEl("quarkEnergy").textContent = shorten(qu_save.quarkEnergy)
	getEl("quarkEnergyMult").textContent = shorten(tmp.qe.mult) + (tmp.qe.div > 1 ? " / " + shorten(tmp.qe.div) : "")
	getEl("bestQE").textContent = shorten(qu_save.bestEnergy)
	getEl("qeEff").textContent = "^" + tmp.qe.exp.toFixed(3)
	getEl("qeFrac").textContent = shorten(tmp.qe.expNum) + "/" + shorten(tmp.qe.expDen)

	for (var i = 0; i < quantumTabs.tabIds.length; i++) {
		var id = quantumTabs.tabIds[i]
		if (getEl(id).style.display == "block") quantumTabs.update[id]()
	}
}

function toggleAutoTT() {
	if (qMs.tmp.amt < 2) maxTheorems()
	else player.autoEterOptions.tt = !player.autoEterOptions.tt
	getEl("theoremmax").innerHTML = qMs.tmp.amt >= 2 ? ("Auto max: " + (player.autoEterOptions.tt ? "ON" : "OFF")) : "Buy max Theorems"
}

//v1.8
const MAX_DIL_UPG_PRIORITIES = [6, 4, 3, 1, 2]

function preQuantumAutoNGP3(diff) {
	//Pre-Quantum Automation
	let tickPerDiff = qMs.tmp.metaSpeed

	qu_save.metaAutobuyerWait += diff
	if (qu_save.metaAutobuyerWait >= tickPerDiff) {
		doAutoMetaTick(Math.floor(qu_save.metaAutobuyerWait / tickPerDiff))
		qu_save.metaAutobuyerWait = qu_save.metaAutobuyerWait % tickPerDiff
	}

	if (qMs.tmp.amt >= 20) {
		replicantiShopABRun()
		runIDBuyersTick()
	}
}

function doAutoMetaTick(ticks) {
	//Meta Dimensions
	let slowSpeed = 5
	if (qMs.tmp.amt >= 13) slowSpeed = Math.max(5 - (qMs.tmp.amt - 13 + 1), 1)

	let wait = (qu_save.metaAutobuyerSlowWait || 0) + ticks
	if (wait >= slowSpeed) {
		var bulk = Math.floor(wait / slowSpeed)
		wait = wait % slowSpeed
		for (var d = 1; d <= 8; d++) if (player.autoEterOptions["md" + d] && moreEMsUnlocked() && (pH.did("quantum") || getEternitied() >= tmp.ngp3_em[3])) buyMaxMetaDimension(d, bulk)
	}
	qu_save.metaAutobuyerSlowWait = wait

	//Others
	var bulk = ticks
	if (player.autoEterOptions.rebuyupg && qMs.tmp.amt >= 7) {
		if (tmp.ngp3) maxAllDilUpgs()
		else for (var i = 0; i < MAX_DIL_UPG_PRIORITIES.length; i++) {
			var id = "r" + MAX_DIL_UPG_PRIORITIES[i]
			if (isDilUpgUnlocked(id)) buyDilationUpgrade(id, false, true)
		}
	}
	if (player.autoEterOptions.metaboost) metaBoost()
}

function toggleAllMetaDims() {
	let turnOn = false
	let dim = 1
	while (dim <= 8) {
		if (!player.autoEterOptions["md" + dim]) turnOn = true
		if (turnOn) break
		dim++
	}

	for (dim = 1; dim <= 8; dim++) player.autoEterOptions["md" + dim] = turnOn
}

//v1.997
function respecTogglePC() {
	if (hasNU(16)) {
		if (!pH.can("quantum")) return
		qu_save.pairedChallenges.respec = true
		quantum(true)
	} else {
		qu_save.pairedChallenges.respec = !qu_save.pairedChallenges.respec
		getEl("respecPC").className = qu_save.pairedChallenges.respec ? "quantumbtn" : "storebtn"
	}
}

//v1.99799
function respecOptions() {
	closeToolTip()
	getEl("respecoptions").style.display="flex"
}

//v1.998
function toggleAutoQuantumContent(id) {
	qu_save.autoOptions[id] = !qu_save.autoOptions[id]
}

//v1.9986
function respecMasteryToggle() {
	player.respecMastery = !player.respecMastery
	updateRespecButtons()
}

//v1.9987
var bankedEterGain
function updateBankedEter(updateHtml = true) {
	bankedEterGain = 0
	if (hasAch("ng3p15")) bankedEterGain = player.eternities
	if (hasAch("ng3p73")) bankedEterGain = nA(bankedEterGain, gainEternitiedStat())
	bankedEterGain = nD(bankedEterGain, 20)
	if (updateHtml) {
		setAndMaybeShow("bankedEterGain", bankedEterGain > 0, '"You will gain "+getFullExpansion(bankedEterGain)+" banked eternities on next quantum."')
		setAndMaybeShow("eternitiedBank", player.eternitiesBank, '"You have "+getFullExpansion(player.eternitiesBank)+" banked eternities."')
	}
}

//v1.99871
function fillAll() {
	var oldLength = player.timestudy.studies.length
	for (var t = 0; t < all.length; t++) buyTimeStudy(all[t], 0, true)
	if (player.timestudy.studies.length > oldLength) {
		updateTheoremButtons()
		updateTimeStudyButtons()
		drawStudyTree()
		if (player.timestudy.studies.length > 56) $.notify("All studies in time study tab are now filled.")
	}
}

//v1.99872
function maxAllDilUpgs() {
	let dt = player.dilation.dilatedTime.min("1e10000000")
	let update
	for (var i = 0; i < MAX_DIL_UPG_PRIORITIES.length; i++) {
		var num = MAX_DIL_UPG_PRIORITIES[i]
		if (isDilUpgUnlocked(id)) {
			if (num == 1) {	
				var cost = Decimal.pow(10, player.dilation.rebuyables[1] + 5)
				if (dt.gte(cost)) {
					var toBuy = Math.floor(dt.div(cost).times(9).add(1).log10())
					var toSpend = Decimal.pow(10, toBuy).sub(1).div(9).times(cost)
					dt = dt.sub(dt.min(cost))
					player.dilation.rebuyables[1] += toBuy
					update = true
				}
			} else if (num == 2) {
				if (canBuyGalaxyThresholdUpg()) {
					if (tmp.ngp3) {
						var cost = Decimal.pow(10, player.dilation.rebuyables[2] * 2 + 6)
						if (dt.gte(cost)) {
							var toBuy = Math.floor(dt.div(cost).times(99).add(1).log(100))
							var toSpend = Decimal.pow(100,toBuy).sub(1).div(99).times(cost)
							dt = dt.sub(dt.min(cost))
							player.dilation.rebuyables[2] += toBuy
							resetDilationGalaxies()
							update = true
						}
					} else {
						player.dilation.dilatedTime = dt
						if (buyDilationUpgrade("r2", true, true)) update = true
					}
				}
			} else {
				let data = doBulkSpent(dt, (x) => getRebuyableDilUpgCost(num, x), player.dilation.rebuyables[num] || 0)

				if (data.toBuy > 0) {
					dt = data.res
					player.dilation.rebuyables[num] = (player.dilation.rebuyables[num] || 0) + data.toBuy
					update = true

					if (num == 3 && !tmp.dtMode && qMs.tmp.amt >= 5) setTachyonParticles(player.dilation.tachyonParticles.times(Decimal.pow(getDil3Power(), data.toBuy * getDilUpg3Mult())))
					else if (player.eternityBuyer.alwaysDil) player.eternityBuyer.alwaysDilCond = true
				}
			}
		}
	}
	if (update) {
		player.dilation.dilatedTime = dt

		updateDilationUpgradeCosts()
		updateDilationUpgradeButtons()
	}
}

//v1.99874
function maybeShowFillAll() {
	var display = "none"
	if ((ETER_UPGS.has(10) && ETER_UPGS.has(11)) || ETER_UPGS.has(14)) display = "block"
	getEl("fillAll").style.display = display
	getEl("fillAll2").style.display = display
}

//v1.9995
function updateAutoQuantumMode() {
	if (qu_save.autobuyer.mode == "amount") {
		getEl("toggleautoquantummode").textContent = "Auto quantum mode: amount"
		getEl("autoquantumtext").textContent = "Amount of QK to wait until reset:"
	} else if (qu_save.autobuyer.mode == "relative") {
		getEl("toggleautoquantummode").textContent = "Auto quantum mode: X times last quantum"
		getEl("autoquantumtext").textContent = "X times last quantum:"
	} else if (qu_save.autobuyer.mode == "time") {
		getEl("toggleautoquantummode").textContent = "Auto quantum mode: time"
		getEl("autoquantumtext").textContent = "Minimal seconds between quantums:"
	} else if (qu_save.autobuyer.mode == "dilation") {
		getEl("toggleautoquantummode").textContent = "Auto quantum mode: dilation"
		getEl("autoquantumtext").textContent = "Amount of dilation runs to wait until reset:"
	}
}

function toggleAutoQuantumMode() {
	if (qu_save.autobuyer.mode == "amount") qu_save.autobuyer.mode = "time"
	else if (qu_save.autobuyer.mode == "time") qu_save.autobuyer.mode = "relative"
	else if (qu_save.autobuyer.mode == "relative") qu_save.autobuyer.mode = "dilation"
	else qu_save.autobuyer.mode = "amount"
	updateAutoQuantumMode()
}

//v1.9997
function toggleAutoReset() {
	qu_save.autoOptions.replicantiReset = !qu_save.autoOptions.replicantiReset
	getEl('autoReset').textContent = "Auto: " + (qu_save.autoOptions.replicantiReset ? "ON" : "OFF")
}

//v2
function switchAB() {
	var bigRip = qu_save.bigRip.active
	qu_save.bigRip["savedAutobuyers" + (bigRip ? "" : "No") + "BR"] = {}
	var data = qu_save.bigRip["savedAutobuyers" + (bigRip ? "" : "No") + "BR"]
	for (let d = 1; d < 9; d++) if (player.autobuyers[d-1] % 1 !== 0) data["d" + d] = {
		priority: player.autobuyers[d-1].priority,
		perTen: player.autobuyers[d-1].target > 10,
		on: player.autobuyers[d-1].isOn,
	}
	if (player.autobuyers[8] % 1 !== 0) data.tickspeed = {
		priority: player.autobuyers[8].priority,
		max: player.autobuyers[8].target == 10,
		on: player.autobuyers[8].isOn
	}
	if (player.autobuyers[9] % 1 !== 0) data.dimBoosts = {
		maxDims: player.autobuyers[9].priority,
		always: player.overXGalaxies,
		bulk: player.autobuyers[9].bulk,
		on: player.autobuyers[9].isOn
	}
	if (player.tickspeedBoosts !== undefined) if (player.autobuyers[13] % 1 !== 0) data.tickBoosts = {
		maxDims: player.autobuyers[13].priority,
		always: player.overXGalaxiesTickspeedBoost,
		bulk: player.autobuyers[13].bulk,
		on: player.autobuyers[13].isOn
	}
	if (inNGM(2)) if (player.autobuyers[12] % 1 !== 0) data.galSacrifice = {
		amount: player.autobuyers[12].priority,
		on: player.autobuyers[12].isOn
	}
	if (player.autobuyers[11] % 1 !== 0) data.crunch = {
		mode: player.autoCrunchMode,
		amount: new Decimal(player.autobuyers[11].priority),
		on: player.autobuyers[11].isOn
	}
	data.eternity = {
		mode: player.autoEterMode,
		amount: player.eternityBuyer.limit,
		dilation: player.eternityBuyer.dilationMode,
		dilationPerStat: player.eternityBuyer.dilationPerAmount,
		dilMode: player.eternityBuyer.dilMode,
		tpUpgraded: player.eternityBuyer.tpUpgraded,
		slowStop: player.eternityBuyer.slowStop,
		slowStopped: player.eternityBuyer.slowStopped,
		ifAD: player.eternityBuyer.ifAD,
		presets: Object.assign({}, player.eternityBuyer.presets),
		on: player.eternityBuyer.isOn
	}
	data.eternity.presets.order = []
	for (var i = 0; i < player.eternityBuyer.presets.order.length; i++) {
		var id = player.eternityBuyer.presets.order[i]
		data.eternity.presets[id] = Object.assign({}, player.eternityBuyer.presets[id])
		data.eternity.presets.order.push(id)
	}
	if (data.eternity.presets.dil !== undefined) data.eternity.presets.dil = Object.assign({}, data.eternity.presets.dil)
	if (data.eternity.presets.grind !== undefined) data.eternity.presets.grind = Object.assign({}, data.eternity.presets.grind)
	var data = qu_save.bigRip["savedAutobuyers" + (bigRip ? "No" : "") + "BR"]
	for (var d = 1; d < 9; d++) if (data["d" + d]) player.autobuyers[d - 1] = {
		interval: player.autobuyers[d - 1].interval,
		cost: player.autobuyers[d - 1].cost,
		bulk: player.autobuyers[d - 1].bulk,
		priority: data["d"+d].priority,
		tier: d,
		target: d + (data["d"+d].perTen ? 10 : 0),
		ticks: 0,
		isOn: data["d"+d].on
	}
	if (data.tickspeed) player.autobuyers[8] = {
		interval: player.autobuyers[8].interval,
		cost: player.autobuyers[8].cost,
		bulk: 1,
		priority: data.tickspeed.priority,
		tier: 1,
		target: player.autobuyers[8].target,
		ticks: 0,
		isOn: data.tickspeed.on
	}
	if (data.dimBoosts) {
		player.autobuyers[9] = {
			interval: player.autobuyers[9].interval,
			cost: player.autobuyers[9].cost,
			bulk: data.dimBoosts.bulk,
			priority: data.dimBoosts.maxDims,
			tier: 1,
			target: 11,
			ticks: 0,
			isOn: data.dimBoosts.on
		}
		player.overXGalaxies = data.dimBoosts.always
	}
	if (data.tickBoosts) {
		player.autobuyers[13] = {
			interval: player.autobuyers[13].interval,
			cost: player.autobuyers[13].cost,
			bulk: data.tickBoosts.bulk,
			priority: data.tickBoosts.maxDims,
			tier: 1,
			target: 14,
			ticks: 0,
			isOn: data.tickBoosts.on
		}
		player.overXGalaxiesTickspeedBoost = data.tickBoosts.always
	}
	if (data.galacticSacrifice) player.autobuyers[12] = {
		interval: player.autobuyers[12].interval,
		cost: player.autobuyers[12].cost,
		bulk: 1,
		priority: data.galacticSacrifice.amount,
		tier: 1,
		target: 13,
		ticks: 0,
		isOn: data.galacticSacrifice.on
	}
	if (data.crunch) {
		player.autobuyers[11] = {
			interval: player.autobuyers[11].interval,
			cost: player.autobuyers[11].cost,
			bulk: 1,
			priority: new Decimal(data.crunch.amount),
			tier: 1,
			target: 12,
			ticks: 0,
			isOn: data.crunch.on
		}
		player.autoCrunchMode = data.crunch.mode
	}
	if (data.eternity) {
		player.eternityBuyer = {
			limit: data.eternity.amount,
			dilationMode: data.eternity.dilation,
			dilationPerAmount: data.eternity.dilationPerStat,
			statBeforeDilation: data.eternity.dilationPerStat,
			dilMode: data.eternity.dilMode ? data.eternity.dilMode : "amount",
			tpUpgraded: data.eternity.tpUpgraded ? data.eternity.tpUpgraded : false,
			slowStop: data.eternity.slowStop ? data.eternity.slowStop : false,
			slowStopped: data.eternity.slowStopped ? data.eternity.slowStopped : false,
			ifAD: data.eternity.ifAD ? data.eternity.ifAD : false,
			presets: data.eternity.presets ? data.eternity.presets : {on: false, autoDil: false, selected: -1, selectNext: 0, left: 1, order: []},
			isOn: data.eternity.on
		}
		if (player.eternityBuyer.presets.selectNext === undefined) {
			player.eternityBuyer.presets.selected = -1
			player.eternityBuyer.presets.selectNext = 0
		}
		if (player.eternityBuyer.presets.left === undefined) player.eternityBuyer.presets.left = 1
		player.autoEterMode = data.eternity.mode
	}
	qu_save.bigRip["savedAutobuyers" + (bigRip ? "No" : "") + "BR"] = {}
	updateCheckBoxes()
	loadAutoBuyerSettings()
	if (player.autoCrunchMode == "amount") {
		getEl("togglecrunchmode").textContent = "Auto crunch mode: amount"
		getEl("limittext").textContent = "Amount of IP to wait until reset:"
	} else if (player.autoCrunchMode == "time") {
		getEl("togglecrunchmode").textContent = "Auto crunch mode: time"
		getEl("limittext").textContent = "Seconds between crunches:"
	} else {
		getEl("togglecrunchmode").textContent = "Auto crunch mode: X times last crunch"
		getEl("limittext").textContent = "X times last crunch:"
	}
	updateAutoEterMode()
}

function getAMforGHPGain(){
	return inBigRip() ? qu_save.bigRip.bestThisRun.log10() : player.money.plus(1).log10() / (tmp.quActive && qu_save.breakEternity.upgrades.includes(13) ? 1e6 : 2e6)
}

function getGHPGain() {
	if (!pH.did("ghostify")) return new Decimal(1)
	let log = 0 //getAMforGHPGain() / QCs.getGoalMA([6, 8], "ghp_gain") - 1
	if (hasAch("ng3p58")) { 
		//the square part of the formula maxes at e10, and gets weaker after ~e60 total
		let x = Math.min(7, log / 2) + Math.min(3, log / 2)
		y = player.ghostify.ghostParticles.plus(Decimal.pow(10, log)).plus(10).log10()
		if (!hasAch("ng3p84")) x = Math.min(x, 600 / y)
		log += x
	}
	return Decimal.pow(10, log).times(getGHPMult()).floor()
}

function getGHPBaseMult() {
	return Decimal.pow(20 / 9, player.ghostify.multPower - 1)
}

function getGHPMult() {
	let x = getGHPBaseMult()
	if (hasAch("ng3p93")) x = x.times(500)
	if (hasAch("ng3p97")) x = x.times(Decimal.pow(player.ghostify.times + 1, 1/3))
	return x
}

function ghostify(auto, force) {
	if (!force && (implosionCheck || !pH.can("ghostify"))) return
	if (!auto && !force && aarMod.ghostifyConf && !confirm("Becoming a ghost resets everything Quantum resets, and also resets all your Quantum content and banked stats to gain a Ghost Particle. " + (aarMod.nguspV ? "You will also exit NGUdS' mode and permanently bring you to NGUd'! " : "") + "Are you ready for this?")) {
		denyGhostify()
		return
	}
	if (!pH.did("ghostify") && (!confirm("Are you sure you want to do this? You will lose everything you have!") || !confirm("ARE YOU REALLY SURE YOU WANT TO DO THAT? YOU CAN'T UNDO THIS AFTER YOU BECAME A GHOST AND PASS THE UNIVERSE EVEN IT IS BIG RIPPED! THIS IS YOUR LAST CHANCE!"))) {
		denyGhostify()
		return
	}
	var implode = player.options.animations.ghostify && !force
	if (implode) {
		var gain = getGHPGain()
		var amount = player.ghostify.ghostParticles.add(gain).round()
		var seconds = pH.did("ghostify") ? 4 : 10
		implosionCheck=1
		dev.ghostify(gain, amount, seconds)
		setTimeout(function(){
			isEmptiness = true
			showTab("")
		}, seconds * 250)
		setTimeout(function(){
			if (Math.random()<1e-3) giveAchievement("Boo!")
			ghostifyReset(true, gain, amount)
		}, seconds * 500)
		setTimeout(function(){
			implosionCheck=0
		}, seconds * 1000)
	} else ghostifyReset(false, 0, 0, force)
	updateAutoQuantumMode()
}

var ghostifyDenied
function denyGhostify() {
	ghostifyDenied++
	if (ghostifyDenied >= 15) giveAchievement("You are supposed to become a ghost!")
}

function ghostifyReset(implode, gain, amount, force) {
	var bulk = getGhostifiedGain()
	if (!force) {
		if (qu_save.times >= 1e3 && player.ghostify.milestones >= 16) giveAchievement("Scared of ghosts?")
		if (!implode) {
			var gain = getGHPGain()
			player.ghostify.ghostParticles = player.ghostify.ghostParticles.add(gain).round()
		} else player.ghostify.ghostParticles = amount
		for (var i=player.ghostify.last10.length-1; i>0; i--) player.ghostify.last10[i] = player.ghostify.last10[i-1]
		player.ghostify.last10[0] = [player.ghostify.time, gain]
		player.ghostify.times = nA(player.ghostify.times, bulk)
		player.ghostify.best = Math.min(player.ghostify.best, player.ghostify.time)
		while (qu_save.times <= tmp.bm[player.ghostify.milestones]) player.ghostify.milestones++
		if (!pH.did("ghostify")) {
			pH.onPrestige("ghostify")
			pH.updateDisplay()
		}
	}
	if (isEmptiness) {
		showTab("dimensions")
		isEmptiness = false
		pH.updateDisplay()
	}

	if (aarMod.nguspV) {
		for (let d = 5; d <= 8; d++) delete player["blackholeDimension" + d]
		delete aarMod.nguspV
	}

	var nBRU = []
	var nBEU = []
	for (let u = 20; u > 0; u--) if (nBRU.includes(u + 1) || qu_save.bigRip.upgrades.includes(u)) nBRU.push(u)
	for (let u = 13; u > 0; u--) if (nBEU.includes(u + 1) || qu_save.breakEternity.upgrades.includes(u)) nBEU.push(u)
	if (qu_save.bigRip.active) switchAB()

	var bm = player.ghostify.milestones
	if (bm >= 7 && !force && hasAch("ng3p68")) gainNeutrinos(Decimal.times(2e3 * qu_save.bigRip.bestGals, bulk), "all")
	if (bm >= 16) giveAchievement("I rather oppose the theory of everything")

	if (player.eternityPoints.e>=22e4&&player.ghostify.under) giveAchievement("Underchallenged")
	if (player.ghostify.best<=6) giveAchievement("Running through Big Rips")

	player.ghostify.time = 0
	doGhostifyResetStuff(implode, gain, amount, force, bulk, nBRU, nBEU)
	
	qu_save = player.quantum
	pH.updateActive()
	doPreInfinityGhostifyResetStuff()
	doInfinityGhostifyResetStuff(implode, bm)
	doEternityGhostifyResetStuff(implode, bm)	
	doQuantumGhostifyResetStuff(implode, bm)
	doGhostifyGhostifyResetStuff(bm, force)

	//After that...
	qMs.update()
	qMs.updateDisplay()
	handleDispAndTmpOutOfQuantum()
	handleQuantumDisplays(true)
	resetUP()
}

function toggleGhostifyConf() {
	aarMod.ghostifyConf = !aarMod.ghostifyConf
	getEl("ghostifyConfirmBtn").textContent = "Ghostify confirmation: O" + (aarMod.ghostifyConf ? "N" : "FF")
}

function getGHPRate(num) {
	if (num.lt(1 / 60)) return (num * 1440).toFixed(1) + " GhP/day"
	if (num.lt(1)) return (num * 60).toFixed(1) + " GhP/hr"
	return shorten(num) + " GhP/min"
}

var averageGHP = new Decimal(0)
var bestGHP
function updateLastTenGhostifies() {
	if (player.masterystudies === undefined) return
	var listed = 0
	var tempTime = new Decimal(0)
	var tempGHP = new Decimal(0)
	for (var i=0; i<10; i++) {
		if (player.ghostify.last10[i][1].gt(0)) {
			var qkpm = player.ghostify.last10[i][1].dividedBy(player.ghostify.last10[i][0]/600)
			var tempstring = shorten(qkpm) + " GhP/min"
			if (qkpm<1) tempstring = shorten(qkpm*60) + " GhP/hour"
			var msg = "The Ghostify " + (i == 0 ? '1 Ghostify' : (i+1) + ' Ghostifies') + " ago took " + timeDisplayShort(player.ghostify.last10[i][0], false, 3) + " and gave " + shortenDimensions(player.ghostify.last10[i][1]) +" GhP. "+ tempstring
			getEl("ghostifyrun"+(i+1)).textContent = msg
			tempTime = tempTime.plus(player.ghostify.last10[i][0])
			tempGHP = tempGHP.plus(player.ghostify.last10[i][1])
			bestGHP = player.ghostify.last10[i][1].max(bestGHP)
			listed++
		} else getEl("ghostifyrun"+(i+1)).textContent = ""
	}
	if (listed > 1) {
		tempTime = tempTime.dividedBy(listed)
		tempGHP = tempGHP.dividedBy(listed)
		var qkpm = tempGHP.dividedBy(tempTime/600)
		var tempstring = shorten(qkpm) + " GhP/min"
		averageGHP = tempGHP
		if (qkpm<1) tempstring = shorten(qkpm*60) + " GhP/hour"
		getEl("averageGhostifyRun").textContent = "Last " + listed + " Ghostifies average time: "+ timeDisplayShort(tempTime, false, 3)+" Average GhP gain: "+shortenDimensions(tempGHP)+" GhP. "+tempstring
	} else getEl("averageGhostifyRun").textContent = ""
}

function updateBraveMilestones() {
	if (pH.did("ghostify")) {
		for (var m = 1; m < 17;m++) getEl("braveMilestone" + m).className = "achievement achievement" + (player.ghostify.milestones < m ? "" : "un") + "locked"
		for (var r = 1; r < 3; r++) getEl("braveRow" + r).className = player.ghostify.milestones < r * 8 ? "" : "completedrow"
	}
}

function showGhostifyTab(tabName) {
	//iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
	var tabs = document.getElementsByClassName('ghostifytab');
	var tab;
	var oldTab
	for (var i = 0; i < tabs.length; i++) {
		tab = tabs.item(i);
		if (tab.style.display == 'block') oldTab = tab.id
		if (tab.id === tabName) {
			tab.style.display = 'block';
		} else {
			tab.style.display = 'none';
		}
	}
	if (oldTab !== tabName) aarMod.tabsSave.tabGhostify = tabName
}

function updateGhostifyTabs() {
	if (getEl("neutrinos").style.display == "block") updateNeutrinosTab()
	if (getEl("automaticghosts").style.display == "block") if (player.ghostify.milestones > 7) updateQuantumWorth("display")
	if (getEl("gphtab").style.display == "block" && player.ghostify.ghostlyPhotons.unl) updatePhotonsTab()
	if (getEl("bltab").style.display == "block" && player.ghostify.wzb.unl) updateBosonicLabTab()
}

function buyGHPMult() {
	let sum = player.ghostify.neutrinos.electron.add(player.ghostify.neutrinos.mu).add(player.ghostify.neutrinos.tau).round()
	let cost = getGHPMultCost()
	if (sum.lt(cost)) return
	subNeutrinos(cost)
	player.ghostify.multPower++
	player.ghostify.automatorGhosts[15].a = player.ghostify.automatorGhosts[15].a.times(5)
	getEl("autoGhost15a").value = formatValue("Scientific", player.ghostify.automatorGhosts[15].a, 2, 1)
	getEl("ghpMult").textContent = shortenMoney(getGHPBaseMult())
	getEl("ghpMultUpgCost").textContent = shortenDimensions(getGHPMultCost())
}

function maxGHPMult() {
	let sum = player.ghostify.neutrinos.electron.add(player.ghostify.neutrinos.mu).add(player.ghostify.neutrinos.tau).round()
	let cost = getGHPMultCost()
	let scaling = getGHPMultCostScalingStart()
	let totalBought = 0
	if (sum.lt(cost)) return
	if (player.ghostify.multPower < scaling) {
		let toBuy = Math.min(Math.floor(sum.div(cost).times(24).add(1).log(25)), scaling - player.ghostify.multPower)
		subNeutrinos(Decimal.pow(25, toBuy).sub(1).div(24).times(cost))
		totalBought += toBuy
		cost = getGHPMultCost(totalBought)
	}
	if (player.ghostify.multPower >= scaling) {
		let b = player.ghostify.multPower * 2 - scaling + 3
		let x = Math.floor((-b + Math.sqrt(b * b + 4 * sum.div(cost).log(5))) / 2) + 1
		if (x) {
			let toBuy=x
			let toSpend=0
			while (x > 0) {
				cost = getGHPMultCost(x + totalBought - 1)
				if (sum.div(cost).gt(1e16)) break
				toSpend=cost.add(toSpend)
				if (sum.lt(toSpend)) {
					toSpend=cost
					toBuy--
				}
				x--
			}
			subNeutrinos(toSpend)
			totalBought += toBuy
		}
	}

	player.ghostify.multPower += totalBought
	getEl("ghpMult").textContent = shortenMoney(getGHPBaseMult())
	getEl("ghpMultUpgCost").textContent = shortenDimensions(getGHPMultCost())

	player.ghostify.automatorGhosts[15].a = player.ghostify.automatorGhosts[15].a.times(Decimal.pow(5, totalBought))
	getEl("autoGhost15a").value = formatValue("Scientific", player.ghostify.automatorGhosts[15].a, 2, 1)
}

function setupAutomaticGhostsData() {
	var data = {power: 0, ghosts: 3}
	for (var ghost = 1; ghost <= MAX_AUTO_GHOSTS; ghost++) data[ghost] = {on: false}
	data[4].mode = "q"
	data[4].rotate = "r"
	data[11].pw = 10
	data[11].cw = 10
	data[15].a = 1
	data[17].s = 60
	data[19].t = 0
	data[22].i = 3
	data[24].i = 5
	data[24].m = 1.1
	return data
}

var autoGhostRequirements=[2,4,4,4.5,5,5,6,6.5,7,7,7.5,8,20,22.5,25,27.5,30,35,40,40,40,45]
var powerConsumed
var powerConsumptions=[0,1,1,1,1,1,1.5,1,0.5,0.5,1,0.5,0.5,0.5,0.5,0.5,2,3,4,4,5,7,4,3,4,2]
function updateAutoGhosts(load) {
	var data = player.ghostify.automatorGhosts
	if (load) {
		for (var x = 1; x <= MAX_AUTO_GHOSTS; x++) if (data[x] === undefined) data[x] = {on: false}
		if (data.ghosts >= MAX_AUTO_GHOSTS) getEl("nextAutomatorGhost").parentElement.style.visibility="hidden"
		else {
			getEl("automatorGhostsAmount").textContent=data.ghosts
			getEl("nextAutomatorGhost").parentElement.style.visibility="visible"
			getEl("nextAutomatorGhost").textContent=autoGhostRequirements[data.ghosts-3].toFixed(2)
		}
	}
	powerConsumed=0
	for (var ghost = 1; ghost <= MAX_AUTO_GHOSTS; ghost++) {
		if (ghost>data.ghosts) {
			if (load) getEl("autoGhost" + ghost).style.visibility="hidden"
		} else {
			if (load) {
				getEl("autoGhost" + ghost).style.visibility="visible"
				getEl("isAutoGhostOn" + ghost).checked=data[ghost].on
			}
			if (data[ghost].on) powerConsumed+=powerConsumptions[ghost]
		}
		getEl("ghostcost" + ghost).textContent = powerConsumptions[ghost]
	}
	if (load) {
		getEl("autoGhostMod4").textContent = "Every " + (data[4].mode == "t" ? "second" : "Quantum")
		getEl("autoGhostRotate4").textContent = data[4].rotate == "l" ? "Left" : "Right"
		getEl("autoGhost11pw").value = data[11].pw
		getEl("autoGhost11cw").value = data[11].cw
		getEl("autoGhost13t").value = data[13].t
		getEl("autoGhost13u").value = data[13].u
		getEl("autoGhost13o").value = data[13].o
		getEl("autoGhost15a").value = formatValue("Scientific", data[15].a, 2, 1)
		getEl("autoGhost17s").value = data[17].s || 60
		getEl("autoGhost22t").value = data[22].time
		getEl("autoGhost24i").value = data[24].i
		getEl("autoGhost24m").value = data[24].m
	}
	getEl("consumedPower").textContent = powerConsumed.toFixed(2)
	isAutoGhostsSafe = data.power >= powerConsumed
	getEl("tooMuchPowerConsumed").style.display = isAutoGhostsSafe ? "none" : ""

	getEl("agbtn_pos_yes_auto").style.display = pH.did("ghostify") ? "" : "none"
}

function toggleAutoGhost(id) {
	player.ghostify.automatorGhosts[id].on = getEl("isAutoGhostOn" + id).checked
	updateAutoGhosts()
}

function isAutoGhostActive(id) {
	if (!pH.did("ghostify")) return
	return player.ghostify.automatorGhosts[id].on
}

function changeAutoGhost(o) {
	if (o == "4m") {
		player.ghostify.automatorGhosts[4].mode = player.ghostify.automatorGhosts[4].mode == "t" ? "q" : "t"
		getEl("autoGhostMod4").textContent = "Every " + (player.ghostify.automatorGhosts[4].mode == "t" ? "second" : "Quantum")
	} else if (o == "4r") {
		player.ghostify.automatorGhosts[4].rotate = player.ghostify.automatorGhosts[4].rotate == "l" ? "r" : "l"
		getEl("autoGhostRotate4").textContent = player.ghostify.automatorGhosts[4].rotate == "l" ? "Left" : "Right"
	} else if (o == "11pw") {
		var num = parseFloat(getEl("autoGhost11pw").value)
		if (!isNaN(num) && num > 0) player.ghostify.automatorGhosts[11].pw = num
	} else if (o == "11cw") {
		var num = parseFloat(getEl("autoGhost11cw").value)
		if (!isNaN(num) && num > 0) player.ghostify.automatorGhosts[11].cw = num
	} else if (o == "13t") {
		var num = parseFloat(getEl("autoGhost13t").value)
		if (!isNaN(num) && num >= 0) player.ghostify.automatorGhosts[13].t = num
	} else if (o == "13u") {
		var num = parseFloat(getEl("autoGhost13u").value)
		if (!isNaN(num) && num > 0) player.ghostify.automatorGhosts[13].u = num
	} else if (o == "13o") {
		var num = parseInt(getEl("autoGhost13o").value)
		if (!isNaN(num) && num >= 0) player.ghostify.automatorGhosts[13].o = num
	} else if (o == "15a") {
		var num = fromValue(getEl("autoGhost15a").value)
		if (!isNaN(break_infinity_js ? num : num.l)) player.ghostify.automatorGhosts[15].a = num
	} else if (o == "17s") {
		var num = parseFloat(getEl("autoGhost24m").value)
		if (!isNaN(num) && num > 1) player.ghostify.automatorGhosts[17].s = num
	} else if (o == "22t") {
		var num = parseFloat(getEl("autoGhost22t").value)
		if (!isNaN(num) && num > 0) player.ghostify.automatorGhosts[22].time = num
	} else if (o == "24i") {
		var num = parseFloat(getEl("autoGhost24i").value)
		if (num == Math.round(num) && num > 0) player.ghostify.automatorGhosts[24].i = num
	} else if (o == "24m") {
		var num = parseFloat(getEl("autoGhost24m").value)
		if (!isNaN(num) && num > 1) player.ghostify.automatorGhosts[24].m = num
	}
}

function rotateAutoUnstable() {
	var tg=player.ghostify.automatorGhosts[3].on
	if (player.ghostify.automatorGhosts[4].rotate == "l") {
		player.ghostify.automatorGhosts[3].on = player.ghostify.automatorGhosts[1].on
		player.ghostify.automatorGhosts[1].on = player.ghostify.automatorGhosts[2].on
		player.ghostify.automatorGhosts[2].on = tg
	} else {
		player.ghostify.automatorGhosts[3].on = player.ghostify.automatorGhosts[2].on
		player.ghostify.automatorGhosts[2].on = player.ghostify.automatorGhosts[1].on
		player.ghostify.automatorGhosts[1].on = tg
	}
	for (var g = 1; g < 4; g++) getEl("isAutoGhostOn" + g).checked = player.ghostify.automatorGhosts[g].on
}

const MAX_AUTO_GHOSTS = 25

//v2.1
function startEC10() {
	if (canUnlockEC(10, 550, 181)) {
		justImported = true
		getEl("ec10unl").onclick()
		justImported = false
	}
	startEternityChallenge(10)
}

function getGHPMultCost(offset = 0) {
	let lvl = player.ghostify.multPower + offset
	let pow5 = lvl * 2 - 1
	let scaling = getGHPMultCostScalingStart()
	if (lvl > scaling) pow5 += Math.max(lvl - scaling, 0) * (lvl - scaling + 1)
	return Decimal.pow(5, pow5).times(25e8)
}

function getGHPMultCostScalingStart() {
	return 85
}

//v2.2
function showNFTab(tabName) {
	//iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
	var tabs = document.getElementsByClassName('nftab');
	var tab;
	var oldTab
	for (var i = 0; i < tabs.length; i++) {
		tab = tabs.item(i);
		if (tab.style.display == 'block') oldTab = tab.id
		if (tab.id === tabName) {
			tab.style.display = 'block';
		} else {
			tab.style.display = 'none';
		}
	}
	if (oldTab !== tabName) aarMod.tabsSave.tabNF = tabName
	closeToolTip()
}

function getGhostifiedGain() {
	let r = 1
	if (hasBosonicUpg(15)) r = nN(tmp.blu[15].gh)
	return r
}

function toggleLEConf() {
	aarMod.leNoConf = !aarMod.leNoConf
	getEl("leConfirmBtn").textContent = "Light Empowerment confirmation: O" + (aarMod.leNoConf ? "FF" : "N")
}

//v3
function moreEMsUnlocked() {
	return tmp.ngp3 && (hasDilationStudy(1) || pH.did("quantum"))
}

function getNGP3EterMilestones() {
	let r = [1e6, 1e8, 1e10, 1e12, 1e15, 1e18]
	if (tmp.bgMode) {
		r[3] = 1e10
		r[4] = 1e10
	}
	if (tmp.exMode) {
		r[2] = 1e13
		r[5] = 1e20
	}
	if (tmp.dtMode) {
		r[2] = 1e16
		r[5] = 1e25
	}
	return r
}

function convertToNGP5(setup) {
	aarMod.ngpX = 5
	tmp.ngpX = 5

	player.pl = pl.setup()
	pl.compile()

	if (setup) {
		player.ghostify.milestones = 16
		for (let x = 1; x <= 8; x++) player.achievements.push("ngpp1" + x)
		for (let y = 1; y <= 8; y++) for (let x = 1; x <= 8; x++) if (!hasAch("ng3p" + (y  * 10 + x))) player.achievements.push("ng3p" + (y  * 10 + x))
		player.achievements.push("ng3p91")
		player.achievements.push("ng3p101")
		player.achievements.push("ng3p111")
		pl.save.on = true
	} else pH.reset()
}

function doubleMSMult(x) {
	//For NG*+3
	if (tmp.ngp3_mul) {
		if (x + 0 === x) x *= 2
		else x = Decimal.times(x, 2)
	}
	return x
}