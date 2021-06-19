var pH = {
	order: ["paradox", "accelerate", "galaxy", "infinity", "eternity", "interreality", "singularity", "quantum", "ghostify", "planck"],
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
			return Decimal.gte(
					getQuantumReqSource(), 
					getQuantumReq(true)
				)
				&& (!tmp.ngp3 || (
					QCs.inAny() ? QCs.getGoal() :
					(tmp.ngp3_mul || ECComps("eterc14")) && quarkGain().gt(0)
				))
		},
		ghostify() {
			return qu_save.bigRip.active ? this.quantum() : false //hasNU(16) || pl.on()
		},
		planck() {
			return pl.on() ? pl.canTier() : pl.can()
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
		ghostify() {
			return tmp.ngp3
		},
		planck() {
			return false //tmp.ngp3
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
		ghostify() {
			ghostify()
		},
		planck() {
			pl.reset()
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
		ghostify: "ghostify",
		planck: "plTab"
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
		ghostify: "g",
		planck: "p"
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
		ghostify() {
			return player.ghostify.times >= 1
		},
		planck() {
			return pl.did()
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
		ghostify: ["ghostifybtn", "ghostparticles", "ghostifytabbtn"],
		planck: ["planck", "planckinfo", "plancktabbtn"],
	},
	shown(id) {
		if (!tmp_pH[id]) return false
		if (!tmp_pH[id].did) return false

		if (id == "eternity" && !tmp.eterUnl) return false
		if (id == "quantum" && !tmp.quUnl) return false

		return !tmp.mod.layerHidden[id]
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
				if (pH.can(p) && !tmp.mod.layerHidden[p]) prestigeShown = true
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
		var haveBlock = tmp_pH.shown >= 3
		getEl("bigcrunch").parentElement.style.top = haveBlock ? (Math.floor(tmp_pH.shown / 3) * 120 + 19) + "px" : "19px"
		getEl("quantumBlock").style.display = haveBlock ? "" : "none"
		getEl("quantumBlock").style.height = haveBlock ? (Math.floor(tmp_pH.shown / 3) * 120 + 12) + "px" : "120px"

		//Infinity Dimension unlocks
		if (player.break && !player.infDimensionsUnlocked[7] && getEternitied() < 25) {
			newDimPresPos = tmp_pH.eternity.shown ? tmp_pH.eternity.order : tmp_pH.shown + 1
			if (!tmp_pH.eternity.shown) tmp_pH.shown++
		}

		//Quantum (after Neutrino Upgrade 16)
		let bigRipAndQuantum = !hasNU(16) && !pl.on()
		if (!bigRipAndQuantum && !QCs.inAny()) getEl("quantumbtn").style.display = "none"

		//Big Rip
		var canBigRip = canQuickBigRip() && (pH.shown("quantum") || bigRipAndQuantum)
		getEl("bigripbtn").style.display = canBigRip ? "" : "none"
		if (canBigRip) {
			let pos = bigRipAndQuantum ? "ghostify" : "quantum"
			getEl("bigripbtn").className = "presBtn presPos" + (tmp_pH[pos].shown ? tmp_pH[pos].order : tmp_pH.shown + 1) + " quickBigRip"
			if (!tmp_pH[pos].shown) tmp_pH.shown++
		}

		if (tmp.ngp3 && qu_save.bigRip.active) {
			getEl("quantumbtn").className = "presBtn presPos" + (tmp_pH.quantum.shown ? tmp_pH.quantum.order : tmp_pH.shown + 1) + " quickBigRip"
			getEl("quantumbtn").style.display = ""
			if (!tmp_pH.quantum.shown) tmp_pH.shown++
		}
	},
	updateActive() {
		tmp.eterUnl = pH.did("eternity") && !pl.on() //&& !QCs.inModifier("tb")

		tmp.quUnl = tmp.ngp3 && pH.did("quantum") && !pl.on()
		tmp.quActive = tmp.quUnl
	},
	onPrestige(layer) {
		if (tmp_pH[layer].did) return
		tmp_pH[layer].did = true
		tmp_pH.layers++
		getEl("layerDispOptions").style.display = ""
		//getEl("resetDispOptions").style.display = ""
		getEl("hide_" + layer).style.display = ""
		getEl("hide_" + layer).innerHTML = (tmp.mod.layerHidden[layer] ? "Show" : "Hide") + " " + layer
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
		if (tmp.mod.layerHidden[layer]) delete tmp.mod.layerHidden[layer]
		else tmp.mod.layerHidden[layer] = true

		getEl("hide_" + layer).innerHTML = (tmp.mod.layerHidden[layer] ? "Show" : "Hide") + " " + layer

		if (!tmp.mod.layerHidden[layer]) return
		if (layer == "infinity") {
			if (getEl("infinitydimensions").style.display == "block") showDimTab("antimatterdimensions")
			if (getEl("breakchallenges").style.display == "block") showChallengesTab("normalchallenges")
		}
		if (layer == "eternity") {
			if (getEl("timedimensions").style.display == "block" || getEl("metadimensions").style.display == "block") showDimTab("antimatterdimensions")
			if (getEl("eternitychallenges").style.display == "block") showChallengesTab("normalchallenges")
		}
		if (layer == "quantum") handleDispAndTmpOutOfQuantum()
	}
}
var tmp_pH = {}
let PRESTIGES = pH