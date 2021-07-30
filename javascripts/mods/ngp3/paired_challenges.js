//PAIRED CHALLENGES
var PCs = {
	milestones: {
		11: "Replicated Compressors are stronger.",
		21: "The QC2 reward is squared.",
		31: "You sacrifice 40% MDBs instead of 30%.",
		41: "You sacrifice Replicated Galaxies more.",
		51: "You gain 5% more from sacrificed things.",
		61: "The QC6 reward is squared.",
		71: "Meta Accelerator accelerates 2% faster per PC level.",
		81: "Unlock Galactic Clusters.",
		12: "Unlock Replicated Expanders.",
		22: "You can exclude a Positron Cloud tier in any QC, and unlock the Perked modifier. (not implemented)",
		32: "25 MP milestone is activated in QC3.",
		42: "Tier-1 Positronic Boosts can charge more by 4x, but the requirement is squared than normal.",
		52: "You gain 2x more Replicanti Energy.",
		62: "Eternitying timewraps by 3 seconds.",
		72: "Mastery Study cost multiplier is divided by 5x, permanently.",
		82: "First 50 galaxies of every type don't get sacrficed.",
		13: "Unlock Replicated Dilaters. (not implemented)",
		23: "You can exclude matched Boosts instead. (not implemented)",
		33: "Meta Accelerator starts 0.1 later per PC level.",
		43: "Extra Replicated Galaxies contribute to Positronic Charge.",
		53: "Replicanti Energy formula is stronger.",
		63: "Eternity time stat is 3x slower.",
		73: "Remove the second softcap of TT generation.",
		83: "Kept galaxies increase the effective sacrificed galaxies.",
	},
	setupData() {
		var data = {
			qc1_ids: [null, 1, 3, 6, 2, 8, 5, 4, 7],
			qc2_ids: [null],
			qc1_lvls: [null, 1, 2, 4, 6, 9, 10, 12, 14],
			qc2_lvls: [null, 1, 2, 3, 5, 12, 13, 14, 18],
			goal_divs: [null, 0.25, 0.25, 0.5, 0, 0.6, 1.2, 0.3, 1.2],
			milestoneReqs: [null, 1, 2, 4],
			setup: true
		}
		PCs.data = data
		getEl("pc_table").innerHTML = ""

		for (var i = data.qc1_ids.length - 1; i >= 1; i--) data.qc2_ids.push(data.qc1_ids[i])

		data.lvls = {}
		data.pos = {}
		data.all = []
		for (var x = 1; x <= 8; x++) {
			for (var y = 1; y <= 9 - x; y++) {
				var lvl = data.qc1_lvls[x] + data.qc2_lvls[y] - 1
				var id = this.conv(data.qc1_ids[x], data.qc2_ids[y])
				data.lvls[lvl] = (data.lvls[lvl] || 0) + 1
				data.pos[id] = x * 10 + y
				data.all.push(id)
			}
		}

		var sum = 0
		PCs_tmp.lvl = 1
		for (var i = 1; i <= 18; i++) {
			sum += data.lvls[i]
			data.lvls[i] = sum
		}
	},

	setup() {
		PCs_save = {
			comps: [],
			skips: [],
			lvl: 1
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
		PCs_save = data

		if (data.best === undefined) {
			data.best = {}
			data.shrunkers = {
				unspent: 0,
				spent: {}
			}
		}

		this.updateTmp()
	},

	unl() {
		return qu_save && qu_save.qc && qu_save.qc.comps >= 7
	},
	updateTmp() {
		PCs_tmp.unl = PCs.unl()
		if (!PCs_tmp.unl) return
		if (!PCs.data.setup) this.setupData()
		var data = PCs_tmp

		//Positionist
		data.pos_comps = {}
		for (var i = 1; i <= 8; i++) data.pos_comps[i] = 0
		for (var i = 0; i < PCs_save.comps.length; i++) {
			var id = PCs.convBack(PCs_save.comps[i])
			data.pos_comps[id[0]]++
			data.pos_comps[id[1]]++
		}

		//Milestones
		for (var i = 1; i <= 8; i++) PCs_save.best[i] = Math.max(PCs_save.best[i] || 0, data.pos_comps[i])

		//Level up!
		var oldLvl = PCs_save.lvl
		var comps = PCs_save.comps.concat(PCs_save.skips).length
		while (PCs_save.lvl < 19 && comps >= this.lvlReq(PCs_save.lvl)) PCs_save.lvl++
		if (PCs.data.setupHTML && PCs_save.lvl > oldLvl) {
			for (var i = 0; i < PCs.data.all.length; i++) this.updateButton(PCs.data.all[i])
		}

		//Boosts
		var lvl = PCs_save.lvl - 1
		data.eff1 = 1 + 0.75 * lvl / 18
		data.eff1_start = 150
		data.eff2 = 1 + lvl / 54
	},

	start(x) {
		var qcs = PCs.convBack(x)
		if (PCs.pcUnl(x)) quantum(false, true, qcs)
	},
	in(x) {
		return QCs_tmp.in.length >= 2
	},
	pcShown(x) {
		var pos = this.convBack(PCs.data.pos[x])
		if (PCs_save.comps.includes(x)) return true
		if (this.overlapped(x)) return QCs.done(8)
		if (PCs_save.lvl < PCs.data.qc1_lvls[pos[0]] + PCs.data.qc2_lvls[pos[1]] - 1) return false
		return true
	},
	pcUnl(x) {
		var qcs = this.convBack(x)
		return this.pcShown(x) && QCs.done(qcs[0]) && QCs.done(qcs[1])
	},
	goal(pc) {
		var list = pc || QCs_tmp.in
		if (this.overlapped(list)) return QCs.getGoalMA(pc % 10, "ol")
		if (typeof(list) == "number") list = this.convBack(list)

		var qc1 = QCs.data[list[0]].goalMA
		var qc2 = QCs.data[list[1]].goalMA
		var div = PCs.data.goal_divs[list[0]] + PCs.data.goal_divs[list[1]] + 1
		var r = qc1.pow(qc2.log(Number.MAX_VALUE) / div)
		if (PCs_save.shrunkers.spent[this.conv(list)]) r = r.pow(Math.pow(0.95, PCs_save.shrunkers.spent[this.conv(list)]))
		return r
	},
	conv(c1, c2) {
		if (!c1) { //Current (No augments)
			c1 = QCs_tmp.in[0]
			c2 = QCs_tmp.in[1]
		} else if (typeof(c1) !== "number") { //Table lookup
			c2 = c1[1]
			c1 = c1[0]
		}
		return Math.min(c1 * 10 + c2, c2 * 10 + c1)
	},
	convBack(pc) {
		return [Math.floor(pc / 10), pc % 10]
	},
	done(pc) {
		return PCs.unl() && (PCs_save.comps.includes(pc) || PCs_save.skips.includes(pc))
	},
	milestoneDone(pos) {
		return PCs.unl() && PCs.data.milestoneReqs && PCs_save.best && PCs_save.best[Math.floor(pos / 10)] >= PCs.data.milestoneReqs[pos % 10]
	},
	lvlReq(x) {
		let r = PCs.data.lvls[x]
		return r
	},
	overlapped(x) {
		return Math.floor(x / 10) == x % 10
	},

	setupButton: (pc) => '<td><button id="pc' + pc + '" class="challengesbtn" onclick="PCs.start(' + pc + ')">PC' + Math.floor(pc / 10) + "+" + pc % 10 + '</button></td>',
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

		//Setup header
		var html = "<td></td>"
		for (var i = 1; i <= 8; i++) html += "<td>" + data.qc2_ids[i]+ "</td>"
		el.insertRow(0).innerHTML = html

		//Setup rows
		for (var x = 1; x <= 8; x++) {
			var html = "<td>" + data.qc1_ids[x]+ "</td>"
			for (var i = 1; i <= 9 - x; i++) {
				var pc = this.conv(data.qc1_ids[x], data.qc2_ids[i])
				html += this.setupButton(pc)
			}
			el.insertRow(x).innerHTML = html
		}

		this.resetButtons()
		this.updateDisp()
	},
	updateButton(pc, inQCs) {
		if (!PCs.data.setupHTML) return
		if (!inQCs) inQCs = QCs_save.in
		var qcs = this.convBack(pc)
		var pos = this.convBack(PCs.data.pos[pc])
		var unl = this.pcShown(pc)

		getEl("pc" + pc).style.display = unl ? "" : "none"
		if (unl) {
			getEl("pc" + pc).setAttribute("ach-tooltip", "Goal: " + shorten(PCs.goal(pc)) + " MA")
			getEl("pc" + pc).className = inQCs[0] == qcs[0] && inQCs[1] == qcs[1] ? "onchallengebtn" : PCs.done(pc) ? "completedchallengesbtn" : this.pcUnl(pc) ? "challengesbtn" : "lockedchallengesbtn"
		}
	},
	resetButtons(force) {
		if (!PCs.unl()) return
		var data = PCs.data
		for (var i = 0; i < data.all.length; i++) this.updateButton(data.all[i])
	},

	updateDisp() {
		if (!PCs_tmp.unl) return
		if (!PCs.data.setupHTML) return

		for (var i = 1; i <= 8; i++) {
			getEl("pc_comp" + i + "_div").style.display = PCs_save.best[i] ? "" : "none"
			getEl("pc_comp" + i).textContent = PCs_save.best[i] + " / 9"
		}

		getEl("pc_lvl").textContent = getFullExpansion(PCs_save.lvl)
		getEl("pc_comps").textContent = getFullExpansion(PCs_save.comps.length) + " / " + getFullExpansion(this.lvlReq(Math.min(PCs_save.lvl, 18)))

		getEl("pc_eff1").textContent = "^" + PCs_tmp.eff1.toFixed(3)
		getEl("pc_eff1_start").textContent = shorten(PCs_tmp.eff1_start)
		getEl("pc_eff2").textContent = "^" + PCs_tmp.eff2.toFixed(3)

		this.showMilestones(PCs_tmp.milestone || 0)
		this.updateShrunkerDisp()
	},
	showMilestones(qc) {
		PCs_tmp.milestone = qc
		getEl("qc_milestone_div").style.display = qc ? "" : "none"
		getEl("pc_info").style.display = qc ? "none" : ""
		if (qc) {
			getEl("qc_milestone_header").textContent = "QC" + qc + " Milestones"
			for (var i = 1; i < PCs.data.milestoneReqs.length; i++) {
				getEl("qc_milestone" + i).className = "qMs_" + (this.milestoneDone(qc * 10 + i) ? "reward" : "locked")
				getEl("qc_milestone" + i).textContent = PCs.milestones[qc * 10 + i] || "???"
			}
			getEl("qc_milestone2").style["font-size"] = (qc == 2 || qc == 4) ? "11px" : "12px"
		}
	},
	reset(force) {
		var data = PCs.data
		if (!force && !confirm("You will keep your milestones and level, and bring all your Shrunkers back. Are you sure do you want to reset?")) return

		for (var i = 0; i < data.all.length; i++) this.respec(data.all[i])
		PCs_save.comps = []
		this.resetButtons()
		quantum(false, true)
	},

	shrunk() {
		if (PCs.in()) {
			if (!PCs_save.shrunkers.unspent || PCs.done(PCs.conv())) return

			var pc = PCs.conv()
			PCs_save.shrunkers.unspent--
			PCs_save.shrunkers.spent[pc] = (PCs_save.shrunkers.spent[pc] || 0) + 1
			PCs.updateShrunkerDisp()
			PCs.updateButton(pc)
		} else alert("This is not available because Challenge Sweeper isn't implemented yet!") //PCs.reset()
	},
	respec(pc) {
		if (!PCs_save.shrunkers.spent[pc]) return
		PCs_save.shrunkers.unspent += PCs_save.shrunkers.spent[pc]
		delete PCs_save.shrunkers.spent[pc]
	},
	updateShrunkerDisp() {
		getEl("pc_shrunker_div").style.display = QCs.done(8) ? "" : "none"
		getEl("pc_shrunker").textContent = getFullExpansion(PCs_save.shrunkers.unspent)
		getEl("pc_shrunker_btn").className = !this.in() ? "unavailablebtn" :
			this.done(this.conv()) ? "unavailablebtn" :
			PCs_save.shrunkers.unspent ? "storebtn" : "unavailablebtn"
		getEl("pc_shrunker_btn").textContent = !this.in() ? "Respec, but reset the combinations. (locked)" :
			this.done(this.conv()) ? "You already completed this challenge!" :
			"Spend a shrunker to reduce the goal by ^0.95."
		getEl("pc_shrunker_goal").textContent = !this.in() ? "" : "Goal: " + shorten(this.goal()) + " MA (" + getFullExpansion(PCs_save.shrunkers.spent[PCs.conv()] || 0) + " shrunkers spent)"
	}
}
var PCs_save = undefined
var PCs_tmp = { unl: false }