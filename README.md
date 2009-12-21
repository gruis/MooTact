MooTact
===========
 MooTact generates and displays a contact form on top of a mask over the rest of the page. It's a Lightbox Contact Form.
 
 The user's input is submitted with Request.JSON and expects the server to respond with JSON. A [simple PHP server script](http://github.com/simulacre/MooTact/blob/master/backend/web/send.json.php)
 that leverages [Swift Mailer](http://swiftmailer.org/) is provided.
 
 ![Screenshot](http://mootact.simulacre.org/images/screenshot.png)

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

## Post Parameters
By default MooTact will POST the following URL parameters
mootact[email]	
mootact[message]	
mootact[name]	
mootact[subject]


## Backend Script
The [backend script](http://github.com/simulacre/MooTact/blob/master/backend/web/send.json.php) that handles the input must return a JSON object containing either a string-value pair indicating 
success, or an exception object indicating failure.


### Valid Input

If the input is valid and the message is sent successfully return a JSON object with a success code:
    #JS
    { "success" : 1 }


### Invalid Input

If the input is invalid, or the message cannot be sent then return a JSON object detailing the errors:
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


### Installing the Backend Script

You can write your own backend script, or use [send.json.php](http://github.com/simulacre/MooTact/blob/master/backend/web/send.json.php), which is provided in [backend/web](http://github.com/simulacre/MooTact/tree/master/backend/web/). To use send.json.php
1. Drop it on your web server
2. Place [config.php](http://github.com/simulacre/MooTact/blob/master/backend/config.php) and [Swift Mailer](http://github.com/simulacre/MooTact/tree/master/backend/lib/Swift-4.0.5/) outside of a web accessible directory
3. Change $configFile and $swiftLoc variables to point to their appropriate spots
4. Change config.php with your SMTP details, e.g., address, username, password


## Changing the Form

#### Markup
To change the markup for the form pass in an array of form-row objects when instantiating the MooTact object.
Each form-row object must at least have an "html" member. Any other Element properties may also be defined as 
members of the form-row object.

    #JS
    new MooTact( { 
        ...
    	"form-rows"    : [
                        { html : '<label for="mootact_name">Name</label><input type="text" id="mootact_name" name="mootact[name]" />'},
                        { html : '<label for="mootact_email">E-mail</label><input type="text" id="mootact_email" name="mootact[email]" />'},
                        { html : '<label for="mootact_subject">Subject</label><select id="mootact_subject" name="mootact[subject]"><option value="feature_request">Feature Request</option><option value="bug">Bug</option></select>'},
                        { html : '<label for="mootact_message">Message</label><textarea id="mootact_message" name="mootact[message]" class="message" ></textarea>'},
                        { html : '<input type="submit" id="mootact_send" value="Send"/>', "class" : "submit" }
                      ],
        ...
        }).show();

##### Default "form-rows"
    #JS
    {
        "form-rows"    : [
                        { html : '<label for="mootact_name">Name</label><input type="text" id="mootact_name" name="mootact[name]" class="name" />'},
                        { html : '<label for="mootact_email">E-mail</label><input type="text" id="mootact_email" name="mootact[email]" class="email" />'},
                        { html : '<label for="mootact_subject">Subject</label><input type="text" id="mootact_subject" name="mootact[subject]" class="subject" />'},
                        { html : '<label for="mootact_message">Message</label><textarea id="mootact_message" name="mootact[message]" class="message" ></textarea>'},
                        { html : '<input type="submit" id="mootact_send" value="Send"/>', "class" : "submit" }
                      ]
    }

#### CSS
See 
- [mootact-nc.css](http://github.com/simulacre/MooTact/blob/master/Source/mootact-nc.css)
- [mootact-ie6-nc.css](http://github.com/simulacre/MooTact/blob/master/Source/mootact-ie6-nc.css)

## Demo

- [MooTact Demo](http://mootact.simulacre.org/index.html)
- [Custom MooTact Demo](http://mootact.simulacre.org/custom.html)