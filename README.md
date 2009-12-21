MooTact
===========
 MooTact generates and displays a contact form on top of a mask over the rest of the page. It's a Lightbox Contact Form.
 
 The user's input is submitted with Request.JSON and expects the server to respond with JSON. A simple PHP server script
 that leverages Swift Mailer (http://swiftmailer.org/) is provided.
 
 ![Screenshot](http://kanjitastic.com/MooTact/images/screenshot.png)

How to use
----------
 Instantiate a MooTact object and call show();
#JS
    window.addEvent("domready", function(){
    		$("notify").set('highlight', {duration: 'long'});
    	  	$('mootact_button').addEvent("click", function(e){
    						e.stop();
    						$("notify").fade("out");
    						new MooTact( { 
            							title 	: 'MooTact Contact Form', 
            							url		: "send.json.php",
            							onSuccess: function(){
            								(function(){
            									$("notify").set('html', 'E-mail sent ... Thank you!' ).fade("in");
            									(function(){$("notify").highlight(); }).delay(750);											
            								}).delay(750);
            							} 
    						}).show(); 
    		  });			
    });

By default MooTact will POST the following URL parameters
mootact[email]	
mootact[message]	
mootact[name]	
mootact[subject]


The backend script that handles the input must return a JSON object containing either a string-value pair indicating 
success, or an exception object indicating failure.


#Valid Input
If the input is valid and the message is sent successfully a JSON object with a success code will be returned:
#JS
    { "success" : 1 }


#Invalid Input
If the input is invalid, or the message cannot be sent then return a JSON object detailing the errors will be returned:
#JS

    {    	"exception" : {
     	  	'general' 	: "general error message",
       		'fields'		: {
    							"name"	    : "Name is required",
    							"subject"	: "Subject is required",
    							"email"     : "A valid e-mail address is required"
    				 			etc,
    			  	  		  } 
    		} }


You can write your own backend script, or use send.json.php, which is provided in backend/web. To use send.json.php
1. Drop it on your web server
2. Place config.php and Swift Mailer outside of a web accessible directory
3. Change $configFile and $swiftLoc variables to point to their appropriate spots
4. Change config.php with your SMTP details, e.g., address, username, password


