$(document).ready(function() {
	$("#photo-container").DTPhoto({action: '/ajax/dt-photo.php', width: 270, height: 200, currentImage: '/img/nophoto.png'});
})
