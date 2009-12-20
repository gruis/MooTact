<?php
class mtConfig{
	private static $params;
	
    private static $instance;

	public function __construct(){		
		include("../config.php");
		if(isset($params) && is_array($params))
			$this->params = $params;
	}
	
    public static function get($param, $def = null){
      	if(self::$instance == null){
        	self::$instance = new self;
      	}
		return isset(self::$instance->params[$param]) ? self::$instance->params[$param] : $def;
    }

}

class mtRequest {	

	public static function getParameter($key){
		if(!isset($_REQUEST[$key]))
				return;
		return $_REQUEST[$key];
	}
	public static function hasParameter($key){
		return isset($_REQUEST[$key]);
	}

	public static function getVariable($key){
		if(!isset($_SERVER[$key]))
				return;
		return $_SERVER[$key];		
	}
	public static function hasVariable($key){
		return isset($_SERVER[$key]);
	}
	
	public static function isPost(){
		return $_SERVER["REQUEST_METHOD"] == "POST";
	}

	public static function isGet(){
		return $_SERVER["REQUEST_METHOD"] == "GET";		
	}

}


function validateContactForm($mootact){
    $errors = array();
	if(!isset($mootact["name"]) || empty($mootact["name"])){
	    $errors["fields"]["name"] = "Name is required";
	}
	if(!isset($mootact["subject"]) || empty($mootact["subject"])){
	    $errors["fields"]["subject"] = "Subject is required";
	}
	if(!isset($mootact["message"]) || empty($mootact["message"])){
	    $errors["fields"]["message"] = "Message is required";
	}
	if(!isset($mootact["email"]) || empty($mootact["email"])){
	    $errors["fields"]["email"] = "Your e-mail address is required";
	} elseif(!strpos($mootact["email"], "@") || !substr_count($mootact["email"],".")){
	    $errors["fields"]["email"] = "A valid e-mail address is required";
	}

	return $errors;
}


function getHtmlMsg($msg){
	extract($msg);
	ob_start();
    ob_implicit_flush(0);

?>
	<p>From: <?php echo $name ?> (<?php echo $email?>)</p>
	<p>Subject : <?php echo $subject ?> </p>


	<?php foreach(explode("\n",$message) as $m): ?>
	<p><?php echo $m ?></p>
	<?php endforeach; ?>	
<?php
	return 	ob_get_clean();
}


function getTxtMsg($msg){
	extract($msg);
	ob_start();
    ob_implicit_flush(0);

?>
	From: <?php echo $name ?>(<?php echo $email?>)

	Subject : <?php echo $subject ?>


	<?php echo $message ?>
	
<?php
	return 	ob_get_clean();
}

function sendMessage($msg){
		require_once '../lib/Swift-4.0.5/lib/swift_required.php';

		$transport = Swift_SmtpTransport::newInstance(mtConfig::get("smtp_server"), mtConfig::get("smtp_port", 25))
												->setUsername(mtConfig::get("smtp_user"))
												->setPassword(mtConfig::get("smtp_pass"));
		
		$message = Swift_Message::newInstance($msg["subject"])
												->setFrom(mtConfig::get('send_from', $msg["email"]))
												->setTo(mtConfig::get("send_to"))
												->setBody(getTxtMsg($msg))
												->addPart(getHtmlMsg($msg), 'text/html');

		

		$failures = array();
		if(!Swift_Mailer::newInstance($transport)->send($message, $failures)){
			throw new Exception("Failed to send message to: " . implode(",",$failures));
		}
		
}

function executeSend($request){
		$errors = array();
		if(!$request->hasParameter("mootact")){
		    $errors["general"] = "Invalid submission";
		    return $errors;
		}

		$mootact 		= $request->getParameter("mootact");
		if(!is_array($request->getParameter("mootact"))){
		    $errors["general"] = "Malformed submission";
		    return $errors;
		}

		$errors 	= validateContactForm($mootact);
		if(count($errors)){
		    return $errors;
		}
		
		try{
			sendMessage($mootact);				
		} catch(Exception $e){
			$errors["general"]    = 'Failed to send message. Please contact us directly at: <a href="mailto:'.mtConfig::get("send_to").'">'.mtConfig::get("send_to").'</a>';
		}
		
		return $errors;
}



/* ===-==-==-==-==-==-==-==-==-==-==-==-[ Main Body ]-==-==-==-==-==-==-==-==-==-==-==-===
 *  ===-------------------------------------------------------------------------------===
 * 	   Take the user's input, check it for validity and try to send it out using Swift. 
 *     If the input is invalid, or the message cannot be sent then return a JSON object 
 *	   detailing the errors will be returend:
 *		{
 * 	    	"exception" : {
 *		 	  	'general' 	: "general error message",
 *		   		'fields'		: {
 *									"fieldNameA"	: "field-specific error message",
 *									"fieldNameB"	: "field-specific error message",
 *						 			etc,
 *					  	  		  } 
 *	    		}
 *		}
 *
 *     If the input is valid and the message is sent successfully a JSON object with a 
 *	   success code will be returned:
 *	    { "success" : 1 }
 *  ===--------------------------------------------------------------------------------===
 * ===-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-===
 */
try{
	$errors = executeSend(new mtRequest());	
} catch(Exception $e){
	$errors = array("general" => 'Failed to send message. Please contact us directly at: <a href="mailto:'.mtConfig::get("send_to").'">'.mtConfig::get("send_to").'</a>');
}
header("Content-type: application/json");
?>
{
<?php if(count($errors)): ?>
    "exception" : <?php echo json_encode($errors); ?>
<?php else: ?>
    "success" : 1
<?php endif; ?>
}