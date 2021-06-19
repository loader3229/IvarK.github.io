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

var apLoaded = false
var apInterval
var loadedAPs = 0
function loadAP() {
	if (apLoaded) return
	apLoaded = true
	loadedAPs = 0
	getEl("automatedPresets").innerHTML = ""
	occupied = false
	apInterval = setInterval(function() {
		if (occupied) return
		occupied = true
		if (loadedAPs == player.eternityBuyer.presets.order.length) {
			clearInterval(apInterval)
			return
		} else if (!onLoading) {
			latestRow = getEl("automatedPresets").insertRow(loadedAPs)
			onLoading = true
		}
		try {
			latestRow.innerHTML = '<td id="apselected'+loadedAPs+'"></td><td><b id="apname'+loadedAPs+'"></b><br># of eternities: <input id="apeternities'+loadedAPs+'" type="text" onchange="changeAPEternities('+loadedAPs+')" value=2></input><button class="storebtn" onclick="selectNextAP('+loadedAPs+')">Select next</button> <button class="storebtn" onclick="moveAP('+loadedAPs+', -1)">Move up</button> <button class="storebtn" onclick="moveAP('+loadedAPs+', 1)">Move down</button> <button class="storebtn" onclick="renameAP('+loadedAPs+')">Rename</button> <button class="storebtn" onclick="replaceAP('+loadedAPs+')">Replace</button> <button id="apdisable'+loadedAPs+'" class="storebtn" onclick="disableAP('+loadedAPs+')"></button> <button class="storebtn"onclick="removeAP('+loadedAPs+')">Remove</button></td>'
			changeAPOptions(player.eternityBuyer.presets.order[loadedAPs],loadedAPs)
			loadedAPs++
			onLoading = false
		} catch (_) {}
		occupied = false
	}, 0)
	if (player.eternityBuyer.presets.dil === undefined) {
		getEl("apDilSelected").textContent = ""
		getEl("apDil").innerHTML = '<b>Empty Dilation preset</b><br>(Dilating time selects this)<br><button class="storebtn" onclick="createAP(false, \'dil\')">Add preset</button> <button class="storebtn" onclick="createAP(true, \'dil\')">Import preset</button>'
	} else {
		getEl("apDil").innerHTML = '<b id="apnamedil"></b><br>(Dilating time selects this)<br><button class="storebtn" onclick="renameAP(\'dil\')">Rename</button> <button class="storebtn" onclick="replaceAP(\'dil\')">Replace</button> <button id="apdisabledil" class="storebtn" onclick="disableAP(\'dil\')"></button>'
		changeAPOptions('dil')
	}
	if (player.eternityBuyer.presets.grind === undefined) {
		getEl("apGrindSelected").textContent = ""
		getEl("apGrind").innerHTML = '<b>Empty grind preset</b><br>(Eternitying with <1% log(EP) gain selects this)<br><button class="storebtn" onclick="createAP(false, \'grind\')">Add preset</button> <button class="storebtn" onclick="createAP(true, \'dil\')">Import preset</button>'
	} else {
		getEl("apGrind").innerHTML = '<b id="apnamegrind"></b><br>(Eternitying with <1% log(EP) gain selects this)<br><button class="storebtn" onclick="renameAP(\'grind\')">Rename</button> <button class="storebtn" onclick="replaceAP(\'grind\')">Replace</button> <button id="apdisablegrind" class="storebtn" onclick="disableAP(\'grind\')"></button>'
		changeAPOptions('grind')
	}
}

function changeAPOptions(id, placement) {
	if (id == "grind") {
		let name = "Unnamed grind preset"
		let apData = player.eternityBuyer.presets.grind
		if (apData.title!="") name = apData.title
		getEl("apnamegrind").textContent = name
		getEl("apdisablegrind").textContent = apData.on ? "Disable" : "Enable"
		getEl("apGrindSelected").textContent = player.eternityBuyer.presets.selected == "grind" ? ">>" : ""
	} else if (id == "dil") {
		let name = "Unnamed Dilation preset"
		let apData = player.eternityBuyer.presets.dil
		if (apData.title != "") name = apData.title
		getEl("apnamedil").textContent = name
		getEl("apdisabledil").textContent = apData.on ? "Disable" : "Enable"
		getEl("apDilSelected").textContent = player.eternityBuyer.presets.selected == "dil" ? ">>" : ""
	} else {
		let name = "#" + (placement + 1)
		let pointer = ""
		let apData = player.eternityBuyer.presets[id]
		if (apData.title != "") name = apData.title
		getEl("apname" + placement).textContent = name
		getEl("apeternities" + placement).value = apData.length
		getEl("apdisable" + placement).textContent = apData.on ? "Disable" : "Enable"
		if (placement == player.eternityBuyer.presets.selected) pointer = ">>"
		else if (placement == player.eternityBuyer.presets.selectNext) pointer = ">"
		getEl("apselected" + placement).textContent = pointer
	}
}

function changeAPEternities(id) {
	let value = parseInt(getEl("apeternities" + id).value)
	if (!isNaN(value)) if (value > 0) player.eternityBuyer.presets[player.eternityBuyer.presets.order[id]].length = value
}

function createAP(importing, type) {
	if (importing) {
		onImport = true
		var input = prompt()
		if (input === null) return
		onImport = false
	} else {
		var mtsstudies=[]
		for (var id2 = 0; id2 < player.masterystudies.length; id2++) {
			var t = player.masterystudies[id2].split("t")[1]
			if (t) mtsstudies.push(t)
		}
		var input = player.timestudy.studies + (mtsstudies.length > 0 ? "," + mtsstudies : "") + "|" + player.eternityChallUnlocked
	}
	var id = 1
	if (type) id = type
	else {
		while (player.eternityBuyer.presets.order.includes(id)) id++
		player.eternityBuyer.presets.order.push(id)
	}
	player.eternityBuyer.presets[id] = {title: "", preset: input, length: 1, on: true}
	if (type == "grind") {
		getEl("apGrind").innerHTML = '<b id="apnamegrind"></b><br>(Eternitying with <1% log(EP) gain selects this)<br><button class="storebtn" onclick="renameAP(\'grind\')">Rename</button> <button class="storebtn" onclick="replaceAP(\'grind\')">Replace</button> <button id="apdisablegrind" class="storebtn" onclick="disableAP(\'grind\')"></button>'
		changeAPOptions('grind')
		$.notify("Grind preset created", "info")
	} else if (type) {
		getEl("apDil").innerHTML = '<b id="apnamedil"></b><br>(Dilating time selects this)<br><button class="storebtn" onclick="renameAP(\'dil\')">Rename</button> <button class="storebtn" onclick="replaceAP(\'dil\')">Replace</button> <button id="apdisabledil" class="storebtn" onclick="disableAP(\'dil\')"></button>'
		changeAPOptions('dil')
		$.notify("Dilation preset created", "info")
	} else {
		if (loadedAPs + 1 == player.eternityBuyer.presets.order.length) {
			let latestRow = getEl("automatedPresets").insertRow(loadedAPs)
			latestRow.innerHTML = '<td id="apselected'+loadedAPs+'"></td><td><b id="apname'+loadedAPs+'"></b><br># of eternities: <input id="apeternities'+loadedAPs+'" type="text" onchange="changeAPEternities('+loadedAPs+')" value=2></input><button class="storebtn" onclick="selectNextAP('+loadedAPs+')">Select next</button> <button class="storebtn" onclick="moveAP('+loadedAPs+', -1)">Move up</button> <button class="storebtn" onclick="moveAP('+loadedAPs+', 1)">Move down</button> <button class="storebtn" onclick="renameAP('+loadedAPs+')">Rename</button> <button class="storebtn" onclick="replaceAP('+loadedAPs+')">Replace</button> <button id="apdisable'+loadedAPs+'" class="storebtn" onclick="disableAP('+loadedAPs+')"></button> <button class="storebtn"onclick="removeAP('+loadedAPs+')">Remove</button></td>'
			changeAPOptions(id, loadedAPs)
			loadedAPs++
		}
		$.notify("Preset #" + player.eternityBuyer.presets.order.length + " created", "info")
	}
}

function selectNextAP(id) {
	if (player.eternityBuyer.presets.selected == id) return
	if (player.eternityBuyer.presets.selectNext == id) return
	if (player.eternityBuyer.presets.selectNext >- 1) getEl("apselected" + player.eternityBuyer.presets.selectNext).textContent = ""
	getEl("apselected" + id).textContent = ">"
	player.eternityBuyer.presets.selectNext = id
}

function moveAP(id, offset) {
	var apData = player.eternityBuyer.presets
	var orderData = apData.order
	if (offset > 0) {
		if (id + offset >= orderData.length) return
	} else if (id + offset < 0) return
	var storedCell = orderData[id + offset]
	orderData[id + offset] = orderData[id]
	orderData[id] = storedCell
	if (apData.selected == id) apData.selected = id + offset
	else if (apData.selected == id + offset) apData.selected = id
	if (apData.selectNext == id) apData.selectNext = id + offset
	else if (apData.selectNext == id + offset) apData.selectNext = id
	changeAPOptions(orderData[id], id)
	changeAPOptions(orderData[id + offset], id + offset)
	$.notify("Preset #" + (id + 1) + " moved", "info")
}

function renameAP(id) {
	onImport = true
	var input = prompt()
	if (input === null) return
	onImport = false
	if (id == "grind") {
		player.eternityBuyer.presets.grind.title = input
		changeAPOptions('grind')
		$.notify("Grind preset renamed", "info")
	} else if (id == "dil") {
		player.eternityBuyer.presets.dil.title = input
		changeAPOptions('dil')
		$.notify("Dilation preset renamed", "info")
	} else {
		player.eternityBuyer.presets[player.eternityBuyer.presets.order[id]].title = input
		changeAPOptions(player.eternityBuyer.presets.order[id],id)
		$.notify("Preset #" + (id + 1) + " renamed", "info")
	}
}

function replaceAP(id) {
	onImport = true
	var input = prompt()
	if (input === null) return
	onImport = false
	if (id == "grind") {
		player.eternityBuyer.presets.grind.preset = input
		$.notify("Grind preset replaced", "info")
	} else if (id == "dil") {
		player.eternityBuyer.presets.dil.preset = input
		$.notify("Dilation preset replaced", "info")
	} else {
		player.eternityBuyer.presets[player.eternityBuyer.presets.order[id]].preset = input
		$.notify("Preset #" + (id + 1) + " replaced", "info")
	}
}

function disableAP(id) {
	let apData = player.eternityBuyer.presets[typeof(id) == "number" ? player.eternityBuyer.presets.order[id] : id]
	apData.on = !apData.on
	getEl("apdisable" + id).textContent = apData.on ? "Disable" : "Enable"
}

function removeAP(id) {
	var order = player.eternityBuyer.presets.order
	var newOrder = []
	for (var i = 0; i < order.length; i++) {
		if (i == id) {
			getEl("automatedPresets").deleteRow(i)
			loadedAPs--
			if (player.eternityBuyer.presets.selected == i) player.eternityBuyer.presets.selected = -1
			if (player.eternityBuyer.presets.selectNext == i && i + 1 == order.length && order.length > 1) {
				player.eternityBuyer.presets.selectNext = 0
				getEl("apselected0").textContent = ">"
			}
			if (player.eternityBuyer.presets.selectNext > i) player.eternityBuyer.presets.selectNext--
			if (player.eternityBuyer.presets.reselect == i) delete player.eternityBuyer.presets.reselect
			delete player.eternityBuyer.presets[order[i]]
		} else newOrder.push(order[i])
		if (i > id) {
			let row = getEl("automatedPresets").rows[i - 1]
			let j = i-1
			row.innerHTML = '<td id="apselected' + j + '"></td><td><b id="apname' + j + '"></b><br># of eternities: <input id="apeternities' + j + '" type="text" onchange="changeAPEternities(' + j + ')" value=2></input><button class="storebtn" onclick="selectNextAP(' + j + ')">Select next</button> <button class="storebtn" onclick="moveAP(' + j + ', -1)">Move up</button> <button class="storebtn" onclick="moveAP(' + j + ', 1)">Move down</button> <button class="storebtn" onclick="renameAP('+j+')">Rename</button> <button class="storebtn" onclick="replaceAP('+j+')">Replace</button> <button id="apdisable'+j+'" class="storebtn" onclick="disableAP('+j+')"></button> <button class="storebtn"onclick="removeAP('+j+')">Remove</button></td>'
			changeAPOptions(order[i], j)
		}
	}
	player.eternityBuyer.presets.order=newOrder
	$.notify("Preset #" + (id + 1) + " removed", "info")
}