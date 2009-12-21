/*
---
description:    MooTact class displays a custom contact form, posts the user's message to the server and handles the JSON response. It's a Lightboxed contact form.

license: 
   - MIT-style

authors:
   - Caleb Crane (http://www.simulacre.org)

requires: 
  core/1.2.1: 'Request.JSON'
  more/1.2.4: 'Element.Position, Spinner, Mask'
 
provides: 
   - MooTact

...
*/
var MooTact = new Class({
    Implements: [ Options, Events ],
    options: {
        url         : '/mootact',
        "class"     : 'mootact',
        prefix      : 'mootact_',
        "form-rows"    : [
                        { html : '<label for="mootact_name">Name</label><input type="text" id="mootact_name" name="mootact[name]" class="name" />'},
                        { html : '<label for="mootact_email">E-mail</label><input type="text" id="mootact_email" name="mootact[email]" class="email" />'},
                        { html : '<label for="mootact_subject">Subject</label><input type="text" id="mootact_subject" name="mootact[subject]" class="subject" />'},
                        { html : '<label for="mootact_message">Message</label><textarea id="mootact_message" name="mootact[message]" class="message" ></textarea>'},
                        { html : '<input type="submit" id="mootact_send" value="Send"/>', "class" : "submit" }
                      ],
        pelem       : null,
        position    : { position: "center" },
        title: "Contact Form"
    },
    toElement: function(){ return $(this.element); },
    initialize: function(options){
        this.setOptions(options);
  			if(this.options.pelem == null)
  				this.options.pelem = document.body;
			
      	this.pelem      = this.options.pelem;
        this.element    = new Element('form', { id : "mootact-"+ Math.floor(Math.random()*1000000000).toString(16), method : "POST", action : this.options.submitURL, "class" : this.options["class"], "html" : '<a href="#" class="dismiss">&nbsp;</a><h2>'+this.options.title+'</h2><p class="error general"></p>' });
      
        $each(this.options["form-rows"],function(row){
                this.element.adopt(new Element('div', row).addClass("form-row"));
        }.bind(this));

        this.element.addEvent("submit", function(e){
           e.stop();
           this.mail();
        }.bind(this));



        

        $(this).getElement("a.dismiss").addEvent("click", function(e){
            e.stop;
            this.dismiss();
        }.bind(this));

        this.genError = $(this).getElement(".error.general");

		  $(this).store("MooTact", this);

        return this;
    },
    dismiss: function(){
        $(this).dispose();
        $(this.pelem).unmask();
        this.fireEvent("dismiss");
        try{delete this;} catch(e) { /* IE7 can't delete this */ }
    },
    show: function(){
        	$(this.pelem).mask();
        	document.body.adopt(this.element);
        	$(this).position(this.options.position);
			$(this).set("spinner",{ "message" : "Please wait ...", "class" : "mask mootact", "containerPosition": {"position" : "centerTop", "offset" : { y : 100, x : -50 }  } });
    },
    errMsgs : {},
    showErrors: function(exc){
        if(exc.general){
            this.showGenError(exc.general);
        }
        exc.fields && $each(exc.fields, this.showFieldError.bind(this));

    },
    showGenError: function(err){
        err && this.genError.set("html", err);
    },
    showFieldError: function(msg,field){
        var n = this.options.prefix+field;
        if(!$(this).hasChild(n)){
            this.showGenError(msg);
            return;
        }


        this.errMsgs[n] = new Element("div", { "class" : "field error", id : n + "_err", html : msg });
        $(this).adopt(this.errMsgs[n]);
        this.errMsgs[n].position({ relativeTo : $(n), position: "bottomRight", offset : { x: -25, y : -20 } } );

        $(n).addEvent("focus", function(){
            this.errMsgs[n].dispose();
        }.bind(this));            
    },
    mail: function(){
        var me = this;            
        $(me).spin();
        $each(me.errMsgs, function(ele){ $(ele).dispose(); });

        new Request.JSON({ url : this.options.url, 
                                onSuccess : function(res){ 
                                        $(me).unspin();
                                        if(!res){
                                          me.showErrors( { general : 'Error: The server returned an error' } );
                                          return;                                          
                                        }
                                          
                                        if(res.success){
                                            me.fireEvent("success");
                                            me.dismiss();
                                            return;
                                        }
                                        if(res.exception)
                                          me.showErrors( res.exception ? res.exception : { general : 'Error: The server returned an error' });
                                        me.fireEvent("error");
                                },
                                onException: function(){
                                    me.showErrors({ general : 'Error: The server returned an error' } );
                                    $(me).unspin();
                                    me.fireEvent("exception");
                                },
                                onFailure: function(){
                                    me.showErrors({ general : 'Error: The server returned an error' } );
                                    $(me).unspin();
                                    me.fireEvent("failure");
                                }
                          }).post($(this));
        me.fireEvent("send");
    }
});