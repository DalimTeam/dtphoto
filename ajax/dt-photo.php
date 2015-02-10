<?
define('DT_PHOTO_TMP_DIR', $_SERVER['DOCUMENT_ROOT'].'/tmp/');
define('DT_PHOTO_FILE_DIR', $_SERVER['DOCUMENT_ROOT'].'/dt-images/');
define('DT_PHOTO_TMP_HOST', '/tmp/');
define('DT_PHOTO_FILE_HOST', '/dt-images/');


if (isset($_POST)) {
	if (isset($_POST['upload-type'])) {
		switch ($_POST['upload-type']) {
			case 'load':
				if (isset($_FILES)) {
					$curr_file = $_FILES['dt-photo-upload-file'];
					$ans = array();
					$file = new DoImage;
					$name = $file->move_tmp_file($curr_file);
					if ($name) {
						print json_encode($name);
					}
					else
						print json_encode(array('error' => ''));
				}
				break;
			case 'save':
				$ans = array();
				if (isset($_POST['f'], $_POST['l'], $_POST['t'], $_POST['w'], $_POST['h'], $_POST['rw'], $_POST['rh'])) {
					$f = strip_tags($_POST['f']);
					$l = round(floatval($_POST['l']));
					$t = round(floatval($_POST['t']));
					$w = round(floatval($_POST['w']));
					$h = round(floatval($_POST['h']));
					$rw = round(floatval($_POST['rw']));
					$rh = round(floatval($_POST['rh']));
					$file = new DoImage;
					$f = str_replace(DT_PHOTO_TMP_HOST, "", $f);
					
					$fn = explode('.', $f);
					$ext = $fn[sizeof($fn)-1];
					$fn[sizeof($fn)-1] = '';
					$name = implode('.', $fn);
					$new_name = DT_PHOTO_FILE_DIR.$name.$ext;
					
					$f = DT_PHOTO_TMP_DIR.$f;
					$i = 0;
					if (file_exists($f)) {
						while (file_exists($new_name)) {
							$i++;
							$new_name = DT_PHOTO_FILE_DIR.$name.'('.$i.').'.$ext;
						}
						if ($file->crop($l, $t, $w, $h, $rw, $rh, $f, $new_name)) {
							$ans['src'] = str_replace(DT_PHOTO_FILE_DIR, DT_PHOTO_FILE_HOST, $new_name).'?'.date("U");
						}
						else
							$ans['error'] = "Cant crop file.";
					}
					else
						$ans['error'] = "File not exists.";
					
				}
				else
					$ans['error'] = 'Wrong args.';
				print json_encode($ans);
				break;
		}
	}
}

class DoImage {
	function __construct() {
		
	}
	
	function move_tmp_file($file_data) {
		$fn = explode('.', $file_data['name']);
		$ext = $fn[sizeof($fn)-1];
		$fn[sizeof($fn)-1] = '';
		$name = implode('.', $fn);
		$new_name = $name.$ext;
		$i = 0;
		while (file_exists(DT_PHOTO_TMP_DIR.$new_name)) {
			$i++;
			$new_name = $name.'('.$i.').'.$ext;
		}
		if (move_uploaded_file($file_data['tmp_name'], DT_PHOTO_TMP_DIR.$new_name)) {
			$size = getimagesize(DT_PHOTO_TMP_DIR.$new_name);
			return array('name' => DT_PHOTO_TMP_HOST.$new_name, 'width' => $size[0], 'height' => $size[1]);
		}
		else
			return false;
	}
	
	function crop($x, $y, $width, $height, $new_width, $new_height, $image, $to_file) {
		if (!file_exists($image)) return false;

		$size = getimagesize($image);

		if ($size === false) return false;

  		$format = strtolower(substr($size['mime'], strpos($size['mime'], '/')+1));
  		$icfunc = "imagecreatefrom" . $format;
  		if (!function_exists($icfunc)) return false;

  		$isrc = $icfunc($image);
  		$idest = imagecreatetruecolor($new_width, $new_height);
		$bg_color = imagecolorallocate($idest, 255, 255, 255);
  		imagefill($idest, 0, 0, $bg_color);
  		imagecopyresampled($idest, $isrc, 0, 0, $x, $y, $new_width, $new_height, $width, $height);

		$icfunc = 'image'.$format;
		$icfunc = 'image'.$format;
		if ($format == "jpeg")
	  		$icfunc($idest, $to_file, 95);
		else
			$icfunc($idest, $to_file);

  		imagedestroy($isrc);
  		imagedestroy($idest);
		return true;
	}
}
?>
