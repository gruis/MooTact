/* 
  Copyright (c) 2009 Caleb Crane <license [at] simulacre.org>, Simulacre Publishing LLC

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation
  files (the "Software"), to deal in the Software without
  restriction, including without limitation the rights to use,
  copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following
  conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.
  
  Except as contained in this notice, the name(s) of the above 
  copyright holders shall not be used in advertising or otherwise 
  to promote the sale, use or other dealings in this Software 
  without prior written authorization.
  
  The end-user documentation included with the redistribution, if 
  any, must include the following acknowledgment: "This product 
  includes software developed by Simulacre Publishing LLC 
  (http://www.simulacre.org/) and its contributors", in the same 
  place and form as other third-party acknowledgments. Alternately, 
  this acknowledgment may appear in the software itself, in the same
  form and location as other such third-party acknowledgments.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
  OTHER DEALINGS IN THE SOFTWARE.
*/


/* ========================== [ MooTact ] ================================
 * ====---------------------------------------------------------------====
 *      MooTools based Contact Form
 *
 *  Submissions are made via JSON and responses are expected as same.
 * ====---------------------------------------------------------------====
 * ========================== [ MooTact ] ================================ */

var MooTact = new Class({
    Implements: [ Options, Events ],
    options: {
        url         : '/mootact',
        "class"     : 'mootact',
        prefix      : 'mootact_',
        formRows    : [
                        { html : '<label for="mootact_name">Name</label><input type="text" id="mootact_name" name="mootact[name]" class="name" />'},
                        { html : '<label for="mootact_email">E-mail</label><input type="text" id="mootact_email" name="mootact[email]" class="email" />'},
                        { html : '<label for="mootact_subject">Subject</label><input type="text" id="mootact_subject" name="mootact[subject]" class="subject" />'},
                        { html : '<label for="mootact_message">Message</label><textarea id="mootact_message" name="mootact[message]" class="message" ></textarea>'},
                        { html : '<input type="submit" id="mootact_send" value="Send"/>', "class" : "submit" }
                      ],
        pelem       : 'content',
        position    : { position: "center" },
        title: "Contact Form"
    },
    toElement: function(){ return $(this.element); },
    initialize: function(options){
        this.setOptions(options);
        this.pelem      = this.options.pelem;

        var html = '<a href="#" class="dismiss">&nbsp;</a><h2>'+this.options.title+'</h2><p class="error general"></p>';
        $each(this.options.formRows,function(row){
                var c = "form-row";
                if(row["class"])
                    c += " " + row["class"];
                html += '<div class="'+c+'">'+row.html+'</div>';
        });
        this.element    = new Element('form', { id : "mootact-"+ Math.floor(Math.random()*1000000000).toString(16), method : "POST", action : this.options.submitURL, "class" : this.options["class"], html : html });

        this.element.addEvent("submit", function(e){
           e.stop();
           this.mail();
        }.bind(this));



        this.element.set("html",html);

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

                                        if(typeof res.success != "undefined"){
                                            me.fireEvent("success");
                                            me.dismiss();
                                            return;
                                        }
                                        me.showErrors((typeof res.exception != undefined) ? res.exception : { general : 'Error: The server returned an error' } );
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