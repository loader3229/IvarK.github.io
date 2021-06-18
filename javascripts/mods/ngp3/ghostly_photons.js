function updateGPHUnlocks() {
	let unl = player.ghostify.ghostlyPhotons.unl
	getEl("gphUnl").style.display = unl ? "none" : ""
	getEl("gphDiv").style.display = unl ? "" : "none"
	getEl("breakUpgR3").style.display = unl ? "" : "none"
	getEl("bltabbtn").style.display = unl ? "" : "none"
	updateNeutrinoUpgradeUnlocks(13, 15)
	ls.updateOption("gph")
}

function getGPHProduction() {
	let ret = new Decimal(0)
	if (inBigRip()) ret = player.dilation.dilatedTime.div("1e480")
	if (hasAch("ng3p92")) ret = ret.add(1)
	if (ret.gt(1)) ret = ret.pow(0.02)
	return ret.times(getFinalPhotonicFlow())
}

function getDMProduction() {
	let ret = new Decimal(0)
	if (!inBigRip()) ret = player.dilation.dilatedTime.div("1e930")
	if (hasAch("ng3p92")) ret = ret.add(1)
	if (ret.gt(1)) ret = ret.pow(0.02)
	return ret.times(getFinalPhotonicFlow())
}

function getGHRProduction() {
	let log = player.ghostify.ghostlyPhotons.amount.sqrt().div(2).log10()
	if (player.ghostify.neutrinos.boosts >= 11) log += tmp.nb[11].log10()
	return Decimal.pow(10, log).times(getFinalPhotonicFlow())
}

function getGHRCap() {
	let log = player.ghostify.ghostlyPhotons.darkMatter.pow(0.4).times(1e3).log10()
	if (player.ghostify.neutrinos.boosts >= 11) log += tmp.nb[11].log10()
	return Decimal.pow(10, log)
}

function getLightThreshold(l) {
	let inc = Decimal.pow(getLightThresholdIncrease(l), player.ghostify.ghostlyPhotons.lights[l])
	let base = new Decimal(tmp.lt[l]).div(tmp.ngp3_exp ? 10 : 1)
	return inc.times(base)
}

function getLightThresholdIncrease(l) {
	let x = tmp.lti[l]
	if (isNanoEffectUsed("light_threshold_speed")) {
		let y = 1 / tmp.nf.effects.light_threshold_speed
		if (y < 1) x = Math.pow(x, y)
	}
	return x
}

function getPhotonicFlow() {
	let x = new Decimal(1)
	if (hasAch("ng3p81")) x = new Decimal(pl.on() ? fNu.tmp.nerfNeutral : 2.5)
	if (GDs.boostUnl('gph')) x = Decimal.pow(x, GDs.tmp.gph)
	return x
}

function getFinalPhotonicFlow() {
	return tmp.phF.times(ls.mult("gph"))
}

function updatePhotonsTab(){
	updateRaysPhotonsDisplay()
	updateLightThresholdStrengthDisplay()
	updateLightBoostDisplay()
	updateLEmpowermentPrimary()
	updateLEmpowermentBoosts()
	updatePhotonicFlowDisplay()
}

function updateRaysPhotonsDisplay(){
	let gphData = player.ghostify.ghostlyPhotons
	getEl("dtGPH").textContent = shorten(player.dilation.dilatedTime)
	getEl("gphProduction").textContent = shorten(inBigRip() ? getGPHProduction() : getDMProduction())
	getEl("gphProduction").className = (inBigRip() ? "gph" : "dm") + "Amount"
	getEl("gphProductionType").textContent = inBigRip() ? "Ghostly Photons" : "Dark Matter"
	getEl("gph").textContent = shortenMoney(gphData.amount)
	getEl("dm").textContent = shortenMoney(gphData.darkMatter)
	getEl("ghrProduction").textContent = shortenMoney(getGHRProduction())
	getEl("ghrCap").textContent = shortenMoney(getGHRCap())
	getEl("ghr").textContent = shortenMoney(gphData.ghostlyRays)
}

function updateLightBoostDisplay(){
	let gphData = player.ghostify.ghostlyPhotons
	getEl("lightMax1").textContent = getFullExpansion(gphData.maxRed)
	getEl("lightBoost1").textContent = tmp.le[0].toFixed(3)
	getEl("lightBoost2").textContent = tmp.le[1].toFixed(2)
	//getEl("lightBoost3").textContent = getFullExpansion(Math.floor(tmp.le[2]))
	getEl("lightBoost4").textContent = formatPercentage(tmp.le[3] - 1)
	getEl("lightBoost5").textContent = formatPercentage(tmp.le[4]) + (hasBosonicUpg(11) ? "+" + formatPercentage(tmp.blu[11]) : "")
	getEl("lightBoost6").textContent = shorten(tmp.le[5])
	getEl("lightBoost7").textContent = shorten(tmp.le[6])
}

function updateLightThresholdStrengthDisplay(){
	let gphData=player.ghostify.ghostlyPhotons
	for (let c = 0; c < 8; c++) {
		getEl("light" + (c + 1)).textContent = getFullExpansion(gphData.lights[c])
		getEl("lightThreshold" + (c + 1)).textContent = shorten(getLightThreshold(c))
		if (c > 0) getEl("lightStrength" + c).textContent = shorten(tmp.ls[c-1])
	}
}

function updatePhotonicFlowDisplay() {
	let t = ''
	let speeds = [tmp.phF]
	let speedDescs = [""]
	if (ls.mult("gph") != 1) {
		speeds.push(ls.mult("gph"))
		speedDescs.push("'Light Speed' mod")
	}
	getEl("gphSpeed").textContent = "Photonic Flow: " + factorizeDescs(speeds, speedDescs) + shorten(getFinalPhotonicFlow()) + "x speed to Ghostly Photons"
}

//Light Empowerments
function getLightEmpowermentReq(le) {
	if (le === undefined) le = player.ghostify.ghostlyPhotons.enpowerments
	let x = le * 2.4 + 1
	let scale = 0
	if (le >= 20) {
		x += Math.pow(le - 19, 2) / 3
		scale = 1
	}

	if (hasAch("ng3p116")) x /= 2
	if (hasAch("ng3p95")) x -= 1
	if (bu62.active("gph")) x = 1/0

	tmp.leReqScale = scale
	return Math.floor(x)
}

function updateLightEmpowermentReq() {
	tmp.leReq = getLightEmpowermentReq()
}

function lightEmpowerment(auto) {
	if (!(player.ghostify.ghostlyPhotons.lights[7] >= tmp.leReq)) return
	if (!auto && !hasAch("ng3p103") && !tmp.mod.leNoConf) {
		if (!hasAch("ng3p92")) if (!confirm("You will become a ghost, but Ghostly Photons will be reset. As a result, you will gain a Light Empowerment from this. Are you sure you want to proceed?")) return
		if (hasAch("ng3p92"))  if (!confirm("You will become a ghost, but Ghostly Photons will be reset. As a result, you will bulk buy the maximum number of Light Empowerments you can. Are you sure you want to proceed?")) return
	}
	if (!player.ghostify.ghostlyPhotons.enpowerments) getEl("leConfirmBtn").style.display = "inline-block"

	if (hasAch("ng3p92")) maxLightEmpowerments()
	else player.ghostify.ghostlyPhotons.enpowerments++
	
	if (hasAch("ng3p103")) return
	ghostify(false, true)

	if (hasAch("ng3p91")) return
	player.ghostify.ghostlyPhotons.amount = new Decimal(0)
	player.ghostify.ghostlyPhotons.darkMatter = new Decimal(0)
	player.ghostify.ghostlyPhotons.ghostlyRays = new Decimal(0)
	player.ghostify.ghostlyPhotons.lights = [0,0,0,0,0,0,0,0]
}

function maxLightEmpowerments() {
	let uv = player.ghostify.ghostlyPhotons.lights[7]
	let le = player.ghostify.ghostlyPhotons.enpowerments
	let x = 1
	let y = 0
	while (uv >= getLightEmpowermentReq(le + x * 2 - 1)) x *= 2
	while (x >= 1) {
		if (uv >= getLightEmpowermentReq(le + x + y - 1)) y += x
		x /= 2
	}
	player.ghostify.ghostlyPhotons.enpowerments += y
}

function getLightEmpowermentBoost() {
	let r = player.ghostify.ghostlyPhotons.enpowerments
	if (hasBosonicUpg(13)) r *= tmp.blu[13]
	return r
}

var leBoosts = {
	max: 8,
	1: {
		leThreshold: 1,
		eff() {
			let le1exp = 0.75
			if (tmp.ngp3_exp) {
				le1exp += 0.2
				if (player.ghostify.ghostlyPhotons.unl) le1exp += .15
				if (player.ghostify.wzb.unl) le1exp += .15
			}
			let le1mult = 500
			if (tmp.ngp3_exp) le1mult *= 2
			let eff = Math.pow(Math.log10(tmp.effL[3] + 1), le1exp) * le1mult
			return {effect: eff}
		},
		effDesc(x) {
			return getFullExpansion(Math.floor(x.effect))
		}
	},
	2: {
		leThreshold: 2,
		eff() {
			return Math.log10(tmp.effL[4] * 10 + 1) / 4 + 1
		},
		effDesc(x) {
			return formatPercentage(x - 1)
		}
	},
	3: {
		leThreshold: 3,
		eff() {
			return Math.pow(tmp.effL[0].normal + 1, 0.1) * 2 - 1
		},
		effDesc(x) {
			return x.toFixed(2)
		}
	},
	4: {
		req() {
			return hasBosonicUpg(32)
		},
		leThreshold: 10,
		eff() {
			return tmp.leBonus[4]
		}
	},
	5: {
		req() {
			return hasBosonicUpg(32)
		},
		leThreshold: 13,
		eff() {
			return {
				exp: 0.75 - 0.25 / Math.sqrt(tmp.leBoost / 200 + 1),
				mult: Math.pow(tmp.leBoost / 100 + 1, 1/3),
			}
		},
		effDesc(x) {
			return "(" + shorten(x.mult) + "x+1)^" + x.exp.toFixed(3)
		}
	},
	6: {
		req() {
			return hasBosonicUpg(32)
		},
		leThreshold: 16,
		eff() {
			let exp = Math.min(Math.pow(tmp.effL[2] + 1, 0.25) - 1, 600)
			return Math.pow(3, exp)
		},
		effDesc(x) {
			return shorten(x)
		}
	},
	7: {
		req() {
			return hasBosonicUpg(32)
		},
		leThreshold: 19,
		eff() {
			return Math.pow(tmp.effL[5] / 150 + 1, 0.25)
		},
		effDesc(x) {
			return formatPercentage(x - 1)
		}
	},
	8: {
		req() {
			return hasBosonicUpg(32)
		},
		leThreshold: 22,
		eff() {
			return Math.pow(tmp.effL[6] / 500 + 1, 0.125)
		},
		effDesc(x) {
			return formatPercentage(x - 1)
		}
	}
}

function isLEBoostUnlocked(x) {
	let data = leBoosts

	if (!pH.did("ghostify")) return false
	if (!player.ghostify.ghostlyPhotons.unl) return false
	if (x > data.max) return false
	if (data[x].req && !data[x].req()) return false
	return player.ghostify.ghostlyPhotons.enpowerments >= data[x].leThreshold
}

function updateLEmpowermentPrimary(){
	let gphData = player.ghostify.ghostlyPhotons
	getEl("lightEmpowerment").className = "gluonupgrade "+(gphData.lights[7] >= tmp.leReq ? "gph" : "unavailablebtn")
	getEl("lightEmpowermentReq").textContent = getFullExpansion(tmp.leReq)
	getEl("lightEmpowerments").textContent = getFullExpansion(gphData.enpowerments)
	getEl("lightEmpowermentScaling").textContent = getGalaxyScaleName(tmp.leReqScale) + "Light Empowerments"
	getEl("lightEmpowermentsEffect").textContent = shorten(tmp.leBoost)
}

function updateLEmpowermentBoosts(){
	let boosts = 0
	for (let e = 1; e <= leBoosts.max; e++) {
		let unlocked = isLEBoostUnlocked(e)
		if (unlocked) boosts++
		getEl("le"+e).style.visibility = unlocked ? "visible" : "hidden"
		if (unlocked && leBoosts[e].effDesc) getEl("leBoost" + e).textContent = leBoosts[e].effDesc(tmp.leBonus[e])
	}
	if (boosts >= 1) getEl("leBoost1Total").textContent = getFullExpansion(Math.floor(tmp.leBonus[1].total))
}