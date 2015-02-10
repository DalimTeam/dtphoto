(function($) {
	var objElements = 0;
	var u = "undefined";
	$.fn.DTPhoto = function(options) {
		var DrawLoader = function() {
			$("#dt-photo-ajax-loader").remove();
			var d = $('<div id="dt-photo-ajax-loader"></div>');
			var i = $('<img src="' + settings.loaderImg + '">');
			d.append(i);
			$("body").append(d);
		}
		var RemoveLoader = function() {
			$("#dt-photo-ajax-loader").remove();
		}
		var DrawImage = function() {
			$("#dt-photo-image-" + settings.id).remove();
			var img = $('<img class="dt-photo-image" id="dt-photo-image-' + settings.id + '" src="' + settings.currentImage + '">').css({
				width: settings.width + "px",
				height: settings.height + "px"
			});
			settings.obj.append(img);
		}
		var DrawPreview = function(file) {
			var RemovePreview = function(e) {
				if (e.keyCode == 27) {
					d.empty();
					d.remove();
					b.remove();
					uploadFile.val("");
					$(document).off("keyup", RemovePreview);
				}
				else if (e.keyCode == 13) {
					button.click();
				}
			}
			RemoveLoader();
			var ans = JSON.parse(file);
			if (typeof ans.error !== u) {
				settings.obj.append('<div class="dt-photo-upload-error">' + settings.uploadErrorMsg + '</div>');
			}
			else {
				var b = $('<div class="dt-photo-preview-background"></div>');
				var d = $('<div class="dt-photo-preview-container"></div>');
				
				var scale = $.fn.DTPhoto.calculateScale(settings.previewWidth, settings.previewHeight, ans.width, ans.height);
				d.css({
					width: scale.width + "px",
					height: scale.height + "px",
					marginLeft: -(scale.width / 2) + "px",
					marginTop: -(scale.height / 2) + "px"
				})
				
				var img = $('<img src="' + ans.name + '" class="dt-photo-preview-image">').css({
					width: scale.width + "px",
					height: scale.height + "px"
				});
				d.append(img);
				
				var sWidth = Math.round(settings.width * scale.k);
				var sHeight = Math.round(settings.height * scale.k);
				
				if (sWidth > scale.width || sHeight > scale.height) {
					var k = Math.max(sWidth / scale.width, sHeight / scale.height);
					sWidth = sWidth / k;
					sHeight = sHeight / k;
				}
				
				var square = $('<div class="dt-photo-select-square"></div>').css({	
					width: sWidth + "px",
					height: sHeight + "px",
					left: (scale.width / 2 - sWidth / 2) + "px",
					top: (scale.height / 2 - sHeight / 2) + "px"
				});
				
				var s1 = $('<div class="dt-photo-scale-square"></div>');
				square.append(s1);
				
				//bg
				var bleft, btop;
				bleft = 0;
				btop = -(scale.height-(scale.height / 2 - sHeight / 2));
				var bgtop = $('<div class="dt-photo-square-bg"></div>').css({
					left: bleft + "px",
					top: btop + "px",
					width: scale.width + "px",
					height: scale.height + "px"
				})
				d.append(bgtop);
				
				bleft = -(scale.width-(scale.width / 2 - sWidth / 2));
				btop = 0;
				var bgleft = $('<div class="dt-photo-square-bg"></div>').css({
					left: bleft + "px",
					top: btop + "px",
					width: scale.width + "px",
					height: scale.height + "px"
				})
				d.append(bgleft);
				
				bleft = scale.width / 2 + sWidth / 2;
				btop = 0;
				var bgright = $('<div class="dt-photo-square-bg"></div>').css({
					left: bleft + "px",
					top: btop + "px",
					width: scale.width + "px",
					height: scale.height + "px"
				})
				d.append(bgright);
				
				bleft = 0;
				btop = scale.height / 2 + sHeight / 2;
				var bgbottom = $('<div class="dt-photo-square-bg"></div>').css({
					left: bleft + "px",
					top: btop + "px",
					width: scale.width + "px",
					height: scale.height + "px"
				})
				d.append(bgbottom);
				//
				d.append(square);
				
				var button = $('<button class="dt-photo-preview-button">' + settings.saveButtonText + '</button>');
				d.append(button);
				
				$("body").append(b);
				$("body").append(d);
				
				moveSquare = false;
				moveS1 = false;
				
				button.on("click", function() {
					var i = img.prop("src");
					img.remove();
					var a = $('<img class="dt-photo-loader" src="' + settings.loaderImg + '">');
					square.append(a);
					var s2 = square.clone();
					var o = square.offset();
					var posX = parseFloat(square.css("left").replace("px", ""));
					var posY = parseFloat(square.css("top").replace("px", ""));
					var width = s2.innerWidth();
					var height = s2.innerHeight();
					s2.css({
						backgroundImage: "URL('" + i + "')",
						backgroundSize: scale.width + "px " + scale.height + "px",
						backgroundPosition: "-" + posX + "px -" + posY + "px",
						left: o.left + "px",
						top: o.top + "px",
						border: "0"
					});
					$("body").append(s2);
					square.remove();
					d.hide();
					////// пересчитаем все данные для нашего масштаба
					posX = posX / scale.k;
					posY = posY / scale.k;
					width = width / scale.k;
					height = height / scale.k;
					/////
					$.post(settings.action, {f: ans.name, "upload-type": "save", l: posX, t: posY, w: width, h: height, rw: settings.width, rh: settings.height}, function(json) {
						if (typeof json.error !== u) {
							console.log(json.error);
						}
						else {
							var o = settings.obj.offset();
							$('<img src="' + json.src + '">').on("load", function() {
								a.remove();
								var image = $('<img src="' + json.src + '">').css({
									width: s2.width() + "px",
									height: s2.height() + "px",
									position: "absolute",
									left: s2.offset().left + "px",
									top: s2.offset().top + "px"
								});
								$('body').append(image);
								s2.remove();
								image.animate({top: o.top, left: o.left, width: settings.width, height: settings.height}, 600, "swing", function() {
									settings.currentImage = json.src;
									DrawImage();
									var e = {keyCode: 27};
									RemovePreview(e);
									$(this).remove();
								});
							});
						}
					}, 'json');
				});
				
				square.on({
					dblclick: function() {
						button.click();
					},
					mousedown: function(e) {
						moveSquare = {x: e.pageX, y: e.pageY};
					},
					mousemove: function(e) {
						if (moveSquare && !moveS1) {
							var dx = e.pageX - moveSquare.x;
							var dy = e.pageY - moveSquare.y;
						
							var oY = (parseFloat(square.css("top").replace("px", "")) + dy);
							var oX = (parseFloat(square.css("left").replace("px", ""))+ dx);
							if (oY >= 0 && oY + square.outerHeight() < d.innerHeight()) {
								square.css("top", oY + "px");
								bgtop.css("top", (parseFloat(bgtop.css("top").replace("px", "")) + dy) + "px");
								bgbottom.css("top", (parseFloat(bgbottom.css("top").replace("px", "")) + dy) + "px");
							}
							if (oX >= 0 && oX + square.outerWidth() < d.innerWidth()) {
								square.css("left", oX + "px");
								bgleft.css("left", (parseFloat(bgleft.css("left").replace("px", ""))+ dx) + "px");
								bgright.css("left", (parseFloat(bgright.css("left").replace("px", ""))+ dx) + "px");
							}
							moveSquare.x = e.pageX;
							moveSquare.y = e.pageY;						
						}
					},
					mouseup: function() {
						moveSquare = false;
						moveS1 = false;
					}
				});
				
				s1.on("mousedown", function(e) {
					moveS1 = {x: e.pageX, y: e.pageY};
				});
				
				var documentListener = function() {
					moveSquare = false;
					moveS1 = false;
				};
				
				b.on("mouseup", documentListener);
				
				var squareWidth = parseFloat(square.css("width").replace("px", ""));
				var squareHeight = parseFloat(square.css("height").replace("px", ""));
				
				d.on({
					mousemove: function(e) {
						if (moveS1) {
							var dx = e.pageX - moveS1.x;
							var dy = e.pageY - moveS1.y;
							var px = dx;
							var py = dy;
					
							if (settings.fixedRatio) {
								if (Math.abs(dx) >= Math.abs(dy)) {
									py = px / (settings.width / settings.height);
									//px = px / (settings.width / settings.height);
								}
								else {
									px = py / (settings.height / settings.width);	
									//py = py / (settings.height / settings.width);
								}
							}
							
							var top = (parseFloat(bgbottom.css("top").replace("px", "")) + py);
							var left = (parseFloat(bgright.css("left").replace("px", "")) + px);
						
							if (top < scale.height && left < scale.width) {
								if (squareHeight + py > 5) {
									square.css("height", squareHeight + py + "px");
									bgbottom.css("top", top + "px");
									squareHeight += py;
								}
								if (squareWidth + px > 5) {
									square.css("width", squareWidth + px + "px");
									bgright.css("left", left + "px");
									squareWidth += px;
								}
							}

							moveS1.x = e.pageX;
							moveS1.y = e.pageY;
						}
					},
					mouseup: function(e) {
						moveSquare = false;
						moveS1 = false;
					}
				});
				$(document).on("keyup", RemovePreview);
			}
		}
		objElements++;
		options.id = objElements;
		var settings = $.extend({}, $.fn.DTPhoto.defaults, options);
		settings.obj = this;
		settings.obj.css({
			width: settings.width + "px",
			height: settings.height + "px",
			overflow: "hidden"
		});
		if (settings.obj.css("position") == "static") {
			settings.obj.css("position", "relative");
		}
		
		var uploadContainer = $('<div class="dt-photo-upload-container"></div>').css({
			display: "none",
			width: settings.width + "px",
			height: settings.height + "px"
		});
		
		if (settings.useUploadButton) {
			var uploadBg = $('<div class="dt-photo-upload-bg"></div>').css({
				width: settings.width + "px",
				height: settings.height + "px"
			});
			uploadContainer.append(uploadBg);
		}
		
		var uploadForm = $('<form action="' + settings.action + '" target="dt-photo-upload-iframe-' + settings.id + '" method="post" enctype="multipart/form-data" class="dt-photo-upload-form"></form>');
		var uploadFile = $('<input name="dt-photo-upload-file" id="dt-photo-upload-file-' + settings.id + '" type="file" accept="image/*">');
		var uploadType = $('<input name="upload-type" type="hidden" value="load">');
		
		uploadForm.append(uploadType).append(uploadFile);
		uploadContainer.append(uploadForm);
		
		var uploadIframe = $('<iframe class="dt-photo-upload-iframe" name="dt-photo-upload-iframe-' + settings.id + '" id="dt-photo-upload-iframe-' + settings.id + '"></iframe>');
		uploadContainer.append(uploadIframe);
		
		if (settings.useUploadButton) {
			var uploadButton = $('<button class="dt-photo-upload-button" id="dt-photo-upload-button-' + settings.id + '">' + settings.uploadButtonText + '</button>');
			uploadContainer.append(uploadButton);
			settings.uploadButton = uploadButton;
		}
		
		if (settings.currentImage !== null) {
			DrawImage();
		}
		if (settings.obj.css("position") == "")
			settings.obj.css("position", "relative");
		settings.obj.append(uploadContainer);
		
		if (settings.useUploadButton) {
			settings.obj.on({
				mouseover: function() {
					uploadContainer.css("display", "block");
					uploadButton.css({
						marginTop: -Math.round(uploadButton.outerHeight() / 2) + "px",
						marginLeft: -Math.round(uploadButton.outerWidth() / 2) + "px"
					});
				},
				mouseout: function() {
					uploadContainer.css("display", "none");
				}
			});
		}
		settings.uploadButton.on("click", function() {
			$(".dt-photo-upload-error").remove();
			uploadType.val("load");
			uploadFile.click();
		});
		
		uploadFile.on("change", function() {
			var file = this.files[0];
			if (typeof file !== u && file) {
				if (file.size > settings.maxFileSize) {
					settings.obj.append('<div class="dt-photo-upload-error">' + settings.maxFileSizeOverheadMsg + '</div>');
				}
				else {
					DrawLoader();
					uploadForm.submit();
				}
			}
			else {
				DrawLoader();
				uploadForm.submit();
			}
		});
		
		uploadIframe.on("load", function() {
			if (uploadType.val() == "load") {
				DrawPreview($(this).contents().find("body").text());
			}
		});
	}
	$.fn.DTPhoto.defaults = {
		obj: null,
		width: 300,
		height: 140,
		fixedRatio: true,
		action: null,
		useUploadButton: true,
		uploadButton: null,
		uploadButtonText: "Upload",
		saveButtonText: "Save",
		currentImage: null,
		maxFileSize: 1 * 1024 * 1024,
		maxFileSizeOverheadMsg: "File is too big. Maximum size is 1 MB.",
		uploadErrorMsg: "Upload error. try again",
		previewWidth: 600,
		previewHeight: 500,
		loaderImg: "/img/white-loader.gif",
		id: 0
	}
	
	$.fn.DTPhoto.calculateScale = function(width, height, realWidth, realHeight) {
		var kWidth, kHeight, k, oWidth, oHeight;
		//oHeight = $(document).height() - (parseInt($("body").css("padding-bottom").replace("px", "")) + parseInt($("body").css("padding-top").replace("px", "")));
		//oWidth = $(document).width() - (parseInt($("body").css("padding-left").replace("px", "")) + parseInt($("body").css("padding-right").replace("px", "")));
		//realWidth = Math.min(realWidth, oWidth);
		//realHeight = Math.min(realHeight, oHeight);
		kWidth = realWidth < width ? 1 : width / realWidth;
		kHeight = realHeight < height ? 1 : height / realHeight;
		k = Math.min(kWidth, kHeight);
		kMax = Math.max(width / realWidth, height / realHeight);
		return {width: realWidth * k, height: realHeight * k, k: k, kMax: kMax};
	}
})(jQuery);
