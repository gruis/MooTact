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
var MooTact=new Class({Implements:[Options,Events],options:{url:"/mootact","class":"mootact",prefix:"mootact_",formRows:[{html:'<label for="mootact_name">Name</label><input type="text" id="mootact_name" name="mootact[name]" class="name" />'},{html:'<label for="mootact_email">E-mail</label><input type="text" id="mootact_email" name="mootact[email]" class="email" />'},{html:'<label for="mootact_subject">Subject</label><input type="text" id="mootact_subject" name="mootact[subject]" class="subject" />'},{html:'<label for="mootact_message">Message</label><textarea id="mootact_message" name="mootact[message]" class="message" ></textarea>'},{html:'<input type="submit" id="mootact_send" value="Send"/>',"class":"submit"}],pelem:"content",position:{position:"center"},title:"Contact Form"},toElement:function(){return $(this.element)},initialize:function(a){this.setOptions(a);this.pelem=this.options.pelem;var b='<a href="#" class="dismiss">&nbsp;</a><h2>'+this.options.title+'</h2><p class="error general"></p>';$each(this.options.formRows,function(d){var e="form-row";if(d["class"]){e+=" "+d["class"]}b+='<div class="'+e+'">'+d.html+"</div>"});this.element=new Element("form",{id:"mootact-"+Math.floor(Math.random()*1000000000).toString(16),method:"POST",action:this.options.submitURL,"class":this.options["class"],html:b});this.element.addEvent("submit",function(c){c.stop();this.mail()}.bind(this));this.element.set("html",b);$(this).getElement("a.dismiss").addEvent("click",function(c){c.stop;this.dismiss()}.bind(this));this.genError=$(this).getElement(".error.general");$(this).store("MooTact",this);return this},dismiss:function(){$(this).dispose();$(this.pelem).unmask();this.fireEvent("dismiss");try{delete this}catch(a){}},show:function(){$(this.pelem).mask();document.body.adopt(this.element);$(this).position(this.options.position);$(this).set("spinner",{message:"Please wait ...","class":"mask mootact",containerPosition:{position:"centerTop",offset:{y:100,x:-50}}})},errMsgs:{},showErrors:function(a){if(a.general){this.showGenError(a.general)}a.fields&&$each(a.fields,this.showFieldError.bind(this))},showGenError:function(a){a&&this.genError.set("html",a)},showFieldError:function(b,a){var c=this.options.prefix+a;if(!$(this).hasChild(c)){this.showGenError(b);return}this.errMsgs[c]=new Element("div",{"class":"field error",id:c+"_err",html:b});$(this).adopt(this.errMsgs[c]);this.errMsgs[c].position({relativeTo:$(c),position:"bottomRight",offset:{x:-25,y:-20}});$(c).addEvent("focus",function(){this.errMsgs[c].dispose()}.bind(this))},mail:function(){var a=this;$(a).spin();$each(a.errMsgs,function(b){$(b).dispose()});new Request.JSON({url:this.options.url,onSuccess:function(b){$(a).unspin();if(typeof b.success!="undefined"){a.fireEvent("success");a.dismiss();return}a.showErrors((typeof b.exception!=undefined)?b.exception:{general:"Error: The server returned an error"});a.fireEvent("error")},onException:function(){a.showErrors({general:"Error: The server returned an error"});$(a).unspin();a.fireEvent("exception")},onFailure:function(){a.showErrors({general:"Error: The server returned an error"});$(a).unspin();a.fireEvent("failure")}}).post($(this));a.fireEvent("send")}});