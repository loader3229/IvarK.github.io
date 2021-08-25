//Number < Infinity, Decimal > Infinity
function nP(a) {
	if (typeof a == "string") {
		return nN(new Decimal(a))
	}
	if (!a.e) return a
	a = nN(a)
	return a
}

function nN(a) {
	if (a.lt(Number.MAX_VALUE)) return Math.floor(a.toNumber())
	return a
}

function nA(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") {
		let s=a+b
		if (s<1/0) return s
	}
	return nN(Decimal.add(a,b))
}

function nS(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return a-b
	return nN(Decimal.sub(a,b))
}

function nM(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") {
		let m=a*b
		if (m<1/0) return Math.floor(m)
	}
	return nN(Decimal.times(a,b))
}

function nD(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return Math.floor(a/b)
	return nN(Decimal.div(a,b))
}

function nMx(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return Math.max(a,b)
	if (typeof(a)=="number") return b
	if (typeof(b)=="number") return a
	return a.max(b)
}

function nMn(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return Math.min(a,b)
	if (typeof(a)=="number") return a
	if (typeof(b)=="number") return b
	return a.min(b)
}

function nG(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return a>b
	if (typeof(a)=="number") return false
	if (typeof(b)=="number") return true
	return a.gt(b)
}

function nGE(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return a>=b
	if (typeof(a)=="number") return false
	if (typeof(b)=="number") return true
	return a.gte(b)
}

function nE(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return a==b
	if (typeof(a)=="number") return false
	if (typeof(b)=="number") return false
	return a.eq(b)
}

function nLE(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return a<=b
	if (typeof(a)=="number") return true
	if (typeof(b)=="number") return false
	return a.lte(b)
}

function nL(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return a<b
	if (typeof(a)=="number") return true
	if (typeof(b)=="number") return false
	return a.lt(b)
}

//Number or Decimal
function dS(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return a-b
	return Decimal.sub(a,b)
}

//Functions
function nF_m(list) { //Multiplication
	var d = new Decimal(1)
	var n = 1
	for (var i = 0; i < list.length; i++) {
		var j = list[i]
		if (j.length !== undefined) {
			if (!j[0]) continue
			j = evalData(j[1])
		}

		if (j.e !== undefined) d = d.times(j)
		else if (n * j == 1/0) {
			d = d.times(n)
			n = j
		} else n *= j
	}

	var r = n
	if (d.gt(1)) {
		r = d.times(n)
		if (r.lt(Number.MAX_VALUE)) r = r.toNumber()
	}
	return r
}