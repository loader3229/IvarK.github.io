//PAIRED CHALLENGES
var PCs = {
	milestones: {
		11: "Replicanti Compressors are better. (per PC level)",
		21: "The QC2 reward is squared.",
		31: "You sacrifice 33% MDBs instead of 30%.",
		41: "You sacrifice Replicated Galaxies more.",
		51: "Sacrificed sources are greatly stronger.",
		61: "The QC6 reward is squared.",
		71: "Meta Accelerator accelerates faster based on your PC level.",
		81: "EC14 reward power speeds up Replicantis more.",
		12: "Unlock Replicated Expanders.",
		22: "You can swap Positronic Boosts between 2 of any tiers.",
		32: "25 MP milestone is activated in QC3.",
		42: "Tier 1 charge is 8x, but require 2x more.",
		52: "Replicanti Energy is raised by ^1.2.",
		62: "Eternitying timewraps Meta Dimensions and Replicantis by 3 seconds.",
		72: "Mastery Study cost multiplier is divided by 5x.",
		82: "Remote Galaxies scaling is slower based on its starting point.",
		// 13: "Unlock Replicated Dilaters. (not implemented)",
		// 23: "You can exclude matched Boosts instead. (not implemented)",
		// 33: "Meta Accelerator starts 0.1 later per PC level.",
		// 43: "Extra Replicated Galaxies contribute to Positronic Charge.",
		// 53: "Replicanti Energy formula is stronger.",
		// 63: "Eternity time stat is 3x slower.",
		// 73: "Remove the second softcap of TT generation.",
		// 83: "???",
	},
	setupData() {
		var data = {
			goal_divs: [null, 0.1, 0.95, 0.25, 0.95, 0.45, 0.5, 0.4, 0.65],
			milestoneReqs: [null, 1, 2/*, 4*/],
			letters: [null, "A", "B", "C", "D", "Ω<sup>1</sup>", "Ω<sup>2</sup>", "Ω<sup>3</sup>", "Θ"],
			all: [],
			setup: true
		}
		PCs.data = data
		getEl("pc_table").innerHTML = ""

		for (var x = 1; x <= 8; x++) {
			for (var y = 1; y < x; y++) {
				data.all.push(y * 10 + x)
			}
		}
	},

	setup() {
		PCs_save = {
			challs: {},
			comps: [],
			lvl: 1,
			best: PCs_save && PCs_save.best,
			shrunkers: 0
		}
		qu_save.pc = PCs_save
		return PCs_save
	},
	compile() {
		PCs_save = undefined
		PCs.data = {}
		PCs_tmp = { unl: PCs.unl() }
		if (!tmp.ngp3 || qu_save === undefined) {
			this.updateTmp()
			return
		}

		let data = qu_save.pc
		if (data === undefined) data = this.setup()
		if (data.best === undefined) data.best = data.lvl - 1
		PCs_save = data

		this.updateTmp()
		this.updateUsed()
		this.resetShrunkers()
	},
	reset() {
		PCs_save = this.setup()

		this.updateTmp()
		this.updateUsed()
	},

	unl() {
		return qu_save && qu_save.qc && qu_save.qc.comps >= 7
	},
	updateTmp() {
		PCs_tmp.unl = PCs.unl()
		if (!PCs_tmp.unl) return
		if (!PCs.data.setup) this.setupData()
		var data = PCs_tmp

		//Occupation (Picking)
		PCs_tmp.occupied = []
		if (PCs_tmp.pick) {
			var l = PCs_tmp.picked.length + 1
			var s = Math.floor(PCs_tmp.pick / 10)
			var c = PCs_save.challs
			for (var i = 1; i <= 4; i++) {
				var c_a = c[s * 10 + i]
				if (c_a) {
					this.occupy(Math.floor(c_a / 10))
					this.occupy(c_a % 10)
				}
			}
			if (PCs_tmp.picked) this.occupy(PCs_tmp.picked[0])


			if (l == 1) {
				var d = PCs_tmp.used.d1
				for (var i = 0; i < d.length; i++) this.occupy(d[i])
			}
			if (l == 2) {
				var d = PCs_tmp.used.d2
				for (var i = 1; i <= 8; i++) {
					var p = PCs.sort(i * 10 + PCs_tmp.picked[0])
					if (d.includes(p)) this.occupy(i)
				}

				var p1 = PCs_tmp.used.p1
				var p2 = PCs_tmp.used.p2
				var p = p1.includes(PCs_tmp.picked[0]) ? p1 : p2
				for (var i = 1; i <= 8; i++) if (p.includes(i)) this.occupy(i)
			}
		}

		//Positionist
		data.comps = {}
		for (var i = 1; i <= 8; i++) data.comps[i] = 0
		for (var i = 0; i < PCs_save.comps.length; i++) {
			var id = PCs.convBack(PCs_save.comps[i])
			data.comps[id[0]]++
			data.comps[id[1]]++
		}

		//Level up!
		var oldLvl = PCs_save.lvl
		var comps = PCs_save.comps.length
		while (PCs_save.lvl < 17 && comps >= PCs_save.lvl) PCs_save.lvl++
		if (PCs.data.setupHTML && PCs_save.lvl > oldLvl) this.resetButtons()
		PCs_save.best = Math.max(PCs_save.best, comps)

		//Boosts
		var eff = (PCs_save.lvl - 1) / 28
		data.eff1 = 1 + 0.75 * eff
		data.eff1_start = (tmp.ngp3_mul ? 125 : 150)
		data.eff2 = Math.sqrt(eff) / 4

		//Temperature
		data.temp = Math.min(Math.floor(comps / 4) / 4 - 0.3, 1) * comps / 28
		if (tmp.bgMode || tmp.ngp3_mul || tmp.ngp3_exp) {
			if (data.temp > 0) data.temp /= 2
			data.temp -= 0.1
		}
	},
	occupy(x, c) {
		var d = PCs_tmp.occupied
		if (!d.includes(x)) d.push(x)
	},

	updateUsed() {
		if (!PCs_tmp.unl || !PCs_save.challs) return
		PCs_tmp.used = {
			d1: [],
			d2: [],

			p1: [],
			p2: [],

			d1_tmp: {}
		}
		for (var y = 1; y <= 4; y++) {
			for (var x = 1; x <= 4; x++) {
				var c = PCs_save.challs[y * 10 + x]
				if (c) {
					this.increaseUsed(Math.floor(c / 10), 1)
					this.increaseUsed(c % 10, 2)
					PCs_tmp.used.d2.push(PCs.sort(c))
				}
			}
		}
	},
	increaseUsed(x, dig) {
		var d = PCs_tmp.used["d1_tmp"]
		d[x] = (d[x] || 0) + 1
		if (d[x] == 7) PCs_tmp.used.d1.push(x)

		var p = PCs_tmp.used["p" + dig]
		if (!p.includes(x)) p.push(x)
	},

	assign(x) {
		if (PCs_tmp.picked.includes(x)) {
			PCs_tmp.picked = []
		} else if (PCs_tmp.occupied.includes(x)) return
		else {
			PCs_tmp.picked.push(x)
			if (PCs_tmp.picked.length == 2) {
				if (PCs_tmp.used.p1.includes(x)) PCs_tmp.picked = [PCs_tmp.picked[1], PCs_tmp.picked[0]]

				PCs_save.challs[PCs_tmp.pick] = PCs_tmp.picked[0] * 10 + PCs_tmp.picked[1]
				PCs.updateUsed()

				delete PCs_tmp.pick
				PCs.resetButtons()
			}
		}
		PCs.updateTmp()
		PCs.updateDisp()
	},
	start(x) {
		if (PCs_tmp.pick && PCs_tmp.pick != x) return
		var c = PCs_save.challs
		if (c[x]) {
			quantum(false, true, {pc: x}, "pc")
			return
		} else {
			if (PCs_tmp.pick == x) delete PCs_tmp.pick
			else PCs_tmp.pick = x
			PCs_tmp.picked = []

			PCs.updateTmp()
			PCs.resetButtons()
			PCs.updateDisp()
		}
	},
	in(x) {
		return PCs_save && PCs_save.in
	},
	goal(pc) {
		var list = pc || QCs_tmp.in
		if (this.overlapped(list)) return QCs.getGoalMA(pc % 10, "ol")
		if (typeof(list) == "number") list = this.convBack(list)

		var qc1 = QCs.data[list[0]].goalMA
		var qc2 = QCs.data[list[1]].goalMA
		var base = Number.MAX_VALUE
		var div = PCs.data.goal_divs[list[0]] + PCs.data.goal_divs[list[1]] + 1
		div -= PCs_tmp.temp

		var r = qc1.pow(qc2.log(base) / div)
		var pow = (PCs_tmp.comps[list[0]] + PCs_tmp.comps[list[1]]) * 0.25 + 1
		r = r.pow(pow)
		r = r.div(this.shrunkerEff())
		return r
	},
	done(pc) {
		return PCs.unl() && PCs_save.comps.includes(this.sort(pc))
	},
	posDone(pc) {
		return PCs.done(PCs_save.challs[pc])
	},
	conv(c1, c2) {
		if (!c1) { //Current (No augments)
			c1 = QCs_tmp.in[0]
			c2 = QCs_tmp.in[1]
		} else if (typeof(c1) !== "number") { //Table lookup
			c2 = c1[1]
			c1 = c1[0]
		}
		return c1 * 10 + c2
	},
	convBack(pc) {
		return [Math.floor(pc / 10), pc % 10]
	},
	sort(pc) {
		if (!pc) return
		if (typeof(pc) != "number") {
			if (pc[0] > pc[1]) pc = [pc[1], pc[0]]
			return pc
		}
		return Math.min(pc, Math.floor(pc / 10) + (pc % 10) * 10)
	},
	name(pc) {
		return PCs.data.letters[Math.floor(pc / 10)] + pc % 10
	},
	milestoneDone(pos) {
		return PCs.unl() && PCs_tmp.comps && PCs_tmp.comps[Math.floor(pos / 10)] >= PCs.data.milestoneReqs[pos % 10]
	},
	lvlReq(pc) {
		if (QCs_save.comps / 2 < pc % 10) return 1/0
		if (PCs_tmp.debug) return pc > 40 ? 1/0 : 0

		var x = Math.floor(pc / 10 - 1) * 4
		if (pc <= 20) x = 1
		else if (!tmp.exMode && pc >= 30) x--
		else if (tmp.bgMode) x--

		x += pc % 10 - 1
		return x
	},
	overlapped(x) {
		return Math.floor(x / 10) == x % 10
	},

	setupButton: (pc) => '<td><button id="pc' + pc + '" class="challengesbtn" style="border-radius: 10px" onclick="PCs.start(' + pc + ')"></button></td>',
	buttonTxt(pc) {
		var id = PCs.sort(PCs_save.challs[pc])
		return '<b style="font-size: 18px">' + PCs.name(pc) + '</b><br>' + (
			PCs_tmp.pick ? (PCs_tmp.pick == pc ? "Click to cancel" : "") :
			!PCs_save.challs[pc] ? "Click to assign" :
			"QC " + wordizeList(PCs.convBack(id), false, " + ", false) +
			(PCs.done(id) ? "" : "<br>Goal: " + shorten(PCs.goal(id)) + " MA")
		)
	},
	setupMilestone: (qc) => (qc % 4 == 1 ? "<tr>" : "") + "<td id='pc_comp" + qc + "_div' style='text-align: center'><span style='font-size: 20px'>QC" + qc + "</span><br><span id='pc_comp" + qc + "' style='font-size: 15px'>0 / 8</span><br><button class='secondarytabbtn' onclick='PCs.showMilestones(" + qc + ")'>Milestones</button></td>" + (qc % 4 == 0 ? "</tr>" : ""),
	setupHTML() {
		var el = getEl("pc_table")
		var data = PCs.data
		if (PCs.data.setupHTML) return
		data.setupHTML = true

		//Setup milestones
		var html = ""
		for (var i = 1; i <= 8; i++) html += this.setupMilestone(i)
		getEl("qc_milestones").innerHTML = html

		//Setup buttons
		var html = "<br>"
		for (var i = 1; i <= 8; i++) html += "<button id='pc_pick" + i + "' style='height: 60px; width: 60px' onclick='PCs.assign(" + i + ")'>QC" + i + "</button>"
		getEl("pc_pick").innerHTML = html

		//Setup header
		var html = "<td></td>"
		for (var x = 1; x <= 4; x++) html += "<td>#" + x + "</td>"
		el.insertRow(0).innerHTML = html

		//Setup rows
		for (var y = 1; y <= 4; y++) {
			var html = "<td>Set " + this.data.letters[y] +
			"<br><button class='storebtn' id='pc_respec" + y + "' style='height: 24px; width: 60px' onclick='PCs.respec(" + y + ")'>Respec</button>" +
			"</td>"
			for (var x = 1; x <= 4; x++) html += this.setupButton(y * 10 + x)
			el.insertRow(y).innerHTML = html
		}

		this.resetButtons()
		this.updateDisp()
	},
	updateButton(pc, exit) {
		if (!PCs.data.setupHTML) return

		var el = getEl("pc" + pc)
		if (PCs_save.lvl < PCs.lvlReq(pc)) {
			el.style.display = "none"
			return
		}

		el.style.display = ""
		el.className = PCs_tmp.debug ? (
			pc >= 33 ? "completedchallengesbtn" : pc > 30 ? "onchallengebtn" : pc % 10 >= 3 ? "challengesbtn" : "lockedchallengesbtn"
		) : (
			PCs_tmp.pick ? (PCs_tmp.pick == pc ? "onchallengebtn" : "lockedchallengesbtn") :
			PCs_save.in == pc && !exit ? "onchallengebtn" :
			PCs_save.challs[pc] && PCs_save.comps.includes(PCs.sort(PCs_save.challs[pc])) ? "completedchallengesbtn" :
			PCs_save.challs[pc] ? "quantumbtn" :
			"challengesbtn"
		)
		el.innerHTML = this.buttonTxt(pc)
	},
	resetButtons(force) {
		if (!PCs.unl()) return
		var data = PCs.data
		for (var y = 1; y <= 4; y++) {
			for (var x = 1; x <= 4; x++) this.updateButton(y * 10 + x)
		}
	},

	updateDisp() {
		if (!PCs_tmp.unl) return
		if (!PCs.data.setupHTML) return

		for (var i = 1; i <= 8; i++) {
			getEl("pc_comp" + i + "_div").style.display = PCs_tmp.comps[i] ? "" : "none"
			getEl("pc_comp" + i).textContent = PCs_tmp.comps[i] + " / 4"
		}

		getEl("pc_lvl").textContent = getFullExpansion(PCs_save.lvl)
		getEl("pc_comps").textContent = getFullExpansion(PCs_save.comps.length) + " / " + getFullExpansion(Math.min(PCs_save.lvl, 16))
		for (var i = 1; i <= 4; i++) {
			getEl("pc_respec" + i).style.display = PCs.posDone(i * 10 + 1) || PCs.posDone(i * 10 + 2) || PCs.posDone(i * 10 + 3) || PCs.posDone(i * 10 + 4) ? "" : "none"
		}

		getEl("pc_eff1").textContent = "^" + PCs_tmp.eff1.toFixed(3)
		getEl("pc_eff1_start").textContent = shorten(PCs_tmp.eff1_start)

		getEl("pc_enter").style.display = PCs_tmp.pick ? "none" : ""
		getEl("pc_penalty").style.display = tmp.bgMode || tmp.ngp3_mul || tmp.ngp3_exp ? "none" : ""
		getEl("pc_pick").style.display = PCs_tmp.pick ? "" : "none"
		if (PCs_tmp.pick) {
			for (var i = 1; i <= 8; i++) {
				getEl("pc_pick" + i).className = PCs_tmp.picked.includes(i) ? "chosenbtn" :
					PCs_tmp.occupied.includes(i) ? "unavailablebtn" :
					"storebtn"
				getEl("pc_pick" + i).style.display = QCs.done(i) ? "" : "none"
			}
		}

		getEl("pc_comps2").textContent = getFullExpansion(PCs_save.comps.length)
		getEl("pc_temp").innerHTML = formatPercentage(Math.abs(PCs_tmp.temp)) + "<sup>o</sup> " + (PCs_tmp.temp > 0 ? "hotter" : "cooler")
		getEl("pc_temp_color").style.display = PCs_tmp.temp != 0 ? "" : "none"
		getEl("pc_temp_color").className = PCs_tmp.temp > 0 ? "hot" : "cool"

		getEl("pc_shrunker_div").style.display = futureBoost("nerfed_modifier") ? "" : "none"
		getEl("pc_shrunker").textContent = getFullExpansion(PCs_save.shrunkers)
		getEl("pc_shrunker_eff").textContent = shortenCosts(this.shrunkerEff()) + "x"

		this.showMilestones(PCs_tmp.milestone || 0)
	},
	updateDispOnTick() {
		if (!PCs_tmp.unl) return
		if (!PCs.data.setupHTML) return

		getEl("pc_eff2").textContent = "^" + shorten(getAQSGainExp())
	},
	showMilestones(qc) {
		PCs_tmp.milestone = qc
		getEl("qc_milestone_div").style.display = qc ? "" : "none"
		getEl("pc_info").style.display = qc || PCs_save.lvl == 1 ? "none" : ""
		if (qc) {
			getEl("qc_milestone_header").textContent = "QC" + qc + " Milestones"
			for (var i = 1; i < PCs.data.milestoneReqs.length; i++) {
				getEl("qc_milestone" + i).className = "qMs_" + (this.milestoneDone(qc * 10 + i) ? "reward" : "locked")
				getEl("qc_milestone" + i).textContent = PCs.milestones[qc * 10 + i] || "???"
			}
		}
	},

	respec(x) {
		if (!confirm("Are you sure do you want to respec this set?")) return

		var exclude = []
		var array = []
		for (var i = 1; i <= 4; i++) {
			var c = PCs_save.challs[x * 10 + i]
			if (c) exclude.push(PCs.sort(c))
		}
		for (var i = 0; i < PCs_save.comps.length; i++) if (!exclude.includes(PCs_save.comps[i])) array.push(PCs_save.comps[i])
		for (var i = 1; i <= 4; i++) delete PCs_save.challs[x * 10 + i]
		PCs_save.comps = array
		PCs.updateUsed()

		quantum(false, true)
		PCs.resetButtons()
	},

	resetShrunkers() {
		var qc = qu_save.qc
		if (!PCs.unl() || !qc.mod_comps || !qc.mod_comps.length) return

		let x = 0
		for (var c = 1; c <= 8; c++) if (qc.mod_comps.includes("up" + x)) x++

		PCs_save.shrunkers = x
	},
	shrunkerEff() {
		let x = PCs_save.shrunkers
		return Decimal.pow(10, x * (x + 2) * 2)
	}
}
var PCs_save = undefined
var PCs_tmp = { unl: false }