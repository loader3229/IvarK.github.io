function updateAutoEterMode() {
	var modeText = ""
	var modeCond = ""
	getEl("priority13").disabled = false
	if (player.autoEterMode == "replicanti" || player.autoEterMode == "peak") player.autoEterMode = "time"
	if (player.autoEterMode == "time") {
		modeText = "time"
		modeCond = "Seconds between eternities:"
	} else if (player.autoEterMode == "relative") {
		modeText = "X times last eternity"
		modeCond = modeText + ":"
	} else if (player.autoEterMode == "relativebest") {
		modeText = "X times best of last 10"
		modeCond = modeText + " eternities:"
	} else if (player.autoEterMode == "eternitied") {
		modeText = "X times eternitied"
		modeCond = modeText + ":"
	} else if (player.autoEterMode == "exponent") {
		modeText = "eternitied^X"
		modeCond = "Wait until your gain reaches ^x of total eternities: "
	} else if (player.autoEterMode === undefined || player.autoEterMode == "amount") {
		modeText = "amount"
		modeCond = "Amount of EP to wait until reset:"
	} else {
		modeText = "[DELETED]"
		modeCond = "Click the auto-eternity mode!"
	}
	getEl("toggleautoetermode").textContent = "Auto eternity mode: " + modeText
	getEl("eterlimittext").textContent = modeCond
}

function toggleAutoEterMode() {
	if (player.autoEterMode == "amount") player.autoEterMode = "time"
	else if (player.autoEterMode == "time") player.autoEterMode = "relative"
	else if (player.autoEterMode == "relative") player.autoEterMode = "relativebest"
	else if (player.autoEterMode == "relativebest" && qMs.tmp.amt >= 4) player.autoEterMode = "eternitied"
	else if (player.autoEterMode == "eternitied") player.autoEterMode = "exponent"
	else if (player.autoEterMode) player.autoEterMode = "amount"
	updateAutoEterMode()
}

function toggleAutoEter(id) {
	player.autoEterOptions[id] = !player.autoEterOptions[id]
	getEl(id + 'auto').textContent = (id == "dilUpgs" ? "Auto-buy dilation upgrades" : (id == "rebuyupg" ? "Rebuyable upgrade a" : id == "metaboost" ? "Meta-boost a" : "A") + "uto") + ": " + (player.autoEterOptions[id] ? "ON" : "OFF")
	if (id.slice(0,2) == "td") {
		var removeMaxAll = false
		for (var d = 1; d < 9; d++) {
			if (player.autoEterOptions["td" + d]) {
				if (d > 7) removeMaxAll = true
			} else break
		}
		getEl("maxTimeDimensions").style.display = removeMaxAll ? "none" : ""
	}
}

function doAutoEterTick() {
	if (!player.meta) return
	if (hasAch("ngpp17")) {
		if (player.masterystudies == undefined || tmp.be || !qu_save.bigRip.active) for (var d = 1; d < 9; d++) if (player.autoEterOptions["td" + d]) buyMaxTimeDimension(d)
		if (player.autoEterOptions.epmult) buyMaxEPMult()
		if (player.autoEterOptions.blackhole) {
			buyMaxBlackholeDimensions()
			feedBlackholeMax()
		}
	}
	if (player.autoEterOptions.tt && !(hasDilationUpg(10) && getTTProduction() > 1e3)) maxTheorems()
}