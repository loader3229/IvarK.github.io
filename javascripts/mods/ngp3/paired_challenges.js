//PAIRED CHALLENGES
var PCs = {
	milestones: {
		11: "Replicated Compressors require 10% less.",
		21: "The QC2 reward is squared.",
		31: "You sacrifice 33% MDBs instead of 30%.",
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
			goal_divs: [null, 0.25, 0.25, 0.5, 0, 0.6, 1.2, 0.3, 1.2],
			milestoneReqs: [null, 1, 2, 4],
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
		PCs_save = data

		this.updateTmp()
	},
	reset() {
		PCs_save = this.setup()
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

		//Occupation (Picking)
		PCs_tmp.picked = []
		if (PCs_tmp.pick) {
			var s = Math.floor(PCs_tmp.pick / 10)
			var c = PCs_save.challs
			for (var i = 1; i <= 4; i++) {
				var c_a = c[s * 10 + i]
				if (c_a) {
					PCs_tmp.picked.push(c_a[0])
					PCs_tmp.picked.push(c_a[1])
				}
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
		while (PCs_save.lvl < 17 && comps >= this.lvlReq(PCs_save.lvl)) PCs_save.lvl++
		if (PCs.data.setupHTML && PCs_save.lvl > oldLvl) {
			for (var i = 0; i < PCs.data.all.length; i++) this.updateButton(PCs.data.all[i])
		}

		//Boosts
		var lvl = PCs_save.lvl - 1
		data.eff1 = 1 + 0.75 * lvl / 18
		data.eff1_start = 150
		data.eff2 = 1 + lvl / 54
	},

	assign(x) {
		alert("WIP. Come back tomorrow!")
	},
	start(x) {
		var c = PCs_save.challs
		if (c[x]) {
			quantum(false, true, [c[x][0], c[x][1]])
			return
		} else {
			if (PCs_tmp.pick == x) delete PCs_tmp.pick
			else PCs_tmp.pick = x

			PCs.updateTmp()
			PCs.resetButtons()
			PCs.updateDisp()
		}
	},
	in(x) {
		return QCs_tmp.in.length >= 2
	},
	goal(pc) {
		var list = pc || QCs_tmp.in
		if (this.overlapped(list)) return QCs.getGoalMA(pc % 10, "ol")
		if (typeof(list) == "number") list = this.convBack(list)

		var qc1 = QCs.data[list[0]].goalMA
		var qc2 = QCs.data[list[1]].goalMA
		var div = PCs.data.goal_divs[list[0]] + PCs.data.goal_divs[list[1]] + 1
		var r = qc1.pow(qc2.log(Number.MAX_VALUE) / div)
		r = r.div(this.shrunkerEff())
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
		return PCs.unl() && PCs_tmp.comps && PCs_tmp.comps[Math.floor(pos / 10)] >= PCs.data.milestoneReqs[pos % 10]
	},
	lvlReq(x) {
		return x
	},
	overlapped(x) {
		return Math.floor(x / 10) == x % 10
	},

	setupButton: (pc) => '<td><button id="pc' + pc + '" class="challengesbtn" onclick="PCs.start(' + pc + ')"></button></td>',
	buttonTxt: (pc) => '<b style="font-size: 18px">PC' + pc + '</b><br>' + (
			PCs_tmp.pick == pc ? "Click to cancel" :
			!PCs_save.challs[pc] ? "Click to assign" :
			"???"
		),
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
		for (var i = 1; i <= 8; i++) html += "<button id='pc_pick" + i + "' class='challengesbtn' style='height: 60px; width: 60px' onclick='PCs.assign(" + i + ")'>QC" + i + "</button>"
		getEl("pc_pick").innerHTML = html

		//Setup header
		var html = "<td></td>"
		for (var x = 1; x <= 4; x++) html += "<td>#" + x + "</td>"
		el.insertRow(0).innerHTML = html

		//Setup rows
		for (var y = 1; y <= 4; y++) {
			var html = "<td>Set #" + y + "</td>"
			for (var x = 1; x <= 4; x++) html += this.setupButton(y * 10 + x)
			el.insertRow(y).innerHTML = html
		}

		this.resetButtons()
		this.updateDisp()
	},
	updateButton(pc, inQCs) {
		if (!PCs.data.setupHTML) return
		if (!inQCs) inQCs = QCs_save.in

		getEl("pc" + pc).className = PCs_tmp.pick ? (PCs_tmp.pick == pc ? "onchallengebtn" : "lockedchallengesbtn") : "challengesbtn"
		getEl("pc" + pc).innerHTML = this.buttonTxt(pc)
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
		getEl("pc_comps").textContent = getFullExpansion(PCs_save.comps.length) + " / " + getFullExpansion(this.lvlReq(Math.min(PCs_save.lvl, 16)))

		getEl("pc_eff1").textContent = "^" + PCs_tmp.eff1.toFixed(3)
		getEl("pc_eff1_start").textContent = shorten(PCs_tmp.eff1_start)
		getEl("pc_eff2").textContent = "^" + PCs_tmp.eff2.toFixed(3)

		getEl("pc_enter").style.display = PCs_tmp.pick ? "none" : ""
		getEl("pc_pick").style.display = PCs_tmp.pick ? "" : "none"

		getEl("pc_shrunker").textContent = getFullExpansion(PCs_save.shrunkers)
		getEl("pc_shrunker_eff").textContent = this.shrunkerEff() + "x"

		this.showMilestones(PCs_tmp.milestone || 0)
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

	shrunkerEff() {
		let x = PCs_save.shrunkers
		return Decimal.pow(10, x * (x + 1) * 5)
	}
}
var PCs_save = undefined
var PCs_tmp = { unl: false }