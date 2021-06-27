//Quantum worth
var quantumWorth
function updateQuantumWorth(mode) {
	if (!tmp.ngp3) return
	if (player.ghostify.milestones<8) {
		if (mode != "notation") mode=undefined
	} else if (mode == "notation") return
	if (mode != "notation") {
		if (mode != "display") {
			quantumWorth = qu_save.quarks.add(qu_save.usedQuarks.r).add(qu_save.usedQuarks.g).add(qu_save.usedQuarks.b).add(qu_save.gluons.rg).add(qu_save.gluons.gb).add(qu_save.gluons.br).round()
		}
		if (player.ghostify.times) {
			var automaticCharge = Math.max(Math.log10(quantumWorth.add(1).log10() / 150) / Math.log10(2), 0) + Math.max(qu_save.bigRip.spaceShards.add(1).log10() / 20 - 0.5, 0)
			player.ghostify.automatorGhosts.power = Math.max(automaticCharge, player.ghostify.automatorGhosts.power)
			if (mode != "quick") {
				getEl("automaticCharge").textContent = automaticCharge.toFixed(2)
				getEl("automaticPower").textContent = player.ghostify.automatorGhosts.power.toFixed(2)
			}
			while (player.ghostify.automatorGhosts.ghosts<MAX_AUTO_GHOSTS&&player.ghostify.automatorGhosts.power>=autoGhostRequirements[player.ghostify.automatorGhosts.ghosts-3]) {
				player.ghostify.automatorGhosts.ghosts++
				getEl("autoGhost"+player.ghostify.automatorGhosts.ghosts).style.visibility="visible"
				if (player.ghostify.automatorGhosts.ghosts == MAX_AUTO_GHOSTS) getEl("nextAutomatorGhost").parentElement.style.display="none"
				else {
					getEl("automatorGhostsAmount").textContent=player.ghostify.automatorGhosts.ghosts
					getEl("nextAutomatorGhost").parentElement.style.display=""
					getEl("nextAutomatorGhost").textContent=autoGhostRequirements[player.ghostify.automatorGhosts.ghosts-3].toFixed(1)
				}
			}
		}
	}
	if (mode != "quick") for (var e = 1; e <= 2; e++) getEl("quantumWorth" + e).textContent = shortenDimensions(quantumWorth)
}

//Quark Assertment Machine
function getAssortPercentage() {
	return qu_save.assortPercentage ? qu_save.assortPercentage : 100
}

function getAssortAmount() {
	return qu_save.quarks.floor().min(qu_save.quarks).times(getAssortPercentage() / 100).round()
}

var assortDefaultPercentages = [10, 25, 50, 100]
function updateAssortPercentage() {
	let percentage = getAssortPercentage()
	getEl("assort_percentage").value = percentage
	for (var i = 0; i < assortDefaultPercentages.length; i++) {
		var percentage2 = assortDefaultPercentages[i]
		getEl("assort_percentage_" + percentage2).className = percentage2 == percentage ? "chosenbtn" : "storebtn"
	}
}

function changeAssortPercentage(x) {
	qu_save.assortPercentage = Math.max(Math.min(parseFloat(x || getEl("assort_percentage").value), 100), 0)
	updateAssortPercentage()
	updateQuarksTabOnUpdate()
}

function assignQuark(color) {
	var usedQuarks = getAssortAmount()
	if (usedQuarks.eq(0)) {
		$.notify("Make sure you are assigning at least one quark!")
		return
	}
	var mult = getQuarkAssignMult()
	qu_save.usedQuarks[color] = qu_save.usedQuarks[color].add(usedQuarks.times(mult)).round()
	qu_save.quarks = qu_save.quarks.sub(usedQuarks)
	getEl("quarks").innerHTML = "You have <b class='QKAmount'>0</b> quarks."
	if (!mult.eq(1)) updateQuantumWorth()
	updateColorCharge()
	if (player.ghostify.another > 0) player.ghostify.another--
}

function assignAll(auto) {
	var ratios = qu_save.assignAllRatios
	var sum = ratios.r+ratios.g+ratios.b
	var oldQuarks = getAssortAmount()
	var colors = ['r','g','b']
	var mult = getQuarkAssignMult()
	for (c = 0; c < 3; c++) {
		var toAssign = oldQuarks.times(ratios[colors[c]]/sum).round()
		if (toAssign.gt(0)) {
			qu_save.usedQuarks[colors[c]] = qu_save.usedQuarks[colors[c]].add(toAssign.times(mult)).round()
			if (player.ghostify.another > 0) player.ghostify.another--
		}
	}
	qu_save.quarks = qu_save.quarks.sub(oldQuarks).round()
	if (qu_save.autoOptions.assignQKRotate) {
		if (qu_save.autoOptions.assignQKRotate > 1) {
			qu_save.assignAllRatios = {
				r: qu_save.assignAllRatios.g,
				g: qu_save.assignAllRatios.b,
				b: qu_save.assignAllRatios.r
			}
		} else qu_save.assignAllRatios = {
			r: qu_save.assignAllRatios.b,
			g: qu_save.assignAllRatios.r,
			b: qu_save.assignAllRatios.g
		}
		var colors = ['r','g','b']
		for (c = 0; c < 3; c++) getEl("ratio_" + colors[c]).value = qu_save.assignAllRatios[colors[c]]
	}
	if (mult.gt(1)) updateQuantumWorth()
	updateColorCharge()
}

function getQuarkAssignMult() {
	let r = new Decimal(1)
	if (hasBosonicUpg(23)) r = r.times(tmp.blu[23])
	return r
}

function changeRatio(color) {
	var value = parseFloat(getEl("ratio_" + color).value)
	if (value < 0 || isNaN(value)) {
		getEl("ratio_" + color).value = qu_save.assignAllRatios[color]
		return
	}
	var sum = 0
	var colors = ['r','g','b']
	for (c = 0; c < 3; c++) sum += colors[c] == color ? value : qu_save.assignAllRatios[colors[c]]
	if (sum == 0 || sum == 1/0) {
		getEl("ratio_" + color).value = qu_save.assignAllRatios[color]
		return
	}
	qu_save.assignAllRatios[color] = value
}

function toggleAutoAssign() {
	qu_save.autoOptions.assignQK = !qu_save.autoOptions.assignQK
	getEl('autoAssign').textContent="Auto: O"+(qu_save.autoOptions.assignQK?"N":"FF")
	if (qu_save.autoOptions.assignQK && qu_save.quarks.gt(0)) assignAll(true)
}

function rotateAutoAssign() {
	qu_save.autoOptions.assignQKRotate=qu_save.autoOptions.assignQKRotate?(qu_save.autoOptions.assignQKRotate+1)%3:1
	getEl('autoAssignRotate').textContent="Rotation: "+(qu_save.autoOptions.assignQKRotate>1?"Left":qu_save.autoOptions.assignQKRotate?"Right":"None")
}

function neutralize_quarks() {
	if (colorCharge.normal.chargeAmt.eq(0) || !qu_save.quarks.gte(colorCharge.neutralize.total)) return

	var sum = 0
	var colors = ['r','g','b']
	for (var c = 0; c < 3; c++) {
		var color = colors[c]
		qu_save.usedQuarks[color] = qu_save.usedQuarks[color].add(colorCharge.neutralize[color]).round()
	}
	qu_save.quarks = qu_save.quarks.sub(colorCharge.neutralize.total)

	updateColorCharge()
	if (player.ghostify.another > 0) player.ghostify.another--
}

//Color Charge
colorCharge = {
	normal: {}
}
colorShorthands = {
	r: 'red',
	g: 'green',
	b: 'blue'
}

function updateColorCharge() {
	if (!tmp.ngp3) return
	var usedQuarks = qu_save.usedQuarks

	var colors = ['r', 'g', 'b']
	var colorPowers = {}
	for (var i = 0; i < 3; i++) {
		var ret = Decimal.div(usedQuarks[colors[i]], 2).add(1).log10()
		colorCharge[colors[i]] = player.ghostify.milestones >= 2 ? ret : 0
		colorPowers[colors[i]] = ret
	}

	var sorted = []
	for (var s = 0; s < 3; s++) {
		var search = ''
		for (var i = 0; i < 3; i++) if (!sorted.includes(colors[i]) && (search == '' || usedQuarks[colors[i]].gte(usedQuarks[search]))) search = colors[i]
		sorted.push(search)
	}

	colorCharge.normal = {
		color: sorted[0],
		chargeAmt: Decimal.sub(usedQuarks[sorted[0]], usedQuarks[sorted[1]]).round(),
		charge: colorPowers[sorted[0]] * Decimal.div(
			Decimal.sub(usedQuarks[sorted[0]], usedQuarks[sorted[1]]),
			Decimal.add(usedQuarks[sorted[0]], 1)
		)
	}
	if (QCs.isRewardOn(2)) colorCharge[sorted[0]] = colorCharge.normal.charge
	if (player.ghostify.milestones <= 2) colorCharge[sorted[0]] = colorCharge.normal.charge
	if (usedQuarks[sorted[0]] > 0 && colorCharge.normal.charge == 0) giveAchievement("Hadronization")

	colorCharge.subCancel = hasAch("ng3p13") ? Math.pow(colorCharge.normal.charge * 3, 1.25) : 0

	colorCharge.neutralize = {}
	colorCharge.neutralize[sorted[0]] = new Decimal(0)
	colorCharge.neutralize[sorted[1]] = Decimal.sub(usedQuarks[sorted[0]], usedQuarks[sorted[1]]).round()
	colorCharge.neutralize[sorted[2]] = Decimal.sub(usedQuarks[sorted[0]], usedQuarks[sorted[2]]).round()
	colorCharge.neutralize.total = colorCharge.neutralize[sorted[1]].add(colorCharge.neutralize[sorted[2]]).round()

	updateQuarksTabOnUpdate()
}

function getColorPowerQuantity(color, base) {
	let ret = colorCharge[color] * tmp.glB[color].mult
	if (tmp.qe) ret = ret * tmp.qe.eff1 + tmp.qe.eff2
	if (tmp.glB) ret = ret - tmp.glB[color].sub

	if (!base) {
		if (hasMTS(314)) ret += getColorPowerQuantity(color == "r" ? "g" : color == "g" ? "b" : "r", true) / 5
		if (color == "r" && hasMTS(272)) ret /= 5
	}
	return Math.max(ret, 0)
}

colorBoosts = {
	r: 1,
	g: 1,
	b: 1
}

function updateColorPowers() {
	//Red
	colorBoosts.r = Math.log10(qu_save.colorPowers.r * 5 + 1) / 3.5 + 1
	if (hasMTS(272)) colorBoosts.r += 0.25

	//Green
	colorBoosts.g = Math.log10(qu_save.colorPowers.g * 3 + 1) + 1

	//Blue
	colorBoosts.b_base = qu_save.colorPowers.b * 1.5 + 1
	colorBoosts.b_exp = 2
	if (enB.active("glu", 10)) colorBoosts.b_base *= enB_tmp.glu10
	if (enB.active("glu", 11)) colorBoosts.b_exp += enB_tmp.glu11

	colorBoosts.b_base2 = Decimal.pow(colorBoosts.b_base, colorBoosts.b_exp)
	if (hasMTS(313)) colorBoosts.b_exp *= getMTSMult(313, "update")

	colorBoosts.b = Decimal.pow(colorBoosts.b_base, colorBoosts.b_exp)
}

//Gluons
function gainQuantumEnergy() {
	let xNoDiv = (getQEQuarksPortion() + getQEGluonsPortion()) * tmp.qe.mult * (tmp.ngp3_mul ? 1.25 : 1)
	let x = xNoDiv / tmp.qe.div

	if (isNaN(xNoDiv)) xNoDiv = 0
	if (isNaN(x)) x = 0

	qu_save.quarkEnergy = x
	qu_save.bestEnergy = Math.max(qu_save.bestEnergy || 0, xNoDiv)
}

function getQEQuarksPortion() {
	let exp = tmp.qe.exp
	return Math.pow(quantumWorth.add(1).log10(), exp) * 1.25
}

function getQEGluonsPortion() {
	let exp = tmp.qe.exp
	return Math.pow(qu_save.gluons[qu_save.entColor || "rg"].add(1).log10(), exp) * (tmp.exMode ? 0 : tmp.ngp3_mul ? 1 : 0.25)
}

function getQuantumEnergyMult() {
	let x = 1
	if (enB.active("glu", 1)) x += enB_tmp.glu1
	if (tmp.ngp3_mul && tmp.glb) x += (tmp.glB.r.mult + tmp.glB.g.mult + tmp.glB.b.mult) / 15
	return x
}

function getQuantumEnergyDiv() {
	let x = 1
	if (pos.on()) x = tmp.ngp3_mul ? 10 / 9 : 4 / 3
	return x
}

function updateQEGainTmp() {
	let data = {}
	tmp.qe = data
	if (!tmp.quActive) return

	//Quark Efficiency
	data.expDen = hasAch("ng3p14") ? 2 : 3
	if (tmp.ngp3_mul) data.expDen *= 0.8
	if (enB.active("pos", 1)) data.expDen = 1

	data.expNum = 1
	if (enB.active("pos", 1)) data.expNum = enB_tmp.pos1
	if (data.expNum > data.expDen - 1) {
		let sc = data.expDen - 1
		let scEff = data.expNum / Math.max(sc, 1)
		data.expNum = data.expDen - 1 / Math.log2(scEff + 1)
	}

	data.exp = data.expNum / data.expDen
	qu_save.expEnergy = data.exp

	//Multiplier
	data.mult = getQuantumEnergyMult()
	data.div = getQuantumEnergyDiv()

	//Quantum Energy Loss
	data.total = qu_save.quarkEnergy * tmp.qe.div
	data.sac = qu_save.quarkEnergy * (1 - 1 / tmp.qe.div)
}

function updateQuarkEnergyEffects() {
	if (!tmp.quActive) return

	var engMult = 1
	if (pos.isCloudRewardActive(1)) engMult += 0.05
	if (pos.isCloudRewardActive(2)) engMult += 0.1
	if (pos.isCloudRewardActive(3)) engMult += 0.15

	var eng = qu_save.quarkEnergy * engMult
	var exp = 4 / 3
	tmp.qe.eff1 = Math.pow(Math.log10(eng / 1.7 + 1) + 1, exp)
	tmp.qe.eff2 = QCs.inAny() ? 0 : Math.pow(eng, exp) * tmp.qe.eff1 / 4
}

function buyQuarkMult(name) {
	var cost = Decimal.pow(100, qu_save.multPower[name] + Math.max(qu_save.multPower[name] - 467, 0)).times(500)
	if (qu_save.gluons[name].lt(cost)) return
	qu_save.gluons[name] = qu_save.gluons[name].sub(cost).round()
	qu_save.multPower[name]++
	qu_save.multPower.total++
	updateGluonsTab("spend")
	if (qu_save.autobuyer.mode === 'amount') {
		qu_save.autobuyer.limit = Decimal.times(qu_save.autobuyer.limit, 2)
		getEl("priorityquantum").value = formatValue("Scientific", qu_save.autobuyer.limit, 2, 0);
	}
}

function maxQuarkMult() {
	var names = ["rg", "gb", "br"]
	var bought = 0
	for (let c = 0; c < 3; c++) {
		var name = names[c]
		var buying = true
		while (buying) {
			var cost = Decimal.pow(100, qu_save.multPower[name] + Math.max(qu_save.multPower[name] - 467, 0)).times(500)
			if (qu_save.gluons[name].lt(cost)) buying = false
			else if (qu_save.multPower[name] < 468) {
				var toBuy = Math.min(Math.floor(qu_save.gluons[name].div(cost).times(99).add(1).log(100)),468-qu_save.multPower[name])
				var toSpend = Decimal.pow(100, toBuy).sub(1).div(99).times(cost)
				if (toSpend.gt(qu_save.gluons[name])) qu_save.gluons[name]=new Decimal(0)
				else qu_save.gluons[name] = qu_save.gluons[name].sub(toSpend).round()
				qu_save.multPower[name] += toBuy
				bought += toBuy
			} else {
				var toBuy=Math.floor(qu_save.gluons[name].div(cost).times(9999).add(1).log(1e4))
				var toSpend=Decimal.pow(1e4, toBuy).sub(1).div(9999).times(cost)
				if (toSpend.gt(qu_save.gluons[name])) qu_save.gluons[name]=new Decimal(0)
				else qu_save.gluons[name] = qu_save.gluons[name].sub(toSpend).round()
				qu_save.multPower[name] += toBuy
				bought += toBuy
			}
		}
	}
	qu_save.multPower.total += bought
	if (qu_save.autobuyer.mode === 'amount') {
		qu_save.autobuyer.limit = Decimal.times(qu_save.autobuyer.limit, Decimal.pow(2, bought))
		getEl("priorityquantum").value = formatValue("Scientific", qu_save.autobuyer.limit, 2, 0)
	}
	updateGluonsTabOnUpdate("spend")
}

function updateGluonicBoosts() {
	tmp.glB = {}
	if (!tmp.quActive) return

	let data = tmp.glB
	let enBData = enB
	let gluons = qu_save.gluons

	data.r = { mult: getGluonEffBuff(gluons.rg), sub: getGluonEffNerf(gluons.br, "r") } //x -> x * [RG effect] - [BR effect]
	data.g = { mult: getGluonEffBuff(gluons.gb), sub: getGluonEffNerf(gluons.rg, "g") } //x -> x * [GB effect] - [RG effect]
	data.b = { mult: getGluonEffBuff(gluons.br), sub: getGluonEffNerf(gluons.gb, "b") } //x -> x * [BR effect] - [GB effect]

	let type = qu_save.entColor || "rg"
	data.enAmt = enBData.glu.gluonEff(gluons[type])
	data.masAmt = enBData.glu.gluonEff(tmp.exMode ? gluons[type].times(3) : gluons.rg.add(gluons.gb).add(gluons.br))

	enB.updateTmp()
}

function getGluonEffBuff(x) {
	let r = Math.log10(Decimal.add(x, 1).log10() * 5 + 1) + 1
	if (tmp.ngp3_mul) r *= 1.5
	return r
}

function getGluonEffNerf(x, color) {
	let r = Math.max(Math.pow(Decimal.add(x, 1).log10(), tmp.exMode ? 1.8 : 1.5) - colorCharge.subCancel, 0)
	if (tmp.ngp3_mul) r *= 0.5

	let gluon = qu_save.entColor || "rg"
	if (color == gluon[0] || color == gluon[1]) r *= tmp.exMode ? 0.5 : 0
	return r
}

var enB = {
	buy(type) {
		var data = this[type]
		if (!data.unl()) return
		if (!(data.engAmt() >= data.cost())) return

		data.set(data.amt() + 1)
		updateGluonicBoosts()
		this.update(type)
	},
	maxBuy(type) {
		var data = this[type]
		if (!data.unl()) return
		if (!(data.engAmt() >= data.cost())) return

		data.set(Math.floor(data.target()))
		updateGluonicBoosts()
		this.update(type)
	},

	has(type, x) {
		var data = this[type]
		return this[type].unl() && data.amt() >= data[x].req
	},
	active(type, x) {
		var data = this[type][x]

		if (enB_tmp[type + x] === undefined) return false

		if (!this.has(type, x)) return false
		if (!this[type].activeReq(x)) return false
		if (this.mastered(type, x)) return true

		if (data.activeReq && !data.activeReq()) return false
		return true
	},
	mastered(type, x) {
		var data = this[type]
		return data.amt() >= this.getMastered(type, x) && data.amt() >= data[x].req
	},
	getMastered(type, x) {
		var data = this[type]
		return (tmp.exMode && data[x].masReqExpert) || data[x].masReq
	},

	colorMatch(type, x) {
		var data = this[type][x]
		var gluon = qu_save.entColor || "rg"

		var r = data.type == gluon[0] || data.type == gluon[1]
		if (data.anti) r = !r
		return r
	},

	choose(x) {
		if ((qu_save.entColor || "rg") == x) return
		if (!qu_save.entBoosts || qu_save.gluons.rg.max(qu_save.gluons.gb).max(qu_save.gluons.br).eq(0)) {
			alert("You need to get at least 1 Entangled Boost and have gluons before choosing a type!")
			return
		}
		if (!confirm("This will perform a quantum reset without gaining anything. Are you sure?")) return
		qu_save.entColor = x
		quantum(false, true)
	},

	updateTmp() {
		var data = {}
		enB_tmp = data

		for (var x = 0; x < this.priorities.length; x++) {
			var boost = this.priorities[x]
			var type = boost[0]
			var num = boost[1]

			if (this.has(type, num)) {
				var eff = this[type][num].eff
				if (eff !== undefined) data[type + num] = eff(this[type].eff(num))
			}
		}
	},

	types: ["glu", "pos"],
	priorities: [
		["glu", 5], ["glu", 9],
		["pos", 8], ["pos", 10], ["pos", 11], ["pos", 12],

		["pos", 1], ["pos", 2], ["pos", 3], ["pos", 4], ["pos", 5], ["pos", 6], ["pos", 7], ["pos", 9],
		["glu", 1], ["glu", 2], ["glu", 3], ["glu", 4], ["glu", 6], ["glu", 7], ["glu", 8], ["glu", 10], ["glu", 11], ["glu", 12],
	],
	glu: {
		name: "Entangled",
		unl() {
			return tmp.quActive && qu_save.gluons.rg.max(qu_save.gluons.gb).max(qu_save.gluons.br).gt(0)
		},

		cost(x) {
			if (x === undefined) x = this.amt()
			return Math.pow(x / 3, 1.5) + 1
		},
		target(noBest) {
			return Math.pow(Math.max(this.engAmt(noBest) - 1, 0), 1 / 1.5) * 3 + 1
		},

		amt() {
			return qu_save.entBoosts || 0
		},
		engAmt(noBest) {
			return noBest ? qu_save.quarkEnergy : qu_save.bestEnergy
		},
		set(x) {
			qu_save.entBoosts = x
		},

		eff(x) {
			var amt = this.target(true)
			if (pos.on()) amt += enB.pos.target()

			var r = Math.max(amt * 2 / 3 - 1, 1)
			r *= tmp.glB[enB.mastered("glu", x) ? "masAmt" : "enAmt"]
			return r
		},
		gluonEff(x) {
			return Decimal.add(x, 1).log10()
		},

		activeReq(x) {
			return enB.mastered("glu", x) || enB.colorMatch("glu", x)
		},

		max: 12,
		1: {
			req: 1,
			masReq: 7,
			masReqExpert: 9,

			title: "Quantum Tesla",
			type: "r",
			eff(x) {
				return Math.cbrt(x) * 0.75
			},
			effDisplay(x) {
				return shorten(x)
			}
		},
		2: {
			req: 3,
			masReq: 9,
			masReqExpert: 11,

			title: "Extraclusters",
			type: "g",
			eff(x) {
				return Math.log10(x * 2 + 1) + 1
			},
			effDisplay(x) {
				return x.toFixed(3)
			}
		},
		3: {
			req: 6,
			masReq: 10,
			masReqExpert: 13,

			title: "Dilation Overflow",
			type: "b",
			eff(x) {
				return Math.sqrt(x / 2 + 1, 0.5)
			},
			effDisplay(x) {
				return formatReductionPercentage(x, 2, 3)
			}
		},
		4: {
			req: 8,
			masReq: 11,
			masReqExpert: 12,

			title: "Meta Resynergizer",
			type: "r",
			eff(x) {
				x = Math.pow(1 + Math.log10(Math.log10(x + 1) + 1) / 2, 1.5)
				return 0.0045 * x
			},
			effDisplay(x) {
				return x.toFixed(4)
			}
		},
		5: {
			req: 10,
			masReq: 14,

			title: "Energy Lever",
			type: "g",
			eff(x) {
				if (pos.on()) {
					return Math.min(Math.pow(x / 10 + 1, 0.1), 4 / 3)
				} else {
					return Math.sqrt(x / 2)
				}
			},
			effDisplay(x) {
				return pos.on() ? "Positrons on: Meta-Dimension Boosts are <span style='font-size:25px'>" + formatPercentage(x - 1) + "</span>% stronger."
				: "Positrons off: Add +<span style='font-size:25px'>" + shorten(x) + "</span> Positronic Charge to all mastered Positronic Boosts."
			}
		},
		6: {
			req: 11,
			masReq: 1/0,

			title: "Otherworldly Galaxies",
			type: "r",
			eff(x) {
				return Math.log10(x / 2 + 1) / 2 + 1
			},
			effDisplay(x) {
				return formatPercentage(x - 1) + "%"
			}
		},
		7: {
			req: 11,
			masReq: 1/0,

			title: "Dilation Overflow II",
			type: "g",
			eff(x) {
				return Math.max(2 - Math.log10(x + 1) / 10, 1.5)
			},
			effDisplay(x) {
				return "^" + x.toFixed(3)
			}
		},
		8: {
			req: 11,
			masReq: 1/0,

			title: "Meta Resynergizer II",
			type: "b",
			eff(x) {
				return 0.15 - 0.05 / Math.pow(x + 1, 0.1)
			},
			effDisplay(x) {
				return "x^" + x.toFixed(3)
			}
		},
		9: {
			req: 12,
			masReq: 15,

			title: "Inflation Resistor",
			type: "g",
			anti: true,
			eff(x) {
				return Math.pow(x + 1, 0.1)
			},
			effDisplay(x) {
				return formatReductionPercentage(x, 3) + "%"
			}
		},
		10: {
			req: 1/0,
			masReq: 1/0,

			title: "Blue Saturation",
			type: "r",
			eff(x) {
				return 1
			},
			effDisplay(x) {
				return shorten(x) + "x"
			}
		},
		11: {
			req: 1/0,
			masReq: 1/0,

			title: "Blue Unseeming",
			type: "r",
			eff(x) {
				return 0
			},
			effDisplay(x) {
				return shorten(x)
			}
		},
		12: {
			req: 1/0,
			masReq: 1/0,

			title: "Color Subcharge",
			type: "r",
			anti: true,
			eff(x) {
				return 0
			},
			effDisplay(x) {
				return "^" + x.toFixed(3)
			}
		},
	},
	pos: {
		name: "Positronic",
		unl() {
			return pos.unl()
		},

		cost(x) {
			if (x === undefined) x = this.amt()
			return Math.pow(x / 2 + 1, 1.5)
		},
		target() {
			return Math.pow(this.engAmt(), 1 / 1.5) * 2
		},

		amt() {
			return pos_save.boosts
		},
		engAmt() {
			return pos_save.eng
		},
		set(x) {
			pos_save.boosts = x
		},

		activeReq(x) {
			return tmp.bgMode || enB.mastered("pos", x) || pos.on()
		},

		eff(x) {
			var eng = this.engAmt()
			if (!pos.on() && enB.active("glu", 5)) eng += enB_tmp.glu5
			if ((enB.mastered("pos", x) || enB.colorMatch("pos", x)) && eng >= this.chargeReq(x)) eng *= 2 * this.lvl(x)
			return eng
		},

		chargeReq(x) {
			var lvl = this.lvl(x)
			return this[x].chargeReq * lvl
		},
		lvl(x, next) {
			var swaps = next ? pos_tmp.next_swaps : pos_save.swaps
			if (swaps[x]) x = swaps[x]
			return this[x].tier
		},

		max: 12,
		1: {
			req: 1,
			masReq: 3,
			chargeReq: 1,

			title: "Replicanti Launch",
			tier: 1,
			type: "g",
			eff(x) {
				var rep = (tmp.rmPseudo || player.replicanti.amount).max(1)
				return Math.log10(rep.log10() + 1) * Math.cbrt(x)
			},
			effDisplay(x) {
				return shorten(x)
			}
		},
		2: {
			req: 3,
			masReq: 5,
			chargeReq: 0,

			title: "Meta Accelerator",
			tier: 2,
			type: "b",
			eff(x) {
				var timeMult = Math.min(qu_save.time / 9000, 1)
				if (enB.active("pos", 11)) timeMult *= enB_tmp.pos11

				var baseMult = timeMult
				var slowStart = 4
				var slowSpeed = 1
				if (enB.active("glu", 9)) slowSpeed /= enB_tmp.glu9
				if (enB.active("pos", 8)) slowStart += enB_tmp.pos8
				if (enB.active("pos", 12)) baseMult += enB_tmp.pos12
				if (enB.active("pos", 10)) baseMult *= enB_tmp.pos10

				var mdb = player.meta.resets
				var base = player.meta.antimatter.add(1).log10() * baseMult + 1
				var exp = mdb

				var pre_slow_mdb = Math.min(mdb, slowStart)
				exp += pre_slow_mdb * (pre_slow_mdb - 1)

				if (mdb > slowStart) {
					var post_slow_mdb = Math.min(mdb - slowStart, (slowStart - 1) / slowSpeed)
					exp += Math.pow(post_slow_mdb, 2) / slowSpeed + post_slow_mdb * (slowStart - post_slow_mdb / slowSpeed)
				}

				exp /= 30
				return {
					acc: Decimal.pow(base, exp),
					baseMult: baseMult
				}
			},
			effDisplay(x) {
				return x.baseMult.toFixed(3) + "x"
			}
		},
		3: {
			req: 4,
			masReq: 6,
			chargeReq: 4,

			title: "Classical Positrons",
			tier: 1,
			type: "r",
			eff(x) {
				return Math.sqrt(x * 100) + 1
			},
			effDisplay(x) {
				return "^" + shorten(x)
			}
		},
		4: {
			req: 5,
			masReq: 1/0,
			chargeReq: 6,

			title: "Quantum Scope",
			tier: 3,
			type: "b",
			anti: true,
			eff(x) {
				return 2 - 1 / Math.pow(x / 10 + 1, 0.1)
			},
			effDisplay(x) {
				return shorten(Decimal.pow(getQuantumReq(true), 1 / x))
			}
		},
		5: {
			req: 1/0,
			masReq: 1/0,
			chargeReq: 3,

			title: "Transfinite Time",
			tier: 2,
			type: "r",
			eff(x) {
				return 1
			},
			effDisplay(x) {
				return "^" + x.toFixed(3)
			}
		},
		6: {
			req: 1/0,
			masReq: 1/0,
			chargeReq: 4,

			title: "Tickspeed Flux",
			tier: 3,
			type: "r",
			anti: true,
			eff(x) {
				return 1
			},
			effDisplay(x) {
				return Math.pow(player.tickSpeedMultDecrease, 1 / x).toFixed(4) + "x"
			}
		},
		7: {
			req: 1/0,
			masReq: 0,
			chargeReq: 5,

			title: "308% Completionist",
			tier: 2,
			type: "g",
			eff(x) {
				return 0
			},
			effDisplay(x) {
				return shorten(x)
			}
		},
		8: {
			req: 1/0,
			masReq: 0,
			chargeReq: 6,

			title: "MT-Force Preservation",
			tier: 3,
			type: "g",
			anti: true,
			eff(x) {
				return 0
			},
			effDisplay(x) {
				return x.toFixed(3)
			}
		},
		9: {
			req: 1/0,
			masReq: 0,
			chargeReq: 7,

			title: "Overpowered Infinities",
			tier: 2,
			type: "b",
			anti: true,
			eff(x) {
				var expExp = 1
				var expDiv = 1

				return Math.pow(Decimal.max(getInfinitied(), 10).log10(), expExp) / expDiv
			},
			effDisplay(x) {
				return "^" + shorten(x)
			}
		},
		10: {
			req: 1/0,
			masReq: 0,
			chargeReq: 0,

			title: "Looped Dimensionality",
			tier: 3,
			type: "r",
			anti: true,
			eff(x) {
				return 1 + Math.pow(qu_save.expEnergy, 4)
			},
			effDisplay(x) {
				return x.toFixed(3)
			}
		},
		11: {
			req: 1/0,
			masReq: 0,
			chargeReq: 0,

			title: "8th Shade of Blue",
			tier: 3,
			type: "b",
			anti: true,
			eff(x) {
				return 0
			},
			effDisplay(x) {
				return x.toFixed(3)
			}
		},
		12: {
			req: 1/0,
			masReq: 0,
			chargeReq: 0,

			title: "Timeless Capability",
			tier: 3,
			type: "g",
			anti: true,
			eff(x) {
				return 0
			},
			effDisplay(x) {
				return x.toFixed(3)
			}
		},
	},

	update(type) {
		var data = enB
		var typeData = data[type]

		getEl("enB_" + type + "_amt").textContent = getFullExpansion(typeData.amt() || 0)
		getEl("enB_" + type + "_cost").textContent = shorten(typeData.cost())
		getEl("enB_" + type + "_next").textContent = ""

		var has = true

		for (var e = 1; e <= typeData.max; e++) {
			var active = data.active(type, e)
			var mastered = data.mastered(type, e)

			if (has && !data.has(type, e)) {
				has = false
				getEl("enB_" + type + "_next").textContent = "Next " + typeData.name + " Boost unlocks at " + typeData[e].req + " " + typeData.name + " Boosters."
			}

			var el = getEl("enB_" + type + e + "_name")
			el.parentElement.style.display = has ? "" : "none"

			if (has) {
				el.parentElement.className = !active ? "red" : mastered ? "yellow" : enB.colorMatch(type, e) ? "green" : "orange"
				el.textContent = typeData.name + " Boost #" + e

				getEl("enB_" + type + e + "_type").innerHTML = (mastered ? "(Mastered - formerly " : active ? "(" : "(Inactive - ") + (typeData[e].anti ? "anti-" : "") + typeData[e].type.toUpperCase() + "-type boost" + (mastered ? ")" : " - Get " + getFullExpansion(enB.getMastered(type, e)) + " " + typeData.name + " Boosters to master)") + (typeData[e].activeDispReq ? "<br>Requirement: " + typeData[e].activeDispReq() : "")
			}
		}

		if (type == "pos") pos.updateCloud()
	},
	updateOnTick(type) {
		var data = this[type]

		if (getEl("enB_" + type + "_eng") !== null) getEl("enB_" + type + "_eng").textContent = shorten(data.engAmt())
		getEl("enB_" + type + "_buy").className = data.engAmt() >= data.cost() ? "storebtn" : "unavailablebtn"

		for (var i = 1; i <= data.max; i++) {
			if (!this.has(type, i)) break
			if (enB_tmp[type + i] !== undefined) getEl("enB_" + type + i + "_eff").innerHTML = data[i].effDisplay(enB_tmp[type + i])
			getEl("enB_" + type + i + "_name").textContent = shiftDown ? (data[i].title || "Unknown title.") : (data.name + " Boost #" + i)
			if (type == "pos") getEl("enB_pos" + i + "_full").innerHTML = "Tier " + enB.pos.lvl(i) + " - " + (!enB.mastered("pos", i) && !enB.colorMatch("pos", i) ? "Mismatched (No self-boost)" : "Self-boost is at " + shorten(enB.pos.chargeReq(i)) + " charge")
		}
	}
}
var enB_tmp = {}
let ENTANGLED_BOOSTS = enB

function gainQKOnQuantum(qkGain) {
	if (!QCs.inAny()) {
		qu_save.quarks = qu_save.quarks.add(qkGain)
		if (!tmp.ngp3 || player.ghostify.milestones < 8) qu_save.quarks = qu_save.quarks.round()
	}

	var oldGluUnl = enB.glu.unl()

	var u = qu_save.usedQuarks
	var g = qu_save.gluons
	var p = ["rg", "gb", "br"]
	var d = []
	for (var c = 0; c < 3; c++) d[c] = u[p[c][0]].min(u[p[c][1]])
	for (var c = 0; c < 3; c++) {
		g[p[c]] = g[p[c]].add(d[c]).round()
		u[p[c][0]] = u[p[c][0]].sub(d[c]).round()
	}

	updateQuantumWorth()
	updateColorCharge()

	updateQEGainTmp()
	gainQuantumEnergy()

	if (enB.glu.unl() && !oldGluUnl) $.notify("Congratulations, you have unlocked Anti-Gluons!")
}

//Display
function updateQuarksTab(tab) {
	getEl("redPower").textContent = shorten(qu_save.colorPowers.r)
	getEl("greenPower").textContent = shorten(qu_save.colorPowers.g)
	getEl("bluePower").textContent = shorten(qu_save.colorPowers.b)

	getEl("redTranslation").textContent = formatPercentage(colorBoosts.r - 1)
	getEl("greenTranslation").textContent = shorten(colorBoosts.g)
	getEl("blueTranslation").textContent = shorten(colorBoosts.b)
	getEl("blueTransInfo").textContent = shiftDown ? "(Base: " + shorten(colorBoosts.b_base) + ", raised by ^" + shorten(colorBoosts.b_exp) + ")" : ""

	getEl("quarkEnergyEffect1").textContent = formatPercentage(tmp.qe.eff1 - 1)
	getEl("quarkEnergyEffect2").textContent = shorten(tmp.qe.eff2)

	if (player.ghostify.milestones >= 8) {
		var assortAmount = getAssortAmount()
		var colors = ['r','g','b']
		getEl("assort_amount").textContent = shortenDimensions(assortAmount.times(getQuarkAssignMult()))
		getEl("assignAllButton").className = (assortAmount.lt(1) ? "unavailabl" : "stor") + "ebtn"
		updateQuantumWorth("display")
	}
}

function updateGluonsTab() {
	let colors = ['r','g','b']

	if (player.ghostify.milestones >= 8) updateGluonsTabOnUpdate("display")

	for (var c = 0; c < 3; c++) {
		var color = colors[c]
		getEl(color + "PowerBuff").textContent = shorten(tmp.glB[color].mult)
		getEl(color + "PowerNerf").textContent = shorten(tmp.glB[color].sub)
		getEl(color + colors[(c + 1) % 3]).textContent = shortenDimensions(qu_save.gluons[color + colors[(c + 1) % 3]])
	}

	enB.updateOnTick("glu")
}

//Display: On load
function updateQuarksTabOnUpdate(mode) {
	var colors = ['r','g','b']
	if (colorCharge.normal.charge == 0) {
		getEl("colorCharge").innerHTML = 'neutral charge'
		getEl("colorChargeAmt").innerHTML = 0
		getEl("colorChargeColor").className = "black"

		getEl("neutralize_req").innerHTML = 0
		getEl("neutralize_quarks").className = "unavailablebtn"
	} else {
		var color = colorShorthands[colorCharge.normal.color]
		getEl("colorCharge").innerHTML =
			'<span class="' + color + '">' + color + '</span> charge of <span class="'+color+'" style="font-size:35px">' + shorten(colorCharge.normal.charge * tmp.qe.eff1) + "</span>" +
			(hasAch("ng3p13") ? ", which cancelling the subtraction of gluon effects by " + shorten(colorCharge.subCancel) : "")
		getEl("colorChargeAmt").innerHTML = shortenDimensions(colorCharge.normal.chargeAmt) + " " + color + " anti-quarks"
		getEl("colorChargeColor").className = color

		getEl("neutralize_req").innerHTML = shortenDimensions(colorCharge.neutralize.total)
		getEl("neutralize_quarks").className = qu_save.quarks.gte(colorCharge.neutralize.total) ? "storebtn" : "unavailablebtn"
	}

	getEl("redQuarks").textContent = shortenDimensions(qu_save.usedQuarks.r)
	getEl("greenQuarks").textContent = shortenDimensions(qu_save.usedQuarks.g)
	getEl("blueQuarks").textContent = shortenDimensions(qu_save.usedQuarks.b)

	var assortAmount = getAssortAmount()
	var canAssign = assortAmount.gt(0)

	getEl("assort_amount").textContent = shortenDimensions(assortAmount.times(getQuarkAssignMult()))
	getEl("redAssort").className = canAssign ? "storebtn" : "unavailablebtn"
	getEl("greenAssort").className = canAssign ? "storebtn" : "unavailablebtn"
	getEl("blueAssort").className = canAssign ? "storebtn" : "unavailablebtn"

	var uq = qu_save.usedQuarks
	var gl = qu_save.gluons
	for (var p = 0; p < 3; p++) {
		var pair = (["rg", "gb", "br"])[p]
		var diff = uq[pair[0]].min(uq[pair[1]])
		getEl(pair + "_gain").textContent = shortenDimensions(diff)
		getEl(pair + "_prev").textContent = shortenDimensions(uq[pair[0]])
		getEl(pair + "_next").textContent = shortenDimensions(uq[pair[0]].sub(diff).round())
	}
	getEl("assignAllButton").className = canAssign ? "storebtn" : "unavailablebtn"
	if (hasMTS("d13")) {
		getEl("redQuarksToD").textContent = shortenDimensions(qu_save.usedQuarks.r)
		getEl("greenQuarksToD").textContent = shortenDimensions(qu_save.usedQuarks.g)
		getEl("blueQuarksToD").textContent = shortenDimensions(qu_save.usedQuarks.b)	
	}
}

function updateGluonsTabOnUpdate(mode) {
	if (!tmp.ngp3) return
	else if (!qu_save.gluons.rg) {
		qu_save.gluons = {
			rg: new Decimal(0),
			gb: new Decimal(0),
			br: new Decimal(0)
		}
	}

	enB.update("glu")
	enB.update("pos")

	let typeUsed = qu_save.entColor || "rg"
	let types = ["rg", "gb", "br"]
	for (var i = 0; i < types.length; i++) {
		var type = types[i]
		getEl("entangle_" + type).className = "gluonupgrade " + type
		getEl("entangle_" + type + "_pos").className = "gluonupgrade " + type
		getEl("entangle_" + type + "_bonus").innerHTML = "<br>"
	}

	getEl("entangle_" + typeUsed).className = "gluonupgrade chosenbtn"
	getEl("entangle_" + typeUsed + "_pos").className = "gluonupgrade  chosenbtn"
	getEl("entangle_" + typeUsed + "_bonus").textContent = "Entanglement Bonus: +" + shorten(getQEGluonsPortion() * tmp.qe.mult / tmp.qe.div) + " quantum energy"

	getEl("masterNote").style.display = enB.mastered("glu", 1) ? "" : "none"
}

//Quarks animation
var quarks={}
var centerX
var centerY
var maxDistance
var code

function drawQuarkAnimation(ts){
	centerX = canvas.width/2
	centerY = canvas.height/2
	maxDistance = Math.sqrt(Math.pow(centerX,2)+Math.pow(centerY,2))
	code = player.options.theme=="Aarex's Modifications"?"e5":"99"
	if (getEl("quantumtab").style.display !== "none" && getEl("uquarks").style.display !== "none" && player.options.animations.quarks) {
		qkctx.clearRect(0, 0, canvas.width, canvas.height);
		quarks.sum = qu_save.colorPowers.r + qu_save.colorPowers.g + qu_save.colorPowers.b
		quarks.amount=Math.ceil(Math.min(quarks.sum, 200))
		for (p=0;p<quarks.amount;p++) {
			var particle=quarks['p'+p]
			if (particle==undefined) {
				particle={}
				var random=Math.random()
				if (random<=qu_save.colorPowers.r/quarks.sum) particle.type='r'
				else if (random>=1-qu_save.colorPowers.b/quarks.sum) particle.type='b'
				else particle.type='g'
				particle.motion=Math.random()>0.5?'in':'out'
				particle.direction=Math.random()*Math.PI*2
				particle.distance=Math.random()
				quarks['p'+p]=particle
			} else {
				particle.distance+=0.01
				if (particle.distance>=1) {
					var random=Math.random()
					if (random<=qu_save.colorPowers.r/quarks.sum) particle.type='r'
					else if (random>=1-qu_save.colorPowers.b/quarks.sum) particle.type='b'
					else particle.type='g'
					particle.motion=Math.random()>0.5?'in':'out'
					particle.direction=Math.random()*Math.PI*2
					particle.distance=0
				}
				var actualDistance=particle.distance*maxDistance
				if (particle.motion=="in") actualDistance=maxDistance-actualDistance
				qkctx.fillStyle=particle.type=="r"?"#"+code+"0000":particle.type=="g"?"#00"+code+"00":"#0000"+code
				point(centerX+Math.sin(particle.direction)*actualDistance, centerY+Math.cos(particle.direction)*actualDistance, qkctx)
			}
		}
		delta = (ts - lastTs) / 1000;
		lastTs = ts;
		requestAnimationFrame(drawQuarkAnimation);
	}
}

//Quantum Tiers: Strong boosts to Color Powers
let QT = {
	effs: {
		qe: () => qu_save.quarkEnergy,
		cc: () => colorCharge.normal.amt,
		gb_rg: () => qu_save.gluons.rg,
		gb_gb: () => qu_save.gluons.gb,
		gb_br: () => qu_save.gluons.br,
	},
	tiers: {
		qe: () => 1,
		cc: () => 1,
		gl_rg: () => 1,
		gl_gb: () => 1,
		gl_br: () => 1
	},
	funcs: {
		1(x, y) { //Add
			return x.add(y)
		},
		2(x, y) { //Multiply
			y = y.add(1).log10() + 1
			return x.times(y)
		},
		3(x, y) { //Exponent
			y = Math.log10(y.add(1).log10() + 1) + 1
			return x.pow(y)
		},
		4(x, y) { //Anti-Dilation
			y = 1 - 1 / (Math.log10(y.add(1).log10() + 1) / 2 + 1)
			return x.pow(Math.pow(Decimal.max(x, 1).log10(), y))
		},
		5(x, y, t) { //Superexponent
			y = 0
			return x.pow(Math.pow(2, Math.pow(x.max(1).log(2), 0.1) * y))
		}
	},
	boost(x, type, tier) {
		if (!tier) tier = QT.tiers[type]()

		x = new Decimal(x)
		let eff = new Decimal(QT.effs[type]())

		return QT.funcs[tier](x, eff)
	}
}