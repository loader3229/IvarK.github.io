function getLogTotalSpin() {
	return qu_save.tod.r.spin.plus(qu_save.tod.b.spin).plus(qu_save.tod.g.spin).add(1).log10()
}

function updateToDSpeedDisplay(){
	let t = ''
	if (shiftDown) t = getBranchSpeedText()
	else {
		let speeds = [tmp.branchSpeed]
		let speedDescs = [""]
		if (todspeed != 1) {
			speeds.push(todspeed)
			speedDescs.push("Dev")
		}
		if (ls.mult("tod") != 1) {
			speeds.push(ls.mult("tod"))
			speedDescs.push("'Light Speed' mod")
		}
		t = "Branch speed: " + factorizeDescs(speeds, speedDescs) + shorten(getBranchFinalSpeed()) + "x" + " (hold shift for details)"
	}
	getEl("todspeed").textContent = t
}

function getTreeUpgradeEfficiencyDisplayText() {
	if (!shiftDown) return "Tree upgrade efficiency: "+(tmp.tue*100).toFixed(1)+"% (hold shift for details)"
	return getTreeUpgradeEfficiencyText()
}

function todTimeDisplay(t){
	return timeDisplayShort(t, true, 2)
}

function updateTreeOfDecayTab(){
	var branchNum
	if (getEl("redBranch").style.display == "block") branchNum = 1
	if (getEl("greenBranch").style.display == "block") branchNum = 2
	if (getEl("blueBranch").style.display == "block") branchNum = 3
	for (var c = 0; c < 3; c++) {
		var color = color_names[c]
		var shorthand = colors[c]
		var branch = qu_save.tod[shorthand]
		var name = color + " " + getUQNameFromBranch(shorthand) + " quarks"
		var rate = getDecayRate(shorthand)
		var linear = Decimal.pow(2, getRDPower(shorthand))
		getEl(color + "UnstableGain").className = canUnstable(shorthand) ? "storebtn" : "unavailablebtn"
		getEl(color + "UnstableGain").innerHTML = "Gain " + shortenMoney(getUnstableGain(shorthand)) + " " + name + (player.ghostify.milestones > 3 ? "." : ", but lose all your " + color + " quarks.")
		getEl(color + "QuarkSpin").textContent = shortenMoney(branch.spin)
		getEl(color + "UnstableQuarks").textContent = shortenMoney(branch.quarks)
		getEl(color + "QuarksDecayRate").innerHTML = branch.quarks.lt(linear) && rate.lt(1) ? "You are losing " + shorten(linear.times(rate)) + " " + name + " per second" : "Their half-life is " + timeDisplayShort(Decimal.div(10, rate), true, 2) + (linear.eq(1) ? "" : " until their amount reaches " + shorten(linear))

		let pow = Decimal.pow(2, getRDPower(shorthand))
		let decayed = getDecayLifetime(branch.quarks.div(pow)).div(getDecayRate(shorthand))
		//nvrm this is correct

		let gain = getQuarkSpinProduction(shorthand).times(decayed.min(1))

		getEl(color + "QuarksDecayTime").innerHTML = todTimeDisplay(Decimal.times(10, decayed))
		getEl(color + "QuarkSpinProduction").textContent = "+" + shortenMoney(gain) + "/s"
		if (branchNum == c + 1) {
			var decays = getRadioactiveDecays(shorthand)
			var power = Math.floor(getBU1Power(shorthand) / 120 + 1)			
			getEl(color + "UpgPow1").textContent = decays || power > 1 ? shorten(Decimal.pow(2, (1 + decays * .1) / power)) : 2
			getEl(color + "UpgSpeed1").textContent = decays > 2 || power > 1 ? shorten(Decimal.pow(2, Math.max(.8 + decays * .1, 1) / power)) : 2
			lvl = getBranchUpgLevel(shorthand, 3)
			let s = getBranchUpg3SoftcapStart()
			if (lvl >= s) {
				eff = Decimal.pow(4, (Math.sqrt((lvl + 1) / s) - Math.sqrt(lvl / s)) * s)
				if (eff < 1.02) eff = eff.toFixed(4)
				else if (eff < 1.2) eff = eff.toFixed(3)
				else eff = eff.toFixed(2)
			}
			else eff = "4"
			getEl(color + "UpgEffDesc").textContent =  " " + eff + "x"
			for (var u = 1; u < 4; u++) getEl(color + "upg" + u).className = "gluonupgrade " + (branch.spin.lt(getBranchUpgCost(shorthand, u)) ? "unavailablebtn" : shorthand)
			if (pH.did("ghostify")) getEl(shorthand + "RadioactiveDecay").className = "gluonupgrade "  +(branch.quarks.lt(Decimal.pow(10, Math.pow(2, 50))) ? "unavailablebtn" : shorthand)
		}
	} //for loop
	if (!branchNum) {
		let start = getLogTotalSpin() > 200 ? "" : "Cost: "
		let end = getLogTotalSpin() > 200 ? "" : " quark spin"
		for (let u = 1; u <= 8; u++) {
			let cost = getTreeUpgradeCost(u)
			let lvl = getTreeUpgradeLevel(u)
			let effLvl = getEffectiveTreeUpgLevel(u)
			getEl("treeupg" + u).className = "gluonupgrade " + (canBuyTreeUpg(u) ? colors[getTreeUpgradeLevel(u) % 3] : "unavailablebtn")
			getEl("treeupg" + u + "current").textContent = getTreeUpgradeEffectDesc(u)
			let scalingsActive = (lvl >= 1e4 ? 1 : 0) + TREE_UPGRADES[u].scaleAdd(lvl)
			getEl("treeupg" + u + "lvl").textContent = getGalaxyScaleName(scalingsActive) + "Level: " + getFullExpansion(lvl) + (lvl != effLvl ? " -> " + getFullExpansion(Math.floor(effLvl)) + (effLvl != lvl * tmp.tue ? " (softcapped)" : "") : "")
			getEl("treeupg" + u + "cost").textContent = start + shortenMoney(cost) + " " + color_names[lvl % 3] + end
		}
		setAndMaybeShow("treeUpgradeEff", pH.did("ghostify"), 'getTreeUpgradeEfficiencyDisplayText()')
	}
	updateToDSpeedDisplay()
}

function updateTODStuff() {
	return
	for (var c = 0; c < 3; c++) {
		var color = color_names[c]
		var shorthand = colors[c]
		var branch = qu_save.tod[shorthand]
		var name = getUQNameFromBranch(shorthand)
		getEl(shorthand + "UQName").innerHTML = name
		extra = Decimal.log10(branch.spin) > 200
		start = extra ? "" : "Cost: "
		end = extra ? color : color + " quark spin"
		for (var b = 1; b <= 3; b++) {
			getEl(color + "upg" + b + "current").textContent = shortenDimensions(getEffectiveBranchUpgMult(shorthand, b))
			getEl(color + "upg" + b + "cost").textContent = start + shortenMoney(getBranchUpgCost(shorthand, b)) + " " + end
			if (b > 1) getEl(color + "UpgName" + b).innerHTML = name
		}
		if (pH.did("ghostify")) {
			getEl(shorthand+"RadioactiveDecay").parentElement.parentElement.style.display = ""
			getEl(shorthand+"RDReq").innerHTML = "(requires " + shorten(Decimal.pow(10, Math.pow(2, 50))) + " of " + color + " " + name + " quarks)"
			getEl(shorthand+"RDLvl").textContent = getFullExpansion(getRadioactiveDecays(shorthand))
		} else getEl(shorthand+"RadioactiveDecay").parentElement.parentElement.style.display = "none"
	}
}

function showBranchTab(tabName) {
	//iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
	var tabs = document.getElementsByClassName('branchtab');
	var tab;
	var oldTab
	for (var i = 0; i < tabs.length; i++) {
		tab = tabs.item(i);
		if (tab.style.display == 'block') oldTab = tab.id
		if (tab.id === tabName + "Branch") {
			tab.style.display = 'block';
		} else {
			tab.style.display = 'none';
		}
	}
	if (oldTab !== tabName) aarMod.tabsSave.tabBranch = tabName
	closeToolTip()
}

function getUnstableGain(branch) {
	let log = qu_save.usedQuarks[branch].max(1).log10()
	let ret = Math.max(log / 50 - 6, 0)
	ret = Math.pow(ret, 2) + ret * 2

	let power = getBranchUpgLevel(branch, 2) - getRDPower(branch)
	ret = Decimal.pow(2, power).times(ret)
	if (ret.gt(1)) ret = Decimal.pow(ret, Math.pow(2, power + 1))
	return ret.times(Decimal.pow(2, getRDPower(branch) + 1)).min(Decimal.pow(10, Math.pow(2, 51)))
}

function getFixedRDPower(x){
	let y = Math.max(x - 5, 0)
	let r = x * 25 + (Math.pow(y, 2) + y) * 1.25
	return r
}

function getLowerBoundDecays(branch){
	//getRDPower(branch)
	return doBulkSpent(getBranchUpgLevel(branch, 2), getFixedRDPower, 0, true).toBuy
}

function canUnstable(branch) {
	return qu_save.usedQuarks[branch].gt(0) && getUnstableGain(branch).gt(qu_save.tod[branch].quarks)
}

function unstableQuarks(branch) {
	if (!canUnstable(branch)) return
	qu_save.tod[branch].quarks = qu_save.tod[branch].quarks.max(getUnstableGain(branch))
	if (player.ghostify.milestones < 4) qu_save.usedQuarks[branch] = new Decimal(0)
	if (player.ghostify.reference > 0) player.ghostify.reference--
	if (player.unstableThisGhostify) player.unstableThisGhostify ++
	else player.unstableThisGhostify = 10
}

function getBranchSpeedText(){
	let text = ""
	if (new Decimal(getTreeUpgradeEffect(3)).gt(1)) text += "Tree Upgrade 3: " + shorten(getTreeUpgradeEffect(3)) + "x, "
	if (new Decimal(getTreeUpgradeEffect(5)).gt(1)) text += "Tree Upgrade 5: " + shorten(getTreeUpgradeEffect(5)) + "x, "
	if (hasMTS(431)) if (getMTSMult(431).gt(1)) text += "Mastery Study 431: " + shorten(getMTSMult(431)) + "x, "
	if (hasNU(4)) if (tmp.nu[4].gt(1)) text += "Fourth Neutrino Upgrade: " + shorten(tmp.nu[4]) + "x, "
	if (hasAch("ng3p48")) if (player.meta.resets > 1) text += "'Are you currently dying?' reward: " + shorten (Math.sqrt(player.meta.resets + 1)) + "x, "
	if (player.ghostify.milestones >= 14) text += "Brave Milestone 14: " + shorten(getMilestone14SpinMult()) + "x, "
	if (GDs.unlocked()) text += "Gravity Well Energy: ^" + shorten(GDs.tmp.tod) + ", "
	if (todspeed != 1) {
		if (todspeed > 1) text += "Dev: " + shorten(todspeed) + "x, "
		if (todspeed < 1) text += "Dev: /" + shorten(1 / todspeed) + ", "
	}
	var lsSpeed = ls.mult("tod")
	if (lsSpeed != 1) {
		if (lsSpeed > 1) text += "'Light Speed' mod: " + shorten(lsSpeed) + "x, "
		if (lsSpeed < 1) text += "'Light Speed' mod: /" + shorten(1 / lsSpeed) + ", "
	}
	if (text == "") return "No multipliers currently"
	return text.slice(0, text.length - 2)
}

function getBranchSpeed() { 
	let x = Decimal.times(getTreeUpgradeEffect(3), getTreeUpgradeEffect(5))
	if (hasMTS(431)) x = x.times(getMTSMult(431))
	if (hasNU(4)) x = x.times(tmp.nu[4])
	if (hasAch("ng3p48")) x = x.times(Math.sqrt(player.meta.resets + 1))
	if (player.ghostify.milestones >= 14) x = x.times(getMilestone14SpinMult())
	if (GDs.boostUnl('tod')) x = x.pow(GDs.tmp.tod)
	return x
}

function getBranchDevSpeed() {
	return todspeed * ls.mult("tod")
}

function getBranchFinalSpeed() {
	return tmp.branchSpeed.times(getBranchDevSpeed())
}

function getDecayRate(branch) {
	let ret = Decimal.pow(2, getBU1Power(branch) * Math.max((getRadioactiveDecays(branch) - 8) / 10, 1)).div(getBranchUpgMult(branch, 3)).div(Decimal.pow(2, Math.max(0, getRDPower(branch) - 4) + 2))
	ret = ret.times(tmp.branchSpeed).min(Math.pow(2, 40))
	ret = ret.times(getBranchDevSpeed())
	return ret
}

function getDecayLifetime(qk) {
	if (qk.gt(1)) return new Decimal(qk.log(2) + 1)
	return qk
}

function getMilestone14SpinMult(){
	return Math.max(Math.pow(getLogTotalSpin(), 2) / 625, 1) * 10
}

function getQuarkSpinProduction(branch) {
	let ret = getBranchUpgMult(branch, 1).times(getBranchFinalSpeed())
	if (hasNU(4)) ret = ret.times(tmp.nu[4])
	if (hasAch("ng3p74")) if (qu_save.tod[branch].decays) ret = ret.times(1 + qu_save.tod[branch].decays)
	if (qu_save.bigRip.active) {
		if (hasNU(12)) ret = ret.times(tmp.nu[12].normal)
	}
	ret = ret.times(Decimal.pow(1.1, qu_save.nanofield.rewards - 12))
	ret = ret.times(getBranchDevSpeed())
	return ret
}

let TREE_UPGRADES = {
	1: {
		baseCost(lvl) {
			return Decimal.pow(2, lvl * 2 + Math.max(lvl - 35, 0) * (lvl - 34) / 2).times(50)
		},
		scaleAdd(lvl) {
			if (lvl > 35) return 1
			return 0
		},
		effLvl(lvl) {
			return lvl
		},
		eff(lvl) {
			return Math.floor(lvl * 30)
		}
	},
	2: {
		baseCost(lvl) {
			return Decimal.pow(4, lvl * (lvl + 3) / 2).times(600)
		},
		scaleAdd(lvl) {
			return 0
		},
		effLvl(lvl) {
			if (lvl > 64) lvl = (lvl + 128) / 3
			return lvl
		},
		eff(lvl) {
			return lvl * 0.25
		}
	},
	3: {
		baseCost(lvl) {
			return Decimal.pow(32, lvl).times(3e9)
		},
		scaleAdd(lvl) {
			return 0
		},
		effLvl(lvl) {
			return lvl
		},
		eff(lvl) {
			return Decimal.pow(2, Math.sqrt(Math.sqrt(Math.max(lvl * 3 - 2, 0)) * Math.max(getTotalNumOfToDUpgrades() - 10, 0)))
		}
	},
	4: {
		baseCost(lvl) {
			return Decimal.pow(2, lvl + Math.max(lvl - 37, 0) * (lvl - 36) / 2).times(1e12)
		},
		scaleAdd(lvl) {
			if (lvl > 37) return 1
			return 0
		},
		effLvl(lvl) {
			return lvl
		},
		eff(lvl) {
			return 1
		}
	},
	5: {
		baseCost(lvl) {
			let exp = Math.pow(Math.max(0, lvl - 50), 1.5) + lvl
			if (!hasAch("ng3p87")) exp += Math.max(lvl - 35, 0) * (lvl - 34) / 2
			return Decimal.pow(2, exp).times(4e12)
		},
		scaleAdd(lvl) {
			if (lvl > 50) return 2
			if (lvl > 35 && !hasAch("ng3p87")) return 1
			return 0
		},
		effLvl(lvl) {
			if (lvl > 500 && !hasAch("ng3p87")) lvl = Math.sqrt(lvl / 500) * 500
			return lvl
		},
		eff(lvl) {
			if (!tmp.eterUnl) return new Decimal(1)
			let MA = player.meta.bestOverQuantums
			if (hasAch("ng3p87")) MA = MA.plus(player.meta.bestOverGhostifies)

			let x = Decimal.pow(Math.log10(MA.add(1).log10() + 1) / 5 + 1, Math.sqrt(lvl))
			if (!inBigRip() && qu_save.breakEternity.upgrades.includes(13)) x = x.max(Decimal.pow(1.1, Math.pow(MA.add(1).log10(), 1/3) * Math.sqrt(lvl)))
			return x
		}
	},
	6: {
		baseCost(lvl) {
			return Decimal.pow(4, lvl * (lvl + 3) / 2).times(6e22)
		},
		scaleAdd(lvl) {
			return 0
		},
		effLvl(lvl) {
			return lvl
		},
		eff(lvl) {
			return Decimal.pow(2, lvl)
		}
	},
	7: {
		baseCost(lvl) {
			return Decimal.pow(16, lvl * lvl).times(4e22)
		},
		scaleAdd(lvl) {
			return 0
		},
		effLvl(lvl) {
			return lvl
		},
		eff(lvl) {
			return 1
		}
	},
	8: {
		baseCost(lvl) {
			return Decimal.pow(2, lvl).times(3e23)
		},
		scaleAdd(lvl) {
			return 0
		},
		effLvl(lvl) {
			return lvl
		},
		eff(lvl) {
			return 1
		}
	}
}

function getTreeUpgradeCost(upg, add) {
	let lvl = getTreeUpgradeLevel(upg)
	if (add !== undefined) lvl += add
	x = TREE_UPGRADES[upg].baseCost(lvl)

	let y = x.log10()
	if (lvl > 1e4) y *= lvl / 1e4
	return Decimal.pow(10, y)
}

function canBuyTreeUpg(upg) {
	return getTreeUpgradeCost(upg).lte(qu_save.tod[colors[getTreeUpgradeLevel(upg) % 3]].spin)
}

function buyTreeUpg(upg) {
	if (!canBuyTreeUpg(upg)) return
	var branch = qu_save.tod[colors[getTreeUpgradeLevel(upg) % 3]]
	branch.spin = branch.spin.sub(getTreeUpgradeCost(upg))
	if (!qu_save.tod.upgrades[upg]) qu_save.tod.upgrades[upg] = 0
	qu_save.tod.upgrades[upg]++
}

function isTreeUpgActive(upg) {
	return tmp.quActive && player.masterystudies.includes("d13") && qu_save.tod.upgrades[upg] >= 1
}

function getTreeUpgradeLevel(upg) {
	return hasMTS("d12") ? (qu_save.tod.upgrades[upg] || 0) : 0
}

function getEffectiveTreeUpgLevel(upg){
	return TREE_UPGRADES[upg].effLvl(getTreeUpgradeLevel(upg) * tmp.tue)
}

function getTotalNumOfToDUpgrades() {
	let power = 0
	for (var upg = 1; upg <= 8; upg++) power += getTreeUpgradeLevel(upg)
	return power
}

function getTreeUpgradeEffect(upg) {
	return TREE_UPGRADES[upg].eff(getEffectiveTreeUpgLevel(upg))
}

function getTreeUpgradeEffectDesc(upg) {
	if (upg == 1) return getFullExpansion(getTreeUpgradeEffect(upg))
	if (upg == 2) return getTPExp("TU3").toFixed(2) + " -> " + getTPExp().toFixed(2)
	return shortenMoney(getTreeUpgradeEffect(upg))
}

var branchUpgCostScales = [[300, 15], [50, 8], [4e7, 7]]
function getBranchUpgCost(branch, upg) {
	var lvl = getBranchUpgLevel(branch, upg)
	var scale = branchUpgCostScales[upg-1]
	return Decimal.pow(2, lvl * upg + Math.max(lvl - scale[1], 0) * Math.max(3 - upg, 1)).times(scale[0])
}

function buyBranchUpg(branch, upg) {
	var colors = {r: "red", g: "green", b: "blue"}
	var bData = qu_save.tod[branch]
	if (bData.spin.lt(getBranchUpgCost(branch,upg))) return
	bData.spin = bData.spin.sub(getBranchUpgCost(branch, upg))
	if (bData.upgrades[upg] == undefined) bData.upgrades[upg] = 0
	bData.upgrades[upg]++
	extra = bData.spin.log10() > 200
	start = extra ? "" : "Cost: "
	end = extra ? colors[branch] : colors[branch] + " quark spin"
	getEl(colors[branch] + "upg" + upg + "current").textContent = shortenDimensions(getEffectiveBranchUpgMult(branch, upg))
	getEl(colors[branch] + "upg" + upg + "cost").textContent = start + shortenMoney(getBranchUpgCost(branch, upg)) + " " + end
}

function getBranchUpgLevel(branch,upg) {
	upg = qu_save.tod[branch].upgrades[upg]
	if (upg) return upg
	return 0
}

var todspeed = 1

function rotateAutoAssign() {
	qu_save.autoOptions.assignQKRotate = qu_save.autoOptions.assignQKRotate ? (qu_save.autoOptions.assignQKRotate + 1) % 3 : 1
	getEl('autoAssignRotate').textContent = "Rotation: " + (qu_save.autoOptions.assignQKRotate > 1 ? "Left" : qu_save.autoOptions.assignQKRotate ? "Right" : "None")
}

function unstableAll() {
	for (var c = 0; c < 3; c++) {
		var bData = qu_save.tod[colors[c]]
		if (canUnstable(colors[c])) {
			bData.quarks = bData.quarks.max(getUnstableGain(colors[c]))
			if (player.ghostify.milestones < 4) qu_save.usedQuarks[colors[c]] = new Decimal(0)
		}
		player.unstableThisGhostify++
	}
	updateColorCharge()
	updateQuantumWorth()
}

var uq_names = {
	standard(rds) {
		let x = "unstable"
		let roots_1 = ["", "radioactive", "infinity", "eternal", "quantum"]
		let roots_2 = ["", "ghostly", "disappearing", "reappearing", "ethereal"]

		let a = rds % 5
		if (a > 0) x = roots_1[a] + " " + x

		let b = Math.floor((rds - 5) / 50 + 1)
		if (b >= 1) {
			if (b >= roots_2.length) return this.exponents(rds)

			let c = Math.floor((rds - 5) / 5) % 10 + 1
			x = roots_2[b] + (c > 1 ? "<sup>" + c + "</sup>" : "") + " " + x
		}

		return x
	},
	abbreviated(rds) {
		let x = ""
		let roots_1 = ["", "r", "i", "e", "q"]
		let roots_2 = ["", "g", "d", "ra", "er"]

		let a = rds % 5
		if (a > 0) x = roots_1[a] + "."

		let b = Math.floor((rds - 5) / 50 + 1)
		if (b >= 1) {
			if (b >= roots_2.length) return this.exponents(rds)

			let c = Math.floor((rds - 5) / 5) % 10 + 1
			x = roots_2[b] + (c > 1 ? c : "") + "." + x
		}

		if (x !== "") x = x + " unstable" 
		else x = "unstable"

		return x
	},
	scientific(rds) {
		let x = "Rd"
		let roots_1 = ["", "r", "i", "e", "q"]
		let roots_2 = ["", "g", "d", "ra", "er"]

		let a = rds % 5
		let b = Math.floor((rds - 5) / 50 + 1)

		if (b >= 1) {
			if (b >= roots_2.length) return this.exponents(rds)

			let c = Math.floor((rds - 5) / 5) % 10 + 1
			x += "<sup>" + roots_2[b] + (c > 1 ? c : "") + "</sup>"
		}
		if (a >= (b > 0 ? 2 : 1)) x += "<sub>" + roots_1[a] + "</sub>"

		if (rds > 0) x = x + " unstable" 
		else x = "unstable"

		return x
	},
	exponents(rds) {
		if (rds == 0) return "unstable"
		return "unstable<sup>" + getFullExpansion(rds + 1) + "</sup>"
	},
	mixed(rds) {
		if (rds > 5) return this.exponents(rds)
		return this.standard(rds)
	}
}

function getUQName(rds) {
	return uq_names[aarMod.uq_notation || "mixed"](rds)
}

function getUQNameFromBranch(shorthand) {
	return getUQName(qu_save.tod[shorthand].decays || 0)
}

function maxTreeUpg() {
	let update = false
	let data = qu_save.tod
	for (let u = 1; u <= 8; u++) {
		let cost = getTreeUpgradeCost(u)
		let spins = []
		let lvl = getTreeUpgradeLevel(u)
		let min
		for (let c = 0; c < 3; c++) {
			min = data[colors[c]].spin.min(c ? min : 1/0)
			spins[c] = data[colors[c]].spin
		}
		if (spins[lvl % 3].gte(cost)) {
			let inc = 1
			while (spins[(lvl + inc - 1) % 3].gte(getTreeUpgradeCost(u, inc - 1))) inc *= 2
			let toBuy = 0
			while (inc >= 1) {
				if (spins[(lvl + toBuy + inc - 1) % 3].gte(getTreeUpgradeCost(u, toBuy + inc - 1))) toBuy += inc
				inc /= 2
			}
			let cost = getTreeUpgradeCost(u, toBuy - 1)
			let toBuy2 = toBuy
			while (toBuy > 0 && spins[(lvl + toBuy - 1) % 3].div(cost).lt(1e16)) {
				if (spins[(lvl + toBuy - 1) % 3].gte(cost)) spins[(lvl + toBuy - 1) % 3]=spins[(lvl + toBuy - 1) % 3].sub(cost)
				else {
					spins[(lvl + toBuy - 1) % 3] = data[colors[(lvl + toBuy - 1) % 3]].spin.sub(cost)
					toBuy2--
				}
				toBuy--
				cost = getTreeUpgradeCost(u, toBuy - 1)
			}
			if (toBuy2) {
				for (c = 0; c < 3; c++) data[colors[c]].spin = isNaN(spins[c].e) ? new Decimal(0) : spins[c]
				data.upgrades[u] = toBuy2 + (data.upgrades[u] === undefined ? 0 : data.upgrades[u])
				update = true
			}
		}
	}
}

function maxBranchUpg(branch, weak) {
	var colors = {r: "red", g: "green", b: "blue"}
	var bData = qu_save.tod[branch]
	for (var u = (weak ? 2 : 1); u <= 3; u++) {
		var oldLvl = getBranchUpgLevel(branch, u)
		var scaleStart = branchUpgCostScales[u - 1][1]
		var cost = getBranchUpgCost(branch, u)
		if (bData.spin.gte(cost) && oldLvl < scaleStart) {
			var costMult = Math.pow(2, u)
			var toAdd = Math.min(Math.floor(bData.spin.div(cost).times(costMult - 1).add(1).log(costMult)),scaleStart - oldLvl)
			bData.spin = bData.spin.sub(Decimal.pow(costMult, toAdd).sub(1).div(costMult).times(cost).min(bData.spin))
			if (bData.upgrades[u] === undefined) bData.upgrades[u] = 0
			bData.upgrades[u] += toAdd
			cost = getBranchUpgCost(branch, u)
		}
		if (bData.spin.gte(cost) && bData.upgrades[u] >= scaleStart) {
			var costMult = Math.pow(2, u + Math.max(3 - u, 1))
			var toAdd = Math.floor(bData.spin.div(cost).times(costMult-1).add(1).log(costMult))
			bData.spin = bData.spin.sub(Decimal.pow(costMult,toAdd).sub(1).div(costMult).times(cost).min(bData.spin))
			if (bData.upgrades[u] === undefined) bData.upgrades[u] = 0
			bData.upgrades[u] += toAdd
		}
		if (bData.upgrades[u] > oldLvl) {
			getEl(colors[branch] + "upg" + u + "current").textContent = shortenDimensions(getEffectiveBranchUpgMult(branch, u))
			extra = bData.spin.log10() > 200
			start = extra ? "" : "Cost: "
			end = extra ? colors[branch] : colors[branch] + " quark spin"
			getEl(colors[branch] + "upg" + u + "cost").textContent = start + shortenMoney(getBranchUpgCost(branch, u)) + " " + end
		}
	}
}

function radioactiveDecay(shorthand) {
	let data = qu_save.tod[shorthand]
	if (!data.quarks.gte(Decimal.pow(10, Math.pow(2, 50)))) return
	data.quarks = new Decimal(0)
	data.spin = new Decimal(0)
	data.upgrades = {}
	if (player.ghostify.milestones > 3) data.upgrades[1] = 5
	data.decays = (data.decays || 0) + 1
	updateTODStuff()
}

function maxRadioactiveDecay(shorthand){
	let data = qu_save.tod[shorthand]
	if (!data.quarks.max(getUnstableGain(shorthand)).gte(Decimal.pow(10, Math.pow(2, 50)))) return
	data.quarks = new Decimal(0)
	data.spin = new Decimal(0)
	data.upgrades = {}
	if (player.ghostify.milestones > 3) data.upgrades[1] = 5
	data.decays = Math.max(data.decays || 0, getLowerBoundDecays(shorthand))
	updateTODStuff()
}

function maxAllRadioactiveDecay(){
	maxRadioactiveDecay('r')
	maxRadioactiveDecay('b')
	maxRadioactiveDecay('g')
}

function getTotalRadioactiveDecays(){
	return getRadioactiveDecays('g') + getRadioactiveDecays('b') + getRadioactiveDecays('r')
}

function getRadioactiveDecays(shorthand) {
	let data = qu_save.tod[shorthand]
	return data.decays || 0
}

function getMinimumUnstableQuarks() {
	let r={quarks:new Decimal(1/0),decays:1/0}
	let c=["r","g","b"]
	for (var i=0;i<3;i++) {
		let b=qu_save.tod[c[i]]
		let d=b.decays||0
		if (r.decays>d||(r.decays==d&&b.quarks.lte(r.quarks))) r={quarks:b.quarks,decays:d}
	}
	return r
}

function getMaximumUnstableQuarks() {
	let r = {quarks:new Decimal(0),decays:0}
	let c = ["r","g","b"]
	for (var i = 0; i < 3; i++) {
		let b = qu_save.tod[c[i]]
		let d = b.decays || 0
		if (r.decays < d || (r.decays == d && b.quarks.gte(r.quarks))) r = {quarks: b.quarks, decays: d}
	}
	return r
}

function getTreeUpgradeEfficiencyText(){
	let text = ""
	if (player.ghostify.neutrinos.boosts >= 7 && (qu_save.bigRip.active || hasNU(17))) text += "Neutrino Boost 7: +" + shorten(tmp.nb[7]) + ", "
	if (hasAch("ng3p62") && !qu_save.bigRip.active) text += "Finite Time Reward: +10%, "
	if (hasBosonicUpg(43)) text += "Bosonic Lab Upgrade 18: " + shorten(tmp.blu[43]) + "x, "
	if (text == "") return "No multipliers currently"
	return text.slice(0, text.length-2)
}

function getTreeUpgradeEfficiency(mod) {
	if (!hasMTS("d12")) return 0

	let r = 1
	if (player.ghostify.neutrinos.boosts >= 7 && (qu_save.bigRip.active || hasNU(17) || mod == "br") && mod != "noNB") r += tmp.nb[7]
	if (hasAch("ng3p62") && !qu_save.bigRip.active) r *= 1.1
	if (hasBosonicUpg(43)) r *= tmp.blu[43]
	return r
}

function getRDPower(branch) {
	let x = getRadioactiveDecays(branch)
	let y = Math.max(x - 5, 0)
	let r = x * 25 + (Math.pow(y, 2) + y) * 1.25
	return r
}

function getBU1Power(branch) {
	let x = getBranchUpgLevel(branch, 1)
	let s = Math.floor(Math.sqrt(0.25 + 2 * x / 120) - 0.5)
	return s * 120 + (x - s * (s + 1) * 60) / (s + 1)
}

function getBU2Power(branch) {
	let x = getBranchUpgLevel(branch, 2)
	if (hasAch("ng3p94")) x += getRadioactiveDecays(branch)
	return x
}

function getBranchUpg3SoftcapStart(){
	return 1/0 
}

function getBranchUpg2SoftcapStart(){
	return 1/0 
}

function getEffectiveBranchUpgMult(branch, upg){
	if (upg == 2) {
		let x = getBU2Power(branch) - getRDPower(branch)
		let s = getBranchUpg2SoftcapStart()
		if (x > s) x = Math.pow(x * s, .5)
		return Decimal.pow(2, x).max(1)
	}
	return getBranchUpgMult(branch, upg)
}

function getBranchUpgMult(branch, upg) {
	if (upg == 1) return Decimal.pow(2, getBU1Power(branch) * (getRadioactiveDecays(branch) / 10 + 1))
	else if (upg == 2) {
		let x = getBU2Power(branch)
		let s = getBranchUpg2SoftcapStart()
		if (x > s) x = Math.pow(x * s, .5)
		return Decimal.pow(2, x)
	} 
	else if (upg == 3) {
		l = getBranchUpgLevel(branch, 3)
		let s = getBranchUpg3SoftcapStart()
		if (l > s) l = s * Math.sqrt(l / s)
		return Decimal.pow(4, l)
	}
} 