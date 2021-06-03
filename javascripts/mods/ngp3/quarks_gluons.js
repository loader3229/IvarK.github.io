//Quantum worth
var quantumWorth
function updateQuantumWorth(mode) {
	if (!tmp.ngp3) return
	if (player.ghostify.milestones<8) {
		if (mode != "notation") mode=undefined
	} else if (mode == "notation") return
	if (mode != "notation") {
		if (mode != "display") {
			quantumWorth = tmp.qu.quarks.add(tmp.qu.usedQuarks.r).add(tmp.qu.usedQuarks.g).add(tmp.qu.usedQuarks.b).add(tmp.qu.gluons.rg).add(tmp.qu.gluons.gb).add(tmp.qu.gluons.br).round()
		}
		if (player.ghostify.times) {
			var automaticCharge = Math.max(Math.log10(quantumWorth.add(1).log10() / 150) / Math.log10(2), 0) + Math.max(tmp.qu.bigRip.spaceShards.add(1).log10() / 20 - 0.5, 0)
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
	return tmp.qu.assortPercentage ? tmp.qu.assortPercentage : 100
}

function getAssortAmount() {
	return tmp.qu.quarks.floor().min(tmp.qu.quarks).times(getAssortPercentage() / 100).round()
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
	tmp.qu.assortPercentage = Math.max(Math.min(parseFloat(x || getEl("assort_percentage").value), 100), 0)
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
	tmp.qu.usedQuarks[color] = tmp.qu.usedQuarks[color].add(usedQuarks.times(mult)).round()
	tmp.qu.quarks = tmp.qu.quarks.sub(usedQuarks)
	getEl("quarks").innerHTML = "You have <b class='QKAmount'>0</b> quarks."
	if (!mult.eq(1)) updateQuantumWorth()
	updateColorCharge()
	if (player.ghostify.another > 0) player.ghostify.another--
}

function assignAll(auto) {
	var ratios = tmp.qu.assignAllRatios
	var sum = ratios.r+ratios.g+ratios.b
	var oldQuarks = getAssortAmount()
	var colors = ['r','g','b']
	var mult = getQuarkAssignMult()
	for (c = 0; c < 3; c++) {
		var toAssign = oldQuarks.times(ratios[colors[c]]/sum).round()
		if (toAssign.gt(0)) {
			tmp.qu.usedQuarks[colors[c]] = tmp.qu.usedQuarks[colors[c]].add(toAssign.times(mult)).round()
			if (player.ghostify.another > 0) player.ghostify.another--
		}
	}
	tmp.qu.quarks = tmp.qu.quarks.sub(oldQuarks).round()
	if (tmp.qu.autoOptions.assignQKRotate) {
		if (tmp.qu.autoOptions.assignQKRotate > 1) {
			tmp.qu.assignAllRatios = {
				r: tmp.qu.assignAllRatios.g,
				g: tmp.qu.assignAllRatios.b,
				b: tmp.qu.assignAllRatios.r
			}
		} else tmp.qu.assignAllRatios = {
			r: tmp.qu.assignAllRatios.b,
			g: tmp.qu.assignAllRatios.r,
			b: tmp.qu.assignAllRatios.g
		}
		var colors = ['r','g','b']
		for (c = 0; c < 3; c++) getEl("ratio_" + colors[c]).value = tmp.qu.assignAllRatios[colors[c]]
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
		getEl("ratio_" + color).value = tmp.qu.assignAllRatios[color]
		return
	}
	var sum = 0
	var colors = ['r','g','b']
	for (c = 0; c < 3; c++) sum += colors[c] == color ? value : tmp.qu.assignAllRatios[colors[c]]
	if (sum == 0 || sum == 1/0) {
		getEl("ratio_" + color).value = tmp.qu.assignAllRatios[color]
		return
	}
	tmp.qu.assignAllRatios[color] = value
}

function toggleAutoAssign() {
	tmp.qu.autoOptions.assignQK = !tmp.qu.autoOptions.assignQK
	getEl('autoAssign').textContent="Auto: O"+(tmp.qu.autoOptions.assignQK?"N":"FF")
	if (tmp.qu.autoOptions.assignQK && tmp.qu.quarks.gt(0)) assignAll(true)
}

function rotateAutoAssign() {
	tmp.qu.autoOptions.assignQKRotate=tmp.qu.autoOptions.assignQKRotate?(tmp.qu.autoOptions.assignQKRotate+1)%3:1
	getEl('autoAssignRotate').textContent="Rotation: "+(tmp.qu.autoOptions.assignQKRotate>1?"Left":tmp.qu.autoOptions.assignQKRotate?"Right":"None")
}

function neutralize_quarks() {
	if (colorCharge.normal.chargeAmt.eq(0) || !tmp.qu.quarks.gte(colorCharge.neutralize.total)) return

	var sum = 0
	var colors = ['r','g','b']
	for (var c = 0; c < 3; c++) {
		var color = colors[c]
		tmp.qu.usedQuarks[color] = tmp.qu.usedQuarks[color].add(colorCharge.neutralize[color]).round()
	}
	tmp.qu.quarks = tmp.qu.quarks.sub(colorCharge.neutralize.total)

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
	var usedQuarks = tmp.qu.usedQuarks

	var colors = ['r', 'g', 'b']
	var colorPowers = {}
	for (var i = 0; i < 3; i++) {
		var ret = Decimal.add(usedQuarks[colors[i]], 1). log10()
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
		charge: QCs.in(2) ? 0 : colorPowers[sorted[0]] * Decimal.div(
			Decimal.sub(usedQuarks[sorted[0]], usedQuarks[sorted[1]]),
			Decimal.add(usedQuarks[sorted[0]], 1)
		)
	}
	if (player.ghostify.milestones <= 2) colorCharge[sorted[0]] = colorCharge.normal.charge
	if (usedQuarks[sorted[0]] > 0 && colorCharge.normal.charge == 0) giveAchievement("Hadronization")

	colorCharge.subCancel = hasAch("ng3p13") && !QCs.in(2) ? Math.pow(colorCharge.normal.charge * 2, 1.5) : 0

	colorCharge.neutralize = {}
	colorCharge.neutralize[sorted[0]] = new Decimal(0)
	colorCharge.neutralize[sorted[1]] = Decimal.sub(usedQuarks[sorted[0]], usedQuarks[sorted[1]]).round()
	colorCharge.neutralize[sorted[2]] = Decimal.sub(usedQuarks[sorted[0]], usedQuarks[sorted[2]]).round()
	colorCharge.neutralize.total = colorCharge.neutralize[sorted[1]].add(colorCharge.neutralize[sorted[2]]).round()

	updateQuarksTabOnUpdate()
}

function getColorPowerQuantity(color) {
	if (QCs.in(2)) return 0

	let ret = colorCharge[color] * tmp.glB[color].mult
	if (tmp.qkEng) ret = ret * tmp.qkEng.eff1 + tmp.qkEng.eff2
	if (tmp.glB) ret = ret - tmp.glB[color].sub
	return Math.max(ret, 0)
}

colorBoosts = {
	r: 1,
	g: 1,
	b: 1
}

function updateColorPowers() {
	//Red
	colorBoosts.r = Math.log10(tmp.qu.colorPowers.r * 15 + 1) / 3.5 + 1

	//Green
	colorBoosts.g = Math.log10(tmp.qu.colorPowers.g * 3 + 1) * 2 + 1
	if (enB.active("pos", 7)) colorBoosts.g += enB.tmp.pos7

	//Blue
	colorBoosts.b = Math.pow(Math.max(tmp.qu.colorPowers.b * 1.5 + 1, 1), 2)
}

//Gluons
function gainQuantumEnergy() {
	let x = (getQEQuarksPortion() + getQEGluonsPortion()) * (getQuantumEnergyMult() - getQuantumEnergySubMult())

	tmp.qu.quarkEnergy = Math.max(x, tmp.qu.quarkEnergy)
	tmp.qu.quarkEnergy = isNaN(tmp.qu.quarkEnergy) ? 0 : tmp.qu.quarkEnergy
	tmp.qu.bestEnergy = Math.max(tmp.qu.bestEnergy || 0, tmp.qu.quarkEnergy)
}

function getQEQuarksPortion() {
	if (QCs.in(2)) return 0
	let exp = enB.active("pos", 4) ? enB.tmp.pos4 : hasAch("ng3p14") ? 0.5 : 1 / 3
	return Math.pow(quantumWorth.add(1).log10(), exp) * 1.25
}

function getQEGluonsPortion() {
	if (QCs.in(2)) return 0
	let exp = enB.active("pos", 4) ? enB.tmp.pos4 : hasAch("ng3p14") ? 0.5 : 1 / 3
	return Math.pow(tmp.qu.gluons[tmp.qu.entColor || "rg"].add(1).log10(), exp) * 0.25
}

function getQuantumEnergyMult() {
	if (QCs.in(2)) return 0
	let x = 1
	if (dev.boosts.tmp[1]) x += dev.boosts.tmp[1]
	if (enB.active("glu", 1)) x += enB.tmp.glu1
	if (enB.active("pos", 1)) x += enB.tmp.pos1
	return x
}

function getQuantumEnergySubMult() {
	if (pos.on()) return pos.tmp.sac_qem
	return 0
}

function updateQuarkEnergyEffects() {
	let expReduction = enB.active("pos", 4) ? Math.sqrt(1 / (enB.tmp.pos4 * 3)) : 1

	tmp.qkEng = {}
	tmp.qkEng.eff1 = Math.pow(Math.log10(tmp.totalQE / 1.7 + 1) + 1, 2 * expReduction)
	tmp.qkEng.eff2 = Math.pow(tmp.totalQE, 2 * expReduction) * tmp.qkEng.eff1 / 4
}

function buyQuarkMult(name) {
	var cost = Decimal.pow(100, tmp.qu.multPower[name] + Math.max(tmp.qu.multPower[name] - 467, 0)).times(500)
	if (tmp.qu.gluons[name].lt(cost)) return
	tmp.qu.gluons[name] = tmp.qu.gluons[name].sub(cost).round()
	tmp.qu.multPower[name]++
	tmp.qu.multPower.total++
	updateGluonsTab("spend")
	if (tmp.qu.autobuyer.mode === 'amount') {
		tmp.qu.autobuyer.limit = Decimal.times(tmp.qu.autobuyer.limit, 2)
		getEl("priorityquantum").value = formatValue("Scientific", tmp.qu.autobuyer.limit, 2, 0);
	}
}

function maxQuarkMult() {
	var names = ["rg", "gb", "br"]
	var bought = 0
	for (let c = 0; c < 3; c++) {
		var name = names[c]
		var buying = true
		while (buying) {
			var cost = Decimal.pow(100, tmp.qu.multPower[name] + Math.max(tmp.qu.multPower[name] - 467, 0)).times(500)
			if (tmp.qu.gluons[name].lt(cost)) buying = false
			else if (tmp.qu.multPower[name] < 468) {
				var toBuy = Math.min(Math.floor(tmp.qu.gluons[name].div(cost).times(99).add(1).log(100)),468-tmp.qu.multPower[name])
				var toSpend = Decimal.pow(100, toBuy).sub(1).div(99).times(cost)
				if (toSpend.gt(tmp.qu.gluons[name])) tmp.qu.gluons[name]=new Decimal(0)
				else tmp.qu.gluons[name] = tmp.qu.gluons[name].sub(toSpend).round()
				tmp.qu.multPower[name] += toBuy
				bought += toBuy
			} else {
				var toBuy=Math.floor(tmp.qu.gluons[name].div(cost).times(9999).add(1).log(1e4))
				var toSpend=Decimal.pow(1e4, toBuy).sub(1).div(9999).times(cost)
				if (toSpend.gt(tmp.qu.gluons[name])) tmp.qu.gluons[name]=new Decimal(0)
				else tmp.qu.gluons[name] = tmp.qu.gluons[name].sub(toSpend).round()
				tmp.qu.multPower[name] += toBuy
				bought += toBuy
			}
		}
	}
	tmp.qu.multPower.total += bought
	if (tmp.qu.autobuyer.mode === 'amount') {
		tmp.qu.autobuyer.limit = Decimal.times(tmp.qu.autobuyer.limit, Decimal.pow(2, bought))
		getEl("priorityquantum").value = formatValue("Scientific", tmp.qu.autobuyer.limit, 2, 0)
	}
	updateGluonsTabOnUpdate("spend")
}

function updateGluonicBoosts() {
	tmp.glB = {}

	let data = tmp.glB
	let enBData = enB
	let gluons = tmp.qu.gluons

	data.r = { mult: getGluonEffBuff(gluons.rg), sub: getGluonEffNerf(gluons.br) } //x -> x * [RG effect] - [BR effect]
	data.g = { mult: getGluonEffBuff(gluons.gb), sub: getGluonEffNerf(gluons.rg) } //x -> x * [GB effect] - [RG effect]
	data.b = { mult: getGluonEffBuff(gluons.br), sub: getGluonEffNerf(gluons.gb) } //x -> x * [BR effect] - [GB effect]

	let type = tmp.qu.entColor || "rg"
	data.enAmt = enBData.glu.gluonEff(gluons[type])
	data.masAmt = enBData.glu.gluonEff(gluons.rg.add(gluons.gb).add(gluons.br))

	enB.updateTmp()
}

function getGluonEffBuff(x) {
	if (QCs.in(2)) return 0
	return Math.log10(Decimal.add(x, 1).log10() * 5 + 1) + 1
}

function getGluonEffNerf(x) {
	if (QCs.in(2)) return 0
	return Math.max(Math.pow(Decimal.add(x, 1).log10(), masteryStudies.has(302) ? 1.8 : 2) - colorCharge.subCancel, 0)
}

let enB = {
	buy(type) {
		let data = this[type]
		if (!data.unl()) return
		if (!(data.engAmt() >= data.cost())) return
		data.set(data.amt() + 1)
		updateGluonicBoosts()
		enB.update(type)
	},
	maxBuy(type) {
		let data = this[type]
		if (!data.unl()) return
		if (!(data.engAmt() >= data.cost())) return
		data.set(data.target())
		updateGluonicBoosts()
		enB.update(type)
	},

	has(type, x) {
		let data = this[type]
		return this[type].unl() && data.amt() >= data[x].req
	},
	active(type, x) {
		let data = this[type][x]

		if (enB.tmp === undefined || enB.tmp[type + x] === undefined) return false

		if (!this.has(type, x)) return false
		if (data.activeReq && !data.activeReq()) return false

		if (this.mastered(type, x)) return true

		let gluon = tmp.qu.entColor || "rg"
		return data.type == gluon[0] || data.type == gluon[1]
	},
	mastered(type, x) {
		let data = this[type]
		return data.amt() >= this.getMastered(type, x)
	},
	getMastered(type, x) {
		let data = this[type]
		return (tmp.ngex && data[x].masReqExpert) || data[x].masReq
	},

	choose(x) {
		if ((tmp.qu.entColor || "rg") == x) return
		if (!tmp.qu.entBoosts || tmp.qu.gluons.rg.max(tmp.qu.gluons.gb).max(tmp.qu.gluons.br).eq(0)) {
			alert("You need to get at least 1 Entangled Boost and have gluons before choosing a type!")
			return
		}
		if (!confirm("This will perform a quantum reset without gaining anything. Are you sure?")) return
		tmp.qu.entColor = x
		quantum(false, true)
	},

	tmp: {
	},
	updateTmp() {
		let data = {}
		enB.tmp = data
	
		for (var x = 0; x < enB.priorities.length; x++) {
			var boost = enB.priorities[x]
			var type = boost[0]
			var num = boost[1]

			if (enB.has(type, num)) {
				var eff = enB[type][num].eff
				if (eff !== undefined) data[type + num] = eff(enB[type].eff(num))
			}
		}
	},

	types: ["glu", "pos"],
	priorities: [
		["glu", 4],
		["pos", 1], ["pos", 2], ["pos", 3], ["pos", 4], ["pos", 5], ["pos", 6], ["pos", 7], ["pos", 8], ["pos", 9], ["pos", 10],
		["glu", 1], ["glu", 2], ["glu", 3], ["glu", 5], ["glu", 6], ["glu", 7], ["glu", 8], ["glu", 9], ["glu", 10],
	],
	glu: {
		name: "Entangled",
		unl() {
			return tmp.quActive
		},

		cost(x) {
			if (x === undefined) x = this.amt()
			return Math.pow(x / 3, 1.5) + 1
		},
		target() {
			return Math.floor(Math.pow(Math.max(this.engAmt() - 1, 0), 1 / 1.5) * 3 + 1)
		},

		amt() {
			return tmp.qu.entBoosts || 0
		},
		engAmt() {
			return tmp.qu.bestEnergy
		},
		set(x) {
			tmp.qu.entBoosts = x
		},

		eff(x) {
			if (QCs.in(2)) return 0

			let r = Math.max(this.amt() * 2 / 3 - 1, 1)
			r *= tmp.glB[enB.mastered("glu", x) ? "masAmt" : "enAmt"]
			return r
		},
		gluonEff(x) {
			if (QCs.in(2)) return 0
			return Decimal.add(x, 1).log10()
		},

		max: 10,
		1: {
			req: 1,
			masReq: 4,
			masReqExpert: 5,
			type: "r",
			activeReq: () => !QCs.in(2),

			eff(x) {
				return Math.cbrt(x) * 0.75
			},
			effDisplay(x) {
				return shorten(x)
			}
		},
		2: {
			req: 3,
			masReq: 7,
			masReqExpert: 9,
			type: "g",
			activeReq: () => !QCs.in(2),

			eff(x) {
				return Math.log10(x * 2 + 1) * 1.5 + 1
			},
			effDisplay(x) {
				return x.toFixed(3)
			}
		},
		3: {
			req: 6,
			masReq: 8,
			masReqExpert: 9,
			type: "r",
			activeReq: () => !QCs.in(2),

			eff(x) {
				return Math.sqrt(x) * 20
			},
			effDisplay(x) {
				return shorten(x)
			}
		},
		4: {
			req: 7,
			masReq: 10,
			type: "b",
			activeReq: () => !QCs.in(2),

			eff(x) {
				if (pos.on()) {
					x = Math.sqrt(x / 5 + 1)
					if (x > 4) x = 5 - 4 / x
					return x
				} else {
					return Math.sqrt(x) * 100
				}
			},
			effDisplay(x) {
				return pos.on() ? "Positrons on: Increase the power of Dimensional Positronic Charge by <span style='font-size:25px'>" + formatPercentage(x - 1) + "</span>%."
				: "Positrons off: Strengthen all effects for mastered Positronic Boosts by +<span style='font-size:25px'>" + shorten(x) + "</span> charge."
			}
		},
		5: {
			req: 11,
			masReq: 1/0,
			type: "b",
			activeReq: () => !QCs.in(2),

			eff(x) {
				return Math.pow(x / 3 + 1, 0.2)
			},
			effDisplay(x) {
				return formatReductionPercentage(x, 2, 3)
			}
		},
		6: {
			req: 15,
			masReq: 15,

			//Temp
			activeReq: () => false,
			activeDispReq: () => "(disabled due to not checking its balancing)",

			type: "g",
			eff(x) {
				return Math.pow(Math.log2(x + 1) / 2 + 1, 2)
			},
			effDisplay(x) {
				return shorten(x)
			}
		},
		7: {
			req: 15,
			masReq: 15,

			//Temp
			activeReq: () => false,
			activeDispReq: () => "(disabled due to not checking its balancing)",

			type: "r",
			eff(x) {
				let exp = 1
				return Math.pow(getReplGalaxyEff(), exp)
			},
			effDisplay(x) {
				return formatPercentage(x - 1)
			}
		},
		8: {
			req: 15,
			masReq: 15,

			//Temp
			activeReq: () => false,
			activeDispReq: () => "(disabled due to not checking its balancing)",

			type: "b",
			eff(x) {
				return 1.25 - 0.25 / Math.sqrt(x / 100 + 1)
			},
			effDisplay(x) {
				return "x^" + x.toFixed(3)
			}
		},
		9: {
			req: 15,
			masReq: 15,

			//Temp
			activeReq: () => false,
			activeDispReq: () => "(disabled due to not checking its balancing)",

			type: "g",
			eff(x) {
				return Math.sqrt(9 - 8 / (Math.log2(x + 1) + 1))
			},
			effDisplay(x) {
				return x.toFixed(3)
			}
		},
		10: {
			req: 15,
			masReq: 15,

			//Temp
			activeReq: () => false,
			activeDispReq: () => "(disabled due to not checking its balancing)",

			type: "g",
			eff(x) {
				return Math.floor(Math.pow(x, 0.1))
			},
			effDisplay(x) {
				return getFullExpansion(x)
			}
		}
	},
	pos: {
		name: "Positronic",
		unl() {
			return pos.unl()
		},

		cost(x) {
			if (x === undefined) x = this.amt()
			return Math.pow(x / 2 + 1, 1.5) * 200
		},
		target() {
			return Math.floor((Math.pow(this.engAmt() / 200, 1 / 1.5) - 1) * 2 + 1)
		},

		amt() {
			return pos.save.boosts
		},
		engAmt() {
			return pos.save.eng
		},
		set(x) {
			pos.save.boosts = x
		},

		eff() {
			if (QCs.in(2)) return 0
			return this.engAmt() * 1.8
		},
		masEff(x) {
			x /= 2
			if (enB.active("glu", 4) && !pos.on()) x += enB.tmp.glu4
			return x
		},

		max: 10,
		1: {
			req: 1,
			masReq: 2,

			chargeReq: 250,
			activeReq() {
				if (QCs.in(2)) return false
				return enB.mastered("pos", 1) || pos.save.eng >= this.chargeReq
			},
			activeDispReq() {
				return shorten(this.chargeReq) + " Positronic Charge" + (enB.mastered("pos", 1) ? " (full effect)" : "")
			},

			type: "g",
			eff(x) {
				if (enB.mastered("pos", 1)) x = Math.max(x, enB.pos.masEff(enB.pos[1].chargeReq))
				let cof = Math.max(x / 1e4, 1)

				return Math.pow(x / 2e3, 2 - 1 / cof) / Math.log10(cof + 10) + Math.pow(x / 2e3, 0.5 / cof)
			},
			effDisplay(x) {
				return shorten(x)
			}
		},
		2: {
			req: 1,
			masReq: 5,
			masReqExpert: 6,

			chargeReq: 200,
			activeReq() {
				if (QCs.in(2)) return false
				return enB.mastered("pos", 2) || pos.save.eng >= this.chargeReq
			},
			activeDispReq() {
				return shorten(this.chargeReq) + " Positronic Charge" + (enB.mastered("pos", 2) ? " (full effect)" : "")
			},

			type: "r",
			eff(x) {
				return Math.pow(player.meta.bestAntimatter.add(1).log10() / 100 + 1, 2)
			},
			effDisplay(x) {
				return shorten(x)
			}
		},
		3: {
			req: 1,
			masReq: 3,
			masReqExpert: 5,

			chargeReq: 350,
			activeReq() {
				if (QCs.in(2)) return false
				return enB.mastered("pos", 3) || pos.save.eng >= this.chargeReq
			},
			activeDispReq() {
				return shorten(this.chargeReq) + " Positronic Charge" + (enB.mastered("pos", 3) ? " (full effect)" : "")
			},

			type: "b",
			eff(x) {
				if (enB.mastered("pos", 3)) x = Math.max(x, enB.pos.masEff(enB.pos[3].chargeReq))
				x = Math.log10(x / 4e3 + 1) + 1
				if (x > 2) x = 3 - 2 / x
				return x
			},
			effDisplay(x) {
				return shorten(Decimal.pow(Number.MAX_VALUE, 1.2 / x))
			}
		},
		4: {
			req: 4,
			masReq: 10,

			//Temp
			chargeReq: 750,
			activeReq() {
				if (QCs.in(2)) return false
				return enB.mastered("pos", 4) || pos.save.eng >= this.chargeReq
			},
			activeDispReq() {
				return shorten(this.chargeReq) + " Positronic Charge" + (enB.mastered("pos", 4) ? " (full effect)" : "")
			},

			type: "g",
			eff(x) {
				x = player.meta.resets
				return 1 / ((hasAch("ng3p14") ? 1 : 2) + 1 / (x / 50 + 1))
			},
			effDisplay(x) {
				return x.toFixed(3)
			}
		},
		5: {
			req: 15,
			masReq: 15,

			//Temp
			activeReq: () => false,
			activeDispReq: () => "(disabled due to not checking its balancing)",

			/*
			chargeReq: 1e5,
			activeReq() {
				return enB.mastered("pos", 5) || pos.save.eng >= this.chargeReq
			},
			activeDispReq() {
				return shorten(this.chargeReq) + " Positronic Charge" + (enB.mastered("pos", 5) ? " (full effect)" : "")
			},
			*/

			type: "r",
			eff(x) {
				return 0
			},
			effDisplay(x) {
				return formatPercentage(x)
			}
		},
		6: {
			req: 15,
			masReq: 15,

			//Temp
			activeReq: () => false,
			activeDispReq: () => "(disabled due to not checking its balancing)",

			/*
			chargeReq: 1e5,
			activeReq() {
				return enB.mastered("pos", 6) || pos.save.eng >= this.chargeReq
			},
			activeDispReq() {
				return shorten(this.chargeReq) + " Positronic Charge" + (enB.mastered("pos", 6) ? " (full effect)" : "")
			},
			*/

			type: "r",
			eff(x) {
				let exp = 1 - 1 / Math.sqrt(Math.log2(x + 1) / 2 + 1)
				return Math.pow(getReplGalaxyEff(), exp)
			},
			effDisplay(x) {
				return formatPercentage(x - 1)
			}
		},
		7: {
			req: 15,
			masReq: 15,

			//Temp
			activeReq: () => false,
			activeDispReq: () => "(disabled due to not checking its balancing)",

			/*
			chargeReq: 1e5,
			activeReq() {
				return enB.mastered("pos", 7) || pos.save.eng >= this.chargeReq
			},
			activeDispReq() {
				return shorten(this.chargeReq) + " Positronic Charge" + (enB.mastered("pos", 7) ? " (full effect)" : "")
			},
			*/

			type: "r",
			eff(x) {
				return Math.log10(x / 1e3 + 1) / 5 + 1
			},
			effDisplay(x) {
				return formatPercentage(x - 1)
			}
		},
		8: {
			req: 15,
			masReq: 15,

			//Temp
			activeReq: () => false,
			activeDispReq: () => "(disabled due to not checking its balancing)",

			/*
			chargeReq: 1e5,
			activeReq() {
				return enB.mastered("pos", 8) || pos.save.eng >= this.chargeReq
			},
			activeDispReq() {
				return shorten(this.chargeReq) + " Positronic Charge" + (enB.mastered("pos", 8) ? " (full effect)" : "")
			},
			*/

			type: "r",
			eff(x) {
				let exp = 1
				return Math.pow(tsMults[232](), exp)
			},
			effDisplay(x) {
				return formatPercentage(x - 1)
			}
		},
		9: {
			req: 15,
			masReq: 15,

			//Temp
			activeReq: () => false,
			activeDispReq: () => "(disabled due to not checking its balancing)",

			/*
			chargeReq: 1e5,
			activeReq() {
				return enB.mastered("pos", 9) || pos.save.eng >= this.chargeReq
			},
			activeDispReq() {
				return shorten(this.chargeReq) + " Positronic Charge" + (enB.mastered("pos", 9) ? " (full effect)" : "")
			},
			*/

			type: "r",
			eff(x) {
				return 0
			},
			effDisplay(x) {
				return x.toFixed(3)
			}
		},
		10: {
			req: 15,
			masReq: 15,

			//Temp
			activeReq: () => false,
			activeDispReq: () => "(disabled due to not checking its balancing)",

			/*
			chargeReq: 1/0,
			activeReq() {
				return enB.mastered("pos", 10) || pos.save.eng >= this.chargeReq
			},
			activeDispReq() {
				return shorten(this.chargeReq) + " Positronic Charge" + (enB.mastered("pos", 10) ? " (full effect)" : "")
			},
			*/

			type: "r",
			eff(x) {
				return Math.sqrt(1 / (Math.log2(x) / 2 + 1))
			},
			effDisplay(x) {
				return x.toFixed(3)
			}
		}
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
				el.parentElement.className = !active ? "red" : mastered ? "yellow" : "green"
				el.textContent = (active ? "" : "Inactive ") + (mastered ? "Mastered " : "") + " " + typeData.name + " Boost #" + e

				getEl("enB_" + type + e + "_type").innerHTML = (mastered ? "(formerly " : "(") + typeData[e].type.toUpperCase() + "-type boost" + (mastered ? ")" : " - Get " + getFullExpansion(enB.getMastered(type, e)) + " " + typeData.name + " Boosters to master)") + (typeData[e].activeDispReq ? "<br>Requirement: " + typeData[e].activeDispReq() : "")
			}
		}
	},
	updateOnTick(type) {
		let data = this[type]

		if (getEl("enB_" + type + "_eng") !== null) getEl("enB_" + type + "_eng").textContent = shorten(data.engAmt())
		getEl("enB_" + type + "_buy").className = data.engAmt() >= data.cost() ? "storebtn" : "unavailablebtn"

		for (var i = 1; i <= data.max; i++) {
			if (!this.has(type, i)) break
			if (enB.tmp[type + i] !== undefined) getEl("enB_" + type + i + "_eff").innerHTML = data[i].effDisplay(enB.tmp[type + i])
		}
	}
}
let ENTANGLED_BOOSTS = enB

function gainQKOnQuantum(qkGain) {
	if (!QCs.inAny()) {
		tmp.qu.quarks = tmp.qu.quarks.add(qkGain)
		if (!tmp.ngp3 || player.ghostify.milestones < 8) tmp.qu.quarks = tmp.qu.quarks.round()
	}

	var u = tmp.qu.usedQuarks
	var g = tmp.qu.gluons
	var p = ["rg", "gb", "br"]
	var d = []
	for (var c = 0; c < 3; c++) d[c] = u[p[c][0]].min(u[p[c][1]])
	for (var c = 0; c < 3; c++) {
		g[p[c]] = g[p[c]].add(d[c]).round()
		u[p[c][0]] = u[p[c][0]].sub(d[c]).round()
	}

	updateQuantumWorth()
	updateColorCharge()
}

//Display
function updateQuarksTab(tab) {
	getEl("redPower").textContent = shorten(tmp.qu.colorPowers.r)
	getEl("greenPower").textContent = shorten(tmp.qu.colorPowers.g)
	getEl("bluePower").textContent = shorten(tmp.qu.colorPowers.b)

	getEl("redTranslation").textContent = formatPercentage(colorBoosts.r - 1)
	getEl("greenTranslation").textContent = shorten(colorBoosts.g)
	getEl("blueTranslation").textContent = shorten(colorBoosts.b)

	getEl("quarkEnergyEffect1").textContent = formatPercentage(tmp.qkEng.eff1 - 1)
	getEl("quarkEnergyEffect2").textContent = shorten(tmp.qkEng.eff2)

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
		getEl(color + colors[(c + 1) % 3]).textContent = shortenDimensions(tmp.qu.gluons[color + colors[(c + 1) % 3]])
	}

	enB.updateOnTick("glu")
}

//Display: On load
function updateQuarksTabOnUpdate(mode) {
	var colors = ['r','g','b']
	if (colorCharge.normal.charge == 0) {
		getEl("colorCharge").innerHTML = 'neutral charge'
		getEl("colorChargeAmt").innerHTML = 0

		getEl("neutralize_req").innerHTML = 0
		getEl("neutralize_quarks").className = "unavailablebtn"
	} else {
		var color = colorShorthands[colorCharge.normal.color]
		getEl("colorCharge").innerHTML =
			'<span class="' + color + '">' + color + '</span> charge of <span class="'+color+'" style="font-size:35px">' + shorten(colorCharge.normal.charge * tmp.qkEng.eff1) + "</span>" +
			(hasAch("ng3p13") ? ", which cancelling the subtraction of gluon effects by " + shorten(colorCharge.subCancel) : "")
		getEl("colorChargeAmt").innerHTML = shortenDimensions(colorCharge.normal.chargeAmt) + " " + color + " anti-quarks"

		getEl("neutralize_req").innerHTML = shortenDimensions(colorCharge.neutralize.total)
		getEl("neutralize_quarks").className = tmp.qu.quarks.gte(colorCharge.neutralize.total) ? "storebtn" : "unavailablebtn"
	}

	getEl("redQuarks").textContent = shortenDimensions(tmp.qu.usedQuarks.r)
	getEl("greenQuarks").textContent = shortenDimensions(tmp.qu.usedQuarks.g)
	getEl("blueQuarks").textContent = shortenDimensions(tmp.qu.usedQuarks.b)

	var assortAmount = getAssortAmount()
	var canAssign = assortAmount.gt(0)

	getEl("assort_amount").textContent = shortenDimensions(assortAmount.times(getQuarkAssignMult()))
	getEl("redAssort").className = canAssign ? "storebtn" : "unavailablebtn"
	getEl("greenAssort").className = canAssign ? "storebtn" : "unavailablebtn"
	getEl("blueAssort").className = canAssign ? "storebtn" : "unavailablebtn"

	var uq = tmp.qu.usedQuarks
	var gl = tmp.qu.gluons
	for (var p = 0; p < 3; p++) {
		var pair = (["rg", "gb", "br"])[p]
		var diff = uq[pair[0]].min(uq[pair[1]])
		getEl(pair + "_gain").textContent = shortenDimensions(diff)
		getEl(pair + "_prev").textContent = shortenDimensions(uq[pair[0]])
		getEl(pair + "_next").textContent = shortenDimensions(uq[pair[0]].sub(diff).round())
	}
	getEl("assignAllButton").className = canAssign ? "storebtn" : "unavailablebtn"
	if (masteryStudies.has("d13")) {
		getEl("redQuarksToD").textContent = shortenDimensions(tmp.qu.usedQuarks.r)
		getEl("greenQuarksToD").textContent = shortenDimensions(tmp.qu.usedQuarks.g)
		getEl("blueQuarksToD").textContent = shortenDimensions(tmp.qu.usedQuarks.b)	
	}
}

function updateGluonsTabOnUpdate(mode) {
	if (!tmp.ngp3) return
	else if (!tmp.qu.gluons.rg) {
		tmp.qu.gluons = {
			rg: new Decimal(0),
			gb: new Decimal(0),
			br: new Decimal(0)
		}
	}

	enB.update("glu")

	let typeUsed = tmp.qu.entColor || "rg"
	let types = ["rg", "gb", "br"]
	for (var i = 0; i < types.length; i++) {
		var type = types[i]
		getEl("entangle_" + type).className = "gluonupgrade " + type
		getEl("entangle_" + type + "_pos").className = "gluonupgrade " + type
		getEl("entangle_" + type + "_bonus").textContent = ""
	}

	getEl("entangle_" + typeUsed).className = "gluonupgrade chosenbtn"
	getEl("entangle_" + typeUsed + "_pos").className = "gluonupgrade  chosenbtn"
	getEl("entangle_" + typeUsed + "_bonus").textContent = "Entanglement Bonus: +" + shorten(getQEGluonsPortion() * (getQuantumEnergyMult() - getQuantumEnergySubMult())) + " quantum energy"

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
		quarks.sum = tmp.qu.colorPowers.r + tmp.qu.colorPowers.g + tmp.qu.colorPowers.b
		quarks.amount=Math.ceil(Math.min(quarks.sum, 200))
		for (p=0;p<quarks.amount;p++) {
			var particle=quarks['p'+p]
			if (particle==undefined) {
				particle={}
				var random=Math.random()
				if (random<=tmp.qu.colorPowers.r/quarks.sum) particle.type='r'
				else if (random>=1-tmp.qu.colorPowers.b/quarks.sum) particle.type='b'
				else particle.type='g'
				particle.motion=Math.random()>0.5?'in':'out'
				particle.direction=Math.random()*Math.PI*2
				particle.distance=Math.random()
				quarks['p'+p]=particle
			} else {
				particle.distance+=0.01
				if (particle.distance>=1) {
					var random=Math.random()
					if (random<=tmp.qu.colorPowers.r/quarks.sum) particle.type='r'
					else if (random>=1-tmp.qu.colorPowers.b/quarks.sum) particle.type='b'
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
