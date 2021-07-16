//PAIRED CHALLENGES
var PCs = {
	milestones: {
		11: "Boost the QC1 reward.",
		21: "Boost the QC2 reward. (not implemented)",
		31: "Boost the QC3 reward. (not implemented)",
		41: "Boost the QC4 reward. (not implemented)",
		51: "Boost the QC5 reward. (not implemented)",
		61: "Boost the QC6 reward.",
		71: "Reduce the level up requirement by 1.",
		81: "Boost the QC8 reward. (not implemented)",
		12: "Unlock Replicated Expanders. (not implemented)",
		22: "You can exclude a Positron Cloud tier in any QC; and unlock the Perked modifier. (not implemented)",
		32: "Dilation stat is 50% weaker.",
		42: "Extra Replicated Galaxies contribute to Positronic Charge.",
		52: "You gain 2x more Replicanti Energy.",
		62: "Time since Eternity is squared root.",
		72: "Mastery Study cost multiplier is divided by 5x, permanently.",
		82: "Unlock Galactic Clusters. (not implemented)",
		13: "Unlock Replicated Dilaters. (not implemented)",
		23: "You can exclude matched Boosts instead. (not implemented)",
		33: "For each PC combination, Meta Accelerator slowdown is 2% slower.",
		43: "Tier-1 Positronic Boosts can charge more by 4x, but the requirement is squared than normal.",
		53: "Replicanti Energy formula is stronger.",
		63: "Eternitying only loses 30 seconds of time stat.",
		73: "Unlock Strings. (not implemented)",
		83: "Kept galaxies are converted into extra Positronic Charge on Quantum. (not implemented)",
	},
	setupData() {
		var data = {
			qc1_ids: [null, 7, 6, 4, 2, 3, 8, 5, 1],
			qc2_ids: [null, 1, 5, 8, 3, 2, 4, 6, 7],
			qc1_lvls: [null, 1, 2, 3, 4, 10, 11, 12, 13],
			qc2_lvls: [null, 1, 2, 4, 8, 14, 15, 17, 18],
			milestoneReqs: [null, 1, 2, 4],
			setup: true
		}
		PCs.data = data
		getEl("pc_table").innerHTML = ""

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
		data.eff1_start = 100
		data.eff2 = 1 + lvl / 54
	},

	start(x) {
		quantum(false, true, PCs.convBack(x))
	},
	in(x) {
		return QCs_tmp.in.length >= 2
	},
	goal(pc) {
		var list = pc || QCs_tmp.in
		if (typeof(list) == "number") list = this.convBack(list)
		return QCs.data[list[0]].goalMA.pow(QCs.data[list[1]].goalMA.log10() / getQuantumReq(true).log10() * 0.9)
	},
	conv(c1, c2) {
		return Math.min(c1 * 10 + c2, c2 * 10 + c1)
	},
	convBack(pc) {
		return [Math.floor(pc / 10), pc % 10]
	},
	done(pc) {
		return PCs.unl() && (PCs_save.comps.includes(pc) || PCs_save.skips.includes(pc))
	},
	milestoneDone(pos) {
		return PCs.unl() && PCs_tmp.pos_comps[Math.floor(pos / 10)] >= PCs.data.milestoneReqs[pos % 10]
	},
	lvlReq(x) {
		let r = PCs.data.lvls[x]
		if (PCs.milestoneDone(71)) r--
		return r
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

		for (var i = 0; i < data.all.length; i++) this.updateButton(data.all[i])
		this.updateDisp()
	},
	updateButton(pc, inQCs) {
		if (!PCs.data.setupHTML) return
		if (!inQCs) inQCs = QCs_save.in
		var qcs = this.convBack(pc)
		var pos = this.convBack(PCs.data.pos[pc])
		var lvl = PCs.data.qc1_lvls[pos[0]] + PCs.data.qc2_lvls[pos[1]] - 1

		getEl("pc" + pc).style.display = PCs_save.lvl >= lvl ? "" : "none"
		if (PCs_save.lvl >= lvl) {
			getEl("pc" + pc).setAttribute("ach-tooltip", "Goal: " + shorten(PCs.goal(pc)) + " MA")
			getEl("pc" + pc).className = inQCs.includes(qcs[0]) && inQCs.includes(qcs[1]) ? "onchallengebtn" : PCs.done(pc) ? "completedchallengesbtn" : "challengesbtn"
		}
	},

	updateDisp() {
		if (!PCs_tmp.unl) return
		if (!PCs.data.setupHTML) return

		for (var i = 1; i <= 8; i++) {
			getEl("pc_comp" + i + "_div").style.display = PCs_tmp.pos_comps[i] ? "" : "none"
			getEl("pc_comp" + i).textContent = PCs_tmp.pos_comps[i] + " / 8"
		}

		getEl("pc_lvl").textContent = getFullExpansion(PCs_save.lvl)
		getEl("pc_comps").textContent = getFullExpansion(PCs_save.comps.length) + " / " + getFullExpansion(this.lvlReq(Math.min(PCs_save.lvl, 18)))

		getEl("pc_eff1").textContent = "^" + PCs_tmp.eff1.toFixed(3)
		getEl("pc_eff1_start").textContent = shorten(PCs_tmp.eff1_start)
		getEl("pc_eff2").textContent = "^" + PCs_tmp.eff2.toFixed(3)

		this.showMilestones(PCs_tmp.milestone || 0)
	},
	showMilestones(qc) {
		PCs_tmp.milestone = qc
		getEl("qc_milestone_div").style.display = qc ? "" : "none"
		if (qc) {
			getEl("qc_milestone_header").textContent = "QC" + qc + " Milestones"
			for (var i = 1; i < PCs.data.milestoneReqs.length; i++) {
				getEl("qc_milestone" + i).className = "qMs_" + (this.milestoneDone(qc * 10 + i) ? "reward" : "locked")
				getEl("qc_milestone" + i).textContent = PCs.milestones[qc * 10 + i] || "???"
			}
		}
	}
}
var PCs_save = undefined
var PCs_tmp = { unl: false }