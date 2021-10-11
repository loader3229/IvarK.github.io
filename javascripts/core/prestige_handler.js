var pH = {
	order: ["paradox", "accelerate", "galaxy", "infinity", "eternity", "interreality", "singularity", "quantum", "fluctuate", "ghostify"],
	names: {
		infinity: "Infinity",
		eternity: "Eternity",
		quantum: "Quantum",
		fluctuate: "Fluctuate"
	},
	reqs: {
		paradox() {
			return player.money.max(1).log10() >= 3 && player.totalTickGained && !tmp.ri
		},
		accelerate() {
			return false
		},
		galaxy() {
			return getGSAmount().gte(1) && !tmp.ri
		},
		infinity() {
			return player.money.gte(Number.MAX_VALUE) && player.currentChallenge == "" && player.break
		},
		eternity() {
			var id7unlocked = player.infDimensionsUnlocked[7]
			if (getEternitied() >= 25 || (tmp.ngp3 && qu_save.bigRip.active)) id7unlocked = true
			return player.infinityPoints.gte(player.currentEternityChall != "" ? player.eternityChallGoal : Number.MAX_VALUE) && id7unlocked
		},
		interreality() {
			return ECComps("eterc10") >= 1
		},
		singularity() {
			return ngSg.can()
		},
		quantum() {
			return QCs.inAny() ? QCs.getGoal() :
				Decimal.gte(getQuantumReqSource(), getQuantumReq(true)) &&
				(!tmp.ngp3 || tmp.ngp3_mul || ECComps("eterc14") >= 1) &&
				getQuarkGain().gte(1)
		},
		fluctuate() {
			return player.money.e >= Math.pow(10, 13.5) && flun.gain() > 0
		},
		ghostify() {
			return false
		}
	},
	modReqs: {
		paradox() {
			return inNGM(5)
		},
		accelerate() {
			return tmp.ngmX >= 6
		},
		galaxy() {
			return inNGM(2)
		},
		interreality() {
			return inNGM(2)
		},
		singularity() {
			return tmp.ngSg
		},
		quantum() {
			return player.meta !== undefined
		},
		fluctuate() {
			return tmp.ngp3
		},
		ghostify() {
			return tmp.ngp3
		}
	},
	resetFuncs: {
		paradox() {
			pSac()
		},
		accelerate() {
			alert("Coming soon...")
		},
		galaxy() {
			galacticSacrifice()
		},
		infinity() {
			bigCrunch()
		},
		eternity() {
			getEl("eternitybtn").onclick()
		},
		interreality() {
			alert("Coming soon...")
		},
		singularity() {
			alert("Coming soon...")
		},
		quantum() {
			if (player.meta) {
				if (!QCs.inAny()) quantum(false, false, 0)
				else quantum()
			}
		},
		fluctuate() {
			flun.reset()
		},
		ghostify() {
			ghostify()
		}
	},
	tabLocs: {
		paradox: "paradox",
		accelerate: "accTab",
		galaxy: "galaxy",
		infinity: "infinity",
		eternity: "eternitystore",
		interreality: "irTab",
		singularity: "sgTab",
		quantum: "quantumtab",
		fluctuate: "fluctuateTab",
		ghostify: "ghostify"
	},
	hotkeys: {
		paradox: "p",
		accelerate: "a",
		galaxy: "g",
		infinity: "c",
		eternity: "e",
		interreality: "i",
		singularity: "s",
		quantum: "q",
		fluctuate: "f",
		ghostify: "g"
	},
	can(id) {
		return tmp_pH[id] && pH.reqs[id]()
	},
	didData: {
		paradox() {
			return player.pSac.times >= 1
		},
		accelerate() {
			return pH.did("galaxy")
		},
		galaxy() {
			return player.galacticSacrifice.times >= 1
		},
		infinity() {
			return player.infinitied >= 1
		},
		eternity() {
			return player.eternities >= 1
		},
		interreality() {
			return pH.did("singularity") || pH.did("quantum")
		},
		singularity() {
			return ngSg.save.times >= 1
		},
		quantum() {
			return qu_save.times >= 1
		},
		fluctuate() {
			return flun.unl()
		},
		ghostify() {
			return player.ghostify.times >= 1
		}
	},
	did(id) {
		return tmp_pH[id] && tmp_pH[id].did
	},
	has(id){
		return tmp_pH[id] && tmp_pH[id].did
	},
	displayData: {
		paradox: ["pSac", "px", "paradoxbtn"],
		accelerate: ["accReset", "vel", "accTabBtn"],
		galaxy: ["sacrificebtn", "galaxyPoints2", "galaxybtn"],
		infinity: ["postInfinityButton", "infinityPoints2", "infinitybtn"],
		eternity: ["eternitybtn", "eternityPoints2", "eternitystorebtn"],
		interreality: ["irReset", "irEmpty", "irTabBtn"],
		singularity: ["sgReset", "sgEmpty", "sgTabBtn"],
		quantum: ["quantumbtn", "quantumInfo", "quantumtabbtn"],
		fluctuate: ["fluctuateReset", "fluctuateInfo", "fluctuateBtn"],
		ghostify: ["ghostifybtn", "ghostparticles", "ghostifytabbtn"]
	},
	shown(id) {
		if (!tmp_pH[id]) return false
		if (!tmp_pH[id].did) return false

		if (id == "eternity" && !tmp.eterUnl) return false
		if (id == "quantum" && !tmp.quUnl) return false

		return !aarMod.layerHidden[id]
	},
	onHotkey(layer) {
		if (!layer) layer = tmp_pH.lastDid
		if (shiftDown) {
			if (pH.shown(layer)) showTab(pH.tabLocs[layer])
		} else pH.resetFuncs[layer]()
	},
	tmp: {},
	reset() {
		getEl("layerDispOptions").style.display = "none"
		//getEl("resetDispOptions").style.display = "none"

		var did = false
		tmp_pH = { layers: 0 }
		for (var x = pH.order.length; x > 0; x--) {
			var p = pH.order[x - 1]
			if (pH.modReqs[p] === undefined || pH.modReqs[p]()) {
				tmp_pH[p] = {}
				if (!did && pH.didData[p]()) {
					did = true
					tmp_pH.lastDid = p
				}
				if (did) pH.onPrestige(p)
				else getEl("hide_" + p).style.display = "none"
			} else getEl("hide_" + p).style.display = "none"
		}

		pH.updateActive()
	},
	updateDisplay() {
		tmp_pH.shown = 0
		for (var x = 0; x < pH.order.length; x++) {
			var p = pH.order[x]
			var d = pH.displayData[p]
			var prestigeShown = false
			var tabShown = false
			var shown = false

			if (!isEmptiness) {
				if (pH.can(p) && !aarMod.layerHidden[p]) prestigeShown = true
				if (pH.shown(p)) tabShown = true
				if (prestigeShown || tabShown) shown = true
			}

			if (tmp_pH[p] !== undefined) {
				if (shown) tmp_pH.shown++
				tmp_pH[p].shown = shown
				tmp_pH[p].order = tmp_pH.shown
			}

			getEl(d[0]).style.display = prestigeShown ? "" : "none"
			getEl(d[1]).style.display = tabShown ? "" : "none"
			getEl(d[2]).style.display = tabShown ? "" : "none"

			getEl(d[0]).className = "presBtn presPos" + tmp_pH.shown + " " + p + "btn"
			getEl(d[1]).className = "presCurrency" + tmp_pH.shown
		}

		//Blockages
		var blockRank = tmp_pH.shown
		if (!isEmptiness && QCs.in(4)) blockRank = blockRank + 2

		var haveBlock = blockRank >= 3
		getEl("bigcrunch").parentElement.style.top = haveBlock ? (Math.floor(blockRank / 3) * 120 + 19) + "px" : "19px"
		getEl("quantumBlock").style.display = haveBlock ? "" : "none"
		getEl("quantumBlock").style.height = haveBlock ? (Math.floor(blockRank / 3) * 120 + 12) + "px" : "120px"

		//Infinity Dimension unlocks
		if (player.break && !player.infDimensionsUnlocked[7] && getEternitied() < 25) {
			newDimPresPos = tmp_pH.eternity.shown ? tmp_pH.eternity.order : tmp_pH.shown + 1
			if (!tmp_pH.eternity.shown) tmp_pH.shown++
		}

		//Time Dilation
		if (player.dilation.active) getEl("eternitybtn").className = "presBtn presPos" + (tmp_pH.eternity.shown ? tmp_pH.eternity.order : tmp_pH.shown + 1) + " dilationbtn"

		//Quantum (after Neutrino Upgrade 16)
		let bigRipAndQuantum = !hasNU(16)
		if (!bigRipAndQuantum && !QCs.inAny()) getEl("quantumbtn").style.display = "none"
	},
	updateActive() {
		tmp.eterUnl = pH.did("eternity")
		tmp.quUnl = tmp.ngp3 && pH.did("quantum")
		tmp.quActive = tmp.quUnl
	},
	onPrestige(layer) {
		if (tmp_pH[layer].did) return
		tmp_pH[layer].did = true
		tmp_pH.layers++
		getEl("layerDispOptions").style.display = ""
		//getEl("resetDispOptions").style.display = ""
		getEl("hide_" + layer).style.display = ""
		getEl("hide_" + layer).innerHTML = (aarMod.layerHidden[layer] ? "Show" : "Hide") + " " + (pH.names[layer] || layer)

		pH.updateActive()
	},
	setupHTML(layer) {
		var html = ""
		for (var x = 0; x < pH.order.length; x++) {
			var p = pH.order[x]
			html += '<button id="hide_' + p + '" onclick="pH.hideOption(\'' + p + '\')" class="storebtn" style="color:black; width: 200px; height: 55px; font-size: 15px"></button> '
		}
		getEl("hideLayers").innerHTML = html
	},
	hideOption(layer) {
		if (aarMod.layerHidden[layer]) delete aarMod.layerHidden[layer]
		else aarMod.layerHidden[layer] = true

		getEl("hide_" + layer).innerHTML = (aarMod.layerHidden[layer] ? "Show" : "Hide") + " " + (pH.names[layer] || layer)

		if (layer == "infinity") getEl("postctabbtn").parentElement.style.display = pH.shown("infinity") && (player.postChallUnlocked >= 1 || pH.did("eternity")) ? "" : "none"
		if (layer == "eternity") updateEternityChallenges()
		if (layer == "quantum") handleDispOutOfQuantum()
		if (!aarMod.layerHidden[layer]) return

		if (layer == "infinity") {
			if (getEl("infinitydimensions").style.display == "block") showDimTab("antimatterdimensions")
			if (getEl("breakchallenges").style.display == "block") showChallengesTab("normalchallenges")
		}
		if (layer == "eternity") {
			if (getEl("timedimensions").style.display == "block" || getEl("metadimensions").style.display == "block") showDimTab("antimatterdimensions")
			if (getEl("eternitychallenges").style.display == "block") showChallengesTab("normalchallenges")
		}
	}
}
var tmp_pH = {}
let PRESTIGES = pH