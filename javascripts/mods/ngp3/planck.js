let PLANCK = {
	main: {
		setup() {
			let data = {
				time: player.timePlayed,
				times: 0,
				best: 9999999999,
				conf: true,
				on: false,
				layer: 1,
			}

			pl.save = data
			pl.showTab('null')
			return data
		},
		compile() {
			delete pl.tmp

			let onAtPrevSave = player.pl !== undefined
			let data = player.pl
			pl.save = data

			if (data || onAtPrevSave) {
				fNu.compile()
				sEt.compile()
				hf.compile()
				eDk.compile()
			}

			if (!data) return

			if (!data.last10) data.last10 = [[600*60*24*31, new Decimal(0)], [600*60*24*31, new Decimal(0)], [600*60*24*31, new Decimal(0)], [600*60*24*31, new Decimal(0)], [600*60*24*31, new Decimal(0)], [600*60*24*31, new Decimal(0)], [600*60*24*31, new Decimal(0)], [600*60*24*31, new Decimal(0)], [600*60*24*31, new Decimal(0)], [600*60*24*31, new Decimal(0)]]
			for (var r=0;r<10;r++) data.last10[r][1] = new Decimal(data.last10[r][1])

			pl.updateTmp()
			pl.updateDisplay()

			let tabsSave = aarMod.tabsSave
			pl.showTab((tabsSave.on && tabsSave.tabPl) || 'null')
		},
		updateTmp() {
			if (!pl.save) return

			fNu.updateTmp()
			if (sEt.save.unl) sEt.updateTmp()
			if (hf.save.unl) hf.updateTmp()
			if (eDk.save.unl) eDk.updateTmp()
		},
		can() {
			return false //GDs.unlocked() && ranking >= 250 && GDs.tmp.ge >= 50
		},
		reqText() {
			return "250.0 PC Ranking and 50.0 Gravity Energy"
		},
		on() {
			return tmp.ngpX >= 5 && pl.save && pl.save.on
		},
		reset() {
			if (pl.on()) {
				pl.tier()
				return
			}

			if (!pl.can()) return
			if ((tmp.ngpX < 5 || pl.save.conf) && !confirm(pl.conf())) return
			if (!pl.did()) {
				for (let x = 0; x < pl.warnings.length; x++) if (!confirm(pl.warnings[x])) return
			}

			pH.onPrestige("planck")
			pl.onReset()
		},
		exit() {
			if (!pl.on()) return
			if (!confirm(pl.exitConf)) return
			pl.save.on = false
			bosonicLabReset()
			pl.updateDisplay()
			pH.updateDisplay()
		},
		onReset() {
			if (!pl.save) {
				convertToNGP5()
				if (player.exdilation !== undefined) exitNGUd()
				if (tmp.ngSg) ngSg.exit()
			}

			if (pl.on()) pl.save.layer++
			else pl.save.on = true

			player.dilation.bestTPOverGhostifies = new Decimal(0)
			player.meta.bestOverQuantums = new Decimal(0)
			player.meta.bestOverGhostifies = new Decimal(0)
			player.ghostify.times = 0
			player.ghostify.best = 9999999999
			player.ghostify.last10 = [[600*60*24*31, new Decimal(0)], [600*60*24*31, new Decimal(0)], [600*60*24*31, new Decimal(0)], [600*60*24*31, new Decimal(0)], [600*60*24*31, new Decimal(0)], [600*60*24*31, new Decimal(0)], [600*60*24*31, new Decimal(0)], [600*60*24*31, new Decimal(0)], [600*60*24*31, new Decimal(0)], [600*60*24*31, new Decimal(0)]]
			player.ghostify.ghostParticles = new Decimal(hasAch("ng3p115") ? 1e25 : 0)
			player.ghostify.neutrinos = getBrandNewNeutrinoData()
			player.ghostify.neutrinos.boosts = 9
			player.ghostify.neutrinos.upgrades = hasAch("ng3p115") ? [6] : []
			player.ghostify.multPower = 1
			player.ghostify.ghostlyPhotons.enpowerments = 3
			tmp.bl.ticks = new Decimal(0)
			tmp.bl.enchants = {}
			player.ghostify.hb.higgs = 1
			GDs.save.gdBoosts = 0
			GDs.save.extraGDBs = 0

			tmp.bEn = {}

			bosonicLabReset()

			pl.save.best = Math.min(pl.save.best, pl.save.time)
			pl.save.time = 0
			pl.save.times++

			updateNeutrinoBoosts()
			updateNeutrinoUpgradeUnlocks(5, 12)
			updateGPHUnlocks()
			updateBLUnlocks()
			updateBosonUnlockDisplay()
			GDs.updateDisplay()
			pl.updateDisplay()

			pH.updateDisplay()
		},
		conf() {
			let exit = []
			if (tmp.ngSg) exit.push("NGSg")
			if (player.exdilation !== undefined) exit.push("NGUd")

			return "You will reset everything except Brave Milestones, Automator Ghosts, and all Ghostify unlocks, for a big boost / twist to Ghostify. Be warned: " + (exit.length ? wordizeList(exit) + " content won't work anymore after your first Planck! " : "") + "Eternity and Quantum don't work in this reduced universe. Ghost scientists researched that there's a little bit of matter that grows itself. Are you ready, again?"
		},
		exitConf: "You will bring the universe back to normal, but matter won't appear until you reduce it again. Are you sure?",
		warnings: [
			"Are you sure you want to do this? You will lose everything you have!",
			"ARE YOU REALLY SURE YOU WANT TO DO THAT? BE WARNED, YOU WILL TAKE A BIG CHALLENGE. THIS IS REALLY YOUR LAST CHANCE!"
		],
		did() {
			return hasAch("ng3p111") && pl.save
		},
		updateDisplay() {
			getEl("planck").style.display = pH.can("planck") ? "" : "none"
			getEl("plExit").className = "gluonupgrade " + (pl.on() ? "quantumbtn" : "unavailablebtn")
			getEl("plMsg").textContent = pl.on() ? "Tier up the Planck Scale to " + getFullExpansion(pl.save.layer + 1) + " and supercharge!" : "See beyond the forces of Quantum... I want to go deeper into Planck scale."

			fNu.updateDisplay()
			sEt.updateDisplay()
			hf.updateDisplay()
			eDk.updateDisplay()
		},
		updateDisplayOnTick() {
			getEl("plTierUp").className = "gluonupgrade " + (pl.canTier() ? "planckbtn" : "unavailablebtn")
			PLANCK[aarMod.tabsSave.tabPl].updateDisplayOnTick()
		},
		showTab(x) {
			//iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
			let tabName = "pl_" + x
			let tabs = document.getElementsByClassName('pltab')
			let tab
			let oldTab

			for (var i = 0; i < tabs.length; i++) {
				tab = tabs[i]
				if (tab.style.display == 'block') oldTab = tab.id
				tab.style.display = tab.id == tabName ? 'block' : 'none'
			}
			if (!oldTab || oldTab != x) aarMod.tabsSave.tabPl = x
			closeToolTip()
		},
		tierReq() {
			return Decimal.pow(10, Math.sqrt(pl.save.layer) * 1e18)
		},
		canTier() {
			return pl.on() && player.money.gt(pl.tierReq())
		},
		tier() {
			if (!pl.canTier()) return
			if (!confirm("You will be rewarded with extremely powerful boosts, but you will make the Planck layer harder. Are you sure?")) return
			if (false) {
				pl.tierAni()
				setTimeout(function() {
					pl.onReset()
				}, 2000)
			} else pl.onReset()
		},
		tierAni() {
			getEl("plAniTier").textContent = "Tier " + getFullExpansion(pl.save.layer) + " -> " + getFullExpansion(pl.save.layer + 1)

			getEl("plAniBg").style.display = ""
			getEl("plAniBg2").style.display = "none"
			getEl("plAniTxt").style.display = "none"

			getEl("plAni").style.display = ""
			setTimeout(function() {
				getEl("plAniBg2").style.display = ""
				getEl("plAniTxt").style.display = ""
			}, 1000)
			setTimeout(function() {
				getEl("plAni").style.animation = "plEnd 2s ease"
			}, 4000)
			setTimeout(function() {
				getEl("plAni").style.display = "none"
				getEl("plAni").style.animation = ""
				getEl("plAniBg").style.display = "none"
			}, 5000)
		},
		unlCheck() {
			sEt.unl()
			hf.unl()
			eDk.unl()
		}
	},
	null: {
		setup() {
			pl.save.df = {
				amt: 1,
				bestMatter: 0
			}

			fNu.save = pl.save.df
		},
		compile() {
			delete fNu.tmp
			delete fNu.save

			if (!pl.save) return

			if (!pl.save.df) fNu.setup()
			let data = pl.save.df
			fNu.save = data

			data.amt = new Decimal(data.amt)
			data.bestMatter = new Decimal(data.bestMatter)
		},
		updateTmp() {
			let data = {}
			fNu.tmp = data

			let eff = fNu.save.amt.log10() * Math.sqrt(pl.save.layer)

			data.buffNeutral = Math.log10(eff / 5 + 1) + 1
			data.buffNeutral2 = eff + 1
			data.nerfNeutral = 1.5 / (eff / 20 + 1) + 1
			data.nerfNeutral2 = eff + 1

			data.buffOmega = eff / data.nerfNeutral2
			data.buffMu = eff / data.nerfNeutral2 + 1
			data.nerfOmega = eff * data.buffNeutral2 + 1
			data.nerfMu = eff * data.buffNeutral2
		},
		updateDisplay() {
			getEl("nulliFoam").textContent = shortenDimensions(fNu.save.amt)
			getEl("mfDecay").className = "gluonupgrade " + (pl.on() ? "planckbtn" : "unavailablebtn")
		},
		updateDisplayOnTick() {
			getEl("dfGain").textContent = shorten(fNu.decayGain())

			let types = ["Omega", "Mu", "Neutral", "Neutral2"]
			for (let x = 1; x <= 4; x++) {
				let type = types[x - 1]
				getEl("dfBuff" + type).textContent = fNu.tmp["buff" + type].toFixed(2)
				getEl("dfNerf" + type).textContent = fNu.tmp["nerf" + type].toFixed(2)
			}
		},
		radioactivityToMatter() {
			return 1 //GDs.radioactivity(1) + 1
		},
		decayGain() {
			return player.matter.max(1).log10() / 100 + 1
		},
		decay() {
			if (!pl.on()) return
			fNu.save.amt = fNu.save.amt.times(fNu.decayGain())
			bosonicLabReset()
			fNu.updateDisplay()
		},
		annihilate() {
			if (!confirm("Are you sure?")) return
			fNu.save.amt = new Decimal(1)
			fNu.save.bestMatter = new Decimal(0)
			if (pl.on()) bosonicLabReset()
			fNu.updateDisplay()
		}
	},
	entangle: {
		setup() {
			pl.save.entangle = {
				unl: false,
				entangled: false,
				powers: {}
			}

			sEt.save = pl.save.entangle
		},
		compile() {
			delete sEt.tmp
			delete sEt.save

			if (!pl.save) return

			if (!pl.save.entangle) sEt.setup()
			let data = pl.save.entangle
			sEt.save = data
		},
		updateDisplay() {
			getEl("plBtn_entangle").style.display = sEt.save.unl ? "" : "none"
		},
		updateTmp() {
			sEt.tmp = {}
		},
		can() {
			return false //Future update!
		},
		unl() {
			if (sEt.save.unl) return
			if (!sEt.can()) return

			sEt.save.unl = true
			$.notify("Congratulations! You have unlocked Entanglement!", "success")
			sEt.updateDisplay()
		}
	},
	higgs: {
		setup() {
			pl.save.higgs = {
				unl: false,
				mediators: [],
				levels: {}
			}

			hf.save = pl.save.higgs
		},
		compile() {
			delete hf.tmp
			delete hf.save

			if (!pl.save) return

			if (!pl.save.higgs) hf.setup()
			let data = pl.save.higgs
			hf.save = data
		},
		updateDisplay() {
			getEl("plBtn_higgs").style.display = hf.save.unl ? "" : "none"
		},
		updateTmp() {
			hf.tmp = {}
		},
		can() {
			return false //Future update!
		},
		unl() {
			if (hf.save.unl) return
			if (!hf.can()) return

			hf.save.unl = true
			$.notify("Congratulations! You have unlocked Higgs Field!", "success")
			hf.updateDisplay()
		}
	},
	dark: {
		setup() {
			pl.save.dark = {
				unl: false,
				amount: 0,
				x17: 0,
				shades: {},
				tier: 0
			}

			eDk.save = pl.save.dark
		},
		compile() {
			delete eDk.tmp
			delete eDk.save

			if (!pl.save) return

			if (!pl.save.dark) eDk.setup()
			let data = pl.save.dark
			eDk.save = data
		},
		updateDisplay() {
			getEl("plBtn_dark").style.display = eDk.save.unl ? "" : "none"
		},
		updateTmp() {
			eDk.tmp = {}
		},
		can() {
			return false //Future update!
		},
		unl() {
			if (eDk.save.unl) return
			if (!eDk.can()) return

			eDk.save.unl = true
			$.notify("Congratulations! You have unlocked Endarkenments!", "success")
			eDk.updateDisplay()
		}
	}
}

let pl = PLANCK.main
let fNu = PLANCK.null
let sEt = PLANCK.entangle
let hf = PLANCK.higgs
let eDk = PLANCK.dark