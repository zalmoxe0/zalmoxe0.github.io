

(function(jQuery, undefined){

var timer;




function Timer( fn, fd ) {
    var self = this,
        clock;
    
    function update(){
        self.frameCount++;
        fn.call(self);
    }
    
    this.frameDuration = fd || 25 ;
    this.frameCount = -1 ;
    this.start = function(){
        update();
        clock = setInterval(update, this.frameDuration);
    };
    this.stop = function(){
        clearInterval( clock );
        clock = null;
    };
}

// callHandler() is the callback given to the timer object,
// it makes the event object and calls the handler
// context is the timer object

function callHandler(){
    var fn = jQuery.event.special.frame.handler,
        event = jQuery.Event("frame"),
        array = this.array,
        l = array.length;
    
    // Give event object properties
    event.frameCount = this.frameCount;
    
    // Call handler on each elem in array
    while (l--) {
        fn.call(array[l], event);
    }
}

if (!jQuery.event.special.frame) {
    jQuery.event.special.frame = {
        // Fires the first time an event is bound per element
        setup: function(data, namespaces) {
            if ( timer ) {
                timer.array.push(this);
            }
            else {
                timer = new Timer( callHandler, data && data.frameDuration );
                timer.array = [this];
                
                // Queue timer to start as soon as this thread has finished
                var t = setTimeout(function(){
                    timer.start();
                    clearTimeout(t);
                    t = null;
                }, 0);
            }
            return;
        },
        // Fires last time event is unbound per element
        teardown: function(namespaces) {
            var array = timer.array,
                l = array.length;
            
            // Remove element from list
            while (l--) {
                if (array[l] === this) {
                    array.splice(l, 1);
                    break;
                }
            }
            
            // Stop and remove timer when no elems left
            if (array.length === 0) {
                timer.stop();
                timer = undefined;
            }
            return;
        },
        handler: function(event){
            // let jQuery handle the calling of event handlers
            jQuery.event.handle.apply(this, arguments);
        }
    };
}

})(jQuery);