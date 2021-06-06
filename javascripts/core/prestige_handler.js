let Prestiges = {
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
			if (getEternitied() >= 25 || (tmp.ngp3 && tmp.qu.bigRip.active)) id7unlocked = true
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
			return tmp.qu.bigRip.active ? this.quantum() : false //hasNU(16) || pl.on()
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
		return ph.tmp[id] && ph.reqs[id]()
	},
	didData: {
		paradox() {
			return player.pSac.times >= 1
		},
		accelerate() {
			return ph.did("galaxy")
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
			return ph.did("singularity") || ph.did("quantum")
		},
		singularity() {
			return ngSg.save.times >= 1
		},
		quantum() {
			return tmp.qu.times >= 1
		},
		ghostify() {
			return player.ghostify.times >= 1
		},
		planck() {
			return pl.did()
		}
	},
	did(id) {
		return ph.tmp[id] && ph.tmp[id].did
	},
	has(id){
		return ph.tmp[id] && ph.tmp[id].did
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
		if (!ph.tmp[id]) return false
		if (!ph.tmp[id].did) return false

		if (id == "eternity" && !tmp.eterUnl) return false
		if (id == "quantum" && !tmp.quUnl) return false

		return !tmp.mod.layerHidden[id]
	},
	onHotkey(layer) {
		if (!layer) layer = ph.tmp.lastDid
		if (shiftDown) {
			if (ph.shown(layer)) showTab(ph.tabLocs[layer])
		} else ph.resetFuncs[layer]()
	},
	tmp: {},
	reset() {
		getEl("layerDispOptions").style.display = "none"
		getEl("resetDispOptions").style.display = "none"

		var did = false
		ph.tmp = { layers: 0 }
		for (var x = ph.order.length; x > 0; x--) {
			var p = ph.order[x - 1]
			if (ph.modReqs[p] === undefined || ph.modReqs[p]()) {
				ph.tmp[p] = {}
				if (!did && ph.didData[p]()) {
					did = true
					ph.tmp.lastDid = p
				}
				if (did) ph.onPrestige(p)
				else getEl("hide_" + p).style.display = "none"
			} else getEl("hide_" + p).style.display = "none"
		}

		ph.updateActive()
	},
	updateDisplay() {
		ph.tmp.shown = 0
		for (var x = 0; x < ph.order.length; x++) {
			var p = ph.order[x]
			var d = ph.displayData[p]
			var prestigeShown = false
			var tabShown = false
			var shown = false

			if (!isEmptiness) {
				if (ph.can(p) && !tmp.mod.layerHidden[p]) prestigeShown = true
				if (ph.shown(p)) tabShown = true
				if (prestigeShown || tabShown) shown = true
			}

			if (ph.tmp[p] !== undefined) {
				if (shown) ph.tmp.shown++
				ph.tmp[p].shown = shown
				ph.tmp[p].order = ph.tmp.shown
			}

			getEl(d[0]).style.display = prestigeShown ? "" : "none"
			getEl(d[1]).style.display = tabShown ? "" : "none"
			getEl(d[2]).style.display = tabShown ? "" : "none"

			getEl(d[0]).className = "presBtn presPos" + ph.tmp.shown + " " + p + "btn"
			getEl(d[1]).className = "presCurrency" + ph.tmp.shown
		}

		//Blockages
		var haveBlock = ph.tmp.shown >= 3
		getEl("bigcrunch").parentElement.style.top = haveBlock ? (Math.floor(ph.tmp.shown / 3) * 120 + 19) + "px" : "19px"
		getEl("quantumBlock").style.display = haveBlock ? "" : "none"
		getEl("quantumBlock").style.height = haveBlock ? (Math.floor(ph.tmp.shown / 3) * 120 + 12) + "px" : "120px"

		//Infinity Dimension unlocks
		if (player.break && !player.infDimensionsUnlocked[7] && getEternitied() < 25) {
			newDimPresPos = ph.tmp.eternity.shown ? ph.tmp.eternity.order : ph.tmp.shown + 1
			if (!ph.tmp.eternity.shown) ph.tmp.shown++
		}

		//Quantum (after Neutrino Upgrade 16)
		let bigRipAndQuantum = !hasNU(16) && !pl.on()
		if (!bigRipAndQuantum && !QCs.inAny()) getEl("quantumbtn").style.display = "none"

		//Big Rip
		var canBigRip = canQuickBigRip() && (ph.shown("quantum") || bigRipAndQuantum)
		getEl("bigripbtn").style.display = canBigRip ? "" : "none"
		if (canBigRip) {
			let pos = bigRipAndQuantum ? "ghostify" : "quantum"
			getEl("bigripbtn").className = "presBtn presPos" + (ph.tmp[pos].shown ? ph.tmp[pos].order : ph.tmp.shown + 1) + " quickBigRip"
			if (!ph.tmp[pos].shown) ph.tmp.shown++
		}

		if (tmp.ngp3 && tmp.qu.bigRip.active) {
			getEl("quantumbtn").className = "presBtn presPos" + (ph.tmp.quantum.shown ? ph.tmp.quantum.order : ph.tmp.shown + 1) + " quickBigRip"
			getEl("quantumbtn").style.display = ""
			if (!ph.tmp.quantum.shown) ph.tmp.shown++
		}
	},
	updateActive() {
		tmp.eterUnl = ph.did("eternity") && !pl.on() //&& !QCs.inModifier("tb")

		tmp.quUnl = tmp.ngp3 && ph.did("quantum") && !pl.on()
		tmp.quActive = tmp.quUnl
	},
	onPrestige(layer) {
		if (ph.tmp[layer].did) return
		ph.tmp[layer].did = true
		ph.tmp.layers++
		getEl("layerDispOptions").style.display = ""
		getEl("resetDispOptions").style.display = ""
		getEl("hide_" + layer).style.display = ""
		getEl("hide_" + layer).innerHTML = (tmp.mod.layerHidden[layer] ? "Show" : "Hide") + " " + layer
		ph.updateActive()
	},
	setupHTML(layer) {
		var html = ""
		for (var x = 0; x < ph.order.length; x++) {
			var p = ph.order[x]
			html += '<button id="hide_' + p + '" onclick="ph.hideOption(\'' + p + '\')" class="storebtn" style="color:black; width: 200px; height: 55px; font-size: 15px"></button> '
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

let ph = Prestiges