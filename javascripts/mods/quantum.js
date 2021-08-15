// v2.9
function quantum(auto, force, attrs, mode, quick) {
	if (tmp.ngp3 && qu_save.bigRip.active) force = true
	if (!(isQuantumReached()||force)||implosionCheck) return

	var data = {}
	if (mode == "qc") {
		if ((!QCs.done(1) || player.options.challConf || aarMod.quantumConf) && !quick) {
			if (!confirm("This performs a forced Quantum reset, but you will be brought into a real challenge. All rebuyables will also be resetted. Are you sure you want to take this challenge down?")) return
		}
		data.qc = [attrs.qc]
		if (QCs_tmp.show_perks) data.mod = "up"
	}
	if (mode == "pc") {
		data.pc = attrs.pc
		data.qc = PCs.convBack(PCs_save.challs[attrs.pc])
	}
	if (mode == "restart") {
		data.pc = PCs_save.in
		data.qc = QCs_save.in
		data.mod = QCs_save.mod
	}

	var headstart = aarMod.newGamePlusVersion >= 1 && !tmp.ngp3
	if (aarMod.quantumConf && !(auto || force)) if (!confirm(player.masterystudies ? "Quantum will reset everything Eternity resets, and including all Eternity Content. You will gain a quark and unlock various upgrades." + (inNGM(2) ? " WARNING! THIS EXITS NG-- MODE DUE TO BALANCING REASONS!" : ""):"WARNING! Quantum wasn't fully implemented in NG++, so if you go Quantum now, you will gain quarks, but they'll have no use. Everything up to and including Eternity features will be reset.")) return
	if (!pH.did("quantum")) if (!confirm("Are you sure you want to do this? You will lose everything you have!")) return


	var implode = !auto && !force && !pH.did("ghostify") && tmp.quUnl && !QCs.unl()
	if (implode) {
		implosionCheck = 2
		dev.implode()
		setTimeout(function(){
			quantumReset(force, auto, data, true)
			implosionCheck = 1
		}, 1000)
		setTimeout(function(){
			implosionCheck = 0
		}, 2000)
	} else quantumReset(force, auto, data)

	updateTmp()
}

function getQuantumReq(base) {
	let exp = tmp.ngp3_mul ? 1 : tmp.ngp3 ? 1.25 : 1
	if (!base && tmp.ngp3) {
		if (QCs.inAny()) return QCs.getGoalMA()
		if (enB.active("pos", 4)) exp /= enB_tmp.pos4
	}
	return Decimal.pow(Number.MAX_VALUE, exp)
}

function isQuantumReached() {
	return pH.can("quantum")
}

function getQuarkGain() {
	return quarkGain()
}

function getQKGain(){
	return quarkGain()
}

function getQCtotalTime(){
	return 1 / 0 //Rework coming soon
}

function getQCtoQKEffect(){
	var time = getQCtotalTime()
	var ret = 1 + 192 * 3600 * 10 / time
	if (ret > 999) ret = 333 * Math.log10(ret + 1)
	return ret
}

function getQuantumReqSource() {
	return tmp.ngp3 ? player.meta.bestAntimatter : player.meta.antimatter
}

function quarkGain(base) {
	if (!pH.did("quantum")) return new Decimal(1)

	let ma = getQuantumReqSource().max(1)
	let maReq = getQuantumReq()

	if (!tmp.ngp3) return Decimal.pow(10, ma.log(10) / Math.log10(Number.MAX_VALUE) - 1).floor()

	let log = Math.max(ma.div(maReq).log(2) * 5 / 8192, 0)
	let logExp = 3
	log = Math.pow(log + 1, logExp) - 1

	if (enB.active("pos", 11)) log += player.eternityPoints.max(1).log10() * enB_tmp.pos11
	if (!base) log *= getAQSGainExp(Decimal.pow(10, log))

	return Decimal.pow(10, log)
}

function quarkGainNextAt(qk) {
	if (!qk) qk = quarkGain()

	qk = Decimal.add(qk, 1).log10()
	if (enB.active("pos", 11)) qk -= player.eternityPoints.max(1).log10() * enB_tmp.pos11
	if (qk > 3 && PCs.unl()) qk = Math.pow(qk / 3, 1 / PCs_tmp.eff2) * 3

	let logExp = 3
	qk = Math.pow(qk + 1, 1 / logExp) - 1

	return Decimal.pow(2, qk * 8192 / 5).times(getQuantumReq())
}

function toggleQuantumConf() {
	aarMod.quantumConf = !aarMod.quantumConf
	getEl("quantumConfirmBtn").textContent = "Quantum confirmation: " + (aarMod.quantumConf ? "ON" : "OFF")
}

var averageQk = new Decimal(0)
var bestQk
function updateLastTenQuantums() {
	if (!player.meta) return
	var listed = 0
	var tempTime = new Decimal(0)
	var tempQK = new Decimal(0)
	for (var i = 0; i < 10; i++) {
		if (qu_save.last10[i][1].gt(0)) {
			var qkpm = qu_save.last10[i][1].dividedBy(qu_save.last10[i][0] / 600)
			var tempstring = "(" + rateFormat(qkpm, "aQs") + ")"
			var msg = "The quantum " + (i == 0 ? '1 quantum' : (i + 1) + ' quantums') + " ago took " + timeDisplayShort(qu_save.last10[i][0], false, 3)
			if (qu_save.last10[i][2]) {
				if (typeof(qu_save.last10[i][2]) == "number") " in Quantum Challenge " + qu_save.last10[i][2]
				else msg += " in Paired Challenge " + qu_save.last10[i][2][0] + " (QC" + qu_save.last10[i][2][1][0] + "+" + qu_save.last10[i][2][1][1] + ")"
			}
			msg += " and gave " + shortenDimensions(qu_save.last10[i][1]) +" aQs. "+ tempstring
			getEl("quantumrun"+(i+1)).textContent = msg
			tempTime = tempTime.plus(qu_save.last10[i][0])
			tempQK = tempQK.plus(qu_save.last10[i][1])
			bestQk = qu_save.last10[i][1].max(bestQk)
			listed++
		} else getEl("quantumrun" + (i + 1)).textContent = ""
	}
	if (listed > 1) {
		tempTime = tempTime.dividedBy(listed)
		tempQK = tempQK.dividedBy(listed)
		var qkpm = tempQK.dividedBy(tempTime / 600)
		var tempstring = "(" + rateFormat(qkpm, "aQs") + ")"
		averageQk = tempQK
		getEl("averageQuantumRun").textContent = "Average time of the last " + listed + " Quantums: "+ timeDisplayShort(tempTime, false, 3) + " | Average QK gain: " + shortenDimensions(tempQK) + " aQs. " + tempstring
	} else getEl("averageQuantumRun").textContent = ""
}

function isQuantumFirst() {
	return QCs.inAny() ? !QCs.done(QCs_tmp.in[0]) : !pH.did("quantum")
}

function doQuantumProgress() {
	var percentage = 0
	var className = "metaProgress"
	var first = isQuantumFirst()
	var name = ""

	if (!first && quarkGain().gte(256)) {
		var qkLog = quarkGain().log(2)
		var qkNext = Math.pow(2, Math.floor(Math.log2(qkLog) + 1))
		percentage = qkLog / qkNext
		name = "Percentage until " + shorten(Decimal.pow(2, qkNext)) + " aQs"
		className = "quantumProgress"
	} else if (!first && pH.can("quantum")) {
		var qkNext = Math.pow(2, Math.floor(quarkGain().log(2) + 1))
		var goal = quarkGainNextAt(qkNext)
		percentage = getQuantumReqSource().log(goal)
		name = "Percentage until " + shorten(goal) + " MA (" + shortenDimensions(qkNext) + " aQs)"
	} else {
		var goal = QCs.inAny() ? QCs.getGoalMA() : getQuantumReq()
		percentage = getQuantumReqSource().log(goal)
		name = "Percentage until Quantum" + (QCs.inAny() ? " Challenge completion" : "") + " (MA)"
	}
	getEl("progresspercent").setAttribute('ach-tooltip', name)

	//Set percentage
	percentage = Math.min(percentage * 100, 100).toFixed(2) + "%"
	if (getEl("progressbar").className != className) getEl("progressbar").className = className
	getEl("progressbar").style.width = percentage
	getEl("progresspercent").textContent = percentage
}

//v2.90142
function quantumReset(force, auto, data, mode, implode = false) {
	var headstart = aarMod.newGamePlusVersion > 0 && !tmp.ngp3
	if (implode && qMs.tmp.amt < 1) {
		showTab("dimensions")
		showDimTab("antimatterdimensions")
		showChallengesTab("normalchallenges")
		showInfTab("preinf")
		showEternityTab("timestudies", true)
	}
	if (!pH.did("quantum")) {
		exitNGMM()
		giveAchievement("Sub-atomic")
		pH.onPrestige("quantum")
		pH.updateDisplay()
		if (tmp.ngp3) {
			getEl("bestAntimatterType").textContent = "Your best meta-antimatter for this quantum"
			getEl("quarksAnimBtn").style.display = "inline-block"

			updateUnlockedMasteryStudies()
			updateSpentableMasteryStudies()
		}
	}
	if (isEmptiness) {
		showTab("dimensions")
		isEmptiness = false
		pH.updateDisplay()
	}
	getEl("quantumbtn").style.display = "none"
	getEl("bigripbtn").style.display = "none"
	getEl("ghostifybtn").style.display = "none"

	// check if forced quantum
	// otherwise, give rewards
	if (!force) {
		for (var i = qu_save.last10.length - 1; i > 0; i--) {
			qu_save.last10[i] = qu_save.last10[i - 1]
		}
		var qkGain = quarkGain()
		var array = [qu_save.time, qkGain]
		qu_save.last10[0] = array
		if (qu_save.best > qu_save.time) qu_save.best = qu_save.time
		qu_save.times++

		gainQKOnQuantum(qkGain)

		if (player.dilation.rebuyables[1] + player.dilation.rebuyables[2] + player.dilation.rebuyables[3] + player.dilation.rebuyables[4] < 1 && player.dilation.upgrades.length < 1) giveAchievement("Never make paradoxes!")
		if (qu_save.times >= 1e4) giveAchievement("Prestige No-lifer")

		if (hasAch("ng3p73")) player.infinitiedBank = nA(player.infinitiedBank, gainBankedInf())
	} //bounds the else statement to if (force)
	var oheHeadstart = tmp.ngp3
	var keepABnICs = oheHeadstart || hasAch("ng3p51")
	var oldTime = qu_save.time
	qu_save.time = 0
	updateQuarkDisplay()

	if (player.tickspeedBoosts !== undefined) player.tickspeedBoosts = 0
	if (hasAch("r104")) player.infinityPoints = new Decimal(2e25);
	else player.infinityPoints = new Decimal(0);

	// ng-2 display
	getEl("galaxyPoints2").innerHTML = "You have <span class='GPAmount'>0</span> Galaxy points."

	// ng+3
	if (tmp.ngp3) {
		qMs.update()
		qu_save.quarkEnergy = 0
	} else qu_save.gluons = 0;

	// Positrons
	if (pos.unl()) {
		pos_save.swaps = {...pos_tmp.next_swaps}
		pos.updateCloud()
	}

	// Quantum Challenges
	if (QCs.unl()) {
		var isQC = data.qc !== undefined
		var qcDataPrev = QCs_save.in
		var qcData = PCs.sort(data.qc)

		if (!force) {
			if (QCs_save.mod) {
				var qc = QCs_save.mod + qcDataPrev[0]
				if (!QCs_save.mod_comps.includes(qc)) {
					PCs_save.shrunkers.unspent += QCs.modData[QCs_save.mod].shrunker
					QCs_save.mod_comps.push(qc)
				}
			} else if (qcDataPrev.length == 1) {
				var qc = qcDataPrev[0]
				QCs_save.comps = Math.max(QCs_save.comps, qc)
				QCs_save.best[qc] = Math.max(QCs_save.best[qc] || 1/0, qu_save.best)
			} else if (qcDataPrev.length == 2) {
				var pc = PCs.conv(qcDataPrev)
				if (!PCs_save.comps.includes(pc)) PCs_save.comps.push(pc)
			}
		}

		delete QCs_save.mod
		if (data.mod) QCs_save.mod = data.mod

		if (isQC) {
			QCs_save.in = qcData
			QCs_tmp.in = qcData

			if ((!QCs.isntCatched() || QCs.in(7)) && !QCs_save.kept) QCs_save.kept = {
				tt: player.timestudy.theorem,
				ms: [...player.masterystudies]
			}
		} else if (force || !player.options.retryChallenge) {
			QCs_save.in = []
			QCs_tmp.in = []

			if (QCs_save.kept) {
				player.timestudy.theorem = QCs_save.kept.tt
				player.masterystudies = QCs_save.kept.ms
				delete QCs_save.kept
			}
		}

		QCs.reset()
		QCs.updateTmp()
		QCs.updateDisp()
	}

	//Paired Challenges
	if (PCs.unl()) {
		if (PCs_save.in) {
			if (PCs_save.in != data.pc && !PCs.posDone(PCs_save.in)) {
				delete PCs_save.challs[PCs_save.in]
				PCs.updateUsed()
			}
			PCs.updateButton(PCs_save.in, true)
		}
		delete PCs_save.in

		if (data.pc) {
			PCs_save.in = data.pc
			PCs.updateButton(data.pc)
		}

		PCs.updateTmp()
		PCs.updateDisp()
	}

	doQuantumResetStuff(5, false, isQC, QCs_save.in)

	player.challenges = challengesCompletedOnEternity()
	if (getEternitied() < 50) {
		getEl("replicantidiv").style.display = "none"
		getEl("replicantiunlock").style.display = "inline-block"
	} else if (getEl("replicantidiv").style.display === "none" && getEternitied() >= 50) {
		getEl("replicantidiv").style.display = "inline-block"
		getEl("replicantiunlock").style.display = "none"
	}
	player.dilation.totalTachyonParticles = player.dilation.tachyonParticles

	if (tmp.ngp3) {
		if (!force) {
			if (pH.did("ghostify")) player.ghostify.neutrinos.generationGain = player.ghostify.neutrinos.generationGain % 3 + 1
			if (isAutoGhostActive(4) && player.ghostify.automatorGhosts[4].mode != "t") rotateAutoUnstable()
		} //bounds if (!force)

		pH.updateActive()

		if (!isQC && player.ghostify.milestones < 6) qu_save.replicants.amount = new Decimal(0)
		replicantsResetOnQuantum(isQC)
		nanofieldResetOnQuantum()
		player.eternityBuyer.tpUpgraded = false
		player.eternityBuyer.slowStopped = false
		qu_save.notrelative = true
	} // bounds if tmp.ngp3
	if (qMs.tmp.amt < 1) {
		getEl("infmultbuyer").textContent = "Autobuy IP mult: OFF"
		getEl("togglecrunchmode").textContent = "Auto crunch mode: amount"
		getEl("limittext").textContent = "Amount of IP to wait until reset:"
	}
	if (!oheHeadstart) {
		player.autobuyers[9].bulk = Math.ceil(player.autobuyers[9].bulk)
		getEl("bulkDimboost").value = player.autobuyers[9].bulk
	}

	// last few updates
	setInitialResetPower()
	resetUP()
	player.replicanti.galaxies = 0
	updateRespecButtons()
	if (hasAch("r36")) player.tickspeed = player.tickspeed.times(0.98);
	if (hasAch("r45")) player.tickspeed = player.tickspeed.times(0.98);
	if (player.infinitied >= 1 && !player.challenges.includes("challenge1")) player.challenges.push("challenge1");
	updateAutobuyers()
	if (hasAch("r85")) player.infMult = player.infMult.times(4);
	if (hasAch("r93")) player.infMult = player.infMult.times(4);
	if (hasAch("r104")) player.infinityPoints = new Decimal(2e25);
	resetInfDimensions();
	updateChallenges();
	updateNCVisuals()
	updateChallengeTimes()
	updateLastTenRuns()
	updateLastTenEternities()
	updateLastTenQuantums()
	if (!hasAch("r133")) {
		var infchalls = Array.from(document.getElementsByClassName('infchallengediv'))
		for (var i = 0; i < infchalls.length; i++) infchalls[i].style.display = "none"
	}
	GPminpeak = new Decimal(0)
	IPminpeak = new Decimal(0)
	EPminpeakType = 'normal'
	EPminpeak = new Decimal(0)
	QKminpeak = new Decimal(0)
	QKminpeakValue = new Decimal(0)
	updateAutobuyers()
	updateMilestones()
	resetTimeDimensions()
	if (oheHeadstart) {
		getEl("replicantiresettoggle").style.display = "inline-block"
		skipResets()
	} else {
		hideDimensions()
		if (tmp.ngp3) getEl("infmultbuyer").textContent="Max buy IP mult"
		else getEl("infmultbuyer").style.display = "none"
		hideMaxIDButton()
		getEl("replicantidiv").style.display="none"
		getEl("replicantiunlock").style.display="inline-block"
		getEl("replicantiresettoggle").style.display = "none"
		delete player.replicanti.galaxybuyer
	}
	var shortenedIP = shortenDimensions(player.infinityPoints)
	getEl("infinityPoints1").innerHTML = "You have <span class=\"IPAmount1\">" + shortenedIP + "</span> Infinity points."
	getEl("infinityPoints2").innerHTML = "You have <span class=\"IPAmount2\">" + shortenedIP + "</span> Infinity points."
	updateEternityUpgrades()
	getEl("totaltickgained").textContent = "You've gained "+player.totalTickGained.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" tickspeed upgrades."
	hideDimensions()
	tmp.tickUpdate = true
	getEl("eternityPoints2").innerHTML = "You have <span class=\"EPAmount2\">"+shortenDimensions(player.eternityPoints)+"</span> Eternity point"+((player.eternityPoints.eq(1)) ? "." : "s.")
	updateTheoremButtons()
	updateTimeStudyButtons()
	updateDilationUpgradeCosts()
	drawStudyTree()
	handleDispOnQuantum(false)

	Marathon2 = 0;
	setInitialMoney()
	getEl("quantumConfirmBtn").style.display = "inline-block"
}

function handleDispOnQuantum(bigRip, prestige) {
	handleDispOutOfQuantum()
	handleQuantumDisplays(prestige)

	if (!tmp.ngp3) return

	let keepECs = qMs.tmp.amt >= 2
	if (!keepECs && getEl("eternitychallenges").style.display == "block") showChallengesTab('normalchallenges')

	let keepDil = player.dilation.studies.includes(1)
	if (!keepDil && getEl("dilation").style.display == "block") showEternityTab("timestudies", getEl("eternitystore").style.display=="block")

	let keepMDs = keepDil && qMs.tmp.amt >= 6
	if (!keepMDs && getEl("metadimensions").style.display == "block") showDimTab("antimatterdimensions")

	let keepMSs = mTs.unl()
	getEl("masterystudyunlock").style.display = keepMSs ? "" : "none"
	getEl("respecMastery").style.display = keepMSs ? "block" : "none"
	getEl("respecMastery2").style.display = keepMSs ? "block" : "none"
	if (keepMSs) drawMasteryTree()
	else {
		performedTS = false
		if (getEl("masterystudies").style.display == "block") showEternityTab("timestudies", getEl("eternitystore").style.display != "block")
	}

	enB.updateUnlock()

	let keepQuantum = tmp.quActive && qMs.tmp.amt >= 16
	if (tmp.quActive && !bigRip) {
		let keepPos = keepQuantum && player.masterystudies.includes("d7")
		let keepAnts = keepQuantum && player.masterystudies.includes("d10")
		let keepNf = keepQuantum && player.masterystudies.includes("d11")
		let keepToD = keepQuantum && player.masterystudies.includes("d12")

		getEl("positronstabbtn").style.display = keepPos ? "" : "none"
		getEl("replicantstabbtn").style.display = keepAnts ? "" : "none"
		getEl("nanofieldtabbtn").style.display = keepNf ? "" : "none"
		getEl("todtabbtn").style.display = keepToD ? "" : "none"
	
		if (!keepPos && getEl("positrons").style.display == "block") showQuantumTab("uquarks")
		if (!keepAnts && getEl("replicants").style.display == "block") showQuantumTab("uquarks")
		if (!keepNf && getEl("nanofield").style.display == "block") showQuantumTab("uquarks")
		if (!keepToD && getEl("tod").style.display == "block") showQuantumTab("uquarks")
	}
}

function handleDispOutOfQuantum(bigRip) {
	let keepQuantum = pH.shown("quantum")
	let keepQCs = keepQuantum && QCs.unl()
	let keepPCs = keepQuantum && PCs.unl()
	let keepEDs = keepQuantum && player.masterystudies.includes("d11")
	let keepBE = false

	if (!keepQCs && getEl("quantumchallenges").style.display == "block") showChallengesTab("normalchallenges")
	if (!keepPCs && getEl("pairedChalls").style.display == "block") showChallengesTab("normalchallenges")
	if (!keepEDs && getEl("emperordimensions").style.display == "block") showDimTab("antimatterdimensions")
	if (!keepBE && getEl("breakEternity").style.display == "block") showEternityTab("timestudies", getEl("eternitystore").style.display != "block")

	getEl("qctabbtn").parentElement.style.display = keepQCs ? "" : "none"
	getEl("pctabbtn").parentElement.style.display = keepPCs ? "" : "none"
	getEl("edtabbtn").style.display = keepEDs ? "" : "none"
	getEl("breakEternityTabbtn").style.display = keepBE? "" : "none"
}

function handleQuantumDisplays(prestige) {
	qMs.updateDisplay()
	if (!tmp.ngp3) return

	updateLastTenQuantums()
	updateAutoQuantumMode()

	updateColorCharge()
	updateAssortPercentage()
	updateQuarksTabOnUpdate()
	updateGluonsTabOnUpdate()

	QCs.updateDisp()
	QCs.updateBest()

	updateReplicants(prestige ? "prestige" : "")

	updateTODStuff()

	updateBreakEternity()
}

function updateQuarkDisplay() {
	let msg = ""
	if (pH.did("quantum")) {
		msg += "You have <b class='QKAmount'>"+shortenDimensions(qu_save.quarks)+"</b> "	
		if (tmp.ngp3&&player.masterystudies.includes("d14")) msg += " aQs and <b class='SSAmount'>" + shortenDimensions(qu_save.bigRip.spaceShards) + "</b> Space Shard" + (qu_save.bigRip.spaceShards.round().eq(1) ? "" : "s")
		else msg += "anti-quark" + (qu_save.quarks.round().eq(1) ? "" : "s")
		msg += "."
	}
	getEl("quarks").innerHTML=msg
}

function metaReset2() {
	if (tmp.ngp3 && qu_save.bigRip.active) ghostify()
	else quantum()
}
