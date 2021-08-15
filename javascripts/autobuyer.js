var Autobuyer = function Autobuyer(target) {
    this.target = target
    this.cost = 1
    this.interval = 5000;
    this.priority = 1;
    this.ticks = 0;
    this.isOn = false;
    this.tier = 1;
    this.bulk = 1;
}

//FUNCTIONS
function maxAutobuyerUpgrades() {
	let order = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
	for (var i = order.length; i > 0; i--) {
		var id = order[i - 1]
		if (player.autobuyers[id - 1] % 1 !== 0) while (buyAutobuyer(id - 1, true)) {}
	}
	updateAutobuyers()
}