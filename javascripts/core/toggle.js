function toggleChallengeRetry() {
	player.options.retryChallenge = !player.options.retryChallenge
	getEl("retry").textContent = "Automatically retry challenges: O" + (player.options.retryChallenge ? "N" : "FF")
}

function togglePerformanceTicks() {
	aarMod.performanceTicks = ((aarMod.performanceTicks || 0) + 1) % 4
	updatePerformanceTicks()
}

function toggleLogRateChange() {
	aarMod.logRateChange=!aarMod.logRateChange
	getEl("toggleLogRateChange").textContent = "Logarithm rate: O" + (aarMod.logRateChange ? "N" : "FF")
	dimDescEnd = (aarMod.logRateChange?" OoM":"%")+"/s)"
}

function toggleTabsSave() {
	aarMod.tabsSave.on =! aarMod.tabsSave.on
	getEl("tabsSave").textContent = "Saved tabs: O" + (aarMod.tabsSave.on ? "N" : "FF")
}

function infMultAutoToggle() {
	if (getEternitied()<1) {
		if (canBuyIPMult()) {
			let toBuy = Math.max(Math.floor(player.infinityPoints.div(player.infMultCost).times(ipMultCostIncrease - 1).plus(1).log(ipMultCostIncrease)), 1)
			let toSpend = Decimal.pow(ipMultCostIncrease, toBuy).sub(1).div(ipMultCostIncrease - 1).times(player.infMultCost).round()

			if (toSpend.gt(player.infinityPoints)) player.infinityPoints = new Decimal(0)
			else player.infinityPoints = player.infinityPoints.sub(toSpend)

			let multInc = Decimal.pow(getIPMultPower(), toBuy)
			player.infMult = player.infMult.times(multInc)
			player.infMultCost = player.infMultCost.times(Decimal.pow(ipMultCostIncrease, toBuy))
			player.autoIP = player.autoIP.times(multInc)

			if (player.autobuyers[11].priority !== undefined && player.autobuyers[11].priority !== null && player.autoCrunchMode == "amount") player.autobuyers[11].priority = multInc.times(player.autobuyers[11].priority)
			if (player.autoCrunchMode == "amount") getEl("priority12").value = formatValue("Scientific", player.autobuyers[11].priority, 2, 0)
		}
	} else {
		player.infMultBuyer = !player.infMultBuyer
		getEl("infmultbuyer").textContent = "Autobuy IP mult: O" + (player.infMultBuyer ? "N" : "FF")
	}
}

function toggleEternityConf() {
	player.options.eternityconfirm = !player.options.eternityconfirm
	getEl("eternityconf").textContent = "Eternity confirmation: O" + (player.options.eternityconfirm ? "N" : "FF")
}

function toggleDilaConf() {
	aarMod.dilationConf = !aarMod.dilationConf
	getEl("dilationConfirmBtn").textContent = "Dilation confirmation: O" + (aarMod.dilationConf ? "N" : "FF")
}

function toggleOfflineProgress() {
	aarMod.offlineProgress = !aarMod.offlineProgress
	getEl("offlineProgress").textContent = "Offline progress: O"+(aarMod.offlineProgress?"N":"FF")
}

function toggleAutoBuyers() {
	var bool = player.autobuyers[0].isOn
	for (var i = 0; i<player.autobuyers.length; i++) {
		if (player.autobuyers[i]%1 !== 0) {
			player.autobuyers[i].isOn = !bool
		}
	}
	player.autoSacrifice.isOn = !bool
	player.eternityBuyer.isOn = !bool
	if (tmp.ngp3) qu_save.autobuyer.enabled = !bool
	updateCheckBoxes()
	updateAutobuyers()
}

function toggleBulk() {
	if (player.options.bulkOn) {
		player.options.bulkOn = false
		getEl("togglebulk").textContent = "Enable bulk buy"
	} else {
		player.options.bulkOn = true
		getEl("togglebulk").textContent = "Disable bulk buy"
	}
}

function toggleHotkeys() {
	if (player.options.hotkeys) {
		player.options.hotkeys = false
		getEl("hotkeys").textContent = "Enable hotkeys"
	} else {
		player.options.hotkeys = true
		getEl("hotkeys").textContent = "Disable hotkeys"
	}
}

function respecToggle() {
	player.respec = !player.respec
	updateRespecButtons()
}

function toggleProductionTab() {
	// 0 == visible, 1 == not visible
	aarMod.hideProductionTab=!aarMod.hideProductionTab
	getEl("hideProductionTab").textContent = (aarMod.hideProductionTab?"Show":"Hide")+" production tab"
	if (getEl("production").style.display == "block") showDimTab("antimatterdimensions")
}

function toggleRepresentation() {
	// 0 == visible, 1 == not visible
	aarMod.hideRepresentation=!aarMod.hideRepresentation
	getEl("hideRepresentation").textContent=(aarMod.hideRepresentation?"Show":"Hide")+" antimatter representation"
}

function toggleProgressBar() {
	aarMod.progressBar=!aarMod.progressBar
	getEl("progressBarBtn").textContent = (aarMod.progressBar?"Hide":"Show")+" progress bar"	
}

function toggleReplAuto(i) {
	if (i == "chance") {
		if (player.replicanti.auto[0]) {
			player.replicanti.auto[0] = false
			getEl("replauto1").textContent = "Auto: OFF"
		} else {
			player.replicanti.auto[0] = true
			getEl("replauto1").textContent = "Auto: ON"
		}
	} else if (i == "interval") {
		if (player.replicanti.auto[1]) {
			player.replicanti.auto[1] = false
			getEl("replauto2").textContent = "Auto: OFF"
		} else {
			player.replicanti.auto[1] = true
			getEl("replauto2").textContent = "Auto: ON"
		}
	} else if (i == "galaxy") {
		if (player.replicanti.auto[2]) {
			player.replicanti.auto[2] = false
			getEl("replauto3").textContent = "Auto: OFF"
		} else {
			player.replicanti.auto[2] = true
			getEl("replauto3").textContent = "Auto: ON"
		}
	}
}
