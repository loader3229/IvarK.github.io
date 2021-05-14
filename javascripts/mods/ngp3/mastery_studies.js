var masteryStudies = {
	initCosts: {
		time: {
			//Eternity
			241: 1e68, 251: 2e70, 252: 2e70, 253: 2e70, 261: 1e70, 262: 1e70, 263: 1e70, 264: 1e70, 265: 1e70, 266: 1e70,

			//Quantum
			271: 3.90625e71,
			281: 2e74, 282: 2e73, 283: 2e73, 284: 2e74,
			291: 1/0, 292: 1/0, 293: 1/0, 294: 1/0, 295: 1/0,
			301: 1/0, 302: 1/0, 303: 1/0, 304: 1/0,
		},
		ec: {13: 1e71, 14: 1e71},
		dil: {7: 1e74, 8: 2e83, 9: 1e85, 10: 1e87, 11: 1e90, 12: 1e92, 13: 1e95, 14: 1e97}
	},
	costs: {
		time: {},
		time_mults: {
			//Eternity
			241: 1, 251: 2, 252: 2, 253: 2, 261: 2, 262: 2, 263: 2, 264: 2, 265: 2, 266: 2,

			//Quantum
			271: 1 / 128,
			281: 2, 282: 2, 283: 2, 284: 2,
			291: 4, 292: 1 / 2, 293: 1 / 2, 294: 1 / 2, 295: 4,
			301: 1 / 0, 302: 1, 303: 1, 304: 1 / 0},
		ec: {},
		dil: {}
	},
	costMult: 1,
	ecReqs: {
		13() {
			let comps = ECComps("eterc13")
			return 95e4 + 5e4 * Math.pow(comps, 2)
		},
		14() {
			let comps = ECComps("eterc14")
			return Decimal.pow(10, 275000 * Math.pow(2, comps))
		}
	},
	ecReqsStored: {},
	ecReqDisplays: {
		13() {
			return getFullExpansion(masteryStudies.ecReqsStored[13]) + " Dimension Boosts"
		},
		14() {
			return shortenCosts(masteryStudies.ecReqsStored[14]) + " replicantis"
		}
	},
	unlockReqConditions: {
		241() {
			return player.dilation.dilatedTime.gte(1e100)
		},
		272() {
			return masteryStudies.bought >= 10
		},
		d7() {
			return tmp.qu.quarkEnergy >= 2.75
		},
		d8() {
			return false
		},
		d9() {
			return QCIntensity(8) >= 1
		},
		d10() {
			return tmp.qu.pairedChallenges.completed == 4
		},
		d11() {
			return tmp.eds[1].perm >= 10
		},
		d12() {
			return tmp.eds[8].perm >= 10
		},
		d13() {
			return tmp.qu.nanofield.rewards >= 16
		},
		d14() {
			return hasAch("ng3p34")
		}
	},
	unlockReqDisplays: {
		241() {
			return shorten(1e100) + " dilated time"
		},
		272() {
			return "10 bought mastery studies"
		},
		d7() {
			return "2.75 quantum energy"
		},
		d8() {
			return "SOON IN BETA V0.4"
		},
		d9() {
			return "Complete Quantum Challenge 8"
		},
		d10() {
			return "Complete Paired Challenge 4"
		},
		d11() {
			return getFullExpansion(10) + " worker replicants"
		},
		d12() {
			return getFullExpansion(10) + " Eighth Emperor Dimensions"
		},
		d13() {
			return getFullExpansion(16) + " Nanofield rewards"
		},
		d14() {
			return "Get 'The Challenging Day' achievement"
		}
	},
	types: {t: "time", ec: "ec", d: "dil"},
	studies: [],
	unl() {
		return (tmp.ngp3 && tmp.eterUnl && player.dilation.upgrades.includes("ngpp6")) || tmp.quUnl
	},
	has(x) {
		return this.unl() && (player.masterystudies.includes("t" + x) || (player.masterystudies.includes(x) && x[0] == "d"))
	},
	timeStudies: [],
	timeStudyEffects: {
		251() {
			if (hasNU(6)) return 0
			let x = player.meta.resets
			return x * (13 / (Math.abs(x / 50) + 1) + 2)
		},
		252() {
			if (hasNU(6)) return 0
			return Math.floor(player.dilation.freeGalaxies / 9)
		},
		253() {
			if (hasNU(6)) return 0
			return Math.floor(getTotalRGs() / 7) * 2
		},

		271() {
			let log = tmp.rm.log10()
			let dLog = Math.max(Math.log10(log), 0)
			let str = Math.max(dLog / 4, 1)

			return Decimal.pow(2 + 8 / str, Math.pow(log, 2 - 1 / str))
		},
		281() {
			let x = player.dilation.dilatedTime.add(1).log10()
			return x / Math.pow(Math.log10(x + 1) + 1, 2) * 4
		},
		284() {
			return (player.galaxies + getTotalRGs() + player.dilation.freeGalaxies) / 10
		},
		292() {
			let exp = 5 / 3
			return Math.pow((tmp.rmPseudo || player.replicanti.amount).log10() / 8e4, exp) * 2e3
		},
		295() {
			let rg = getFullEffRGs()
			return Math.log10(rg / 100 + 1) / 2 + 1
		},
		303(x) {
			if (!x) x = getInfinitied()
			return Decimal.add(x, 1).log10() / 5 + 1
		},

		322() {
			let log = Math.sqrt(Math.max(3 - getTickspeed().log10(), 0)) / 2e4
			if (log > 110) log = Math.sqrt(log * 27.5) + 55
			if (log > 1e3 && tmp.mod.ngudpV !== undefined) log = Math.pow(7 + Math.log10(log), 3)
			if (tmp.mod.newGameExpVersion) log += Math.pow(Math.log10(log + 10), 4) - 1

			log = softcap(log, "ms322_log")
			//these are also required very much--more DT is more tickspeed is more DT
			return Decimal.pow(10, log)
		},
		332() {
			return Math.max(player.galaxies, 1)
		},
		341() {
			if (!tmp.quActive) return new Decimal(1)
			var exp = Math.sqrt(tmp.qu.replicants.quarks.add(1).log10())
			if (exp > 150) exp = 150 * Math.pow(exp / 150, .5)
			if (exp > 200) exp = 200 * Math.pow(exp / 200, .5)
			return Decimal.pow(tmp.newNGP3E ? 3 : 2, exp)
		},
		344() {
			if (!tmp.quActive) return 1
			var ret = Math.pow(tmp.qu.replicants.quarks.div(1e7).add(1).log10(), tmp.newNGP3E ? 0.3 : 0.25) * 0.17 + 1
			if (ret > 3) ret = 1 + Math.log2(ret + 1)
			if (ret > 4) ret = 3 + Math.log10(ret + 6)
			return ret
		},
		351() { //maybe use softcap.js
			let log = player.timeShards.max(1).log10()*14e-7
			if (log > 1e4) log = Math.pow(log / 1e4, 0.75) * 1e4
			if (log > 2e4) log = 2 * Math.pow(Math.log10(5 * log) + 5 ,4)
			return Decimal.pow(tmp.newNGP3E ? 12 : 10, log)
		},
		361() {
			return player.dilation.tachyonParticles.max(1).pow(0.01824033924212366)
		},
		371() {
			return Math.pow(tmp.extraRG + 1, tmp.mod.newGameExpVersion ? .5 : .3)
		},
		372() {
			return Math.sqrt(player.timeShards.add(1).log10())/20+1
		},
		373() {
			return Math.pow(player.galaxies + 1, 0.55)
		},
		381() {
			return Decimal.min(tmp.tsReduce, 1).log10() / -135 + 1
		},
		382() {
			return player.eightAmount.max(1).pow(Math.PI)
		},
		383() {
			if (!tmp.quActive) return new Decimal(1)
			var blueExp = 4/21
			if (tmp.newNGP3E) blueExp = 1/5
			var bluePortion = Math.pow(getCPLog("b"), blueExp)

			var MAportion = Math.sqrt(player.meta.antimatter.add(10).log10())
			var exp = MAportion * bluePortion * Math.log10(2)

			if (exp > 1000) exp = Math.pow(exp / 1000, .6) * 1000
			if (exp > 2000) exp = Math.pow(exp / 2000, .4) * 2000

			return Decimal.pow(10, exp)
		},
		391() {
			return player.meta.antimatter.max(1).pow(8e-4)
		},
		392() {
			if (!tmp.quActive) return new Decimal(1)
			return Decimal.pow(tmp.newNGP3E ? 1.7 : 1.6, Math.sqrt(tmp.qu.replicants.quarks.add(1).log10())).plus(1)
		},
		393() {
			if (!tmp.twr || !tmp.quActive) return new Decimal(1)
			return Decimal.pow(4e5, Math.sqrt(tmp.twr.add(1).log10()))
		},
		401() {
			if (!tmp.quActive) return new Decimal(1)
			let log = tmp.qu.replicants.quarks.div(1e28).add(1).log10()*0.2
			if (log > 5) log = Math.log10(log * 2) * 5
			return Decimal.pow(tmp.newNGP3E ? 12 : 10, log)
		},
		411() {
			if (!tmp.tra || !tmp.quActive) return new Decimal(1)
			var exp = tmp.tra.div(1e24).add(1).pow(0.2).log10()
			if (tmp.newNGP3E) exp += Math.pow((exp + 9) * 3, .2) * Math.log10(exp + 1)
			return Decimal.pow(10, exp)
		},
		421() {
			let ret = Math.pow(Math.max(-getTickspeed().log10() / 1e13 - 0.75, 1), 4)
			if (ret > 100) ret = Math.sqrt(ret * 100)
			return ret
		},
		431() {
			var gals = player.dilation.freeGalaxies + tmp.eg431
			if (gals >= 1e6) gals = Math.pow(gals * 1e3, 2/3)

			var effectBase = Math.max(gals / 1e4, 1)
			if (effectBase > 10 && tmp.newNGP3E) effectBase *= Math.log10(effectBase)

			var effectExp = Math.max(gals / 1e4 + Math.log10(gals) / 2, 1)
			if (effectExp > 10 && tmp.newNGP3E) effectExp *= Math.log10(effectExp)

			var eff = Decimal.pow(effectBase, effectExp)
			if (tmp.newNGP3E) eff = eff.times(eff.plus(9).log10())

			return eff
		}
	},
	timeStudyDescs: {
		241: "The IP mult multiplies IP gain by 2.1x per upgrade.",
		251: "Remote galaxy scaling starts later based on Meta-Dimension Boosts.",
		252: "Remote galaxy scaling starts 1 galaxy later per 9 Tachyonic Galaxies.",
		253: "Remote galaxy scaling starts 2 galaxies later per 7 total Replicated Galaxies.",
		261: "Dimension Boost cost scales by 0.5 less.",
		262: "The power of meta-antimatter effect is increased by ^0.5.",
		263: "Tachyonic Galaxies are 25% stronger.",
		264: "You gain 5x more Tachyon Particles.",
		265: "Replicate chance upgrades can go over 100%.",
		266: "Reduce the post-400 max replicated galaxy cost scaling.",

		271: "Replicantis boost Infinity Dimensions at a greatly stronger rate.",

		281: "Before boosts, dilated time adds the OoMs of replicate interval scaling.",
		282: "You can buy sub-1ms interval upgrades, but the cost starts to scale faster.",
		283: "Replicate chance increases higher above 100%.",
		284: "After boosts, total galaxies increase the OoMs of replicate interval scaling.",

		291: "All Replicated Galaxies work evenly.",
		292: "Replicantis generate free Dimension Boosts.",
		293: "Some boosts from Replicantis are stronger.",
		294: "All Replicanti boosts are based on Replicanti multiplier.",
		295: "Replicated Galaxies give a greatly strong boost to Replicanti multiplier.",

		301: "Replicated Galaxies boost the effect of inactive mastered Positronic Boosts.",
		302: "Reduce the gluon effect nerfs by ^0.9.",
		303: "Infinitied stat boosts itself to give stronger boosts.",
		304: "Replicantis boost the effect of inactive mastered Positronic Boosts.",
	},
	hasStudyEffect: [251, 252, 253, 271, 281, 284, 292, 295, 303, 322, 332, 341, 344, 351, 361, 371, 372, 373, 381, 382, 383, 391, 392, 393, 401, 411, 421, 431],
	studyEffectDisplays: {
		251(x) {
			return "+" + getFullExpansion(Math.floor(x))
		},
		252(x) {
			return "+" + getFullExpansion(Math.floor(x))
		},
		253(x) {
			return "+" + getFullExpansion(Math.floor(x))
		},
		281(x) {
			return "+" + shorten(x * getReplSpeedExpMult(true)) + " OoMs"
		},
		284(x) {
			return "+" + shorten(x) + " OoMs"
		},
		292(x) {
			return "+" + getFullExpansion(Math.floor(x))
		},
		295(x) {
			return "^" + x.toFixed(3)
		},
		303(x) {
			return "^" + shorten(x)
		},
	},
	ecsUpTo: 14,
	unlocksUpTo: 14,
	allConnections: {
		//Eternity
		241: [251, 253, 252],
		251: [261, 262], 252: [263, 264], 253: [265, 266],
		261: ["ec13"], 262: ["ec13"], 263: ["ec13"], 264: ["ec14"], 265: ["ec14"], 266: ["ec14"],

		//Quantum
		ec13: ["d7"], ec14: ["d7"], d7: [271],
		271: [281, 282, 283, 284],
		281: [291, 293], 282: [293], 283: [293], 284: [293, 295],
		291: [301], 293: [292, 294, 302, 303], 295: [304],

		//No more mastery studies after that
		302: ["d8"], 303: ["d8"],
		d8: ["d9"], d9: ["d10"], d10: ["d11"], d11: ["d12"], d12: ["d13"], d13: ["d14"]},
	allUnlocks: {
		d7() {
			return true //ph.did("quantum")
		}
	},
	unlocked: [],
	spentable: [],
	latestBoughtRow: 0,
	ttSpent: 0,
	respec(quick) {
		var respecedMS = []
		player.timestudy.theorem += masteryStudies.ttSpent
		for (var id = 0; id < player.masterystudies.length; id++) {
			var d = player.masterystudies[id].split("d")[1]
			if (d) respecedMS.push(player.masterystudies[id])
		}
		player.masterystudies = respecedMS

		if (player.respecMastery) respecMasteryToggle()
		if (player.eternityChallUnlocked >= 13) resetEternityChallUnlocks()
		respecUnbuyableTimeStudies()
		updateMasteryStudyCosts()

		if (quick) return
		maybeShowFillAll()
		updateMasteryStudyButtons()
		drawMasteryTree()
	}
}

function enterMasteryPortal() {
	if (masteryStudies.unl()) {
		recordUpDown(1)
		showEternityTab("masterystudies")
	}
}

function exitMasteryPortal() {
	recordUpDown(2)
	showEternityTab("timestudies")
}

function convertMasteryStudyIdToDisplay(x) {
	x = x.toString()
	var ec = x.split("ec")[1]
	var dil = x.split("d")[1]
	return ec ? "ec" + ec + "unl" : dil ? "dilstudy" + dil : "timestudy" + x
}

function updateMasteryStudyCosts() {
	var oldBought = masteryStudies.bought
	masteryStudies.latestBoughtRow = 0
	masteryStudies.costMult = hasAch("ng3p12") ? 0.25 : 1
	masteryStudies.bought = 0
	masteryStudies.ttSpent = 0
	for (id = 0; id<player.masterystudies.length; id++) {
		var t = player.masterystudies[id].split("t")[1]
		if (t) {
			setMasteryStudyCost(t, "t")
			masteryStudies.ttSpent += masteryStudies.costs.time[t] < 1/0 ? masteryStudies.costs.time[t] : 0
			masteryStudies.costMult *= getMasteryStudyCostMult(t)
			masteryStudies.latestBoughtRow = Math.max(masteryStudies.latestBoughtRow,Math.floor(t/10))
			masteryStudies.bought++
		}
	}
	for (id = 0; id < masteryStudies.timeStudies.length; id++) {
		var name = masteryStudies.timeStudies[id]
		if (!masteryStudies.unlocked.includes(name)) break
		if (!player.masterystudies.includes("t"+name)) setMasteryStudyCost(name,"t")
	}
	for (id = 13; id <= masteryStudies.ecsUpTo; id++) {
		if (!masteryStudies.unlocked.includes("ec" + id)) break
		setMasteryStudyCost(id, "ec")
		masteryStudies.ecReqsStored[id] = masteryStudies.ecReqs[id]()
	}
	for (id = 7; id <= masteryStudies.unlocksUpTo; id++) {
		if (!masteryStudies.unlocked.includes("d" + id)) break
		setMasteryStudyCost(id, "d")
	}
	if (oldBought != masteryStudies.bought) updateSpentableMasteryStudies()
	updateMasteryStudyTextDisplay()
}

function setupMasteryStudies() {
	masteryStudies.studies = [241]
	masteryStudies.timeStudies = []
	var map = masteryStudies.studies
	var part
	var pos = 0
	while (true) {
		var id = map[pos]
		if (!id) {
			if (!part) break
			map.push(part)
			id = part
			part = ""
		}
		if (typeof(id) == "number") masteryStudies.timeStudies.push(id)
		var paths = getMasteryStudyConnections(id)
		if (paths !== undefined) for (var x = 0; x < paths.length; x++) {
			var y = paths[x]
			if (!map.includes(y)) {
				if (y.toString()[0] == "d") part = y
				else map.push(y)
			}
		}
		pos++
	}
}

function setupMasteryStudiesHTML() {
	setupMasteryStudies()
	for (id = 0; id < masteryStudies.timeStudies.length; id++) {
		var name = masteryStudies.timeStudies[id]
		var html = "<span id='ts" + name + "Desc'></span>"
		if (masteryStudies.hasStudyEffect.includes(name)) html += "<br>Currently: <span id='ts" + name + "Current'></span>"
		html += "<br>Cost: <span id='ts" + name + "Cost'></span> Time Theorems"
		html += "<span id='ts" + name + "Req'></span>"
		getEl("timestudy" + name).innerHTML = html
	}
}

function getMasteryStudyConnections(id) {
	return masteryStudies.allConnections[id]
}

function updateUnlockedMasteryStudies() {
	var unl = true
	var rowNum = 0
	masteryStudies.unlocked = []
	for (var x = 0; x < masteryStudies.studies.length; x++) {
		var id = masteryStudies.studies[x]
		var divid = convertMasteryStudyIdToDisplay(id)
		if (Math.floor(id / 10) > rowNum) {
			rowNum = Math.floor(id / 10)
			if (masteryStudies.allUnlocks["r"+rowNum] && !masteryStudies.allUnlocks["r"+rowNum]()) unl = false
			getEl(divid).parentElement.parentElement.parentElement.parentElement.style = unl ? "" : "display: none !important"
			if (unl) masteryStudies.unlocked.push("r"+rowNum)
		} else if (divid[0] == "d") getEl(divid).parentElement.parentElement.parentElement.parentElement.style = unl ? "" : "display: none !important"
		if (masteryStudies.allUnlocks[id]&&!masteryStudies.allUnlocks[id]()) unl = false
		getEl(divid).style.visibility = unl ? "" : "hidden"
		if (unl) masteryStudies.unlocked.push(id)
	}
}

function updateSpentableMasteryStudies() {
	masteryStudies.spentable = []
	addSpentableMasteryStudies(241)
}

function addSpentableMasteryStudies(x) {
	var map = [x]
	var part
	var pos = 0
	while (true) {
		var id = map[pos]
		if (!id) break
		var isNum=typeof(id) == "number"
		var ecId = !isNum&&id.split("ec")[1]
		var canAdd = false
		if (ecId) canAdd = ECComps("eterc"+ecId)
		else canAdd = player.masterystudies.includes(isNum?"t"+id:id)
		if (masteryStudies.unlocked.includes(id) && !masteryStudies.spentable.includes(id)) masteryStudies.spentable.push(id)
		if (canAdd) {
			var paths = getMasteryStudyConnections(id)
			if (paths) for (var x=0;x<paths.length;x++) map.push(paths[x])
		}
		pos++
	}
}

function setMasteryStudyCost(id,type) {
	let d = masteryStudies.initCosts
	let type2 = masteryStudies.types[type]
	masteryStudies.costs[type2][id] = (d[type2][id] || 0) * (type == "d" ? 1 : masteryStudies.costMult)
}

function getMasteryStudyCostMult(id) {
	return masteryStudies.costs.time_mults[id] || 1
}

function buyingD7Changes() {
	showTab("quantumtab")
	showQuantumTab("positrons")
	getEl("positronstabbtn").style.display = ""

	enB.update("pos")
}

function buyingDilStudyForQC() {
	teleportToQCs()
	updateQuantumChallenges()
}

function buyingDilStudyReplicant() {
	showTab("quantumtab")
	showQuantumTab("replicants")
	updateReplicants()
}

function buyingDilStudyED() {
	showTab("dimensions")
	showDimTab("emperordimensions")
	getEl("edtabbtn").style.display = ""
	updateReplicants()
}

function buyingDilStudyNanofield() {
	showTab("quantumtab")
	showQuantumTab("nanofield")
	getEl("nanofieldtabbtn").style.display = ""
	updateNanoRewardTemp()
}

function buyingDilStudyToD() {
	showTab("quantumtab")
	showQuantumTab("tod")
	updateColorCharge()
	updateTODStuff()
}

function buyingDilationStudy(id){
	if (id == 7) buyingD7Changes()
	if (id == 8 || id == 9 || id == 14) buyingDilStudyForQC()
	if (id == 9) updateGluonsTabOnUpdate()
	if (id == 10) buyingDilStudyReplicant()
	if (id == 11) buyingDilStudyED()
	if (id == 12) buyingDilStudyNanofield()
	if (id == 13) buyingDilStudyToD()
}

function buyMasteryStudy(type, id, quick=false) {
	if (quick) setMasteryStudyCost(id,type)
	if (!canBuyMasteryStudy(type, id)) return
	player.timestudy.theorem -= masteryStudies.costs[masteryStudies.types[type]][id]
	if (type == 'ec') {
		player.eternityChallUnlocked = id
		player.etercreq = id
		updateEternityChallenges()
		delete tmp.qu.autoECN
	} else player.masterystudies.push(type + id)
	if (type == "t") {
		addSpentableMasteryStudies(id)
		if (quick) {
			masteryStudies.costMult *= getMasteryStudyCostMult(id)
			masteryStudies.latestBoughtRow = Math.max(masteryStudies.latestBoughtRow, Math.floor(id / 10))
		}
		if (id == 241) bumpInfMult()
		if (id == 266 && player.replicanti.gal >= 400) {
			var gal = player.replicanti.gal
			player.replicanti.gal = 0
			player.replicanti.galCost = new Decimal(inNGM(2) ? 1e110 : 1e170)
			player.replicanti.galCost = getRGCost(gal)
			player.replicanti.gal = gal
		}
	}
	if (type=="d") buyingDilationStudy(id)
	if (!quick) {
		if (type == "t") masteryStudies.bought++
		else if (type == "ec") {
			showTab("challenges")
			showChallengesTab("eternitychallenges")
		} else if (type == "d") {
			updateUnlockedMasteryStudies()
			updateSpentableMasteryStudies()
		}
		updateMasteryStudyCosts()
		updateMasteryStudyButtons()
		drawMasteryTree()
	}
}

function canBuyMasteryStudy(type, id) {
	if (type == 't') {
		if (inQCModifier("sm") && masteryStudies.bought >= 20) return false
		if (player.timestudy.theorem < masteryStudies.costs.time[id] || player.masterystudies.includes('t' + id) || player.eternityChallUnlocked > 12 || !masteryStudies.timeStudies.includes(id)) return false
		if (masteryStudies.latestBoughtRow > Math.floor(id / 10)) return false
		if (!masteryStudies.spentable.includes(id)) return false
		if (masteryStudies.unlockReqConditions[id] && !masteryStudies.unlockReqConditions[id]()) return false
	} else if (type == 'd') {
		if (player.timestudy.theorem < masteryStudies.costs.dil[id] || player.masterystudies.includes('d' + id)) return false
		if (!ph.did("ghostidy") && !(masteryStudies.unlockReqConditions["d" + id] && masteryStudies.unlockReqConditions["d" + id]())) return false
		if (!masteryStudies.spentable.includes("d" + id)) return false
	} else {
		if (player.timestudy.theorem < masteryStudies.costs.ec[id] || player.eternityChallUnlocked) return false
		if (!masteryStudies.spentable.includes("ec" + id)) return false
		if (player.etercreq == id) return true
		if (id == 13) return player.resets >= masteryStudies.ecReqsStored[13]
		return player.replicanti.amount.gte(masteryStudies.ecReqsStored[14])
	}
	return true
}
	
function updateMasteryStudyButtons() {
	if (!tmp.ngp3) return
	for (id = 0; id < masteryStudies.unlocked.length; id++) {
		var name = masteryStudies.unlocked[id]
		if (name + 0 == name) {
			var className = "timestudy"
			var div = getEl("timestudy" + name)
			if (!masteryStudies.has(name) && !canBuyMasteryStudy('t', name)) className = "timestudylocked"
			else {
				if (masteryStudies.has(name)) className += "bought"
				if (name > 270) className += " elcstudy"
			}
			if (div.className !== className) div.className = className
			if (masteryStudies.hasStudyEffect.includes(name)) {
				var mult = getMTSMult(name)
				if (mult) getEl("ts" + name + "Current").textContent = (masteryStudies.studyEffectDisplays[name] !== undefined ? masteryStudies.studyEffectDisplays[name](mult) : shorten(mult) + "x")
			}
		}
	}
	for (id = 13; id <= masteryStudies.ecsUpTo; id++) {
		var div = getEl("ec" + id + "unl")
		if (!masteryStudies.unlocked.includes("ec" + id)) break
		if (player.eternityChallUnlocked == id) div.className = "eternitychallengestudybought"
		else if (canBuyMasteryStudy('ec', id)) div.className = "eternitychallengestudy"
		else div.className = "timestudylocked"
	}
	for (id = 7; id <= masteryStudies.unlocksUpTo; id++) {
		var div = getEl("dilstudy" + id)
		if (!masteryStudies.unlocked.includes("d" + id)) break
		if (player.masterystudies.includes("d" + id)) div.className = "dilationupgbought"
		else if (canBuyMasteryStudy('d', id)) div.className = "dilationupg"
		else div.className = "timestudylocked"
	}
}

function updateMasteryStudyTextDisplay() {
	if (!tmp.ngp3) return
	getEl("costmult").textContent = shorten(masteryStudies.costMult)
	getEl("totalmsbought").textContent = masteryStudies.bought
	getEl("totalttspent").textContent = shortenDimensions(masteryStudies.ttSpent)
	for (var i = 0; i < masteryStudies.timeStudies.length; i++) {
		var name = masteryStudies.timeStudies[i]
		if (!masteryStudies.unlocked.includes(name)) break

		var req = masteryStudies.unlockReqDisplays[name] && masteryStudies.unlockReqDisplays[name]()
		getEl("ts" + name + "Cost").textContent = shorten(masteryStudies.costs.time[name])
		if (req) getEl("ts" + name + "Req").innerHTML = "<br>Requirement: " + req
	}
	for (id = 13; id <= masteryStudies.ecsUpTo; id++) {
		if (!masteryStudies.unlocked.includes("ec" + id)) break
		getEl("ec" + id + "Cost").textContent = "Cost: " + shorten(masteryStudies.costs.ec[id]) + " Time Theorems"
		getEl("ec" + id + "Req").style.display = player.etercreq == id ? "none" : "block"
		getEl("ec" + id + "Req").textContent = "Requirement: " + masteryStudies.ecReqDisplays[id]()
	}
	for (id = 7; id <= masteryStudies.unlocksUpTo; id++) {
		if (!masteryStudies.unlocked.includes("d" + id)) break
		var req = masteryStudies.unlockReqDisplays["d" + id] && masteryStudies.unlockReqDisplays["d" + id]()
		getEl("ds" + id + "Cost").textContent = "Cost: " + shorten(masteryStudies.costs.dil[id]) + " Time Theorems"
		if (req) getEl("ds" + id + "Req").innerHTML = ph.did("ghostify") ? "" : "<br>Requirement: " + req
	}
}

var occupied
function drawMasteryBranch(id1, id2) {
	var type1 = id1.split("ec")[1] ? "c" : id1.split("dil")[1] ? "d" : id1.split("time")[1] ? "t" : undefined
	var type2 = id2.split("ec")[1] ? "c" : id2.split("dil")[1] ? "d" : id2.split("time")[1] ? "t" : undefined
	var start = getEl(id1).getBoundingClientRect();
	var end = getEl(id2).getBoundingClientRect();
	var x1 = start.left + (start.width / 2) + (document.documentElement.scrollLeft || document.body.scrollLeft);
	var y1 = start.top + (start.height / 2) + (document.documentElement.scrollTop || document.body.scrollTop);
	var x2 = end.left + (end.width / 2) + (document.documentElement.scrollLeft || document.body.scrollLeft);
	var y2 = end.top + (end.height / 2) + (document.documentElement.scrollTop || document.body.scrollTop);
	msctx.lineWidth = 15;
	msctx.beginPath();
	var drawBoughtLine = true
	if (type1 == "t" || type1 == "d") drawBoughtLine = player.masterystudies.includes(type1+id1.split("study")[1])
	if (type2 == "t" || type2 == "d") drawBoughtLine = drawBoughtLine && player.masterystudies.includes(type2 + id2.split("study")[1])
	if (type2 == "c") drawBoughtLine = drawBoughtLine && player.eternityChallUnlocked == id2.slice(2,4)
	if (drawBoughtLine) {
		if (type2 == "d" && player.options.theme == "Aarex's Modifications") {
			msctx.strokeStyle = parseInt(id2.split("study")[1]) < 8 ? "#D2E500" : parseInt(id2.split("study")[1]) > 9 ? "#333333" : "#009900";
		} else if (type2 == "c") {
			msctx.strokeStyle = "#490066";
		} else {
			msctx.strokeStyle = "#000000";
		}
	} else if (type2 == "d" && player.options.theme == "Aarex's Modifications") {
		msctx.strokeStyle = parseInt(id2.split("study")[1]) < 8 ? "#697200" : parseInt(id2.split("study")[1]) > 11 ? "#727272" : parseInt(id2.split("study")[1]) > 9 ? "#262626" : "#006600";
	} else msctx.strokeStyle = "#444";
	msctx.moveTo(x1, y1);
	msctx.lineTo(x2, y2);
	msctx.stroke();
	if (!occupied.includes(id2) && type2 == "t") {
		occupied.push(id2)
		if (shiftDown) {
			var start = getEl(id2).getBoundingClientRect();
			var x1 = start.left + (start.width / 2) + (document.documentElement.scrollLeft || document.body.scrollLeft);
			var y1 = start.top + (start.height / 2) + (document.documentElement.scrollTop || document.body.scrollTop);
			var mult = getMasteryStudyCostMult(id2.split("study")[1])
			var msg = "MS" + (id2.split("study")[1] - 230) + " (" + (mult >= 1e3 ? shorten(mult) : mult.toFixed(2 - Math.floor(Math.log10(mult)))) + "x)"
			msctx.fillStyle = 'white';
			msctx.strokeStyle = 'black';
			msctx.lineWidth = 3;
			msctx.font = "15px Typewriter";
			msctx.strokeText(msg, x1 - start.width / 2, y1 - start.height / 2 - 1);
			msctx.fillText(msg, x1 - start.width / 2, y1 - start.height / 2 - 1);
		}
	}
}

function drawMasteryTree() {
	msctx.clearRect(0, 0, msc.width, msc.height);
	if (player === undefined) return
	if (getEl("eternitystore").style.display === "none" || getEl("masterystudies").style.display === "none" || player.masterystudies === undefined) return
	occupied=[]
	drawMasteryBranch("back", "timestudy241")
	for (var x = 0; x < masteryStudies.studies.length; x++) {
		var id = masteryStudies.studies[x]
		var paths = getMasteryStudyConnections(id)
		if (!masteryStudies.unlocked.includes(id)) return
		if (paths) for (var y = 0; y < paths.length; y++) if (masteryStudies.unlocked.includes(paths[y])) drawMasteryBranch(convertMasteryStudyIdToDisplay(id), convertMasteryStudyIdToDisplay(paths[y]))
	}
}

function getMasteryStudyMultiplier(id, uses = ""){
	return getMTSMult(id, uses)
}

function getMTSMult(id, uses = "") {
	if (uses == "" && masteryStudies.unlocked.includes(id)) return tmp.mts[id]
	return masteryStudies.timeStudyEffects[id](uses)
}

function updateMasteryStudyTemp() {
	tmp.mts = {}
	if (!masteryStudies.unl()) return

	let studies = masteryStudies.unlocked
	for (var s = 0; s <= studies.length; s++) {
		var study = studies[s]
		if (masteryStudies.hasStudyEffect.includes(study)) tmp.mts[study] = masteryStudies.timeStudyEffects[study]("")
	}
}

var upDown = {
	point: 0,
	times: 0
}

function recordUpDown(x) {
	if (upDown.point>0&&upDown.point==x) return
	upDown.point=x
	upDown.times++
	if (upDown.times>=200) giveAchievement("Up and Down and Up and Down...")
}




