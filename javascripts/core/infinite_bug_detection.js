function detectInfinite(part) {
	if (part !== undefined) return isNaN(Decimal.log10(part))
	return detectInfinite(player.money) || detectInfinite(player.infinityPoints) || detectInfinite(player.eternityPoints) || detectInfinite(player.dilation.dilatedTime)
}

var infiniteDetected = false
var infiniteCheck = false
var infiniteCheck2 = false
var infiniteSave

function isInfiniteDetected() { // todo: make better infinite detection system
	if (infiniteDetected) return
	if (detectInfinite()) {
		infiniteDetected = true
		exportInfiniteSave()
		reload()
		infiniteDetected = false
		if (getEl("welcome").style.display != "flex") getEl("welcome").style.display = "flex"
		getEl("welcomeMessage").innerHTML = "I'm sorry, but you got an Infinite bug. Because of this, your save is reverted to your last saved progress. It is recommended to post how did you got this bug. Thanks! :)"
		return true
	}
}

function exportInfiniteSave() {
	infiniteSave = btoa(JSON.stringify(player))
	getEl("bugExport").style.display = ""
	bugExport()
}

function bugExport() {
	let output = getEl('output');
	let parent = output.parentElement;

	parent.style.display = "";
	output.value = infiniteSave;

	output.onblur = function() {
		parent.style.display = "none";
	}

	output.focus()
	output.select()

	try {
		if (document.execCommand('copy')) {
			$.notify("Exported to clipboard", "info");
			output.blur()
			output.onblur()
		}
	} catch(ex) {
		// well, we tried.
	}
}