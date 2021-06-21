/*
To make a new softcap using this function
1) Create an element of softcap_data which contains
  - The name of it (string, used in displays only)
  - Integers starting from 1 which are dicts
    - These dicts contains a function name, starting value
      and other variables from softcap_vars based on which function you choose
2) Add to getSoftcapAmtFromId like the other functions, except after the =>
   put whatever function takes the output result of said softcap (to see which ones were active)
3a) In updateSoftcapStatsTab add a entry like the others with a name
3b) Go to index.html and find were all the others are stored and store it in a similar fasion
4) Smile :)
*/

var softcap_data = {
	dt_log: {
		name: "log base 10 of dilated time gain per second",
		1: {
			func: "pow",
			start: 4e3,
			pow: 0.6,
			derv: true
		},
		2: {
			func: "pow",
			start: 5e3,
			pow: 0.4,
			derv: true
		},
		3: {
			func: "pow",
			start: 6e3,
			pow: 0.2,
			derv: true
		}
	},
	ts_reduce_log: {
		name: "log base 10 of tickspeed reduction"
		//No softcaps
	},
	ts_reduce_log_big_rip: {
		name: "log base 10 of tickspeed reduction in Big Rip",
		//No softcaps
	},
	ts11_log_big_rip: {
		name: "log base 10 of time study 11 effect in Big Rip",
		1: {
			func: "pow",
			start: 11e4,
			pow: 0.8,
			derv: true
		},
		2: {
			func: "pow",
			start: 13e4,
			pow: 0.7,
			derv: true
		},
		3: {
			func: "pow",
			start: 15e4,
			pow: 0.6,
			derv: true
		},
		4: {
			func: "pow",
			start: 17e4,
			pow: 0.5,
			derv: true
		},
		5: {
			func: "pow",
			start: 19e4,
			pow: 0.4,
			derv: true
		},
		6: {
			func: "log",
			start: 5e5,
			mul: .2,
			pow: 1e5
		},	
	},
	bru1_log: {
		name: "log base 10 of Big Rip Upgrade 1",
		1: {
			func: "pow",
			start: 3e8,
			pow: 0.75,
			derv: false
		},
		2: {
			func: "log",
			start: 1e10,
			pow: 10
		},
		3: {
			func: "pow",
			start: 2e10,
			pow: 0.5,
			derv: true
		},
		4: {
			func: "pow",
			start: 4e10,
			pow: 0.7,
			derv: true
		},
		5: {
			func: "log",
			start: 1e11,
			pow: 11,
			add: -1
		},
	},
	beu3_log: {
		name: "log base 10 of Break Eternity Upgrade 3",
		1: {
			func: "pow",
			start: 150,
			pow: 0.5,
			derv: false
		}
	},
	tt: {
		name: "TT production",
		1: {
			func: "dilate",
			start: new Decimal(1e69 / 2e4),
			base: 10,
			pow: 2/3,
			mul: () => tmp.exMode ? 1.5 : tmp.bgMode ? 1 : 1.25,
			sub10: 68 - Math.log10(2e4)
		},
		2: {
			func: "dilate",
			start: new Decimal(1e75),
			base: 10,
			pow: 3/4
		},
	},
	rInt: {
		name: "base replicate interval",
		1: {
			func: "log",
			start: new Decimal(1e20),
			pow: 10,
			mul: 5
		},
	},
	ma: {
		name: "meta-antimatter",
		1: {
			func: "pow",
			start: new Decimal(Number.MAX_VALUE),
			pow(x) {
				let l2 = Decimal.log(x, 2)
				return 1 / (Math.log2(l2 / 1024) / 4 + 2)
			},
			derv: false
		},
	},
	it: {
		name: "Infinite Time reward",
		1: {
			func: "dilate",
			start: Decimal.pow(10, 1e5),
			base: 10,
			pow: 0.5
		},
	},
	ig_log_high: { 
		name: "log base 10 of Intergalactic reward",
		1: { 
			func: "log",
			start: 1e20,
			pow: 10,
			mul: 5
		},
		2: { 
			func: "log", 
			start: 1e22,
			pow: 11,
			mul: 4,
			add: 12
		},
		3: {
			func: "pow",
			start: 1e23,
			pow: 0.1,
			derv: false
		}
	},
	bam: {
		name: "Bosonic Antimatter gain per second",
		1: {
			func: "pow",
			start: new Decimal(1e80),
			pow() {
				return getBosonicAMProductionSoftcapExp(1)
			},
			derv: true
		},
		2: {
			func: "pow",
			start: new Decimal(1e90),
			pow() {
				return getBosonicAMProductionSoftcapExp(2)
			},
			derv: true
		},
		3: {
			func: "pow",
			start: new Decimal(1e100),
			pow() {
				return getBosonicAMProductionSoftcapExp(3)
			},
			derv: true
		},
		4: {
			func: "pow",
			start: new Decimal(1e110),
			pow() {
				return getBosonicAMProductionSoftcapExp(4)
			},
			derv: true
		},
		5: {
			func: "pow",
			start: new Decimal(1e120),
			pow() {
				return getBosonicAMProductionSoftcapExp(5)
			},
			derv: true
		},
		6: {
			func: "pow",
			start: new Decimal(1e130),
			pow() {
				return getBosonicAMProductionSoftcapExp(6)
			},
			derv: true
		}
	},
	idbase: {
		name: "log base 10 of initial infinity dimension power",
		1: {
			func: "pow",
			start: 1e14,
			pow: .90,
			derv: true
		},
		2: {
			func: "pow",
			start: 1e15,
			pow: .85,
			derv: true
		},
		3: {
			func: "pow",
			start: 3e15,
			pow: .80,
			derv: true
		},
		4: {
			func: "pow",
			start: 1e16,
			pow: .75,
			derv: true
		},
		5: {
			func: "pow",
			start: 3e16,
			pow: .70,
			derv: true
		},
		6: {
			func: "pow",
			start: 1e17,
			pow: .65,
			derv: true
		}
	},
	working_ts: {
		name: "log base 10 of tickspeed effect",
		1: {
			func: "pow",
			start: 1e15,
			pow: .9,
			derv: true
		},
		2: {
			func: "pow",
			start: 1e16,
			pow: .85,
			derv: true
		},
		3: {
			func: "pow",
			start: 1e17,
			pow: .8,
			derv: true
		}
	},
	bu45: {
		name: "20th Bosonic Upgrade",
		1: {
			func: "pow",
			start: 9,
			pow: .5,
			derv: false
		},
		2: {
			func: "pow",
			start: 25,
			pow: .5,
			derv: false
		},
		3: {
			func: "pow",
			start: 49,
			pow: .5,
			derv: false
		},
		4: {
			func: "pow",
			start: 81,
			pow: .5,
			derv: false
		},
		5: {
			func: "pow",
			start: 121,
			pow: .5,
			derv: false
		},
		6: {
			func: "pow",
			start: 169,
			pow: .5,
			derv: false
		},
		7: {
			func: "pow",
			start: 225,
			pow: .5,
			derv: false
		}
	},
	mptd_log: { //NOT USED IN ANYTHING YET, JUST TESTING SO PLS DONT REMOVE
		name: "log base 10 of multiplier per ten dimensions",
		1: {
			func: "pow",
			start: 2.5e6,
			pow: .99,
			derv: false
		},
		2: {
			func: "pow",
			start: 3e6,
			pow: .97,
			derv: false
		},
		3: {
			func: "pow",
			start: 3.5e6,
			pow: .94,
			derv: false
		},
		4: {
			func: "pow",
			start: 4e6,
			pow: .90,
			derv: false
		},
		5: {
			func: "pow",
			start: 4.5e6,
			pow: .85, 
			derv: false
		},
		6: {
			func: "pow",
			start: 5e6,
			pow: .79, 
			derv: false
		},
		7: {
			func: "pow",
			start: 5.5e6,
			pow: .72, 
			derv: false
		},
		8: {
			func: "pow",
			start: 6e6,
			pow: .64, 
			derv: false
		},
	},

	//NG Condensed
	nds_ngC: {
		name: "Normal Dimensions (NG Condensed)",
		1: {
			func: "pow",
			start() {
				let x = 1e50
				if (hasTimeStudy(63)) x = tsMults[63]().times(x)
				return x
			},
			pow() {
				return hasTimeStudy(63) ? Math.sqrt(1/3) : 1/3
			},
			derv: false,
		},
		2: {
			func: "pow",
			start() {
				let x = Number.MAX_VALUE
				if (hasTimeStudy(63)) x = tsMults[63]().times(x)
				return x
			},
			pow() {
				return hasTimeStudy(63) ? Math.sqrt(1/4) : 1/4
			},
			derv: false,
		},
		3: {
			func: "pow",
			start: new Decimal("1e10000"),
			pow: 1/7,
			derv: false,
		},
		4: {
			func: "pow",
			start: new Decimal("1e25000000"),
			pow: 1/11,
			derv: false,
		}
	},
	ts_ngC: {
		name: "Tickspeed (NG Condensed)",
		1: {
			func: "pow",
			start: Number.MAX_VALUE,
			pow() {
				return player.challenges.includes("postcngc_2") ? 2/5 : 1/3
			},
			derv: false,
		},
		2: {
			func: "pow",
			start: new Decimal("1e1000"),
			pow() {
				return player.challenges.includes("postcngc_2") ? 13/40 : 1/4
			},
			derv: false,
		},
		3: {
			func: "pow",
			start: new Decimal("1e25000"),
			pow: 1/7,
			derv: false,
		},
	},
	sac_ngC: {
		name: "Sacrifice (NG Condensed)",
		1: {
			func: "pow",
			start: 1e25,
			pow() {
				return hasTimeStudy(196) ? Math.pow(1/3, .2) : 1/3
			},
			derv: false,
		},
		2: {
			func: "pow",
			start: Number.MAX_VALUE,
			pow() {
				return hasTimeStudy(196) ? Math.pow(1/4, .2) : 1/4
			},
			derv: false,
		},
	},
	ip_ngC: {
		name: "Infinity Points (NG Condensed)",
		1: {
			func: "pow",
			start: 1e10,
			pow() {
				let x = .5
				if (player.challenges.includes("postc6")) x = 7/8
				if (hasTimeStudy(181)) x = Math.pow(x, .1)
				return x
			},
			derv: false,
		},
		2: {
			func: "pow",
			start: 1e30,
			pow() {
				let x = 1/3
				if (player.challenges.includes("postc6")) x = 5/6
				if (hasTimeStudy(181)) x = Math.pow(x, .1)
				return x
			},
			derv: false,
		},
		3: {
			func: "pow",
			start: new Decimal("1e10000"),
			pow() {
				return hasTimeStudy(181) ? Math.pow(1/4, .1) : 1/4
			},
			derv: false,
		},
		4: {
			func: "pow",
			start: new Decimal("1e100000"),
			pow: 1/5,
			derv: false,
		},
		5: {
			func: "pow",
			start: new Decimal("1e950000"),
			pow: 1/23,
			derv: false,
		},
	},
	ids_ngC: {
		name: "Infinity Dimensions (NG Condensed)",
		1: {
			func: "pow",
			start: new Decimal("1e7500"),
			pow: 0.1,
			derv: false,
		},
		2: {
			func: "pow",
			start: new Decimal("1e50000"),
			pow: 0.08,
			derv: false,
		},
	},
	rep_ngC: {
		name: "Replicanti in Replicanti to Infinity Point amount (NG Condensed)",
		1: {
			func: "pow",
			start: 1e6,
			pow: 1/2,
			derv: false,
		},
		2: {
			func: "log",
			start: 1e9,
			mul: Math.sqrt(1e9) / 9,
			pow: 2,
		},
	},
	ep_ngC: {
		name: "Eternity Points (NG Condensed)",
		1: {
			func: "pow",
			start: 1e10,
			pow: 1/2,
			derv: false,
		},
		2: {
			func: "pow",
			start: 1e100,
			pow: 1/3,
			derv: false,
		},
		3: {
			func: "pow",
			start: new Decimal(Number.MAX_VALUE),
			pow: 1/4,
			derv: false,
		},
		4: {
			func: "pow",
			start: new Decimal("1e800"),
			pow: 1/7,
			derv: false,
		},
	},
	tds_ngC: {
		name: "Time Dimensions (NG Condnesed)",
		1: {
			func: "pow",
			start: new Decimal("1e5000"),
			pow: 1/3,
			derv: false,
		},
	},
	dt_ngC: {
		name: "Dilated Time (NG Condnesed)",
		1: {
			func: "pow",
			start: new Decimal(1e6),
			pow: 1/2,
			derv: false,
		},
		2: {
			func: "pow",
			start: new Decimal(1e100),
			pow: 1/3,
			derv: false,
		},
		3: {
			func: "pow",
			start: new Decimal("1e2000"),
			pow: 1/4,
			derv: false,
		},
	},
	tp_ngC: {
		name: "Tachyon Particles (NG Condensed)",
		1: {
			func: "pow",
			start: new Decimal(1e10),
			pow: 1/3,
			derv: false,
		},
		2: {
			func: "pow",
			start: new Decimal(Number.MAX_VALUE),
			pow: 1/4,
			derv: false,
		},
	},

	//NG-x Hell:
	ids_ngm4: {
		name: "infinity dimension multiplier (NG-4)",
		1: {
			func: "pow",
			start: new Decimal(1e40),
			pow: .8,
			derv: true
		}
	}
}

var softcap_vars = {
	pow: ["start", "pow", "derv"],
	dilate: ["start", "base", "pow", "mul", "sub10"],
	log: ["pow", "mul", "add"],
	logshift: ["shift", "pow", "add"]
}

var softcap_funcs = {
	pow(x, start, pow, derv = false) {
		x = Math.pow(x / start, pow)
		if (derv && pow != 0) x = (x - 1) / pow + 1
		x *= start
		return x
	},
	pow_decimal(x, start, pow, derv = false) {
		x = Decimal.div(x, start).pow(pow)
		if (derv && pow != 0) x = x.sub(1).div(pow).add(1)
		x = x.times(start)
		return x
	},
	log(x, pow = 1, mul = 1, add = 0) {
		let x2 = Math.pow(Math.log10(x) * mul + add, pow)
		return Math.min(x, x2)
	},
	log_decimal(x, pow = 1, mul = 1, add = 0) { 
		//dont we want to return a Decimal since x is a Decimal
		let x2 = Decimal.pow(x.log10() * mul + add, pow)
		return Decimal.min(x, x2)
	},
	logshift: function (x, shift, pow, add = 0){
		let x2 = Math.pow(Math.log10(x * shift), pow) + add
		return Math.min(x, x2)
	},
	logshift_decimal: function (x, shift, pow, add = 0){
		let x2 = Decimal.pow(x.times(shift).log10(), pow).add(add)
		return Decimal.min(x, x2)
	},
	dilate(x, start, base = 10, pow = 1, mul = 1, sub10 = 0) { 
		if (x <= start) return x

		var x_log = Math.log(x) / Math.log(base)
		var start_log = Math.log(start) / Math.log(base)

		var sub = sub10 / Math.log10(base)
		x_log -= sub
		start_log -= sub

		return Math.pow(base, (Math.pow(x_log / start_log, pow) * mul - mul + 1) * start_log + sub)
	},
	dilate_decimal(x, start, base = 10, pow = 1, mul = 1, sub10 = 0) { 
		if (x.lte(start)) return x

		var x_log = x.log(base)
		var start_log = start.log(base)

		var sub = sub10 / Math.log10(base)
		x_log -= sub
		start_log -= sub

		return Decimal.pow(base,(Math.pow(x_log / start_log, pow) * mul - mul + 1) * start_log + sub)
	},
}

function do_softcap(x, data, num) {
	var data = data[num]
	if (data === undefined) return "stop"

	var func = data.func
	var vars = softcap_vars[func]

	var start = 0
	var v = [data[vars[0]], data[vars[1]], data[vars[2]], data[vars[3]], data[vars[4]], data.active]
	for (let i = 0; i < 6; i++) {
		if (typeof v[i] == "function") v[i] = v[i](x)
		if (vars[i] == "start") start = v[i]
	}

	if (v[6] === false) return x //DO NOT change to if (!v[6])  cause we DONT want undefined to return on this line

	var decimal = false
	var canSoftcap = false
	if (x.l != undefined || x.e != undefined) decimal = true
	if (!start || (decimal ? x.gt(start) : x > start)) canSoftcap = true

	if (canSoftcap) return softcap_funcs[func + (decimal ? "_decimal" : "")](x, v[0], v[1], v[2], v[3], v[4])
	return "stop"
}

function softcap(x, id) { 
	/* 
	if you only want to do a certain number of softcaps,
	change some softcaps to just not being active
	*/
	var data = softcap_data[id]
	if (inBigRip()) {
		let big_rip_data = softcap_data[id + "_big_rip"]
		if (big_rip_data !== undefined) data = big_rip_data
	}

	if (data == undefined) {
		console.log("your thing broke at " + id)
		return
	}

	var sc = 1
	var stopped = false
	while (!stopped) {
		var y = do_softcap(x, data, sc)
		sc++
		if (y !== "stop") x = y
		else stopped = true
	}
	return x
}

function getSoftcapName(id){
	return softcap_data[id]["name"] || "yeet fix bugs pls"
}

function getSoftcapAmtFromId(id){
	return { // for amount
		dt_log: () => getDilTimeGainPerSecond().max(1).log10(), 
		ts_reduce_log: () => Decimal.pow(tmp.tsReduce, -1).log10(),
		ts_reduce_log_big_rip: () => Decimal.pow(tmp.tsReduce, -1).log10(),
		ts11_log_big_rip: () => tsMults[11]().log10(),
		bru1_log: () => tmp.bru[1].max(1).log10(),
		beu3_log: () => tmp.beu[3].max(1).log10(),
		rInt: () => tmp.rep.baseEst,
		it: () => tmp.it.max(1),
		tt: () => getTTGenPart(player.dilation.tachyonParticles),
		ma: () => getExtraDimensionBoostPowerUse(),
		ig_log_high: () => tmp.ig.max(1).log10(),
		bam: () => getBosonicAMProduction(),
		idbase: () => getStartingIDPower(1).max(getStartingIDPower(2)).max(getStartingIDPower(3)).max(getStartingIDPower(4)).max(getStartingIDPower(5)).max(getStartingIDPower(6)).max(getStartingIDPower(7)).max(getStartingIDPower(8)).max(1).log10(),
		working_ts: () => getTickspeed().pow(-1).log10(),
		bu45: () => bu.effects[45](),
		mptd_log: () => Decimal.log10(tmp.mptb) * tmp.mpte,

		// Condensened: () =>
		nds_ngC: () => getDimensionFinalMultiplier(1),
		ts_ngC: () => getTickspeed().pow(-1),
		sac_ngC: () => calcTotalSacrificeBoost(),
		ip_ngC: () => getInfinityPointGain(),
		ids_ngC: () => getBestUsedIDPower(),
		rep_ngC: () => player.replicanti.amount,
		ep_ngC: () => gainedEternityPoints(),
		tds_ngC: () => getTimeDimensionPower(1),
		dt_ngC: () => getDilatedTimeGainPerSecond(),
		tp_ngC: () => player.dilation.tachyonParticles,

		//NGmX

		ids_ngm4: () => getBestUsedIDPower(),
		//this is actually wrong, need to make sure to only take the softcaps of the ones you have unlocked--make a function for it
	}[id]()

}

function hasSoftcapStarted(id, num){
	let l = id.length
	let check = { 
		/*
		this is where you need to put anything else that needs to be true
		that is: if it is false it does not display, but if it is true,
		it continues as if nothing happens
		NOTE: this excludes Big Rip, and other endings that are at the end of words 
		This currently includes: _ngC, _big_rip, _dilation, _ngmX for integers of length 1 X
		*/
		idbase: tmp.ngp3,
		dt_log: tmp.ngp3 && !tmp.bE50kDT,
		bru1_log: tmp.ngp3 && tmp.bru && tmp.bru[1] !== undefined && tmp.quActive,
		beu3_log: tmp.ngp3 && tmp.beu && tmp.beu[3] !== undefined && tmp.quActive,
		bam: tmp.ngp3,
		bu45: tmp.ngp3,
		tt: tmp.ngp3,
		ma: tmp.ngp3,
		ig_log_high: tmp.ngp3 && tmp.ig !== undefined,
		mptd_log: false, //again, for now only
	}
	if (l >= 4 && !tmp.ngC && id.slice(l - 4, l) == "_ngC") return false
	if (l >= 5 && id.slice(l - 5, l - 1) == "_ngm") {
		let int = parseInt(id[l - 1])
		if (!isNaN(int)) if (!(tmp.ngmX >= int)) return false
	}
	if (!player.dilation.active && l > 9 && id.slice(l - 9, l) == "_dilation") return false
	if (!inBigRip() && l > 8 && id.slice(l - 8, l) == "_big_rip") return false
	if (check[id] !== undefined && !check[id]) return false
	
	let amt = getSoftcapAmtFromId(id)
	
	return hasSoftcapStartedArg(id, num, amt)
}

function hasSoftcapStartedArg(id, num, arg){
	let a = softcap_data[id][num].active
	if (a != undefined) {
		if (typeof a == "function") a = a()
		if (a == false) return false
	}
	return Decimal.gt(arg, softcap_data[id][num].start)
}

function hasAnySoftcapStarted(id){
	for (let i = 1; i <= numSoftcapsTotal(id); i++){
		if (hasSoftcapStarted(id, i)) return true
	}
	return false
}

function numSoftcapsTotal(id){
	let a = Object.keys(softcap_data[id])
	let b = 0
	for (let i = 0; i <= a.length; i++){
		if (!isNaN(parseInt(a[i]))) b ++
		// if the name is an integer add to b
	}
	return b
}

function softcapShorten(x){
	if (typeof x == "number" && x < 1000 && x % 1 == 0) return x
	if (x > 1) return formatValue(player.options.notation, x, 3, 3)
	if (x == 1) return 1
	else return shorten(x)
}

function getSoftcapStringEffect(id, num, amt, namenum){
	let data = softcap_data[id][num]
	if (namenum == undefined) namenum = num
	if (data == undefined) return "Nothing, prb bug."
	let name = (getSoftcapName(id) || id) + " #" + namenum + "."

	var func = data.func
	var vars = softcap_vars[func]

	var v = [data[vars[0]], data[vars[1]], data[vars[2]], data[vars[3]], data[vars[4]]]
	for (let i = 0; i < 5; i++) if (typeof v[i] == "function") v[i] = v[i](amt)

	if (func == "pow"){
		let inside = "Start: " + softcapShorten(v[0]) + ", Exponent: " + softcapShorten(v[1])
		if (shiftDown) inside += (v[2] ? ", and keeps " : ", and does not keep ") + "smoothness at softcap start"
		return "Softcap of " + name + " " + inside + "."
	}
	if (func == "dilate") { // vars ["base", "pow", ...]
		let inside = "Start: " + softcapShorten(v[0]) + ", Exponent: " + softcapShorten(v[0]) + ", Base (log): " + softcapShorten(v[1])
		return "Softcap of " + name + " " + inside + "."
	}
	if (func == "log") { // vars ["pow", "mul", "add"]
		let mult = (v[1] != undefined && Decimal.neq(v[1], 1)) ? ", Times: " + softcapShorten(v[1]) : ""
		let add = ""
		if (v[2] != undefined) {
			if (typeof v[2] != "number" || v[2] > 0) add = (v[2] != undefined && Decimal.neq(v[2], 0)) ? ", Plus: " + softcapShorten(v[2]) : ""
			else add = (v[2] != undefined) ? ", Minus: " + softcapShorten(-1*v[2]) : ""
		}
		let inside = "Log base 10" + mult + add + ", to the Power of " + softcapShorten(v[0])
		end = " "
		if (data.start) end = " Start: " + softcapShorten(data.start) + ", "
		return "Softcap of " + name + end + inside + "."
	} 
	return "oops someone messed up"
}

function getInnerHTMLSoftcap(id){
	let n = numSoftcapsTotal(id)
	let s = ""
	if (!hasSoftcapStarted(id, 1)) return ""
	let c = 1
	let amt = getSoftcapAmtFromId(id)
	for (let i = 1; i <= n; i++) {
		if (hasSoftcapStartedArg(id, i, amt)) {
			s += getSoftcapStringEffect(id, i, amt, c) + "<br>"
			c ++
		}
	}
	return s + "<br><br>"
}

function updateSoftcapStatsTab(){
	let names = {
		dt_log: "softcap_dt",
		ts_reduce_log: "softcap_ts1",
		ts_reduce_log_big_rip: "softcap_tsBR",
		ts11_log_big_rip: "softcap_ts2",
		bru1_log: "softcap_bru1",
		beu3_log: "softcap_beu3",
		it: "softcap_it",
		tt: "softcap_tt",
		ma: "softcap_ma",
		ig_log_high: "softcap_ig",
		bam: "softcap_bam",
		idbase: "softcap_idbase",
		working_ts: "softcap_workts",
		bu45: "softcap_bu45",
		mptd_log: "softcap_mptd",
		// Condensened:
		nds_ngC: "softcap_C_nd",
		ts_ngC: "softcap_C_ts",
		sac_ngC: "softcap_C_sac",
		ip_ngC: "softcap_C_ip",
		rep_ngC: "softcap_C_rep",
		ids_ngC: "softcap_C_id",
		ep_ngC: "softcap_C_ep",
		tds_ngC: "softcap_C_td",
		dt_ngC: "softcap_C_dt",
		tp_ngC: "softcap_C_tp",
		//NGmX
		ids_ngm4: "softcap_m4_id",
	}
	let n = Object.keys(names)
	let anyActive = false

	for (let i = 0; i < n.length; i++){
		var id = n[i]
		var elname = names[id]
		var el = getEl(elname)
		var started = hasAnySoftcapStarted(id)
		if (started) {  
			el.style = "display:block"
			el.innerHTML = getInnerHTMLSoftcap(id)

			anyActive = true
		} else {
			el.style = "display:none"
		}

		var elDisp = getEl(elname + "_disp")
		if (elDisp) elDisp.style.display = started ? "" : "none"
		if (started) {
			var sc = 0
			var amt = getSoftcapAmtFromId(id)
			for (var j = 1; j <= numSoftcapsTotal(id); j++) {
				if (hasSoftcapStartedArg(id, j, amt)) sc++
			}
			elDisp.className = "softcap_" + sc
			elDisp.innerHTML = "(softcapped" + (sc >= 2 ? "<sup>" + sc + "</sup>" : "") + ")"
		}
	}

	getEl("softcapsbtn").style.display = anyActive ? "" : "none"
}
