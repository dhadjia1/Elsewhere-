
function userInputButton() {
	document.getElementById("userDropdown").classList.toggle("show");
}

window.onclick = function(e) {
	if (!e.target.matches('.dropbtn')) {
		var myDropDown = document.getElementById("userDropdown");
		if (myDropDown.classList.contains('show')) {
			myDropDown.classList.remove('show');
		}
	}
}