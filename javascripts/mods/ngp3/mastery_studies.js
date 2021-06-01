var masteryStudies = {
	initCosts: {
		time: {
			//Eternity
			241: 1e68,
			251: 2e70, 252: 2e70, 253: 2e70,
			261: 1e70, 262: 1e70, 263: 1e70, 264: 1e70, 265: 1e70, 266: 1e70,

			//Quantum
			271: 3.90625e71,
			281: 2e74, 282: 2e73, 283: 2e73, 284: 2e74,
			291: 1/0, 292: 4e74, 293: 2e74, 294: 4e74, 295: 1/0,
			302: 1/0, 303: 1/0,

			//Expert Mode
			ex_241: 2e68,
			ex_271: 1e68
		},
		ec: {
			13: 1e71, 14: 1e71,

			//Expert Mode
			ex_13: 5e70, ex_14: 5e70
		},
		dil: {7: 1e74, 8: 3e76, 9: 1e85, 10: 1e87, 11: 1e90, 12: 1e92, 13: 1e95, 14: 1e97}
	},
	costs: {
		time: {},
		mults: {
			//Eternity
			t241: 1,
			t251: 2, t252: 2, t253: 2,
			t261: 2, t262: 2, t263: 2, t264: 2, t265: 2, t266: 2,

			//Quantum
			t271: 1 / 128,
			t281: 5, t282: 3, t283: 3, t284: 5,
			t291: 1 / 2, t292: 12, t293: 1, t294: 12, t295: 1 / 2,
			t302: 1 / 3, t303: 1 / 3,

			//Expert Mode
			t251_ex: 2.5, t252_ex: 2.5, t253_ex: 2.5,
			t271_ex: 1 / 250,
			t282_ex: 5, t283_ex: 5},
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
			return hasAch("ng3p16") || player.dilation.dilatedTime.gte(1e100)
		},
		272() {
			return masteryStudies.bought >= (tmp.ngex ? 9 : 10)
		},
		d7() {
			return tmp.qu.quarkEnergy >= 2.75
		},
		d8() {
			return enB.pos.engAmt() >= 900
		},
		d9() {
			return false
		},
		d10() {
			return false
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
			return hasAch("ng3p16") ? undefined : shorten(1e100) + " dilated time"
		},
		272() {
			return (tmp.ngex ? 9 : 10) + " bought mastery studies"
		},
		d7() {
			return "2.75 quantum energy"
		},
		d8() {
			return shorten(900) + " positronic charge"
		},
		d9() {
			return "COMING IN BETA V0.5"
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
		return ph.did("quantum") || (tmp.ngp3 && hasDilationUpg("ngpp6"))
	},
	has(x) {
		return this.unl() && masteryStudies.unlocked.includes(x) && (player.masterystudies.includes("t" + x) || player.masterystudies.includes(x))
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
			x /= Math.pow(Math.log10(x + 1) + 1, 2) * 8 / 5

			if (enB.active("pos", 7)) x += enB.tmp.pos7
			return x
		},
		283() {
			let x = tmp.rep ? tmp.rep.baseChance : 0
			return 0.7 * Math.pow(x / 1.5e9 + 1, 0.2)
		},
		284() {
			let x = (player.galaxies + getTotalRGs() + player.dilation.freeGalaxies) / 25

			if (enB.active("pos", 7)) x += enB.tmp.pos7
			return x
		},
		291() {
			return 0
		},
		292() {
			let rep = (tmp.rmPseudo || player.replicanti.amount).log10()
			let exp = (4 - 1 / (Math.log10(rep + 1) / 10 + 1)) / 3
			return Math.pow(rep / 3e5, exp) * 3e3
		},
		295() {
			let rg = getFullEffRGs()
			return Math.log10(rg / 1e3 + 1) * Math.log10(Math.log10(tmp.qu.colorPowers.g + 1) + 1) / 5 + 1
		},
		302() {
			return 0
		},
		303(x) {
			if (!x) x = getInfinitied()
			return Decimal.add(x, 1).log10() / 5 + 1
		}
	},
	timeStudyDescs: {
		241: () => "The IP mult multiplies IP gain by 2.1x per upgrade.",
		251: () => "Remote galaxy scaling starts later based on Meta-Dimension Boosts.",
		252: () => "Remote galaxy scaling starts 1 galaxy later per 9 Tachyonic Galaxies.",
		253: () => "Remote galaxy scaling starts 2 galaxies later per 7 total Replicated Galaxies.",
		261: () => "Dimension Boost cost scales by 0.5 less.",
		262: () => "The power of meta-antimatter effect is increased by ^0.5.",
		263: () => "Tachyonic Galaxies are 25% stronger.",
		264: () => "You gain 5x more Tachyon Particles.",
		265: () => "Replicate chance upgrades can go over 100%.",
		266: () => "Reduce the post-400 max replicated galaxy cost scaling.",

		271: () => "Replicantis boost Infinity Dimensions at a greatly stronger rate.",

		281: () => "Before boosts, dilated time adds the OoMs of replicate interval scaling.",
		282: () => "You can buy sub-1ms interval upgrades, but the cost starts to scale faster.",
		283: () => "Replicate chance gradually increases higher above 100%.",
		284: () => "After boosts, total galaxies increase the OoMs of replicate interval scaling.",

		291: () => "Red power makes Replicated Galaxies more evenly.",
		292: () => "Replicantis generate free Dimension Boosts.",
		293: () => "Some boosts from Replicantis are stronger.",
		294: () => "All Replicanti boosts are based on Replicanti multiplier.",
		295: () => "Green power makes Replicated Galaxies raise Replicanti multiplier instead.",

		302: () => "Color charge makes Replicanti multiplier more useful to Replicanti boosts.",
		303: () => "Blue power boosts Tachyon Particles even more."
	},
	hasStudyEffect: [251, 252, 253, 271, 281, 283, 284, 291, 292, 295, 302, 303],
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
			return "+" + shorten(x * getReplSpeedExpMult()) + " OoMs"
		},
		283(x) {
			return "^x^0.5 -> ^x^" + shorten(x)
		},
		284(x) {
			return "+" + shorten(x) + " OoMs"
		},
		291(x) {
			return formatPercentage(x) + "% even"
		},
		292(x) {
			return "+" + getFullExpansion(Math.floor(x))
		},
		295(x) {
			return "^" + x.toFixed(3)
		},
		302(x) {
			return formatPercentage(x) + "% more multiplier-like"
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
		281: [293], 282: [293], 283: [293], 284: [293],
		292: [291, 302], 293: [292, 294, "d8"], 294: [295, 303],

		//No more mastery studies after that
		d8: ["d9"], d9: ["d10"], d10: ["d11"], d11: ["d12"], d12: ["d13"], d13: ["d14"]},
	allUnlocks: {
		d7() {
			return ph.did("quantum")
		},
		r27() {
			return pos.unl()
		},
		291() {
			return QCs.unl()
		},
		295() {
			return QCs.unl()
		},
		r30() {
			return QCs.unl()
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
	masteryStudies.costMult = QCs.in(3) ? 1e-32 : hasAch("ng3p12") ? 0.25 : 1
	masteryStudies.bought = 0
	masteryStudies.ttSpent = 0
	for (id = 0; id<player.masterystudies.length; id++) {
		var t = player.masterystudies[id].split("t")[1]
		if (t) {
			setMasteryStudyCost(t, "t")
			masteryStudies.ttSpent += masteryStudies.costs.time[t] < 1/0 ? masteryStudies.costs.time[t] : 0
			masteryStudies.costMult *= getMasteryStudyCostMult("t" + t)
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
			if (masteryStudies.allUnlocks["r" + rowNum] && !masteryStudies.allUnlocks["r" + rowNum]()) unl = false
			getEl(divid).parentElement.parentElement.parentElement.parentElement.style = unl ? "" : "display: none !important"
			if (unl) masteryStudies.unlocked.push("r"+rowNum)
		}
		if (masteryStudies.allUnlocks[id] && !masteryStudies.allUnlocks[id]()) unl = false

		var localUnl = unl
		if (id[0] == "d") {
			localUnl = (id.split("d")[1] <= 7 || hasDilationStudy(parseInt(id.split("d")[1]) - 1) || hasDilationStudy(id)) && (ph.did("ghostify") || !masteryStudies.allUnlocks[id] || masteryStudies.allUnlocks[id]())
			if (localUnl) getEl(divid).parentElement.parentElement.parentElement.parentElement.style = ""
		}
		if (localUnl) masteryStudies.unlocked.push(id)
		getEl(divid).style.visibility = localUnl ? "" : "hidden"
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
	let t = masteryStudies.types[type]
	let f = d[t]
	let r = f[id] || 0
	if (tmp.ngex) r = f["ex_" + id] || r

	masteryStudies.costs[t][id] = r * (type == "d" ? 1 : masteryStudies.costMult)
}

function getMasteryStudyCostMult(id) {
	let d = masteryStudies.costs.mults
	let r = d[id] || 1
	if (tmp.ngex) r = d[id + "_ex"] || r

	return r
}

function buyingD7Changes() {
	showTab("quantumtab")
	showQuantumTab("positrons")
	getEl("positronstabbtn").style.display = ""

	enB.update("pos")
}

function buyingDilStudyForQC() {
	getEl("qctabbtn").style.display = ""

	QCs.tp()
	QCs.updateTmp()
	QCs.updateDisp()
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
			masteryStudies.costMult *= getMasteryStudyCostMult("t" + id)
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
			if (id == 8) qMs.updateDisplay()
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
		if (player.timestudy.theorem < masteryStudies.costs.time[id] || player.masterystudies.includes('t' + id) || player.eternityChallUnlocked > 12 || !masteryStudies.timeStudies.includes(id)) return false
		if (masteryStudies.latestBoughtRow > Math.floor(id / 10)) return false
		if (!masteryStudies.spentable.includes(id)) return false
		if (masteryStudies.unlockReqConditions[id] && !masteryStudies.unlockReqConditions[id]()) return false
	} else if (type == 'd') {
		if (player.timestudy.theorem < masteryStudies.costs.dil[id] || player.masterystudies.includes('d' + id)) return false
		if (!ph.did("ghostify") && !(masteryStudies.unlockReqConditions["d" + id] && masteryStudies.unlockReqConditions["d" + id]())) return false
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
				getEl("ts" + name + "Current").textContent = (masteryStudies.studyEffectDisplays[name] !== undefined ? masteryStudies.studyEffectDisplays[name](mult) : shorten(mult) + "x")
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
			var mult = getMasteryStudyCostMult("t" + id2.split("study")[1])
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