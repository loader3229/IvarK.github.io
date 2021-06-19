let GDs = {
	setup() {
		let data = {
			unl: false,
			gv: new Decimal(0),
			gr: new Decimal(0),
			gsc: new Decimal(0),
			gdBoosts: 0,
			rdTick: new Decimal(0)
		}
		GDs.save = data

		for (var d = 1; d <= 4; d++) {
			data["gd" + d] = new Decimal(1)
			data["rd" + d] = new Decimal(1)
		}
		return data
	},
	compile() {
		delete GDs.save
		if (!player.ghostify || !player.ghostify.gds) return

		data = player.ghostify.gds
		GDs.save = data

		data.gv = new Decimal(data.gv)
		data.gr = new Decimal(data.gr)
		data.gsc = new Decimal(data.gsc)
		data.rdTick = new Decimal(data.rdTick)
		for (var d = 1; d <= 4; d++) {
			data["gd" + d] = Decimal.max(data["gd" + d], 1)
			data["rd" + d] = Decimal.max(data["rd" + d], 1)
		}
		data.gdBoosts = parseInt(data.gdBoosts)
		if (data.extraGDBs) data.extraGDBs = parseInt(data.extraGDBs)
		else data.extraGDBs = 0
		delete data.rdBoosts
	},
	updateTmp() {
		let data = {}
		GDs.tmp = data

		if (!GDs.unlocked()) return

		data.gdm = GDs.gdMult() //Determine the initial multiplier for Gravity Dimensions.

		//Gravity Dimension Boosts
		data.gdbPow = 1
		if (tmp.blu && hasBosonicUpg(63)) data.gdbPow *= tmp.blu[63]

		//Gravity Power
		let gp = Math.pow(Math.max(Math.pow(GDs.save.gv.max(1).log10(), tmp.ngp3_exp ? 2 : 3/2) - GDs.save.gr.add(10).log10(), 0), 2/3)

		if (gp > 10) {
			//Endless Radioactive softcaps! :D
			let layer = Math.floor(Math.sqrt(gp / 10))
			gp = layer * 10 + (gp / 10 - layer * layer) / (layer * 2 + 1) * 10
			data.gpr = true
		} else data.gpr = false
		data.gp = gp

		//Gravity Energy
		data.gem = GDs.energyMult() //Determine GE / GP
		data.ge = data.gem * gp //GP * GE / GP => GE (DO NOT EVER SOFTCAP THIS!)

		//Gravity Charge
		data.gc = GDs.chargeMult()
		data.gsc = GDs.superchargeMult()

		//Gravity Energy boosts...
		for (let i = 0; i < GDs.boosts.list.length; i++) {
			let b = GDs.boosts.list[i]
			if (!GDs.boosts[b].unl || GDs.boosts[b].unl()) data[b] = GDs.boosts[b].eff(GDs.charge(data.ge, b))
		}
	},
	setupHTML() {
		var html = ""
		for (let i = 0; i < GDs.boosts.list.length; i++) {
			let b = GDs.boosts.list[i]
			html += '<tr id="gvRow_' + b + '">' +
				'<td>' + GDs.boosts[b].desc.replace('{{x}}', '<span class="gvBoost" id="gvTo_' + b + '">1.00</span>') + '</td>' +
				'<td style="text-align: right"><button id="gvCharge_' + b + '" onclick="GDs.chargeBoost(\'' + b + '\')">Charge</button></td>' +
				'</tr>'
		}
		getEl("gvBoosts").innerHTML = html
	},
	setupDisplays() {
		GDs.updateDisplay()
		GDs.dimDisplay()
		GDs.chargeDisplay()
	},
	updateDisplay() {
		if (!GDs.unlocked()) return

		getEl("gvCharge").textContent = (GDs.tmp.gc * 100).toFixed(2) + "%"
		getEl("gvSupercharge").textContent = (GDs.tmp.gsc * 100).toFixed(2) + "%"
		
		getEl("plReq").textContent = pl.reqText()
	},
	updateDisplayOnTick() {
		getEl("gdWatt").textContent = shorten(tmp.bl.speed)
		getEl("gdMult").textContent = shorten(GDs.tmp.gdm)
		getEl("gvRate").textContent = "+" + shortenMoney(Decimal.pow(GDs.tmp.gdm, GDs.gdExp(1)).times(GDs.save.gd1)) + "/s"

		GDs.getExtraGDBs()
		let totalGDBs = GDs.totalGDBs()
		getEl("gdBoost").textContent = totalGDBs >= 3 ? "Boost all Gravity Dimensions" : "Unlock a new Dimension"
		getEl("gdBoostDesc").textContent = "Gravity Dimension " + (totalGDBs >= 3 ? "Boost" : "Shift") + " (" + getFullExpansion(GDs.save.gdBoosts) + " + " + getFullExpansion(GDs.save.extraGDBs) + "): requires " + shortenDimensions(GDs.gdBoostReq()) + " Gravity Radiation"
		getEl("gdBoost").className = GDs.save.gr.gte(GDs.gdBoostReq()) ? "storebtn gv" : "unavailablebtn"
		let nameofthing = totalGDBs > 3 ? "Boost" : "Shift"
		getEl("extraGDB").textContent = "The next extra Gravity Dimension " + nameofthing + " is at " + getFullExpansion(GDs.extraGDBReq()) + " Higgs Bosons. (You have " + getFullExpansion(player.ghostify.hb.higgs) + ")"
	
		getEl("rdTick").textContent = shortenDimensions(GDs.save.rdTick)
		getEl("rdNextTickDiv").style.display = GDs.save.rdTick.gte(100) ? "none" : ""
		if (GDs.save.rdTick.lt(100)) getEl("rdNextTick").textContent = shorten(GDs.rdNextTickAt())
		for (var d = 1; d <= 4; d++) {
			if (d <= totalGDBs + 1) {
				getEl("gd" + d).textContent = DISPLAY_NAMES[d] + " Gravity Dimension ^" + GDs.gdExp(d).toFixed(2)
				getEl("gd" + d + "Amount").textContent = shortenDimensions(GDs.save["gd" + d])
			}
			getEl("rd" + d + "Amount").textContent = shortenDimensions(GDs.save["rd" + d])
		}

		getEl("gv").textContent = shortenMoney(GDs.save.gv)
		getEl("gr").textContent = shortenMoney(GDs.save.gr)
		getEl("gvPow").textContent = GDs.tmp.gp.toFixed(2)
		getEl("gvPowScaling").textContent = (GDs.tmp.gpr ? "Radioactive " : "") + "Power"
		getEl("gvEne").textContent = GDs.tmp.ge.toFixed(2)
		getEl("gvEneMult").textContent = GDs.tmp.gem.toFixed(2)

		getEl("gvNoPow").style.display = GDs.tmp.gp == 0 ? "" : "none"
		if (GDs.tmp.gp == 0) getEl("gvPowStart").textContent = shortenMoney(Decimal.pow(10, Math.pow(GDs.save.gr.add(10).log10(), 2/3)))

		for (let i = 0; i < GDs.boosts.list.length; i++) {
			let b = GDs.boosts.list[i]
			let u = GDs.tmp[b] !== undefined
			getEl("gvRow_" + b).style.display = u ? "" : "none"
			if (u) getEl("gvTo_" + b).textContent = GDs.tmp[b].toFixed(2)
		}
	},
	teleport() {
		showDimTab("gdims")
		showTab("dimensions")
	},
	can() {
		return player.totalmoney.log10() >= 1e18 && player.ghostify.hb.higgs >= 40
	},
	reqText() {
		return shortenCosts(Decimal.pow(10, 1e18)) + " antimatter and " + getFullExpansion(40) + " Higgs Bosons"
	},
	unl() {
		if (GDs.unlocked()) return
		if (!GDs.can()) return

		GDs.save.unl = true
		$.notify("Congratulations! You have unlocked Gravity Dimensions!", "success")
		bu.rows = 6
		QCs.updateDisp()
		updateNeutrinoBoosts()
		updateBosonUnlockDisplay()
		GDs.unlDisplay()
	},
	unlDisplay() {
		let unl = GDs.unlocked()
		getEl("gdtabbtn").style.display = unl ? "" : "none"
		getEl("gvBlCell").style.display = unl ? "" : "none"
		getEl("breakUpgR4").style.display = unl ? "" : "none"
		updateNeutrinoUpgradeUnlocks(16, 18)

		if (unl) GDs.setupDisplays()
	},
	unlocked() {
		return GDs.save && GDs.save.unl
	},
	gdTick(diff) {
		for (let d = Math.min(GDs.totalGDBs() + 1, 4); d >= 1; d--) {
			let add = Decimal.pow(GDs.tmp.gdm, GDs.gdExp(d)).times(GDs.save["gd" + d])
			if (d == 1) GDs.save.gv = GDs.save.gv.add(add.times(diff))
			else GDs.save["gd" + (d - 1)] = GDs.save["gd" + (d - 1)].add(add.times(tmp.bgMode ? diff : diff / 10))
		}
	},
	gdMult() {
		return tmp.bl.speed.max(1).log10() / 3 + 1
	},
	gdExp(dim) {
		let x = 1
		x += (GDs.totalGDBs() - dim + 1) / Math.sqrt(dim) * GDs.tmp.gdbPow
		return x
	},
	gdBoost(x) {
		if (!GDs.save.gr.gte(GDs.gdBoostReq())) return
		let old = GDs.totalGDBs()
		GDs.save.gdBoosts++
		if (old <= 3) GDs.dimDisplay()
	},
	gdBoostReq(x) {
		if (x === undefined) x = GDs.save.gdBoosts
		let y = Decimal.pow(10, (x * Math.min(x, hasBosonicUpg(65) ? tmp.blu[65] : 15) * 0.25 + x * 2.75 + 5) * GDs.rdExp() * 2)
		return y
	},
	extraGDBReq() {
		let e = GDs.save.extraGDBs
		let x
		if (hasBosonicUpg(53)) x = e * 15
		else x = Math.pow(e, 2) * 5
		x += 50
		return Math.ceil(x)
	},
	getExtraGDBs() {
		let h = player.ghostify.hb.higgs
		let target = h - 50
		if (hasBosonicUpg(53)) target = target / 15
		else target = Math.sqrt(target / 5)
		target = Math.floor(target)
		let toAdd = Math.max(target - GDs.save.extraGDBs + 1, 0)
		if (toAdd < 1) return

		let old = GDs.totalGDBs()
		GDs.save.extraGDBs += toAdd
		if (old <= 3) GDs.dimDisplay()
	},
	totalGDBs() {
		return GDs.save.gdBoosts + GDs.save.extraGDBs
	},
	rdNextTickAt() {
		return GDs.save.rdTick.add(1).pow(1 / GDs.rdExp()).times(30)
	},
	rdTargetTick() {
		return Decimal.div(tmp.bl.speed, 30).pow(GDs.rdExp()).floor()
	},
	gainRDTicks() {
		let target = GDs.rdTargetTick()
		if (GDs.save.rdTick.gte(target)) return
		GDs.rdTick(target.sub(GDs.save.rdTick))
		GDs.save.rdTick = target
	},
	rdTick(diff) {
		for (var d = 4; d >= 1; d--) {
			if (d == 1) GDs.save.gr = GDs.save.gr.add(GDs.save["rd" + d].times(diff))
			else GDs.save["rd" + (d - 1)] = GDs.save["rd" + (d - 1)].add(GDs.save["rd" + d].div(10).times(diff))
		}
	},
	rdExp() {
		return GDs.save.gc ? GDs.boosts[GDs.save.gc].rdExp : 0.5
	},
	dimDisplay() {
		let totalGDBs = GDs.totalGDBs()
		for (var d = 1; d <= 4; d++) getEl("gd" + d + "Row").style.visibility = d <= totalGDBs + 1 ? "" : "hidden"
	},
	dimReset() {
		let data = GDs.save
		if (!GDs.unlocked()) return

		data.gv = new Decimal(0)
		data.gr = new Decimal(0)
		data.rdTick = new Decimal(0)
		for (var d = 1; d <= 4; d++) {
			data["gd" + d] = new Decimal(1)
			data["rd" + d] = new Decimal(1)
		}
	},
	energyMult() {
		let x = 1
		if (isEnchantUsed(15)) x = tmp.bEn[15]
		if (isEnchantUsed(45)) x *= tmp.bEn[45]
		return x
	},
	charge(ge, id) {
		let mult = 1
		if (GDs.save.gc == id) mult += GDs.tmp.gc
		if (pl.on()) mult += GDs.tmp.gsc

		return ge * mult
	},
	chargeMult() {
		let x = 2
		if (isEnchantUsed(45)) x /= tmp.bEn[45]
		return x
	},
	superchargeMult() {
		return tmp.ngpX >= 5 ? (pl.save.layer - 1) / 5 : 0
	},
	chargeBoost(id) {
		if (GDs.save.gc == id) return
		if (!confirm("You will charge up a boost, but this requires a Higgs reset and a reset to all Gravity / Radiation Dimensions. Be warned: You will let Radiation goes up more. Are you sure?")) return
		this.save.gdBoosts = 0
		bosonicLabReset()
		getEl("gv" + (GDs.save.gc ? "Charge_" + GDs.save.gc : "Uncharge")).className = "storebtn gv"
		getEl("gvCharge_" + id).className = "chosenbtn"
		GDs.dimDisplay()
		GDs.save.gc = id
	},
	unchargeBoost() {
		if (!GDs.save.gc) return
		if (!confirm("This discharges all your boosts, but this will reset everything that charging resets. Are you sure?")) return
		this.save.gdBoosts = 0
		bosonicLabReset()
		getEl("gvCharge_" + GDs.save.gc).className = "storebtn gv"
		getEl("gvUncharge").className = "chosenbtn"
		GDs.dimDisplay()
		delete GDs.save.gc
	},
	chargeDisplay() {
		let c = GDs.save.gc
		for (let i = 0; i < GDs.boosts.list.length; i++) {
			let b = GDs.boosts.list[i]
			getEl("gvCharge_" + b).className = c == b ? "chosenbtn" : "storebtn gv"
		}
		getEl("gvUncharge").className = !c ? "chosenbtn" : "storebtn gv"
	},
	boosts: {
		list: ["rep", "nf", "tod", "gph", "bl", "mf"],
		rep: {
			desc: "x{{x}} OoMs to replicate interval increase",
			unl() {
				return hasBosonicUpg(63) || !pl.on()
			},
			eff(x) {
				return Math.log10(x + 1) + 1
			},
			rdExp: 0.5
		},
		nf: {
			desc: "^{{x}} to Nanospeed",
			unl() {
				return !pl.on()
			},
			eff(x) {
				return x + 1
			},
			rdExp: 1.5
		},
		tod: {
			desc: "^{{x}} to Branch speed",
			unl() {
				return !pl.on()
			},
			eff(x) {
				let e = Math.pow(x / 2 + 1, 1/3)
				if (hasNU(18)) e = Math.max(Math.pow(x / 18 + 1, 2/3), e)
				return e
			},
			rdExp: 2
		},
		gph: {
			desc: "^{{x}} to Photonic Flow",
			eff(x) {
				return x / 2 + 1
			},
			rdExp: 1.5
		},
		bl: {
			desc: "^{{x}} to Bosonic Watts and Overdrive Speed",
			eff(x) {
				x = Math.sqrt(x / 3 + 1)
				if (bu62.active("tod")) x += tmp.blu[62] || 0
				return x
			},
			rdExp: 1
		},
		mf: {
			desc: "^{{x}} to Matterius Foam speed",
			unl() {
				return pl.on()
			},
			eff(x) {
				return x + 1
			},
			rdExp: 1
		},
	},
	boostUnl(x) {
		return GDs.unlocked() && GDs.tmp[x]
	},
	reset(unl) {
		if (!unl && getEl("gdims").style.display != "none") showDimTab("antimatterdimensions")
		player.ghostify.gv = GDs.setup()
		GDs.save.unl = unl
		GDs.unlDisplay()
	}
}

//Bosonic Upgrade 27 / r62 (Secondary Charging)
let bu62 = {
	eff: {
		none() {
			return 1
		},
		rep() {
			return 1
		},
		nf() {
			return Math.pow(qu_save.nanofield.rewards / 15000 + 1, 10)
		},
		tod() {
			return getTotalRadioactiveDecays() / 250
		},
		gph() {
			return 1
		},
		bl() {
			return 1
		},
		mf() {
			return 1
		},
	},
	desc: {
		none(x) {
			return "Charge one to activate this upgrade! :/"
		},
		rep(x) {
			return "Replicantis raise Intergalactic multiplier further."
		},
		nf(x) {
			return "Outside of Big Rips, Nanorewards reduce QC goals by " + shorten(x) + "x."
		},
		tod(x) {
			return "Radioactive Decays add the Bosonic Watt gain exponent by +" + shorten(x) + "."
		},
		gph(x) {
			return "Strengthen Bosonic Upgrade 3, but you can't get Light Empowerments."
		},
		bl(x) {
			return "No secondary bonus. :'("
		},
		mf(x) {
			return "???"
		},
	},
	active(x) {
		return hasBosonicUpg(62) && GDs.save.gc == x
	}
}